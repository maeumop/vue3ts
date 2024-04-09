import type {
  getDbsMsg,
  getDbsInputFieldsMsg,
  postDbsMsg,
  putDbsMsg,
  deleteDbsMsg,
  getDbsDownloadMsg,
  postDbsDownloadMsg,
  patchDbsDownloadMsg,
  getBinsMsg,
  deleteBinsMsg,
  patchBinsRecoveryMsg,
  getBinsDeleteHistoryMsg,
  getFilterMsg,
  postFilterMsg,
  putFilterMsg,
  getApisMsg,
  getApisCountMsg,
  patchApisMsg,
  apiSettingValueType,
  getApisSendMsg,
  postApisSendMsg,
  deleteApisMsg,
  getDbsApisSendMsg,
  postApisMsg,
  putApisMsg,
  getDbsExistByPhoneMsg,
  getDbsInputFieldsConfigMsg,
} from '@/constants/api/databaseApi';
import type { ResponseDefault, PaginationDefault } from '.';
import type {
  ConstDbFormKeys,
  ConstBinKeys,
  ConstDownloadKeys,
  ConstDbInputFieldTypeKeys,
  ConstApiSendStatusKeys,
  ConstApiContentKeys,
  ConstApiMethodKeys,
  ConstApiResponseKeys,
  JsonString,
  BooleanYN
} from '@/types/common';
import type { INPUT_FIELDS_CONFIG } from '@/constants/db';
import type { ALL_INPUT_FIELDS_NAME_TYPE } from '@/types/db';

export interface Inputfield {
  phone: string
  name: string
  age?: number
  cert?: string
  gender?: string
  etcComment?: string
  input1?: string
  input2?: string
  input3?: string
  input4?: string
  input5?: string
  input6?: string
  input7?: string
  input8?: string
  input9?: string
  input10?: string
  input11?: string
  input12?: string
  input13?: string
  input14?: string
  input15?: string
  input16?: string
  input17?: string
  input18?: string
  input19?: string
  input20?: string

  privacyYn: BooleanYN
  thirdPartyYn: BooleanYN
  smsYn: BooleanYN
}

export interface InputfieldParam  extends Omit<Inputfield, 'cert'> {}


// DB 목록(검색)
export type GetDbsMsg = keyof typeof getDbsMsg;

export interface GetDbsParam extends PaginationDefault {
  search: string
}

export interface GetDbsItem extends Inputfield {
  dbUid: string
  mediaUid: string
  mediaCodeUid: string
  clientId: string
  referer: string | null
  refererType: ConstDbFormKeys
  refererIp?: string
  sendStatus: ConstApiSendStatusKeys
  isBin: BooleanYN
  inputDatetime: number
  regDatetime: number
  modDatetime: number
  dbInputFieldUid: string

  privacyYnDatetime: number
  thirdPartyYnDatetime: number
  smsYnDatetime: number

  media: string
  mediaCode: string
}

export interface GetDbsResult {
  totalCount: number
  dbs: GetDbsItem[]
}
export interface GetDbsRes extends ResponseDefault<GetDbsMsg> {
  results: GetDbsResult
}


// api 설정 목록
export type GetDbsInputFieldsMsg = keyof typeof getDbsInputFieldsMsg;

export interface GetDbsInputFieldsParam {
  config: number
}

export interface GetDbsInputFieldsItem {
  dbInputFieldConfigUid: string
  fieldType: ConstDbInputFieldTypeKeys
  fieldLabel: string
  fieldName: INPUT_FIELDS_NAME_TYPE
  replaceCode: string
  placeholder: string
  maxLength: number
  numberInputRange: string
  hiddenValue: string
  options: JsonString
  isRequire?: BooleanYN
  isTextFiltering: BooleanYN
  isUse: BooleanYN
  regDatetime: number
  modDatetime: number
}

export interface GetDbsInputFieldsRes extends ResponseDefault<GetDbsInputFieldsMsg> {
  results: GetDbsInputFieldsItem[]
}


// DB 등록
export type PostDbsMsg = keyof typeof postDbsMsg;

export interface PostDbsParamRest {
  dbUid: string
  mediaCode: string
  referer?: string
  refererType: ConstDbFormKeys
  refererIp?: string

