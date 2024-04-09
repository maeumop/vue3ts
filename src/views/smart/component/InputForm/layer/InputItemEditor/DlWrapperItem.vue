<script setup lang='ts'>
type Props = {
  required?: boolean
};

const props = withDefaults(defineProps<Props>(), {
  required: false
});

</script>
<script lang='ts'> export default { name: 'DlWrapperItem' };</script>
<template>
  <dl>
    <dt>
      <div class="width-100">
        <span class="custom">
          <slot name="label"></slot>&nbsp;
          <span :class="{ required: props.required }"></span>
        </span>
      </div>
    </dt>
    <dd class="flex">
      <slot></slot>
    </dd>
  </dl>
</template>