import type { RouteRecordRaw } from 'vue-router';
import { CONST_CODES } from '@/constants/common';

const { AUTH } = CONST_CODES;

export const adRouter: RouteRecordRaw[] = [
  {
    path: '/ad/media',
    name: 'adMedia',
    meta: {
      title: '매체 코드 관리',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/ad/media.vue'),
  },
  {
    path: '/ad/utm',
    name: 'adUtm',
    meta: {
      title: 'UTM 관리',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/ad/utm.vue'),
  },

  {
    path: '/ad/media/excelSample',
    name: 'adMediaExcelSample',
    meta: {
      noLayout: true,
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/ad/layer/mediaExcelSample.vue'),
  },
  {
    path: '/ad/utm/excelSample',
    name: 'adUtmExcelSample',
    meta: {
      noLayout: true,
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    component: () => import('@/views/ad/layer/utmExcelSample.vue'),
  },
];