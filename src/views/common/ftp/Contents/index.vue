<script setup lang="ts">
import type { RuleFunc } from '@/components/types';
import type { DeleteFtpRes, GetFtpItem, GetFtpReloadRes, GetFtpRes } from '@/types/api/webFtpApi';
import type { ContextMenuOption } from '@/types/common/ContextMenu';
import type { ACTION_MODE_TYPE, UploadContentOption } from '@/types/common/ftp/layer/MultipleActionList';
import axios from 'axios';
import { storeToRefs } from 'pinia';
import {
  computed,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
  watch,
} from 'vue';

import { useWebFtpApi } from '@/api/modules/webFtpApi';
import { useToast } from '@/js/helper/common';
import { getInpuFileAccepts, isImage, useResize } from '@/js/helper/ftp';
import { useMessageBox } from '@/js/helper/messageBox';
import { apiErrorCode } from '@/message/apiResponse';
import { useFtpContents, useSessionStore } from '@/store/index';

// vue
import { mdiAlertCircle, mdiGoogleCirclesExtended } from '@/assets/svg/path';

import { ACTION_MODE } from '@/constants/common';
import { CONTENT_TYPE, CONTENT_TYPE_VALUE, FTP_CONTENTS_ROLE } from '@/constants/store/modules/ftp';
import type { BreadcrumbsOption } from '@/types/common/Breadcrumbs';
import type { ContentOptionItem, FTP_CONTENTS_ROLE_TYPE } from '@/types/store/modules/ftp';
import Breadcrumbs from '@/views/common/Breadcrumbs/index.vue';
import ContextMenu from '@/views/common/ContextMenu/index.vue';
import FTPContentItem from '@/views/common/ftp/Contents/ContentItem/index.vue';
import ChangeName from '@/views/common/ftp/layer/ChangeName/index.vue';
import ImageViewer from '@/views/common/ftp/layer/ImageViewer/index.vue';
import ActionList from '@/views/common/ftp/layer/MultipleActionList/index.vue';
import NewFolder from '@/views/common/ftp/layer/NewFolder/index.vue';

const { UPLOAD_BUTTON, NEW_FOLDER_BUTTON, RELOAD_BUTTON, ALL_CHECKBOX, IMAGE_VIEWER, DELETE_BUTTON } = FTP_CONTENTS_ROLE;
const { DIR, FILE } = CONTENT_TYPE;

const app = getCurrentInstance();
const { VUE_APP_LOCAL_STORAGE_FTP_PATH_KEY } = process.env;

const localStorageFtpPath =
  (localStorage.getItem(VUE_APP_LOCAL_STORAGE_FTP_PATH_KEY) || '/')
    .split('/')
    .filter(path => !!path).map(path => ({ title: path }));
const { Toast, defaultErrors, deleteSuccess } = useToast();


const ftpApi = useWebFtpApi();

// props
const props = withDefaults(
  defineProps<{
    roles: FTP_CONTENTS_ROLE_TYPE[];
    sorted: boolean;

    /** @deprecated 변경 예정. */
    imageOnly?: boolean;
  }>(),
  {
    roles: (): FTP_CONTENTS_ROLE_TYPE[] => [
      FTP_CONTENTS_ROLE.UPLOAD_BUTTON, FTP_CONTENTS_ROLE.NEW_FOLDER_BUTTON, FTP_CONTENTS_ROLE.RELOAD_BUTTON,
      FTP_CONTENTS_ROLE.ALL_CHECKBOX, FTP_CONTENTS_ROLE.IMAGE_VIEWER
    ],
    sorted: false,
    imageOnly: false,
  }
);

// emit

// store
const sessionStore = useSessionStore();
const ftpContentsStore = useFtpContents(app?.uid as number);

