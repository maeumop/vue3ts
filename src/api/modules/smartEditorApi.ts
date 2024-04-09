import type {
  PostPagesParam,
  PostPagesRes,
  GetPagesParam,
  GetPagesRes,
  GetPageContentsRes,
  PutPagesRes,
  PostCopyPagesParam,
  PostCopyPagesRes,
  PutPageConfigsParam,
  PutPageConfigsRes,
  PostPageLinksParam,
  PostPageLinksRes,
  GetPageLinksParam,
  GetPageLinksRes,
  PostPageToBinsParam,
  PostPageToBinsRes,
  DeletePageLinksRes,
  GetIsPagesByRelatedCompParam,
  GetIsPagesByRelatedCompRes,
  GetIsUpdateAblePagesRes,
  GetUpdateAblePagesRes,
  PutPagesUpdateParam,
  PutPagesUpdateRes,
  PostPreviewSaveParam,
  GetLayoutsParam,
  GetLayoutsRes,
  DeleteLayoutsRes,
  PostCopyLayoutsParam,
  PostCopyLayoutsRes,
  PostLayoutsParam,
  PostLayoutsRes,
  PutLayoutsParam,
  PutLayoutsRes,
  GetScriptsParam,
  GetScriptsRes,
  DeleteScriptsRes,
  PostCopyScriptsParam,
  PostCopyScriptsRes,
  PostScriptsParam,
  PostScriptsRes,
  PutScriptsParam,
  PutScriptsRes,
  GetTermsParam,
  GetTermsRes,
  DeleteTermsRes,
  PostCopyTermsParam,
  PostCopyTermsRes,
  PostTermsParam,
  PostTermsRes,
  PutTermsParam,
  PutTermsRes,
  DeletePageBinsParam,
  DeletePageBinsRes,
  GetPageBinsParam,
  GetPageBinsRes,
  PostPageBinToPagesParam,
  PostPageBinToPagesRes,
  DeleteInputFormRes,
  GetInputConfigRes,
  GetInputFormParam,
  GetInputFormRes,
  PostCopyInputFormParam,
  PostCopyInputFormRes,
  PostInputConfigParam,
  PostInputConfigRes,
  PostInputFormParam,
  PostInputFormRes,
  PutInputConfigRes,
  PutInputFormParam,
  PutInputFormRes,
  PutInputConfigParam,
  DeleteRollingBannerGrpsRes,
  GetRollingBannerGrpsParam,
  GetRollingBannerGrpsRes,
  GetRollingBannersRes,
  PostRollingBannerGrpsParam,
  PostRollingBannerGrpsRes,
  PostCopyRollingBannerGrpsParam,
  PostCopyRollingBannerGrpsRes,
  PutRollingBannerGrpsParam,
  PutRollingBannerGrpsRes,
  PutRollingBannersParam,
  PutRollingBannersRes,
  DeleteRollingListGrpsRes,
  GetRollingListGrpsParam,
  GetRollingListGrpsRes,
  GetRollingListsRes,
  PostRollingListGrpsParam,
  PostRollingListGrpsRes,
  PostCopyRollingListGrpsParam,
  PostCopyRollingListGrpsRes,
  PutRollingListGrpsParam,
  PutRollingListGrpsRes,
  PutRollingListsParam,
  PutRollingListsRes,
  DeleteCommentGrpsRes,
  GetCommentGrpsParam,
  GetCommentGrpsRes,
  GetCommentsRes,
  PostCommentGrpsParam,
  PostCommentGrpsRes,
  PostCopyCommentGrpsParam,
  PostCopyCommentGrpsRes,
  PutCommentGrpsParam,
  PutCommentGrpsRes,
  PutCommentsParam,
  PutCommentsRes,
  DeleteImportsRes,
  GetImportsParam,
  GetImportsRes,
  PostImportsParam,
  PostImportsRes,
  PostCopyImportsParam,
  PostCopyImportsRes,
  PutImportsParam,
  PutImportsRes,
  PostPreviewSaveRes,
} from '@/types/api/smartEditorApi';
import { api } from '../';

