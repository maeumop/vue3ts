<script setup lang="ts">
import { ref, reactive, computed, watch, inject } from 'vue';
import type { ConstPageSectionTypeKeys, KeyIndex, Options } from '@/types/common';
import type { RuleFunc } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ImageSectionConfig } from '@/types/api/smartEditorApi';
import { CONST_CODES } from '@/constants/common';
import { useEditorStore } from '@/store';
import type { ContentItem } from '@/types/store/modules/ftp';
import type { ModalModel } from '@/components/Modal/types';
import ImageSelector from '@/views/common/ImageSelector/index.vue';
import type { ToastModel } from '@/components/Toast/types';
import { useUtil } from '@/js/util';

const {
  PAGE_SECTION_TYPE: { IMAGE },
  LINK_TYPE,
  LINK_TYPE: {
    NONE,
    CURRENT_WINDOW,
    NEW_WINDOW,
    MOVE_SECTION,
    LAYER_POPUP,
  }
} = CONST_CODES;

const { setSection, getSection, updateSection } = useEditorStore();

const emit = defineEmits<{
  (event: 'close', value: ConstPageSectionTypeKeys): void
}>();

const props = withDefaults(defineProps<{
  index: number
}>(), {
  index: -1
});

const util = useUtil();
const modal = ref<ModalModel>();
const Toast = inject('Toast') as ToastModel;

let isShow = ref<boolean>(true);
let isPass = ref<boolean>(false);

const linkType: Options[] = [];

Object.entries(LINK_TYPE).forEach(([key, item]: any) => {
  if (key !== 'VAL' && key !== 'TXT') {
    linkType.push({
      text: item.TXT,
      value: item.VAL,
    });
  }
});

const config = reactive<ImageSectionConfig>({
  sectionImageUid: '',
  pageSectionRelUid: '',
  imagePath: '',
  imageProperty: '',
  linkType: NONE.VAL,
  link: '',
  divProperty: '',
  isLayerPopup: 0,
});

const rules: KeyIndex<RuleFunc[]> = {
  input: [v => !!v || '필수 입력 사항압니다.'],
  select: [v => !!v || '필수 선택 사항입니다.'],
};

watch(isShow, (v) => {
  if (!v) {
    emit('close', IMAGE.VAL);
  }
});

const linkPlaceholder = computed<string>(() => {
  if (config.linkType === CURRENT_WINDOW.VAL || config.linkType === NEW_WINDOW.VAL) {
    return 'https, http를 포함한 링크를 입력해 주세요.';
  } else if (config.linkType === MOVE_SECTION.VAL || config.linkType === LAYER_POPUP.VAL) {
    return 'id 속성 값을 입력해 주세요.';
  }

  return '';
});

/**
 * 이미지가 여러장 선택 되었을 경우 처리
 * @param images
 * @param close
 */
const imageMultiSelected = (images: ContentItem[], close: Function): void => {
  images.forEach(img => {
    config.imagePath = img.src!;
    setSection(IMAGE.VAL, config);
  });

  close();
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
      setSection(IMAGE.VAL, config);
    }

    close();
  }
};

const changedLink = (): void => {
  config.link = '';
  form.value?.resetValidate();
  validation();
};

const linkUrlPattern = computed<[RegExp, string] | null>(() => {
  if (config.linkType === LINK_TYPE.NEW_WINDOW.VAL || config.linkType === LINK_TYPE.CURRENT_WINDOW.VAL) {
    return [util.getRegExp('url'), '‘http://’ 또는 ‘https://’ 포함한 링크를 입력해주세요.'];
  }

  return null;
});

const sectionTitle = computed<string>(() => '이미지 ' +  (props.index > -1 ? '수정' : '등록'));

if (props.index > -1) {
  const data = getSection<ImageSectionConfig>(props.index);

  if (!data) {
    Toast({ color: 'danger', message: '해당 섹션의 데이터가 없습니다!!!' });
    modal.value?.close();
  } else {
    // 이미지 데이터는 배열 형태로 저장 되어야 하고,
    // 저장시에 각각으로 분리 하여 저장하여야 한다.
    config.sectionImageUid = data.config.sectionImageUid;
    config.pageSectionRelUid = data.config.pageSectionRelUid;
    config.imagePath = data.config.imagePath;
    config.imageProperty = data.config.imageProperty;
    config.linkType = data.config.linkType;
    config.link = data.config.link;
    config.divProperty = data.config.divProperty;
    config.isLayerPopup = data.config.isLayerPopup;
  }
}
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    width="950px"
    :title="sectionTitle"
    id="editorSectionImage"
    v-model="isShow"
  >
    <template #body="{ close }">
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
                  multiple
                  width="400px"
                  height="400px"
                  icon-size="200"
                  @selected="imageMultiSelected($event, close)"
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
                @update:after="changedLink"
                v-model="config.linkType"
              />
            </div>
          </div>
          <div class="row pt-15" v-if="config.linkType !== LINK_TYPE.NONE.VAL">
            <div class="col">
              <TextField
                block
                required
                :placeholder="linkPlaceholder"
                :pattern="linkUrlPattern"
                :validate="rules.input"
                @input="validation"
                v-model="config.link"
              />
            </div>
          </div>
          <div class="row pt-15">
            <div class="col">
              <TextField
                block
                label="이미지 속성"
                placeholder="<img> 태그에 추가할 속성을 입력해 주세요. Ex) alt, id, class, style 등"
                @input="validation"
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
                @input="validation"
                v-model="config.divProperty"
              />
            </div>
          </div>
          <div class="row pt-15">
            <div class="col">
              레이어 모달 설정
            </div>
            <div class="col col-3">
              <SwitchButton
                :label="['설정안함', '설정']"
                @update:model-value="validation"
                v-model="config.isLayerPopup"
              />
            </div>
          </div>
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
