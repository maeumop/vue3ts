<script setup lang="ts">
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import { utmExcelFormSample } from '@/data/batchExcelSample';
import { useUtil } from '@/js/util';
import type { ExcelSampleItemOther } from '@/data/batchExcelSample';

const util = useUtil();

const tableHeader: ListTableHeader[] = [
  { text: '열', width: '100' },
  { text: '엑셀 항목명', width: '' },
  { text: '필수여부', width: '' },
  { text: '입력 방법', width: '' },
  { text: '입력 예시', width: '400' },
];
</script>

<template>
  <div class="excelSample">
    <ListTable
      class="mx-20 my-50"
      :header="tableHeader"
      :items="utmExcelFormSample"
    >
      <template #items="{ props, index }: ListTableItemSlot<ExcelSampleItemOther>">
        <tr>
          <td>{{ util.getExcelColumn(index) }}</td>
          <td>{{ props.fieldName }}</td>
          <td>{{ props.isRequire ? '필수' : '-' }}</td>
          <td>
            <ul class="info">
              <li :key="index" v-for="(item, index) in props.info">
                {{ item }}
              </li>
            </ul>
          </td>
          <td>{{ props.info ? props.info : '-' }}</td>
        </tr>
      </template>
    </ListTable>
  </div>
</template>