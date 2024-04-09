import { responseDefault } from '.';

export const getAligoApiMsg = {
  ALIGOAPI_GET_SUCCESS: 'ALIGOAPI_GET_SUCCESS',
  ...responseDefault
} as const;

export const postAligoApiMsg = {
  ALIGOAPI_INSERT_SUCCESS: 'ALIGOAPI_INSERT_SUCCESS',
  ...responseDefault
} as const;

export const postAligoCodeMsg = {
  ALIGO_CODE_SEND_SUCCESS: 'ALIGO_CODE_SEND_SUCCESS',
  ALIGO_MESSAGE_SEND_FAIL: 'ALIGO_MESSAGE_SEND_FAIL',
  ...responseDefault
} as const;

export const postAligoCodeCheckMsg = {
  ALIGO_CODE_CHECK_SUCCESS: 'ALIGO_CODE_CHECK_SUCCESS',
  INVALID_VERIFYCODE: 'INVALID_VERIFYCODE',
  VERIFYCODE_EXPIRE: 'VERIFYCODE_EXPIRE',
  ...responseDefault
} as const;

export const getDomainsMsg = {
  DOMAIN_LIST_GET_SUCCESS: 'DOMAIN_LIST_GET_SUCCESS',
  ...responseDefault
} as const;

export const patchDomainsMsg = {
  MAIN_DOMAIN_UPDATE_SUCCESS: 'MAIN_DOMAIN_UPDATE_SUCCESS',
  IS_NOT_CONNECT: 'IS_NOT_CONNECT',
  ...responseDefault
} as const;

export const getDomainsSearchMsg = {
  DOMAIN_SEARCH_SUCCESS: 'DOMAIN_SEARCH_SUCCESS',
  ...responseDefault
} as const;

export const postDomainsMsg = {
  DOMAIN_INSERT_SUCCESS: 'DOMAIN_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  MEMBER_EMAIL_NOT_FOUND: 'MEMBER_EMAIL_NOT_FOUND',
  CLIENTACCOUNT_NOT_FOUND: 'CLIENTACCOUNT_NOT_FOUND',
  ...responseDefault
} as const;

export const getTemplatesMsg = {
  TEMPLATES_GET_SUCCESS: 'TEMPLATES_GET_SUCCESS',
  ...responseDefault
} as const;

export const postTemplatesMsg = {
  TEMPLATE_INSERT_SUCCESS: 'TEMPLATE_INSERT_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  ...responseDefault
} as const;

export const putTemplatesMsg = {
  TEMPLATE_UPDATE_SUCCESS: 'TEMPLATE_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const postCopyTemplatesMsg = {
  TEMPLATE_COPY_SUCCESS: 'TEMPLATE_COPY_SUCCESS',
  BAD_REQUEST_UUID: 'BAD_REQUEST_UUID',
  NOT_ACCEPTABLE_UID: 'NOT_ACCEPTABLE_UID',
  ...responseDefault
} as const;

export const deleteTemplatesMsg = {
  TEMPLATE_DELETE_SUCCESS: 'TEMPLATE_DELETE_SUCCESS',
  ...responseDefault
} as const;
