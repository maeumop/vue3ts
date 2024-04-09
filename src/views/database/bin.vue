<script setup lang="ts">
import DbSearchFilter from './layer/dbSearchFilter.vue';
import DbDelete from './layer/dbDelete.vue';
import DbDownload from './layer/dbDownload.vue';
import DbDeleteHistory from './layer/dbDeleteHistory.vue';
import ListTableCheckbox from '@/components/ListTable/listCheck.vue';

import { reactive, ref, inject, watch } from 'vue';
import { useUtil } from '@/js/util';
import {
  mdiMagnify,
  mdiTune,
  mdiRefresh,
  mdiTrashCanOutline,
  mdiHelpCircleOutline,
  mdiWindowClose
} from '@/assets/svg/path';

import { CONST_CODES } from '@/constants/common';
import type { ConstSearchKeys, ConstBinKeys } from '@/types/common';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type { GetBinsItem, GetBinsRes, PatchBinsRecoveryRes, GetBinsParam } from '@/types/api/databaseApi';

import type { ListTableModel, ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { OptionItem, KeyIndex } from '@/components/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ToastModel } from '@/components/Toast/types';

const { SEARCH, BIN } = CONST_CODES;

const util = useUtil();
const databaseApi = useDatabaseApi();
const Toast = inject('Toast') as ToastModel;

const MessageBox = inject('MessageBox') as MessageBoxModel;

const validateForm = ref<ValidateFormModel>();

// 팝업들 설정 ====================
let isShow = reactive<KeyIndex<boolean>>({
  dbDelete: false,
  dbSearchFilter: false,
  dbDownload: false,
  dbDeleteHistory: false,
});
const onPopupClose = (flag: string) => {
  isShow[flag] = false;
};
// END - 팝업들 설정 ====================

let selectTableColumn = ref<ConstSearchKeys | string>('');
const optTableColumn: OptionItem[] = [
  { text: SEARCH.NAME.TXT, value: SEARCH.NAME.VAL },
  { text: SEARCH.PHONE.TXT, value: SEARCH.PHONE.VAL },
  { text: SEARCH.MEDIA.TXT, value: SEARCH.MEDIA.VAL },
  { text: SEARCH.MEDIA_VAL.TXT, value: SEARCH.MEDIA_VAL.VAL },
];

// ListTable
const listTable = ref<ListTableModel>();
const tableHeader: ListTableHeader[] = [
  { text: '접수일', width: '230' },
  { text: '이름', width: '180' },
  { text: '연락처', width: '180' },
  { text: 'IP', width: '180' },
  { text: '매체', width: '120' },
  { text: '매체코드', width: '180' },
  { text: '사유', width: '180' },
];


// ================= 검색 필터 ===========================
// 날짜 기본값 설정 : 최근 7일(오늘 포함)
let rangeDate = ref<string[]>(['', '']);
const dateInit = (): void => {
  rangeDate.value = [
    util.getDateFormat(new Date(), 'Y-m-d', -6),
    util.getDateFormat(new Date(), 'Y-m-d'),
  ];
};

let searchText = ref<string>('');
let badgeCount = ref<string>('0');
let reason = ref<ConstBinKeys | string>('');

const getValue = (reason: string): ConstBinKeys[] => {
  return reason.split(',') as ConstBinKeys[];
};

/**
 * 리스트 필터 설정
 * @param data {reason: ''}
 */
const onListUpdate = (data: ConstBinKeys | string): void => {
  badgeCount.value = data === '' ? '0' : '1';
  reason.value = data;
};

const onSearch = (): void => {
  list.value = [];
  cursor.value = 0;
  totalCount.value = 0;

  listTable.value!.checkedToggle();
  getData();
};

/**
 * 검색 필터 설정 초기화
 */
const onInit = (): void => {
  dateInit();
  selectTableColumn.value = '';
  searchText.value = '';

  if (badgeCount.value !== '0') {
    badgeCount.value = '0';
    reason.value = '';
  } else {
    onSearch();
  }
};

/**
 * 날짜 변경시 리스트 조회 API 호출
 * @param data
 */
const changeRangeDate = (data: string[]) => {
  rangeDate.value = [...data];
  onSearch();
};

watch(reason, () => {
  onSearch();
});
// ================= End - 검색 필터 ===========================

/**
 * 매체 코드 클릭 > 유입링크로 이동
 * @param url 유입링크
 */
const referer = (url: string): void => {
  window.open(url);
};

/**
 * DB복구 api 호출
 * @param dbUids
 */
const onDbReturn = async (dbUids: string[]): Promise<void> => {
  try {
    await databaseApi.patchBinsRecovery(dbUids);
    Toast(`${dbUids.length}개의 DB가 복구되었습니다.`);
    setDeleted(checkCount.value);

  } catch (err) {
    util.axiosErrorCatch<PatchBinsRecoveryRes>(err);
  }
};

/**
 * DB복구 클릭 > MessageBox 출력
 */
const onOpenReturnMessageBox = (): void => {
  MessageBox.confirm({
    title: `${checkCount.value}개의 고객 DB를 복구하시겠습니까?`,
    message:
      '[복구 처리하기] 버튼 클릭 시 선택하신 고객 DB는 ‘DB 관리’ 화면으로 이동됩니다.',
    btnOkayText: '복구 처리하기',
    btnCancelText: '취소하기',
    escCancel: false,
    asyncOkay: async (): Promise<void> => {
      const dbUids: string[] = checkList.value;
      await onDbReturn(dbUids);
    },
  });
};

/**
 * 선택된 DB 리스트에서 삭제
 * @param value 영구삭제 정보 {count: 삭제된 DB 수, date: 삭제된 날짜}
 */
const setDeleted = (count: number): void => {
  totalCount.value -= count;

  list.value = list.value.filter(item => {
    return !(checkList.value.includes(item.dbUid));
  });

  listTable.value!.checkedToggle();
  if (totalCount.value && list.value.length === 0) {
    getData();
  }
};

let totalCount = ref<number>(0);
let list = ref<GetBinsItem[]>([]);
let dataLoading = ref<boolean>(true);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;

// list table 체크 박스 ===============================
const checkList = ref<string[]>([]);
let checkCount = ref<number>(0);
const checkAll = (checked: boolean): void => {
  if (checked) {
    checkList.value = list.value.map(item => item.dbUid);
  } else {
    checkList.value = [];
  }
  checkCount.value = checkList.value.length;
};

const listTableCheck = (checked: boolean, value: string | number): void => {
  const index: number = checkList.value.indexOf(value.toString());
  if (checked && index === -1) {
    checkList.value.push(value.toString());
  } else if (!checked && index > -1) {
    checkList.value.splice(index, 1);
  }
  checkCount.value = checkList.value.length;
};
// End - list table 체크 박스 ===============================


/**
 * DB리스트 조회 API 호출
 */
const getData = async (): Promise<void> => {
  try {
    dataLoading.value = true;
    validateForm.value?.formProtection(true);

    const _startDate = `startDate=${+new Date(`${rangeDate.value[0]} 00:00:00`)}`;
    const _endDate = `&endDate=${+new Date(`${rangeDate.value[1]} 00:00:00`) + (60 * 60 * 24 * 1000) - 1}`;
    const _reason = reason.value ? `&reason=${reason.value}` : '';
    const _column = selectTableColumn.value ? `&column=${selectTableColumn.value}` : '';
    const _word = searchText.value ? `${_column}&word=${searchText.value}` : '';
    const search = encodeURIComponent(`${_startDate}${_endDate}${_word}${_reason}`);

    const params: GetBinsParam = { limit, search };
    if (cursor.value) {
      params.cursor = cursor.value.toString();
    }

    const { results }: GetBinsRes = await databaseApi.getBins(params);
    results.dbs.forEach(item => {
      list.value.push(item);
    });

    totalCount.value = results.totalCount;

    observer.value = !(totalCount.value <= list.value.length);
    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].regDatetime;
    }

  } catch (err) {
    util.axiosErrorCatch<GetBinsRes>(err);

  } finally {
    dataLoading.value = false;
    validateForm.value?.formProtection(false);
  }
};

