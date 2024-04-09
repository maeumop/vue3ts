<script setup lang='ts'>
import {
  ref,
  reactive,
  computed,
  toValue,
  nextTick,
} from 'vue';
import { v1 as uuid } from 'uuid';

import type { Rules, OptionItem } from '@/components/types';
import type { ListTableHeader } from '@/components/ListTable/types';

import type { ContentItem } from '@/types/store/modules/ftp';
import type { CombineItem, SelectImagesMdoal } from '@/types/smart/component';
import type { RollingBannerGrpItem, GetRollingBannersRes, PutRollingBannerItem, PutRollingBannersParam, PutRollingBannersRes } from '@/types/api/smartEditorApi';
import type { RollingBannerEditFormItem } from '@/types/smart/component/rollingBanner';


import { CONST_CODES } from '@/constants/common';
import { useToast, useListTable, useChevronBtns } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import Modal from '@/components/Modal/index.vue';
import ListTable from '@/components/ListTable/index.vue';
import ListTableCheckbox from '@/components/ListTable/listCheck.vue';
import FtpImage from '@/views/common/ftp/image/index.vue';
import SelectImages from '@/views/common/ftp/layer/SelectImages/index.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

type OnOpenOption = {
  target: RollingBannerGrpItem
};

const { LINK_TYPE } = CONST_CODES;
const { NONE, NEW_WINDOW, CURRENT_WINDOW } = LINK_TYPE;

const util = useUtil();
const smartEditorApi = useSmartEditorApi();


