<script setup lang="ts">
import { ref, inject, watch, onUnmounted, } from 'vue';
import { useUtil } from '@/js/util';
import { useMediaUtmCodeApi } from '@/api/modules/mediaUtmCodeApi';
import { v1 as uuid } from 'uuid';
import UtmResits from '@/views/ad/layer/utmBatchResist.vue';
import UtmResitsResult from '@/views/ad/layer/utmBatchResult.vue';
import { getUtmsMsg, getUtmValuesMsg, getUtmValuesCountMsg, postUtmValuesMsg, putUtmValuesMsg, deleteUtmValuesMsg } from '@/constants/api/mediaUtmCodeApi';
import { mdiMagnify, mdiClose, mdiInformationBoxOutline, mdiAlertCircle, mdiGoogleCirclesExtended } from '@/assets/svg/path';
import { booleanYN } from '@/constants/common';
import type { MessageBoxModel, } from '@/components/MessageBox/types';
import type { ToastModel } from '@/components/Toast/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { GetUtmsItem, GetUtmValuesItem, GetUtmsRes, GetUtmValuesRes, PostUtmValuesRes, PutUtmValuesRes, DeleteUtmValuesRes } from '@/types/api/mediaUtmCodeApi';
import type { KeyIndex } from '@/types/common';

const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;

const mediaUtmCodeApi = useMediaUtmCodeApi();
const util = useUtil();

// ======================== form validation ========================
const form = ref<ValidateFormModel>();

const patterns: KeyIndex<[RegExp, string]> = {
  code: [util.getRegExp('code'), '영문, 숫자, 하이픈(-), 언더바(_)만 입력 가능합니다.']
};

let isPass = ref<boolean>(false);
let errorMsg = ref<string>('');
/**
 * UTM 파라미터 중복 체크
 */
const checkUtmParam = async (): Promise<void> => {
  errorMsg.value = '';
  isPass.value = false;

  if (util.getRegExp('code').test(newUtmParam.value)) {
    const { code, results } = await mediaUtmCodeApi.getUtmValuesCount({
      utmParamValue: newUtmParam.value
    });

    if (code === getUtmValuesCountMsg.UTM_VALUES_COUNT_SUCCESS) {
      if (results.isExist ===  booleanYN.Y) {
        errorMsg.value = '이미 등록된 파라미터 값 입니다.';

      } else {
        isPass.value = true;
      }
    }
  }
};

let newDesc = ref<string>('');
let isChangeValue = ref<boolean>(false);
/**
 * 수정 시 내용이 바뀌었는 지 확인
 */
watch(newDesc, (): void => {
  if (newDesc.value && newDesc.value !== utmDesc.value) {
    isChangeValue.value = true;
  } else {
    isChangeValue.value = false;
  }
});
// ======================== END form validation ======================


// ======================== utm, 파라미터 선택 출력 ========================
let utmUid = ref<string>('');
let utmName = ref<string>('');
let utmParam = ref<string>('');
let utmParamValueUid = ref<string>('');
let utmDesc = ref<string>('');
let newUtmParam = ref<string>('');

let utmList = ref<GetUtmsItem[]>([]);
let utmParamValueList = ref<GetUtmValuesItem[]>([]);

let timer: number = 0;
/**
 * utm 선택
 * @param id utm id
 * @param name utm 파라미터
 * @param count 선택된 utm의 param 총 갯수
 */
const setUtm = (id: string, name: string, count?: number): void => {
  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    timer = 0;
    utmParamValueList.value = [];

    resetSelect();

    utmUid.value = id;
    utmName.value = name;

    // 선택된 utm의 param 총 갯수 설정
    if (utmUid.value) {
      currentCodeCount.value = count ?? 0;

    } else {
      currentCodeCount.value = utmTotalCount.value;
    }

    getUtmValues();
  }, 400);
};

const resetSelect = (): void => {
  newUtmParam.value = '';
  utmParam.value = '';
  searchItem.value = '';
  newDesc.value = '';
  utmParamValueUid.value = '';
  errorMsg.value = '';
  isPass.value = false;
  isChangeValue.value = false;
};

/**
 * utm 파라미터 선택
 * @param idx 선택한 utm 파라미터 index
 */
const setUtmParam = (idx: number): void => {
  if (utmParamValueUid.value === utmParamValueList.value[idx].utmParamValueUid) {
    resetSelect();
    return;
  }

  isChangeValue.value = false;
  const utmPramName = utmList.value.find(utm => utm.utmParamUid === utmParamValueList.value[idx].utmParamUid)?.utmParam;

  utmName.value = utmPramName ?? '';
  utmParam.value = utmParamValueList.value[idx].utmParamValue;
  utmParamValueUid.value = utmParamValueList.value[idx].utmParamValueUid;
  utmDesc.value = utmParamValueList.value[idx].description;
  newDesc.value = utmParamValueList.value[idx].description;
};

