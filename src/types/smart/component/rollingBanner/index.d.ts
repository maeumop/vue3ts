import type { ConstLinkTypeKeys } from '@/types/common';
import type { CombineItem } from '@/types/smart/component';
import type { ConstTransitionTypeKeys } from '@/types/common';

export interface RollingBannerEditFormItem extends CombineItem {
  compRollingBannerUid?: string
  // 이미지
  imagePath: string
  // 이미지 속성
  imageProperty?: string
  // 링크 타입
  linkType: ConstLinkTypeKeys
  // 링크 url
  link?: string
}

export interface RollingBannerGrpEditForm {
  // 배너 그룹명
  rollingBannerGrpName: string
  // 레이아웃 uid
  layoutUid: string

  // 효과 선택
  transitionType: ConstTransitionTypeKeys
  // 전환 시간 설정
  duration: string
  // 배너 사이즈
  sizeX: string
  sizeY?: string
  // 좌/우 화살표 버튼
  isUseArrowBtn: boolean
  // 좌/우 화살표 버튼 컬러
  arrowBtnColorCode?: string
  // 점 버튼
  isUseIndicator: boolean
  // 점 버튼 컬러
  indicatorColorCode?: string
}
