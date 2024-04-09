<script setup lang="ts">
import { ref, computed, watch, reactive, inject, onMounted, onUnmounted } from 'vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { KeyIndex,  OptionItem,  RuleFunc } from '@/components/types';
import type { SmartEditorPageConfig, PageItem, PutPageConfigsParam, PutPageConfigsRes } from '@/types/api/smartEditorApi';
import { storeToRefs } from 'pinia';
import { useEditorStore } from '@/store/index';
import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type { ToastModel } from '@/components/Toast/types';
import { useUtil } from '@/js/util';
import { putPageConfigsMsg } from '@/constants/api/smartEditorApi';
import router from '@/router';

const smartPageApi = useSmartEditorApi();

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'edite', value: PageItem): void
}>();

const props = defineProps<{
  selectItem?: PageItem
}>();

const store = useEditorStore();
const { updatePageConfig, clearPageConfig, optionCall, setPageUid } = store;
const { getPageConfig, isSetConfig, options, getPageUid } = storeToRefs(store);

const Toast = inject('Toast') as ToastModel;
const util = useUtil();

// store 설정된 값을 적용
const config = reactive<SmartEditorPageConfig>({ ...getPageConfig.value });
const pageOptions = computed<OptionItem[]>(() => {
  return options.value.page.filter(item => {
    return (
      item.add === 'ON'
      && item.value !== getPageUid.value
      && getPageUid.value !== item.value
    );
  });
});

let isShow = ref<boolean>(true);
const switchLabel1: string[] = ['사용안함', '사용'];
const switchLabel2: string[] = ['OFF', 'ON'];

const form = ref<ValidateFormModel>();
const rules: KeyIndex<RuleFunc[]> = {
  input: [v => !!v || '필수 입력 항목입니다.'],
  select: [v => !!v || '필수 선택 항목입니다.'],
};

let isSaving = ref<boolean>(false);

watch(isShow, (v) => {
  if (!v) {
    emit('close');
  }
});

/**
 * 리스트에서 설정 변경 시
 */
const editePageConfig = async (close: Function): Promise<void> => {
  const param: PutPageConfigsParam = {
    layoutUid: config.layoutUid!,
    scriptUid: config.scriptUid,
    mobilePageUid: config.mobilePageUid,
    backPageUid: config.backPageUid,
    pageCode: config.pageCode!,
    pageName: config.pageName,
    isUseMobilePage: config.isUseMobilePage,
    isUseBackPage: config.isUseBackPage,
    isUseScript: config.isUseScript,
    isOn: config.isOn,
  };

  isSaving.value = true;
  form.value?.formProtection();

  try {
    const { code }: PutPageConfigsRes = await smartPageApi.putPageConfigs(props.selectItem!.pageUid!, { ...param });

    if (code === putPageConfigsMsg.SMART_PAGE_CONFIG_UPDATE_SUCCESS) {
      const newConfigData: PageItem = {
        ...props.selectItem!,
        ...config,
        layoutName: options.value.layout.find(item => item.value === config.layoutUid)?.text ?? '',
        scriptName: options.value.script.find(item => item.value === config.scriptUid)?.text ?? '',
        isLastest: 0
      };

      if (newConfigData.isUseBackPage) {
        newConfigData.backPageCode = options.value.page.find(item => item.value === config.backPageUid)?.code ?? '';
      }

      if (newConfigData.isUseMobilePage) {
        newConfigData.mobilePageCode = options.value.page.find(item => item.value === config.mobilePageUid)?.code ?? '';
      }

      Toast('정상적으로 수정 되었습니다.');

      emit('edite', newConfigData);
      close();
    }
  } catch (err) {
    util.axiosErrorCatch<PutPageConfigsRes>(err);
  } finally {
    isSaving.value = false;
    form.value?.formProtection(false);
  }
};

const resetUid = (value: number, target: string) => {
  switch (target) {
    case 'mobile':
      config.mobilePageUid = undefined;
      break;
    case 'back':
      config.backPageUid = undefined;
      break;
    case 'script':
      config.scriptUid = undefined;
  }
};

/**
 * 페이지 설정 내역 저장
 * @param close Modal close
 */
const save = (close: Function): void => {
  if (form.value?.validate()) {
    if (props.selectItem) {
      editePageConfig(close);
    } else {
      updatePageConfig(config);
      close();
    }
  }
};