let utmTotalCount = ref<number>(0);
let isLoading = ref<boolean>(false);
/**
 * utm 목록 불러오기
 */
const getUtms = async (): Promise<void> => {
  isLoading.value = true;

  if (!utmParamValueList.value.length) {
    isLoadingList.value = true;
  }

  try {
    const { code, results } = await mediaUtmCodeApi.getUtms();

    if (code === getUtmsMsg.UTM_LIST_GET_SUCCESS) {
      utmTotalCount.value = results.totalCount;
      currentCodeCount.value = results.totalCount;

      utmList.value = results.utmParams;

      if (!utmParamValueList.value.length ||
        utmParamValueList.value.length !== utmTotalCount.value) {
        getUtmValues();
      }
    }

  } catch (err) {
    util.axiosErrorCatch<GetUtmsRes>(err);
  }

  isLoading.value = false;
};

const utmParamEndPoint = ref<HTMLDivElement>();

let searchItem = ref<string>('');
let isLoadingList = ref<boolean>(false);
/**
 * utm 파라미터 목록
 * @param cursor 페이지네이션 커서, 로딩된 목록의 마지막 regDatetime
 */
const getUtmValues = async (cursor?: number | string): Promise<void> => {
  if (!utmParamValueList.value.length) {
    isLoadingList.value = true;
  }

  let cursorValue = (typeof cursor === 'number' && !searchItem.value) ? cursor : '';

  try {
    const { code, results } = await mediaUtmCodeApi.getUtmValues(
      utmUid.value ? utmUid.value : 'ALL',
      {
        search: searchItem.value ? `word=${encodeURIComponent(searchItem.value)}` : '',
        cursor: cursorValue,
        limit: 50
      }
    );

    if (code === getUtmValuesMsg.UTM_VALUES_SEARCH_SUCCESS) {
      if (utmParamValueList.value.length < currentCodeCount.value) {
        if (searchItem.value || !cursorValue) {
          utmParamValueList.value = [];
        }
        // scroll observer
        if (utmParamEndPoint.value) {
          observer.observe(utmParamEndPoint.value);
        }

        utmParamValueList.value.push(...results.utmParamValues);

      } else {
        utmParamValueList.value = [];
        utmParamValueList.value = results.utmParamValues;

        if (utmParamValueList.value.length >= utmTotalCount.value) {
          observer.disconnect();
        }
      }
    }

  } catch (err) {
    util.axiosErrorCatch<GetUtmValuesRes>(err);
  }

  isLoadingList.value = false;
};
// ======================== END utm, 파라미터 선택 출력 ======================


// ======================== 파라미터 등록/수정, 삭제 ========================
let isProcessing = ref<boolean>(false);
/**
 * utm 파라미터 값 등록
 */
const postUtmValues = async (): Promise<void> => {
  if (form.value?.validate()) {
    try {
      isProcessing.value = true;

      await checkUtmParam();

      if (!isPass.value) {
        return;
      }
      // uuid 생성
      let newUtmParamValueUid: string = uuid();

      const { code } = await mediaUtmCodeApi.postUtmValues({
        utmParamValueUid: newUtmParamValueUid,
        utmParamUid: utmUid.value,
        utmParamValue: newUtmParam.value,
        description: newDesc.value ?? '',
      });

      if (code === postUtmValuesMsg.UTM_VALUES_INSERT_SUCCESS) {
        utmParamValueList.value.unshift({
          utmParamValueUid: newUtmParamValueUid,
          utmParamUid: utmUid.value,
          utmParamValue: newUtmParam.value,
          description: newDesc.value ?? '',
        });

        utmTotalCount.value++;

        utmList.value.forEach((utmParam) => {
          if (utmParam.utmParamUid === utmUid.value) {
            utmParam.utmParamValueCount++;
          }
        });

        Toast('정상적으로 등록되었습니다.');

        // 입력 데이터 리셋
        newUtmParam.value = '';
        newDesc.value = '';
        isPass.value = false;
      }

    } catch (err) {
      util.axiosErrorCatch<PostUtmValuesRes>(err);

    } finally {
      isProcessing.value = false;
    }
  }
};

/**
 * utm 파라미터 값 수정
 */
