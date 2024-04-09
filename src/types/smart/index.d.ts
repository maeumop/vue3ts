import type { PageItem, GetUpdateAblePageItem } from '@/types/api/smartEditorApi';
import type { COPY_MODE } from '@/constants/smart';
import type { BooleanYN } from '@/types/common';

export interface VersionUpdateItem extends GetUpdateAblePageItem {
  result: BooleanYN | null | number
}

export interface BatchItem extends PageItem {
  batchSetReult: BooleanYN | null
}

export type COPY_MODE_TYPE = typeof COPY_MODE[keyof typeof COPY_MODE];

export type COPY_MODE_TYPE_VALUE = typeof COPY_MODE_VALUE[keyof typeof COPY_MODE_VALUE];

export interface CopyPropsData {
  name: string
  uid: string
  code?: string
}