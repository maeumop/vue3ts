<script setup lang="ts">
import { ref, watch, inject, onUnmounted } from 'vue';
import { useUtil } from '@/js/util';
import { useMediaUtmCodeApi } from '@/api/modules/mediaUtmCodeApi';
import XLSX, { writeFileXLSX } from 'xlsx';
import { v1 as uuid } from 'uuid';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ListTableItemSlot } from '@/components/ListTable/types';
import type { WorkBook, WorkSheet } from 'xlsx';
import type { KeyIndex } from '@/components/types';
import { mdiCheckboxBlankCircle, mdiHelpCircleOutline } from '@/assets/svg/path';
import { getUtmValuesCountMsg, getUtmsMsg, postUtmValuesMsg } from '@/constants/api/mediaUtmCodeApi';
import type { GetUtmsItem, GetUtmsRes } from '@/types/api/mediaUtmCodeApi';

const MessageBox = inject('MessageBox') as MessageBoxModel;
const mediaUtmCodeApi = useMediaUtmCodeApi();
const util = useUtil();

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'refresh'): void
}>();

const props = defineProps<{
  data: KeyIndex<string>[];
}>();

// 팝업 기본 설정 ====================
const modal = ref<ModalModel>();

let isShowResult = ref<boolean>(true);
watch(isShowResult, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

let failData = ref<KeyIndex<string>[]>([]);
/**
 * 실패 목록 다운로드
 * @param data 업로드된 엑셀 데이터
 */
const downloadFailList = (data: KeyIndex<string>[]): void => {
  const ws: WorkSheet = XLSX.utils.json_to_sheet(
    data.map((item: KeyIndex<string>) => {
      return {
        사유: item['사유'],
        'UTM 파라미터': item['UTM 파라미터'],
        '파라미터 값': item['파라미터 값'],
        설명: item['설명'],
      };
    })
  );

  const wb: WorkBook = XLSX.utils.book_new();
  const wsCols = [
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 40 },
  ];

  ws['!cols'] = wsCols;
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  const today = util.getDateFormat(new Date());
  writeFileXLSX(wb, `utm_failDataList_${today}.xlsx`);
};

let isCheckedUtmValue = ref<boolean>(false);
/**
 * 파라미터 값 중복, 유효성 체크
 */
const getUtmValuesCount = async (param: string) => {
  try {
    const { code, results } = await mediaUtmCodeApi.getUtmValuesCount({
      utmParamValue: param
    });

    if (code === getUtmValuesCountMsg.UTM_VALUES_COUNT_SUCCESS) {
      if (!results.isExist) {
        isCheckedUtmValue.value = true;

      } else {
        isCheckedUtmValue.value = false;
      }
    }

  } catch (err) {
    console.log(err);
    isCheckedUtmValue.value = false;
  }
};

/**
 * 데이터 row별 유효성 검사
 * @param item
 */
const validateData = async (item: KeyIndex<string>, uid: string): Promise<void> => {
  let reason = [];
  // UTM 파라미터
  if (!item['UTM 파라미터'] || !uid) {
    reason.push('파라미터');
    item['결과'] = '실패';
  }

  // 파라미터 값 - 유효성
  if (!util.getRegExp('code').test(item['파라미터 값']) || !item['파라미터 값']) {
    reason.push('유효성');
    item['결과'] = '실패';

  } else {
    // 파라미터 값 - 중복
    await getUtmValuesCount(item['파라미터 값']);

    if (!isCheckedUtmValue.value && item['파라미터 값']) {
      reason.push('중복');
      item['결과'] = '실패';
    }
  }

  let reasons: string = reason.join(', ');
  item['사유'] = reasons;
};

let utmList = ref<GetUtmsItem[]>([]);
/**
 * utm 목록
 */
const getUtms = async (): Promise<void> => {
  try {
    const { code, results } = await mediaUtmCodeApi.getUtms();

    if (code === getUtmsMsg.UTM_LIST_GET_SUCCESS) {
      utmList.value = results.utmParams;
    }

  } catch (err) {
    util.axiosErrorCatch<GetUtmsRes>(err);
  }
};

/**
 * utm 파라미터 값 등록
 * @param item 각 데이터 row
 * @param uid 파라미터 값 uid
 */
const postUtmValues = async (item: KeyIndex<string>, uid: string): Promise<void> => {
  try {
    const { code } = await mediaUtmCodeApi.postUtmValues({
      utmParamValueUid: uuid(),
      utmParamUid: uid,
      utmParamValue: item['파라미터 값'],
      description: item['설명'] ?? '',
    });

    if (code === postUtmValuesMsg.UTM_VALUES_INSERT_SUCCESS) {
      item['결과'] = '성공';
      successCount.value++;

    } else {
      item['결과'] = '실패';
    }

  } catch (err) {
    item['사유'] = '고객센터 문의';
    item['결과'] = '실패';

    console.log(err);
    // util.axiosErrorCatch<PostUtmValuesRes>(err);
  }
};

let resultList = ref<KeyIndex<string>[]>(props.data);
let progressRate = ref<number>(0);
let isExistFailData = ref<boolean>(false);

// 현황 카운트
let processingCount = ref<number>(0);
let failCount = ref<number>(0);
let successCount = ref<number>(0);
let completeCount = ref<number>(0);
/**
 * 데이터 등록 결과 업데이트
 */
