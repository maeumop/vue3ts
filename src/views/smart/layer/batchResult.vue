<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { booleanYN } from '@/constants/common';
import { mdiCheckboxBlankCircle, mdiHelpCircleOutline } from '@/assets/svg/path';
import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type { PutPageConfigsParam, PutPageConfigsRes } from '@/types/api/smartEditorApi';
import type { PageItem } from '@/types/api/smartEditorApi';
import type { ModalModel } from '@/components/Modal/types';
import type { ListTableItemSlot } from '@/components/ListTable/types';
import type { KeyIndex } from '@/components/types';
import { putPageConfigsMsg } from '@/constants/api/smartEditorApi';
import type { BatchItem } from '@/types/smart';

const smartEditorApi = useSmartEditorApi();

const props = defineProps<{
  setData: KeyIndex<string | number>
  pageList: PageItem[]
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'set:success', value: string[]): void;
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

const isDisabled = computed(()=> !(progressRate.value === 100));

let totalCount = ref<number>(0);
let waitingCount = ref<number>(0);
let successCount = ref<number>(0);
let failCount = ref<number>(0);

const progressRate = computed(() => {
  return Math.floor(((successCount.value + failCount.value) / totalCount.value) * 100) || 0;
});

let list = ref<BatchItem[]>([]);

const successList: string[] = [];

/**
 * 일괄 변경 처리 후 팝업 닫기
 */
const onClickclose = (): void => {
  emit('set:success', successList);
  modal.value!.close();
};

/**
 * list batchSetReult 값 추가
 */
list.value = props.pageList.map(item => ({ ...item, batchSetReult: null }));
totalCount.value = props.pageList.length;
waitingCount.value = props.pageList.length;

const setPageCondfig = async (uid: string, param: PutPageConfigsParam, callback: Function): Promise<void> => {
  try {
    await smartEditorApi.putPageConfigs(uid, { ...param })
      .then((res: PutPageConfigsRes) => {
        callback(res.code === putPageConfigsMsg.SMART_PAGE_CONFIG_UPDATE_SUCCESS);
      });

  } catch (err) {
    callback(false);
    console.log(err);
  }
};

/**
 * 설정 일괄 변경 foreach
 */
const pageBatch = async (): Promise<void> => {
  list.value.forEach(item => {
    const _propsData = { ...props.setData };
    delete _propsData.layoutName;
    delete _propsData.scriptName;

    const param: PutPageConfigsParam = {
      layoutUid: item.layoutUid!,
      isUseMobilePage: item.isUseMobilePage,
      isUseBackPage: item.isUseBackPage,
      isUseScript: item.isUseScript,
      pageName: item.pageName,
      isOn: item.isOn,
      pageCode: item.pageCode!,
      ..._propsData
    };
    setPageCondfig(item.pageUid!, param, (result: boolean): void => {
      waitingCount.value--;

      if (result) {
        successCount.value++;
        successList.push(item.pageUid!);
      } else {
        failCount.value++;
      }
      item.batchSetReult = result ? booleanYN.Y : booleanYN.N;
    });
  });
};
pageBatch();
</script>

<template>
  <Modal
    hide-close
    ref="modal"
    width="800px"
    title="일괄 변경 결과"
    v-model="isShow"
  >
    <template #body>

      <div id="uploadResult">
        <div class="flex-center height-36">
          <span class="width-150 ">변경 결과</span>
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
          변경 중 프로세스 종료시(화면 이동, 새로고침) 변경이 원활하게 이루어지지 않을 수 있습니다. 변경 처리가 완료될 때까지 잠시 기다려주세요.
        </li>
      </ul>

      <div class="font-lg mb-10">
        변경 목록
      </div>

      <ListTable
        ref="listTable"
        class="border"
        :height="`calc(95vh - 165px  - 330px)`"
        :items="list"
      >
        <template #header>
          <tr>
            <th width="120">
              <Tooltip right btn-close>
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
                      <li>성공: 정상적으로 변경 완료된 상태</li>
                      <li>
                        실패:
                        <ul>
                          <li>현재 페이지와 동일한 페이지로 모바일, 백 페이지 설정 시</li>
                          <li>사용 여부 OFF 상태의 페이지를 모바일로 설정 시</li>
                          <li>사용 여부 OFF 상태의 페이지를 백페이지로 설정 시</li>
                        </ul>
                      </li>
                      <li>대기: 변경 프로세스가 진행되지 않은 상태</li>
                    </ul>
                  </div>
                </template>
              </Tooltip>
            </th>
            <th width="100">사용여부</th>
            <th>페이지명</th>
            <th width="180">코드</th>
          </tr>
        </template>

        <template #items="{ props }: ListTableItemSlot<BatchItem>">
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
                    {'text-dark': props.batchSetReult === null},
                    {'text-red': props.batchSetReult === 0},
                    {'text-green': props.batchSetReult},
                  ]"
                />
                <template v-if="props.batchSetReult === null">대기</template>
                <template v-else-if="props.batchSetReult === 1">성공</template>
                <template v-else>실패</template>
              </div>
            </td>
            <td>{{ props.isOn ? 'ON' : 'OFF' }}</td>
            <td>{{ props.pageName }}</td>
            <td>{{ props.pageCode }}</td>
          </tr>
        </template>
      </ListTable>
    </template>

    <template #action>
      <StyledButton
        color="primary"
        :disabled="isDisabled"
        @click.prevent="onClickclose"
      >
        확인
      </StyledButton>
    </template>
  </Modal>
</template>