const putUtmValues = async (): Promise<void> => {
  try {
    isProcessing.value = true;

    const { code } = await mediaUtmCodeApi.putUtmValues(utmParamValueUid.value, {
      description: newDesc.value ?? utmDesc.value
    });

    if (code === putUtmValuesMsg.UTM_VALUE_UPDATE_SUCCESS) {
      utmParamValueList.value.forEach(item => {
        if (item.utmParamValueUid === utmParamValueUid.value) {
          item.description = newDesc.value ?? utmDesc.value;
        }
      });

      isChangeValue.value = false;
      Toast('정상적으로 수정되었습니다.');
    }

  } catch (err) {
    util.axiosErrorCatch<PutUtmValuesRes>(err);

  } finally {
    isProcessing.value = false;
  }
};

/**
 * utm 파라미터 값 삭제
 * @param idx utm 파라미터 index
 * @param uid utm
 */
const deleteUtmValues = async (idx: number, uid: string) => {
  try {
    const { code } = await mediaUtmCodeApi.deleteUtmValues(uid);

    if (code === deleteUtmValuesMsg.UTM_VALUE_DELETE_SUCCESS) {
      utmParamValueList.value.splice(idx, 1);

      utmTotalCount.value--;

      utmList.value.forEach(utmParam => {
        if (utmParam.utmParamUid === utmUid.value) {
          utmParam.utmParamValueCount--;
        }
      });

      Toast('정상적으로 삭제되었습니다.');
    }

  } catch (err) {
    util.axiosErrorCatch<DeleteUtmValuesRes>(err);

  } finally {
    newDesc.value = '';
    utmDesc.value = '';
    utmParam.value = '';
    utmParamValueUid.value = '';
  }
};

/**
 * 삭제 안내창
 * @param idx UTM 파라미터값 idx
 */
const openDeleteAlert = (idx: number): void => {
  const uid: string = utmParamValueList.value[idx].utmParamValueUid;
  const param: string = utmParamValueList.value[idx].utmParamValue;

  MessageBox.confirm({
    title: `${param} 값을 삭제하시겠습니까?`,
    message: '[삭제 처리하기] 버튼 클릭 시 해당 데이터는 삭제되며, 복구가 불가능합니다.',
    btnCancelText: '삭제 취소하기',
    btnOkayText: '삭제 처리하기',
    asyncOkay: async () => {
      await deleteUtmValues(idx, uid);
    }
  });
};
// ======================== END 파라미터 등록/수정, 삭제 ======================


// ======================= 일괄 등록, 업로드결과 모달 =======================
let isModalOpen = ref<boolean>(false);
let isResultModalOpen = ref<boolean>(false);

let uploadData = ref<KeyIndex<string>[]>([]);
/**
 * 일괄 등록 데이터 세팅
 * @param data 엑셀 데이터
 */
let setData = (data: KeyIndex<string>[]): void => {
  uploadData.value = data;
};
// ======================= END 일괄 등록, 업로드결과 모달 =====================


// ======================= 스크롤 이벤트 =======================
let currentCodeCount = ref<number>(0);
const scrollOptions: IntersectionObserverInit = {
  root: null,
  threshold: 0.1
};
/**
 * utm 파라미터 목록 페이지네이션(스크롤)
 */
let observer: IntersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
  if (entries[0].isIntersecting) {
    if (utmParamValueList.value.length >= currentCodeCount.value) {
      observer.disconnect();

    } else {
      getUtmValues(utmParamValueList.value[utmParamValueList.value.length - 1]?.regDatetime);
    }
  }
}, scrollOptions);
// ======================= END 스크롤 이벤트 =======================


const refresh = (): void => {
  getUtms();
  getUtmValues();
};


// Create
getUtms();

onUnmounted(() => {
  if (utmParamEndPoint.value) {
    observer.disconnect();
  }
});
</script>

