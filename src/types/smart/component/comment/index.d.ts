import type { CombineItem } from '@/types/smart/component';
import type { ConstCommentTypeKeys } from '@/types/common';

export interface CommentEditFormItem extends CombineItem {
  compCommentUid?: string
  // 이미지
  imagePath?: string

  // 아이디,닉네임 정보
  author?: string
  // 날자 입력
  commentTime?: string

  // 좋아요&공감 수
  likeCount: string
  // 싫어요&반대 수
  dislikeCount: string
  // 평점
  rating?: string

  // 댓글 내용
  commentText: string
}

export interface CommentGrpEditForm {
  // 댓글 그룹 그룹명
  commentGrpName: string
  // 레이아웃 uid
  layoutUid: string

  /* 아래 프로퍼티는 모달에서 받을 속성 값입니다. */
  // 디자인 테마 선택
  commentType: ConstCommentTypeKeys
  // 댓글 사이즈
  sizeX: string
  sizeY?: string
  // 더보기 버튼
  isUseMoreBtn: boolean
  // 출력 댓글 개수
  commentCount: string
}