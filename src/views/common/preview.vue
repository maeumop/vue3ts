<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { modalPosition } from '@/components/Modal/const';
import { mdiWindowClose } from '@/assets/svg/path';
import type { ProcessEnv, PreviewType, PreviewComponent } from '@/types/common';
import { useEditorStore } from '@/store';
import { v1 as uuid } from 'uuid';
import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import { useSessionStore } from '@/store';
import { postPreviewSaveMsg } from '@/constants/api/smartEditorApi';
import { onUnmounted } from 'vue';
import type { ModalModel } from '@/components/Modal/types';
import { storeToRefs } from 'pinia';

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'iframe-loaded'): void
}>();

const props = withDefaults(defineProps<{
  type: PreviewType
  component?: PreviewComponent
  uniqueKey?: string
  width?: string
}>(), {
  type: 'components'
});

const pageApi = useSmartEditorApi();
const modal = ref<ModalModel>();

let isShow = ref<boolean>(true);

watch(isShow, (v) => {
  if (!v) {
    emit('close');
  }
});

const { VUE_APP_API_URL } = process.env as ProcessEnv;

// [미리보기 - 약관페이지] GET getPreviewTerms /smarts/previews/terms/{termsPageUid}
// [미리보기 - 컴포넌트] GET getPreviewComponents /smarts/previews/components/{compType}/{uid}
// [미리보기 - 페이지(작성완료)] GET getPreviewPages /smarts/previews/pages/{pageCode}
// [미리보기 - 페이지(작성중)] GET getPreviewPages /smarts/previews/pages/{previewUid}&previewType=before-save
// [미리보기 - 템플릿] GET getTemplatePreview /myapps/templates/preview/{templateUid}
const baseUrl = `${VUE_APP_API_URL}/smarts/previews/${props.type}`;
let link = ref<string>('');

const { getPageConfig, sections } = useEditorStore();
const sessionStore = useSessionStore();
const { getClientId } = storeToRefs(sessionStore);

if (props.type === 'terms') {
  link.value = `${baseUrl}${props.uniqueKey ? '/' + props.uniqueKey : ''}?clientId=${getClientId.value}`;
} else if (props.type === 'template') {
  link.value = `${VUE_APP_API_URL}/myapps/templates/preview/${props.uniqueKey}?clientId=${getClientId.value}`;
} else if (props.type === 'pages') {
  if (props.uniqueKey) {
    link.value = `${baseUrl}/${props.uniqueKey}?clientId=${getClientId.value}`;
  } else {
    const previewUid = uuid();

    const param = {
      previewUid,
      pageConfig: getPageConfig,
      sections,
      clientId: getClientId.value,
    };

    // 작성중인 페이지 미리보기는 전체 내용을 임시로 저장하고, 저장된 UUID 정보를 받아,
    // 미리보기 페이지(람다 API)를 호출하여 previewType=before-save 옵션을 주어 처리하면
    // 해당 데이터를 참조하여 미리보기 페이지를 생성
    // iframe으로 form post를 할 수 없어 이와 같은 방식으로 처리
    const { code } = await pageApi.postPreviewSave(param);

    if (code === postPreviewSaveMsg.SMART_PREVIEW_INSERT_SUCCESS) {
      link.value = `${baseUrl}/${previewUid}?previewType=before-save&clientId=${getClientId.value}`;
    }
  }

} else {
  link.value = `${baseUrl}/${props.component}/${props.uniqueKey}?clientId=${getClientId.value}`;
}

link.value += `&domain=${location.origin}`;

const iFrame = ref<HTMLIFrameElement>();

const receiveMessage = (evt: MessageEvent) => {
  if (evt.data === 'ESC') {
    modal.value?.close();
  }
};

onMounted(() => {
  if (iFrame.value) {
    iFrame.value.onload = () => {
      emit('iframe-loaded');
    };

    window.addEventListener('message', receiveMessage, false);
  }
});

onUnmounted(() => {
  window.removeEventListener('message', receiveMessage);
});
</script>

<template>
  <Modal
    esc-close
    screen-cover
    ref="modal"
    title="미리보기"
    id="editorPreview"
    :position="modalPosition.bottom"
    v-model="isShow"
  >
    <template #header="{ close }">
      <div class="preview-header">
        ● 현재 미리보기 상태입니다. [X] 클릭 시 미리보기 상태가 종료됩니다.
        <SvgIcon type="mdi" :path="mdiWindowClose" @click="close()" />
      </div>
    </template>
    <template #body>
      <iframe
        ref="iFrame"
        name="preview"
        class="preview-iframe"
        :style="{ border: 0, width: '100%', height: 'calc(100% - 3px)' }"
        :src="link"
      >
      </iframe>
    </template>
  </Modal>
</template>

<style lang="scss">
#editorPreview {
  .preview-header {
    background-color: $gray-800;
    color: #fff;
    text-align: center;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    svg {
      cursor: pointer;
      position: absolute;
      right: 10px;
    }
  }

  .preview-iframe {
    border: 0 !important;
  }
}
</style>