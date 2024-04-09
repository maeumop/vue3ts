<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import type { StyleValue } from 'vue';
import type { TextFieldType } from './types';
import type { RuleFunc } from '../../types';
import { mdiCloseCircle } from '@/assets/svg/path';

export interface TextFieldProps {
  modelValue: string
  type?: TextFieldType
  rows?: number
  label?: string
  placeholder?: string
  height?: string | number
  width?: string | number
  block?: boolean
  validate?: RuleFunc[]
  blurValidate?: boolean
  pattern?: [RegExp, string?]
  errorMessage?: string
  maxLength?: number
  multiline?: boolean
  disabled?: boolean
  readonly?: boolean
  autofocus?: boolean
  isCounting?: boolean
  required?: boolean
  hideMessage?: boolean
  icon?: string
  iconLeft?: boolean
  iconAction?: Function
  clearable?: boolean
}

export type KeyEvent = 'keydown' | 'keypress' | 'keyup';

export interface TextFieldEmits {
  (event: 'update:modelValue', value: string): void
  (event: 'blur', value: FocusEvent): void
  (event: KeyEvent, value: KeyboardEvent): void
}

const emit = defineEmits<TextFieldEmits>();

const props = withDefaults(defineProps<TextFieldProps>(), {
  rows: 5,
  type: 'text',
  label: '',
  placeholder: '',
  validate: (): RuleFunc[] => [],
  blurValidate: true,
  errorMessage: '',
  maxLength: 0,
});

let isValidate = ref<boolean>(true);
let checkPass = ref<boolean>(false);
let message = ref<string>('');
let errorTransition = ref<boolean>(false);

const Textarea = ref<HTMLTextAreaElement>();
const Input = ref<HTMLInputElement>();

watch(() => props.errorMessage, (v) => {
  // 임의로 지정된 에러가 있는 경우 에러 아이콘 표기
  if (v) {
    message.value = v;
    isValidate.value = false;
    checkPass.value = false;
    errorTransition.value = true;
  } else {
    message.value = '';
    isValidate.value = true;
    checkPass.value = true;
    errorTransition.value = false;
  }
});

watch(() => props.validate, () => {
  resetValidate();
});

watch(() => props.modelValue, (v) => v && resetValidate());

watch(() => props.disabled, (v) => v && resetValidate());

const successful = computed<boolean>(() => isValidate.value && checkPass.value);
const styleWidth = computed<string>(() => {
  if (typeof props.width === 'number') {
    return `${props.width}px`;
  } else if (typeof props.width === 'string') {
    return `${props.width}`;
  }

  return '';
});

const wrapperStyle = computed<StyleValue>(() => [ 'input-wrap', {
  'with-label': props.label,
  error: !isValidate.value,
  success: successful,
  block: props.block
} ]);
const labelStyle = computed<StyleValue>(() => [ 'input-label', { error: !isValidate.value } ]);
const inputStyleClass = computed<StyleValue>(() => [
  {
    'error': message.value,
    'left-space': props.icon && props.iconLeft,
    'right-space': props.icon && !props.iconLeft,
  }
]);

const updateValue = (evt: Event): void => {
  const target = evt.target as HTMLInputElement;

  // textarea maxlength 기능이 없기 때문에 코드로 구현
  if (props.isCounting && props.maxLength) {
    if (target.value.length > props.maxLength) {
      const cut = target.value.substring(0, props.maxLength);
      target.value = cut;
    }
  }
  emit('update:modelValue', target.value);
};

const clearValue = (): void => {
  emit('update:modelValue', '');
};

const clearButtonShow = computed<boolean>(
  () => props.clearable && props.modelValue !== '' && !props.disabled && !props.readonly
);

/**
 * blur 이벤트 핸들러에서 check() 함수의 반환값이 true 일경우에만 trim추가 처리 진행
 * disabled 일때에는 이벤트 발생하지 않기에 정의 하지 않습니다.
 * @author hjs0818
 * @returns
 */
const updateTrimValue = (evt: Event): void => {
  const target = evt.target as HTMLInputElement | HTMLTextAreaElement;

  const result: string = target.value.trim();
  if (result.length > 0) {
    emit('update:modelValue', result);
  }
};

