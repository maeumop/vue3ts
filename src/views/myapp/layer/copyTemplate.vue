<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { v1 as uuid } from 'uuid';
import { useMyAppApi } from '@/api/modules/myAppApi';
import { useUtil } from '@/js/util';
import { postCopyTemplatesMsg } from '@/constants/api/myAppapi';
import type { ComputedRef } from 'vue';
import type { ModalModel } from '@/components/Modal/types';
import type { PostTemplatesRes } from '@/types/api/myAppApi';

const util = useUtil();
const myAppApi = useMyAppApi();

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'copyTemplate', name: string, uid: string): void
}>();

const props = defineProps<{
  templateUid: string
}>();

// ==================== 팝업 기본 설정 ====================
const modal = ref<ModalModel>();

let isShow = ref<boolean>(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// ==================== END - 팝업 기본 설정 ====================

let isProcessing = ref<boolean>(false);
let name = ref<string>('');
/**
 * 템플릿 복사하기
 */
const copyTemplate = async (): Promise<void> => {
  try {
    isProcessing.value = true;

    const templateUid = uuid();

    const { code } = await myAppApi.postCopyTemplates(props.templateUid, {
      templateUid,
      templateName: name.value
    });

    if (code === postCopyTemplatesMsg.TEMPLATE_COPY_SUCCESS) {
      emit('copyTemplate', name.value, templateUid);
    }

  } catch (err) {
    util.axiosErrorCatch<PostTemplatesRes>(err);

  } finally {
    isProcessing.value = false;
    modal.value!.close();
  }
};


// 복사 버튼 활성화
const isChecked: ComputedRef<boolean> = computed(() => !!name.value);
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    width="520px"
    title="템플릿 복사"
    v-model="isShow"
  >
    <template #body>
      <TextField
        block
        required
        label="템플릿명"
        placeholder="템플릿명을 입력해주세요."
        class="mb-20"
        :max-length="50"
        @keyup.enter="copyTemplate"
        v-model="name"
      />
    </template>

    <template #action="{ close }">
      <StyledButton outline class="mr-10" @click.prevent="close">
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        :disabled="!isChecked"
        :loading="isProcessing"
        @click.prevent="copyTemplate"
      >
        복사
      </StyledButton>
    </template>
  </Modal>
</template>