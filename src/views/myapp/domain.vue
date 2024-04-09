<script setup lang="ts">
import { ref, inject, } from 'vue';
import { useClientStore, useSessionStore } from '@/store';
import { useUtil } from '@/js/util';
import { useMyAppApi } from '@/api/modules/myAppApi';
import { booleanYN } from '@/constants/common';
import { mdiMagnify, mdiCheckboxBlankCircle } from '@/assets/svg/path';
import { getDomainsMsg, patchDomainsMsg, } from '@/constants/api/myAppapi';
import AddDomain from './layer/addDomain.vue';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { ToastModel } from '@/components/Toast/types';
import type { GetDomainsResult, PatchDomainRes, } from '@/types/api/myAppApi';
import type { MemberClientDomainItem } from '@/types/api/memberAccountApi';

const Toast = inject('Toast') as ToastModel;

const util = useUtil();
const sessionStore = useSessionStore();
const { setClientAccountDomain } = useClientStore();
const myAppApi = useMyAppApi();

const clientId = sessionStore.getClientId;


// ======================= 리스트 테이블 설정 =======================
const tableHeader: ListTableHeader[] = [
  { text: '선택', width: '70', align: 'center' },
  { text: '도메인 명', width: '' },
  { text: '상태', width: '150' },
];

let isLoading = ref<boolean>(false);
const domainList = ref<GetDomainsResult[]>([]);
/**
 * 도메인 목록 불러오기
 */
const getDomains = async (): Promise<void> => {
  isLoading.value = true;

  try {
    const { code, results } = await myAppApi.getDomains(clientId);

    if (code === getDomainsMsg.DOMAIN_LIST_GET_SUCCESS) {
      domainList.value = results;

      // 대표 도메인 있을 시 라디오 체크를 위한 처리
      selectedId.value = domainList.value.find(domain => domain.isMain)?.domainUid ?? '';
    }

  } catch (err) {
    console.log(err);
  }

  isLoading.value = false;
};
// ======================= END 리스트 테이블 설정 =======================


// =================== 대표 도메인 설정 ===================
let selectedId = ref<string>('');
let isSelected = ref<boolean>(false);

const selectDomain = (id: string): void => {
  selectedId.value = id;
  isSelected.value = true;
};


let isSetMainLoading = ref<boolean>(false);
/**
 * 대표 도메인 설정
 */
const setNewMain = async (): Promise<void> => {
  try {
    isSetMainLoading.value = true;

    const domain = domainList.value.find(item => item.domainUid === selectedId.value)!;

    const { code } = await myAppApi.patchDomains(clientId, {
      domainUid: domain.domainUid,
      isMain: booleanYN.Y
    });

    const domains: MemberClientDomainItem[] = [];

    if (code === patchDomainsMsg.MAIN_DOMAIN_UPDATE_SUCCESS) {
      // 현재 리스트에서 메인 도메인 업데이트
      domainList.value.forEach((item, idx) => {
        if (item.domainUid !== domain.domainUid) {
          item.isMain = booleanYN.N;
        } else {
          item.isMain = booleanYN.Y;
          domainList.value.unshift(domainList.value.splice(idx, 1)[0]);
        }

        domains.push({
          isMain: item.isMain,
          domain: item.domain,
        });
      });

      Toast('정상적으로 변경되었습니다.');
      setClientAccountDomain(domains);
    }

  } catch (err) {
    util.axiosErrorCatch<PatchDomainRes>(err);

  } finally {
    isSelected.value = false;
    isSetMainLoading.value = false;
  }
};
// =================== END 대표 도메인 설정 ===================


// ==================== 도메인 추가 연결 모달 ====================
let isModalOpen = ref<boolean>(false);
/**
 * 도메인 리스트 업데이트
 * @param uid 도메인 uid
 * @param name 도메인 명
 */
const updateList = (uid: string, name: string) => {
  domainList.value.splice(1, 0, {
    domainUid: uid,
    domain: name,
    isConnect: booleanYN.N,
    isMain: booleanYN.N,
    regDatetime: Date.now(),
    modDatetime: Date.now()
  });
};
// ==================== END 도메인 추가 연결 모달 ====================

// Create
getDomains();
</script>

<template>
  <div id="myApp" class="narrow-content">
    <div>
      <h3 class="subTitle">도메인 연결 정보</h3>

      <div class="mainContent mb-50">
        <StyledButton
          small
          class="mb-20"
          color="primary"
          :icon="mdiMagnify"
          @click="isModalOpen = true"
        >
          도메인 추가 연결
        </StyledButton>

        <h4 class="font-m-2">연결 도메인 목록</h4>

        <StyledButton
          small
          outline
          class="my-10"
          style="min-width: 125px;"
          :disabled="!isSelected"
          :loading="isSetMainLoading"
          @click="setNewMain"
        >
          대표 도메인 설정
        </StyledButton>

        <ListTable
          empty-text="연결된 도메인이 없습니다."
          height="calc(100vh - 375px)"
          :header="tableHeader"
          :items="domainList"
          :loading="isLoading"
        >
          <template #items="{ props }: ListTableItemSlot<GetDomainsResult>">
            <tr @click="selectDomain(props.domainUid)">
              <td class="text-center">
                <input
                  name="mainDomain"
                  type="radio"
                  :checked="selectedId === props.domainUid"
                />
              </td>
              <td>
                {{ props.domain }}
                <span class="mainLabel" v-if="props.isMain">대표</span>
              </td>
              <td>
                <div class="flex-center gap-5">
                  <SvgIcon
                    type="mdi"
                    :class="[props.isConnect ? 'text-point' : 'text-red', 'mr-5']"
                    :path="mdiCheckboxBlankCircle"
                    :size="14"
                  />
                  {{ props.isConnect ? '연결 완료' : '연결중' }}
                </div>
              </td>
            </tr>
          </template>
        </ListTable>
      </div>

      <AddDomain
        @update-list="updateList"
        @close="isModalOpen = false"
        v-if="isModalOpen"
      />
    </div>
  </div>
</template>