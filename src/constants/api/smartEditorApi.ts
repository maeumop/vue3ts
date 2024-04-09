import { responseDefault } from '.';

export const postPagesMsg = {
  SMART_PAGE_INSERT_SUCCESS: 'SMART_PAGE_INSERT_SUCCESS',
  UNKNOWN_PAGE_TYPE: 'UNKNOWN_PAGE_TYPE',
  PAGE_NOT_CREATED: 'PAGE_NOT_CREATED',
  NOTHING_PAGE_SECTIONS: 'NOTHING_PAGE_SECTIONS',
  EXCEEDING_AVAILABLE_PAGES: 'EXCEEDING_AVAILABLE_PAGES',
  MOBILE_PAGE_STATUS_OFF: 'MOBILE_PAGE_STATUS_OFF',
  BACK_PAGE_STATUS_OFF: 'BACK_PAGE_STATUS_OFF',
  MOBILE_BACK_PAGE_USED: 'MOBILE_BACK_PAGE_USED',
  ...responseDefault,
} as const;

export const getPagesMsg = {
  SMART_PAGE_GET_SUCCESS: 'SMART_PAGE_GET_SUCCESS',
  MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
  ...responseDefault
} as const;

export const getPageContentsMsg = {
  SMART_PAGE_CONTENT_GET_SUCCESS: 'SMART_PAGE_CONTENT_GET_SUCCESS',
  ...responseDefault
} as const;

export const putPagesMsg = {
  SMART_PAGE_UPDATE_SUCCESS: 'SMART_PAGE_UPDATE_SUCCESS',
  UNKNOWN_PAGE_TYPE: 'UNKNOWN_PAGE_TYPE',
  PAGE_NOT_CREATED: 'PAGE_NOT_CREATED',
  NOTHING_PAGE_SECTIONS: 'NOTHING_PAGE_SECTIONS',
  EXCEEDING_AVAILABLE_PAGES: 'EXCEEDING_AVAILABLE_PAGES',
  MOBILE_PAGE_STATUS_OFF: 'MOBILE_PAGE_STATUS_OFF',
  BACK_PAGE_STATUS_OFF: 'BACK_PAGE_STATUS_OFF',
  MOBILE_BACK_PAGE_USED: 'MOBILE_BACK_PAGE_USED',
  CANNOT_OFF_DEFAULT_PAGE: 'CANNOT_OFF_DEFAULT_PAGE',
  ...responseDefault
} as const;

export const postCopyPagesMsg = {
  SMART_PAGE_COPY_SUCCESS: 'SMART_PAGE_COPY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  NOT_ACCEPTABLE_UID: 'NOT_ACCEPTABLE_UID',
  ...responseDefault,
} as const;

export const putPageConfigsMsg = {
  SMART_PAGE_CONFIG_UPDATE_SUCCESS: 'SMART_PAGE_CONFIG_UPDATE_SUCCESS',
  ...responseDefault,
} as const;

export const postPageLinksMsg = {
  SMART_PAGE_LINK_INSERT_SUCCESS: 'SMART_PAGE_LINK_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const getPageLinksMsg = {
  SMART_PAGE_LINK_GET_SUCCESS: 'SMART_PAGE_LINK_GET_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
} as const;

export const deletePageLinksMsg = {
  SMART_PAGE_LINK_DELETE_SUCCESS: 'SMART_PAGE_LINK_DELETE_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault,
} as const;

export const postPageToBinsMsg = {
  SMART_PAGE_MOVE_BIN_SUCCESS: 'SMART_PAGE_MOVE_BIN_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  MEMBER_EMAIL_NOT_FOUND: 'MEMBER_EMAIL_NOT_FOUND',
  NOT_ACCEPTABLE_UID: 'NOT_ACCEPTABLE_UID',
  ...responseDefault,
} as const;

export const getIsUpdateAblePagesMsg = {
  IS_UPDATE_ABLE_PAGE_GET_SUCCESS: 'IS_UPDATE_ABLE_PAGE_GET_SUCCESS',
  ...responseDefault,
} as const;

