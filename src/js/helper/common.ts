import type { CHEVRON_COMBINE_TYPE, CombineItem } from '@/types/smart/component';
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { mdiChevronDoubleDown, mdiChevronDoubleUp, mdiChevronDown, mdiChevronUp } from '@/assets/svg/path';

import { CHEVRON_COMBINE } from '@/constants/smart/component';
import type { GetLayoutsRes } from '@/types/api/smartEditorApi';
import type { ListTableHeader } from '@/components/ListTable/types';
import type { OptionItem } from '@/components/types';
import type { ToastModel } from '@/components/Toast/types';
import type { UnwrapRef } from 'vue';
import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import { useUtil } from '@/js/util';

/**
 * 특정 상수값 값을 포함 여부 체크
 * @author hjs0810
 * @returns
 */
export const _isContains = <T extends V, V = string>(value: V, arr: T[]): value is T  => arr.some(v => v === value);


/**
 * TextField 숫자만 입력 가능
 * 입력가능 문자 : 숫자만 입력 가능
 * @author hjs0810
 */
export const useInputOnlyNumber = () => {

  /**
   * input 이벤트 핸들러
   * 숫자 이외의 문자열 포함시, 해당 문자열 제거에 입력한 포지션 유지.
   * @param $event
   */
  const onInputOnlyNumber = ($event: Event): void => {
    if (!($event instanceof InputEvent)) {
      return;
    }
    const { data, inputType } = $event;
    if (data) {
      const target: HTMLInputElement = ($event.target as HTMLInputElement);
      const isNumberic: boolean = Array.isArray(target.value.match(/^[0-9]+$/));
      if (isNumberic && inputType === 'insertText') {
        return;
      }

      const position: number = target.selectionStart || 1;
      if (!isNumberic) {
        target.value = target.value.replaceAll(/[^0-9]/gi, '');
      } 

      if (['insertCompositionText', 'insertText'].includes(inputType) && target.type !== 'number') {
        const _step: number = 1;
        target.selectionStart = position - _step;
        target.selectionEnd = position - _step;
      }

      // target.value 변해도, v-model 값만 replcace된 값으로 유지해야 하기에 bubbles X, captrue X 하지 않은 이벤트 전달.
      $event.target?.dispatchEvent(new InputEvent('input', { data: '', isComposing: false }));
    }
  };

  return {
    onInputOnlyNumber,
  };
};

export const useToast = (toast?: ToastModel) => {
  const Toast = toast ? toast : inject('Toast') as ToastModel;

  const defaultErrors = () => {
    Toast({
      message: 'Error: 고객센터에 문의를 남겨주세요.',
      color: 'danger',
    });
  };

  const deleteSuccess = () => {
    Toast('정상적으로 삭제되었습니다.');
  };

  const copySuccess = () => {
    Toast('정상적으로 복사되었습니다.');
  };

  const codeCopySuccess = () => {
    Toast('코드가 복사 되었습니다. Ctrl + V 로 붙여 넣기 하세요.');
  };

  return {
    Toast,
    defaultErrors,
    deleteSuccess,
    copySuccess,
    codeCopySuccess,
  };
};


interface UseListTableOption<H extends ListTableHeader = ListTableHeader> {
  checkAll?: boolean
  observer?: boolean
  emptyText?: string
  headers?: H[]
}
export const useListTable = <T, H extends ListTableHeader = ListTableHeader>(opt: UseListTableOption<H>) => {
  const checkAll = ref<boolean>(opt.checkAll === undefined ? false : opt.checkAll);
  const observer = ref<boolean>(opt.observer === undefined ? true : opt.observer);
  const loading = ref<boolean>(false);
  const emptyText = ref<string>(opt.emptyText || '데이터가 존재하지 않습니다.');
  const headers: H[] = opt.headers || [];
  const items = ref<T[]>([]);

  const changeObserver = async (value: boolean = true) => {
    observer.value = value;
    await nextTick();
  };

  const clearItems = async () => {
    if (observer.value) {
      await changeObserver(false);
    }
    items.value.splice(0, items.value.length);
  };

  const onObserve = async (callback: () => Promise<T[]>): Promise<void> => {
    loading.value = true;
    try {
      const res: T[] = await callback();
      if (items.value.length >= 0 && res.length > 0) {
        items.value.splice(items.value.length, 0, ...(res as UnwrapRef<T[]>));
      }
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('고객센터에 문의를 남겨주세요.');
    } finally {
      loading.value = false;
    }
  };

  watch(() => loading.value, () => {
    if (loading.value) {
      emptyText.value = '';
    } else {
      emptyText.value = opt.emptyText || '데이터가 존재하지 않습니다.';
    }
  });

  return {
    checkAll,
    observer,
    loading,
    emptyText,
    headers,
    items,
    onObserve,
    clearItems,
    changeObserver
  };
};

