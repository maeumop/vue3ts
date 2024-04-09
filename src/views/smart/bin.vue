<script setup lang="ts">
import PageDelete from './layer/pageDelete.vue';
import ListTableCheckbox from '@/components/ListTable/listCheck.vue';
import Preview from '@/views/common/preview.vue';

import { reactive, ref, inject } from 'vue';
import { useUtil } from '@/js/util';
import {
  mdiMagnify,
  mdiRefresh,
  mdiCheckboxMarked,
  mdiCheckboxBlankOutline,
  mdiTrashCanOutline,
  mdiHelpCircleOutline,
  mdiWindowClose
} from '@/assets/svg/path';

import { previewType } from '@/constants/common';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type {
  GetPageBinsItem,
  GetPageBinsParam, GetPageBinsRes,
  PostPageBinToPagesParam, PostPageBinToPagesRes,
} from '@/types/api/smartEditorApi';

import type { ListTableModel, ListTableItemSlot } from '@/components/ListTable/types';
import type { OptionItem, KeyIndex } from '@/components/types';

import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const smartEditorApi = useSmartEditorApi();

const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;

const validateForm = ref<ValidateFormModel>();

// 팝업들 설정 ====================
let isShow = reactive<KeyIndex<boolean>>({
  pageDelete: false,
  preview: false,
});
const onPopupClose = (flag: string): void => {
  isShow[flag] = false;
  previewPageCode.value = '';
};
// END - 팝업들 설정 ====================

// ListTable
const listTable = ref<ListTableModel>();
let selectTableColumn = ref<string>('');
const optTableColumn: OptionItem[] = [
  { value: 'pageName', text: '페이지명', },
  { value: 'pageCode', text: '코드', },
  { value: 'layoutName', text: '레이아웃', },
];


let totalCount = ref<number>(0);
let list = ref<GetPageBinsItem[]>([]);
let dataLoading = ref<boolean>(true);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;

const isAllCheck = ref(false);
// list table 체크 박스 ===============================
const checkList = ref<string[]>([]);
let checkCount = ref<number>(1);
const checkAll = (checked: boolean): void => {
  if (checked) {
    list.value.forEach(item => {
      checkList.value.push(item.pageBinUid);
    });
  } else {
    checkList.value = [];
  }
  isAllCheck.value = checked;
  checkCount.value = checkList.value.length;
};

const listTableCheck = (checked: boolean, value: string): void => {
  const idx: number = checkList.value.indexOf(value);

  if (checked && idx === -1) {
    checkList.value.push(value);
  } else if (!checked && idx > -1) {
    checkList.value.splice(idx, 1);
  }
  checkCount.value = checkList.value.length;
};
// End - list table 체크 박스 ===============================

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
  list.value = [];
  selectTableColumn.value = '';
  searchText.value = '';
  totalCount.value = 0;
  onSearch(false);
};
// End - 검색 ===========================


/**
 * 페이지 영구 삭제 팝업 출력
 */
const onPageDelete = (): void => {
  isShow.pageDelete = true;
  checkCount.value = checkList.value.length;
};


/**
 * 모바일, 백 페이지 미리보기
 * @param pageCode 모바일, 백 페이지 코드
 */
let previewPageCode = ref<string>('');
const viewPage = (pageCode: string): void => {
  isShow.preview = true;
  previewPageCode.value = pageCode;
};

/**
 * 리스트에서 체크된 페이지 제거
 */
const setPageDelete = (): void => {
  list.value = list.value.filter(item => {
    return !(checkList.value.includes(item.pageBinUid));
  });

  totalCount.value -= checkList.value.length;
  checkList.value = [];
  listTable.value!.checkedToggle();
};


/**
 * 페이지 복구 처리
 */
const pageReturn = async (): Promise<void> => {
  try {
    validateForm.value?.formProtection(true);

    const param: PostPageBinToPagesParam =  {
      pageBinUids: checkList.value
    };

    await smartEditorApi.postBinToPages(param);
    Toast(`${checkCount.value}개의 페이지가 복구되었습니다.`);
    setPageDelete();

  } catch (err) {
    util.axiosErrorCatch<PostPageBinToPagesRes>(err);

  } finally {
    totalCount.value -= checkList.value.length;
    isAllCheck.value = false;
    checkList.value = [];
    validateForm.value?.formProtection(false);
  }
};

/**
 * 페이지 복구 MessageBox
 */
const onClickPageReturn = (): void => {
  MessageBox.confirm({
    title: `${checkCount.value}개의 고객 페이지를 복구하시겠습니까?`,
    message:
      '[복구 처리하기] 버튼 클릭 시 선택하신 페이지는 ‘페이지’ 화면으로 이동됩니다.',
    btnOkayText: '복구 처리하기',
    btnCancelText: '취소하기',
    asyncOkay: async (): Promise<void> => {
      await pageReturn();
    },
  });
};


