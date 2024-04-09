<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import {
  mdiFormTextbox,
  mdiFormatText,
  mdiImageMultipleOutline,
  mdiFitToPageOutline,
  mdiImageRefreshOutline,
  mdiFileDocumentRefreshOutline,
  mdiApplicationImport,
  mdiCommentTextMultipleOutline,
  mdiCodeNotEqualVariant,
} from '@/assets/svg/path';
import type { ModalModel } from '@/components/Modal/types';
import type { MdiSvgIcon } from '@/components/types';
import type { ConstPageSectionTypeKeys } from '@/types/common';
import { CONST_CODES } from '@/constants/common';

const { PAGE_SECTION_TYPE } = CONST_CODES;

interface SectionItem {
  text: string
  value: ConstPageSectionTypeKeys
  icon: MdiSvgIcon
}

const emit = defineEmits<{
  (event: 'addSection', value: ConstPageSectionTypeKeys): void
  (event: 'close'): void
}>();

let isShow = ref<boolean>(true);
let sectionType = ref<ConstPageSectionTypeKeys | null>();
const modal = ref<ModalModel>();

const list = reactive<SectionItem[]>([
  { text: '이미지', value: PAGE_SECTION_TYPE.IMAGE.VAL, icon: mdiImageMultipleOutline },
  { text: '텍스트', value: PAGE_SECTION_TYPE.TEXT.VAL, icon: mdiFormatText },
  { text: '입력폼', value: PAGE_SECTION_TYPE.INPUT_FORM.VAL, icon: mdiFormTextbox },
  { text: '고정 배너', value: PAGE_SECTION_TYPE.FIXED_BANNER.VAL, icon: mdiFitToPageOutline },
  { text: '롤링 배너', value: PAGE_SECTION_TYPE.ROLLING_BANNER.VAL, icon: mdiImageRefreshOutline },
  { text: '리스트 롤링', value: PAGE_SECTION_TYPE.ROLLING_LIST.VAL, icon: mdiFileDocumentRefreshOutline },
  { text: '임포트', value: PAGE_SECTION_TYPE.IMPORT.VAL, icon: mdiApplicationImport },
  { text: '댓글', value: PAGE_SECTION_TYPE.COMMENT.VAL, icon: mdiCommentTextMultipleOutline },
  { text: '코드', value: PAGE_SECTION_TYPE.CODE.VAL, icon: mdiCodeNotEqualVariant },
]);

watch(isShow, (v) => {
  if (!v) {
    emit('close');
  }
});

const addSection = (v: ConstPageSectionTypeKeys): void => {
  sectionType.value = v;
  modal.value!.close();
};

const setSection = (): void => {
  if (sectionType.value) {
    emit('addSection', sectionType.value);
  }
};
</script>

<template>
  <Modal
    ref="modal"
    title="섹션"
    width="500px"
    id="editorAddSection"
    @update:model-value="setSection"
    v-model="isShow"
  >
    <template #body>
      <div class="wrap">
        <div
          :key="`section-type-${index}`"
          class="item-wrap"
          v-for="(item, index) in list"
        >
          <Tooltip bottom hovering :message="`단축키: Alt + Shift + ${index + 1}`">
            <a href="#" class="item-box" @click.prevent="addSection(item.value)">
              <div><SvgIcon size="50" type="mdi" :path="item.icon" /></div>
              <div class="mt-10">{{ item.text }}</div>
            </a>
          </Tooltip>
        </div>
      </div>
    </template>
    <template #action="{ close }">
      <StyledButton outline @click="close">취소</StyledButton>
    </template>
  </Modal>
</template>
