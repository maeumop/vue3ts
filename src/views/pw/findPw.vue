<script setup lang="ts">
import { ref, inject } from 'vue';
import { v1 as uuid } from 'uuid';
import { useUtil } from '@/js/util';
import { useRouter } from 'vue-router';
import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import { postMembersVerifyEmailMsg } from '@/constants/api/memberAccountApi';
import type { PostMembersVerifyEmailRes } from '@/types/api/memberAccountApi';
import type { ToastModel } from '@/components/Toast/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

const router = useRouter();
const util = useUtil();
const membersApi = useMemberAccountApi();

const Toast = inject('Toast') as ToastModel;

const form = ref<ValidateFormModel>();
const emailPattern: [RegExp, string] = [util.getRegExp('email'), '잘못된 이메일 형식입니다.'];
let isLoad = ref<boolean>(false);
let email = ref<string>('');
/**
 * 비밀번호 찾기 인증메일 발송
 */
const postMembersVerifyEmail = async (): Promise<void> => {
  if (form.value?.validate()) {
    try {
      isLoad.value = true;
      const { code } = await membersApi.postMembersVerifyEmail({
        memberVerifyEmailUid: uuid(),
        memberEmail: email.value
      });

      if (code === postMembersVerifyEmailMsg.VERIFY_EMAIL_SEND_SUCCESS) {
        sessionStorage.setItem('tempEmail', email.value);

        Toast('정상적으로 발송 되었습니다.');
        router.push('/findPw/notice');
      }

    } catch (err) {
      util.axiosErrorCatch<PostMembersVerifyEmailRes>(err);

    } finally {
      isLoad.value = false;
    }
  }
};
</script>

<template>
  <div id="pageFindPw" class="content">
    <h1>
      <a href="/" class="logo"></a>
    </h1>

    <div class="findPwInfo">
      <span>비밀번호 찾기</span>
      <p>
        입력하신 이메일 주소로 인증 메일이 발송되며, 이메일 인증 완료 후 비밀번호 변경이 가능합니다.
      </p>
    </div>

    <div class="inputContainer width-350">
      <ValidateForm ref="form">
        <TextField
          block
          required
          label="아이디(이메일)"
          placeholder="이메일 주소를 입력해주세요."
          :max-length="50"
          :pattern="emailPattern"
          @keyup.enter="postMembersVerifyEmail"
          v-model="email"
        />
      </ValidateForm>

      <div class="mt-20">
        <StyledButton
          block
          color="primary"
          :loading="isLoad"
          @click.prevent="postMembersVerifyEmail"
        >
          인증메일 발송
        </StyledButton>
      </div>
    </div>

    <div class="copyright">
      <span>© <strong>dreaminsight</strong> All Rights Reserved.</span>
    </div>
  </div>
</template>
