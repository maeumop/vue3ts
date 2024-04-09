<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { CSSProperties, StyleValue } from 'vue';
import type { MdiSvgIcon } from '@/components/types';
import type { KeyIndex } from '@/components/types';
import type { ConstPageSectionTypeKeys } from '@/types/common';
import {
  mdiArrowUp,
  mdiArrowDown,
  mdiPencil,
  mdiPlus,
  mdiTrashCanOutline,
  mdiFormTextbox,
  mdiFitToPageOutline,
  mdiImageRefreshOutline,
  mdiFileDocumentRefreshOutline,
  mdiApplicationImport,
  mdiCommentTextMultipleOutline,
  mdiCodeNotEqualVariant,
} from '@/assets/svg/path';
import { storeToRefs } from 'pinia';
import { useEditorStore } from '@/store';
import { CONST_CODES  } from '@/constants/common';

const { PAGE_SECTION_TYPE } = CONST_CODES;

const emit = defineEmits<{
  (event: 'add', flag: string, index: number): void
  (event: 'remove', index: number): void
  (event: 'edit', index: number): void
  (event: 'sort', index: number, sort: number): void
}>();

const props = defineProps<{
  uniqueKey: number
  index: number
  type: ConstPageSectionTypeKeys
  config: any //SectionConfig 참조 안되는 오류 발생
}>();

const store = useEditorStore();
const { sectionLength, getOptionName } = store;
const { sortState, sortModeState } = storeToRefs(store);

let isActive = ref<boolean>(false);

const setActive = (bool: boolean): void => {
  if (!sortState.value && !sortModeState.value) {
    isActive.value = bool;
  }

  // 해당 섹션에서 벗어나는 경우 context 메뉴를 닫아준다
  if (!bool) {
    contextMenuShow.value = false;
  }
};

const sortUpShow = computed<boolean>(() => props.index > 0);
const sortDownShow = computed<boolean>(() => props.index < sectionLength - 1);

const add = (): void => {
  contextMenuShow.value = false;
  emit('add', 'addSection', props.index);
};
const remove = (): void => {
  contextMenuShow.value = false;
  emit('remove', props.index);
};
const edit = (): void => {
  contextMenuShow.value = false;
  emit('edit', props.index);
};
const sort = (v: number) => {
  contextMenuShow.value = false;
  emit('sort', props.index, v);
};

// 마우스 우클릭 컨텍스트 메뉴 설정
let contextMenuShow = ref<boolean>(false);
let isBottom = ref<boolean>(false);
let offsets = reactive<CSSProperties>({
  top: '',
  left: '',
  bottom: '',
});

const positions = computed<StyleValue>(() => {
  return {
    top: offsets.top ? `${offsets.top}px` : '',
    left: offsets.left ? `${offsets.left}px` : '',
    bottom: offsets.bottom ? `${offsets.bottom}px` : '',
  };
});

/**
 * 마우스 우클릭시 메뉴 팝업
 * @param event
 */
const setContextMenu = (event: MouseEvent): void => {
  const { clientHeight } = document.body;
  const { clientY } = event;

  isBottom.value = false;

  if (clientHeight < (clientY + 200)) {
    isBottom.value = true;
  }

  if (!contextMenuShow.value && !isBottom.value) {
    offsets.top = event.clientY;
    offsets.left = event.clientX;
    offsets.bottom = '';
  } else if (!contextMenuShow.value && isBottom.value) {
    offsets.top = '';
    offsets.left = event.clientX;
    offsets.bottom = clientHeight - clientY;
  }

  contextMenuShow.value = !contextMenuShow.value;
};

// 이미지 텍스트를 제외한 섹션의 아이콘
const sectionIcons: KeyIndex<MdiSvgIcon> = {
  INPUT_FORM: mdiFormTextbox,
  FIXED_BANNER: mdiFitToPageOutline,
  ROLLING_BANNER: mdiImageRefreshOutline,
  ROLLING_LIST: mdiFileDocumentRefreshOutline,
  IMPORT: mdiApplicationImport,
  COMMENT: mdiCommentTextMultipleOutline,
  CODE: mdiCodeNotEqualVariant,
};

const sectionName = computed<string>(() => {
  let name = props.config.sectionAlias;

  if (!name) {
    name = PAGE_SECTION_TYPE[props.type].TXT;
  }

  switch (props.type) {
    case PAGE_SECTION_TYPE.INPUT_FORM.VAL:
      name = getOptionName('inputForm', props.config.compInputFormUid);
      break;
    case PAGE_SECTION_TYPE.ROLLING_BANNER.VAL:
      name = getOptionName('rollingBanner', props.config.compRollingBannerGrpUid);
      break;
    case PAGE_SECTION_TYPE.ROLLING_LIST.VAL:
      name = getOptionName('rollingList', props.config.compRollingListGrpUid);
      break;
    case PAGE_SECTION_TYPE.IMPORT.VAL:
      name = getOptionName('import', props.config.compImportUid);
      break;
    case PAGE_SECTION_TYPE.COMMENT.VAL:
      name = getOptionName('comment', props.config.compCommentGrpUid);
  }

  return name;
});
</script>

<template>
  <div
    :class="['editor-section', `section${props.uniqueKey}`, isActive && 'active']"
    @mouseenter="setActive(true)"
    @mouseleave="setActive(false)"
    @contextmenu.prevent="setContextMenu"
    @click="edit"
  >
    <img
      :class="`section-${props.type}`"
      :src="props.config.imagePath"
      v-if="props.type === PAGE_SECTION_TYPE.IMAGE.VAL"
    />
    <div
      class="text-section"
      v-html="props.config.textContent"
      v-else-if="props.type === PAGE_SECTION_TYPE.TEXT.VAL"
    >
    </div>
    <div class="etc-section" v-else>
      <SvgIcon type="mdi" size="80" :path="sectionIcons[props.type]" />
      <div class="name mt-10">{{ sectionName }}</div>
    </div>

    <!-- <Transition name="fade">
      <div class="section-key" v-show="isActive">
        Section{{ props.uniqueKey + 1 }}
      </div>
    </Transition> -->

    <Transition name="context-scale">
      <ul
        :class="['section-context', isBottom && 'bottom']"
        :style="positions"
        v-show="contextMenuShow"
      >
        <li>
          <a href="#" class="edit" @click.stop.prevent="edit">
            <SvgIcon type="mdi" size="16" :path="mdiPencil" />
            수정
          </a>
        </li>
        <li>
          <a href="#" class="add" @click.stop.prevent="add">
            <SvgIcon type="mdi" size="16" :path="mdiPlus" />
            추가
          </a>
        </li>
        <li>
          <a href="#" class="remove" @click.stop.prevent="remove">
            <SvgIcon type="mdi" size="16" :path="mdiTrashCanOutline" />
            삭제
          </a>
        </li>
        <li v-show="sortUpShow">
          <a href="#" class="sort-down" @click.stop.prevent="sort(-1)">
            <SvgIcon type="mdi" size="16" :path="mdiArrowUp" />
            위로
          </a>
        </li>
        <li v-show="sortDownShow">
          <a href="#" class="sort-up" @click.stop.prevent="sort(1)">
            <SvgIcon type="mdi" size="16" :path="mdiArrowDown" />
            아래로
          </a>
        </li>
      </ul>
    </Transition>
  </div>
</template>
