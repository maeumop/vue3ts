<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<template>
  <div
    id="pageFtpLayout"
    class="content"
  >
    <RouterView v-slot="{ Component }">
      <Component
        :key="route.fullPath"
        :is="Component"
      />
    </RouterView>
  </div>
</template>
