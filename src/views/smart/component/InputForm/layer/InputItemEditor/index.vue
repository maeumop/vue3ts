<script setup lang='ts'>
import {
  ref,
  nextTick,
  computed,
} from 'vue';

import type { Rules } from '@/components/types';

import type { ConstDbInputFieldTypeKeys } from '@/types/common';
import type { PutInputConfigParam, PutInputConfigRes } from '@/types/api/smartEditorApi';
import type { InputConfigEditForm, OptionsFieldType, InputConfigEditFormValuesItem } from '@/types/smart/component/inputForm';

import { useInputOnlyNumber, useToast } from '@/js/helper/common';
import { CONST_CODES, booleanYN, } from '@/constants/common';
import { FIX_FIELD_NAME } from '@/constants/smart/component';
import { getConstCodeOptions } from '@/js/common';

import { useUtil } from '@/js/util';
import { _isContains } from '@/js/helper/common';
import { useMessageBox } from '@/js/helper/messageBox';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import Modal from '@/components/Modal/index.vue';
import Options from '@/views/smart/component/InputForm/layer/InputItemEditor/Options.vue';
import SwitchButtonItem from '@/views/smart/component/InputForm/layer/InputItemEditor/SwitchButtonItem.vue';
import HiddenValue from '@/views/smart/component/InputForm/layer/InputItemEditor/HiddenValue.vue';
import NumberInputRange from '@/views/smart/component/InputForm/layer/InputItemEditor/NumberInputRange.vue';
import DlWrapperItem from '@/views/smart/component/InputForm/layer/InputItemEditor/DlWrapperItem.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import { useDatabaseApi } from '@/api/modules/databaseApi';
import type { InputConfigListItem } from '@/types/smart/component/inputForm';
import type { GetDbsInputFieldsConfigRes } from '@/types/api/databaseApi';


const { TEXT, NUMBER, RADIO, SELECT, CHECK, TEXTAREA, HIDDEN } = CONST_CODES.DB_INPUT_FIELD_TYPE;
const { PHONE, GENDER, PRIVACY_YN, THIRD_PARTY_YN, SMS_YN, CERT } = FIX_FIELD_NAME;

const util = useUtil();
const databaseApi = useDatabaseApi();
const smartEditorApi = useSmartEditorApi();

