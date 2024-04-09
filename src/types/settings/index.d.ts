import type { BooleanYN, ConstAuthKeys } from '@/types/common';
import { MemberListTableItem } from '@/types/settings';
import type { ListTableItem } from '@/components/ListTable/types';

export type EditAuthKeys = Exclude<ConstAuthKeys, 'SUPER'>;

export interface MemberListTableItem {
  clientAccountMemberRelUid: string
  memberUid?: string
  mediaUids?: string[]
  authLevel: EditAuthKeys

  isJoin: BooleanYN

  inviteDatetime: number
  joinDatetime?: number

  memberEmail: string
  memberName?: string
  memberPhone?: string

  regDatetime: number
  modDatetime: number
}

export interface PropsTemplateItem {
  title?: string
  headers?: TemplateListTableHeader[]
  items: ListTableItem[]
}

export interface TemplateListTableHeader {
  key?: string
  text?: string
  width?: number | string
}

export interface TemplateItem {
  title: string
  headers: TemplateListTableHeader[]
  items?: ListTableItem[]
}

export interface Template {
  default: TemplateItem
  header: TemplateItem
  parameta?: TemplateItem
  response?: TemplateItem
}
