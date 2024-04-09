<script setup lang='ts'>
import { computed } from 'vue';

import type { RuleFunc } from '@/components/types';
import type { InputConfigEditFormValuesItem, OptionsFieldType } from '@/types/smart/component/inputForm';

import { CONST_CODES } from '@/constants/common';


const { DB_INPUT_FIELD_TYPE } = CONST_CODES;

type Props = {
  modelValue: InputConfigEditFormValuesItem
  fieldType: OptionsFieldType
  validate?: { [K in keyof InputConfigEditFormValuesItem]?: RuleFunc[] }
  isValueReadonly?: boolean
};

const props = withDefaults(defineProps<Props>(), {
  isValueReadonly: false
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: InputConfigEditFormValuesItem): void
  (event: 'update:after'): void
}>();

const item = computed<InputConfigEditFormValuesItem>({
  get: () => (props.modelValue),
  set: (v: InputConfigEditFormValuesItem) => emit('update:modelValue', v)
});

const onBlur = () => emit('update:after');

</script>
<script lang='ts'> export default { name: 'OptionItem' };</script>
<template>
  <div class="row gap-8">
    <div class="col-1 mx-0" v-if="item.value !== undefined ">
      <TextField
        block
        hide-message
        max-length="50"
        placeholder="value 입력"
        :readonly="props.isValueReadonly"
        :validate="props.validate?.value"
        @blur="onBlur()"
        v-model="item.value"
      />
    </div>
    <div class="col-2 mx-0">
      <div class="flex-center pr-5 width-p-100 height-40">
        <TextField
          block
          hide-message
          max-length="50"
          class="width-p-100"
          placeholder="사용자 출력 문구 입력"
          :validate="props.validate?.label"
          @blur="onBlur()"
          v-model="item.label"
        />
        <template v-if="props.fieldType === DB_INPUT_FIELD_TYPE.CHECK.VAL">
          <SwitchButton
            checkbox
            class="text-y-middle width-180"
            :label="['checked 적용' ,'checked 적용']"
            @update:after="onBlur()"
            v-model="item.checked"
          />
        </template>
      </div>
    </div>
  </div>
</template>