<script setup lang="ts">
import { ref, inject, watch, onUnmounted, } from 'vue';
import { storeToRefs } from 'pinia';
import { useMediaStore, } from '@/store';
import { useUtil } from '@/js/util';
import { useMediaUtmCodeApi } from '@/api/modules/mediaUtmCodeApi';
import { v1 as uuid } from 'uuid';
import FtpLayerSelectImages from '@/views/common/ftp/layer/SelectImages/index.vue';
import FTPImage from '@/views/common/ftp/image/index.vue';
import ImageViewer from '@/views/common/ftp/layer/ImageViewer/index.vue';
import MediaResits from '@/views/ad/layer/mediaBatchResist.vue';
import MediaResitsResult from '@/views/ad/layer/mediaBatchResult.vue';
import { getMediasMsg, getCodesMsg, getCodesCountMsg, postCodesMsg, putCodesMsg, deleteCodesMsg, } from '@/constants/api/mediaUtmCodeApi';
import { booleanYN } from '@/constants/common';
import type { MessageBoxModel, } from '@/components/MessageBox/types';
import type { ToastModel } from '@/components/Toast/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { KeyIndex } from '@/types/common';
import type { GetMediasRes, GetCodesSearchItem, GetCodesRes, PostCodesRes, PutCodesRes, DeleteCodesRes, } from '@/types/api/mediaUtmCodeApi';
import type { ContentItem } from '@/types/store/modules/ftp';
import axios from 'axios';
import { mdiClose, mdiInformationBoxOutline, mdiPlus,
         mdiAlertCircle, mdiMagnify, mdiGoogleCirclesExtended } from '@/assets/svg/path';

const mediaStore = useMediaStore();

const {
  updateMediaList,
  resetMediaList,
  getMediaName,
  plusTotal,
  minusTotal,
} = mediaStore;

const {
  mediaList,
  mediaTotalCount,
} = storeToRefs(mediaStore);

const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;

const mediaUtmCodeApi = useMediaUtmCodeApi();
const util = useUtil();

// ======================== form validation ========================
const form = ref<ValidateFormModel>();

const patterns: KeyIndex<[RegExp, string]> = {
  code: [util.getRegExp('code'), '영문, 숫자, 하이픈(-), 언더바(_)만 입력 가능합니다.']
};

let isPass = ref<boolean>(false);
let errorMsg = ref<string>('');
/**
 * 매체코드 중복 체크
 */
const checkMediaCode = async (): Promise<void> => {
  errorMsg.value = '';
  isPass.value = false;

  if (util.getRegExp('code').test(newMediaCode.value)) {
    const { code, results } = await mediaUtmCodeApi.getCodesCount({
      mediaCode: newMediaCode.value
    });

    if (code === getCodesCountMsg.MEDIA_CODE_COUNT_SUCCESS) {
      if (results.isExist ===  booleanYN.Y) {
        errorMsg.value = '이미 등록된 매체 코드명이 존재합니다.';

      } else {
        isPass.value = true;
      }
    }
  }
};

let newDesc = ref<string>('');
let isChangeValue = ref<boolean>(false);
/**
 * 수정 시 내용이 바뀌었는 지 확인
 */
watch(newDesc, (): void => {
  if (newDesc.value && newDesc.value !== mediaDesc.value) {
    isChangeValue.value = true;
  } else {
    isChangeValue.value = false;
  }
});
// ======================== END form validation ======================


// ======================== 매체, 매체코드 선택 출력 ========================
let mediaId = ref<string>('');
let mediaCodeUid = ref<string>('');
let mediaCode = ref<string>('');
let mediaName = ref<string>('');
let mediaDesc = ref<string>('');
let imageList = ref<ContentItem[]>([]);
let newMediaCode = ref<string>('');

let timer: number = 0;
/**
 * 매체 선택
 * @param id 매체 id
 * @param name 매체명
 * @param count 선택된 매체의 매체코드 총 갯수
 */
