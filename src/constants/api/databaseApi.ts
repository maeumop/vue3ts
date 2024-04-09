import { responseDefault } from '.';

export const getDbsMsg = {
  DBS_GET_SUCCESS: 'DBS_GET_SUCCESS',
  MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
  ...responseDefault,
} as const;

export const getDbsInputFieldsMsg = {
  DB_INPUT_FIELDS_GET_SUCCESS: 'DB_INPUT_FIELDS_GET_SUCCESS',
  MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  ...responseDefault,
} as const;

export const postDbsMsg = {
  DBS_REGISTRATION_SUCCESS: 'DBS_REGISTRATION_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
  INVALID_DB: 'INVALID_DB',
  UUID_ALREADY_EXIST: 'UUID_ALREADY_EXIST',
  ...responseDefault,
} as const;

export const putDbsMsg = {
  DBS_UPDATE_SUCCESS: 'DBS_UPDATE_SUCCESS',
  MEDIA_CODE_NOT_FOUND: 'MEDIA_CODE_NOT_FOUND',
  ...responseDefault,
} as const;

export const deleteDbsMsg = {
  DBS_TO_BIN_SUCCESS: 'DBS_TO_BIN_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  BAD_REQUEST_BODY: 'BAD_REQUEST_BODY',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  MEMBER_EMAIL_NOT_FOUND: 'MEMBER_EMAIL_NOT_FOUND',
  REGDATETIME_ALREADY_EXIST: 'REGDATETIME_ALREADY_EXIST',
  DB_ALREADY_MOVE_TO_BIN: 'DB_ALREADY_MOVE_TO_BIN',
  ...responseDefault,
} as const;

export const getDbsDownloadMsg = {
  DBS_DOWNLOAD_GET_SUCCESS: 'DBS_DOWNLOAD_GET_SUCCESS',
  MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
  INVALID_DOWNLOAD_TYPE: 'INVALID_DOWNLOAD_TYPE',
  ...responseDefault,
} as const;

export const postDbsDownloadMsg = {
  DBS_DOWNLOAD_FILE_CREATE_SUCCESS: 'DBS_DOWNLOAD_FILE_CREATE_SUCCESS',
  BAD_REQUEST_BODY: 'BAD_REQUEST_BODY',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  INVALID_DOWNLOAD_TYPE: 'INVALID_DOWNLOAD_TYPE',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  MEMBER_EMAIL_NOT_FOUND: 'MEMBER_EMAIL_NOT_FOUND',
  DBS_NOT_FOUND: 'DBS_NOT_FOUND',
  ...responseDefault,
} as const;

export const patchDbsDownloadMsg = {
  DBS_DOWNLOAD_SUCCESS: 'DBS_DOWNLOAD_SUCCESS',
  INVALID_ATTEMPT_DOWNLOAD: 'INVALID_ATTEMPT_DOWNLOAD',
  S3_DOWNLOAD_FAIL: 'S3_DOWNLOAD_FAIL',
  ...responseDefault,
} as const;

export const getBinsMsg = {
  DB_BIN_LIST_GET_SUCCESS: 'DB_BIN_LIST_GET_SUCCESS',
  MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
  ...responseDefault,
} as const;

export const postBinsPwCheckMsg = {
  POST_BINS_PW_CHECK_SUCCESS: 'POST_BINS_PW_CHECK_SUCCESS',
  BAD_REQUEST_BODY: 'BAD_REQUEST_BODY',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  MEMBER_EMAIL_NOT_FOUND: 'MEMBER_EMAIL_NOT_FOUND',
  ...responseDefault,
} as const;

export const deleteBinsMsg = {
  DELETE_BINS_SUCCESS: 'DELETE_BINS_SUCCESS',
  MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
  MEMBER_EMAIL_NOT_FOUND: 'MEMBER_EMAIL_NOT_FOUND',
  ...responseDefault,
} as const;

export const patchBinsRecoveryMsg = {
  DB_RECOVERY_SUCCESS: 'DB_RECOVERY_SUCCESS',
  ...responseDefault
} as const;

export const getBinsDeleteHistoryMsg = {
  DB_BIN_DELETE_LIST_GET_SUCCESS: 'DB_BIN_DELETE_LIST_GET_SUCCESS',
  ...responseDefault
} as const;

