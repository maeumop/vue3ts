<script setup lang="ts">
import SearchFilter from './layer/searchFilter.vue';
import PageBin from './layer/pageBin.vue';
import BatchSetting from './layer/batchSetting.vue';
import BatchResult from './layer/batchResult.vue';
import DefaultPage from './layer/defaultPage.vue';
import VersionUpdate from './layer/versionUpdate.vue';
import CreateLink from './layer/createLink.vue';
import Copy from './layer/copy.vue';
import ListTableCheckbox from '@/components/ListTable/listCheck.vue';
import PageConfig from '@/views/editor/layer/pageConfig.vue';
import Preview from '@/views/common/preview.vue';

import type { UnwrapRef } from 'vue';
import { reactive, ref, inject, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  mdiMagnify,
  mdiTune,
  mdiPlus,
  mdiRefresh,
  mdiTrashCanOutline,
  mdiCheckboxMarked,
  mdiCheckboxBlankOutline,
  mdiHelpCircleOutline,
  mdiAlertCircle,
  mdiCheckboxBlankCircle,
  mdiPencil,
} from '@/assets/svg/path';

import { previewType } from '@/constants/common';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type {
  GetPagesParam, GetPagesRes, PageItem,
  GetIsUpdateAblePagesRes
} from '@/types/api/smartEditorApi';

import type { SpinnerModel } from '@/components/Spinner/types';
import type { ListTableModel, ListTableItemSlot } from '@/components/ListTable/types';
import type { OptionItem, KeyIndex } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ToastModel } from '@/components/Toast/types';

import { useUtil } from '@/js/util';
import { COPY_MODE } from '@/constants/smart';
import type { CopyPropsData } from '@/types/smart';

const router = useRouter();
const util = useUtil();
const smartEditorApi = useSmartEditorApi();

const Toast = inject('Toast') as ToastModel;
const Spinner = inject('Spinner') as SpinnerModel;

const validateForm = ref<ValidateFormModel>();

// 팝업들 설정 ====================
let selectedIdx = ref<number>(-1);
let isShow = reactive<KeyIndex<boolean>>({
  searchFilter: false,
  bin: false,
  batchSetting: false,
  batchResult: false,
  defaultPage: false,
  preview: false,
  createLink: false,
  copy: false,
  versionUpdate: false,
  pageConfig: false,
});

const onPopupClose = (flag: string): void => {
  isShow[flag] = false;
  selectedIdx.value = -1;

  previewPageCode.value = '';
};
// END - 팝업들 설정 ====================

// ListTable
const listTable = ref<ListTableModel>();
const tableHeight = computed(() => isShowUpdateBox.value ? 'calc(100% - 170px)' : 'calc(100% - 121px)');

let selectTableColumn = ref<string>('main.pageName');
const optTableColumn: OptionItem[] = [
  { value: 'main.pageName', text: '페이지명', },
  { value: 'main.pageCode', text: '코드', },
  { value: 'L.layoutName', text: '레이아웃', },
  { value: 'S.scriptName', text: '전환 스크립트', },
  { value: 'mobile.pageName', text: '모바일 페이지명', },
  { value: 'backPage.pageName', text: '백 페이지명', },
];

let totalCount = ref<number>(0);
let list = ref<PageItem[]>([]);
let dataLoading = ref<boolean>(true);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;

const isAllCheck = ref(false);
// list table 체크 박스 ===============================
const checkList = ref<string[]>([]);
const checkAll = (checked: boolean): void => {
  if (checked) {
    for (let index = 0; index < list.value.length; index++) {
      const item = list.value[index];
      if (checkList.value.includes(item.pageUid!)) {
        continue;
      }
      checkList.value.push(item.pageUid!);
    }
  } else {
    checkList.value = [];
  }
  isAllCheck.value = checked;
};

const listTableCheck = (checked: boolean, value: string): void => {
  const idx: number = checkList.value.indexOf(value);

  if (checked && idx === -1) {
    checkList.value.push(value);
  } else if (!checked && idx > -1) {
    checkList.value.splice(idx, 1);
  }
};
// End - list table 체크 박스 ===============================

// ================= 검색 필터 ===========================
let searchText = ref<string>('');
let searched = ref<boolean>(false);
let badgeCount = ref<string>('0');
let pageLasted = ref<string>('');
let pageOn = ref<string>('');