const setMedia = (id: string, name: string, count?: number): void => {
  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    timer = 0;
    mediaCodeList.value = [];

    resetSelect();

    mediaId.value = id;
    mediaName.value = name;

    // 선택된 매체의 매체코드 총 갯수 설정
    if (mediaId.value) {
      currentCodeCount.value = count ?? 0;

    } else {
      currentCodeCount.value = mediaTotalCount.value;
    }

    getCodes();
  }, 200);
};

const resetSelect = (): void => {
  mediaCode.value = '';
  searchItem.value = '';
  newDesc.value = '';
  newMediaCode.value = '';
  imageList.value = [];
  mediaCodeUid.value = '';
  errorMsg.value = '';
  isPass.value = false;
  isChangeValue.value = false;
};

/**
 * 매체코드 선택
 * @param idx 선택한 매체코드 index
 */
const setMediaCode = (idx: number): void => {
  if (mediaCodeUid.value === mediaCodeList.value[idx].mediaCodeUid) {
    resetSelect();
    return;
  }

  isChangeValue.value = false;
  imageList.value = [];
  mediaName.value = getMediaName(mediaList.value, mediaCodeList.value[idx].mediaUid);

  mediaList.value.forEach((media: any) => {
    if (media.mediaUid === mediaCodeList.value[idx].mediaUid) {
      mediaName.value = media.media;
    }
  });

  if (mediaCodeList.value[idx].images) {
    imageList.value = JSON.parse(mediaCodeList.value[idx].images);
  }

  mediaCode.value = mediaCodeList.value[idx].mediaCode;
  mediaDesc.value = mediaCodeList.value[idx].description;
  newDesc.value = mediaCodeList.value[idx].description;
  mediaCodeUid.value = mediaCodeList.value[idx].mediaCodeUid;
};


const mediaEndPoint = ref<HTMLDivElement>();
let isLoading = ref<boolean>(false);
/**
 * 매체 목록 불러오기
 * @param cursor 페이지네이션 커서, 로딩된 목록의 마지막 media
 */
const getMedias = async (cursor?: string): Promise<void> => {
  isLoading.value = true;

  if (!mediaCodeList.value.length) {
    isLoadingList.value = true;
  }

  try {
    const { code, results } = await mediaUtmCodeApi.getMedias({
      search: mediaId.value ? `word=${encodeURIComponent(mediaId.value)}` : '',
      cursor: cursor ?? '',
      limit: 50
    });

    if (code === getMediasMsg.MEDIA_LIST_GET_SUCCESS) {
      mediaTotalCount.value = results.totalCount;

      results.medias.map(item => {
        currentMediaCount.value += item.mediaCodeCount;
      });

      if (results.totalCount > currentMediaCount.value && mediaEndPoint.value) {
        // scroll observer
        observer_medias.observe(mediaEndPoint.value);
      }

      updateMediaList(results.medias);

      if (!mediaCodeList.value.length ||
        mediaCodeList.value.length !== mediaTotalCount.value) {
        getCodes();
      }
    }

  } catch (err) {
    util.axiosErrorCatch<GetMediasRes>(err);
  }

  isLoading.value = false;
};

const mediaCodeEndPoint = ref<HTMLDivElement>();
let mediaCodeList =  ref<GetCodesSearchItem[]>([]);
let searchItem = ref<string>('');
let isLoadingList = ref<boolean>(false);
/**
 * 매체코드 목록, 검색
 * @param cursor 페이지네이션 커서, 로딩된 목록의 마지막 regDatetime
 */
