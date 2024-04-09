<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue';
import { storeToRefs } from 'pinia';
import type { KeyIndex } from '@/components/types';
import type { ToastModel } from '@/components/Toast/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ConstPageSectionTypeKeys, Options } from '@/types/common';
import type {
  GetPageContentsRes,
  PostPagesParam,
  PostPagesRes,
  PutPagesRes
} from '@/types/api/smartEditorApi';
import {
  mdiCog, mdiArrowUp, mdiHome, mdiArrowDown,
  mdiImagePlusOutline, mdiSwapVertical
} from '@/assets/svg/path';
import { useRoute, useRouter } from 'vue-router';
import type { SpinnerModel } from '@/components/Spinner/types';
import { CONST_CODES, previewType } from '@/constants/common';
import { useEditorStore } from '@/store';
import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import { SlickList, SlickItem } from 'vue-slicksort';
import { v1 as uuid } from 'uuid';
import { useUtil } from '@/js/util';
import { postPagesMsg, putPagesMsg, getPageContentsMsg } from '@/constants/api/smartEditorApi';
import Selector from './component/editorSelector.vue';
import EditorSection from './component/editorSection.vue';
import SortSection from './component/sortSection.vue';
import AddSection from './layer/addSection.vue';
import PageConfig from './layer/pageConfig.vue';
import PageLoad from './layer/pageLoad.vue';
import ImageSection from './layer/imageSection.vue';
import TextSection from './layer/textSection.vue';
import InputFormSection from './layer/inputFormSection.vue';
import FixedBannerSection from './layer/fixedBannerSection.vue';
import RollingBannerSection from './layer/rollingBannerSection.vue';
import RollingListSection from './layer/rollingListSection.vue';
import ImportSection from './layer/importSection.vue';
import CommentSection from './layer/commentSection.vue';
import CodeSection from './layer/codeSection.vue';
import Preview from '@/views/common/preview.vue';
import SelectImages from '@/views/common/ftp/layer/SelectImages/index.vue';
import type { ContentItem } from '@/types/store/modules/ftp';

const { PAGE_SECTION_TYPE, LINK_TYPE } = CONST_CODES;

const store = useEditorStore();
const smartEditorApi = useSmartEditorApi();
const route = useRoute();
const router = useRouter();
const Spinner = inject('Spinner') as SpinnerModel;
const util = useUtil();

const {
  setAddSectionIndex,
  getSection,
  removeSection,
  sortSection,
  resetEditor,
  sortSwitching,
  toggleSortMode,
  setPageUid,
  optionCall,
  addPageOption,
  changePageOption,
  updatePageConfig,
  setSection,
} = store;

const {
  options,
  getPageConfig,
  sections,
  sortModeState,
  sectionLength,
  isSetConfig,
  getPageUid,
} = storeToRefs(store);

const Toast = inject('Toast') as ToastModel;
const MessageBox = inject('MessageBox') as MessageBoxModel;

let loadPage = ref<string>('');
let screenPixel = ref<string>('640px');
let editSectionIndex = ref<number>(-1);

const show = reactive<KeyIndex<boolean>>({
  pageConfig: false,
  addSection: false,
  pageLoad: false,
  preview: false,
});

const screenPixelList = ref<Options[]>([
  { text: '480px', value: '480px' },
  { text: '640px', value: '640px' },
  { text: '100%', value: '100%' },
]);

let sectionComponent = ref<any>();
let isShow = ref<boolean>(false);
let isSelectorShow = ref<boolean>(false);

const sectionItems: KeyIndex<any> = {
  IMAGE: ImageSection,
  TEXT: TextSection,
  INPUT_FORM: InputFormSection,
  FIXED_BANNER: FixedBannerSection,
  ROLLING_BANNER: RollingBannerSection,
  ROLLING_LIST: RollingListSection,
  IMPORT: ImportSection,
  COMMENT: CommentSection,
  CODE: CodeSection,
};

