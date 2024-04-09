<script setup lang="ts">
import axios from 'axios';

import { computed, ref, reactive, watch, inject, onUnmounted } from 'vue';
import { mdiMagnify, mdiAlertCircle, mdiCloseCircle, mdiCheckCircleOutline } from '@/assets/svg/path';
import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type { GetPagesParam, GetPagesRes, PageItem } from '@/types/api/smartEditorApi';

import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import type { GetClientsDefaultPageResult, GetClientsDefaultPageRes, PatchClientsDefaultPageRes } from '@/types/api/memberAccountApi';
import { patchClientsDefaultPageMsg } from '@/constants/api/memberAccountApi';

import type { SpinnerModel } from '@/components/Spinner/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { ToastModel } from '@/components/Toast/types';

const util = useUtil();
const smartEditorApi = useSmartEditorApi();
const memberAccountApi = useMemberAccountApi();

const Toast = inject('Toast') as ToastModel;
const Spinner = inject('Spinner') as SpinnerModel;

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'openResult'): void;
}>();

// 팝업 기본 설정 ====================
const modal = ref<ModalModel>();
let isShow = ref(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

const tableHeader = ref<ListTableHeader[]>([
  { text: '페이지명', },
  { text: '페이지 코드', width: '150', },
  { text: '', width: '60', align: 'center', },
]);

let onChangeEvent = ref<boolean>(false);
const isDisabled = computed(() => {
  return !(onChangeEvent.value);
});

const defualtPage = reactive<GetClientsDefaultPageResult>({
  pageUid: '',
  pageName: '',
  pageCode: '',
});

const defualtPageText = computed(() => defualtPage.pageName ? `${defualtPage.pageName} (${defualtPage.pageCode})` : '');

let loading = ref(false);
let list = ref<PageItem[]>([]);
let dataLoading = ref<boolean>(false);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;
let totalCount: number = 0;

// ===================== 검색 ===========================
let searched = ref<boolean>(false);
let searchText = ref<string>('');

const onSearch = async (_search: boolean = true): Promise<void> => {
  searched.value = true;
  if (_search) {
    cursor.value = 0;
    list.value = [];
  }

  dataLoading.value = true;

  const param: GetPagesParam = { limit, searchType: 'pageLoad', search: encodeURIComponent(`isOn=1&word=${encodeURIComponent(searchText.value)}`) };
  if (cursor.value) {
    param.cursor = cursor.value;
  }

  try {
    const { results }: GetPagesRes = await smartEditorApi.getPages(param);

    results.pages.forEach(item => list.value.push(item));
    totalCount = results.totalCount;

    observer.value = !(totalCount <= list.value.length);
    cursor.value = list.value.length ? results.pages[results.pages.length - 1].regDatetime : 0;

  } catch (err) {
    util.axiosErrorCatch<GetPagesRes>(err);
  } finally {
    dataLoading.value = false;
  }
};
// End - 검색 ===========================

/**
 * 페이지 선택
 * @param index 페이지 index
 */
const pageSelect = (index: number): void => {
  onChangeEvent.value = true;
  defualtPage.pageUid = list.value[index].pageUid!;
  defualtPage.pageName = list.value[index].pageName;
  defualtPage.pageCode = list.value[index].pageCode!;
};

/**
 * 기본페이지 설정 값 삭제
 */
const onClear = (): void => {
  defualtPage.pageName = '';
  defualtPage.pageCode = '';
  defualtPage.pageUid = '';
  onChangeEvent.value = true;
};

/**
 * 기본페이지 설정
 */
const onClickEvnt = async (): Promise<void> => {
  try {
    loading.value = true;
    await memberAccountApi.patchClientsDefaultPage(defualtPage.pageUid ? { pageUid: defualtPage.pageUid } : {});
    Toast('정상적으로 설정 되었습니다.');
    modal.value?.close();

  } catch (err) {
    if (axios.isAxiosError<PatchClientsDefaultPageRes, any>(err)) {
      const { response } = err;
      console.log(response);
      if (response) {
        const { code } = response.data;

        if (code === patchClientsDefaultPageMsg.NOT_ALLOW_PAGE_STATUS_OFF) {
          Toast({ color: 'warning', message: 'OFF 상태의 페이지는 기본 페이지로 설정 할 수 없습니다.' });
        } else {
          Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });
        }

      }

    } else {
      console.error(err);
    }

  } finally {
    loading.value = false;
  }
};

