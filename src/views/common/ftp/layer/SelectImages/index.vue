<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import { ref, watch, computed, getCurrentInstance } from 'vue';
import Modal from '@/components/Modal/index.vue';
import FTPContents from '@/views/common/ftp/Contents/index.vue';
import { FTP_CONTENTS_ROLE } from '@/constants/store/modules/ftp';
import type { ContentItem, FTP_CONTENTS_ROLE_TYPE, ContentOptionItem } from '@/types/store/modules/ftp';


const app = getCurrentInstance();

// props
const props = withDefaults(
  defineProps<{
    multiple: boolean
  }>(),
  {
    multiple: false,
  }
);

// emit
const emit = defineEmits<{
  (event: 'close'): void
  (event: 'loadImages', value: ContentItem | ContentItem[]): void
}>();

// element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'|'$nextTick'>>();
const refFTP = ref<ComponentPublicInstance<typeof FTPContents> & InstanceType<typeof FTPContents>>();

// data()
let isShow = ref<boolean>(true);
let isSelectedImg = ref<boolean>(false);

// computed
const roles = computed<FTP_CONTENTS_ROLE_TYPE[]>(() => ([
  FTP_CONTENTS_ROLE.UPLOAD_BUTTON, FTP_CONTENTS_ROLE.NEW_FOLDER_BUTTON, FTP_CONTENTS_ROLE.RELOAD_BUTTON,
  FTP_CONTENTS_ROLE.IMAGE_VIEWER, ...(props.multiple ? [ FTP_CONTENTS_ROLE.ALL_CHECKBOX ] : [])
]));

/**
 * 선택 택 버튼 클릭이벤트
 * 1. 선택한 값에서 props.multiple의 값에 따라 이벤트 수행
 * @author hjs0619
 * @returns
 */
const selectImage = (): void => {
  const res: ContentItem[] = (refFTP.value?.checkedList || [])
    .map((item: ContentOptionItem) => {
      const { checked, show, ...arg } = item;
      return arg;
    });
  if (res.length < 1) {
    // defaultErrors();
    return;
  }
  emit('loadImages', props.multiple ? res : res[0]);
  modalEL.value?.close();
};

// watch
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
/**
 * FtpContents에서 선택한 객체 실시간 감시
 * 1. props.multiple = true 일때에는 선택 버튼을 클릭해야 선정 되지만 반대는 1개를 선택만 했을경우 자동 선정
 * @author hjs0619
 * @returns
 */
watch(() => refFTP.value?.checkedList, async () => {
  if (isShow.value && app?.isMounted) {

    await modalEL.value?.$nextTick();
    isSelectedImg.value = refFTP.value!.checkedList.length > 0;
    if (!props.multiple && isSelectedImg.value) {
      selectImage();
    }
  }
}, { deep: true });

</script>
<script lang="ts">
export default { name: 'FtpLayerSelectImages' };
</script>
<template>
  <Modal
    esc-close
    ref="modalEL"
    title="이미지 선택"
    width="1000px"
    v-model="isShow"
  >
    <template #body>
      <!-- <ul class="info-box-bullet">
        <li>이미지 선택은 jpg, jpeg, gif, png 확장자만 가능합니다.</li>
        <li>[업로드] 버튼을 통해 파일 선택 완료 시 선택과 동시에 업로드가 진행됩니다.</li>
      </ul> -->

      <div class="ftpContent">
        <FTPContents
          image-only
          ref="refFTP"
          :roles="roles"
          :sorted="props.multiple"
        />
      </div>
    </template>

    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
          color="primary"
          :disabled="!isSelectedImg"
          @click="selectImage"
          v-if="props.multiple"
        >
          선택
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline @click="close">
          취소
        </StyledButton>
      </div>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
.ftpContent {
  height: 600px;
  border: 1px solid $gray-300;
  box-sizing: content-box;
  &::v-deep(.component.ftpContents) {
    height:  inherit;
  }
}
</style>