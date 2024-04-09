import { computed, reactive, ref } from 'vue';

import { CONST_CODES } from '@/constants/common';
import type { ClientAccount } from '@/types/store/modules/client';
import type { ConstAuthKeys } from '@/types/common';
import type { MemberClientDomainItem, MemberClientItem } from '@/types/api/memberAccountApi';
import type { ProcessEnv } from '@/types/common';
import { defineStore } from 'pinia';

// 마지막 로그인시 사용한 광고주 정보
const { VUE_APP_LOCAL_STORAGE_CLIENT_KEY, VUE_APP_SESSION_STORAGE_AUTHLEVEL_KEY }: ProcessEnv = process.env;
const { AUTH } = CONST_CODES;

export const useClientStore = defineStore('clientStore', () => {
  // 로그인한 사용자가 접근 가능한 광고주(clients)
  const clientList = ref<MemberClientItem[]>([]);
  const getClientList = computed<MemberClientItem[]>(() => clientList.value);

  /**
   * 로그인한 사용자가 관리 가능한 광고주 목록 설정
   * @param items
   */
  const setClientList = (items: MemberClientItem[]): void => {
    clientList.value = items;
  };

  /**
   * 로그인 후 선택된 광고주 정보
   */
  const clientAccount = reactive<ClientAccount>({
    clientName: '',
    clientId: '',
    domains: [],
    authLevel: 'MEMBER',
  });

  /**
   * 선택된 광고주 정보 설정
   * @param data
   */
  const setClientAccount = (data: ClientAccount, save: boolean = true): void => {
    clientAccount.clientName = data.clientName;
    clientAccount.clientId = data.clientId;
    clientAccount.domains = data.domains;
    clientAccount.authLevel = data.authLevel;

    if (save) {
      // 선택된 광고주 정보 저장
      localStorage.setItem(VUE_APP_LOCAL_STORAGE_CLIENT_KEY, data.clientId);
      sessionStorage.setItem(VUE_APP_SESSION_STORAGE_AUTHLEVEL_KEY, data.authLevel);
    }
  };

  /**
   * clientId 값을 비교 하여 사용중인 client 설정
   * @param id clientId
   */
  const setClientAccountByClientId = (id: string): void => {
    if (clientList.value.length) {
      clientList.value.forEach(item => {
        const { clientName, clientId, authLevel, domains } = item;

        if (item.clientId === id) {
          setClientAccount({
            clientName,
            clientId,
            domains,
            authLevel
          });

          sessionStorage.setItem(VUE_APP_SESSION_STORAGE_AUTHLEVEL_KEY, authLevel);
        }
      });
    }
  };

  const setClientAccountDomain = (domains: MemberClientDomainItem[]): void => {
    clientAccount.domains = domains;
  };

  const getClientAccount = computed<ClientAccount>(() => clientAccount);
  const getClientName = computed<string>(() => clientAccount.clientName);
  const getClientId = computed<string>(() => clientAccount.clientId);
  const getAuthLevelName = computed<string>(() => AUTH[clientAccount.authLevel].TXT);
  const getAuthLevel = computed<ConstAuthKeys>(() => clientAccount.authLevel);

  const clear = (): void => {
    clientList.value = [];
    clientAccount.clientName = '';
    clientAccount.clientId = '';
    clientAccount.authLevel = 'MEMBER';
  };

  return {
    setClientList,
    getClientList,

    setClientAccount,
    setClientAccountByClientId,
    setClientAccountDomain,
    getClientAccount,
    getClientName,
    getClientId,
    getAuthLevelName,
    getAuthLevel,

    clear,
  };
});