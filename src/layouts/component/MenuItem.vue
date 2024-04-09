<script setup lang="ts">
import type { MenuItem } from '@/types/common';
import { mdiChevronDown } from '@/assets/svg/path';
import { useRouter } from 'vue-router';
import MenuNodeItem from './MenuItem.vue';
import { useMenusStore } from '@/store';

const { setActive } = useMenusStore();

const props = withDefaults(defineProps<{
  items: MenuItem[]
  depth: number
  path?: string
  height?: number
  index?: number
}>(), {
  depth: 0,
  path: '',
  height: 0,
  index: 0,
});

const router = useRouter();

const action = (i: number): void => {
  const items: MenuItem[] = [...props.items];

  if (!items[i].children.length) {
    router.push(`${props.path}/${items[i].path}`);
  }

  setActive(props.depth, i);
};
</script>

<template>
  <ul :class="`depth-${props.depth}`">
    <li
      :key="`menu-${props.depth}-${i}`"
      v-for="(item, i) in props.items"
    >
      <a
        href="#"
        :class="item.active && 'on'"
        @click.prevent="action(i)"
      >
        <div class="menu-text">
          <SvgIcon
            type="mdi"
            class="font-head mr-10"
            :path="item.icon"
            v-if="item.icon"
          />
          <span>{{ item.menu }}</span>
        </div>

        <div class="folder-arrow" v-if="item.children.length">
          <SvgIcon
            type="mdi"
            size="18"
            :path="mdiChevronDown"
          />
        </div>
      </a>

      <template v-if="item.children.length">
        <MenuNodeItem
          :index="i"
          :style="{ height: item.active ? `${item.height}px` : '0px' }"
          :depth="props.depth + 1"
          :path="`${props.path}/${item.path}`"
          :items="item.children"
        />
      </template>
    </li>
  </ul>
</template>
