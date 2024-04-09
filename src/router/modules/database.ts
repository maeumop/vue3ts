import type { RouteRecordRaw } from 'vue-router';
import { CONST_CODES } from '@/constants/common';

const { AUTH } = CONST_CODES;

export const databaseRouter: RouteRecordRaw[] = [
  {
    path: '/database/list',
    name: 'databaseList',
    meta: {
      title: 'DB 관리',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL, AUTH.MEDIA.VAL],
    },
    component: () => import('@/views/database/list.vue'),
  },
  {
    path: '/database/bin',
    name: 'databaseBin',
    meta: {
      title: '휴지통',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/database/bin.vue'),
  },
  {
    path: '/database/apiSetting',
    name: 'databaseApiSetting',
    meta: {
      title: 'API 연동',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/database/apiSetting.vue'),
  },
  {
    path: '/database/filter',
    name: 'databaseFilter',
    meta: {
      title: 'DB 필터 관리',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/database/filter.vue'),
  },

  {
    path: '/database/codeInfo',
    name: 'databaseCodeInfo',
    meta: {
      noLayout: true,
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/database/codeInfo.vue'),
  },
  {
    path: '/database/list/excelSample',
    name: 'databaseListExcelSample',
    meta: {
      noLayout: true,
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/database/layer/dbExcelSample.vue'),
  },
];