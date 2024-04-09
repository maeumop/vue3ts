<script setup lang="ts">
import { ref, inject, } from 'vue';
import axios from 'axios';
import { useUtil } from '@/js/util';
import { useRouter } from 'vue-router';
import { appStage } from '@/constants/common';
import { getApiErrorMessage } from '@/message/apiResponse';
import type { KeyIndex, RuleFunc } from '@/components/types';
import type { ProcessEnv } from '@/types/common';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ToastModel } from '@/components/Toast/types';
import type { PostMembersLoginRes } from '@/types/api/memberAccountApi';

const Toast = inject('Toast') as ToastModel;

const router = useRouter();
const util = useUtil();

const { VUE_APP_STAGE }: ProcessEnv = process.env;

let email = ref<string>(VUE_APP_STAGE === appStage.DEVELOP ? 'devmaster@abc.com' : '');
let password = ref<string>(VUE_APP_STAGE === appStage.DEVELOP ? 'asdfqwer1234' : '');
let isLoad = ref<boolean>(false);

//======================== form validation ========================
const form = ref<ValidateFormModel>();

const patterns: KeyIndex<[RegExp, string]> = {
  email: [util.getRegExp('email'), '잘못된 이메일 형식입니다.']
};

const rules: KeyIndex<RuleFunc[]> = {
  password: [v => !(!v) || '비밀번호를 입력해주세요.'],
};
//====================== END form validation ======================


//===================================================================
//  로그인 로직
//===================================================================
const login = async (): Promise<void> => {
  if (form.value?.validate()) {
    try {
      isLoad.value = true;

      const result = await util.login(email.value, password.value);

      if (result) {
        router.push('/mypage/service');
      }

    } catch (err) {
      if (axios.isAxiosError<PostMembersLoginRes>(err)) {
        const { response } = err;

        if (response) {
          const { code } = response.data;

          const errors = ['INVALID_PASSWORD', 'MEMBER_EMAIL_NOT_FOUND', 'BAD_REQUEST_BODY'];

          const msg = errors.includes(code)
            ? '가입하지 않은 이메일이거나, 잘못된 비밀번호입니다.'
            : getApiErrorMessage(code);

          if (msg) {
            Toast({ color: 'warning', message: msg });
          } else {
            Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });
          }
        }
      } else {
        console.log(err);
      }

    } finally {
      isLoad.value = false;
    }
  }
};
</script>

<template>
  <div id="pageLogin" class="content">
    <h1>
      <a href="/" class="logo"></a>
    </h1>

    <div class="inputContainer width-350">
      <ValidateForm ref="form">
        <TextField
          block
          placeholder="이메일 입력"
          :max-length="50"
          :pattern="patterns.email"
          v-model="email"
        />
        <TextField
          block
          type="password"
          placeholder="비밀번호 입력"
          class="mt-20"
          :validate="rules.password"
          @keydown.enter="login"
          v-model="password"
        />
      </ValidateForm>

      <div class="mt-20">
        <StyledButton
          block
          color="primary"
          :loading="isLoad"
          @click="login"
        >
          로그인
        </StyledButton>
      </div>

      <div class="findBox">
        <span>
          아직 회원이 아니신가요?
          <RouterLink to="/join" class="text-point">회원가입</RouterLink>
        </span>
        <RouterLink to="/findPw">비밀번호 찾기</RouterLink>
      </div>

      <div class="copyright">
        <span>© <strong>dreaminsight</strong> All Rights Reserved.</span>
      </div>
    </div>
  </div>
</template>