const closeConfig = (close: Function): void => {
  if (isSetConfig.value) {
    close();
  } else {
    router.back();
  }
};

onMounted(() => {
  if (props.selectItem) {
    clearPageConfig();
    optionCall('page');
    optionCall('layout');
    optionCall('script');

    config.layoutUid = props.selectItem.layoutUid;
    config.pageCode = props.selectItem.pageCode;
    config.mobilePageUid = props.selectItem.mobilePageUid;
    config.backPageUid = props.selectItem.backPageUid;
    config.scriptUid = props.selectItem.scriptUid;
    config.pageName = props.selectItem.pageName;
    config.htmlPath = props.selectItem.htmlPath;
    config.isUseMobilePage = props.selectItem.isUseMobilePage;
    config.isUseBackPage = props.selectItem.isUseBackPage;
    config.isUseScript = props.selectItem.isUseScript;
    config.isOn = props.selectItem.isOn;

    setPageUid(props.selectItem!.pageUid!);
    updatePageConfig(config);
  }
});

onUnmounted(() => {
  if (props.selectItem) {
    clearPageConfig();
  }
});
</script>

<template>
  <Modal
    ref="modal"
    title="페이지 설정"
    width="500px"
    :hide-close="!isSetConfig"
    :esc-close="isSetConfig"
    id="editorPageConfig"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="form">
        <div class="row">
          <div class="col">
            <TextField
              block
              required
              max-length="50"
              label="페이지명"
              placeholder="페이지명을 입력해주세요"
              :validate="rules.input"
              v-model="config.pageName"
            />
          </div>
        </div>
        <div class="row pt-25">
          <div class="col">
            <SelectBox
              searchable
              block
              required
              label="레이아웃"
              placeholder="선택"
              :options="options.layout"
              :validate="rules.select"
              v-model="config.layoutUid"
            />
          </div>
        </div>
        <div class="row pt-25">
          <div class="col">모바일</div>
          <div class="col col-4">
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="switchLabel1"
              @update:model-value="resetUid($event, 'mobile')"
              v-model="config.isUseMobilePage"
            />
          </div>
        </div>
        <div class="row pt-5" v-show="config.isUseMobilePage">
          <div class="col">
            <SelectBox
              searchable
              block
              required
              placeholder="모바일 페이지 선택"
              :options="pageOptions"
              :validate="config.isUseMobilePage ? rules.select : []"
              v-model="config.mobilePageUid"
            />
          </div>
        </div>
        <div class="row pt-25">
          <div class="col">백 페이지</div>
          <div class="col col-4">
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="switchLabel1"
              @update:model-value="resetUid($event, 'back')"
              v-model="config.isUseBackPage"
            />
          </div>
        </div>
        <div class="row pt-5" v-show="config.isUseBackPage">
          <div class="col">
            <SelectBox
              searchable
              block
              required
              placeholder="백 페이지 선택"
              :options="pageOptions"
              :validate="config.isUseBackPage ? rules.select : []"
              v-model="config.backPageUid"
            />
          </div>
        </div>
        <div class="row pt-25">
          <div class="col self-center">전환 스크립트</div>
          <div class="col col-4">
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="switchLabel1"
              @update:model-value="resetUid($event, 'script')"
              v-model="config.isUseScript"
            />
          </div>
        </div>
        <div class="row pt-5" v-show="config.isUseScript">
          <div class="col">
            <SelectBox
              searchable
              block
              required
              placeholder="전환 스크립트 선택"
              :options="options.script"
              :validate="config.isUseScript ? rules.select : []"
              v-model="config.scriptUid"
            />
          </div>
        </div>
        <div class="row pt-25">
          <div class="col">사용여부</div>
          <div class="col col-4">
            <SwitchButton
              :true-value="1"
              :false-value="0"
              :label="switchLabel2"
              v-model="config.isOn"
            />
          </div>
        </div>
      </ValidateForm>
    </template>
    <template #action="{ close }">
      <StyledButton
        outline
        @click="closeConfig(close)"
      >
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        class="ml-5"
        :loading="isSaving"
        @click="save(close)"
      >
        저장
      </StyledButton>
    </template>
  </Modal>
</template>
