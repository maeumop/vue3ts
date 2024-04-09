import type { ConstDbFormKeys, ConstApiSendStatusKeys } from '../common';
import type { KeyIndex, OptionItem } from '@/components/types';
import type { GetCodesSearchItem } from '@/types/api/mediaUtmCodeApi';
import type { SendItem, PostApisSendParam, InputFieldConfigItem } from '@/types/api/databaseApi';
import type { ListTableHeader } from '@/components/ListTable/types';
import type {
  LEVLEL_NUMBER,
  INPUT_FIELDS_NAME,
  ALL_INPUT_FIELDS_NAME,
  INPUT_FIELDS_AGREE_TIME_NAME
} from '@/constants/db';

// ================== [DB관리 > 리스트] 회원 레벨 관련 타입 ===========================
export interface LevelListTableHeader extends ListTableHeader {
  level: number
}

export interface DBListTableHeader extends ListTableHeader {
  value?: string;
  isInputField?: boolean;
}

export interface LevelOptionItem extends OptionItem {
  level: number
}

// 회원레벨
export type LEVLEL_NUMBER_TYPE_VALUE = typeof LEVLEL_NUMBER[keyof typeof LEVLEL_NUMBER];
// ================== End - [DB관리 > 리스트] 회원 레벨 관련 타입 ===========================


// ================== [입력 항목 관련] ===========================
// 인증번호가 빠진 InputFieldsItem 타입
// export interface InputFieldConfigWithOption {
//   dbInputFieldConfigUid: string
//   fieldType: ConstDbInputFieldTypeKeys
//   fieldLabel: string
//   fieldName: INPUT_FIELDS_NAME_TYPE
//   fieldName: string
//   replaceCode: string
//   placeholder: string
//   maxLength: number
//   numberInputRange: string
//   hiddenValue: string
//   options: JsonString
//   isRequire?: number
//   isTextFiltering: number
//   isUse: number
//   regDatetime: number
//   modDatetime: number
// }

// api로 가져온 입력항목에서 options를 JSON.parse()을 적용한 객체의 타입
export interface FieldOption {
  label: string
  value: string
  checked: boolean
}


// option 값 JSON.parse 적용
export interface InputFieldConfigWithOption  extends InputFieldConfigItem {
  objOption?: InputFieldsOptionItem[]
}

// option 값 JSON.parse, 값 적용
export interface InputFieldsItemValue  extends InputFieldConfigWithOption {
  objOption?: InputFieldsOptionItem[]
  values?: string | string[] | null
}

// CHECK, SELECT, RADIO 항목의 value값들이 담겨져있는 객체 타입
export interface FieldInfo {
  type: string
  label: ConstDbInputFieldTypeKeys
  option?: KeyIndex<string>
}

// 개별등록/수정 팝업에서 폼 만들때 사용되는 데이터의 타입
export interface InputFieldsOptionItem  extends OptionItem {
  checked?:  boolean
}
export type ALL_INPUT_FIELDS_NAME_TYPE = typeof ALL_INPUT_FIELDS_NAME[keyof typeof ALL_INPUT_FIELDS_NAME];
export type INPUT_FIELDS_NAME_TYPE = typeof INPUT_FIELDS_NAME[keyof typeof INPUT_FIELDS_NAME];

// export interface _Inputfield extends Inputfield {
//   [index: INPUT_FIELDS_NAME_TYPE]: string | number | null
// }
export type _Inputfield = {[index: INPUT_FIELDS_NAME_TYPE]: string | number};

export type INPUT_FIELDS_AGREE_TIME_NAME_TYPE = typeof INPUT_FIELDS_AGREE_TIME_NAME[keyof typeof INPUT_FIELDS_AGREE_TIME_NAME];
export interface AgreeDateTime {
  [index: INPUT_FIELDS_AGREE_TIME_NAME_TYPE]: number

  privacyYnDatetime: number
  thirdPartyYnDatetime: number
  smsYnDatetime: number
}

// ================== End - [입력 항목 관련] ===========================


export interface DbsItem {
  [index: string]: string | ConstApiSendStatusKeys | ConstDbFormKeys | number | null | _Inputfield<string | number | null | undefined>

  dbUid: string
  mediaUid: string
  mediaCodeUid: string
  dbInputFieldUid?: string
  media: string
  mediaCode: string

  sendStatus: ConstApiSendStatusKeys
  referer: string | null
  refererType: ConstDbFormKeys
  refererIp?: string
  privacyYnDatetime: number
  thirdPartyYnDatetime: number
  smsYnDatetime: number
  isBin: number
  inputDatetime: number
  regDatetime: number
  modDatetime: number

  // 입력 항목
  inputfields: Inputfield,
}

// 등록/수정 emit 데이터 타입
export interface DbsNewItem {
  [index: string]: string | number | null | ConstDbFormKeys

  dbUid: string
  mediaUid: string
  mediaCodeUid: string
  clientAccountUid: string
  dbInputFieldUid?: string
  media: string
  mediaCode: string

  isSendApi: number | null // 전송여부
  referer: string | null
  refererType: ConstDbFormKeys
  refererIp: string
  privacyYnDatetime: number
  thirdPartyYnDatetime: number
  smsYnDatetime: number
  isBin: number
  regDatetime: number
  modDatetime: number

  // 입력 항목
  inputfields: _Inputfield,
}

export interface AgreeData {
  text: string
  modelValue: number[]
  dateTime: number
}

// DB 등록/수정 > 매체코드선택팝업의 emit 데이터 타입
export interface CodesSearchItem extends GetCodesSearchItem {
  media: string
}


// ================== API 전송 ===========================
export interface _PostApisSendParam extends PostApisSendParam {
  index: number
}
export interface _SendItem extends SendItem {
  apiSendHistoryUid?: string
  sendResult: number
  url?: string
  parameter?: string
  sendResponse?: string
  sendDatetime: number
}

export interface SendResult {
  result: number
  sendDatetime: number
}

export interface SendResultPropsData {
  [index: string]: SendResult
}
