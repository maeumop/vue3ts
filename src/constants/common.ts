import type { ACTION_MODE_TYPE } from '@/types/common/ftp/layer/MultipleActionList';

export const booleanYN = {
  Y: 1,
  N: 0,
} as const;

export const appStage = {
  DEVELOP: 'DEVELOP',
  PRODUCT: 'PRODUCT',
} as const;

export const previewType = {
  terms: 'terms',
  pages: 'pages',
  components: 'components',
  template: 'template',
} as const;

export const previewComponent = {
  INPUT_FORM: 'INPUT_FORM',
  ROLLING_BANNER: 'ROLLING_BANNER',
  ROLLING_LIST: 'ROLLING_LIST',
  COMMENT: 'COMMENT',
  IMPORT: 'IMPORT',
} as const;

export const constEntriesKey = {
  API_CONTENT: 'API_CONTENT',
  API_METHOD: 'API_METHOD',
  API_RESPONSE: 'API_RESPONSE',
  AUTH: 'AUTH',
  BIN: 'BIN',
  CLIENT_ACCOUNT_STATUS: 'CLIENT_ACCOUNT_STATUS',
  CLIENT_ACCOUT_SERVICE: 'CLIENT_ACCOUT_SERVICE',
  CLIENT_CATEGORY: 'CLIENT_CATEGORY',
  REFERER_TYPE: 'REFERER_TYPE',
  DOWNLOAD: 'DOWNLOAD',
  GENDER: 'GENDER',
  SEARCH: 'SEARCH',
} as const;

export const MODE = {
  DEFAULT: 'DEFAULT',
  ROUTE: 'ROUTE',
} as const;

export const MODE_VALUE = {
  DEFAULT: '-',
  ROUTE: '라우터',
} as const;

export const ACTION_MODE = {
  NONE: 'NONE',
  UPLOAD_ITEM: 'UPLOAD_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
} as const;

export const ACTION_MODE_VALUE: Record<ACTION_MODE_TYPE, string> = {
  NONE: '-',
  UPLOAD_ITEM: '업로드',
  DELETE_ITEM: '삭제',
} as const;