const getCodes = async (cursor?: string | number): Promise<void> => {
  if (!mediaCodeList.value.length) {
    isLoadingList.value = true;
  }

  let cursorValue = (typeof cursor === 'number' && !searchItem.value) ? cursor : '';

  try {
    const { code, results } = await mediaUtmCodeApi.getCodes(
      mediaId.value ? mediaId.value : 'ALL',
      {
        search: searchItem.value ? `word=${encodeURIComponent(searchItem.value)}` : '',
        cursor: cursorValue,
        limit: 50
      }
    );

    if (code === getCodesMsg.MEDIA_CODE_GET_SUCCESS) {
      currentCodeCount.value = results.totalCount;

      if (mediaCodeList.value.length < currentCodeCount.value) {
        if (searchItem.value || !cursorValue) {
          mediaCodeList.value = [];
        }
        // scroll observer
        if (mediaCodeEndPoint.value) {
          observer_codes.observe(mediaCodeEndPoint.value);
        }

        mediaCodeList.value.push(...results.mediaCodes);

      } else {
        mediaCodeList.value = [];
        mediaCodeList.value = results.mediaCodes;

        if (mediaCodeList.value.length >= mediaTotalCount.value) {
          observer_codes.disconnect();
        }
      }
    }

  } catch (err) {
    util.axiosErrorCatch<GetCodesRes>(err);
  }

  isLoadingList.value = false;
};
// ======================== END 매체, 매체코드 선택 출력 ======================


// ===================== 매체코드 등록/수정, 삭제 =======================
let isProcessing = ref<boolean>(false);
/**
 * 매체코드 등록
 */
const postCodes = async (): Promise<void> => {
  if (form.value?.validate()) {
    try {
      isProcessing.value = true;

      await checkMediaCode();

      if (!isPass.value) {
        return;
      }

      // uuid 생성
      let newMediaCodeUid: string = uuid();

      const { code } = await mediaUtmCodeApi.postCodes({
        mediaUid: mediaId.value,
        mediaCode: newMediaCode.value,
        mediaCodeUid: newMediaCodeUid,
        description: newDesc.value ?? '',
        images: imageList.value.length ? JSON.stringify(imageList.value) : ''
      });

      if (code === postCodesMsg.MEDIA_CODE_INSERT_SUCCESS) {
        mediaCodeList.value.unshift({
          mediaUid: mediaId.value,
          mediaCode: newMediaCode.value,
          mediaCodeUid: newMediaCodeUid,
          description: newDesc.value,
          images: JSON.stringify(imageList.value),
        });

        plusTotal(mediaId.value);

        // 입력 데이터 리셋
        imageList.value = [];
        newMediaCode.value = '';
        newDesc.value = '';
        isPass.value = false;

        Toast('정상적으로 등록되었습니다.');
      }

    } catch (err) {
      util.axiosErrorCatch<PostCodesRes>(err);

    } finally {
      isProcessing.value = false;
    }
  }
};

/**
 * 매체코드 수정
 */
const putCodes = async (): Promise<void> => {
  try {
    isProcessing.value = true;

    const { code } = await mediaUtmCodeApi.putCodes(mediaCodeUid.value, {
      description: newDesc.value ?? mediaDesc.value,
      images: JSON.stringify(imageList.value) ?? ''
    });

    if (code === putCodesMsg.MEDIA_CODE_UPDATE_SUCCESS) {
      mediaCodeList.value.forEach(item => {
        if (item.mediaCodeUid === mediaCodeUid.value) {
          item.description = newDesc.value ?? mediaDesc.value;
          item.images = JSON.stringify(imageList.value) ?? item.images;
        }
      });

      isChangeValue.value = false;
      Toast('정상적으로 수정되었습니다.');
    }

  } catch (err) {
    util.axiosErrorCatch<PutCodesRes>(err);

  } finally {
    isProcessing.value = false;
  }
};

/**
 * 매체코드 삭제
 * @param idx 매체코드 index
 * @param uid 매체코드 uid
 */
