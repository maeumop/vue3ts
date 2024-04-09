<script setup lang='ts'>
import { computed } from 'vue';

import type { RuleFunc } from '@/components/types';

type Props = {
  modelValue: string
  required?: boolean
  validate?: RuleFunc[]
};

const props = withDefaults(defineProps<Props>(), {
  required: false
});


const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'update:after'): void
}>();


const value = computed<string>({
  get: () => (props.modelValue),
  set: (v: string) => emit('update:modelValue', v)
});

</script>
<script lang='ts'> export default { name: 'HiddenValue' };</script>
<template>
  <div class="row">
    <div class="col">
      <TextField
        block
        hide-message
        label="value"
        max-length="300"
        placeholder="value 입력해 주세요."
        :required="props.required"
        :validate="props.validate"
        @blur="emit('update:after')"
        v-model="value"
      />
    </div>
  </div>

  <div class="mx-3 pt-10">
    <ul class="info-box-bullet py-10">
      <li>value는 실제 DB에 저장되는 값을 의미합니다.</li>
    </ul>
  </div>
</template>