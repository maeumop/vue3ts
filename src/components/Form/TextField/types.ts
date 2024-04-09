import type { textFieldType } from './const';

export type TextFieldType = typeof textFieldType[keyof typeof textFieldType];
