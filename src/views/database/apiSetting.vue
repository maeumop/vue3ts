<script setup lang="ts">
import { ref, inject, provide } from 'vue';
import type { ListTableHeader } from '@/components/ListTable/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ToastModel } from '@/components/Toast/types';
import type { DeleteApisRes, GetApisItem, GetApisParam, GetApisRes, PatchApisRes } from '@/types/api/databaseApi';
import { useDatabaseApi } from '@/api/modules/databaseApi';
import { mdiPencil, mdiInformation } from '@/assets/svg/path';
import { useUtil } from '@/js/util';
import ApiSettingForm from './layer/apiSettingForm.vue';
import { deleteApisMsg, patchApisMsg, getApisMsg } from '@/constants/api/databaseApi';
import type { BooleanYN } from '@/types/common';
import type { SpinnerModel } from '@/components/Spinner/types';

const databaseApi = useDatabaseApi();
const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;
const Spinner = inject('Spinner') as SpinnerModel;
const util = useUtil();

let isShow = ref<boolean>(false);
let settingData = ref<GetApisItem | null>(null);

let editIndex = ref<number>(-1);
const list = ref<GetApisItem[]>([]);
const tableHeader: ListTableHeader[] = [
  { text: '업체명', width: '300', },
  { text: 'ON/OFF', width: '150', },
  { text: '매체', width: '250', },
  { text: '전송 URL', width: '', },
  { text: '관리', width: '100', },
];

let dataLoading = ref<boolean>(false);

provide('list', list);

/**
 * API 연동 등록, 수정
 * @param uuid
 */
const regist = (index: number = -1): void => {
  editIndex.value = index;
  isShow.value = true;
};

/**
 * API 삭제
 * @param uuid
 */
const remove = (index: number): void => {
  MessageBox.confirm({
    width: 380,
    title: 'API 연동 내역을 영구 삭제하시겠습니까?',
    message: '[영구 삭제 처리하기] 버튼 클릭 시 해당 연동 내역은 영구 삭제되며, 복구가 불가능합니다.',
    btnOkayText: '영구 삭제 처리하기',
    btnCancelText: '영구 삭제 취소하기',
    asyncOkay: async (): Promise<void> => {
      const apiUid = list.value[index].apiUid;

      // Spinner.show('삭제 중입니다...');

      try {
        const { code } = await databaseApi.deleteApis(apiUid);

        if (code === deleteApisMsg.API_DELETE_SUCCESS) {
          // api 전송
          list.value.splice(index, 1);
          Toast('정상적으로 삭제되었습니다.');
        }
      } catch (err) {
        util.axiosErrorCatch<DeleteApisRes>(err);
      } finally {
        // Spinner.hide();
      }
    }
  });
};

const changeIsUse = async (isUse: BooleanYN, index: number): Promise<void> => {
  const { apiUid } = list.value[index];

  Spinner.show('변경 중입니다...');

  try {
    const { code } = await databaseApi.patchApis(apiUid, { isUse });

    if (code === patchApisMsg.API_PATCH_SUCCESS) {
      Toast(`${isUse ? 'ON' : 'OFF'} 상태로 변경 되었습니다.`);
    }
  } catch (err) {
    util.axiosErrorCatch<PatchApisRes>(err);
  } finally {
    Spinner.hide();
  }
};

let cursor = 0;
let total = 0;
const limit = 50;

const getApiSettingList = async (): Promise<void> => {
  if (total > 0 && total <= list.value.length) {
    return;
  }

  const param: GetApisParam = { limit };

  if (cursor) {
    param.cursor = cursor;
  }

  dataLoading.value = true;

  try {
    const { code, results } = await databaseApi.getApis(param);

    if (code === getApisMsg.API_LIST_GET_SUCCESS) {
      const { totalCount, apis } = results;

      total = totalCount;
      list.value = apis;
    }
  } catch (err) {
    util.axiosErrorCatch<GetApisRes>(err);
  } finally {
    dataLoading.value = false;
  }
};

getApiSettingList();
</script>

<template>
  <div class="content common-list">
    <div class="searchArea">
      <StyledButton color="primary" @click="regist()">
        API 연동
      </StyledButton>
    </div>
    <ListTable
      height="calc(100% - 60px)"
      :loading="dataLoading"
      :header="tableHeader"
      :items="list"
    >
      <template #items="{ props, index }">
        <tr>
          <td>
            <StyledButton
              text
              color="primary"
              :icon="mdiPencil"
              @click="regist(index)"
            >
              {{ props.company }}
            </StyledButton>
          </td>
          <td>
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="['OFF', 'ON']"
              @update:model-value="changeIsUse($event, index)"
              v-model="list[index].isUse"
            />
          </td>
          <td>{{ props.media ?? '전체' }}</td>
          <td>{{ props.url }}</td>
          <td>
            <StyledButton small color="danger" @click="remove(index)">
              삭제
            </StyledButton>
          </td>
        </tr>
      </template>
      <template #empty>
        <div class="flex items-center justify-center">
          <SvgIcon class="icon mr-5" type="mdi" :path="mdiInformation" /> 매체 코드명을 입력 후 검색을 진행해주세요.
        </div>
      </template>
    </ListTable>

    <ApiSettingForm
      ref="form"
      :edit-index="editIndex"
      :api-data="list"
      :setting-data="settingData"
      @close="isShow = false"
      v-if="isShow"
    />
  </div>
</template>
