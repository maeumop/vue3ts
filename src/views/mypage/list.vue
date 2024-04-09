<script setup lang="ts">
import SearchFilter from './layer/searchFilter.vue';
import ServiceRegister from './layer/serviceRegister.vue';

import { reactive, ref, watch } from 'vue';
import { useUtil } from '@/js/util';
import {
  mdiMagnify,
  mdiTune,
  mdiRefresh,
  mdiCheckboxBlankCircle,
  mdiAlertCircle,
  mdiPlus,
} from '@/assets/svg/path';

import { useSessionStore, useClientStore } from '@/store';
import { useMemberAccountApi } from '@/api/modules/memberAccountApi';

import { CONST_CODES } from '@/constants/common';
import type { ProcessEnv } from '@/types/common';

import type {
  GetMembersClientsRes,
  MemberClientItem,
  GetMembersClientsParam,
  PatchMembersClientsRes,
  MemberClientDomainItem,
} from '@/types/api/memberAccountApi';

import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { OptionItem, KeyIndex } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

const { SEARCH, AUTH, CLIENT_ACCOUNT_STATUS } = CONST_CODES;

const { VUE_APP_LOCAL_STORAGE_CLIENT_KEY }: ProcessEnv = process.env;
const lastVisitedClientId: string | null = localStorage.getItem(VUE_APP_LOCAL_STORAGE_CLIENT_KEY);

const util = useUtil();

const memberAccountApi = useMemberAccountApi();
const sessionStore = useSessionStore();
const clientStore = useClientStore();

const validateForm = ref<ValidateFormModel>();

const props = defineProps<{
  newClientAccept: boolean
}>();

const emit = defineEmits<{
  (event: 'accepted'): void
}>();


// 팝업들 설정 ====================
let selectedClientIdx = ref(-1);
let isShow = reactive<KeyIndex<boolean>>({
  searchFilter: false,
  serviceRegister: false,
});

const onPopupClose = (flag: string): void => {
  isShow[flag] = false;
  selectedClientIdx.value = -1;
};
// END - 팝업들 설정 ====================

let selectTableColumn = ref<string>('');
const optTableColumn: OptionItem[] = [
  { text: SEARCH.CLIENT_ID.TXT, value: SEARCH.CLIENT_ID.VAL },
  { text: SEARCH.CLIENT_NAME.TXT, value: SEARCH.CLIENT_NAME.VAL },
  { text: SEARCH.CLIENT_DOMAIN.TXT, value: SEARCH.CLIENT_DOMAIN.VAL },
];

// ListTable
const tableHeader: ListTableHeader[] = [
  { text: '생성일', width: '180' },
  { text: '구분', width: '80' },
  { text: '상태', width: '100' },
  { text: '광고주 ID', width: '150' },
  { text: '광고주 이름' },
  { text: '도메인' },
  { text: '권한', width: '120' },
  { text: '관리', width: '120' },
];

let totalCount = ref<number>(0);
let list = ref<MemberClientItem[]>([]);
let dataLoading = ref<boolean>(false);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;

// ================= 검색 필터 ===========================
let searchText = ref<string>('');
let searched = ref<boolean>(false);
let badgeCount = ref<string>('0');
let accountStatus = ref<string>('');

/**
 * 리스트 필터 설정
 * @param status 광고주 상태값
 */
const onListUpdate = (status: string): void => {
  badgeCount.value = status !== '' ? '1' : '0';
  accountStatus.value = status;
};

const onSearch = (search?: boolean): void => {
  searched.value = search ?? searched.value;
  list.value = [];
  cursor.value = 0;
  totalCount.value = 0;

  getData();
};

/**
 * 검색 필터 초기화
 */
const onInit = (): void => {
  searchText.value = '';
  selectTableColumn.value = '';

  if (badgeCount.value !== '0') {
    badgeCount.value = '0';
    accountStatus.value = '';
  } else {
    onSearch(false);
  }
};

watch(accountStatus, ()=> {
  onSearch();
});
// ================= End - 검색 필터 ===========================

/**
 * ClientStore에 광고주 리스트업
 */
const setClientStore = (): void => {
  clientStore.setClientList(list.value);
};

/**
 *  광고주 추가
 * @param data 추가할 데이터
 */