const setFilterList = (filter: KeyIndex<string>): void => {
  badgeCount.value = Object.values(filter).filter(val => val !== '' && !!val).length.toString();
  pageLasted.value = filter.pageLasted;
  pageOn.value = filter.pageOn;
  checkList.value = [];
};

const onSearch = (search?: boolean): void => {
  searched.value = search ?? searched.value;
  isAllCheck.value = false;
  checkList.value = [];
  list.value = [];
  cursor.value = 0;
  totalCount.value = 0;

  listTable.value!.checkedToggle();
  getData();
};

/**
 * 검색 필터 초기화
 */
const onInit = (): void => {
  selectTableColumn.value = 'main.pageName';
  searchText.value = '';

  if (badgeCount.value !== '0') {
    badgeCount.value = '0';
    pageLasted.value = '';
    pageOn.value = '';
  } else {
    onSearch(false);
  }
};

watch(() => [pageLasted.value, pageOn.value], ()=> {
  onSearch();
});
// ================= End - 검색 필터 ===========================


// ================= 설정 일괄 변경 ===========================
let batchSetData = ref<KeyIndex<string | number>>({});
let checkedPageList = ref<PageItem[]>([]);
/**
 * 설정 일괄 변경 팝업에서 설정된 데이터를 설정 변경 결과 팝업으로 넘겨주는 함수
 * @param setData 설정 일괄 변경 팝업에서 설정된 데이터
 */
const getBatchData = (setData: KeyIndex<string|number>): void => {
  batchSetData.value = setData;
  checkedPageList.value = list.value.filter(item => checkList.value.includes(item.pageUid!));
};

/**
 * 일괄 변경 완료 후 팝업 닫기, 리스트 업데이트 처리
 */
const onBatchSetCompleted = (successList: string[]): void => {
  const result: { [k in keyof PageItem]?: UnwrapRef<typeof batchSetData> } = { ...batchSetData.value };
  if (!result.isUseMobilePage) {
    result.mobilePageUid = undefined;
  }

  if (!result.isUseBackPage) {
    result.backPageUid = undefined;
  }

  if (!result.isUseScript) {
    result.scriptUid = undefined;
    result.scriptName = undefined;
  }

  const length: number = successList.length;
  const arr: PageItem[] = list.value.filter(item => checkList.value.includes(item.pageUid!));
  for (let index = 0; index < length; index++) {
    const item: PageItem | undefined = arr.find(item => item.pageUid === successList[index]);
    if (!item) {
      continue;
    }

    Object.assign(item, result);
    item.isLastest = 1;
  }

  checkedPageList.value = [];
  checkAll(false);
};
// ================= End - 설정 일괄 변경 ===========================

// ================= 설정 변경(개별) ===========================
/**
 * 페이지 설정 팝업 출력
 * @param index 선택된 페이지 index
 */
const onOpenPageSetting = (index: number): void => {
  isShow.pageConfig = true;
  selectedIdx.value = index;
};

/**
 * 페이지 설정 내용 리스트에 반영
 * @param data 페이지 설정 데이터
 */
const pageConfigEdite = (data: PageItem): void => {
  Object.assign(list.value[selectedIdx.value], data);
  if (list.value[selectedIdx.value].isOn) {
    list.value[selectedIdx.value].isLastest = 1;
  }
};
// ================= End - 설정 변경(개별) ===========================

/**
 * 링크 생성 팝업 출력
 * @param index 선택된 페이지 index
 */
const onOpenCreateLink = (index = -1): void => {
  isShow.createLink = true;
  selectedIdx.value = index;
};


/**
 * 페이지 복사 팝업 오픈
 * @param index 선택된 페이지 index
 */
const onOpenPageCopy = (index: number): void => {
  isShow.copy = true;
  selectedIdx.value = index;
};

/**
 * 페이지 복사 처리
 * @param data 복사에 필요한 데이터
 */
const setPageCopy = (data: CopyPropsData): void => {
  if (searched.value) {
    onInit();
  } else {
    const newData: PageItem = {
      ...list.value[selectedIdx.value],
      pageUid: data.uid,
      pageName: data.name,
      pageCode: data.code!,
      isLastest: 0,
      isOn: 0
    };
    list.value.unshift(newData);
  }
};


// ================= 페이지 버전 업데이트 ===========================
/**
 * 업데이트 필요한 페이지 존재 여부 체크 후 업데이트팝업 띄움
 */