export const getUpdateAblePagesMsg = {
  SMART_UPDATE_ABLE_PAGE_GET_SUCCESS: 'SMART_UPDATE_ABLE_PAGE_GET_SUCCESS',
  ...responseDefault,
} as const;

export const putPagesUpdateMsg = {
  SMART_PAGE_VERSION_UPDATE_SUCCESS: 'SMART_PAGE_VERSION_UPDATE_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  PAGE_ALREADY_UPDATE: 'PAGE_ALREADY_UPDATE',
  S3_UPLOAD_FAIL: 'S3_UPLOAD_FAIL',
  LAMBDA_FUNCTION_INVOKE_FAIL: 'LAMBDA_FUNCTION_INVOKE_FAIL',
  ...responseDefault,
} as const;

export const getIsPagesByRelatedCompMsg = {
  IS_RELATED_COMP_PAGE_GET_SUCCESS: 'IS_RELATED_COMP_PAGE_GET_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  ...responseDefault,
} as const;

export const postPreviewSaveMsg = {
  SMART_PREVIEW_INSERT_SUCCESS: 'SMART_PREVIEW_INSERT_SUCCESS',
  ...responseDefault,
} as const;

export const getLayoutsMsg = {
  SMART_LAYOUT_GET_SUCCESS: 'SMART_LAYOUT_GET_SUCCESS',
  BAD_REQUEST_SEARCH_PARAMETER: 'BAD_REQUEST_SEARCH_PARAMETER',
  ...responseDefault
} as const;

export const deleteLayoutsMsg = {
  SMART_LAYOUT_DELETE_SUCCESS: 'SMART_LAYOUT_DELETE_SUCCESS',
  SMART_LAYOUT_USED: 'SMART_LAYOUT_USED',
  ...responseDefault
} as const;

export const postLayoutsMsg = {
  SMART_LAYOUT_INSERT_SUCCESS: 'SMART_LAYOUT_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const putLayoutsMsg = {
  SMART_LAYOUT_UPDATE_SUCCESS: 'SMART_LAYOUT_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const postCopyLayoutsMsg = {
  SMART_LAYOUT_COPY_SUCCESS: 'SMART_LAYOUT_COPY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  NOT_ACCEPTABLE_UID: 'NOT_ACCEPTABLE_UID',
  ...responseDefault
} as const;

export const getScriptsMsg = {
  SMART_SCRIPT_GET_SUCCESS: 'SMART_SCRIPT_GET_SUCCESS',
  BAD_REQUEST_SEARCH_PARAMETER: 'BAD_REQUEST_SEARCH_PARAMETER',
  ...responseDefault
} as const;

export const deleteScriptsMsg = {
  SMART_SCRIPT_DELETE_SUCCESS: 'SMART_SCRIPT_DELETE_SUCCESS',
  SMART_SCRIPT_USED: 'SMART_SCRIPT_USED',
  ...responseDefault
} as const;

export const postScriptsMsg = {
  SMART_SCRIPT_INSERT_SUCCESS: 'SMART_SCRIPT_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const putScriptsMsg = {
  SMART_SCRIPT_UPDATE_SUCCESS: 'SMART_SCRIPT_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const postCopyScriptsMsg = {
  SMART_SCRIPT_COPY_SUCCESS: 'SMART_SCRIPT_COPY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  NOT_ACCEPTABLE_UID: 'NOT_ACCEPTABLE_UID',
  ...responseDefault
} as const;

export const getTermsMsg = {
  SMART_TERMS_PAGE_GET_SUCCESS: 'SMART_TERMS_PAGE_GET_SUCCESS',
  BAD_REQUEST_SEARCH_PARAMETER: 'BAD_REQUEST_SEARCH_PARAMETER',
  ...responseDefault
} as const;

export const deleteTermsMsg = {
  SMART_TERMS_PAGE_DELETE_SUCCESS: 'SMART_TERMS_PAGE_DELETE_SUCCESS',
  ...responseDefault
} as const;

