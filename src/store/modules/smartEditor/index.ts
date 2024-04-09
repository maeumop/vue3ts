import { ref, reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import type {
  SmartEditorPageConfig,
  SectionData,
  SectionConfig,
  SmartPageOptionTypes,
  GetPagesParam,
  GetLayoutsParam,
  GetScriptsParam,
  GetInputFormParam,
  GetCommentGrpsParam,
  GetImportsParam,
  GetRollingBannerGrpsParam,
  GetRollingListGrpsParam,
} from '@/types/api/smartEditorApi';
import type { ConstPageSectionTypeKeys } from '@/types/common';
import type { KeyIndex, OptionItem } from '@/components/types';
import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import { useMyAppApi } from '@/api/modules/myAppApi';
import { useUtil } from '@/js/util';
import { getTemplatesMsg } from '@/constants/api/myAppapi';
import {
  getLayoutsMsg,
  getPagesMsg,
  getScriptsMsg,
  getInputFormMsg,
  getRollingBannerGrpsMsg,
  getRollingListGrpsMsg,
  getImportsMsg,
  getCommentGrpsMsg
} from '@/constants/api/smartEditorApi';
import type { GetTemplatesParam } from '@/types/api/myAppApi';
import type { OptionsRes } from '@/types/store/modules/smartEditor';

export const useEditorStore = defineStore('smartEditor', () => {
  const smartEditorApi = useSmartEditorApi();
  const myAppApi = useMyAppApi();
  const util = useUtil();

  const pageUid = ref<string>('');
  const pageConfig = reactive<SmartEditorPageConfig>({
    layoutUid: '',
    mobilePageUid: '',
    backPageUid: '',
    scriptUid: '',
    pageName: '',
    pageCode: '',
    htmlPath: '',
    isUseMobilePage: 0,
    isUseBackPage: 0,
    isUseScript: 0,
    isOn: 0,
  });

  const getPageConfig = computed<SmartEditorPageConfig>(() => pageConfig);

  /**
   * 페이지 설정 데이터 저장
   * @param config
   */
  const updatePageConfig = (config: SmartEditorPageConfig): void => {
    pageConfig.layoutUid = config.layoutUid;
    pageConfig.mobilePageUid = config.mobilePageUid;
    pageConfig.backPageUid = config.backPageUid;
    pageConfig.scriptUid = config.scriptUid;
    pageConfig.pageName = config.pageName;
    pageConfig.pageCode = config.pageCode;
    pageConfig.htmlPath = config.htmlPath;
    pageConfig.isUseMobilePage = config.isUseMobilePage;
    pageConfig.isUseBackPage = config.isUseBackPage;
    pageConfig.isUseScript = config.isUseScript;
    pageConfig.isOn = config.isOn;
  };

  const setPageUid = (uid: string): void => {
    pageUid.value = uid;
  };

  const getPageUid = computed<string>(() => pageUid.value);

  /**
   * 페이지 설정 데이터 초기화
   */
  const clearPageConfig = (): void => {
    pageUid.value = '';
    pageConfig.layoutUid = '';
    pageConfig.mobilePageUid = '';
    pageConfig.backPageUid = '';
    pageConfig.scriptUid = '';
    pageConfig.pageName = '';
    pageConfig.pageCode = '';
    pageConfig.htmlPath = '';
    pageConfig.isUseMobilePage = 0;
    pageConfig.isUseBackPage = 0;
    pageConfig.isUseScript = 0;
    pageConfig.isOn = 0;
  };

  const isSetConfig = computed<boolean>(() => pageConfig.pageName !== '' && pageConfig.layoutUid !== '');

  const sections = ref<SectionData<SectionConfig>[]>([]);
  const addSectionIndex = ref<number>(-1);
  const sectionList = computed<SectionData<SectionConfig>[]>(() => sections.value);

  const sort = ref<boolean>(false);
  const sortState = computed<boolean>(() => {
    return sort.value;
  });
  const sortSwitching = (): void => {
    sort.value = !sort.value;
  };

  const sortMode = ref<boolean>(false);
  const sortModeState = computed<boolean>(() => sortMode.value);

  const toggleSortMode = (): void => {
    sortMode.value = !sortMode.value;
  };

  /**
   * 추가될 섹션의 위치 지정
   * @param index
   */
  const setAddSectionIndex = (index: number): void => {
    addSectionIndex.value = -1;

    if (index < sectionLength.value - 1 && index !== -1) {
      addSectionIndex.value = index + 1;
    }
  };

  const _sectionCount = ref<number>(1);

  const sectionCount = computed<number>(() => _sectionCount.value);

  /**
   * 섹션 데이터 설정
   * 이미지의 경우, 다중 선택과 상관없이 배열 형태로 전달 받는다
   * 해당 데이터를 각각 분리하여 섹션 데이터로 전환해주어야 한다.
   * @param type
   * @param config
   */
  // const setSection = (sectionType: ConstPageSectionTypeKeys, config: SectionConfig, pageSectionRelUid: string = ''): void => {
  const setSection = (sectionType: ConstPageSectionTypeKeys, config: SectionConfig, pageSectionRelUid: string = ''): void => {
    if (pageSectionRelUid) {
      config.pageSectionRelUid = pageSectionRelUid;
    }

    const addList: SectionData<SectionConfig> = {
      key: _sectionCount.value,
      pageSectionRelUid,
      sectionType,
      config: { ...config },
    };

    _sectionCount.value++;

    if (addSectionIndex.value >= 0) {
      sections.value.splice(addSectionIndex.value, 0, addList);
    } else {
      sections.value.push(addList);
    }
  };

  /**
   * 섹션 데이터 업데이트
   * @param index
   * @param config
   */
  const updateSection = (index: number, config: any): void => {
    sections.value[index].config = config;
  };

  /**
   * 섹션 삭제
   * @param index
   */
  const removeSection = (index: number): void => {
    sections.value.splice(index, 1);
  };

  /**
   * 모든 섹션 삭제
   */
  const removeSectionAll = (): void => {
    sections.value = [];
  };

  /**
   * 섹션 데이터 반환
   * @param index
   * @returns
   */
  const getSection = <T>(index: number): SectionData<T> => {
    return sections.value[index] as SectionData<T>;
  };

  const sortSection = (index: number, sort: number): void => {
    const [section] = sections.value.splice(index, 1);

    (sort === 1)
      ? sections.value.splice(index + 1, 0, section)
      : sections.value.splice(index - 1, 0, section);
  };

  const sectionLength = computed<number>(() => sectionList.value.length);

  const resetEditor = (): void => {
    clearPageConfig();
    sort.value = false;
    sortMode.value = false;
    sections.value = [];
    _sectionCount.value = 0;
    addSectionIndex.value = -1;
  };

  // 스마트 에디터에서 사용되는 options 항목
  const options = reactive<KeyIndex<OptionItem[]>>({
    page: [],
    layout: [],
    script: [],
    inputForm: [],
    rollingBanner: [],
    rollingList: [],
    import: [],
    comment: [],
    template: [],
  });

  const setOption = (flag: SmartPageOptionTypes, opt: OptionItem[]): void => {
    options[flag] = opt;
  };

  const api: KeyIndex<Function> = {
    layout: (param: GetLayoutsParam) => smartEditorApi.getLayouts(param),
    page: (param: GetPagesParam) => smartEditorApi.getPages(param),
    script: (param: GetScriptsParam) => smartEditorApi.getScripts(param),
    inputForm: (param: GetInputFormParam) => smartEditorApi.getInputForm(param),
    rollingBanner: (param: GetRollingBannerGrpsParam) => smartEditorApi.getRollingBannerGrps(param),
    rollingList: (param: GetRollingListGrpsParam) => smartEditorApi.getRollingListGrps(param),
    import: (param: GetImportsParam) => smartEditorApi.getImports(param),
    comment: (param: GetCommentGrpsParam) => smartEditorApi.getCommentGrps(param),
    template: (param: GetTemplatesParam) => myAppApi.getTemplates(param),
  };

  const success: KeyIndex<string> = {
    layout: getLayoutsMsg.SMART_LAYOUT_GET_SUCCESS,
    page: getPagesMsg.SMART_PAGE_GET_SUCCESS,
    script: getScriptsMsg.SMART_SCRIPT_GET_SUCCESS,
    inputForm: getInputFormMsg.SMART_INPUT_FORM_GET_SUCCESS,
    rollingBanner: getRollingBannerGrpsMsg.SMART_LIST_BANNER_GRP_GET_SUCCESS,
    rollingList: getRollingListGrpsMsg.SMART_LIST_ROLLING_GRP_GET_SUCCESS,
    import: getImportsMsg.SMART_IMPORT_GET_SUCCESS,
    comment: getCommentGrpsMsg.SMART_COMMENT_GRP_GET_SUCCESS,
    template: getTemplatesMsg.TEMPLATES_GET_SUCCESS,
  };

  /**
   * 사용되는 option 종류(sectionType)에 따라 key 값이 달라지기 때문에
   * 해당 문제를 해결하기 위한 설정이 필요
   * layout, page, script -> 일반형태(컴포넌트에 속하지 않음)
   * rollingBanner, rollingList, comment -> 자식 객체가 필요
   * 그외 일반 component 형태
   * @param flag
   * @returns
   */
  const _getTypeByKeys = (flag: SmartPageOptionTypes): string[] => {
    const notComp = ['layout', 'page', 'script', 'template'];
    const grpComp = ['rollingBanner', 'rollingList', 'comment'];
    const grp: string = (grpComp.indexOf(flag) > -1) ? 'Grp' : '';
    let key: string = `${flag}${grp}Uid`;

    if (notComp.indexOf(flag) === -1) {
      const firstChar = flag.charAt(0).toUpperCase();
      key = `comp${firstChar + flag.slice(1)}${grp}Uid`;
    }

    return [key, grp];
  };

  /**
   * 설정에 필요한 항목 호출 (options 생성)
   * @param flag
   * @returns
   */
  const optionCall = async (flag: SmartPageOptionTypes): Promise<void> => {
    try {
      const { code, results } = await api[flag]();

      if (code === success[flag]) {
        const [keyUid, grp] = _getTypeByKeys(flag);
        const records = results[`${flag}${grp}s`];

        if (records.length) {
          const opt: OptionItem[] = records.map((item: any) => {
            const obj: OptionItem = {
              text: item[`${flag}${grp}Name`] + (flag === 'page' ? ` (${item['pageCode']})` : ''),
              value: item[`${keyUid}`],
            };

            if (flag === 'page') {
              obj.add = item['isOn'] ? 'ON' : 'OFF';
              obj.code = item.pageCode;
            } else if (flag === 'template') {
              obj.add = item['sourceCode'];
            }

            return obj;
          });

          setOption(flag, opt);
        }
      }
    } catch (err) {
      util.axiosErrorCatch<OptionsRes>(err);
    }
  };

  /**
   * 새로운 페이지가 저장 되었을때 options.page 에 새로운 레코드 생성
   * @param pageUid
   */
  const addPageOption = (pageUid: string): void => {
    options.page.unshift({
      text: pageConfig.pageName,
      value: pageUid,
      add: pageConfig.isOn ? 'ON' : 'OFF',
    });

    setPageUid(pageUid);
  };

  /**
   * 페이지가 수정될때 기존 options.page의 내용 수정
   * @param pageUid
   */
  const changePageOption = (pageUid: string): void => {
    options.page.forEach(item => {
      if (item.value === pageUid) {
        item.text = pageConfig.pageName;
        item.add = pageConfig.isOn ? 'ON' : 'OFF';
        return;
      }
    });
  };

  /**
   * uid에 해당하는 option의 text 값을 반환
   * @param flag
   * @param uid
   * @returns
   */
  const getOptionName = (flag: SmartPageOptionTypes, uid: string): string => {
    const filter = options[flag].filter(item => item.value === uid);
    return filter[0] ? filter[0].text :  '';
  };

  return {
    sectionCount,

    sections,
    getPageConfig,
    updatePageConfig,
    setPageUid,
    getPageUid,
    clearPageConfig,
    isSetConfig,
    sectionList,

    sortState,
    sortSwitching,

    sortModeState,
    toggleSortMode,

    setAddSectionIndex,
    setSection,
    updateSection,
    getSection,
    removeSectionAll,
    removeSection,
    sortSection,
    sectionLength,
    resetEditor,

    optionCall,
    options,
    addPageOption,
    changePageOption,
    getOptionName,
  };
});