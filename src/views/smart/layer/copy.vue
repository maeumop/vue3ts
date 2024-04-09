<script setup lang="ts">
import { ref, watch, inject } from 'vue';

import { useCopy } from '@/js/helper/copy';

import type { Rules } from '@/components/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ToastModel } from '@/components/Toast/types';

import { COPY_MODE_VALUE } from '@/constants/smart';
import type { CopyPropsData, COPY_MODE_TYPE } from '@/types/smart';

const Toast = inject('Toast') as ToastModel;

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'copy', value: CopyPropsData): void;
}>();

const props = defineProps<{
  type: COPY_MODE_TYPE
  uid: string
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

const validateForm = ref<ValidateFormModel>();
const rules: Rules = {
  input: [v => !!v || '필수 입력 항목입니다.'],
};

let loading = ref<boolean>(false);
let name = ref<string>('');

const onCopy = async (): Promise<void> => {

  if (!validateForm.value!.validate()) {
    return;
  }

  try {
    loading.value = true;
    const propsData = {
      name: name.value,
      uid: props.uid,
    };
    await useCopy(props.type, propsData, (uid: string, code?: string) => {
      const emitData: CopyPropsData = { name: name.value, uid, };
      if (code) {
        emitData.code = code;
      }

      emit('copy', { ...emitData });
      Toast('정상적으로 복사되었습니다.');
      modal.value!.close();
    });

  } catch (err) {
    console.error(err);
    Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });

  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Modal
    ref="modal"
    width="380px"
    :esc-close="!loading"
    :title="`${COPY_MODE_VALUE[props.type]} 복사`"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="validateForm">
        <TextField
          block
          required
          :label="`${COPY_MODE_VALUE[props.type]}명`"
          :placeholder="`${COPY_MODE_VALUE[props.type]}명을 입력해주세요`"
          :validate="rules.input"
          @keydown.enter="onCopy"
          v-model="name"
        />
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
        @click="onCopy"
      >
        복사
      </StyledButton>
    </template>
  </Modal>
</template>