// emit
const emit = defineEmits<{
  // 컴포넌트 수정 완료 이벤트
  (event: 'on:editInputFormItems'): void;
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();

const utils = useUtil();

// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close' | '$refs' |'$nextTick'>>();
const validateForm = ref<ValidateFormModel>();

// readonly values ==============================================================================================================
const _rule: Rules = {
  default: [
    (v: string) => (!!v) || '필수 입력값입니다.',
  ],
  num: [
    (v: string) => ( v ? (Array.isArray(v.match(util.getRegExp('num')))) : true) || '숫자만 입력 가능합니다.',
  ],
};

const _editorForm: InputConfigEditForm = {
  fieldName: '',
  replaceCode: '{#=}',
  fieldLabel: '',
  fieldType: TEXT.VAL,

  hiddenValue: '',
  options: [],

  isRequire: false,
  isTextFiltering: false,
  isUse: false,

  placeholder: '',
  maxLength: '',
  numberInputRange: ',',
};

// 입력항목 타입마다 활성화 되어야하는 UI 체크 목록
const _useOption: { [K in keyof InputConfigEditForm]?: ConstDbInputFieldTypeKeys[] } =  {
  options: [ CHECK.VAL, RADIO.VAL, SELECT.VAL ],
  hiddenValue: [ HIDDEN.VAL ],

  isRequire: [ TEXT.VAL, NUMBER.VAL, RADIO.VAL, SELECT.VAL, CHECK.VAL, TEXTAREA.VAL ],
  isTextFiltering: [ TEXT.VAL, TEXTAREA.VAL ],
  isUse: Object.keys(CONST_CODES.DB_INPUT_FIELD_TYPE).filter(type =>  ![ 'TXT', 'VAL' ].includes(type)) as ConstDbInputFieldTypeKeys[],

  placeholder: [ TEXT.VAL, NUMBER.VAL, TEXTAREA.VAL ],
  maxLength: [ TEXT.VAL, NUMBER.VAL ],
  numberInputRange: [ NUMBER.VAL ],
};
// END readonly values ==========================================================================================================

let isShow = ref<boolean>(true);
// 수정 버튼 : 해당 입력항목의 변경 1회에 false로 활성화가 되며,
//            validation 이벤트를 수행시에 다시 true로 변경이 됩니다.
let disabled = ref<boolean>(true);
// 버튼 로딩 여부
let loading = ref<boolean>(false);

const { Toast } = useToast();

//  선택 index 값
let editTargetIndex = ref<number>(-1);
// 입력 항목 list
let inputConfigs = ref<InputConfigListItem[]>([]);
// 수정 폼
let editorForm = ref<InputConfigEditForm>({ ... _editorForm });

// computed
/**
 * 입력항목 타입마다 활성화 되어야하는 UI 체크
 * @return {boolean} 여/부
*/
const isUseOption = computed(() => 
  (option: (keyof InputConfigEditForm)) => _isContains(editorForm.value.fieldType, (_useOption[option] || [])));

/**
 * input1 - input20 name 체크
 * @return {boolean} 여/부
 */
const isInputForm = computed(() => (item: InputConfigEditForm) => item.fieldName.startsWith('input'));

// method
const { onInputOnlyNumber } = useInputOnlyNumber();
const { movementConfirm, changeFieldTypeConfirm } = useMessageBox();

/**
 * disabled 해제
 * 각 form 컴포넌트 blur 이벤트 발생시, 
 * 수정 버튼 disabled 해제가 진행이 됩니다.
*/
const clearDisabled = (): void => {
  disabled.value && (disabled.value = false);
};

/**
 * Modal 컴포넌트의 update:modelValue 이벤트 핸들러
 * Modal 컴포넌트의 close 함수 수행시 발생하는 이벤트를 캐치하여 모달을 종료를 수행합니다.
 * @author hjs0619
 * @returns
 */
const onCloseModal = (): void => {
  modalEL.value?.$nextTick(() => {
    editorForm.value = { ..._editorForm };
    editTargetIndex.value = -1;
    inputConfigs.value = [];

    claerValidation();
    isShow.value = false;
    emit('on:close');
  });
};

/**
 * validation 초기화
 * @author hjs0810
 * @returns
 */
const claerValidation = (): void => {
  nextTick(() => {
    validateForm.value?.resetValidate();
    disabled.value = true;
  });
};

/**
 * 입력항목 클릭 이벤트
 * @param index {number}
 * @returns
 */
const onClickItem = (index: number = 0): void => {
  // API 통신중일 때에는 진행 불가.
  // 현재 선택한 입력항목과 같은 항목 선택시 진행 불가.
  if (!loading.value && index !== editTargetIndex.value) {
    try {
      if (index < 0 || index >= inputConfigs.value.length) {
        throw new Error('참조할 수 없는 index입니다.');
      }

      if (disabled.value) {
        _changeEditorForm(index);
        return;
      }

      const modalDiv: HTMLDivElement = modalEL.value?.$refs.modal as HTMLDivElement;
      // 변경하기 버튼 이벤트
      const okayFn = () => {
        _changeEditorForm(index);
        // 현재 모달로 focus 이동
        modalDiv.focus();
      }; 
      // 취소하기 버튼 이벤트
      const cancelFn = () => modalDiv.focus();

      movementConfirm(okayFn, cancelFn);
    } catch (err) {
      console.error(err);
    // defaultErrors();
    }
  }
};

/**
 * inputConfigs에 입력항목 해당값 불러오기
 * @author inputFieldConfig
 * @returns
 */
const getInputFieldsConfig = async (): Promise<void> => {
  try {
    const { results } = await databaseApi.getDbsInputFieldsConfig('inputFieldConfig');
    inputConfigs.value = [...results];
    if (inputConfigs.value.length) {
      onClickItem();
    }
  } catch (error) {
    utils.axiosErrorCatch<GetDbsInputFieldsConfigRes>(error);
  }
};

/**
 * editorForm에 입력항목 해당값 불러오기
 * @param index {number}
 * @author hjs0810
 * @returns
 */
const _changeEditorForm = (index: number = 0): void => {

  // editorForm 초기화 진행
  editorForm.value = { ..._editorForm };

  if (index < 0 || index >= inputConfigs.value.length) {
    editTargetIndex.value = -1;
    throw new Error('참조할 수 없는 index입니다.');
  }

  const editItem: InputConfigListItem = inputConfigs.value[index];

  editTargetIndex.value = index;

  const { options, hiddenValue, isUse, isTextFiltering, isRequire, fieldType, maxLength,  ...arg } = editItem;

  const form = { ...editorForm.value, ...arg };
  // Object.assign(editorForm.value, arg);

  form.fieldType = fieldType as ConstDbInputFieldTypeKeys;
  form.maxLength =  typeof maxLength === 'number' ? `${maxLength}` : '';
  form.hiddenValue = editItem.fieldType === HIDDEN.VAL ? hiddenValue : undefined;

  if (_isContains(editItem.fieldType, [ RADIO.VAL, SELECT.VAL, CHECK.VAL ])) {
    const result: InputConfigEditFormValuesItem[] = options ? JSON.parse(options) : [];
    const now = Date.now();
    form.options = result.map((item, index) => ({ ...item, key: `${index}_${now}` }));
  }

  form.isUse = isUse === booleanYN.Y;
  form.isTextFiltering = isTextFiltering === booleanYN.Y;
  form.isRequire = isRequire === booleanYN.Y;

  editorForm.value = form;
  claerValidation();
};

/**
 * 여분 필드의 입력방식(type) 변경시,
 * Confirm 여부에 따라 fieldType에 맞는 editorForm 변경
 * @param fieldType {ConstDbInputFieldTypeKeys}
 * @returns
 */
const onChangeEditorFormType = (fieldType: ConstDbInputFieldTypeKeys): void => {
  const editItem = inputConfigs.value[editTargetIndex.value];

  if (editItem && editorForm.value.fieldType !== fieldType) {
    changeFieldTypeConfirm(async () => {
      const { fieldLabel, replaceCode, fieldName, ...arg } = _editorForm;

      const form = { ...editorForm.value, ...arg, fieldType };
      form.isRequire = editItem.isRequire === booleanYN.Y;

      editorForm.value = form;
      isInputForm.value(editorForm.value) && nextTick(() => clearDisabled());
    }); 
  }
};

/**
 * 선택 옵션 [ plus | minus ] 버튼 클릭 이벤트
 * @param type
 * @author hjs0810
 * @returns
 */
const onClickTool = () => nextTick(() =>  clearDisabled());

/**
 * [ 수정 ] 버튼 클릭이벤트 핸들러
 * @author hjs0620
 * @returns
 */
const onClickEvnt = async (): Promise<void> => {
  if (!disabled.value && validateForm.value?.validate()) {
    try {
      // 수행할 이벤트
      loading.value = true;
      validateForm.value?.formProtection(true);

      const editItem = inputConfigs.value[editTargetIndex.value];

      if (!editItem || !editItem.dbInputFieldConfigUid) {
        throw new Error('수행할 수 없는 함수입니다.');
      }

      await editConmponent(editItem.dbInputFieldConfigUid);
    } catch (err) {
      util.axiosErrorCatch<PutInputConfigRes>(err);
    } finally {
      validateForm.value?.formProtection(false);
      loading.value = false;
    }
  }
};


/**
 * 컴포넌트 수정버튼 클릭이벤트
 * @author hjs0620
 * @returns
 */
const editConmponent = async (dbInputFieldConfigUid: string): Promise<void> => {
  const index: number = editTargetIndex.value;

  const editItem = inputConfigs.value[index];

  if (!editItem) {
    throw new Error('참조할 수 없는 index입니다.');
  }

  const { fieldType, fieldLabel, fieldName, replaceCode, isRequire, isTextFiltering, isUse  } = editorForm.value;

  const req: PutInputConfigParam = {
    fieldType, fieldLabel, fieldName, replaceCode,
    placeholder: editorForm.value.placeholder || undefined,
    maxLength: parseInt(editorForm.value.maxLength || '') || undefined,
    numberInputRange: fieldType === NUMBER.VAL ?  editorForm.value.numberInputRange :  undefined,
    isRequire: isRequire ? booleanYN.Y : booleanYN.N,
    isTextFiltering: isTextFiltering ? booleanYN.Y : booleanYN.N,
    isUse: isUse ? booleanYN.Y : booleanYN.N,
    hiddenValue: fieldType === HIDDEN.VAL ? editorForm.value.hiddenValue : undefined
  };

  if (_isContains(req.fieldType, [ RADIO.VAL, SELECT.VAL, CHECK.VAL ])) {
    const options: InputConfigEditFormValuesItem[] = [];
    (editorForm.value.options || []).forEach(item => {
      const res: InputConfigEditFormValuesItem = { label: item.label };

      if (!_isContains(editorForm.value.fieldName, [ PRIVACY_YN, THIRD_PARTY_YN, SMS_YN ])) {
        // PRIVACY_YN, THIRD_PARTY_YN, SMS_YN 는 value 값이 없기 때문.
        res.value = item.value;
      }

      if (req.fieldType === CHECK.VAL) {
        res.checked = item.checked;
      }

      options.push(res);
    });

    req.options = JSON.stringify(options);
  }

  await smartEditorApi.puInputConfig(dbInputFieldConfigUid, req);

  const result: InputConfigListItem = {
    dbInputFieldConfigUid,
    ...req,
    placeholder: req.placeholder || '',
    maxLength: req.maxLength || 0,
    numberInputRange: req.numberInputRange || '',
    hiddenValue: req.hiddenValue || '',
    options: req.options || '',
  };

  editItem.fieldLabel = fieldLabel;
  editItem.isUse = req.isUse;

  inputConfigs.value.splice(index, 1, result);
  emit('on:editInputFormItems');
  claerValidation();
  Toast('정상적으로 수정되었습니다.');
};

// setup start
getInputFieldsConfig();
</script>
<script lang='ts'> export default { name: 'SmartInputFormInputItemEditor' };</script>
<template>
  <Modal
    access-back
    id="smartLayerInputConfigsEditor"
    ref="modalEL"
    class="smartInputForm smartLayerInputItemEditor"
    width="1200px"
    title="입력 항목 설정"
    :esc-close="!loading"
    :model-value="isShow"
    @update:model-value="onCloseModal"
  >
    <template #body>

      <div class="row">
        <div class="col-4">
          <div class="itemWrap">
            <div class="subTitle">
              <span>입력항목</span>
            </div>

            <ul class="itemList">
              <li
                :key="item.fieldName"
                :class="[{ on: index === editTargetIndex }, { useN: !item.isUse }]"
                v-for="(item, index) in inputConfigs"
              >
                <a href="#" @click.prevent="onClickItem(index)">
                  <div>{{ item.fieldName }} {{ item.fieldLabel && `(${item.fieldLabel})` }}</div>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-8">
          <ValidateForm ref="validateForm" v-if="editTargetIndex >= 0">
            <div class="editWrap">
              <div class="subTitle">
                <span>기본 설정</span>
              </div>
              <div class="row">
                <div class="col-6">
                  <TextField
                    block
                    required
                    hide-message
                    readonly
                    label="name"
                    v-model="editorForm.fieldName"
                  />
                </div>
                <div class="col-6">
                  <TextField
                    block
                    required
                    hide-message
                    readonly
                    label="변환코드"
                    v-model="editorForm.replaceCode"
                  />
                </div>
              </div>
              <div class="row mt-10">
                <div class="col-6">
                  <TextField
                    block
                    required
                    hide-message
                    label="항목명"
                    placeholder="항목명을 입력해 주세요."
                    :max-length="20"
                    :validate="_rule.default"
                    @blur="clearDisabled()"
                    v-model="editorForm.fieldLabel"
                  />
                </div>
                <div class="col-6">
                  <SelectBox
                    block
                    required
                    hide-message
                    label="입력방식(type)"
                    :readonly="!isInputForm(editorForm)"
                    :validate="_rule.default"
                    :options="getConstCodeOptions('DB_INPUT_FIELD_TYPE')"
                    :model-value="editorForm.fieldType"
                    @update:model-value="onChangeEditorFormType"
                  />
                </div>
              </div>
            </div>

            <div class="editWrap mt-10">
              <div class="subTitle">
                <span>세부 옵션</span>
              </div>

              <template v-if="isUseOption('placeholder')">
                <div class="row">
                  <div class="col">
                    <TextField
                      block
                      hide-message
                      max-length="50"
                      label="placeholder"
                      placeholder="placeholder 입력해 주세요."
                      @blur="clearDisabled()"
                      v-model="editorForm.placeholder"
                    />
                  </div>
                </div>
                <div class="mx-3 pt-3 text-size-xs text-gray-600">입력 필드에 표시되는 메시지를 설정하는 영역입니다.</div>
              </template>

              <template v-if="isUseOption('maxLength')">
                <div class="row mt-10">
                  <div class="col">
                    <TextField
                      block
                      hide-message
                      max-length="50"
                      label="maxlength"
                      placeholder="숫자만 입력해 주세요."
                      :readonly="_isContains(editorForm.fieldName, [ PHONE, CERT ])"
                      :validate="_rule.num"
                      @blur="clearDisabled()"
                      @input="onInputOnlyNumber"
                      v-model="editorForm.maxLength"
                    />
                  </div>
                </div>
                <div class="mx-3 pt-3 text-size-xs text-gray-600">입력할 수 있는 최대 문자수를 설정하는 영역입니다.</div>
              </template>

              <template v-if="!_isContains(editorForm.fieldName, [ PHONE, CERT ])">
                <NumberInputRange
                  is-info-box
                  class="mt-10"
                  label="입력범위"
                  @update:after="clearDisabled()"
                  v-model="editorForm.numberInputRange"
                  v-if="isUseOption('numberInputRange')"
                />
              </template>

              <template v-if="Array.isArray(editorForm.options)">
                <Options
                  required
                  label="선택 옵션"
                  :field-type="(editorForm.fieldType as OptionsFieldType)"
                  :is-drag-handle="_isContains(editorForm.fieldName, [ GENDER ])"
                  :is-info-box="isInputForm(editorForm)"
                  :is-use-tool="!_isContains(editorForm.fieldName, [ PRIVACY_YN, THIRD_PARTY_YN, SMS_YN ])"
                  :validate="{ value:_rule.default, label: _rule.default }"
                  @update:after="clearDisabled()"
                  @on:click-tool="onClickTool"
                  @sort-end="clearDisabled()"
                  v-model="editorForm.options"
                  v-if="isUseOption('options')"
                />
              </template>
              
              <template v-if="editorForm.hiddenValue !== undefined">
                <HiddenValue
                  class="mt-10"
                  @update:after="clearDisabled()"
                  v-model="editorForm.hiddenValue"
                  v-if="isUseOption('hiddenValue')"
                />
              </template>

              <div class="dlWrapper tableBox mt-20">
                <DlWrapperItem v-if="isUseOption('isRequire')">
                  <template #label>필수 입력 여부</template>
                  <template #default>
                    <SwitchButtonItem
                      class="px-5"
                      :label="['필수아님', '필수']"
                      :readonly="_isContains(editorForm.fieldName, [PHONE, PRIVACY_YN, CERT])"
                      @update:after="clearDisabled()"
                      v-model="editorForm.isRequire"
                    />
                  </template>
                </DlWrapperItem>
                <DlWrapperItem v-if="isUseOption('isTextFiltering')">
                  <template #label>단어 필터링 적용</template>
                  <template #default>
                    <SwitchButtonItem
                      class="px-5"
                      :label="['미적용', '적용']"
                      @update:after="clearDisabled()"
                      v-model="editorForm.isTextFiltering"
                    />
                  </template>
                </DlWrapperItem>
                <DlWrapperItem v-if="isUseOption('isUse')">
                  <template #label>사용여부</template>
                  <template #default>
                    <SwitchButtonItem
                      class="p-5"
                      :label="['사용안함', '사용']"
                      :readonly="_isContains(editorForm.fieldName, [PHONE])"
                      @update:after="clearDisabled()"
                      v-model="editorForm.isUse"
                    >
                      <template #helperMessgae>
                        <span>[사용안함] 설정 시 본 항목은 리스트, 선택 옵션에서 노출되지 않습니다.</span>
                      </template>
                    </SwitchButtonItem>
                  </template>
                </DlWrapperItem>
              </div>
            </div>
          </ValidateForm>
        </div>
      </div>
    </template>

    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
          color="primary"
          :disabled="disabled"
          :loading="loading"
          @click="onClickEvnt()"
        >
          수정
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline :disabled="loading" @click="close()">
          닫기
        </StyledButton>
      </div>
    </template>
  </Modal>

</template>