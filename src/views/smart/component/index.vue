<script setup lang='ts'>
import { computed, onMounted, reactive, ref, toValue, inject } from 'vue';
import { useRoute } from 'vue-router';

import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { SpinnerModel } from '@/components/Spinner/types';
import type { PaginationDefault } from '@/types/api';
import type { SMART_COMP_KEYS, SmartCompUseModal } from '@/types/smart/component';

import { _isContains, useListTable, useSearchForm, useToast } from '@/js/helper/common';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import { useUtil } from '@/js/util';

import { mdiMagnify, mdiPencil, mdiPlus, mdiRefresh } from '@/assets/svg/path';
import Preview from '@/views/common/preview.vue';
import CopyComponent from '@/views/smart/component/layer/CopyComponent/index.vue';

import CommentGroupEditor from '@/views/smart/component/Comment/layer/GroupEditor/index.vue';
import ImportEditor from '@/views/smart/component/Import/layer/GroupEditor/index.vue';
import InputFormGroupEditor from '@/views/smart/component/InputForm/layer/GroupEditor/index.vue';
import ListRollingGroupEditor from '@/views/smart/component/ListRolling/layer/GroupEditor/index.vue';
import RollingBannerGroupEditor from '@/views/smart/component/RollingBanner/layer/GroupEditor/index.vue';

import CommentEditor from '@/views/smart/component/Comment/layer/CommentEditor/index.vue';
import InputItemEditor from '@/views/smart/component/InputForm/layer/InputItemEditor/index.vue';
import ListRollingEditor from '@/views/smart/component/ListRolling/layer/ListEditor/index.vue';
import RollingBannerEditor from '@/views/smart/component/RollingBanner/layer/BannerEditor/index.vue';

import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { KeyIndex } from '@/components/types';
import { CONST_CODES, previewComponent } from '@/constants/common';
import { useMessageBox } from '@/js/helper/messageBox';
import type {
  CommentGrpItem,
  GetCommentGrpsRes,
  GetImportsRes,
  GetInputConfigRes,
  GetInputConfigResult,
  GetInputFormItem,
  GetInputFormRes,
  GetRollingBannerGrpsRes, GetRollingListGrpsRes,
  ImportItem,
  RollingBannerGrpItem,
  RollingListGrpItem
} from '@/types/api/smartEditorApi';
import type { CodeItem, PreviewComponent } from '@/types/common';
import type { SmartComponent } from '@/types/smartEditor';


type GetSmartCompResType = GetInputFormRes| GetRollingBannerGrpsRes | GetRollingListGrpsRes | GetImportsRes | GetCommentGrpsRes;
type GroupEditorType = typeof InputFormGroupEditor | typeof RollingBannerGroupEditor
  | typeof ListRollingGroupEditor | typeof CommentGroupEditor | typeof ImportEditor;
type DetailEditorType = typeof RollingBannerGroupEditor | typeof ListRollingGroupEditor | typeof CommentGroupEditor;

const { PAGE_SECTION_TYPE } = CONST_CODES;
const { INPUT_FORM, ROLLING_BANNER, ROLLING_LIST, COMMENT, IMPORT } = PAGE_SECTION_TYPE;

const route = useRoute();
const util = useUtil();
const smartEditorApi = useSmartEditorApi();

const Spinner = inject('Spinner') as SpinnerModel;

//computed
const getMetaCompCode = computed<CodeItem>(() => route.meta['compCode'] as CodeItem );
const getMetaTitle = computed(() => route.meta['title']);
const getParamsTypePropertyName = computed(() => {
  let propertyName: string = '';
  switch (getMetaCompCode.value.VAL) {
    case ROLLING_BANNER.VAL: propertyName = 'rollingBannerGrp'; break;
    case ROLLING_LIST.VAL: propertyName = 'rollingListGrp'; break;
    case COMMENT.VAL: propertyName = 'commentGrp'; break;
    case IMPORT.VAL: propertyName = 'import'; break;
    case INPUT_FORM.VAL:
    default: propertyName = 'inputForm'; break;
  }

  return `${propertyName}`;
});
const getParamsTypePropertyUid = computed(() => `comp${getParamsTypePropertyName.value.replace(/\b[a-z]/, v => v.toUpperCase())}Uid`);

// element
let validateForm = ref<ValidateFormModel>();
let copyComponentEL = ref<Pick<InstanceType<typeof CopyComponent>, 'onOpen' | '$nextTick'>>();
let editorEL = ref<InstanceType<GroupEditorType>>();
let detailEL = ref<InstanceType<DetailEditorType>>();
let inputConfigEditorEL = ref<Pick<InstanceType<typeof InputItemEditor>, 'onOpen' | '$nextTick'>>();

