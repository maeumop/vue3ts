import { ref } from 'vue';
import { defineStore } from 'pinia';

import type { TreeViewOption } from '@/types/store/modules/treeView';
import type { TreeViewItemClass } from '@/js/helper/ftp';
import { _addItems } from '@/js/helper/ftp';

const modulePrefixName = 'TreeView';

const setup = () => {
  const list = ref<TreeViewItemClass[]>([]);
  const activeItems = ref<TreeViewItemClass[]>([]);

  const addItems = (children: TreeViewOption[], parent?: TreeViewItemClass) => {
    const result = _addItems(children, parent);
    if (parent) {
      parent.children = result;
    } else {
      list.value.splice(0, list.value.length, ...result);
    }
  };
  const changeOpend = (self: TreeViewItemClass, value: boolean) => {
    self.opend = value;
  };
  const changeActive = (self: TreeViewItemClass, value: boolean) => {
    for (let index = 0; index < activeItems.value.length; index++) {
      const item: TreeViewItemClass = activeItems.value[index];
      item.active = false;
    }
    self.active = value;
    if (value) {
      activeItems.value = [ self ];
    }
  };
  return {
    list,
    activeItems,

    addItems,
    changeOpend,
    changeActive,
  };
};
/**
 * name 모듈명의 인스턴스를 반환 Helper 함수형
 * @author hjs0601
 * @param name TreeView 모듈명
 */
const helper = (name: number | string = modulePrefixName) =>
  defineStore(typeof name === 'number' ? `${modulePrefixName}_${name}` : name, setup)();

export type TreeViewStoretype = ReturnType<typeof helper>;

/* 기본은 helper 함수 */
export default helper;
