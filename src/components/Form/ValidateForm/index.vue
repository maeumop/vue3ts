<script setup lang="ts">
import { h, Fragment, ref, useSlots, computed } from 'vue';
import type { ComputedRef } from 'vue';

const frm = ref<HTMLFormElement>();
const slots = useSlots();

let isCover = ref<boolean>(false);

let checkState: boolean;
let firstEl: HTMLElement | null = null;

const RenderSlotItems: ComputedRef = computed(() => h(Fragment, slots.default ? slots.default() : []));

let isSilence: boolean = false;

const validate = (silence: boolean = false): boolean => {
  isSilence = silence;
  checkState = true;
  firstEl = null;

  /**
   * Ref를 통한 하위 객체(slot 내용) 탐색에서 __vnode 프로퍼티를 참조하는데
   * 해당 프로퍼티는 빌드에서 제거되는 문제 발생 (서비스에서 활용할 수 없음)
   * 해당 문제를 해결하기 위해 useSlots 핼퍼를 이용해 computed로 다시 랜더링 하는부분에서
   * __vnode 와 같은 역할을 할 수 있는 것을 확인하여 코드 변경
   */
  explore(RenderSlotItems.value);

  if (!checkState) {
    // 검수에 통과하지 못한 가장 첫번째 폼에 포커스
    if (firstEl) {
      (firstEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return checkState;
};

const resetForm = (): void => {
  if (frm.value) {
    explore(RenderSlotItems.value, 'reset');
  }
};

const resetValidate = (): void => {
  if (frm.value) {
    explore(RenderSlotItems.value, 'resetValidate');
  }
};

const componentTypeCheck = (el: any): boolean => {
  const vueDom: string[] = [
    'TextField', 'NumberFormat', 'SelectBox',
    'SwitchButton', 'CheckButton', 'DatePicker', 'ValidateWrap', 'CodeMirrorForm'
  ];

  let tagName: string = el.type.name;

  if (el.type instanceof Object) {
    if ('name' in el.type && vueDom.includes(tagName)) {
      return true;
    }
  }

  return false;
};

const validateCheck = (el: any, flag: string): void => {
  if (el.component) {
    if (flag === 'reset') {
      el.component.exposed.resetForm();
    } else if (flag === 'resetValidate') {
      el.component.exposed.resetValidate();
    } else {
      if (!el.component.exposed.check(isSilence) && checkState) {
        checkState = false;

        // 가장 처음 검수에 통과 하지 못한 폼 저장 (라인 포커스)
        if (!firstEl) {
          firstEl = el.el as HTMLElement;
        }
      }
    }
  }
};

const explore = (el: any, flag: string = 'dom'): void => {
  if (Array.isArray(el.children)) {
    const len: number = el.children.length;

    if (len > 0) {
      const vueNodes: any = el.children;

      // vue node 전체(chilren)을 탐색 하여 chidren이 또 있는 경우 재귀한다.
      for (let i = 0; i < len; i++) {
        if (componentTypeCheck(vueNodes[i])) {
          validateCheck(vueNodes[i], flag);
        }

        if (vueNodes[i].component) {
          explore(vueNodes[i].component.subTree, flag);
        }

        if (vueNodes[i].children) {
          if (vueNodes[i].children?.length) {
            explore(vueNodes[i], flag);
          }
        }
      }
    }
  } else if (el.component) {
    if (el.component.subTree) {
      explore(el.component.subTree, flag);
    }
  }
};

const formProtection = (protect: boolean = true): void => {
  isCover.value = protect;
};

defineExpose({
  formProtection,
  resetValidate,
  resetForm,
  validate
});
</script>

<template>
  <form ref="frm" :class="isCover ? 'validate-form' : ''" @submit.prevent>
    <RenderSlotItems />

    <div class="form-cover" v-if="isCover"></div>
  </form>
</template>

<script lang="ts">
export default { name: 'ValidateForm' };
</script>

<style lang="scss">
.validate-form {
  position: relative;

  .form-cover {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    background-color: rgba(#fff, 0.3);
  }
}
</style>