// data
const searchForm = useSearchForm([
  { text: `${getMetaTitle.value}명`, value: `${getParamsTypePropertyName.value}Name` },
  { text: '레이아웃', value: 'layoutName' },
]);
const { searchField,  searchText, searchFieldOptions } = searchForm;

type CustomListTableHeader = { key?: string } & ListTableHeader;
const _tableHeader: CustomListTableHeader[] = [
  { text: `${getMetaTitle.value}명`, key: `${getParamsTypePropertyName.value}Name` },
  { text: '레이아웃', width: '250px' },
  { text: '미리보기', width: '100px' },
  { text: '관리', width: '250px' },
];
const listTable = useListTable<SmartComponent[], CustomListTableHeader>({ headers: _tableHeader });
let { loading, emptyText, observer } = listTable;
let tableTotalCount = ref<number>(0);
const tableItems = computed<SmartComponent[][]>(() => toValue(listTable.items));

const tableHeaderValue = computed(() =>
  (item: SmartComponent, key: string) => ((item as KeyIndex<any>)[key] || ''));

// 팝업들 설정 =========================
// copyComponent : 복사 팝업
// preview : 미리보기 팝업
// groupEditor : 그룹 등록/수정 팝업
// detailEditor : 상세 저장 팝업
// inputConfigEditor : 입력 항목 설정 팝업
type ModalType =  {
  copyComponent: SmartCompUseModal,
  preview: SmartCompUseModal<string>,
  groupEditor: SmartCompUseModal<SmartComponent>,
  detailEditor: SmartCompUseModal<SmartComponent>,
  inputConfigEditor: SmartCompUseModal,
};
type ModalKeys = keyof ModalType;

let modal = reactive<ModalType>({
  copyComponent: { show: false },
  preview: { show: false, target: null },
  groupEditor: { show: false, target: null },
  detailEditor: { show: false, target: null },
  inputConfigEditor: { show: false },
});

const onPopupClose = (key: ModalKeys): void => {
  modal[key].show = false;
  if (modal[key].target) {
    modal[key].target = null;
  }

  key === 'preview' && Spinner.close();
};
// END - 팝업들 설정 ====================

// 인풋폼 개별 설정 =========================
let inputConfigItems = ref<GetInputConfigResult[]>([ ]);

const onClickInputConfigEditor = async (): Promise<void> => {
  if (getMetaCompCode.value.VAL !== INPUT_FORM.VAL) {
    return;
  }

  if (loading.value) {
    return;
  }

  const _key: ModalKeys = 'inputConfigEditor';

  try {
    if (inputConfigItems.value.length < 1) {
      throw new Error('참조할 수 있는 inputConfigItems 값이 없습니다.');
    }

    if (!modal[_key].show) {
      modal[_key].show = true;
      await inputConfigEditorEL.value?.$nextTick();
    }

    await inputConfigEditorEL.value?.onOpen({ self: inputConfigItems.value });
  } catch (err) {
    console.error(err);
    // defaultErrors();
    onPopupClose(_key);
  }
};
const onEditInputConfig = (value: GetInputConfigResult[]): void => {
  inputConfigItems.value = value.map((item: GetInputConfigResult) => (Object.assign({}, item)));
};
// END - 인풋폼 개별 설정 ====================

//methods
const { Toast } = useToast();
const { deleteSmartComponent } = useMessageBox(Toast);

const _getAPiResources = async (): Promise<SmartComponent[]> => {
  const req: { search?: string } & PaginationDefault = { search: searchForm.getSearchParams(), limit: 50 };
  let cursor: number = -1;
  const page: number = tableItems.value.length - 1;

  if (page >= 0) {
    const index: number = tableItems.value[page].length - 1;
    cursor = tableItems.value[page][index].regDatetime;
    req.cursor = cursor;
  }

  let totalCount: number = 0;
  let items: SmartComponent[] = [];

  switch (getMetaCompCode.value.VAL) {
    case INPUT_FORM.VAL: {
      const { results } = await smartEditorApi.getInputForm(req);
      totalCount = results.totalCount;
      items = results.inputForms;
    } break;

    case ROLLING_BANNER.VAL: {
      const res: GetRollingBannerGrpsRes = await smartEditorApi.getRollingBannerGrps(req);
      totalCount = res.results.totalCount;
      items = res.results.rollingBannerGrps;
    } break;

    case ROLLING_LIST.VAL: {
      const res: GetRollingListGrpsRes = await smartEditorApi.getRollingListGrps(req);
      totalCount = res.results.totalCount;
      items = res.results.rollingListGrps;
    } break;

    case COMMENT.VAL: {
      const res: GetCommentGrpsRes = await smartEditorApi.getCommentGrps(req);
      totalCount = res.results.totalCount;
      items = res.results.commentGrps;
    } break;

    case IMPORT.VAL: {
      const res: GetImportsRes = await smartEditorApi.getImports(req);
      totalCount = res.results.totalCount;
      items = res.results.imports;
    } break;
  }

  // 최초 검색 갯수
  if (cursor < 0) {
    tableTotalCount.value = totalCount;
  }

  // observer 해제
  if (items.length < req.limit!) {
    await listTable.changeObserver(false);
  }

  return items;
};

