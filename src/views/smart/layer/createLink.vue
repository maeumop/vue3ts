<script setup lang="ts">
import Preview from '@/views/common/preview.vue';

import { reactive, ref, watch, computed, inject } from 'vue';
import { useUtil } from '@/js/util';
import { mdiAlertCircle } from '@/assets/svg/path';
import { v1 as uuid } from 'uuid';
import { useSessionStore } from '@/store';

import { previewType } from '@/constants/common';

import { useMyAppApi } from '@/api/modules/myAppApi';
import type { GetDomainsRes } from '@/types/api/myAppApi';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type {
  GetPageLinksItem, GetPageLinksParam, GetPageLinksRes,
  PostPageLinksParam, PostPageLinksRes,
  DeletePageLinksRes,
} from '@/types/api/smartEditorApi';

import { useMediaUtmCodeApi } from '@/api/modules/mediaUtmCodeApi';
import type {
  GetMediasRes, GetCodesRes,
  GetUtmsRes, GetUtmValuesRes
} from '@/types/api/mediaUtmCodeApi';

import type { ModalModel } from '@/components/Modal/types';
import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { OptionItem, Rules, KeyIndex } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ToastModel } from '@/components/Toast/types';
import type { SpinnerModel } from '@/components/Spinner/types';

const util = useUtil();
const sessionStore = useSessionStore();
const myAppApi = useMyAppApi();
const smartEditorApi = useSmartEditorApi();
const mediaUtmCodeApi = useMediaUtmCodeApi()
;
const Toast = inject('Toast') as ToastModel;
const Spinner = inject('Spinner') as SpinnerModel;

