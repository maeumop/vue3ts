<script setup lang='ts'>
import { ref, reactive, watch } from 'vue';

import type { RuleFunc, Rules } from '@/components/types';
import { useUtil } from '@/js/util';
import { useInputOnlyNumber } from '@/js/helper/common';

import TextField from '@/components/Form/TextField/index.vue';
import { nextTick } from 'vue';

type TextFieldELType = Pick<InstanceType<typeof TextField>, 'check' |'$nextTick'>;
  
type InputRengeType = {
  start: string
  end: string
};

type Props = {
  modelValue?: string
  label?: string
  validate?: RuleFunc[]
  required?: boolean
  isInfoBox?: boolean
};

const props = withDefaults(defineProps<Props>(), {
  label: '',
  required: false
});


const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'update:after', value: boolean): void
}>();

// Element
const startEL = ref<TextFieldELType>();
const endEL = ref<TextFieldELType>();

const inputRenge = reactive<InputRengeType>({
  start: '',
  end: ''
});

const rule = reactive<Record<keyof InputRengeType, RuleFunc[]>>({
  start: [],
  end: []
});

const _rule: Rules = {
  num: [
    (v: string) => 
      ( v ? (Array.isArray(v.match(useUtil().getRegExp('num')))) : true) || '숫자만 입력 가능합니다.',
  ],

  min: [
    (min: string) => 
      (min && inputRenge.end ? parseInt(min) <= parseInt(inputRenge.end) : true) || '최대 값 보다 큰 값을 입력 할 수 없습니다.',
  ],

  max: [
    (max: string) => 
      (max && inputRenge.start ? parseInt(max) >= parseInt(inputRenge.start) : true) || '최소 값 보다 작은 값을 입력 할 수 없습니다.',
  ],
};

// validation 반환값 여부
const isValidate = ref<boolean>(true);

// method
const { onInputOnlyNumber } = useInputOnlyNumber();


/**
 * validation 진행 메서드
 * @param key {keyof InputRengeType}
 * @returns
 */
const validation = async (key: keyof InputRengeType): Promise<void> => {
  rule.start = [ ...(key === 'start' ? _rule.min : []), ..._rule.num ];
  rule.end = [ ...(key === 'end' ? _rule.max : []), ..._rule.num ];

  // 최소값이 있을경우, 최대값 필수 validation 추가
  inputRenge.start && 
    rule.end.unshift((v: string) => (!!inputRenge.end) || '필수 입력값입니다.');

  // 최대값이 있을경우, 최소값 필수 validation 추가
  inputRenge.end && 
    rule.start.unshift((v: string) => (!!inputRenge.start) || '필수 입력값입니다.');

  const arr: (TextFieldELType | undefined)[] = [ startEL.value, endEL.value];

  // 최대값의 validation 작업시 순서 역전
  key === 'end' && arr.reverse();

  await nextTick();
  for (let index = 0; index < arr.length; index++) {
    const component: TextFieldELType | undefined = arr[index];

    // TextFieldELType 의 check 메서드 진행
    isValidate.value = component ? await component.check() : false;
    if (!isValidate.value) {
      break;
    }
  }

  emit('update:after', isValidate.value);
};

watch(() => props.modelValue, () => {
  const [ start, end ] = (props.modelValue || ',').split(',');

  inputRenge.start = start;
  inputRenge.end = end;

}, { immediate: true });

watch(() => [ inputRenge.start, inputRenge.end ], () => {
  emit('update:modelValue', `${inputRenge.start || ''},${inputRenge.end || ''}`);
});


</script>
<script lang='ts'> export default { name: 'NumberInputRange' };</script>
<template>
  <div class="flex-center height-23" v-bind="$attrs">
    <span class="custom inline mx-3 height-p-100">
      {{ props.label }}&nbsp;
      <span :class="{ required: props.required }"></span>
    </span>
  </div>
  <div class="row inputRange">
    <div class="col-6 pr-10">
      <TextField
        block
        ref="startEL"
        placeholder="숫자만 입력해 주세요.(최소)"
        :blur-validate="false"
        :max-length="10"
        :validate="rule.start"
        @blur="validation('start')"
        @input.stop="onInputOnlyNumber"
        v-model="inputRenge.start"
      />
    </div>
    <div class="col-6 pl-10">
      <TextField
        block
        ref="endEL"
        placeholder="숫자만 입력해 주세요.(최대)"
        :blur-validate="false"
        :max-length="10"
        :validate="rule.end"
        @blur="validation('end')"
        @input.stop="onInputOnlyNumber"
        v-model="inputRenge.end"
      />
    </div>
  </div>
  <div class="mx-3 pt-3 text-size-xs text-gray-600" v-if="props.isInfoBox && isValidate">
    입력 가능한 값의 범위를 설정하는 영역입니다.
  </div>

</template>