const deleteMediaCode = async (idx: number, uid: string): Promise<void> => {
  try {
    const { code } = await mediaUtmCodeApi.deleteCodes(uid);

    if (code === deleteCodesMsg.MEDIA_CODE_DELETE_SUCCESS) {
      minusTotal(mediaCodeList.value[idx].mediaUid);

      mediaCodeList.value.splice(idx, 1);
      Toast('정상적으로 삭제되었습니다.');
    }

  } catch (err) {
    if (axios.isAxiosError<DeleteCodesRes>(err)) {
      const { response } = err;

      if (response) {
        const { code } = response.data;

        if (code === deleteCodesMsg.MEDIA_CODE_USED) {
          MessageBox.destroy();
          deleteAlertMessage(idx);

        } else {
          Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });
        }
      }
    }

  } finally {
    mediaCode.value = '';
    newDesc.value = '';
    imageList.value = [];
  }
};

const deleteAlertMessage = (idx: number): void => {
  MessageBox.alert({
    title: '삭제가 불가능합니다.',
    message: `<span class="text-point">${mediaCodeList.value[idx].mediaCode}</span> 코드로 유입된 고객 DB 존재 시 삭제가 불가능하며, 고객 DB 영구 삭제 후 다시 시도해 주세요.`,
    okay: () => {
      close();
    },
  });
};

/**
 * 삭제 안내창
 * @param idx 매체코드 index
 */
const openDeleteAlert = async (idx: number): Promise<void> => {
  let uid: string = mediaCodeList.value[idx].mediaCodeUid;

  MessageBox.confirm({
    title: `${mediaCodeList.value[idx].mediaCode} 코드를 삭제하시겠습니까?`,
    message: '[삭제 처리하기] 버튼 클릭 시 해당 데이터는 삭제되며, 복구가 불가능합니다.',
    btnCancelText: '삭제 취소하기',
    btnOkayText: '삭제 처리하기',
    asyncOkay: async () => {
      await deleteMediaCode(idx, uid);
    }
  });
};
// ===================== END 매체코드 등록/수정, 삭제 =====================


// ======================= 이미지 선택 =======================
let isImageModalOpen = ref<boolean>(false);
/**
 * 이미지 선택
 * @param data ftp에서 선택한 이미지 리스트
 */
const setImage = (data: ContentItem | ContentItem[]): void => {
  if (!Array.isArray(data)) {
    data = [data];
  }

  if (!imageList.value.length) {
    imageList.value = data;

  } else {
    data.map((item: ContentItem) => imageList.value = [...imageList.value, item]);
  }

  isChangeValue.value = true;
};

/**
 * 이미지 삭제
 * @param idx 선택한 이미지의 index
 */
const deleteImage = (idx: number): void => {
  try {
    imageList.value.splice(idx, 1);
    isChangeValue.value = true;

  } catch {
    Toast({
      color: 'danger',
      message: 'Error : 고객센터에 문의를 남겨주세요.'
    });
  }
};


let isImageViewerOpen = ref<boolean>(false);
let selectedImageSrc = ref<string>('');
/**
 * 이미지 미리보기 창 열기
 * @param src 선택한 이미지 src
 */
const openImageViewer = (src: string = ''): void => {
  isImageViewerOpen.value = true;
  selectedImageSrc.value = src;
};
// ======================= END 이미지 선택 =======================


// ======================= 일괄 등록, 업로드결과 모달 =======================
let isModalOpen = ref<boolean>(false);
let isResultModalOpen = ref<boolean>(false);

let uploadData = ref<KeyIndex<string>[]>([]);
/**
 * 일괄 등록 데이터 세팅
 * @param data 엑셀 데이터
 */
const setData = (data: KeyIndex<string>[]): void => {
  uploadData.value = data;
};
// ======================= END 일괄 등록, 업로드결과 모달 =====================


// ======================= 스크롤 이벤트 =======================
const scrollOptions: IntersectionObserverInit = {
  root: null,
  threshold: 0.1
};

let currentCodeCount = ref<number>(0);
/**
 * 매체코드 목록 페이지네이션(스크롤)
 */
let observer_codes: IntersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
  if (entries[0].isIntersecting) {
    if (mediaCodeList.value.length >= currentCodeCount.value) {
      observer_codes.disconnect();

    } else {
      getCodes(mediaCodeList.value[mediaCodeList.value.length - 1]?.regDatetime);
    }
  }
}, scrollOptions);

