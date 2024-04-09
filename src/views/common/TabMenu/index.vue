 <script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TabOption } from '@/types/common/TabMenu';

// props
const props = withDefaults(
  defineProps<{
    modelValue: number
    options?: TabOption[]
  }>(),
  {
    options: () => [],
  },
);

// emit
const emit = defineEmits<{
  (event: 'update:modelValue', index: number): void
}>();

// data()
let value = ref<number>(-1);

// computed
const isActive = computed(
  () =>
    (item: TabOption): boolean =>
      !!(props.options[value.value].value === item.value),
);

// methods
const onClickTab = ($event: MouseEvent) => {
  const index: number = parseInt(($event.target as HTMLButtonElement)?.value);
  if (index !== value.value) {
    emit('update:modelValue', index);
  }
};

// watch
watch(
  () => props.modelValue,
  () => {
    value.value = props.modelValue;
  },
  { immediate: true }
);
</script>

<script lang="ts">
export default {
  name: 'TabMenu',
};
</script>

<template>
  <div class="component tabMenu">
    <ul class="headerLayout">
      <li
        :key="i"
        :class="['tab', { active: isActive(item) }]"
        v-for="(item, i) in props.options"
      >
        <button
          :value="i"
          @click="onClickTab"
        >
          {{ item.title }}
        </button>
      </li>
    </ul>
    <div class="bodyLayout">
      <template
        :key="i"
        v-for="(item, i) in props.options"
      >
        <Transition name="page-fade">
          <div
            :class="['tabMenuItem', `${item.value}`]"
            v-show="isActive(item)"
          >
            <slot :name="`body-${item.value}`"></slot>
          </div>
        </Transition>
      </template>
    </div>
  </div>
</template>