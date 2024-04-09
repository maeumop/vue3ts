import type {
  DeleteCodesRes,
  GetCodesCheckParam,
  GetCodesCheckRes,
  GetCodesCountParam,
  GetCodesCountRes,
  GetCodesDbsCountRes,
  GetCodesParam,
  GetCodesRes,
  GetMediasParam,
  GetMediasRes,
  PostCodesParam,
  PostCodesRes,
  PutCodesRes,
  PutCodesParam,
  DeleteUtmValuesRes,
  GetUtmValuesCheckParam,
  GetUtmValuesCheckRes,
  GetUtmValuesCountParam,
  GetUtmValuesCountRes,
  GetUtmValuesParam,
  GetUtmValuesRes,
  GetUtmsRes,
  PostUtmValuesParam,
  PostUtmValuesRes,
  PutUtmValuesParam,
  PutUtmValuesRes,
} from '@/types/api/mediaUtmCodeApi';
import { api } from '../';

class mediaUtmCodeApi extends api {
  /**
   * 매체 목록
   * @param param
   * @returns
   */
  public getMedias = (param?: GetMediasParam): Promise<GetMediasRes> => this.httpGet('/medias', param);
  /**
   * 매체코드 목록/검색
   * @param path mediaUid
   * @param param
   * @returns
   */
  public getCodes = (path: string, param?: GetCodesParam): Promise<GetCodesRes> => this.httpGet(`/medias/${path}/codes`, param);
  /**
   * 매체코드 중복/유효성 검사
   * @param param
   * @returns
   */
  public getCodesCount = (param: GetCodesCountParam): Promise<GetCodesCountRes> => this.httpGet('/medias/codes/count', param);
  /**
   * 매체코드 유효성 검사
   * @param param
   * @returns
   */
  public getCodesCheck = (param: GetCodesCheckParam): Promise<GetCodesCheckRes> => this.httpGet('/medias/codes/check', param);
  /**
   * 매체코드 등록
   * @param param
   * @returns
   */
  public postCodes = (param: PostCodesParam): Promise<PostCodesRes> => this.httpPost('/medias/codes', param);
  /**
   * 매체코드 수정
   * @param param mediaCodeUid
   * @returns
   */
  public putCodes = (path: string, param: PutCodesParam): Promise<PutCodesRes> => this.httpPut(`/medias/codes/${path}`, param);
  /**
   * 매체코드 DB 연결 체크
   * @param path mediaCodeUid
   * @returns
   */
  public getCodesDbsCount = (path: string): Promise<GetCodesDbsCountRes> => this.httpGet(`/medias/codes/${path}/dbs/count`);
  /**
   * 매체 코드 삭제
   * @param path mediaCodeUid
   * @returns
   */
  public deleteCodes = (path: string): Promise<DeleteCodesRes> => this.httpDelete(`medias/codes/${path}`);

  /**
   * UTM 파라미터 목록
   * @returns
   */
  public getUtms = (): Promise<GetUtmsRes> => this.httpGet('/medias/utms');
  /**
   * UTM 파라미터 값 목록/검색
   * @param path utmParamUid
   * @param param
   * @returns
   */
  public getUtmValues = (path: string, param?: GetUtmValuesParam): Promise<GetUtmValuesRes> => this.httpGet(`/medias/utms/${path}/values`, param);
  /**
   * UTM 파라미터 값 중복/유효성 검사
   * @param param
   * @returns
   */
  public getUtmValuesCount = (param: GetUtmValuesCountParam): Promise<GetUtmValuesCountRes> => this.httpGet('/medias/utms/values/count', param);
  /**
   * UTM 파라미터 값 유효성 검사
   * @param param
   * @returns
   */
  public getUtmValuesCheck = (param: GetUtmValuesCheckParam): Promise<GetUtmValuesCheckRes> => this.httpGet('/medias/utms/values/check', param);
  /**
   * UTM 파라미터값 등록
   * @param param
   * @returns
   */
  public postUtmValues = (param: PostUtmValuesParam): Promise<PostUtmValuesRes> => this.httpPost('/medias/utms/values', param);
  /**
   * UTM 파라미터 값 수정
   * @param path utmParamValueUid
   * @param param
   * @returns
   */
  public putUtmValues = (path: string, param: PutUtmValuesParam): Promise<PutUtmValuesRes> => this.httpPut(`/medias/utms/values/${path}`, param);
  /**
   * UTM 파라미터 값 삭제
   * @param path utmParamValueUid
   * @returns
   */
  public deleteUtmValues = (path: string): Promise<DeleteUtmValuesRes> => this.httpDelete(`/medias/utms/values/${path}`);
}

export const useMediaUtmCodeApi = () => new mediaUtmCodeApi();