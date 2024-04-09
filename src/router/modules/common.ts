import type { RouteRecordRaw } from 'vue-router';

export const commonRouter: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'login',
    meta: {
      noLayout: true,
      noAuth: true,
    },
    component: () => import('@/views/member/login.vue'),
  },
  {
    path: '/policy',
    name: 'policy',
    meta: {
      title: '약관페이지',
      noLayout: true,
      noAuth: true,
    },
    component: () => import('@/views/policy/index.vue'),
  },
  {
    path: '/join',
    name: 'join',
    meta: {
      noLayout: true,
      noAuth: true,
    },
    component: () => import('@/views/member/join.vue')
  },
  {
    path: '/findPw',
    redirect: { name: 'findPw' },
    meta: {
      noLayout: true,
      noAuth: true,
    },
    children: [
      {
        path: '',
        name: 'findPw',
        component: () => import('@/views/pw/findPw.vue'),
      },
      {
        path: 'notice',
        name: 'findPwNotice',
        component: () => import('@/views/pw/notice.vue'),
      },
      {
        path: 'expiration',
        name: 'findPwExpiration',
        component: () => import('@/views/pw/expiration.vue'),
      },
      {
        path: 'modify',
        name: 'findPwModify',
        component: () => import('@/views/pw/modify.vue'),
      },
    ]
  },
];