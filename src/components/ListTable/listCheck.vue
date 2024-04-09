<script setup lang="ts">
import { computed } from 'vue';
import { listTableCheckboxIcon, listTableRadioIcon } from './const';
import type { ListTableCheckboxIcon, ListTableRadioIcon } from './types';
import type { MdiSvgIcon } from '../types';

const emit = defineEmits<{
  (event: 'checked', checked: boolean, value: string): void
}>();

const props = withDefaults(defineProps<{
  name: string
  value: string
  disabled?: boolean
  isChecked?: boolean
  type?: string
}>(), {
  type: 'checkbox'
});

if (!props.name) {
  throw 'ListTable component: need checkbox name!';
}

if (!props.value) {
  throw 'ListTable component: need checkbox value!';
}

const svgIcon = computed<MdiSvgIcon>(() => {
  let type: ListTableCheckboxIcon | ListTableRadioIcon = 'blank';

  if (props.disabled) {
    type = 'disabled';
  } else if (props.isChecked) {
    type = 'checked';
  }

  return props.type === 'radio'
    ? listTableRadioIcon[type]
    : listTableCheckboxIcon[type];
});

const checkEvent = (event: Event): void => {
  if (!props.disabled) {
    const target = event.target as HTMLInputElement;
    emit('checked', target.checked, props.value);
  }
};
</script>

<template>
  <label class="checkbox-wrap">
    <input
      :type="props.type"
      :name="props.name"
      :disabled="props.disabled"
      :value="props.value"
      :checked="props.isChecked"
      @input="checkEvent"
    />
    <SvgIcon type="mdi" :path="svgIcon" />
  </label>
</template>

<script lang="ts">
export default { name: 'ListCheck' };
</script>