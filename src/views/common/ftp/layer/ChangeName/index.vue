<script setup lang="ts">
import {
  ref,
  watch,
  inject,
  computed,
  getCurrentInstance,
} from 'vue';
import { storeToRefs } from 'pinia';
import axios from 'axios';

import type { RuleFunc } from '@/components/types';

import type { PutFtpNameParam, PutFtpNameRes } from '@/types/api/webFtpApi';

import type { FtpContentsStoretype } from '@/store/modules/ftp/Contents';

import { useToast } from '@/js/helper/common';

import { contentTitleRegExp, getExtension } from '@/js/helper/ftp';
import { apiErrorCode } from '@/message/apiResponse';

import { useWebFtpApi } from '@/api/modules/webFtpApi';

import Modal from '@/components/Modal/index.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';


type OnOpenOption = {
  title: string
  path: string
};

const ftpApi = useWebFtpApi();

// props

// store
const ftpContentsStore = inject('ftpContentsStore') as FtpContentsStoretype;

// emit
const emit = defineEmits<{
  // 이름 변경 완료 이벤트
  (event: 'on:editContent', value: string): void
  (event: 'on:close'): void
}>();

// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'|'$nextTick'>>();
const validateForm = ref<ValidateFormModel>();
  
// data()
const app = getCurrentInstance();
const modalId = `ftpChangeNameLayerPopup${app?.uid}`;

const { list, directory } = storeToRefs(ftpContentsStore);

let isShow = ref<boolean>(false);
let disabled = ref<boolean>(true);
let loading = ref<boolean>(false);
type _RuleKey = 'default' | 'sameNames';
let _rule: { [K in _RuleKey]: RuleFunc } = {
  default: (v) =>
    (!!v && Array.isArray(v.match(contentTitleRegExp))) ||
    '영문, 숫자, 하이픈(-), 언더바(_)만 입력 가능합니다.',
  sameNames: (v: string) =>
    !getPathAllathNames.value.includes(`${v}${ext.value}`) ||
    '이미 등록된 폴더, 파일명이 존재합니다.',
};
let originalPath = ref<string>('');

let path = ref<string>('');
let ext = ref<string>('');

let contentName = ref<string>('');

type RuleKey = 'contentName';
const rule = ref<{ [K in RuleKey]?: RuleFunc[] }>({ contentName: [_rule['default'], _rule['sameNames'] ] });
const { Toast, defaultErrors } = useToast();

// computed
const extDesc = computed<string>(() => (ext.value ? '파일명' : '폴더명'));
const getPathAllathNames = computed<string[]>(() => (ext.value ? list.value : directory.value).map(item => item.name));

// methods
/**
 * FtpLayerChangeName 활성
 * @author hjs0613
 * @returns
 */
const onOpen = (parmas: OnOpenOption): Promise<void> => {
  try {
    if (isShow.value) {
      throw new Error('이름 변경 중이십니다.');
    }

    const { title } = parmas;
    if (!title) {
      throw new Error('변경할 이름이 없습니다.');
    }

    path.value = parmas.path;
    originalPath.value = `${parmas.path}/${title}`;

    ext.value = getExtension(title);
    contentName.value = title;
    if (ext.value) {
      contentName.value = title.substring(0, title.indexOf(ext.value));
    }

    isShow.value = true;
  } catch (error) {
    let err: Error = new Error('고객센터에 문의를 남겨주세요.');
    if (error instanceof Error) {
      err = error;
    }

    return Promise.reject(err);
  }


  return  Promise.resolve();
};

/**
 * Modal 컴포넌트의 update:modelValue 이벤트 핸들러
 * Modal 컴포넌트의 close 함수 수행시 발생하는 이벤트를 캐치하여 모달을 종료를 수행합니다.
 * @author hjs0613
 * @returns
 */
const onClose = (): void => {
  modalEL.value?.close();
};

const validation = (): void => {
  disabled.value && (disabled.value = false);
};

/**
 * 이름변경 변경버튼 클릭이벤트
 * 1. props.validate 체크
 * 2. EventPreventDom으로 외부 클릭이벤트 방지
 * @author hjs0608
 * @returns
 */
const onClickEvnt = async () => {
  if (!disabled.value && validateForm.value?.validate()) {
    try {
      // 수행할 이벤트
      loading.value = true;
      validateForm.value?.formProtection(true);

      const req: PutFtpNameParam = { path: originalPath.value, rename: `${path.value}/${contentName.value}${ext.value}` };
      await ftpApi.putFtpName(req);
      emit('on:editContent', contentName.value);
      Toast('정상적으로 변경되었습니다.');
      onClose();
    } catch (err) {
      if (axios.isAxiosError<PutFtpNameRes, any>(err) && err.response) {
        const { code } = err.response.data;
        switch (code) {
          case apiErrorCode.FTP_NAME_ALREADY_EXIST: {
            Toast({
              color: 'warning',
              message: '동일한 폴더명 존재 시 생성이 불가능합니다.',
            });
          } return;
          case apiErrorCode.FTP_DIRECTORY_ERROR: case apiErrorCode.FTP_RESOURCE_NOT_FOUND: {
            // 디렉로리 문제 또는 디렉토리 존재가 없을시, root 포인트로 이동
            defaultErrors();
            onClose();
            ftpContentsStore.setIsForceReload();
          } break;
        }
      }
      console.error(err);
    // defaultErrors();
    } finally {
      validateForm.value?.formProtection(false);
      loading.value = false;
    }
  }
};

/**
 * Modal 컴포넌트의 update:modelValue 이벤트 핸들러
 * Modal 컴포넌트의 close 함수 수행시 발생하는 이벤트를 캐치하여 모달을 종료를 수행합니다.
 * @author hjs0608
 * @returns
 */
const onCloseModal = (): void => {
  modalEL.value?.$nextTick(() => {
    isShow.value = false;
    disabled.value = true;
    emit('on:close');
  });
};

// watch
/**
 * 모달의 활성화 여부에따라 초가화 작업을 수행.
 * @author hjs0613
 * @returns
 */
watch(() => isShow.value, () => {
  if (!isShow.value) {
    path.value = '';
    originalPath.value = '';
    contentName.value = '';
  }
}, { immediate: true });


defineExpose({
  onOpen,
  onClose,
});
</script>
<script lang="ts">
export default { name: 'FtpLayerChangeName' };
</script>
<template>
  <Modal
    access-back
    ref="modalEL"
    :id="modalId"
    class="ftpChangeName"
    title="이름 변경"
    :esc-close="!loading"
    :model-value="isShow"
    @update:model-value="onCloseModal"
  >
    <template #body>
      <ValidateForm ref="validateForm" v-if="isShow">
        <div class="row">
          <div class="col">
            <TextField
              block
              required
              :label="`${extDesc}`"
              :placeholder="`${extDesc.josaFormat()} 입력해주세요.`"
              :max-length="20"
              :validate="rule['contentName']"
              @blur="validation"
              v-model="contentName"
            />
          </div>
        </div>
        <div class="row mt-5">
          <div class="col">
            <ul class="info-box-bullet">
              <li>숫자, 영문자, 특수문자(_, -)만 입력 가능합니다.</li>
              <li>동일한 폴더,파일명으로 변경 할 수 없습니다.</li>
            </ul>
          </div>
        </div>
      </ValidateForm>
    </template>
    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
          color="primary"
          :loading="loading"
          :disabled="disabled"
          @click="!loading && onClickEvnt()"
        >
          변경
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline :disabled="loading" @click="close">
          닫기
        </StyledButton>
      </div>
    </template>
  </Modal>
</template>