const updateResult = async (): Promise<void> => {
  await getUtms();

  processingCount.value = resultList.value.length;

  resultList.value.map(async (item: KeyIndex<string>) => {
    const uid = utmList.value.find(param => param.utmParam === item['UTM 파라미터'])?.utmParamUid ?? '';

    await validateData(item, uid);

    if (item['결과'] === '처리중') {
      postUtmValues(item, uid);

    } else {
      failData.value.push(item);
      failCount.value++;
    }

    processingCount.value--;
    completeCount.value++;

    progressRate.value = Math.round(
      (completeCount.value / resultList.value.length) * 100
    );

    if (progressRate.value === 100 && failData.value.length) {
      isExistFailData.value = true;
    }
  });
};

/**
 * 결과에 따라 클래스 적용
 * @param result 결과 값
 */
const setResultClass = (result: string): string => {
  const resultClasses: KeyIndex<string> = {
    '실패': 'text-red',
    '성공': 'text-green',
    default: 'text-orange',
  };

  return resultClasses[result] ?? resultClasses.default;
};

const closeModal = (): void => {
  if (isExistFailData.value) {
    openCloseAlert();
  } else {
    modal.value!.close();
  }
};

const openCloseAlert = (): void => {
  MessageBox.confirm({
    title: '업로드 결과 창을 닫으시겠습니까?',
    message:
      "창을 닫으시면 '실패 목록'을 다운로드할 수 없습니다. 창을 닫으시겠습니까?",
    btnOkayText: '실패 목록 다운로드 후 창 닫기',
    btnCancelText: '업로드 결과 창 닫기',
    escCancel: false,
    okay: () => {
      close();
    },
    cancel: () => {
      modal.value!.close();
    },
  });
};
const tooltipText: string[] = [
  '파라미터 : 존재하지 않은 ‘UTM 파라미터’ 입력 시',
  '유효성 : ‘파라미터 값’ 값이 존재 하지 않거나, 허용 되지 않은 문자 입력 시(입력가능 문자 : 영문, 대소문자, 숫자, 특수문자 ‘-(하이픈)’, ’_(언더바)’)',
  '중복 : 이미 등록된 ‘파라미터값’ 존재 시',
  '고객센터 문의 : 정의되지 않은 사유로 실패가 발생한 경우로 고객센터에 문의를 남겨주세요.'
];


// Create
updateResult();

onUnmounted(() => {
  emit('refresh');
});
</script>

<template>
  <Modal
    hide-close
    ref="modal"
    class="batchResultModal"
    title="업로드 결과"
    width="1200px"
    v-model="isShowResult"
  >
    <template #body>
      <div>
        <div class="flex-center height-36">
          <span class="width-150">업로드 파라미터 값 수</span>
          <span>{{ props.data.length }}개</span>
        </div>
        <div class="flex-center height-36">
          <span class="width-150">업로드 결과</span>
          <div class="resultBox">
            <div>
              <SvgIcon
                type="mdi"
                class="text-orange"
                :path="mdiCheckboxBlankCircle"
                :size="14"
              />
              처리중 <span class="text-orange">{{ processingCount }}</span>건 /
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
              실패 <span class="text-red">{{ failCount }}</span>건
            </div>
          </div>
          <StyledButton
            block
            small
            outline
            class="ml-10"
            :disabled="!isExistFailData"
            @click="downloadFailList(failData)"
          >
            실패 목록 다운로드
          </StyledButton>
        </div>

        <div class="progressbar">
          <div :class="`width-p-${progressRate}`">
            {{ progressRate }}%
          </div>
        </div>
      </div>

      <ul class="info-box-bullet my-20">
        <li>
          업로드 진행 중 프로세스 종료 시(화면 이동, 새로고침 등) 업로드가
          원활하게 이루어지지 않을 수 있습니다. 업로드 처리가 완료될 때까지 잠시
          기다려주세요.
        </li>
      </ul>

      <div>
        <span class="font-lg block mb-10">업로드 목록</span>

        <ListTable ref="listTable" :height="450" :items="resultList">
          <template #header>
            <tr>
              <th width="120">
                결과
              </th>
              <th width="400" class="reason">
                사유
                <Tooltip
                  right
                  icon-size="16px"
                  padding="15px 5px"
                  class="icon"
                  :icon="mdiHelpCircleOutline"
                  :width="410"
                  :message="tooltipText"
                />
              </th>
              <th width="160">
                UTM 파라미터
              </th>
              <th width="160">
                파라미터 값
              </th>
              <th width="350">
                설명
              </th>
            </tr>
          </template>

          <template #items="{ props }: ListTableItemSlot<KeyIndex<string>>">
            <tr>
              <td>
                <div class="flex-center gap-x-2">
                  <SvgIcon
                    type="mdi"
                    :path="mdiCheckboxBlankCircle"
                    :size="14"
                    :class="['mr-1', 'font-sm', setResultClass(props['결과'])]"
                  />
                  {{ props["결과"] }}
                </div>
              </td>
              <td>
                <template v-if="props['사유']">
                  <span
                    :key="`key-${index}`"
                    class="label"
                    v-for="(item, index) in props['사유'].split(', ')"
                  >
                    {{ item }}
                  </span>
                </template>
                <template v-else>
                  -
                </template>
              </td>
              <td>{{ props["UTM 파라미터"] }}</td>
              <td>{{ props["파라미터 값"] }}</td>
              <td>{{ props["설명"] }}</td>
            </tr>
          </template>
        </ListTable>
      </div>
    </template>

    <template #action="">
      <StyledButton
        color="primary"
        :disabled="!(progressRate === 100)"
        @click="closeModal"
      >
        확인
      </StyledButton>
    </template>
  </Modal>
</template>