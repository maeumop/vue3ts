<script setup lang="ts">
import { ref, reactive, computed, watch, inject, onMounted } from 'vue';
import type { KeyIndex } from '@/types/common';
import type { RuleFunc } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { InputSectionConfig } from '@/types/api/smartEditorApi';
import type { ConstPageSectionTypeKeys } from '@/types/common';
import { useEditorStore } from '@/store';
import { CONST_CODES } from '@/constants/common';
import ImageSelector from '@/views/common/ImageSelector/index.vue';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';

const { PAGE_SECTION_TYPE: { INPUT_FORM } } = CONST_CODES;

const emit = defineEmits<{
  (event: 'close', flag: ConstPageSectionTypeKeys): void
}>();

const props = withDefaults(defineProps<{
  index?: number
}>(), {
  index: -1
});

const store = useEditorStore();
const {
  updateSection, getSection,
  setSection, optionCall, options,
} = store;

const Toast = inject('Toast') as ToastModel;
const modal = ref<ModalModel>();

let isShow = ref<boolean>(true);
let isPass = ref<boolean>(true);

const config = reactive<InputSectionConfig>({
  sectionInputFormUid: '',
  pageSectionRelUid: '',
  compInputFormUid: '',
  btnImagePath: '',
  btnImageProperty: '',
  divProperty: '',
  isLayerPopup: 0,
  topImagePath: '',
  topImageProperty: '',
});

const rules: KeyIndex<RuleFunc[]> = {
  input: [v => !!v || '필수 입력 사항압니다.'],
  select: [v => !!v || '필수 선택 사항입니다.'],
};

watch(isShow, (v) => {
  if (!v) {
    emit('close', INPUT_FORM.VAL);
  }
});

watch(() => config.isLayerPopup, (v) => {
  if (!v) {
    config.topImagePath = '';
    config.topImageProperty = '';
  }
});

const form = ref<ValidateFormModel>();

const validation = (): void => {
  if (!isPass.value) {
    isPass.value = true;
  }
};

const save = (close: Function): void => {
  if (form.value?.validate()) {
    if (props.index > -1) {
      updateSection(props.index, config);
    } else {
      setSection(INPUT_FORM.VAL, config);
    }

    close();
  }
};

const sectionTitle = computed<string>(() => '입력폼 ' + (props.index > -1 ? '수정' : '등록'));

onMounted(() => {
  if (props.index > -1) {
    const data = getSection<InputSectionConfig>(props.index);

    if (!data) {
      Toast({ color: 'danger', message: '해당 섹션의 데이터가 없습니다!!!' });
    } else {
      isPass.value = false;

      config.sectionInputFormUid = data.config.sectionInputFormUid;
      config.pageSectionRelUid = data.config.pageSectionRelUid;
      config.compInputFormUid = data.config.compInputFormUid;
      config.btnImagePath = data.config.btnImagePath;
      config.btnImageProperty = data.config.btnImageProperty;
      config.divProperty = data.config.divProperty;
      config.isLayerPopup = data.config.isLayerPopup;
      config.topImagePath = data.config.topImagePath;
      config.topImageProperty = data.config.topImageProperty;
    }
  }
});
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    :title="sectionTitle"
    :width="config.isLayerPopup ? '960px' : '490px'"
    id="editorSectionInput"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="form" class="config-box">
        <div class="config-box-left">
          <div class="row">
            <div class="col">
              <SelectBox
                block
                required
                searchable
                label="입력폼"
                placeholder="선택"
                :validate="rules.select"
                :options="options.inputForm"
                @observe="optionCall('inputForm')"
                @blur="validation"
                v-model="config.compInputFormUid"
              />
            </div>
          </div>
          <div class="row pt-15">
            <div class="col">
              <ValidateWrap
                required
                label="버튼 이미지"
                :validate="rules.select"
                :check-value="config.btnImagePath"
              >
                <ImageSelector
                  icon-size="50"
                  width="444px"
                  height="60px"
                  @update:model-value="validation"
                  v-model="config.btnImagePath"
                />
              </ValidateWrap>
            </div>
          </div>
          <div class="row pt-15">
            <div class="col">
              <TextField
                block
                label="버튼 이미지 속성"
                placeholder="<img> 태그에 추가할 속성을 입력해 주세요. Ex) alt, id, class, style 등"
                @blur="validation"
                v-model="config.btnImageProperty"
              />
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
              레이어 모달 설정
            </div>
            <div class="col col-3">
              <SwitchButton
                :true-value="1"
                :false-value="0"
                :label="['설정안함', '설정']"
                @input="validation"
                v-model="config.isLayerPopup"
              />
            </div>
          </div>
        </div>

        <div class="config-box-right" v-if="config.isLayerPopup">
          <div class="row">
            <div class="col">
              <ValidateWrap
                required
                label="상단 이미지"
                :validate="rules.select"
                :check-value="config.topImagePath"
              >
                <ImageSelector
                  width="444px"
                  height="300px"
                  icon-size="100"
                  @update:model-value="validation"
                  v-model="config.topImagePath"
                />
              </ValidateWrap>
            </div>
          </div>
          <div class="row pt-15">
            <div class="col">
              <TextField
                block
                label="상단 이미지 속성"
                placeholder="<img> 태그에 추가할 속성을 입력해 주세요. Ex) alt, id, class, style 등"
                @blur="validation"
                v-model="config.topImageProperty"
              />
            </div>
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
