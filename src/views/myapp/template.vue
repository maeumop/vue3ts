<script setup lang="ts">
import { ref, inject, } from 'vue';
import { useMyAppApi } from '@/api/modules/myAppApi';
import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import { useUtil } from '@/js/util';
import { CONST_CODES, previewType } from '@/constants/common';
import { mdiMagnify, mdiRefresh, mdiPlus, mdiPencil } from '@/assets/svg/path';
import { getTemplatesMsg, deleteTemplatesMsg, } from '@/constants/api/myAppapi';
import { getLayoutsMsg } from '@/constants/api/smartEditorApi';
import TemplateResist from './layer/templateResist.vue';
import CopyTemplate from './layer/copyTemplate.vue';
import Preview from '@/views/common/preview.vue';
import type { GetTemplatesParam, TemplateItem, GetTemplatesRes, DeleteTemplatesRes, } from '@/types/api/myAppApi';
import type { KeyIndex } from '@/types/common';
import type { OptionItem } from '@/components/types';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ToastModel } from '@/components/Toast/types';
import type { SpinnerModel } from '@/components/Spinner/types';

const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;
const Spinner = inject('Spinner') as SpinnerModel;

const myAppApi = useMyAppApi();
const smartEditorApi = useSmartEditorApi();
const util = useUtil();

const { SEARCH } = CONST_CODES;

// ==================== 테이블 설정 ====================
const tableHeader: ListTableHeader[] = [
  { text: '템플릿명', width: '' },
  { text: '레이아웃', width: '300' },
  { text: '미리보기', width: '120' },
  { text: '관리', width: '150' },
];

let layoutList = ref<OptionItem[]>([]);
/**
 * 레이아웃 목록
 */
const getLayoutList = async (): Promise<void> => {
  const { code, results } = await smartEditorApi.getLayouts();

  if (code === getLayoutsMsg.SMART_LAYOUT_GET_SUCCESS) {
    results.layouts.forEach((item) => {
      layoutList.value.push({ value: item.layoutUid, text: item.layoutName });
    });
  }
};

let emptyText = ref<string>('데이터가 없습니다.');
// ==================== END 테이블 설정 ====================


// ==================== 템플릿 목록, 검색 ====================
const optSearch: OptionItem[] = [
  { value: SEARCH.TEMPLATE.VAL, text: SEARCH.TEMPLATE.TXT },
  { value: SEARCH.LAYOUT.VAL, text: SEARCH.LAYOUT.TXT },
];

let selectedOpt = ref<string>('');
let searchText = ref<string>('');

let observer = ref<boolean>(false);
let isLoading = ref<boolean>(false);
let totalCount = ref<number>(0);
let templateList = ref<TemplateItem[]>([]);
/**
 * 템플릿 목록, 검색
 * - 검색어가 없으면 전체 목록, 있으면 검색된 목록을 불러옴
 */
const getTemplates = async (): Promise<void> => {
  isLoading.value = true;
  // 스크롤 이벤트 on/off
  if (!templateList.value.length || templateList.value.length < totalCount.value) {
    observer.value = true;
  } else {
    observer.value = false;
  }

  // params 설정
  const column = selectedOpt.value ? `&column=${selectedOpt.value}` : '';
  const params: GetTemplatesParam = {
    search: searchText.value ? encodeURIComponent(`word=${searchText.value}${column}`) : '',
    limit: 50,
  };

  if (observer.value) {
    params.cursor = templateList.value.at(-1)?.regDatetime;

    if (searchText.value) {
      params.cursor = '';
    }
  }

  // API 연동, 결과 출력
  try {
    const { code, results } = await myAppApi.getTemplates(params);

    if (code === getTemplatesMsg.TEMPLATES_GET_SUCCESS) {
      totalCount.value = results.totalCount;

      if (templateList.value.length < totalCount.value || searchText.value) {
        if (searchText.value) {
          templateList.value = [];
          emptyText.value = '검색된 내용이 없습니다.';
        }
        results.templates.forEach((item) => {
          templateList.value.push(item);
        });

      } else if (!templateList.value.length) {
        templateList.value = results.templates;
      }
    }

  } catch (err) {
    util.axiosErrorCatch<GetTemplatesRes>(err);
  }

  isLoading.value = false;
};


/**
 * 검색 초기화
 */
const refreshSearch = (): void => {
  selectedOpt.value = '';
  searchText.value = '';
  emptyText.value = '데이터가 없습니다.';

  getTemplates();
};
// ==================== END 템플릿 검색 ====================


// ==================== 템플릿 삭제, 등록/수정 ========================
/**
 * 템플릿 삭제
 * @param idx 템플릿 idx
 */
const deleteTemplates = async (idx: number): Promise<void>  => {
  try {
    const { code } = await myAppApi.deleteTemplates(templateList.value[idx].templateUid);

    if (code === deleteTemplatesMsg.TEMPLATE_DELETE_SUCCESS) {
      templateList.value.splice(idx, 1);

      totalCount.value--;
      Toast('정상적으로 삭제되었습니다.');
    }

  } catch (err) {
    util.axiosErrorCatch<DeleteTemplatesRes>(err);
  }
};

const openDeleteAlert = (idx: number): void => {
  MessageBox.confirm({
    title: '템플릿을 삭제하시겠습니까?',
    message: '[삭제 처리하기] 버튼 클릭 시 해당 데이터는 삭제되며, 복구가 불가능합니다.',
    btnCancelText: '삭제 취소하기',
    btnOkayText: '삭제 처리하기',
    asyncOkay: async () => {
      await deleteTemplates(idx);
    }
  });
};

