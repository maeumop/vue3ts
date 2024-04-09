<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    to?: string | HTMLElement
    callback?: Function
    delay?: number
  }>(),
  {
    to: 'body',
    delay: -1,
  },
);

let isShow = ref<boolean>(false);

const onDoBefore = () => {
  isShow.value = true;
};
const onDo = async (): Promise<void> => {
  onDoBefore();
  try {
    if (props.callback instanceof Function) {
      await props.callback();
    }
    if (props.delay > 0) {
      await waiting(props.delay);
    }
  } finally {
    onDoAfter();
  }
};
const onDoAfter = () => {
  isShow.value = false;
};

const waiting = (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms * 1000);
  });
};

defineExpose({
  onDo,
});
</script>
<script lang="ts">
export default { name: 'EventPreventDom' };
</script>
<template>
  <Teleport :to="props.to">
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100vh" v-if="isShow">
    </div>
  </Teleport>
</template>
