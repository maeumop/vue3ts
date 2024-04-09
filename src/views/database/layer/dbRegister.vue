<script setup lang="ts">
import MediaCodeSearch from './mediaCodeSearch.vue';

import { ref, watch, onMounted, reactive, inject } from 'vue';
import { v1 as uuid } from 'uuid';
import { useUtil } from '@/js/util';
import { useInputOnlyNumber } from '@/js/helper/common';

import { booleanYN } from '@/constants/common';
import { CONST_CODES } from '@/constants/common';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type {
  InputfieldParam,
  PostDbsParam, PostDbsParamRest, PostDbsRes,
  PutDbsParam, PutDbsParamRest, PutDbsRes,
  GetDbsExistByPhoneRes,
} from '@/types/api/databaseApi';

import type { Rules, RuleFunc } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ModalModel } from '@/components/Modal/types';
import { checkButtonType } from '@/components/Form/CheckButton/const';

import { INPUT_FIELDS_OPT, INPUT_FIELDS_AGREE_NAME } from '@/constants/db';
import type {
  InputFieldsItemValue,
  AgreeDateTime, DbsItem,
  AgreeData, CodesSearchItem,
  INPUT_FIELDS_NAME_TYPE,
  INPUT_FIELDS_AGREE_TIME_NAME_TYPE,
  InputFieldConfigWithOption,
  ALL_INPUT_FIELDS_NAME_TYPE,
} from '@/types/db';

import type { KeyIndex } from '@/components/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const { REFERER_TYPE } = CONST_CODES;

const databaseApi = useDatabaseApi();
const Toast = inject('Toast') as ToastModel;

const { onInputOnlyNumber } = useInputOnlyNumber();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'on:create', value: DbsItem): void;
  (event: 'on:edit', value: DbsItem): void;
}>();

const props = defineProps<{
  index: number;
  selectedDb?: DbsItem;
  inputFields: InputFieldConfigWithOption[]
}>();

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


// 매체, 매체 코드 설정 ==============================
let mediaCodeDefault = ref<number[]>([0]);
const setDefaultMediaCode = (): void => {
  media.value = mediaCodeDefault.value[mediaCodeDefault.value.length - 1] ? '기타' : '';
  mediaCode.value = mediaCodeDefault.value[mediaCodeDefault.value.length - 1] ? 'site' : '';
  isPass.value = true;
};

let isMediaCode = ref<boolean>(false);
const setMediaCode = (value: CodesSearchItem): void => {
  mediaCodeDefault.value[mediaCodeDefault.value.length - 1] = 0;
  media.value = value.media;
  mediaCode.value = value.mediaCode;
  isPass.value = true;
};

watch(() => mediaCodeDefault.value, (newValue, oldValue) => {
  if (typeof oldValue[0] !== 'undefined') {
    setDefaultMediaCode();
  }
});
// End - 매체, 매체 코드 설정 ==============================

let isCreate = ref<boolean>(true);

let dbUid = ref<string>('');
let mediaUid = ref<string>('');
let mediaCodeUid = ref<string>('');
let clientAccountUid = ref<string>('');
let media = ref<string>('');
let mediaCode = ref<string>('');
let referer = ref<string>('');
let refererType = ref<string>('');
let refererIp = ref<string | null>();
let isBin = ref<number>(0);
let inputDatetime = ref<number>(0);
let modDatetime = ref<number>(0);

let agreeData = reactive<KeyIndex<AgreeData>>({
  privacyYn: {
    text: '',
    modelValue: [0],
    dateTime: 0
  },
  thirdPartyYn: {
    text: '',
    modelValue: [0],
    dateTime: 0
  },
  smsYn: {
    text: '',
    modelValue: [0],
    dateTime: 0
  },
});

const onlyNumber = (value: string): string => {
  return value.replaceAll(/[^0-9]/gi, '');
};

// ============== Form Validation ===================================
const validationMsg = reactive({
  tel: ''
});

const validateForm = ref<ValidateFormModel>();
const rules: Rules = {
  input: [ v => !!v || '필수 입력 사항 입니다.' ],
  check: [ v => !!(v.length) || '필수 선택 사항 입니다.' ],
  agreeCheck: [ v => !!(v[v.length - 1]) || '필수 선택 사항 입니다.'],
  link: [ v => util.getRegExp('url').test(v) || '‘http://’ 또는 ‘https://’ 포함한 유입링크를 입력해주세요.'],
  tel: [ v => util.getRegExp('tel').test(v) || '유효하지 않은 연락처입니다. (11자 숫자만 입력)'],
};