const onClickVersionUpdate = async (): Promise<void> => {
  Spinner.delay(0).show('Loading…');
  try {
    const { results }: GetIsUpdateAblePagesRes = await smartEditorApi.getIsUpdateAblePages();
    if (!results.result) {
      Toast({ color: 'warning', message: '업데이트 내역이 존재하지 않습니다.' });
      onInit();
      return;
    }
    isShow.versionUpdate = true;
  } catch (err) {
    util.axiosErrorCatch<GetIsUpdateAblePagesRes>(err);
  } finally {
    Spinner.close();
  }
};

/**
 * 페이지 업데이트 이후 업데이트 성공한 페이지 리스트 반영
 * @param updatePageResult
 */
const setVersionUpdate = (updatePageResult: KeyIndex<number>): void => {
  const updatePageResultKey = Object.keys(updatePageResult);
  if (!updatePageResultKey.length) {
    isShowUpdateBox.value = true;
    return;
  }
  isShowUpdateBox.value = false;

  list.value.forEach(item => {
    if (updatePageResultKey.includes(item.pageUid!)) {
      item.isLastest = updatePageResult[item.pageUid!];
      if (!updatePageResult[item.pageUid!]) {
        isShowUpdateBox.value = true;
      }
    }
  });
};
// ================= END - 페이지 버전 업데이트 ===========================

// ===================== page 삭제 =============================
let binList: string[] = [];
/**
 * 삭제 팝업 출력
 * @param index 선택된 페이지 index, 일괄 삭제일때 -1
 */
const onOpenPageBin = (index: number): void => {
  binList = [];
  if (index > -1) {
    binList.push(list.value[index].pageUid!);
  } else {
    binList = checkList.value;
  }

  isShow.bin = true;
};

/**
 * 페이지 삭제 후 리스트 업데이트
 */
const setPageDelete = (): void => {
  // 휴지통으로 보낼 페이지가 없다면 return
  if (!binList.length) {
    return;
  }

  totalCount.value -= binList.length;

  // 해당 항목에서 binList 해당하는 페이지 제거
  list.value = list.value.filter(item => !item.pageUid || !(binList.includes(item.pageUid)));

  // binList 1개만 존재 한다면 단일 이벤트 후 처리
  if (binList.length === 1) {
    // binList 항목중 checkList에 선택되어 있는 페이지가 있을 경우에는 checkList index 추출
    const checkListIdx: number = checkList.value
      .findIndex(pageUid => pageUid === binList[0]);

    // 추출한 checkListIdx 존재시, checkList 객제 제거
    if (checkListIdx > -1 && checkListIdx < checkList.value.length) {
      checkList.value.splice(checkListIdx, 1);
    }
    // checkList에 빈값이 되면 전체 선택 체크 박스 해제
    checkList.value.length < 1 && checkAll(false);
    // selectedIdx 값 초기화
    selectedIdx.value = -1;

    return;
  }

  // 다중 휴지통 이동 이벤트 후 처리

  // 전체 선택 체크 박스 해제
  checkAll(false);
};

/**
 * 페이지 삭제 가능여부 체크
 * @param index 선택된 페이지 index, 일괄 삭제일때 -1
 */
const onClickPageBin = (index = -1): void => {
  onOpenPageBin(index);
};
// ===================== End - page 삭제 =============================


/**
 * 에디터 페이지로 이동
 * @param index 선택된 페이지 index
 */
const onClickMoveEditor = (uid: string): void => {
  router.push(`/editor/${uid}`);
};


/**
 * 모바일, 백 페이지로 이동
 * 모바일, 백 페이지가 Off: 미리보기 화면
 * 모바일, 백 페이지가 On: 새창 출력
 * @param pageCode 모바일, 백 페이지 코드
 */
let previewPageCode = ref('');
const onPage = (pageCode: string): void => {
  const pageOnOffCheck = false;
  if (pageOnOffCheck) {
    console.log('새창 띄우기');
    // **- window.open(``);
  } else {
    previewPageCode.value = pageCode;
    isShow.preview = true;
    Spinner.delay(0).show('Loading…');
  }
};

// 데이터 불러옴 ========================================

// 업데이트 안내 박스
let isShowUpdateBox = ref<boolean>(false);