// emit
const emit = defineEmits<{
  // 배너 수정 완료 이벤트
  (event: 'on:editComponent', value: RollingBannerGrpItem): void;
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();


// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'| '$refs' | '$nextTick'>>();
const validateForm = ref<ValidateFormModel>();
const listTableEL = ref<Pick<InstanceType<typeof ListTable>, 'checkedToggle'| '$nextTick'>>();

// readonly
const modalId = 'smartLayerBannersEditor';
let _bannerGroup: RollingBannerGrpItem|null = null;

// readonly values ==============================================================================================================


const _tableHeader: ListTableHeader[] = [
  { text: '순서', align: 'center', width: '60px' },
  { text: '이미지', width: '130px', },
  { text: '기타설정',  },
];

const _linkTargetOptions: OptionItem[]
  = [ NONE, NEW_WINDOW, CURRENT_WINDOW ].map(({ VAL, TXT }) => ({ value: VAL, text: TXT }));

const _rule: Rules = {
  default: [
    (v: string) => (!!v) || '필수 입력값입니다.',
  ],
  link: [
    (v: string) =>
      ((v) ? (Array.isArray(v.match(util.getRegExp('url')))) : false) || '‘http://’ 또는 ‘https://’ 포함한 링크를 입력해주세요.',
  ],
};

const _editorFormItem: RollingBannerEditFormItem = {
  checked: false,
  imagePath: '',
  imageProperty: '',
  linkType: NONE.VAL,
  link: '',
} as const;

// END readonly values ==========================================================================================================

// 팝업들 설정 =========================
// selectImages : 이미지 선택 팝업

type ModalType =  {
  selectImages: SelectImagesMdoal<RollingBannerEditFormItem>,
};
type ModalKeys = keyof ModalType;

let modal = reactive<ModalType>({
  selectImages: { show: false, multiple: true, target: null },
});

const onPopupClose = (key: ModalKeys): void => {
  modal[key].show = false;
  if (modal[key].target) {
    modal[key].target = null;
  }
};
// END - 팝업들 설정 ====================

const { chevronBtns } = useChevronBtns();


// data()
let isShow = ref<boolean>(false);
let disabled = ref<boolean>(true);
let eventLoading = ref<boolean>(false);

const { Toast } = useToast();

const listTable = useListTable<RollingBannerEditFormItem>({ checkAll: true, headers: _tableHeader });
let { checkAll, loading, emptyText } = listTable;

// computed
// 해당하는 boolean 값중에서 하나라도 true 이면, esc-close 수행 불가.
const isEscClose = computed<boolean>(() => ![ eventLoading.value, modal['selectImages'].show ].some((v: boolean) => v));
const editorFormItems = computed<RollingBannerEditFormItem[]>(() => toValue(listTable.items));
const checkedItem = computed(() => editorFormItems.value.filter((item: RollingBannerEditFormItem) => item.checked));
const linkRules = computed(() => (item: RollingBannerEditFormItem) => {
  if (item.linkType === LINK_TYPE.NONE.VAL) {
    return [];
  }

  return _rule.link;
});

// method
const _getRollingBanners = async (): Promise<RollingBannerEditFormItem[]> => {

  if (!_bannerGroup) {
    throw new Error('참조할 수 있는 _listGroup 값이 아닙니다.');
  }

  const { compRollingBannerGrpUid } = _bannerGroup;
  const res: GetRollingBannersRes = await smartEditorApi.getRollingBanners(compRollingBannerGrpUid);


  const { rollingBanners } = res.results;
  return rollingBanners.map(item => ({ ...item, checked: false }));
};

/**
 * LayerPopup 활성
 * @author hjs0620
 * @returns
 */
const onOpen = async (params: OnOpenOption): Promise<void> => {
  try {
    if (isShow.value) {
      throw new Error('작업을 진행중이십니다.');
    }

    _bannerGroup = Object.freeze({ ...params.target });

    listTable.onObserve(() => _getRollingBanners())
      .catch((err) =>  util.axiosErrorCatch<GetRollingBannersRes>(err));

    isShow.value = true;
  } catch (error) {
    let err: Error = new Error('고객센터에 문의를 남겨주세요.');
    if (error instanceof Error) {
      err = error;
    }

    return Promise.reject(err);
  }
  return  Promise.resolve();
};


/**
 * Modal 컴포넌트의 close 함수 수행.
 * @author hjs0620
 * @returns
 */
const onClose = (): void => modalEL.value?.close();

const validation = (): void => {
  disabled.value && (disabled.value = false);
};

/**
 * Modal 컴포넌트의 update:modelValue 이벤트 핸들러
 * Modal 컴포넌트의 close 함수 수행시 발생하는 이벤트를 캐치하여 모달을 종료를 수행합니다.
 * @author hjs0619
 * @returns
 */
const onCloseModal = (): void => {
  modalEL.value?.$nextTick(() => {
    listTable.clearItems();
    _bannerGroup = null;
    disabled.value = true;
    isShow.value = false;
    emit('on:close');
  });
};

/**
 * 체크 박스 이벤트 핸들러
 * @author hjs0622
 * @param {checked} checked 변경 값
 * @param {number} index editorFormItems.value의 index
 * @returns
 */
const onCheckItem = (checked: boolean, index: number = -1): void => {
  if (loading.value) {
    return;
  }

  if (index >= 0) {
    // 단일 체크
    editorFormItems.value[index].checked = checked;
    listTableEL.value?.checkedToggle(checkedItem.value.length === editorFormItems.value.length);
    return;
  }

  // 다중 체크
  if (checked && checkedItem.value.length < editorFormItems.value.length) {
    // 전체 처크
    editorFormItems.value.forEach((item: RollingBannerEditFormItem) => {
      item.checked = true;
    });
  } else if (!checked && checkedItem.value.length === editorFormItems.value.length) {
    // 전체 체크 해제
    editorFormItems.value.forEach((item: RollingBannerEditFormItem) => {
      item.checked = false;
    });
  }
};


/**
 * SelectImages 컴포넌트의 on:close 이벤트 핸들러
 * @author hjs0622
 * @returns
 */
const onCloseSelectImagesMdoal = (): void => {
  onPopupClose('selectImages');
  nextTick(() => {
    const modalDiv: HTMLDivElement = modalEL.value?.$refs.modal as HTMLDivElement;
    // focus 다시 되돌려 주기
    modalDiv.focus();
  });
};

/**
 * SelectImages 활성
 * @param {boolean} multiple 이미지 다중 여부
 * @param {number} index 이미지 변경할 editorFormItems.value의 index
 * @author hjs0622
 * @returns
 */
const openSelectImagesMdoal = (multiple: boolean = true, index?: number): void => {
  if (loading.value) {
    return;
  }

  try {
    const _key: ModalKeys = 'selectImages';
    if (!multiple) {
      if (index === undefined || (index < 0 || index >= editorFormItems.value.length)) {
        throw new Error('참조할 수 없는 index입니다.');
      }

      modal[_key].target = editorFormItems.value[index];
    }

    validation();
    modal[_key].multiple = multiple;
    modal[_key].show = true;
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

/**
 * 이미지 [ 추가 | 변경 ] 기능을 수행
 * @author hjs0622
 * @param {ContentItem | ContentItem[]} value SelectImages 컴포넌트에서 선택한 이미지 객체
 * @returns
 */
const onLoadImages = (value: ContentItem | ContentItem[]): void => {
  try {
    const _key: ModalKeys = 'selectImages';
    if (modal[_key].multiple) {
      // 객체 이미지 등록
      const res: RollingBannerEditFormItem[] = (value as ContentItem[])
        .map(item => ({ ..._editorFormItem, imagePath: `${item.src}?dt=${item['last-modified']}`, compRollingBannerUid: uuid() } as RollingBannerEditFormItem));
      const arr: RollingBannerEditFormItem[] = [ ...editorFormItems.value ];
      arr.forEach((item: RollingBannerEditFormItem) => {
        item.checked = false;
      });

      editorFormItems.value
        .splice(0, editorFormItems.value.length, ...arr, ...res);
      listTableEL.value?.checkedToggle();
    } else {
      // 선택한 객체 이미지 변경
      const image: ContentItem = value as ContentItem;
      modal[_key].target!.imagePath = `${image.src}?dt=${image['last-modified']}`;
    }
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};


/**
 * 제거 버튼 클릭이벤트 핸들러
 * 선택한 배너객체들 제거 기능을 수행
 * @author hjs0622
 * @returns
 */
const onClickDeleteBtn = (): void => {
  if (loading.value) {
    return;
  }

  editorFormItems.value
    .splice(0, editorFormItems.value.length,
            ...editorFormItems.value.filter(({ checked }) => !checked));

  if (checkedItem.value.length < 1) {
    // 선택된 객체 없으면 전체 선택 체크 박스 해제
    listTableEL.value?.checkedToggle();
  }

  validation();
};

/**
 * 객체 이동 버튼 클릭이벤트 핸들러
 * 선택한 배너객체들 버튼의 callback함수 기능을 수행
 * @author hjs0622
 * @returns
 */
const onClickChevronBtn = async (callback: <T extends CombineItem>(items: T[]) => void): Promise<void> => {
  if (loading.value) {
    return;
  }

  let arr = [ ...editorFormItems.value ];
  try {
    await callback(arr);
  } catch (err) {
    console.error(err);
    // defaultErrors();
  } finally {
    listTableEL.value?.$nextTick(() => {
      editorFormItems.value
        .splice(0, editorFormItems.value.length, ...arr);
      validation();
    });
  }
};

/**
 * 링크 설정 값 변경 이벤트 핸들러
 * @param value {string}
 * @param item {RollingBannerEditFormItem}
 * @returns
 */
const onUpdateLinkType = (value: string, item: RollingBannerEditFormItem): void => {
  if (value === LINK_TYPE.NONE.VAL) {
    // 링크 없음 선택시, 링크 정보 초기화 진행.
    item.link = '';
  }
};

/**
 * 저장 버튼 클릭 이벤트 핸들러
 * @author hjs0622
 * @returns
 */
const onSave = async (): Promise<void> => {

  if (!editorFormItems.value.length) {
    Toast({
      message: '1개 이상의 배너를 등록해 주세요.',
      color: 'warning',
    });
    return;
  }

  if (!disabled.value && validateForm.value?.validate()) {
    try {
      // 수행할 이벤트
      eventLoading.value = true;
      validateForm.value?.formProtection(true);
      await _saveConmponent();
      onClose();
    } catch (err) {
      util.axiosErrorCatch<PutRollingBannersRes>(err);
    } finally {
      validateForm.value?.formProtection(false);
      eventLoading.value = false;
    }
  }
};

/**
 * 컴포넌트 저장버튼 클릭이벤트
 * @author hjs0620
 * @returns
 * @throws
 */
const _saveConmponent = async (): Promise<void> => {
  if (!_bannerGroup) {
    throw new Error('참조할 수 있는 _bannerGroup 값이 아닙니다.');
  }

  const { compRollingBannerGrpUid } = _bannerGroup;
  const req: PutRollingBannersParam = {
    items: editorFormItems.value
      .map(item =>({
        compRollingBannerUid: item.compRollingBannerUid,
        imagePath: item.imagePath,
        imageProperty: item.imageProperty || undefined,
        linkType: item.linkType || LINK_TYPE.NONE.VAL,
        link: item.link || undefined,

      } as PutRollingBannerItem ))
  };

  await smartEditorApi.putRollingBanners(compRollingBannerGrpUid, req);


  emit('on:editComponent', Object.assign({ }, _bannerGroup));
  Toast('정상적으로 저장되었습니다.');
};

defineExpose({
  onOpen,
  onClose
});
</script>
<script lang='ts'> export default { name: 'SmartRollingBannerLayerBannerEditor' };</script>
<template>
  <Modal
    access-back
    :id="modalId"
    ref="modalEL"
    class="smartRollingBanner smartLayerBannerEditor"
    width="980px"
    title="배너 관리"
    :esc-close="isEscClose"
    :model-value="isShow"
    @checked="onCheckItem"
    @update:model-value="onCloseModal"
  >
    <template #body>
      <div class="row">
        <div class="col">
          <h3>배너 리스트 ({{ editorFormItems.length.numberFormat() }})</h3>
        </div>
      </div>
      <div class="flex gap-8 mt-20">
        <StyledButton small outline @click="openSelectImagesMdoal"> 배너 추가 </StyledButton>
        <StyledButton
          small
          outline
          :disabled="checkedItem.length < 1"
          @click="onClickDeleteBtn"
        >
          제거
        </StyledButton>
        <StyledButton
          small
          outline
          only-icon
          :key="index"
          :icon="item.icon"
          :disabled="checkedItem.length < 1"
          @click="onClickChevronBtn(item.onClick)"
          v-for="(item, index) in chevronBtns"
        />
      </div>
      <ValidateForm
        ref="validateForm"
        class="mt-10"
        v-if="isShow"
      >
        <ListTable
          ref="listTableEL"
          class="border"
          height="520px"
          :check-all="checkAll"
          :empty-text="emptyText"
          :loading="loading"
          :header="listTable.headers"
          :items="editorFormItems.length ? [editorFormItems] : []"
          @checked="onCheckItem"
        >
          <template #items>
            <tr :key="item.compRollingBannerUid" v-for="(item, index) in editorFormItems">
              <td>
                <ListTableCheckbox
                  name="list"
                  :value="`key${index}`"
                  :is-checked="item.checked"
                  @checked="onCheckItem(!item.checked, index)"
                />
              </td>
              <td class="text-center">
                <span>{{ index+1 }}</span>
              </td>
              <td>
                <div class="flex-center">
                  <FtpImage
                    height="80px"
                    :src="item.imagePath"
                    @click="openSelectImagesMdoal(false, index)"
                  />
                </div>
              </td>
              <td class="dlWrapper">
                <dl>
                  <dt class="flex-center">
                    <div class="width-100 height-40">
                      <span class="custom">
                        링크 설정
                      </span>
                    </div>
                  </dt>
                  <dd>
                    <div class="row">
                      <SelectBox
                        block
                        hide-message
                        placeholder="선택"
                        class="col-3"
                        :validate="_rule.default"
                        :options="_linkTargetOptions"
                        @blur="validation()"
                        @update:model-value="onUpdateLinkType($event, item)"
                        v-model="item.linkType"
                      />
                      <TextField
                        block
                        class="col-7"
                        max-length="1500"
                        placeholder="https://, http를 포함한 링크를 입력해 주세요."
                        :disabled="item.linkType === LINK_TYPE.NONE.VAL"
                        :validate="linkRules(item)"
                        @blur="validation()"
                        v-model="item.link"
                      />
                    </div>
                  </dd>
                </dl>
                <dl>
                  <dt class="flex-center">
                    <div class="width-100 height-40">
                      <span class="custom">
                        이미지 속성
                      </span>
                    </div>
                  </dt>
                  <dd>
                    <div class="flex">
                      <TextField
                        block
                        hide-message
                        class="col mx-2"
                        max-length="500"
                        placeholder="<img> 태그에 추가할 속성을 입력해 주세요. Ex) alt, id, class, style 등"
                        @blur="validation()"
                        v-model="item.imageProperty"
                      />
                    </div>
                  </dd>
                </dl>
              </td>
            </tr>
          </template>
        </listtable>
      </ValidateForm>
      <SelectImages
        :multiple="modal['selectImages'].multiple"
        @close="onCloseSelectImagesMdoal"
        @load-images="onLoadImages"
        v-if="modal['selectImages'].show"
      />
    </template>
    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
          color="primary"
          :disabled="disabled"
          :loading="eventLoading"
          @click="!eventLoading && onSave()"
        >
          저장
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline :disabled="eventLoading" @click="close">
          닫기
        </StyledButton>
      </div>
    </template>
  </Modal>
</template>