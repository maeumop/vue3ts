<script setup lang="ts">
/* eslint-disable vue/no-v-html */
import { ref, onMounted } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiGoogleCirclesExtended } from '@/assets/svg/path';

// vue 3 typescript bug
export interface MessageBoxOptions {
  type?: string
  message: string
  modalStyleClass?: string
  noScrollStyleClass?: string
  title?: string
  width?: number
  btnOkayText?: string
  btnCancelText?: string
  okay?: Function
  cancel?: Function
  asyncOkay?: Function
  destroy?: Function
  escCancel?: boolean
  enterOkay?: boolean
}

const props = withDefaults(defineProps<MessageBoxOptions>(), {
  width: 320,
  btnOkayText: '확인',
  btnCancelText: '취소',
  escCancel: true,
  enterOkay: true,
});

let isShow = ref<boolean>(true);
let btnOkay = ref<HTMLAnchorElement>();
let spinnerShow = ref<boolean>(false);

const keyupEvent = (evt: KeyboardEvent): void => {
  // Enter 키를 눌렀을 때 okay 실행
  if (evt.key === 'Enter') {
    if (props.enterOkay) {
      clickOkay();
    }
  }

  // ESC 키를 눌렀을때 창을 닫아 줌(cancel과 동일)
  if (evt.key === 'Escape') {
    if (props.escCancel) {
      clickCancel();
    }
  }
};

const hide = (): void => {
  let box: NodeList = document.body.querySelectorAll('.msg-box-bg');

  if (box.length) {
    document.body.classList.remove('hide-scroll');
  }

  isShow.value = false;
};

const close = (): void => {
  if (props.destroy instanceof Function) {
    document.removeEventListener('keyup', keyupEvent);
    props.destroy();
  }
};

const clickOkay = (): void => {
  if (props.okay instanceof Function) {
    props.okay();
  }

  hide();
};

const asyncClickOkay = async (): Promise<void> => {
  if (spinnerShow.value) {
    return;
  }
  
  spinnerShow.value = true;

  if (props.asyncOkay instanceof Function) {
    await props.asyncOkay();
  }

  hide();
};

const clickCancel = (): void => {
  if (!spinnerShow.value) {
    if (props.cancel instanceof Function) {
      props.cancel();
    }

    hide();
  }
};

onMounted(() => {
  document.body.classList.add('hide-scroll');

  btnOkay.value?.focus();
  btnOkay.value?.blur();

  document.addEventListener('keyup', keyupEvent);
});

defineExpose({
  hide
});
</script>

<template>
  <Transition name="msg-box-fade">
    <div class="msg-box-bg" tabindex="0" v-show="isShow">
      <Transition appear name="msg-box-scale" @after-leave="close">
        <div
          class="msg-box"
          :style="{ width: `${width}px` }"
          v-show="isShow"
        >
          <h5 class="title">
            {{ title }}
          </h5>
          <div class="contents" v-html="message"></div>
          <div class="actions">
            <a
              ref="btnOkay"
              href="#"
              class="btn-okay"
              @click.prevent="(typeof props.asyncOkay === 'function') ? asyncClickOkay() : clickOkay()"
            >
              <template v-if="spinnerShow">
                <SvgIcon class="loading" type="mdi" :path="mdiGoogleCirclesExtended" />
              </template>
              <template v-else>
                {{ btnOkayText }}
              </template>
            </a>
            <a
              href="#"
              class="btn-cancel"
              @click.prevent="clickCancel"
              v-if="type === 'confirm'"
            >
              {{ btnCancelText }}
            </a>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style lang="scss">
@import './style.scss';
</style>