class smartEditorApi extends api {
  /**
   * 페이지 등록
   * @param param
   * @returns
   */
  public postPages = (param: PostPagesParam): Promise<PostPagesRes> => this.httpPost('/smarts/pages', param);
  /**
   * 페이지 목록/검색
   * @param param
   * @returns
   */
  public getPages = (param?: GetPagesParam): Promise<GetPagesRes> => this.httpGet('/smarts/pages', param);
  /**
   * 페이지 상세 내역 (섹션 전체 포함)
   * @param path {pageUid}
   * @returns
   */
  public getPageContents = (path: string): Promise<GetPageContentsRes> => this.httpGet(`/smarts/pages/${path}`);
  /**
   * 페이지 수정
   * @param path {pageUid}
   * @returns
   */
  public putPages = (path: string, param: PostPagesParam): Promise<PutPagesRes> => this.httpPut(`/smarts/pages/${path}`, param);
  /**
   * 페이지 복사
   * @param path {pageUid}
   * @param param
   * @returns
   */
  public postCopyPages = (path: string, param: PostCopyPagesParam): Promise<PostCopyPagesRes> => this.httpPost(`/smarts/pages/copy/${path}`, param);
  /**
   * 페이지 기본 설정 변경
   * @param path {pageUid}
   * @param param
   * @returns
   */
  public putPageConfigs = (path: string, param: PutPageConfigsParam): Promise<PutPageConfigsRes> => this.httpPut(`/smarts/pages/config/${path}`, param);
  /**
   * 페이지 휴지통으로 이동 (삭제)
   * @param path {pageUid}
   * @param params
   * @returns
   */
  public postPageToBins = (param: PostPageToBinsParam): Promise<PostPageToBinsRes> => this.httpPost('/smarts/pages/bin', param);
  /**
   * 페이지 링크 생성
   * @param path {pageUid}
   * @param param
   * @returns
   */
  public postPageLinks = (path: string, param: PostPageLinksParam): Promise<PostPageLinksRes> => this.httpPost(`/smarts/pages/${path}/link`, param);
  /**
   * 페이지 링크 목록
   * @param path {pageUid}
   * @param param
   * @returns
   */
  public getPageLinks = (path: string, param: GetPageLinksParam): Promise<GetPageLinksRes> => this.httpGet(`/smarts/pages/${path}/link`, param);
  /**
   * 페이지 링크 삭제
   * @param path1 {pageUid}
   * @param path2 {pageLinkUid}
   * @returns
   */
  public deletePageLinks = (path1: string, path2: string): Promise<DeletePageLinksRes> => this.httpDelete(`/smarts/pages/${path1}/link/${path2}`);

  /**
   * 버전 업데이트 존재 여부 체크
   * @returns
   */
  public getIsUpdateAblePages = (): Promise<GetIsUpdateAblePagesRes>=> this.httpGet('/smarts/pages/isUpdateAbles');
  /**
   * 버전 업데이트 목록 가져오기
   * @returns
   */
  public getUpdateAblePages = (): Promise<GetUpdateAblePagesRes>=> this.httpGet('/smarts/pages/updateAbles');
  /**
   * 페이지 버전 업데이트
   * @param path1 {pageUid}
   * @param param
   * @returns
   */
  public putPagesUpdate = (pageUid: string, param: PutPagesUpdateParam): Promise<PutPagesUpdateRes>=> this.httpPut(`/smarts/pages/${pageUid}/update`, param);
  /**
   * 컴포넌트 참조 페이지 존재 여부 체크
   * @param param
   * @returns
   */
  public getIsPagesByRelatedComp = (param: GetIsPagesByRelatedCompParam): Promise<GetIsPagesByRelatedCompRes>=> this.httpGet('/smarts/pages/isRelatedComp', param);

  /**
   * 페이지 미리보기 데이터 임시 저장 처리
   * @param param
   * @returns
   */
  public postPreviewSave = (param: PostPreviewSaveParam): Promise<PostPreviewSaveRes> => this.httpPost('/smarts/previews/save', param);

  /**
   * 레이아웃 목록/검색
   * @param param
   * @returns
   */
  public getLayouts = (param?: GetLayoutsParam): Promise<GetLayoutsRes> => this.httpGet('/smarts/layouts', param);
  /**
   * 레이아웃 삭제
   * @param layoutUid
   * @returns
   */
  public deleteLayouts = (layoutUid: string): Promise<DeleteLayoutsRes> => this.httpDelete(`/smarts/layouts/${layoutUid}`);
  /**
   * 레이아웃 등록
   * @param param
   * @returns
   */
  public postLayouts = (param: PostLayoutsParam): Promise<PostLayoutsRes> => this.httpPost('/smarts/layouts', param);
  /**
   * 레이아웃 수정
   * @param layoutUid
   * @param param
   * @returns
   */
  public putLayouts = (layoutUid: string, param: PutLayoutsParam): Promise<PutLayoutsRes> => this.httpPut(`/smarts/layouts/${layoutUid}`, param);
  /**
   * 레이아웃 복사
   * @param layoutUid
   * @param param
   * @returns
   */
  public postCopyLayouts = (layoutUid: string, param: PostCopyLayoutsParam): Promise<PostCopyLayoutsRes>  => this.httpPost(`/smarts/layouts/copy/${layoutUid}`, param);