export const CONST_CODES = {
  AUTH: {
    VAL: 'AUTH',
    TXT: '멤버 권한',
    SUPER: {
      VAL: 'SUPER',
      TXT: '슈퍼관리자',
    },
    MASTER: {
      VAL: 'MASTER',
      TXT: '마스터',
    },
    MEMBER: {
      VAL: 'MEMBER',
      TXT: '멤버',
    },
    MEDIA: {
      VAL: 'MEDIA',
      TXT: '매체사',
    },
  },
  REFERER_TYPE: {
    VAL: 'REFERER_TYPE',
    TXT: 'DB 유입 경로',
    PAGE: {
      VAL: 'PAGE',
      TXT: '페이지',
    },
    API: {
      VAL: 'API',
      TXT: 'API',
    },
    EACH: {
      VAL: 'EACH',
      TXT: '개별등록',
    },
    BATCH: {
      VAL: 'BATCH',
      TXT: '일괄등록',
    },
  },
  BIN: {
    VAL: 'BIN',
    TXT: '휴지통 사유',
    PHONE: {
      VAL: 'PHONE',
      TXT: '연락처',
    },
    MEDIA: {
      VAL: 'MEDIA',
      TXT: '매체코드',
    },
    DUPLICATION: {
      VAL: 'DUPLICATION',
      TXT: '중복',
    },
    BLOCK: {
      VAL: 'BLOCK',
      TXT: '차단',
    },
    WORD: {
      VAL: 'WORD',
      TXT: '단어',
    },
    DELETE: {
      VAL: 'DELETE',
      TXT: '삭제',
    },
  },
  SEARCH: {
    VAL: 'SEARCH',
    TXT: '검색조건',
    ALL: {
      VAL: 'ALL',
      TXT: '전체',
    },
    NAME: {
      VAL: 'NAME',
      TXT: '이름',
    },
    PHONE: {
      VAL: 'PHONE',
      TXT: '연락처',
    },
    MEDIA: {
      VAL: 'MEDIA',
      TXT: '매체',
    },
    MEDIA_VAL: {
      VAL: 'MEDIA_CODE',
      TXT: '매체코드',
    },
    CLIENT_ID: {
      VAL: 'CLIENT_ID',
      TXT: '광고주ID',
    },
    CLIENT_NAME: {
      VAL: 'CLIENT_NAME',
      TXT: '광고주 이름',
    },
    CLIENT_DOMAIN: {
      VAL: 'CLIENT_DOMAIN',
      TXT: '도메인',
    },
    PAGE: {
      VAL: 'PAGE',
      TXT: '페이지명',
    },
    CODE: {
      VAL: 'CODE',
      TXT: '코드',
    },
    LAYOUT: {
      VAL: 'LAYOUT',
      TXT: '레이아웃',
    },
    SCRIPT: {
      VAL: 'SCRIPT',
      TXT: '전환 스크립트',
    },
    MOBILE_PAGE: {
      VAL: 'MOBILE_PAGE',
      TXT: '모바일 페이지명',
    },
    BACK_PAGE: {
      VAL: 'BACK_PAGE',
      TXT: '백 페이지명',
    },
    TEMPLATE: {
      VAL: 'TEMPLATE',
      TXT: '템플릿명'
    }
  },
  GENDER: {
    VAL: 'GENDER',
    TXT: '성별',
    MALE: {
      VAL: 'M',
      TXT: '남',
    },
    FEMALE: {
      VAL: 'F',
      TXT: '여',
    },
    ALL: {
      VAL: 'A',
      TXT: '남/여',
    },
  },
  DOWNLOAD: {
    VAL: 'DOWNLOAD',
    TXT: '다운로드 유형',
    DB: {
      VAL: 'DB',
      TXT: '고객DB',
    },
    BIN: {
      VAL: 'BIN',
      TXT: '휴지통',
    },
  },
  API_CONTENT: {
    VAL: 'API_CONTENT',
    TXT: 'Content-Type',
    JSON: {
      VAL: 'JSON',
      TXT: 'JSON',
    },
    FORM: {
      VAL: 'FORM',
      TXT: 'x-www-form-urlencoded​',
    },
  },
  API_METHOD: {
    VAL: 'API_METHOD',
    TXT: 'Method',
    POST: {
      VAL: 'POST',
      TXT: 'POST',
    },
    GET: {
      VAL: 'GET',
      TXT: 'GET',
    },
  },
  API_RESPONSE: {
    VAL: 'API_RESPONSE',
    TXT: 'Response Type',
    JSON: {
      VAL: 'JSON',
      TXT: 'JSON',
    },
    TEXT: {
      VAL: 'TEXT',
      TXT: 'Text',
    },
  },
  CLIENT_CATEGORY: {
    VAL: 'CLIENT_CATEGORY',
    TXT: '광고주 카테고리',
    MEDICAL: {
      VAL: 'MEDICAL',
      TXT: '건강/의료',
      FEMALE: {
        VAL: 'FEMALE',
        TXT: '건강보조식품(여성)',
      },
      MALE: {
        VAL: 'MALE',
        TXT: '건강보조식품(남성)',
      },
      ALL: {
        VAL: 'ALL',
        TXT: '건강보조식품(공용)',
      },
      CHILD: {
        VAL: 'CHILD',
        TXT: '건강보조식품(유아/청소년)',
      },
      DIET: {
        VAL: 'DIET',
        TXT: '다이이트식품',
      },
      HOSPITAL: {
        VAL: 'HOSPITAL',
        TXT: '병원/의원/의료기관',
      },
      DEVICE: {
        VAL: 'DEVICE',
        TXT: '의료기기',
      },
      INFO: {
        VAL: 'INFO',
        TXT: '건강정보/서비스',
      },
      ETC: {
        VAL: 'ETC',
        TXT: '기타',
      },
    },
    BEAUTY: {
      VAL: 'BEAUTY',
      TXT: '화장품/미용',
      CARE: {
        VAL: 'CARE',
        TXT: '미용케어/서비스',
      },
      COSMETIC: {
        VAL: 'COSMETIC',
        TXT: '화장품/미용기기',
      },
      ETC: {
        VAL: 'ETC',
        TXT: '기타',
      },
    },
    FOOD: {
      VAL: 'FOOD',
      TXT: '식품/음료',
      DIET: {
        VAL: 'DIET',
        TXT: '다이어트식품',
      },
      MALE: {
        VAL: 'MALE',
        TXT: '남성식품',
      },
      FEMALE: {
        VAL: 'FEMALE',
        TXT: '여성식품',
      },
      ALL: {
        VAL: 'ALL',
        TXT: '공용식품',
      },
      ETC: {
        VAL: 'ETC',
        TXT: '기타',
      },
    },
    HOME: {
      VAL: 'HOME',
      TXT: '전자/가전',
      APPLIANCE: {
        VAL: 'APPLIANCE',
        TXT: '주방/생활가전',
      },
      ETC: {
        VAL: 'ETC',
        TXT: '기타',
      },
    },
    FASHION: {
      VAL: 'FASHION',
      TXT: '의류/패션',
      CLOTH: {
        VAL: 'CLOTH',
        TXT: '의류/패션잡화',
      },
      LUXURY: {
        VAL: 'LUXURY',
        TXT: '명품브랜드',
      },
      SPORT: {
        VAL: 'SPORT',
        TXT: '스포츠/아웃도어',
      },
      ETC: {
        VAL: 'ETC',
        TXT: '기타',
      },
    },
    CAR: {
      VAL: 'CAR',
      TXT: '자동차/수송',
      RENT: {
        VAL: 'RENT',
        TXT: '렌터카/카쉐어링',
      },
      SERVICE: {
        VAL: 'SERVICE',
        TXT: '자동차용품/서비스',
      },
      ETC: {
        VAL: 'ETC',
        TXT: '기타',
      },
    },
    BUSINESS: {
      VAL: 'BUSINESS',
      TXT: '비즈니스/전문서비스',
      LAW: {
        VAL: 'LAW',
        TXT: '볍률서비스',
      },
      ETC: {
        VAL: 'ETC',
        TXT: '기타',
      },
    },
    EDUCATION: {
      VAL: 'EDUCATION',
      TXT: '교육/취업',
      CLASS: {
        VAL: 'CLASS',
        TXT: '강의/자격증/평생교육',
      },
      ETC: {
        VAL: 'ETC',
        TXT: '기타',
      },
    },
    FINANCE: {
      VAL: 'FINANCE',
      TXT: '금융',
      STOCK: {
        VAL: 'STOCK',
        TXT: '증권',
      },
      ETC: {
        VAL: 'ETC',
        TXT: '기타',
      },
    },
    ENTERTAIN: {
      VAL: 'ENTERTAIN',
      TXT: '엔터테인먼트',
      SHOW: {
        VAL: 'SHOW',
        TXT: '공연/전시',
      },
      ETC: {
        VAL: 'ETC',
        TXT: '기타',
      },
    },
  },
  CLIENT_ACCOUT_SERVICE: {
    VAL: 'CLIENT_ACCOUT_SERVICE',
    TXT: '광고주 서비스 구분',
    AD: {
      VAL: 'AD',
      TXT: 'AD',
    },
    TM: {
      VAL: 'TM',
      TXT: 'TM',
    },
  },
  CLIENT_ACCOUNT_STATUS: {
    VAL: 'CLIENT_ACCOUNT_STATUS',
    TXT: '서비스 계정 신청 상태',
    PENDING: {
      VAL: 'PENDING',
      TXT: '생성중',
    },
    LIVE: {
      VAL: 'LIVE',
      TXT: '운영',
    },
    END: {
      VAL: 'END',
      TXT: '중단',
    },
  },
  DB_INPUT_FIELD_TYPE: {
    VAL: 'DB_INPUT_FIELD_TYPE',
    TXT: '입력형식(Type)',
    TEXT: {
      VAL: 'TEXT',
      TXT: '텍스트(Text)',
    },
    HIDDEN: {
      VAL: 'HIDDEN',
      TXT: '숨김필드(Hidden)',
    },
    NUMBER: {
      VAL: 'NUMBER',
      TXT: '숫자(Number)',
    },
    RADIO: {
      VAL: 'RADIO',
      TXT: '단일선택(Radio)',
    },
    SELECT: {
      VAL: 'SELECT',
      TXT: '단일선택(Select)',
    },
    CHECK: {
      VAL: 'CHECK',
      TXT: '다중선택(Checkbox)',
    },
    TEXTAREA: {
      VAL: 'TEXTAREA',
      TXT: '다열문자입력(Textarea)',
    },
  },
  PAGE_SECTION_TYPE: {
    VAL: 'PAGE_SECTION_TYPE',
    TXT: '페이지 섹션 유형',
    IMAGE: {
      VAL: 'IMAGE',
      TXT: '이미지 섹션',
    },
    TEXT: {
      VAL: 'TEXT',
      TXT: '텍스트',
    },
    INPUT_FORM: {
      VAL: 'INPUT_FORM',
      TXT: '입력폼',
    },
    FIXED_BANNER: {
      VAL: 'FIXED_BANNER',
      TXT: '고정 배너',
    },
    ROLLING_BANNER: {
      VAL: 'ROLLING_BANNER',
      TXT: '롤링 배너',
    },
    ROLLING_LIST: {
      VAL: 'ROLLING_LIST',
      TXT: '리스트 롤링',
    },
    IMPORT: {
      VAL: 'IMPORT',
      TXT: '임포트',
    },
    COMMENT: {
      VAL: 'COMMENT',
      TXT: '댓글',
    },
    CODE: {
      VAL: 'CODE',
      TXT: '코드',
    },
  },
  LINK_TYPE: {
    VAL: 'LINK_TYPE',
    TXT: '링크 설정',
    NONE: {
      VAL: 'NONE',
      TXT: '링크 없음',
    },
    NEW_WINDOW: {
      VAL: 'NEW_WINDOW',
      TXT: '새 창에서 열기',
    },
    CURRENT_WINDOW: {
      VAL: 'CURRENT_WINDOW',
      TXT: '현재 창에서 열기',
    },
    MOVE_SECTION: {
      VAL: 'MOVE_SECTION',
      TXT: '섹션 이동',
    },
    LAYER_POPUP: {
      VAL: 'LAYER_POPUP',
      TXT: '레이어 모달 뛰우기',
    },
  },
  TRANSITION_TYPE: {
    VAL: 'TRANSITION_TYPE',
    TXT: '전환 효과',
    SLIDE: {
      VAL: 'SLIDE',
      TXT: '슬라이드',
    },
    FADE: {
      VAL: 'FADE',
      TXT: '페이드',
    },
  },
  COMMENT_TYPE: {
    VAL: 'COMMENT_TYPE',
    TXT: '댓글 디자인 테마',
    EMPATHY: {
      VAL: 'EMPATHY',
      TXT: '공감형',
    },
    LIKE: {
      VAL: 'LIKE',
      TXT: '좋아요형',
    },
    RATING: {
      VAL: 'RATING',
      TXT: '평점형',
    },
  },
  BANNER_POSITION: {
    VAL: 'BANNER_POSITION',
    TXT: '고정 배너 위치',
    LEFT_TOP: {
      VAL: 'LEFT_TOP',
      TXT: '좌상단',
    },
    TOP: {
      VAL: 'TOP',
      TXT: '상단',
    },
    RIGHT_TOP: {
      VAL: 'RIGHT_TOP',
      TXT: '우상단',
    },
    LEFT: {
      VAL: 'LEFT',
      TXT: '좌측',
    },
    CENTER: {
      VAL: 'CENTER',
      TXT: '중앙',
    },
    RIGHT: {
      VAL: 'RIGHT',
      TXT: '우측',
    },
    LEFT_BOTTOM: {
      VAL: 'LEFT_BOTTOM',
      TXT: '좌하단',
    },
    BOTTOM: {
      VAL: 'BOTTOM',
      TXT: '하단',
    },
    RIGHT_BOTTOM: {
      VAL: 'RIGHT_BOTTOM',
      TXT: '우하단',
    }
  },
  DB_SEND_STATUS: {
    VAL: 'DB_SEND_STATUS',
    TXT: '전송 상태',
    NONE: {
      VAL: 'NONE',
      TXT: '미전송',
    },
    SENDING: {
      VAL: 'SENDING',
      TXT: '전송중',
    },
    SUCCESS: {
      VAL: 'SUCCESS',
      TXT: '성공',
    },
    FAIL: {
      VAL: 'FAIL',
      TXT: '실패',
    },
  },
} as const;

export const {
  AUTH,
  CLIENT_CATEGORY,
  CLIENT_ACCOUT_SERVICE,
  CLIENT_ACCOUNT_STATUS,
} = CONST_CODES;