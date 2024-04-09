<script setup lang="ts">
import CodeMirrorForm from '@/views/common/CodeMirrorForm/index.vue';

import { ref, watch, inject } from 'vue';
import { useUtil } from '@/js/util';
import { v1 as uuid } from 'uuid';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type {
  LayoutItem,
  PostLayoutsRes,
  PutLayoutsParam, PutLayoutsRes,
} from '@/types/api/smartEditorApi';

import type { Rules } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const smartEditorApi = useSmartEditorApi();

const Toast = inject('Toast') as ToastModel;

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'on:create', value: LayoutItem): void;
  (event: 'on:edit', value: LayoutItem): void;
}>();

const props = defineProps<{
  index: number
  data?: LayoutItem
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

const isRegister = ref<boolean>(true);
const validateForm = ref<ValidateFormModel>();

let layoutUid = ref<string>('');
let layoutName = ref<string>('');
let tagTitle = ref<string>('');
let tagDesc = ref<string>('');
let tagKeyword = ref<string>('');
let favicon = ref<string>('');
let tagHead = ref<string>('');
let tagBody = ref<string>('');

const rules: Rules = {
  input: [ v => !!v || '필수 입력 사항 입니다.' ],
};

let isPass = ref<boolean>(true);
const validation = (): void => {
  if (props.index > -1 && !isPass.value) {
    isPass.value = true;
  }
};

/**
 * 레이아웃 등록
 */
const createLayout = async (): Promise<void> => {
  const params: Omit<LayoutItem, 'regDatetime' | 'modDatetime'> = {
    layoutUid: uuid(),
    layoutName: layoutName.value,
    tagTitle: tagTitle.value,
    tagDesc: tagDesc.value,
    tagKeyword: tagKeyword.value,
    favicon: favicon.value,
    tagHead: tagHead.value,
    tagBody: tagBody.value,
  };
  await smartEditorApi.postLayouts(params);
  const newData: LayoutItem = {
    ...params,
    regDatetime: Date.now(),
    modDatetime: Date.now(),
  };
  emit('on:create', newData);
  Toast('정상적으로 등록되었습니다.');
  modal.value!.close();
};

/**
 * 레이아웃 수정
 */
const editLayout = async (): Promise<void> => {
  const params: PutLayoutsParam = {
    layoutName: layoutName.value,
    tagTitle: tagTitle.value,
    tagDesc: tagDesc.value,
    tagKeyword: tagKeyword.value,
    favicon: favicon.value,
    tagHead: tagHead.value,
    tagBody: tagBody.value,
  };
  layoutUid.value = props.data!.layoutUid;

  await smartEditorApi.putLayouts(layoutUid.value, params);

  emit('on:edit', { ...props.data!, ...params });
  Toast('정상적으로 수정되었습니다.');
  modal.value!.close();
};


let loading = ref<boolean>(false);
/**
 * [등록|수정] 버튼 클릭
 */
const onClickEvnt = async (): Promise<void> => {
  if (!validateForm.value!.validate()) {
    return;
  }

  try {
    loading.value = true;
    if (isRegister.value) {
      await createLayout();
    } else {
      await editLayout();
    }

  } catch (err) {
    util.axiosErrorCatch<PostLayoutsRes | PutLayoutsRes>(err);

  } finally {
    loading.value = false;
  }
};

const modeCheck = (): void => {
  if (props.index > -1 && props.data) {

    isRegister.value = false;
    layoutName.value = props.data.layoutName;
    tagTitle.value = props.data.tagTitle;
    tagDesc.value = props.data.tagDesc;
    tagKeyword.value = props.data.tagKeyword;
    favicon.value = props.data.favicon;
    tagHead.value = props.data.tagHead;
    tagBody.value = props.data.tagBody;

    isPass.value = false;
  }
};

modeCheck();
</script>

<template>
  <Modal
    ref="modal"
    width="800px"
    :esc-close="!loading"
    :title="isRegister ? '레이아웃 등록' : '레이아웃 수정'"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="validateForm">
        <TextField
          block
          required
          label="레이아웃명"
          placeholder="레이아웃명을 입력해주세요."
          :validate="rules.input"
          @blur="validation()"
          v-model="layoutName"
        />
        <TextField
          block
          required
          label="사이트 이름(title 태그)"
          placeholder="사이트 이름을 입력해주세요."
          class="mt-20"
          :validate="rules.input"
          @blur="validation()"
          v-model="tagTitle"
        />

        <TextField
          block
          label="사이트 설명 (Descritopn 메타태그)"
          placeholder="사이트 설명을 입력해주세요."
          class="mt-20"
          @blur="validation()"
          v-model="tagDesc"
        />
        <TextField
          block
          label="사이트 키워드 (keyword 메타태그)"
          placeholder="사이트 키워드를 입력해주세요.(여러 단어 입력시 (,)콤마로 구분하여 입력"
          class="mt-20"
          @blur="validation()"
          v-model="tagKeyword"
        />
        <TextField
          block
          label="파비콘"
          placeholder="이미지 사이즈 16px X 16px, 파일형식 .ico 형식의 파비콘 URL을 입력해 주세요."
          class="mt-20"
          @blur="validation()"
          v-model="favicon"
        />


        <CodeMirrorForm
          block
          hide-message
          class="mt-20"
          label="Head영역 (Head 태그)"
          placeholder="<head>태그에 삽입할 소스를 입력해 주세요."
          height="250"
          @blur="validation()"
          v-model="tagHead"
        />

        <CodeMirrorForm
          block
          required
          hide-message
          class="mt-20"
          height="250"
          label="Body영역 (body 태그)"
          placeholder="<body>태그에 삽입할 소스를 입력해 주세요."
          :validate="rules.input"
          @blur="validation()"
          v-model="tagBody"
        />
      </ValidateForm>


      <ul class="info-box-bullet my-10">
        <li v-if="!isRegister">
          레이아웃 수정 후 페이지 버전 업데이트를 통해 수정 내용을 반영해 주세요
        </li>
        <li>
          페이지 변환코드 <strong>{#=pageContent}</strong>는 'Body영역'에 필수로 삽입해주세요.
        </li>
      </ul>
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
        @click.prevent="onClickEvnt"
      >
        {{ isRegister ? '등록' : '수정' }}
      </StyledButton>
    </template>
  </Modal>
</template>