// Element
const ftpContentsEL = ref<HTMLDivElement>();
const contentsLayoutEL = ref<HTMLDivElement>();
const contextMenuEL = ref<Pick<InstanceType<typeof ContextMenu>, 'onOpen' | '$nextTick'>>();
const actionListEL = ref<Pick<InstanceType<typeof ActionList>, 'onOpen'| '$nextTick'>>();
const newFolderEL = ref<Pick<InstanceType<typeof NewFolder>, 'onOpen'| '$nextTick'>>();
const changeNameEL = ref<Pick<InstanceType<typeof ChangeName>, 'onOpen'| '$nextTick'>>();

let inputFileEL: HTMLInputElement | null = null;

const { getLoginAccount } = storeToRefs(sessionStore);
const { list, directory, checkedList, isForceReload } = storeToRefs(ftpContentsStore);
const { gtHasRole } = ftpContentsStore;

const _initBreadcrumbs = [ { title: '/' } ] as const;

// data()
let isScroll = ref<boolean>(false);
let loading = ref<boolean>(false);
let showCnt = ref<number>(0);
let maxCol = ref<number>(8);
let blankCnt = ref<number>(0);
let breadcrumbs = ref<BreadcrumbsOption[]>([ ..._initBreadcrumbs, ...localStorageFtpPath ]);
let checkboxValue = ref<boolean>(false);

// 팝업들 설정 =========================
// actionListModal : 업로드/삭제 팝업
// newFolderModal : 새폴더 팝업
// changeNameModal : 이름수정 팝업
// imageViewerModal : 이미지뷰어 팝업
type FtpContentsModal<T = unknown> = {
  show: boolean
  target?: T | null
};

type ModalType = {
  actionListModal: FtpContentsModal,
  newFolderModal: FtpContentsModal,
  changeNameModal: FtpContentsModal<ContentOptionItem>,
  imageViewerModal: FtpContentsModal<ContentOptionItem>,
};

type ModalKeys = keyof ModalType;

const modal = reactive<ModalType>({
  actionListModal: { show: false },
  newFolderModal: { show: false },
  changeNameModal: { show: false, target: null },
  imageViewerModal: { show: false },
});

const onPopupClose = (key: ModalKeys): void => {
  modal[key].show = false;
  if (modal[key].target) {
    modal[key].target = null;
  }
};
// END - 팝업들 설정 ====================
const _observerOptions: IntersectionObserverInit = {
  root: contentsLayoutEL.value || null,
  threshold: 0.1
};
/**
 * 매체코드 목록 페이지네이션(스크롤)
 */
let observer: IntersectionObserver =
  new IntersectionObserver(async (entries: IntersectionObserverEntry[]) => {
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (!entry.isIntersecting) {
        continue;
      }

      if (loading.value) {
        break;
      }

      observer.disconnect();

      if (getFTPContentItems.value.length <= showCnt.value) {
        break;
      }

      await _observe();
    }
  }, _observerOptions);

// computed
const path = computed(() => `${breadcrumbs.value.map(({ title }) => title).join('/')}`.replaceAll('//', '/'));
const getFTPContentItems = computed(() => [ ...directory.value, ...list.value ]);

// methods
const { deleteFtpContent } = useMessageBox(Toast);

useResize(() => {
  if (ftpContentsEL.value) {
    // ftpContentItem 1개의 단위는 px이지만, padding 값 합산 단위 생략
    const _itemWidth = 150;
    // contentsLayout element 1개의 단위는 px이지만, left + right 값 합산 단위 생략
    const _paddingWidth = 20;
    // 컨텐츠 width  - padding / ContentItem.width 값
    maxCol.value = Math.floor(((contentsLayoutEL.value as HTMLDivElement)?.clientWidth - _paddingWidth) / _itemWidth);
  }
});

/**
 * 초기화 함수
 * @author hjs0609
 * @returns
 */
const _initRneder  = () => {
  loading.value = true;
  directory.value = [];
  list.value = [];
  checkedList.value = [];
  showCnt.value = 0;

  const el: HTMLDivElement = contentsLayoutEL.value as HTMLDivElement;
  if (el) {
    el.scrollTop = 0;
    isScroll.value = false;
  }
};

