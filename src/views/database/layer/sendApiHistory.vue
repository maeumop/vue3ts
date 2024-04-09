<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUtil } from '@/js/util';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type { SendHistoryItem, GetDbsApisSendRes } from '@/types/api/databaseApi';

import { mdiCheckboxBlankCircle, mdiHelpCircleOutline, mdiWindowClose } from '@/assets/svg/path';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';

const util = useUtil();
const databaseApi = useDatabaseApi();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const props = defineProps<{
  dbUid: string;
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
  { text: '전송일', },
  { text: '업체명', width: '180' },
  { text: '전송결과', width: '120' },
  { text: '전송로그', width: '160'  },
];

let list = ref<SendHistoryItem[]>([]);
let dataLoading = ref<boolean>(true);

const getData = async (): Promise<void> => {
  try {
    const { results }: GetDbsApisSendRes = await databaseApi.getDbsApisSend(props.dbUid);
    list.value = results.sendHistory;

  } catch (err) {
    util.axiosErrorCatch<GetDbsApisSendRes>(err);

  } finally {
    dataLoading.value = false;
  }
};

getData();
</script>

<template>
  <Modal
    esc-close
    title="전송 이력"
    width="800px"
    v-model="isShow"
  >
    <template #body>
      <ListTable
        ref="listTable"
        class="border"
        :height="350"
        :header="tableHeader"
        :items="list"
        :loading="dataLoading"
      >
        <template #items="{ props }: ListTableItemSlot<any>">
          <tr :key="`list-${props.dbUid}`">
            <td>{{ util.getDateFormat(props.sendDatetime, 'Y-m-d H:i:s') }}</td>
            <td>{{ props.company }}</td>
            <td>
              <div class="flex-center gap-x-2">
                <SvgIcon
                  type="mdi"
                  :path="mdiCheckboxBlankCircle"
                  :size="14"
                  :class="[
                    'mr-1',
                    'font-sm',
                    { 'text-red': !props.sendResult, 'text-green': props.sendResult }
                  ]"
                />
                {{ props.sendResult ? '성공' : '실패' }}
              </div>
            </td>
            <td>
              <Tooltip left btn-close>
                <template #default="{ toggle }">
                  <div class="flex-center" @click="toggle">
                    전송로그
                    <SvgIcon
                      type="mdi"
                      size="15"
                      :path="mdiHelpCircleOutline"
                    />
                  </div>
                </template>

                <template #content="{ close }: { close: Function }">
                  <div class="tooltip-popup">
                    <div class="flex-center-between mb-5">
                      <div class="font-lg">Request Log</div>
                      <a href="#" class="flex" @click.stop.prevent="close()">
                        <SvgIcon
                          type="mdi"
                          class="close"
                          :path="mdiWindowClose"
                        />
                      </a>
                    </div>
                    <div class="log-box">
                      <div><b>Send date:</b> {{ util.getDateFormat(props.sendDatetime, 'Y-m-d H:i:s') }}</div>
                      <div><b>URL:</b> {{ props.sendUrl }}</div>
                      <div><b>Parameter:</b> {{ props.sendParam }}</div>
                    </div>

                    <div class="font-lg mb-5 mt-20">Response Log</div>
                    <div class="log-box">
                      <div>{{ props.sendResponse }}</div>
                    </div>
                  </div>
                </template>
              </Tooltip>
            </td>
          </tr>
        </template>
      </ListTable>
    </template>

    <template #action="{ close }">
      <StyledButton outline @click="close">
        닫기
      </StyledButton>
    </template>
  </Modal>
</template>
