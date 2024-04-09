<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import type { ConstPageSectionTypeKeys, KeyIndex } from '@/types/common';
import type { RuleFunc } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { CommentSectionConfig } from '@/types/api/smartEditorApi';
import { CONST_CODES } from '@/constants/common';
import { useEditorStore } from '@/store/modules/smartEditor';

const { PAGE_SECTION_TYPE: { COMMENT } } = CONST_CODES;

const emit = defineEmits<{
  (event: 'close', flag: ConstPageSectionTypeKeys): void
}>();

const props = withDefaults(defineProps<{
  index?: number
}>(), {
  index: -1
});

const {
  updateSection,
  setSection,
  getSection,
  optionCall,
  options,
} = useEditorStore();

let isShow = ref<boolean>(true);
let isPass = ref<boolean>(true);

const config = reactive<CommentSectionConfig>({
  sectionCommentUid: '',
  pageSectionRelUid: '',
  compCommentGrpUid: '',
  divProperty: '',
  isLayerPopup: 0,
});

const rules: KeyIndex<RuleFunc[]> = {
  select: [v => !!v || '필수 선택 사항입니다.'],
};

watch(isShow, (v) => {
  if (!v) {
    emit('close', COMMENT.VAL);
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
      setSection(COMMENT.VAL, config);
    }

    close();
  }
};

const sectionTitle = computed<string>(() => '댓글 ' + (props.index > -1 ? '수정' : '등록'));

if (props.index > -1) {
  const data = getSection<CommentSectionConfig>(props.index);

  if (!data) {
    throw new Error('해당 섹션의 데이터가 없습니다!!!');
  } else {
    isPass.value = false;

    config.sectionCommentUid = data.config.sectionCommentUid;
    config.pageSectionRelUid = data.config.pageSectionRelUid;
    config.compCommentGrpUid = data.config.compCommentGrpUid;
    config.divProperty = data.config.divProperty;
    config.isLayerPopup = data.config.isLayerPopup;
  }
}
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    width="500px"
    :title="sectionTitle"
    id="editorSectionComment"
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
              label="댓글 그룹명"
              placeholder="선택"
              :options="options.comment"
              :validate="rules.select"
              @blur="validation"
              @observe="optionCall('comment')"
              v-model="config.compCommentGrpUid"
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
