import type {
  postPagesMsg,
  getPagesMsg,
  getPageContentsMsg,
  putPagesMsg,
  postCopyPagesMsg,
  putPageConfigsMsg,
  postPageLinksMsg,
  getPageLinksMsg,
  deletePageLinksMsg,
  postPageToBinsMsg,
  getIsUpdateAblePagesMsg,
  getUpdateAblePagesMsg,
  putPagesUpdateMsg,
  getIsPagesByRelatedCompMsg,
  postPreviewSaveMsg,
  getLayoutsMsg,
  deleteLayoutsMsg,
  postLayoutsMsg,
  putLayoutsMsg,
  postCopyLayoutsMsg,
  getScriptsMsg,
  deleteScriptsMsg,
  postScriptsMsg,
  putScriptsMsg,
  postCopyScriptsMsg,
  getTermsMsg,
  deleteTermsMsg,
  postTermsMsg,
  putTermsMsg,
  postCopyTermsMsg,
  getPageBinsMsg,
  deletePageBinsMsg,
  patchPageBinToPagesMsg,
  getInputFormMsg,
  deleteInputFormMsg,
  postInputFormMsg,
  putInputFormMsg,
  postCopyInputFormMsg,
  postInputConfigMsg,
  putInputConfigMsg,
  getInputConfigMsg,
  getRollingBannerGrpsMsg,
  deleteRollingBannerGrpsMsg,
  postRollingBannerGrpsMsg,
  putRollingBannerGrpsMsg,
  postCopyRollingBannerGrpsMsg,
  getRollingBannersMsg,
  putRollingBannersMsg,
  getRollingListGrpsMsg,
  deleteRollingListGrpsMsg,
  postRollingListGrpsMsg,
  putRollingListGrpsMsg,
  postCopyRollingListGrpsMsg,
  getRollingListsMsg,
  putRollingListsMsg,
  getCommentGrpsMsg,
  deleteCommentGrpsMsg,
  postCommentGrpsMsg,
  putCommentGrpsMsg,
  postCopyCommentGrpsMsg,
  getCommentsMsg,
  putCommentsMsg,
  getImportsMsg,
  deleteImportsMsg,
  postImportsMsg,
  putImportsMsg,
  postCopyImportsMsg
} from '@/constants/api/smartEditorApi';
import type { PaginationDefault, ResponseDefault } from '.';
import type {
  ConstCommentTypeKeys,
  ConstDbInputFieldTypeKeys,
  ConstLinkTypeKeys,
  ConstPageSectionTypeKeys,
  ConstTransitionTypeKeys,
  JsonString
} from '../common';

// 페이지 등록
export type PostPagesMsg = keyof typeof postPagesMsg;

export interface SmartEditorPageConfig {
  pageUid?: string
  layoutUid?: string
  mobilePageUid?: string
  backPageUid?: string
  scriptUid?: string
  pageName: string
  pageCode?: string
  htmlPath: string
  isUseMobilePage: BooleanYN
  isUseBackPage: BooleanYN
  isUseScript: BooleanYN
  isOn: BooleanYN
}

interface CommonSectionConfig {
  pageSectionRelUid: string
  divProperty: string
  isLayerPopup: BooleanYN
}

export interface ImageSectionConfig extends CommonSectionConfig {
  sectionImageUid: string
  imagePath: string
  imageProperty: string
  linkType: string
  link: string
}

export interface TextSectionConfig extends CommonSectionConfig {
  sectionTextUid: string
  textContent: string
  sectionAlias: string
}

export interface InputSectionConfig extends CommonSectionConfig {
  sectionInputFormUid: string
  compInputFormUid: string
  btnImagePath: string
  btnImageProperty: string
  topImagePath: string
  topImageProperty: string
}

export interface BannerSectionConfig extends CommonSectionConfig {
  sectionFixedBannerUid: string
  imagePath: string
  imageProperty: string
  linkType: string
  link: string
  bannerPosition: string
}

export interface RollingBannerSectionConfig extends CommonSectionConfig {
  sectionRollingBannerUid: string
  compRollingBannerGrpUid: string
}

