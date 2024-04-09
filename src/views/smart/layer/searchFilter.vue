<script setup lang="ts">
import { ref, watch } from 'vue';
import type { OptionItem, KeyIndex } from '@/components/types';
import type { ModalModel } from '@/components/Modal/types';

const props = defineProps<{
  pageLasted: string
  pageOn: string
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'update', value: KeyIndex<string>): void;
}>();

// 팝업 기본 설정 ====================
const modal = ref<ModalModel>();
let isShow = ref<boolean>(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

let selectPageLasted = ref<string>('');
const optPageLasted: OptionItem[] = [
  { text: '전체', value: '' },
  { text: '최신 버전', value: '1' },
  { text: '업데이트 필요', value: '0' },
];

let selectPageOn = ref<string>('');
const optPageOn: OptionItem[] = [
  { text: '전체', value: '' },
  { text: 'ON', value: '1' },
  { text: 'OFF', value: '0' },
];

const update = (): void => {
  const data = {
    pageLasted: selectPageLasted.value,
    pageOn: selectPageOn.value
  };
  emit('update', { ...data });
  modal.value!.close();
};

selectPageLasted.value = props.pageLasted;
selectPageOn.value = props.pageOn;
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    title="검색 상세 설정"
    width="520px"
    v-model="isShow"
  >
    <template #body>
      <CheckButton
        label="버전 상태"
        type="radio"
        color="primary"
        name="lasted"
        :items="optPageLasted"
        v-model="selectPageLasted"
      />

      <CheckButton
        label="사용여부"
        type="radio"
        color="primary"
        name="on"
        class="mt-10"
        :items="optPageOn"
        v-model="selectPageOn"
      />

      <div class="pt-10"></div>
    </template>

    <template #action="{ close }">
      <StyledButton outline class="mr-10" @click="close">
        닫기
      </StyledButton>
      <StyledButton color="primary" @click.prevent="update">
        적용
      </StyledButton>
    </template>
  </Modal>
</template>
