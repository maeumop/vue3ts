import type { RouteRecordRaw } from 'vue-router';
import { CONST_CODES } from '@/constants/common';

const { AUTH } = CONST_CODES;

export const ftpRouter: RouteRecordRaw[] = [
  {
    path: '/ftp',
    name: 'ftp',
    meta: {
      title: '웹 FTP',
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],

    },
    component: () => import('@/views/ftp/layout.vue'),
    children: [
      {
        path: '/ftp/webFtp',
        name: 'ftpWebFtp',
        component: () => import('@/views/ftp/WebFtp.vue'),
      },
    ],
  },
];