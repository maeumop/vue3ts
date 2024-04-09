<script setup lang="ts">
import { ref, watch, inject, onUnmounted } from 'vue';
import axios from 'axios';
import XLSX, { writeFileXLSX } from 'xlsx';
import { v1 as uuid } from 'uuid';
import { useUtil } from '@/js/util';
import { useDatabaseApi } from '@/api/modules/databaseApi';
import { mdiCheckboxBlankCircle, mdiHelpCircle } from '@/assets/svg/path';
import { booleanYN, CONST_CODES } from '@/constants/common';
import { postDbsMsg } from '@/constants/api/databaseApi';
import type { ListTableItemSlot } from '@/components/ListTable/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ModalModel } from '@/components/Modal/types';
import type { WorkBook, WorkSheet } from 'xlsx';
import type { KeyIndex } from '@/components/types';
import type { PostDbsParam, PostDbsRes } from '@/types/api/databaseApi';

const { BIN, GENDER, REFERER_TYPE } = CONST_CODES;

const MessageBox = inject('MessageBox') as MessageBoxModel;
const util = useUtil();
const databaseApi = useDatabaseApi();

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'refresh'): void
}>();

const props = defineProps<{
  data: PostDbsParam[]
  fieldLabelList: KeyIndex<string>
}>();


let dbFieldLabelList = ref<string[]>([]);

// 필드 정렬
let sortedKeys: string[] = [];
sortedKeys = sortedKeys.concat(
  Object.keys(props.fieldLabelList)
    .filter(key => !sortedKeys.includes(key))
    // .sort()
);

for (const key of sortedKeys) {
  dbFieldLabelList.value.push(props.fieldLabelList[key]);
}

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

let failData = ref<PostDbsParam[]>([]);
/**
 * 실패 목록 다운로드
 * @param failData 실패 목록
 */
const downloadFailList = (failData: KeyIndex<string>[]): void => {
  const ws: WorkSheet = XLSX.utils.json_to_sheet(failData.map((item) => {
    const newItem: KeyIndex<string> = { '사유': item.reasons };

    for (const key of dbFieldLabelList.value) {
      newItem[key] = item[key];
    }
    return newItem;
  }));

  const wb: WorkBook = XLSX.utils.book_new();

  let objectMaxLength: number[] = [];
  // column 너비 계산
  failData.forEach(data => {
    Object.entries(data).forEach(([, value], idx) => {
      let columnValue: string = value;

      objectMaxLength.push(objectMaxLength[idx] >= columnValue.length ? objectMaxLength[idx] : columnValue.length);
    });
  });

  objectMaxLength.pop(); // 결과 필드 삭제

  ws['!cols'] = objectMaxLength.map((w: number) => ({
    width: Math.min(Math.max(w, 20), 50),
  }));

  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  const today = util.getDateFormat(new Date());

  writeFileXLSX(wb, `db_failDataList_${today}.xlsx`);
};

/**
 * db 등록
 * @param item 각 데이터 row
 */
