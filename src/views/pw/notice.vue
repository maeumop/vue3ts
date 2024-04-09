<script setup lang="ts">
import { inject, ref } from 'vue';
import { v1 as uuid } from 'uuid';
import { useUtil } from '@/js/util';
import { useRouter } from 'vue-router';
import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import { postMembersVerifyEmailMsg } from '@/constants/api/memberAccountApi';
import type { PostMembersVerifyEmailRes, } from '@/types/api/memberAccountApi';
import type { ToastModel } from '@/components/Toast/types';

const router = useRouter();
const membersApi = useMemberAccountApi();

const util = useUtil();
const Toast = inject('Toast') as ToastModel;

let email: string = sessionStorage.getItem('tempEmail') ?? '이메일';

let isLoad = ref<boolean>(false);

/**
 * 비밀번호 찾기 인증메일 재발송
 */
const postMembersVerifyEmail = async (): Promise<void> => {
  try {
    isLoad.value = true;

    const { code } = await membersApi.postMembersVerifyEmail({
      memberVerifyEmailUid: uuid(),
      memberEmail: email ?? ''
    });

    if (code === postMembersVerifyEmailMsg.VERIFY_EMAIL_SEND_SUCCESS) {
      Toast('정상적으로 발송 되었습니다.');
      router.push('/findPw/notice');
    }

  } catch (err) {
    util.axiosErrorCatch<PostMembersVerifyEmailRes>(err);

  } finally {
    isLoad.value = false;
  }
};
</script>

<template>
  <div id="pageNotice" class="content">
    <h1>
      <a href="/" class="logo"></a>
    </h1>

    <div class="findPwInfo">
      <span>인증 메일이 발송되었습니다.</span>
      <p>
        고객님의 <span class="text-point">{{ email }}</span>로 인증 메일이 발송되었으며, 메일 인증 완료 후 비밀번호를 변경해 주세요.
      </p>
    </div>

    <div class="width-350">
      <ul class="info-box-bullet">
        <li>
          인증 메일은 발송 시점으로부터 24시간 동안 유효하며, 재발송 시 기존 인증 메일은 만료됩니다. 반드시 마지막에 수신된 메일을 확인해 주세요.
        </li>
        <li>
          인증 메일이 확인되지 않을 시 스팸 메일함을 확인해 주세요.
        </li>
      </ul>

      <div class="buttonBox mt-20">
        <StyledButton
          block
          color="primary"
          href="/"
          target="_self"
        >
          로그인 바로가기
        </StyledButton>
        <StyledButton
          block
          outline
          :loading="isLoad"
          :disabled="isLoad"
          @click.prevent="postMembersVerifyEmail"
        >
          인증메일 재발송
        </StyledButton>
      </div>
    </div>

    <div class="copyright">
      <span>© <strong>dreaminsight</strong> All Rights Reserved.</span>
    </div>
  </div>
</template>
