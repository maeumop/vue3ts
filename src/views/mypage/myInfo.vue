<script setup lang="ts">
import { ref, computed, inject, watch, onUnmounted } from 'vue';
import { useUtil } from '@/js/util';
import { useSessionStore } from '@/store';

import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import type {
  GetMembersAdRes,
  PatchMembersAdParam, PatchMembersAdRes,
  PatchMembersPwParam, PatchMembersPwRes
} from '@/types/api/memberAccountApi';

import { booleanYN } from '@/constants/common';
import type { BooleanYN } from '@/types/common';

import type { SpinnerModel } from '@/components/Spinner/types';
import { type Rules } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();

const { getLoginAccount } = useSessionStore();
const memberApi = useMemberAccountApi();

const MessageBox = inject('MessageBox') as MessageBoxModel;
const Spinner = inject('Spinner') as SpinnerModel;
const Toast = inject('Toast') as ToastModel;

const getMessage = (flag: 'title' | 'message' | 'btnOkayText'): string => {
  if (agreeCheck.value[agreeCheck.value.length - 1] === booleanYN.Y) {
    const messageList = {
      title: '정보 수신에 동의하시겠습니까?',
      message: '[정보 수신 동의] 버튼 클릭 시 정보 수신 동의 정보가 동의함으로 변경됩니다',
      btnOkayText: '정보 수신 동의',
    };
    return messageList[flag];
  } else {
    const messageList = {
      title: '정보 수신 동의를 철회하시겠습니까?',
      message: '[정보 수신 동의 철회] 버튼 클릭 시 정보 수신 동의 정보가 동의안함으로 변경됩니다',
      btnOkayText: '정보 수신 동의 철회',
    };
    return messageList[flag];
  }
};

let currentPassword = ref('');
let password = ref('');
let password2 = ref('');

let agreeCheck = ref<(BooleanYN | null)[]>([null]);
let agreeItem = ref<{text: string,  value: BooleanYN}[]>([{ text: '이벤트, 안내, 광고 메일 및 SMS 등 수신',  value: booleanYN.Y }]);
let agreeAdDatetime = ref<number>(0);
let agreeYN = ref<BooleanYN>(booleanYN.N);

const passwordPattern: [RegExp, string] = [
  util.getRegExp('password'),
  '10~16자(영문, 숫자, 특수문자 조합)로 입력해주세요.',
];

const validateForm = ref<ValidateFormModel>();

const rules: Rules = {
  password: [
    (v) => !(v !== password.value) || '비밀번호가 일치하지 않습니다.',
  ],
};

let inputPass = ref<boolean>(false);
const validation = (): void => {
  try {
    inputPass.value = validateForm.value!.validate(true);
  } catch (e) {
    console.error(e);
  }
};
const isDisabled = computed((): boolean => {
  return !(inputPass.value && password.value === password2.value);
});

/**
 * 비밀번호 변경
 */
const onSave = async (): Promise<void> => {
  Spinner.delay(0).show('Loading…');
  try {
    const param: PatchMembersPwParam = {
      password: currentPassword.value,
      newPassword: password.value
    };
    await memberApi.patchMembersPw(param);
    Toast('정상적으로 변경 되었습니다.');
    currentPassword.value = '';
    password.value = '';
    password2.value = '';

  } catch (err) {
    util.axiosErrorCatch<PatchMembersPwRes>(err);

  } finally {
    Spinner.close();
  }
};

/**
 * 정보 수신내역 동의 여부 저장 API 호출
 */
const setADSave = async (): Promise<void> => {
  try {
    const param: PatchMembersAdParam = {
      memberEmail: getLoginAccount.memberEmail,
      isAgreeAd: agreeCheck.value[agreeCheck.value.length - 1] ? booleanYN.Y : booleanYN.N
    };
    await memberApi.patchMembersAd(param);
    Toast('정상적으로 변경 되었습니다.');
    agreeYN.value = agreeCheck.value[agreeCheck.value.length - 1] ? booleanYN.Y : booleanYN.N;
    agreeAdDatetime.value = Date.now();

  } catch (err) {
    util.axiosErrorCatch<PatchMembersAdRes>(err);

  } finally {
    validateForm.value?.formProtection(false);
  }
};

/**
 * 정보 수신내역 동의 여부 수정
 */
const agreeChange = (): void => {
  MessageBox.confirm({
    title: getMessage('title'),
    message: getMessage('message'),
    btnOkayText: getMessage('btnOkayText'),
    btnCancelText: '취소하기',
    asyncOkay: async (): Promise<void> => {
      await setADSave();
    },
    cancel: () => {
      if (agreeCheck.value[agreeCheck.value.length - 1] === null) {
        agreeCheck.value.push(booleanYN.Y);

      } else {
        agreeCheck.value[agreeCheck.value.length - 1] = agreeCheck.value[agreeCheck.value.length - 1] ? null : booleanYN.Y;
      }
    }
  });
};

watch(() => agreeCheck.value, () => {
  agreeChange();
});

/**
 * 정보 수신내역 데이터
 */
const getData = async (): Promise<void> => {
  try {
    validateForm.value?.formProtection(true);
    const { results }: GetMembersAdRes = await memberApi.getMembersAd();
    agreeAdDatetime.value = results.agreeAdDatetime;
    agreeYN.value = results.isAgreeAd;
    agreeCheck.value.push(results.isAgreeAd);

  } catch (err) {
    util.axiosErrorCatch<GetMembersAdRes>(err);

  } finally {
    Spinner.close();
  }
};

Spinner.delay(0).show('Loading…');
getData();

onUnmounted(() => {
  Spinner.close();
});
</script>

<template>
  <div id="myInfo">
    <ValidateForm ref="validateForm">
      <div class="box">
        <h3>비밀번호 변경</h3>
        <div class="inner">
          <TextField
            block
            required
            type="password"
            label="현재 비밀번호"
            placeholder="현재 비밀번호를 입력하세요."
            :max-length="16"
            :pattern="passwordPattern"
            @blur="validation"
            v-model="currentPassword"
          />
          <TextField
            block
            required
            type="password"
            label="새 비밀번호"
            class="mt-20"
            placeholder="10~16자(영문, 숫자, 특수문자 조합)로 입력해주세요."
            :max-length="16"
            :pattern="passwordPattern"
            @blur="validation"
            v-model="password"
          />
          <TextField
            block
            required
            type="password"
            label="새 비밀번호 확인"
            class="mt-20"
            placeholder="새 비밀번호를 다시 입력해주세요."
            :max-length="16"
            :validate="rules.password"
            @blur="validation"
            v-model="password2"
          />
        </div>

        <div class="btnBox">
          <StyledButton
            color="primary"
            :disabled="isDisabled"
            @click.prevent="onSave"
          >
            변경
          </StyledButton>
        </div>
      </div>

      <div class="box mt-20">
        <h3>정보 수신 동의</h3>
        <div class="agree">
          <CheckButton
            color="primary"
            :items="agreeItem"
            v-model="agreeCheck"
          />
          <div>
            수신 {{ agreeYN ? '동의일' : '거부일' }} :
            {{ agreeAdDatetime ? util.getDateFormat(agreeAdDatetime, 'Y-m-d') : '0000-00-00' }}
          </div>
        </div>
      </div>
    </ValidateForm>
  </div>
</template>
