<script setup lang="ts">
import { ref, getCurrentInstance, onUnmounted, watch, provide } from 'vue';
import { storeToRefs } from 'pinia';

import { useTreeView } from '@/store/index';
import type { TreeViewOption } from '@/types/store/modules/treeView';

import type { TreeViewItemClass } from '@/js/helper/ftp';

import TreeViewItem from './TreeViewItem/index.vue';


const app = getCurrentInstance();

// props
const props = withDefaults(
  defineProps<{
    modelValue?: string[]
    icon?: string
    options?: TreeViewOption[]
  }>(),
  {
    modelValue: () => [],
    options: () => [],
  },
);

// emit
const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
  (
    event: 'on:openTarget',
    callAddItems: (items: TreeViewOption[], refresh?: boolean) => Promise<void>,
    result: TreeViewOption,
  ): void
}>();

// store
const treeViewStore = useTreeView(app?.uid as number);

//Element
const treeViewEL = ref<HTMLDivElement>();

// data()
let value = ref<string[]>([]);
const { list, activeItems } = storeToRefs(treeViewStore);

// methods
const onClickActiveItem = (target: TreeViewItemClass): void => {
  let titleArr: string[] = [];
  activeItems.value.forEach((item: TreeViewItemClass) => {
    titleArr = _getActiveItemTitles(item);
  });
  value.value.splice(0, value.value.length, ...titleArr);
  emit('update:modelValue', value.value);
};
/**
 * 이벤트 주체에서 Toggle 기능이 true 값으로 변경시, 이벤트 주체의 자식 객체 등록하는 함수와 이벤트 주체 반환
 * @author hjs0601
 * @param {TreeViewItemClass} target 이벤트 주체
 * @returns
 */
const onUpdateStateOpen = (target: TreeViewItemClass): void => {
  /**
   * 이벤트 주체의 자식객체 업데이트, refresh 여부에따라 새로 업데이트 여부를 정한다.
   * @author hjs0601refresh
   * @public
   * @param {Array<TreeViewOption>} items 자식객체에 등록할 객체 정보
   * @param {boolean} refresh 기존의 있던 값을 재할당 여부
   * @returns
   */
  const callAddItems = async (items: TreeViewOption[], refresh?: boolean): Promise<void> => {
    if (!Array.isArray(target.children) || refresh) {
      await treeViewStore.addItems(items, target);
      _watchModelValue();
    }
  };
  emit('on:openTarget', callAddItems, target);
};

/**
 * item 객체로부터 최상위 부모객체까지 타고 올라가 title Array 객체 반환
 * @author hjs0601
 * @private
 * @param {TreeViewItemClass} item 이벤트 주체
 * @returns {Array<string>} 부모에서 자식 순서로 title Array 객체 반환
 */
const _getActiveItemTitles = (item: TreeViewItemClass): string[] => {
  const titleArr: string[] = [];
  let ltem: TreeViewItemClass | null = item;
  while (ltem) {
    titleArr.splice(titleArr.length, 0, ltem.title);
    if (ltem.parent) {
      ltem = ltem.parent;
    } else {
      ltem = null;
    }
  }

  return titleArr.reverse();
};

/**
 * 전체 list객체 중에서 선택된 객체 상태 업데이트
 * @author hjs0601
 * @private
 * @returns
 */
const _watchModelValue = (): void => {
  let arr: TreeViewItemClass[] = [ ...list.value ];
  let result: TreeViewItemClass | null = null;
  for (let index = 0; index < props.modelValue.length; index++) {
    if (index + 1 === props.modelValue.length) {
      result = arr.find(
        (item: TreeViewItemClass) => item.title === props.modelValue[index],
      ) as TreeViewItemClass;

      break;
    }
    arr =
      arr.find((item: TreeViewItemClass) => item.title === props.modelValue[index])?.children ||
      [];
  }

  if (result) {
    const res = (result as TreeViewItemClass).active;
    if (!res) {
      treeViewStore.changeActive(result, true);
    }
  }
};

// watch
watch(
  () => props.options,
  async () => {
    if (Array.isArray(props.options)) {
      await treeViewStore.addItems(props.options);
      _watchModelValue();
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  () => {
    _watchModelValue();
  },
  { deep: true },
);

onUnmounted(() => {
  treeViewStore.$dispose();
});

// provide
provide('treeViewStore', treeViewStore);

</script>
<script lang="ts">
export default { name: 'TreeView' };
</script>
<template>
  <div
    ref="treeViewEL"
    class="component treeView"
  >
    <div class="component-wrapper">
      <ul>
        <TreeViewItem
          :key="i"
          :icon="props.icon"
          :self="item"
          @on:click-active="onClickActiveItem"
          @update:state-opend="onUpdateStateOpen"
          v-for="(item, i) in list"
        />
      </ul>
    </div>
  </div>
</template>