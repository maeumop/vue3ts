import type { DeleteCommentGrpsRes, DeleteImportsRes, DeleteInputFormRes, DeleteRollingBannerGrpsRes, DeleteRollingListGrpsRes } from '@/types/api/smartEditorApi';
import type { ListTableHeader } from '@/components/ListTable/types';
import type { CHEVRON_COMBINE, CHEVRON_COMBINE_VALUE } from '@/constants/smart/component';
import type { COPY_MODE } from '@/constants/smart/component';
import type { ConstPageSectionTypeKeys } from '@/types/common';

// checked
export interface CombineItem {
  checked: boolean
}

// 스마트 편집 > 컴포넌트 > * SelectImages 모달 공통 options ===============================
export interface SelectImagesMdoal<T> {
  show: boolean
  multiple: boolean
  target: T|null
}
// END - 스마트 편집 > 컴포넌트 > * SelectImages 모달 공통 options =========================

// 스마트 편집 > 컴포넌트 > * ListTable 공통 header ========================================
// viewPage: 미리보기
// settings: 관리
export type SmartCompListTableHeaderCommonkeys = 'viewPage' | 'settings';
export type SmartCompListTableHeaderKeys<T> = keyof T | SmartCompListTableHeaderCommonkeys;
export interface SmartCompListTableHeader<T> extends ListTableHeader {
  key: SmartCompListTableHeaderKeys<T>
}
// END - 스마트 편집 > 컴포넌트 > * ListTable 공통 header ==================================

// 스마트 편집 > 컴포넌트 > * 모달 공통 options ============================================
// show:  v-if
// target: 타켓
export interface SmartCompUseModal<T = any> {
  show: boolean
  target?: T | null
}
// END - 스마트 편집 > 컴포넌트 > * 모달 공통 options ======================================

// 위치 이동 유형 선택 =====================================================================
export type CHEVRON_COMBINE_TYPE = typeof CHEVRON_COMBINE[keyof typeof CHEVRON_COMBINE];

export type CHEVRON_COMBINE_TYPE_VALUE = typeof CHEVRON_COMBINE_VALUE[keyof typeof CHEVRON_COMBINE_VALUE];
// END - 위치 이동 유형 선택 ===============================================================

// 복사할 컴포넌트 구분 =====================================================================
export type COPY_MODE_TYPE = (typeof COPY_MODE)[keyof typeof COPY_MODE];
export type SMART_COMP_KEYS = Extract<ConstPageSectionTypeKeys, 'INPUT_FORM' | 'ROLLING_BANNER' | 'ROLLING_LIST' | 'IMPORT' | 'COMMENT'>;

export type DeleteSmartCompResType = DeleteInputFormRes| DeleteRollingBannerGrpsRes | DeleteRollingListGrpsRes | DeleteImportsRes | DeleteCommentGrpsRes;