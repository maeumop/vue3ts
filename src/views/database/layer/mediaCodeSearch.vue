<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import { useUtil } from '@/js/util';
import { mdiMagnify, mdiAlertCircle } from '@/assets/svg/path';

import { useMediaUtmCodeApi } from '@/api/modules/mediaUtmCodeApi';
import type { GetMediasRes, GetCodesRes, GetCodesParam } from '@/types/api/mediaUtmCodeApi';

import type { CodesSearchItem } from '@/types/db';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { KeyIndex, Options } from '@/types/common';
import type { ModalModel } from '@/components/Modal/types';

const util = useUtil();
const mediaUtmCodeApi = useMediaUtmCodeApi();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'selectMediaCode', value: CodesSearchItem): void;
}>();

// 팝업 기본 설정 ====================
const modal = ref<ModalModel>();
let isShow = ref<boolean>(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

// ListTable
const tableHeader: ListTableHeader[] = [
  { text: '매체명' },
  { text: '매체 코드명' },
];

let searched = ref<boolean>(false);

const selectMediaCode = (idx: number): void => {
  modal.value!.close();
  emit('selectMediaCode', { ...searchedList.value[idx] });
};

const mediaNames = reactive<KeyIndex<string>>({});

let selectedMedia = ref<string>('');
let optMedia = ref<Options[]>([]);
let mediaSrc = ref<string>('');
let searchedList = ref<CodesSearchItem[]>([]);
let dataLoading = ref<boolean>(false);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;
let totalCount: number = 0;

const onSearch = () => {
  cursor.value = 0;
  searchedList.value = [];
  getMediaCodeData();
};

const getMediaCodeData = async (): Promise<void> => {
  if (loading.value) {
    return;
  }

  try {
    dataLoading.value = true;

    const _selectedMedia = selectedMedia.value || 'ALL';
    const params: GetCodesParam  = {
      limit,
      search: encodeURIComponent(`word=${mediaSrc.value}`),
    };
    if (cursor.value) {
      params.cursor = cursor.value.toString();
    }

    const { results }: GetCodesRes = await mediaUtmCodeApi.getCodes(_selectedMedia, params);
    results.mediaCodes.forEach(item => {
      searchedList.value.push({ ...item, media: mediaNames[item.mediaUid] });
    });

    totalCount = results.totalCount;
    observer.value = !(totalCount <= searchedList.value.length);
    if (observer.value) {
      cursor.value = searchedList.value[searchedList.value.length - 1].regDatetime!;
    }

  } catch (err) {
    util.axiosErrorCatch<GetCodesRes>(err);

  } finally {
    dataLoading.value = false;
    searched.value = true;
  }
};

let loading = ref<boolean>(true);
const getData = async (): Promise<void> => {
  try {
    loading.value = true;
    const { results }: GetMediasRes = await mediaUtmCodeApi.getMedias();
    results.medias.forEach(item => {
      optMedia.value.push({ text: item.media, value: item.mediaUid });
      mediaNames[item.mediaUid] = item.media;
    });

  } catch (err) {
    util.axiosErrorCatch<GetMediasRes>(err);

  } finally {
    optMedia.value.unshift({ text: '전체', value: '' });
    loading.value = false;
  }
};

getData();
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    title="매체코드 검색"
    width="520px"
    v-model="isShow"
  >
    <template #body>
      <div class="flex gap-6">
        <SelectBox
          block
          in-label
          searchable
          clearable
          placeholder="전체"
          label="매체"
          class="col-2"
          :options="optMedia"
          :is-loading="!optMedia.length"
          v-model="selectedMedia"
        />
        <TextField
          block
          placeholder="매체 코드명을 입력해주세요."
          :icon="mdiMagnify"
          :max-length="50"
          :icon-action="onSearch"
          @keydown.enter="onSearch"
          v-model="mediaSrc"
        />
      </div>

      <ListTable
        class="border mt-20"
        :height="400"
        :header="tableHeader"
        :items="searchedList"
        :loading="dataLoading"
        :observer="observer"
        @observe="getMediaCodeData"
      >
        <template #items="{ props, index }: ListTableItemSlot<CodesSearchItem>">
          <tr
            :key="`list-${props.mediaCodeUid}`"
            @click.prevent="selectMediaCode(index)"
          >
            <td>{{ props.media }}</td>
            <td>{{ props.mediaCode }}</td>
          </tr>
        </template>

        <template #empty>
          <div class="flex-center-center">
            <SvgIcon
              class="text-gray-400 mr-5"
              type="mdi"
              size="15"
              :path="mdiAlertCircle"
            />
            <template v-if="searched">
              데이터가 존재하지 않습니다.
            </template>
            <template v-else>
              매체 코드명을 입력 후 검색을 진행해 주세요.
            </template>
          </div>
        </template>
      </ListTable>
    </template>

    <template #action="{ close }">
      <StyledButton outline @click="close">
        취소
      </StyledButton>
    </template>
  </Modal>
</template>
