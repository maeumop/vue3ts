<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUtil } from '@/js/util';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type { GetBinsDeleteHistoryRes, GetBinsDeleteHistoryItem } from '@/types/api/databaseApi';
import type { PaginationDefault } from '@/types/api';

import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';

const util = useUtil();
const databaseApi = useDatabaseApi();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

// 팝업 기본 설정 ====================
let isShow = ref<boolean>(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

// ListTable
const tableHeader: ListTableHeader[] = [
  { text: '처리 일자', width: '180' },
  { text: '삭제 DB수', width: '100' },
  { text: '처리자' },
];

let list = ref<GetBinsDeleteHistoryItem[]>([]);
let dataLoading = ref<boolean>(false);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;
let totalCount: number = 0;

const getData = async (): Promise<void> => {
  try {
    dataLoading.value = true;

    const params: PaginationDefault = { limit };
    if (cursor.value) {
      params.cursor = cursor.value;
    }

    const { results }: GetBinsDeleteHistoryRes = await databaseApi.getBinsDeleteHistory(params);

    results.history.forEach(item => list.value.push({ ...item }));
    totalCount = results.totalCount;
    observer.value = !(totalCount <= list.value.length);

    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].delDatetime;
    }

  } catch (err) {
    util.axiosErrorCatch<GetBinsDeleteHistoryRes>(err);

  } finally {
    dataLoading.value = false;
  }
};

getData();
</script>

<template>
  <Modal
    esc-close
    title="영구 삭제 이력"
    width="520px"
    v-model="isShow"
  >
    <template #body>
      <div>
        <ListTable
          ref="listTable"
          class="border"
          :height="`300px`"
          :header="tableHeader"
          :items="list"
          :loading="dataLoading"
          :observer="observer"
          @observe="getData"
        >
          <template #items="{ props }: ListTableItemSlot<GetBinsDeleteHistoryItem>">
            <tr :key="`list-${props.delDatetime}`">
              <td>{{ util.getDateFormat(props.delDatetime, 'Y-m-d H:i:s') }}</td>
              <td>{{ props.dbCount.numberFormat() }}</td>
              <td>{{ props.memberEmail }}</td>
            </tr>
          </template>
        </ListTable>
      </div>
    </template>

    <template #action="{ close }">
      <StyledButton outline @click="close">
        닫기
      </StyledButton>
    </template>
  </Modal>
</template>
