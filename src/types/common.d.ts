/**
 * 해당 type 들은 공통 컴포넌트 타입과 비슷한 것들이 있지만
 * 별개의 type으로 인지하고 사용 하도록 합니다.
 *
 * 김종윤 수석매니저
 */
import type { CONST_CODES, appStage, constEntriesKey, booleanYN, previewComponent, previewType } from '@/constants/common';

// string 또는 number object (index signature)
export interface KeyIndex<T> {
  [index: string]: T
}

export interface Options {
  text: string
  value: any
}

export interface OptionGroup {
  [index: string]: Options[]
}

// 지정된 키만을 사용 할 수있는 타입 생성 Mapped type
export type MappedType<K extends string, T> = {
  [key in K]: T
};

export type AddMappingOptional<T> = {
  [P in keyof T]?: T[P]
};

export type removeMappingOptional<T> = {
  [P in keyof T]-?: T[P]
};

export interface RegExpCase extends KeyIndex<RegExp> {}

export type JsonString = string;

/**
 * ENUM 상수 관리
 */

export type BooleanYN = typeof booleanYN[keyof typeof booleanYN];

export type AppStage = keyof typeof appStage;

// .evn 내용 적용
export interface ProcessEnv {
  BASE_URL: string
  NODE_ENV: string
  VUE_APP_STAGE: AppStage
  VUE_APP_VERSION: string
  VUE_APP_API_URL: string
  VUE_APP_S3_URL: string
  VUE_APP_SESSION_STORAGE_KEY: string
  VUE_APP_SESSION_STORAGE_AUTHLEVEL_KEY: string
  VUE_APP_LOCAL_STORAGE_CLIENT_KEY: string
  VUE_APP_LOCAL_STORAGE_DB_INPUT_FIELD_KEY: string
  VUE_APP_LOCAL_STORAGE_FTP_PATH_KEY: string
  VUE_APP_SERVER_IP: string
  VUE_APP_DOMAIN: string
  VUE_APP_API_VERSION: string
}

export interface MenuItem {
  id?: number
  icon?: string
  menu: string
  path: string
  active: boolean
  height: number
  children: MenuItem[]
}

// 스마트 편집 각종 미리보기 형식
export type PreviewType = keyof typeof previewType;

export type PreviewComponent = keyof typeof previewComponent;

export type ConstEntriesKey = keyof typeof constEntriesKey;

export type CodeItemType = {
  VAL: string
  TXT: string
};

export interface CodeItem {
  VAL: string
  TXT: string
}

export interface ConstApiContent extends CodeItem {
  FORM: CodeItem
  JSON: CodeItem
}

export interface ConstApiMethod extends CodeItem {
  GET: CodeItem
  POST: CodeItem
}

export interface ConstApiResponse extends CodeItem {
  JSON: CodeItem
  TEXT: CodeItem
}

export interface ConstAuth extends CodeItem {
  MASTER: CodeItem
  MEDIA: CodeItem
  MEMBER: CodeItem
  SUPER: CodeItem
}

export interface ConstBin extends CodeItem {
  BLOCK: CodeItem
  DELETE: CodeItem
  DUPLICATE: CodeItem
  MEDIA: CodeItem
  PHONE: CodeItem
  WORD: CodeItem
}

export interface ConstClientAccountStatus extends CodeItem {
  END: CodeItem
  LIVE: CodeItem
  PENDING: CodeItem
}

export interface ConstClientAccountService extends CodeItem {
  AD: CodeItem
  TM: CodeItem
}

export interface ConstClientCategoryBeauty extends CodeItem {
  CARE: CodeItem
  COSMETIC: CodeItem
  ETC: CodeItem
}

export interface ConstClientCategoryBusiness extends CodeItem {
  ETC: CodeItem
  LAW: CodeItem
}

export interface ConstClientCategoryCar extends CodeItem {
  ETC: CodeItem
  RENT: CodeItem
  SERVICE: CodeItem
}