export interface RollingListSectionConfig extends CommonSectionConfig {
  sectionRollingListUid: string
  compRollingListGrpUid: string
}

export interface ImportSectionConfig extends CommonSectionConfig {
  sectionImportUid: string
  compImportUid: string
}

export interface CommentSectionConfig extends CommonSectionConfig {
  sectionCommentUid: string
  compCommentGrpUid: string
}

export interface CodeSectionConfig {
  sectionCodeUid: string
  pageSectionRelUid: string
  templateUid?: string
  sourceCode: string
  sectionAlias: string
  isLayerPopup: BooleanYN
  sectionAlias: string
}

export type SectionConfig = ImageSectionConfig | TextSectionConfig | InputSectionConfig |
BannerSectionConfig | RollingBannerSectionConfig | RollingListSectionConfig |
ImportSectionConfig | CommentSectionConfig | CodeSectionConfig;

export interface SectionData<T> {
  key?: number
  pageSectionRelUid: string
  pageUid?: string
  sectionType: ConstPageSectionTypeKeys
  sectionOrder?: number
  config: T
}

export interface PostPagesParam {
  pageUid?: string
  pageConfig: SmartEditorPageConfig
  sections: SectionData<SectionConfig>[]
}

export interface PostPagesRes extends ResponseDefault<PostPagesMsg> {}

// 페이지 목록/검색
export type GetPagesMsg = keyof typeof getPagesMsg;

export interface GetPagesParam extends PaginationDefault {
  search?: string
  searchType?: string
}

export interface PageItem extends SmartEditorPageConfig {
  mobilePageCode: string | null
  backPageCode: string | null
  isLastest: BooleanYN
  isDelete: BooleanYN
  layoutName: string
  scriptName: string
  regDatetime: number
}

export interface GetPagesResult {
  totalCount: number
  pageToUpdate: boolean
  pages: PageItem[]
}

export interface GetPagesRes extends ResponseDefault<GetPagesMsg> {
  results: GetPagesResult
}

// 페이지 상세 내역
export type GetPageContentsMsg = keyof typeof getPageContentsMsg;

export interface GetPageContentsResult {
  pageConfig: SmartEditorPageConfig
  sections: SectionData<SectionConfig>[]
}

export interface GetPageContentsRes extends ResponseDefault<GetPageContentsMsg> {
  results: GetPageContentsResult
}

// 페이지 수정
export type PutPagesMsg = keyof typeof putPagesMsg;

export interface PutPagesRes extends ResponseDefault<PutPagesMsg> {}

// 페이지 복사
export type PostCopyPagesMsg = keyof typeof postCopyPagesMsg;

export interface PostCopyPagesParam {
  pageUid: string
  pageName: string
}
export interface PostCopyPagesResult {
  pageCode: string
}

export interface PostCopyPagesRes extends ResponseDefault<PostCopyPagesMsg> {
  results: PostCopyPagesResult
}

// 페이지 기본 설정 변경
export type PutPageConfigsMsg = keyof typeof putPageConfigsMsg;

export interface PutPageConfigsParam {
  layoutUid: string
  scriptUid?: string | null
  mobilePageUid?: string | null
  backPageUid?: string | null
  pageCode: string
  pageName: string
  isUseMobilePage: BooleanYN
  isUseBackPage: BooleanYN
  isUseScript: BooleanYN
  isOn: BooleanYN
}

export interface PutPageConfigsRes extends ResponseDefault<PutPageConfigsMsg> {}

// 페이지 링크 생성
export type PostPageLinksMsg = keyof typeof postPageLinksMsg;

export interface PostPageLinksParam {
  pageLinkUid: string
  linkName: string
  link: string
}

export interface PostPageLinksRes extends ResponseDefault<PostPageLinksMsg> {}

// 페이지 링크 목록
export type GetPageLinksMsg = keyof typeof getPageLinksMsg;

export interface GetPageLinksParam extends PaginationDefault {}

export interface GetPageLinksItem {
  pageLinkUid: string
  linkName: string
  link: string
  regDatetime: number
}

export interface GetPageLinksResult {
  totalCount: number
  pageLinks: GetPageLinksItem[]
}

