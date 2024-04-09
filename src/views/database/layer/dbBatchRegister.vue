<script setup lang="ts">
import { ref, watch, inject, } from 'vue';
import XLSX, { writeFileXLSX } from 'xlsx';
import { useDatabaseApi } from '@/api/modules/databaseApi';
import type { WorkBook, WorkSheet } from 'xlsx';
import type { ToastModel } from '@/components/Toast/types';
import type { ModalModel } from '@/components/Modal/types';
import type { KeyIndex } from '@/components/types';
import type { PostDbsParam } from '@/types/api/databaseApi';
import { mdiFileExcel, mdiGoogleCirclesExtended } from '@/assets/svg/path';
import { getDbsInputFieldsMsg } from '@/constants/api/databaseApi';
import { INPUT_FIELDS_CONFIG } from '@/constants/db';

const Toast = inject('Toast') as ToastModel;

const databaseApi = useDatabaseApi();

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'openResult'): void
  (event: 'uploadData', data: PostDbsParam[], headList: KeyIndex<string> ): void
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

const openResult = (): void => {
  emit('openResult');
  modal.value!.close();
};

let isProcessing = ref<boolean>(false);
let isCheckedFile = ref<boolean>(false);
let fileInput = ref<HTMLInputElement>();
let fileName = ref<string>('');
/**
 * 업로드된 파일 검사 및 검사 완료된 파일은 emit 처리
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

      // 여분 필드 내용이 맞지 않으면 알람창 띄우기
      const hasError: boolean = data.some((item: string) => {
        return Object.entries(item).some(([key, ]: string[]) => {
          return !dbFieldLabelList.value.includes(key);
        });
      });

      if (hasError) {
        Toast({
          color: 'warning',
          message: '잘못된 업로드 양식입니다. 파일을 다시 확인 해주세요.'
        });

        isProcessing.value = false;
        isCheckedFile.value = false;
        fileName.value = '';
        return;
      }

      // 기본 필드 세팅 및 모든 항목이 빈 값인 경우 필터링
      let newData: PostDbsParam[] = [];

      data.map((item: any) => {
        let emptyCount: number = 0;

        dbFieldLabelList.value.forEach((field: string) => {
          if (!item[field]) {
            emptyCount++;
          }
        });

        if (emptyCount !== dbFieldLabelList.value.length) {
          dbFieldLabelList.value.forEach((field: string) => {
            if (!item[field]) {
              item[field] = '';
            }

            item.result = '처리중';
          });

          newData.push(item);
        }
      });

      emit('uploadData', newData, defaultDbLabel.value);
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

const defaultDbLabel = ref<KeyIndex<string>>({});

let dbFieldLabelList = ref<string[]>([]);
let dbFormSample: any = [{}];

/**
 * Input Field 리스트를 호출하여 defaultDbLabel과 DB 업로드 양식 폼 데이터를 가공함.
 */
const getDbsInputFields = async (): Promise<void> => {
  const { code, results } = await databaseApi.getDbsInputFieldsConfig(INPUT_FIELDS_CONFIG.batchDbs);

  if (code === getDbsInputFieldsMsg.DB_INPUT_FIELDS_GET_SUCCESS) {
    results.forEach(item => {
      // 개인정보동의, 인증번호 전송 항목 제거
      if (item.fieldName !== 'cert' && item.fieldName !== 'privacyYn') {
        defaultDbLabel.value[item.fieldName] = item.fieldLabel;
      }
    });

    // DB 업로드 양식 폼
    let values: string[] = Object.values(defaultDbLabel.value);

    let dbFormSampleItem: any = {};
    for (const value of values) {
      dbFormSampleItem[value] = '';
    }

    // 엑셀 전체 셀 데이터 타입을 '텍스트'로 지정하기 위하여 최대 DB등록 가능 갯수까지 빈 열 생성
    // 왜 미리 1000 line을 생성 하는 것인가?
    for (let i = 0; i < 1000; i++) {
      for (let k = 0; k <= values.length - 1; k++) {
        if (i === 0) {
          dbFormSample[i][values[k]] = ' ';
        } else if (i > 0) {
          dbFormSample[i] = dbFormSampleItem;
        }
      }
    }

    // 필드명 세팅
    Object.entries(defaultDbLabel.value).some(([, value]: string[]) => {
      dbFieldLabelList.value.push(value);
    });
  }
};


/**
 * 업로드 양식 다운로드
 */
const downloadForm = () => {
  const ws: WorkSheet = XLSX.utils.json_to_sheet(dbFormSample);
  const wb: WorkBook = XLSX.utils.book_new();

  // 셀 타입에 '텍스트' 옵션 추가
  const range = XLSX.utils.decode_range(ws['!ref']!);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });

      if (!ws[addr]) {
        continue;
      }
      ws[addr].z = '@';
    }
  }

  // column 너비 계산
  let objectMaxLength: number[] = [];

  dbFormSample.forEach((data: any) => {
    Object.entries(data).forEach(([title, ], idx) => {
      let columnValue: string = String(title);

      objectMaxLength[idx] = objectMaxLength[idx] >= columnValue.length ? objectMaxLength[idx] : columnValue.length;
    });
  });

  const wsCols = objectMaxLength.map((w: number) => ({ width: w * 3 }));

  ws['!cols'] = wsCols;

  XLSX.utils.book_append_sheet(wb, ws, 'db_form_sample');

  writeFileXLSX(wb, 'db_form_sample.xlsx', { cellStyles: true });
};


// Create
getDbsInputFields();
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    class="batchResistModal"
    title="일괄 등록"
    width="512px"
    v-model="isShow"
  >
    <template #body>
      <div class="flex">
        <StyledButton
          small
          color="success"
          class="mb-10"
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
          href="/database/list/excelSample"
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
        <li>한 번에 일괄 등록할 수 있는 최대 데이터 수는 ‘1,000개’입니다.</li>
      </ul>
    </template>

    <template #action="{ close }">
      <StyledButton
        outline
        class="mr-10"
        @click="close"
      >
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        :disabled="!isCheckedFile"
        @click="openResult"
      >
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
