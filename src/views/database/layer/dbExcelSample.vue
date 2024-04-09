<script setup lang="ts">
/**
 * @editor 김종윤
 * @editDate 2024.03.21
 * @desc input form field config api 변경으로 인한 수정
 */
import { ref } from 'vue';
import { useDatabaseApi } from '@/api/modules/databaseApi';
import { getDbsInputFieldsConfigMsg } from '@/constants/api/databaseApi';
// import { dbExcelFromSample } from '@/data/batchExcelSample';
import { useUtil } from '@/js/util';
import { booleanYN } from '@/constants/common';
import type { ExcelSampleItem } from '@/data/batchExcelSample';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import { INPUT_FIELDS_CONFIG } from '@/constants/db';

const util = useUtil();

const dbsApi = useDatabaseApi();
let dbFieldList = ref<ExcelSampleItem[]>([]);

// ==================== 테이블 설정 ====================
const tableHeader: ListTableHeader[] = [
  { text: '열', width: '100' },
  { text: '엑셀 항목명', width: '250' },
  { text: '필수여부', width: '150' },
  { text: '입력 방법', width: '' },
  // { text: '입력 예시', width: '400' },
];
// ==================== END 테이블 설정 ====================

/**
 * db 필드세팅
 */
const getDbsInputFields = async (): Promise<void> => {
  const { code, results } = await dbsApi.getDbsInputFieldsConfig(INPUT_FIELDS_CONFIG.batchDbs);

  if (code === getDbsInputFieldsConfigMsg.DB_INPUT_FIELDS_GET_SUCCESS) {
    dbFieldList.value  = results.map(item => ({
      fieldLabel: item.fieldLabel,
      fieldName: item.fieldName,
      fieldType: item.fieldType,
      isRequire: item.isRequireBatchDb ? booleanYN.Y : booleanYN.N,
      desc: item.batchDbDesc?.replaceAll('\n', '<br>'),
    }));

    // privacyYn, cert 항목 제외
    dbFieldList.value = dbFieldList.value.filter( v => v.fieldName !== 'cert' && v.fieldName !== 'privacyYn');
    // dbFieldList.value = [...dbExcelFromSample, ...dbFieldList.value];
  }
};

/**
 * 입력 예시 데이터 가공 (삭제 예정)
 * @param data
 */
// const getExample = (data: string) => {
//   if (Array.isArray(data)) {
//     let example: string[] = [];

//     data.forEach(item => {
//       example.push(item.value);
//     });
//     return example.join(', ');

//   } else {
//     return data ? data : '';
//   }
// };


getDbsInputFields();
</script>

<template>
  <div class="excelSample">
    <ListTable
      class="mx-20 my-50"
      :header="tableHeader"
      :items="dbFieldList"
      :height="'calc(100vh - 100px)'"
    >
      <template #items="{ props, index }: ListTableItemSlot<ExcelSampleItem>">
        <tr>
          <td>{{ util.getExcelColumn(index) }}</td>
          <td>{{ props.fieldLabel }}</td>
          <td>{{ props.isRequire ? '필수' : '-' }}</td>
          <td v-html="props.desc"></td>
          <!-- <td>
            <span>
              {{ props.fieldType }}
            </span>
          </td> -->
        </tr>
      </template>
    </ListTable>
  </div>
</template>