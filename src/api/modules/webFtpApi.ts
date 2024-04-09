import type {
  DeleteFtpParam,
  DeleteFtpRes,
  GetFtpCheckRes,
  GetFtpPathParam,
  GetFtpReloadRes,
  GetFtpRes,
  PostFtpNameParam,
  PostFtpNameRes,
  PostFtpUploadRes,
  PutFtpNameParam,
  PutFtpNameRes,
} from '@/types/api/webFtpApi';
import type { GetS3uploadUrlParam, GetS3uploadUrlRes } from '@/types/api/webFtpApi.d';

import { api } from '../';

class webFtpApi extends api {
  /**
   * ftp 내부 정보 가져오기
   * @param param
   * @returns
   */
  public getFtp = (param: GetFtpPathParam): Promise<GetFtpRes> => this.httpGet('/ftp', param);
  /**
   * 폴더, 파일명 중복 검사
   * @param param
   * @returns
   */
  public getFtpCheck = (param: GetFtpPathParam): Promise<GetFtpCheckRes> => this.httpGet('/ftp/check', param);
  /**
   * 폴더, 파일명 수정
   * @param param
   * @returns
   */
  public putFtpName = (param: PutFtpNameParam): Promise<PutFtpNameRes> => this.httpPut('/ftp', param);
  /**
   * 업로드
   * @param param
   * @returns
   */
  public postFtpUpload = (param: FormData): Promise<PostFtpUploadRes> => this.httpPost('/ftp/upload', param, { 'Content-Type': 'multipart/form-data' });
  /**
   * 폴더 생성
   * @param param
   * @returns
   */
  public postFtpName = (param: PostFtpNameParam): Promise<PostFtpNameRes> => this.httpPost('/ftp', param);
  /**
   * ftp 정보 갱신(새로고침)
   * @param param
   * @returns
   */
  public getFtpReload = (param: GetFtpPathParam): Promise<GetFtpReloadRes> => this.httpGet('/ftp/reload', param);
  /**
   * 파일, 폴더 삭제
   * @param param
   * @returns
   */
  public deleteFtp = (param: DeleteFtpParam): Promise<DeleteFtpRes> => this.httpDelete('/ftp', param);
  /**
   * 업로드를 위한 URL 요청
   * @param param
   * @returns
   */
   public getS3uploadUrl = (param: GetS3uploadUrlParam): Promise<GetS3uploadUrlRes> => this.httpGet('/ftp/upload', param);
}

export const useWebFtpApi = () => new webFtpApi();