const check = (silence?: boolean): boolean => {
  if (props.disabled) {
    return true;
  }

  // 임의로 지정된 에러가 없는 경우
  if (props.errorMessage === '') {

    // trim 되지 않은 value 값
    const checkValue: string = (props.multiline ? Textarea.value?.value : Input.value?.value) || '';

    // pattern check
    if (Array.isArray(props.pattern)) {
      const [ regExp, errMsg ] = props.pattern;

      if (regExp) {
        if (regExp.test(checkValue)) {
          message.value = '';
        } else {
          if (!silence) {
            message.value = errMsg ? errMsg : '형식이 일치 하지 않습니다.';
            isValidate.value = false;
            checkPass.value = false;
            errorTransition.value = true;
          }

          return false;
        }
      }
    }

    // validate check
    if (props.validate.length) {
      for (let i: number = 0; i < props.validate.length; i++) {
        let result: string | boolean = props.validate[i](checkValue);

        if (typeof result === 'string') {
          if (!silence) {
            message.value = result;
            isValidate.value = false;
            checkPass.value = false;
            errorTransition.value = true;
          }

          return false;
        } else {
          message.value = '';
        }
      }
    }

    isValidate.value = true;
    checkPass.value = true;
    return true;
  }

  errorTransition.value = true;

  return false;
};

const resetForm = (): void => {
  emit('update:modelValue', '');
};

const resetValidate = (): void => {
  isValidate.value = true;
  if (!props.errorMessage) {
    message.value = '';
    errorTransition.value = false;
  }
};

const feedback = ref<HTMLDivElement>();

onMounted(() => {
  if (props.autofocus) {
    if (props.multiline) {
      Textarea.value!.focus();
    } else {
      Input.value!.focus();
    }
  }

  // feedback 메시지 animation 제어 (흔들리는 애니메이션이 종료되면 해당 트랜지션 트리거 변수를 초기화 한다)
  feedback.value!.addEventListener('animationend', () => {
    errorTransition.value = false;
  });
});

defineExpose({
  check,
  resetForm,
  resetValidate
});
</script>

<template>
  <div
    ref="TextField"
    :class="wrapperStyle"
    :style="{ width: styleWidth }"
  >

    <div class="options-wrap">
      <label :class="labelStyle" v-if="props.label">
        {{ props.label }}
        <span class="required" v-if="props.required">*</span>
      </label>
      <div class="counting" v-if="props.isCounting && props.maxLength">
        {{ modelValue.length }} / {{ props.maxLength }}
      </div>
    </div>

    <textarea
      ref="Textarea"
      :class="{ 'error': message }"
      :style="[{ height: props.height && `${props.height}px` }]"
      :rows="props.rows"
      :placeholder="props.placeholder"
      :value="props.disabled ? '' : props.modelValue"
      :readonly="props.readonly"
      :disabled="disabled"
      @blur="[emit('blur', $event), props.blurValidate && (check() && updateTrimValue($event))]"
      @input="updateValue"
      v-if="multiline"
    >
    </textarea>

    <div class="with-slot" v-else>
      <div class="input-relative">
        <input
          ref="Input"
          :type="props.type"
          :class="inputStyleClass"
          :style="[{ width: width ? `${props.width}px` : '' }]"
          :placeholder="props.placeholder"
          :value="props.disabled ? '' : props.modelValue"
          :disabled="props.disabled"
          :readonly="props.readonly"
          :maxlength="props.maxLength > 0 ? props.maxLength : ''"
          :autocomplete="props.type === 'password'? 'on' : 'off'"
          @blur="[emit('blur', $event), props.blurValidate && (check() && updateTrimValue($event))]"
          @input="updateValue"
        />

        <a
          href="#"
          :class="['btn-clear', (props.icon && !props.iconLeft) && 'with-icon']"
          @click.prevent="clearValue"
          v-if="clearButtonShow"
        >
          <SvgIcon
            type="mdi"
            size="20"
            :path="mdiCloseCircle"
          />
        </a>
      </div>
      <template v-if="props.icon">
        <a href="#" @click.prevent="props.iconAction" v-if="typeof props.iconAction === 'function'">
          <SvgIcon
            type="mdi"
            size="24"
            :class="{ left: props.iconLeft }"
            :path="props.icon"
          />
        </a>
        <SvgIcon
          type="mdi"
          size="24"
          :class="{ left: props.iconLeft }"
          :path="props.icon"
          v-else
        />
      </template>
      <slot></slot>
    </div>

    <div
      ref="feedback"
      :class="['feedback', { error: errorTransition }]"
      v-show="message && !props.hideMessage"
    >
      {{ message }}
    </div>
  </div>
</template>

<style scoped lang="scss">
@import './style.scss';
</style>
<script lang="ts">
export default { name: 'TextField' };
</script>