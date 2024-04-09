<script setup lang="ts">
import { ref, watch, watchEffect, nextTick } from 'vue';
import { modalTransition } from '@/components/Modal/const';

import { mdiWindowClose, mdiImageOffOutline } from '@/assets/svg/path';

// props
const props = withDefaults(defineProps<{
  modelValue: boolean
  src: string
}>(), {
  modelValue: false,
  src: '',
});

// emit
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>();

// Element
const modal = ref<HTMLDivElement>();

// data
let isShow = ref<boolean>(false);
let imgSrcError = ref<boolean>(false);


// methods
/**
 * escape 입력시에만 모달창 종료
 * @author hjs0613
 * @param {KeyboardEvent} $event 이벤트
 * @returns
 */
const _keyDownEvent = ($event: KeyboardEvent): void => {
  setTimeout(() => {
    if ($event.key.toLowerCase() === 'escape') {
      onClose();
    }
  }, 100);
};

/**
 * 모달 창 닫기
 * @author hjs0613
 * @param {Function | null} callback 이벤트
 * @returns
 */
const onClose = async (callback: Function | null = null): Promise<void> => {
  if (callback instanceof Function) {
    await callback();
  }

  nextTick(() => {
    let modalBg: NodeListOf<Element> = document.body.querySelectorAll('.modal-bg:not(.hide)');

    if (modalBg!.length === 1) {
      document.body.classList.remove('no-scroll');
    }
    modal.value!.removeEventListener('keydown', _keyDownEvent);
    isShow.value = false;
    imgSrcError.value = false;
  });
};

const onAfterLeave = (): void => {
  emit('update:modelValue', false);
};

const onAfterEnter = (): void => {
  modal.value?.addEventListener('keydown', _keyDownEvent);
  modal.value!.focus();
};

// watchEffect
watchEffect(() => {
  isShow.value = props.modelValue;
  if (props.modelValue) {
    document.body.classList.add('no-scroll');
  }
});

// watch
watch(() => props.src, () => {
  imgSrcError.value = props.src ? false : true;
});

defineExpose({
  onClose
});
</script>
<script lang="ts">
export default { name: 'FtpLayerImageViewer' };
</script>
<template>
  <Teleport to="body">
    <Transition
      appear
      name="modal-fade"
      @after-leave="onAfterLeave"
      @after-enter="onAfterEnter"
    >
      <div
        ref="modal"
        tabindex="0"
        :class="['modal-bg', !isShow && 'hide', 'imageViewer']"
        v-bind="$attrs"
        v-show="isShow"
      >
        <Transition appear :name=" modalTransition['popup']">
          <div :class="['modal-box', 'screen-cover']" v-show="isShow">
            <a
              href="#"
              class="close"
              @click.prevent="onClose()"
            >
              <SvgIcon type="mdi" :path="mdiWindowClose" :size="40" />
            </a>
            <div class="modal-body">
              <img :src="props.src" @error="imgSrcError = true" v-if="!imgSrcError" />
              <SvgIcon
                class="mdi width-p-30 height-p-30"
                type="mdi"
                :path="mdiImageOffOutline"
                v-else
              />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
