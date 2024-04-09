<script setup lang='ts'>
import {
  ref,
  computed,
  reactive,
} from 'vue';
import { v1 as uuid } from 'uuid';

import type { Rules, OptionItem } from '@/components/types';

import type { RollingBannerGrpItem, PostRollingBannerGrpsParam, PutRollingBannerGrpsParam, PostRollingBannerGrpsRes, PutRollingBannerGrpsRes } from '@/types/api/smartEditorApi';
import type { RollingBannerGrpEditForm } from '@/types/smart/component/rollingBanner';

import { CONST_CODES, booleanYN } from '@/constants/common';
import { getConstCodeOptions } from '@/js/common';
import { useToast, useLayoutSelectBox } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import Modal from '@/components/Modal/index.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

type OnOpenOption = {
  target?: RollingBannerGrpItem
};


const { TRANSITION_TYPE } = CONST_CODES;

const util = useUtil();
const smartEditorApi = useSmartEditorApi();

// emit
const emit = defineEmits<{
  // 컴포넌트 등록 완료 이벤트
  (event: 'on:createComponent', value: RollingBannerGrpItem): void;
  // 컴포넌트 수정 완료 이벤트
  (event: 'on:editComponent', value: RollingBannerGrpItem): void;
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();


// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'| '$nextTick'>>();
const validateForm = ref<ValidateFormModel>();

const modalId = 'smartLayerRollingBannerGrpsEditor';
let _original: RollingBannerGrpItem|null = null;

// readonly values ==============================================================================================================
const _durationOptions: OptionItem[] = Array.from({ length: 10 }, (_: undefined, i: number) => ({ value: `${i + 1}`, text: `${i + 1}초` }));

const _rule: Rules = {
  default: [
    (v: string) => (!!v) || '필수 입력값입니다.',
  ],
  commentCount: [
    (v: string) => (!!v) && parseInt(v) > 0 || '1이상의 숫자를 입력해 주세요.',
  ],
};

const _editorForm: RollingBannerGrpEditForm = {
  rollingBannerGrpName: '',
  layoutUid: '',
  transitionType: TRANSITION_TYPE.SLIDE.VAL,
  duration: '2',
  sizeX: '100%',
  sizeY: '',
  isUseArrowBtn: false,
  arrowBtnColorCode: '#FFFFFF',
  isUseIndicator: false,
  indicatorColorCode: '#000000'
} as const;
// END readonly values ==========================================================================================================


let isShow = ref<boolean>(false);
let disabled = ref<boolean>(true);
let loading = ref<boolean>(false);
let editorForm = reactive<RollingBannerGrpEditForm>({ ..._editorForm });

const { Toast } = useToast();

// SelectBox
const layoutSelectBox = useLayoutSelectBox();
const { layoutOptions, getLayoutText, isLoading } = layoutSelectBox;

// computed
const isEditor = computed(() => isShow.value && (_original ? true : false));
const getTitle = computed(() => `배너 그룹 ${isEditor.value ? '수정' : '등록'}`);

// method
/**
 * LayerPopup 활성
 * @author hjs0620
 * @returns
 */
const onOpen = async (params?: OnOpenOption): Promise<void> => {
  try {
    if (isShow.value) {
      throw new Error('작업을 진행중이십니다.');
    }

    if (params && params.target) {
      _original = Object.freeze({ ...params.target });

      const [ sizeX, sizeY ] = _original.componentSize.split(',');

      editorForm.rollingBannerGrpName = _original.rollingBannerGrpName;
      editorForm.layoutUid = _original.layoutUid;
      editorForm.transitionType = _original.transitionType;
      editorForm.duration = `${_original.duration}`;
      editorForm.sizeX = sizeX || _editorForm.sizeX;
      editorForm.sizeY = sizeY ||  _editorForm.sizeY;
      editorForm.isUseArrowBtn = _original.isUseArrowBtn === booleanYN.Y;
      editorForm.arrowBtnColorCode = _original.arrowBtnColorCode || _editorForm.arrowBtnColorCode;
      editorForm.isUseIndicator = _original.isUseIndicator === booleanYN.Y;
      editorForm.indicatorColorCode = _original.indicatorColorCode || _editorForm.indicatorColorCode;

    }

    isShow.value = true;
    disabled.value = isEditor.value;
  } catch (error) {
    let err: Error = new Error('고객센터에 문의를 남겨주세요.');
    if (error instanceof Error) {
      err = error;
    }

    return Promise.reject(err);
  }
  return  Promise.resolve();
};


/**
 * Modal 컴포넌트의 close 함수 수행.
 * @author hjs0620
 * @returns
 */
const onClose = (): void => modalEL.value?.close();

const validation = (): void => {
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
    Object.assign(editorForm, _editorForm);
    layoutSelectBox.clearOptions();
    _original = null;
    disabled.value = true;
    isShow.value = false;
    emit('on:close');
  });
};

