<script setup lang="ts">
import { ref, watchEffect, computed, useSlots } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { modalPosition, modalTransition } from './const';
import type { ModalPosition, ModalTransition } from './types';
import { mdiWindowClose } from '@/assets/svg/path';

const slots = useSlots();

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  escClose?: boolean
  width?: string
  position?: ModalPosition
  screenCover?: boolean
  accessBack?: boolean
  hideClose?: boolean
}>(), {
  modelValue: false,
  escClose: false,
  position: modalPosition.popup,
  screenCover: false,
  width: '320px',
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>();

let isShow = ref<boolean>(false);
let keyEventStyle = ref<string>('');

// 창이 닫히기 전에 다른 팝업 창이 있는지 검수
let modalBg: NodeListOf<HTMLDivElement>;

const modal = ref<HTMLDivElement>();

watchEffect(() => {
  isShow.value = props.modelValue;

  if (props.modelValue) {
    document.body.classList.add('no-scroll');
  }
});

const transitionName = computed<ModalTransition>(() => modalTransition[props.position]);
const boxStyle = computed<string[]>(() => {
  let cover: string = '';

  if (props.position !== 'popup' && props.screenCover) {
    cover = 'screen-cover';
  }

  return ['modal-box', keyEventStyle.value, props.position, cover];
});

/**
 * 모달 창 닫기
 */
const close = (callback: Function | null = null): void => {
  if (callback instanceof Function) {
    callback();
  }

  // 창이 제거되기 전이기 때문에 팝업의 수는 기본 1
  if (modalBg.length === 1) {
    document.body.classList.remove('no-scroll');
  }

  modal.value?.removeEventListener('keydown', keyDownEvent);
  modal.value?.removeEventListener('keyup', keyUpEvent);

  isShow.value = false;
};

const dispose = (): void => {
  emit('update:modelValue', false);
};

/**
 * ESC 키로 닫기 처리
 * @param event
 */
const keyDownEvent = (event: KeyboardEvent): void => {
  if (event.key.toLowerCase() === 'escape') {
    if (props.escClose) {
      close();
    } else {
      keyEventStyle.value = 'big';
    }
  }
};

const keyUpEvent = (event: KeyboardEvent): void => {
  if (event.key.toLowerCase() === 'escape') {
    if (!props.escClose) {
      keyEventStyle.value = '';
    }
  }
};

/**
 * 이벤트 주입
 */
const setEvents = (): void => {
  modalBg = document.body.querySelectorAll<HTMLDivElement>('.modal-bg:not(.hide)');

  modal.value?.addEventListener('keydown', keyDownEvent);
  modal.value?.addEventListener('keyup', keyUpEvent);
  modal.value?.focus();
};

if (props.accessBack) {
  onBeforeRouteLeave(() => {
    if (isShow.value) {
      return false;
    }

    return true;
  });
}

defineExpose({
  close
});
</script>

<template>
  <Teleport to="body">
    <Transition
      appear
      name="modal-fade"
      @after-leave="dispose"
      @after-enter="setEvents"
    >
      <div
        ref="modal"
        tabindex="0"
        :class="['modal-bg', !isShow && 'hide']"
        v-bind="$attrs"
        v-show="isShow"
      >
        <Transition appear :name="transitionName">
          <div
            :style="{ width: props.width, maxWidth: props.width }"
            :class="boxStyle"
            v-show="isShow"
          >
            <div :class="[!slots.header && 'modal-header']">
              <template v-if="slots.header">
                <slot name="header" :close="close"></slot>
              </template>
              <template v-else>
                <div class="title-text">
                  <span class="text">{{ props.title }}</span>
                  <slot name="title"></slot>
                </div>

                <SvgIcon
                  type="mdi"
                  size="22"
                  class="close"
                  :path="mdiWindowClose"
                  @click.prevent="close()"
                  v-if="!props.hideClose"
                />
              </template>
            </div>
            <div class="modal-body">
              <slot name="body" :close="close"></slot>
            </div>
            <div class="modal-action" v-if="slots.action">
              <slot name="action" :close="close"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
@import './style.scss';
</style>
<script lang="ts">
export default { name: 'Modal' };
</script>