export interface ConstClientCategoryEucation extends CodeItem {
  CLASS: CodeItem
  ETC: CodeItem
}

export interface ConstClientCategoryEntertain extends CodeItem {
  ETC: CodeItem
  SHOW: CodeItem
}

export interface ConstClientCategoryFashion extends CodeItem {
  CLOTH: CodeItem
  ETC: CodeItem
  LUXURY: CodeItem
  SPORT: CodeItem
}

export interface ConstClientCategoryFinance extends CodeItem {
  ETC: CodeItem
  STOCK: CodeItem
}

export interface ConstClientCategoryFood extends CodeItem {
  ALL: CodeItem
  DIET: CodeItem
  ETC: CodeItem
  FEMALE: CodeItem
  MALE: CodeItem
}

export interface ConstClientCategoryHome extends CodeItem {
  APPLIANCE: CodeItem
  ETC: CodeItem
}

export interface ConstClientCategoryMedical extends CodeItem {
  ALL: CodeItem
  CHILD: CodeItem
  DEVICE: CodeItem
  DIET: CodeItem
  ETC: CodeItem
  FEMALE: CodeItem
  HOSPITAL: CodeItem
  INFO: CodeItem
  MALE: CodeItem
}

export interface ConstClientCategory extends CodeItem {
  BEAUTY: ConstClientCategoryBeauty
  BUSINESS: ConstClientCategoryBusiness
  CAR: ConstClientCategoryCar
  EDUCATION: ConstClientCategoryEucation
  ENTERTAIN: ConstClientCategoryEntertain
  FASHION: ConstClientCategoryFashion
  FINANCE: ConstClientCategoryFinance
  FOOD: ConstClientCategoryFood
  HOME: ConstClientCategoryHome
  MEDICAL: ConstClientCategoryMedical
}

export interface ConstDbForm extends CodeItem {
  API: CodeItem
  BATCH: CodeItem
  EACH: CodeItem
  PAGE: CodeItem
}

export interface ConstDownload extends CodeItem {
  BIN: CodeItem
  DB: CodeItem
}

export interface ConstGender extends CodeItem {
  ALL: CodeItem
  FEMALE: CodeItem
  MALE: CodeItem
}

export interface ConstSearch extends CodeItem {
  ALL: CodeItem
  CLIENT_DOMAIN: CodeItem
  CLIENT_ID: CodeItem
  CLIENT_NAME: CodeItem
  MEDIA: CodeItem
  MEDIA_VAL: CodeItem
  NAME: CodeItem
  PHONE: CodeItem
}

export interface ConstCodes {
  API_CONTENT: ConstApiContent
  API_METHOD: ConstApiMethod
  API_RESPONSE: ConstApiResponse
  AUTH: ConstAuth
  BIN: ConstBin
  CLIENT_ACCOUNT_STATUS: ConstClientAccountStatus
  CLIENT_ACCOUT_SERVICE: ConstClientAccountService
  CLIENT_CATEGORY: ConstClientCategory
  REFERER_TYPE: ConstDbForm
  DOWNLOAD: ConstDownload
  GENDER: ConstGender
  SEARCH: ConstSearch
}

export type ConstCodesType = keyof typeof CONST_CODES;
export type ConstCodesCategoryType = keyof typeof CONST_CODES.CLIENT_CATEGORY;

