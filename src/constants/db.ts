// 회원레벨
export const LEVLEL_NUMBER = {
  SUPER: 10,
  MASTER: 20,
  MEMBER: 30,
  MEDIA: 40
} as const;


// 입력항목 인증번 호 제외 field name
export const INPUT_FIELDS_NAME = {
  name: 'name',
  phone: 'phone',
  age: 'age',
  gender: 'gender',
  etcComment: 'etcComment',
  input1: 'input1',
  input2: 'input2',
  input3: 'input3',
  input4: 'input4',
  input5: 'input5',
  input6: 'input6',
  input7: 'input7',
  input8: 'input8',
  input9: 'input9',
  input10: 'input10',
  input11: 'input11',
  input12: 'input12',
  input13: 'input13',
  input14: 'input14',
  input15: 'input15',
  input16: 'input16',
  input17: 'input17',
  input18: 'input18',
  input19: 'input19',
  input20: 'input20',
  privacyYn: 'privacyYn',
  thirdPartyYn: 'thirdPartyYn',
  smsYn: 'smsYn',
  regDatetime: 'regDatetime'
} as const;

// 입력항목 전체 field name
export const ALL_INPUT_FIELDS_NAME = {
  cert: 'cert',
 ...INPUT_FIELDS_NAME,
} as const;

// 약관 동의 항목 TIME field name
export const INPUT_FIELDS_AGREE_TIME_NAME = {
  privacyYnDatetime: 'privacyYnDatetime',
  thirdPartyYnDatetime: 'thirdPartyYnDatetime',
  smsYnDatetime: 'smsYnDatetime'
} as const;

// 약관 동의 항목 field name
export const INPUT_FIELDS_AGREE_NAME = ['privacyYn', 'thirdPartyYn', 'smsYn'];

// 입력항목중 options 값이 내려오는 type
export const INPUT_FIELDS_OPT = ['CHECK', 'SELECT', 'RADIO'];

// input fields config api 관련
export const INPUT_FIELDS_CONFIG = {
  script: 'script',
  batchDbs: 'batchDbs',
  api: 'api',
  inputFieldConfig: 'inputFieldConfig',
  inputField: 'inputField',
} as const;
