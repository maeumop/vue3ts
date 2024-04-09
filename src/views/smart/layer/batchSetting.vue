<script setup lang="ts">
import { reactive, ref, watch, inject } from 'vue';
import { useUtil } from '@/js/util';

import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';
import type { KeyIndex, OptionItem, Rules } from '@/components/types';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type { GetLayoutsRes, GetScriptsRes, GetPagesRes } from '@/types/api/smartEditorApi';

const util = useUtil();
const smartEditorApi = useSmartEditorApi();
const Toast = inject('Toast') as ToastModel;

interface BatchSetData {
  YN: boolean
  value: string
  text: string
  code?: string
}

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'openResult'): void;
  (event: 'batchData', batchSetData: KeyIndex<string|number>): void;
}>();

const validateForm = ref<ValidateFormModel>();
const rules: Rules = {
  input: [v => !!v || '필수 입력 항목입니다.'],
};

// 팝업 기본 설정 ====================
const modal = ref<ModalModel>();
let isShow = ref(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

// 사용여부 선택가능한 항목
const useCheck = ['mobilePage', 'backPage', 'script'];

let isPass = ref<boolean>(false);
const validation = (): void => {
  try {
    isPass.value = validateForm.value!.validate(true);
  } catch (err) {
    console.error(err);
  }
};

const setData = reactive<KeyIndex<BatchSetData>>({
  layout: { YN: false, value: '', text: '레이아웃', },
  mobilePage: { YN: false, value: '', text: '모바일', code: '' },
  backPage: { YN: false, value: '', text: '백 페이지', code: '' },
  script: { YN: false, value: '', text: '전환 스크립트', },
});

const selectLoading = reactive<KeyIndex<boolean>>({
  layout: true,
  page: true,
  script: true,
});

const options = reactive<KeyIndex<OptionItem[]>>({
  layout: [],
  page: [],
  script: [],
});

const getOption = (flag: string | number): OptionItem[] => {
  return flag in options ? options[flag] : options.page;
};

/**
 * 일괄 설정 완료
 */
const onSave = (): void => {
  let isPass = false;
  const batchSetData: KeyIndex<string|number> = {};

  Object.entries(setData).forEach(([_key, _value]) => {
    // 값이 선택된 항목 추가
    if (_value.value) {
      batchSetData[`${_key}Uid`] = setData[_key].value;

      if ('code' in _value) {
        batchSetData[`${_key}Code`] = options.page.find(item => item.value === batchSetData[`${_key}Uid`])?.code ?? '';
      }

      isPass = true;
    }

    // 사용여부 선택 가능한 항목중
    // 사용안함일때 batchSetData에서 uid 빼기
    // 값이 선택 되었을경우 사용함 처리
    if (useCheck.includes(_key)) {
      const useKey = `isUse${_key.charAt(0).toUpperCase()}${_key.slice(1)}`;
      if (_value.value === 'no') {
        batchSetData[useKey] = 0;
        delete batchSetData[`${_key}Uid`];
      } else if (_value.value) {
        batchSetData[useKey] = 1;
      }
    }
  });

  if (!validateForm.value!.validate()) {
    return;
  } else if (!isPass) {
    Toast({ color: 'warning', message: '일괄 변경이 필요한 항목을 설정해주세요.' });
    return;
  }

  if ('layoutUid' in batchSetData) {
    batchSetData['layoutName'] = options.layout.find(item => item.value === batchSetData.layoutUid)?.text ?? '';
  }

  if ('scriptUid' in batchSetData) {
    batchSetData['scriptName'] = options.script.find(item => item.value === batchSetData.scriptUid)?.text ?? '';
  }

  emit('openResult');
  emit('batchData', batchSetData);
  modal.value?.close();
};


/**
 * 레이아웃 목록 조회 API 호출
 */
const getLayoutData = async (): Promise<void> => {
  try {
    const { results }: GetLayoutsRes = await smartEditorApi.getLayouts();
    results.layouts.forEach(item => {
      options.layout.push({ value: item.layoutUid, text: item.layoutName });
    });

  } catch (err) {
    util.axiosErrorCatch<GetLayoutsRes>(err);

  } finally {
    selectLoading.layout = false;
  }
};

/**
 * 스크립트 목록 조회 API 호출
 */
const getScriptData = async (): Promise<void> => {
  try {
    const { results }: GetScriptsRes = await smartEditorApi.getScripts();
    results.scripts.forEach(item => {
      options.script.push({ value: item.scriptUid, text: item.scriptName });
    });

    options.script.unshift({ value: 'no', text: '사용안함' });

  } catch (err) {
    util.axiosErrorCatch<GetScriptsRes>(err);

  } finally {
    selectLoading.script = false;
  }
};

/**
 * 페이지 목록 조회 API 호출
 */
const getPageData = async (): Promise<void> => {
  try {
    const search = encodeURIComponent('isOn=1');
    const { results }: GetPagesRes = await smartEditorApi.getPages({ search });
    results.pages.forEach(item => {
      options.page.push({ value: item.pageUid!, text: item.pageName, code: item.pageCode });
      // options.page.push({ value: item.pageCode!, text: item.pageName });
    });
    options.page.unshift({ value: 'no', text: '사용안함' });

  } catch (err) {
    util.axiosErrorCatch<GetPagesRes>(err);

  } finally {
    selectLoading.page = false;
  }
};

getLayoutData();
getScriptData();
getPageData();
</script>

<template>
  <Modal
    esc-close
    ref="modal"
    width="520px"
    title="설정 일괄 변경"
    v-model="isShow"
  >
    <template #body>
      <ValidateForm ref="validateForm">
        <div :key="`data-${item.text}`" v-for="(item, key, index) in setData">
          <div :class="['row mb-4', {'mt-25' : index !== 0}]">
            <div class="col">{{ item.text }}</div>
            <div class="col col-4">
              <SwitchButton
                :true-value="true"
                :false-value="false"
                :label="['변경 안함', '변경']"
                @update:after="validation"
                @update:model-value="($event:boolean) => !$event && (item.value = '')"
                v-model="item.YN"
              />
            </div>
          </div>
          <div v-show="item.YN">
            <SelectBox
              block
              searchable
              placeholder="선택"
              :is-loading="selectLoading[key]"
              :options="getOption(key)"
              :validate="item.YN ? rules.input : []"
              @blur="validation"
              v-model="item.value"
            />
          </div>
        </div>

      </ValidateForm>
      <ul class="info-box-bullet mt-5">
        <li>
          일괄 변경이 필요하신 항목 체크, 설정 후 [변경] 버튼을 클릭해 주세요.
        </li>
        <li>변경 옵션을 ‘사용안함’으로 선택시 설정된 값을 일괄 삭제 할 수 있습니다.</li>
      </ul>

    </template>
    <template #action="{ close }">
      <StyledButton outline class="mr-10" @click.prevent="close">
        닫기
      </StyledButton>
      <StyledButton
        color="primary"
        @click.prevent="onSave"
      >
        변경
      </StyledButton>
    </template>
  </Modal>
</template>
