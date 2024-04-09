<script setup lang="ts">
import { ref, computed, reactive, watch, inject } from 'vue';
import type { KeyIndex } from '@/types/common';
import type { RuleFunc } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ConstPageSectionTypeKeys } from '@/types/common';
import type { TextSectionConfig } from '@/types/api/smartEditorApi';
import { useEditorStore } from '@/store';
import { CONST_CODES } from '@/constants/common';
import TiptapEditor from '@/components/TiptapEditor/index.vue';
import type { ToastModel } from '@/components/Toast/types';
import type { ModalModel } from '@/components/Modal/types';

const { PAGE_SECTION_TYPE } = CONST_CODES;

const emit = defineEmits<{
  (event: 'close', flag: ConstPageSectionTypeKeys): void
}>();

const props = withDefaults(defineProps<{
  index?: number
}>(), {
  index: -1
});

const { updateSection, setSection, getSection } = useEditorStore();

const Toast = inject('Toast') as ToastModel;
const modal = ref<ModalModel>();

let isShow = ref<boolean>(true);
let isPass = ref<boolean>(true);

const config = reactive<TextSectionConfig>({
  sectionTextUid: '',
  pageSectionRelUid: '',
  textContent: '',
  divProperty: '',
  sectionAlias: '',
  isLayerPopup: 0,
});

const rules: KeyIndex<RuleFunc[]> = {
  input: [v => !!v || '필수 입력 사항압니다.'],
  select: [v => !!v || '필수 선택 사항입니다.'],
};

const editorTools = [
  ['size', 'color', 'mark'],
  ['bold', 'italic', 'underline', 'strike'],
  // ['textAlign'],
  // ['heading1', 'heading2', 'heading3', 'heading4', 'heading5'],
  // ['bulletlist', 'orderedlist'],
  // ['link', 'table'],
];

watch(isShow, (v) => {
  if (!v) {
    emit('close', PAGE_SECTION_TYPE.TEXT.VAL);
  }
});

const form = ref<ValidateFormModel>();

const validation = (): void => {
  if (config.textContent === '<p></p>') {
    config.textContent = '';
  }

  if (!isPass.value) {
    isPass.value = true;
  }
};

const save = (close: Function): void => {
  if (form.value?.validate()) {
    if (props.index > -1) {
      updateSection(props.index, config);
    } else {
      setSection(PAGE_SECTION_TYPE.TEXT.VAL, config);
    }

    close();
  }
};

const sectionTitle = computed<string>(() => '텍스트 ' + (props.index > -1 ? '수정' : '등록'));

if (props.index > -1) {
  const data = getSection<TextSectionConfig>(props.index);

  if (!data) {
    Toast({ color: 'danger', message: '해당 섹션의 데이터가 없습니다!!!' });
  } else {
    isPass.value = false;

    config.textContent = data.config.textContent;
    config.divProperty = data.config.divProperty;
    config.sectionAlias = data.config.sectionAlias;
    config.isLayerPopup = data.config.isLayerPopup;
    config.pageSectionRelUid = data.config.pageSectionRelUid;
    config.sectionTextUid = data.config.sectionTextUid;
  }
}
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    width="1050px"
    :title="sectionTitle"
    id="editorSectionText"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="form">
        <div class="row">
          <div class="col">
            <ValidateWrap
              required
              label="내용"
              :validate="rules.input"
              :check-value="config.textContent"
              @update:check-value="validation"
            >
              <TiptapEditor
                height="450px"
                :tools="editorTools"
                @blur="validation"
                v-model="config.textContent"
              />
            </ValidateWrap>
          </div>
        </div>
        <div class="row pt-15">
          <div class="col">
            <TextField
              block
              label="DIV 속성"
              placeholder="<div> 태그에 추가할 속성을 입력해 주세요. Ex) id, class, style 등"
              @blur="validation"
              v-model="config.divProperty"
            />
          </div>
        </div>
        <div class="row pt-15">
          <div class="col">
            <TextField
              block
              label="섹션 별칭"
              placeholder="섹션 별칭을 입력해주세요."
              @blur="validation"
              v-model="config.sectionAlias"
            />
          </div>
        </div>
        <div class="row pt-15">
          <div class="col">
            레이어 모달 설정
          </div>
          <div class="col col-7">
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="['설정안함', '설정']"
              @input="validation"
              v-model="config.isLayerPopup"
            />
          </div>
        </div>
      </ValidateForm>
    </template>

    <template #action="{ close }">
      <StyledButton outline @click="close">취소</StyledButton>
      <StyledButton
        color="primary"
        class="ml-5"
        :disabled="!isPass"
        @click="save(close)"
      >
        적용
      </StyledButton>
    </template>
  </Modal>
</template>