/**
 * [ 등록 | 수정 ] 버튼 클릭이벤트 핸들러
 * @author hjs0620
 * @returns
 */
const onClickEvnt = async (): Promise<void> => {
  if (!disabled.value && validateForm.value?.validate()) {
    try {
      // 수행할 이벤트
      loading.value = true;
      validateForm.value?.formProtection(true);

      if (isEditor.value) {
        // 수정 모드
        await _editConmponent();
      } else {
        // 등록 모드
        await _createConmponent();
      }
      onClose();
    } catch (err) {
      util.axiosErrorCatch<PostRollingBannerGrpsRes | PutRollingBannerGrpsRes>(err);
    } finally {
      validateForm.value?.formProtection(false);
      loading.value = false;
    }
  }
};

/**
 * PostRollingBannerGrpsParam, PutRollingBannerGrpsParam 공통 객체생성
 * @returns
 */
const _createCommonParam = (): PutRollingBannerGrpsParam => {
  return {
    layoutUid: editorForm.layoutUid,
    rollingBannerGrpName: editorForm.rollingBannerGrpName,
    transitionType: editorForm.transitionType,
    duration: parseInt(editorForm.duration),
    isUseArrowBtn: editorForm.isUseArrowBtn ? booleanYN.Y : booleanYN.N,
    arrowBtnColorCode: editorForm.isUseArrowBtn ? editorForm.arrowBtnColorCode : undefined,
    isUseIndicator: editorForm.isUseIndicator ? booleanYN.Y : booleanYN.N,
    indicatorColorCode: editorForm.isUseIndicator ? editorForm.indicatorColorCode : undefined,
    componentSize: `${editorForm.sizeX},${editorForm.sizeY || ''}`,
  };
};

/**
 * 컴포넌트 등록버튼 클릭이벤트
 * @author hjs0620
 * @returns
 */
const _createConmponent = async (): Promise<void> => {
  const compRollingBannerGrpUid: string = uuid();

  const req: PostRollingBannerGrpsParam = {
    compRollingBannerGrpUid,
    ..._createCommonParam()
  };

  await smartEditorApi.postRollingBannerGrps(req);

  const result: RollingBannerGrpItem = {
    ...req,
    layoutName: getLayoutText.value(editorForm.layoutUid),
    regDatetime: Date.now()
  };

  emit('on:createComponent', result);
  Toast('정상적으로 등록되었습니다.');
};

/**
 * 컴포넌트 수정버튼 클릭이벤트
 * @author hjs0620
 * @returns
 */
const _editConmponent = async (): Promise<void> => {
  if (!_original) {
    throw new Error('참조할 수 있는 _original 값이 아닙니다.');
  }

  const { compRollingBannerGrpUid, regDatetime } = _original;
  const req: PutRollingBannerGrpsParam = _createCommonParam();

  await smartEditorApi.putRollingBannerGrps(compRollingBannerGrpUid, req);

  const result: RollingBannerGrpItem = {
    compRollingBannerGrpUid, regDatetime,
    ...req,
    layoutName: getLayoutText.value(editorForm.layoutUid),
  };

  emit('on:editComponent', result);
  Toast('정상적으로 수정되었습니다.');
};

