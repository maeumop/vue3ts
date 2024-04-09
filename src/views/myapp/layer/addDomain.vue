<script setup lang="ts">
import { ref, watch } from 'vue';
import { v1 as uuid } from 'uuid';
import { mdiMagnify, mdiCheckboxBlankCircle } from '@/assets/svg/path';
import { useUtil } from '@/js/util';
import { useMyAppApi } from '@/api/modules/myAppApi';
import type { KeyIndex } from '@/components/types';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { ModalModel } from '@/components/Modal/types';
import type { GetDomainsSearchRes, GetDomainsSearchResult, PostDomainsRes } from '@/types/api/myAppApi';
import { getDomainsSearchMsg, postDomainsMsg } from '@/constants/api/myAppapi';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import { useSessionStore } from '@/store';

const util = useUtil();
const myAppApi = useMyAppApi();

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'updateList', uid: string, name: string): void
}>();

// ====================== 팝업 기본 설정 ======================
const modal = ref<ModalModel>();

let isShow = ref<boolean>(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// ====================== END - 팝업 기본 설정 ======================


// ======================= 리스트 테이블 설정 =======================
const tableHeader: ListTableHeader[] = [
  { text: '검색결과', width: '140' },
  { text: '도메인명', width: '' },
  { text: '선택', width: '70', align: 'center' },
];

let errorMsg = ref<string | null>(null);
// ======================= END 리스트 테이블 설정 =======================

const form = ref<ValidateFormModel>();


// ====================== 도메인 검색 ======================
let searchText = ref<string>('');
let searchedList = ref<GetDomainsSearchResult[]>([]);
let isLoading = ref<boolean>(false);
/**
 * 도메인 검색
 */
const getDomainsSearch = async (): Promise<void> => {
  setErrorMsg();
  domainName.value = '';

  if (isPass.value) {
    searchedList.value = [];
    isLoading.value = true;

    try {
      const { code, results } = await myAppApi.getDomainsSearch({
        domain: searchText.value
      });

      if (code === getDomainsSearchMsg.DOMAIN_SEARCH_SUCCESS) {
        searchedList.value = results;
      }

    } catch (err) {
      util.axiosErrorCatch<GetDomainsSearchRes>(err);
    }

    isLoading.value = false;
  }
};

/**
 * 도메인 검색 API의 result 값을 기준으로 클래스와 상태 텍스트 반환
 * @param result 도메인 검색 result
 */
const setResultInfo = (result: string): KeyIndex<string> => {
  const resultMap: KeyIndex<{}> = {
    '100': {
      class: 'text-point',
      text: '등록 가능'
    },
    'WHOIS_API_FAIL': {
      class: 'text-orange',
      text: '재검색 필요'
    },
    default: {
      class: 'text-red',
      text: '등록 불가'
    }
  };

  return resultMap[result] ?? resultMap.default;
};


let isPass = ref<boolean>(false);
/**
 * 검색어 유효성검사
 */
const setErrorMsg = (): void => {
  isPass.value = false;

  if (!searchText.value) {
    errorMsg.value = '도메인 명을 입력해 주세요.';
  } else if (searchText.value.indexOf('http') > -1) {
    errorMsg.value = '프로토콜(http://, https://)를 재외한 도메인을 입력해주세요.';
  } else if (!util.getRegExp('domainSearch').test(searchText.value)) {
    errorMsg.value = '도메인 형식과 일치하지 않습니다.';

  } else {
    errorMsg.value = null;
    isPass.value = true;
  }
};
// ====================== END 도메인 검색 ======================


// ====================== 도메인 선택 ======================
let domainName = ref<string>('');

/**
 * 도메인 선택
 * - 등록가능 상태인 도메인의 이름만 세팅
 * @param domain 선택한 도메인
 */
const selectDomain = (domain: GetDomainsSearchResult): void => {
  if (domain.result_code === '100') {
    domainName.value = domain.domain;
  }
};


const sessionStore = useSessionStore();
const memberEmail = sessionStore.getMemberEmail;
let isProcessing = ref<boolean>(false);
/**
 * 도메인 신청
 */
const postDomains = async (): Promise<void> => {
  try {
    isProcessing.value = true;
    const newDomainUid = uuid();

    const { code } = await myAppApi.postDomains({
      domainUid: newDomainUid,
      memberEmail,
      domain: domainName.value,
    });

    if (code === postDomainsMsg.DOMAIN_INSERT_SUCCESS) {
      emit('updateList', newDomainUid, domainName.value);
    }

  } catch (err) {
    util.axiosErrorCatch<PostDomainsRes>(err);

  } finally {
    isProcessing.value = false;
    modal.value!.close();
  }
};
// ====================== END 도메인 선택 ======================
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    title="도메인 추가 연결"
    width="512px"
    v-model="isShow"
  >
    <template #body>
      <div class="mb-10">
        <ValidateForm ref="form">
          <TextField
            block
            label="도메인 검색"
            placeholder="도메인 명을 입력해 주세요."
            :icon="mdiMagnify"
            :max-length="50"
            :error-message="errorMsg"
            :icon-action="getDomainsSearch"
            @blur="setErrorMsg"
            @keyup.enter="getDomainsSearch"
            v-model="searchText"
          />
        </ValidateForm>
      </div>

      <ListTable
        class="mb-20"
        empty-text="도메인명 입력 후 검색을 진행해 주세요."
        :height="270"
        :header="tableHeader"
        :items="searchedList"
        :loading="isLoading"
      >
        <template #items="{ props }: ListTableItemSlot<GetDomainsSearchResult>">
          <tr @click="selectDomain(props)">
            <td class="flex-center gap-5">
              <SvgIcon
                type="mdi"
                :class="setResultInfo(props.result_code).class"
                :path="mdiCheckboxBlankCircle"
                :size="14"
              />
              {{ setResultInfo(props.result_code).text }}
            </td>
            <td>{{ props.domain }}</td>
            <td class="text-center">
              <input
                name="selected"
                type="radio"
                :checked="domainName === props.domain"
                v-if="props.result_code === '100'"
              />
              <span v-else>-</span>
            </td>
          </tr>
        </template>
      </ListTable>

      <ul class="info-box-bullet">
        <li>검색결과 ‘등록 가능’ 상태의 도메인만 연결 신청이 가능합니다.</li>
        <li>국내 도메인(.co.kr / .kr) 에 대한 검색 결과만 확인 가능합니다.</li>
        <li>도메인 구매(연결 신청) 1건당 33.000원(VAT포함) 비용이 발생합니다.</li>
        <li>도메인 연결 신청 시 1~3일 정도의 작업 기간이 소요됩니다.</li>
      </ul>
    </template>

    <template #action="{ close }">
      <StyledButton
        outline
        class="mr-10"
        @click="close"
      >
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        style="min-width: 91px;"
        :disabled="!domainName"
        :loading="isProcessing"
        @click="postDomains"
      >
        연결 신청
      </StyledButton>
    </template>
  </Modal>
</template>