export interface GetPageLinksRes extends ResponseDefault<GetPageLinksMsg> {
  results: GetPageLinksResult
}

// 페이지 링크 삭제
export type DeletePageLinksMsg = keyof typeof deletePageLinksMsg;

export interface DeletePageLinksRes extends ResponseDefault<DeletePageLinksMsg> {}

// 페이지 휴지통 이동
export type PostPageToBinsMsg = keyof typeof postPageToBinsMsg;

export interface PostPageToBinsParam {
  pageUid: string[]
  reason: string
  password: string
}

export interface PostPageToBinsRes extends ResponseDefault<PostPageToBinsMsg> {}


// 버전 업데이트 존재 여부 체크
export type GetIsUpdateAblePagesMsg = keyof typeof getIsUpdateAblePagesMsg;
export interface GetIsUpdateAblePagesResult {
  result: BooleanYN
}
export interface GetIsUpdateAblePagesRes extends ResponseDefault<GetIsUpdateAblePagesMsg> {
  results: GetIsUpdateAblePagesResult
}


// 버전 업데이트 목록 가져오기
export type GetUpdateAblePagesMsg = keyof typeof getUpdateAblePagesMsg;
export interface GetUpdateAblePageItem {
  pageUid: string
  pageName: string
  pageCode: string
}
export interface GetUpdateAblePagesResult {
  totalCount: number
  pages: GetUpdateAblePageItem[]
}
export interface GetUpdateAblePagesRes extends ResponseDefault<GetUpdateAblePagesMsg> {
  results: GetUpdateAblePagesResult
}

// 페이지 버전 업데이트
export type PutPagesUpdateMsg = keyof typeof putPagesUpdateMsg;

export interface PutPagesUpdateParam {
  pageCode: string
}

export interface PutPagesUpdateRes extends ResponseDefault<PutPagesUpdateMsg> {}

// 컴포넌트 참조 페이지 존재 여부 체크
export type GetIsPagesByRelatedCompMsg = keyof typeof getIsPagesByRelatedCompMsg;
export interface GetIsPagesByRelatedCompParam {
  compUid: string
  compType: Extract<ConstPageSectionTypeKeys, 'INPUT_FORM' | 'ROLLING_BANNER' | 'ROLLING_LIST' | 'IMPORT' | 'COMMENT'>
}

export interface GetIsPagesByRelatedCompResult {
  result: BooleanYN
}
export interface GetIsPagesByRelatedCompRes extends ResponseDefault<GetIsPagesByRelatedCompMsg> {
  results: GetIsPagesByRelatedCompResult
}

// 페이지 미리보기
export type PostPreviewSaveMsg = keyof typeof postPreviewSaveMsg;

export interface PostPreviewSaveParam {
  previewUid: string
  pageConfig: SmartEditorPageConfig
  sections: SectionData<SectionConfig>[]
}

export interface PostPreviewSaveRes extends ResponseDefault<PostPreviewSaveMsg> {}


// 에디터 옵션으로 선택 가능한
export type SmartPageOptionTypes = 'page' | 'layout' | 'script' | 'inputForm' | 'rollingBanner' | 'rollingList' | 'import' | 'comment' | 'template';

// 레이아웃 목록/검색
export type GetLayoutsMsg = keyof typeof getLayoutsMsg;

export interface GetLayoutsParam extends PaginationDefault {
  search?: string
}

export interface LayoutItem {
  layoutUid: string
  layoutName: string
  tagTitle: string
  tagDesc: string
  tagKeyword: string
  tagHead: string
  tagBody: string
  favicon: string
  regDatetime: number
  modDatetime: number
}

export interface GetLayoutsResult {
  totalCount: number
  layouts: LayoutItem[]
}

export interface GetLayoutsRes extends ResponseDefault<GetLayoutsMsg> {
  totalCount: number
  results: GetLayoutsResult
}

// 레이아웃 삭제
export type DeleteLayoutsMsg = keyof typeof deleteLayoutsMsg;

export interface DeleteLayoutsRes extends ResponseDefault<DeleteLayoutsMsg> {}

