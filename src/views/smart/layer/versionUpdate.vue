<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useUtil } from '@/js/util';
import { booleanYN } from '@/constants/common';
import { mdiCheckboxBlankCircle, mdiHelpCircleOutline } from '@/assets/svg/path';
import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import type { GetUpdateAblePagesRes, PutPagesUpdateRes } from '@/types/api/smartEditorApi';
import type { ModalModel } from '@/components/Modal/types';
import type { ListTableItemSlot, } from '@/components/ListTable/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { KeyIndex } from '@/components/types';
import { putPagesUpdateMsg } from '@/constants/api/smartEditorApi';
import type { VersionUpdateItem } from '@/types/smart';

const util = useUtil();
const smartEditorApi = useSmartEditorApi();

const validateForm = ref<ValidateFormModel>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'on:update', value: KeyIndex<number>): void;
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

let totalCount = ref<number>(0);
let waitingCount = ref<number>(0);
let successCount = ref<number>(0);
let failCount = ref<number>(0);

const progressRate = computed(() => {
  return Math.floor(((successCount.value + failCount.value) / totalCount.value) * 100) || 0;
});

let updatePageResult: KeyIndex<number> = {};
let list = ref<VersionUpdateItem[]>([]);
let dataLoading = ref<boolean>(false);
let btnLoading = ref<boolean>(false);
let isDisabled = ref<boolean>(false);

/**
 * 버전 업데이트 여부 확인 후 팝업 닫기 처리
 */
const close = (): void => {
  if (progressRate.value === 100) {
    emit('on:update', updatePageResult);
  }
  modal.value!.close();
};

/**
 * 업데이트 결과 처리
 * @param result
 * @param item VersionUpdateItem
 */
const progress = (result: boolean, item?: VersionUpdateItem): void => {
  waitingCount.value--;

  result ? successCount.value++ : failCount.value++;

  if (item) {
    updatePageResult[item.pageUid] = result ? booleanYN.Y : booleanYN.N;
    item.result = result ? booleanYN.Y : booleanYN.N;
  }

  if (!waitingCount.value) {
    btnLoading.value = false;
    isDisabled.value = true;
  }
};

/**
 * 페이지 버전 업데이트
 * @param uid pageUid
 * @param pageCode
 * @param callback
 */
const onUpdate = async (item: VersionUpdateItem): Promise<void> => {
  const { pageUid, pageCode } = item;
  const { SMART_PAGE_VERSION_UPDATE_SUCCESS: success } = putPagesUpdateMsg;

  try {
    await smartEditorApi.putPagesUpdate(pageUid, { pageCode })
      .then((res: PutPagesUpdateRes) => progress(res.code === success, item));

  } catch (err) {
    item.result = 2;
    progress(false);
  }
};

/**
 * 페이지 버전 업데이트 forEach
 */
const onClickUpdate = () => {
  btnLoading.value = true;

  list.value.forEach(item => {
    onUpdate(item);
  });
};

validateForm.value?.formProtection(true);
/**
 * 버전 업데이트 목록 조회 API 호출
 */
const getData = async (): Promise<void> => {
  dataLoading.value = true;

  try {
    const { results }: GetUpdateAblePagesRes = await smartEditorApi.getUpdateAblePages();

    results.pages.forEach(item => {
      list.value.push({ ...item, result: null });
      updatePageResult[item.pageUid] = booleanYN.N;
    });
    totalCount.value = results.totalCount;
    waitingCount.value = results.totalCount;

  } catch (err) {
    util.axiosErrorCatch<GetUpdateAblePagesRes>(err);

  } finally {
    validateForm.value?.formProtection(false);
    dataLoading.value = false;
  }
};

getData();
</script>