defineExpose({
  onOpen,
  onClose
});
</script>
<script lang='ts'> export default { name: 'SmartRollingBannerLayerGroupEditor' };</script>
<template>
  <Modal
    access-back
    :id="modalId"
    ref="modalEL"
    class="smartRollingBanner smartLayerGroupEditor"
    width="520px"
    :title="getTitle"
    :esc-close="!loading"
    :model-value="isShow"
    @update:model-value="onCloseModal"
  >
    <template #body>
      <ValidateForm ref="validateForm" v-if="isShow">
        <!-- 1row -->
        <div class="row">
          <div class="col">
            <TextField
              block
              required
              blur-validate
              hide-message
              label="배너 그룹명"
              placeholder="배너 그룹명을 입력해주세요."
              :max-length="50"
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.rollingBannerGrpName"
            />
          </div>
        </div>
        <!-- 2row -->
        <div class="row mt-10">
          <div class="col">
            <SelectBox
              block
              required
              searchable
              hide-message
              label="레이아웃"
              placeholder="선택"
              :is-loading="isLoading"
              :options="layoutOptions"
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.layoutUid"
            />
          </div>
        </div>
        <!-- 3row -->
        <div class="row mt-10">
          <div class="col">
            <CheckButton
              required
              type="radio"
              color="primary"
              label="효과 선택"
              :validate="_rule.default"
              :items="getConstCodeOptions('TRANSITION_TYPE')"
              @update:after="validation()"
              v-model="editorForm.transitionType"
            />
          </div>
        </div>
        <!-- 4row -->
        <div class="row mt-10">
          <div class="col">
            <SelectBox
              block
              required
              hide-message
              label="전환 시간 설정"
              placeholder="선택"
              :validate="_rule.default"
              :options="_durationOptions"
              @blur="validation()"
              v-model="editorForm.duration"
            />
          </div>
        </div>
        <!-- 5row -->
        <div class="row mt-10 componentSize">
          <div class="col-3 pr-10">
            <TextField
              block
              required
              blur-validate
              hide-message
              label="배너 사이즈"
              placeholder="넓이, 단위 포함 입력 ex)100%"
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.sizeX"
            />
          </div>
          <div class="col-3 self-end pl-10">
            <TextField
              block
              blur-validate
              hide-message
              placeholder="높이, 단위 포함 입력 ex)100%"
              @blur="validation()"
              v-model="editorForm.sizeY"
            />
          </div>
        </div>
        <!-- 6row -->
        <div class="row mt-10">
          <div class="col-3 flex-center">
            <span class="custom">
              좌/우 화살표 버튼
            </span>
          </div>
          <div class="col-3 self-center px-10">
            <SwitchButton :label="[ '미노출', '노출' ]" @update:after="validation()" v-model="editorForm.isUseArrowBtn" />
          </div>
          <div class="col-6">
            <TextField
              block
              blur-validate
              hide-message
              max-length="10"
              placeholder="HEX 형식 입력ex)#FFFFFF"
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.arrowBtnColorCode"
              v-if="editorForm.isUseArrowBtn"
            />
          </div>
        </div>
        <!-- 7row -->
        <div class="row mt-10">
          <div class="col-3 flex-center">
            <span class="custom">
              점 버튼
            </span>
          </div>
          <div class="col-3 self-center px-10">
            <SwitchButton :label="[ '미노출', '노출' ]" @update:after="validation()" v-model="editorForm.isUseIndicator" />
          </div>
          <div class="col-6">
            <template v-if="editorForm.isUseIndicator">
              <TextField
                block
                blur-validate
                hide-message
                max-length="10"
                placeholder="HEX 형식 입력ex)#000000"
                :validate="_rule.default"
                @blur="validation()"
                v-model="editorForm.indicatorColorCode"
              />
            </template>
          </div>
        </div>

      </ValidateForm>
    </template>

    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
          color="primary"
          :loading="loading"
          :disabled="disabled"
          @click="!loading && onClickEvnt()"
        >
          {{ isEditor ? '수정' : '등록' }}
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline :disabled="loading" @click="close">
          닫기
        </StyledButton>
      </div>
    </template>
  </Modal>

</template>