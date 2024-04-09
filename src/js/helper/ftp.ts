import type { ActionContentOption, CustomSvgIconType } from '@/types/common/ftp/layer/MultipleActionList';
import type { TreeViewItemOption, TreeViewOption } from '@/types/store/modules/treeView';
import {
  mdiAlertCircle,
  mdiCheckCircle,
  mdiCodeNotEqualVariant,
  mdiFolder,
  mdiImage,
  mdiRadioboxBlank,
  mdiTextBox,
} from '@/assets/svg/path';
import { onMounted, onUnmounted } from 'vue';

/***********************************************************************************************************************************************/

/* RegExp                                                                                                                                      */
export const extensionRegExp: RegExp = /\.{1}([a-zA-Z]{2,})$/;
export const contentTitleRegExp: RegExp = /^[0-9a-zA-Z\_\-]{1,20}$/;
export const imageRegExp: RegExp = /\.{1}([jpg|jpeg|png|gif]{3,})$/;
export const codeRegExp: RegExp = /\.{1}([js|css]{2,})$/;
/***********************************************************************************************************************************************/

/***********************************************************************************************************************************************/
/* method                                                                                                                                      */

/**
 * 파일 확장자 추출
 * @author hjs0609
 * @param {string} str 파일명 + 확장자
 * @param {number} index 0: (.+확장자), 1: 확장자
 * @returns
 */
export const getExtension = (str: string, index: number = 0): string => {
  const arr: RegExpExecArray = extensionRegExp.exec(str) || {} as RegExpExecArray;
  return arr.length > 0 ? arr[index] : '';
};

/**
 * 이미지 여부
 * @author hjs0609
 * @param {string} str 파일명 + 확장자
 * @returns
 */
export const isImage = (str: string): boolean => {
  const arr: RegExpExecArray = imageRegExp.exec(`${str.toLocaleLowerCase()}`) || {} as RegExpExecArray;
  return arr.length > 0;
};

/**
 * 코드 파일 여부
 * @author hjs0609
 * @param {string} str 파일명 + 확장자
 * @returns
 */
export const isCode = (str: string): boolean => {
  const arr: RegExpExecArray = codeRegExp.exec(`${str.toLocaleLowerCase()}`) || {} as RegExpExecArray;
  return arr.length > 0;
};

/**
 * 기본은 특정조건 확장자 반환
 * @author hjs0609
 * @param {boolean} image 이미지
 * @param {boolean} code 코드
 * @param {boolean} file 기타 파일
 * @returns input[type=file]에 등록할 accepts 목록 반환
 */
export const getInpuFileAccepts = (
  image: boolean = true,
  code: boolean = true,
  file: boolean = false,
): string[] => {
  const result: string[] = [];
  if (image) {
    result.splice(result.length, 0, ...[ '.jpg', '.jpeg', '.png', '.gif' ]);
  }

  if (code) {
    result.splice(result.length, 0, ...[ '.js', '.css' ]);
  }

  if (file) {
    result.splice(result.length, 0, ...[ '.pdf' ]);
  }

  return result;
};

export const useResize = (onResize: Function) => {
  let resizeTimer: ReturnType<typeof globalThis.setTimeout>;

  /**
   * 0.1초마다 리사이즈이벤트 리스너
   * @author hjs0616
   * @returns
   */
  const _resizeEvnt = () => {
    if (resizeTimer) {
      globalThis.clearTimeout(resizeTimer);
    }

    resizeTimer = globalThis.setTimeout(async () => {
      globalThis.clearTimeout(resizeTimer);
      await onResize();
    }, 15);
  };

  onMounted(() => {
    onResize();
    window.addEventListener('resize', _resizeEvnt);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', _resizeEvnt);
  });

  return {
    onResize
  };
};


/***********************************************************************************************************************************************/

const contentIconInit: CustomSvgIconType = {
  path: mdiFolder,
} as const;

const statusIconInit: CustomSvgIconType = {
  path: mdiRadioboxBlank,
} as const;

export class ActionItemClass {
  _title: string = '';
  timer: ReturnType<typeof globalThis.setInterval> | null = null;
  progress: number = 0;
  _statusCode: number = -1;
  _errorMessage?: string;
  _contentIcon: CustomSvgIconType = { ...contentIconInit };
  _statusIcon: CustomSvgIconType = { ...statusIconInit };
  _file: File | null = null;