/**
 * 조회 함수
 * @author hjs0609
 * @param purge {boolean} 퍼지 적용 API 사용 여부
 * @returns
 */
const _contentsRneder = async (purge: boolean = false): Promise<void> => {
  if (loading.value) {
    return;
  }

  _initRneder();

  const _callback: Function = purge ? ftpApi.getFtpReload : ftpApi.getFtp;

  let changeRootPath: boolean  = false;

  try {
    const res: GetFtpRes | GetFtpReloadRes  = await _callback({ path: path.value });

    await _sortItems(res.results);
  } catch (err) {
    if (axios.isAxiosError<GetFtpRes|GetFtpReloadRes, any>(err) && err.response) {
      const { code }  = err.response.data;
      switch (code) {
        case apiErrorCode.FTP_RESOURCE_NOT_FOUND:
          changeRootPath = true;
          break;
        default: defaultErrors(); return;
      }
    }
    console.error(err);
    // defaultErrors();
  } finally {
    loading.value = false;

    if (changeRootPath) {
      breadcrumbs.value = [ ..._initBreadcrumbs ];
    }
  }
};

// 정렬기준 : 1순위 = 폴더 / 2순위 = 폴더 or 파일명 기준 오름차순 / 3순위 최신순 (생성일 기준 내림 차순) 정렬 기준 V1.5
const _compareFn = (a: GetFtpItem, b: GetFtpItem): number => a.name.localeCompare(b.name) || (parseInt(b['last-modified']) - parseInt(a['last-modified']) );

/**
 * 해당 목록의 [ 파일|폴더 ] 분류후, 염칭으로 내림차순 정렬 함수
 * @author hjs0609
 * @param items {GetFtpItem[]}
 * @returns
 */
const _sortItems = async (items: GetFtpItem[]): Promise<void> => {
  const folders: ContentOptionItem[] = [];
  const contents: ContentOptionItem[] = [];

  const { ftpDomain } = getLoginAccount.value;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    const option: ContentOptionItem = { ...item, path: path.value, show: false, checked: false };
    if (item.type === DIR) {
      folders.push(option);
      continue;
    }

    if (props.imageOnly && !isImage(item.name)) {
      continue;
    }

    contents.push({ ...option, src: `https://${ftpDomain}${path.value}/${item.name}` });
  }

  directory.value = folders.sort(_compareFn);
  list.value = contents.sort(_compareFn);

  await _observe();
};

const _scrollEvent =  (event: Event): void => {
  const target = event.target as HTMLElement;
  isScroll.value = target.scrollTop > 0;
};