// 리스트 데이터
validateForm.value?.formProtection();

const getData = async (): Promise<void> => {
  dataLoading.value = true;
  validateForm.value?.formProtection();

  const _lasted = pageLasted.value ? `&isLastest=${pageLasted.value}` : '';
  const _on = pageOn.value ? `&isOn=${pageOn.value}` : '';
  const _column = selectTableColumn.value ? `&column=${selectTableColumn.value}` : '';
  const _word = searchText.value ? `${_column}&word=${searchText.value}` : '';

  const search = encodeURIComponent(`${_lasted}${_on}${_word}`);
  const param: GetPagesParam = { limit };

  if (search) {
    param.search = search;
  }

  if (cursor.value) {
    param.cursor = cursor.value;
  }

  try {
    const { results }: GetPagesRes = await smartEditorApi.getPages(param);

    results.pages.forEach(item => list.value.push(item));
    totalCount.value = results.totalCount;

    observer.value = !(totalCount.value <= list.value.length);
    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].regDatetime;
    }

    isShowUpdateBox.value = results.pageToUpdate;

  } catch (err) {
    util.axiosErrorCatch<GetPagesRes>(err);

  } finally {
    dataLoading.value = false;
    validateForm.value?.formProtection(false);
  }
};

getData();
// End - 데이터 불러옴 ========================================