let currentMediaCount = ref<number>(0);
/**
 * 매체 목록 페이지네이션(스크롤)
 */
let observer_medias: IntersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
  if (entries[0].isIntersecting) {
    if (mediaTotalCount.value <= currentMediaCount.value) {
      observer_medias.disconnect();

    } else {
      getMedias(mediaList.value[mediaList.value.length - 1]?.media);
    }
  }
}, scrollOptions);

// ======================= END 스크롤 이벤트 =======================

/**
 * 매체코드 목록 새로고침
 */
const refresh =  (): void => {
  resetMediaList();

  getMedias();
  getCodes();
};


// Create
getMedias();

onUnmounted(() => {
  if (mediaCodeEndPoint.value) {
    observer_codes.disconnect();
  }

  if (mediaEndPoint.value) {
    observer_medias.disconnect();
  }

  resetMediaList();
});
</script>

<template>
  <div id="pageAd" class="content">
    <div class="itemWrap width-p-25">
      <div class="subTitle">
        <span>매체</span>
      </div>
      <div class="spinner-wrap" v-if="isLoading">
        <div class="spinner">
          <SvgIcon
            type="mdi"
            class="loading"
            size="36"
            :path="mdiGoogleCirclesExtended"
          />
        </div>
      </div>

      <ul class="itemList" v-else>
        <li :class="[!mediaId ? 'on' : '']">
          <a href="#" @click.prevent="setMedia('', '전체')">
            전체({{ mediaTotalCount }})
          </a>
        </li>

        <li
          :key="item.mediaUid"
          :class="[item.mediaUid === mediaId ? 'on' : '']"
          v-for="item in mediaList"
        >
          <a href="#" @click.prevent="setMedia(item.mediaUid, item.media, item.mediaCodeCount)">
            {{ item.media }}({{ item.mediaCodeCount }})
          </a>
        </li>
      </ul>
      <div ref="mediaEndPoint"></div>
    </div>

    <div class="subItemWrap width-p-25">
      <div class="fixedArea">
        <div class="subTitle">
          <span>매체 코드</span>
          <StyledButton
            small
            color="primary"
            @click.prevent="isModalOpen = true"
          >
            일괄 등록
          </StyledButton>
        </div>

        <div class="searchBox">
          <TextField
            block
            placeholder="매체 코드명을 입력해주세요."
            :icon="mdiMagnify"
            :max-length="10"
            :icon-action="getCodes"
            @keyup.enter="getCodes"
            v-model="searchItem"
          />
        </div>
      </div>

      <div class="spinner-wrap" v-if="isLoadingList">
        <div class="spinner">
          <SvgIcon
            type="mdi"
            class="loading"
            size="36"
            :path="mdiGoogleCirclesExtended"
          />
        </div>
      </div>

      <ul class="subItemList" v-else>
        <template v-if="mediaCodeList.length">
          <li
            :key="subItem.mediaCode"
            :class="[subItem.mediaCode === mediaCode ? 'on' : '']"
            v-for="(subItem, index) in mediaCodeList"
          >
            <a
              href="#"
              @click.prevent="setMediaCode(index)"
            >
              {{ subItem.mediaCode }}
            </a>

            <a
              href="#"
              @click.prevent="openDeleteAlert(index)"
              v-if="subItem.mediaCode !== 'site'"
            >
              <SvgIcon type="mdi" :path="mdiClose" :size="18" />
            </a>
          </li>
        </template>

        <template v-else>
          <li class="noList">
            <SvgIcon
              class="mr-2"
              type="mdi"
              :path="mdiAlertCircle"
              :size="16"
            />
            매체 코드가 존재하지 않습니다.
          </li>
        </template>
      </ul>
      <div ref="mediaCodeEndPoint"></div>
    </div>

    <div class="resisterWrap width-p-50">
      <div class="info" v-if="!mediaId && !mediaCode">
        <SvgIcon type="mdi" :path="mdiInformationBoxOutline" :size="100" />
        <span>안내</span>
        <p>
          '매체' 선택 시 매체 코드 등록이 가능하며,<br />
          '매체 코드명' 선택 시 수정이 가능합니다.
        </p>
      </div>

      <div class="siteInfo info" v-else-if="mediaCode === 'site'">
        <SvgIcon type="mdi" :path="mdiInformationBoxOutline" :size="100" />
        <span>안내</span>
        <p>
          기본 값인 'site' 매체 코드는<br />
          수정 및 삭제가 불가능합니다.
        </p>
      </div>

      <div class="resisterBox" v-else>
        <div class="subTitle">
          <span v-if="mediaCode">매체 코드 수정</span>
          <span v-else>매체 코드 등록</span>
        </div>

        <div class="inputContainer">
          <ValidateForm ref="form">
            <TextField
              block
              required
              disabled
              label="매체명"
              class="mb-20"
              :placeholder="mediaName"
            />

            <!-- 수정 시 매체 코드명 -->
            <TextField
              block
              required
              disabled
              label="매체 코드명"
              class="mb-20"
              :max-length="50"
              :placeholder="mediaCode"
              v-if="mediaCode"
            />

            <!-- 등록 시 매체 코드명-->
            <TextField
              block
              required
              label="매체 코드명"
              placeholder="매체 코드명 입력(50자 이내)"
              class="mb-20"
              :max-length="50"
              :error-message="errorMsg"
              :pattern="patterns.code"
              @blur="checkMediaCode"
              v-model="newMediaCode"
              v-else
            />

            <TextField
              block
              multiline
              is-counting
              label="설명"
              placeholder="매체 코드명에 대한 부가 설명을 입력해주세요. (200자 이내)"
              class="mb-20"
              :max-length="200"
              :rows="5"
              v-model="newDesc"
            />
          </ValidateForm>

          <StyledButton
            small
            outline
            class="font-sm"
            :icon="mdiPlus"
            @click="isImageModalOpen = true"
          >
            이미지 선택
          </StyledButton>

          <div class="imgContainer">
            <div
              :key="`key${index}`"
              class="imgWrap"
              v-for="(img, index) in imageList"
            >
              <div class="imgBox">
                <a class="img">
                  <FTPImage
                    :src="img.src"
                    @click="openImageViewer(img.src)"
                  />
                </a>
                <div class="imgInfo">
                  <span>{{ img.name }}</span>
                  <span class="detail">{{ img.size?.fileSize(2) }}</span>
                </div>
              </div>

              <a href="#" @click.prevent="deleteImage(index)">
                <SvgIcon type="mdi" :path="mdiClose" :size="18" />
              </a>
            </div>
          </div>
        </div>

        <div class="resisterBtn">
          <div class="width-60">
            <StyledButton
              block
              color="primary"
              :disabled="!isChangeValue"
              :loading="isProcessing"
              @click.prevent="putCodes"
              v-if="mediaCode"
            >
              수정
            </StyledButton>
            <StyledButton
              block
              color="primary"
              :loading="isProcessing"
              @click.prevent="postCodes"
              v-else
            >
              등록
            </StyledButton>
          </div>
        </div>
      </div>
    </div>

    <FtpLayerSelectImages
      multiple
      @close="isImageModalOpen = false"
      @load-images="setImage"
      v-if="isImageModalOpen"
    />
    <ImageViewer
      :src="selectedImageSrc"
      :model-value="isImageViewerOpen"
      @update:model-value="isImageViewerOpen = false"
    />

    <MediaResits
      @close="isModalOpen = false"
      @set-data="setData"
      @open-result="isResultModalOpen = true"
      v-if="isModalOpen"
    />
    <MediaResitsResult
      :data="uploadData"
      @close="isResultModalOpen = false"
      @refresh="refresh"
      v-if="isResultModalOpen"
    />
  </div>
</template>@/types/store/modules/ftp/types