const onCreateClient = (data: MemberClientItem): void => {
  lastVisitedClientId ? list.value.splice(1, 0, data) : list.value.unshift(data);
  setClientStore();
};

/**
 *  수정된 광고주 정보 반영
 * @param data 수정 할 데이터
 */
const onEditClient = (data: MemberClientItem): void => {
  Object.assign(list.value[selectedClientIdx.value], data);
  selectedClientIdx.value = -1;
};

/**
 * 광고주 수정 팝업 출력
 * @param index
 */
const onClickClientEdit = (index: number): void => {
  if (isLoadIdx.value > -1) {
    return;
  }

  selectedClientIdx.value = index;
  isShow.serviceRegister = true;
};


let isLoadIdx = ref<number>(-1);
/**
 * 광고주 어드민으로 이동
 * @param index
 */
const onClickSolution = async (index: number): Promise<void> => {
  if (isLoadIdx.value > -1) {
    return;
  }

  try {
    isLoadIdx.value = index;
    validateForm.value?.formProtection(true);

    const selected = list.value[index];
    await memberAccountApi.patchMembersClients(selected.clientId);

    const token = memberAccountApi.getAuthToken();
    sessionStore.setAuthToken(token);

    clientStore.setClientAccount({
      clientName: selected.clientName,
      clientId: selected.clientId,
      authLevel: selected.authLevel,
      domains: selected.domains
    });

    const { VUE_APP_LOCAL_STORAGE_CLIENT_KEY } = process.env;
    localStorage.setItem(VUE_APP_LOCAL_STORAGE_CLIENT_KEY, selected.clientId);
    clientStore.setClientAccount(selected);

    isLoadIdx.value = -1;
    location.replace('/database/list');

  } catch (err) {
    util.axiosErrorCatch<PatchMembersClientsRes>(err);

  } finally {
    validateForm.value?.formProtection(false);
  }
};

const domainListView = (domains: MemberClientDomainItem[]): string => {
  if (!domains.length) {
    return '-';
  }

  let counting = (domains.length > 1) ? ` 외 ${domains.length - 1}개 ` : '';
  const domain = domains.filter(item => item.isMain === 1);

  return domain[0].domain + counting;
};

/**
 * 광고주 초대 수락시 API 호출
 */
watch(
  () => props.newClientAccept,
  () => {
    if (props.newClientAccept) {
      onInit();
      emit('accepted');
    }
  }
);


/**
 * 리스트 불러오기
 */
const getData = async (): Promise<void> => {
  if (dataLoading.value) {
    return;
  }

  try {
    dataLoading.value = true;
    validateForm.value?.formProtection(true);

    const _accountStatus = accountStatus.value ? `accountStatus=${accountStatus.value}` : '';
    const _column = selectTableColumn.value ? `&column=${selectTableColumn.value}` : '';
    const _word = searchText.value ? `${_column}&word=${searchText.value}` : '';

    const params: GetMembersClientsParam = { limit, join: 1 };
    if (cursor.value) {
      params.cursor = cursor.value;
    }
    if (`${_accountStatus}${_word}` !== '') {
      params.search = encodeURIComponent(`${_accountStatus}${_word}`);
    }

    const { results }: GetMembersClientsRes = await memberAccountApi.getMembersClients(params);

    cursor.value = results.clients[results.clients.length - 1].regDatetime;

    clientStore.setClientList(results.clients);

    results.clients.forEach(item => {
      item.clientId === lastVisitedClientId ? list.value.unshift(item) : list.value.push(item);
    });
    totalCount.value = results.totalCount;

    observer.value = totalCount.value > list.value.length;

  } catch (err) {
    util.axiosErrorCatch<GetMembersClientsRes>(err);

  } finally {
    dataLoading.value = false;
    validateForm.value?.formProtection(false);
  }
};

validateForm.value?.formProtection(true);
getData();
</script>