export type ConstCodesKeys = Exclude<keyof typeof CONST_CODES, 'TXT' | 'VAL'>;
export type ConstAuthKeys = Exclude<keyof typeof CONST_CODES.AUTH, 'TXT' | 'VAL'>;
export type ConstDbFormKeys = Exclude<keyof typeof CONST_CODES.REFERER_TYPE, 'TXT' | 'VAL'>;
export type ConstBinKeys = Exclude<keyof typeof CONST_CODES.BIN, 'TXT' | 'VAL'>;
export type ConstSearchKeys = Exclude<keyof typeof CONST_CODES.SEARCH, 'TXT' | 'VAL'>;
export type ConstGenderKeys = Exclude<keyof typeof CONST_CODES.GENDER, 'TXT' | 'VAL'>;
export type ConstDownloadKeys = Exclude<keyof typeof CONST_CODES.DOWNLOAD, 'TXT' | 'VAL'>;
export type ConstApiContentKeys = Exclude<keyof typeof CONST_CODES.API_CONTENT, 'TXT' | 'VAL'>;
export type ConstApiMethodKeys = Exclude<keyof typeof CONST_CODES.API_METHOD, 'TXT' | 'VAL'>;
export type ConstApiResponseKeys = Exclude<keyof typeof CONST_CODES.API_RESPONSE, 'TXT' | 'VAL'>;
export type ConstClientAccountServiceKeys = Exclude<keyof typeof CONST_CODES.CLIENT_ACCOUT_SERVICE, 'TXT' | 'VAL'>;
export type ConstClientAccountStatusKeys = Exclude<keyof typeof CONST_CODES.CLIENT_ACCOUNT_STATUS, 'TXT' | 'VAL'>;
export type ConstDbInputFieldTypeKeys = Exclude<keyof typeof CONST_CODES.DB_INPUT_FIELD_TYPE, 'TXT' | 'VAL'>;
export type ConstPageSectionTypeKeys = Exclude<keyof typeof CONST_CODES.PAGE_SECTION_TYPE, 'TXT' | 'VAL'>;
export type ConstLinkTypeKeys = Exclude<keyof typeof CONST_CODES.LINK_TYPE, 'TXT' | 'VAL'>;
export type ConstCommentTypeKeys = Exclude<keyof typeof CONST_CODES.COMMENT_TYPE, 'TXT' | 'VAL'>;
export type ConstTransitionTypeKeys = Exclude<keyof typeof CONST_CODES.TRANSITION_TYPE, 'TXT' | 'VAL'>;
export type ConstBannerPosition = Exclude<keyof typeof CONST_CODES.BANNER_POSITION, 'TXT' | 'VAL'>;
export type ConstApiSendStatusKeys = Exclude<keyof typeof CONST_CODES.DB_SEND_STATUS, 'TXT' | 'VAL'>;

export type ConstClientCategoryKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY, 'TXT' | 'VAL'>;
export type ConstClientCategoryMedicalKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY.MEDICAL, 'TXT' | 'VAL'>;
export type ConstClientCategoryBeautyKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY.BEAUTY, 'TXT' | 'VAL'>;
export type ConstClientCategoryFoodKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY.FOOD, 'TXT' | 'VAL'>;
export type ConstClientCategoryHomeKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY.HOME, 'TXT' | 'VAL'>;
export type ConstClientCategoryFashionKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY.FASHION, 'TXT' | 'VAL'>;
export type ConstClientCategoryCarKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY.CAR, 'TXT' | 'VAL'>;
export type ConstClientCategoryBusinessKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY.BUSINESS, 'TXT' | 'VAL'>;
export type ConstClientCategoryEducationKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY.EDUCATION, 'TXT' | 'VAL'>;
export type ConstClientCategoryFinanceKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY.FINANCE, 'TXT' | 'VAL'>;
export type ConstClientCategoryEntertainKeys = Exclude<keyof typeof CONST_CODES.CLIENT_CATEGORY.ENTERTAIN, 'TXT' | 'VAL'>;
export type ConstClientCategorySubTotalKeys = ConstClientCategoryKeys | ConstClientCategoryMedicalKeys |
ConstClientCategoryBeautyKeys | ConstClientCategoryFoodKeys |
ConstClientCategoryHomeKeys | ConstClientCategoryFashionKeys |
ConstClientCategoryCarKeys | ConstClientCategoryBusinessKeys |
ConstClientCategoryEducationKeys | ConstClientCategoryFinanceKeys |
ConstClientCategoryEntertainKeys;

export type CategoryCodeItemType = CodeItemType & {
  codes: CategoryCodeItemType[]
};