onUnmounted(() => {
  Spinner.close();
});
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
            class="width-180"
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
        <div class="flex gap-8">
          <StyledButton
            icon-left
            color="primary"
            :icon="mdiPlus"
            @click.prevent="router.push('/editor')"
          >
            페이지 등록
          </StyledButton>

          <StyledButton
            only-icon
            outline
            color="secondary"
            :icon="mdiTrashCanOutline"
            :disabled="!checkList.length"
            @click.prevent="onClickPageBin"
          />

          <StyledButton
            outline
            color="secondary"
            :disabled="!checkList.length"
            @click.prevent="isShow.batchSetting = true"
          >
            설정 일괄 변경
          </StyledButton>

          <StyledButton
            outline
            color="secondary"
            @click.prevent="isShow.defaultPage = true"
          >
            기본 페이지 설정
          </StyledButton>
        </div>
      </div>
    </ValidateForm>

    <div class="info-blue-box" v-if="isShowUpdateBox">
      <div class="flex-center-center">
        <SvgIcon
          class="text-gray-400 mr-5"
          type="mdi"
          size="15"
          :path="mdiAlertCircle"
        /> ON 상태의 페이지 중 최신 버전이 아닌 페이지가 존재합니다. 최신 버전으로 업데이트해 주세요.

        <StyledButton
          x-small
          color="primary"
          class="ml-10"
          @click="onClickVersionUpdate"
        >
          페이지 버전 업데이트
        </StyledButton>
      </div>
    </div>

    <ListTable
      ref="listTable"
      header-th-length="11"
      empty-text="데이터가 존재하지 않습니다"
      :height="tableHeight"
      :width="1520"
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
          <th width="130">
            <Tooltip right btn-close>
              <template #default="{ toggle }">
                <div class="flex-center" @click="toggle">
                  버전상태
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
                    <li>업데이트 필요 : 페이지 구성 요소의 수정으로 HTML 파일 업데이트가 필요한 상태이며, <br />[페이지 버전 업데이트] 버튼을 통해 HTML 파일 업데이트가 필요합니다.</li>
                    <li>최신버전 : HTML 파일 업데이트가 필요하지 않은 최신 상태를 의미합니다.</li>
                  </ul>
                </div>
              </template>
            </tooltip>
          </th>
          <th width="90">사용여부</th>
          <th>페이지명</th>
          <th width="180">레이아웃</th>
          <th width="140">코드</th>
          <th width="200">전환스크립트</th>
          <th width="90">모바일</th>
          <th width="90">백페이지</th>
          <th width="90">링크</th>
          <th width="200">관리</th>
        </tr>
      </template>


      <template #items="{ props, index }: ListTableItemSlot<PageItem>">
        <tr :key="`list-${props.pageUid}`">
          <td>
            <ListTableCheckbox
              name="list"
              :value="props.pageUid!"
              :is-checked="checkList.includes(props.pageUid!)"
              @checked="listTableCheck"
            />
          </td>
          <td>
            <div class="flex-center gap-x-2">
              <template v-if="props.isOn">
                <SvgIcon
                  type="mdi"
                  size="14"
                  :path="mdiCheckboxBlankCircle"
                  :class="[
                    'mr-1',
                    'font-sm',
                    {
                      'text-red' : !props.isLastest,
                      'text-point' : props.isLastest
                    },
                  ]"
                />
                {{ props.isLastest ? '최신버전' : '업데이트필요' }}
              </template>
              <template v-else>
                -
              </template>
            </div>
          </td>
          <td>{{ props.isOn ? 'ON' : 'OFF' }}</td>
          <td>
            <StyledButton
              text
              color="primary"
              :icon="mdiPencil"
              @click.prevent="onClickMoveEditor(props.pageUid!)"
            >
              {{ props.pageName }}
            </StyledButton>
          </td>
          <td>{{ props.layoutName }}</td>
          <td>{{ props.pageCode }}</td>
          <td>{{ props.scriptName || '-' }}</td>
          <td>
            <StyledButton
              outline
              small
              color="secondary"
              @click.prevent="onPage(props.mobilePageCode!)"
              v-if="props.isUseMobilePage"
            >
              보기
            </StyledButton>
            <template v-else>-</template>
          </td>

          <td>
            <StyledButton
              outline
              small
              color="secondary"
              @click.prevent="onPage(props.backPageCode!)"
              v-if="props.isUseBackPage"
            >
              보기
            </StyledButton>
            <template v-else>-</template>
          </td>
          <td>
            <StyledButton
              outline
              small
              color="secondary"
              @click.prevent="onOpenCreateLink(index)"
            >
              생성
            </StyledButton>
          </td>

          <td>
            <div class="flex-center gap-4">
              <StyledButton
                outline
                small
                color="secondary"
                @click.prevent="onOpenPageSetting(index)"
              >
                설정
              </StyledButton>

              <StyledButton
                outline
                small
                color="secondary"
                @click.prevent="onOpenPageCopy(index)"
              >
                복사
              </StyledButton>

              <StyledButton
                outline
                small
                color="secondary"
                @click.prevent="onClickPageBin(index)"
                v-if="!props.isOn"
              >
                삭제
              </StyledButton>
            </div>
          </td>
        </tr>
      </template>
    </ListTable>

    <SearchFilter
      :page-lasted="pageLasted"
      :page-on="pageOn"
      @update="setFilterList"
      @close="onPopupClose('searchFilter')"
      v-if="isShow.searchFilter"
    />

    <BatchSetting
      @batch-data="getBatchData"
      @open-result="isShow.batchResult = true"
      @close="onPopupClose('batchSetting')"
      v-if="isShow.batchSetting"
    />

    <BatchResult
      :set-data="batchSetData"
      :page-list="checkedPageList"
      @set:success="onBatchSetCompleted"
      @close="onPopupClose('batchResult')"
      v-if="isShow.batchResult"
    />

    <DefaultPage
      @close="onPopupClose('defaultPage')"
      v-if="isShow.defaultPage"
    />

    <VersionUpdate
      @on:update="setVersionUpdate"
      @close="onPopupClose('versionUpdate')"
      v-if="isShow.versionUpdate"
    />

    <CreateLink
      :page-using="list[selectedIdx].isOn"
      :page-code="list[selectedIdx].pageCode!"
      :page-uid="list[selectedIdx].pageUid!"
      :page-path="list[selectedIdx].htmlPath!"
      @close="onPopupClose('createLink')"
      v-if="isShow.createLink"
    />

    <Copy
      :type="COPY_MODE.PAGE"
      :uid="list[selectedIdx]?.pageUid!"
      @copy="setPageCopy"
      @close="onPopupClose('copy')"
      v-if="isShow.copy"
    />

    <PageBin
      :page-list="binList"
      @deleted="setPageDelete"
      @close="[onPopupClose('bin'), binList = []]"
      v-if="isShow.bin"
    />

    <PageConfig
      :select-item="list[selectedIdx]"
      @close="onPopupClose('pageConfig')"
      @edite="pageConfigEdite"
      v-if="isShow.pageConfig"
    />

    <Preview
      :unique-key="previewPageCode"
      :type="previewType.pages"
      @close="onPopupClose('preview')"
      @iframe-loaded="Spinner.close()"
      v-if="isShow.preview"
    />

  </div>
</template>
