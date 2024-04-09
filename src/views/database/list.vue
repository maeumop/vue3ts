<script setup lang="ts">
/**
 * @editor 김종윤
 * @editDate 2024.03.21
 * @desc input form field config api 변경으로 인한 수정
 */
import DbSearchFilter from './layer/dbSearchFilter.vue';
import DbRegister from './layer/dbRegister.vue';
import DbBatchRegister from './layer/dbBatchRegister.vue';
import DbBatchResult from './layer/dbBatchResult.vue';
import DbBin from './layer/dbBin.vue';
import ApiSend from './layer/apiSend.vue';
import DbDownload from './layer/dbDownload.vue';
import SendApiHistory from './layer/sendApiHistory.vue';
import ListTableCheckbox from '@/components/ListTable/listCheck.vue';

import { reactive, ref, watch, computed } from 'vue';
import { useUtil } from '@/js/util';
import { useClientStore } from '@/store';
import {
  mdiMagnify,
  mdiTune,
  mdiRefresh,
  mdiChevronDown,
  mdiFileDocumentEdit,
  mdiFileExcel,
  mdiTrashCanOutline,
  mdiCheckboxBlankCircle,
  mdiPencil,
} from '@/assets/svg/path';

import { CONST_CODES } from '@/constants/common';
import type { ConstAuthKeys, ConstApiSendStatusKeys } from '@/types/common';

import { LEVLEL_NUMBER, INPUT_FIELDS_OPT, INPUT_FIELDS_AGREE_NAME, INPUT_FIELDS_CONFIG, } from '@/constants/db';
import type {
  LevelListTableHeader, DBListTableHeader, LevelOptionItem,
  FieldInfo, FieldOption, InputFieldsOptionItem, InputFieldConfigWithOption,
  DbsItem, SendResultPropsData,
  INPUT_FIELDS_NAME_TYPE, ALL_INPUT_FIELDS_NAME_TYPE
} from '@/types/db';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type {
  GetDbsInputFieldsRes, GetDbsParam, GetDbsRes,
  PostDbsParam, InputFieldConfigItem,
} from '@/types/api/databaseApi';

import type { ListTableModel, ListTableItemSlot } from '@/components/ListTable/types';
import type { KeyIndex } from '@/components/types';
import type { DropMenuItem } from '@/components/DropMenu/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ProcessEnv } from '@/types/common';
import { getDbsInputFieldsConfigMsg } from '@/constants/api/databaseApi';

const { VUE_APP_LOCAL_STORAGE_DB_INPUT_FIELD_KEY }: ProcessEnv = process.env;

const util = useUtil();
const databaseApi = useDatabaseApi();
const clientStore = useClientStore();
const { SEARCH, DOWNLOAD, DB_SEND_STATUS } = CONST_CODES;

const validateForm = ref<ValidateFormModel>();

const memberLevel = computed<ConstAuthKeys>(() => clientStore.getAuthLevel);

// ================= 팝업들 설정 ====================
let selectedIdx = ref<number>(-1);
let isShow = reactive<KeyIndex<boolean>>({
  dbSearchFilter: false,
  dbRegister: false,
  dbBatchRegister: false,
  dbBatchResult: false,
  dbBin: false,
  apiSend: false,
  dbDownload: false,
  sendApiHistory: false,
});
const onPopupClose = (flag: string): void => {
  isShow[flag] = false;
  selectedIdx.value = -1;
};
// ================= END - 팝업들 설정 ====================

// ListTable
const isExtraData = ref<boolean>(false);
const listTable = ref<ListTableModel>();
const tableHeader = ref<LevelListTableHeader[]>([
  { level: 40, text: '구분', width: '100' },
  { level: 40, text: '접수일', width: '200' },
  { level: 40, text: 'IP', width: '150' },
  { level: 30, text: '전송 결과', width: '110' },
  { level: 40, text: '매체', width: '130' },
  { level: 40, text: '매체코드', width: '180' },
]);

