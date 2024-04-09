<script setup lang="ts">
import { ref, reactive, watch, computed, inject } from 'vue';
import type { KeyIndex, Options } from '@/types/common';
import type { RuleFunc } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ConstPageSectionTypeKeys } from '@/types/common';
import type { BannerSectionConfig } from '@/types/api/smartEditorApi';
import {
  mdiArrowUp,
  mdiArrowDown,
  mdiArrowLeft,
  mdiArrowRight,
  mdiArrowBottomLeft,
  mdiArrowBottomRight,
  mdiArrowTopLeft,
  mdiArrowTopRight,
  mdiImageFilterCenterFocus,
} from '@/assets/svg/path';
import { CONST_CODES } from '@/constants/common';
import { useEditorStore } from '@/store';
import { _isContains } from '@/js/helper/common';
import type { ToastModel } from '@/components/Toast/types';
import type { ModalModel } from '@/components/Modal/types';
import ImageSelector from '@/views/common/ImageSelector/index.vue';
import { useUtil } from '@/js/util';

const {
  PAGE_SECTION_TYPE: { FIXED_BANNER },
  BANNER_POSITION,
  LINK_TYPE,
  LINK_TYPE: {
    NONE,
    NEW_WINDOW,
    CURRENT_WINDOW,
    MOVE_SECTION,
    LAYER_POPUP
  }
} = CONST_CODES;

const emit = defineEmits<{
  (event: 'close', flag: ConstPageSectionTypeKeys): void
}>();

const props = withDefaults(defineProps<{
  index?: number
}>(), {
  index: -1
});

const { getSection, setSection, updateSection } = useEditorStore();
const Toast = inject('Toast') as ToastModel;
const modal = ref<ModalModel>();
const util = useUtil();

let isShow = ref<boolean>(true);
let isPass = ref<boolean>(true);

const linkType: Options[] = [
  { text: '링크없음', value: NONE.VAL, },
  { text: '새 창에서 열기', value: NEW_WINDOW.VAL, },
  { text: '현재 창에서 열기', value: CURRENT_WINDOW.VAL, },
  { text: '섹션 이동', value: MOVE_SECTION.VAL, },
  { text: '레이어 모달 띄우기', value: LAYER_POPUP.VAL, },
];

const alignIcons: KeyIndex<string> = {
  LEFT_TOP: mdiArrowTopLeft,
  TOP: mdiArrowUp,
  RIGHT_TOP: mdiArrowTopRight,
  LEFT: mdiArrowLeft,
  CENTER: mdiImageFilterCenterFocus,
  RIGHT: mdiArrowRight,
  LEFT_BOTTOM: mdiArrowBottomLeft,
  BOTTOM: mdiArrowDown,
  RIGHT_BOTTOM: mdiArrowBottomRight,
};

const bannerButtons: KeyIndex<string>[] = [];

Object.entries(BANNER_POSITION).forEach(([key]) => {
  if (key !== 'VAL' && key !== 'TXT') {
    bannerButtons.push({
      icon: alignIcons[key],
      value: key,
    });
  }
});

const config = reactive<BannerSectionConfig>({
  sectionFixedBannerUid: '',
  pageSectionRelUid: '',
  imagePath: '',
  imageProperty: '',
  linkType: NONE.VAL,
  link: '',
  bannerPosition: '',
  divProperty: '',
  isLayerPopup: 0,
});

const rules: KeyIndex<RuleFunc[]> = {
  input: [v => !!v || '필수 입력 사항압니다.'],
  select: [v => !!v || '필수 선택 사항입니다.'],
};

watch(isShow, (v) => {
  if (!v) {
    emit('close', FIXED_BANNER.VAL);
  }
});

const isLinkType = computed<boolean>(() => {
  return  _isContains(config.linkType, [NEW_WINDOW.VAL, CURRENT_WINDOW.VAL]);
});

const linkPlaceholder = computed<string>(() => isLinkType.value ? 'https, http를 포함한 링크를 입력해 주세요.' : 'id 속성 값을 입력해 주세요.');

const linkUrlPattern = computed<[RegExp, string] | null>(() => {
  if (config.linkType === LINK_TYPE.NEW_WINDOW.VAL || config.linkType === LINK_TYPE.CURRENT_WINDOW.VAL) {
    return [util.getRegExp('domain'), '‘http://’ 또는 ‘https://’ 포함한 링크를 입력해주세요.'];
  }

  return null;
});

