<script setup lang='ts'>
import { ref, computed, watch } from 'vue';

import { mdiImageOutline, mdiImageOffOutline, mdiMagnify } from '@/assets/svg/path';

// props
const props = withDefaults(
  defineProps<{
    src?: string
    width?: string
    height?: string
    readonly?: boolean
    overlay?: boolean
  }>(),
  {
    width: '100%',
    height: '100%',
    readonly: false,
    overlay: false,
  },
);

// emit
const emit = defineEmits<{
  (event: 'click'): void
}>();

// data()
let error = ref<boolean>(false);

// computed
const commonStyle = computed<any[]>(() => ([ { width: props.width }, { height: props.height } ]));

//methods
const onClick = (): void => {
  if (!props.readonly) {
    emit('click');
  }
};

watch(() => props.src, () => {
  if (error.value) {
    error.value = false;
  }
});

</script>
<script lang='ts'> export default { name: 'FTPImage' };</script>
<template>
  <div class="component ftpImage" :style="[ ...commonStyle ]">
    <Transition
      appear
      name="modal-fade"
    >
      <div :class="['btnWrap', { readonly: props.readonly }, { error } ]" @click="onClick">
        <template v-if="error">
          <div class="iconWrap">
            <SvgIcon
              class="mdi mx-auto"
              type="mdi"
              :path="mdiImageOffOutline"
              :size="25"
            />
          </div>
        </template>
        <template v-else>
          <div class="iconTextWrap" v-if="!props.src">
            <a @click.prevent>
              <div class="row">
                <div class="col text-center">
                  <SvgIcon
                    class="mdi mx-auto"
                    type="mdi"
                    :path="mdiImageOutline"
                  />
                </div>
              </div>
              <div class="row" v-if="!props.readonly">
                <div class="col text-center">
                  <span>
                    클릭 후 이미지를<br />선택해 주세요.
                  </span>
                </div>
              </div>
            </a>
          </div>
          <img :src="props.src" @error="error = true" v-else />
        </template>

      </div>
    </Transition>
    <div :class="['over', { show: props.overlay}]" @click="emit('click')" v-if="props.overlay && !error">
      <slot name="hoverIcon">
        <SvgIcon
          type="mdi"
          class="mdi mx-auto"
          :path="mdiMagnify"
        />
      </slot>
    </div>
  </div>
</template>