let selectTableColumn = ref<string>('');
let optLevelTableColumn = ref<LevelOptionItem[]>([]);
const optTableColumn: LevelOptionItem[] = [
  { value: SEARCH.NAME.VAL, level: 40, text: SEARCH.NAME.TXT },
  { value: SEARCH.PHONE.VAL, level: 40, text: SEARCH.PHONE.TXT },
  { value: SEARCH.MEDIA.VAL, level: 30, text: SEARCH.MEDIA.TXT },
  { value: SEARCH.MEDIA_VAL.VAL, level: 40, text: SEARCH.MEDIA_VAL.TXT },
];

const dropMenuItem: DropMenuItem[] = [
  {
    text: '개별 등록',
    icon: mdiFileDocumentEdit,
    action: () => {
      isShow.dbRegister = true;
    },
  },
  {
    text: '일괄 등록',
    icon: mdiFileExcel,
    action: () => {
      isShow.dbBatchRegister = true;
    },
  },
];

let totalCount = ref<number>(0);
let list = ref<DbsItem[]>([]);
let dataLoading = ref<boolean>(true);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;

// ================= 멤버 레벨별 화면 체크  ===========================
let memberLevelNumber = LEVLEL_NUMBER[memberLevel.value];
let listTableHeight = ref<string>('');
let isAllCheck = ref<boolean>(true);
const levelCheck = (): void => {
  optLevelTableColumn.value = optTableColumn.filter(item => item.level >=  memberLevelNumber);
  tableHeader.value = tableHeader.value.filter(item => item.level >=  memberLevelNumber);
  listTableHeight.value = memberLevelNumber < 40 ? 'calc(100% - 121px)' : 'calc(100% - 60px)';
  isAllCheck.value = memberLevelNumber < 40;
};

watch(() => memberLevel.value, (a, b) =>{
  if (a !== b) {
    memberLevelNumber = LEVLEL_NUMBER[memberLevel.value];
    levelCheck();
  }
});

const memberLevelCheck = (): boolean => {
  return memberLevelNumber < 40;
};
// ================= End - 멤버 레벨별 화면 체크  ===========================


// ================= 노출항목 ===========================
const CELL_WIDTH: number = 130;
const TABEL_BASE_WIDTH: number = 1200;
// 노출 항목 선택시 사용되는 tableheader
const addColumnsTableHeader = ref<DBListTableHeader[]>([...tableHeader.value]);
let listTableWidth = ref<number>(1300);

// cert, hidden값 제외 사용중인 입력항목, 개별등록 팝업으로 넘겨주는 데이터
// 개별등록/수정 팝업에서 폼 만들때 사용
let useInputfields = ref<InputFieldConfigWithOption[]>([]);

export interface inputfieldsOptionItem {
  text: string
  value: ALL_INPUT_FIELDS_NAME_TYPE
}

// select
let selectInputColumn = ref<string[]>([]);
let optInputColumn = ref<inputfieldsOptionItem[]>([]);

const tableHeaderSetting = (): void => {
  isExtraData.value = true;
  addColumnsTableHeader.value = [...tableHeader.value];

  let i: number = 0;
  optInputColumn.value.forEach(item => {
    if (selectInputColumn.value.includes(item.value)) {
      const obj = {
        text: item.text,
        value: item.value.toString(),
        width: CELL_WIDTH.toString(),
        isInputField: true
      };
      addColumnsTableHeader.value.splice(2 + i, 0, obj);
      i++;
    }
  });

  // 노출 항목에 맞게 테이블 너비 설정
  listTableWidth.value = TABEL_BASE_WIDTH + CELL_WIDTH * selectInputColumn.value.length;
};

/**
 * selectInputColumn 값 만들기
 * @param arr 로컬스토리지에 저장된 column 값 배열
 */
const setSelectInputColumn = (arr: ALL_INPUT_FIELDS_NAME_TYPE[]) => {
  Object.keys(fieldCodeName).forEach(item => {
    if (arr.includes(item as INPUT_FIELDS_NAME_TYPE)) {
      selectInputColumn.value.push(item as INPUT_FIELDS_NAME_TYPE);
    }
  });
};

