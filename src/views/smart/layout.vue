<script setup lang="ts">
import LayoutRegister from './layer/layoutRegister.vue';
import Copy from './layer/copy.vue';

import axios from 'axios';
import { reactive, ref, inject } from 'vue';
import { useUtil } from '@/js/util';
import { mdiMagnify, mdiPlus, mdiRefresh, mdiPencil } from '@/assets/svg/path';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type {
  GetLayoutsParam, GetLayoutsRes,
  LayoutItem,
  DeleteLayoutsRes,
} from '@/types/api/smartEditorApi';

import type { ListTableModel, ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { KeyIndex } from '@/components/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

import { COPY_MODE } from '@/constants/smart';
import type { CopyPropsData } from '@/types/smart';
import { deleteLayoutsMsg } from '@/constants/api/smartEditorApi';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;

const validateForm = ref<ValidateFormModel>();
const smartEditorApi = useSmartEditorApi();

// ======= 팝업들 설정 ====================
let selectedIdx = ref<number>(-1);
let isShow = reactive<KeyIndex<boolean>>({
  register: false,
  layoutCopy: false,
});
const onPopupClose = (flag: string): void => {
  isShow[flag] = false;
  selectedIdx.value = -1;
};
// END - 팝업들 설정 ====================

// ListTable
const listTable = ref<ListTableModel>();
const tableHeader = ref<ListTableHeader[]>([
  { text: '레이아웃',  },
  { text: '관리', width: '250' },
]);

let totalCount = ref<number>(0);
const list = ref<LayoutItem[]>([]);
let dataLoading = ref<boolean>(true);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;


// 검색 ===========================
let searchText = ref<string>('');
let searched = ref<boolean>(false);
const onSearch = (search: boolean = true): void => {
  searched.value = search;
  list.value = [];
  cursor.value = 0;
  totalCount.value = 0;
  getData();
};

/**
 * 검색 설정 초기화
 */
const onInit = (): void => {
  searchText.value = '';
  onSearch(false);
};
// End - 검색 ===========================


// ======= 삭제 =====================================

const alertMessage = () => {
  MessageBox.alert({
    title: '삭제가 불가능합니다.',
    message: '해당 레이아웃을 참조하고 있는 데이터(페이지, 컴포넌트) 존재 시 삭제가 불가능합니다.',
    btnOkayText: '확인',
  });
};

/**
 * 삭제 API 호출
 * @param layoutUid string
 */
const deleteLayouts = async (index: number): Promise<void> => {
  try {
    await smartEditorApi.deleteLayouts(list.value[index].layoutUid);
    Toast('정상적으로 삭제되었습니다.');
    list.value.splice(index, 1);
    totalCount.value --;

  } catch (err) {
    if (axios.isAxiosError<DeleteLayoutsRes, any>(err)) {
      const { response } = err;

      if (response) {
        const { code } = response.data;
        if (code === deleteLayoutsMsg.SMART_LAYOUT_USED) {
          MessageBox.destroy();
          alertMessage();
        } else {
          Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });
        }
      }

    } else {
      console.error(err);
    }
  }
};


/**
 * 버튼 클릭 > MessageBox 출력
 * @param index 삭제할 페이지 index
 */
const onClickDelete = async (index: number) => {
  if (dataLoading.value) {
    return;
  }

  // deleteMessage();
  MessageBox.confirm({
    title: '레이아웃을 삭제하시겠습니까?',
    message: '[삭제 처리하기] 버튼 클릭 시 해당 데이터는 삭제되며, 복구가 불가능 합니다.',
    btnOkayText: '삭제 처리하기',
    btnCancelText: '삭제 취소하기',
    asyncOkay: async (): Promise<void> => {
      await deleteLayouts(index);
    }
  });

};
// ======= End - 삭제 =====================================


// ======= 복사 =====================================
/**
 * 복사 팝업 출력
 * @param index 복사할 페이지 index
 */
const onCopy = (index: number) => {
  if (dataLoading.value) {
    return;
  }
  isShow.layoutCopy = true;
  selectedIdx.value = index;
};

