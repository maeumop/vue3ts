<script setup lang='ts'>
import {
  ref,
  computed,
  toValue,
} from 'vue';

import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { GetTermsParam, GetTermsRes, TermsItem } from '@/types/api/smartEditorApi';

import { useToast, useSearchForm, useListTable } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import { mdiMagnify } from '@/assets/svg/path';

import Modal from '@/components/Modal/index.vue';
import { useClientStore } from '@/store';
import { storeToRefs } from 'pinia';


const { getClientAccount } = storeToRefs(useClientStore());

const util = useUtil();
const smartEditorApi = useSmartEditorApi();

// emit
const emit = defineEmits<{
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();


// Element
const validateForm = ref<ValidateFormModel>();
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close' | '$nextTick'>>();

// data()
type KeyListTableHeader<T> = { key: keyof T } & ListTableHeader;
const _tableHeader: KeyListTableHeader<TermsItem>[] = [
  { text: '페이지명', key: 'pageName' },
  { text: '페이지코드', key: 'pageCode', width: '200px' },
];
const listTable = useListTable<TermsItem, KeyListTableHeader<TermsItem>>({ headers: _tableHeader });
let { loading, observer } = listTable;

let emptyText = ref<string>('검색어를 입력 후 검색을 진행해 주세요.');
let isShow = ref<boolean>(true);

const searchForm = useSearchForm([
  { text: '페이지명', value: 'name' },
  { text: '페이지코드', value: 'code' },
]);
const { searchFieldOptions, searchText } = searchForm;

// computed
const tableItems = computed<TermsItem[]>(() => toValue(listTable.items));

// mehtods
const { Toast } = useToast();

const _getTerms = async (): Promise<TermsItem[]> => {
  const req: GetTermsParam = { search: searchForm.getSearchParams(), limit: 50 };
  let cursor: number = -1;
  if (tableItems.value.length > 0) {
    cursor = tableItems.value[tableItems.value.length - 1].regDatetime;
    req.cursor = cursor;
  }

  const res: GetTermsRes = await smartEditorApi.getTerms(req);
  const { terms } = res.results;

  // observer 해제
  if (terms.length < req.limit!) {
    await listTable.changeObserver(false);
  }
  return terms;
};

const onObserveTable = async (): Promise<void> => {
  try {
    validateForm.value?.formProtection(true);
    await listTable.onObserve(() => _getTerms());
    if (!tableItems.value.length) {
      emptyText.value = '데이터가 존재하지 않습니다.';
    }
  } catch (err) {
    util.axiosErrorCatch(err);
  } finally {
    validateForm.value?.formProtection(false);
  }
};


/**
 * Modal 컴포넌트의 close 함수 수행.
 * @author hjs0703
 * @returns
 */
const onClose = (): void => {
  modalEL.value?.close();
};

/**
 * Modal 컴포넌트의 update:modelValue 이벤트 핸들러
 * Modal 컴포넌트의 close 함수 수행시 발생하는 이벤트를 캐치하여 모달을 종료를 수행합니다.
 * @author hjs0703
 * @returns
 */
const onCloseModal = (): void => {
  modalEL.value?.$nextTick(() => {
    isShow.value = false;
    emit('on:close');
  });
};

/**
 * SearchForm에서 검색 내용을 검색한 목록 반영
 * @author hjs703
 * @returns
 */
const onSearch = async (): Promise<void> => {
  if (loading.value) {
    return;
  }
  try {
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
 * 해당 테이블 행 클릭 이벤트
 * @author hjs0703
 * @param index 복사할 약관 페이지 index
 * @returns
 */
const onClickRow = (index: number): void => {
  try {
    if (index < 0 || index >= tableItems.value.length) {
      throw new Error('참조할 수 있는 index값이 아닙니다.');
    }

    const { domain } = getClientAccount.value.domains.filter(item => item.isMain === 1)[0];
    const { htmlPath } = tableItems.value[index];

    navigator.clipboard.writeText(`https://${domain}/${htmlPath}`);
    Toast('링크가 복사 되었습니다. Ctrl + V 로 붙여 넣기 하세요.');
    onClose();
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

defineExpose({
  onClose
});
</script>
<script lang='ts'> export default { name: 'SmartLayerSearchPolicy' };</script>
<template>
  <Modal
    access-back
    esc-close
    ref="modalEL"
    width="520px"
    class="smartLayerSearchPolicy"
    title="약관 페이지 검색"
    :model-value="isShow"
    @update:model-value="onCloseModal"
  >
    <template #body>
      <ValidateForm ref="validateForm" v-if="isShow">
        <div class="row">
          <div class="col">
            <TextField
              block
              hide-message
              label="페이지 검색"
              :readonly="loading"
              :placeholder="`${ searchFieldOptions.map(option => option.text).join(', ').josaFormat() } 입력해주세요.`"
              :icon="mdiMagnify"
              :max-length="50"
              :icon-action="onSearch"
              @keyup.enter="!loading && onSearch()"
              v-model="searchText"
            />
          </div>
        </div>
      </ValidateForm>
      <div class="row mt-10">
        <div class="col">
          <ListTable
            class="border"
            :height="312"
            :observer="observer"
            :loading="loading"
            :empty-text="emptyText"
            :header="_tableHeader"
            :items="tableItems"
          >
            <template #items="{ props, index }:ListTableItemSlot<TermsItem>">
              <tr :style="[ { cursor: 'pointer' } ]" @click="onClickRow(index)">
                <template :key="header.key" v-for="(header) in _tableHeader">
                  <td> <span>{{ props[header.key] }}</span> </td>
                </template>
              </tr>
            </template>
          </ListTable>
        </div>
      </div>
    </template>
    <template #action="{ close }">
      <StyledButton outline @click="close">
        취소
      </StyledButton>
    </template>
  </Modal>
</template>