/**
 * 저장된 로컬스토리지 값 확인, 값이 없다면 이름, 연락처 출력
 */
const localStorageCheck = (): void => {
  const localStorageInputFieldColumTXT = localStorage.getItem(VUE_APP_LOCAL_STORAGE_DB_INPUT_FIELD_KEY) || '';

  if (localStorageInputFieldColumTXT) {
    const localStorageData: INPUT_FIELDS_NAME_TYPE[] = JSON.parse(localStorageInputFieldColumTXT);
    if (localStorageData.length) {
      setSelectInputColumn(localStorageData);
    }

  } else {
    setSelectInputColumn(['name', 'phone']);
  }
};

/**
 * 선택된 입력항목 로컬스토리지에 저장
 * @param columns 선택된 입력항목
 */
const setLocalStorage = (columns: string[]): void => {
  localStorage.setItem(VUE_APP_LOCAL_STORAGE_DB_INPUT_FIELD_KEY, JSON.stringify(columns));
};

watch(selectInputColumn, (v) => {
  if (v.length > 0) {
    tableHeaderSetting();

  } else {
    listTableWidth.value = TABEL_BASE_WIDTH;
    isExtraData.value = false;
  }
  setLocalStorage(v);
}, { deep: true });

const _basicDATA = { label: '', type: '', option: {} };
type FieldValueOption = {
  [key in ALL_INPUT_FIELDS_NAME_TYPE]: FieldInfo
};
// 입력항목 label, type, value 값 담겨져 있는 객체
// [CHECK, SELECT, RADIO] 항목만 option에 value 값 담겨져 있음
let fieldCodeName: FieldValueOption = {
  name: _basicDATA,
  phone: _basicDATA,
  age: _basicDATA,
  gender: _basicDATA,
  etcComment: _basicDATA,
  input1: _basicDATA,
  input2: _basicDATA,
  input3: _basicDATA,
  input4: _basicDATA,
  input5: _basicDATA,
  input6: _basicDATA,
  input7: _basicDATA,
  input8: _basicDATA,
  input9: _basicDATA,
  input10: _basicDATA,
  input11: _basicDATA,
  input12: _basicDATA,
  input13: _basicDATA,
  input14: _basicDATA,
  input15: _basicDATA,
  input16: _basicDATA,
  input17: _basicDATA,
  input18: _basicDATA,
  input19: _basicDATA,
  input20: _basicDATA,
  privacyYn: _basicDATA,
  thirdPartyYn: _basicDATA,
  smsYn: _basicDATA,
  cert: _basicDATA,
};

/**
 * 리스트 값을 value 값으로 리턴
 * @param key 데이터 key
 * @param value 데이터 value
 */
const getValue = (key: ALL_INPUT_FIELDS_NAME_TYPE, value: string): string => {
  if (INPUT_FIELDS_AGREE_NAME.includes(key.toString())) {
    return Number(value) ? '동의함' : '동의안함';

  } else if (INPUT_FIELDS_OPT.includes(fieldCodeName[key].type) && value) {
    let _value: string[] = [];
    value.toString().split(',').forEach(item => {
      const text = fieldCodeName[key].option![`${item}`];
      text ? _value.push(fieldCodeName[key].option![`${item}`]) : null;
    });

    // 항목이 radio, checkbox, select이면서 값은 있지만 매칭되는 value값이 없을 때 '-' 리턴
    return _value.join(',') || '-';
  }

  return value || '-';
};

/**
 * 입력항목 관련된 객체 만들기
 * optInputColumn:노출항목 체크 selectbox option
 * fieldCodeName: 입력항목 label, type, value 값 담겨져 있는 객체
 * useInputfields: 사용중인 입력항목, 개별등록 팝업으로 넘겨주는 데이터(개별 등록 입력폼 만들어주는 객체)
 * @param field 입력항목 데이터
 */
