import type { ACTION_MODE, ACTION_MODE_VALUE } from '@/constants/common';
import type { ContentOptionItem } from '@/types/store/modules/ftp';

// TODO: 경로 변경 예정
export interface UploadContentOption {
  name: string
  file?: File
}
export interface DeleteContentOption extends ContentOptionItem {}

// 수행 행위 구분 =====================================================================
export type ACTION_MODE_TYPE = typeof ACTION_MODE[keyof typeof ACTION_MODE];

export type ACTION_MODE_TYPE_VALUE = typeof ACTION_MODE_VALUE[keyof typeof ACTION_MODE_VALUE];

export type ActionContentOption = DeleteContentOption | UploadContentOption;

export interface CustomSvgIconType {
  path: string
  color?: string
}