const toggleSort = (): void => {
  if (sections.value.length) {
    toggleSortMode();
  } else {
    Toast({ color: 'warning', message: '1개 이상의 섹션을 등록해주세요.' });
  }
};

/**
 * 추가 섹션 종류 선택 팝업
 * @param v
 * @param isEdit
 */
const addSection = (v: ConstPageSectionTypeKeys, isEdit: boolean = false): void => {
  if (v === PAGE_SECTION_TYPE.IMAGE.VAL && !isEdit) {
    isSelectorShow.value = true;
  } else {
    sectionComponent.value = sectionItems[v];
    isShow.value = true;
  }
};

/**
 * 섹션 수정
 * @param index
 */
const editSection = (index: number): void => {
  editSectionIndex.value = index;
  const { sectionType } = getSection(index);
  addSection(sectionType, true);
};

/**
 * 섹션 닫기
 * @param flag
 */
const closeSectionLayer = (): void => {
  // 섹션 추가 툴을 닫은 후 수정 인덱스 값을 초화 한다.
  editSectionIndex.value = -1;
  isShow.value = false;
};

/**
 * 섹션 종류별 레이어 팝업
 * @param flag
 * @param after
 */
const showTools = (flag: string, after: number = -1): void => {
  setAddSectionIndex(after);
  show[flag] = true;
};

/**
 * 에디터 작성 내용 미리 보기
 */
const preview = (): void => {
  if (sections.value.length) {
    Spinner.delay(0).show('미리보기 작성 중...');
    document.body.classList.remove('scroll');
    show.preview = true;
  } else {
    Toast({ color: 'warning', message: '섹션 추가 후 페이지를 구성해 주세요.' });
  }
};

/**
 * 페이지 저장
 */
const save = async (): Promise<void> => {
  if (!isSetConfig.value) {
    Toast({ color: 'warning', message: '페이지 설정이 완료 되지 않았습니다.' });
    show.pageConfig = true;
    return;
  }

  if (sectionLength.value) {
    let pageUid = getPageUid.value;

    // 페이지 최초 등록시 모든 uuid 설정 필요
    if (!getPageUid.value) {
      pageUid = uuid();
    }

    // 페이지 수정시 설정 안된 uuid 설정 필요 (section에만 해당)
    sections.value.forEach((section: any) => {
      if (!section.pageSectionRelUid) {
        const sectionUid = uuid();
        section.pageSectionRelUid = sectionUid;

        let keyofUid = '';

        switch (section.sectionType) {
          case PAGE_SECTION_TYPE.IMAGE.VAL:
            keyofUid = 'Image';
            break;
          case PAGE_SECTION_TYPE.TEXT.VAL:
            keyofUid = 'Text';
            break;
          case PAGE_SECTION_TYPE.INPUT_FORM.VAL:
            keyofUid = 'InputForm';
            break;
          case PAGE_SECTION_TYPE.FIXED_BANNER.VAL:
            keyofUid = 'FixedBanner';
            break;
          case PAGE_SECTION_TYPE.ROLLING_BANNER.VAL:
            keyofUid = 'RollingBanner';
            break;
          case PAGE_SECTION_TYPE.ROLLING_LIST.VAL:
            keyofUid = 'RollingList';
            break;
          case PAGE_SECTION_TYPE.IMPORT.VAL:
            keyofUid = 'Import';
            break;
          case PAGE_SECTION_TYPE.COMMENT.VAL:
            keyofUid = 'Comment';
            break;
          case PAGE_SECTION_TYPE.CODE.VAL:
            keyofUid = 'Code';
            break;
        }

        section.config.pageSectionRelUid = sectionUid;
        section.config[`section${keyofUid}Uid`] = uuid();
      }
    });

    const param: PostPagesParam = {
      pageUid,
      pageConfig: getPageConfig.value,
      sections: sections.value,
    };

    Spinner.delay(0).show('페이지 저장 중...');

    const msg: string[] = [
      postPagesMsg.SMART_PAGE_INSERT_SUCCESS,
      putPagesMsg.SMART_PAGE_UPDATE_SUCCESS
    ];

    try {
      const { code } = getPageUid.value
        ? await smartEditorApi.putPages(getPageUid.value, param)
        : await smartEditorApi.postPages(param);

      if (msg.includes(code)) {
        Toast(`정상적으로 ${getPageUid.value ? '수정' : '저장'}되었습니다.`);

        if (!getPageUid.value) {
          loadPage.value = pageUid;
          addPageOption(pageUid);

          router.replace(`/editor/${pageUid}`);
        } else {
          changePageOption(pageUid);
        }
      }
    } catch (err) {
      util.axiosErrorCatch<PostPagesRes | PutPagesRes>(err);
    } finally {
      Spinner.hide();
    }

  } else {
    Toast({ color: 'warning', message: '섹션 추가 후 페이지를 구성해 주세요.' });
  }
};

