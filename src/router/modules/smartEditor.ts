import { CONST_CODES, previewComponent } from '@/constants/common';
import type { CodeItemType, PreviewComponent } from '@/types/common';

import type { RouteRecordRaw } from 'vue-router';
import type { SMART_COMP_KEYS } from '@/types/smart/component';

const { AUTH } = CONST_CODES;

export const smartEditorRouter: RouteRecordRaw[] = [
  {
    path: '/smart/page',
    name: 'smartPage',
    meta: {
      title: '페이지',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/list.vue'),
  },
  {
    path: '/smart/layout',
    name: 'smartLayout',
    meta: {
      title: '레이아웃',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/layout.vue'),
  },
  {
    path: '/smart/script',
    name: 'smartScript',
    meta: {
      title: '전환스크립트',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/script.vue'),
  },
  {
    path: '/smart/policy',
    name: 'smartPolicy',
    meta: {
      title: '약관 페이지',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/policy.vue'),
  },
  {
    path: '/smart/component',
    name: 'smartComponent',
    meta: {
      title: '컴포넌트',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/component/index.vue'),
  },
  {
    path: '/smart/component/input-form',
    name: 'smartComponentInpuForm',
    meta: {
      title: '입력폼',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/component/InputForm/index.vue'),
  },
  {
    path: '/smart/component/rolling-banner',
    name: 'smartComponentRollingBanner',
    meta: {
      title: '롤링 배너',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/component/RollingBanner/index.vue'),
  },
  {
    path: '/smart/component/comment',
    name: 'smartComponentCommet',
    meta: {
      title: '댓글',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/component/Comment/index.vue'),
  },
  {
    path: '/smart/component/list-rolling',
    name: 'smartComponentListRolling',
    meta: {
      title: '리스트 롤링',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/component/ListRolling/index.vue'),
  },
  {
    path: '/smart/component/import',
    name: 'smartComponentImport',
    meta: {
      title: '임포트',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/component/Import/index.vue'),
  },
  {
    path: '/smart/components/:type',
    name: 'smartComponents',
    meta: {
      title: '컴포넌트 명칭',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    beforeEnter: (to, from, next) => {
      const COMP_PATH: { [K in SMART_COMP_KEYS]: string } = {
        INPUT_FORM: 'input-form',
        ROLLING_BANNER: 'rolling-banner',
        ROLLING_LIST: 'list-rolling',
        COMMENT: 'comment',
        IMPORT: 'import',
      };


      const type: string = to.params['type'] as string;
      const { PAGE_SECTION_TYPE } = CONST_CODES;

      const codes = [
        PAGE_SECTION_TYPE.INPUT_FORM, PAGE_SECTION_TYPE.ROLLING_BANNER,
        PAGE_SECTION_TYPE.ROLLING_LIST, PAGE_SECTION_TYPE.COMMENT,
        PAGE_SECTION_TYPE.IMPORT
      ];
      const code: CodeItemType | undefined =
        codes.find(code => code.VAL === ((Object.keys(COMP_PATH) as SMART_COMP_KEYS[]).find(key => COMP_PATH[key] === type)));

      if (!code) {
        return next({ path: `/smart/components/${COMP_PATH.INPUT_FORM}` });
      }

      to.meta['compCode'] = code;
      to.meta['title'] = code.TXT;

      let preViewComponentType: PreviewComponent | null = null;
      switch (code.VAL) {
        case PAGE_SECTION_TYPE.INPUT_FORM.VAL:
          preViewComponentType = previewComponent.INPUT_FORM; break;

        case PAGE_SECTION_TYPE.ROLLING_BANNER.VAL:
          preViewComponentType = previewComponent.ROLLING_BANNER; break;

        case PAGE_SECTION_TYPE.ROLLING_LIST.VAL:
          preViewComponentType = previewComponent.ROLLING_LIST; break;

        case PAGE_SECTION_TYPE.COMMENT.VAL:
          preViewComponentType = previewComponent.COMMENT; break;

        case PAGE_SECTION_TYPE.IMPORT.VAL:
          preViewComponentType = previewComponent.IMPORT; break;
      }
      to.meta['preViewComponentType'] = preViewComponentType;

      next();
    },
    component: () => import('@/views/smart/component/index.vue'),
  },
  {
    path: '/smart/bin',
    name: 'smartBin',
    meta: {
      title: '휴지통',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/smart/bin.vue'),
  },

  {
    path: '/editor',
    name: 'smartEditor',
    meta: {
      noLayout: true,
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/editor/index.vue'),
  },
  {
    path: '/editor/:uid',
    name: 'smartEditorPageModify',
    meta: {
      noLayout: true,
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/editor/index.vue'),
  }
];