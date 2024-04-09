import type {
  getMediasMsg,
  getCodesMsg,
  getCodesCountMsg,
  getCodesCheckMsg,
  postCodesMsg,
  putCodesMsg,
  getCodesDbsCountMsg,
  deleteCodesMsg,
  getUtmsMsg,
  getUtmValuesMsg,
  getUtmValuesCountMsg,
  getUtmValuesCheckMsg,
  postUtmValuesMsg,
  putUtmValuesMsg,
  deleteUtmValuesMsg
} from '@/constants/api/mediaUtmCodeApi';
import type { ResponseDefault } from '.';
import type { JsonString, BooleanYN } from '../common';

// 매체 목록
export type GetMediasMsg = keyof typeof getMediasMsg;

export interface GetMediasParam {
  search?: string
  cursor?: string
  limit?: number
}

export interface GetMediasItem {
  mediaUid: string
  media: string
  regDatetime: number
  modDatetime: number
  mediaCodeCount: number
}

export interface GetMediasResult {
  totalCount: number
  medias: GetMediasItem[]
}

export interface GetMediasRes extends ResponseDefault<GetMediasMsg> {
  results: GetMediasResult
}

// 매체코드 목록/검색
export type GetCodesMsg = keyof typeof getCodesMsg;

export interface GetCodesParam {
  search?: string
  cursor?: number | string
  limit?: number
}

export interface GetCodesSearchItem {
  mediaCodeUid: string
  mediaUid: string
  mediaCode: string
  description: string
  images: JsonString
  regDatetime?: number
  modDatetime?: number
}

export interface GetCodesResult {
  mediaCodes: GetCodesSearchItem[]
  totalCount: number
}

export interface GetCodesRes extends ResponseDefault<GetCodesMsg> {
  results: GetCodesResult
}

// 매체코드 중복/유효성 검사
export type GetCodesCountMsg = keyof typeof getCodesCountMsg;

export interface GetCodesCountParam {
  mediaCode: string
}

export interface GetCodesCountResult {
  isExist: BooleanYN
  invalidMediaCode: BooleanYN
}

export interface GetCodesCountRes extends ResponseDefault<GetCodesCountMsg> {
  results: GetCodesCountResult
}

// 매체코드 유효성 검사
export type GetCodesCheckMsg = keyof typeof getCodesCheckMsg;

export interface GetCodesCheckParam {
  mediaCode: string
}

export interface GetCodesCheckResult {
  result: BooleanYN
}

export interface GetCodesCheckRes extends ResponseDefault<GetCodesCheckMsg> {
  results: GetCodesCheckResult
}

// 매체 코드 등록
export type PostCodesMsg = keyof typeof postCodesMsg;

export interface PostCodesParam {
  mediaUid: string
  mediaCode: string
  mediaCodeUid: string
  description?: string
  images?: string
}

export interface PostCodesRes extends ResponseDefault<PostCodesMsg> {}

// 매체 코드 수정
export type PutCodesMsg = keyof typeof putCodesMsg;

export interface PutCodesParam {
  description?: string
  images?: string
}

export interface PutCodesRes extends ResponseDefault<PutCodesMsg> {}

// 매체 코드 DB 연결 체크
export type GetCodesDbsCountMsg = keyof typeof getCodesDbsCountMsg;

export interface GetCodesDbsCountResult {
  isExist: BooleanYN
}

export interface GetCodesDbsCountRes extends ResponseDefault<GetCodesDbsCountMsg> {
  results: GetCodesDbsCountResult
}

// 매체 코드 삭제
export type DeleteCodesMsg = keyof typeof deleteCodesMsg;

export interface DeleteCodesRes extends ResponseDefault<DeleteCodesMsg> {}

// utm 파리미터 목록
export type GetUtmsMsg = keyof typeof getUtmsMsg;

export interface GetUtmsItem {
  utmParamUid: string
  utmParam: string
  regDatetime: number
  modDatetime: number
  utmParamValueCount: number
}

export interface GetUtmsResult {
  totalCount: number
  utmParams: GetUtmsItem[]
}

export interface GetUtmsRes extends ResponseDefault<GetUtmsMsg> {
  results: GetUtmsResult
}

// utm 파라미터 값 목록/검색
export type GetUtmValuesMsg = keyof typeof getUtmValuesMsg;

export interface GetUtmValuesParam {
  search?: string
  cursor?: number | string
  limit?: number
}

export interface GetUtmValuesItem {
  utmParamValueUid: string
  utmParamUid: string
  utmParamValue: string
  description: string
  regDatetime?: number
  modDatetime?: number
}

export interface GetUtmValuesResult {
  utmParamValues: GetUtmValuesItem[]
}

export interface GetUtmValuesRes extends ResponseDefault<GetUtmValuesMsg> {
  results: GetUtmValuesResult
}

// utm 파라미터 값 중복/유효성 검사
export type GetUtmValuesCountMsg = keyof typeof getUtmValuesCountMsg;

export interface GetUtmValuesCountParam {
  utmParamValue: string
}

export interface GetUtmValuesCountResult {
  isExist: BooleanYN
  invalidValue: BooleanYN
}

export interface GetUtmValuesCountRes extends ResponseDefault<GetUtmValuesCountMsg> {
  results: GetUtmValuesCountResult
}

// utm 파라미터값 유효성 검사
export type GetUtmValuesCheckMsg = keyof typeof getUtmValuesCheckMsg;

export interface GetUtmValuesCheckParam {
  utmParamValue: string
}

export interface GetUtmValuesCheckResult {
  result: BooleanYN
}

export interface GetUtmValuesCheckRes extends ResponseDefault<GetUtmValuesCheckMsg> {
  results: GetUtmValuesCheckResult
}

// utm 파라미터 값 등록
export type PostUtmValuesMsg = keyof typeof postUtmValuesMsg;

export interface PostUtmValuesParam {
  utmParamValueUid: string
  utmParamUid: string
  utmParamValue: string
  description?: string
}

export interface PostUtmValuesRes extends ResponseDefault<PostUtmValuesMsg> {}

// utm 파라미터값 수정
export type PutUtmValuesMsg = keyof typeof putUtmValuesMsg;

export interface PutUtmValuesParam {
  description?: string
}

export interface PutUtmValuesRes extends ResponseDefault<PutUtmValuesMsg> {}

// utm 파라미터 값 삭제
export type DeleteUtmValuesMsg = keyof typeof deleteUtmValuesMsg;

export interface DeleteUtmValuesRes extends ResponseDefault<DeleteUtmValuesMsg> {}