const onObserveTable = async (): Promise<void> => {
  try {
    validateForm.value?.formProtection(true);
    await listTable.onObserve(async () => await _getAPiResources().then(res => ([ res ])));
  } catch (err) {
    util.axiosErrorCatch<GetSmartCompResType>(err);
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
      await listTable.changeObserver();
    }

    onObserveTable();
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

const onOpenGroupEditor = async (target?: SmartComponent): Promise<void> => {
  if (loading.value) {
    return;
  }
  const _key: ModalKeys = 'groupEditor';


  try {
    if (!modal[_key].show) {
      modal[_key].show = true;
      await editorEL.value?.$nextTick();
    }

    if (!editorEL.value) {
      return;
    }

    switch (getMetaCompCode.value.VAL) {
      case INPUT_FORM.VAL: {
        const { onOpen } = editorEL.value as InstanceType<typeof InputFormGroupEditor>;
        onOpen({ inputConfigItems: inputConfigItems.value, ...(target ? { self: target as  GetInputFormItem } : {}) });
      } break;

      case ROLLING_BANNER.VAL: {
        const { onOpen } = editorEL.value as InstanceType<typeof RollingBannerGroupEditor>;
        onOpen({ ...(target ? { target: target as RollingBannerGrpItem } : {}) });
      } break;

      case ROLLING_LIST.VAL: {
        const { onOpen } = editorEL.value as InstanceType<typeof ListRollingGroupEditor>;
        onOpen({ ...(target ? { self: target as RollingListGrpItem } : {}) });
      } break;

      case COMMENT.VAL: {
        const { onOpen } = editorEL.value as InstanceType<typeof CommentGroupEditor>;
        onOpen({ ...(target ? { self: target as CommentGrpItem } : {}) });
      } break;

      case IMPORT.VAL: {
        const { onOpen } = editorEL.value as InstanceType<typeof ImportEditor>;
        onOpen({ ...(target ? { self: target as ImportItem } : {}) });
      } break;

      default: return;
    }

    if (target) {
      modal[_key].target = target;
    }
  } catch (error) {
    onPopupClose(_key);
  }
};

const onCreateComponent = <T extends SmartComponent = SmartComponent>(item: T): void => {
  if (!searchText.value) {
    tableTotalCount.value++;
    if ((tableItems.value.length - 1) < 0) {
      tableItems.value.splice(0, 0, []);
    }

    tableItems.value[0].splice(0, 0, item);
    return;
  }
  // 필터를 이용하는 중이면, 재필터 수행
  onSearch();
};

const onEditComponent = (edit: SmartComponent): void => {
  if (!searchText.value) {
    const _key: ModalKeys = 'groupEditor';
    Object.assign(modal[_key].target!, edit);
    return;
  }
  // 필터를 이용하는 중이면, 재필터 수행
  onSearch();
};

const onClickDetailEditBtn =  async (item: SmartComponent): Promise<void> => {
  if (loading.value) {
    return;
  }

  if (_isContains(getMetaCompCode.value.VAL, [ INPUT_FORM.VAL, IMPORT.VAL])) {
    onOpenGroupEditor(item);
    return;
  }

  const _key: ModalKeys =  'detailEditor';

  try {
    if (!modal[_key].show) {
      modal[_key].show = true;
      await detailEL.value?.$nextTick();
    }

    switch (getMetaCompCode.value.VAL) {
      case ROLLING_BANNER.VAL: {
        const { onOpen } = detailEL.value as InstanceType<typeof RollingBannerEditor>;
        onOpen({ target: item as RollingBannerGrpItem });
      } break;

      case ROLLING_LIST.VAL: {
        const { onOpen } = detailEL.value as InstanceType<typeof ListRollingEditor>;
        onOpen({ target: item as RollingListGrpItem });
        if (item) {
          modal[_key].target = item;
        }
      } break;

      case COMMENT.VAL: {
        const { onOpen } = detailEL.value as InstanceType<typeof CommentEditor>;
        onOpen({ target: item as CommentGrpItem });
      } break;

      default: return;
    }

  } catch (error) {
    onPopupClose(_key);
  }
};


const onDetailEditComponent = (edit: SmartComponent): void => {
  const _key: ModalKeys = 'detailEditor';
  Object.assign(modal[_key].target!, edit);
};

/**
 * 컴포넌트 복사 클릭 이벤트 핸들러
 * @author hjs0620
 * @param item - 복사할 원본 객체
 * @returns
 */
const onClickCopyBtn = async (item: SmartComponent): Promise<void> => {
  if (loading.value) {
    return;
  }

  const _key: ModalKeys = 'copyComponent';

  try {
    if (!modal[_key].show) {
      modal[_key].show = true;
      await copyComponentEL.value?.$nextTick();
    }

    copyComponentEL.value?.onOpen({ self: item,  type: getMetaCompCode.value.VAL as SMART_COMP_KEYS });
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

    if ((tableItems.value.length - 1) < 0) {
      tableItems.value.splice(0, 0, []);
    }

    tableItems.value[0].splice(0, 0, item);
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
const onClickDeleteBtn = async (page: number, index: number): Promise<void> => {
  if (loading.value) {
    return;
  }

  if (page < 0 || page >= tableItems.value.length) {
    // defaultErrors();
    return;
  }

  const deleteItem = tableItems.value[page][index];
  const compUid: string = tableHeaderValue.value(deleteItem, getParamsTypePropertyUid.value);
  if (!compUid) {
    return;
  }

  let deleteMethod: Function;
  switch (getMetaCompCode.value.VAL) {
    case ROLLING_BANNER.VAL: deleteMethod = smartEditorApi.deleteRollingBannerGrps; break;
    case ROLLING_LIST.VAL: deleteMethod = smartEditorApi.deleteRollingListGrps; break;
    case COMMENT.VAL: deleteMethod = smartEditorApi.deleteCommentGrps; break;
    case IMPORT.VAL: deleteMethod = smartEditorApi.deleteImports; break;
    case INPUT_FORM.VAL:
    default: deleteMethod = smartEditorApi.deleteInputForm; break;
  }

  if (typeof deleteMethod !== 'function') {
    return;
  }

  deleteSmartComponent(`${getMetaTitle.value}`, async () => {
    await deleteMethod(compUid)
      .then(() => {
        tableItems.value[page].splice(index, 1);
        tableTotalCount.value--;
      });
  });
};


/**
 * 컴포넌트 미리보기
 * @param target {SmartComponent}
 */
const onClickPreview = (target: SmartComponent): void => {
  const preViewComponentType: string = route.meta['preViewComponentType'] as string;

  if (!preViewComponentType) {
    return;
  }

  const _key: ModalKeys = 'preview';
  switch (preViewComponentType) {
    case previewComponent.INPUT_FORM:
    case previewComponent.ROLLING_BANNER:
    case previewComponent.ROLLING_LIST:
    case previewComponent.COMMENT:
    case previewComponent.IMPORT: {
      modal[_key].target = tableHeaderValue.value(target, getParamsTypePropertyUid.value);
    } break;

    default: return;
  }

  Spinner.delay(0).show('Loading…');
  modal[_key].show = true;
};


onMounted(async () => {
  onSearch(true);
  if (getMetaCompCode.value.VAL === INPUT_FORM.VAL) {
    // 입력 항목 값이 없다면 조회
    try {
      const { results } = await smartEditorApi.getInputConfig();
      inputConfigItems.value.splice(0, inputConfigItems.value.length, ...results);
    } catch (err) {
      util.axiosErrorCatch<GetInputConfigRes>(err);
    }
  }
});

</script>
<script lang='ts'> export default { name: 'SmartComponent' };</script>
<template>
  <div id="smartComponent" class="content common-list">
    <ValidateForm ref="validateForm">
      <div class="searchArea">
        <div class="listCount">
          검색결과
          <span class="text-point"> {{ tableTotalCount.numberFormat() }} </span>건
        </div>
        <div class="flex-center gap-8">
          <div class="width-140">
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
        <div class="flex-center gap-8">

          <StyledButton
            color="primary"
            :icon="mdiPlus"
            @click="onOpenGroupEditor()"
          >
            {{ getMetaTitle }} 등록
          </StyledButton>
          <StyledButton color="primary" @click="onClickInputConfigEditor" v-if="getMetaCompCode.VAL === INPUT_FORM.VAL">
            입력 항목 설정
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
      @observe="!loading && onObserveTable()"
    >
      <template #items="{ props, index }: ListTableItemSlot<SmartComponent[]>">
        <tr :key="tableHeaderValue(item, getParamsTypePropertyUid) || row" v-for="(item, row) in props">
          <td>
            <StyledButton
              text
              color="primary"
              :icon="mdiPencil"
              @click="onClickDetailEditBtn(item)"
            >
              {{ tableHeaderValue(item, `${getParamsTypePropertyName}Name`) || '' }}
            </StyledButton>
          </td>
          <td> <span>{{ item.layoutName }}</span> </td>
          <td>
            <StyledButton small outline @click="onClickPreview(item)"> 보기 </StyledButton>
          </td>
          <td>
            <div class="flex-center gap-8">
              <StyledButton
                small
                outline
                @click="onOpenGroupEditor(item)"
                v-if="_isContains(getMetaCompCode.VAL, [ ROLLING_BANNER.VAL, ROLLING_LIST.VAL, COMMENT.VAL ])"
              >
                그룹 설정
              </StyledButton>
              <StyledButton small outline @click="onClickCopyBtn(item)"> 복사 </StyledButton>
              <StyledButton small outline @click="onClickDeleteBtn(index, row)"> 삭제 </StyledButton>
            </div>
          </td>
        </tr>
      </template>
    </ListTable>

    <template v-if="getMetaCompCode.VAL === INPUT_FORM.VAL">
      <InputFormGroupEditor
        ref="editorEL"
        @on:create-component="onCreateComponent"
        @on:edit-component="onEditComponent"
        @on:close="onPopupClose('groupEditor')"
        v-if="modal['groupEditor'].show"
      />
      <InputItemEditor
        ref="inputConfigEditorEL"
        @on:edit-input-form-items="onEditInputConfig"
        @on:close="onPopupClose('inputConfigEditor')"
        v-if="modal['inputConfigEditor'].show"
      />
    </template>
    <template v-else-if="getMetaCompCode.VAL === ROLLING_BANNER.VAL">
      <RollingBannerGroupEditor
        ref="editorEL"
        @on:create-component="onCreateComponent"
        @on:edit-component="onEditComponent"
        @on:close="onPopupClose('groupEditor')"
        v-if="modal['groupEditor'].show"
      />
      <RollingBannerEditor
        ref="detailEL"
        @on:close="onPopupClose('detailEditor')"
        v-if="modal['detailEditor'].show"
      />
    </template>
    <template v-else-if="getMetaCompCode.VAL === ROLLING_LIST.VAL">
      <ListRollingGroupEditor
        ref="editorEL"
        @on:create-component="onCreateComponent"
        @on:edit-component="onEditComponent"
        @on:close="onPopupClose('groupEditor')"
        v-if="modal['groupEditor'].show"
      />
      <ListRollingEditor
        ref="detailEL"
        @on:edit-component="onDetailEditComponent"
        @on:close="onPopupClose('detailEditor')"
        v-if="modal['detailEditor'].show"
      />
    </template>
    <template v-else-if="getMetaCompCode.VAL === COMMENT.VAL">
      <CommentGroupEditor
        ref="editorEL"
        @on:create-component="onCreateComponent"
        @on:edit-component="onEditComponent"
        @on:close="onPopupClose('groupEditor')"
        v-if="modal['groupEditor'].show"
      />
      <CommentEditor
        ref="detailEL"
        @on:close="onPopupClose('detailEditor')"
        v-if="modal['detailEditor'].show"
      />
    </template>
    <template v-else-if="getMetaCompCode.VAL === IMPORT.VAL">
      <ImportEditor
        ref="editorEL"
        @on:create-component="onCreateComponent"
        @on:edit-component="onEditComponent"
        @on:close="onPopupClose('groupEditor')"
        v-if="modal['groupEditor'].show"
      />
    </template>


    <CopyComponent
      ref="copyComponentEL"
      @on:copy-component="onCopyComponent"
      @on:close="onPopupClose('copyComponent')"
      v-if="modal['copyComponent'].show"
    />
    <Preview
      :component="(route.meta['preViewComponentType'] as PreviewComponent)"
      :unique-key="modal['preview'].target!"
      @close="onPopupClose('preview')"
      @iframe-loaded="Spinner.close()"
      v-if="modal['preview'].show"
    />
  </div>
</template>