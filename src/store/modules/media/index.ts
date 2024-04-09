import { ref, } from 'vue';
import { defineStore } from 'pinia';
import type { GetMediasItem, } from '@/types/api/mediaUtmCodeApi';

export const useMediaStore = defineStore('media', () => {
  const mediaList = ref<GetMediasItem[]>([]);
  const mediaTotalCount = ref<number>(0);

  /**
   * 매체 목록 업데이트
   * @param data 매체 목록
   */
  const updateMediaList = (data: GetMediasItem[]): void => {
    mediaList.value.push(...data);
  };

  /**
   *  매체 목록 초기화
   */
  const resetMediaList = (): void => {
    mediaList.value = [];
  };

  /**
   * 전체, 해당 매체의 totalCount를 1씩 올려줌
   * @param mediaUid 매체 uid
   */
  const plusTotal = (mediaUid: string) => {
    mediaTotalCount.value++;

    for (const media of mediaList.value) {
      if (media.mediaUid === mediaUid) {
        media.mediaCodeCount++;
      }
    }
  };

  /**
   * 전체, 해당 매체의 totalCount를 1씩 내려줌
   * @param mediaUid 매체 uid
   */
  const minusTotal = (mediaUid: string) => {
    mediaTotalCount.value--;

    for (const media of mediaList.value) {
      if (media.mediaUid === mediaUid) {
        media.mediaCodeCount--;
      }
    }
  };

  /**
   * 매체uid를 구하는 함수
   * - 인수로 전달받은 값을 매체리스트의 매체명과 매칭하여 mediaUid를 반환
   * @param mediaList 매체리스트
   * @param mediaName 매체명
   */
  const getMediaUid = (mediaList: GetMediasItem[], mediaName: string): string => {
    const mediaUid = mediaList.find(media => media.media === mediaName)?.mediaUid;

    return mediaUid ?? '';
  };

  /**
   * 매체명을 구하는 함수
   * - 인수로 전달받은 값을 매체리스트의 mediaUid와 매칭하여 매체명을 반환
   * @param mediaList 매체리스트
   * @param mediaUid 매체uid
   */
  const getMediaName = (mediaList: GetMediasItem[], mediaUid: string): string => {
    const mediaName = mediaList.find(media => media.mediaUid === mediaUid)?.media;

    return mediaName ?? '';
  };

  return {
    mediaList,
    mediaTotalCount,
    updateMediaList,
    resetMediaList,
    getMediaUid,
    getMediaName,
    plusTotal,
    minusTotal,
  };
});