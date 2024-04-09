<script setup lang="ts">
import ScriptRegister from './layer/scriptRegister.vue';
import Copy from './layer/copy.vue';
import axios from 'axios';
import { reactive, ref, inject } from 'vue';
import { mdiMagnify, mdiPlus, mdiRefresh, mdiPencil } from '@/assets/svg/path';
import { useUtil } from '@/js/util';
import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type {
  GetScriptsParam, GetScriptsRes,
  ScriptItem,
  DeleteScriptsRes,
} from '@/types/api/smartEditorApi';

import type { ListTableModel, ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { KeyIndex } from '@/components/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ToastModel } from '@/components/Toast/types';

import { COPY_MODE } from '@/constants/smart';
import type { CopyPropsData } from '@/types/smart';
import { deleteScriptsMsg } from '@/constants/api/smartEditorApi';

const util = useUtil();
const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;

const validateForm = ref<ValidateFormModel>();

const smartEditorApi = useSmartEditorApi();


// ======= 팝업들 설정 ====================
let selectedIdx = ref<number>(-1);
let isShow = reactive<KeyIndex<boolean>>({
  register: false,
  scriptCopy: false,
});
const onPopupClose = (flag: string): void => {
  isShow[flag] = false;
  selectedIdx.value = -1;
};
// END - 팝업들 설정 ====================

// ListTable
const listTable = ref<ListTableModel>();
const tableHeader = ref<ListTableHeader[]>([
  { text: '스크립트명', },
  { text: '관리', width: '250' },
]);


let totalCount = ref<number>(0);
let list = ref<ScriptItem[]>([]);
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
 * 검색 필터 설정 초기화
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
    message: '해당 전환 스크립트을 참조하고 있는 데이터(페이지, 컴포넌트) 존재 시 삭제가 불가능합니다.',
    btnOkayText: '확인',
  });
};

/**
 * 스크립트 삭제
 * @param index
 */
const deleteScript = async (index: number): Promise<void> => {
  try {
    await smartEditorApi.deleteScripts(list.value[index].scriptUid);
    Toast('정상적으로 삭제되었습니다.');
    list.value.splice(index, 1);
    totalCount.value--;

  } catch (err) {
    if (axios.isAxiosError<DeleteScriptsRes, any>(err)) {
      const { response } = err;

      if (response) {
        const { code } = response.data;

        if (code === deleteScriptsMsg.SMART_SCRIPT_USED) {
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
 * 삭제 버튼 클릭
 * @param index 삭제할 스크립트 index
 */
const onClickDelete = (index: number) => {
  MessageBox.confirm({
    title: '전환 스크립트을 삭제하시겠습니까?',
    message: '[삭제 처리하기] 버튼 클릭 시 해당 데이터는 삭제되며, 복구가 불가능 합니다.',
    btnOkayText: '삭제 처리하기',
    btnCancelText: '삭제 취소하기',
    asyncOkay: async (): Promise<void> => {
      await deleteScript(index);
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
  isShow.scriptCopy = true;
  selectedIdx.value = index;
};


/**
 * 복사된 스크립트를 리스트에 반영
 * @param data 복사에 필요한 데이터
 */
const setCopy = (data: CopyPropsData): void => {
  if (searched.value) {
    onInit();
  } else {
    const newData: ScriptItem = {
      ...list.value[selectedIdx.value],
      scriptName: data.name,
      scriptUid: data.uid,
    };
    list.value.unshift(newData);
    totalCount.value++;
  }
};
// ======= End - 복사 =====================================


/**
 * 스크립트 등록/수정
 * @param index 수정할 페이지 index
 */
const onClickRegister = (index = -1): void => {
  isShow.register = true;
  selectedIdx.value = index;
};


const onCreate = (data: ScriptItem): void => {
  if (searched.value) {
    onInit();

  } else {
    list.value.unshift({ ...data });
    totalCount.value++;
  }
};

/**
 * 수정 된 스크립트 리스트에 반영
 * @param data 팝업에서 전달해준 데이터
 */
const onEdit = (data: any) => {
  Object.assign(list.value[selectedIdx.value], data);
};


// ======= 데이터 불러옴 =====================================
validateForm.value?.formProtection(true);
const getData = async (): Promise<void> => {
  try {
    dataLoading.value = true;
    validateForm.value?.formProtection(true);

    const params: GetScriptsParam = { limit };
    if (cursor.value) {
      params.cursor = cursor.value;
    }
    if (searchText.value) {
      params.search = encodeURIComponent(searchText.value ? `word=${searchText.value}` : '');
    }

    const { results }: GetScriptsRes = await smartEditorApi.getScripts(params);
    results.scripts.forEach(item => list.value.push(item));
    totalCount.value = results.totalCount;

    observer.value = !(totalCount.value <= list.value.length);
    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].regDatetime;
    }

  } catch (err) {
    util.axiosErrorCatch<GetScriptsRes>(err);

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
            스크립트 등록
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
      <template #items="{ props, index }: ListTableItemSlot<ScriptItem>">
        <tr :key="`list-${props.scriptUid}`">
          <td>
            <StyledButton
              text
              color="primary"
              :icon="mdiPencil"
              @click.prevent="onClickRegister(index)"
            >
              {{ props.scriptName }}
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

    <ScriptRegister
      :index="selectedIdx"
      :data="list[selectedIdx]"
      @close="onPopupClose('register')"
      @on:create="onCreate"
      @on:edit="onEdit"
      v-if="isShow.register"
    />

    <Copy
      :type="COPY_MODE.SCRIPT"
      :uid="list[selectedIdx]?.scriptUid"
      @close="onPopupClose('scriptCopy')"
      @copy="setCopy"
      v-if="isShow.scriptCopy"
    />
  </div>
</template>
