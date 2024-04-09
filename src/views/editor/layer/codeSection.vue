<script setup lang="ts">
import { ref, reactive, computed, watch, inject } from 'vue';
import type { KeyIndex } from '@/types/common';
import type { RuleFunc } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ConstPageSectionTypeKeys } from '@/types/common';
import type { CodeSectionConfig } from '@/types/api/smartEditorApi';
import { CONST_CODES } from '@/constants/common';
import { useEditorStore } from '@/store/modules/smartEditor';
import type { ToastModel } from '@/components/Toast/types';
import CodeMirrorForm from '@/views/common/CodeMirrorForm/index.vue';
import type { ModalModel } from '@/components/Modal/types';

const { PAGE_SECTION_TYPE: { CODE } } = CONST_CODES;

const emit = defineEmits<{
  (event: 'close', flag: ConstPageSectionTypeKeys): void
}>();

const props = withDefaults(defineProps<{
  index?: number
}>(), {
  index: -1
});

const store = useEditorStore();
const { options, updateSection, setSection, getSection } = store;
const Toast = inject('Toast') as ToastModel;

const modal = ref<ModalModel>();
let isShow = ref<boolean>(true);
let isPass = ref<boolean>(true);

const config = reactive<CodeSectionConfig>({
  sectionCodeUid: '',
  pageSectionRelUid: '',
  sourceCode: '',
  sectionAlias: '',
  isLayerPopup: 0,
});

const rules: KeyIndex<RuleFunc[]> = {
  input: [ v => !!v || '필수 입력 사항입니다.' ],
};

watch(isShow, (v) => {
  if (!v) {
    emit('close', CODE.VAL);
  }
});

const form = ref<ValidateFormModel>();

const validation = (): void => {
  if (!isPass.value) {
    isPass.value = true;
  }
};

const load = (): void => {
  for (let i = 0; i < options.template.length; i++) {
    const item = options.template[i];

    if (item.value === config.templateUid) {
      config.sourceCode = item.add!;
      validation();
      break;
    }
  }
};

const save = (close: Function): void => {
  if (form.value?.validate()) {
    if (props.index > -1) {
      updateSection(props.index, config);
    } else {
      setSection(CODE.VAL, config);
    }

    close();
  }
};

const sectionTitle = computed<string>(() => '코드 ' + (props.index > -1 ? '수정' : '등록'));

if (props.index > -1) {
  const data = getSection<CodeSectionConfig>(props.index);

  if (!data) {
    Toast({ color: 'danger', message: '해당 섹션의 데이터가 없습니다!!!' });
    modal.value?.close();
  } else {
    isPass.value = false;

    config.sectionCodeUid = data.config.sectionCodeUid;
    config.pageSectionRelUid = data.config.pageSectionRelUid;
    config.sourceCode = data.config.sourceCode;
    config.sectionAlias = data.config.sectionAlias;
    config.isLayerPopup = data.config.isLayerPopup;
  }
}
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    width="800px"
    :title="sectionTitle"
    id="editorSectionCode"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="form">
        <div class="row">
          <div class="col">
            <SelectBox
              block
              searchable
              label="템플릿"
              placeholder="선택"
              :options="options.template"
              @blur="validation"
              v-model="config.templateUid"
            />
          </div>
          <div class="self-end">
            <StyledButton
              color="primary"
              :disabled="!config.templateUid"
              @click="load"
            >
              불러오기
            </StyledButton>
          </div>
        </div>
        <div class="row pt-15">
          <div class="col">
            <CodeMirrorForm
              block
              required
              class="mt-10"
              height="320"
              label="코드"
              placeholder="소스를 입력해 주세요."
              :validate="rules.input"
              @blur="validation"
              v-model="config.sourceCode"
            />
          </div>
        </div>
        <div class="row pt-15">
          <div class="col">
            <TextField
              block
              label="섹션 별칭"
              placeholder="섹션 별칭을 입력해주세요."
              :max-length="100"
              @blur="validation"
              v-model="config.sectionAlias"
            />
          </div>
        </div>
        <div class="row pt-15">
          <div class="col">
            레이어 모달 설정
          </div>
          <div class="col col-5">
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="['설정안함', '설정']"
              @update:after="validation"
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
        @click="save(close)"
      >
        적용
      </StyledButton>
    </template>
  </Modal>
</template>
