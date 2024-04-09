<script setup lang="ts">
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ref, watch, computed, inject } from 'vue';
import { useUtil } from '@/js/util';
import { mdiCheckboxBlankCircle, mdiHelpCircleOutline, mdiWindowClose } from '@/assets/svg/path';
import { useDatabaseApi } from '@/api/modules/databaseApi';
import { postApisSendMsg, getApisSendMsg } from '@/constants/api/databaseApi';
import type { SendResultPropsData, _SendItem, _PostApisSendParam } from '@/types/db';
import type { GetApisSendRes, PostApisSendParam, PostApisSendRes } from '@/types/api/databaseApi';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const router = useRouter();
const databaseApi = useDatabaseApi();
const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;

const props = defineProps<{
  checkList: string[];
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'on:update', value: SendResultPropsData): void;
}>();

// 팝업 기본 설정 ====================
let isShow = ref(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

const modal = ref<ModalModel>();

// 현황 카운트
let selectedCount = ref<number>(0);
let totalCount = ref<number>(0);
let waitingCount = ref<number>(0);
let successCount = ref<number>(0);
let failCount = ref<number>(0);
let notConnectCount = ref<number>(0);

const progressRate = computed(() => {
  return Math.floor(((successCount.value + failCount.value) / (totalCount.value - notConnectCount.value)) * 100) || 0;
});

// ListTable
const tableHeader: ListTableHeader[] = [
  { text: '이름', width: '110' },
  { text: '연락처', },
  { text: '업체명', width: '180' },
  { text: '전송결과', width: '120' },
  { text: '전송로그', width: '180'  },
];

let list = ref<_SendItem[]>([]);

let sendLoading = ref(false);
let listLoading = ref(true);
let isDisabled = ref(true);

let apiSendResult: SendResultPropsData = {};

/**
 * API전송 완료 후 닫기인지, 전송이전 닫기인지 체크
 */
const close = (): void => {
  if (progressRate.value === 100) {
    sendList.forEach(item => {
      if (apiSendResult[item.dbUid].sendDatetime < list.value[item.index].sendDatetime) {
        apiSendResult[item.dbUid].sendDatetime = list.value[item.index].sendDatetime;
        apiSendResult[item.dbUid].result = list.value[item.index].sendResult;
      }
    });

    emit('on:update', apiSendResult);
  }
  modal.value!.close();
};


/**
 * API 전송
 * @param param { dbUid: dbUid, apiUid: apiUid }
 * @param callback
 */
const onSend = async (param: PostApisSendParam, callback: Function): Promise<void> => {
  try {
    await databaseApi.postApisSend(param)
      .then((res: PostApisSendRes) => {
        callback(res);
      });

  } catch (err) {
    callback();
    console.error(err);
  }
};

const sendList: _PostApisSendParam[] = [];
const onClickSend = (): void => {
  sendLoading.value = true;

  sendList.forEach(item => {
    onSend({ dbUid: item.dbUid, apiUid: item.apiUid }, (res?: PostApisSendRes): void => {
      if (res) {
        if (res.code === postApisSendMsg.API_SEND_COMPLETE) {
          list.value[item.index].apiSendHistoryUid = res.results.apiSendHistoryUid;
          list.value[item.index].url = res.results.url;
          list.value[item.index].parameter = res.results.parameter;
          list.value[item.index].sendResponse = res.results.sendResponse;
          list.value[item.index].sendDatetime = res.results.sendDatetime;

          res.results.sendResult ? successCount.value++ : failCount.value++;
          list.value[item.index].sendResult = res.results.sendResult;
        }

      } else {
        failCount.value++;
        list.value[item.index].sendResult = 0;
        list.value[item.index].sendDatetime = 0;
      }

      waitingCount.value--;

      if (waitingCount.value === 0) {
        sendLoading.value = false;
        isDisabled.value = true;
      }
    });
  });
};

/**
 * 연동 내역 없음 MessageBox
 */
const apiNotFound = () => {
  MessageBox.confirm({
    title: 'API 연동 내역이 존재하지 않습니다.',
    message: 'API 연동 후 전송이 가능합니다. 연동 후 다시 시도 해주세요.',
    btnOkayText: 'API 연동 바로가기',
    btnCancelText: '다음에 연동하기',
    okay: () => {
      router.push('/database/apiSetting');
    },
    cancel: () => {
      modal.value!.close();
    }
  });
};


/**
 * api 전송 목록 조회 API 호출
 */
const getData = async (): Promise<void> => {
  try {
    const { results }: GetApisSendRes = await databaseApi.getApisSend({ dbs: props.checkList.join(',') });

    results.sendList.forEach((item, index) => {
      apiSendResult[item.dbUid] = { result: 0, sendDatetime: 0 };
      list.value.push({ ...item, sendResult: 2, sendDatetime: 0 });
      if (item.apiUid) {
        sendList.push({ index, dbUid: item.dbUid, apiUid: item.apiUid });
      } else {
        notConnectCount.value++;
      }
    });

    selectedCount.value = results.dbsCount;
    totalCount.value = results.sendCount;
    waitingCount.value = results.sendCount - notConnectCount.value;
    isDisabled.value = false;

  } catch (err) {
    if (axios.isAxiosError<GetApisSendRes, any>(err)) {
      const { response } = err;

      if (response) {
        const { code } = response.data;
        if (code === getApisSendMsg.API_NOT_FOUND) {
          // 연동내역 없을 때 메시지 박스 출력
          apiNotFound();
        } else {
          Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });
        }
      }

    } else {
      console.error(err);
    }

  } finally {
    listLoading.value = false;
  }
};

