<script setup lang='ts'>
import {
  ref,
  computed,
} from 'vue';
import { v1 as uuid } from 'uuid';

import type { RuleFunc } from '@/components/types';

import type { SmartComponent } from '@/types/smartEditor';
import type {
  GetInputFormItem, PostCopyInputFormParam,
  RollingBannerGrpItem, PostCopyRollingBannerGrpsParam,
  PostCopyRollingListGrpsParam, RollingListGrpItem,
  CommentGrpItem, PostCopyCommentGrpsParam,
  ImportItem, PostCopyImportsParam
} from '@/types/api/smartEditorApi';
import type { COPY_MODE_TYPE } from '@/types/smart/component';

import { COPY_MODE } from '@/constants/smart/component';

import { useToast } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import Modal from '@/components/Modal/index.vue';
import { CONST_CODES } from '@/constants/common';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

const { PAGE_SECTION_TYPE } = CONST_CODES;

type OnOpenOption = {
  type: COPY_MODE_TYPE
  self: SmartComponent
};

const util = useUtil();
const smartEditorApi = useSmartEditorApi();

// emit
const emit = defineEmits<{
  // 컴포넌트 복사 완료 이벤트
  (event: 'on:copyComponent', value: SmartComponent): void;
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();

// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'|'$nextTick'>>();
const validateForm = ref<ValidateFormModel>();

// readonly
const modalId = 'smartLayerCopyComponent';
let _original: SmartComponent|null = null;
let _type: COPY_MODE_TYPE | null = null;
const _rule: RuleFunc[] = [
  (v: string) => (!!v) || '필수 입력값입니다.',
];


let isShow = ref<boolean>(false);
let loading = ref<boolean>(false);
let copyName = ref<string>('');

const { copySuccess } = useToast();

// computed
const getTypeTxT = computed(() => {
  if (isShow.value && _type) {
    return PAGE_SECTION_TYPE[_type].TXT;
  }

  return '';
});

/**
 * LayerPopup 활성
 * @author hjs0620
 * @returns
 */
const onOpen = async (params: OnOpenOption): Promise<void> => {
  try {
    if (isShow.value) {
      throw new Error('작업을 진행중이십니다.');
    }

    _original = Object.freeze({ ...params.self });
    _type = params.type;

    isShow.value = true;
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

/**
 * Modal 컴포넌트의 update:modelValue 이벤트 핸들러
 * Modal 컴포넌트의 close 함수 수행시 발생하는 이벤트를 캐치하여 모달을 종료를 수행합니다.
 * @author hjs0619
 * @returns
 */
const onCloseModal = (): void => {
  modalEL.value?.$nextTick(() => {
    validateForm.value?.resetForm();
    _original = null;
    _type = null;
    isShow.value = false;
    emit('on:close');
  });
};

/**
 * 복사 이벤트 수행.
 * @author hjs0620
 * @returns
 */
const onClickEvnt = async () => {
  if (validateForm.value?.validate()) {
    try {
      loading.value = true;
      validateForm.value?.formProtection(true);
      let callback: Function | null = null;

      switch (_type) {
        case COPY_MODE.ROLLING_BANNER: {
          callback = _copySmartRollingBanner;
        } break;
        case COPY_MODE.ROLLING_LIST: {
          callback = _copySmartListRolling;
        } break;
        case COPY_MODE.COMMENT: {
          callback = _copySmartComment;
        } break;
        case COPY_MODE.IMPORT: {
          callback = _copySmartImport;
        } break;
        case COPY_MODE.INPUT_FORM: {
          callback = _postCopyInputForm;
        } break;

        default: throw new Error('복사 할 수 있는 컴포넌트가 아닙니다.');
      }

      await callback();
      copySuccess();
      onClose();

    } catch (err) {
      util.axiosErrorCatch(err);
    } finally {
      validateForm.value?.formProtection(false);
      loading.value = false;
    }
  }
};

const _postCopyInputForm = async (): Promise<void> => {
  // 입력폼 복사 API
  const compInputFormUid: string = (_original as GetInputFormItem).compInputFormUid;
  const req: PostCopyInputFormParam = { inputFormName: copyName.value, compInputFormUid: uuid() };

  await smartEditorApi.postCopyInputForm(compInputFormUid, req);
  const result: GetInputFormItem = {
    ...(_original as GetInputFormItem),
    ...req,
    regDatetime: Date.now()
  };

  emit('on:copyComponent', result);
};

const _copySmartRollingBanner = async (): Promise<void> => {
  // 롤링 배너 복사 API
  const compRollingBannerGrpUid: string = (_original as RollingBannerGrpItem).compRollingBannerGrpUid;
  const req: PostCopyRollingBannerGrpsParam = { rollingBannerGrpName: copyName.value, compRollingBannerGrpUid: uuid() };

  await smartEditorApi.postCopyRollingBannerGrps(compRollingBannerGrpUid, req);

  const result: RollingBannerGrpItem = {
    ...(_original as RollingBannerGrpItem),
    ...req,
    regDatetime: Date.now()
  };

  emit('on:copyComponent', result);
};

const _copySmartListRolling = async (): Promise<void> => {
  // 리스트 롤링 복사 API
  const compRollingListGrpUid: string = (_original as RollingListGrpItem).compRollingListGrpUid;
  const req: PostCopyRollingListGrpsParam = { rollingListGrpName: copyName.value, compRollingListGrpUid: uuid() };

  await smartEditorApi.postCopyRollingListGrps(compRollingListGrpUid, req);
  const result: RollingListGrpItem = {
    ...(_original as RollingListGrpItem),
    ...req,
    regDatetime: Date.now()
  };

  emit('on:copyComponent', result);
};

const _copySmartComment = async (): Promise<void> => {
  // 댓글 복사 API
  const compCommentGrpUid: string = (_original as CommentGrpItem).compCommentGrpUid;
  const req: PostCopyCommentGrpsParam = { commentGrpName: copyName.value, compCommentGrpUid: uuid() };

  await smartEditorApi.postCopyCommentGrps(compCommentGrpUid, req);
  const result: CommentGrpItem = {
    ...(_original as CommentGrpItem),
    ...req,
    regDatetime: Date.now()
  };

  emit('on:copyComponent', result);
};


const _copySmartImport = async (): Promise<void> => {
  // 댓글 복사 API
  const compImportUid: string = (_original as ImportItem).compImportUid;
  const req: PostCopyImportsParam = { importName: copyName.value, compImportUid: uuid() };

  await smartEditorApi.postCopyImports(compImportUid, req);
  const result: ImportItem = {
    ...(_original as ImportItem),
    ...req,
    regDatetime: Date.now()
  };

  emit('on:copyComponent', result);
};

defineExpose({
  onOpen,
  onClose
});

</script>
<script lang='ts'> export default { name: 'SmartCopyComponent' };</script>
<template>
  <Modal
    access-back
    ref="modalEL"
    :id="modalId"
    class="smartCopyComponent"
    :title="`${getTypeTxT} 복사`"
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
              :label="`${getTypeTxT}명`"
              :placeholder="`${ `${getTypeTxT}명`.josaFormat() } 입력해주세요.`"
              :max-length="50"
              :validate="_rule"
              v-model="copyName"
            />
          </div>
        </div>
      </ValidateForm>
    </template>
    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
          color="primary"
          :loading="loading"
          @click="!loading && onClickEvnt()"
        >
          복사
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline :disabled="loading" @click="close">
          닫기
        </StyledButton>
      </div>
    </template>
  </Modal>
</template>