  regDatetime?: number
  privacyYnDatetime?: number
  thirdPartyYnDatetime?: number
  smsYnDatetime?: number
}

export interface PostDbsParam  extends InputfieldParam, PostDbsParamRest {
  [x: string]: string;
}

export interface PostDbsResult {
  sendStatus?: ConstApiSendStatusKeys
  isBin?: BooleanYN
  refererIp?: string
  filtered?: string
}
export interface PostDbsRes extends ResponseDefault<PostDbsMsg> {
  results: PostDbsResult
  message?: PostDbsResult
}


// DB 수정
export type PutDbsMsg = keyof typeof putDbsMsg;

export interface PutDbsParamRest {
  mediaCode: string
  referer?: string
  privacyYnDatetime: number
  thirdPartyYnDatetime: number
  smsYnDatetime: number
}

export interface PutDbsParam  extends InputfieldParam, PutDbsParamRest {
  [x: string]: string;
}

export interface PutDbsRes extends ResponseDefault<PutDbsMsg> {}


// DB 삭제 (휴지통으로 이동)
export type DeleteDbsMsg = keyof typeof deleteDbsMsg;

export interface DeleteDbsParamMember {
  memberEmail: string
  password: string
  reason: ConstBinKeys
  reasonNote: string
}
export interface DeleteDbsMemberParamDbs {
  dbUid: string
}

export interface DeleteDbsParam {
  member: DeleteDbsParamMember
  dbs: string[]
}

export interface DeleteDbsResult {
  toBinCount: number
}

export interface DeleteDbsRes extends ResponseDefault<DeleteDbsMsg> {
  results: DeleteDbsResult
}

// DB 다운로드 목록
export type GetDbsDownloadMsg = keyof typeof getDbsDownloadMsg;

export interface GetDbsDownloadParam extends PaginationDefault {
  downloadType: ConstDownloadKeys
}

export interface GetDbsDownloadItem {
  dbDownloadUid: string
  memberEmail: string
  dbCount: number
  downloadType: ConstDownloadKeys
  filePath: string
  isDownload: BooleanYN
  downloadDatetime: number
  startDatetime: number
  endDatetime: number
  regDatetime: number
}

export interface GetDbsDownloadRessult {
  downloads: GetDbsDownloadItem[]
  totalCount: number
}

export interface GetDbsDownloadRes extends ResponseDefault<GetDbsDownloadMsg> {
  results: GetDbsDownloadRessult
}

// DB 다운로드 엑셀 파일 생성
export type PostDbsDownloadMsg = keyof typeof postDbsDownloadMsg;

export interface PostDbsDownloadParam {
  dbDownloadUid: string
  memberUid: string
  password: string
  startDatetime: number
  endDatetime: number
  downloadType: ConstDownloadKeys
}

export interface PostDbsDownloadResult {
  dbsCount: number
  filePath: string
}
export interface PostDbsDownloadRes extends ResponseDefault<PostDbsDownloadMsg> {
  results: PostDbsDownloadResult
}


// DB 엑셀 다운로드
export type PatchDbsDownloadMsg = keyof typeof patchDbsDownloadMsg;

export interface PatchDbsDownloadParam {
  memberUid: string
}

export interface PatchDbsDownloadResult {
  file: {
    data: UInt8Array,
    type: string
  }
}

export interface PatchDbsDownloadRes extends ResponseDefault<PatchDbsDownloadMsg> {
  results: PatchDbsDownloadResult
}

// 휴지통 목록/조건별 검색
export type GetBinsMsg = keyof typeof getBinsMsg;

export interface GetBinsParam extends PaginationDefault {
  search: string
}

export interface GetBinsItem {
  dbBinUid: string
  dbUid: string
  mediaUid: string
  mediaCodeUid: string
  referer?: string
  refererIp: string
  media: string
  mediaCode: string
  name: string
  phone: string
  reason: string
  reasonNote: string
  binDatetime: number
  memberEmail: string
  regDatetime: number
  inputDatetime: number
}

export interface GetBinsResult {
  totalCount: number
  dbs: GetBinsItem[]
}

export interface GetBinsRes extends ResponseDefault<GetBinsMsg> {
  results: GetBinsResult
}

// 휴지통 삭제 비밀번호 확인
export type PostBinsPwCheckMsg = keyof typeof postBinsPwCheckMsg;

