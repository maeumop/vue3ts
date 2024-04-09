import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { databaseRouter } from './modules/database';
import { adRouter } from './modules/ad';
import { smartEditorRouter } from './modules/smartEditor';
import { ftpRouter } from './modules/ftp';
import { settingsRouter } from './modules/settings';
import { myAppRouter } from './modules/myApp';
import { myPageRouter } from './modules/myPage';
import { commonRouter } from './modules/common';
import { exRouter } from './modules/ex';
import type { ProcessEnv } from '@/types/common';

/**
 * Router 정의
 *
 * name: 옵션은 path의 '/'를 재거하여 camelCase로 입력
 * meta: layout 관련 옵션 noLayout이 true인 경우만 작성
 * path:
 *  1. 메뉴 구조에 맞춰 작성된 folder에 파일을 작성하고, 해당 파일명과 URL을 일치 시킬것
 *    ex) 고객 DB 관리 -> DB 관리 -> /db/dbList
 */
const routes: RouteRecordRaw[] = [
  ...databaseRouter,
  ...adRouter,
  ...smartEditorRouter,
  ...ftpRouter,
  ...settingsRouter,
  ...myAppRouter,
  ...myPageRouter,
  ...commonRouter,
];

const { NODE_ENV, BASE_URL }: ProcessEnv = process.env;

if (NODE_ENV === 'development') {
  routes.push(...exRouter);
}

const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes
});
export default router;
