import type { CONTENT_TYPE, FTP_CONTENTS_ROLE, FTP_CONTENT_ROLE_VALUE } from '@/constants/store/modules/ftp';
import type { GetFtpItem } from '@/types/api/webFtpApi';

// 디렉토리/파일 구분 =====================================================================
export type CONTENT_TYPE_TYPE = typeof CONTENT_TYPE[keyof typeof CONTENT_TYPE];

export type CONTENT_TYPE_TYPE_VALUE = typeof CONTENT_TYPE_VALUE[keyof typeof CONTENT_TYPE_VALUE];

// 기능 권한 구분 =====================================================================
export type FTP_CONTENTS_ROLE_TYPE = typeof FTP_CONTENTS_ROLE[keyof typeof FTP_CONTENTS_ROLE];

export type FTP_CONTENT_ROLE_TYPE_VALUE = typeof FTP_CONTENT_ROLE_VALUE[keyof typeof FTP_CONTENT_ROLE_VALUE];


export interface ContentItem extends GetFtpItem {
  path: string
  src?: string
}

export interface ContentOptionItem extends ContentItem {
  show: boolean
  checked?: boolean
}