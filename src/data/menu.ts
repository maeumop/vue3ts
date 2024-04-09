import type { MenuItem } from '@/types/common';
import {
  mdiDatabase,
  mdiCodeNotEqualVariant,
  mdiLayers,
  mdiFolder,
  mdiCog,
  mdiViewGridPlus,
} from '@/assets/svg/path';

export const menuList: MenuItem[] = [
  {
    id: 0,
    menu: '고객 DB 관리',
    path: 'database',
    icon: mdiDatabase,
    height: 0,
    active: false,
    children: [
      { menu: 'DB 관리', path: 'list', active: false, height: 0, children: [], },
      { menu: '휴지통', path: 'bin', active: false, height: 0, children: [], },
      { menu: 'API 연동', path: 'apiSetting', active: false, height: 0, children: [], },
      { menu: 'DB 필터 관리', path: 'filter', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 1,
    menu: '광고/매체 코드',
    path: 'ad',
    icon: mdiCodeNotEqualVariant,
    height: 0,
    active: false,
    children: [
      { menu: '매체 코드 관리', path: 'media', active: false, height: 0, children: [], },
      { menu: 'UTM 관리', path: 'utm', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 2,
    menu: '스마트편집',
    path: 'smart',
    icon: mdiLayers,
    height: 0,
    active: false,
    children: [
      { menu: '페이지', path: 'page', active: false, height: 0, children: [], },
      { menu: '레이아웃', path: 'layout', active: false, height: 0, children: [], },
      { menu: '전환스크립트', path: 'script', active: false, height: 0, children: [], },
      { menu: '약관페이지', path: 'policy', active: false, height: 0, children: [], },
      { menu: '컴포넌트', path: 'component', active: false, height: 0, children: [
        { menu: '입력폼', path: 'input-form', active: false, height: 0, children: [], },
        { menu: '롤링배너', path: 'rolling-banner', active: false, height: 0, children: [], },
        { menu: '리스트롤링', path: 'list-rolling', active: false, height: 0, children: [], },
        { menu: '댓글', path: 'comment', active: false, height: 0, children: [], },
        { menu: '임포트', path: 'import', active: false, height: 0, children: [], },
      ] },
      { menu: '휴지통', path: 'bin', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 3,
    menu: '웹 FTP',
    path: 'ftp',
    icon: mdiFolder,
    height: 0,
    active: false,
    children: [
      { menu: '파일 관리', path: 'webFtp', active: false, height: 0, children: [], },
      // { menu: '이용분석', path: 'logs', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 4,
    menu: '설정',
    path: 'settings',
    icon: mdiCog,
    height: 0,
    active: false,
    children: [
      { menu: '권한 관리', path: 'permission', active: false, height: 0, children: [], },
      { menu: 'API 문서', path: 'apiDoc', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 5,
    menu: '마이앱',
    path: 'myapp',
    icon: mdiViewGridPlus,
    height: 0,
    active: false,
    children: [
      { menu: '도메인', path: 'domain', active: false, height: 0, children: [], },
      { menu: '알리고 API', path: 'api', active: false, height: 0, children: [], },
      { menu: '템플릿', path: 'template', active: false, height: 0, children: [], },
    ]
  },
];

export const memberMenuList: MenuItem[] = [
  {
    id: 0,
    menu: '고객 DB 관리',
    path: 'database',
    icon: mdiDatabase,
    height: 0,
    active: false,
    children: [
      { menu: 'DB 관리', path: 'list', active: false, height: 0, children: [], },
      { menu: '휴지통', path: 'bin', active: false, height: 0, children: [], },
      { menu: 'API 연동', path: 'apiSetting', active: false, height: 0, children: [], },
      { menu: 'DB 필터 관리', path: 'filter', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 1,
    menu: '광고/매체 코드',
    path: 'ad',
    icon: mdiCodeNotEqualVariant,
    height: 0,
    active: false,
    children: [
      { menu: '매체 코드 관리', path: 'media', active: false, height: 0, children: [], },
      { menu: 'UTM 관리', path: 'utm', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 2,
    menu: '스마트편집',
    path: 'smart',
    icon: mdiLayers,
    height: 0,
    active: false,
    children: [
      { menu: '페이지', path: 'page', active: false, height: 0, children: [], },
      { menu: '레이아웃', path: 'layout', active: false, height: 0, children: [], },
      { menu: '전환스크립트', path: 'script', active: false, height: 0, children: [], },
      { menu: '약관페이지', path: 'policy', active: false, height: 0, children: [], },
      { menu: '컴포넌트', path: 'component', active: false, height: 0, children: [
        { menu: '입력폼', path: 'input-form', active: false, height: 0, children: [], },
        { menu: '롤링배너', path: 'rolling-banner', active: false, height: 0, children: [], },
        { menu: '리스트롤링', path: 'list-rolling', active: false, height: 0, children: [], },
        { menu: '댓글', path: 'comment', active: false, height: 0, children: [], },
        { menu: '임포트', path: 'import', active: false, height: 0, children: [], },
      ] },
      { menu: '휴지통', path: 'bin', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 3,
    menu: '웹 FTP',
    path: 'ftp',
    icon: mdiFolder,
    height: 0,
    active: false,
    children: [
      { menu: '파일 관리', path: 'webFtp', active: false, height: 0, children: [], },
      // { menu: '이용분석', path: 'logs', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 4,
    menu: '설정',
    path: 'settings',
    icon: mdiCog,
    height: 0,
    active: false,
    children: [
      { menu: 'API 문서', path: 'apiDoc', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 5,
    menu: '마이앱',
    path: 'myapp',
    icon: mdiViewGridPlus,
    height: 0,
    active: false,
    children: [
      { menu: '도메인', path: 'domain', active: false, height: 0, children: [], },
      { menu: '알리고 API', path: 'api', active: false, height: 0, children: [], },
      { menu: '템플릿', path: 'template', active: false, height: 0, children: [], },
    ]
  },
];

export const mediaMenuList: MenuItem[] = [
  {
    id: 0,
    menu: '고객 DB 관리',
    path: 'database',
    icon: mdiDatabase,
    height: 0,
    active: false,
    children: [
      { menu: 'DB 관리', path: 'list', active: false, height: 0, children: [], },
    ]
  },
  {
    id: 4,
    menu: '설정',
    path: 'settings',
    icon: mdiCog,
    height: 0,
    active: false,
    children: [
      { menu: 'API 문서', path: 'apiDoc', active: false, height: 0, children: [], },
    ]
  },
];

export const accountMenu: MenuItem[] = [
  { menu: '내 정보', path: '/mypage/info', active: false, height: 0, children: [], },
  { menu: '마이페이지', path: '/mypage/service', active: false, height: 0, children: [], },
  { menu: '로그아웃', path: '', active: false, height: 0, children: [], },
];