  /**
   * 스크립트 목록/검색
   * @param param
   * @returns
   */
  public getScripts = (param?: GetScriptsParam): Promise<GetScriptsRes> => this.httpGet('/smarts/scripts', param);
  /**
   * 스크립트 삭제
   * @param scriptUid
   * @returns
   */
  public deleteScripts = (scriptUid: string): Promise<DeleteScriptsRes> => this.httpDelete(`/smarts/scripts/${scriptUid}`);
  /**
   * 스크립트 등록
   * @param param
   * @returns
   */
  public postScripts = (param: PostScriptsParam): Promise<PostScriptsRes> => this.httpPost('/smarts/scripts', param);
  /**
   * 스크립트 수정
   * @param scriptUid
   * @param param
   * @returns
   */
  public putScripts = (scriptUid: string, param: PutScriptsParam): Promise<PutScriptsRes> => this.httpPut(`/smarts/scripts/${scriptUid}`, param);
  /**
   * 스크립트 복사
   * @param scriptUid
   * @param param
   * @returns
   */
  public postCopyScripts = (scriptUid: string, param: PostCopyScriptsParam): Promise<PostCopyScriptsRes>  => this.httpPost(`/smarts/scripts/copy/${scriptUid}`, param);

  /**
   * 약관 목록/검색
   * @param param
   * @returns
   */
  public getTerms = (param?: GetTermsParam): Promise<GetTermsRes> => this.httpGet('/smarts/terms', param);
  /**
   * 약관 삭제
   * @param termsPageUid
   * @returns
   */
  public deleteTerms = (termsPageUid: string): Promise<DeleteTermsRes> => this.httpDelete(`/smarts/terms/${termsPageUid}`);
  /**
   * 약관 등록
   * @param param
   * @returns
   */
  public postTerms = (param: PostTermsParam): Promise<PostTermsRes> => this.httpPost('/smarts/terms', param);
  /**
   * 약관 수정
   * @param termsPageUid
   * @param param
   * @returns
   */
  public putTerms = (termsPageUid: string, param: PutTermsParam): Promise<PutTermsRes> => this.httpPut(`/smarts/terms/${termsPageUid}`, param);
  /**
   * 약관 복사
   * @param termsPageUid
   * @param param
   * @returns
   */
  public postCopyTerms = (termsPageUid: string, param: PostCopyTermsParam): Promise<PostCopyTermsRes>  => this.httpPost(`/smarts/terms/copy/${termsPageUid}`, param);
  /**
   * 휴지통 목록/검색
   * @param param
   * @returns
   */
  public getPageBins = (param?: GetPageBinsParam): Promise<GetPageBinsRes> => this.httpGet('/smarts/pageBins', param);
  /**
   * 휴지통 영구삭제
   * @param param
   * @returns
   */
  public deletePageBins = (param: DeletePageBinsParam): Promise<DeletePageBinsRes> => this.httpDelete('/smarts/pageBins', param);
  /**
   * 휴지통 복구
   * @param param
   * @returns
   */
  public postBinToPages = (param: PostPageBinToPagesParam): Promise<PostPageBinToPagesRes> => this.httpPost('/smarts/pageBins/toPages', param);

