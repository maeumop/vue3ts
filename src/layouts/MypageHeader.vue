<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSessionStore } from '@/store';

const router = useRouter();
const sessionStore = useSessionStore();

const logout = (): void => {
  sessionStore.clear();
  localStorage.clear();
  router.push('/');
};
</script>

<template>
  <div class="myHeader">
    <div>
      <div class="logo"></div>
      <RouterLink to="/mypage/service">마이페이지</RouterLink>
    </div>
    <div>
      {{ sessionStore.getMemberEmail }}
      <div class="userLink">
        <RouterLink to="/mypage/info">내정보</RouterLink>
        <a href="#" @click.prevent="logout">로그아웃</a>
      </div>
    </div>
  </div>
</template>