// 레이아웃 등록
export type PostLayoutsMsg = keyof typeof postLayoutsMsg;

export interface PostLayoutsParam extends PutLayoutsParam {
  layoutUid: string
}
export interface PostLayoutsRes extends ResponseDefault<PostLayoutsMsg> {}


// 레이아웃 수정
export type PutLayoutsMsg = keyof typeof putLayoutsMsg;

export interface PutLayoutsParam {
  layoutName: string
  tagTitle: string
  tagDesc?: string
  tagKeyword?: string
  tagHead: string
  tagBody: string
  favicon?: string
}
export interface PutLayoutsRes extends ResponseDefault<PutLayoutsMsg> {}

// 레이아웃 복사
export type PostCopyLayoutsMsg = keyof typeof postCopyLayoutsMsg;

export interface PostCopyLayoutsParam {
  layoutUid: string
  layoutName: string
}

export interface PostCopyLayoutsRes extends ResponseDefault<PostCopyLayoutsMsg> {}

// 스크립트 목록/검색
export type GetScriptsMsg = keyof typeof getScriptsMsg;

export interface GetScriptsParam extends PaginationDefault {
  search?: string
}

export interface ScriptItem {
  scriptUid: string
  scriptName: string
  sourceCode: string
  regDatetime: number
  modDatetime: number
}

export interface GetScriptResult {
  totalCount: number
  scripts: ScriptItem[]
}

export interface GetScriptsRes extends ResponseDefault<GetScriptsMsg> {
  totalCount: number
  results: GetScriptResult
}

// 스크립트 삭제
export type DeleteScriptsMsg = keyof typeof deleteScriptsMsg;

export interface DeleteScriptsRes extends ResponseDefault<DeleteScriptsMsg> {}

// 스크립트 등록
export type PostScriptsMsg = keyof typeof postScriptsMsg;

export interface PostScriptsParam extends PutScriptsParam {
  scriptUid: string
}
export interface PostScriptsRes extends ResponseDefault<PostScriptsMsg> {}


// 스크립트 수정
export type PutScriptsMsg = keyof typeof putScriptsMsg;

export interface PutScriptsParam {
  scriptName: string
  sourceCode: string
}
export interface PutScriptsRes extends ResponseDefault<PutScriptsMsg> {}

// 스크립트 복사
export type PostCopyScriptsMsg = keyof typeof postCopyScriptsMsg;

export interface PostCopyScriptsParam {
  scriptUid: string
  scriptName: string
}

export interface PostCopyScriptsRes extends ResponseDefault<PostCopyScriptsMsg> {}

// 약관 목록/검색
export type GetTermsMsg = keyof typeof getTermsMsg;

export interface GetTermsParam extends PaginationDefault {
  search?: string
}

export interface TermsItem {
  termsPageUid: string
  layoutName: string
  layoutUid: string
  pageName: string
  pageCode: string
  termsText: string
  htmlPath: string
  regDatetime: number
  modDatetime: number
}

export interface GetTermsResult {
  totalCount: number
  terms: TermsItem[]
}

export interface GetTermsRes extends ResponseDefault<GetTermsMsg> {
  totalCount: number
  results: GetTermsResult
}

// 약관 삭제
export type DeleteTermsMsg = keyof typeof deleteTermsMsg;

export interface DeleteTermsRes extends ResponseDefault<DeleteTermsMsg> {}

// 약관 등록
export type PostTermsMsg = keyof typeof postTermsMsg;

export interface PostTermsParam extends PutTermsParam {
  termsPageUid: string
}

export interface PostTermsResult {
  pageCode: string
}
export interface PostTermsRes extends ResponseDefault<PostTermsMsg> {
  results: PostTermsResult
}


// 약관 수정
export type PutTermsMsg = keyof typeof putTermsMsg;

export interface PutTermsParam {
  layoutUid: string
  pageName: string
  termsText: string
}
export interface PutTermsRes extends ResponseDefault<PutTermsMsg> {}

// 약관 복사
export type PostCopyTermsMsg = keyof typeof postCopyTermsMsg;

export interface PostCopyTermsParam {
  termsPageUid: string
  pageName: string
}

