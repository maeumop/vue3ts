<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useUtil } from '@/js/util';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ProcessEnv } from '@/types/common';
import Gnb from '@/layouts/Gnb.vue';
import GlobalHeader from '@/layouts/GlobalHeader.vue';
import MypageHeader from '@/layouts/MypageHeader.vue';
import MypageFooter from '@/layouts/MypageFooter.vue';

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();

const noLayout = computed<boolean>(() => route.meta.noLayout as boolean);
const noAuth = computed<boolean>(() => route.meta.noAuth as boolean);
const title = computed<string>(() => route.meta.title as string);
const layoutName = computed<string>(() => route.meta.layout as string);
const container = computed<string | boolean>(() => route.name === 'smartEditor' && 'editor');

// 로그인 전에 페이지 접근시 화면 깜박임 현상을(Gnb, GlobalHeader 표시되는 현상), 막기 위한 처리
const { getAuthToken, getClientId } = storeToRefs(sessionStore);
const { VUE_APP_SESSION_STORAGE_KEY, VUE_APP_SESSION_STORAGE_AUTHLEVEL_KEY }: ProcessEnv = process.env;
const token: string | null = localStorage.getItem(VUE_APP_SESSION_STORAGE_KEY);

if (token) {
  if (sessionStore.setAuthToken(token)) {
    // 최초 접근시(새로 고침) router 문제로 모든 path가 /로 반환 되기때문에 location 객체로 경로 파악
    if (location.pathname === '/') {
      if (getClientId.value) {
        router.push('/database/list');
      } else {
        router.push('/mypage/service');
      }
    } else if (!getClientId.value && location.pathname !== '/mypage/info') {
      router.push('/mypage/service');
    }

    if (location.pathname !== '/mypage/service') {
      const util = useUtil();
      await util.setDefaultData();
    }
  }
}

// auth token 만료로 로그아웃된 상태인지 확인
const authStatus: string | null = localStorage.getItem('unauthorized');

if (authStatus !== null) {
  const MessageBox = inject('MessageBox') as MessageBoxModel;

  MessageBox.alert({
    title: '로그인 만료 알림',
    message: '로그인 시간이 만료 되어 로그아웃 되었습니다.'
  });

  localStorage.removeItem('unauthorized');
}

// 페이지 접근시 로그인 접근 가능 여부 체크
router.afterEach((r) => {
  const token: string | null = localStorage.getItem(VUE_APP_SESSION_STORAGE_KEY);

  if (!token && !r.meta.noAuth) {
    router.replace('/');
  }
});

// 페이지 접근시 회원 권한별 접근 가능 여부 체크
router.beforeEach((to, from, next) => {
  const auth: string = sessionStorage.getItem(VUE_APP_SESSION_STORAGE_AUTHLEVEL_KEY) ?? '';
  const authLevels: string[] = [to.meta.authLevel as string];

  if (auth && authLevels[0]) {
    if (!authLevels[0].includes(auth)) {
      router.push('/database/list');
    } else {
      next();
    }

  } else {
    next();
  }
});
</script>

<template>
  <div id="container" :class="container">
    <Gnb v-show="getAuthToken && !noLayout" />

    <template v-if="noLayout">
      <template v-if="noAuth">
        <slot></slot>
      </template>

      <template v-else-if="getAuthToken">
        <template v-if="layoutName === 'mypage'">
          <div id="mypage">
            <MypageHeader />
            <div class="container">
              <h2>{{ title }}</h2>
              <slot></slot>
            </div>
            <MypageFooter />
          </div>
        </template>

        <template v-else>
          <slot></slot>
        </template>
      </template>

    </template>
    <template v-else-if="getAuthToken">
      <div class="contentWrap">
        <GlobalHeader :title="title" />
        <slot></slot>
      </div>
    </template>
  </div>
</template>