const setInputFields = (field: InputFieldConfigItem): void => {
  optInputColumn.value.push({ text: field.fieldLabel, value: field.fieldName });
  const fieldName = field.fieldName as INPUT_FIELDS_NAME_TYPE;

  fieldCodeName[fieldName] = {
    type: field.fieldType,
    label: field.fieldLabel,
  };

  if (INPUT_FIELDS_OPT.includes(field.fieldType)) {
    const FIELD_OPTION: FieldOption[]  = JSON.parse(field.options);
    const option_fieldCodeName: KeyIndex<string> = {};
    const option_useInputfields: InputFieldsOptionItem[] = [];

    FIELD_OPTION.forEach(item => {
      let optionData: InputFieldsOptionItem = { text: item.label, value: item.value };

      if ('checked' in item && item.checked) {
        optionData.checked = true;
      }

      option_useInputfields.push(optionData);
      option_fieldCodeName[item.value] = item.label;
    });

    fieldCodeName[fieldName].option = option_fieldCodeName;
    useInputfields.value.push({ ...field, objOption: option_useInputfields });
  } else {
    useInputfields.value.push(field);
  }
};
// ================= End - 노출항목  ===========================


// ================= list table 체크 박스 ===============================
const checkList = ref<string[]>([]);
const checkAll = (checked: boolean): void => {
  if (checked) {
    list.value.forEach(item => {
      if (!item.isBin) {
        checkList.value.push(item.dbUid);
      }
    });
  } else {
    checkList.value = [];
  }
};

const listTableCheck = (_checked: boolean, value: string): void => {
  const index: number = checkList.value.indexOf(value);
  if (_checked && index === -1) {
    checkList.value.push(value);

  } else if (!_checked && index > -1) {
    checkList.value.splice(index, 1);
  }
};
// ================= End - list table 체크 박스 ===============================


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
let searched = ref<boolean>(false);
let badgeCount = ref<string>('0');
let filterStatus = ref<ConstApiSendStatusKeys | string>('');
let filterSend = ref<string>('');

/**
 * 리스트 필터 설정
 * @param filter {status: string , send: string}
 */
const onListUpdate = (filter: KeyIndex<string>): void => {
  badgeCount.value = Object.values(filter).filter(val => val !== '' && !!val).length.toString();
  filterStatus.value = filter.status;
  filterSend.value = filter.send;
};

const onSearch = (search?: boolean): void => {
  searched.value = search ?? searched.value;
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
  dateInit();
  selectTableColumn.value = '';
  searchText.value = '';

  if (badgeCount.value !== '0') {
    filterStatus.value = '';
    filterSend.value = '';
    badgeCount.value = '0';
  } else {
    onSearch(false);
  }
};

/**
 * 날짜 변경시 리스트 조회 API 호출
 * @param data
 */
const changeRangeDate = (data: string[]) => {
  rangeDate.value = [...data];
  onSearch(true);
};

watch([filterStatus, filterSend], ()=> {
  onSearch(true);
});
// ================= End - 검색 필터 ===========================

/**
 * api 전송 체크
 * 연동 매체 ? 전송 : confirm 팝업 출력
 * @param index uid or index
 */
const apiSend = (): void => {
  isShow.apiSend = true;
};

/**
 * api 전송 이후 리스트 업데이트
 */
const apiSentUpdate = (apiSendResult: SendResultPropsData): void => {
  list.value.forEach(item => {
    if (item.dbUid in apiSendResult) {
      item.sendStatus = apiSendResult[item.dbUid].result ? DB_SEND_STATUS.SUCCESS.VAL : DB_SEND_STATUS.FAIL.VAL;
    }
  });
};

/**
 * DB 수정
 * @param index
 */
const onClickDbEdit = (index: number) => {
  isShow.dbRegister = true;
  selectedIdx.value = index;
};

/**
 * DB 수정했을때 리스트에 반영
 * @param data 수정된 데이터
 */
const onEdit = (data: DbsItem): void => {
  Object.assign(list.value[selectedIdx.value], data);
};

/**
 * DB 개별 등록시 list에 데이터 넣어주는 함수
 * @param data 등록된 데이터
 */