export const postTermsMsg = {
  SMART_TERMS_PAGE_INSERT_SUCCESS: 'SMART_TERMS_PAGE_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const putTermsMsg = {
  SMART_TERMS_PAGE_UPDATE_SUCCESS: 'SMART_TERMS_PAGE_UPDATE_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const postCopyTermsMsg = {
  SMART_TERMS_PAGE_COPY_SUCCESS: 'SMART_TERMS_PAGE_COPY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  NOT_ACCEPTABLE_UID: 'NOT_ACCEPTABLE_UID',
  ...responseDefault
} as const;

export const getPageBinsMsg = {
  SMART_PAGE_BIN_GET_SUCCESS: 'SMART_PAGE_BIN_GET_SUCCESS',
  MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
  ...responseDefault,
} as const;

export const deletePageBinsMsg = {
  SMART_PAGE_BIN_DELETE_SUCCESS: 'SMART_PAGE_BIN_DELETE_SUCCESS',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  MEMBER_EMAIL_NOT_FOUND: 'MEMBER_EMAIL_NOT_FOUND',
  PAGE_BIN_NOT_DELETED: 'PAGE_BIN_NOT_DELETED',
  ...responseDefault,
} as const;

export const patchPageBinToPagesMsg = {
  SMART_PAGE_BIN_MOVE_PAGE_SUCCESS: 'SMART_PAGE_BIN_MOVE_PAGE_SUCCESS',
  NOT_ACCEPTABLE_UID: 'NOT_ACCEPTABLE_UID',
  ...responseDefault
} as const;

export const getInputFormMsg = {
  SMART_INPUT_FORM_GET_SUCCESS: 'SMART_INPUT_FORM_GET_SUCCESS',
  ...responseDefault
} as const;

export const deleteInputFormMsg = {
  SMART_INPUT_FORM_DELETE_SUCCESS: 'SMART_INPUT_FORM_DELETE_SUCCESS',
  SMART_INPUTFORM_USED: 'SMART_INPUTFORM_USED',
  ...responseDefault
} as const;

export const postInputFormMsg = {
  SMART_INPUT_FORM_INSERT_SUCCESS: 'SMART_INPUT_FORM_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const putInputFormMsg = {
  SMART_INPUT_FORM_UPDATE_SUCCESS: 'SMART_INPUT_FORM_UPDATE_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const postCopyInputFormMsg = {
  SMART_INPUT_FORM_COPY_SUCCESS: 'SMART_INPUT_FORM_COPY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  NOT_ACCEPTABLE_UID: 'NOT_ACCEPTABLE_UID',
  ...responseDefault
} as const;

export const postInputConfigMsg = {
  SMART_INPUT_CONFIG_INSERT_SUCCESS: 'SMART_INPUT_CONFIG_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const putInputConfigMsg = {
  SMART_INPUT_CONFIG_UPDATE_SUCCESS: 'SMART_INPUT_CONFIG_UPDATE_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const getInputConfigMsg = {
  SMART_INPUT_CONFIG_GET_SUCCESS: 'SMART_INPUT_CONFIG_GET_SUCCESS',
  ...responseDefault
} as const;

export const getRollingBannerGrpsMsg = {
  SMART_LIST_BANNER_GRP_GET_SUCCESS: 'SMART_LIST_BANNER_GRP_GET_SUCCESS',
  ...responseDefault
} as const;

export const deleteRollingBannerGrpsMsg = {
  SMART_LIST_BANNER_GRP_DELETE_SUCCESS: 'SMART_LIST_BANNER_GRP_DELETE_SUCCESS',
  SMART_COMPONENT_USED_BY_SECTION: 'SMART_COMPONENT_USED_BY_SECTION',
  ...responseDefault
} as const;

export const postRollingBannerGrpsMsg = {
  SMART_LIST_BANNER_GRP_INSERT_SUCCESS: 'SMART_LIST_BANNER_GRP_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const putRollingBannerGrpsMsg = {
  SMART_LIST_BANNER_GRP_UPDATE_SUCCESS: 'SMART_LIST_BANNER_GRP_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const postCopyRollingBannerGrpsMsg = {
  SMART_LIST_BANNER_GRP_COPY_SUCCESS: 'SMART_LIST_BANNER_GRP_COPY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const getRollingBannersMsg = {
  SMART_LIST_BANNER_GET_SUCCESS: 'SMART_LIST_BANNER_GET_SUCCESS',
  ...responseDefault
} as const;

