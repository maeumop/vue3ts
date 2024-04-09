/**
 * 상수와 함게 사용되는 함수
 */
import type { OptionItem } from '@/components/types';
import { CONST_CODES } from '@/constants/common';
import type { ConstCodesKeys, ConstClientCategoryKeys, CodeItem, CodeItemType, CategoryCodeItemType } from '@/types/common';

export const getConstCodeOptions = (codeKey: ConstCodesKeys): OptionItem[] => {
  const options: OptionItem[] = [];
  const codes: any = CONST_CODES[codeKey];

  for (const key in codes) {
    if (key !== 'TXT' && key !== 'VAL') {
      options.push({
        text: codes[key].TXT,
        value: codes[key].VAL,
      });
    }
  }

  return options;
};

export const getConstCodeCategoryOptions = (codeKey: ConstClientCategoryKeys): OptionItem[] => {
  const options: OptionItem[] = [];
  const codes: any = CONST_CODES.CLIENT_CATEGORY[codeKey];

  for (const key in codes) {
    if (key !== 'TXT' && key !== 'VAL') {
      options.push({
        text: codes[key].TXT,
        value: codes[key].VAL,
      });
    }
  }

  return options;
};

class CategoryNode implements CodeItem {
  VAL: string;
  TXT: string;
  parent: CategoryNode | null;
  children?: CategoryNode[];

  constructor(params: CodeItem) {
    this.VAL = params.VAL;
    this.TXT = params.TXT;
    this.parent = null;
  }

  getParent = (): CategoryNode | null => this.parent;

  addItem = (value: CodeItemType): CategoryNode => {
    if (!Array.isArray(this.children)) {
      this.children = [];
    }
    const child: CategoryNode = new CategoryNode(value);

    child.parent = this.parent;
    this.parent?.children?.push(child);

    return this;
  };

  addChild = (value: CodeItemType): CategoryNode => {
    if (!Array.isArray(this.children)) {
      this.children = [];
    }

    const child: CategoryNode = new CategoryNode(value);

    child.parent = this;
    this.children.push(child);

    return child;
  };

  toPlainObj = (): CategoryCodeItemType => {
    const { TXT, VAL, children = [] } = this;

    const codes: CategoryCodeItemType[] = [];
    children.forEach((item: CategoryNode) => {
      codes.push({ ...item.toPlainObj() } as const);
    });

    return Object.assign({ TXT, VAL, codes });
  };
}

/**
 * vue v-for에서 사용할 카테고리 접근
 * 사용 할 곳만 함수로 부르기
 * @param codeKey
 */
export const useConstCodeCategory = (codeKey: ConstCodesKeys = 'CLIENT_CATEGORY') => {
  const rootCode: any = CONST_CODES[codeKey];

  const { TXT, VAL } = rootCode;
  // CATEGORY ROOT Node
  const rootNode = new CategoryNode({ TXT, VAL });

  // CATEGORY 하위 노드 등록 재귀함수
  const _CreateClientCategoryNode = (node: CategoryNode, codes: any): void => {
    for (const key in codes) {
      if ([ 'VAL', 'TXT' ].includes(key)) {
        continue;
      }

      const code = codes[key];
      const { TXT, VAL } = code;

      const child: CategoryNode = node.addChild({ TXT, VAL });
      if (Object.keys(code).length > 2) {
        _CreateClientCategoryNode(child, code);
      }
    }
  };

  // _CreateClientCategoryNode 실행
  _CreateClientCategoryNode(rootNode, rootCode);

  return { ...rootNode.toPlainObj() } as const;
};