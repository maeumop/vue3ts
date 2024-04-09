import type { RouteRecordRaw } from 'vue-router';
import { CONST_CODES } from '@/constants/common';

const { AUTH } = CONST_CODES;

export const settingsRouter: RouteRecordRaw[] = [
  {
    path: '/settings/permission',
    name: 'settingsPermission',
    meta: {
      title: '권한 관리',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL],
    },
    component: () => import('@/views/settings/Permission/index.vue'),
  },
  {
    path: '/settings/apiDoc',
    name: 'settingsApiDocument',
    meta: {
      title: 'API 문서',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL, AUTH.MEDIA.VAL],
    },
    component: () => import('@/views/settings/ApiDoc/index.vue'),
  },
];