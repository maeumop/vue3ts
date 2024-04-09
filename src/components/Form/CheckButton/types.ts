import type { checkButtonColors, checkButtonType } from './const';

export type CheckButtonColors = typeof checkButtonColors[keyof typeof checkButtonColors];

export type CheckButtonType = typeof checkButtonType[keyof typeof checkButtonType];

export interface CheckButtonItem {
  text: string
  value: string
}

export interface CheckButtonModel {
  check(silence?: boolean): void
  resetForm(): void
  resetValidate(): void
}