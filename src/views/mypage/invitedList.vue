<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import { useUtil } from '@/js/util';
import { mdiAlertCircle } from '@/assets/svg/path';

import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import type {
  PatchMembersAuthsRes, DeleteMembersAuthsRes,
  GetMembersClientsParam, GetMembersClientsRes, MemberClientItem
} from '@/types/api/memberAccountApi';

import { CONST_CODES } from '@/constants/common';
import { useConstCodeCategory } from '@/js/common';
import type { CategoryCodeItemType, CodeItemType } from '@/types/common';

import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { KeyIndex } from '@/components/types';

const props = defineProps<{
  isActive: boolean
}>();

const MessageBox = inject('MessageBox') as MessageBoxModel;

const { AUTH, CLIENT_ACCOUT_SERVICE } = CONST_CODES;

const util = useUtil();
const memberAccountApi = useMemberAccountApi();

// ============== 카테고리 ========================================
const CLIENT_CATEGORY = useConstCodeCategory();
const CLIENT_VAL: KeyIndex<string> = {};

type CateType = CodeItemType | CategoryCodeItemType;

const SET_CATE = (cate: CategoryCodeItemType) => {
  const _CATE = (codes: CateType[], text?: string) => {
    codes.forEach(item => {
      CLIENT_VAL[`${text ? text + '_' : ''}${item.VAL}`] = item.TXT;
      if ('codes' in item) {
        _CATE(item.codes, item.VAL);
      }
    });
  };
  _CATE(cate.codes);
};
SET_CATE(CLIENT_CATEGORY);
// End - 카테고리 ========================================


const emit = defineEmits<{
  (event: 'onAccept'): void
}>();

// ListTable
const tableHeader: ListTableHeader[] = [
  { text: '초대일', width: '180', },
  { text: '구분', width: '80', },
  { text: '광고주 이름', width: '150', },
  { text: '카테고리', },
  { text: '권한', width: '180', },
  { text: '관리', width: '180', },
];

/**
 * 초대 수락 API 호출
 */
const setAccept = async (uid: string): Promise<void> => {
  try {
    await memberAccountApi.patchMembersAuths(uid);
    emit('onAccept');

  } catch (err) {
    util.axiosErrorCatch<PatchMembersAuthsRes>(err);
  }
};


/**
 * 초대 수락 confirm 노출
 * @param idx list index값
 */
const showAcceptMessage = (idx: number): void => {
  MessageBox.confirm({
    title: '초대를 수락하시겠습니까?',
    message: '초대 수락 시 부여된 권한에 따라 해당 광고주 ID의 솔루션 화면에 접근할 수 있는 권한이 부여됩니다. 단, 해당 광고주ID에 연동된 멤버에게 본인의 이메일 정보가 노출될 수 있습니다.',
    btnOkayText: '초대 수락하기',
    btnCancelText: '다음에 수락하기',
    asyncOkay: async (): Promise<void> => {
      await setAccept(list.value[idx].clientAccountMemberRelUid);
      list.value.splice(idx, 1);
    }
  });
};

/**
 * 초대 거절 API 호출
 */
const setRefuse = async (uid: string): Promise<void> => {
  try {
    await memberAccountApi.deleteMembersAuths(uid);

  } catch (err) {
    util.axiosErrorCatch<DeleteMembersAuthsRes>(err);
  }
};

/**
 * 초대 거절 confirm 노출
 * @param idx list index값
 */
const showRefuseMessage = (idx: number): void => {
  MessageBox.confirm({
    title: '초대를 거절하시겠습니까?',
    message: '초대 거절 시 해당 광고주 ID의 솔루션 화면에 접근할 수 없습니다. 거절 후 해당 광고주 ID의 솔루션에 다시 접근 필요시 새로운 초대를 받으셔야 합니다.',
    btnOkayText: '초대 거절하기',
    btnCancelText: '다음에 거절하기',
    asyncOkay: async (): Promise<void> => {
      await setRefuse(list.value[idx].clientAccountMemberRelUid);
      list.value.splice(idx, 1);
    }
  });
};

// ======= 데이터 불러옴 =====================================
let list = ref<MemberClientItem[]>([]);
let dataLoading = ref<boolean>(true);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;
let totalCount: number = 0;

const getData = async (): Promise<void> => {
  try {
    dataLoading.value = true;
    const params: GetMembersClientsParam = { limit, join: 0 };
    if (cursor.value) {
      params.cursor = cursor.value;
    }

    const { results }: GetMembersClientsRes = await memberAccountApi.getMembersClients(params);

    results.clients.forEach(item => list.value.push(item));
    totalCount = results.totalCount;

    observer.value = !(totalCount <= list.value.length);
    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].inviteDatetime;
    }

  } catch (err) {
    util.axiosErrorCatch<GetMembersClientsRes>(err);

  } finally {
    dataLoading.value = false;
  }
};

// props isActive를 추가하여 초대받은 내역 탭을 클릭 할 경우
// 데이터를 호출 하도록 수정
watch(() => props.isActive, (active) => {
  if (active) {
    getData();
  }
});
</script>

<template>
  <div class="content invitedList" id="invitedList">
    <ListTable
      ref="listTable"
      empty-text="초대 받은 내역이 존재하지 않습니다."
      height="100%"
      :header="tableHeader"
      :items="list"
      :loading="dataLoading"
      :observer="observer"
      @observe="getData"
    >
      <template #items="{ props, index }: ListTableItemSlot<MemberClientItem>">
        <tr :key="`list-${props.regDatetime}`">
          <td>{{ util.getDateFormat(props.inviteDatetime, 'Y-m-d H:i:s') }}</td>
          <td>
            {{ CLIENT_ACCOUT_SERVICE[props.serviceType].TXT }}
          </td>
          <td>{{ props.clientName }}</td>

          <td> {{ CLIENT_VAL[props.mainCategory] }} > {{ CLIENT_VAL[`${props.mainCategory}_${props.subCategory}`] }}</td>
          <td>
            {{ AUTH[props.authLevel].TXT }}
          </td>
          <td>
            <div class="flex gap-10">
              <StyledButton
                block
                small
                outline
                @click.prevent="showRefuseMessage(index)"
              >
                거절
              </StyledButton>

              <StyledButton
                block
                small
                outline
                @click.prevent="showAcceptMessage(index)"
              >
                수락
              </StyledButton>
            </div>
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
          초대 받은 내역이 존재하지 않습니다.
        </div>
      </template>
    </ListTable>
  </div>
</template>

<style>
.invitedList .list-table table thead th {border-top: 0}
</style>