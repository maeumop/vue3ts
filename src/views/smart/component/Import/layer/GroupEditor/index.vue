<script setup lang='ts'>
import {
  ref,
  computed,
  reactive,
} from 'vue';
import { v1 as uuid } from 'uuid';

import type { Rules } from '@/components/types';

import type { ImportEditForm } from '@/types/smart/component/import';
import type { ImportItem, PostImportsParam, PostImportsRes, PutImportsParam, PutImportsRes,  } from '@/types/api/smartEditorApi';

import { useToast, useLayoutSelectBox } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import Modal from '@/components/Modal/index.vue';
import CodeMirrorForm from '@/views/common/CodeMirrorForm/index.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

type OnOpenOption = {
  self?: ImportItem
};

const util = useUtil();
const smartEditorApi = useSmartEditorApi();

// emit
const emit = defineEmits<{
  // 컴포넌트 등록 완료 이벤트
  (event: 'on:createComponent', value: ImportItem): void;
  // 컴포넌트 수정 완료 이벤트
  (event: 'on:editComponent', value: ImportItem): void;
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();


// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'|'$nextTick'>>();
const validateForm = ref<ValidateFormModel>();

const modalId = 'smartLayerImportsEditor';
let _original: ImportItem|null = null;


// readonly values ==============================================================================================================
const _rule: Rules = {
  default: [
    (v: string) => (!!v) || '필수 입력값입니다.',
  ],
};

const _editorForm: ImportEditForm = {
  importName: '',
  layoutUid: '',
  sourceCode: '',
};
// END readonly values ==========================================================================================================


let isShow = ref<boolean>(false);
let disabled = ref<boolean>(true);
let loading = ref<boolean>(false);
let editorForm = reactive<ImportEditForm>({ ..._editorForm });

const { Toast } = useToast();

const layoutSelectBox = useLayoutSelectBox();
const { layoutOptions, getLayoutText, isLoading } = layoutSelectBox;

// computed
const isEditor = computed(() => isShow.value && (_original ? true : false));
const getTitle = computed(() => `임포트 ${isEditor.value ? '수정' : '등록'}`);

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
      editorForm = Object.assign(editorForm, _editorForm, {
        importName: _original.importName,
        layoutUid: _original.layoutUid,
        sourceCode: _original.sourceCode,
      });
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
        await _editConmponent();
        Toast('정상적으로 수정되었습니다.');
      } else {
        await _createConmponent();
        Toast('정상적으로 등록되었습니다.');
      }
      onClose();
    } catch (err) {
      util.axiosErrorCatch<PostImportsRes | PutImportsRes>(err);
    } finally {
      validateForm.value?.formProtection(false);
      loading.value = false;
    }
  }
};

/**
 * PostImportsParam, PutImportsParam 공통 객체생성
 * @returns
 */
const _createCommonParam = (): PutImportsParam => {
  const { layoutUid, importName, sourceCode } = editorForm;
  return {
    layoutUid, importName, sourceCode
  };
};

/**
 * 컴포넌트 등록
 * @author hjs0620
 * @returns
 */
const _createConmponent = async (): Promise<void> => {
  const compImportUid: string = uuid();

  const req: PostImportsParam = {
    compImportUid,
    ..._createCommonParam()
  };

  await smartEditorApi.postImports(req);
  const result: ImportItem = {
    ...req,
    layoutName: getLayoutText.value(editorForm.layoutUid),
    regDatetime: Date.now()
  };

  emit('on:createComponent', result);
};

/**
 * 컴포넌트 수정
 * @author hjs0620
 * @returns
 */
const _editConmponent = async (): Promise<void> => {
  if (!_original) {
    throw new Error('참조할 수 있는 _original 값이 아닙니다.');
  }

  const { compImportUid, regDatetime } = _original;
  const req: PutImportsParam = _createCommonParam();

  await smartEditorApi.putImports(compImportUid, req);
  const result: ImportItem = {
    compImportUid,
    regDatetime,
    ...req,
    layoutName: getLayoutText.value(editorForm.layoutUid)
  };

  emit('on:editComponent', result);
};

defineExpose({
  onOpen,
  onClose
});
</script>
<script lang='ts'> export default { name: 'ImportItemLayerGroupEditor' };</script>
<template>
  <Modal
    access-back
    ref="modalEL"
    class="smartImport smartLayerGroupEditor"
    width="1200px"
    :id="modalId"
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
              blur-validate
              hide-message
              label="임포트명"
              placeholder="임포트명을 입력해주세요."
              :max-length="50"
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.importName"
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
        <div class="mx-3 pt-3 text-size-xs text-gray-600">미리보기 페이지에 적용되는 레이아웃입니다.</div>
        <!-- 3row -->
        <div class="row mt-10">
          <div class="col">
            <CodeMirrorForm
              block
              required
              hide-message
              height="320"
              label="임포트 소스"
              placeholder="임포트 소스를 입력해 주세요."
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.sourceCode"
            />
          </div>
        </div>
        <ul class="info-box-bullet mt-10 mx-3" v-if="isEditor">
          <li>
            임포트 수정 후 페이지 버전 업데이트를 통해 수정 내용을 반영해 주세요.
          </li>
        </ul>
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