<script setup lang="ts">
import CodeMirrorForm from '@/views/common/CodeMirrorForm/index.vue';

import { ref, watch, inject } from 'vue';
import { useUtil } from '@/js/util';
import { v1 as uuid } from 'uuid';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type {
  ScriptItem,
  PostScriptsRes, PostScriptsParam,
  PutScriptsParam, PutScriptsRes,
} from '@/types/api/smartEditorApi';

import { useDatabaseApi } from '@/api/modules/databaseApi';
import type { GetDbsInputFieldsConfigRes, InputFieldItem } from '@/types/api/databaseApi';

import type { ListTableModel, ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { Rules } from '@/components/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';
import { getDbsInputFieldsConfigMsg } from '@/constants/api/databaseApi';
import { INPUT_FIELDS_CONFIG } from '@/constants/db';

const util = useUtil();
const smartEditorApi = useSmartEditorApi();
const databaseApi = useDatabaseApi();

const Toast = inject('Toast') as ToastModel;

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'on:create', value: ScriptItem): void;
  (event: 'on:edit', value: ScriptItem): void;
}>();

const props = defineProps<{
  index: number
  data?: ScriptItem
}>();

// ======= 팝업 기본 설정 ====================
const modal = ref<ModalModel>();
let isShow = ref(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

const dbsInputFieldsItem = ref<InputFieldItem[]>([]);
const isRegister = ref<boolean>(true);
const validateForm = ref<ValidateFormModel>();

// ListTable
const listTable = ref<ListTableModel>();
const tableHeader: ListTableHeader[] = [
  { text: '입력항목 변환 코드', width: '310' },
  { text: '관리', width: '80' },
];

let scriptUid = ref<string>('');
let scriptName = ref<string>('');
let sourceCode = ref<string>('');

const rules: Rules = {
  input: [v => !!v || '필수 입력 사항 입니다.'],
};

let isPass = ref<boolean>(true);
const validation = (): void => {
  if (props.index > -1 && !isPass.value) {
    isPass.value = true;
  }
};

/**
 * 복사 팝업 출력
 * @param index 복사할 페이지 index
 */
const onCopy = (index: number) => {
  navigator.clipboard.writeText(dbsInputFieldsItem.value[index].replaceCode);
  Toast('코드가 복사 되었습니다. Ctrl + V 로 붙여 넣기 하세요.');
};

/**
 * 스크립트 등록
 */
const createScript = async (): Promise<void> => {
  const params: PostScriptsParam = {
    scriptUid: uuid(),
    scriptName: scriptName.value,
    sourceCode: sourceCode.value,
  };
  await smartEditorApi.postScripts(params);
  const newData: ScriptItem = {
    ...params,
    regDatetime: Date.now(),
    modDatetime: Date.now(),
  };
  emit('on:create', newData);
  Toast('정상적으로 등록되었습니다.');
  modal.value!.close();
};

/**
 * 스크립트 수정
 */
const editScript = async (): Promise<void> => {
  const params: PutScriptsParam = {
    scriptName: scriptName.value,
    sourceCode: sourceCode.value,
  };
  await smartEditorApi.putScripts(scriptUid.value, params);
  const newData: ScriptItem = {
    ...props.data!,
    ...params,
  };
  emit('on:edit', newData);
  Toast('정상적으로 수정되었습니다.');
  modal.value!.close();
};


let loading = ref<boolean>(false);
/**
 * [ 등록|수정 ] 버튼 클릭이벤트 핸들러
 */
const onClickEvnt = async (): Promise<void> => {

  if (!validateForm.value!.validate()) {
    return;
  }

  try {
    loading.value = true;
    if (isRegister.value) {
      await createScript();
    } else {
      await editScript();
    }
  } catch (err) {
    util.axiosErrorCatch<PostScriptsRes | PutScriptsRes>(err);

  } finally {
    loading.value = false;
  }
};

/**
 * 등록|수정 체크
 * 수정일때 데이터 넣어주기
 */
const modeCheck = (): void => {
  if (props.index > -1 && props.data) {
    isRegister.value = false;
    scriptUid.value = props.data.scriptUid;
    scriptName.value = props.data.scriptName;
    sourceCode.value = props.data.sourceCode;

    isPass.value = false;
  }
};

let dataLoading = ref<boolean>(true);
/**
 * 입력항목 리스트 조회 API 호출
 */
const getClientDbsInputFields = async (): Promise<void> => {
  try {
    dataLoading.value = true;
    const { code, results }: GetDbsInputFieldsConfigRes = await databaseApi.getDbsInputFieldsConfig(INPUT_FIELDS_CONFIG.script);

    if (code === getDbsInputFieldsConfigMsg.DB_INPUT_FIELDS_GET_SUCCESS) {
      results
        .filter(item => item.replaceCode !== '{#=cert}')
        .forEach(field => dbsInputFieldsItem.value.push(field));
    }

  } catch (err) {
    util.axiosErrorCatch<GetDbsInputFieldsConfigRes>(err);

  } finally {
    dataLoading.value = false;
  }
};

modeCheck();
getClientDbsInputFields();
</script>

<template>
  <Modal
    ref="modal"
    width="1200px"
    :esc-close="!loading"
    :title="isRegister ? '전환 스크립트 등록' : '전환 스크립트 수정'"
    v-model="isShow"
  >
    <template #body>
      <div class="flex-center-between">

        <div class="width-740">
          <ValidateForm ref="validateForm">
            <TextField
              block
              required
              label="스크립트명"
              placeholder="스크립트명을 입력해주세요."
              max-length="50"
              :validate="rules.input"
              @blur="validation()"
              v-model="scriptName"
            />

            <CodeMirrorForm
              block
              required
              hide-message
              class="mt-20"
              height="450"
              label="스크립트 소스"
              placeholder="스크립트 소스를 입력해 주세요."
              :validate="rules.input"
              @blur="validation()"
              v-model="sourceCode"
            />
          </ValidateForm>
        </div>

        <ListTable
          ref="listTable"
          class="border"
          :height="`558px`"
          :items="dbsInputFieldsItem"
          :loading="dataLoading"
          :header="tableHeader"
        >
          <template #items="{ props, index }: ListTableItemSlot<InputFieldItem>">
            <tr>
              <td>
                {{ props.fieldLabel }} {{ props.replaceCode }}
              </td>
              <td>
                <StyledButton
                  outline
                  x-small
                  color="secondary"
                  @click.prevent="onCopy(index)"
                >
                  복사
                </StyledButton>
              </td>
            </tr>
          </template>
        </ListTable>
      </div>

      <ul class="info-box-bullet my-10">
        <li>
          <strong>&lt;script&gt;&lt;/script&gt;</strong> 포함한 전체 스크립트 소스를 입력해 주세요.
        </li>
        <li>
          변환 코드 삽입 시 완료 페이지에서 사용자가 입력한 값이 자동으로 변환 되어 출력 됩니다.
        </li>
      </ul>
    </template>

    <template #action="{ close }">
      <StyledButton
        outline
        class="mr-10"
        :disabled="loading"
        @click.prevent="close"
      >
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        :loading="loading"
        :disabled="!isPass"
        @click.prevent="onClickEvnt()"
      >
        {{ isRegister ? '등록' : '수정' }}
      </StyledButton>
    </template>
  </Modal>
</template>
