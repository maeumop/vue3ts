import type { modalPosition, modalTransition } from './const';

export type ModalPosition = typeof modalPosition[keyof typeof modalPosition];

export type ModalTransition = typeof modalTransition[keyof typeof modalTransition];

export interface ModalModel {
  close(callback?: Function): void
}