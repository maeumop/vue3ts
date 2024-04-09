<script setup lang='ts'>
import {
  ref,
  toValue,
  computed,
} from 'vue';
import { v1 as uuid } from 'uuid';

import type { Rules } from '@/components/types';
import type { ListTableHeader } from '@/components/ListTable/types';

import type { CombineItem } from '@/types/smart/component';
import type { RollingListEditFormItem } from '@/types/smart/component/listRolling';
import type { GetRollingListsRes, PutRollingListItem, PutRollingListsParam, PutRollingListsRes, RollingListGrpItem } from '@/types/api/smartEditorApi';

import { useToast, useListTable, useChevronBtns } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import Modal from '@/components/Modal/index.vue';
import ListTable from '@/components/ListTable/index.vue';
import ListTableCheckbox from '@/components/ListTable/listCheck.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

type OnOpenOption =  {
  target: RollingListGrpItem
};

const util = useUtil();
const smartEditorApi = useSmartEditorApi();

// emit
const emit = defineEmits<{
  // [ 댓글 수정 완료 | 댓글 그룹 값 변경 ] 이벤트
  (event: 'on:editComponent', value: RollingListGrpItem): void;
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();


// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'| '$nextTick'>>();
const validateForm = ref<ValidateFormModel>();

const listTableEL = ref<Pick<InstanceType<typeof ListTable>, 'checkedToggle'| '$nextTick'>>();

// readonly
const modalId = 'smartLayerRollingsEditor';
let _listGroup: RollingListGrpItem|null = null;

// readonly values ==============================================================================================================
const _tableHeader: ListTableHeader[] = [
  { text: '순서', align: 'center', width: '60px' },
  { text: '내용', },
  { text: '상태 문구', width: '200px', },
  { text: '상태 문구 컬러', width: '200px', },
  { text: '상태 문구 배경 컬러', width: '200px', },
];
const _rule: Rules = {
  default: [
    (v: string) => (!!v) || '필수 입력값입니다.',
  ],
};


const _editorFormItem: RollingListEditFormItem = {
  checked: false,
  listText: '',
  statusText: '',
  statusTextColor: '',
  statusTextBackColor: '',
} as const;
// END readonly values ==========================================================================================================


const { chevronBtns } = useChevronBtns();

// data()
let isShow = ref<boolean>(false);
let disabled = ref<boolean>(true);
let eventLoading = ref<boolean>(false);
const listTable = useListTable<RollingListEditFormItem>({ headers: _tableHeader, checkAll: true });
let { loading, emptyText } = listTable;

const { Toast } = useToast();

// computed
// 해당하는 boolean 값중에서 하나라도 true 이면, esc-close 수행 불가.
const isEscClose = computed<boolean>(() => ![ eventLoading.value ].some((v: boolean) => v));
const editorFormItems = computed<RollingListEditFormItem[]>(() => toValue(listTable.items));
const checkedItem = computed(() => editorFormItems.value.filter(item => item.checked));

// method

const _getRollingLists = async (): Promise<RollingListEditFormItem[]> => {
  if (!_listGroup) {
    throw new Error('참조할 수 있는 _listGroup 값이 아닙니다.');
  }

  const { compRollingListGrpUid } = _listGroup;
  const res: GetRollingListsRes = await smartEditorApi.getRollingLists(compRollingListGrpUid);

  const { rollingLists } = res.results;

  if (_listGroup.listTotalCount !== rollingLists.length) {
    const emitValue: RollingListGrpItem = { ..._listGroup, listTotalCount: rollingLists.length };
    emit('on:editComponent', emitValue);
  }

  return rollingLists.map(item => ({
    ...item,
    checked: false,
    statusText: item.statusText || _editorFormItem.statusText,
    statusTextColor: item.statusTextColor || _editorFormItem.statusTextColor,
    statusTextBackColor: item.statusTextBackColor || _editorFormItem.statusTextBackColor,
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

    _listGroup = Object.freeze({ ...params.target });

    listTable.onObserve(() => _getRollingLists())
      .catch((err) =>  util.axiosErrorCatch<GetRollingListsRes>(err));

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
    disabled.value = true;
    isShow.value = false;
    emit('on:close');
    _listGroup = null;
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
  } else  {
    // 다중 체크
    if (checked && checkedItem.value.length < editorFormItems.value.length) {
      // 전체 처크
      editorFormItems.value.forEach(item => {
        item.checked = true;
      });
    } else if (!checked && checkedItem.value.length === editorFormItems.value.length) {
      // 전체 체크 해제
      editorFormItems.value.forEach(item => {
        item.checked = false;
      });
    }
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
  const item: RollingListEditFormItem = { compRollingListUid: uuid(), ..._editorFormItem };
  editorFormItems.value.splice(editorFormItems.value.length, 0, item);
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
            ...editorFormItems.value.filter(item => !item.checked));

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
    listTableEL.value?.$nextTick(() => {
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
  // 화면 노출수는 무조건 1이상
  const minCnt: number = (_listGroup?.listCount || 1) + 1;
  if (editorFormItems.value.length < minCnt) {
    Toast({
      message: `${minCnt}개 이상의 댓글를 등록해 주세요. `,
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
      util.axiosErrorCatch<PutRollingListsRes>(err);
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
  if (!_listGroup) {
    throw new Error('참조할 수 있는 _listGroup 값이 아닙니다.');
  }

  const { compRollingListGrpUid } = _listGroup;
  const req: PutRollingListsParam = {
    items: editorFormItems.value
      .map(item =>({
        compRollingListUid: item.compRollingListUid,
        listText: item.listText,

        statusText: item.statusText || undefined,
        statusTextColor: item.statusTextColor || undefined,
        statusTextBackColor: item.statusTextBackColor || undefined,
      } as PutRollingListItem))
  };

  await smartEditorApi.putRollingLists(compRollingListGrpUid, req);


  const emitValue: RollingListGrpItem = { ..._listGroup, listTotalCount: editorFormItems.value.length };
  emit('on:editComponent', emitValue);
  Toast('정상적으로 저장되었습니다.');
};

defineExpose({
  onOpen,
  onClose
});
</script>
<script lang='ts'> export default { name: 'SmartListRollingLayerListEditor' };</script>
<template>
  <Modal
    access-back
    :id="modalId"
    ref="modalEL"
    class="smartListRolling smartLayerListRollingEditor"
    width="1200px"
    title="리스트 관리"
    :esc-close="isEscClose"
    :model-value="isShow"
    @checked="onCheckItem"
    @update:model-value="onCloseModal"
  >
    <template #body>
      <div class="row">
        <div class="col">
          <h3>리스트 ({{ editorFormItems.length.numberFormat() }})</h3>
        </div>
      </div>
      <div class="flex gap-8 mt-20">
        <StyledButton small outline @click="onClickAddBtn"> 리스트 추가 </StyledButton>
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
          check-all
          ref="listTableEL"
          class="border"
          :height="459"
          :loading="loading"
          :empty-text="emptyText"
          :header="listTable.headers"
          :items="editorFormItems.length ? [editorFormItems] : []"
          @checked="onCheckItem"
        >
          <template #items>
            <tr :key="item.compRollingListUid" v-for="(item, index) in editorFormItems">
              <td>
                <ListTableCheckbox
                  name="list"
                  :value="`${item.compRollingListUid}`"
                  :is-checked="item.checked"
                  @checked="onCheckItem(!item.checked, index)"
                />
              </td>
              <td class="text-center">
                <span>{{ index+1 }}</span>
              </td>
              <td>
                <TextField
                  block
                  blur-validate
                  hide-message
                  max-length="200"
                  placeholder="리스트 내용을 입력해 주세요."
                  :validate="_rule.default"
                  @blur="validation()"
                  v-model="item.listText"
                />
              </td>
              <td>
                <TextField
                  block
                  blur-validate
                  hide-message
                  max-length="50"
                  placeholder="상태 문구 입력"
                  @blur="validation()"
                  v-model="item.statusText"
                />
              </td>
              <td>
                <TextField
                  block
                  blur-validate
                  hide-message
                  max-length="8"
                  placeholder="HEX 형식 입력 ex) #FFFFFF"
                  @blur="validation()"
                  v-model="item.statusTextColor"
                />
              </td>
              <td>
                <TextField
                  block
                  blur-validate
                  hide-message
                  max-length="8"
                  placeholder="HEX 형식 입력 ex) #FFFFFF"
                  @blur="validation()"
                  v-model="item.statusTextBackColor"
                />
              </td>
            </tr>
          </template>
        </listtable>
      </ValidateForm>
    </template>
    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
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