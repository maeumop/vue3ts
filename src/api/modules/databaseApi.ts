import type {
  GetDbsParam,
  GetDbsRes,
  GetDbsInputFieldsParam,
  GetDbsInputFieldsRes,
  PostDbsParam,
  PostDbsRes,
  PutDbsParam,
  PutDbsRes,
  DeleteDbsParam,
  DeleteDbsRes,
  GetDbsDownloadParam,
  GetDbsDownloadRes,
  PostDbsDownloadParam,
  PostDbsDownloadRes,
  PatchDbsDownloadParam,
  PatchDbsDownloadRes,
  PostBinsPwCheckRes,
  PostBinsPwCheckParam,
  DeleteBinsParam,
  DeleteBinsRes,
  GetBinsDeleteHistoryRes,
  GetBinsParam,
  GetBinsRes,
  PatchBinsRecoveryRes,
  GetFilterRes,
  PostFilterParam,
  PostFilterRes,
  PutFilterRes,
  PutFilterParam,
  GetApisCountRes,
  GetApisRes,
  PatchApisParam,
  PatchApisRes,
  GetApisSendParam,
  GetApisSendRes,
  PostApisSendParam,
  PostApisSendRes,
  DeleteApisRes,
  GetDbsApisSendRes,
  GetApisParam,
  PostApisParam,
  PostApisRes,
  PutApisParam,
  PutApisRes,
  GetApisCountParam,
  GetDbsExistByPhoneRes,
  GetDbsInputFieldsConfigType,
  GetDbsInputFieldsConfigRes,
} from '@/types/api/databaseApi';
import type { PaginationDefault } from '@/types/api/';
import { api } from '../';

class databaseApi extends api {
  public getDbs = (param: GetDbsParam): Promise<GetDbsRes> => this.httpGet('/dbs', param);
  public getDbsInputFields = (param: GetDbsInputFieldsParam): Promise<GetDbsInputFieldsRes> => this.httpGet('/dbs/inputfields', param);

  public postDbs = (param: PostDbsParam): Promise<PostDbsRes> => this.httpPost('/dbs', param);
  public putDbs = (dbUid: string, param: PutDbsParam): Promise<PutDbsRes> => this.httpPut(`/dbs/${dbUid}`, param);
  public deleteDbs = (param: DeleteDbsParam): Promise<DeleteDbsRes> => this.httpDelete('/dbs', param);

  public getDbsDownload = (param: GetDbsDownloadParam): Promise<GetDbsDownloadRes> => this.httpGet('/dbs/downloads', param);
  public postDbsDownload = (param: PostDbsDownloadParam): Promise<PostDbsDownloadRes> => this.httpPost('/dbs/downloads', param);
  public patchDbsDownload = (dbDownloadUid: string, param: PatchDbsDownloadParam): Promise<PatchDbsDownloadRes> => this.httpPatch(`/dbs/downloads/${dbDownloadUid}`, param);

  /**
   * 휴지통 목록/검색
   * @param param
   * @returns
   */
  public getBins = (param?: GetBinsParam): Promise<GetBinsRes> => this.httpGet('/dbs/bins', param);
  /**
   * 휴지통 삭제 비밀번호 확인
   * @param param
   * @returns
   */
  public postBinsPwCheck = (param: PostBinsPwCheckParam): Promise<PostBinsPwCheckRes> => this.httpPost('/dbs/bins', param);
  /**
   * 휴지통 영구삭제
   * @param param
   * @returns
   */
  public deleteBins = (param: DeleteBinsParam): Promise<DeleteBinsRes> => this.httpDelete('/dbs/bins', param);
  /**
   * 휴지통 복구
   * @param param
   * @returns
   */
  public patchBinsRecovery = (param: string[]): Promise<PatchBinsRecoveryRes> => this.httpPatch('/dbs/bins/recovery', param);
  /**
   * 영구 삭제 이력
   * @param param
   * @returns
   */
  public getBinsDeleteHistory = (param: PaginationDefault): Promise<GetBinsDeleteHistoryRes> => this.httpGet('/dbs/bins/delete/history', param);

  /**
   * DB 필터 세부 내역
   * @param path clientId
   * @returns
   */
  public getFilter = (path: string): Promise<GetFilterRes> => this.httpGet(`/dbs/filters/${path}`);
  /**
   * DB 필터 저장
   * @param param
   * @returns
   */
  public postFilter = (param: PostFilterParam): Promise<PostFilterRes> => this.httpPost('/dbs/filters', param);
  /**
   * DB 필터 수정
   * @param path clientId
   * @param param
   * @returns
   */
  public putFilter = (path: string, param: PutFilterParam): Promise<PutFilterRes> => this.httpPut(`/dbs/filters/${path}`, param);

  /**
   * API 전송 설정 저장
   * @param param
   * @returns
   */
  public postApis = (param: PostApisParam): Promise<PostApisRes> => this.httpPost('/dbs/apis', param);
  /**
   * API 전송 설정 수정
   * @param param
   * @returns
   */
  public putApis = (path: string, param: PutApisParam): Promise<PutApisRes> => this.httpPut(`/dbs/apis/${path}`, param);
  /**
   * API 목록
   * @param param GetApisParam
   * @returns
   */
  public getApis = (param: GetApisParam): Promise<GetApisRes>  => this.httpGet('/dbs/apis', param);
  /**
   * API 중복 체크
   * @param GetApisCountParam
   * @returns
   */
  public getApisCount = (param: GetApisCountParam): Promise<GetApisCountRes> => this.httpGet('/dbs/apis/count', param);
  /**
   * API ON/OFF 처리
   * @path string
   * @param PatchApisParam
   * @returns
   */
  public patchApis = (path: string, param: PatchApisParam): Promise<PatchApisRes> => this.httpPatch(`/dbs/apis/${path}`, param);

  /**
   * API 전송 목록(연동 내역 체크)
   * @param param GetApisCountParam
   * @returns
   */
  public getApisSend = (dbs: GetApisSendParam): Promise<GetApisSendRes> => this.httpGet('/dbs/apis/send/', dbs);
  /**
   * API 전송
   * @param param PostApisSendParam
   * @returns
   */
  public postApisSend = (param: PostApisSendParam): Promise<PostApisSendRes> => this.httpPost('/dbs/apis/send/', param);
  /**
   * API 삭제
   * @param apiUid string
   * @returns
   */
  public deleteApis = (apiUid: string): Promise<DeleteApisRes> => this.httpDelete(`/dbs/apis/${apiUid}`);
  /**
   * API 전송 이력
   * @param dbUid string
   * @returns
   */
  public getDbsApisSend = (dbUid: string): Promise<GetDbsApisSendRes> => this.httpGet(`/dbs/${dbUid}/apis/send`);
  /**
   * DB 연락처 중복 확인
   * @param phone string
   * @returns
   */
  public getDbsExistByPhone = (phone: string): Promise<GetDbsExistByPhoneRes> => this.httpGet(`/dbs/phone/${phone}/exist`);

  /**
   * DB 입력 항목 구분별(type) 호출
   * @param type GetDbsInputFieldsParam
   * @returns
   */
  public getDbsInputFieldsConfig = (type: GetDbsInputFieldsConfigType): Promise<GetDbsInputFieldsConfigRes> => this.httpGet(`/dbs/inputFieldsConfig?type=${type}`);
}

export const useDatabaseApi = () => new databaseApi();
