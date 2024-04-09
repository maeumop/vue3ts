import type { RouteRecordRaw } from 'vue-router';

export const exRouter: RouteRecordRaw[] = [
  // 공통 컴포넌트 참조용
  {
    path: '/forms',
    name: 'forms',
    meta: { title: '공통 컴포넌트' },
    component: () => import('@/views/forms.vue'),
    children: []
  },
  {
    path: '/tiptap',
    name: 'tiptap',
    meta: { title: 'Tiptap Editor' },
    component: () => import('@/views/tiptap.vue'),
    children: []
  },
  {
    path: '/icons',
    name: 'icons',
    meta: { title: '아이콘' },
    component: () => import('@/views/icons.vue'),
    children: []
  },
];