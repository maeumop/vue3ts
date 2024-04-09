<script setup lang="ts">
import { ref, computed, inject } from 'vue';

import type { TreeViewStoretype } from '@/store/modules/TreeView';

import type { TreeViewItemClass } from '@/js/helper/ftp';

import TreeViewItem from './index.vue';
import { mdiChevronDown } from '@/assets/svg/path';


// props
const props = withDefaults(
  defineProps<{
    icon?: string
    self: TreeViewItemClass
  }>(),
  {
    icon: '',
  },
);

// emit
const emit = defineEmits<{
  (event: 'on:clickActive', target: TreeViewItemClass): void
  (event: 'update:stateOpend', target: TreeViewItemClass): void
}>();

// store
const treeViewStore = inject('treeViewStore') as TreeViewStoretype;
const { title = '', depth } = props.self;

// Element
const treeViewItemEL = ref<HTMLLIElement>();
const titleDivEL = ref<HTMLLIElement>();

// computed
const isChidren = computed<boolean>(
  () => !!(Array.isArray(props.self.children) && props.self.children.length > 0),
);
const isIcon = computed<boolean>(() => !!props.icon);
const iconPath = computed<string>(() => props.icon || '');

// methods
/**
 * Toggle 영역 Click Event
 * @author hjs0601
 * @param {MouseEvent} $event 이벤트
 * @returns
 */
const onClickMdiChevron = ($event: MouseEvent): void => {
  treeViewStore.changeOpend(props.self, !props.self.opend);
  if (props.self.opend) {
    emit('update:stateOpend', props.self);
  }
};

/**
 * Active 영역 Click Event
 * @author hjs0601
 * @param {MouseEvent} $event 이벤트
 * @returns
 */
const onClickActiveItem = ($event: MouseEvent): void => {
  treeViewStore.changeActive(props.self, true);
  emit('on:clickActive', props.self);
};


const onClickActive = (target: TreeViewItemClass): void => {
  emit('on:clickActive', target);
};

/**
 * 맨위 상위 컴포넌트 이벤트 전파
 * @author hjs0601
 * @param {TreeViewItemClass} target 이벤트 주체
 * @returns
 */
const onUpdateStateOpen = (target: TreeViewItemClass): void => {
  emit('update:stateOpend', target);
};

/**
 * 마우스커서 값을 이용한 toggle x,y 축 값 계산
 * @author hjs0601
 * @param {MouseEvent} $event 이벤트
 * @returns
 */
const onMouseEnterTitle = ($event: MouseEvent): void => {
  const clientRect: DOMRect = ($event.target as HTMLDivElement).getBoundingClientRect();
  const style: CSSStyleDeclaration = titleDivEL.value?.style as CSSStyleDeclaration;
  style.setProperty('--toggle-y', `${clientRect.y + clientRect.height}px`);
  style.setProperty('--toggle-x', `${clientRect.x}px`);
};
</script>
<script lang="ts">
export default { name: 'TreeViewItem' };
</script>
<template>
  <li
    ref="treeViewItemEL"
    :class="[
      'treeViewItem',
      `depth${depth}`,
      { active: props.self.active },
      { opend: props.self.opend },
    ]"
  >
    <div class="treeViewItemWrapper">
      <div
        class="chevronWrapper"
        @click.stop="onClickMdiChevron"
      >
        <div>
          <SvgIcon
            class="mdi"
            type="mdi"
            :size="20"
            :path="mdiChevronDown"
          />
        </div>
      </div>

      <div class="titleWrapper">
        <SvgIcon
          class="mdi"
          type="mdi"
          :size="20"
          :path="iconPath"
          v-if="isIcon"
        />
        <div class="title">
          <div
            ref="titleDivEL"
            :toggle-content="title"
            @click.stop="onClickActiveItem"
            @mouseenter="onMouseEnterTitle"
          >
            {{ title }}
          </div>
        </div>
      </div>
    </div>
    <Transition name="drop-menu">
      <ul
        class="children"
        v-if="isChidren"
        v-show="props.self.opend"
      >
        <TreeViewItem
          :key="i"
          :icon="props.icon"
          :self="item"
          @on:click-active="onClickActive"
          @update:state-opend="onUpdateStateOpen"
          v-for="(item, i) in props.self.children"
        />
      </ul>
    </Transition>
  </li>
</template>