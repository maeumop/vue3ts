<script setup lang='ts'>
import {
  ref,
  reactive,
  nextTick,
  computed,
  toValue,
} from 'vue';
import { v1 as uuid } from 'uuid';

import type { Rules, OptionItem } from '@/components/types';
import type { ListTableModel, ListTableHeader } from '@/components/ListTable/types';

import type { ContentItem } from '@/types/store/modules/ftp';
import type { CommentGrpItem, GetCommentsRes, PutCommentsParam, PutCommentItem, PutCommentsRes } from '@/types/api/smartEditorApi';
import type { CombineItem, SelectImagesMdoal } from '@/types/smart/component';
import type { CommentEditFormItem } from '@/types/smart/component/comment';

import { CONST_CODES } from '@/constants/common';
import { useToast, useListTable, useChevronBtns, useInputOnlyNumber  } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import Modal from '@/components/Modal/index.vue';
import ListTable from '@/components/ListTable/index.vue';
import ListTableCheckbox from '@/components/ListTable/listCheck.vue';
import FtpImage from '@/views/common/ftp/image/index.vue';
import SelectImages from '@/views/common/ftp/layer/SelectImages/index.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

type OnOpenOption = {
  target: CommentGrpItem
};


const { COMMENT_TYPE } = CONST_CODES;
const { RATING } = COMMENT_TYPE;

const util = useUtil();
const smartEditorApi = useSmartEditorApi();

// emit
const emit = defineEmits<{
  // 댓글 수정 완료 이벤트
  (event: 'on:editComponent', value: CommentGrpItem): void;
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();


// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'| '$refs' | '$nextTick'>>();
const validateForm = ref<ValidateFormModel>();
const listTableEL = ref<ListTableModel>();

// readonly
const modalId = 'smartLayerCommentEditor';
let _commentGroup: CommentGrpItem|null = null;

// readonly values ==============================================================================================================
const _tableHeader: ListTableHeader[] = [
  { text: '순서', align: 'center', width: '60px' },
  { text: '이미지', width: '130px', },
  { text: '댓글 내용', width: '400px', },
  { text: '기타 내용',  },
];
const _rule: Rules = {
  default: [
    (v: string) => (!!v) || '필수 입력값입니다.',
  ],
  num: [
    (v: string) => !v || (Array.isArray(v.match(util.getRegExp('num')))) || '숫자만 입력 가능합니다.',
  ],
};

const _ratingOptions: OptionItem[] = Array.from({ length: 5 }, (_: undefined, i: number) => ({ value: `${i + 1}`, text: `${i + 1}개` }));

const _editorFormItem: CommentEditFormItem = {
  checked: false,
  author: '',
  commentTime: '',
  likeCount: '',
  dislikeCount: '',
  rating: '',
  commentText: '',
} as const;
// END readonly values ==========================================================================================================
// 팝업들 설정 =========================
// selectImages : 이미지 선택 팝업

type ModalType =  {
  selectImages: SelectImagesMdoal<CommentEditFormItem>,
};
type ModalKeys = keyof ModalType;

let modal = reactive<ModalType>({
  selectImages: { show: false, multiple: false, target: null },
});

const onPopupClose = (key: ModalKeys): void => {
  modal[key].show = false;
  if (modal[key].target) {
    modal[key].target = null;
  }
};
// END - 팝업들 설정 ====================

const { chevronBtns } = useChevronBtns();

// data()
let isShow = ref<boolean>(false);
let disabled = ref<boolean>(true);
let eventLoading = ref<boolean>(false);

const { Toast } = useToast();
const { onInputOnlyNumber } = useInputOnlyNumber();

const listTable = useListTable<CommentEditFormItem>({ checkAll: true, headers: _tableHeader });
let { checkAll, loading, emptyText } = listTable;

// computed
// 해당하는 boolean 값중에서 하나라도 true 이면, esc-close 수행 불가.
const isEscClose = computed<boolean>(() => ![ eventLoading.value, modal['selectImages'].show ].some((v: boolean) => v));
const editorFormItems = computed<CommentEditFormItem[]>(() => toValue(listTable.items));
const checkedItem = computed(() => editorFormItems.value.filter((item: CommentEditFormItem) => item.checked));

// method

const _getComments = async (): Promise<CommentEditFormItem[]> => {
  if (!_commentGroup) {
    throw new Error('참조할 수 있는 _commentGroup 값이 아닙니다.');
  }

  const { compCommentGrpUid } = _commentGroup;
  const res: GetCommentsRes = await smartEditorApi.getComments(compCommentGrpUid);
  const { comments } = res.results;

  return comments.map(item =>
    ({ ...item,
       checked: false,
       likeCount: `${!item.likeCount ? _editorFormItem.likeCount : item.likeCount}`,
       dislikeCount: `${!item.dislikeCount ? _editorFormItem.dislikeCount : item.dislikeCount}`,
       rating: `${!item.rating ? _editorFormItem.rating : item.rating}`
    }));

};

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

    _commentGroup = Object.freeze({ ...params.target });
    listTable.onObserve(() => _getComments())
      .catch((err) =>  util.axiosErrorCatch<GetCommentsRes>(err));

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
    listTable.clearItems();
    _commentGroup = null;
    disabled.value = true;
    isShow.value = false;
    emit('on:close');
  });
};

