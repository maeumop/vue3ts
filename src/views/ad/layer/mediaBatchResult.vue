<script setup lang="ts">
import { ref, watch, inject, onUnmounted, onMounted } from 'vue';
import { useMediaStore, } from '@/store';
import XLSX, { writeFileXLSX } from 'xlsx';
import { v1 as uuid } from 'uuid';
import { useUtil } from '@/js/util';
import { useMediaUtmCodeApi } from '@/api/modules/mediaUtmCodeApi';
import { getMediasMsg, getCodesCountMsg, postCodesMsg } from '@/constants/api/mediaUtmCodeApi';
import type { MessageBoxModel, } from '@/components/MessageBox/types';
import type{ ListTableItemSlot } from '@/components/ListTable/types';
import type { WorkBook, WorkSheet } from 'xlsx';
import type { KeyIndex } from '@/components/types';
import type { ModalModel } from '@/components/Modal/types';
import type { GetMediasItem, GetMediasRes, } from '@/types/api/mediaUtmCodeApi';
import { mdiCheckboxBlankCircle, mdiHelpCircleOutline } from '@/assets/svg/path';

const mediaStore = useMediaStore();

const {
  getMediaUid
} = mediaStore;

const MessageBox = inject('MessageBox') as MessageBoxModel;
const mediaUtmCodeApi = useMediaUtmCodeApi();
const util = useUtil();

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'refresh'): void
}>();