export interface PostCopyTermsRes extends ResponseDefault<PostCopyTermsMsg> {
  results: PostTermsResult
}

// 휴지통 목록/조건별 검색
export type GetPageBinsMsg = keyof typeof getPageBinsMsg;

export interface GetPageBinsParam extends PaginationDefault {
  search?: string
}

export interface GetPageBinsItem {
  pageBinUid: string
  pageUid: string
  remainDay: number
  pageName: string
  layoutName: string
  pageCode: string
  reason: string
  memberEmail: string
  delDatetime: number
}

export interface GetPageBinsResult {
  totalCount: number
  pages: GetPageBinsItem[]
}

export interface GetPageBinsRes extends ResponseDefault<GetPageBinsMsg> {
  results: GetPageBinsResult
}

// 휴지통 영구 삭제
export type DeletePageBinsMsg = keyof typeof deletePageBinsMsg;

export interface DeletePageBinsParam {
  password: string,
  pageBinUids: string[]
}

export interface DeletePageBinsRes extends ResponseDefault<DeletePageBinsMsg> {}

// 휴지통 복구
export type PostPageBinToPagesMsg = keyof typeof patchPageBinToPagesMsg;

export interface PostPageBinToPagesParam {
  pageBinUids: string[]
}

export interface PostPageBinToPagesRes extends ResponseDefault<PostPageBinToPagesMsg> {}

// 리스트 그룹 목록/검색
export type GetInputFormMsg = keyof typeof getInputFormMsg;

export interface GetInputFormParam extends PaginationDefault {
  search?: string
}

export interface GetInputFormItem {
  compInputFormUid: string
  layoutUid: string
  layoutName: string
  inputFormName: string
  sourceCode: string
  regDatetime: number
}

export interface GetInputFormResult {
  totalCount: number
  inputForms: GetInputFormItem[]
}

export interface GetInputFormRes extends ResponseDefault<GetInputFormMsg> {
  // totalCount: number
  results: GetInputFormResult
}

// 입력폼 삭제
export type DeleteInputFormMsg = keyof typeof deleteInputFormMsg;

export interface DeleteInputFormRes extends ResponseDefault<DeleteInputFormMsg> {}

// 앱력폼 등록
export type PostInputFormMsg = keyof typeof postInputFormMsg;

export interface PostInputFormParam {
  compInputFormUid: string
  layoutUid: string
  inputFormName: string
  sourceCode: string
}

export interface PostInputFormRes extends ResponseDefault<PostInputFormMsg> {}

// 입력폼 수정
export type PutInputFormMsg = keyof typeof putInputFormMsg;

export interface PutInputFormParam {
  layoutUid: string
  inputFormName: string
  sourceCode: string
}

export interface PutInputFormRes extends ResponseDefault<PutInputFormMsg> {}

// 입력폼 복사
export type PostCopyInputFormMsg = keyof typeof postCopyInputFormMsg;

export interface PostCopyInputFormParam {
  compInputFormUid: string
  inputFormName: string
}

export interface PostCopyInputFormRes extends ResponseDefault<PostCopyInputFormMsg> {}

// 입력 항목 설정 등록
export type PostInputConfigMsg = keyof typeof postInputConfigMsg;

export interface PostInputConfigParam {
  dbInputFieldConfigUid: string
  fieldType: ConstDbInputFieldTypeKeys
  fieldLabel: string
  fieldName: string
  replaceCode: string
  placeholder: string
  maxLength: string
  numberInputRange: string
  hiddenValue: string
  options: JsonString
  isRequire: number
  isTextFiltering: number
  isUse: number
}

export interface PostInputConfigRes extends ResponseDefault<PostInputConfigMsg> {}

// 입력 항목 설정 수정
export type PutInputConfigMsg = keyof typeof putInputConfigMsg;

export interface PutInputConfigParam {
  fieldType: ConstDbInputFieldTypeKeys
  fieldLabel: string
  fieldName: string
  replaceCode: string
  placeholder?: string
  maxLength?: number
  numberInputRange?: string
  hiddenValue?: string
  options?: JsonString
  isRequire: BooleanYN
  isTextFiltering: BooleanYN
  isUse: BooleanYN
}

