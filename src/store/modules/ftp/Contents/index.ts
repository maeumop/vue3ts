import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

import { CONTENT_TYPE } from '@/constants/store/modules/ftp';
import type { FTP_CONTENTS_ROLE_TYPE } from '@/types/store/modules/ftp';

import type { ContentItem, ContentOptionItem } from '@/types/store/modules/ftp';

const modulePrefixName = 'FtpContents';

const setup = () => {
  const isForceReload = ref<boolean>(false);

  const directory = ref<ContentOptionItem[]>([]);
  const list = ref<ContentOptionItem[]>([]);

  const checkedList = ref<ContentOptionItem[]>([]);
  const roles: FTP_CONTENTS_ROLE_TYPE[] = [];

  const setRoles = (arr: FTP_CONTENTS_ROLE_TYPE[]) => {
    roles.splice(0, roles.length, ...arr);
  };

  const setDirectory = (arr: ContentItem[]) => {
    directory.value.splice(
      0,
      directory.value.length,
      ...arr.map((item: ContentItem) => Object.assign({ show: false }, item)),
    );
  };

  const setList = (arr: ContentItem[]) => {
    list.value.splice(
      0,
      list.value.length,
      ...arr.map((item: ContentItem) => Object.assign({ show: false, checked: false }, item)),
    );
  };

  const setListChecked = (self: ContentOptionItem, value: boolean) => {
    if (self.type === CONTENT_TYPE.FILE) {
      self.checked = value;
      let index: number = checkedList.value.length;

      if (value === false) {
        index = checkedList.value.findIndex((item: ContentOptionItem) => item === self);
        if (index >= 0) {
          checkedList.value.splice(index, 1);
        }
      } else {
        checkedList.value.splice(index, 0, self);
      }
    }
  };

  const setListAllChecked = (value: boolean) => {
    const arr: ContentOptionItem[] = [];

    for (let index = 0; index < list.value.length; index++) {
      const item = list.value[index];
      if (item.type !== CONTENT_TYPE.FILE) {
        continue;
      }
      if (!item.show) {
        continue;
      }
      if (item.checked !== value) {
        item.checked = value;
        if (value) {
          arr.push(item);
        }
      }
    }
    if (value) {
      checkedList.value.splice(checkedList.value.length, 0, ...arr);
    } else {
      checkedList.value.splice(0, checkedList.value.length);
    }
  };

  const setIsForceReload = (value: boolean = true) => {
    isForceReload.value = value;
  };

  const gtIsTotalChecked = computed<boolean>(
    () =>
      list.value.filter((item: ContentOptionItem) => (item.type === CONTENT_TYPE.FILE) && item.show).length ===
      checkedList.value.length,
  );

  const getCheckedSortedIndex = computed(() => {
    return (find: ContentOptionItem): number => {
      return checkedList.value.findIndex((item: ContentOptionItem) => item === find);
    };
  });

  const gtHasRole = computed(() => {
    return (role: FTP_CONTENTS_ROLE_TYPE): boolean => {
      return !!roles.find((item: FTP_CONTENTS_ROLE_TYPE) => item === role);
    };
  });

  return {
    list,
    directory,
    checkedList,
    isForceReload,
    roles,

    setRoles,
    setList,
    setDirectory,
    setListChecked,
    setListAllChecked,
    setIsForceReload,

    gtIsTotalChecked,
    getCheckedSortedIndex,
    gtHasRole,
  };
};

/**
 * name 모듈명의 인스턴스를 반환 Helper 함수형
 * @author hjs0601
 * @param name FtpContents 모듈명
 */
const helper = (name: number | string = modulePrefixName) =>
  defineStore(typeof name === 'number' ? `${modulePrefixName}_${name}` : name, setup)();

export type FtpContentsStoretype = ReturnType<typeof helper>;

/* 기본은 helper 함수 */
export default helper;