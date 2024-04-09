<script setup lang="ts">
import { ref, watchEffect, } from 'vue';
import Policy from '@/views/common/policy/index.vue';
import { v1 as uuid } from 'uuid';
import { useUtil } from '@/js/util';
import { useSessionStore } from '@/store';
import { useRouter } from 'vue-router';
import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import { postMembersMsg } from '@/constants/api/memberAccountApi';
import type { ProcessEnv } from '@/types/common';
import type { PostMembersRes, } from '@/types/api/memberAccountApi';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { KeyIndex, RuleFunc, } from '@/components/types';
import { booleanYN } from '@/constants/common';

const util = useUtil();
const router = useRouter();
const membersApi = useMemberAccountApi();
const sessionStore = useSessionStore();

let isProgress = ref<boolean>(false);
let email = ref<string>('');
let password = ref<string>('');
let password2 = ref<string>('');

//======================== form validation ========================
const form = ref<ValidateFormModel>();
const patterns: KeyIndex<[RegExp, string]> = {
  email: [util.getRegExp('email'), '잘못된 이메일 형식입니다.'],
  password: [util.getRegExp('password'), '10~16자(영문, 숫자, 특수문자 조합)로 입력해주세요.'],
};

const rules: KeyIndex<RuleFunc[]> = {
  confirmPw: [v => !(v !== password.value) || '비밀번호가 일치하지 않습니다.'],
  agree: [(v) => !(!v[0] || !v[1] || !v[2]) || '필수 항목에 체크해주세요.']
};

let agree = ref<boolean[]>([false, false, false, false]);
let allCheck = ref<boolean>(false);
let isAgreed = ref<boolean>(false);

/**
 * 전체 동의
 */
const checkAll = (): void => {
  agree.value[0] = !allCheck.value;
  agree.value[1] = !allCheck.value;
  agree.value[2] = !allCheck.value;
  agree.value[3] = !allCheck.value;
};


/**
 * 회원가입
 */
const register = async (): Promise<void> => {
  if (form.value?.validate()) {
    isProgress.value = true;
    form.value?.formProtection();

    try {
      const { code } = await membersApi.postMembers({
        memberUid: uuid(),
        memberEmail: email.value,
        password: password.value,
        isOverFourteen: util.getBoolean(agree.value[0]),
        isAgreeTerms: util.getBoolean(agree.value[1]),
        isAgreePrivacy: util.getBoolean(agree.value[2]),
        isAgreeAd: util.getBoolean(agree.value[3]),
        isSuper: booleanYN.N,
      });

      if (code === postMembersMsg.MEMBER_REGISTRATION_SUCCESS) {
        const { VUE_APP_SESSION_STORAGE_KEY }: ProcessEnv = process.env;

        const token = membersApi.getAuthToken();
        localStorage.setItem(VUE_APP_SESSION_STORAGE_KEY, token);
        sessionStore.setAuthToken(token);

        router.push('/mypage/service');
      }

    } catch (err) {
      util.axiosErrorCatch<PostMembersRes>(err);

    } finally {
      isProgress.value = false;
      form.value?.formProtection(false);
    }
  }
};

/**
 * 필수 동의 항목 체크 여부 확인
 */
watchEffect(() => {
  if (agree.value[0] && agree.value[1] && agree.value[2]) {
    isAgreed.value = true;
    form.value?.validate();

    if (agree.value[3]) {
      allCheck.value = true;
    } else {
      allCheck.value = false;
    }

  } else {
    isAgreed.value = false;
    allCheck.value = false;
  }
});


//======================== 약관 동의 모달 ========================
let isShowPolicy = ref<boolean>(false);
let policyType = ref<string>('');

const showPolicy = (type: string): void => {
  policyType.value = type;
  isShowPolicy.value = true;
};

const closePolicy = (): void => {
  isShowPolicy.value = false;
  policyType.value = '';
};
//====================== END 약관 동의 모달 ======================

// 가입 안내 메일 통해서 접속시 쿼리 파라미터 체크하여 이메일 value 세팅
const parseUrl = new URL(window.location.href);

email.value = parseUrl.searchParams.get('email') ?? '';
</script>

<template>
  <div id="pageJoin" class="content">
    <h1>
      <a href="/" class="logo"></a>
    </h1>

    <div class="inputContainer width-350">
      <ValidateForm ref="form">
        <TextField
          block
          required
          label="아이디(이메일)"
          placeholder="이메일 주소를 입력해주세요."
          :max-length="50"
          :pattern="patterns.email"
          v-model="email"
        />
        <TextField
          block
          required
          class="mt-20"
          type="password"
          label="비밀번호"
          placeholder="10~16자(영문, 숫자, 특수문자 조합)로 입력해주세요."
          min-length="10"
          :max-length="16"
          :pattern="patterns.password"
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
          @keydown.enter="register"
          v-model="password2"
        />


        <div class="agree">
          <div class="checkAll">
            <label>
              <input
                type="checkbox"
                @click="checkAll"
                v-model="allCheck"
              />
              전체동의
            </label>
          </div>

          <ValidateWrap :validate="rules.agree" :check-value="agree">
            <ul class="checkList">
              <li>
                <label>
                  <input type="checkbox" v-model="agree[0]" />
                  <span> (필수) 만 14세 이상입니다.</span>
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" v-model="agree[1]" />
                  <span>
                    (필수)
                    <a href="#" @click.prevent="showPolicy('terms')">이용약관</a>
                    에 동의
                  </span>
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" v-model="agree[2]" />
                  <span>
                    (필수)
                    <a href="#" @click.prevent="showPolicy('privacy')">개인정보 수집 및 이용</a>에 동의
                  </span>
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" v-model="agree[3]" />
                  <span>
                    (선택)
                    <a href="#" @click.prevent="showPolicy('ad')">이벤트, 안내, 광고 메일 및 SMS 등 수신 동의</a>
                  </span>
                </label>
              </li>
            </ul>
          </ValidateWrap>
        </div>
      </ValidateForm>

      <div class="mt-30">
        <StyledButton
          block
          color="primary"
          :loading="isProgress"
          @click.prevent="register"
        >
          회원가입
        </StyledButton>
      </div>

      <div class="copyright">
        <span>© <strong>dreaminsight</strong> All Rights Reserved.</span>
      </div>
    </div>

    <Policy
      :type="policyType"
      @close="closePolicy"
      v-if="isShowPolicy"
    />
  </div>
</template>