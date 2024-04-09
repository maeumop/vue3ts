import type { KeyIndex } from '../types';
import type { listTableCellAlign, listTableCheckboxIcon, listTableRadioIcon, footerItemTag } from './const';

export type ListTableCellAlign = typeof listTableCellAlign[keyof typeof listTableCellAlign];

export type ListTableFooterItemTag = typeof footerItemTag[keyof typeof footerItemTag];


// 목록 최상단 라벨링 Array:[{text: String, width: Number, sort: Boolean, target: String(sort target)}] *
export interface ListTableHeader {
  text: string
  width?: number | string
  align?: ListTableCellAlign
  sort?: boolean
  target?: string
  order?: string
  colspan?: number
  rowspan?: number
}

// 테이블 목록 Array:[] *
export interface ListTableItem extends KeyIndex<any> {}

export interface ListTableFooter {
  colspan?: number
  align?: ListTableCellAlign
  tag?: ListTableFooterItemTag
  text: any
}

export interface SortingChangeData {
  data: ListTableItem[]
  target: string
  order: string
}

export interface ListTableItemSlot<T> {
  props: T
  index: number
}

export type ListTableCheckboxIcon = typeof listTableCheckboxIcon[keyof typeof listTableCheckboxIcon];

export type ListTableRadioIcon = typeof listTableRadioIcon[keyof typeof listTableRadioIcon];

export interface ListTableModel {
  observerStart: () => void
  observerStop: () => void
  checkedToggle: (bool?: boolean) => void
}