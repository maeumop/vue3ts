<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useClientStore } from '@/store';

import { CONST_CODES } from '@/constants/common';
import type { ConstBinKeys, ConstApiSendStatusKeys } from '@/types/common';

import type { OptionItem, KeyIndex } from '@/components/types';
import type { ModalModel } from '@/components/Modal/types';

const clientStore = useClientStore();
const { getClientAccount } = storeToRefs(clientStore);

const { BIN, AUTH, DB_SEND_STATUS } = CONST_CODES;

const props = withDefaults(defineProps<{
  type: string;
  status?: ConstApiSendStatusKeys| string;
  send?: string;
  reason?: ConstBinKeys | string;
}>(), {
  type: '',
  status: '',
  send: '',
  reason: '',
});

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'update', value: KeyIndex<string>): void;
  (event: 'on:binUpdate', value: ConstBinKeys | string): void;
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

const optStatus: OptionItem[] = [
  { text: '전체', value: '' },
  { text: '유효DB', value: '0' },
  { text: '휴지통', value: '1' },
];

const optApiSend: OptionItem[] = [
  { text: '전체', value: '' },
  { text: DB_SEND_STATUS.SUCCESS.TXT, value: DB_SEND_STATUS.SUCCESS.VAL },
  { text: DB_SEND_STATUS.FAIL.TXT, value: DB_SEND_STATUS.FAIL.VAL },
  { text: DB_SEND_STATUS.NONE.TXT, value: DB_SEND_STATUS.NONE.VAL },
];

const optBin: OptionItem[] = [
  { text: '전체', value: '' },
  { text: BIN.PHONE.TXT, value: BIN.PHONE.VAL },
  { text: BIN.MEDIA.TXT, value: BIN.MEDIA.VAL },
  { text: BIN.DUPLICATION.TXT, value: BIN.DUPLICATION.VAL },
  { text: BIN.BLOCK.TXT, value: BIN.BLOCK.VAL },
  { text: BIN.WORD.TXT, value: BIN.WORD.VAL },
  { text: BIN.DELETE.TXT, value: BIN.DELETE.VAL },
];


let newStatus = ref<ConstApiSendStatusKeys | string>('');
let newSend = ref<string>('');
let newReason = ref<ConstBinKeys | string>('');


const onUpdate = (): void => {
  if (props.type === 'BIN') {
    emit('on:binUpdate', newReason.value);

  } else {
    const filterData: KeyIndex<string> = {
      status: newStatus.value,
      send: newSend.value,
    };
    emit('update', filterData);
  }
  modal.value!.close();
};

onMounted(() => {
  newStatus.value = props.status;
  newSend.value = props.send;
  newReason.value = props.reason;
});
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
      <template v-if="type === 'BIN'">
        <div class="textField-label">
          <label>사유</label>
        </div>
        <div class="row mt-10">
          <CheckButton
            type="radio"
            color="primary"
            name="select"
            :items="optBin"
            v-model="newReason"
          />
        </div>
      </template>

      <template v-else>
        <div class="textField-label">
          <label>구분</label>
        </div>
        <div class="row mt-10">
          <CheckButton
            type="radio"
            color="primary"
            name="select"
            :items="optStatus"
            v-model="newStatus"
          />
        </div>

        <template v-if="getClientAccount.authLevel !== AUTH.MEDIA.VAL">
          <div class="textField-label mt-20">
            <label>전송 결과</label>
          </div>
          <div class="row mt-10">
            <CheckButton
              type="radio"
              color="primary"
              name="api"
              :items="optApiSend"
              v-model="newSend"
            />
          </div>
        </template>

      </template>
      <div class="pt-10"></div>
    </template>

    <template #action="{ close }">
      <StyledButton outline class="mr-10" @click="close">
        닫기
      </StyledButton>
      <StyledButton color="primary" @click.prevent="onUpdate">
        적용
      </StyledButton>
    </template>
  </Modal>
</template>
