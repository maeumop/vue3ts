<script setup lang="ts">
import { ref, watch, onMounted, reactive } from 'vue';
import { v1 as uuid } from 'uuid';
import { postTemplatesMsg, putTemplatesMsg, } from '@/constants/api/myAppapi';
import { useMyAppApi } from '@/api/modules/myAppApi';
import { useUtil } from '@/js/util';
import CodeMirrorForm from '@/views/common/CodeMirrorForm/index.vue';
import type { KeyIndex, OptionItem, Rules } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ModalModel } from '@/components/Modal/types';
import type { PostTemplatesRes, PutTemplatesRes, TemplateItem } from '@/types/api/myAppApi';

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'modify', params: KeyIndex<string>): void
  (event: 'update', params: KeyIndex<string>): void
}>();

const props = defineProps<{
  layoutList: OptionItem[]
  data?: TemplateItem
}>();

const util = useUtil();
const myAppApi = useMyAppApi();


// ==================== 팝업 기본 설정 ====================
const modal = ref<ModalModel>();

let isShow = ref<boolean>(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// ==================== END - 팝업 기본 설정 ====================


// ==================== Form Validation =====================
const form = ref<ValidateFormModel>();
let isPass = ref<boolean>(false);

const validation = (): void => {
  isPass.value = form.value!.validate(true);
};

const rules: Rules = {
  input: [v => !!v || '필수 입력 사항 입니다.'],
  select: [v => !!v || '미리보기 페이지에 적용되는 레이아웃입니다.'],
};
// ==================== END Form Validation =====================


// ==================== 템플릿 등록, 수정 =======================
let params = reactive<KeyIndex<string>>({
  templateName: '',
  templateUid: '',
  sourceCode: '',
  layoutUid: '',
});

let isProcessing = ref<boolean>(false);
/**
 * 템플릿 등록
 */
const addTemplate = async (): Promise<void> => {
  if (form.value?.validate()) {
    try {
      isProcessing.value = true;

      let templateUid = uuid();
      const { code } = await myAppApi.postTemplates({
        templateUid: templateUid,
        layoutUid: params.layoutUid,
        templateName: params.templateName,
        sourceCode: params.sourceCode
      });

      if (code === postTemplatesMsg.TEMPLATE_INSERT_SUCCESS) {
        params.templateUid = templateUid;
        emit('update', params);
      }

    } catch (err) {
      util.axiosErrorCatch<PostTemplatesRes>(err);

    } finally {
      isProcessing.value = false;
      modal.value!.close();
    }
  }
};

/**
 * 템플릿 수정
 */
const modifyTemplate = async (): Promise<void> => {
  try {
    isProcessing.value = true;

    const { code } = await myAppApi.putTemplates(params.templateUid, {
      layoutUid: params.layoutUid,
      templateName: params.templateName,
      sourceCode: params.sourceCode
    });

    if (code === putTemplatesMsg.TEMPLATE_UPDATE_SUCCESS) {
      emit('update', params);
    }

  } catch (err) {
    util.axiosErrorCatch<PutTemplatesRes>(err);

  } finally {
    isProcessing.value = false;
    modal.value!.close();
  }
};
// ==================== END 템플릿 등록, 수정 =======================


onMounted(() => {
  if (props.data) {
    params.templateName = props.data.templateName;
    params.layoutUid = props.data.layoutUid;
    params.sourceCode = props.data.sourceCode;
    params.templateUid = props.data.templateUid;
  }
});
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    width="800px"
    :title="props.data?.templateUid ? '템플릿 수정' : '템플릿 등록'"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="form">
        <TextField
          block
          required
          label="템플릿명"
          placeholder="템플릿명을 입력해주세요."
          class="mb-20"
          :validate="rules.input"
          @blur="validation"
          v-model="params.templateName"
        />

        <SelectBox
          block
          required
          label="레이아웃"
          placeholder="선택"
          class="mb-20"
          :validate="rules.select"
          :options="props.layoutList"
          @blur="validation"
          v-model="params.layoutUid"
        />

        <CodeMirrorForm
          block
          required
          hide-message
          label="템플릿 소스"
          placeholder="템플릿 소스를 입력해 주세요."
          height="320"
          :validate="rules.input"
          @blur="validation"
          v-model="params.sourceCode"
        />
      </ValidateForm>
    </template>

    <template #action="{ close }">
      <StyledButton
        outline
        class="mr-10"
        @click="close"
      >
        취소
      </StyledButton>

      <StyledButton
        color="primary"
        :loading="isProcessing"
        @click.prevent="addTemplate"
        v-if="!props.data?.templateUid"
      >
        등록
      </StyledButton>
      <StyledButton
        color="primary"
        :disabled="!isPass"
        :loading="isProcessing"
        @click.prevent="modifyTemplate"
        v-else
      >
        수정
      </StyledButton>
    </template>
  </Modal>
</template>