  /**
   * 입력폼 목록/검색
   * @param param
   * @returns
   */
  public getInputForm = (param?: GetInputFormParam): Promise<GetInputFormRes> => this.httpGet('/smarts/inputforms', param);
  /**
   * 입력폼 삭제
   * @param path {compInputFormUid}
   * @returns
   */
  public deleteInputForm = (path: string): Promise<DeleteInputFormRes> => this.httpDelete(`/smarts/inputforms/${path}`);
  /**
   * 입력폼 등록
   * @param param
   * @returns
   */
  public postInputForm = (param: PostInputFormParam): Promise<PostInputFormRes> => this.httpPost('/smarts/inputforms', param);
  /**
   * 입력폼 수정
   * @param path {compInputFormUid}
   * @param param
   * @returns
   */
  public putInputForm = (path: string, param: PutInputFormParam): Promise<PutInputFormRes> => this.httpPut(`/smarts/inputforms/${path}`, param);
  /**
   * 입력폼 복사
   * @param path {compInputFormUid}
   * @param param
   * @returns
   */
  public postCopyInputForm = (path: string, param: PostCopyInputFormParam): Promise<PostCopyInputFormRes> => this.httpPost(`/smarts/inputforms/copy/${path}`, param);
  /**
   * 입력 항목 설정 등록
   * @param param
   * @returns
   */
  public postInputConfig = (param: PostInputConfigParam): Promise<PostInputConfigRes> => this.httpPost('/smarts/inputforms/configs', param);
  /**
   * 입력 항목 설정 수정
   * @param param
   * @returns
   */
  public puInputConfig = (path: string, param: PutInputConfigParam): Promise<PutInputConfigRes> => this.httpPut(`/smarts/inputforms/configs/${path}`, param);
  /**
   * 입력 항목 설정 전체 목록
   * @returns
   */
  public getInputConfig = (): Promise<GetInputConfigRes> => this.httpGet('/smarts/inputforms/configs');

  /**
   * 롤링 배너 목록/검색
   * @param param
   * @returns
   */
  public getRollingBannerGrps = (param: GetRollingBannerGrpsParam): Promise<GetRollingBannerGrpsRes> => this.httpGet('/smarts/rollingBanners', param);
  /**
   * 롤링 배너 삭제
   * @param compRollingBannerGrpUid
   * @returns
   */
  public deleteRollingBannerGrps = (compRollingBannerGrpUid: string): Promise<DeleteRollingBannerGrpsRes> => this.httpDelete(`/smarts/rollingBanners/${compRollingBannerGrpUid}`);
  /**
   * 롤링 배너 등록
   * @param param
   * @returns
   */
  public postRollingBannerGrps = (param: PostRollingBannerGrpsParam): Promise<PostRollingBannerGrpsRes> => this.httpPost('/smarts/rollingBanners', param);
  /**
   * 롤링 배너 수정
   * @param compRollingBannerGrpUid
   * @param param
   * @returns
   */
  public putRollingBannerGrps = (compRollingBannerGrpUid: string, param: PutRollingBannerGrpsParam): Promise<PutRollingBannerGrpsRes> => this.httpPut(`/smarts/rollingBanners/${compRollingBannerGrpUid}`, param);
  /**
   * 롤링 배너 복사
   * @param compRollingBannerGrpUid
   * @param param
   * @returns
   */
  public postCopyRollingBannerGrps = (compRollingBannerGrpUid: string, param: PostCopyRollingBannerGrpsParam): Promise<PostCopyRollingBannerGrpsRes> => this.httpPost(`/smarts/rollingBanners/copy/${compRollingBannerGrpUid}`, param);
  /**
   * 롤링 배너 관리 조회
   * @param compRollingBannerGrpUid
   * @returns
   */
  public getRollingBanners = (compRollingBannerGrpUid: string): Promise<GetRollingBannersRes> => this.httpGet(`/smarts/rollingBanners/${compRollingBannerGrpUid}/items`);
  /**
   * 롤링 배너 관리 수정
   * @param param
   * @returns
   */
  public putRollingBanners = (compRollingBannerGrpUid: string, param: PutRollingBannersParam): Promise<PutRollingBannersRes> => this.httpPut(`/smarts/rollingBanners/${compRollingBannerGrpUid}/items`, param);