let isPass = ref<boolean>(true);
const validation = (): void => {
  if (props.index > -1 && !isPass.value) {
    isPass.value = true;
  }
};

let duplicationCheckedTel = '';
let isExistTel = true;
let isDuplicationDone = false;
const duplicationCheckTel = async (tel: string): Promise<void> => {
  duplicationCheckedTel = tel;
  isDuplicationDone = false;

  try {
    const { results }: GetDbsExistByPhoneRes = await databaseApi.getDbsExistByPhone(tel);
    validationMsg.tel = results.isExist ? '이미 등록된 연락처가 존재합니다.' : '';
    isExistTel = !!results.isExist;
    isDuplicationDone = true;

  } catch (err) {
    console.log(err);
    isExistTel = false;
    isDuplicationDone = false;
    validationMsg.tel = '올바른 연락처를 입력해주세요.';
  }
};

const telPatternCheck = () => {
  inputFieldValue.value.phone = onlyNumber(inputFieldValue.value.phone?.toString() || '');

  if (!util.getRegExp('tel').test(inputFieldValue.value.phone)) {
    validationMsg.tel = '';
    return rules.tel;

  } else if (isCreate.value) {
    if (duplicationCheckedTel === inputFieldValue.value.phone) {
      if (!isExistTel && isDuplicationDone ) {
        return [];
      }
      validationMsg.tel = isExistTel ? '이미 등록된 연락처가 존재합니다.' : '올바른 연락처를 입력해주세요.';
    } else {
      duplicationCheckTel(inputFieldValue.value.phone);
    }
  }
  return [];
};

const refererCheck = (): RuleFunc[] => {
  return referer.value ? rules.link : [];
};

const numberCheck = ($event: InputEvent) => {
  if ($event.data) {
    const target: HTMLInputElement = ($event.target as HTMLInputElement);
    target.value = onlyNumber(target.value?.toString() || '');
  }

  validation();
};
// End - Form Validation ===================================

type ParamType = {
  [index in ALL_INPUT_FIELDS_NAME_TYPE]: string | number | string[] | null
};

// 등록/수정 처리 =================================
let _agreeTime: AgreeDateTime = {
  privacyYnDatetime: 0,
  thirdPartyYnDatetime: 0,
  smsYnDatetime: 0,
};

/**
 * 등록/수정 param값 만들어주는 함수
 * @param type 등록/수정 type
 */
const setInputParam = (type: string = 'edit')  => {
  let _inputfieldParamData = {} as ParamType;

  Object.entries(inputFieldValue.value).forEach(([k, v]) => {
    const key = k as INPUT_FIELDS_NAME_TYPE;
    if (v !== null) {
      const value: string | string[] = Array.isArray(v) ? v.join(',') : v.toString();

      if (value) {
        if (key === 'age') {
          _inputfieldParamData[key] = Number(value);
        } else if (!INPUT_FIELDS_AGREE_NAME.includes(key)) {
          _inputfieldParamData[key] = value;
        }
      }

      // 동의항목
      if (INPUT_FIELDS_AGREE_NAME.includes(key)) {
        const agreeKey = `${key}Datetime` as INPUT_FIELDS_AGREE_TIME_NAME_TYPE;
        _inputfieldParamData[key] = agreeData[key].modelValue[agreeData[key].modelValue.length - 1] ? booleanYN.Y : booleanYN.N;
        // 동의항목 날짜 처리
        _agreeTime[agreeKey] = (props.selectedDb && _inputfieldParamData[key] !== props.selectedDb.inputfields[key]) ? Date.now() : agreeData[key].dateTime;
      }
    }
  });

  const _inputfield = { ..._inputfieldParamData } as InputfieldParam;

  if (type === 'create') {
    const _paramRest: PostDbsParamRest =  {
      dbUid: uuid(),
      mediaCode: mediaCode.value,
      referer: referer.value,
      refererType: REFERER_TYPE.EACH.VAL,

    };
    return { _paramRest, _inputfield };

  } else {
    const _paramRest: PutDbsParamRest =  {
      ..._agreeTime,
      mediaCode: mediaCode.value,
      referer: referer.value,
    };
    return { _paramRest, _inputfield };
  }
};

/**
 * DB등록
 */
