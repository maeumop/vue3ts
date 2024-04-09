<script setup lang="ts">
import { ref, reactive, inject } from 'vue';
import { v1 as uuid } from 'uuid';
import { useSessionStore } from '@/store';
import { useUtil } from '@/js/util';
import { useMyAppApi } from '@/api/modules/myAppApi';
import type { PostAligoApiRes } from '@/types/api/myAppApi';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ToastModel } from '@/components/Toast/types';
import type { SpinnerModel } from '@/components/Spinner/types';
import type { KeyIndex, } from '@/components/types';
import type { RuleFunc } from '@/components/types';
import { getAligoApiMsg, postAligoApiMsg } from '@/constants/api/myAppapi';
import type { ProcessEnv } from '@/types/common';

const Toast = inject('Toast') as ToastModel;
const Spinner = inject('Spinner') as SpinnerModel;

const util = useUtil();
const sessionStore = useSessionStore();
const myAppApi = useMyAppApi();

const { VUE_APP_SERVER_IP }: ProcessEnv = process.env;

const clientId = sessionStore.getClientId;

//======================== form validation ========================
const form = ref<ValidateFormModel>();

let isPass = ref<boolean>(false);

const validation = (): void => {
  isPass.value = form.value!.validate(true);
};
const rules: KeyIndex<RuleFunc[]> = {
  input: [v => !!v || '필수 입력 사항 입니다.'],
};

const numPattern: [RegExp, string] = [util.getRegExp('num'), '숫자만 입력 가능합니다.'];

let id = ref<string>('');
let apiKey = ref<string>('');
let sender = ref<string>('');
let result_code = ref<number>(0);

let apiResult = reactive<KeyIndex<number>>({
  SMS_CNT: 0, // 단문
  LMS_CNT: 0, // 장문
  MMS_CNT: 0  // 멀티
});
let infoMessage = ref<string>('');
/**
 * 알리고 설정 정보
 */
const getAligoApi = async (): Promise<void> => {
  try {
    result_code.value = 0;

    const { code, results } = await myAppApi.getAligoApi(clientId);

    if (code === getAligoApiMsg.ALIGOAPI_GET_SUCCESS) {
      result_code.value = results.apiResult.result_code;

      // 기존에 저장된 api 정보 세팅
      if (results.aligoApi.aligoId) {
        id.value = results.aligoApi.aligoId;
        apiKey.value = results.aligoApi.aligoApiKey;
        sender.value = results.aligoApi.aligoSender;
      }

      if (results.apiResult.result_code && results.apiResult.result_code === 1) {
        apiResult.SMS_CNT = results.apiResult.SMS_CNT;
        apiResult.LMS_CNT = results.apiResult.LMS_CNT;
        apiResult.MMS_CNT = results.apiResult.MMS_CNT;

      } else {
        if (!results.aligoApi.aligoId) {
          infoMessage.value = '알리고 ID, 알리고 API key, 발신번호를 입력해주세요.';

        } else {
          infoMessage.value = `${results.apiResult.message} (${results.apiResult.result_code})`;
        }
      }
    }

  } catch (err) {
    console.log(err);
    infoMessage.value = 'Error : 고객센터에 문의를 남겨주세요.';

  } finally {
    Spinner.hide();
  }
};


let isProcessing = ref<boolean>(false);
/**
 * 알리고 설정 정보 저장
 */
const postAligoApi = async (): Promise<void> => {
  try {
    isProcessing.value = true;

    const { code } = await myAppApi.postAligoApi({
      aligoConfigUid: uuid(),
      aligoId: id.value,
      aligoApiKey: apiKey.value,
      aligoSender: sender.value
    });

    if (code === postAligoApiMsg.ALIGOAPI_INSERT_SUCCESS) {
      Toast('정상적으로 저장 되었습니다.');
      isPass.value = false;
    }

  } catch (err) {
    util.axiosErrorCatch<PostAligoApiRes>(err);

  } finally {
    isProcessing.value = false;
    getAligoApi();
  }
};

// create
getAligoApi();
Spinner.show();
</script>

<template>
  <div id="myApp" class="narrow-content">
    <div class="appContent">
      <h3 class="subTitle">API 설정</h3>

      <div class="mainContent">
        <ValidateForm ref="form">
          <TextField
            block
            required
            class="mb-10 mx-auto"
            label="알리고 ID"
            placeholder="알리고 ID를 입력해주세요."
            :width="350"
            :max-length="50"
            :validate="rules.input"
            @blur="validation"
            v-model="id"
          />
          <TextField
            block
            required
            class="mb-10 mx-auto"
            label="알리고 API Key"
            placeholder="API key를 입력해주세요."
            :width="350"
            :max-length="1000"
            :validate="rules.input"
            @blur="validation"
            v-model="apiKey"
          />
          <TextField
            block
            required
            type="tel"
            class="mx-auto"
            label="발신번호"
            placeholder="알리고에 등록, 승인된 발신번호를 입력해 주세요."
            :width="350"
            :max-length="20"
            :pattern="numPattern"
            @blur="validation"
            v-model="sender"
          />
        </ValidateForm>
      </div>
      <div class="pointBox">
        <div v-if="result_code === 1">
          <span class="font-lg">
            현재 발송 가능한 건수 :
            단문 <span class="text-point">{{ apiResult.SMS_CNT.numberFormat() }}</span>건 /
            장문 <span class="text-point">{{ apiResult.LMS_CNT.numberFormat() }}</span>건 /
            멀티 <span class="text-point">{{ apiResult.MMS_CNT.numberFormat() }}</span>건
          </span>
        </div>

        <template v-else>
          <span class="font-lg">{{ infoMessage }}</span>
        </template>

        <StyledButton
          color="primary"
          :disabled="!isPass"
          :loading="isProcessing"
          @click.prevent="postAligoApi"
        >
          저장
        </StyledButton>
      </div>
    </div>

    <div class="infoBox mb-100">
      <h4 class="font-lg pl-20 mt-20">알리고 API Key 발급 신청 방법</h4>
      <ul>
        <li>알리고 회원가입 : smartsms.aligo.in (사이트 주소)</li>
        <li>발신번호 등록 : 발신번호 > 발신 번호 추가하기 (발신 번호에 검증 서류 제출이 필요하며 검수 기간은 1~2일 정도 소요됩니다.)</li>
        <li> 문자 API 신청/인증 : 문자API > 신청/인증 > 문자 API 담당자 정보 추가 > API Key 발급 신청 > *발송 서버 IP 등록 > 발신번호 추가 <br />(발송 서버 IP : {{ VUE_APP_SERVER_IP }})</li>
        <li>포인트 충전</li>
      </ul>
    </div>
  </div>
</template>