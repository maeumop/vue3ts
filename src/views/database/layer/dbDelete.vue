<script setup lang="ts">
import axios from 'axios';
import { ref, watch, inject } from 'vue';
import { useSessionStore } from '@/store/index';
import { useUtil } from '@/js/util';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type { PostBinsPwCheckRes, DeleteBinsRes } from '@/types/api/databaseApi';
import { postBinsPwCheckMsg } from '@/constants/api/databaseApi';

import type { Rules } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const databaseApi = useDatabaseApi();
const sessionStore = useSessionStore();

const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'deleted', count: number): void;
}>();

const props = defineProps<{
  checkList: string[]
}>();

// 팝업 기본 설정 ====================
let isShow = ref<boolean>(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

const modal = ref<ModalModel>();
let count = props.checkList.length;

let id = sessionStore.getMemberEmail;
let password = ref<string>('');

const validateForm = ref<ValidateFormModel>();
const rules: Rules = {
  input: [ v => !!v || '필수 입력 사항 입니다.' ],
};

let loading = ref<boolean>(false);

const setDelete = async (): Promise<void> => {
  try {
    validateForm.value?.formProtection(true);
    await databaseApi.deleteBins({
      memberEmail: id,
      dbUids: props.checkList
    });

    Toast(`${count}개의 DB가 영구 삭제되었습니다.`);
    emit('deleted', count);
    modal.value!.close();

  } catch (err) {
    util.axiosErrorCatch<DeleteBinsRes>(err);

  } finally {
    validateForm.value?.formProtection(false);
  }
};

const showMessageBox = () => {
  MessageBox.confirm({
    title: `${count}개의 고객 DB를 영구 삭제하시겠습니까?`,
    message: '[영구 삭제 처리하기] 버튼 클릭 시 선택하신 고객 DB는 영구 삭제되며 복구가 불가능합니다.',
    btnOkayText: '영구 삭제 처리하기',
    btnCancelText: '영구 삭제 취소하기',
    enterOkay: false,
    escCancel: false,
    asyncOkay: async (): Promise<void> => {
      await setDelete();
    },
    cancel: () => {
      modal.value!.close();
    },
  });
};

/**
 * 영구 삭제 버튼 클릭 > 비밀번호 체크
 */
const onClickDelete = async (): Promise<void> => {
  if (!validateForm.value!.validate()) {
    return;
  }

  try {
    loading.value = true;
    validateForm.value?.formProtection(true);
    await databaseApi.postBinsPwCheck({
      memberEmail: id,
      password: password.value,
    });
    showMessageBox();

  } catch (err) {
    if (axios.isAxiosError<PostBinsPwCheckRes, any>(err)) {
      const { response } = err;
      if (response) {
        const { code } = response.data;
        if (code === postBinsPwCheckMsg.BAD_REQUEST_BODY || code === postBinsPwCheckMsg.INVALID_PASSWORD) {
          Toast({ color: 'warning', message: '비밀번호가 일치하지 않습니다.' });
        } else {
          Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });
        }
      }
    } else {
      console.error(err);
    }

  } finally {
    loading.value = false;
    validateForm.value?.formProtection(false);
  }
};
</script>

<template>
  <Modal
    ref="modal"
    title="영구 삭제"
    width="520px"
    :esc-close="!loading"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="validateForm">
        <div class="font-lg">
          선택 DB 수 <span class="text-red">{{ count }}</span>개
        </div>

        <TextField
          block
          required
          readonly
          label="아이디"
          class="mt-20"
          v-model="id"
        />

        <TextField
          block
          required
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력해주세요."
          class="mt-20"
          :max-length="16"
          :validate="rules.input"
          @keydown.enter="onClickDelete"
          v-model="password"
        />
        <div class="pt-10"></div>
      </ValidateForm>
    </template>

    <template #action="{ close }">
      <StyledButton
        outline
        class="mr-10"
        :disabled="loading"
        @click="close"
      >
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        :loading="loading"
        @click.prevent="onClickDelete"
      >
        삭제
      </StyledButton>
    </template>
  </Modal>
</template>