export const getFilterMsg = {
  DB_FILTER_GET_SUCCESS: 'DB_FILTER_GET_SUCCESS',
  FILTER_NOT_FOUND: 'FILTER_NOT_FOUND',
  ...responseDefault,
} as const;

export const postFilterMsg = {
  DB_FILTER_INSERT_SUCCESS: 'DB_FILTER_INSERT_SUCCESS',
  BAD_REQUEST_BODY: 'BAD_REQUEST_BODY',
  FILTER_ALREADY_EXIST: 'FILTER_ALREADY_EXIST',
  ...responseDefault,
} as const;

export const putFilterMsg = {
  DB_FILTER_UPDATE_SUCCESS: 'DB_FILTER_UPDATE_SUCCESS',
  BAD_REQUEST_BODY: 'BAD_REQUEST_BODY',
  ...responseDefault,
} as const;

export const getApisMsg = {
  API_LIST_GET_SUCCESS: 'API_LIST_GET_SUCCESS',
  ...responseDefault,
} as const;

export const getApisCountMsg = {
  API_COUNT_SUCCESS: 'API_COUNT_SUCCESS',
  ...responseDefault,
} as const;

export const patchApisMsg = {
  API_PATCH_SUCCESS: 'API_PATCH_SUCCESS',
  ...responseDefault
} as const;

export const apiSettingValueType = {
  String: 'string',
  'JSON Object': 'json',
  Array: 'array',
} as const;

export const getApisSendMsg = {
  API_SEND_LIST_GET_SUCCESS: 'API_SEND_LIST_GET_SUCCESS',
  BAD_REQUEST_MISSING_PARAMETER: 'BAD_REQUEST_MISSING_PARAMETER',
  API_NOT_FOUND: 'API_NOT_FOUND',
  ...responseDefault
} as const;

export const postApisSendMsg = {
  API_SEND_COMPLETE: 'API_SEND_COMPLETE',
  BAD_REQUEST_MISSING_PARAMETER: 'BAD_REQUEST_MISSING_PARAMETER',
  BAD_REQUEST_API_UUID: 'BAD_REQUEST_API_UUID',
  BAD_REQUEST_DB_UUID: 'BAD_REQUEST_DB_UUID',
  INVAILD_REPLACE_CODE: 'INVAILD_REPLACE_CODE',
  INVALID_API_METHOD: 'INVALID_API_METHOD',
  INVALID_API_RESPONSE_TYPE: 'INVALID_API_RESPONSE_TYPE',
  ...responseDefault
} as const;

export const deleteApisMsg = {
  API_DELETE_SUCCESS: 'API_DELETE_SUCCESS',
  ...responseDefault
} as const;

export const getDbsApisSendMsg = {
  DB_API_SEND_HISTORY_GET_SUCCESS: 'DB_API_SEND_HISTORY_GET_SUCCESS',
  BAD_REQUEST_MISSING_PARAMETER: 'BAD_REQUEST_MISSING_PARAMETER',
  ...responseDefault
} as const;

export const postApisMsg = {
  API_REGISTRATION_SUCCESS: 'API_REGISTRATION_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  BAD_REQUEST_DUPLICATE_UUID: 'BAD_REQUEST_DUPLICATE_UUID',
  BAD_REQUEST_DUPLICATE_MEDIA_URL: 'BAD_REQUEST_DUPLICATE_MEDIA_URL',
  BAD_REQUEST_MISSING_PARAMETER: 'BAD_REQUEST_MISSING_PARAMETER',
  ...responseDefault,
} as const;

export const putApisMsg = {
  API_MODIFY_SUCCESS: 'API_MODIFY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  BAD_REQUEST_DUPLICATE_UUID: 'BAD_REQUEST_DUPLICATE_UUID',
  BAD_REQUEST_DUPLICATE_MEDIA_URL: 'BAD_REQUEST_DUPLICATE_MEDIA_URL',
  BAD_REQUEST_MISSING_PARAMETER: 'BAD_REQUEST_MISSING_PARAMETER',
  ...responseDefault,
} as const;

export const getDbsExistByPhoneMsg = {
  DBS_PHONE_FIND_SUCCESS: 'DBS_PHONE_FIND_SUCCESS',
  ...responseDefault,
} as const;

export const getDbsInputFieldsConfigMsg = {
  DB_INPUT_FIELDS_GET_SUCCESS: 'DB_INPUT_FIELDS_GET_SUCCESS',
  MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  ...responseDefault,
} as const;