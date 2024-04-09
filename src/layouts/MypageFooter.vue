<script setup lang="ts">
import { ref } from 'vue';
import Policy from '@/views/common/policy/index.vue';

let isShowPolicy = ref<boolean>(false);
let policyType = ref<string>('');

const showPolicy = (type: string): void => {
  policyType.value = type;
  isShowPolicy.value = true;
};

const closePolicy = (): void => {
  isShowPolicy.value = false;
  policyType.value = '';
};
</script>

<template>
  <div class="myFooter">
    <div>© <span class="text-point">dreaminsight</span> All Rights Reserved.</div>
    <div class="policy">
      <a href="#" @click.prevent="showPolicy('terms')">이용약관</a>
      <a href="#" @click.prevent="showPolicy('privacy')">개인정보처리방침</a>
    </div>
  </div>

  <Policy
    :type="policyType"
    @close="closePolicy"
    v-if="isShowPolicy"
  />
</template>