// 데이터 불러옴 ========================================
const getData = async (): Promise<void> => {
  try {
    dataLoading.value = true;
    validateForm.value?.formProtection(true);

    const _column = selectTableColumn.value ? `&column=${selectTableColumn.value}` : '';
    const search = searchText.value ? `${_column}&word=${searchText.value}` : '';
    const param: GetPageBinsParam = { limit };

    if (search) {
      param.search = encodeURIComponent(`${search}`);
    }
    if (cursor.value) {
      param.cursor = cursor.value;
    }

    const { results }: GetPageBinsRes = await smartEditorApi.getPageBins(param);
    results.pages.forEach(item => list.value.push(item));
    totalCount.value = results.totalCount;

    observer.value = !(totalCount.value <= list.value.length);
    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].delDatetime;
    }

  } catch (err) {
    util.axiosErrorCatch<GetPageBinsRes>(err);

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
            :icon-action="() => onSearch()"
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
            only-icon
            outline
            color="secondary"
            :icon="mdiTrashCanOutline"
            :disabled="!checkList.length"
            @click.prevent="onPageDelete()"
          />

          <StyledButton
            outline
            color="secondary"
            :disabled="!checkList.length"
            @click.prevent="onClickPageReturn"
          >
            복구
          </StyledButton>
        </div>
      </div>
    </ValidateForm>

    <ListTable
      ref="listTable"
      header-th-length="7"
      :height="`calc(100% - 121px)`"
      :items="list"
      :loading="dataLoading"
      :observer="observer"
      @observe="getData"
    >
      <template #header>
        <tr>
          <th width="56" class="center">
            <SvgIcon
              type="mdi"
              class="text-point"
              :path="mdiCheckboxMarked"
              @click.prevent="checkAll(false)"
              v-if="isAllCheck"
            />

            <SvgIcon
              type="mdi"
              class="text-gray-400"
              :path="mdiCheckboxBlankOutline"
              @click.prevent="checkAll(true)"
              v-else
            />
          </th>
          <th width="120">
            <Tooltip right btn-close>
              <template #default="{ toggle }">
                <div class="flex-center" @click="toggle">
                  남은기간
                  <SvgIcon
                    class="ml-3"
                    type="mdi"
                    size="15"
                    :path="mdiHelpCircleOutline"
                  />
                </div>
              </template>

              <template #content>
                <div class="tooltip-popup">
                  <ul>
                    <li>남은 기간: 자동 영구 삭제까지의 남은 기간을 의미하며, 휴지통에 있는 페이지는 30일 후에 영구 삭제됩니다.</li>
                  </ul>
                </div>
              </template>
            </tooltip>
          </th>
          <th width="500">페이지명</th>
          <th width="180">레이아웃</th>
          <th width="180">코드</th>
          <th width="180">미리보기</th>
          <th width="180">사유</th>
        </tr>
      </template>

      <template #items="{ props }: ListTableItemSlot<GetPageBinsItem>">
        <tr :key="`list-${props.pageBinUid}`">
          <td>
            <ListTableCheckbox
              name="list"
              :value="props.pageBinUid"
              :is-checked="checkList.includes(props.pageBinUid)"
              @checked="listTableCheck"
            />
          </td>
          <td>
            {{ props.remainDay }}일전
          </td>
          <td>
            {{ props.pageName }}
          </td>
          <td>{{ props.layoutName }}</td>
          <td>{{ props.pageCode }}</td>
          <td>
            <StyledButton
              outline
              small
              color="secondary"
              @click.prevent="viewPage(props.pageCode)"
            >
              보기
            </StyledButton>
          </td>
          <td>

            <Tooltip left>
              <template #default="{ toggle }">
                <StyledButton
                  icon-right
                  x-small
                  color="primary-dark-deep"
                  :icon="mdiHelpCircleOutline"
                  @click.prevent="toggle"
                >
                  상세보기
                </StyledButton>
              </template>

              <template #content="{ close }: { close: Function }">
                <div class="tooltip-popup">
                  <div class="flex-center-between mb-10">
                    <div class="font-lg">사유</div>
                    <a href="#" class="flex" @click.stop.prevent="close()">
                      <SvgIcon
                        type="mdi"
                        class="close"
                        :path="mdiWindowClose"
                      />
                    </a>
                  </div>

                  <div class="font-m mb-10">
                    삭제일: {{ util.getDateFormat(props.delDatetime, 'Y-m-d H:i:s') }}<br />
                    처리자: {{ props.memberEmail }}<br />
                  </div>
                  <div class="log-box">
                    <div style="white-space:pre-line;">{{ props.reason }}</div>
                  </div>
                </div>
              </template>
            </Tooltip>
          </td>
        </tr>
      </template>
    </ListTable>

    <PageDelete
      :check-list="checkList"
      @close="onPopupClose('pageDelete')"
      @deleted="setPageDelete"
      v-if="isShow.pageDelete"
    />

    <Preview
      :unique-key="previewPageCode"
      :type="previewType.pages"
      @close="onPopupClose('preview')"
      v-if="isShow.preview"
    />

  </div>
</template>
