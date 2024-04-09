<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const type = route.query.type ?? 'privacy';
let typeTxt = ref<string>('');

console.log('route', route);

if (type === 'terms') {
  typeTxt.value = '이용약관';
} else {
  typeTxt.value = '개인정보처리방침';
}
</script>

<template>
  <div id="policy">
    <div class="header">
      <a href="#" class="logo"></a>
    </div>

    <div class="policyContentWrap">
      <h1>{{ typeTxt }}</h1>
      <div>
        <p><strong>제1장 총칙</strong></p>
        <p>제1조 [목적]<br /> 본 약관은 권리ㆍ의무 및 기타 책임사항 등에 대하여 규정함을 목적으로 합니다. </p>

      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import './style.scss';
</style>