const props = defineProps<{
  data: KeyIndex<string>[]
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

let mediaList = ref<GetMediasItem[]>([]);
/**
 * 매체 목록 불러오기
 */
const getMedias = async (): Promise<void> => {
  try {
    const { code, results } = await mediaUtmCodeApi.getMedias({
      search: '',
      cursor: '',
      limit: 10000
    });

    if (code === getMediasMsg.MEDIA_LIST_GET_SUCCESS) {
      mediaList.value = results.medias;
    }

  } catch (err) {
    util.axiosErrorCatch<GetMediasRes>(err);
  }
};

let failData = ref<KeyIndex<string>[]>([]);
/**
 * 실패 목록 다운로드
 * @param data 업로드된 엑셀 데이터
 */
const downloadFailList = (data: KeyIndex<string>[]): void => {
  const ws: WorkSheet = XLSX.utils.json_to_sheet(data.map((item: KeyIndex<string>) => {
    return {
      '사유': item['사유'],
      '매체명': item['매체명'],
      '매체 코드명': item['매체코드'],
      '설명': item['설명']
    };
  }));

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
  writeFileXLSX(wb, `mediaCode_failDataList_${today}.xlsx`);
};

/**
 * 데이터 row별 유효성 검사
 * @param item
 */
const validateData = async (item: KeyIndex<string>, uid: string): Promise<void> => {
  const reason = [];
  // 매체명 - 매체명이 없거나 유효한 매체명이 아닌경우
  if (!item['매체명'] || !uid) {
    reason.push('매체명');
    item['결과'] = '실패';
  }

  // 매체코드 - 유효성
  if (!util.getRegExp('code').test(item['매체코드']) || !item['매체코드']) {
    reason.push('유효성');
    item['결과'] = '실패';

  } else {
    // 매체코드 - 중복
    await getCodesCount(item['매체코드']);

    if (!isCheckedMediaCode.value && item['매체코드']) {
      reason.push('중복');
      item['결과'] = '실패';
    }
  }

  const reasons: string = reason.join(', ');
  item['사유'] = reasons;
};

/**
 * 매체코드 중복, 유효성 체크
 */
const getCodesCount = async (mediaCode: string): Promise<void> => {
  try {
    const { code, results } = await mediaUtmCodeApi.getCodesCount({
      mediaCode
    });

    if (code === getCodesCountMsg.MEDIA_CODE_COUNT_SUCCESS) {
      if (!results.isExist) {
        isCheckedMediaCode.value = true;

      } else {
        isCheckedMediaCode.value = false;
      }
    }

  } catch (err) {
    console.log(err);
  }
};

/**
 * 매체코드 등록
 * @param item 매체코드 객체
 * @param uid
 */
const postCodes = async (item: KeyIndex<string>, uid: string): Promise<void> => {
  try {
    const { code } = await mediaUtmCodeApi.postCodes({
      mediaUid: uid,
      mediaCodeUid: uuid(),
      mediaCode: item['매체코드'],
      description: item['설명'] ?? '',
    });

    if (code === postCodesMsg.MEDIA_CODE_INSERT_SUCCESS) {
      item['결과'] = '성공';
      successCount.value++;

    } else {
      item['결과'] = '실패';
    }

  } catch (err) {
    item['사유'] = '고객센터 문의';
    item['결과'] = '실패';
  }
};

let resultList = ref<KeyIndex<string>[]>(props.data);
let isExistFailData = ref<boolean>(false);
let isCheckedMediaCode = ref<boolean>(false);

// 현황 카운트
let progressRate = ref<number>(0);
let processingCount = ref<number>(0);
let failCount = ref<number>(0);
let successCount = ref<number>(0);
let completeCount = ref<number>(0);
/**
 * 데이터 등록 결과 업데이트
 */
const updateResult = () => {
  processingCount.value = resultList.value.length;

  resultList.value.forEach(async (item: KeyIndex<string>) => {
    const uid: string = getMediaUid(mediaList.value, item['매체명']);

    // 데이터 유효성 검사
    await validateData(item, uid);

    if (item['결과'] === '처리중') {
      postCodes(item, uid);

    } else {
      failData.value.push(item);
      failCount.value++;
    }

    processingCount.value--;
    completeCount.value++;

    progressRate.value = Math.round((completeCount.value / resultList.value.length) * 100);

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
    message: `창을 닫으시면 '실패 목록'을 다운로드할 수 없습니다. 창을 닫으시겠습니까?`,
    btnOkayText: '실패 목록 다운로드 후 창 닫기',
    btnCancelText: '업로드 결과 창 닫기',
    escCancel: false,

    okay: () => {
      close();
    },
    cancel: () => {
      modal.value!.close();
    }
  });
};

const tooltipText: string[] = [
  '매체명 : 존재하지 않은 ‘매체명’ 입력 시',
  '유효성 : ‘매체 코드명’ 값이 존재 하지 않거나, 허용 되지 않은 문자 입력 시(입력가능 문자 : 영문, 대소문자, 숫자, 특수문자 ‘-(하이픈)’, ’_(언더바)’)',
  '중복 : 이미 등록된 ‘매체 코드명’ 존재 시',
  '고객센터 문의 : 정의되지 않은 사유로 실패가 발생한 경우로 고객센터에 문의를 남겨주세요.',
];


onMounted(async () => {
  await getMedias();
  updateResult();
});

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
          <span class="width-150">업로드 매체 코드 수</span>
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
        <li>업로드 진행 중 프로세스 종료 시(화면 이동, 새로고침 등) 업로드가 원활하게 이루어지지 않을 수 있습니다. 업로드 처리가 완료될 때까지 잠시 기다려주세요.</li>
      </ul>

      <div>
        <span class="font-lg block mb-10">업로드 목록</span>

        <ListTable
          ref="listTable"
          :height="450"
          :items="resultList"
        >
          <template #header>
            <tr>
              <th width="120">
                결과
              </th>
              <th width="330" class="reason">
                사유
                <Tooltip
                  right
                  icon-size="16px"
                  padding="15px 5px"
                  :icon="mdiHelpCircleOutline"
                  :width="410"
                  :message="tooltipText"
                />
              </th>
              <th width="150">
                매체명
              </th>
              <th width="150">
                매체 코드명
              </th>
              <th width="300">
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
                    :class="['mr-1','font-sm', setResultClass(props['결과'])]"
                  />
                  {{ props['결과'] }}
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
              <td>{{ props['매체명'] }}</td>
              <td>{{ props['매체코드'] }}</td>
              <td>{{ props['설명'] }}</td>
            </tr>
          </template>
        </ListTable>
      </div>
    </template>

    <template #action>
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