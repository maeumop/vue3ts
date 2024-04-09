<script setup lang="ts">
import { ref, watch } from 'vue';
import { mdiPlus, mdiImageOutline, mdiImageOffOutline } from '@/assets/svg/path';
import type { ContentItem } from '@/types/store/modules/ftp';
import SelectImages from '@/views/common/ftp/layer/SelectImages/index.vue';

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'selected', value: ContentItem[]): void
}>();

const props = withDefaults(defineProps<{
  modelValue: string
  width?: string
  height?: string
  multiple?: boolean
  iconSize?: string
  onlyImage?: boolean
  onlyButton?: boolean
}>(), {
  width: '100%',
  height: '100%',
  multiple: false,
  iconSize: '24'
});

let selectorShow = ref<boolean>(false);
let imageText = ref<string>('선택된 이미지가 없습니다.');
let imageError = ref<boolean>(false);

watch(() => props.modelValue, (v) => {
  imagePath(v);
});

const imagePath = (v: string): void => {
  if (v && !props.onlyImage) {
    const path = v.split('/');
    imageText.value = path[path.length - 1];
  }
};

/**
 * ftp cdn 에서 선택된 이미지를 데이터변환
 * @param images
 */
const setImage = (image: ContentItem | ContentItem[]): void => {
  if (image instanceof Array) {
    if (image.length > 1) {
      emit('selected', image);
    } else {
      imageText.value = image[0].name;
      emit('update:modelValue', image[0].src!);
    }
  } else {
    imageText.value = image.name;
    emit('update:modelValue', image.src!);
  }
};

imagePath(props.modelValue);
</script>

<template>
  <div class="image-selector">
    <div
      class="file-selector"
      :style="{ maxWidth: props.width, width: props.width }"
      @click="selectorShow = true"
      v-if="!props.onlyButton"
    >
      <StyledButton
        small
        outline
        class="mr-10"
        :icon="mdiPlus"
      >
        이미지 선택
      </StyledButton>

      <div class="file-name">{{ imageText }}</div>
    </div>

    <div
      class="preview-image"
      :style="{ width: props.width, height: props.height }"
      @click="selectorShow = true"
      v-if="!props.onlyImage"
    >
      <img
        :src="props.modelValue"
        @error="imageError = true"
        v-if="props.modelValue && !imageError"
      />
      <SvgIcon
        type="mdi"
        :size="props.iconSize"
        :path="mdiImageOutline"
        v-if="!props.modelValue"
      />
      <SvgIcon
        type="mdi"
        :size="props.iconSize"
        :path="mdiImageOffOutline"
        v-if="!props.modelValue && imageError"
      />
    </div>

    <SelectImages
      :multiple="props.multiple"
      @close="selectorShow = false"
      @load-images="setImage"
      v-if="selectorShow"
    />
  </div>
</template>

<style lang="scss">
.image-selector {
  .file-selector {
    display: flex;

    .file-name {
      flex: 1 0 0%;
      line-height: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .preview-image {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $gray-100;
    border: 1px solid $gray-300;

    img {
      max-width: 100%;
      max-height: 100%;
    }

    svg {
      color: $gray-400;
    }
  }
}
</style>
