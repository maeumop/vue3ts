<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useMenusStore, useClientStore, useSessionStore } from '@/store';
import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import { useUtil } from '@/js/util';
import { CONST_CODES } from '@/constants/common';
import type { MemberClientItem, PatchMembersClientsRes } from '@/types/api/memberAccountApi';
import type { ProcessEnv } from '@/types/common';
import { mdiMagnify, mdiChevronDown, mdiCheckboxBlankCircle } from '@/assets/svg/path';
import { patchMembersClientsMsg } from '@/constants/api/memberAccountApi';
import MenuNodeItem from './component/MenuItem.vue';
import { useRoute, } from 'vue-router';

const { VUE_APP_VERSION }: ProcessEnv = process.env;
const { AUTH, CLIENT_ACCOUNT_STATUS } = CONST_CODES;

const memberAccountApi = useMemberAccountApi();

const util = useUtil();
const sessionStore = useSessionStore();
const clientStore = useClientStore();
const { getMenus, setActiveMenu, } = useMenusStore();
const route = useRoute();

const { getClientList, getClientName, getClientId, getAuthLevelName, } = storeToRefs(clientStore);

let isShow = ref<boolean>(false);

const toggleClient = (): void => {
  isShow.value = !isShow.value;
  resetSearch();
};

/**
 * 광고주 선택
 * @param clientId
 */
const updateClientAccount = async (clientId: string): Promise<void> => {
  try {
    const { code } = await memberAccountApi.patchMembersClients(clientId);

    if (code === patchMembersClientsMsg.CLIENT_ACCOUNT_SELECTED_SUCCESS) {
      const token = memberAccountApi.getAuthToken();
      sessionStore.setAuthToken(token);

      getClientList.value.forEach(item => {
        if (item.clientId === clientId) {
          clientStore.setClientAccount(item);
        }
      });
    }

  } catch (err) {
    util.axiosErrorCatch<PatchMembersClientsRes>(err);

  } finally {
    isShow.value = false;
    resetSearch();

    location.reload();
  }
};

let searchText = ref<string>('');
let searchedArr = ref<MemberClientItem[]>([]);
let isSearched = ref<boolean>(false);
let timeout: number = 0;
/**
 * 광고주 검색
 */
const searchClient = (): void => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    searchedArr.value = [];
    isSearched.value = false;

    getClientList.value.forEach(item => {
      if (item.accountStatus !== CLIENT_ACCOUNT_STATUS.PENDING.VAL
        && item.clientName.includes(searchText.value)) {
        if (!searchedArr.value.includes(item)) {
          searchedArr.value.push(item);
        } else {
          searchedArr.value = getClientList.value;
        }

      } else {
        isSearched.value = true;
      }
    });
  }, 300);
};

const resetSearch = (): void => {
  isSearched.value = false;
  searchedArr.value = [];
  searchText.value = '';
};

// ======================= 광고주 선택 영역 =======================
const clientEl = ref<HTMLDivElement>();
/**
 * 광고주 선택창 닫기
 * @param event MouseEvent
 */
const closeClientBox = (event: MouseEvent) => {
  if (!clientEl.value?.contains(event.target as Node)) {
    if (isShow.value && clientEl.value) {
      isShow.value = false;

      resetSearch();
    }
  }
};

watchEffect(() => {
  if (isShow.value && clientEl.value) {
    window.addEventListener('click', closeClientBox);

  } else {
    window.removeEventListener('click', closeClientBox);
  }
});

// 메뉴 활성화 처리
watch(route, () => setActiveMenu());
// ======================= END 광고주 선택 영역 닫기 =======================
</script>

<template>
  <div class="gnb">
    <h1>
      <a href="/database/list" class="logo"></a>
    </h1>

    <div ref="clientEl" :class="[isShow && 'on', 'brand']">
      <a href="#" class="height-75" @click.prevent="toggleClient">
        <div>
          <h3>{{ getClientName }}</h3>
          <span class="info" v-if="getClientName">
            {{ getClientId }} |
            {{ getAuthLevelName }}
          </span>
        </div>

        <div :class="[isShow && 'on', 'arrow']">
          <SvgIcon type="mdi" class="font-large ml-2" :path="mdiChevronDown" />
        </div>
      </a>

      <Transition name="slide-down">
        <div class="brandPopup" v-if="isShow">
          <div class="searchBox">
            <TextField
              placeholder="검색어를 입력해주세요."
              width="100%"
              :icon="mdiMagnify"
              :max-length="50"
              :icon-action="searchClient"
              @keyup.enter="searchClient"
              v-model="searchText"
            />
          </div>
          <table>
            <template :key="item.clientId" v-for="(item) in isSearched ? searchedArr : getClientList">
              <tr
                :class="[(item.clientId === getClientId) && 'on']"
                @click="updateClientAccount(item.clientId)"
                v-if="CLIENT_ACCOUNT_STATUS[item.accountStatus].VAL !== CLIENT_ACCOUNT_STATUS.PENDING.VAL"
              >
                <td class="width-p-45 flex-center gap-x-8">
                  <SvgIcon type="mdi" width="12" :path="mdiCheckboxBlankCircle" />
                  {{ item.clientName }}
                </td>
                <td class="width-p-25">{{ item.clientId }}</td>
                <td class="width-p-25">{{ AUTH[item.authLevel].TXT }}</td>
              </tr>

            </template>
            <tr style="justify-content: center;" v-if="isSearched && !searchedArr.length">
              <td>검색된 결과가 없습니다.</td>
            </tr>
          </table>
        </div>
      </Transition>
    </div>

    <div class="menu-list-wrap">
      <div class="gnb-menu">
        <MenuNodeItem :items="getMenus" />
      </div>
    </div>
    <div class="version">
      <span>v{{ VUE_APP_VERSION }}</span>
    </div>
  </div>
</template>