const createDb = async (): Promise<void> => {
  let { _paramRest, _inputfield } = setInputParam('create');

  const param = { ..._paramRest, ..._inputfield } as PostDbsParam;
  const { results }: PostDbsRes = await databaseApi.postDbs(param);

  const date = Date.now();
  const newData =  {
    ..._paramRest,
    mediaUid: mediaUid.value,
    mediaCodeUid: mediaCodeUid.value,
    media: media.value,

    privacyYnDatetime: date,
    thirdPartyYnDatetime: date,
    smsYnDatetime: date,
    inputDatetime: date,
    regDatetime: date,
    modDatetime: date,

    sendStatus: results.sendStatus!,
    isBin: results.isBin!,
    refererIp: results.refererIp,

    inputfields: { ..._inputfield },
  } as DbsItem;

  if ('filtered' in results && results.filtered === 'MEDIA') {
    newData.media = '';
  }

  emit('on:create', newData);
  Toast('정상적으로 등록되었습니다.');
  modal.value!.close();
};

/**
 * DB 수정
 */
const editDb = async (): Promise<void> => {
  let { _paramRest, _inputfield } = setInputParam();
  const param = { ..._paramRest, ..._inputfield } as PutDbsParam;

  await databaseApi.putDbs(dbUid.value, param);

  const editData: DbsItem =  {
    ...props.selectedDb!,
    ..._paramRest,

    mediaUid: mediaUid.value,
    mediaCodeUid: mediaCodeUid.value,
    media: media.value,
    modDatetime: Date.now(),

    inputfields: { ..._inputfield },
  };

  emit('on:edit', editData);
  Toast('정상적으로 수정되었습니다.');
  modal.value!.close();

};

let loading = ref<boolean>(false);

/**
 * [ 등록|수정 ] 버튼 클릭이벤트 핸들러
 */
const onClickEvnt = async (): Promise<void> => {
  if (!validateForm.value!.validate()) {
    return;
  }

  try {
    loading.value = true;

    if (isCreate.value) {
      if (isExistTel){
        return;
      }
      await createDb();

    } else {
      await editDb();
    }
  } catch (err) {
    util.axiosErrorCatch<PostDbsRes | PutDbsRes>(err);

  } finally {
    loading.value = false;
  }
};
// End 등록/수정 처리 =================================

// 입력항목 폼
let inputfieldsTemplate = ref<InputFieldsItemValue[]>([]);
// 입력항목들 값
let inputFieldValue = ref<ParamType>({
  name: '',
  phone: '',
  age: null,
  gender: null,
  etcComment: null,
  input1: null,
  input2: null,
  input3: null,
  input4: null,
  input5: null,
  input6: null,
  input7: null,
  input8: null,
  input9: null,
  input10: null,
  input11: null,
  input12: null,
  input13: null,
  input14: null,
  input15: null,
  input16: null,
  input17: null,
  input18: null,
  input19: null,
  input20: null,
  privacyYn: 0,
  thirdPartyYn: 0,
  smsYn: 0,
  cert: null,
});

const modeCheck = (): void => {
  if (props.index > -1 && props.selectedDb) {
    isCreate.value = false;

    // 입력항목 값 맵핑
    inputfieldsTemplate.value.forEach(item => {
      const fieldName = item.fieldName as INPUT_FIELDS_NAME_TYPE;
      const value = props.selectedDb?.inputfields[fieldName];

      if (item.fieldType === 'CHECK' && value) {
        inputFieldValue.value[fieldName] = value.toString().split(',');
      } else {
        inputFieldValue.value[fieldName] = value ?? null;
      }
    });

    dbUid.value = props.selectedDb.dbUid;
    mediaUid.value = props.selectedDb.mediaUid;
    mediaCodeUid.value = props.selectedDb.mediaCodeUid;
    clientAccountUid.value = props.selectedDb.clientAccountUid;
    media.value = props.selectedDb.media;
    mediaCode.value = props.selectedDb.mediaCode;
    referer.value = props.selectedDb.referer ?? '';
    refererType.value = REFERER_TYPE[props.selectedDb.refererType].TXT;
    refererIp.value = props.selectedDb.refererIp;

    // 약관동의 여부 및 동의 날짜
    Object.entries(agreeData).forEach(([k]) => {
      const key = k as INPUT_FIELDS_NAME_TYPE;
      const agreeKey = `${key}Datetime` as INPUT_FIELDS_AGREE_TIME_NAME_TYPE;
      agreeData[key].dateTime = props.selectedDb![agreeKey];
      agreeData[key].modelValue[0] = props.selectedDb!.inputfields[key];
    });

    isBin.value = props.selectedDb.isBin;
    inputDatetime.value = props.selectedDb.inputDatetime;
    modDatetime.value = props.selectedDb.modDatetime;

    isPass.value = false;
  }
};