export interface PutInputConfigRes extends ResponseDefault<PutInputConfigMsg> {}

// 입력 항목 설정 목록
export type GetInputConfigMsg = keyof typeof getInputConfigMsg;

export interface GetInputConfigResult {
  dbInputFieldConfigUid: string
  fieldType: ConstDbInputFieldTypeKeys
  fieldLabel: string
  fieldName: string
  replaceCode: string
  placeholder: string
  maxLength: number
  numberInputRange: string
  hiddenValue: string
  options: JsonString
  isRequire: BooleanYN
  isTextFiltering: BooleanYN
  isUse: BooleanYN
  regDatetime: BooleanYN
}

export interface GetInputConfigRes extends ResponseDefault<GetInputConfigMsg> {
  results: GetInputConfigResult[]
}

// 롤링 배너 목록/검색
export type GetRollingBannerGrpsMsg = keyof typeof getRollingBannerGrpsMsg;

export interface GetRollingBannerGrpsParam extends PaginationDefault {
  search?: string
}

export interface RollingBannerGrpItem {
  compRollingBannerGrpUid: string
  layoutUid: string
  layoutName: string
  rollingBannerGrpName: string
  transitionType: ConstTransitionTypeKeys
  duration: number
  isUseArrowBtn: BooleanYN
  arrowBtnColorCode?: string
  isUseIndicator: BooleanYN
  indicatorColorCode?: string
  componentSize: string
  regDatetime: number
}

export interface GetRollingBannerGrpsResult {
  totalCount: number
  rollingBannerGrps: RollingBannerGrpItem[]
}

export interface GetRollingBannerGrpsRes extends ResponseDefault<GetRollingBannerGrpsMsg> {
  // totalCount: number
  results: GetRollingBannerGrpsResult
}

// 롤링 배너 삭제
export type DeleteRollingBannerGrpsMsg = keyof typeof deleteRollingBannerGrpsMsg;

export interface DeleteRollingBannerGrpsRes extends ResponseDefault<DeleteRollingBannerGrpsMsg> {}

// 롤링 배너 등록
export type PostRollingBannerGrpsMsg = keyof typeof postRollingBannerGrpsMsg;

export interface PostRollingBannerGrpsParam extends PutRollingBannerGrpsParam {
  compRollingBannerGrpUid: string
}
export interface PostRollingBannerGrpsRes extends ResponseDefault<PostRollingBannerGrpsMsg> {}


// 롤링 배너 수정
export type PutRollingBannerGrpsMsg = keyof typeof putRollingBannerGrpsMsg;

export interface PutRollingBannerGrpsParam {
  layoutUid: string
  rollingBannerGrpName: string
  transitionType: ConstTransitionTypeKeys
  duration: number
  isUseArrowBtn: BooleanYN
  arrowBtnColorCode?: string
  isUseIndicator: BooleanYN
  indicatorColorCode?: string
  componentSize: string
}
export interface PutRollingBannerGrpsRes extends ResponseDefault<PutRollingBannerGrpsMsg> {}

// 롤링 배너 복사
export type PostCopyRollingBannerGrpsMsg = keyof typeof postCopyRollingBannerGrpsMsg;

export interface PostCopyRollingBannerGrpsParam {
  compRollingBannerGrpUid: string
  rollingBannerGrpName: string
}

export interface PostCopyRollingBannerGrpsRes extends ResponseDefault<PostCopyRollingBannerGrpsMsg> {}

// 롤링 배너 관리 조회
export type GetRollingBannersMsg = keyof typeof getRollingBannersMsg;

export interface RollingBannerItem {
  compRollingBannerUid: string
  imagePath: string
  imageProperty: string
  linkType: ConstLinkTypeKeys
  link: string
}

export interface GetRollingBannersResult {
  totalCount: number
  rollingBanners: RollingBannerItem[]
}

export interface GetRollingBannersRes extends ResponseDefault<GetRollingBannerGrpsMsg> {
  // totalCount: number
  results: GetRollingBannersResult
}

