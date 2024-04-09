export interface SelectBoxItem {
  text: string
  value: string
}

export interface SelectBoxModel {
  check(silence?: boolean): void
  resetForm(): void
  resetValidate(): void
}