/**
 * 기본페이지 조회 API 호출
 */
const getData = async (): Promise<void> => {
  try {
    const { results }: GetClientsDefaultPageRes = await memberAccountApi.getClientsDefaultPage();
    defualtPage.pageUid = results.pageUid;
    defualtPage.pageName = results.pageName;
    defualtPage.pageCode = results.pageCode;
  } catch (err) {
    util.axiosErrorCatch<GetClientsDefaultPageRes>(err);
  } finally {
    Spinner.close();
  }
};

Spinner.delay(0).show('Loading…');
getData();

onUnmounted(() => {
  Spinner.close();
});
</script>

<template>
  <Modal
    ref="modal"
    width="600px"
    title="기본 페이지 설정"
    :esc-close="!loading"
    v-model="isShow"
  >
    <template #body>
      <div id="defaultPage">
        <div class="textField-tooltip">
          <TextField
            block
            readonly
            label="기본 페이지"
            placeholder="기본 페이지를 설정해 주세요."
            v-model="defualtPageText"
          >
            <template #default>
              <Tooltip
                bottom
                hovering
                message="설정 값 삭제"
                @click="onClear"
                v-if="defualtPageText"
              >
                <SvgIcon
                  type="mdi"
                  :size="20"
                  :path="mdiCloseCircle"
                />
              </Tooltip>
            </template>

          </TextField>
        </div>

        <ul class="info-box-bullet mt-5 mb-20">
          <li>기본 페이지는 ‘루트 도메인(example.com)’으로 접속할 때 출력되는 페이지를 말합니다.</li>
          <li>기본 페이지 변경 내역은 [설정] 버튼 클릭 시에만 적용됩니다.</li>
        </ul>

        <TextField
          block
          label="페이지 검색"
          placeholder="페이지명, 페이지 코드를 입력해 주세요."
          :icon="mdiMagnify"
          :max-length="50"
          :icon-action="onSearch"
          @keypress.enter="onSearch"
          v-model="searchText"
        />

        <ListTable
          ref="listTable"
          class="border mt-20"
          :height="`calc(100vh - 650px)`"
          :header="tableHeader"
          :items="list"
          :loading="dataLoading"
          :observer="observer"
          @observe="onSearch(false)"
        >
          <template #items="{ props, index }: ListTableItemSlot<PageItem>">
            <tr
              :class="{ 'text-point selected' : defualtPage.pageCode === props.pageCode }"
              @click="pageSelect(index)"
            >
              <td>{{ props.pageName }}</td>
              <td>{{ props.pageCode }}</td>
              <td>
                <template v-if="defualtPage.pageCode === props.pageCode">
                  <SvgIcon
                    class="text-point"
                    type="mdi"
                    :path="mdiCheckCircleOutline"
                  />
                </template>
              </td>
            </tr>
          </template>

          <template #empty>
            <div class="flex-center-center">
              <SvgIcon
                class="text-gray-400 mr-5"
                type="mdi"
                :size="15"
                :path="mdiAlertCircle"
              />
              <template v-if="searched">
                데이터가 존재하지 않습니다.
              </template>
              <template v-else>
                검색어를 입력 후 검색을 진행해 주세요.
              </template>
            </div>
          </template>

        </ListTable>
      </div>

    </template>

    <template #action="{ close }">
      <StyledButton
        outline
        class="mr-10"
        :disabled="loading"
        @click.prevent="close"
      >
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        :disabled="isDisabled"
        :loading="loading"
        @click.prevent="onClickEvnt"
      >
        설정
      </StyledButton>
    </template>
  </Modal>
</template>