// 롤링 배너 관리 수정
export type PutRollingBannersMsg = keyof typeof putRollingBannersMsg;

export interface PutRollingBannerItem {
  compRollingBannerUid: string
  imagePath: string
  imageProperty?: string
  linkType?: ConstLinkTypeKeys
  link?: string
}
export interface PutRollingBannersParam {
  items: PutRollingBannerItem[]
}
export interface PutRollingBannersRes extends ResponseDefault<PutRollingBannersMsg> {}

// 리스트 그룹 목록/검색
export type GetRollingListGrpsMsg = keyof typeof getRollingListGrpsMsg;

export interface GetRollingListGrpsParam extends PaginationDefault {
  search?: string
}

export interface RollingListGrpItem {
  compRollingListGrpUid: string
  layoutUid: string
  layoutName: string
  rollingListGrpName: string
  listCount: number
  duration: number
  componentSize: string
  regDatetime: number
  listTotalCount: number
}

export interface GetRollingListGrpsResult {
  totalCount: number
  rollingListGrps: RollingListGrpItem[]
}

export interface GetRollingListGrpsRes extends ResponseDefault<GetRollingListGrpsMsg> {
  // totalCount: number
  results: GetRollingListGrpsResult
}

// 리스트 그룹 삭제
export type DeleteRollingListGrpsMsg = keyof typeof deleteRollingListGrpsMsg;

export interface DeleteRollingListGrpsRes extends ResponseDefault<DeleteRollingListGrpsMsg> {}

// 리스트 그룹 등록
export type PostRollingListGrpsMsg = keyof typeof postRollingListGrpsMsg;

export interface PostRollingListGrpsParam extends PutRollingListGrpsParam {
  compRollingListGrpUid: string
}
export interface PostRollingListGrpsRes extends ResponseDefault<PostRollingListGrpsMsg> {}


// 리스트 그룹 수정
export type PutRollingListGrpsMsg = keyof typeof putRollingListGrpsMsg;

export interface PutRollingListGrpsParam {
  layoutUid: string
  rollingListGrpName: string
  listCount: number
  duration: number
  componentSize: string
}
export interface PutRollingListGrpsRes extends ResponseDefault<PutRollingListGrpsMsg> {}

// 리스트 그룹 복사
export type PostCopyRollingListGrpsMsg = keyof typeof postCopyRollingListGrpsMsg;

export interface PostCopyRollingListGrpsParam {
  compRollingListGrpUid: string
  rollingListGrpName: string
}

export interface PostCopyRollingListGrpsRes extends ResponseDefault<PostCopyRollingListGrpsMsg> {}

// 리스트 관리 조회
export type GetRollingListsMsg = keyof typeof getRollingListsMsg;

export interface RollingListItem {
  compRollingListUid: string
  listText: string
  statusText: string
  statusTextColor: string
  statusTextBackColor: string
}

export interface GetRollingListsResult {
  totalCount: number
  rollingLists: RollingListItem[]
}

export interface GetRollingListsRes extends ResponseDefault<GetRollingListGrpsMsg> {
  // totalCount: number
  results: GetRollingListsResult
}

// 리스트 관리 수정
export type PutRollingListsMsg = keyof typeof putRollingListsMsg;

export interface PutRollingListItem {
  compRollingListUid: string
  listText: string
  statusText?: string
  statusTextColor?: string
  statusTextBackColor?: string
}
export interface PutRollingListsParam {
  items: PutRollingListItem[]
}
export interface PutRollingListsRes extends ResponseDefault<PutRollingListsMsg> {}

// 댓글 그룹 목록/검색
export type GetCommentGrpsMsg = keyof typeof getCommentGrpsMsg;

export interface GetCommentGrpsParam extends PaginationDefault {
  search?: string
}

export interface CommentGrpItem {
  compCommentGrpUid: string
  layoutUid: string
  layoutName: string
  commentGrpName: string
  commentType: ConstCommentTypeKeys
  isUseMoreBtn: BooleanYN
  commentCount: number
  componentSize: string
  regDatetime: number
}

export interface GetCommentGrpsResult {
  totalCount: number
  commentGrps: CommentGrpItem[]
}