const onCreate = (data: DbsItem): void => {
  if (searched.value) {
    onInit();
  } else {
    list.value.unshift({ ...data });
    totalCount.value++;
  }
};

/**
 * DB 일괄 등록시 list 업데이트
 */
const updateDbBatchData = (): void => {
  if (totalCount.value <= list.value.length) {
    list.value = [];
  }

  cursor.value = 0;
  listTable.value!.checkedToggle();

  getData();
};


/**
 * API 전송 이력 확인
 * @param index : uid or index
 */
const sendApiHistory = (index: number): void => {
  isShow.sendApiHistory = true;
  selectedIdx.value = index;
};

/**
 * 유입링크 창 띄우기
 * @param url 링크
 */
const referer = (url: string): void => {
  window.open(url);
};

let batchData = ref<PostDbsParam[]>([]);
let bachFieldLabelList = ref<KeyIndex<string>>({});
/**
 * 일괄 등록된 데이터 세팅
 * @param data 엑셀 데이터
 */
let setBatchData = (data: PostDbsParam[], headList: KeyIndex<string>): void => {
  batchData.value = data;
  bachFieldLabelList.value = headList;
};

/**
 * 체크된 DB 휴지통 이동처리
 */
const onDeleted = (successList: string[]): void => {
  if (!successList.length) {
    return;
  }

  list.value.forEach(item => {
    if (successList.includes(item.dbUid)) {
      item.isBin = 1;
      const index = checkList.value.indexOf(item.dbUid);
      checkList.value.splice(index, 1);
    }
  });

};


// ================= 데이터 불러옴 ========================================
/**
 * 입력항목 리스트 조회 API 호출
 */
const getClientDbsInputFields = async (): Promise<void> => {
  try {
    const { code, results } = await databaseApi.getDbsInputFieldsConfig(INPUT_FIELDS_CONFIG.inputField);

    console.log(results);

    if (code === getDbsInputFieldsConfigMsg.DB_INPUT_FIELDS_GET_SUCCESS) {
      results.forEach(field => {
        if (field.fieldName !== 'cert') {
          setInputFields(field);
        }
      });

      getData();
    }

  } catch (err) {
    util.axiosErrorCatch<GetDbsInputFieldsRes>(err);

  } finally {
    localStorageCheck();
  }
};

/**
 * DB리스트 조회 API 호출
 */
const getData = async (): Promise<void> => {
  try {
    dataLoading.value = true;
    validateForm.value?.formProtection(true);

    const _startDate = `startDate=${+new Date(`${rangeDate.value[0]} 00:00:00`)}`;
    const _endDate = `&endDate=${+new Date(`${rangeDate.value[1]} 00:00:00`) + (60 * 60 * 24 * 1000) - 1}`;
    const _column = selectTableColumn.value ? `&column=${selectTableColumn.value}` : '';
    const _word = searchText.value ? `${_column}&word=${searchText.value}` : '';
    const _status = filterStatus.value ? `&bin=${filterStatus.value === '1'}` : '';
    const _send = filterSend.value ? `&send=${filterSend.value}` : '';
    const search = encodeURIComponent(`${_startDate}${_endDate}${_word}${_status}${_send}`);

    const params: GetDbsParam = { limit, search };
    if (cursor.value) {
      params.cursor = cursor.value;
    }

    const { results }: GetDbsRes = await databaseApi.getDbs(params);
    results.dbs.forEach(item => {
      const {
        dbUid,
        mediaUid,
        mediaCodeUid,
        dbInputFieldUid,
        media,
        mediaCode,
        sendStatus,
        referer,
        refererType,
        refererIp,
        privacyYnDatetime,
        thirdPartyYnDatetime,
        smsYnDatetime,
        isBin,
        inputDatetime,
        regDatetime,
        modDatetime,
        ...inputfields
      } = item;

      const obj: DbsItem = {
        dbUid,
        mediaUid,
        mediaCodeUid,
        dbInputFieldUid,
        media,
        mediaCode,
        sendStatus,
        referer,
        refererType,
        refererIp: refererIp ?? '-',
        privacyYnDatetime,
        thirdPartyYnDatetime,
        smsYnDatetime,
        isBin,
        inputDatetime,
        regDatetime,
        modDatetime,
        inputfields: {
          ...inputfields
        }
      };
      list.value.push(obj);
    });

    totalCount.value = results.totalCount;
    observer.value = !(totalCount.value <= list.value.length);
    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].regDatetime;
    }

  } catch (err) {
    util.axiosErrorCatch<GetDbsRes>(err);

  } finally {
    dataLoading.value = false;
    validateForm.value?.formProtection(false);
  }
};