// 초기 데이터 불러오기
validateForm.value?.formProtection(true);
dateInit();
getData();
</script>

<template>
  <div id="databaseList" class="content common-list">
    <ValidateForm ref="validateForm">
      <div class="searchArea">
        <div class="listCount">
          검색 결과
          <span class="text-point">{{ totalCount.numberFormat() }}</span>건
        </div>
        <div class="flex gap-8">
          <div class="width-350">
            <DatePicker
              block
              range
              default-date
              :placeholder="['시작일 선택', '종료일 선택']"
              @update:set="changeRangeDate"
              v-model="rangeDate"
            />
          </div>

          <div class="width-150">
            <SelectBox
              block
              clearable
              placeholder="전체"
              :options="optTableColumn"
              v-model="selectTableColumn"
            />
          </div>

          <div class="width-250">
            <TextField
              block
              placeholder="검색어를 입력해주세요."
              :icon="mdiMagnify"
              :max-length="50"
              :icon-action="onSearch"
              @keydown.enter="!dataLoading && onSearch()"
              v-model="searchText"
            />
          </div>

          <StyledButton
            only-icon
            outline
            color="secondary"
            :icon="mdiTune"
            @click.prevent="isShow.dbSearchFilter = true"
            v-if="badgeCount === '0'"
          />

          <Badge :text="badgeCount" v-else>
            <StyledButton
              only-icon
              outline
              color="secondary"
              :icon="mdiTune"
              @click.prevent="isShow.dbSearchFilter = true"
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
            only-icon
            outline
            color="secondary"
            :icon="mdiTrashCanOutline"
            :disabled="!checkList.length"
            @click.prevent="isShow.dbDelete = true"
          />

          <StyledButton
            outline
            color="secondary"
            :disabled="!checkList.length"
            @click.prevent="onOpenReturnMessageBox"
          >
            복구
          </StyledButton>

          <StyledButton
            outline
            color="secondary"
            @click.prevent="isShow.dbDownload = true"
          >
            엑셀 다운로드
          </StyledButton>

          <StyledButton
            outline
            color="secondary"
            @click.prevent="isShow.dbDeleteHistory = true"
          >
            영구 삭제 이력
          </StyledButton>
        </div>
      </div>
    </ValidateForm>

    <ListTable
      check-all
      ref="listTable"
      height="calc(100% - 121px)"
      empty-text="데이터가 존재하지 않습니다"
      :header="tableHeader"
      :items="list"
      :loading="dataLoading"
      :observer="observer"
      @observe="getData"
      @checked="checkAll"
    >
      <template #items="{ props }: ListTableItemSlot<GetBinsItem>">
        <tr :key="`list-${props.dbUid}`">
          <td>
            <ListTableCheckbox
              name="list"
              :value="props.dbUid"
              :is-checked="checkList.includes(props.dbUid)"
              @checked="listTableCheck"
            />
          </td>
          <td>
            {{ util.getDateFormat(props.inputDatetime, 'Y-m-d H:i:s') }}
          </td>
          <td>{{ props.name || '-' }}</td>
          <td>{{ props.phone ? props.phone.phoneNumber() : '-' }}</td>
          <td>{{ props.refererIp || '-' }}</td>
          <td>{{ props.media || '-' }}</td>
          <td>
            <template v-if="!!props.referer">
              <StyledButton
                text
                color="primary"
                @click.prevent="referer(props.referer)"
              >
                {{ props.mediaCode || '-' }}
              </StyledButton>
            </template>
            <template v-else>{{ props.mediaCode || '-' }}</template>
          </td>
          <td>
            <template v-if="props.reason">
              <template :key="`reason-${item}`" v-for="item in getValue(props.reason)">
                <StyledButton
                  x-small
                  color="primary-dark-deep mr-3"
                  v-if="item && item !== BIN.DELETE.VAL"
                >
                  {{ BIN[item]?.TXT }}
                </StyledButton>
                <template v-else>
                  <Tooltip left>
                    <template #default="{ toggle }">
                      <StyledButton
                        icon-right
                        x-small
                        color="primary-dark-deep"
                        :icon="mdiHelpCircleOutline"
                        @click.prevent="toggle"
                      >
                        {{ BIN[item].TXT }}
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
                          삭제일: {{ util.getDateFormat(props.binDatetime, 'Y-m-d H:i:s') }}<br />
                          처리자: {{ props.memberEmail }}<br />
                        </div>
                        <div class="log-box">
                          <div>{{ props.reasonNote }}</div>
                        </div>
                      </div>
                    </template>
                  </Tooltip>
                </template>
              </template>
            </template>
            <template v-else>-</template>
          </td>
        </tr>
      </template>
    </ListTable>

    <DbSearchFilter
      type="BIN"
      :reason="reason"
      @close="onPopupClose('dbSearchFilter')"
      @on:bin-update="onListUpdate"
      v-if="isShow.dbSearchFilter"
    />

    <DbDelete
      :check-list="checkList"
      @close="onPopupClose('dbDelete')"
      @deleted="setDeleted"
      v-if="isShow.dbDelete"
    />

    <DbDownload
      type="BIN"
      @close="onPopupClose('dbDownload')"
      v-if="isShow.dbDownload"
    />

    <DbDeleteHistory
      @close="onPopupClose('dbDeleteHistory')"
      v-if="isShow.dbDeleteHistory"
    />
  </div>
</template>
