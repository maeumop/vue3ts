<script setup lang="ts">
import { onMounted, ref, watch, computed, inject, onUnmounted } from 'vue';
import { useUtil } from '@/js/util';
import { useInputOnlyNumber } from '@/js/helper/common';
import { useClientStore } from '@/store/index';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type { GetFilterRes, PutFilterParam, PutFilterRes } from '@/types/api/databaseApi';

import { booleanYN } from '@/constants/common';
import type { BooleanYN } from '@/types/common';

import type { SpinnerModel } from '@/components/Spinner/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { Rules } from '@/components/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const Toast = inject('Toast') as ToastModel;

const databaseApi = useDatabaseApi();
const clientStore = useClientStore();
const { onInputOnlyNumber } = useInputOnlyNumber();

let clientId = computed(() => clientStore.getClientId);

let dbFilterUid = ref<string>('');
let phoneFilterDay = ref<number>(0);
let ipFilterDay = ref<number>(0);
let isFilterPhoneInPage = ref<BooleanYN>(booleanYN.N);
let isFilterIpInPage = ref<BooleanYN>(booleanYN.N);
let isFilterPhoneInManual = ref<BooleanYN>(booleanYN.N);
let isFilterPhoneInApi = ref<BooleanYN>(booleanYN.N);
let wordFilterList = ref<string>('');
let phoneFilterList = ref<string>('');

// Form Validation ===================================
const validateForm = ref<ValidateFormModel>();
const Spinner = inject('Spinner') as SpinnerModel;

const rules: Rules = {
  date: [
    (v) => !(v < 1) || '1 이상의 값을 입력해 주세요.',
  ],
};

const onChangeEvtCheck = ref<boolean>(false);
let inputPass = ref<boolean>(false);

const validation = (): void => {
  try {
    inputPass.value = !!validateForm.value?.validate(true);
  } catch (e) {
    console.error(e);
  }
};

const isDisabled = computed((): boolean => {
  return !(inputPass.value && phoneFilterDay.value && ipFilterDay.value);
});

watch(() => phoneFilterDay.value, (v) => {
  phoneFilterDay.value = Number(v.toString().replaceAll(/[^0-9]/gi, ''));
});

watch(() => ipFilterDay.value, (v) => {
  ipFilterDay.value = Number(v.toString().replaceAll(/[^0-9]/gi, ''));
});


// End - Form Validation ===================================

/**
 * 필터 설정 저장
 */
const onSave = async (): Promise<void> => {
  try {
    Spinner.delay(0).show('Loading…');
    let params: PutFilterParam = {
      dbFilterUid: dbFilterUid.value,
      phoneFilterDay: Number(phoneFilterDay.value),
      ipFilterDay: Number(ipFilterDay.value),
      isFilterPhoneInPage: isFilterPhoneInPage.value,
      isFilterIpInPage: isFilterIpInPage.value,
      isFilterPhoneInManual: isFilterPhoneInManual.value,
      isFilterPhoneInApi: isFilterPhoneInApi.value,
      wordFilterList: wordFilterList.value.split(',').filter(item => !!item.trim()).map(item => item.trim()).join(','),
      phoneFilterList: phoneFilterList.value.split(',').filter(item => !!item.trim()).map(item => item.trim()).join(',')
    };

    await databaseApi.putFilter(clientId.value, { ...params });
    Toast('정상적으로 저장 되었습니다.');

  } catch (err) {
    util.axiosErrorCatch<PutFilterRes>(err);
  } finally {
    onChangeEvtCheck.value = false;
    Spinner.close();
  }
};


/**
 * 필터 데이터 불러오기
 */
const getData = async (): Promise<void> => {
  try {
    const { results }: GetFilterRes = await databaseApi.getFilter(clientId.value);

    dbFilterUid.value = results.dbFilterUid;
    phoneFilterDay.value = results.phoneFilterDay;
    ipFilterDay.value = results.ipFilterDay;
    isFilterPhoneInPage.value = results.isFilterPhoneInPage;
    isFilterIpInPage.value = results.isFilterIpInPage;
    isFilterPhoneInManual.value = results.isFilterPhoneInManual;
    isFilterPhoneInApi.value = results.isFilterPhoneInApi;

    wordFilterList.value = results.wordFilterList.split(',').join(', ');
    phoneFilterList.value = results.phoneFilterList.split(',').join(', ');

  } catch (err) {
    util.axiosErrorCatch<GetFilterRes>(err);

  } finally {
    Spinner.close();
  }
};

