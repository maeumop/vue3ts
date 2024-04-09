<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import type { ContextMenuOption } from '@/types/common/ContextMenu';

type OnOpenOption = {
  top: number;
  left: number;
  options: ContextMenuOption[];
};
  
// props

// Element
let contextMenuEL = ref<HTMLDivElement>();

// data
let isShow = ref<boolean>(false);
let options: ContextMenuOption[] = [];

/**
 * contextmenu가 활성화 되면서, screen.{x,y} 값보다 parmas.{x,y} 위치값이 클 경우 contextmenu가 screen밖으로 나가지 않게 위치값 자동 저정합니다.
 * @author hjs0608
 * @public
 * @param {OnOpenOption} parmas contextmenu x,y 축 위치값 params
 * @returns
 */
const onOpen = (parmas: OnOpenOption): void => {
  options.splice(0, options.length, ...parmas.options);
  isShow.value = true;
  nextTick(() => {
    const style = contextMenuEL.value?.style as CSSStyleDeclaration;
    const rect = contextMenuEL.value?.getBoundingClientRect() as DOMRect;
    const { clientWidth, clientHeight } = document.body;

    let top: number = parmas.top;
    if (parmas.top + rect.height >= clientHeight) {
      top -= rect.height;
    }

    let left: number = parmas.left;
    if (parmas.left + rect.width >= clientWidth) {
      left -= rect.width;
    }

    style.setProperty('top', `${top}px`);
    style.setProperty('left', `${left}px`);
  });
};

/**
 * contextmenu 종료
 * @author hjs0608
 * @returns
 */
const onClose = (): void => {
  options.splice(0, options.length);
  isShow.value = false;
};

/**
 * contextmenu가 열려있을때 window에서 부터 발생되는 캡쳐링 캐치시, 자동으로 close합니다.
 * @author hjs0608
 * @returns
 */
const outsideClickEvent = ($event: MouseEvent) => {
  if (!contextMenuEL.value?.contains(($event.target as HTMLElement))) {
    // 컨텍스트 메뉴 내에서의 이벤트는 즉시 종료 하지 않습니다.
    onClose();
  }
};

/**
 * contextmenu가 열려있을때 keydown 이벤트 리스너가 활성화되며, esc 키 입력시 자동으로 close합니다.
 * @author hjs0608
 * @param {KeyboardEvent} $event 이벤트
 * @returns
 */
const outsideKeydownEvent = ($event: KeyboardEvent) => {
  if ($event.key === 'Escape') {
    onClose();
  }
};

watch(isShow, () => {
  if (isShow.value) {
    nextTick(() => {
      document.body.addEventListener('scroll', onClose, { capture: true });
      document.body.addEventListener('mousedown', outsideClickEvent, { capture: true });
      document.body.addEventListener('keydown', outsideKeydownEvent, { capture: true });
    });
  } else {
    nextTick(() => {
      document.body.removeEventListener('scroll', onClose, { capture: true });
      document.body.removeEventListener('mousedown', outsideClickEvent, { capture: true });
      document.body.removeEventListener('keydown', outsideKeydownEvent, { capture: true });
    });
  }
});

defineExpose({
  onOpen,
  onClose,
});
</script>
<script lang="ts">
export default { name: 'ContextMenu' };
</script>
<template>
  <Teleport to="body">
    <div
      ref="contextMenuEL"
      class="component contextMenu"
      @contextmenu.prevent
      v-if="isShow"
    >
      <div class="wrapper">
        <ul>
          <li
            :key="i"
            @click.stop="[item.callback(), onClose()]"
            v-for="(item, i) in options"
          >
            <SvgIcon
              class="mdi"
              type="mdi"
              :path="item.icon"
              v-if="item.icon"
            />
            <span>{{ item.event }}</span>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>