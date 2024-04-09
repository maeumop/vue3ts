<script setup lang='ts'>
import {
  ref,
  computed,
  reactive,
} from 'vue';
import { v1 as uuid } from 'uuid';

import type { Rules } from '@/components/types';

import type { CommentGrpEditForm } from '@/types/smart/component/comment';
import type { CommentGrpItem, PostCommentGrpsParam, PostCommentGrpsRes, PutCommentGrpsParam, PutCommentGrpsRes } from '@/types/api/smartEditorApi';


import { CONST_CODES, booleanYN } from '@/constants/common';
import { getConstCodeOptions } from '@/js/common';
import { useToast, useLayoutSelectBox, useInputOnlyNumber } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import Modal from '@/components/Modal/index.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

type OnOpenOption = {
  self?: CommentGrpItem
};

const { COMMENT_TYPE } = CONST_CODES;

// emit
const emit = defineEmits<{
  // 컴포넌트 등록 완료 이벤트
  (event: 'on:createComponent', value: CommentGrpItem): void;
  // 컴포넌트 수정 완료 이벤트
  (event: 'on:editComponent', value: CommentGrpItem): void;
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();


const util = useUtil();
const smartEditorApi = useSmartEditorApi();

// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close' | '$nextTick'>>();
const validateForm = ref<ValidateFormModel>();


const modalId = 'smartLayerCommentGrpsEditor';
let _original: CommentGrpItem|null = null;

// readonly values ==============================================================================================================
const _rule: Rules = {
  default: [
    (v: string) => (!!v) || '필수 입력값입니다.',
  ],
  commentCount: [
    (v: string) => (!!v) && parseInt(v) > 0 || '1이상의 숫자를 입력해 주세요.',
  ],
};

const _editorForm: CommentGrpEditForm = {
  commentGrpName: '',
  layoutUid: '',
  commentType: COMMENT_TYPE.EMPATHY.VAL,
  sizeX: '100%',
  sizeY: '',
  isUseMoreBtn: false,
  commentCount: '4',
} as const;
// END readonly values ==========================================================================================================


let isShow = ref<boolean>(false);
let disabled = ref<boolean>(true);
let loading = ref<boolean>(false);
let editorForm = reactive<CommentGrpEditForm>({ ..._editorForm });

const { Toast } = useToast();
const { onInputOnlyNumber } = useInputOnlyNumber();

// SelectBox
const layoutSelectBox = useLayoutSelectBox();
const { layoutOptions, getLayoutText, isLoading } = layoutSelectBox;


// computed
const isEditor = computed(() => isShow.value && (_original ? true : false));
const getTitle = computed(() => `댓글 그룹 ${isEditor.value ? '수정' : '등록'}`);

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

      Object.assign(editorForm, {
        commentGrpName: _original.commentGrpName,
        layoutUid: _original.layoutUid,
        commentType: _original.commentType,
        sizeX: sizeX,
        sizeY: sizeY || '',
        isUseMoreBtn: _original.isUseMoreBtn === booleanYN.Y,
        commentCount: _original.commentCount
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
const onClickEvnt =  async () => {
  if (!disabled.value && validateForm.value?.validate()) {
    try {
      // 수행할 이벤트
      loading.value = true;
      validateForm.value?.formProtection(true);

      if (isEditor.value) {
        await _editConmponent();
      } else {
        await _createConmponent();
      }

      onClose();
    } catch (err) {
      util.axiosErrorCatch<PostCommentGrpsRes | PutCommentGrpsRes>(err);
    } finally {
      validateForm.value?.formProtection(false);
      loading.value = false;
    }
  }
};

/**
 * PostCommentGrpsParam, PutCommentGrpsParam 공통 객체생성
 * @returns
 */
const _createCommonParam = (): PutCommentGrpsParam => {
  return {
    commentGrpName: editorForm.commentGrpName,
    layoutUid: editorForm.layoutUid,
    commentType: editorForm.commentType,
    isUseMoreBtn: editorForm.isUseMoreBtn ? booleanYN.Y : booleanYN.N,
    commentCount: parseInt(editorForm.commentCount),
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
  const compCommentGrpUid: string = uuid();

  const req: PostCommentGrpsParam = {
    compCommentGrpUid,
    ..._createCommonParam()
  };

  await smartEditorApi.postCommentGrps(req);
  const result: CommentGrpItem = {
    ...req,
    layoutName: getLayoutText.value(editorForm.layoutUid),
    commentCount: req.commentCount || 4,
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

  const { compCommentGrpUid, regDatetime } = _original;
  const req: PutCommentGrpsParam = _createCommonParam();

  await smartEditorApi.putCommentGrps(compCommentGrpUid, req);
  const result: CommentGrpItem = {
    compCommentGrpUid, regDatetime,
    ...req,
    commentCount: req.commentCount || 0,
    layoutName: getLayoutText.value(editorForm.layoutUid)
  };

  emit('on:editComponent', result);
  Toast('정상적으로 수정되었습니다.');
};

defineExpose({
  onOpen,
  onClose
});
</script>

<template>
  <Modal
    access-back
    ref="modalEL"
    :id="modalId"
    class="smartComment smartLayerGroupEditor"
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
              label="댓글 그룹명"
              placeholder="댓글 그룹명을 입력해주세요."
              :max-length="50"
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.commentGrpName"
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
            <SelectBox
              block
              required
              hide-message
              label="디자인 테마"
              placeholder="선택"
              :options="getConstCodeOptions('COMMENT_TYPE')"
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.commentType"
            />
          </div>
        </div>
        <!-- 4row -->
        <div class="row mt-10 commentSize">
          <div class="col-3 pr-10">
            <TextField
              block
              required
              hide-message
              label="댓글 사이즈"
              placeholder="단위 포함 입력 ex)100%"
              :validate="_rule.default"
              @blur="validation()"
              v-model="editorForm.sizeX"
            />
          </div>
          <div class="col-3 self-end pl-10">
            <TextField
              block
              hide-message
              placeholder="단위 포함 입력 ex)100%"
              @blur="validation()"
              v-model="editorForm.sizeY"
            />
          </div>
        </div>
        <!-- 5row -->
        <div class="row mt-10">
          <div class="col-3 flex-center height-40">
            <span class="custom mx-3">
              더보기
            </span>
          </div>
          <div class="col-3 self-center px-10">
            <SwitchButton
              :label="[ '미노출', '노출' ]"
              @update:after="validation()"
              @update:model-value="() => editorForm.isUseMoreBtn && (editorForm.commentCount = _editorForm.commentCount)"
              v-model="editorForm.isUseMoreBtn"
            />
          </div>
          <div class="col-6">
            <TextField
              block
              type="tel"
              max-length="2"
              placeholder="댓글 출력 개수"
              :validate="_rule.commentCount"
              @input="onInputOnlyNumber"
              @blur="validation()"
              v-model="editorForm.commentCount"
              v-if="editorForm.isUseMoreBtn"
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
          :disabled="disabled"
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
<script lang='ts'>
export default { name: 'SmartCommentLayerGroupEditor' };
</script>