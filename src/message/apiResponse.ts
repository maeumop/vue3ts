import type { KeyIndex } from '@/components/types';

export const apiErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INVALID_MEMBER_AUTHORIZATION: 'INVALID_MEMBER_AUTHORIZATION',
  INVALID_CLIENT_ACCOUNT: 'INVALID_CLIENT_ACCOUNT',
  INVALID_ATTEMPT_DOWNLOAD: 'INVALID_ATTEMPT_DOWNLOAD',
  EMAIL_VERIFY_TOKEN_EXPIRED: 'EMAIL_VERIFY_TOKEN_EXPIRED',
  INVALID_EMAIL_VERIFY_TOKEN: 'INVALID_EMAIL_VERIFY_TOKEN',
  INVALID_SMS_VERIFY_CODE: 'INVALID_SMS_VERIFY_CODE',
  MEMBER_EMAIL_NOT_FOUND: 'MEMBER_EMAIL_NOT_FOUND',
  MEMBER_INVITE_NOT_FOUND: 'MEMBER_INVITE_NOT_FOUND',
  FILTER_NOT_FOUND: 'FILTER_NOT_FOUND',
  API_NOT_FOUND: 'API_NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  EMAIL_VERIFY_NOT_FOUND: 'EMAIL_VERIFY_NOT_FOUND',
  SMS_VERIFY_NOT_FOUND: 'SMS_VERIFY_NOT_FOUND',
  CLIENT_ACCOUNT_NOT_FOUND: 'CLIENT_ACCOUNT_NOT_FOUND',
  ALIGO_INFO_NOT_FOUND: 'ALIGO_INFO_NOT_FOUND',
  DBS_NOT_FOUND: 'DBS_NOT_FOUND',
  FTP_RESOURCE_NOT_FOUND: 'FTP_RESOURCE_NOT_FOUND',
  MEDIA_CODE_NOT_FOUND: 'MEDIA_CODE_NOT_FOUND',
  NOT_ACCEPTABLE_UID: 'NOT_ACCEPTABLE_UID',
  MEMBER_ALREADY_JOINED: 'MEMBER_ALREADY_JOINED',
  MEMBER_ALREADY_INVITED: 'MEMBER_ALREADY_INVITED',
  MEMBER_ALREADY_REGISTERED: 'MEMBER_ALREADY_REGISTERED',
  FILTER_ALREADY_EXIST: 'FILTER_ALREADY_EXIST',
  MEDIA_CODE_USED: 'MEDIA_CODE_USED',
  MEDIA_CODE_ALREADY_EXIST: 'MEDIA_CODE_ALREADY_EXIST',
  UTM_VALUE_ALREADY_EXIST: 'UTM_VALUE_ALREADY_EXIST',
  SMART_LAYOUT_USED: 'SMART_LAYOUT_USED',
  SMART_SCRIPT_USED: 'SMART_SCRIPT_USED',
  SMART_INPUTFORM_USED: 'SMART_INPUTFORM_USED',
  SMART_COMPONENT_USED_BY_SECTION: 'SMART_COMPONENT_USED_BY_SECTION',
  FTP_DIRECTORY_ERROR: 'FTP_DIRECTORY_ERROR',
  FTP_NAME_ALREADY_EXIST: 'FTP_NAME_ALREADY_EXIST',
  FTP_FOLDER_CREATE_FAIL: 'FTP_FOLDER_CREATE_FAIL',
  FTP_PURGE_FAIL: 'FTP_PURGE_FAIL',
  FTP_RENAME_FAIL: 'FTP_RENAME_FAIL',
  FTP_DELETE_FAIL: 'FTP_DELETE_FAIL',
  PAGE_NOT_CREATED: 'PAGE_NOT_CREATED',
  UNKNOWN_PAGE_TYPE: 'UNKNOWN_PAGE_TYPE',
  S3_UPLOAD_FAIL: 'S3_UPLOAD_FAIL',
  S3_DOWNLOAD_FAIL: 'S3_DOWNLOAD_FAIL',
  ALIGO_API_FAIL: 'ALIGO_API_FAIL',
  ALIGO_MESSAGE_SEND_FAIL: 'ALIGO_MESSAGE_SEND_FAIL',
  LAMBDA_FUNCTION_INVOKE_FAIL: 'LAMBDA_FUNCTION_INVOKE_FAIL',
  PAGE_ALREADY_UPDATE: 'PAGE_ALREADY_UPDATE',
  EXCEEDING_AVAILABLE_PAGES: 'EXCEEDING_AVAILABLE_PAGES',
  MOBILE_PAGE_STATUS_OFF: 'MOBILE_PAGE_STATUS_OFF',
  BACK_PAGE_STATUS_OFF: 'BACK_PAGE_STATUS_OFF',
  MOBILE_BACK_PAGE_USED: 'MOBILE_BACK_PAGE_USED',
  CANNOT_OFF_DEFAULT_PAGE: 'CANNOT_OFF_DEFAULT_PAGE',
  NOTHING_PAGE_SECTIONS: 'NOTHING_PAGE_SECTIONS',
  NOT_ALLOW_PAGE_STATUS_OFF: 'NOT_ALLOW_PAGE_STATUS_OFF',
  IS_NOT_CONNECT: 'IS_NOT_CONNECT',
  CLIENT_ID_ALREADY_EXIST: 'CLIENT_ID_ALREADY_EXIST',
  CLIENT_NAME_ALREADY_EXIST: 'CLIENT_NAME_ALREADY_EXIST',
  DB_ALREADY_MOVE_TO_BIN: 'DB_ALREADY_MOVE_TO_BIN',
  MEDIA_API_URL_ALREADY_EXIST: 'MEDIA_API_URL_ALREADY_EXIST',
  REGDATETIME_ALREADY_EXIST: 'REGDATETIME_ALREADY_EXIST',
  UUID_ALREADY_EXIST: 'UUID_ALREADY_EXIST',
  PAGE_BIN_NOT_DELETED: 'PAGE_BIN_NOT_DELETED',
  EMAIL_SEND_FAIL: 'EMAIL_SEND_FAIL',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
  INVALID_DOWNLOAD_TYPE: 'INVALID_DOWNLOAD_TYPE',
  BAD_REQUEST_API_UUID: 'BAD_REQUEST_API_UUID',
  BAD_REQUEST_VERIFYCODE: 'BAD_REQUEST_VERIFYCODE',
  INVALID_FTP_FILE_EXTENSION: 'INVALID_FTP_FILE_EXTENSION',
  INVALID_FTP_FILE_NAME: 'INVALID_FTP_FILE_NAME',
  SAME_PASSWORD: 'SAME_PASSWORD',
  INVAILD_REPLACE_CODE: 'INVAILD_REPLACE_CODE',
  INVALID_API_METHOD: 'INVALID_API_METHOD',
  INVALID_API_RESPONSE_TYPE: 'INVALID_API_RESPONSE_TYPE',
  INVALID_DB: 'INVALID_DB',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

