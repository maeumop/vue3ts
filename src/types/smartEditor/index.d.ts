import type { RollingBannerGrpItem, RollingListGrpItem, CommentGrpItem, ImportItem, GetInputFormItem } from '@/types/api/smartEditorApi';

// 컴포넌트들의 공통으로 접목시킬 interface
export type SmartComponent =  GetInputFormItem | RollingBannerGrpItem | CommentGrpItem  | RollingListGrpItem | ImportItem;
