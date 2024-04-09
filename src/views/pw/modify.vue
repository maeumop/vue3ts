<script setup lang="ts">
import { onMounted, ref,  } from 'vue';
import { useUtil } from '@/js/util';
import { useRouter } from 'vue-router';
import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import { patchMembersPwByEmailMsg, patchMembersVerifyEmailMsg } from '@/constants/api/memberAccountApi';
import type { KeyIndex, RuleFunc, } from '@/components/types';
import type { PatchMembersPwByEmailRes, } from '@/types/api/memberAccountApi';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

const router = useRouter();
const util = useUtil();
const membersApi = useMemberAccountApi();

let password = ref<string>('');
let password2 = ref<string>('');

//======================== form validation ========================
const form = ref<ValidateFormModel>();
const passwordPattern: [RegExp, string] = [util.getRegExp('password'), '10~16자(영문, 숫자, 특수문자 조합)로 입력해주세요.'];

const rules: KeyIndex<RuleFunc[]> = {
  confirmPw: [v => !(v !== password.value) || '비밀번호가 일치하지 않습니다.'],
};
//====================== END form validation ======================


const parseUrl = new URL(window.location.href);
let memberVerifyEmailUid = parseUrl.searchParams.get('uid') ?? '';
/**
 * 이메일 인증
 * - 이메일 링크로 전달된 memberVerifyEmailUid가 유효한 경우 memberUid, memberEmail 값을 세팅하고 유효하지 않은 경우 만료 안내 페이지로 이동
 */
const patchMembersVerifyEmail = async (): Promise<void> => {
  try {
    const { code, results } = await membersApi.patchMembersVerifyEmail(memberVerifyEmailUid);

    if (code === patchMembersVerifyEmailMsg.EMAIL_VERIFY_SUCCESS) {
      memberUid.value = results.memberUid;
      memberEmail.value = results.memberEmail;
    }
  } catch (err) {
    // 만료 안내 페이지로 이동
    router.push('/findPw/expiration');
  }
};

let isLoad = ref<boolean>(false);
const memberUid = ref<string>('');
const memberEmail = ref<string>('');
/**
 * 비밀번호 변경
 * - 비밀번호 변경 API 호출 후 성공하면 로그인 처리
 */
const patchMembersPwByEmail = async (): Promise<void> => {
  if (form.value?.validate()) {
    try {
      isLoad.value = true;

      const { code } = await membersApi.patchMembersPwByEmail({
        memberVerifyEmailUid,
        memberUid: memberUid.value,
        memberEmail: memberEmail.value,
        password: password.value,
      });

      if (code === patchMembersPwByEmailMsg.MEMBER_PW_BY_EMAIL_UPDATE_SUCCESS) {
        // 로그인 처리
        const result = await util.login(memberEmail.value, password.value);

        if (result) {
          router.push('/mypage/service');
        }
      }

    } catch (err) {
      util.axiosErrorCatch<PatchMembersPwByEmailRes>(err);

    } finally {
      isLoad.value = false;
    }
  }
};


onMounted(() => {
  patchMembersVerifyEmail();
});
</script>

<template>
  <div id="pageModifyPw" class="content">
    <h1>
      <a href="/" class="logo"></a>
    </h1>

    <div class="findPwInfo">
      <span>비밀번호 변경</span>
      <p>
        새로운 비밀번호 입력 후 [비밀번호 변경] 버튼을 클릭해 주세요.
      </p>
    </div>

    <div class="inputContainer width-350">
      <ValidateForm ref="form">
        <TextField
          block
          required
          type="password"
          label="비밀번호"
          placeholder="10~16자(영문, 숫자, 특수문자 조합)로 입력해주세요."
          :max-length="16"
          :pattern="passwordPattern"
          v-model="password"
        />
        <TextField
          block
          required
          class="mt-20"
          type="password"
          label="비밀번호 확인"
          placeholder="비밀번호를 다시 입력해주세요."
          :validate="rules.confirmPw"
          :max-length="16"
          @keyup.enter="patchMembersPwByEmail"
          v-model="password2"
        />
      </ValidateForm>

      <div class="buttonBox mt-20">
        <StyledButton
          block
          color="primary"
          :loading="isLoad"
          @click.prevent="patchMembersPwByEmail"
        >
          비밀번호 변경
        </StyledButton>
      </div>
    </div>

    <div class="copyright">
      <span>© <strong>dreaminsight</strong> All Rights Reserved.</span>
    </div>
  </div>
</template>
