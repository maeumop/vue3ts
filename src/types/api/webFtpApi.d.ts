import type {
  getFtpMsg,
  getFtpCheckMsg,
  postFtpNameMsg,
  putFtpNameMsg,
  postFtpUploadMsg,
  getFtpReloadMsg,
  deleteFtpMsg,
getS3uploadUrlMsg,
postFtpSendMsg
} from '@/constants/api/webFtpApi';
import type { ResponseDefault } from '.';
import type { CONTENT_TYPE_TYPE } from '@/types/store/modules/ftp';

// 목록 가져오기
export type GetFtpMsg = keyof typeof getFtpMsg;

export interface GetFtpPathParam {
  path: string
}

export interface GetFtpItem {
  'last-modified': string
  name: string
  size: number
  type: CONTENT_TYPE_TYPE
}

export interface GetFtpRes extends ResponseDefault<GetFtpMsg> {
  results: GetFtpItem[]
}

// 파일, 폴더 중복 검사
export type GetFtpCheckMsg = keyof typeof getFtpCheckMsg;

export interface GetFtpCheckResult {
  isExist: BooleanYN
}

export interface GetFtpCheckRes extends ResponseDefault<GetFtpCheckMsg> {
  results: GetFtpCheckResult
}

// 폴더 생성
export type PostFtpNameMsg = keyof typeof postFtpNameMsg;
export interface PostFtpNameParam extends GetFtpPathParam {}
export interface PostFtpNameRes extends ResponseDefault<PostFtpNameMsg> {}

// 파일, 폴더 이름변경
export type PutFtpNameMsg = keyof typeof putFtpNameMsg;

export interface PutFtpNameParam extends GetFtpPathParam {
  rename?: string
}

export interface PutFtpNameRes extends ResponseDefault<PutFtpNameMsg> {}

// 파일 업로드
export type PostFtpUploadMsg = keyof typeof postFtpUploadMsg;

export interface PostFtpUploadParam extends GetFtpPathParam {
  file: File
}

export interface PostFtpUploadRes extends ResponseDefault<PostFtpUploadMsg> {}

// ftp 새로고침
export type GetFtpReloadMsg = keyof typeof getFtpReloadMsg;

export interface GetFtpReloadRes extends ResponseDefault<GetFtpReloadMsg> {
  results: GetFtpItem[]
}

// 항목 삭제
export type DeleteFtpMsg = keyof typeof deleteFtpMsg;

export interface DeleteFtpParam {
  path: string
}

export interface DeleteFtpRes extends ResponseDefault<DeleteFtpMsg> {}


// 업로드를 위한 URL 요청
export type GetS3uploadUrlMsg = keyof typeof getS3uploadUrlMsg;

export interface GetS3uploadUrlParam {
  path: string
  fileName: string
}

export interface GetS3uploadUrlFields {
  bucket: string
  'X-Amz-Algorithm': string
  'X-Amz-Credential': string
  'X-Amz-Date': string
  'X-Amz-Security-Token': string
  'key': string
  'Policy': string
  'X-Amz-Signature': string
}

export interface GetS3uploadUrlResult {
  url: string
  fields: GetS3uploadUrlFields
}

export interface GetS3uploadUrlRes extends ResponseDefault<GetS3uploadUrlMsg> {
  results: GetS3uploadUrlResult
}

// 파일 업로드 -S3 업로드
export type PostFtpSendMsg = keyof typeof postFtpSendMsg;

export interface PostFtpSendParam extends PostFtpSendResult {
  file: File
}

export interface PostFtpSendRes extends ResponseDefault<PostFtpSendMsg> {
  results: never
}
