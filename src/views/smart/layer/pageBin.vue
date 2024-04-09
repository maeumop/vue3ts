<script setup lang="ts">
import axios from 'axios';
import { computed, ref, watch, inject } from 'vue';
import { useSessionStore } from '@/store';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import { postPageToBinsMsg } from '@/constants/api/smartEditorApi';
import type { PostPageToBinsParam, PostPageToBinsRes } from '@/types/api/smartEditorApi';

import type { Rules } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';

const smartEditorApi = useSmartEditorApi();
const sessionStore = useSessionStore();
const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'deleted'): void;
}>();

const props = defineProps<{
  pageList: string[]
}>();

// 팝업 기본 설정 ====================
const modal = ref<ModalModel>();
let isShow = ref(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

let id = computed(() => sessionStore.getMemberEmail);
let password = ref<string>('');
let reasonNote = ref<string>('');

const validateForm = ref<ValidateFormModel>();
const rules: Rules = {
  input: [ v => !!v || '필수 입력 사항 입니다.' ],
};

const alertMessage = () => {
  MessageBox.alert({
    title: '삭제가 불가능합니다.',
    message: 'OFF 상태의 페이지 중 모바일, 백 페이지로 설정되지 않은 페이지만 삭제 가능합니다. 페이지 설정값을 확인해 주세요.',
    btnOkayText: '확인',
    okay: () => {
      modal.value?.close();
    }
  });
};

let loading = ref<boolean>(false);
const onClickBin = async (): Promise<void> => {
  if (!validateForm.value!.validate()) {
    return;
  }

  try {
    loading.value = true;
    validateForm.value?.formProtection();

    const params: PostPageToBinsParam = {
      pageUid: props.pageList,
      reason: reasonNote.value,
      password: password.value,
    };

    await smartEditorApi.postPageToBins(params);

    Toast(`${props.pageList.length}개의 페이지가 휴지통으로 이동하였습니다.`);
    emit('deleted');
    modal.value?.close();

  } catch (err) {
    if (axios.isAxiosError<PostPageToBinsRes, any>(err)) {
      const { response } = err;

      if (response) {
        const { code } = response.data;
        if (code === postPageToBinsMsg.BAD_REQUEST_UUID) {
          alertMessage();
        } else if (code === postPageToBinsMsg.INVALID_PASSWORD) {
          Toast({ color: 'warning', message: '비밀번호가 일치하지 않습니다.' });
        } else {
          Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });
        }
      }

    } else {
      console.error(err);
    }

  } finally {
    validateForm.value?.formProtection(false);
    loading.value = false;
  }
};
</script>

<template>
  <Modal
    ref="modal"
    title="페이지 삭제"
    width="520px"
    :esc-close="!loading"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="validateForm">
        <TextField
          block
          required
          disabled
          label="아이디"
          :placeholder="id"
          v-model="id"
        />

        <TextField
          block
          required
          label="비밀번호"
          type="password"
          class="mt-20"
          placeholder="비밀번호를 입력해주세요."
          :validate="rules.input"
          :max-length="16"
          v-model="password"
        />

        <TextField
          block
          required
          multiline
          is-counting
          class="mt-20"
          label="삭제사유"
          placeholder="삭제 사유를 입력해주세요. (200자 이내)"
          :validate="rules.input"
          :max-length="200"
          v-model="reasonNote"
        />
      </ValidateForm>

      <ul class="info-box-bullet mt-10">
        <li>
          ‘페이지 삭제’ 진행 시 [페이지 ▶ 휴지통] 화면으로 이동됩니다.
        </li>
      </ul>

      <div class="pt-10"></div>
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
        @click.prevent="onClickBin"
      >
        삭제
      </StyledButton>
    </template>
  </Modal>
</template>