/**
 * 페이지 호출
 * @param value
 */
const loadData = async (value: string): Promise<void> => {
  resetEditor();

  Spinner.delay(0.5).show('불러오는 중...');

  try {
    const { code, results } = await smartEditorApi.getPageContents(value);

    if (code === getPageContentsMsg.SMART_PAGE_CONTENT_GET_SUCCESS) {
      const { pageConfig, sections } = results;

      console.log(sections);

      updatePageConfig({ ...pageConfig });
      setPageUid(value);

      sections.forEach(({ sectionType, config, pageSectionRelUid }) => {
        console.log(`page config ===========> `, config);
        setSection(sectionType, config, pageSectionRelUid);
      });
    }

  } catch (err) {
    util.axiosErrorCatch<GetPageContentsRes>(err);
  } finally {
    Spinner.hide();
  }
};

/**
 * 선택된 광고 페이지 적용(config, section 정보)
 * @param value
 */
const pageEdit = (value: string): void => {
  if (sections.value.length) {
    MessageBox.confirm({
      title: '페이지를 이동 하시겠습니까?',
      message: '[확인] 버튼 클릭 시 페이지가 이동 되며, 페이지 이동 시 수정된 내용은 저장되지 않습니다.',
      okay: () => {
        router.push(`/editor/${value}`);
      },
    });
  } else {
    router.push(`/editor/${value}`);
  }
};

/**
 * 스크롤 최상단, section 마지막 부분으로 이동
 * @param where
 */