<template>
  <Modal
    hide-close
    ref="modal"
    width="800px"
    title="페이지 버전 업데이트"
    v-model="isShow"
  >
    <template #body>

      <ValidateForm ref="validateForm">
        <div id="uploadResult">

          <div class="flex-center height-36">
            <span class="width-150 ">업데이트 결과</span>
            <div class="resultBox">
              <div>
                <SvgIcon
                  type="mdi"
                  class="text-dark"
                  :path="mdiCheckboxBlankCircle"
                  :size="14"
                />
                대기 <span class="text-dark">{{ waitingCount }}</span>건 /
              </div>
              <div>
                <SvgIcon
                  type="mdi"
                  class="text-green"
                  :path="mdiCheckboxBlankCircle"
                  :size="14"
                />
                성공 <span class="text-green">{{ successCount }}</span>건 /
              </div>
              <div>
                <SvgIcon
                  type="mdi"
                  class="text-red"
                  :path="mdiCheckboxBlankCircle"
                  :size="14"
                />
                실패 <span class="text-red">{{ failCount }}</span>건
              </div>
            </div>
          </div>

          <div class="progressbar">
            <div :class="`width-p-${progressRate}`">
              {{ progressRate }}%
            </div>
          </div>
        </div>

        <ul class="info-box-bullet my-20">
          <li>
            업데이트 진행 중 프로세스 종료시(화면 이동, 새로고침)
            업데이트가 원활하게 이루어지지 않을 수 있습니다.
            업데이트 처리가 완료될 때까지 잠시 기다려주세요.
          </li>
        </ul>

        <div class="font-lg mb-10">
          업데이트 목록
        </div>

        <ListTable
          ref="listTable"
          header-th-length="3"
          class="border"
          :height="`calc(95vh - 165px  - 330px)`"
          :items="list"
          :loading="dataLoading"
        >
          <template #header>
            <tr>
              <th width="150">
                <Tooltip bottom btn-close>
                  <template #default="{ toggle }">
                    <div class="flex-center" @click="toggle">
                      결과
                      <SvgIcon
                        class="ml-5"
                        type="mdi"
                        size="15"
                        :path="mdiHelpCircleOutline"
                      />
                    </div>
                  </template>

                  <template #content>
                    <div class="tooltip-popup">
                      <ul>
                        <li>성공: 정상적으로 업데이트가 완료된 상태</li>
                        <li>
                          실패: 페이지의 버전 상태 값 ‘최신 버전’ 이거나 또는<br />
                          사용여부 설정값이 ‘OFF’ 상태로 정상적으로 업데이트가 되지 않은 상태
                        </li>
                        <li>대기: 업데이트 프로세스가 진행되지 않은 상태</li>
                      </ul>
                    </div>
                  </template>
                </Tooltip>

              </th>
              <th>페이지명</th>
              <th width="250">코드</th>
            </tr>
          </template>

          <template #items="{ props }: ListTableItemSlot<VersionUpdateItem>">
            <tr :key="`list-${props.pageUid}`">
              <td>
                <div class="flex-center gap-x-2">
                  <SvgIcon
                    type="mdi"
                    :path="mdiCheckboxBlankCircle"
                    :size="14"
                    :class="[
                      'mr-1',
                      'font-sm',
                      {'text-dark' : props.result === null},
                      {'text-red' : props.result === 0 || props.result === 2 },
                      {'text-green' : props.result === 1}
                    ]"
                  />
                  <template v-if="props.result === null">대기</template>
                  <template v-else-if="props.result === 1">성공</template>
                  <template v-else>실패</template>
                </div>
              </td>
              <td>{{ props.pageName }}</td>
              <td>{{ props.pageCode }}</td>
            </tr>
          </template>
        </ListTable>
      </ValidateForm>
    </template>

    <template #action>
      <StyledButton
        outline
        class="mr-10"
        :disabled="btnLoading && progressRate !== 100"
        @click.prevent="close"
      >
        닫기
      </StyledButton>
      <StyledButton
        color="primary"
        :loading="btnLoading"
        :disabled="isDisabled"
        @click.prevent="onClickUpdate"
      >
        업데이트
      </StyledButton>
    </template>
  </Modal>
</template>