const postDbs =  async (item: PostDbsParam): Promise<void> => {
  try {
    const copiedItem: any = { ...item };
    // 여분 필드 및 필드명 맞추기
    for (const key in props.fieldLabelList) {
      Object.entries(copiedItem).some(([k, v]) => {
        if (props.fieldLabelList[key] === k) {
          // 성별 value 세팅
          if (key === 'gender') {
            if (String(v).toUpperCase() === 'M') {
              copiedItem[key] = GENDER.MALE.VAL;
            } else if (String(v).toUpperCase() === 'F') {
              copiedItem[key]  = GENDER.FEMALE.VAL;
            } else {
              delete copiedItem[k];
            }
          // 유입링크 유효성 검사
          } else if (key === 'referer') {
            if (util.getRegExp('url').test(String(v))) {
              copiedItem[key] = v;
            } else {
              copiedItem[key] = '';
            }
          // 나이 타입 세팅
          } else if (key === 'age') {
            if (!isNaN(Number(v))) {
              copiedItem[key] = Number(v);
            } else {
              delete copiedItem[k];
            }
          // 나이를 제외한 모든 항목의 값은 string으로 세팅
          } else {
            copiedItem[key] = String(v);
          }

          delete copiedItem[k];
        }
      });
    }

    const {
      mediaCode,
      refererIp,
      name,
      phone,
      regDatetime,
      privacyYnDateTime,
      thirdPartyYnDateTime,
      smsYnDateTime,
      thirdPartyYn,
      smsYn,
      ...inputFields
    } = copiedItem;

    inputFields.result = undefined;

    console.log(Date.now());

    const { code }: PostDbsRes = await databaseApi.postDbs({
      dbUid: uuid(),
      refererType: REFERER_TYPE.BATCH.VAL,
      mediaCode,
      name,
      phone,
      regDatetime: Date.now(),
      inputDatetime: regDatetime ? util.getTimestamp(regDatetime) : Date.now(),
      privacyYnDatetime: privacyYnDateTime ? util.getTimestamp(privacyYnDateTime) : Date.now(),
      thirdPartyYnDatetime: util.getTimestamp(thirdPartyYnDateTime),
      smsYnDatetime: util.getTimestamp(smsYnDateTime),
      thirdPartyYn: (thirdPartyYn.toUpperCase() === 'Y') ? booleanYN.Y : booleanYN.N,
      smsYn: (smsYn.toUpperCase() === 'Y') ? booleanYN.Y : booleanYN.N,
      privacyYn: booleanYN.Y, // 고정 값
      ...refererIp.split('.').length === 4 ? { refererIp } : {},
      ...inputFields
    });

    if (code === postDbsMsg.DBS_REGISTRATION_SUCCESS) {
      item.result = '성공';
      successCount.value++;

    } else {
      item.result = '실패';
      failData.value.push(item);
      failCount.value++;
    }

  } catch (err) {
    if (axios.isAxiosError<PostDbsRes>(err)) {
      const { response } = err;

      if (response) {
        const { code, message } = response.data;
        // DB의 데이터가 유효하지 않은 경우 사유 추가
        if (code === 'INVALID_DB') {
          let reasons: string[] = message?.filtered?.split(',') ?? [];

          if (!reasons.length && message?.filtered) {
            reasons.push(message.filtered);
          }

          reasons.forEach((item, i) => {
            switch (item) {
              case BIN.PHONE.VAL:
                reasons[i] = BIN.PHONE.TXT;
                break;
              case BIN.MEDIA.VAL:
                reasons[i] = BIN.MEDIA.TXT;
                break;
              case BIN.BLOCK.VAL:
                reasons[i] = BIN.BLOCK.TXT;
                break;
              case BIN.WORD.VAL:
                reasons[i] = BIN.WORD.TXT;
                break;
              case BIN.DUPLICATION.VAL:
                reasons[i] = BIN.DUPLICATION.TXT;
                break;
            }
          });

          item.reasons = reasons.join(', ');

        } else {
          item.reasons = '고객센터 문의';
        }
      }
    }
    item.result = '실패';
    failData.value.push(item);
    failCount.value++;
  }
};


