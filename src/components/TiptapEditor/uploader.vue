<script setup lang="ts">
// 필요할 경우 추후 업데이트
/*
import { ref } from 'vue';

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'uploaded', value: string[]): void
}>();

const props = withDefaults(defineProps<{
  accept?: string
  path: string
}>(), {
  accept: '.jpg,.png,.gif',
});

let fileList = ref<string[]>([]);
let files = ref<string[]>([]);
let success = ref<number>(0);
let fail = ref<number>(0);
let imageSource = ref<string>('');
let uploadState = ref<boolean>(false);

const uploadForm = ref<HTMLInputElement>();

const delay = async (time: number): Promise<void> => {
  await new Promise((resolve: Function) => {
    setTimeout(() => {
      resolve();
    }, time);
  }).then(() => true);
};

const fileSize = (num: number): string => {
  if (num > 0) {
    const x = Number(num);
    const s = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const e = Math.floor(Math.log(x) / Math.log(1024));

    return (x / Math.pow(1024, e)).toFixed(2) + ' ' + s[e];
  }

  return '0';
};

const fileClick = (): void => {
  if (!uploadState.value) {
    uploadForm.value!.click();
  }
};

const removeFile = (index: number): void => {
  fileList.value.splice(index, 1);
};

const toggleRemove = (index: number, flag: boolean = false): void => {
  if (uploadState.value === false) {
    fileList.value[index].removeShow = flag;
  }
};

const fileChange = (evt: Event): void => {
  const target = evt.target as HTMLInputElement;
  addFiles(target.files);
};

const fileDrop = (evt: Event): void => {
  addFiles(evt.dataTransfer.files);
};

const addFiles = async (f: File): void => {
  if (f.length > 0) {
    for (let i = 0; i < f.length; i++) {
      await delay(50);

      let file = f[i];

      files.value.push(file);

      fileList.value.push({
        src: '',
        name: file.name,
        size: fileSize(file.size),
        oriSize: file.size,
        type: file.type,
        uploaded: 0,
        uploadedPer: '0',
        progress: true,
        removeShow: false
      });

      // 파일 미리 보기
      const reader = new FileReader();

      reader.onload = (e) => {
        fileList.value[fileList.value.length - 1].src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }
};

const upload = (): void => {
  let duple = fileList.value.filter((obj) => obj.ftpDuple);

  if (duple.length > 0) {
    modal.alert(`총 ${duple.length}개의 파일이 이미 존재 합니다.<br>중복 파일을 삭제 후 업로드 해주세요.`);
    return;
  }

  if (files.value.length > 0 && !uploadState.value) {
    let message = `총 ${fileList.value.length}개의 파일을 업로드 하시겠습니까?`;

    modal.confirm({
      title: '파일 업로드',
      message,
      okay: async () => {
        uploadState.value = true;

        for (let i = 0; i < fileList.value.length; i++) {
          // 삭제되지 않은 파일만 업로드
          if (!fileList.value[i].delete) {
            const result = await fileUpload(files.value[i], i);

            // 업로드 실패인 경우
            if (result == 'fail') {
              fileList.value[i].progress = false;
            }
          }
        }

        const filter = fileList.value.filter((obj) => !obj.delete && obj.progress !== false);

        if (filter.length > 0) {
          const imageList = filter.map(item => item.src);

          emit('uploaded', imageList);
          emit('close');
        }
      }
    });
  }
};

const fileUpload = (file_1: string, index: number): void => {
  return api.fileUpload({
    url: this.$store.state.fileUploadUrl,
    headers: { 'content-type': 'multipart/form-data' },
    method: 'post',
    data: util.getFormData({
      file_1,
      path: 'editor',
    }),
    onUploadProgress: (prog) => {
      // 업로드 상황 표시
      fileList.value[index].uploaded = fileSize(prog.loaded);
      fileList.value[index].uploadedPer = ((prog.loaded / prog.total) * 100).toFixed(1);
    }
  });
};

const close = (): void => {
  if (!uploadState.value) {
    emit('close');
  }
};
*/
</script>

<template>
  <div id="fileUploader">
    <!--
    <input
      multiple
      ref="uploadForm"
      type="file"
      :accept="props.accept"
      @change="fileChange"
    />

    <div
      :class="['drop-area', { 'flex-column': fileList.length == 0 }]"
      @dragover.prevent
      @dropenter.prevent
      @drop.prevent="fileDrop"
      @click="fileClick"
    >
      <div class="area-info" v-show="fileList.length === 0">
        <i class="image-icon far fa-images"></i>
        <div>클릭하여 이미지를 선택 또는 파일을 Drag & Drop</div>
      </div>
      <div class="upload-list" v-show="fileList.length > 0">
        <TransitionGroup name="scale">
          <div
            :key="item.name"
            :class="['file-box', { duple: item.ftpDuple }]"
            @click.stop
            @mouseenter="toggleRemove(i, true)"
            @mouseleave="toggleRemove(i)"
            v-for="(item, i) in fileList"
            v-show="!item.delete"
          >
            <div class="box"><img width="100%" :src="item.src" /></div>

            <p class="size">{{ item.uploaded }} / {{ item.size }}</p>

            <div class="progress">
              <div :class="['gage', { fail: !item.progress }]" :style="{ width: item.uploadedPer + '%' }"></div>
            </div>

            <Transition name="scale">
              <a
                href="#"
                class="remove-file"
                @click.prevent="removeFile(i)"
                v-show="item.removeShow"
              >
              </a>
            </Transition>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <a href="#" class="close" @click.prevent="close">
      <i class="fas fa-times"></i>
    </a>
    <a href="#" class="upload" @click.prevent="upload">
      <i class="fas fa-cloud-upload-alt"></i>
    </a>
  -->
  </div>
</template>

<script lang="ts">
export default { name: 'TipTabUploader' };
</script>