validateForm.value?.formProtection(true);
dateInit();
getClientDbsInputFields();
levelCheck();
// End - 데이터 불러옴 ========================================
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
              :options="optLevelTableColumn"
              v-model="selectTableColumn"
            />
          </div>

          <div class="width-250">
            <TextField
              block
              placeholder="검색어를 입력해주세요."
              :icon="mdiMagnify"
              :max-length="50"
              :icon-action="() => onSearch(true)"
              @keydown.enter="!dataLoading && onSearch(true)"
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

          <Badge
            :text="badgeCount"
            v-else
          >
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

      <div class="searchArea" v-if="memberLevelNumber !== 40">
        <div class="flex gap-8">
          <DropMenu v-slot="{ toggle }" color="primary" :items="dropMenuItem">
            <StyledButton
              icon-right
              color="primary"
              :icon="mdiChevronDown"
              :drop-menu-toggle="toggle"
            >
              고객 DB 등록
            </StyledButton>
          </DropMenu>

          <StyledButton
            only-icon
            outline
            color="secondary"
            :icon="mdiTrashCanOutline"
            :disabled="!checkList.length"
            @click.prevent="isShow.dbBin = true"
          />

          <StyledButton
            outline
            color="secondary"
            :disabled="!checkList.length"
            @click.prevent="apiSend"
          >
            API 전송
          </StyledButton>

          <StyledButton
            outline
            color="secondary"
            @click.prevent="isShow.dbDownload = true"
          >
            엑셀 다운로드
          </StyledButton>
        </div>

        <div class="flex gap-8">
          <div class="width-250">
            <SelectBox
              block
              multiple
              label-text
              is-short
              btn-accept
              clearable
              placeholder="노출 항목"
              :options="optInputColumn"
              v-model="selectInputColumn"
            />
          </div>
        </div>
      </div>
    </ValidateForm>

    <ListTable
      ref="listTable"
      empty-text="데이터가 존재하지 않습니다"
      :check-all="isAllCheck"
      :height="listTableHeight"
      :width="listTableWidth"
      :header="isExtraData ? addColumnsTableHeader : tableHeader"
      :items="list"
      :loading="dataLoading"
      :observer="observer"
      @observe="getData"
      @checked="checkAll"
    >
      <template #items="{ props, index }: ListTableItemSlot<DbsItem>">
        <tr :key="`list-${props.dbUid}`">
          <td v-if="memberLevelCheck()">
            <ListTableCheckbox
              name="list"
              :value="props.dbUid"
              :disabled="!!props.isBin"
              :is-checked="checkList.includes(props.dbUid)"
              @checked="listTableCheck"
            />
          </td>
          <td>
            <div class="flex-center gap-x-2">
              <SvgIcon
                type="mdi"
                size="14"
                :path="mdiCheckboxBlankCircle"
                :class="[
                  'mr-1',
                  'font-sm',
                  { 'text-red': props.isBin, 'text-point': !props.isBin }
                ]"
              />
              {{ props.isBin ? '휴지통' : '유효DB' }}
            </div>
          </td>

          <td>
            <div class="btn-wrap flex" v-if="!memberLevelCheck()">
              <span class="text-size-m-2">
                {{ util.getDateFormat(props.inputDatetime, 'Y-m-d H:i:s') }}
              </span>
            </div>

            <template v-else>

              <StyledButton
                text
                color="primary"
                :icon="mdiPencil"
                @click.prevent="onClickDbEdit(index)"
                v-if="!props.isBin"
              >
                {{ util.getDateFormat(props.inputDatetime, 'Y-m-d H:i:s') }}
              </StyledButton>
              <StyledButton
                text
                disabled
                color="gray-400"
                :icon="mdiPencil"
                v-else
              >
                {{ util.getDateFormat(props.inputDatetime, 'Y-m-d H:i:s') }}
              </StyledButton>

            </template>
          </td>

          <template
            :key="`extra-${field.fieldName}`"
            v-for="field in optInputColumn"
          >
            <td v-if="selectInputColumn.includes(field.value)">
              <template v-if="props.inputfields[field.value] !== null">

                <template v-if="field.value === 'phone'">
                  {{ props.inputfields[field.value] ? props.inputfields[field.value]?.toString().phoneNumber() : '-' }}
                </template>

                <template v-else>
                  {{ getValue(field.value, props.inputfields[field.value] as string) }}
                </template>
              </template>
              <template v-else>-</template>
            </td>
          </template>

          <td>{{ props.refererIp || '-' }}</td>
          <td v-if="memberLevelCheck()">
            <StyledButton
              text
              color="primary"
              @click.prevent="sendApiHistory(index)"
              v-if="props.sendStatus === DB_SEND_STATUS.SUCCESS.VAL || props.sendStatus === DB_SEND_STATUS.FAIL.VAL "
            >
              {{ DB_SEND_STATUS[props.sendStatus].TXT }}
            </StyledButton>
            <template v-else>
              {{ DB_SEND_STATUS[props.sendStatus].TXT }}
            </template>
          </td>
          <td>{{ props.media || '-' }}</td>
          <td>
            <template v-if="!!props.referer">
              <StyledButton
                text
                color="primary"
                @click="referer(props.referer)"
              >
                {{ props.mediaCode || '-' }}
              </StyledButton>
            </template>
            <template v-else>
              {{ props.mediaCode || '-' }}
            </template>
          </td>
        </tr>
      </template>
    </ListTable>

    <DbSearchFilter
      :status="filterStatus"
      :send="filterSend"
      @close="onPopupClose('dbSearchFilter')"
      @update="onListUpdate"
      v-if="isShow.dbSearchFilter"
    />

    <DbRegister
      :index="selectedIdx"
      :selected-db="list[selectedIdx]"
      :input-fields="useInputfields"
      @close="onPopupClose('dbRegister')"
      @on:create="onCreate"
      @on:edit="onEdit"
      v-if="isShow.dbRegister"
    />

    <DbBatchRegister
      @close="onPopupClose('dbBatchRegister')"
      @upload-data="setBatchData"
      @open-result="isShow.dbBatchResult = true"
      v-if="isShow.dbBatchRegister"
    />

    <DbBatchResult
      :data="batchData"
      :field-label-list="bachFieldLabelList"
      @close="onPopupClose('dbBatchResult')"
      @refresh="updateDbBatchData"
      v-if="isShow.dbBatchResult"
    />

    <DbBin
      :count="checkList.length"
      :selected-data-list="checkList"
      @close="onPopupClose('dbBin')"
      @deleted="onDeleted"
      v-if="isShow.dbBin"
    />

    <ApiSend
      :check-list="checkList"
      @close="onPopupClose('apiSend')"
      @on:update="apiSentUpdate"
      v-if="isShow.apiSend"
    />

    <DbDownload
      :type="DOWNLOAD.DB.VAL"
      @close="onPopupClose('dbDownload')"
      v-if="isShow.dbDownload"
    />

    <SendApiHistory
      :db-uid="list[selectedIdx].dbUid"
      @close="onPopupClose('sendApiHistory')"
      v-if="isShow.sendApiHistory"
    />
  </div>
</template>{
      ...field, objOption: option_useInputfields,
      dbInputFieldConfigUid: '',
      regDatetime: 0,
      modDatetime: 0
    }