export interface GetCommentGrpsRes extends ResponseDefault<GetCommentGrpsMsg> {
  // totalCount: number
  results: GetCommentGrpsResult
}

// 댓글 그룹 삭제
export type DeleteCommentGrpsMsg = keyof typeof deleteCommentGrpsMsg;

export interface DeleteCommentGrpsRes extends ResponseDefault<DeleteCommentGrpsMsg> {}

// 댓글 그룹 등록
export type PostCommentGrpsMsg = keyof typeof postCommentGrpsMsg;

export interface PostCommentGrpsParam extends PutCommentGrpsParam {
  compCommentGrpUid: string
}
export interface PostCommentGrpsRes extends ResponseDefault<PostCommentGrpsMsg> {}


// 댓글 그룹 수정
export type PutCommentGrpsMsg = keyof typeof putCommentGrpsMsg;

export interface PutCommentGrpsParam {
  layoutUid: string
  commentGrpName: string
  commentType: ConstCommentTypeKeys
  isUseMoreBtn: BooleanYN
  commentCount?: number
  componentSize: string
}
export interface PutCommentGrpsRes extends ResponseDefault<PutCommentGrpsMsg> {}

// 댓글 그룹 복사
export type PostCopyCommentGrpsMsg = keyof typeof postCopyCommentGrpsMsg;

export interface PostCopyCommentGrpsParam {
  compCommentGrpUid: string
  commentGrpName: string
}

export interface PostCopyCommentGrpsRes extends ResponseDefault<PostCopyCommentGrpsMsg> {}

// 댓글 관리 조회
export type GetCommentsMsg = keyof typeof getCommentsMsg;

export interface CommentItem {
  compCommentUid: string
  imagePath: string
  commentText: string
  author: string
  commentTime: string
  likeCount: number
  dislikeCount: number
  rating: number
}

export interface GetCommentsResult {
  totalCount: number
  comments: CommentItem[]
}

export interface GetCommentsRes extends ResponseDefault<GetCommentGrpsMsg> {
  // totalCount: number
  results: GetCommentsResult
}

// 댓글 관리 수정
export type PutCommentsMsg = keyof typeof putCommentsMsg;

export interface PutCommentItem {
  compCommentUid: string
  imagePath?: string
  commentText: string
  author?: string
  commentTime?: string
  likeCount?: number
  dislikeCount?: number
  rating?: number
}
export interface PutCommentsParam {
  items: PutCommentItem[]
}
export interface PutCommentsRes extends ResponseDefault<PutCommentsMsg> {}

// 임포트 목록/검색
export type GetImportsMsg = keyof typeof getImportsMsg;

export interface GetImportsParam extends PaginationDefault {
  search?: string
}

export interface ImportItem {
  compImportUid: string
  layoutUid: string
  layoutName: string
  importName: string
  sourceCode: string
  regDatetime: number
}

export interface GetImportsResult {
  totalCount: number
  imports: ImportItem[]
}

export interface GetImportsRes extends ResponseDefault<GetImportsMsg> {
  // totalCount: number
  results: GetImportsResult
}

// 임포트 삭제
export type DeleteImportsMsg = keyof typeof deleteImportsMsg;

export interface DeleteImportsRes extends ResponseDefault<DeleteImportsMsg> {}

// 임포트 등록
export type PostImportsMsg = keyof typeof postImportsMsg;

export interface PostImportsParam extends PutImportsParam {
  compImportUid: string
}
export interface PostImportsRes extends ResponseDefault<PostImportsMsg> {}


// 임포트 수정
export type PutImportsMsg = keyof typeof putImportsMsg;

export interface PutImportsParam {
  layoutUid: string
  importName: string
  sourceCode: string
}
export interface PutImportsRes extends ResponseDefault<PutImportsMsg> {}

// 임포트 복사
export type PostCopyImportsMsg = keyof typeof postCopyImportsMsg;

export interface PostCopyImportsParam {
  compImportUid: string
  importName: string
}

export interface PostCopyImportsRes extends ResponseDefault<PostCopyImportsMsg> {}
