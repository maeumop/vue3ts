<script setup lang="ts">
import { ref, computed } from 'vue';
import type { StyleValue } from 'vue';
import type { ConstPageSectionTypeKeys } from '@/types/common';
import { mdiDragVertical } from '@/assets/svg/path';
import { useEditorStore } from '@/store';
import { storeToRefs } from 'pinia';
import { CONST_CODES } from '@/constants/common';

const { PAGE_SECTION_TYPE } = CONST_CODES;

const editorStore = useEditorStore();
const { options, sortState } = storeToRefs(editorStore);

const props = defineProps<{
  uniqueKey: number
  index: number
  type: ConstPageSectionTypeKeys
  config: any
}>();

/**
 * 각 섹션별 별칭(option 선택 내용) 반환
 */
const getOptionName = (): string => {
  let text = '';
  let uidKey = '';

  switch (props.type) {
    case PAGE_SECTION_TYPE.INPUT_FORM.VAL:
      uidKey = 'inputForm';
      break;
    case PAGE_SECTION_TYPE.ROLLING_BANNER.VAL:
      uidKey = 'rollingBanner';
      break;
    case PAGE_SECTION_TYPE.ROLLING_LIST.VAL:
      uidKey = 'rollingList';
      break;
    case PAGE_SECTION_TYPE.IMPORT.VAL:
      uidKey = 'import';
      break;
    case PAGE_SECTION_TYPE.COMMENT.VAL:
      uidKey = 'comment';
  }

  if (uidKey) {
    const single: string[] = ['inputForm', 'import'];
    const uidTextKey = uidKey.firstWordUpperCase() + (single.indexOf(uidKey) > -1 ? '' : 'Grp');

    const uid = props.config[`comp${uidTextKey}Uid`];
    const filter = options.value[uidKey].filter(item => item.value === uid);

    if (filter.length) {
      text = filter[0].text;
    }
  }

  return text;
};

/**
 * 섹션명 표시(별칭 추가)
 */
const sectionName = computed<string>(() => {
  const { IMAGE, FIXED_BANNER } = PAGE_SECTION_TYPE;
  let text: string = PAGE_SECTION_TYPE[props.type].TXT;

  if (props.config.sectionAlias) {
    text += ` (${props.config.sectionAlias})`;
  } else if (props.type !== IMAGE.VAL && props.type !== FIXED_BANNER.VAL) {
    const optName: string = getOptionName();
    text +=  optName ? ` (${optName})` : '';
  }

  return text;
});

let isHover = ref<boolean>(false);
let position = ref<string>('');

const isActive = (event: MouseEvent, bool: boolean = true): void => {
  isHover.value = bool;

  if (window.innerHeight - 250 < event.y) {
    position.value = 'bottom';
  } else {
    position.value = '';
  }
};

const previewImage = computed<StyleValue | undefined>(() => {
  let style: StyleValue = {};

  if (position.value === 'bottom') {
    style.bottom = '0';
  } else {
    style.top = '0';
  }

  return style;
});

const showImage: string[] = [PAGE_SECTION_TYPE.IMAGE.VAL, PAGE_SECTION_TYPE.FIXED_BANNER.VAL];
</script>

<template>
  <div
    :class="['sort-section', (isHover && !sortState) && 'active']"
    @mouseenter="isActive($event)"
    @mouseleave="isActive($event, false)"
  >
    <SvgIcon
      type="mdi"
      size="18"
      :path="mdiDragVertical"
      v-if="isHover"
    />
    <div class="empty-icon" v-else></div>

    <!-- Section{{ props.uniqueKey + 1 }}
    <div class="pipe"></div> -->
    {{ sectionName }}

    <template v-if="showImage.indexOf(props.type) > -1">
      <Transition name="fade">
        <div
          class="preview-img"
          :style="previewImage"
          v-show="isHover && !sortState"
        >
          <img :src="props.config.imagePath" />
        </div>
      </Transition>
    </template>
  </div>
</template>