const clientId = computed(() => sessionStore.getClientId);

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const props = defineProps<{
  pageCode: string
  pageUid: string
  pageUsing: number
  pagePath: string
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

// 미리보기 팝업
let isShowPreview = ref<boolean>(false);

const tableHeader = ref<ListTableHeader[]>([
  { text: '링크명', width: '170' },
  { text: '링크', },
  { text: '관리', width: '170' },
]);

// ListTable
let list = ref<GetPageLinksItem[]>([]);
let dataLoading = ref<boolean>(true);
let observer = ref<boolean>(true);
let cursor = ref<number>(0);
const limit = 50;
let totalCount: number = 0;

let linkName = ref<string>('');
let mainDomain = ref<string>('');

const validateForm = ref<ValidateFormModel>();

const rules: Rules = {
  input: [v => !!v || '필수 입력 사항 입니다.'],
  select: [v => !!v || '필수 선택 사항 입니다.'],
};

const selectLoading = reactive<KeyIndex<boolean>>({
  media: true,
  mediaCode: true,
  utm_source: true,
  utm_medium: true,
  utm_campaign: true,
  utm_term: true,
  utm_content: true,
});


/**
 * 링크 등록 이후 입력값 초기화
 */
const init = () => {
  linkName.value = '';
  selectedMedia.value = '';
  selectedMediaCode.value = '';
  Object.keys(selectedUtm).forEach(key => (selectedUtm[key] = ''));
};

let loading = ref<boolean>(false);
/**
 * 링크 생성 이벤트
 * @param link 링크
 */
const onCreate = async (link: string): Promise<void> => {
  try {
    loading.value = true;
    const param: PostPageLinksParam = {
      pageLinkUid: uuid(),
      linkName: linkName.value,
      link: link,
    };
    await smartEditorApi.postPageLinks(props.pageUid, param);
    const newdData = {
      ...param,
      regDatetime: Date.now()
    };
    Toast('정상적으로 생성되었습니다.');
    list.value.splice(1, 0, { ...newdData });
    init();

  } catch (err) {
    util.axiosErrorCatch<PostPageLinksRes>(err);

  } finally {
    loading.value = false;
  }
};

/**
 * 링크 생성시 중복 확인
 */
const onClickEvnt = (): void => {
  if (!validateForm.value!.validate()) {
    return;
  }

  let utmParams = '';
  Object.entries(selectedUtm).forEach(item => {
    utmParams += item[1] ? `&${item[0]}=${item[1]}` : '';
  });
  utmParams = utmParams ? `${utmParams}` : '';

  const newLink = `${baseUrl.value}?mediaCode=${selectedMediaCode.value}${utmParams}`;

  let isDuplicate =  list.value.some(item => item.link === newLink);
  if (!isDuplicate) {
    onCreate(newLink);
  } else {
    Toast({ color: 'warning', message: '동일한 링크가 존재합니다.' });
  }
};

/**
 * 링크 새창열기
 * @param index 선택된 링크의 index
 */
const linkOpen = (index: number): void => {
  window.open(list.value[index].link);
};

/**
 * 링크 복사
 * @param index 선택된 링크의 index
 */
const onCopyLink = (index: number): void => {
  navigator.clipboard.writeText(list.value[index].link);
  Toast('링크가 복사 되었습니다. Ctrl + V 로 붙여 넣기 하세요.');
};

let btnLoadingidx = ref<number>(-1);
/**
 * 링크 삭제
 * @param index 선택된 링크의 index
 */
const onDeleteLink = async (index: number): Promise<void> => {
  btnLoadingidx.value = index;
  const pageLinksUid = list.value[index].pageLinkUid;
  try {
    await smartEditorApi.deletePageLinks(props.pageUid, pageLinksUid);
    Toast('정상적으로 삭제되었습니다.');
    list.value.splice(index, 1);
    init();

  } catch (err) {
    util.axiosErrorCatch<DeletePageLinksRes>(err);
  } finally {
    btnLoadingidx.value = -1;
  }
};

// ============== 매체 목록, 매체 코드목록 ======================================
let selectedMedia = ref<string>('');
let selectedMediaCode = ref<string>('');
const optMedia = ref<OptionItem[]>([]);

/**
 * 매체값 변경될때 매체 코드 조회 API호출
 */
watch(selectedMedia, () => {
  if (selectedMedia.value) {
    optMediaCode.value = [];
    selectedMediaCode.value = '';
    getCodeMedias();
  }
});

validateForm.value?.formProtection(true);

/**
 * 매체 코드 목록 API 조회
 */
const getCodeMedias = async (): Promise<void> => {
  try {
    selectLoading.mediaCode = true;
    const { results }: GetCodesRes = await mediaUtmCodeApi.getCodes(selectedMedia.value);
    results.mediaCodes.forEach(item => {
      optMediaCode.value.push({ text: item.mediaCode, value: item.mediaCode });
    });

  } catch (err) {
    util.axiosErrorCatch<GetCodesRes>(err);
  }

  selectLoading.mediaCode = false;
};

/**
 * 매체 목록 조회 API 호출
 */
const getMedias = async (): Promise<void> => {
  try {
    selectLoading.media = true;
    const { results }: GetMediasRes = await mediaUtmCodeApi.getMedias();
    results.medias.forEach(item => {
      optMedia.value.push({ text: item.media, value: item.mediaUid });
    });

  } catch (err) {
    util.axiosErrorCatch<GetMediasRes>(err);

  } finally {
    validateForm.value?.formProtection(false);
    selectLoading.media = false;
  }
};
// ============== END - 매체 목록, 매체 코드목록 ======================================


// ============== UTM 파라미터 목록 ======================================
const optMediaCode = ref<OptionItem[]>([]);
const optUtm = reactive<KeyIndex<OptionItem[]>>({
  utm_source: [],
  utm_medium: [],
  utm_campaign: [],
  utm_term: [],
  utm_content: [],
});
const selectedUtm = reactive<KeyIndex<string>>({});

const getUtmCode = async (utmParam: string, utmParamUid: string): Promise<void> => {
  try {
    const { results }: GetUtmValuesRes = await mediaUtmCodeApi.getUtmValues(utmParamUid);
    results.utmParamValues.forEach(item => {
      optUtm[utmParam].push({ text: item.utmParamValue, value: item.utmParamValue });
    });

  } catch (err) {
    util.axiosErrorCatch<GetUtmValuesRes>(err);
  }
};

/**
 * utm 파라미터 목록 조회 API 호출
 */
const getUtm = async (): Promise<void> => {
  try {
    const { results }: GetUtmsRes = await mediaUtmCodeApi.getUtms();
    results.utmParams.forEach(item => {
      getUtmCode(item.utmParam, item.utmParamUid);
      optUtm[item.utmParam] = [];
      selectedUtm[item.utmParam] = '';
      selectLoading[item.utmParam] = false;
    });

  } catch (err) {
    util.axiosErrorCatch<GetUtmsRes>(err);
  }
};
// ============== END - UTM 파라미터 목록 ======================================


// ============== 도메인 목록 ======================================
let selectDomain = ref<string>('');
let optDomain = ref<OptionItem[]>([]);
let domainLoading = ref<boolean>(true);
const getDomain = async (): Promise<void> => {
  try {
    domainLoading.value = true;
    const { results }: GetDomainsRes = await myAppApi.getDomains(clientId.value, 1);

    results.forEach(item => {
      if (item.isConnect) {
        optDomain.value.push(({ text: item.domain, value: item.domain }));
        if (item.isMain) {
          mainDomain.value = item.domain;
          selectDomain.value = item.domain;
        }
      }
    });
    getData();

  } catch (err) {
    util.axiosErrorCatch<GetDomainsRes>(err);

  } finally {
    domainLoading.value = false;
  }
};
// ============== END - 도메인 목록 ======================================


const pagePath = props.pagePath ?? `pages/${props.pageCode}`;
let baseUrl = computed((): string => `https://${selectDomain.value}/${pagePath}`);

/**
 * 링크 목록 조회 API 호출
 */
const getData = async (): Promise<void> => {
  try {
    dataLoading.value = true;
    const param: GetPageLinksParam = { limit };
    if (cursor.value) {
      param.cursor = cursor.value;
    }
    const { results }: GetPageLinksRes = await smartEditorApi.getPageLinks(props.pageUid, param);
    results.pageLinks.forEach(item => (list.value.push(item)));

    if (!cursor.value) {
      list.value.unshift({
        linkName: '기본 링크',
        link: `${baseUrl.value}?mediaCode=site`,
        pageLinkUid: uuid(),
        regDatetime: 0,
      });
    }

    observer.value = !(totalCount <= list.value.length);
    if (observer.value) {
      cursor.value = list.value[list.value.length - 1].regDatetime;
    }


  } catch (err) {
    util.axiosErrorCatch<GetPageLinksRes>(err);

  } finally {
    dataLoading.value = false;
  }
};

getDomain();
getMedias();
getUtm();
</script>

<template>
  <Modal
    ref="modal"
    title="링크 설정"
    width="1200px"
    :esc-close="!loading"
    v-model="isShow"
  >
    <template #body>
      <div id="createLink" class="flex gap-20">
        <ValidateForm ref="validateForm">
          <div class="set-box">
            <div class="flex-center-between">
              <div class="font-lg">
                설정
              </div>

              <StyledButton
                x-small
                color="primary"
                :loading="loading"
                @click.prevent="onClickEvnt"
              >
                생성
              </StyledButton>
            </div>

            <TextField
              block
              required
              label="링크명"
              placeholder="링크명을 입력해주세요."
              class="mt-20"
              :max-length="50"
              :validate="rules.input"
              v-model="linkName"
            />

            <SelectBox
              block
              required
              searchable
              label="도메인"
              placeholder="선택"
              class="mt-20"
              :options="optDomain"
              :is-loading="domainLoading"
              :validate="rules.select"
              v-model="selectDomain"
            />

            <SelectBox
              block
              required
              searchable
              label="매체"
              placeholder="선택"
              class="mt-20"
              :options="optMedia"
              :validate="rules.select"
              :is-loading="selectLoading.media"
              v-model="selectedMedia"
            />

            <SelectBox
              block
              required
              searchable
              label="매체코드"
              placeholder="선택"
              class="mt-20"
              :options="optMediaCode"
              :readonly="selectedMedia === ''"
              :is-loading="selectLoading.mediaCode"
              :validate="rules.select"
              v-model="selectedMediaCode"
            />

            <SelectBox
              block
              searchable
              :key="key"
              placeholder="선택"
              class="mt-20"
              :label="`${key}`"
              :options="optUtm[key]"
              :is-loading="selectLoading[key]"
              v-model="selectedUtm[key]"
              v-for="(item, key) in optUtm"
            />
          </div>
        </ValidateForm>

        <div class="list-box">
          <div class="info-blue-box mb-5" v-if="!pageUsing">
            <div class="flex-center-center">
              <SvgIcon
                class="text-gray-400 mr-5"
                type="mdi"
                size="15"
                :path="mdiAlertCircle"
              /> OFF 상태의 페이지의 경우 미리보기를 통해 확인할 수 있습니다.
              <StyledButton
                x-small
                color="primary"
                class="ml-10"
                @click.prevent="[Spinner.delay(0).show('Loading…'),isShowPreview = true]"
              >
                미리보기
              </StyledButton>
            </div>
          </div>

          <ListTable
            class="border"
            :height="!pageUsing ? `721px` : `774px`"
            :header="tableHeader"
            :items="list"
            :loading="dataLoading"
            :observer="observer"
            @observe="getData"
          >
            <template #items="{ props, index }: ListTableItemSlot<GetPageLinksItem>">
              <tr>
                <td>{{ props.linkName }}</td>
                <td class="link">{{ props.link }}</td>
                <td>
                  <div class="flex-center gap-4">
                    <StyledButton
                      outline
                      x-small
                      color="secondary"
                      @click.prevent="linkOpen(index)"
                      v-if="pageUsing"
                    >
                      보기
                    </StyledButton>

                    <StyledButton
                      outline
                      x-small
                      color="secondary"
                      @click.prevent="onCopyLink(index)"
                    >
                      복사
                    </StyledButton>

                    <StyledButton
                      outline
                      x-small
                      color="secondary"
                      :loading="btnLoadingidx === index"
                      @click.prevent="onDeleteLink(index)"
                      v-if="index > 0"
                    >
                      삭제
                    </StyledButton>
                  </div>
                </td>
              </tr>
            </template>

          </ListTable>
        </div>
      </div>

      <Preview
        :unique-key="props.pageCode"
        :type="previewType.pages"
        @close="isShowPreview = false"
        @iframe-loaded="Spinner.close()"
        v-if="isShowPreview"
      />

    </template>

    <template #action="{ close }">
      <StyledButton outline @click.prevent="close">
        닫기
      </StyledButton>
    </template>
  </Modal>
</template>
