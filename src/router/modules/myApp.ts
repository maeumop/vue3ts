import type { RouteRecordRaw } from 'vue-router';
import { CONST_CODES } from '@/constants/common';

const { AUTH } = CONST_CODES;

export const myAppRouter: RouteRecordRaw[] = [
  {
    path: '/myapp',
    redirect: { name: 'myappDomain' },
    meta: {
      authLevel: [AUTH.SUPER.VAL, AUTH.MASTER.VAL, AUTH.MEMBER.VAL],
    },
    children: [
      {
        path: 'domain',
        name: 'myappDomain',
        meta: { title: '도메인' },
        component: () => import('@/views/myapp/domain.vue'),
      },
      {
        path: 'api',
        name: 'myappApi',
        meta: { title: '알리고 API' },
        component: () => import('@/views/myapp/api.vue'),
      },
      {
        path: 'template',
        name: 'myappTemplate',
        meta: { title: '템플릿' },
        component: () => import('@/views/myapp/template.vue'),
      },
    ]
  },
];