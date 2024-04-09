import type { CombineItem } from '@/types/smart/component';

export interface RollingListGrpEditForm {
  // 배너 그룹명
  rollingListGrpName: string
  // 레이아웃 uid
  layoutUid: string

  // 화면 노출 수
  listCount: string
  // 전환 시간 설정
  duration: string
  // 리스트 사이즈
  sizeX: string
  sizeY?: string
}

export interface RollingListEditFormItem extends CombineItem {
  compRollingListUid?: string
  // 내용
  listText: string

  // 상태 문구
  statusText?: string

  // 상태 문구 컬러
  statusTextColor?: string

  // 상태 문구 배경 컬러
  statusTextBackColor?: string
}
