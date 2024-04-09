import { responseDefault } from '.';

export const getMediasMsg = {
  MEDIA_LIST_GET_SUCCESS: 'MEDIA_LIST_GET_SUCCESS',
  ...responseDefault
} as const;

export const getCodesMsg = {
  MEDIA_CODE_GET_SUCCESS: 'MEDIA_CODE_GET_SUCCESS',
  ...responseDefault
} as const;

export const getCodesCountMsg = {
  MEDIA_CODE_COUNT_SUCCESS: 'MEDIA_CODE_COUNT_SUCCESS',
  ...responseDefault,
} as const;

export const getCodesCheckMsg = {
  MEDIA_CODE_CHECK_SUCCESS: 'MEDIA_CODE_CHECK_SUCCESS',
  ...responseDefault
} as const;

export const postCodesMsg = {
  MEDIA_CODE_INSERT_SUCCESS: 'MEDIA_CODE_INSERT_SUCCESS',
  MEDIA_CODE_ALREADY_EXIST: 'MEDIA_CODE_ALREADY_EXIST',
  ...responseDefault,
} as const;

export const putCodesMsg = {
  MEDIA_CODE_UPDATE_SUCCESS: 'MEDIA_CODE_UPDATE_SUCCESS',
  ...responseDefault
} as const;

export const getCodesDbsCountMsg = {
  MEDIA_CODE_DB_CHECK_SUCCESS: 'MEDIA_CODE_DB_CHECK_SUCCESS',
  ...responseDefault,
} as const;

export const deleteCodesMsg = {
  MEDIA_CODE_DELETE_SUCCESS: 'MEDIA_CODE_DELETE_SUCCESS',
  MEDIA_CODE_USED: 'MEDIA_CODE_USED',
  ...responseDefault,
} as const;

export const getUtmsMsg = {
  UTM_LIST_GET_SUCCESS: 'UTM_LIST_GET_SUCCESS',
  ...responseDefault,
} as const;

export const getUtmValuesMsg = {
  UTM_VALUES_SEARCH_SUCCESS: 'UTM_VALUES_SEARCH_SUCCESS',
  ...responseDefault,
} as const;

export const getUtmValuesCountMsg = {
  UTM_VALUES_COUNT_SUCCESS: 'UTM_VALUES_COUNT_SUCCESS',
  ...responseDefault,
} as const;

export const getUtmValuesCheckMsg = {
  UTM_VALUES_CHECK_SUCCESS: 'UTM_VALUES_CHECK_SUCCESS',
  ...responseDefault,
} as const;

export const postUtmValuesMsg = {
  UTM_VALUES_INSERT_SUCCESS: 'UTM_VALUES_INSERT_SUCCESS',
  UTM_VALUE_ALREADY_EXIST: 'UTM_VALUE_ALREADY_EXIST',
  ...responseDefault,
} as const;

export const putUtmValuesMsg = {
  UTM_VALUE_UPDATE_SUCCESS: 'UTM_VALUE_UPDATE_SUCCESS',
  ...responseDefault,
} as const;

export const deleteUtmValuesMsg = {
  UTM_VALUE_DELETE_SUCCESS: 'UTM_VALUE_DELETE_SUCCESS',
  ...responseDefault,
} as const;