export type ApiErrorCode = typeof apiErrorCode[keyof typeof apiErrorCode];

const apiErrorMessageText: KeyIndex<string> = {
  UNAUTHORIZED: '토큰이 만료 되었습니다.',
  INVALID_MEDIA_AUTHORIZATION: '이메일 중복 오류',
  INVALID_MEMBER_AUTHORIZATION: '권한 코드 오류',
  INVALID_BEARER_TOKEN: '',
  INVALID_CLIENT_ACCOUNT: '유효하지 않은 광고주 아이디 입니다.',
  DBS_NOT_FOUND: '설정하신 기간에 접수된 고객 DB가 존재하지 않습니다.',
  INVALID_ATTEMPT_DOWNLOAD: '다운로드는 요청한 사용자만 가능합니다.',
  EMAIL_VERIFY_TOKEN_EXPIRED: '',
  INVALID_EMAIL_VERIFY_TOKEN: '인증 토큰 만료',
  MEMBER_EMAIL_NOT_FOUND: '가입 내역이 존재하지 않은 이메일 주소입니다.',
  MEMBER_INVITE_NOT_FOUND: '존재하지 않은 초대',
  FILTER_NOT_FOUND: '',
  API_NOT_FOUND: 'API 연동 내역이 존재하지 않습니다.',
  RESOURCE_NOT_FOUND: 'OFF 상태의 페이지는 기본페이지로 설정 할 수 없습니다.',
  EMAIL_VERIFY_NOT_FOUND: '인증 내역을 찾을 수 없습니다.',
  VERIFYCODE_NOT_FOUND: '인증 번호 만료',
  CLIENTACCOUNT_NOT_FOUND: '광고주 오류',
  ALIGO_INFO_NOT_FOUND: '알리고 정보 없음',
  NOT_ACCEPTABLE_UID: '이미 삭제 되었거나, 존재하지 않는 템플릿 입니다.',
  MEMBER_ALREADY_JOINED: '이미 초대 수락',
  MEMBER_ALREADY_INVITED: '이미 초대된 멤버',
  MEMBER_ALREADY_REGISTERED: '이미 가입된 아이디(이메일)가 존재합니다.',
  FILTER_ALREADY_EXIST: 'DB 필터 이미 존재',
  MEDIA_CODE_USED: '해당 매체 코드로 유입된 고객 DB 존재하여 삭제가 불가능 합니다.',
  MEDIA_CODE_ALREADY_EXIST: '이미 등록된 매체 코드명이 존재합니다.',
  UTM_VALUE_ALREADY_EXIST: '이미 등록된 utm 파라미터 값이 존재합니다.',
  SMART_LAYOUT_USED: '삭제가 불가능합니다.',
  SMART_SCRIPT_USED: '삭제가 불가능합니다.',
  SMART_INPUTFORM_USED: '',
  SMART_COMPONENT_USED_BY_SECTION: '해당 컴포넌트는 참조하고 있는 페이지가 있습니다.',
  FTP_DIRECTORY_NOT_EXISTS: '이미 삭제된 폴더입니다.',
  FTP_DIRECTORY_FILE_NOT_EXISTS: '이미 삭제된 파일입니다.',
  FTP_DIRECTORY_ERROR: '디렉토리에 문제가 있습니다.',
  FTP_FILE_TYPE_CHECK: '파일 타입을 확인해 주세요.',
  FTP_NAME_EXISTS: '이미 사용하고 있는 디렉토리명이 있습니다.',
  FTP_NEW_FOLDER_FAIL: '새폴더 생성을 실패 하였습니다.',
  FTP_PURGE_FAIL: '새로고침을 실패 하였습니다.',
  FTP_RENAME_FAIL: '폴더명 또는 파일명 수정을 실패 하였습니다.',
  FTP_DELETE_FAIL: '폴더 또는 파일 삭제를 실패 하였습니다.',
  SAME_ACCOUT_STATUS: '동일한 서비스 상태',
  PAGE_NOT_CREATED: '페이지 생성에 실패 하였습니다.',
  UNKNOWN_PAGE_TYPE: '알 수 없는 페이지 섹션 형식입니다.',
  S3_UPLOAD_FAIL: '',
  S3_DOWNLOAD_FAIL: 'S3 파일 다운로드 실패',
  SAME_PASSWORD: '이전 비밀번호와 동일하게 변경 할 수 없습니다.',
  INVAILD_REPLACE_CODE: '잘못된 변환 코드가 있습니다.',
  INVALID_API_METHOD: '잘못된 API 전송 메소드 입니다.',
  INVALID_API_RESPONSE_TYPE: '잘못된 API 응답 형식입니다.',
  ALIGO_MESSAGE_SEND_FAIL: '문자 전송 오류',
  LAMBDA_FUNCTION_INVOKE_FAIL: 'HTML 파일 생성 람다 실행 실패',
  PAGE_ALREADY_UPDATE: '업데이트 내역이 존재하지 않습니다.',
  EXCEEDING_AVAILABLE_PAGES: 'ON 상태의 최대 개수를 초과하였습니다. (최대 50개)',
  MOBILE_PAGE_STATUS_OFF: 'ON 상태의 페이지만 모바일 설정이 가능합니다.',
  BACK_PAGE_STATUS_OFF: 'ON 상태의 페이지만 백 페이지 설정이 가능합니다.',
  MOBILE_BACK_PAGE_USED: '모바일, 백페이지로 사용 중인 페이지입니다.',
  CANNOT_OFF_DEFAULT_PAGE: '기본 페이지는 OFF 처리할 수 없습니다.',
  NOTHING_PAGE_SECTIONS: '페이지에 등록 가능한 섹션이 없습니다.',
  INVALID_PASSWORD: '비밀번호가 일치하지 않습니다.',
  PAGE_BIN_NOT_DELETED: '이미 삭제된 페이지 입니다.',
  EMAIL_SEND_FAIL: '이메일 발송 실패',
  BAD_REQUEST_UUID: 'UUID 파리미터에 오류가 있습니다.',
  BAD_REQUEST_CONFIG: 'Config 쿼리 파라미터 요청 오류',
  BAD_REQUEST_SEARCH_PARAMETER: '검색 파라미터 오류',
  BAD_REQUEST_MISSING_PARAMETER: '필수 파라미터 누락 되었습니다.',
  BAD_REQUEST_DUPLICATE_MEDIA_URL: '매체 UID + URL 중복 되었습니다.',
  BAD_REQUEST_DUPLICATE_UUID: 'UUID 중복 되었습니다.',
  MEDIA_CODE_NOT_FOUND: '매체 코드 오류',
  BAD_REQUEST_S3_UPLOAD: '',
  INVALID_DOWNLOAD_TYPE: '다운로드 타입 오류',
  BAD_REQUEST_EMAIL_VERIFY: '',
  BAD_REQUEST_API_UUID: 'API UID 없음',
  BAD_REQUEST_VERIFYCODE: '유효하지 않은 인증번호',
  BAD_REQUEST_DB_UUID: '없는 고객 DB UID 입니다.',
  CLIENT_ID_ALREADY_EXIST: '이미 등록된 광고주 ID가 존재합니다.',
  CLIENT_NAME_ALREADY_EXIST: '이미 등록된 광고주 이름이 존재합니다.',
  DB_ALREADY_MOVE_TO_BIN: 'DB 중복 삭제 오류',
  REGDATETIME_ALREADY_EXIST: 'DB 접수일시 중복 오류',
  NOT_ALLOW_PAGE_STATUS_OFF: 'OFF 상태의 페이지는 기본페이지로 설정 할 수 없습니다.',
  IS_NOT_CONNECT: '연결중 상태의 도메인은 대표 도메인으로 설정할 수 없습니다.',
  ALIGO_API_FAIL: '',
  INVALID_DB: '',
  BAD_REQUEST: '',
};

export const getApiErrorMessage = (code: string): string => {
  return apiErrorMessageText[code];
};