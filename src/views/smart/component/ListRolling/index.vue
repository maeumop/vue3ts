<script setup lang='ts'>
import { computed, onMounted, reactive, ref, toValue, inject } from 'vue';

import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { SpinnerModel } from '@/components/Spinner/types';

import type { GetRollingListGrpsParam, GetRollingListGrpsRes, RollingListGrpItem } from '@/types/api/smartEditorApi';
import type { SmartCompUseModal } from '@/types/smart/component';
import type { SmartComponent } from '@/types/smartEditor';


import { COPY_MODE } from '@/constants/smart/component';
import { useListTable, useSearchForm, useToast } from '@/js/helper/common';

import { useMessageBox } from '@/js/helper/messageBox';
import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import { mdiMagnify, mdiPencil, mdiPlus, mdiRefresh } from '@/assets/svg/path';

import { previewComponent } from '@/constants/common';

import Preview from '@/views/common/preview.vue';
import GroupEditor from '@/views/smart/component/ListRolling/layer/GroupEditor/index.vue';
import ListEditor from '@/views/smart/component/ListRolling/layer/ListEditor/index.vue';
import CopyComponent from '@/views/smart/component/layer/CopyComponent/index.vue';


const util = useUtil();
const smartEditorApi = useSmartEditorApi();

const Spinner = inject('Spinner') as SpinnerModel;

// element
const validateForm = ref<ValidateFormModel>();
const copyComponentEL = ref<Pick<InstanceType<typeof CopyComponent>, 'onOpen'|'$nextTick'>>();
const editorEL = ref<Pick<InstanceType<typeof GroupEditor>, 'onOpen'|'$nextTick'>>();
const listEditorEL = ref<Pick<InstanceType<typeof ListEditor>, 'onOpen'|'$nextTick'>>();

// data()
const searchForm = useSearchForm([
  { text: '리스트 그룹명', value: 'rollingListGrpName' },
  { text: '레이아웃', value: 'layoutName' },
]);
const { searchField,  searchText, searchFieldOptions } = searchForm;

const _tableHeader: ListTableHeader[] = [
  { text: '리스트 그룹명', },
  { text: '레이아웃', width: '250px' },
  { text: '미리보기', width: '100px' },
  { text: '관리', width: '250px' },
];
const listTable = useListTable<RollingListGrpItem>({ headers: _tableHeader });
let { loading, emptyText, observer } = listTable;


const { Toast } = useToast();

let tableTotalCount = ref<number>(0);

// 팝업들 설정 =========================
// copyComponent : 복사 팝업
// preview : 미리보기 팝업
// groupEditor : 리스트 롤링 그룹 등록/수정 팝업
// listEditor : 리스트 롤링 설정 팝업
type ModalType =  {
  copyComponent: SmartCompUseModal,
  preview: SmartCompUseModal<string>,
  groupEditor: SmartCompUseModal<RollingListGrpItem>,
  listEditor: SmartCompUseModal<RollingListGrpItem>,
};
type ModalKeys = keyof ModalType;

let modal = reactive<ModalType>({
  copyComponent: { show: false },
  preview: { show: false, target: null },
  groupEditor: { show: false, target: null },
  listEditor: { show: false, target: null  },
});

const onPopupClose = (key: ModalKeys): void => {
  modal[key].show = false;
  if (modal[key].target) {
    modal[key].target = null;
  }

  key === 'preview' && Spinner.close();
};
// END - 팝업들 설정 ====================

// computed
const tableItems = computed<RollingListGrpItem[]>(() => toValue(listTable.items));

// methods
const { deleteSmartComponent } = useMessageBox(Toast);

const _getRollingListGrps = async (): Promise<RollingListGrpItem[]> => {
  const req: GetRollingListGrpsParam = { search: searchForm.getSearchParams(), limit: 50 };
  let cursor: number = -1;
  if (tableItems.value.length > 0) {
    cursor = tableItems.value[tableItems.value.length - 1].regDatetime;
    req.cursor = cursor;
  }

  const res: GetRollingListGrpsRes = await smartEditorApi.getRollingListGrps(req);

  const { totalCount, rollingListGrps } = res.results;

  if (cursor < 0) {
    tableTotalCount.value = totalCount;
  }

  // observer 해제
  if (rollingListGrps.length < req.limit!) {
    await listTable.changeObserver(false);
  }

  return rollingListGrps;
};

