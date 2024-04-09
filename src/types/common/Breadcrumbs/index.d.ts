import type { MODE, MODE_VALUE } from '@/constants/common';

export interface BreadcrumbsOption {
  path?: string
  title: string
}

// 수행 행위 구분 =====================================================================
export type MODE_TYPE = typeof MODE[keyof typeof MODE];


export type MODE_TYPE_VALUE = typeof MODE_VALUE[keyof typeof MODE_VALUE];