const positionSelect = (v: string): void => {
  config.bannerPosition = v;
  validation();
};

const form = ref<ValidateFormModel>();

const validation = (): void => {
  if (!isPass.value) {
    isPass.value = true;
  }
};

const save = (close: Function): void => {
  if (form.value?.validate()) {
    if (props.index > -1) {
      updateSection(props.index, config);
    } else {
      setSection(FIXED_BANNER.VAL, config);
    }

    close();
  }
};

const sectionTitle = computed<string>(() => '고정 배너 ' + (props.index > -1 ? '수정' : '등록'));

const changedLinkType = (): void => {
  form.value?.resetValidate();
  config.link = '';
  validation();
};

if (props.index > -1) {
  const data = getSection<BannerSectionConfig>(props.index);

  if (!data) {
    Toast({ color: 'danger', message: '해당 섹션의 데이터가 없습니다!!!' });
    modal.value?.close();
  } else {
    isPass.value = false;

    config.sectionFixedBannerUid = data.config.sectionFixedBannerUid;
    config.pageSectionRelUid = data.config.pageSectionRelUid;
    config.imagePath = data.config.imagePath;
    config.imageProperty = data.config.imageProperty;
    config.linkType = data.config.linkType;
    config.link = data.config.link;
    config.bannerPosition = data.config.bannerPosition;
    config.divProperty = data.config.divProperty;
    config.isLayerPopup = data.config.isLayerPopup;
  }
}
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    width="1000px"
    :title="sectionTitle"
    id="editorSectionBanner"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="form" class="config-box">
        <div class="config-box-left">
          <div class="row">
            <div class="col">
              <ValidateWrap
                required
                label="이미지"
                :validate="rules.select"
                :check-value="config.imagePath"
              >
                <ImageSelector
                  icon-size="100"
                  width="400px"
                  height="400px"
                  @update:model-value="validation"
                  v-model="config.imagePath"
                />
              </ValidateWrap>
            </div>
          </div>

        </div>
        <div class="config-box-right">
          <div class="row pt-15">
            <div class="col">
              <CheckButton
                required
                type="radio"
                label="링크 설정"
                :line-limit="3"
                :items="linkType"
                @update:after="changedLinkType"
                v-model="config.linkType"
              />
            </div>
          </div>
          <div class="row pt-15" v-if="config.linkType !== NONE.VAL">
            <div class="col">
              <TextField
                block
                required
                :placeholder="linkPlaceholder"
                :pattern="linkUrlPattern"
                :validate="rules.input"
                @blur="validation"
                v-model="config.link"
              />
            </div>
          </div>
          <div class="row pt-15">
            <div class="col">
              <ValidateWrap
                required
                label="고정 위치"
                :validate="rules.select"
                :check-value="config.bannerPosition"
                @update:check-value="validation"
              >
                <ul class="banner-position">
                  <template :key="`banner-button-${item.value}`" v-for="(item) in bannerButtons">
                    <li
                      :class="[item.value, { selected: config.bannerPosition === item.value }]"
                      @click.prevent="positionSelect(item.value)"
                    >
                      <SvgIcon type="mdi" :path="item.icon" />
                    </li>
                  </template>
                </ul>
              </ValidateWrap>
            </div>
          </div>
          <div class="row pt-15">
            <div class="col">
              <TextField
                block
                label="이미지 속성"
                placeholder="<img> 태그에 추가할 속성을 입력해 주세요. Ex) alt, id, class, style 등"
                @blur="validation"
                v-model="config.imageProperty"
              />
            </div>
          </div>
          <div class="row pt-15">
            <div class="col">
              <TextField
                block
                label="DIV 속성"
                placeholder="<div> 태그에 추가할 속성을 입력해 주세요. Ex) id, class, style 등"
                @blur="validation"
                v-model="config.divProperty"
              />
            </div>
          </div>
          <!-- <div class="row pt-15">
            <div class="col">
              레이어 모달 설정
            </div>
            <div class="col col-3">
              <SwitchButton
                :true-value="1"
                :false-value="0"
                :label="['설정안함', '설정']"
                @blur="validation"
                v-model="config.isLayerPopup"
              />
            </div>
          </div> -->
        </div>
      </ValidateForm>
    </template>

    <template #action="{ close }">
      <StyledButton outline @click="close">취소</StyledButton>
      <StyledButton
        color="primary"
        class="ml-5"
        :disabled="!isPass"
        @click="save(close)"
      >
        적용
      </StyledButton>
    </template>
  </Modal>
</template>
