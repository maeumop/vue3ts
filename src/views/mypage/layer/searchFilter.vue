<script setup lang="ts">
import { ref, watch } from 'vue';
import { CONST_CODES } from '@/constants/common';
import type { OptionItem } from '@/components/types';
import type { ModalModel } from '@/components/Modal/types';

const { CLIENT_ACCOUNT_STATUS } = CONST_CODES;

const props = defineProps<{
  accountStatus: string;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'on:accept', value: string): void;
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

let selectAccountStatus = ref<string>('');
const optAccountStatus: OptionItem[] = [
  { text: '전체', value: '' },
  { text: CLIENT_ACCOUNT_STATUS.PENDING.TXT, value: CLIENT_ACCOUNT_STATUS.PENDING.VAL },
  { text: CLIENT_ACCOUNT_STATUS.LIVE.TXT, value: CLIENT_ACCOUNT_STATUS.LIVE.VAL },
  { text: CLIENT_ACCOUNT_STATUS.END.TXT, value: CLIENT_ACCOUNT_STATUS.END.VAL },
];

if (props.accountStatus) {
  selectAccountStatus.value = props.accountStatus;
}

const onAccept = (): void => {
  emit('on:accept', selectAccountStatus.value );
  modal.value!.close();
};
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    title="검색 상세 설정"
    width="520px"
    v-model="isShow"
  >
    <template #body>
      <div class="textField-label">
        <label>상태</label>
      </div>
      <div class="row mt-10">
        <CheckButton
          type="radio"
          color="primary"
          name="select"
          :items="optAccountStatus"
          v-model="selectAccountStatus"
        />
      </div>

      <div class="pt-10"></div>
    </template>

    <template #action="{ close }">
      <StyledButton outline class="mr-10" @click="close">
        닫기
      </StyledButton>
      <StyledButton color="primary" @click.prevent="onAccept">
        적용
      </StyledButton>
    </template>
  </Modal>
</template>
