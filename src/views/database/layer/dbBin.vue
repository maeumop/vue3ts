<script setup lang="ts">
import axios from 'axios';
import { onMounted, computed, ref, watch, inject } from 'vue';
import { useSessionStore } from '@/store';
import { useUtil } from '@/js/util';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type {
  PostBinsPwCheckRes,
  DeleteDbsRes,
  DeleteDbsParam,
  DeleteDbsParamMember,
} from '@/types/api/databaseApi';
import { postBinsPwCheckMsg } from '@/constants/api/databaseApi';

import type { Rules } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const databaseApi = useDatabaseApi();
const sessionStore = useSessionStore();

const Toast = inject('Toast') as ToastModel;

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'deleted', value: string[]): void;
}>();

const props = defineProps<{
  count: number;
  selectedDataList: string[]
}>();

// 팝업 기본 설정 ====================
let isShow = ref(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

const modal = ref<ModalModel>();

const validateForm = ref<ValidateFormModel>();
const rules: Rules = {
  input: [ v => !!v || '필수 입력 사항 입니다.' ],
};

let id = computed(() => sessionStore.getMemberEmail);
let password = ref<string>('');
let reasonNote = ref<string>('');

let successList: string[] = [];
let waitingCount: number = 0;

let loading = ref<boolean>(false);

const done = (uid?: string) => {
  waitingCount--;

  if (uid) {
    successList.push(uid);
  }

  if (!waitingCount) {
    validateForm.value?.formProtection(false);
    if (props.count === successList.length) {
      Toast(`${props.count}개의 DB가 휴지통으로 이동하였습니다.`);
    } else {
      Toast({
        color: 'warning',
        message: `${props.count - successList.length}개의 DB가 휴지통으로 이동 실패하였습니다.`
      });
    }

    emit('deleted', successList);
    emit('close');
  }
};

const toBin = () => {
  for (let i = 0; i < props.count; i++ ) {
    const uid = props.selectedDataList[i];
    const member: DeleteDbsParamMember = {
      memberEmail: id.value,
      password: password.value,
      reasonNote: reasonNote.value,
      reason: 'DELETE'
    };
    const param: DeleteDbsParam = { member, dbs: [uid] };

    databaseApi.deleteDbs(param)
      .then(() => {
        done(uid)
      })
      .catch((err) => {
        console.error(err);
        done();
      });
  }
}

const pwCheck = async () => {
  try {
    await databaseApi.postBinsPwCheck({
      memberEmail: id.value,
      password: password.value,
    });
    toBin();

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

        loading.value = false;
        validateForm.value?.formProtection(false);
      }
    } else {
      console.error(err);
    }
  }
}

const onClickBin = () => {
  if (!validateForm.value!.validate()) {
    return;
  }

  validateForm.value?.formProtection();
  loading.value = true;
  pwCheck();
};

onMounted(() => {
  waitingCount = props.count;
});
</script>

<template>
  <Modal
    ref="modal"
    title="선택 DB 삭제"
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

        <ul class="info-box-bullet mt-10">
          <li>
            ‘선택 DB 삭제’ 진행 시 [고객 DB 관리 ▶ 휴지통] 화면으로 이동됩니다.
          </li>
        </ul>

        <div class="pt-10"></div>
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
        @click.prevent="onClickBin"
      >
        삭제
      </StyledButton>
    </template>
  </Modal>
</template>