<template>
  <div id="pageAd" class="content">
    <div class="itemWrap width-p-25">
      <div class="subTitle">
        <span>UTM</span>
      </div>

      <div class="spinner-wrap" v-if="isLoading">
        <div class="spinner">
          <SvgIcon
            type="mdi"
            class="loading"
            size="36"
            :path="mdiGoogleCirclesExtended"
          />
        </div>
      </div>

      <ul class="itemList" v-else>
        <li :class="[!utmUid ? 'on' : '']">
          <a href="#" @click.prevent="setUtm('', '전체')">
            전체({{ utmTotalCount }})
          </a>
        </li>

        <li
          :key="item.utmParamUid"
          :class="[item.utmParamUid === utmUid ? 'on' : '']"
          v-for="item in utmList"
        >
          <a href="#" @click.prevent="setUtm(item.utmParamUid, item.utmParam, item.utmParamValueCount)">
            {{ item.utmParam }}({{ item.utmParamValueCount }})
          </a>
        </li>
      </ul>
    </div>

    <div class="subItemWrap width-p-25">
      <div class="fixedArea">
        <div class="subTitle">
          <span>파라미터 값</span>
          <StyledButton
            small
            color="primary"
            @click.prevent="isModalOpen = true"
          >
            일괄 등록
          </StyledButton>
        </div>
        <div class="searchBox">
          <TextField
            block
            placeholder="파라미터 값을 입력해주세요."
            :icon="mdiMagnify"
            :max-length="50"
            :icon-action="getUtmValues"
            @keyup.enter="getUtmValues"
            v-model="searchItem"
          />
        </div>
      </div>

      <div class="spinner-wrap" v-if="isLoadingList">
        <div class="spinner">
          <SvgIcon
            type="mdi"
            class="loading"
            size="36"
            :path="mdiGoogleCirclesExtended"
          />
        </div>
      </div>

      <ul class="subItemList" v-else>
        <template v-if="utmParamValueList.length">
          <li
            :key="subItem.utmParamValue"
            :class="[subItem.utmParamValue === utmParam ? 'on' : '']"
            v-for="(subItem, index) in utmParamValueList"
          >
            <a
              href="#"
              @click.prevent="setUtmParam(index)"
            >
              {{ subItem.utmParamValue }}
            </a>

            <a
              href="#"
              @click.prevent="openDeleteAlert(index)"
            >
              <SvgIcon
                type="mdi"
                :path="mdiClose"
                :size="18"
              />
            </a>
          </li>
        </template>

        <template v-else>
          <li class="noList">
            <SvgIcon
              class="mr-2"
              type="mdi"
              :path="mdiAlertCircle"
              :size="16"
            />
            파라미터가 존재하지 않습니다.
          </li>
        </template>
      </ul>
      <div ref="utmParamEndPoint"></div>
    </div>

    <div class="resisterWrap width-p-50">
      <div class="info" v-if="!utmUid && !utmParam">
        <SvgIcon type="mdi" :path="mdiInformationBoxOutline" :size="100" />
        <span>안내</span>
        <p>
          'UTM 파리미터' 선택 시 '파라미터 값' 등록이 가능하며,<br />
          '파라미터 값' 선택 시 수정이 가능합니다.
        </p>
      </div>

      <div class="resisterBox" v-else>
        <div class="subTitle">
          <span v-if="utmParam">파라미터 값 수정</span>
          <span v-else>파라미터 값 등록</span>
        </div>

        <div class="inputContainer">
          <ValidateForm ref="form">
            <TextField
              block
              required
              disabled
              label="UTM 파라미터"
              class="mb-20"
              :placeholder="utmName"
            />

            <!-- 수정 -->
            <TextField
              block
              required
              disabled
              label="파라미터 값"
              class="mb-20"
              :placeholder="utmParam"
              v-if="utmParam"
            />

            <!-- 등록 -->
            <TextField
              block
              required
              label="파라미터 값"
              placeholder="파라미터 값 입력(50자 이내)"
              class="mb-20"
              :max-length="50"
              :error-message="errorMsg"
              :pattern="patterns.code"
              @blur="checkUtmParam"
              v-model="newUtmParam"
              v-else
            />

            <TextField
              block
              multiline
              label="설명"
              placeholder="파라미터 값에 대한 부가 설명을 입력해주세요. (200자 이내)"
              class="mb-20"
              :max-length="200"
              :rows="5"
              v-model="newDesc"
            />
          </ValidateForm>
        </div>

        <div class="resisterBtn">
          <div class="width-60">
            <StyledButton
              block
              color="primary"
              :disabled="!isChangeValue"
              :loading="isProcessing"
              @click.prevent="putUtmValues"
              v-if="utmParam"
            >
              수정
            </StyledButton>
            <StyledButton
              block
              color="primary"
              :loading="isProcessing"
              @click.prevent="postUtmValues"
              v-else
            >
              등록
            </StyledButton>
          </div>
        </div>
      </div>
    </div>

    <UtmResits
      @close="isModalOpen = false"
      @set-data="setData"
      @open-result="isResultModalOpen = true"
      v-if="isModalOpen"
    />
    <UtmResitsResult
      :data="uploadData"
      @close="isResultModalOpen = false"
      @refresh="refresh"
      v-if="isResultModalOpen"
    />
  </div>
</template>