onMounted(() => {
  props.inputFields.forEach(field => {
    if (INPUT_FIELDS_OPT.includes(field.fieldType) &&  'objOption' in field) {
      // checked 설정된 항목 checked 처리
      let values: string[] = [];
      field.objOption!.forEach(item => {
        // 동의항목 별도 처리
        if (INPUT_FIELDS_AGREE_NAME.includes(field.fieldName)) {
          agreeData[field.fieldName].text = field.objOption![0].text;
          agreeData[field.fieldName].modelValue[0] = item.checked ? 1 : 0;
        } else {
          item.value && item.checked ? values.push(item.value.toString()) : '';
        }
      });

      inputFieldValue.value[field.fieldName as ALL_INPUT_FIELDS_NAME_TYPE] = values;

    } else {
      inputFieldValue.value[field.fieldName as ALL_INPUT_FIELDS_NAME_TYPE] = '';
    }

    inputfieldsTemplate.value.push({ ...field as InputFieldsItemValue });
  });

  modeCheck();
});
</script>

<template>
  <Modal
    ref="modal"
    width="520px"
    :esc-close="!loading"
    :title="isCreate ? '개별 등록' : '수정'"
    v-model="isShow"
  >
    <template #body>
      <div id="databaseList" v-if="inputfieldsTemplate.length">
        <div class="font-lg">
          {{ isCreate ? '기본 정보' : '고객 정보' }}
        </div>

        <ValidateForm ref="validateForm">
          <template
            :key="`fieldUid-${field.dbInputFieldConfigUid}`"
            v-for="field in inputfieldsTemplate"
          >

            <template v-if="INPUT_FIELDS_AGREE_NAME.includes(field.fieldName)">
              <!-- 동의 항목 -->
              <div class="flex items-start mt-5">
                <CheckButton
                  color="primary"
                  :required="field.isRequire"
                  :items="[{text: agreeData[field.fieldName].text, value: 1}]"
                  :name="agreeData[field.fieldName].text"
                  :validate="field.isRequire ? rules.agreeCheck : []"
                  @change="validation()"
                  v-model="agreeData[field.fieldName].modelValue"
                />
                <template v-if="!isCreate">
                  ({{ props.selectedDb!.inputfields[field.fieldName] ? '동의일: ' : '거부일: ' }} {{ util.getDateFormat(agreeData[field.fieldName].dateTime, 'Y-m-d H:i:s') }})
                </template>
              </div>
            </template>


            <template v-else-if="field.fieldType === 'TEXT'">
              <TextField
                block
                class="mt-20"
                :required="field.isRequire"
                :label="field.fieldLabel"
                :max-length="field.maxLength"
                :placeholder="field.placeholder"
                :validate="field.isRequire ? rules.input : []"
                @blur="validation()"
                v-model="inputFieldValue[field.fieldName as INPUT_FIELDS_NAME_TYPE]"
              />
            </template>

            <template v-else-if="field.fieldType === 'NUMBER' && field.fieldName === 'phone'">
              <TextField
                block
                ref="phone"
                class="mt-20"
                :required="field.isRequire"
                :label="field.fieldLabel"
                :placeholder="field.placeholder"
                :max-length="field.maxLength"
                :validate="telPatternCheck()"
                :error-message="validationMsg.tel"
                @input.stop="onInputOnlyNumber"
                @blur="validation()"
                v-model="inputFieldValue[field.fieldName as INPUT_FIELDS_NAME_TYPE]"
              />
            </template>

            <template v-else-if="field.fieldType === 'NUMBER'">
              <TextField
                block
                type="NUM"
                class="mt-20"
                :required="field.isRequire"
                :label="field.fieldLabel"
                :placeholder="field.placeholder"
                :max-length="field.maxLength"
                :validate="field.isRequire ? rules.input : []"
                @blur="numberCheck"
                @input.stop="onInputOnlyNumber"
                v-model="inputFieldValue[field.fieldName as INPUT_FIELDS_NAME_TYPE]"
              />
            </template>

            <template v-else-if="field.fieldType === 'TEXTAREA'">
              <TextField
                block
                multiline
                class="mt-20"
                :required="field.isRequire"
                :label="field.fieldLabel"
                :max-length="field.maxLength"
                :placeholder="field.placeholder"
                :validate="field.isRequire ? rules.input : []"
                @blur="validation()"
                v-model="inputFieldValue[field.fieldName as INPUT_FIELDS_NAME_TYPE]"
              />
            </template>

            <template v-else-if="field.fieldType === 'RADIO'">
              <CheckButton
                color="primary"
                :type="checkButtonType.radio"
                :required="field.isRequire"
                :class="['mt-20', {'mb-20': field.fieldName === 'gender'}]"
                :label="field.fieldLabel"
                :name="field.fieldName"
                :max-length="field.maxLength"
                :items="field.objOption"
                :validate="field.isRequire ? rules.check : []"
                @change="validation()"
                v-model="inputFieldValue[field.fieldName as INPUT_FIELDS_NAME_TYPE]"
              />
            </template>

            <template v-else-if="field.fieldType === 'CHECK'">
              <CheckButton
                color="primary"
                class="mt-20"
                :required="field.isRequire"
                :label="field.fieldLabel"
                :name="field.fieldName"
                :max-length="field.maxLength"
                :items="field.objOption"
                :validate="field.isRequire ? rules.check : []"
                @change="validation()"
                v-model="inputFieldValue[field.fieldName as INPUT_FIELDS_NAME_TYPE]"
              />
            </template>

            <template v-else-if="field.fieldType === 'SELECT'">
              <SelectBox
                block
                class="mt-20"
                placeholder="선택"
                :label="field.fieldLabel"
                :options="field.objOption"
                :required="field.isRequire"
                @blur="validation()"
                v-model="inputFieldValue[field.fieldName as INPUT_FIELDS_NAME_TYPE]"
              />
            </template>
          </template>

          <div class="textField-label flex-center-between mt-20">
            <label>매체 코드 <span class="text-red">*</span></label>
            <CheckButton
              color="primary"
              :items="[{value: 1, text:'기본값 적용'}]"
              v-model="mediaCodeDefault"
            />
          </div>

          <ValidateWrap
            :validate="rules.input"
            :check-value="mediaCode"
          >
            <div class="flex gap-8">
              <TextField
                block
                readonly
                placeholder="매체"
                class="width-170"
                v-model="media"
              />
              <TextField
                block
                readonly
                placeholder="매체 코드명"
                class="width-240"
                v-model="mediaCode"
              />
              <div class="width-80">
                <StyledButton
                  block
                  color="primary"
                  :disabled="mediaCodeDefault[mediaCodeDefault.length - 1]"
                  @click.prevent="isMediaCode = true"
                >
                  검색
                </StyledButton>
              </div>
            </div>
          </ValidateWrap>

          <TextField
            block
            class="mt-20"
            label="유입링크"
            placeholder="https:// 를 포함 전체 링크를 입력해주세요."
            :validate="refererCheck()"
            @blur="validation()"
            v-model="referer"
          />
        </ValidateForm>

        <template v-if="!isCreate">
          <TextField
            block
            readonly
            class="mt-20"
            label="유입경로"
            v-model="refererType"
          />

          <TextField
            block
            readonly
            class="mt-20"
            label="IP"
            v-model="refererIp"
          />

          <div class="mt-20 flex gap-4">
            <div class="width-p-50">
              <div class="textField-label">
                <label>접수일</label>
              </div>
              {{ util.getDateFormat(inputDatetime, 'Y-m-d H:i:s') }}
            </div>

            <div class="width-p-50">
              <div class="textField-label">
                <label>수정일</label>
              </div>
              {{ modDatetime ? util.getDateFormat(modDatetime, 'Y-m-d H:i:s') : '-' }}
            </div>
          </div>

        </template>

        <div class="pt-10"></div>
      </div>
    </template>

    <template #action="{ close }">
      <StyledButton
        outline
        class="mr-10"
        @click="close"
      >
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        :loading="loading"
        :disabled="!isPass"
        @click.prevent="onClickEvnt"
      >
        {{ isCreate ? '등록' : '수정' }}
      </StyledButton>
    </template>
  </Modal>

  <MediaCodeSearch
    @close="isMediaCode = false"
    @select-media-code="setMediaCode"
    v-if="isMediaCode"
  />
</template>
