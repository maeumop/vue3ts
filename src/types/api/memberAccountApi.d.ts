import type {
  postMembersMsg,
  postMembersLoginMsg,
  getMembersExistsByEmailMsg,
  postMembersAuthsMsg,
  patchMembersAuthsMsg,
  deleteMembersAuthsMsg,
  putMembersAuthsMsg,
  getMembersAuthsMsg,
  getMembersClientsMsg,
  patchMembersClientsMsg,
  getMembersAdMsg,
  patchMembersAdMsg,
  patchMembersPwMsg,
  postMembersVerifyEmailMsg,
  patchMembersVerifyEmailMsg,
  patchMembersPwByEmailMsg,
  postMemberJoinEmailMsg,
  postClientsAccountsMsg,
  putClientsAccountsMsg,
  patchClientsAccountsMsg,
  getClientsAccountsExistByIdMsg,
  getClientsAccountsExistByNameMsg,
  getClientsDefaultPageMsg,
  patchClientsDefaultPageMsg
} from '@/constants/api/memberAccountApi';
import type { API, PaginationDefault, ResponseDefault } from '.';

import type {
  ConstGenderKeys,
  ConstAuthKeys,
  ConstClientCategoryKeys,
  ConstClientCategorySubTotalKeys,
  ConstClientAccountServiceKeys,
  ConstClientAccountStatusKeys,
} from '@/types/common';

// 회원 가입
export type PostMembersMsg = keyof typeof postMembersMsg;

export interface PostMembersParam {
  memberUid: string
  memberEmail: string
  password: string
  memberName?: string
  memberPhone?: string
  isOverFourteen: BooleanYN
  isAgreeTerms: BooleanYN
  isAgreePrivacy: BooleanYN
  isAgreeAd: BooleanYN
  isSuper: BooleanYN
}

export interface PostMembersRes extends ResponseDefault<PostMembersMsg> {}

// login
export type PostMembersLoginMsg = keyof typeof postMembersLoginMsg;

export interface PostMembersLoginParam {
  memberEmail: string
  password: string
}

export interface PostMembersLoginRes extends ResponseDefault<PostMembersLoginMsg> {}

// 이메일 중복 체크
export type GetMembersExistsByEmailMsg = keyof typeof getMembersExistsByEmailMsg;

export interface GetMembersExistByEmailParam {
  memberEmail: string
}

export interface GetMembersExistByEmailRes extends ResponseDefault<GetMembersExistsByEmailMsg> {
  isExist: BooleanYN
}

// 권한 초대
export type PostMembersAuthsMsg = keyof typeof postMembersAuthsMsg;

export interface PostMembersAuthsParam {
  clientAccountMemberRelUid: string
  memberEmail: string
  authLevel: string
  mediaUids?: string
}

export interface PostMembersAuthsRes extends ResponseDefault<PostMembersAuthsMsg> {}


// 권한 초대 수락
export type PatchMembersAuthsMsg = keyof typeof patchMembersAuthsMsg;

export interface PatchMembersAuthsRes extends ResponseDefault<PatchMembersAuthsMsg> {}

// 권한 초대 거절/취소/해제
export type DeleteMembersAuthsMsg = keyof typeof deleteMembersAuthsMsg;

export interface DeleteMembersAuthsRes extends ResponseDefault<DeleteMembersAuthsMsg>  {}

// 권한 관리 - 권한 수정
export interface PutMembersAuthsReq {
  authLevel: string
  mediaUids?: string
}
export type PutMembersAuthsMsg = keyof typeof putMembersAuthsMsg;

export interface PutMembersAuthsRes extends ResponseDefault<PutMembersAuthsMsg>  {}

// 권한 관리 - 맴버 목록
export type GetMembersAuthsMsg = keyof typeof getMembersAuthsMsg;

export interface MemberInvitedItem {
  clientAccountMemberRelUid: string
  clientId: string
  memberUid: string
  mediaUids: string
  authLevel: string
  isJoin: BooleanYN
  inviteDatetime: number
  joinDatetime: number
  memberEmail: string
  memberName: string
  memberPhone: string
  regDatetime: number
  modDatetime: number
}

