import { booleanYN } from '@/constants/common';
import type { BooleanYN } from '@/types/common';

export interface ExcelSampleItem {
  fieldName: string
  fieldLabel?: string
  fieldType: string
  isRequire?: BooleanYN
  desc: string
}

export interface ExcelSampleItemOther {
  fieldName: string
  isRequire?: BooleanYN
  info: string[]
  options?: string
}

// ==================== 매체코드 일괄등록 - 엑셀 입력 방법 ====================
export const mediaExcelFormSample: ExcelSampleItemOther[] = [
  {
    fieldName: '매체명',
    isRequire: booleanYN.Y,
    info: ['[광고/매체코드 ▶ 매체 코드 관리] 화면에 등록되어 있는 매체명을 입력해 주세요.'],
    options: '구글',
  },
  {
    fieldName: '매체 코드명',
    isRequire: booleanYN.Y,
    info: ['50자 이내로 영문, 숫자, 하이픈(-), 언더바(_)만 입력 가능합니다.', '이미 등록되어 있는 매체 코드명은 중복으로 등록할 수 없습니다.'],
    options: 'GDN_AA_001',
  },
  {
    fieldName: '설명',
    isRequire: booleanYN.N,
    info: ['200자 이내의 설명 내용을 입력해 주세요.'],
    options: '',
  },
];
// ==================== END 매체코드 일괄등록 - 엑셀 입력 방법 ====================


// ==================== UTM 파라미터 일괄등록 - 엑셀 입력 방법 ====================
export const utmExcelFormSample: ExcelSampleItemOther[] = [
  {
    fieldName: 'UTM 파라미터',
    isRequire: booleanYN.Y,
    info: ['utm_source, utm_medium, utm_campaign, utm_term, utm_content 항목 중 1개의 항목을 입력해 주세요.'],
    options: 'utm_source',
  },
  {
    fieldName: '파리미터 값',
    isRequire: booleanYN.Y,
    info: ['50자 이내로 영문, 숫자, 하이픈(-), 언더바(_)만 입력 가능합니다.', '이미 등록되어 있는 파라미터 값은 중복으로 등록할 수 없습니다.'],
    options: 'GDN_AA_001',
  },
  {
    fieldName: '설명',
    isRequire: booleanYN.N,
    info: ['200자 이내의 설명 내용을 입력해 주세요.'],
    options: '',
  },
];
// ==================== END UTM 파라미터 일괄등록 - 엑셀 입력 방법 ====================


// ==================== 고객 DB 일괄등록 - 엑셀 입력 방법 ====================
// 고객 DB 기본 항목
export const dbBasicSample: ExcelSampleItemOther[] = [
  {
    fieldName: 'age',
    info: ['2자 이내의 숫자만 입력해 주세요.'],
  },
  {
    fieldName: 'name',
    info: ['5자 이하의 고객 이름을 입력해 주세요.'],
  },
  {
    fieldName: 'phone',
    info: ['11자 숫자만 입력해주세요'],
  },
  {
    fieldName: 'gender',
    info: ['사용자 성별을 입력해 주세요.'],
  },
  {
    fieldName: 'thirdPartyYn',
    info: ['동의 : Y, 동의안함 : N', '빈 값으로 등록 시 동인안함(N) 상태로 등록 됩니다.'],
  },
  {
    fieldName: 'smsYn',
    info: ['동의 : Y, 동의안함 : N', '빈 값으로 등록 시 동인안함(N) 상태로 등록 됩니다.'],
  },
  {
    fieldName: 'etcComment',
    info: ['등록하실 내용을 입력해 주세요.'],
  },
];

// DB 일괄 등록시 추가 필요 항목 리스트
// export const dbExcelFromSample: ExcelSampleItem[] = [
//   {
//     fieldLabel: '접수일',
//     fieldName: 'regDate',
//     isRequire: booleanYN.N,
//     info: ['‘YYYY-MM-DD HH:MM:SS’ 또는 ‘YYYY-MM-DD’ 형식으로 입력해 주세요.', '빈 값으로 등록 시 일괄 등록 날짜로 자동 등록됩니다.'],
//   },
//   {
//     fieldLabel: '매체 코드명',
//     fieldName: 'mediaCode',
//     isRequire: booleanYN.Y,
//     info: ['[광고/매체코드 ▶ 매체 코드 관리] 화면에 등록되어 있는 매체 코드명을 입력해 주세요.'],
//   },
//   {
//     fieldLabel: '유입링크',
//     fieldName: 'referer',
//     isRequire: booleanYN.N,
//     options: 'http://sample.com',
//     info: ['1,500자 이내로 입력해 주세요.', 'http://, https:// 를 포함한 유입 링크를 입력해 주세요.'],
//   },
//   {
//     fieldLabel: 'IP',
//     fieldName: 'refererIp',
//     isRequire: booleanYN.N,
//     options: '213.55.49.17',
//     info: ['IP 주소를 입력해 주세요.'],
//   },
//   {
//     fieldLabel: 'SMS 수신 동의 동의/거부일',
//     fieldName: 'smsYnDatetime',
//     isRequire: booleanYN.N,
//     options: '2023-06-22 13:52:46, 2023-06-22',
//     info: ['‘YYYY-MM-DD HH:MM:SS’ 또는 ‘YYYY-MM-DD’ 형식으로 입력해 주세요.', '빈 값으로 등록 시 일괄 등록 날짜로 자동 등록됩니다.', ],
//   },
//   {
//     fieldLabel: '개인정보 수집 및 이용 동의 동의일',
//     fieldName: 'privacyYnDatetime',
//     isRequire: booleanYN.N,
//     options: '2023-06-22 13:52:46, 2023-06-22',
//     info: ['‘YYYY-MM-DD HH:MM:SS’ 또는 ‘YYYY-MM-DD’ 형식으로 입력해 주세요.', '빈 값으로 등록 시 일괄 등록 날짜로 자동 등록됩니다.', '해당 항목에 대한 동의 여부 값은 동의(Y) 상태도 자동 등록됩니다.'],
//   },
//   {
//     fieldLabel: '제3자 제공 동의 동의/거부일',
//     fieldName: 'thirdPartyYnDatetime',
//     isRequire: booleanYN.N,
//     options: '2023-06-22 13:52:46, 2023-06-22',
//     info: ['‘YYYY-MM-DD HH:MM:SS’ 또는 ‘YYYY-MM-DD’ 형식으로 입력해 주세요.', '빈 값으로 등록 시 일괄 등록 날짜로 자동 등록됩니다.'],
//   },
// ];
// ==================== END 고객 DB 일괄등록 - 엑셀 입력 방법 ====================