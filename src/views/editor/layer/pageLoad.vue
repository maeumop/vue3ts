<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { mdiCheck, mdiMagnify } from '@/assets/svg/path';
import type { KeyIndex } from '@/components/types';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import { useEditorStore } from '@/store';
import type { GetPageContentsRes, GetPagesParam, GetPagesRes, PageItem } from '@/types/api/smartEditorApi';
import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import { storeToRefs } from 'pinia';
import { useUtil } from '@/js/util';
import { getPageContentsMsg, getPagesMsg } from '@/constants/api/smartEditorApi';


const emit = defineEmits<{
  (event: 'close'): void
  (event: 'load', item: PageItem): void
}>();

const store = useEditorStore();
const { removeSectionAll, updatePageConfig, setSection } = store;
const { getPageConfig } = storeToRefs(store);

const smartPageApi = useSmartEditorApi();
const util = useUtil();

let isShow = ref<boolean>(true);
let observer = ref<boolean>(true);
let loading = ref<boolean>(false);
let searchText = ref<string>('');

let selectedPage = ref<string>('');

const list = ref<PageItem[]>([]);

watch(isShow, (v) => {
  if (!v) {
    emit('close');
  }
});

const header: ListTableHeader[] = [
  { text: '사용여부', width: '100', },
  { text: '페이지명' },
  { text: '페이지 코드', width: '200', },
  { text: '선택', width: '100', align: 'center', },
];

/**
 * 페이지명 또는 페이지 코드로 검색
 */
const search = async (): Promise<void> => {
  selectedPage.value = '';
  list.value.splice(0, list.value.length);

  if (!observer.value) {
    await changeObserver();
  }
  getSmartPageList();
};

const changeObserver = async (value: boolean = true) => {
  observer.value = value;
  await nextTick();
};

const pageSelect = (value: string): void => {
  selectedPage.value = value;
};

/**
 * 선택된 페이지 적용(config, section 정보)
 * @param close
 */
const load = async (close: Function): Promise<void> => {
  loading.value = true;

  try {
    const { code, results } = await smartPageApi.getPageContents(selectedPage.value);

    if (code === getPageContentsMsg.SMART_PAGE_CONTENT_GET_SUCCESS) {
      const { pageConfig, sections } = results;

      removeSectionAll();

      updatePageConfig({
        ...getPageConfig.value,
        layoutUid: pageConfig.layoutUid,
        isUseScript: pageConfig.isUseScript,
        scriptUid: pageConfig.scriptUid,
      });

      // 오류로 인하여 any 선언
      sections.forEach(({ sectionType, config }: any) => {
        setSection(sectionType, config);
      });
    }
  } catch (err) {
    util.axiosErrorCatch<GetPageContentsRes>(err);
  } finally {
    loading.value = false;
  }

  close();
};


const getSmartPageList = async (): Promise<void> => {
  loading.value = true;

  const search: KeyIndex<string> = {
    word: searchText.value,
  };
  const req: GetPagesParam = {
    searchType: 'pageLoad',
    search: encodeURIComponent(Object.keys(search).map(key => `${key}=${search[key]}`).join('&')),
    limit: 50
  };

  let cursor: number = -1;

  if (list.value.length > 0) {
    cursor = list.value[list.value.length - 1].regDatetime;
    req.cursor = cursor;
  }

  try {
    const { code, results } = await smartPageApi.getPages(req);

    if (code === getPagesMsg.SMART_PAGE_GET_SUCCESS) {
      const { pages } = results;

      // observer 해제
      if (pages.length < req.limit!) {
        await changeObserver(false);
      }

      list.value.splice(list.value.length, 0, ...pages);
    }
  } catch (err) {
    util.axiosErrorCatch<GetPagesRes>(err);
  } finally {
    loading.value = false;
  }
};

getSmartPageList();
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    title="불러오기"
    width="700px"
    id="editorPageLoad"
    v-model="isShow"
  >
    <template #body>
      <div class="row">
        <div class="col">
          <TextField
            block
            label="페이지 검색"
            placeholder="페이지명, 페이지 코드를 입력해 주세요."
            :max-length="50"
            :icon="mdiMagnify"
            :icon-action="search"
            @keydown.enter="search"
            v-model="searchText"
          />
        </div>
      </div>
      <div class="row pt-10">
        <div class="col">
          <ListTable
            class="gray-header"
            height="400px"
            :header="header"
            :items="list"
            :observer="observer"
            :loading="loading"
            @observe="getSmartPageList()"
          >
            <template #items="{ props }: ListTableItemSlot<PageItem>">
              <tr :class="{ selected: selectedPage === props.pageUid }" @click="pageSelect(props.pageUid!)">
                <td>{{ props.isOn ? 'ON' : 'OFF' }}</td>
                <td>{{ props.pageName }}</td>
                <td>{{ props.pageCode }}</td>
                <td class="center">
                  <SvgIcon
                    type="mdi"
                    color="#0336FF"
                    :path="mdiCheck"
                    v-if="selectedPage === props.pageUid"
                  />
                </td>
              </tr>
            </template>
            <template #empty>
              <div class="text-center">데이터가 존재하지 않습니다.</div>
            </template>
          </ListTable>
        </div>
      </div>
      <div class="row mt-10">
        <div class="col">
          <ul class="info-box-bullet">
            <li>불러오기 진행 시 ‘페이지명’, ‘모바일’, ‘백 페이지’, ‘사용여부’ 설정값을 제외한 나머지 설정 값에 대해서만 불러오기가 진행됩니다.</li>
          </ul>
        </div>
      </div>
    </template>
    <template #action="{ close }">
      <StyledButton outline @click="close">취소</StyledButton>
      <StyledButton
        color="primary"
        class="ml-5"
        :disabled="!selectedPage || loading"
        :loading="loading"
        @click="load(close)"
      >
        불러오기
      </StyledButton>
    </template>
  </Modal>
</template>

<style lang="scss">
.list-table.gray-header {
  thead th {
    background-color: $gray-200;
  }

  tbody .selected td,
  tbody .selected th {
    background-color: lighten($primary, 43) !important;
  }
}
</style>