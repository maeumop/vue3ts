import { computed, reactive, ref } from 'vue';

import type { JWT } from '@/types/store/modules/session';
import { booleanYN } from '@/constants/common';
import { defineStore } from 'pinia';
import { useUtil } from '@/js/util';

const { VUE_APP_SESSION_STORAGE_KEY, VUE_APP_SESSION_STORAGE_AUTHLEVEL_KEY } = process.env;

export const useSessionStore = defineStore('sessionStore', () => {
  const util = useUtil();
  const authToken = ref<string>('');
  const JWT = reactive<JWT>({
    exp: 0,
    iat: 0,
    iss: '',
    memberUid: '',
    memberEmail: '',
    clientAccountMemberRelUid: '',
    clientId: '',
    ftpDomain: '',
    authLevel: '',
    mediaUids: '',
    isSuper: booleanYN.N,
    accountStatus: '',
  });

  /**
   * 토큰 저장 및 토큰 디코드 내용 저장
   * @param token
   * @returns
   */
  const setAuthToken = (token: string): boolean => {
    authToken.value = token;

    try {
      const decode = util.decodeJWT(token);

      if (decode.exp * 1000 < new Date().getTime()) {
        clear();
        return false;
      }

      JWT.exp = decode.exp;
      JWT.iat = decode.iat;
      JWT.iss = decode.iss;
      JWT.memberUid = decode.memberUid;
      JWT.memberEmail = decode.memberEmail;

      JWT.clientAccountMemberRelUid = '';
      JWT.ftpDomain = decode.ftpDomain || '';

      if (decode.clientId) {
        JWT.clientId = decode.clientId;
        JWT.clientAccountMemberRelUid = decode.clientAccountMemberRelUid;
      }

      // 로그인 정보 저장
      localStorage.setItem(process.env.VUE_APP_SESSION_STORAGE_KEY, token);

      return true;
    } catch (e) {
      console.log('Authorized Token decode fail');
      return false;
    }
  };

  /**
   * JWT 정보 제거 (logout)
   */
  const clear = (): void => {
    authToken.value = '';
    JWT.exp = 0;
    JWT.iat = 0;
    JWT.iss = '';
    JWT.memberUid = '';
    JWT.memberEmail = '';
    JWT.clientAccountMemberRelUid = '';
    JWT.ftpDomain = '';
    JWT.clientId = '';
    JWT.authLevel = '';
    JWT.mediaUids = '';
    JWT.isSuper = booleanYN.N,
    JWT.accountStatus = '';

    localStorage.removeItem(VUE_APP_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(VUE_APP_SESSION_STORAGE_AUTHLEVEL_KEY);
  };

  const getUid = computed<string>(() => JWT.memberUid);
  const getClientId = computed<string>(() => JWT.clientId);
  const getClientAccountMemberRelUid = computed<string>(() => JWT.clientAccountMemberRelUid);
  const getAuthToken = computed<string>(() => authToken.value);
  const getMemberEmail = computed<string>(() => JWT.memberEmail);
  const getLoginStatus = computed<boolean>(() => {
    if (JWT.exp > 0) {
      const time = new Date().getTime() / 1000;

      if (JWT.exp < time) {
        clear();
      }
    }

    return authToken.value !== '';
  });
  const getLoginAccount = computed<JWT>(() => JWT);

  return {
    getUid,
    getClientId,
    clear,
    setAuthToken,
    getMemberEmail,
    getAuthToken,
    getClientAccountMemberRelUid,
    getLoginStatus,
    getLoginAccount,
  };
});