export const putRollingBannersMsg = {
  SMART_LIST_BANNER_UPDATE_SUCCESS: 'SMART_LIST_BANNER_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const getRollingListGrpsMsg = {
  SMART_LIST_ROLLING_GRP_GET_SUCCESS: 'SMART_LIST_ROLLING_GRP_GET_SUCCESS',
  ...responseDefault
} as const;

export const deleteRollingListGrpsMsg = {
  SMART_LIST_ROLLING_GRP_DELETE_SUCCESS: 'SMART_LIST_ROLLING_GRP_DELETE_SUCCESS',
  SMART_COMPONENT_USED_BY_SECTION: 'SMART_COMPONENT_USED_BY_SECTION',
  ...responseDefault
} as const;

export const postRollingListGrpsMsg = {
  SMART_LIST_ROLLING_GRP_INSERT_SUCCESS: 'SMART_LIST_ROLLING_GRP_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const putRollingListGrpsMsg = {
  SMART_LIST_ROLLING_GRP_UPDATE_SUCCESS: 'SMART_LIST_ROLLING_GRP_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const postCopyRollingListGrpsMsg = {
  SMART_LIST_ROLLING_GRP_COPY_SUCCESS: 'SMART_LIST_ROLLING_GRP_COPY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const getRollingListsMsg = {
  SMART_LIST_ROLLING_GET_SUCCESS: 'SMART_LIST_ROLLING_GET_SUCCESS',
  ...responseDefault
} as const;

export const putRollingListsMsg = {
  SMART_LIST_ROLLING_UPDATE_SUCCESS: 'SMART_LIST_ROLLING_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const getCommentGrpsMsg = {
  SMART_COMMENT_GRP_GET_SUCCESS: 'SMART_COMMENT_GRP_GET_SUCCESS',
  ...responseDefault
} as const;

export const deleteCommentGrpsMsg = {
  SMART_COMMENT_GRP_DELETE_SUCCESS: 'SMART_COMMENT_GRP_DELETE_SUCCESS',
  SMART_COMPONENT_USED_BY_SECTION: 'SMART_COMPONENT_USED_BY_SECTION',
  ...responseDefault
} as const;

export const postCommentGrpsMsg = {
  SMART_COMMENT_GRP_INSERT_SUCCESS: 'SMART_COMMENT_GRP_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const putCommentGrpsMsg = {
  SMART_COMMENT_GRP_UPDATE_SUCCESS: 'SMART_COMMENT_GRP_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const postCopyCommentGrpsMsg = {
  SMART_COMMENT_GRP_COPY_SUCCESS: 'SMART_COMMENT_GRP_COPY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const getCommentsMsg = {
  SMART_COMMENT_GET_SUCCESS: 'SMART_COMMENT_GET_SUCCESS',
  ...responseDefault
} as const;

export const putCommentsMsg = {
  SMART_COMMENT_UPDATE_SUCCESS: 'SMART_COMMENT_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const getImportsMsg = {
  SMART_IMPORT_GET_SUCCESS: 'SMART_IMPORT_GET_SUCCESS',
  ...responseDefault
} as const;

export const deleteImportsMsg = {
  SMART_IMPORT_DELETE_SUCCESS: 'SMART_IMPORT_DELETE_SUCCESS',
  SMART_COMPONENT_USED_BY_SECTION: 'SMART_COMPONENT_USED_BY_SECTION',
  ...responseDefault
} as const;

export const postImportsMsg = {
  SMART_IMPORT_INSERT_SUCCESS: 'SMART_IMPORT_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const putImportsMsg = {
  SMART_IMPORT_UPDATE_SUCCESS: 'SMART_IMPORT_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const postCopyImportsMsg = {
  SMART_IMPORT_COPY_SUCCESS: 'SMART_IMPORT_COPY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;
