import type { CONTENT_TYPE_TYPE, FTP_CONTENTS_ROLE_TYPE } from '@/types/store/modules/ftp';

export const CONTENT_TYPE = {
  NONE: 'N',
  DIR: 'D',
  FILE: 'F',
} as const;

export const CONTENT_TYPE_VALUE: Record<CONTENT_TYPE_TYPE, string> = {
  N: '-',
  D: '폴더',
  F: '파일',
} as const;

export const FTP_CONTENTS_ROLE = {
  UPLOAD_BUTTON: 'UPLOAD_BUTTON',
  NEW_FOLDER_BUTTON: 'NEW_FOLDER_BUTTON',
  RELOAD_BUTTON: 'RELOAD_BUTTON',
  DELETE_BUTTON: 'DELETE_BUTTON',

  ALL_CHECKBOX: 'ALL_CHECKBOX',

  CONTEXT_MENU: 'CONTEXT_MENU',
  IMAGE_VIEWER: 'IMAGE_VIEWER',
} as const;

export const FTP_CONTENT_ROLE_VALUE: Record<FTP_CONTENTS_ROLE_TYPE, string> = {
  UPLOAD_BUTTON: '업로드',
  NEW_FOLDER_BUTTON: '새폴더',
  RELOAD_BUTTON: '새로고침',
  DELETE_BUTTON: '삭제',

  ALL_CHECKBOX: '전체 파일 선택',

  CONTEXT_MENU: '컨택스트 메뉴',
  IMAGE_VIEWER: '이미지',
} as const;