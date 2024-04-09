export interface ContextMenuOption {
  icon?: string;
  event: string;
  callback: () => void;
}