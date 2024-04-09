import type { SMART_COMP_KEYS } from '@/types/smart/component';

export const CHEVRON_COMBINE = {
  CHEVERON_DOUBBLE_DOWN: 'CHEVERON_DOUBBLE_DOWN',
  CHEVERON_DOWN: 'CHEVERON_DOWN',
  CHEVERON_UP: 'CHEVERON_UP',
  CHEVERON_DOUBBLE_UP: 'CHEVERON_DOUBBLE_UP',
} as const;


export const CHEVRON_COMBINE_VALUE: Record<typeof CHEVRON_COMBINE[keyof typeof CHEVRON_COMBINE], string> = {
  CHEVERON_DOUBBLE_DOWN: '맨 아래',
  CHEVERON_DOWN: '아래',
  CHEVERON_UP: '위',
  CHEVERON_DOUBBLE_UP: '맨 위',
} as const;

/**
 * 고정 입력 항목 명칭 구분
 * 스마트편집 > 입력폼 > *
 */
export const FIX_FIELD_NAME = {
  NAME: 'name',
  PHONE: 'phone',
  AGE: 'age',
  GENDER: 'gender',
  PRIVACY_YN: 'privacyYn',
  THIRD_PARTY_YN: 'thirdPartyYn',
  SMS_YN: 'smsYn',
  CERT: 'cert',
  ETC_COMMNENT: 'etcComment',
} as const;

// 복사할 컴포넌트 구분 =====================================================================

export const COPY_MODE: { [K in SMART_COMP_KEYS]: K } = {
  INPUT_FORM: 'INPUT_FORM',
  ROLLING_BANNER: 'ROLLING_BANNER',
  ROLLING_LIST: 'ROLLING_LIST',
  COMMENT: 'COMMENT',
  IMPORT: 'IMPORT',
} as const;