let isResistOpen = ref<boolean>(false);
let templateIdx = ref<number>(-1);
let templateUid = ref<string>('');
/**
 * 수정 모달 오픈
 * @param idx 클릭한 템플릿 index
 */
const openModify = (idx: number): void => {
  templateIdx.value = idx;
  isResistOpen.value = true;

  templateUid.value = templateList.value[idx].templateUid;
};

/**
 * 등록/수정 모달 닫기
 */
const closeResist = (): void => {
  templateIdx.value = -1;
  isResistOpen.value = false;
};

/**
 * 템플릿 목록 업데이트
 * @param params 등록 또는 수정할 템플릿
 */
const updateList = (params: KeyIndex<string>): void => {
  // 등록
  if (templateUid.value !== params.templateUid) {
    templateList.value.unshift({
      templateUid: params.templateUid,
      layoutUid: params.layoutUid,
      templateName: params.templateName,
      sourceCode: params.sourceCode,
      layoutName: layoutList.value.find((item) => item.value === params.layoutUid)?.text ?? '',
      regDatetime: Date.now(),
      modDatetime: Date.now()
    });
    totalCount.value++;
    Toast('정상적으로 등록되었습니다.');

  // 수정
  } else {
    templateList.value.forEach(item => {
      if (item.templateUid === templateUid.value) {
        item.layoutUid = params.layoutUid;
        item.layoutName = layoutList.value.find((item) => item.value === params.layoutUid)?.text ?? '',
        item.templateName = params.templateName;
        item.sourceCode = params.sourceCode;
      }
    });
    Toast('정상적으로 수정되었습니다.');
  }
};
// ==================== END 템플릿 삭제, 등록/수정 ========================


// ==================== 템플릿 복사 =====================
let isCopyOpen = ref<boolean>(false);
/**
 * 복사하기 모달 열기
 * @param idx 복사할 템플릿의 인덱스
 */
const openCopyModal = (idx: number): void => {
  templateIdx.value = idx;
  isCopyOpen.value = true;

  templateUid.value = templateList.value[idx].templateUid;
};

/**
 * 템플릿 복사하기
 * @param name 템플릿명
 * @param uid templateUid
 */
const copyTemplate = (name: string, uid: string): void => {
  templateList.value.unshift({
    ...templateList.value[templateIdx.value],
    templateName: name,
    templateUid: uid
  });

  totalCount.value++;
  Toast('정상적으로 복사 되었습니다.');
};
// ==================== END 템플릿 복사 =====================


// ==================== 미리보기 =====================
let isPreviewOpen = ref<boolean>(false);
/**
 * 미리보기 열기
 * @param uid templateUid
 */
const openPreview = (uid: string): void => {
  Spinner.delay(0).show();
  templateUid.value = uid;
  isPreviewOpen.value = true;
};
// ==================== END 미리보기 =====================


// Create
getTemplates();
getLayoutList();
</script>

<template>
  <div id="myAppTemplate" class="content">
    <div class="searchArea">
      <span class="font-lg">
        검색 결과 <span class="text-point">{{ totalCount.numberFormat() }}</span> 건
      </span>

      <div class="flex gap-8">
        <SelectBox
          clearable
          placeholder="전체"
          :width="150"
          :options="optSearch"
          v-model="selectedOpt"
        />

        <TextField
          placeholder="검색어를 입력해주세요."
          :width="250"
          :icon="mdiMagnify"
          :max-length="50"
          :icon-action="getTemplates"
          @keyup.enter="getTemplates"
          v-model="searchText"
        />

        <StyledButton
          only-icon
          outline
          color="secondary"
          :icon="mdiRefresh"
          @click.prevent="refreshSearch"
        />
      </div>
    </div>

    <StyledButton
      class="mx-20 my-10 sticky"
      color="primary"
      :icon="mdiPlus"
      @click.prevent="isResistOpen = true"
    >
      템플릿 등록
    </StyledButton>

    <ListTable
      height="calc(100% - 176px)"
      :header="tableHeader"
      :items="templateList"
      :loading="isLoading"
      :observer="observer"
      :empty-text="emptyText"
      @observe="getTemplates"
    >
      <template #items="{ props, index }: ListTableItemSlot<TemplateItem>">
        <tr>
          <td>
            <StyledButton
              text
              color="primary"
              :icon="mdiPencil"
              @click.prevent="openModify(index)"
            >
              {{ props.templateName }}
            </StyledButton>
          </td>
          <td>{{ props.layoutName }}</td>
          <td>
            <StyledButton
              outline
              small
              color="secondary"
              @click.prevent="openPreview(props.templateUid)"
            >
              보기
            </StyledButton>
          </td>
          <td>
            <StyledButton
              outline
              small
              color="secondary"
              class="mr-5"
              @click.prevent="openCopyModal(index)"
            >
              복사
            </StyledButton>
            <StyledButton
              outline
              small
              color="secondary"
              @click.prevent="openDeleteAlert(index)"
            >
              삭제
            </StyledButton>
          </td>
        </tr>
      </template>
    </ListTable>

    <TemplateResist
      :data="templateList[templateIdx]"
      :layout-list="layoutList"
      @update="updateList"
      @close="closeResist"
      v-if="isResistOpen"
    />

    <CopyTemplate
      :template-uid="templateUid"
      @close="isCopyOpen = false"
      @copy-template="copyTemplate"
      v-if="isCopyOpen"
    />

    <Preview
      :unique-key="templateUid"
      :type="previewType.template"
      @close="isPreviewOpen = false"
      @iframe-loaded="Spinner.hide()"
      v-if="isPreviewOpen"
    />
  </div>
</template>