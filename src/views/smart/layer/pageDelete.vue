<script setup lang="ts">
import axios from 'axios';
import { ref, watch, inject, computed } from 'vue';
import { useUtil } from '@/js/util';
import { useSessionStore } from '@/store';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type { PostBinsPwCheckRes } from '@/types/api/databaseApi';
import { postBinsPwCheckMsg } from '@/constants/api/databaseApi';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type { DeletePageBinsParam, DeletePageBinsRes } from '@/types/api/smartEditorApi';

import type { Rules } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;

const sessionStore = useSessionStore();
const databaseApi = useDatabaseApi();
const smartEditorApi = useSmartEditorApi();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'deleted'): void;
}>();

const props = defineProps<{
  checkList: string[]
}>();

// 팝업 기본 설정 ====================
const modal = ref<ModalModel>();
let isShow = ref<boolean>(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

const validateForm = ref<ValidateFormModel>();
const rules: Rules = {
  input: [ v => !!v || '필수 입력 사항 입니다.' ],
};

let count = ref<number>(0);
count.value = props.checkList.length;

let id = computed(() => sessionStore.getMemberEmail);
let password = ref<string>('');

let loading = ref<boolean>(false);
const pageDelete = async (): Promise<void> => {
  try {
    validateForm.value?.formProtection(true);

    const param: DeletePageBinsParam = {
      password: password.value,
      pageBinUids: [...props.checkList]
    };

    await smartEditorApi.deletePageBins(param);
    Toast(`${count.value}개의 페이지가 영구 삭제되었습니다.`);
    modal.value!.close();
    emit('deleted');


  } catch (err) {
    util.axiosErrorCatch<DeletePageBinsRes>(err);
  } finally {
    validateForm.value?.formProtection(false);
  }
};


const showMessageBox = () => {
  MessageBox.confirm({
    title: `${count.value}개의 페이지를 영구 삭제하시겠습니까?`,
    message: '[영구 삭제 처리하기] 버튼 클릭 시 선택하신 페이지는 영구 삭제되며 복구가 불가능합니다.',
    btnOkayText: '영구 삭제 처리하기',
    btnCancelText: '영구 삭제 취소하기',
    enterOkay: false,
    escCancel: false,
    asyncOkay: async (): Promise<void> => {
      await pageDelete();
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
      memberEmail: id.value,
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
    title="페이지 영구 삭제"
    width="520px"
    :esc-close="!loading"
    v-model="isShow"
  >
    <template #body>
      <div class="font-lg">
        선택 페이지 수 <span class="text-red">{{ count }}</span>개
      </div>

      <TextField
        block
        required
        readonly
        label="아이디"
        class="mt-20"
        v-model="id"
      />

      <ValidateForm ref="validateForm">
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
      </ValidateForm>
      <div class="pt-10"></div>
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