export interface GetMembersAuthsRes extends ResponseDefault<GetMembersAuthsMsg> {
  results: MemberInvitedItem[]
}

// 내 광고주 목록 (마이페이지 - 내 관리내역, 초대 받은 내역)
export type GetMembersClientsMsg = keyof typeof getMembersClientsMsg;

export interface GetMembersClientsParam extends PaginationDefault {
  join: BooleanYN
  search?: string
  cursor?: number
  limit?: number
}

export interface MemberClientDomainItem {
  isMain: number
  domain: string
}

export interface MemberClientItem {
  clientAccountMemberRelUid: string
  clientAccountUid: string
  inviteDatetime: number
  authLevel: ConstAuthKeys
  clientName: string
  clientId: string
  mainCategory: ConstClientCategoryKeys | string
  subCategory: ConstClientCategorySubTotalKeys | string
  targetGender: ConstGenderKeys | string
  targetAge: string
  keyword: string
  domains: MembmerClientDomainItem[]
  ftpUrl: string
  ftpId: string
  ftpPassword: string
  ftpDomain: string
  accountStatus: ConstClientAccountStatusKeys
  serviceType: ConstClientAccountServiceKeys
  regDatetime: number
  modDatetime: number
}

export interface GetMembersClientsResult {
  totalCount: number
  clients: MemberClientItem[]
}

export interface GetMembersClientsRes extends ResponseDefault<GetMembersClientsMsg> {
  results: GetMembersClientsResult
}

// 광고주 ID 선택/변경
export type PatchMembersClientsMsg = keyof typeof patchMembersClientsMsg;

export interface PatchMembersClientsRes extends ResponseDefault<PatchMembersClientsMsg> {}

// 내정보 > 정보수신 동의 내역
export type GetMembersAdMsg = keyof typeof getMembersAdMsg;

export interface GetMembersAdResult {
  isAgreeAd: BooleanYN
  agreeAdDatetime: number
}
export interface GetMembersAdRes extends ResponseDefault<GetMembersAdMsg> {
  results: GetMembersAdResult
}

// 내정보 > 정보수신 동의 변경
export type PatchMembersAdMsg = keyof typeof patchMembersAdMsg;

export interface PatchMembersAdParam {
  memberEmail: string
  isAgreeAd: BooleanYN
}

export interface PatchMembersAdRes extends ResponseDefault<PatchMembersAdMsg> {}

// 내정보 수정 > 비밀번호 변경
export type PatchMembersPwMsg = keyof typeof patchMembersPwMsg;

export interface PatchMembersPwParam {
  password: string
  newPassword: string
}

export interface PatchMembersPwRes extends ResponseDefault<PatchMembersPwMsg> {}

// 비밀번호 찾기 > 인증 이메일 발송
export type PostMembersVerifyEmailMsg = keyof typeof postMembersVerifyEmailMsg;

export interface PostMembersVerifyEmailParam {
  memberVerifyEmailUid: string
  memberEmail: string
}

export interface PostMembersVerifyEmailRes extends ResponseDefault<PostMembersVerifyEmailMsg> {}


// 비밀번호 찾기 > 이메일 인증
export type PatchMembersVerifyEmailMsg = keyof typeof patchMembersVerifyEmailMsg;

export interface PatchMembersVerifyEmailResult {
  memberUid: string
  memberEmail: string
}

export interface PatchMembersVerifyEmailRes extends ResponseDefault<PatchMembersVerifyEmailMsg> {
  results: PatchMembersVerifyEmailResult
}

// 비밀번호 찾기 > 비밀번호 변경
export type PatchMembersPwByEmailMsg = keyof typeof patchMembersPwByEmailMsg;

export interface PatchMembersPwByEmailParam {
  memberVerifyEmailUid: string
  memberUid: string
  memberEmail: string
  password: string
}

export interface PatchMembersPwByEmailRes extends ResponseDefault<PatchMembersPwByEmailMsg> {}

// 회원 가입 안내 메일 발송
export type PostMemberJoinEmailMsg = keyof typeof postMemberJoinEmailMsg;

