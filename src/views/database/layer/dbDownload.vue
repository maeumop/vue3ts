<script setup lang="ts">
import axios from 'axios';
import { v1 as uuid } from 'uuid';
import { computed, ref, watch, inject } from 'vue';
import { getApiErrorMessage } from '@/message/apiResponse';
import { useUtil } from '@/js/util';

import { useSessionStore } from '@/store';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type {
  GetDbsDownloadParam, GetDbsDownloadRes, GetDbsDownloadItem,
  PostDbsDownloadParam, PostDbsDownloadRes,
  PatchDbsDownloadRes,
} from '@/types/api/databaseApi';
import { postDbsDownloadMsg } from '@/constants/api/databaseApi';

import type { Rules } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { DatePickerModel } from '@/components/Form/DatePicker/types';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { ConstDownloadKeys } from '@/types/common';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const sessionStore = useSessionStore();
const databaseApi = useDatabaseApi();
const Toast = inject('Toast') as ToastModel;

const props = defineProps<{
  type: ConstDownloadKeys;
}>();

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
  { text: '요청일', width: '180' },
  { text: '요청내역' },
  { text: '다운로드', width: '180' },
];

const validateForm = ref<ValidateFormModel>();
const rules: Rules = {
  input: [ v => !!v || '필수 입력 사항 입니다.' ],
  date: [ v => !!v || '필수 입력 사항 입니다.' ],
};

const memberUid = computed(() => sessionStore.getUid);
const datePicker = ref<DatePickerModel>();

let rangeDate = ref<string[]>(['', '']);
let id = computed(() => sessionStore.getMemberEmail);
let password = ref<string>('');

/**
 * 다운로드 리스트 업데이트
 * @param addData 추가된 데이터
 */
const addData = (addData: GetDbsDownloadItem | any) => {
  list.value.unshift({ ...addData });
};


let isLoad = ref<boolean>(false);
/**
 * 엑셀 파일 생성 API 호출
 */
const onCreateFile = async (): Promise<void> => {
  if (!validateForm.value!.validate()) {
    return;
  }

  isLoad.value = true;
  const param: PostDbsDownloadParam = {
    dbDownloadUid: uuid(),
    memberUid: memberUid.value,
    password: password.value,
    startDatetime: +new Date(`${rangeDate.value[0]} 00:00:00`),
    endDatetime: +new Date(`${rangeDate.value[1]} 00:00:00`) + (60 * 60 * 24 * 1000) - 1,
    downloadType: props.type
  };

  try {
    const nowTime = Date.now();
    const { results }: PostDbsDownloadRes = await databaseApi.postDbsDownload(param);
    Toast('엑셀파일 생성 요청이 완료되었습니다.');

    const newData: GetDbsDownloadItem = {
      dbDownloadUid: param.dbDownloadUid,
      memberEmail: id.value,
      dbCount: results.dbsCount,
      downloadType: props.type,
      filePath: results.filePath,
      isDownload: 0,
      downloadDatetime: 0,
      startDatetime: param.startDatetime,
      endDatetime: param.endDatetime,
      regDatetime: nowTime,
    };
    addData(newData);

    password.value = '';
    datePicker.value?.resetForm();

  } catch (err) {
    if (axios.isAxiosError<PostDbsDownloadRes, any>(err)) {
      const { response } = err;

      if (response) {
        const { code } = response.data;
        const msg = getApiErrorMessage(code);

        if (code === postDbsDownloadMsg.DBS_NOT_FOUND) {
          Toast({ color: 'danger', message: msg });

        } else if (code === postDbsDownloadMsg.INVALID_PASSWORD) {
          Toast({ color: 'warning', message: '비밀번호가 일치하지 않습니다.' });
        } else {
          Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });
        }
      }
    } else {
      console.error(err);
    }

  } finally {
    isLoad.value = false;
  }
};

let downloadBtnloading = ref<number>(-1);
/**
 * 엑셀 다운로드 버튼 클릭
 * @param index  list index
 */
const onDownlod = async (index: number): Promise<void> => {
  downloadBtnloading.value = index;

  try {
    const { results } = await databaseApi.patchDbsDownload(list.value[index].dbDownloadUid, { memberUid: memberUid.value });

    let fileNm = Date.now();
    let bytes = new Uint8Array(results.file.data);
    let blob = new Blob([bytes]);
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `dbs_admaker_${fileNm}.xlsx`;
    link.click();
    link.remove();
    window.URL.revokeObjectURL(link.href);

    list.value[index].downloadDatetime = Date.now();
    list.value[index].isDownload = 1;

  } catch (err) {
    util.axiosErrorCatch<PatchDbsDownloadRes>(err);
  } finally {
    downloadBtnloading.value = -1;
  }
};