const _getClientId = async (): Promise<void> => {
  await getData();
  _unWatch();
};

const _unWatch = watch(() => clientId.value, () => _getClientId());
onMounted(() => clientId.value && _getClientId());
Spinner.delay(0).show('Loading…');

onUnmounted(() => {
  Spinner.close();
});
</script>

<template>
  <div id="databaseFilter" class="narrow-content">
    <div>
      <h3>중복 적용 여부</h3>
      <ValidateForm ref="validateForm">
        <div class="date-check">
          <div class="box">
            <TextField
              block
              required
              type="tel"
              label="연락처 중복 날짜 간격"
              :max-length="3"
              :validate="rules.date"
              @input.stop="onInputOnlyNumber"
              @blur="validation"
              v-model="phoneFilterDay"
            >
              <template #default>
                <div class="text">
                  일
                </div>
              </template>
            </TextField>
          </div>
          <div class="box">
            <TextField
              block
              required
              type="tel"
              label="IP 중복 날짜 간격"
              :max-length="3"
              :validate="rules.date"
              @input.stop="onInputOnlyNumber"
              @blur="validation"
              v-model="ipFilterDay"
            >
              <template #default>
                <div class="text">
                  일
                </div>
              </template>
            </TextField>
          </div>
        </div>

        <div class="filter-box">
          <div>
            <h4>DB입력폼 <span class="text-point">연락처</span></h4>
            <div class="desc">
              [페이지 관리] 메뉴에 생성된 페이지에 적용되는 설정값입니다.
            </div>
          </div>
          <div class="switch">
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="['OFF', 'ON']"
              @update:after="validation"
              v-model="isFilterPhoneInPage"
            />
          </div>
        </div>

        <div class="filter-box">
          <div>
            <h4>DB입력폼 <span class="text-point">IP</span></h4>
            <div class="desc">
              [페이지 관리] 메뉴에 생성된 페이지에 적용되는 설정값입니다.
            </div>
          </div>
          <div class="switch">
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="['OFF', 'ON']"
              @update:after="validation"
              v-model="isFilterIpInPage"
            />
          </div>
        </div>

        <div class="filter-box">
          <div>
            <h4>개별/일괄 등록 <span class="text-point">연락처</span></h4>
            <div class="desc">
              [고객 DB 관리 ▶ 개별/일괄등록] 진행 시 적용되는 설정값입니다.
            </div>
          </div>
          <div class="switch">
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="['OFF', 'ON']"
              @update:after="validation"
              v-model="isFilterPhoneInManual"
            />
          </div>
        </div>

        <div class="filter-box">
          <div>
            <h4>고객 DB 등록 API <span class="text-point">연락처</span></h4>
            <div class="desc">
              API를 통해 DB를 수집하는 경우에 적용되는 설정값입니다 .
            </div>
          </div>
          <div class="switch">
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="['OFF', 'ON']"
              @update:after="validation"
              v-model="isFilterPhoneInApi"
            />
          </div>
        </div>

        <div class="divider"></div>

        <h3>단어 필터링</h3>

        <div class="filter-input">
          <TextField
            block
            multiline
            @blur="validation"
            v-model="wordFilterList"
          />
          <ul class="info-box-bullet mt-5">
            <li>
              단어 필터링 설정 값은 [페이지관리 ▶ DB항목설정] 메뉴에서 적용하고자
              하시는 입력 필드에 ‘활성화’처리 후 적용됩니다.
            </li>
          </ul>
        </div>

        <div class="divider"></div>

        <h3>차단 연락처</h3>

        <div class="filter-input">
          <TextField
            block
            multiline
            @blur="validation"
            v-model="phoneFilterList"
          />
          <ul class="info-box-bullet mt-5">
            <li>차단 연락처는 모든 고객 DB 유입 프로세스에 적용됩니다.</li>
          </ul>
        </div>

      </ValidateForm>
      <div class="save-box">
        <StyledButton
          color="primary"
          :disabled="isDisabled"
          @click.prevent="onSave"
        >
          저장
        </StyledButton>
      </div>
    </div>
  </div>
</template>
