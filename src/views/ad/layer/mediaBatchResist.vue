<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import XLSX, { writeFileXLSX } from 'xlsx';
import type { WorkBook, WorkSheet } from 'xlsx';
import type { ToastModel } from '@/components/Toast/types';
import type { ModalModel } from '@/components/Modal/types';
import type { KeyIndex } from '@/types/common';
import { mdiFileExcel, mdiGoogleCirclesExtended } from '@/assets/svg/path';

const Toast = inject('Toast') as ToastModel;

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'openResult'): void
  (event: 'setData', value: KeyIndex<string>[]): void
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

const openResult = () => {
  emit('openResult');
  modal.value!.close();
};

let isProcessing = ref<boolean>(false);
let isCheckedFile = ref<boolean>(false);
let fileInput = ref<HTMLInputElement>();
let fileName = ref<string>('');
/**
 * 업로드된 파일 검사, 완료된 파일은 emit 처리
 * @param event Event
 */
const checkFile = (event: Event): void => {
  isProcessing.value = true;
  const target = event.target as HTMLInputElement;

  if (!target.files?.length) {
    isProcessing.value = false;
    isCheckedFile.value = false;
    fileName.value = '';
    return;
  }

  const file = target.files[0];
  const extension = file.name.substring(file.name.lastIndexOf('.') + 1);
  const checkedExt = ['xls', 'xlsx', 'csv'].includes(extension);

  if (checkedExt) {
    const reader = new FileReader();

    reader.onload = () => {
      // size를 mb로 계산
      const fileSize: number = file?.size / 1024 / 1024;

      if (fileSize > 10) {
        Toast({
          color: 'warning',
          message: '제한된 용량(10 MB)을 초과하였습니다.'
        });

        isProcessing.value = false;
        isCheckedFile.value = false;
        fileName.value = '';
        return;
      }

      let result = reader.result!;
      let workBook = XLSX.read(result, { type: 'binary' });

      let data: string[] = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]);

      if (data.length > 1000) {
        Toast({
          color: 'warning',
          message: '최대 업로드 가능한 데이터 수는 1,000개입니다.'
        });

        isProcessing.value = false;
        isCheckedFile.value = false;
        fileName.value = '';
        return;
      }

      // 기본 필드 세팅
      const newData: KeyIndex<string>[] = data.map((item: any) => {
        const requiredFields: string[] = ['매체명', '매체코드', '설명'];

        requiredFields.forEach((field: string) => {
          if (!item[field]) {
            item[field] = '';
          }

          item['결과'] = '처리중';
        });

        return item;
      });

      emit('setData', newData);
      isProcessing.value = false;
      isCheckedFile.value = true;
    };

    fileName.value = file.name;
    reader.readAsBinaryString(file);

  } else {
    Toast({
      color: 'warning',
      message: 'xls, xlsx, csv 확장자만 업로드 가능합니다.'
    });

    isProcessing.value = false;
    isCheckedFile.value = false;
    fileName.value = '';
  }
};

const mediaSample: KeyIndex<string>[] = [{
  '매체명': '매체명 입력',
  '매체코드': '매체코드 입력',
  '설명': '설명 입력'
}];
/**
 * 업로드 양식 다운로드
 */
const downloadForm = (): void => {
  const ws: WorkSheet = XLSX.utils.json_to_sheet(mediaSample);
  const wb: WorkBook = XLSX.utils.book_new();

  let objectMaxLength: number[] = [];
  // column 너비 계산
  mediaSample.forEach(data => {
    Object.entries(data).forEach(([, value], idx) => {
      let columnValue: string = value;

      objectMaxLength[idx] = objectMaxLength[idx] >= columnValue.length ? objectMaxLength[idx] : columnValue.length;
    });
  });

  const wsCols = objectMaxLength.map((w: number) => ({ width: w * 2 }));

  ws['!cols'] = wsCols;

  XLSX.utils.book_append_sheet(wb, ws, 'media_code_sample');

  writeFileXLSX(wb, 'media_code_sample.xlsx');
};
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    class="batchResistModal"
    title="매체 코드 일괄 등록"
    width="512px"
    v-model="isShow"
  >
    <template #body>
      <div class="flex">
        <StyledButton
          small
          class="mb-10"
          color="success"
          :icon="mdiFileExcel"
          @click="downloadForm"
        >
          업로드 양식 다운로드
        </StyledButton>
        <StyledButton
          small
          outline
          block
          class="ml-10"
          href="/ad/media/excelSample"
        >
          엑셀 입력 방법
        </StyledButton>
      </div>

      <label>
        <input
          ref="fileInput"
          type="file"
          accept=".xls, .xlsx, .csv"
          @change="checkFile"
        />
        <span class="button">
          파일 선택
        </span>
        <div class="fileName">
          <span v-if="fileName">{{ fileName }}</span>
          <span class="noFile" v-else>선택된 파일 없음</span>
        </div>
      </label>

      <ul class="info-box-bullet">
        <li>xls, xlsx, csv 확장자만 업로드 가능합니다.</li>
        <li>한 번에 일괄 등록할 수 있는 최대 데이터 수는 '1,000개'입니다.</li>
      </ul>
    </template>

    <template #action="{ close }">
      <StyledButton outline class="mr-10" @click="close">
        취소
      </StyledButton>
      <StyledButton color="primary" :disabled="!isCheckedFile" @click.prevent="openResult">
        <SvgIcon
          class="loading"
          type="mdi"
          :path="mdiGoogleCirclesExtended"
          v-if="isProcessing"
        />
        <template v-else>
          업로드
        </template>
      </StyledButton>
    </template>
  </Modal>
</template>