let list = ref<GetDbsDownloadItem[]>([]);
let dataLoading = ref<boolean>(false);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;
let totalCount: number = 0;

const getData = async (): Promise<void> => {
  if (dataLoading.value) {
    return;
  }

  dataLoading.value = true;
  try {
    const params: GetDbsDownloadParam = {
      limit,
      downloadType: props.type,
    };
    if (cursor.value) {
      params.cursor = cursor.value;
    }
    const { results }: GetDbsDownloadRes = await databaseApi.getDbsDownload(params);
    results.downloads.forEach(item => list.value.push(item));
    rangeDate.value = [util.getDateFormat(results.downloads[0].startDatetime, 'Y-m-d'), util.getDateFormat(results.downloads[0].endDatetime, 'Y-m-d')];

    totalCount = results.totalCount;
    observer.value = !(totalCount <= list.value.length);
    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].regDatetime;
    }

  } catch (err) {
    util.axiosErrorCatch<GetDbsDownloadRes>(err);

  } finally {
    dataLoading.value = false;
  }
};

getData();
</script>

<template>
  <Modal
    esc-close
    title="엑셀 다운로드"
    width="800px"
    v-model="isShow"
  >
    <template #body>
      <div id="databaseList">
        <div class="font-lg">
          기본정보
        </div>

        <ValidateForm ref="validateForm">
          <DatePicker
            block
            range
            required
            ref="datePicker"
            class="mt-20"
            label="접수기간"
            :placeholder="['시작일 선택', '종료일 선택']"
            :validate="rules.date"
            v-model="rangeDate"
          />

          <div class="mt-20 flex gap-8">
            <div class="col">
              <TextField
                block
                required
                readonly
                label="아이디"
                v-model="id"
              />
            </div>
            <div class="col">
              <TextField
                block
                required
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력해주세요."
                :max-length="16"
                :validate="rules.input"
                v-model="password"
              />
            </div>
          </div>
        </ValidateForm>

        <ul class="info-box-bullet mb-20 mt-10">
          <li>생성된 파일은 요청자만 1회 다운로드할 수 있습니다.</li>
        </ul>

        <div class="flex-center-center">
          <StyledButton
            color="primary"
            :loading="isLoad"
            @click="onCreateFile"
          >
            엑셀파일 생성
          </StyledButton>
        </div>

        <div class="divider my-20"></div>

        <div class="font-lg mb-10">
          다운로드 리스트
        </div>

        <ListTable
          ref="listTable"
          class="border"
          :height="`550px`"
          :header="tableHeader"
          :items="list"
          :loading="dataLoading"
          :observer="observer"
          @observe="getData"
        >
          <template #items="{ props, index }: ListTableItemSlot<GetDbsDownloadItem>">
            <tr :key="`list-${props.dbDownloadUid}`">
              <td>
                {{ util.getDateFormat(props.regDatetime, 'Y-m-d H:i:s') }}
              </td>
              <td>
                접수기간: {{ util.getDateFormat(props.startDatetime, 'Y-m-d') }} ~ {{ util.getDateFormat(props.endDatetime, 'Y-m-d') }}<br />
                DB수량: {{ props.dbCount }}개<br />
                요청자: {{ props.memberEmail }}
              </td>
              <td>
                <template v-if="!props.filePath">
                  <StyledButton small color="primary">
                    생성중
                  </StyledButton>
                </template>

                <template v-else-if="props.isDownload">
                  {{ util.getDateFormat(props.downloadDatetime, 'Y-m-d H:i:s') }}
                </template>

                <template v-else>
                  <StyledButton
                    small
                    color="primary"
                    :loading="index === downloadBtnloading"
                    @click.prevent="onDownlod(index)"
                  >
                    다운로드
                  </StyledButton>
                </template>
              </td>
            </tr>
          </template>
        </ListTable>

        <div class="pt-10"></div>
      </div>
    </template>

    <template #action="{ close }">
      <StyledButton outline @click="close">
        닫기
      </StyledButton>
    </template>
  </Modal>
</template>
