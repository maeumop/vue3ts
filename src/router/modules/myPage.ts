import type { RouteRecordRaw } from 'vue-router';

export const myPageRouter: RouteRecordRaw[] = [
  {
    path: '/mypage/service',
    name: 'mypageService',
    meta: {
      title: '마이페이지',
      noLayout: true,
      layout: 'mypage',
    },
    component: () => import('@/views/mypage/index.vue'),
  },
  {
    path: '/mypage/info',
    name: 'myInfo',
    meta: {
      title: '내정보',
      noLayout: true,
      layout: 'mypage',
    },
    component: () => import('@/views/mypage/myInfo.vue'),
  },
];