/**
 * 체크 박스 이벤트 핸들러
 * @author hjs0622
 * @param {checked} checked 변경 값
 * @param {number} index editorFormItems.value의 index
 * @returns
 */
const onCheckItem = (checked: boolean, index: number = -1): void => {
  if (loading.value) {
    return;
  }

  if (index >= 0) {
    // 단일 체크
    editorFormItems.value[index].checked = checked;
    listTableEL.value?.checkedToggle(checkedItem.value.length === editorFormItems.value.length);
    return;
  }

  // 다중 체크
  if (checked && checkedItem.value.length < editorFormItems.value.length) {
    // 전체 처크
    editorFormItems.value.forEach((item: CommentEditFormItem) => {
      item.checked = true;
    });
  } else if (!checked && checkedItem.value.length === editorFormItems.value.length) {
    // 전체 체크 해제
    editorFormItems.value.forEach((item: CommentEditFormItem) => {
      item.checked = false;
    });
  }
};


/**
 * SelectImages 컴포넌트의 on:close 이벤트 핸들러
 * @author hjs0622
 * @returns
 */
const onCloseSelectImagesMdoal = (): void => {
  onPopupClose('selectImages');
  nextTick(() => {
    const modalDiv: HTMLDivElement = modalEL.value?.$refs.modal as HTMLDivElement;
    // focus 다시 되돌려 주기
    modalDiv.focus();
  });
};

/**
 * SelectImages 활성
 * @param {number} index 이미지 변경할 editorFormItems.value의 index
 * @author hjs0622
 * @returns
 */