const onObserveTable = async (): Promise<void> => {
  try {
    validateForm.value?.formProtection(true);
    await listTable.onObserve(() => _getRollingListGrps());
  } catch (err) {
    util.axiosErrorCatch<GetRollingListGrpsRes>(err);
  } finally {
    validateForm.value?.formProtection(false);
  }
};

/**
 * SearchForm에서 검색 내용을 검색한 목록 반영
 * @author hjs0620
 * @returns
 */
const onSearch = async (replcae: boolean = false): Promise<void> => {
  try {
    if (replcae) {
      validateForm.value?.resetForm();
    }

    tableTotalCount.value = 0;
    tableItems.value.splice(0, tableItems.value.length);

    if (!observer.value) {
      listTable.changeObserver();
    }

    onObserveTable();
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

/**
 * 컴포넌트 복사 클릭 이벤트 핸들러
 * @author hjs0620
 * @param item - 복사할 원본 객체
 * @returns
 */
const onClickCopyBtn = async (item: RollingListGrpItem): Promise<void> => {
  if (loading.value) {
    return;
  }

  const _key: ModalKeys = 'copyComponent';

  try {
    if (!modal[_key].show) {
      modal[_key].show = true;
      await copyComponentEL.value?.$nextTick();
    }

    copyComponentEL.value?.onOpen({ self: item,  type: COPY_MODE.ROLLING_LIST });
  } catch (error) {
    onPopupClose(_key);
  }
};

/**
 * 컴포넌트 복사 이벤트 핸들러
 * @author hjs0620
 * @param item - 복사하여 새로 생성한 객체
 * @returns
 */
const onCopyComponent = (item: SmartComponent): void => {
  if (!searchText.value) {
    tableTotalCount.value++;
    tableItems.value.splice(0, 0, item as RollingListGrpItem);
    return;
  }

  // 필터를 이용하는 중이면, 재필터 수행
  onSearch();
};

/**
 * 컴포넌트 삭제 클릭 이벤트 핸들러
 * @author hjs0620
 * @param index - 삭제할 원본 객체 index
 * @returns
 */
const onClickDeleteBtn = async (index: number): Promise<void> => {
  if (loading.value) {
    return;
  }

  if (index < 0 || index >= tableItems.value.length) {
    // defaultErrors();
    return;
  }

  const deleteItem = tableItems.value[index];
  deleteSmartComponent('리스트 그룹', async () => {
    await smartEditorApi.deleteRollingListGrps(deleteItem.compRollingListGrpUid)
      .then(() => {
        tableItems.value.splice(index, 1);
        tableTotalCount.value--;
      });
  });
};

/**
 * 리스트 롤링 등록/수정 클릭 이벤트 핸들러
 * @param target? {RollingListGrpItem} - 수정시, 수정 정보
 * @returns
 */
const onOpenGroupEditor = async (target?: RollingListGrpItem): Promise<void> => {
  if (loading.value) {
    return;
  }
  const _key: ModalKeys = 'groupEditor';

  try {
    if (!modal[_key].show) {
      modal[_key].show = true;
      await editorEL.value?.$nextTick();
    }

    editorEL.value?.onOpen(target ? { self: target } : {});
    if (target) {
      modal[_key].target = target;
    }
  } catch (error) {
    onPopupClose(_key);
  }
};

/**
 * 리스트 롤링 등록 완료 이벤트 핸들러
 * @param item {RollingListGrpItem} - 등록할 정보
 * @returns
 */
const onCreateComponent = (item: RollingListGrpItem): void => {
  if (!searchText.value) {
    tableTotalCount.value++;
    tableItems.value.splice(0, 0, item);
    return;
  }
  // 필터를 이용하는 중이면, 재필터 수행
  onSearch();
};

/**
 * 리스트 롤링 수정 완료 이벤트 핸들러
 * @param edit {RollingListGrpItem} - 수정할 정보
 * @returns
 */
const onEditComponent = (edit: RollingListGrpItem): void => {
  if (!searchText.value) {
    const _key: ModalKeys = 'groupEditor';
    Object.assign(modal[_key].target!, edit);
    return;
  }

  // 필터를 이용하는 중이면, 재필터 수행
  onSearch();
};


/**
 * 리스트 관리 모달 생성 이벤트 핸들러
 * @returns
 */
const onClickListEditBtn =  async (target: RollingListGrpItem): Promise<void> => {
  if (loading.value) {
    return;
  }
  const _key: ModalKeys = 'listEditor';
  try {

    if (!modal[_key].show) {
      modal[_key].show = true;
      await listEditorEL.value?.$nextTick();
    }

    listEditorEL.value?.onOpen({ target });
    modal[_key].target = target;
  } catch (error) {
    onPopupClose(_key);
  }
};

/**
 * 리스트 관리 모달 수정 완료 이벤트 핸들러
 * @param edit {RollingListGrpItem} - 수정할 정보
 * @returns
 */
const onListEditComponent = (edit: RollingListGrpItem): void => {
  const _key: ModalKeys = 'listEditor';
  Object.assign(modal[_key].target!, edit);
};


/**
 * 리스트 롤링 미리보기
 * @param target {RollingListGrpItem}
 * @returns
 */
const onClickPreview = (target: RollingListGrpItem): void => {
  const _key: ModalKeys = 'preview';

  Spinner.delay(0).show('Loading…');
  modal[_key].show = true;
  modal[_key].target = target.compRollingListGrpUid;
};
onMounted(() => onSearch(true));
</script>

<template>
  <div id="smartListRolling" class="content common-list">
    <ValidateForm ref="validateForm">

      <div class="searchArea">
        <div class="listCount">
          검색결과
          <span class="text-point"> {{ tableTotalCount.numberFormat() }} </span>건
        </div>
        <div class="flex gap-8">

          <div class="width-170">
            <SelectBox
              block
              clearable
              placeholder="전체"
              :options="searchFieldOptions"
              v-model="searchField"
            />
          </div>

          <div class="width-250">
            <TextField
              block
              placeholder="검색어를 입력해주세요."
              :icon="mdiMagnify"
              :max-length="50"
              :icon-action="() => onSearch()"
              @keyup.enter="!loading && onSearch()"
              v-model="searchText"
            />
          </div>

          <StyledButton
            only-icon
            outline
            color="secondary"
            :icon="mdiRefresh"
            @click="onSearch(true)"
          />
        </div>
      </div>
      <div class="searchArea">
        <div class="flex gap-8">
          <StyledButton
            color="primary"
            :icon="mdiPlus"
            @click="onOpenGroupEditor()"
          >
            리스트 그룹 등록
          </StyledButton>
        </div>
      </div>
    </ValidateForm>
    <ListTable
      :height="`calc(100% - 121px)`"
      :observer="observer"
      :loading="loading"
      :empty-text="emptyText"
      :header="listTable.headers"
      :items="tableItems"
      @observe="onObserveTable"
    >
      <template #items="{ props, index }:ListTableItemSlot<RollingListGrpItem>">
        <tr>
          <td>
            <StyledButton
              text
              color="primary"
              :icon="mdiPencil"
              @click="onClickListEditBtn(props)"
            >
              {{ props.rollingListGrpName }}
            </StyledButton>
          </td>
          <td> <span>{{ props.layoutName }}</span> </td>
          <td>
            <StyledButton small outline @click="onClickPreview(props)"> 보기 </StyledButton>
          </td>
          <td>
            <div class="flex gap-8">
              <StyledButton small outline @click="onOpenGroupEditor(props)"> 그룹 설정 </StyledButton>
              <StyledButton small outline @click="onClickCopyBtn(props)"> 복사 </StyledButton>
              <StyledButton small outline @click="onClickDeleteBtn(index)"> 삭제 </StyledButton>
            </div>
          </td>
        </tr>
      </template>
    </ListTable>
    <CopyComponent
      ref="copyComponentEL"
      @on:copy-component="onCopyComponent"
      @on:close="onPopupClose('copyComponent')"
      v-if="modal['copyComponent'].show"
    />
    <GroupEditor
      ref="editorEL"
      @on:create-component="onCreateComponent"
      @on:edit-component="onEditComponent"
      @on:close="onPopupClose('groupEditor')"
      v-if="modal['groupEditor'].show"
    />
    <ListEditor
      ref="listEditorEL"
      @on:edit-component="onListEditComponent"
      @on:close="onPopupClose('listEditor')"
      v-if="modal['listEditor'].show"
    />
    <Preview
      :component="previewComponent.ROLLING_LIST"
      :unique-key="modal['preview'].target!"
      @close="onPopupClose('preview')"
      @iframe-loaded="Spinner.close()"
      v-if="modal['preview'].show"
    />
  </div>
</template>

<script lang='ts'>
export default { name: 'SmartComponentRollingList' };
</script>