  /**
   * 리스트 그룹 목록/검색
   * @param param
   * @returns
   */
  public getRollingListGrps = (param: GetRollingListGrpsParam): Promise<GetRollingListGrpsRes> => this.httpGet('/smarts/rollingLists', param);
  /**
   * 리스트 그룹 삭제
   * @param compRollingListGrpUid
   * @returns
   */
  public deleteRollingListGrps = (compRollingListGrpUid: string): Promise<DeleteRollingListGrpsRes> => this.httpDelete(`/smarts/rollingLists/${compRollingListGrpUid}`);
  /**
   * 리스트 그룹 등록
   * @param param
   * @returns
   */
  public postRollingListGrps = (param: PostRollingListGrpsParam): Promise<PostRollingListGrpsRes> => this.httpPost('/smarts/rollingLists', param);
  /**
   * 리스트 그룹 수정
   * @param compRollingListGrpUid
   * @param param
   * @returns
   */
  public putRollingListGrps = (compRollingListGrpUid: string, param: PutRollingListGrpsParam): Promise<PutRollingListGrpsRes> => this.httpPut(`/smarts/rollingLists/${compRollingListGrpUid}`, param);
  /**
   * 리스트 그룹 복사
   * @param compRollingListGrpUid
   * @param param
   * @returns
   */
  public postCopyRollingListGrps = (compRollingListGrpUid: string, param: PostCopyRollingListGrpsParam): Promise<PostCopyRollingListGrpsRes> => this.httpPost(`/smarts/rollingLists/copy/${compRollingListGrpUid}`, param);
  /**
   * 리스트 관리 조회
   * @param compRollingListGrpUid
   * @returns
   */
  public getRollingLists = (compRollingListGrpUid: string): Promise<GetRollingListsRes> => this.httpGet(`/smarts/rollingLists/${compRollingListGrpUid}/items`);
  /**
   * 리스트 관리 수정
   * @param param
   * @returns
   */
  public putRollingLists = (compRollingListGrpUid: string, param: PutRollingListsParam): Promise<PutRollingListsRes> => this.httpPut(`/smarts/rollingLists/${compRollingListGrpUid}/items`, param);

  /**
   * 댓글 그룹 목록/검색
   * @param param
   * @returns
   */
  public getCommentGrps = (param: GetCommentGrpsParam): Promise<GetCommentGrpsRes> => this.httpGet('/smarts/comments', param);
  /**
   * 댓글 그룹 삭제
   * @param compCommentGrpUid
   * @returns
   */
  public deleteCommentGrps = (compCommentGrpUid: string): Promise<DeleteCommentGrpsRes> => this.httpDelete(`/smarts/comments/${compCommentGrpUid}`);
  /**
   * 댓글 그룹 등록
   * @param param
   * @returns
   */
  public postCommentGrps = (param: PostCommentGrpsParam): Promise<PostCommentGrpsRes> => this.httpPost('/smarts/comments', param);
  /**
   * 댓글 그룹 수정
   * @param compCommentGrpUid
   * @param param
   * @returns
   */
  public putCommentGrps = (compCommentGrpUid: string, param: PutCommentGrpsParam): Promise<PutCommentGrpsRes> => this.httpPut(`/smarts/comments/${compCommentGrpUid}`, param);
  /**
   * 댓글 그룹 복사
   * @param compCommentGrpUid
   * @param param
   * @returns
   */
  public postCopyCommentGrps = (compCommentGrpUid: string, param: PostCopyCommentGrpsParam): Promise<PostCopyCommentGrpsRes> => this.httpPost(`/smarts/comments/copy/${compCommentGrpUid}`, param);
  /**
   * 댓글 관리 조회
   * @param compCommentGrpUid
   * @returns
   */
  public getComments = (compCommentGrpUid: string): Promise<GetCommentsRes> => this.httpGet(`/smarts/comments/${compCommentGrpUid}/items`);
  /**
   * 댓글 관리 수정
   * @param param
   * @returns
   */
  public putComments = (compCommentGrpUid: string, param: PutCommentsParam): Promise<PutCommentsRes> => this.httpPut(`/smarts/comments/${compCommentGrpUid}/items`, param);

  /**
   * 임포트 목록/검색
   * @param param
   * @returns
   */
  public getImports = (param: GetImportsParam): Promise<GetImportsRes> => this.httpGet('/smarts/imports', param);
  /**
   * 임포트 삭제
   * @param compImportUid
   * @returns
   */
  public deleteImports = (compImportUid: string): Promise<DeleteImportsRes> => this.httpDelete(`/smarts/imports/${compImportUid}`);
  /**
   * 임포트 등록
   * @param param
   * @returns
   */
  public postImports = (param: PostImportsParam): Promise<PostImportsRes> => this.httpPost('/smarts/imports', param);
  /**
   * 임포트 수정
   * @param compImportUid
   * @param param
   * @returns
   */
  public putImports = (compImportUid: string, param: PutImportsParam): Promise<PutImportsRes> => this.httpPut(`/smarts/imports/${compImportUid}`, param);
  /**
   * 임포트 복사
   * @param compImportUid
   * @param param
   * @returns
   */
  public postCopyImports = (compImportUid: string, param: PostCopyImportsParam): Promise<PostCopyImportsRes> => this.httpPost(`/smarts/imports/copy/${compImportUid}`, param);
}

export const useSmartEditorApi = () => new smartEditorApi();