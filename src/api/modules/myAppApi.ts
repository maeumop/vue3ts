import type {
  GetAligoApiRes,
  PostAligoApiParam,
  PostAligoApiRes,
  PostAligoCodeParam,
  PostAligoCodeRes,
  PostAligoCodeCheckParam,
  PostAligoCodeCheckRes,
  GetDomainsRes,
  PatchDomainParam,
  PatchDomainRes,
  GetDomainsSearchRes,
  PostDomainsParam,
  PostDomainsRes,
  GetDomainsSearchParam,
  GetTemplatesParam,
  GetTemplatesRes,
  PostTemplatesParam,
  PostTemplatesRes,
  PutTemplatesParam,
  PutTemplatesRes,
  PostCopyTemplatesParam,
  PostCopyTemplatesRes,
  DeleteTemplatesRes,
} from '@/types/api/myAppApi';
import { api } from '../';

class myAppApi extends api {
  /**
   * 알리고 설정 정보
   * @param path clientId
   * @returns
   */
  public getAligoApi = (path: string): Promise<GetAligoApiRes> => this.httpGet(`/myapps/aligo/${path}`);
  /**
   * 알리고 설정 정보 저장
   * @param param
   * @returns
   */
  public postAligoApi = (param: PostAligoApiParam): Promise<PostAligoApiRes> => this.httpPost('/myapps/aligo', param);
  /**
   * 알리고 인증 번호 전송
   * @param param
   * @returns
   */
  public postAligoCode = (param: PostAligoCodeParam): Promise<PostAligoCodeRes> => this.httpPost('/myapps/aligo/code', param);
  /**
   * 알리고 인증 번호 확인
   * @param param
   * @returns
   */
  public postAligoCodeCheck = (param: PostAligoCodeCheckParam): Promise<PostAligoCodeCheckRes> => this.httpPost('/myapps/aligo/check', param);

  /**
   * 도메인 목록
   * @param path clientId
   * @returns
   */
  public getDomains = (path: string, isConnect?: number): Promise<GetDomainsRes> => this.httpGet(`/myapps/domains/${path}?isConnect=${isConnect ?? ''}`);
  /**
   * 대표 도메인 설정
   * @param path clientId
   * @param param
   * @returns
   */
  public patchDomains = (path: string, param: PatchDomainParam): Promise<PatchDomainRes> => this.httpPatch(`/myapps/domains/${path}`, param);
  /**
   * 도메인 검색(후이즈 연동)
   * @param path domain
   * @returns
   */
  public getDomainsSearch = (param: GetDomainsSearchParam): Promise<GetDomainsSearchRes> => this.httpGet('/myapps/domains/search', param);
  /**
   * 도메인 연결 신청
   * @param param PostDomainsParam
   * @returns
   */
  public postDomains = (param: PostDomainsParam): Promise<PostDomainsRes> => this.httpPost('myapps/domains', param);

  /**
   * 템플릿 목록/검색
   * @param param
   * @returns
   */
  public getTemplates = (param: GetTemplatesParam): Promise<GetTemplatesRes> => this.httpGet('/myapps/templates', param);
  /**
   * 템플릿 저장
   * @param param
   * @returns
   */
  public postTemplates = (param: PostTemplatesParam): Promise<PostTemplatesRes> => this.httpPost('/myapps/templates', param);
  /**
   * 템플릿 수정
   * @param path templateUid
   * @param param
   * @returns
   */
  public putTemplates = (path: string, param: PutTemplatesParam): Promise<PutTemplatesRes> => this.httpPut(`/myapps/templates/${path}`, param);
  /**
   * 템플릿 복사
   * @param path templateUid
   * @param param
   * @returns
   */
  public postCopyTemplates = (path: string, param: PostCopyTemplatesParam): Promise<PostCopyTemplatesRes> => this.httpPost(`/myapps/templates/copy/${path}`, param);
  /**
   * 템플릿 삭제
   * @param path templateUid
   * @returns
   */
  public deleteTemplates = (path: string): Promise<DeleteTemplatesRes> => this.httpDelete(`/myapps/templates/${path}`);
}

export const useMyAppApi = () => new myAppApi();