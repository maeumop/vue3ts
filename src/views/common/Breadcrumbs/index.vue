<script setup lang="ts">
import { useRouter } from 'vue-router';
import { mdiTriangleSmallUp } from '@/assets/svg/path';
import { MODE } from '@/constants/common';
import type { BreadcrumbsOption, MODE_TYPE } from '@/types/common/Breadcrumbs';

const router = useRouter();

// props
const props = withDefaults(
  defineProps<{
    modelValue: BreadcrumbsOption[]
    mode?: MODE_TYPE
  }>(),
  {
    modelValue: () => [],
    mode: MODE.DEFAULT,
  },
);

// emit
const emit = defineEmits<{
  (event: 'update:modelValue', value: BreadcrumbsOption[]): void,
  (event: 'on:click', value: BreadcrumbsOption[], path: string): void,
}>();


const _toBreadcrumbsPath = (breadcrumbs: BreadcrumbsOption[]): string => {
  return breadcrumbs.map((item: BreadcrumbsOption) => item.title).join('/').replaceAll('//', '/');
};

/**
 *  props.mode가 ROUTE 모드일때, router 이동을 진행하며, 기본은 index까지만의 경로를 다시 업데이트 합니다.
 * @author hjs0608
 * @param {number} i index 번호
 * @param {MouseEvent} $event 이벤트
 * @returns
 */
const onClickItem = (i: number, $event?: MouseEvent): void => {
  const item: BreadcrumbsOption = props.modelValue[i];
  if (props.mode === MODE.ROUTE) {
    $event?.preventDefault();
    try {
      router.push({ path: item.path as string });
    } catch (e) {
      console.error('[ Breadcrumbs ] : 경로를 다시 확인해 주세요.');
    }
    return;
  }
  const res: BreadcrumbsOption[] = props.modelValue.filter((item: BreadcrumbsOption, index: number) => i >= index);
  emit('on:click',  res, _toBreadcrumbsPath(res));
  emit('update:modelValue',  res);
};
</script>
<script lang="ts">
export default { name: 'Breadcrumbs' };
</script>
<template>
  <div class="component breadcrumbs">
    <template
      :key="i"
      v-for="(item, i) in props.modelValue"
    >
      <span @click="onClickItem(i, $event)">{{ item.title }}</span>
      <div
        class="mdiWrapper"
        v-if="i + 1 < props.modelValue.length"
      >
        <SvgIcon
          class="mdi"
          type="mdi"
          :size="20"
          :path="mdiTriangleSmallUp"
        />
      </div>
    </template>
  </div>
</template>