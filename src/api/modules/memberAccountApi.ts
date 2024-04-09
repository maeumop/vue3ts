import type {
  DeleteMembersAuthsRes,
  PutMembersAuthsReq,
  GetMembersAuthsRes,
  GetMembersClientsParam,
  GetMembersClientsRes,
  GetMembersExistByEmailParam,
  GetMembersExistByEmailRes,
  PatchMembersAuthsRes,
  PostMembersParam,
  PostMembersAuthsParam,
  PostMembersAuthsRes,
  PostMembersLoginParam,
  PostMembersLoginRes,
  PostMembersRes,
  GetMembersAdRes,
  PatchMembersAdParam,
  PatchMembersAdRes,
  PatchMembersPwParam,
  PatchMembersPwRes,
  PatchMembersPwByEmailParam,
  PatchMembersPwByEmailRes,
  PatchMembersVerifyEmailRes,
  PostMemberJoinEmailParam,
  PostMemberJoinEmailRes,
  PostMembersVerifyEmailParam,
  PostMembersVerifyEmailRes,
  PostClientsAccountsParam,
  PostClientsAccountsRes,
  PutClientsAccountsParam,
  PutClientsAccountsRes,
  PatchClientsAccountsParam,
  PatchClientsAccountsRes,
  GetClientsAccountsExistByIdRes,
  GetClientsAccountsExistByNameRes,
  PatchMembersClientsRes,
  GetClientsDefaultPageRes,
  PatchClientsDefaultPageParam,
  PatchClientsDefaultPageRes
} from '@/types/api/memberAccountApi';
import { api } from '../';

class memberAccountApi extends api {
  /**
   * 회원 가입
   * @param param
   * @returns
   */
  public postMembers = (param: PostMembersParam): Promise<PostMembersRes> => this.httpPost('/members', param);
  /**
   * 로그인
   * @param param
   * @returns
   */
  public postMembersLogin = (param: PostMembersLoginParam): Promise<PostMembersLoginRes> => this.httpPost('/members/login', param);
  /**
   * 이미 가입된 이메일(계정) 확인
   * @param data
   * @returns
   */
  public getMembersExistsByEmail = (param: GetMembersExistByEmailParam): Promise<GetMembersExistByEmailRes> => this.httpGet('/members/exist', param);
  /**
   * 맴버 초대
   * @param data
   * @returns
   */
  public postMembersAuths = (param: PostMembersAuthsParam): Promise<PostMembersAuthsRes> => this.httpPost('/members/auths', param);
  /**
   * 맴버 초대 수락
   * @param param clientAccountMemberRelUid
   * @returns
   */
  public patchMembersAuths = (path: string): Promise<PatchMembersAuthsRes> => this.httpPatch(`/members/auths/${path}`);
  /**
   * 맴초 초대 거철/취소/해제
   * @param path clientAccountMemberRelUid
   * @returns
   */
  public deleteMembersAuths = (path: string): Promise<DeleteMembersAuthsRes> => this.httpDelete(`/members/auths/${path}`);
  /**
   * 권한 수정
   * @param path clientAccountMemberRelUid
   * @returns
   */
  public putMembersAuths = (path: string, param: PutMembersAuthsReq) => this.httpPut(`/members/auths/${path}`, param);
  /**
   * 권한 관리 - 맴버 목록
   * @returns
   */
  public getMembersAuths = (): Promise<GetMembersAuthsRes> => this.httpGet(`/members/auths`);
  /**
   * 내 광고주 목록
   * @param data
   * @returns
   */
  public getMembersClients = (param: GetMembersClientsParam): Promise<GetMembersClientsRes> => this.httpGet('/members/clients', param);
  /**
   * 광고주 ID 선택, 변경
   * @param path clientId
   * @returns
   */
  public patchMembersClients = (path: string): Promise<PatchMembersClientsRes> => this.httpPatch(`/members/clients/${path}`);

  /**
   * 정보수신 동의 내역
   * @returns
   */
  public getMembersAd = (): Promise<GetMembersAdRes> => this.httpGet('/members/ad');
  /**
   * 정보수신 동의 변경
   * @param param memberEmail, isAgreeAd
   * @returns
   */
  public patchMembersAd = (param: PatchMembersAdParam): Promise<PatchMembersAdRes> => this.httpPatch(`/members/ad`, param);
  /**
   * 내정보 수정 > 비밀번호 변경
   * @returns
   */
  public patchMembersPw = (param: PatchMembersPwParam): Promise<PatchMembersPwRes> => this.httpPatch(`/members/pw`, param);

  /**
   * 비밀번호 찾기 > 인증 이메일 발송
   * @param param
   * @returns
   */
  public postMembersVerifyEmail = (param: PostMembersVerifyEmailParam): Promise<PostMembersVerifyEmailRes> => this.httpPost('/members/email/verify', param);
  /**
   * 비밀번호 찾기 > 이메일 인증
   * @param memberVerifyEmailUid memberVerifyEmailUid
   * @param param
   * @returns
   */
  public patchMembersVerifyEmail = (memberVerifyEmailUid: string): Promise<PatchMembersVerifyEmailRes> => this.httpPatch(`/members/email/verify/${memberVerifyEmailUid}`);

  /**
   * 비밀번호 찾기 > 비밀번호 변경
   * @param param
   * @returns
   */
  public patchMembersPwByEmail = (param: PatchMembersPwByEmailParam): Promise<PatchMembersPwByEmailRes> => this.httpPatch('/members/email/pw', param);
  /**
   * 설정 > 권한관리 > 멤버초대 > 회원 가입 안내 메일 발송
   * @param param
   * @returns
   */
  public postMemberJoinEmail = (param: PostMemberJoinEmailParam): Promise<PostMemberJoinEmailRes> => this.httpPost('/members/email/join', param);
  /**
   * 서비스 신청
   * @returns
   */
  public postClientsAccounts = (param: PostClientsAccountsParam): Promise<PostClientsAccountsRes> => this.httpPost('/accounts', param);
  /**
   * 서비스 정보 수정
   * @param clientId
   * @returns
   */
  public putClientsAccounts = (clientId: string, param: PutClientsAccountsParam): Promise<PutClientsAccountsRes> => this.httpPut(`/accounts/${clientId}`, param);
  /**
   * 서비스 정보 승인
   * @param clientId
   * @returns
   */
  public patchClientsAccounts = (clientId: string, param: PatchClientsAccountsParam): Promise<PatchClientsAccountsRes> => this.httpPatch(`/accounts/${clientId}`, param);
  /**
   * 광고주 ID 중복 확인
   * @param id
   * @returns
   */
  public getClientsAccountsExistById = (id: string): Promise<GetClientsAccountsExistByIdRes> => this.httpGet(`/accounts/id/${id}/exist`);
  /**
   * 광고주 이름 중복 확인
   * @param name
   * @returns
   */
  public getClientsAccountsExistByName = (name: string): Promise<GetClientsAccountsExistByNameRes> => this.httpGet(`/accounts/name/${name}/exist`);
  /**
   * 기본 페이지 조회
   * @returns
   */
  public getClientsDefaultPage = (): Promise<GetClientsDefaultPageRes> => this.httpGet(`/accounts/default-page`);
  /**
   * 기본 페이지 설정 & 삭제
   * @param name
   * @returns
   */
  public patchClientsDefaultPage = (param: PatchClientsDefaultPageParam): Promise<PatchClientsDefaultPageRes> => this.httpPatch(`/accounts/default-page`, param);
}

export const useMemberAccountApi = () => new memberAccountApi();