getData();
</script>

<template>
  <Modal
    hide-close
    ref="modal"
    title="전송 처리 내역"
    width="800px"
    v-model="isShow"
  >
    <template #body>
      <div id="uploadResult">
        <div class="flex-center height-36">
          <span class="width-150">선택 DB 수(전송 수)</span>
          <span>{{ selectedCount }}개 ({{ totalCount }}개)</span>
        </div>
        <div class="flex-center height-36">
          <span class="width-150">업로드 결과</span>
          <div class="resultBox">
            <div>
              <SvgIcon
                type="mdi"
                class="text-dark"
                :path="mdiCheckboxBlankCircle"
                :size="14"
              />
              대기 <span class="text-dark">{{ waitingCount }}</span>건 /
            </div>
            <div>
              <SvgIcon
                type="mdi"
                class="text-green"
                :path="mdiCheckboxBlankCircle"
                :size="14"
              />
              성공 <span class="text-green">{{ successCount }}</span>건 /
            </div>
            <div>
              <SvgIcon
                type="mdi"
                class="text-red"
                :path="mdiCheckboxBlankCircle"
                :size="14"
              />
              실패 <span class="text-red">{{ failCount }}</span>건 /
            </div>
            <div>
              <SvgIcon
                type="mdi"
                class="text-orange"
                :path="mdiCheckboxBlankCircle"
                :size="14"
              />
              연동필요 <span class="text-orange">{{ notConnectCount }}</span>건
            </div>
          </div>
        </div>

        <div class="progressbar">
          <div :style="`width: ${progressRate}%`">
            {{ progressRate }}%
          </div>
        </div>
      </div>

      <ul class="info-box-bullet my-20">
        <li>
          1개의 ‘고객 DB’를 여러 업체에 전송 시 ‘선택 DB 수’와 ‘전송 수’는
          차이가 있을 수 있습니다.
        </li>
        <li>
          전송 중 프로세스 종료 시(화면 이동, 새로고침 등) 전송이 원활하게
          이루어지지 않을 수 있습니다. 전송이 완료될 때까지 잠시 기다려주세요.
        </li>
      </ul>

      <div class="font-lg mb-10">전송 목록</div>

      <ListTable
        ref="listTable"
        class="border"
        :height="`calc(95vh - 165px  - 330px)`"
        :header="tableHeader"
        :loading="listLoading"
        :items="list"
      >
        <template #items="{ props }: ListTableItemSlot<_SendItem>">
          <tr :key="`list-${props.dbUid}`">
            <td>{{ props.name || '-' }}</td>
            <td>{{ props.phone ? props.phone.phoneNumber() : '-' }}</td>
            <td>{{ props.company || '-' }}</td>
            <td>
              <div class="flex-center gap-x-2">
                <SvgIcon
                  type="mdi"
                  :path="mdiCheckboxBlankCircle"
                  :size="14"
                  :class="[
                    'mr-1',
                    'font-sm',
                    { 'text-dark': props.sendResult === 2 },
                    { 'text-red': props.sendResult === 0 },
                    { 'text-green': props.sendResult === 1 },
                  ]"
                />
                <template v-if="props.sendResult !== 2">
                  {{ props.sendResult ? '성공' : '실패' }}
                </template>

                <template v-else>
                  {{ props.apiUid ? '대기' : '연동 필요' }}
                </template>

              </div>
            </td>
            <td>
              <template v-if="!props.apiUid">
                API 연동이 필요한 DB
              </template>

              <template v-else-if="props.sendResult !== 2 && props.sendDatetime > 0">
                <Tooltip right btn-close>
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
                        <div><b>Send date:</b> {{ props.sendDatetime ? util.getDateFormat(props.sendDatetime, 'Y-m-d H:i:s') : '' }}</div>
                        <div><b>URL:</b> {{ props.url }}</div>
                        <div><b>Parameter:</b> {{ props.parameter }}</div>
                      </div>

                      <div class="font-lg mb-10 mt-20">Response Log</div>
                      <div class="log-box">
                        <div>
                          {{ props.sendResponse }}
                        </div>
                      </div>
                    </div>
                  </template>
                </Tooltip>
              </template>
              <template v-else>-</template>
            </td>
          </tr>
        </template>
      </ListTable>
    </template>

    <template #action>
      <StyledButton
        outline
        class="mr-10"
        :disabled="sendLoading"
        @click.prevent="close"
      >
        닫기
      </StyledButton>
      <StyledButton
        color="primary"
        :disabled="isDisabled"
        :loading="sendLoading"
        @click.prevent="onClickSend"
      >
        전송
      </StyledButton>
    </template>
  </Modal>
</template>