const _observe =  async (): Promise<void> => {
  loading.value = true;
  checkboxValue.value = false;
  const arr: ContentOptionItem[] = getFTPContentItems.value;
  const showShare = 50; // maxCol.value * 4

  const startIndex = showCnt.value;
  const lastIndex = startIndex + showShare;
  showCnt.value = arr.length < lastIndex ? arr.length : lastIndex;
  for (let index = (startIndex < 1 ? 0 : (startIndex - 1)); index < showCnt.value; index++) {
    arr[index].show = true;
  }

  await nextTick();

  try {
    let ftpContentItemsEL = contentsLayoutEL.value?.querySelector('.observer');

    if (ftpContentItemsEL) {
      observer.observe(ftpContentItemsEL);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const onClickBreadcrumbs = (value: BreadcrumbsOption[], newPath: string) => {
  if (loading.value) {
    return;
  }

  if (path.value !== newPath) {
    breadcrumbs.value = value;
  }
};

/**
 * 새폴더 layer popup 활성화 이벤트
 * @author hjs0613
 * @returns
 */
const onOpenNewFolderModal = async (): Promise<void> => {
  if (loading.value) {
    return;
  }

  try {
    const _key: ModalKeys = 'newFolderModal';

    if (!modal[_key].show) {
      modal[_key].show = true;
      await  newFolderEL.value?.$nextTick();
    }

    newFolderEL.value?.onOpen({ path: path.value });
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

/**
 * 이름 변경 layer popup 활성화 이벤트
 * 현재 이름 변경 layer popup이 활성화 일때, 추가 이벤트 진행 불가
 * @author hjs0613
 * @param {ContentOptionItem} target 클릭된 객체
 * @returns
 */
const onOpenChangeNameModal = async (target: ContentOptionItem): Promise<void> => {
  if (loading.value) {
    return;
  }

  try {
    const _key: ModalKeys = 'changeNameModal';

    const title = target.name;

    if (!modal[_key].show) {
      modal[_key].show = true;
      await changeNameEL.value?.$nextTick();
    }

    await changeNameEL.value?.onOpen({ title, path: path.value });
    modal[_key].target = target;
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

/**
 * 이미지 뷰어 layer popup 활성화 이벤트
 * @author hjs0609
 * @param {ContentOptionItem} target 클릭된 객체
 * @returns
 */
const onOpenmageViewerModal = (target: ContentOptionItem): void => {
  const _key: ModalKeys = 'imageViewerModal';
  modal[_key].target = target;
  modal[_key].show = true;
};


/**
 * 확장자가 없을시, 폴더 객체로 인식을 하여 디렉토리 변경 emit을 수행합니다.
 * @author hjs0609
 * @param {ContentsListItemClass} target 클릭된 컨텐츠 객체
 * @returns
 */
const onClickContentItem = async (target: ContentOptionItem): Promise<void> => {
  if (loading.value) {
    return;
  }

  const { type, name } = target;
  if (type === DIR) {
    await onUpdateCheckBoxValue();
    breadcrumbs.value = [ ...breadcrumbs.value, { title: name } ];
    return;
  }

  if (isImage(name) && gtHasRole(IMAGE_VIEWER) && checkedList.value.length < 1) {
    onOpenmageViewerModal(target);
  }
};

const onDeleteContentItem = ({ type, name, path }: ContentOptionItem): void => {
  let message = type === FILE ? `${CONTENT_TYPE_VALUE[type]}` : `${CONTENT_TYPE_VALUE[type]}`;

  deleteFtpContent(message, async (): Promise<void> => {
    try {
      await ftpApi.deleteFtp({ path: `${path}/${name}` });
      deleteSuccess();
      _contentsRneder(true);
    } catch (err) {
      if (axios.isAxiosError<DeleteFtpRes, any>(err) && err.response) {
        const { code }  = err.response.data;
        switch (code) {
          case apiErrorCode.FTP_RESOURCE_NOT_FOUND: {
            Toast({
              color: 'warning',
              message: '이미 삭제된 파일입니다. 새로고침 버튼을 클릭해 주세요.'
            });
          } return;
          case apiErrorCode.FTP_DIRECTORY_ERROR:  {
            // 디렉로리 문제 또는 디렉토리 존재가 없을시, root 포인트로 이동
            defaultErrors();
            ftpContentsStore.setIsForceReload();
          } break;
          default: defaultErrors(); return;
        }
      }
      console.error(err);
      // defaultErrors();
    }
  });
};


/**
 * 컨택스트메뉴를 활성화 이벤트
 * 컨택스트메뉴틑 오른쪽 클릭시마다 이벤트가 발생하므로 v-show로 활성화를 수행합니다.
 * @author hjs0609
 * @param {MouseEvent} $event 이벤트
 * @param {Array<ContextMenuOption>} options 이벤트
 * @returns
 */
const onContextMenuOpen = ($event: MouseEvent, options: ContextMenuOption[]): void => {
  if (loading.value) {
    return;
  }

  contextMenuEL.value?.$nextTick(() => {
    contextMenuEL.value?.onOpen({
      top: $event.clientY,
      left: $event.clientX,
      options
    });
  });
};

/**
 * 업로드 버튼 클릭 이벤트
 * input[type=file] 객체는 이전 선택한 파일 캐시를 갖고 있어서 특정 브라우저는 초기화가 진행이 되지 않기에 inputHtml 객체를 새로 생성하여 업로드 파일을 갱신합니다
 * @author hjs0609
 * @returns
 */
const onClickUploadBtn = (): void => {
  if (loading.value) {
    return;
  }

  if (inputFileEL) {
    inputFileEL.remove();
    inputFileEL = null;
  }

  nextTick(() => {

    let fileTypes: string[] = getInpuFileAccepts();
    if (props.imageOnly) {
      fileTypes = getInpuFileAccepts(true, false, false);
    }

    inputFileEL = document.createElement('input');

    inputFileEL.type = 'file';
    inputFileEL.multiple = true;
    inputFileEL.accept = fileTypes.join(',');
    inputFileEL.oninput = onInputUploadFiles;

    ftpContentsEL.value?.appendChild(inputFileEL);
    inputFileEL.click();
  });
};

/**
 * 업로드 할 파일을 선택 완료시, 얼로드 조건, 파일 목록을 변수에 등록하여, 업로드 layer popup을 활성화 합니다. 마지막으로 input[type=file] 객체는 초기화를 위하여 삭제합니다.
 * @author hjs0609
 * @param {MouseEvent} $event 이벤트 - input[type=file] 객체
 * @returns
 */
const onInputUploadFiles = async ($event: Event): Promise<void> => {
  const eventTargetEL: HTMLInputElement = $event?.target as HTMLInputElement;
  const files: FileList | null = eventTargetEL.files;

  try {
    if (!files || files.length < 1) {
      throw new Error('파일을 읽어올 수 없습니다.');
    }

    let uploadContents: UploadContentOption[] = [];


    const _accept: string[] = eventTargetEL.accept.split(',');

    const fileTitles: string[] =
      list.value.map(({ name }) => name) || [];

    const validate: RuleFunc[] = [
      (v: UploadContentOption) => !!v.file || '고객센터에 문의를 남겨주세요.',
      (v: UploadContentOption) => _accept.some((accept) => v.file!.name.toLocaleLowerCase().lastIndexOf(accept) >= 0) || '허용되지 않은 확장자입니다.',
      (v: UploadContentOption) =>
        Array.isArray(v.file!.name.split('.')[0].match(/^[0-9a-zA-Z\_\-]{1,}$/)) ||
        '파일명은 숫자, 영문자, 특수문자(_, -)만 사용 가능합니다.',
      (v: UploadContentOption) => v.file!.size <= 1024 * 1024 * 10 || '제한 용량을 초과하였습니다.',
      (v: UploadContentOption) =>
        !fileTitles.includes(v.file!.name) || '동일한 파일명+확장자가 존재합니다.'
    ];

    for (let index = 0; index < files.length; index++) {
      const file: File | null = files.item(index);
      if (!file) {
        throw new Error('알수 없는 파일 객체입니다.');
      }

      uploadContents.push({
        name: file.name,
        file,
      });
    }

    const mode: ACTION_MODE_TYPE = ACTION_MODE.UPLOAD_ITEM;

    if (!modal['actionListModal'].show) {
      modal['actionListModal'].show = true;
      await actionListEL.value?.$nextTick();
    }

    await actionListEL.value?.onOpen({ validate, options: uploadContents, mode, path: path.value });

  } catch (err) {
    console.error(err);
    // defaultErrors();
  } finally {
    nextTick(() => {
      eventTargetEL.remove();
      inputFileEL = null;
    });
  }
};


/**
 * 다중 폴더/파일 객체 삭제 이벤트
 * ( 다중 선택은 파일이라는 전제하 )
 * @author hjs0609
 * @returns
 */
const onClickDeleteBtn = () => {
  if (loading.value) {
    return;
  }

  if (checkedList.value.length === 1) {
    onDeleteContentItem(checkedList.value[0]);
    return;
  }

  // onDeleteContentItem
  deleteFtpContent(CONTENT_TYPE_VALUE[CONTENT_TYPE.FILE], async (): Promise<void> => {
    const options = [];
    for (let index = 0; index < list.value.length; index++) {

      if (options.length === checkedList.value.length) {
        break;
      }

      const item = list.value[index];

      if (!item.checked || !item.show) {
        continue;
      }

      options.push(item);
    }

    const mode: ACTION_MODE_TYPE = ACTION_MODE.DELETE_ITEM;

    if (!modal['actionListModal'].show) {
      modal['actionListModal'].show = true;
      await actionListEL.value?.$nextTick();
    }

    await actionListEL.value?.onOpen({ options, mode, path: path.value });
  });
};


/**
 * 전체 파일 선택 체크 박스 이벤트
 * @author hjs0609
 * @param {string} value [ false | true ]
 * @returns
 */
const onUpdateCheckBoxValue = (value: boolean = false): void => {
  if (loading.value) {
    return;
  }
  ftpContentsStore.setListAllChecked(value);
};


// 버튼들 설정 =========================
type ContentsButton = {
  role: FTP_CONTENTS_ROLE_TYPE
  title: string
  disabled?: boolean
  onClick?: Function
};
let buttons = ref<ContentsButton[]>([
  { title: '업로드', onClick: onClickUploadBtn, role: UPLOAD_BUTTON },
  { title: '새폴더', onClick: onOpenNewFolderModal, role: NEW_FOLDER_BUTTON },
  { title: '새로고침', onClick: () => _contentsRneder(true), role: RELOAD_BUTTON },
  {
    title: '삭제',
    disabled: true,
    onClick: onClickDeleteBtn,
    role: DELETE_BUTTON
  },
]);
// END - 버튼들 설정 ====================


// watch
/**
 * 선택 객체 업데이트마다 삭제버튼 활성호 여부/ 전체선택 여부 체크
 * @author hjs0609
 * @returns
 */
watch(
  [ checkedList ],
  () => {
    const deleteBtn: ContentsButton | undefined = buttons.value.find(
      item => item.role === DELETE_BUTTON
    );
    if (deleteBtn) {
      deleteBtn.disabled = checkedList.value.length < 1;
    }

    let value: boolean = false;
    if (ftpContentsStore.gtIsTotalChecked && checkedList.value.length > 0) {
      value = true;
    }

    checkboxValue.value = value;
  },
  { deep: true }
);


/**
 * props.roles의 값 변경시, 권한 설정
 * @author hjs0615
 * @returns
 */
watch(
  () => props.roles,
  () => {
    ftpContentsStore.setRoles(props.roles);
  },
  { immediate: true }
);

/**
 * list, maxCol의 값 변경을 감지하여 마지막줄의 blank ContentItem 갯수 생성
 * @author hjs0616
 * @returns
 */
watch(
  () => [ directory.value.length, list.value.length, maxCol.value, showCnt.value ],
  () => {
    const showMaxSize = getFTPContentItems.value.filter((item) => item.show).length;
    const _remain: number =  showMaxSize % maxCol.value;
    const _blankCnt: number = _remain < 1 ? 0 : maxCol.value - _remain;
    blankCnt.value = !_blankCnt ? 0 : _blankCnt;
  },
);

/**
 * 경로 값 변경시 API 재조회
 * @author hjs0720
 * @returns
 */
watch(
  () => path.value,
  () => {
    localStorage.setItem(VUE_APP_LOCAL_STORAGE_FTP_PATH_KEY, path.value);
    _contentsRneder(isForceReload.value);
    if (isForceReload.value) {
      isForceReload.value = false;
    }
  },
  { immediate: true }
);

/**
 * store의 isForceReload  = 강제 root path 변경하여 API 재조회
 * @author hjs0724
 * @returns
 */
watch(
  () => isForceReload.value,
  () => {
    if (isForceReload.value) {
      breadcrumbs.value = [ ..._initBreadcrumbs ];
    }
  },
);


onMounted(() => {
  contentsLayoutEL.value?.addEventListener('scroll', _scrollEvent);
});

// onUnmounted
onUnmounted(() => {
  observer.disconnect();
  contentsLayoutEL.value?.removeEventListener('scroll', _scrollEvent);
  // ftpContentsStore는 componenent uid 별로 생성되기에 component unmount시 해제해야 합니다.
  ftpContentsStore.$dispose();

});

// child Componentd ContentItem에 주입할 store 객체
provide('ftpContentsStore', ftpContentsStore);
defineExpose({
  checkedList,
});
</script>
<script lang="ts">
export default { name: 'FTPContents' };
</script>
<template>
  <div ref="ftpContentsEL" class="component ftpContents">
    <div class="layout">
      <Breadcrumbs class="p-10" :model-value="breadcrumbs" @on:click="onClickBreadcrumbs" />
      <div class="flex-center mt-10 px-10 gap-8">
        <template v-for="(button, i) in buttons">
          <StyledButton
            small
            outline
            :key="i"
            tag="button"
            :disabled="button.disabled"
            @click="button.onClick"
            v-if="gtHasRole(button.role)"
          >
            {{ button.title }}
          </StyledButton>
        </template>
      </div>
      <div :class="['mt-10', isScroll && 'is-scroll']">
        <div class="flex-center gap-8">
          <SwitchButton
            checkbox
            class="text-y-middle"
            :label="['전체 파일 선택' ,'전체 파일 선택']"
            :disabled="showCnt <= 0 || directory.length >= showCnt"
            @update:model-value="onUpdateCheckBoxValue"
            v-model="checkboxValue"
            v-if="gtHasRole(ALL_CHECKBOX)"
          />
        </div>
      </div>
      <div ref="contentsLayoutEL" class="contentsLayout">
        <div class="flex">
          <template :key="i" v-for="(item, i) in getFTPContentItems">
            <FTPContentItem
              :sorted="item.type === FILE ? props.sorted : false"
              :self="item"
              @click:content-item="onClickContentItem"
              @delete:content-item="onDeleteContentItem"
              @context-menu:open="onContextMenuOpen"
              @layer-popup:change-title="onOpenChangeNameModal"
              v-if="item.show"
            />
          </template>

          <div class="observer"></div>

          <div :key="`blank${i}`" class="component ftpContentItem blank" v-for="(i) in blankCnt"></div>

          <div class="no-data" v-if="!loading && getFTPContentItems.length < 1">
            <SvgIcon
              class="mr-2"
              type="mdi"
              :path="mdiAlertCircle"
              :size="20"
            />
            <span>데이터가 존재하지 않습니다.</span>
          </div>

          <div class="spinner-wrap" v-if="loading">
            <div class="spinner">
              <SvgIcon
                type="mdi"
                class="loading"
                size="36"
                :path="mdiGoogleCirclesExtended"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ContextMenu ref="contextMenuEL" />
  <ActionList
    ref="actionListEL"
    @on:delete-success="_contentsRneder(true)"
    @on:upload-success="_contentsRneder(true)"
    @on:close="onPopupClose('actionListModal')"
    v-if="modal['actionListModal'].show"
  />
  <NewFolder
    ref="newFolderEL"
    @on:create-content="_contentsRneder()"
    @on:close="onPopupClose('newFolderModal')"
    v-if="modal['newFolderModal'].show"
  />
  <ChangeName
    ref="changeNameEL"
    @on:edit-content="_contentsRneder(true)"
    @on:close="onPopupClose('changeNameModal')"
    v-if="modal['changeNameModal'].show"
  />
  <ImageViewer
    :src="`${modal['imageViewerModal'].target?.src}?dt=${modal['imageViewerModal'].target?.['last-modified']}`"
    :model-value="modal['imageViewerModal'].show"
    @update:model-value="onPopupClose('imageViewerModal')"
    v-if="modal['imageViewerModal'].target"
  />
</template>