export const useSearchForm = (options?: OptionItem[]) => {
  const searchField = ref<string>('');
  const searchFieldOptions: OptionItem[] = ([ ...(options || []) ]);
  const searchText = ref<string>('');

  const onFilter = (items: any[]): any => {
    if (searchField.value) {
      return items.filter((item: any) => (item[searchField.value] as string).includes(searchText.value));
    }

    return items.filter((item: any) => {
      let res = false;
      for (let index = 0; index < searchFieldOptions.length; index++) {
        const option = searchFieldOptions[index];
        const key: string = `${option.value}`;
        if (key) {
          res = (item[key] as string).includes(searchText.value);
          if (res) {
            break;
          }
        }
      }
      return res;
    });
  };

  type SearchParam = {
    column?: string
    word: string
  };

  const getSearchParams = (encodeURI: boolean = true): string => {
    const req: SearchParam = {
      word: encodeURIComponent(searchText.value)
    };

    if (searchField.value) {
      req.column = searchField.value;
    }

    const res: string = Object.keys(req).map(key => `${key}=${req[key as keyof SearchParam]}`).join('&');
    return encodeURI ? encodeURIComponent(res) : res;
  };

  return {
    searchField,
    searchFieldOptions,
    searchText,
    onFilter,
    getSearchParams,
  };
};

export const useLayoutSelectBox = <T extends OptionItem = OptionItem>() => {
  const util = useUtil();
  const smartEditorApi = useSmartEditorApi();

  const isLoading = ref<boolean>(false);
  const layoutOptions = ref<T[]>([]);

  const getLayoutText = computed(() => (v: string) => layoutOptions.value.find(item => item.value === v)?.text || '');

  const _getLayouts = async (): Promise<void> => {
    const res: GetLayoutsRes = await smartEditorApi.getLayouts();

    const { layouts } = res.results;
    layoutOptions.value = layouts.map(({ layoutUid, layoutName }) =>
      ({ value: layoutUid, text: layoutName })) as UnwrapRef<T[]>;
  };


  const clearOptions = () => {
    layoutOptions.value.splice(0, layoutOptions.value.length);
  };

  const onLoadOptions = async (): Promise<void> => {
    try {
      isLoading.value = true;
      await _getLayouts();
    } catch (err) {
      util.axiosErrorCatch<GetLayoutsRes>(err);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    onLoadOptions();
  });

  onUnmounted(() => {
    clearOptions();
  });

  return {
    isLoading,
    layoutOptions,
    getLayoutText,
    onLoadOptions,
    clearOptions
  };
};

export const useChevronBtns = () => {
  const clickDoubbleDown = <T extends CombineItem>(items: T[]): void => {
    const checkedItem = items.filter((item: CombineItem) => item.checked);
    const res = [ ...items.filter((item: CombineItem) => !item.checked), ...checkedItem ];
    items.splice(0, items.length, ...res);
  };

  const clickDown = <T extends CombineItem>(items: T[]): void => {
    const res = [ ...items  ];
    for (let index = res.length - 1; index >= 0; index--) {
      if (!res[index].checked) {
        continue;
      }
      _combineItem(res, index, index + 1);
    }
    items.splice(0, items.length, ...res);
  };

  const clickUp = <T extends CombineItem>(items: T[]): void => {
    const res = [ ...items  ];
    for (let index = 0; index < res.length; index++) {
      if (!res[index].checked) {
        continue;
      }
      _combineItem(res, index, index - 1);
    }
    items.splice(0, items.length, ...res);
  };

  const clickDoubbleUp = <T extends CombineItem>(items: T[]): void => {
    const checkedItem = items.filter((item: CombineItem) => item.checked);
    const res = [ ...checkedItem, ...items.filter((item: CombineItem) => !item.checked)  ];
    items.splice(0, items.length, ...res);
  };

  const _combineItem = <T extends CombineItem>(items: T[], start: number, to: number): void => {
    if (to < 0 || to >= items.length) {
      return;
    }

    if (items[to].checked) {
      return;
    }

    const item: T = items[start];
    items.splice(start, 1);
    items.splice(to, 0, item);
  };

  const chevronBtns: { value: CHEVRON_COMBINE_TYPE, icon: string, onClick: <T extends CombineItem>(items: T[]) => void }[] = [
    { value: CHEVRON_COMBINE.CHEVERON_DOUBBLE_DOWN, icon: mdiChevronDoubleDown, onClick: clickDoubbleDown },
    { value: CHEVRON_COMBINE.CHEVERON_DOWN, icon: mdiChevronDown, onClick: clickDown },
    { value: CHEVRON_COMBINE.CHEVERON_UP, icon: mdiChevronUp, onClick: clickUp },
    { value: CHEVRON_COMBINE.CHEVERON_DOUBBLE_UP, icon: mdiChevronDoubleUp, onClick: clickDoubbleUp },
  ];

  return {
    chevronBtns,
    clickDoubbleDown,
    clickDown,
    clickUp,
    clickDoubbleUp,
  };
};