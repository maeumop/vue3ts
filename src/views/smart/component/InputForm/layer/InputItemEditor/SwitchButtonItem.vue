<script setup lang='ts'>
import { computed, useSlots } from 'vue';


type Props = {
  modelValue: boolean
  label?: string[]
  readonly?: boolean
};

const props = withDefaults(defineProps<Props>(), {
  label: () => [ '미설정', '설정' ],
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'update:after'): void
}>();

const slots = useSlots();

const vlaue = computed<boolean>({
  get: () => (props.modelValue),
  set: (v: boolean) => emit('update:modelValue', v)
});

const labelText = computed<string>(() => (vlaue.value ? props.label[1] : props.label[0]));

</script>
<script lang='ts'> export default { name: 'SwitchButtonItem' };</script>
<template>
  <div>
    <template v-if="props.readonly">
      <span> {{ labelText || '-' }} </span>
    </template>
    <template v-else>
      <SwitchButton
        :label="props.label"
        @update:after="() => emit('update:after')"
        v-model="vlaue"
      />
      <div class="pt-3 text-size-xs text-gray-600" v-if="slots.helperMessgae">
        <slot name="helperMessgae"></slot>
      </div>
    </template>
  </div>
</template>