export interface PostBinsPwCheckParam {
  memberEmail: string,
  password: string
}

export interface PostBinsPwCheckRes extends ResponseDefault<PostBinsPwCheckMsg> {}

// 휴지통 영구 삭제
export type DeleteBinsMsg = keyof typeof deleteBinsMsg;

export interface DeleteBinsParam {
  memberEmail: string,
  dbUids: string[]
}

export interface DeleteBinsRes extends ResponseDefault<DeleteBinsMsg> {}

// 휴지통 복구
export type PatchBinsRecoveryMsg = keyof typeof patchBinsRecoveryMsg;

export interface PatchBinsRecoveryRes extends ResponseDefault<PatchBinsRecoveryMsg> {}

// 영구 삭제 이력
export type GetBinsDeleteHistoryMsg = keyof typeof getBinsDeleteHistoryMsg;

export interface GetBinsDeleteHistoryItem {
  dbDeleteHistoryUid: string
  dbCount: number
  memberEmail: string
  delDatetime: number
}

export interface GetBinsDeleteHistoryResult {
  totalCount: number
  history: GetBinsDeleteHistoryItem[]
}

export interface GetBinsDeleteHistoryRes extends ResponseDefault<GetBinsDeleteHistoryMsg> {
  results: GetBinsDeleteHistoryResult
}

// DB 필터 세부내역
export type GetFilterMsg = keyof typeof getFilterMsg;

export interface GetFilterResult {
  dbFilterUid: string
  phoneFilterDay: number
  ipFilterDay: BooleanYN
  isFilterPhoneInPage: BooleanYN
  isFilterIpInPage: BooleanYN
  isFilterPhoneInManual: BooleanYN
  isFilterPhoneInApi: BooleanYN
  wordFilterList: string
  phoneFilterList: string
  regDatetime: number
  modDatetime: number
}

export interface GetFilterRes extends ResponseDefault<GetFilterMsg> {
  results: GetFilterResult
}

// DB 필더 저장
export type PostFilterMsg = keyof typeof postFilterMsg;

// 저장
export interface PostFilterParam {
  dbfilterUid: string
  phoneFilterDay: number
  ipFilterDay: number
  isFilterPhoneInPage: BooleanYN
  isFilterIpInPage: BooleanYN
  isFilterPhoneInManual: BooleanYN
  isFilterPhoneInApi: BooleanYN
  wordFilterList?: string
  phoneFilterList?: string
}

export interface PostFilterRes extends ResponseDefault<PostFilterMsg> {}

// 수정
export interface PutFilterParam {
  dbFilterUid: string
  phoneFilterDay: number
  ipFilterDay: number
  isFilterPhoneInPage: BooleanYN
  isFilterIpInPage: BooleanYN
  isFilterPhoneInManual: BooleanYN
  isFilterPhoneInApi: BooleanYN
  wordFilterList?: string
  phoneFilterList?: string
}

// DB 필더 수정
export type PutFilterMsg = keyof typeof putFilterMsg;

export interface PutFilterRes extends ResponseDefault<PutFilterMsg> {}

// api 설정 목록
export type GetApisMsg = keyof typeof getApisMsg;

export interface GetApisParam {
  cursor?: number
  limit: number
}

export interface GetApisItem {
  apiUid: string
  mediaUid: string
  media: string
  company: string
  contentType: ConstApiContentKeys
  method: ConstApiMethodKeys
  url: string
  parameter: JsonString
  responseType: ConstApiResponseKeys
  responseProperty: string
  successValue: string
  comment: string
  isUse?: BooleanYN
  regDatetime?: number
  modDatetime?: number
}

export interface GetApisResult {
  totalCount: number
  apis: GetApisItem[]
}

export interface GetApisRes extends ResponseDefault<GetApisMsg> {
  results: GetApisResult
}

// api 중복 체크
export type GetApisCountMsg = keyof typeof getApisCountMsg;

export interface GetApisCountParam {
  clientId: string
  mediaUid: string
  sendUrl: string
}

export interface GetApisCountResult {
  isExist: number
}

export interface GetApisCountRes extends ResponseDefault<GetApisCountMsg> {
  results: GetApisCountResult
}

// api on/off
export type PatchApisMsg = keyof typeof patchApisMsg;

