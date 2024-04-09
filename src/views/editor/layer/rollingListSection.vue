<script setup lang="ts">
import { ref, reactive, computed, watch, inject } from 'vue';
import type { KeyIndex } from '@/types/common';
import type { RuleFunc } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ConstPageSectionTypeKeys } from '@/types/common';
import type { RollingListSectionConfig } from '@/types/api/smartEditorApi';
import { useEditorStore } from '@/store';
import { CONST_CODES } from '@/constants/common';
import type { ToastModel } from '@/components/Toast/types';
import type { ModalModel } from '@/components/Modal/types';

const { PAGE_SECTION_TYPE: { ROLLING_LIST } } = CONST_CODES;

const emit = defineEmits<{
  (event: 'close', flag: ConstPageSectionTypeKeys): void
}>();

const props = withDefaults(defineProps<{
  index?: number
}>(), {
  index: -1
});

const {
  setSection, getSection, updateSection,
  optionCall, options,
} = useEditorStore();

const Toast = inject('Toast') as ToastModel;
const modal = ref<ModalModel>();

let isShow = ref<boolean>(true);
let isPass = ref<boolean>(true);

const config = reactive<RollingListSectionConfig>({
  sectionRollingListUid: '',
  pageSectionRelUid: '',
  compRollingListGrpUid: '',
  divProperty: '',
  isLayerPopup: 0,
});

const rules: KeyIndex<RuleFunc[]> = {
  select: [v => !!v || '필수 선택 사항입니다.'],
};

watch(isShow, (v) => {
  if (!v) {
    emit('close', ROLLING_LIST.VAL);
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
      setSection(ROLLING_LIST.VAL, config);
    }

    close();
  }
};

const sectionTitle = computed<string>(() => '리스트 롤링 ' + (props.index > -1 ? '수정' : '등록'));

if (props.index > -1) {
  const data = getSection<RollingListSectionConfig>(props.index);

  if (!data) {
    Toast({ color: 'danger', message: '해당 섹션의 데이터가 없습니다!!!' });
    modal.value?.close();
  } else {
    isPass.value = false;

    config.sectionRollingListUid = data.config.sectionRollingListUid;
    config.pageSectionRelUid = data.config.pageSectionRelUid;
    config.compRollingListGrpUid = data.config.compRollingListGrpUid;
    config.divProperty = data.config.divProperty;
    config.isLayerPopup = data.config.isLayerPopup;
  }
}

optionCall('rollingList');
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    width="500px"
    :title="sectionTitle"
    id="editorSectionListRolling"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="form">
        <div class="row">
          <div class="col">
            <SelectBox
              block
              required
              searchable
              label="리스트 롤링 그룹명"
              placeholder="선택"
              :options="options.rollingList"
              :validate="rules.select"
              @blur="validation"
              @observe="optionCall('rollingList')"
              v-model="config.compRollingListGrpUid"
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
        <!-- <div class="row pt-15">
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
        </div> -->
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
