import type {
  getAligoApiMsg,
  postAligoApiMsg,
  postAligoCodeMsg,
  postAligoCodeCheckMsg,
  getDomainsMsg,
  patchDomainsMsg,
  getDomainsSearchMsg,
  postDomainsMsg,
  getTemplatesMsg,
  postTemplatesMsg,
  putTemplatesMsg,
  postCopyTemplatesMsg,
  deleteTemplatesMsg
} from '@/constants/api/myAppapi';
import type { PaginationDefault, ResponseDefault } from '@/types/api';

// 알리고 설정 정보
export type GetAligoApiMsg = keyof typeof getAligoApiMsg;

export interface AligoItem {
  aligoConfigUid: string
  aligoId: string
  aligoApiKey: string
  aligoSender: string
  regDatetime: number
  modDatetime: number
}

export interface AligoResultItem {
  result_code: number
  message: string
  SMS_CNT: number
  LMS_CNT: number
  MMS_CNT: number
}

export interface GetAligoApiResult {
  aligoApi: AligoItem
  apiResult: AligoResultItem
}

export interface GetAligoApiRes extends ResponseDefault<GetAligoApiMsg> {
  results: GetAligoApiResult
}


// 알리고 설정 정보 저장
export type PostAligoApiMsg = keyof typeof postAligoApiMsg;

export interface PostAligoApiParam {
  aligoConfigUid: string
  aligoId: string
  aligoApiKey: string
  aligoSender: string
}

export interface PostAligoApiRes extends ResponseDefault<PostAligoApiMsg> {}


// 알리고 인증 번호 전송
export type PostAligoCodeMsg = keyof typeof postAligoCodeMsg;

export interface PostAligoCodeParam {
  clientId: string
  phone: string
}

export interface PostAligoCodeRes extends ResponseDefault<PostAligoCodeMsg> {}


// 알리고 인증 번호 확인
export type PostAligoCodeCheckMsg = keyof typeof postAligoCodeCheckMsg;

export interface PostAligoCodeCheckParam {
  phone: string
  code: string
}

export interface PostAligoCodeCheckRes extends ResponseDefault<PostAligoCodeCheckMsg> {}

// 도메인 목록
export type GetDomainsMsg = keyof typeof getDomainsMsg;

export interface GetDomainsResult {
  domainUid: string
  domain: string
  isConnect: BooleanYN
  isMain: BooleanYN
  regDatetime: number
  modDatetime: number
}

export interface GetDomainsRes extends ResponseDefault<GetDomainsMsg> {
  results: GetDomainsResult[]
}


// 대표 도메인 설정
export type PatchDomainsMsg = keyof typeof patchDomainsMsg;

export interface PatchDomainParam {
  domainUid: string
  isMain: BooleanYN
}

export interface PatchDomainRes extends ResponseDefault<PatchDomainsMsg> {}


// 도메인 검색(후이즈 연동)
export type GetDomainsSearchMsg = keyof typeof getDomainsSearchMsg;

export interface GetDomainsSearchParam {
  domain: string
}

export interface GetDomainsSearchResult {
  domain: string
  result_code: string
}

export interface GetDomainsSearchRes extends ResponseDefault<GetDomainsSearchMsg> {
  results: GetDomainsSearchResult[]
}


// 도메인 연결 신청
export type PostDomainsMsg = keyof typeof postDomainsMsg;

export interface PostDomainsParam {
  domainUid: string
  domain: string
  memberEmail: string
}

export interface PostDomainsRes extends ResponseDefault<PostDomainsMsg> {}

// 템플릿 목록/검색
export type GetTemplatesMsg = keyof typeof getTemplatesMsg;

export interface GetTemplatesParam extends PaginationDefault {
  search: string
}

export interface TemplateItem {
  templateUid: string
  layoutUid: string
  templateName: string
  layoutName: string
  sourceCode: string
  regDatetime: number
  modDatetime: number
}

export interface GetTemplatesResult {
  totalCount: number
  templates: TemplateItem[]
}

export interface GetTemplatesRes extends ResponseDefault<GetTemplatesMsg> {
  results: GetTemplatesResult
}


// 템플릿 저장
export type PostTemplatesMsg = keyof typeof postTemplatesMsg;

export interface PostTemplatesParam extends PutTemplatesParam {
  templateUid: string
  layoutUid: string
  templateName: string
  sourceCode: string
}

export interface PostTemplatesRes extends ResponseDefault<PostTemplatesMsg> {}


// 템플릿 수정
export type PutTemplatesMsg = keyof typeof putTemplatesMsg;

export interface PutTemplatesParam {
  layoutUid: string
  templateName: string
  sourceCode: string
}

export interface PutTemplatesRes extends ResponseDefault<PutTemplatesMsg> {}


// 템플릿 복사
export type PostCopyTemplatesMsg = keyof typeof postCopyTemplatesMsg;

export interface PostCopyTemplatesParam {
  templateUid: string
  templateName: string
}

export interface PostCopyTemplatesRes extends  ResponseDefault<PostCopyTemplatesMsg> {}


// 템플릿 삭제
export type DeleteTemplatesMsg = keyof typeof deleteTemplatesMsg;

export interface DeleteTemplatesRes extends ResponseDefault<DeleteTemplatesMsg> {}