export interface PatchApisParam {
  isUse: BooleanYN
}

export interface PatchApisRes extends ResponseDefault<PatchApisMsg> {}

// parameters json 전송값 설정
export type ApiSettingValueType = typeof apiSettingValueType[keyof typeof apiSettingValueType];

export interface ApiSettingChildren {
  key?: string
  value: string
}

export interface ApiSetting {
  key: string
  valueType?: ApiSettingValueType
  value: string
  children?: ApiSettingChildren[]
}


// API 전송 목록(연동 내역 체크)
export type GetApisSendMsg = keyof typeof getApisSendMsg;

export interface GetApisSendParam {
  dbs: string
}

export interface SendItem {
  dbUid: string
  apiUid: string | null
  name: string
  phone: string
  company: string
}
export interface GetApisSendResult {
  dbsCount: number
  sendCount: number
  sendList: SendItem[]
}
export interface GetApisSendRes extends ResponseDefault<GetApisSendMsg> {
  results: GetApisSendResult
}

// API 전송
export type PostApisSendMsg = keyof typeof postApisSendMsg;

export interface PostApisSendParam {
  dbUid: string
  apiUid: string
}

export interface PostApisSendResult {
  apiSendHistoryUid: string
  dbUid: string
  company: string
  sendResult: BooleanYN
  url: string
  parameter: string
  sendResponse: string
  sendDatetime: number
}
export interface PostApisSendRes extends ResponseDefault<PostApisSendMsg> {
  results: PostApisSendResult
}

// API 삭제
export type DeleteApisMsg = keyof typeof deleteApisMsg;

export interface DeleteApisRes extends ResponseDefault<DeleteApisMsg> {}

// API 전송 이력
export type GetDbsApisSendMsg = keyof typeof getDbsApisSendMsg;

export interface SendHistoryItem {
  apiSendHistory: string
  dbUid: string
  company: string
  sendResult: string
  sendUrl: string
  sendParam: string
  sendResponse: string
  sendDatetime: string
}

export interface GetDbsApisSendRessult {
  totalCount: number
  sendHistory: SendHistoryItem[]
}

export interface GetDbsApisSendRes extends ResponseDefault<GetDbsApisSendMsg> {
  results: GetDbsApisSendRessult
}

// api 설정 정보 저장
export type PostApisMsg = keyof typeof postApisMsg;

export interface PostApisParam extends Omit<GetApisItem, 'media' | 'regDatetime' | 'mdiDateTime'> {}

export interface PostApisRes extends ResponseDefault<PostApisMsg> {}

// api 설정 정보 수정
export type PutApisMsg = keyof typeof putApisMsg;

export interface PutApisParam extends Omit<PostApisParam, 'apiUid'> {}

export interface PutApisRes extends ResponseDefault<PutApisMsg> {}


// DB 연락처 중복 확인
export type GetDbsExistByPhoneMsg = keyof typeof getDbsExistByPhoneMsg;

export interface GetDbsExistByPhoneResult {
  isExist: BooleanYN
}
export interface GetDbsExistByPhoneRes extends ResponseDefault<GetDbsExistByPhoneMsg> {
  results: GetDbsExistByPhoneResult
}

/**
 * @editor 김종윤
 * @editDate 2024.03.21
 * @desc input form field config api 변경으로 인한 수정
 */
export type getDbsInputFieldsConfigMsg = keyof typeof getDbsInputFieldsConfigMsg;

export type GetDbsInputFieldsConfigType = typeof INPUT_FIELDS_CONFIG[keyof typeof INPUT_FIELDS_CONFIG];

export interface InputFieldConfigItem {
  dbInputFieldConfigUid: string
  fieldType: ConstDbInputFieldTypeKeys
  fieldLabel: string
  fieldName: ALL_INPUT_FIELDS_NAME_TYPE
  replaceCode: string
  placeholder: string
  maxLength: number
  numberInputRange: string
  hiddenValue: string
  options: JsonString
  isRequire: number
  isRequireBatchDb: string
  isTextFiltering: number
  isUse: number
  replaceCodeDesc: string
  batchDbDesc: string
}

export interface GetDbsInputFieldsConfigRes {
  code: getDbsInputFieldsConfigMsg
  results: InputFieldConfigItem[]
}