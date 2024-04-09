<script async setup lang="ts">
import Layout from '@/layouts/index.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <Suspense>
    <Layout>
      <RouterView :key="route.fullPath" v-slot="{ Component }">
        <Transition appear name="page-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </Layout>

    <template #fallback>
      초기 데이터 설정 중...
    </template>
  </Suspense>
</template>