const moveScroll = (where: number): void => {
  if (sections.value.length > 1) {
    if (where === 0) {
      document.body.scrollIntoView({ behavior: 'smooth' });
    } else {
      const selector = sortModeState.value ? '.sort-section:last-child' : '.editor-section:last-child';
      const div = document.querySelectorAll(selector) as NodeListOf<HTMLDivElement>;
      const el = div[div.length - 1];

      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

const closeAllLayers = (): void => {
  isShow.value = false;
  sectionComponent.value = null;
  show.pageConfig = false;
  show.addSection = false;
  show.pageLoad = false;
  show.preview = false;
};

/**
 * ftp cdn 에서 선택된 이미지를 데이터변환
 * @param images
 */
const setImageSection = (images: ContentItem | ContentItem[]): void => {
  if (images instanceof Array) {
    images.forEach(img => {
      setSection(PAGE_SECTION_TYPE.IMAGE.VAL, {
        sectionImageUid: '',
        pageSectionRelUid: '',
        imagePath: img.src!,
        imageProperty: '',
        linkType: LINK_TYPE.NONE.VAL,
        link: '',
        divProperty: '',
        isLayerPopup: 0,
      });
    });
  }
};

/**
 * 단축키 설정 (Alt + key)
 * S 저장, R: 미리보기, O: 불러오기, F: 페이지 설정, T: 정렬 변경, A: 섹션 추가, 1~9: 섹션 기능별 추가
 * @param event
 */
const shortcut = (event: KeyboardEvent): void => {
  if (show.pageConfig) {
    return;
  }

  const { altKey, shiftKey } = event;

  if (altKey && shiftKey) {
    const keycode = event.code.toLowerCase();
    const functions: KeyIndex<Function> = {
      keys: () => save(),
      keyr: () => preview(),
      keyo: () => showTools('pageLoad'),
      keyf: () => showTools('pageConfig'),
      keyq: () => toggleSort(),
      keya: () => showTools('addSection'),
      digit1: () => addSection(PAGE_SECTION_TYPE.IMAGE.VAL),
      digit2: () => addSection(PAGE_SECTION_TYPE.TEXT.VAL),
      digit3: () => addSection(PAGE_SECTION_TYPE.INPUT_FORM.VAL),
      digit4: () => addSection(PAGE_SECTION_TYPE.FIXED_BANNER.VAL),
      digit5: () => addSection(PAGE_SECTION_TYPE.ROLLING_BANNER.VAL),
      digit6: () => addSection(PAGE_SECTION_TYPE.ROLLING_LIST.VAL),
      digit7: () => addSection(PAGE_SECTION_TYPE.IMPORT.VAL),
      digit8: () => addSection(PAGE_SECTION_TYPE.COMMENT.VAL),
      digit9: () => addSection(PAGE_SECTION_TYPE.CODE.VAL),
    };

    const len = Object.keys(functions).filter(key => key === keycode).length;

    // 사용 가능한 단축키를 누른 경우 기존 창을 닫아 준다.
    if (len) {
      closeAllLayers();
      functions[keycode]();
    }
  }
};

const previewClose = (): void => {
  document.body.classList.add('scroll');
  show.preview = false;
};

/**
 * 새로고침 했을 경우 menu store의 메뉴 활성화 상태가 초기화 되어 메뉴가 닫혀있는
 * 상태를 방지 하기 위한 함수
 */
const backToSmart = (): void => {
  router.push('/smart/page');
};


onMounted(() => {
  document.body.classList.add('scroll');
  window.addEventListener('keydown', shortcut);

  const { uid: queryStringUid } = route.params;

  if (queryStringUid) {
    loadPage.value = queryStringUid as string;
    loadData(loadPage.value);
  }

  optionCall('page');
  optionCall('layout');
  optionCall('script');
  optionCall('inputForm');
  optionCall('rollingBanner');
  optionCall('rollingList');
  optionCall('import');
  optionCall('comment');
  optionCall('template');

  if ((!getPageConfig.value.pageName || !getPageConfig.value.layoutUid) && !queryStringUid) {
    show.pageConfig = true;
  }
});

onUnmounted(() => {
  Spinner.close();
  document.body.classList.remove('scroll');
  resetEditor();
  window.removeEventListener('keydown', shortcut);
});
</script>

<template>
  <div id="smartEditor">
    <div class="editor-top">
      <!-- top left -->
      <div class="top-left">
        <Selector
          searchable
          class="load-page"
          placeholder="페이지 이동 선택 (페이지 수정)"
          :options="options.page"
          @update:model-value="pageEdit"
          v-model="loadPage"
        />
        <Selector
          class="screen-pixel"
          :readonly="sortModeState"
          :options="screenPixelList"
          v-model="screenPixel"
        />
      </div>
      <!-- top center -->
      <div class="top-center">
        <Tooltip
          bottom
          hovering
          message="단축키: Alt + Shift + A"
        >
          <a href="#" @click.prevent="showTools('addSection')">
            <SvgIcon type="mdi" :path="mdiImagePlusOutline" />
          </a>
        </Tooltip>

        <Tooltip
          bottom
          hovering
          message="단축키: Alt + Shift + Q"
        >
          <a
            href="#"
            :class="sortModeState && 'active'"
            @click.prevent="toggleSort"
          >
            <SvgIcon type="mdi" :path="mdiSwapVertical" />
          </a>
        </Tooltip>
      </div>
      <!-- top right -->
      <div class="top-right">
        <Tooltip
          bottom
          hovering
          class="right-tools flex-1"
          message="단축키: Alt + Shift + O"
        >
          <a href="#" @click.prevent="showTools('pageLoad')">불러오기</a>
        </Tooltip>
        <Tooltip
          bottom
          hovering
          class="right-tools flex-1"
          message="단축키: Alt + Shift + R"
        >
          <a href="#" @click.prevent="preview">미리보기</a>
        </Tooltip>
        <Tooltip
          bottom
          hovering
          class="right-tools save"
          message="단축키: Alt + Shift + S"
        >
          <a href="#" @click.prevent="save">
            {{ getPageConfig.isOn ? 'ON' : 'OFF' }}
            상태로
            {{ getPageUid ? '수정' : '저장' }}
          </a>
        </Tooltip>
        <Tooltip
          bottom
          hovering
          class="right-tools"
          message="단축키: Alt + Shift + F"
        >
          <a href="#" class="icon" @click.prevent="showTools('pageConfig')">
            <SvgIcon type="mdi" :path="mdiCog" />
          </a>
        </Tooltip>
        <a href="#" class="right-tools icon" @click.prevent="backToSmart">
          <SvgIcon type="mdi" :path="mdiHome" />
        </a>
      </div>
    </div>

    <div class="sections">
      <template v-if="!sections.length">
        <div class="empty-section">
          <a href="#" @click.prevent="showTools('addSection')">
            <SvgIcon size="150" type="mdi" :path="mdiImagePlusOutline" />
          </a>
          <span>섹션 추가 후 페이지를 구성해 주세요.</span>
        </div>
      </template>
      <template v-else>
        <template v-if="sortModeState">
          <SlickList
            hide-sortable-ghost
            lock-axis="y"
            class="list-wrap"
            helper-class="slicksort"
            :style="{ width: '640px' }"
            @sort-start="sortSwitching()"
            @sort-end="sortSwitching()"
            v-model:list="sections"
          >
            <SlickItem
              :key="`section-${item.pageSectionRelUid ? item.pageSectionRelUid : item.key}`"
              :index="index"
              v-for="(item, index) in sections"
            >
              <SortSection
                :unique-key="item.key != undefined ? item.key : 0"
                :index="index"
                :type="item.sectionType"
                :config="item.config"
              />
            </SlickItem>
          </SlickList>
        </template>
        <template v-else>
          <div class="list-wrap" :style="{ width: screenPixel }">
            <EditorSection
              :key="`section-${item.pageSectionRelUid}`"
              :unique-key="item.key ? item.key : 0"
              :index="index"
              :type="item.sectionType"
              :config="item.config"
              @add="showTools"
              @remove="removeSection"
              @edit="editSection"
              @sort="sortSection"
              v-for="(item, index) in sections"
            />
          </div>
        </template>
      </template>
    </div>

    <div class="editor-tools scroll">
      <a href="#" @click.prevent="moveScroll(0)">
        <SvgIcon type="mdi" :path="mdiArrowUp" />
      </a>
      <a href="#" @click.prevent="moveScroll(1)">
        <SvgIcon type="mdi" :path="mdiArrowDown" />
      </a>
    </div>

    <PageConfig
      @close="show.pageConfig = false"
      v-if="show.pageConfig"
    />
    <PageLoad
      @close="show.pageLoad = false"
      v-if="show.pageLoad"
    />

    <AddSection
      esc-close
      @add-section="addSection"
      @close="show.addSection = false"
      v-if="show.addSection"
    />

    <!-- 섹션 추가 툴 -->
    <Component
      :is="sectionComponent"
      :index="editSectionIndex"
      @close="closeSectionLayer"
      v-if="isShow"
    />

    <SelectImages
      multiple
      @close="isSelectorShow = false"
      @load-images="setImageSection"
      v-if="isSelectorShow"
    />

    <Preview
      :width="screenPixel"
      :type="previewType.pages"
      @close="previewClose"
      @iframe-loaded="Spinner.hide()"
      v-if="show.preview"
    />
  </div>
</template>

<script lang="ts">
export default { name: 'SmartEditor' };
</script>
