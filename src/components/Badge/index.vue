<script setup lang="ts">
import { computed } from 'vue';
import { badgeColors, badgePosition } from './const';
import type { BadgeColors, BadgePosition } from './types';

const props = withDefaults(defineProps<{
  text?: string
  color?: BadgeColors
  large?: boolean
  position?: BadgePosition
  icon?: string
}>(), {
  color: badgeColors.danger,
  position: badgePosition.right,
});

const badgeStyle = computed<any[]>(() => {
  return ['badge', props.icon && 'icon',  props.color, props.large && 'large', props.position];
});
</script>

<template>
  <div class="badge-wrapper">
    <slot></slot>
    <div :class="badgeStyle">
      <template v-if="props.icon && props.large">
        <SvgIcon size="16" type="mdi" :path="props.icon" />
      </template>
      <template v-else>
        {{ props.text }}
      </template>
    </div>
  </div>
</template>


<style lang="scss">
@import './style.scss';
</style>
<script lang="ts">
export default { name: 'Badge' };
</script>