  constructor(parms: ActionContentOption) {
    const { name } = parms;
    if ('file' in parms && parms.file) {
      this._file = parms.file;
    }

    this.title = name;
  }


  get statusCode(): number {
    return this._statusCode;
  }
  get errorMessage(): string {
    return this._errorMessage || '';
  }
  get contentIcon(): CustomSvgIconType {
    return this._contentIcon;
  }
  get statusIcon(): CustomSvgIconType {
    return this._statusIcon;
  }
  get file(): File | null {
    return this._file;
  }

  get title(): string {
    return this._title;
  }

  /**
   * 파일이름 set함수 진행시 확장자, 아이콘을 설정합니다
   * @author hjs0609
   * @public
   * @param {string} value 파일 이름
   * @returns
   */
  set title(title: string) {
    this._title = title;

    if (!getExtension(title)) {
      this._contentIcon = { ...contentIconInit };
    } else if (isImage(title)) {
      this._contentIcon = { ...contentIconInit, path: mdiImage };
    } else if (isCode(title)) {
      this._contentIcon = { ...contentIconInit, path: mdiCodeNotEqualVariant };
    } else {
      this._contentIcon = { ...contentIconInit, path: mdiTextBox };
    }
  }


  /**
   *
   * @author hjs0609
   * @public
   * @param {number} code  업로드 상태값 ( 기준을 httpStatus 기준으로 잡고 있습니다. 200: 성공, 400,500: 실패)
   * @param {string} message 업로드 오류시 노출 할 메세지
   * @throws 이미 요청 완료된 코드는 수정이 불가합니다.
   * @returns
   */
  setResult = (code: number, message: string = ''): void => {
    if (this.statusCode >= 0) {
      throw new Error('이미 요청 완료된 파일입니다.');
    }

    this._statusCode = code;
    switch (code) {
      case -1:
        this._statusIcon = { ...statusIconInit };
        break;
      case 200:
        this._statusIcon = { ...statusIconInit, path: mdiCheckCircle, color: 'green' };
        break;
      default:
        this._statusIcon = { ...statusIconInit, path: mdiAlertCircle, color: 'red' };
        this._errorMessage = message;
        break;
    }
  };

  /**
   * progress 수치를 퍼센테이지 게산 반환 0~100 사이로만 표출이 됩니다
   * @author hjs0609
   * @public
   * @returns
   */
  getProgressPercent = (): number => {
    if (!this.progress) {
      return 0;
    }

    return this.progress < 100 ? Math.floor(this.progress) : 100;
  };
}

export class TreeViewOptionClass implements TreeViewOption {
  title: string = '';

  constructor(arg: TreeViewOption) {
    const { title = '' } = arg;
    Object.assign(this, { title });
  }
}

export class TreeViewItemClass implements TreeViewItemOption {
  title: string = '';
  opend: boolean = false;
  active: boolean = false;
  depth: number = 1;
  parent?: TreeViewItemClass;
  children?: TreeViewItemClass[];

  constructor(arg: TreeViewOption, depth?: number) {
    const { title = '' } = arg;
    Object.assign(this, { title });
    if (depth) {
      this.depth = depth;
    }
  }
}

// private functions
/**
 * state.list의 객체에 등록할 객체의 자식객체가 있으면 재귀함수를 이용하여 부모객체와 자식객체를 연결한 게층형 Array 반환
 *
 * @private
 * @param {Array<TreeViewOption>} children 등록할 객체
 * @param {TreeViewItemClass} parent? 부모 객체 ( ex: 1depth는 부모가 없으므로 undefined )
 *
 * @returns { Array<TreeViewItemClass> } 부모와 자식간의 계층구조 Array 반환
 *
 * @author hjs0601
 */
export const _addItems = (
  children: TreeViewOption[],
  parent?: TreeViewItemClass,
): TreeViewItemClass[] => {
  const arr: TreeViewItemClass[] = [];
  children.forEach((item: TreeViewOption) => {
    let depth = 1;
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      depth = parent.depth + 1;
    }
    const ltem = new TreeViewItemClass(item, depth);
    if (parent) {
      ltem.parent = parent;
    }
    arr.splice(arr.length, 0, ltem);

    if (item.children) {
      const result = _addItems(item.children, ltem);
      if (ltem) {
        ltem.children = result;
      }
    }
  });

  return arr;
};