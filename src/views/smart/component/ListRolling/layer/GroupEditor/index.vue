<script setup lang='ts'>
import {
  ref,
  computed,
  reactive,
} from 'vue';
import { v1 as uuid } from 'uuid';

import type { Rules, OptionItem } from '@/components/types';

import type { RollingListGrpEditForm } from '@/types/smart/component/listRolling';
import type { PostRollingListGrpsParam, PostRollingListGrpsRes, PutRollingBannerGrpsRes, PutRollingListGrpsParam, RollingListGrpItem } from '@/types/api/smartEditorApi';

import { useToast, useLayoutSelectBox, useInputOnlyNumber } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import Modal from '@/components/Modal/index.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';


type OnOpenOption =  {
  self?: RollingListGrpItem
};


const util = useUtil();
const smartEditorApi = useSmartEditorApi();

// emit
const emit = defineEmits<{
  // 컴포넌트 등록 완료 이벤트
  (event: 'on:createComponent', value: RollingListGrpItem): void;
  // 컴포넌트 수정 완료 이벤트
  (event: 'on:editComponent', value: RollingListGrpItem): void;
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();


// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close' | '$nextTick'>>();
const validateForm = ref<ValidateFormModel>();

const modalId = 'smartLayerRollingListGrpsEditor';
let _original: RollingListGrpItem | null = null;

// readonly values ==============================================================================================================
const _durationOptions: OptionItem[] = Array.from({ length: 10 }, (_: undefined, i: number) => ({ value: `${i + 1}`, text: `${i + 1}초` }));
const _rule: Rules = {
  default: [
    (v: string) => (!!v) || '필수 입력값입니다.',
  ],
  listCount: [
    (v: string) => (!!v) && parseInt(v) > 0 || '1이상의 숫자를 입력해 주세요.',
  ],
};

const _editorForm: RollingListGrpEditForm = {
  rollingListGrpName: '',
  layoutUid: '',
  listCount: '3',
  duration: '2',
  sizeX: '100%',
} as const;
// END readonly values ==========================================================================================================


let isShow = ref<boolean>(false);
let disabled = ref<boolean>(true);
let loading = ref<boolean>(false);
let editorForm = reactive<RollingListGrpEditForm>({ ..._editorForm });

const { Toast } = useToast();
const { onInputOnlyNumber } = useInputOnlyNumber();

// SelectBox
const layoutSelectBox = useLayoutSelectBox();
const { layoutOptions, getLayoutText, isLoading } = layoutSelectBox;

// computed
const isEditor = computed(() => isShow.value && (_original ? true : false));
const getTitle = computed(() => `리스트 그룹 ${isEditor.value ? '수정' : '등록'}`);

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

    if (params && params.self) {
      _original = Object.freeze({ ...params.self });
      const [ sizeX, sizeY ] = _original.componentSize.split(',');

      editorForm.rollingListGrpName = _original.rollingListGrpName;
      editorForm.layoutUid = _original.layoutUid;
      editorForm.listCount = `${_original?.listCount}`;
      editorForm.duration = `${_original.duration}`;
      editorForm.sizeX = sizeX;
      editorForm.sizeY = sizeY || '';

      _rule.listCount.push((v: string) => parseInt(v) <= (_original?.listTotalCount || 0) || '리스트 관리에 등록된 된 리스트 수보다 크게 설정할 수 없습니다.',);
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
const onClose = (): void => {
  modalEL.value?.close();
};

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
    if (_rule.listCount.length > 1) {
      _rule.listCount.splice(1, _rule.listCount.length);
    }
    _original = null;
    disabled.value = true;
    isShow.value = false;
    emit('on:close');
  });
};

/**
 * [ 등록|수정 ] 버튼 클릭이벤트 핸들러
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
      util.axiosErrorCatch<PostRollingListGrpsRes | PutRollingBannerGrpsRes>(err);
    } finally {
      validateForm.value?.formProtection(false);
      loading.value = false;
    }
  }
};

/**
 * PostRollingListGrpsParam, PutRollingListGrpsParam 공통 객체생성
 * @returns
 */
const _createCommonParam = (): PutRollingListGrpsParam => {
  return {
    layoutUid: editorForm.layoutUid,
    rollingListGrpName: editorForm.rollingListGrpName,
    listCount: parseInt(editorForm.listCount) || 1,
    duration: parseInt(editorForm.duration),
    componentSize: `${editorForm.sizeX},${editorForm.sizeY || ''}`,
  };
};


/**
 * 컴포넌트 등록버튼 클릭이벤트
 * @author hjs0620
 * @returns
 * @throws
 */
const _createConmponent = async (): Promise<void> => {
  const compRollingListGrpUid: string = uuid();

  const req: PostRollingListGrpsParam = {
    compRollingListGrpUid,
    ..._createCommonParam()
  };

  await smartEditorApi.postRollingListGrps(req);
  const result: RollingListGrpItem = {
    ...req,
    listTotalCount: 0,
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
 * @throws
 */
const _editConmponent = async (): Promise<void> => {
  if (!_original) {
    throw new Error('참조할 수 있는 _original 값이 아닙니다.');
  }

  const { compRollingListGrpUid, regDatetime, listTotalCount } = _original;
  const req: PutRollingListGrpsParam = _createCommonParam();

  await smartEditorApi.putRollingListGrps(compRollingListGrpUid, req);
  const result: RollingListGrpItem = {
    compRollingListGrpUid, regDatetime, listTotalCount,
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
<script lang='ts'> export default { name: 'SmartListRollingLayerGroupEditor' };</script>
<template>
  <Modal
    access-back
    :id="modalId"
    ref="modalEL"
    class="smartListRolling smartLayerGroupEditor"
    width="520px"
    :title="getTitle"
    :esc-close="!loading"
    :model-value="isShow"
    @update:model-value="onCloseModal"
  >
    <template #body>
      <ValidateForm ref="validateForm" v-if="isShow">
        <div class="row">
          <div class="col">
            <TextField
              block
              required
              hide-message
              label="리스트 그룹명"
              placeholder="리스트 그룹명을 입력해주세요."
              :max-length="50"
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.rollingListGrpName"
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
            <TextField
              block
              required
              type="tel"
              max-length="2"
              label="화면 노출 수"
              placeholder="1이상 숫자만 입력해 주세요."
              :validate="_rule.listCount"
              @input="onInputOnlyNumber"
              @blur="validation()"
              v-model="editorForm.listCount"
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
        <div class="row mt-10 listSize">
          <div class="col-3 pr-10">
            <TextField
              block
              required
              hide-message
              label="리스트 사이즈"
              placeholder="넓이, 단위 포함 입력 ex)100%"
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.sizeX"
            />
          </div>
          <div class="col-3 self-end pl-10">
            <TextField
              block
              hide-message
              placeholder="높이, 단위 포함 입력 ex)100%"
              @blur="validation()"
              v-model="editorForm.sizeY"
            />
          </div>
        </div>
      </ValidateForm>
    </template>

    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
          color="primary"
          :disabled="disabled"
          :loading="loading"
          @click="!loading && onClickEvnt()"
        >
          {{ isEditor ? '수정' : '등록' }}
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline :disabled="loading" @click="close()">
          닫기
        </StyledButton>
      </div>
    </template>
  </Modal>

</template>