export interface PostMemberJoinEmailParam {
  toEmail: string
}

export interface PostMemberJoinEmailRes extends ResponseDefault<PostMemberJoinEmailMsg> {}

// 서비스 신청
export type PostClientsAccountsMsg = keyof typeof postClientsAccountsMsg;

export interface PostClientsAccountsParam {
  clientAccountUid: string
  clientAccountMemberRelUid: string
  clientName: string
  clientId: string
  mainCategory: ConstClientCategoryKeys | string
  subCategory: ConstClientCategorySubTotalKeys | string
  targetGender: ConstGenderKeys
  targetAge: string
  keyword: string
  domain: string
}

export interface PostClientsAccountsRes extends ResponseDefault<PostClientsAccountsMsg> {}


// 서비스 정보 수정
export type PutClientsAccountsMsg = keyof typeof putClientsAccountsMsg;

export interface PutClientsAccountsParam {
  mainCategory: ConstClientCategoryKeys
  subCategory: ConstClientCategorySubTotalKeys
  targetGender: ConstGenderKeys
  targetAge: string
  keyword: string
  domain: string
}

export interface PutClientsAccountsRes extends ResponseDefault<PutClientsAccountsMsg> {}

// 서비스 신청 승인
export type PatchClientsAccountsMsg = keyof typeof patchClientsAccountsMsg;

export interface PatchClientsAccountsParam {
  accountStatus: ConstClientAccountStatusKeys
}

export interface PatchClientsAccountsRes extends ResponseDefault<PatchClientsAccountsMsg> {}

// 광고주 ID 중복 확인
export type GetClientsAccountsExistByIdMsg = keyof typeof getClientsAccountsExistByIdMsg;

export interface GetClientsAccountsExistByIdResult {
  isExist: BooleanYN
}

export interface GetClientsAccountsExistByIdRes extends ResponseDefault<GetClientsAccountsExistByIdMsg> {
  results: GetClientsAccountsExistByIdResult
}

// 광고주 이름 중복 확인
export type GetClientsAccountsExistByNameMsg = keyof typeof getClientsAccountsExistByNameMsg;

export interface GetClientsAccountsExistByNameResult {
  isExist: BooleanYN
}

export interface GetClientsAccountsExistByNameRes extends ResponseDefault<GetClientsAccountsExistByNameMsg> {
  results: GetClientsAccountsExistByNameResult
}
// 기본 페이지 조회
export type GetClientsDefaultPageMsg = keyof typeof getClientsDefaultPageMsg;

export interface GetClientsDefaultPageResult {
  pageUid: string
  pageName: string
  pageCode: string
}

export interface GetClientsDefaultPageRes extends ResponseDefault<GetClientsDefaultPageMsg> {
  results: GetClientsDefaultPageResult
}

// 기본 페이지 설정 & 삭제
export type PatchClientsDefaultPageMsg = keyof typeof patchClientsDefaultPageMsg;

export interface PatchClientsDefaultPageParam {
  pageUid?: string
}

export interface PatchClientsDefaultPageRes extends ResponseDefault<PatchClientsDefaultPageMsg> {}

