import type { KeyIndex } from '../types';

import {
  mdiCheckboxBlank,
  mdiCheckboxMarked,
  mdiCheckboxBlankOutline,
  mdiRadioboxMarked,
  mdiCircle,
  mdiRadioboxBlank,
} from '@/assets/svg/path';

export const listTableCellAlign = {
  left: 'left',
  center: 'center',
  right: 'right',
} as const;

export const footerItemTag = {
  td: 'td',
  th: 'th'
} as const;

export const listTableCheckboxIcon: KeyIndex<string> = {
  disabled: mdiCheckboxBlank,
  checked: mdiCheckboxMarked,
  blank: mdiCheckboxBlankOutline,
} as const;

export const listTableRadioIcon: KeyIndex<string> = {
  disabled: mdiCircle,
  checked: mdiRadioboxMarked,
  blank: mdiRadioboxBlank,
} as const;