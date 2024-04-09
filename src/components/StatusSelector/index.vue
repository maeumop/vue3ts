<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { mdiChevronDown } from '@/assets/svg/path';
import type { StatusSelectorItem } from './types.d.ts';

const props = withDefaults(defineProps<{
  modelValue: string
  options: StatusSelectorItem[]
  circle?: boolean
  readOnly?: boolean
  bgColor?: string
}>(), {
  circle: false,
  readOnly: false,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void,
  (event: 'update:selectedIndex', value: number): void,
}>();

let text = ref<string>('대기중');
let color = ref<string>('grey');
let isShow = ref<boolean>(false);
let selectedIndex = ref<number>(-1);
const selector = ref<HTMLDivElement>();

const toggle = (): void => {
  if (!props.readOnly) {
    isShow.value = !isShow.value;
  }
};

const outsideClickEvent = (evt: MouseEvent) => {
  if (selector.value !== undefined) {
    const target = evt.target as HTMLElement;

    if (!selector.value.contains(target)) {
      isShow.value = false;
    }
  }
};

const selection = (i: number) => {
  selectedIndex.value = i;
  color.value = props.options[i].color;
  text.value = props.options[i].text;
  toggle();

  emit('update:modelValue', props.options[i].value);
  emit('update:selectedIndex', i);
};


onMounted(() => {
  for (let i = 0; i < props.options.length; i++) {
    let item = props.options[i];

    if (item.value === props.modelValue) {
      color.value = item.color;
      text.value = item.text;
      selectedIndex.value = i;
    }
  }

  document.addEventListener('click', outsideClickEvent);
});

onUnmounted(() => {
  document.removeEventListener('click', outsideClickEvent);
});
</script>

<template>
  <div
    ref="selector"
    class="status-selector"
    @click="toggle"
  >
    <div
      :class="['wrap', { readonly: props.readOnly }]"
      :style="{ backgroundColor: props.bgColor === undefined ? '#efefef' : props.bgColor }"
    >
      <div
        class="circle"
        :style="{ backgroundColor: color }"
        v-if="props.circle"
      >
      </div>
      <span :style="{ color: color }">{{ text }}</span>
      <SvgIcon
        size="12"
        type="mdi"
        :path="mdiChevronDown"
        v-if="!props.readOnly"
      />
    </div>

    <Transition name="fade">
      <ul v-show="isShow">
        <li
          :key="`selector-${i}`"
          :style="{ color: item.color }"
          @click.stop="selection(i)"
          v-for="(item, i) in props.options"
        >
          {{ item.text }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@import './style.scss';
</style>
<script lang="ts">
export default { name: 'StatusSelector' };
</script>