// helper interface
export interface MemberAccountApi extends API {
  /**
   * 회원 가입
   * @param param
   * @returns
   */
  postMembers: (param: PostMembersParam) => Promise<PostMembersRes>
  /**
   * 로그인
   * @param param
   * @returns
   */
  postMembersLogin: (param: PostMembersLoginParam) => Promise<PostMembersLoginRes>
  /**
   * 이미 가입된 이메일(계정) 확인
   * @param data
   * @returns
   */
  getMembersExistsByEmail: (param: GetMembersExistByEmailParam) => Promise<GetMembersExistByEmailRes>
  /**
   * 맴버 초대
   * @param data
   * @returns
   */
  postMembersAuths: (param: PostMembersAuthsParam) => Promise<PostMembersAuthsRes>
  /**
   * 맴버 초대 수락
   * @param param clientAccountMemberRelUid
   * @returns
   */
  patchMembersAuths: (path: string) => Promise<PatchMembersAuthsRes>
  /**
   * 맴초 초대 거철/취소/해제
   * @param path clientAccountMemberRelUid
   * @returns
   */
  deleteMembersAuths: (path: string) => Promise<DeleteMembersAuthsRes>
  /**
   * 권한 수정
   * @param path clientAccountMemberRelUid
   * @returns
   */
  putMembersAuths: (path: string, param: PutMembersAuthsReq) => Promise<PutMembersAuthsRes>
  /**
   * 권한 관리 - 맴버 목록
   * @param path clientId
   * @returns
   */
  getMembersAuths: (path: string) => Promise<GetMembersAuthsRes>
  /**
   * 내 광고주 목록
   * @param data
   * @returns
   */
  getMembersClients: (param: GetMembersClientsParam) => Promise<GetMembersClientsRes>
  /**
   * 광고주 ID 선택, 변경
   * @param path clientId
   * @returns
   */
  patchMembersClients: (path: string) => Promise<PatchMembersClientsRes>
  /**
   * 정보수신 동의 내역
   * @returns
   */
  getMembersAd: () => Promise<GetMembersAdRes>
  /**
   * 정보수신 동의 변경
   * @param param memberEmail, isAgreeAd
   * @returns
   */
  patchMembersAd: (param: PatchMembersAdParam) => Promise<PatchMembersAdRes>
  /**
   * 내정보 수정 > 비밀번호 변경
   * @param param password, newPassword
   * @returns
   */
  patchMembersPw: (param: PatchMembersPwParam) => Promise<PatchMembersPwRes>
  /**
   * 비밀번호 찾기 > 인증 이메일 발송
   * @param param
   * @returns
   */
  postMembersVerifyEmail: (param: PostMembersVerifyEmailParam) => Promise<PostMembersVerifyEmailRes>
  /**
   * 비밀번호 찾기 > 이메일 인증
   * @param memberVerifyEmailUid memberVerifyEmailUid
   * @param param
   * @returns
   */
  patchMembersVerifyEmail: (memberVerifyEmailUid: string) => Promise<PatchMembersVerifyEmailRes>
  /**
   * 비밀번호 찾기 > 비밀번호 변경
   * @param param
   * @returns
   */
  patchMembersPwByEmail: (param: PatchMembersPwByEmailParam) => Promise<PatchMembersPwByEmailRes>
  /**
   * 설정 > 권한관리 > 멤버초대 > 회원 가입 안내 메일 발송
   * @param param
   * @returns
   */
  postMemberJoinEmail: (param: PostMemberJoinEmailParam) => Promise<PostMemberJoinEmailRes>

  /**
   * 서비스 신청
   * @returns
   */
  postClientsAccounts: (param: PostClientsAccountsParam) => Promise<PostClientsAccountsRes>

  /**
   * 서비스 정보 수정
   * @param clientId
   * @returns
   */
  putClientsAccounts: (clientId: string, param: PutClientsAccountsParam) => Promise<PutClientsAccountsRes>

  /**
   * 서비스 정보 승인
   * @param clientId
   * @returns
   */
  patchClientsAccounts: (clientId: string, param: PatchClientsAccountsParam) => Promise<PatchClientsAccountsRes>

  /**
   * 광고주 ID 중복 확인
   * @param id
   * @returns
   */
  getClientsAccountsExistById: (id: string) => Promise<GetClientsAccountsExistByIdRes>

  /**
   * 광고주 이름 중복 확인
   * @param name
   * @returns
   */
  getClientsAccountsExistByName: (name: string) => Promise<GetClientsAccountsExistByNameRes>

  /**
   * 기본 페이지 조회
   * @param GetClientsDefaultPageParam
   * @returns
   */
  getClientsDefaultPage: (param: GetClientsDefaultPageParam) => Promise<GetClientsDefaultPageRes>

  /**
   * 기본 페이지 설정 & 삭제
   * @param PatchClientsDefaultPageRes
   * @returns
   */
  patchClientsDefaultPage: (param: PatchClientsDefaultPageParam) => Promise<PatchClientsDefaultPageRes>
}