<template>
  <div class="content common-list">
    <ValidateForm ref="validateForm">
      <div class="searchArea">
        <div class="listCount">
          검색 결과
          <span class="text-point">{{ totalCount.numberFormat() }}</span>건
        </div>

        <div class="flex gap-8">
          <SelectBox
            block
            clearable
            class="width-160"
            placeholder="전체"
            :options="optTableColumn"
            v-model="selectTableColumn"
          />

          <TextField
            block
            class="width-250"
            placeholder="검색어를 입력해주세요."
            :icon="mdiMagnify"
            :max-length="50"
            :icon-action="onSearch"
            @keydown.enter="!dataLoading && onSearch()"
            v-model="searchText"
          />

          <StyledButton
            only-icon
            outline
            color="secondary"
            :icon="mdiTune"
            @click.prevent="isShow.searchFilter = true"
            v-if="badgeCount === '0'"
          />

          <Badge
            :text="badgeCount"
            v-else
          >
            <StyledButton
              only-icon
              outline
              color="secondary"
              :icon="mdiTune"
              @click.prevent="isShow.searchFilter = true"
            />
          </Badge>

          <StyledButton
            only-icon
            outline
            color="secondary"
            :icon="mdiRefresh"
            @click.prevent="onInit"
          />
        </div>
      </div>

      <div class="searchArea">
        <StyledButton
          color="primary-dark-deep"
          :icon="mdiPlus"
          @click.prevent="isShow.serviceRegister = true;"
        >
          서비스 신청
        </StyledButton>
      </div>
    </ValidateForm>

    <ListTable
      ref="listTable"
      :height="`calc(100% - 121px)`"
      :header="tableHeader"
      :items="list"
      :loading="dataLoading"
      :observer="observer"
      @observe="getData"
    >
      <template #items="{ props, index }: ListTableItemSlot<MemberClientItem>">
        <tr :key="`list-${props.regDatetime}`">
          <td>
            {{ util.getDateFormat(props.regDatetime, 'Y-m-d H:i:s') }}
          </td>
          <td>
            {{ props.serviceType }}
          </td>
          <td>
            <div class="flex-center gap-x-2">
              <SvgIcon
                type="mdi"
                size="14"
                :path="mdiCheckboxBlankCircle"
                :class="[
                  'mr-1',
                  {'text-dark': props.accountStatus === 'PENDING'},
                  {'text-point': props.accountStatus === 'LIVE'},
                  {'text-red': props.accountStatus === 'END'},
                ]"
              />
              {{ CLIENT_ACCOUNT_STATUS[props.accountStatus].TXT }}
            </div>
          </td>
          <td>{{ props.clientId }}</td>
          <td>
            <StyledButton
              text
              color="primary"
              @click.prevent="onClickClientEdit(index)"
              v-if="(props.authLevel === AUTH.MASTER.VAL || props.authLevel === AUTH.SUPER.VAL) && props.accountStatus === CLIENT_ACCOUNT_STATUS.LIVE.VAL"
            >
              {{ props.clientName }}
            </StyledButton>
            <template v-else>
              {{ props.clientName }}
            </template>
          </td>
          <td>
            <template v-if="props.domains">
              {{ domainListView(props.domains) }}
            </template>
            <template v-else>-</template>
          </td>
          <td>
            {{ AUTH[props.authLevel].TXT }}
          </td>
          <td>
            <StyledButton
              block
              small
              outline
              :loading="isLoadIdx === index"
              @click.prevent="onClickSolution(index)"
              v-if="props.accountStatus !== CLIENT_ACCOUNT_STATUS.PENDING.VAL"
            >
              바로가기
            </StyledButton>
            <template v-else>
              -
            </template>
          </td>
        </tr>
      </template>

      <template #empty>
        <div class="flex-center-center">
          <SvgIcon
            class="text-gray-400 mr-5"
            type="mdi"
            size="15"
            :path="mdiAlertCircle"
          />
          신청 내역이 존재하지 않습니다.
        </div>
      </template>
    </ListTable>

    <SearchFilter
      :account-status="accountStatus"
      @close="onPopupClose('searchFilter')"
      @on:accept="onListUpdate"
      v-if="isShow.searchFilter"
    />

    <ServiceRegister
      :idx="selectedClientIdx"
      :selected-client="list[selectedClientIdx]"
      @close="onPopupClose('serviceRegister')"
      @on:create="onCreateClient"
      @on:edit="onEditClient"
      v-if="isShow.serviceRegister"
    />
  </div>
</template>
