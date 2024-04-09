<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  type: string
}>(), {
  type: 'terms'
});

const emit = defineEmits<{
  (event: 'close'): void
}>();

// 팝업 기본 설정 ====================
let isShowPolicy = ref<boolean>(true);
watch(isShowPolicy, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

// @@ 임시데이터 → 추후 백엔드 API 연동 필요
const policyList = [
  { title: '개인정보 취급 및 이용동의',
    type: 'privacy',
    content: '업데이트 예정입니다.',
  },
  { title: '개인정보처리방침',
    type: 'ad',
    content: '업데이트 예정입니다.',
  },
  { title: '이용약관',
    type: 'terms',
    content: '업데이트 예정입니다.',
  },
];


let policy = {
  title: '',
  type: '',
  content: '',
};

const getPolicy = (): void => {
  policyList.forEach(item => {
    if (item.type === props.type) {
      policy = item;
    }
  });
};


// Create
getPolicy();
</script>

<template>
  <Modal
    esc-close
    width="520px"
    class="policyModal"
    :title="policy.title"
    v-model="isShowPolicy"
  >
    <template #body>
      <p>
        {{ policy.content }}
      </p>
    </template>

    <template #action="{ close }">
      <StyledButton outline @click="close">닫기</StyledButton>
    </template>
  </Modal>
</template>