<script setup lang="ts">
import { ref, computed, inject, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';

import type { ContextMenuOption } from '@/types/common/ContextMenu';
import type { ContentOptionItem } from '@/types/store/modules/ftp';
import type { FtpContentsStoretype } from '@/store/modules/ftp/Contents';

import { useToast } from '@/js/helper/common';
import { CONTENT_TYPE, FTP_CONTENTS_ROLE } from '@/constants/store/modules/ftp';

import { isCode, isImage } from '@/js/helper/ftp';

//
import {
  mdiContentCopy,
  mdiPencilOutline,
  mdiTrashCanOutline,
  mdiCheckboxMarked,
  mdiCheckboxBlankOutline,
  mdiCodeNotEqualVariant,
  mdiImageOffOutline,
  mdiFolder,
  mdiTextBox,
} from '@/assets/svg/path';


const { Toast } = useToast();

// props
const props = withDefaults(
  defineProps<{
    sorted?: boolean;
    self: ContentOptionItem;
  }>(),
  {
    sorted: false,
  }
);

// emit
const emit = defineEmits<{
  // ContextMenu 요청 이벤트
  (event: 'contextMenu:open', $event: MouseEvent, options: ContextMenuOption[]): void;
  // 이름 변경 팝업 요청 이벤트
  (event: 'layerPopup:changeTitle', target: ContentOptionItem): void;
  (event: 'delete:contentItem', target: ContentOptionItem): void;
  // ContentItem 객체 클릭 이벤트
  (event: 'click:contentItem', target: ContentOptionItem): void;
}>();

// store
const ftpContentsStore = inject('ftpContentsStore') as FtpContentsStoretype;

// Element
const wrapperEL = ref<HTMLDivElement>();

//
let imgSrcError = ref<boolean>(false);

// computed
const isFileExt = computed<boolean>(() => props.self?.type === CONTENT_TYPE.FILE);
const isImageExt = computed<boolean>(() => isImage(props.self?.name || ''));
const objectIconPath = computed<string>(() => {
  if (props.self?.type === CONTENT_TYPE.DIR) {
    return mdiFolder;
  }

  const name: string = props.self?.name || '';

  if (isCode(name)) {
    return mdiCodeNotEqualVariant;
  }
  if (isImage(name) && imgSrcError) {
    return mdiImageOffOutline;
  }

  return mdiTextBox;
});
const { checkedList, getCheckedSortedIndex } = storeToRefs(ftpContentsStore);
const { gtHasRole } = (ftpContentsStore);

// methods
const wrapper = {
  /**
   * 컨텐츠 영역 클릭 이벤트
   * 에외 조건 - 선택한 컨텐츠가 1개 이상일시, 선택박스 영역 외에도 선택/해제를 수행합니다.
   * @author hjs0609
   * @returns
   */
  onClick: (): void => {
    if (props.self?.type === CONTENT_TYPE.FILE) {
      if (checkedList.value.length > 0) {
        ftpContentsStore.setListChecked(props.self!, !props.self.checked);
        if (checkedList.value.length < 1) {
          return;
        }
      }
    }
    emit('click:contentItem', props.self!);
  },

  /**
   * Hover 영역 진입시 커서의 {x,y}축 값을 계속 업데이트 해줍니다.
   * @author hjs0609
   * @param {MouseEvent} $event 이벤트
   * @returns
   */
  onMouseMove: ($event: MouseEvent): void => {
    nextTick(() => {
      const style = wrapperEL.value?.style as CSSStyleDeclaration;
      style.setProperty('--toggle-y', `${$event.clientY + 25}px`);
      style.setProperty('--toggle-x', `${$event.clientX}px`);
    });
  },

  /**
   * 컨텐츠의 유형에 맞는 컨텍스트메뉴의 옵션을 설정한 뒤, emit으로 넘겨 줍니다.
   * @author hjs0609
   * @param {MouseEvent} $event 이벤트
   * @returns
   */
  onContextMenu: ($event: MouseEvent): void => {
    if (!gtHasRole(FTP_CONTENTS_ROLE.CONTEXT_MENU)) {
      // 컨텍스트메뉴 권한이 없으므로 이벤트 중단
      return;
    }
    let options: ContextMenuOption[] = [
      {
        event: '이름 변경',
        icon: mdiPencilOutline,
        callback: () => {
          emit('layerPopup:changeTitle', props.self!);
        },
      },
      {
        event: '삭제',
        icon: mdiTrashCanOutline,
        callback: () => {
          try {
            if (!props.self || props.self?.type === CONTENT_TYPE.NONE) {
              throw new Error('이용하실수 있는 서비스가 아닙니다.');
            }
            emit('delete:contentItem', props.self!);
          } catch (err) {
            console.error(err);
            // defaultErrors();
          }
        },
      },
    ];

    if (isImageExt.value) {
      options.splice(0, 0, {
        event: '링크 복사',
        icon: mdiContentCopy,
        callback: async () => {
          if (navigator.clipboard && isFileExt.value) {
            try {
              await navigator.clipboard.writeText(`${props.self?.src}`);
              Toast('클립보드에 URL이 복사되었습니다.');
            } catch (err) {
              console.error(err);
              // defaultErrors();
            }
          }
        },
      });
    }

    ftpContentsStore.setListAllChecked(false);
    if (isFileExt.value) {
      onClickCheckItem();
    }

    emit('contextMenu:open', $event, options);
  },
};

/**
 * 체크박스 영역 클릭 이벤트
 * @author hjs0609
 * @returns
 */
const onClickCheckItem = (): void => {
  ftpContentsStore.setListChecked(props.self, !props.self?.checked);
};


watch(() => props.self, () => {
  if ( props.self && imgSrcError.value) {
    imgSrcError.value = false;
  }
});
</script>
<script lang="ts">
export default { name: 'FTPContentItem' };
</script>
<template>
  <div :class="['component', 'ftpContentItem', {blank: !props.self}]">
    <div
      ref="wrapperEL"
      :class="['wrapper', { checked: props.self.checked }]"
      :toggle-content="props.self.name"
      @mousemove.stop="wrapper.onMouseMove"
      @contextmenu.prevent="wrapper.onContextMenu"
      @click="wrapper.onClick"
      v-if="props.self"
    >
      <div>
        <div class="objectWrapper">
          <div class="checkboxWrapper" v-if="isFileExt">
            <div class="label" @click.stop="onClickCheckItem">
              <Transition name="check-scale" mode="out-in">
                <SvgIcon
                  class="mdi"
                  type="mdi"
                  :path="mdiCheckboxMarked"
                  v-if="props.self.checked"
                />
                <SvgIcon
                  class="mdi"
                  type="mdi"
                  :path="mdiCheckboxBlankOutline"
                  v-else
                />
              </Transition>
              <Transition name="check-scale" mode="out-in">
                <div
                  :class="['checkedIndexWrapper']"
                  @click.stop
                  v-if="props.self.checked && props.sorted"
                >
                  {{ getCheckedSortedIndex(props.self) + 1 }}
                </div>
              </Transition>
            </div>
          </div>
          <img :src="`${props.self?.src}?dt=${props.self['last-modified']}`" @error="imgSrcError = true" v-if="!imgSrcError && isImageExt" />
          <SvgIcon
            type="mdi"
            :class="['mdi', props.self.type]"
            :size="60"
            :path="objectIconPath"
            v-else
          />
        </div>
      </div>
      <div>
        {{ props.self.name }}
      </div>
      <div v-if="props.self.type === CONTENT_TYPE.FILE">
        {{ props.self.size?.fileSize(0) }}
      </div>
    </div>
  </div>
</template>