/**
 * 복사된 레이아웃을 리스트에 반영
 * @param data 복사에 필요한 데이터
 */
const setCopy = async (data: CopyPropsData): Promise<void> => {
  if (searched.value) {
    onInit();
  } else {
    const newData: LayoutItem = {
      ...list.value[selectedIdx.value],
      layoutName: data.name,
      layoutUid: data.uid
    };
    list.value.unshift(newData);
    totalCount.value++;
  }
};
// ======= End - 복사 =====================================


/**
 * 레이아웃 등록/수정
 * @param index 수정할 페이지 index
 */
const onClickRegister = (index = -1): void => {
  isShow.register = true;
  selectedIdx.value = index;
};

const onCreate = (data: LayoutItem): void => {
  if (searched.value) {
    onInit();

  } else {
    list.value.unshift({ ...data });
    totalCount.value++;
  }
};

/**
 * 수정된 내용 리스트에  반영
 * @param data 수정된 data
 */
const onEdit = (data: LayoutItem): void => {
  Object.assign(list.value[selectedIdx.value], data);
};


// ======= 데이터 불러옴 =====================================
validateForm.value?.formProtection(true);
const getData = async (): Promise<void> => {
  try {
    dataLoading.value = true;
    validateForm.value?.formProtection(true);

    const params: GetLayoutsParam = { limit };
    if (cursor.value) {
      params.cursor = cursor.value;
    }
    if (searchText.value) {
      params.search = encodeURIComponent(`word=${searchText.value}`);
    }

    const { results }: GetLayoutsRes = await smartEditorApi.getLayouts(params);
    results.layouts.forEach(item => list.value.push(item));
    totalCount.value = results.totalCount;

    observer.value = !(totalCount.value <= list.value.length);
    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].regDatetime;
    }

  } catch (err) {
    util.axiosErrorCatch<GetLayoutsRes>(err);

  } finally {
    dataLoading.value = false;
    validateForm.value?.formProtection(false);
  }
};

getData();
// End - 데이터 불러옴 ========================================
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

          <TextField
            block
            placeholder="검색어를 입력해주세요."
            class="width-250"
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
            :icon="mdiRefresh"
            @click.prevent="onInit"
          />
        </div>
      </div>

      <div class="searchArea">
        <div class="flex gap-8">
          <StyledButton
            icon-left
            color="primary"
            :icon="mdiPlus"
            @click.prevent="onClickRegister()"
          >
            레이아웃 등록
          </StyledButton>
        </div>
      </div>
    </ValidateForm>

    <ListTable
      ref="listTable"
      empty-text="데이터가 존재하지 않습니다"
      :height="`calc(100% - 121px)`"
      :header="tableHeader"
      :items="list"
      :loading="dataLoading"
      :observer="observer"
      @observe="getData"
    >
      <template #items="{ props, index }: ListTableItemSlot<LayoutItem>">
        <tr :key="`list-${props.layoutUid}`">
          <td>
            <StyledButton
              text
              color="primary"
              :icon="mdiPencil"
              @click.prevent="onClickRegister(index)"
            >
              {{ props.layoutName }}
            </StyledButton>
          </td>
          <td>
            <div class="flex-center gap-4">
              <StyledButton
                outline
                small
                color="secondary"
                @click.prevent="onCopy(index)"
              >
                복사
              </StyledButton>

              <StyledButton
                outline
                small
                color="secondary"
                @click.prevent="onClickDelete(index)"
              >
                삭제
              </StyledButton>
            </div>
          </td>
        </tr>
      </template>
    </ListTable>

    <LayoutRegister
      :index="selectedIdx"
      :data="list[selectedIdx]"
      @close="onPopupClose('register')"
      @on:create="onCreate"
      @on:edit="onEdit"
      v-if="isShow.register"
    />

    <Copy
      :type="COPY_MODE.LAYOUT"
      :uid="list[selectedIdx]?.layoutUid"
      @close="onPopupClose('layoutCopy')"
      @copy="setCopy"
      v-if="isShow.layoutCopy"
    />
  </div>
</template>