let resultList = ref<PostDbsParam[]>(props.data);
let isExistFailData = ref<boolean>(false);

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

  resultList.value.map(async (item: PostDbsParam) => {
    // 해당되지 않는 필드가 들어가 있을 시 삭제
    let itemKeys: string [] = Object.keys(item);

    itemKeys.forEach(key => {
      if (!dbFieldLabelList.value.includes(key)) {
        if (key !== 'result' && key !== 'reasons') {
          delete item[key];
        }
      }
    });

    if (item.result  === '처리중') {
      await postDbs(item);
    }

    // 업로드 결과 카운트
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
const setResultClass = (result: string = ''): string => {
  const resultClasses: KeyIndex<string> = {
    '실패': 'text-red',
    '성공': 'text-green',
    default: 'text-orange',
  };

  return resultClasses[result] ?? resultClasses.default;
};


/**
 * 모달 닫기 안내창
 */
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
    v-model="isShow"
  >
    <template #body>
      <div id="uploadResult">
        <div class="flex-center height-36">
          <span class="width-150 ">업로드 DB 수</span>
          <span>{{ props.data.length.numberFormat() }}개</span>
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
              처리중 <span class="text-orange">{{ processingCount.numberFormat() }}</span>건 /
            </div>
            <div>
              <SvgIcon
                type="mdi"
                class="text-green"
                :path="mdiCheckboxBlankCircle"
                :size="14"
              />
              성공 <span class="text-green">{{ successCount.numberFormat() }}</span>건 /
            </div>
            <div>
              <SvgIcon
                type="mdi"
                class="text-red"
                :path="mdiCheckboxBlankCircle"
                :size="14"
              />
              실패 <span class="text-red">{{ failCount.numberFormat() }}</span>건
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

        <ul class="info-box-bullet my-20">
          <li>업로드 진행 중 프로세스 종료 시(화면 이동, 새로고침 등) 업로드가 원활하게 이루어지지 않을 수 있습니다. 업로드 처리가 완료될 때까지 잠시 기다려주세요. </li>
        </ul>

        <div>
          <span class="font-lg block mb-10">업로드 목록</span>

          <ListTable
            ref="listTable"
            class="border"
            :height="450"
            :items="resultList"
          >
            <template #header>
              <tr>
                <th width="120">
                  결과
                </th>
                <th class="reason" style="min-width: 400px;">
                  <Tooltip right>
                    <template #default="{ toggle }">
                      <div class="" @click="toggle">
                        사유
                        <SvgIcon
                          class="icon"
                          type="mdi"
                          size="15"
                          :path="mdiHelpCircle"
                        />
                      </div>
                    </template>
                    <template #content>
                      <div class="tooltip-popup width-500 text-left">
                        <ul>
                          <li>
                            연락처:
                            <ul>
                              <li>10자 미만인 경우 ex) 010223333</li>
                              <li>앞 4번째 자리가 1 또는 0일 경우 ex) 01012345678, 01002223333</li>
                              <li>숫자가 외 다른 문자 입력 시</li>
                              <li>빈 값으로 등록 시</li>
                            </ul>
                          </li>
                          <li>
                            매체코드:
                            <ul>
                              <li>[광고/매체 코드 ▶ 매체 코드 관리] 화면에 등록되어 있지 않은 매체 코드명 입력 시</li>
                              <li>빈 값으로 등록 시</li>
                            </ul>
                          </li>
                          <li>중복: [고객 DB 관리 ▶ DB 필터 관리] 화면에 설정된 ‘중복’ 기준에 해당 시</li>
                          <li>차단: [고객 DB 관리 ▶ DB 필터 관리] 화면에 등록된 ‘차단 연락처’ 정보와 동일한 연락처일 경우</li>
                          <li>단어: [페이지 관리 ▶ DB 항목 설정] 화면에 단어 필터링 ‘활성화’ 상태의 입력 항목에서 [고객 DB 관리 ▶ DB 필터 관리] 화면에 등록된 ‘단어 필터링’ 값이 포함되어 있을 경우</li>
                          <li>고객센터 문의: 알 수 없는 이유로 실패 처리 시 ex)API 통신 오류 등 </li>
                        </ul>
                      </div>
                    </template>
                  </Tooltip>
                </th>
                <template :key="`th-${index}`" v-for="(item, index) in dbFieldLabelList">
                  <th>{{ item }}</th>
                </template>
              </tr>
            </template>

            <template #items="{ props }: ListTableItemSlot<PostDbsParam>">
              <tr>
                <td>
                  <div class="flex-center gap-x-2">
                    <SvgIcon
                      type="mdi"
                      :path="mdiCheckboxBlankCircle"
                      :size="14"
                      :class="['mr-1', 'font-sm', setResultClass(props.result)]"
                    />
                    {{ props.result }}
                  </div>
                </td>
                <td>
                  <template v-if="props.reasons">
                    <span
                      :key="`key-${index}`"
                      class="label"
                      v-for="(item, index) in props.reasons.split(', ')"
                    >
                      {{ item }}
                    </span>
                  </template>
                  <template v-else>
                    -
                  </template>
                </td>

                <template :key="`td-${index}`" v-for="(item, index) in dbFieldLabelList">
                  <td>{{ props[item] }}</td>
                </template>
              </tr>
            </template>
          </ListTable>
        </div>
      </div>
    </template>

    <template #action>
      <StyledButton
        color="primary"
        :disabled="!(progressRate === 100)"
        @click.prevent="closeModal"
      >
        확인
      </StyledButton>
    </template>
  </Modal>
</template>