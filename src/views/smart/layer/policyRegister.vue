<script setup lang="ts">
import TiptapEditor from '@/components/TiptapEditor/index.vue';

import { ref, watch, inject } from 'vue';
import { useUtil } from '@/js/util';
import { v1 as uuid } from 'uuid';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type {
  TermsItem,
  PostTermsRes, PostTermsParam,
  PutTermsRes, PutTermsParam,
  GetLayoutsRes
} from '@/types/api/smartEditorApi';

import type { KeyIndex } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import { type OptionItem, type Rules } from '@/components/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const smartEditorApi = useSmartEditorApi();

const Toast = inject('Toast') as ToastModel;

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'on:create', value: TermsItem): void;
  (event: 'on:edit', value: TermsItem): void;
}>();

const props = defineProps<{
  index: number
  data?: TermsItem
}>();

// ======= 팝업 기본 설정 ====================
const modal = ref<ModalModel>();
let isShow = ref(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

const optLayout = ref<OptionItem[]>([]);
const tools = [
  ['size', 'color', 'mark'],
  ['bold', 'italic', 'underline', 'strike'],
  ['textAlign'],
  ['heading1', 'heading2', 'heading3', 'heading4', 'heading5'],
  ['blockquote', 'bulletlist', 'orderedlist'],
  ['image', 'link'],
  ['table'],
];

const isRegister = ref<boolean>(true);
const validateForm = ref<ValidateFormModel>();

let termsPageUid = ref<string>('');
let pageName = ref<string>('');
let pageCode = ref<string>('');
let layoutName = ref<string>('');
let layoutUid = ref<string>('');
let termsText = ref<string>('');

let layoutCodeName = ref<KeyIndex<string>>({});

const rules: Rules = {
  input: [v => !!v || '필수 입력 사항 입니다.'],
  edite: [v => !(!v || v === '<p></p>') || '필수 입력 사항 입니다.'],
};

let isPass = ref<boolean>(true);
const validation = (): void => {
  if (props.index > -1 && !isPass.value) {
    isPass.value = true;
  }
};

/**
 * 약관 등록
 */
const createPolicy = async (): Promise<void> => {
  const params: PostTermsParam = {
    termsPageUid: uuid(),
    layoutUid: layoutUid.value,
    pageName: pageName.value,
    termsText: termsText.value,
  };
  const { results }: PostTermsRes = await smartEditorApi.postTerms(params);
  const newData: TermsItem = {
    ...params,
    pageCode: results.pageCode,
    layoutName: layoutCodeName.value[layoutUid.value],
    regDatetime: Date.now(),
    modDatetime: Date.now(),
  };
  emit('on:create', newData);
  Toast('정상적으로 등록되었습니다.');
};


/**
 * 약관 수정
 */
const editPolicy = async (): Promise<void> => {
  const params: PutTermsParam = {
    layoutUid: layoutUid.value,
    pageName: pageName.value,
    termsText: termsText.value,
  };
  await smartEditorApi.putTerms(termsPageUid.value, params);
  const editData: TermsItem = {
    ...props.data!,
    ...params,
    layoutName: layoutCodeName.value[layoutUid.value],
  };
  emit('on:edit', editData);
  Toast('정상적으로 수정 되었습니다');
};


let loading = ref<boolean>(false);
/**
 * [ 등록|수정 ] 버튼 클릭이벤트 핸들러
 */
const onClickEvnt = async (): Promise<void> => {

  if (!validateForm.value!.validate()) {
    return;
  }

  try {
    loading.value = true;
    if (isRegister.value) {
      await createPolicy();
    } else {
      await editPolicy();
    }

  } catch (err) {
    util.axiosErrorCatch<PostTermsRes | PutTermsRes>(err);

  } finally {
    loading.value = false;
    modal.value!.close();
  }
};


/**
 * 등록|수정 여부 체크
 * 수정일때 데이터 넣어주기
 */
const modeCheck = (): void => {
  if (props.index > -1 && props.data) {
    // onChangeEvtCheck.value = false;
    isRegister.value = false;

    termsPageUid.value = props.data.termsPageUid;
    pageCode.value = props.data.pageCode;
    pageName.value = props.data.pageName;
    layoutName.value = props.data.layoutName;
    layoutUid.value = props.data.layoutUid;
    termsText.value = props.data.termsText;

    isPass.value = false;
  }
};

const layoutLoading = ref<boolean>(true);
/**
 * 레이아웃 목록 조회 API 호출
 */
const getLayouts = async (): Promise<void> => {
  try {
    const { results }: GetLayoutsRes = await smartEditorApi.getLayouts();
    results.layouts.forEach(item => {
      optLayout.value.push({ value: item.layoutUid, text: item.layoutName });
      layoutCodeName.value[item.layoutUid] = item.layoutName;
    });
    modeCheck();

  } catch (err) {
    util.axiosErrorCatch<GetLayoutsRes>(err);

  } finally {
    layoutLoading.value = false;
  }
};

getLayouts();
</script>

<template>
  <Modal
    ref="modal"
    width="1200px"
    :esc-close="!loading"
    :title="isRegister ? '약관 페이지 등록' : '약관 페이지 수정'"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="validateForm">
        <TextField
          block
          required
          label="페이지명"
          placeholder="페이지명을 입력해주세요."
          max-length="50"
          :validate="rules.input"
          @blur="validation()"
          v-model="pageName"
        />

        <SelectBox
          block
          required
          searchable
          label="레이아웃"
          placeholder="선택"
          class="mt-20"
          :options="optLayout"
          :is-loading="layoutLoading"
          :validate="rules.input"
          @blur="validation()"
          v-model="layoutUid"
        />

        <div class="mt-20 textField-label required">
          <label>약관 페이지 내용</label>
        </div>


        <ValidateWrap
          :validate="rules.edite"
          :check-value="termsText"
        >
          <TiptapEditor
            :height="`calc(100vh - 620px)`"
            :tools="tools"
            @blur="validation()"
            v-model="termsText"
          />
        </ValidateWrap>
      </ValidateForm>
    </template>

    <template #action="{ close }">
      <StyledButton
        outline
        class="mr-10"
        :disabled="loading"
        @click.prevent="close"
      >
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        :loading="loading"
        :disabled="!isPass"
        @click.prevent="onClickEvnt()"
      >
        {{ isRegister ? '등록' : '수정' }}
      </StyledButton>
    </template>
  </Modal>
</template>
