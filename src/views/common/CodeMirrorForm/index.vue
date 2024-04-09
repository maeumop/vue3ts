<script setup lang='ts'>
import { ref, watch, computed, onMounted } from 'vue';

import type { StyleValue } from 'vue';

import { Codemirror } from 'vue-codemirror';
import { html } from '@codemirror/lang-html';
import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';

import type { RuleFunc } from '@/components/types';

export interface TextFieldProps {
  modelValue: string
  label?: string
  placeholder?: string
  height?: string | number
  width?: string | number
  block?: boolean
  validate?: RuleFunc[]
  blurValidate?: boolean
  errorMessage?: string
  maxLength?: number
  disabled?: boolean
  readonly?: boolean
  isCounting?: boolean
  required?: boolean
  hideMessage?: boolean
}

const props = withDefaults(defineProps<TextFieldProps>(), {
  label: '',
  placeholder: '',
  validate: (): RuleFunc[] => [],
  blurValidate: true,
  errorMessage: '',
  maxLength: 0,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'blur'): void
}>();

// Element
const feedback = ref<HTMLDivElement>();
const codemirror = ref<InstanceType<typeof Codemirror>>();

const extensions = [
  Prec.highest(
    keymap.of([
      { key: 'Ctrl-f', run: () => true },
    ])
  ),
  html(),
];

let codemirrorValue = ref<string>('');
let isValidate = ref<boolean>(true);
let checkPass = ref<boolean>(false);
let message = ref<string>('');
let errorTransition = ref<boolean>(false);


// computed
const disabled = computed<boolean>(() => !(!props.disabled && !props.readonly));
const successful = computed<boolean>(() => isValidate.value && checkPass.value);
const styleWidth = computed<string>(() => {
  if (typeof props.width === 'number') {
    return `${props.width}px`;
  } else if (typeof props.width === 'string') {
    return `${props.width}`;
  }

  return '';
});
const wrapperStyle = computed<StyleValue>(() => [ 'codeMirrorForm', 'input-wrap', {
  'with-label': props.label,
  error: !isValidate.value,
  success: successful,
  block: props.block
} ]);
const labelStyle = computed<StyleValue>(() => [ 'input-label', { error: !isValidate.value } ]);
const inputStyleClass = computed<StyleValue>(() => [
  {
    'error': message.value,
    'disabled': props.disabled,
    'readonly': props.readonly,
  }
]);

const updateValue = (value: string): void => {
  if (props.disabled) {
    return;
  }

  codemirrorValue.value = value;
  resetValidate();
  emit('update:modelValue',  codemirrorValue.value);
};

const check = (silence?: boolean): boolean => {
  if (props.disabled) {
    return true;
  }

  // 임의로 지정된 에러가 없는 경우
  if (props.errorMessage === '') {

    if (props.maxLength && props.isCounting) {

      if ([...codemirrorValue.value].length > props.maxLength) {
        if (!silence) {
          message.value = `최대 ${props.maxLength}자 이내 입력해주세요.`;
          isValidate.value = false;
          checkPass.value = false;
          errorTransition.value = true;
        }
        return false;
      }
    }

    // validate check
    if (props.validate.length) {
      for (let i: number = 0; i < props.validate.length; i++) {
        let result: string | boolean = props.validate[i](props.modelValue);
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
  codemirrorValue.value = '';
  emit('update:modelValue', '');
};

const resetValidate = (): void => {
  message.value = '';
  isValidate.value = true;
  errorTransition.value = false;
};


watch(() => props.errorMessage, (v) => {
  // 임의로 지정된 에러가 있는 경우 에러 아이콘 표기
  message.value = v ? v : '';
  isValidate.value = !v;
  checkPass.value = !v;
  errorTransition.value = !!v;
});

watch(() => props.validate, () => {
  resetValidate();
});

watch(() => props.modelValue, (v, b) => {
  if (v) {
    resetValidate();
  }
  codemirrorValue.value = v;
}, { immediate: true });

watch(() => props.disabled, (v) => v && resetValidate());

onMounted(() => {
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
<script lang='ts'> export default { name: 'CodeMirrorForm' };</script>
<template>
  <div
    :class="wrapperStyle"
    :style="{ width: styleWidth }"
  >
    <div class="options-wrap">
      <label :class="labelStyle" v-if="props.label">
        {{ props.label }}
        <span class="required" v-if="props.required">*</span>
      </label>
      <div class="counting" v-if="props.isCounting && props.maxLength">
        {{ [...codemirrorValue].length }} / {{ props.maxLength }}
      </div>
    </div>
    <Codemirror
      ref="codemirror"
      :placeholder="disabled ? '' : props.placeholder"
      :disabled="disabled"
      :style="{ height: props.height ? `${props.height}px` : '100%'}"
      :class="inputStyleClass"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      :model-value="codemirrorValue"
      @blur="[props.blurValidate && check(), emit('blur')]"
      @update:model-value="updateValue"
    />
    <div
      ref="feedback"
      :class="['feedback', { error: errorTransition }]"
      v-show="message && !props.hideMessage"
    >
      {{ message }}
    </div>
  </div>
</template>