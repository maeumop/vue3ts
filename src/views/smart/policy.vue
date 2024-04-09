<script setup lang="ts">
import PolicyRegister from './layer/policyRegister.vue';
import Copy from './layer/copy.vue';
// import Preview from '@/views/common/preview.vue';

import { reactive, ref, inject } from 'vue';
import { useUtil } from '@/js/util';
import { mdiMagnify, mdiPlus, mdiRefresh, mdiPencil } from '@/assets/svg/path';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type {
  GetTermsParam, GetTermsRes,
  TermsItem,
  DeleteTermsRes,
} from '@/types/api/smartEditorApi';

// import { previewType } from '@/constants/common';

// import type { SpinnerModel } from '@/components/Spinner/types';
import type { ListTableModel, ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { OptionItem, KeyIndex } from '@/components/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ToastModel } from '@/components/Toast/types';

import { COPY_MODE } from '@/constants/smart';
import type { CopyPropsData } from '@/types/smart';
import { useClientStore } from '@/store';
// import type { ProcessEnv } from '@/types/common';

const util = useUtil();
const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;
// const Spinner = inject('Spinner') as SpinnerModel;

const validateForm = ref<ValidateFormModel>();
const smartEditorApi = useSmartEditorApi();


const clientStore = useClientStore();

// ======= 팝업들 설정 ====================
let selectedIdx = ref<number>(-1);
let isShow = reactive<KeyIndex<boolean>>({
  register: false,
  policyCopy: false,
  preview: false,
});
const onPopupClose = (flag: string): void => {
  isShow[flag] = false;
  selectedIdx.value = -1;
  previewPageCode.value = '';
};
// END - 팝업들 설정 ====================

// ListTable
const listTable = ref<ListTableModel>();
const tableHeader = ref<ListTableHeader[]>([
  { text: '페이지 명', },
  { text: '코드', width: '180' },
  { text: '레이아웃', width: '220' },
  { text: '미리보기', width: '150' },
  { text: '관리', width: '250' },
]);


let selectTableColumn = ref<string>('');
const optTableColumn: OptionItem[] = [
  { value: 'pageName', text: '페이지명', },
  { value: 'pageCode', text: '코드', },
  { value: 'layoutName', text: '레이아웃', },
];

let totalCount = ref<number>(0);
let list = ref<TermsItem[]>([]);
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

// 검색, 필터 설정 초기화
const onInit = (): void => {
  searchText.value = '';
  selectTableColumn.value = '';
  onSearch(false);
};
// End - 검색 ===========================


// ======= 삭제 =====================================
/**
 * 약관페이지 삭제
 * @param index 약관페이지 index
 */
const deleteTerms = async (index: number): Promise<void> => {
  try {
    await smartEditorApi.deleteTerms(list.value[index].termsPageUid);
    Toast('정상적으로 삭제되었습니다.');
    list.value.splice(index, 1);
    totalCount.value--;

  } catch (err) {
    util.axiosErrorCatch<DeleteTermsRes>(err);
  }
};

/**
 * 버튼 클릭
 * @param index 삭제할 페이지 index
 */
const onClickDelete = (index: number) => {
  if (dataLoading.value) {
    return;
  }

  MessageBox.confirm({
    title: '약관 페이지를 삭제하시겠습니까?',
    message: '[삭제 처리하기] 버튼 클릭 시 해당 데이터는 삭제되며, 복구가 불가능 합니다.',
    btnOkayText: '삭제 처리하기',
    btnCancelText: '삭제 취소하기',
    asyncOkay: async (): Promise<void> => {
      await deleteTerms(index);
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

  isShow.policyCopy = true;
  selectedIdx.value = index;
};

/**
 * 복사된 약관페이지를 리스트에 반영
 * @param data 복사에 필요한 데이터
 */
const setCopy = async (data: CopyPropsData): Promise<void> => {
  if (searched.value) {
    onInit();
  } else {
    const newData: TermsItem = {
      ...list.value[selectedIdx.value],
      pageName: data.name,
      termsPageUid: data.uid,
      pageCode: data.code!,
      htmlPath: `terms/${data.code}`
    };
    list.value.unshift(newData);
    totalCount.value++;
  }
};
// ======= End - 복사 =====================================


/**
 * 약관 페이지 등록/수정
 * @param index 수정할 페이지 index
 */
const onClickRegister = (index = -1): void => {
  isShow.register = true;
  selectedIdx.value = index;
};

const onCreate = (data: TermsItem): void => {
  if (searched.value) {
    onInit();
  } else {
    data.htmlPath = `terms/${data.pageCode}`;
    list.value.unshift({ ...data });
    totalCount.value++;
  }
};

/**
 * 수정된 내용 리스트에 반영
 * @param data 수정된 데이터
 */
const onEdit = (data: TermsItem) => {
  Object.assign(list.value[selectedIdx.value], data);
};


// ======= 데이터 불러옴 =====================================
validateForm.value?.formProtection(true);
const getData = async (): Promise<void> => {
  try {
    dataLoading.value = true;
    validateForm.value?.formProtection(true);

    const _column = selectTableColumn.value ? `column=${selectTableColumn.value}&` : '' ;
    const _word = searchText.value ? `word=${searchText.value}` : '';

    const params: GetTermsParam = { limit };
    if (cursor.value) {
      params.cursor = cursor.value;
    }
    if (`${_column}${_word}` !== '') {
      params.search = encodeURIComponent(`${_column}${_word}`);
    }

    const { results }: GetTermsRes = await smartEditorApi.getTerms(params);
    results.terms.forEach(item => list.value.push(item));

    totalCount.value = results.totalCount;
    observer.value = !(totalCount.value <= list.value.length);

    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].regDatetime;
    }

  } catch (err) {
    util.axiosErrorCatch<GetTermsRes>(err);

  } finally {
    dataLoading.value = false;
    validateForm.value?.formProtection(false);
  }
};

let previewPageCode = ref<string>('');

// 약관 새창
/**
 * 대표도메인으로 바로 보기
 * 추후 별다른 변경이 없는 경우 코멘트 된 코드 제거
 * @editDate 2024-03-26
 * @editor 김종윤
 * @param pageCode
 */
const termsPreview = (pageCode: string): void => {
  const main = clientStore.getClientAccount.domains.filter(item => item.isMain)[0];

  if (main.domain) {
    window.open(`https://${main.domain}/terms/${pageCode}`);
  } else {
    MessageBox.alert('대표 도메인 설정이 이루어지지 않았습니다.');
  }

  // window.open();
  // previewPageCode.value = termsPageUid;
  // isShow.preview = true;
  // Spinner.delay(0).show('Loading…');
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
          <SelectBox
            block
            clearable
            placeholder="전체"
            class="width-150"
            :options="optTableColumn"
            v-model="selectTableColumn"
          />

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
            약관 페이지 등록
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
      <template #items="{ props, index }: ListTableItemSlot<TermsItem>">
        <tr :key="`list-${props.termsPageUid}`">
          <td>
            <StyledButton
              text
              color="primary"
              :icon="mdiPencil"
              @click.prevent="onClickRegister(index)"
            >
              {{ props.pageName }}
            </StyledButton>
          </td>
          <td>{{ props.pageCode }}</td>
          <td>{{ props.layoutName }}</td>
          <td>
            <StyledButton
              outline
              small
              color="secondary"
              @click="termsPreview(props.pageCode)"
            >
              보기
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

    <PolicyRegister
      :index="selectedIdx"
      :data="list[selectedIdx]"
      @close="onPopupClose('register')"
      @on:create="onCreate"
      @on:edit="onEdit"
      v-if="isShow.register"
    />

    <Copy
      :type="COPY_MODE.TERMS"
      :uid="list[selectedIdx]?.termsPageUid"
      @close="onPopupClose('policyCopy')"
      @copy="setCopy"
      v-if="isShow.policyCopy"
    />
    <!--
    <Preview
      :unique-key="previewPageCode"
      :type="previewType.terms"
      @close="onPopupClose('preview')"
      @iframe-loaded="Spinner.close()"
      v-if="isShow.preview"
    /> -->

  </div>
</template>