const openSelectImagesMdoal = (index: number): void => {
  if (loading.value) {
    return;
  }

  try {
    if (index < 0 || index >= editorFormItems.value.length) {
      throw new Error('참조할 수 없는 index입니다.');
    }
      
    validation();
    modal['selectImages'].target = editorFormItems.value[index];
    modal['selectImages'].show = true;
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

/**
 * 이미지 [ 추가 | 변경 ] 기능을 수행
 * @author hjs0622
 * @param {ContentItem} value SelectImages 컴포넌트에서 선택한 이미지 객체
 * @returns
 */
const onLoadImages = (value: ContentItem|ContentItem[]): void => {
  try {
    // 선택한 객체 이미지 변경
    const image: ContentItem = value as ContentItem;
    modal['selectImages'].target!.imagePath = `${image.src}?dt=${image['last-modified']}`;
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

/**
 * 댓글 추가 버튼 클릭이벤트 핸들러
 * 선택한 댓글객체들 제거 기능을 수행
 * @author hjs0622
 * @returns
 */
const onClickAddBtn = (): void => {
  if (loading.value) {
    return;
  }

  validation();
  editorFormItems.value.splice(editorFormItems.value.length, 0, Object.assign({ compCommentUid: uuid() }, _editorFormItem));
  if (checkedItem.value.length < 1) {
    // 선택된 객체 없으면 전체 선택 체크 박스 해제
    listTableEL.value?.checkedToggle();
  }
};


/**
 * 제거 버튼 클릭이벤트 핸들러
 * 선택한 댓글객체들 제거 기능을 수행
 * @author hjs0622
 * @returns
 */
const onClickDeleteBtn = (): void => {
  if (loading.value) {
    return;
  }

  editorFormItems.value
    .splice(0, editorFormItems.value.length,
            ...editorFormItems.value.filter((item: CommentEditFormItem) => !item.checked));


  if (checkedItem.value.length < 1) {
    // 선택된 객체 없으면 전체 선택 체크 박스 해제
    listTableEL.value?.checkedToggle();
  }

  validation();
};

/**
 * 객체 이동 버튼 클릭이벤트 핸들러
 * 선택한 댓글객체들 버튼의 callback함수 기능을 수행
 * @author hjs0622
 * @returns
 */
const onClickChevronBtn = async (callback: <T extends CombineItem>(items: T[]) => void): Promise<void> => {
  if (loading.value) {
    return;
  }

  let arr = [ ...editorFormItems.value ];
  try {
    await callback(arr);
  } catch (err) {
    console.error(err);
    // defaultErrors();
  } finally {
    nextTick(() => {
      editorFormItems.value
        .splice(0, editorFormItems.value.length, ...arr);
      validation();
    });
  }
};

/**
 * 저장 클릭이벤트 핸들러
 * @author hjs0622
 * @returns
 */
const onSave = async (): Promise<void> => {
  if (!editorFormItems.value.length) {
    Toast({
      message: '1개 이상의 댓글를 등록해 주세요.',
      color: 'warning',
    });
    return;
  }

  if (!disabled.value && validateForm.value?.validate()) {
    try {
      // 수행할 이벤트
      eventLoading.value = true;
      validateForm.value?.formProtection(true);
      await _saveConmponent();
      onClose();
    } catch (err) {
      util.axiosErrorCatch<PutCommentsRes>(err);
    } finally {
      validateForm.value?.formProtection(false);
      eventLoading.value = false;
    }
  }
};

/**
 * 컴포넌트 저장버튼 클릭이벤트
 * @author hjs0620
 * @returns
 * @throws
 */
const _saveConmponent = async (): Promise<void> => {
  if (!_commentGroup) {
    throw new Error('참조할 수 있는 _commentGroup 값이 아닙니다.');
  }

  const { compCommentGrpUid } = _commentGroup;
  const req: PutCommentsParam = {
    items: editorFormItems.value
      .map(item =>({
        compCommentUid: item.compCommentUid,
        commentText: item.commentText,

        imagePath: item.imagePath || undefined,
        author: item.author || undefined,
        commentTime: item.commentTime || undefined,
        likeCount: item.likeCount ? parseInt(item.likeCount) : undefined,
        dislikeCount: item.dislikeCount ? parseInt(item.dislikeCount) : undefined,
        rating: item.rating || undefined,
      } as PutCommentItem ))
  };


  await smartEditorApi.putComments(compCommentGrpUid, req);

  emit('on:editComponent', Object.assign({ }, _commentGroup));
  Toast('정상적으로 저장되었습니다.');
};

defineExpose({
  onOpen,
  onClose
});
</script>
<script lang='ts'> export default { name: 'SmartCommentLayerCommentEditor' };</script>
<template>
  <Modal
    access-back
    ref="modalEL"
    :id="modalId"
    class="smartComment smartLayerCommentEditor"
    width="1200px"
    title="댓글 관리"
    :esc-close="isEscClose"
    :model-value="isShow"
    @checked="onCheckItem"
    @update:model-value="onCloseModal"
  >
    <template #body>
      <div class="row">
        <div class="col">
          <h3>댓글 리스트 ({{ editorFormItems.length.numberFormat() }})</h3>
        </div>
      </div>
      <div class="flex gap-8 mt-20">
        <StyledButton small outline @click="onClickAddBtn"> 댓글 추가 </StyledButton>
        <StyledButton
          small
          outline
          :disabled="checkedItem.length < 1"
          @click="onClickDeleteBtn"
        >
          제거
        </StyledButton>
        <StyledButton
          small
          outline
          only-icon
          :key="index"
          :icon="item.icon"
          :disabled="checkedItem.length < 1"
          @click="onClickChevronBtn(item.onClick)"
          v-for="(item, index) in chevronBtns"
        />
      </div>
      <ValidateForm
        ref="validateForm"
        class="mt-10"
        v-if="isShow"
      >
        <ListTable
          ref="listTableEL"
          class="border"
          :check-all="checkAll"
          :height="535"
          :empty-text="emptyText"
          :loading="loading"
          :header="listTable.headers"
          :items="editorFormItems.length ? [editorFormItems] : []"
          @checked="onCheckItem"
        >
          <template #items>
            <tr :key="item.compCommentUid" v-for="(item, index) in editorFormItems">
              <td>
                <ListTableCheckbox
                  name="list"
                  :value="`key${index}`"
                  :is-checked="item.checked"
                  @checked="onCheckItem(!item.checked, index)"
                />
              </td>
              <td class="text-center">
                <span>{{ index+1 }}</span>
              </td>
              <td>
                <div class="flex-center">
                  <FtpImage
                    height="110px"
                    :src="item.imagePath"
                    @click="openSelectImagesMdoal(index)"
                  />
                </div>
              </td>
              <td>
                <TextField
                  block
                  multiline
                  hide-message
                  placeholder="댓글 내용 입력"
                  :height="107"
                  :validate="_rule.default"
                  @blur="validation()"
                  v-model="item.commentText"
                />
              </td>
              <td class="dlWrapper">
                <dl class="height-60">
                  <dt class="flex">
                    <div class="width-100 height-40">
                      <span class="custom">
                        아이디/닉네임
                      </span>
                    </div>
                  </dt>
                  <dd class="flex">
                    <TextField
                      block
                      hide-message
                      placeholder="ex) 홍길동"
                      @blur="validation()"
                      v-model="item.author"
                    />
                  </dd>

                  <dt class="flex">
                    <div class="width-100 height-40">
                      <span class="custom">
                        날짜
                      </span>
                    </div>
                  </dt>
                  <dd class="flex">
                    <TextField
                      block
                      hide-message
                      placeholder="ex) 10분 전"
                      @blur="validation()"
                      v-model="item.commentTime"
                    />
                  </dd>
                </dl>
                <dl class="height-60" v-if="_commentGroup?.commentType !== RATING.VAL">
                  <dt class="flex">
                    <div class="width-100 height-40">
                      <span class="custom">
                        좋아요/공감 수
                      </span>
                    </div>
                  </dt>
                  <dd class="flex">
                    <TextField
                      block
                      hide-message
                      type="tel"
                      placeholder="ex) 30"
                      :validate="_rule.num"
                      @blur="validation()"
                      @input="onInputOnlyNumber"
                      v-model="item.likeCount"
                    />
                  </dd>

                  <dt class="flex">
                    <div class="width-100 height-40">
                      <span class="custom">
                        싫어요/반대 수
                      </span>
                    </div>
                  </dt>
                  <dd class="flex">
                    <TextField
                      block
                      hide-message
                      type="tel"
                      placeholder="ex) 2"
                      :validate="_rule.num"
                      @blur="validation()"
                      @input="onInputOnlyNumber"
                      v-model="item.dislikeCount"
                    />
                  </dd>
                </dl>
                <dl class="height-60" v-else>
                  <dt class="flex">
                    <div class="width-100 height-40">
                      <span class="custom">
                        평점
                      </span>
                    </div>
                  </dt>
                  <dd class="flex">
                    <SelectBox
                      block
                      hide-message
                      class="width-p-100"
                      placeholder="선택"
                      :options="_ratingOptions"
                      @blur="validation()"
                      v-model="item.rating"
                      v-if="_commentGroup?.commentType === RATING.VAL"
                    />
                  </dd>
                </dl>
              </td>
            </tr>
          </template>
        </listtable>
      </ValidateForm>
      <SelectImages
        :multiple="modal['selectImages'].multiple"
        @close="onCloseSelectImagesMdoal"
        @load-images="onLoadImages"
        v-if="modal['selectImages'].show"
      />
    </template>
    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
          class="successBtn"
          color="primary"
          :disabled="disabled"
          :loading="eventLoading"
          @click="!eventLoading && onSave()"
        >
          저장
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline :disabled="eventLoading" @click="close">
          닫기
        </StyledButton>
      </div>
    </template>
  </Modal>
</template>