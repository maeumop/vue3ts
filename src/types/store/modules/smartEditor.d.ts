import type {
  GetPagesRes,
  GetLayoutsRes,
  GetScriptsRes,
  GetInputConfigRes,
  GetRollingBannerGrpsRes,
  GetRollingListGrpsRes,
  GetImportsRes,
  GetCommentGrpsRes,
} from '@/types/api/smartEditorApi';
import type { GetTemplatesRes } from '@/types/api/myAppApi';

export type OptionsRes = GetPagesRes | GetLayoutsRes | GetScriptsRes | GetInputConfigRes |
  GetRollingBannerGrpsRes | GetRollingListGrpsRes | GetImportsRes | GetCommentGrpsRes | GetTemplatesRes;