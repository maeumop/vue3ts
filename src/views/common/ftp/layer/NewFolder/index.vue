<script setup lang="ts">
import { ref, computed, inject, watch, getCurrentInstance } from 'vue';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import type { RuleFunc } from '@/components/types';
import type { PostFtpNameParam, PostFtpNameRes } from '@/types/api/webFtpApi';
import type { FtpContentsStoretype } from '@/store/modules/ftp/Contents';
import { useToast } from '@/js/helper/common';
import { apiErrorCode } from '@/message/apiResponse';
import { contentTitleRegExp } from '@/js/helper/ftp';
import { useWebFtpApi } from '@/api/modules/webFtpApi';
import Modal from '@/components/Modal/index.vue';
import type { ContentItem } from '@/types/store/modules/ftp';
import { CONTENT_TYPE } from '@/constants/store/modules/ftp';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';


type OnOpenOption = {
  path: string
};

const ftpApi = useWebFtpApi();

// emit
const emit = defineEmits<{
  // 신규 등록 완료 이벤트
  (event: 'on:createContent', value: ContentItem): void;
  (event: 'on:close'): void;
}>();

// store
const ftpContentsStore = inject('ftpContentsStore') as FtpContentsStoretype;

// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'|'$nextTick'>>();
const validateForm = ref<ValidateFormModel>();
  
// data()
const app = getCurrentInstance();
const modalId = `ftpNewFolderLayerPopup${app?.uid}`;


const { directory } = storeToRefs(ftpContentsStore);

// data
let isShow = ref<boolean>(false);
let loading = ref<boolean>(false);
type _RuleKey = 'default' | 'sameNames';
let _rule: { [K in _RuleKey]: RuleFunc } = {
  default: (v) =>
    (!!v && Array.isArray(v.match(contentTitleRegExp))) ||
    '영문, 숫자, 하이픈(-), 언더바(_)만 입력 가능합니다.',
  sameNames: (v: string) =>
    !getPathAllathNames.value.includes(v) ||
    '이미 등록된 폴더명이 존재합니다.',
};
let path = ref<string>('');

let folderName = ref<string>('');


type RuleKey = 'folderName';
const rule = ref<{ [K in RuleKey]?: RuleFunc[] }>({ folderName: [ _rule['default'], _rule['sameNames'] ] });

const getPathAllathNames = computed<string[]>(() => (directory.value).map(item => item.name));

const { Toast, defaultErrors } = useToast();

// methods
/**
 * FtpLayerNewFolder 활성
 * @author hjs0613
 * @returns
 */
const onOpen = (parmas: OnOpenOption): Promise<void> => {
  try {
    if (isShow.value) {
      throw new Error('새폴더 입력 중이십니다.');
    }

    path.value = parmas.path;
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

/**
 * 새폴더 생성버튼 클릭이벤트
 * 1. props.validate 체크
 * 2. EventPreventDom으로 외부 클릭이벤트 방지
 * @author hjs0608
 * @returns
 */
const onClickEvnt = async () => {
  if (validateForm.value?.validate()) {
    try {
      // 수행할 이벤트
      loading.value = true;
      validateForm.value?.formProtection(true);

      const req: PostFtpNameParam = { path: `${path.value}/${folderName.value}` };
      await ftpApi.postFtpName(req);

      const now: Date = new Date(Date.now());
      const date: string = [
        now.getFullYear(), (now.getMonth() + 1), now.getDate(), 
        now.getHours(), now.getMinutes(), now.getSeconds(), 
      ].reduce((v, d) => (v += `${d}`.padStart(2, '0')), '');

      const result: ContentItem = {
        name: folderName.value,
        'last-modified': date,
        size: 0,
        type: CONTENT_TYPE.DIR,
        path: path.value
      };
      emit('on:createContent', result);
      Toast('정상적으로 생성되었습니다.');
      onClose();
    } catch (err) {
      if (axios.isAxiosError<PostFtpNameRes, any>(err) && err.response) {
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
const onCloseModal = async () => {
  modalEL.value?.$nextTick(() => {
    isShow.value = false;
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
    folderName.value = '';
  }
}, { immediate: true });


defineExpose({
  onOpen,
  onClose
});


</script>
<script lang="ts">
export default { name: 'FtpLayerNewFolder' };
</script>
<template>
  <Modal
    access-back
    :id="modalId"
    ref="modalEL"
    class="ftpNewFolder"
    title="새폴더"
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
              label="폴더명"
              placeholder="폴더명을 입력해주세요."
              :max-length="20"
              :validate="rule['folderName']"
              v-model="folderName"
            />
          </div>
        </div>
        <div class="row mt-5">
          <div class="col">
            <ul class="info-box-bullet">
              <li>숫자, 영문자, 특수문자(_, -)만 입력 가능합니다.</li>
              <li>동일한 폴더명은 생성 할 수 없습니다.</li>
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
          @click="!loading && onClickEvnt()"
        >
          생성
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline :disabled="loading" @click="close()">
          닫기
        </StyledButton>
      </div>
    </template>
  </Modal>
</template>