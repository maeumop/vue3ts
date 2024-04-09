<script setup lang="ts">
import { computed, ref, reactive, nextTick, watch } from 'vue';
import { v1 as uuid } from 'uuid';

import type { Rules } from '@/components/types';
import type {
  ListTableModel,
  ListTableHeader,
  ListTableItemSlot,
} from '@/components/ListTable/types';

import type { InputFormEditForm, CreateInputFormItemCode, InputConfigListItem } from '@/types/smart/component/inputForm';
import type { GetInputConfigResult, GetInputFormItem, PostInputFormParam, PostInputFormRes, PutInputFormParam, PutInputFormRes } from '@/types/api/smartEditorApi';

import { FIX_FIELD_NAME } from '@/constants/smart/component';

import { useToast, useLayoutSelectBox } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';

import { mdiMagnify } from '@/assets/svg/path';

import Modal from '@/components/Modal/index.vue';
import CodeMirrorForm from '@/views/common/CodeMirrorForm/index.vue';
import SearchPolicy from '@/views/smart/component/layer/SearchPolicy/index.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import { useDatabaseApi } from '@/api/modules/databaseApi';
import { booleanYN } from '@/constants/common';
import type { GetDbsInputFieldsConfigRes } from '@/types/api/databaseApi';
import type { SmartCompUseModal } from '@/types/smart/component';

const props = withDefaults(
  defineProps<{
    data?: GetInputFormItem
  }>(),
  {},
);

const emit = defineEmits<{
  // 컴포넌트 등록 완료 이벤트
  (event: 'on:createComponent', value: GetInputFormItem): void;
  // 컴포넌트 수정 완료 이벤트
  (event: 'on:editComponent', value: GetInputFormItem): void;
  (event: 'on:close'): void;
}>();

const util = useUtil();
const databaseApi = useDatabaseApi();
const smartEditorApi = useSmartEditorApi();

// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close' | '$refs' | '$nextTick'>>();
const validateForm = ref<ValidateFormModel>();
const listTable = ref<ListTableModel>();


// readonly values ==============================================================================================================
const _rule: Rules = {
  default: [
    (v: string) => (!!v) || '필수 입력값입니다.',
  ],
};

const _editorForm: InputFormEditForm = {
  inputFormName: '',
  layoutUid: '',
  sourceCode: '',
} as const;
// END readonly values ==========================================================================================================

// 팝업들 설정 =========================
// searchPolicy : 약관 페이지 검색 팝업
type ModalType  =  {
  searchPolicy: SmartCompUseModal
};

let modal = reactive<ModalType>({
  searchPolicy: { show: false },
});

const onPopupClose = (key: keyof ModalType): void => {
  modal[key].show = false;
  if (modal[key].target) {
    modal[key].target = null;
  }
};
// END - 팝업들 설정 ====================

let isShow = ref<boolean>(true);
let disabled = ref<boolean>(true);
let loading = ref<boolean>(false);
let editorForm = ref<InputFormEditForm>({ ..._editorForm  });

const { Toast, codeCopySuccess } = useToast();

const layoutSelectBox = useLayoutSelectBox();
const { layoutOptions, getLayoutText, isLoading } = layoutSelectBox;

// ListTable
const tableHeader: ListTableHeader[] = [
  { text: '입력항목 변환 코드', width: '250' },
  { text: '관리', width: '80' },
];
// 입력 항목 list
let inputConfigs = ref<InputConfigListItem[]>([]);

// computed
const isEditor = computed(() => isShow.value && (props.data ? true : false));
const getTitle = computed(() => `입력폼 ${isEditor.value ? '수정' : '등록'}`);
const isEscClose = computed<boolean>(() => ![ loading.value, modal['searchPolicy'].show ].some((v: boolean) => v));
const policyItems = computed<CreateInputFormItemCode[]>(() =>
  inputConfigs.value.filter((item) =>
    [`{#=${FIX_FIELD_NAME.PRIVACY_YN}}`, `{#=${FIX_FIELD_NAME.THIRD_PARTY_YN}}`, `{#=${FIX_FIELD_NAME.SMS_YN}}`].includes(item.replaceCode))
    .map(({ fieldLabel, isUse, replaceCode }) => ({ fieldLabel, isUse: isUse === booleanYN.Y ? booleanYN.Y : booleanYN.N, replaceCode }))
);


// methods
/**
 * 입력항목 추가 코드 Template
 * @param item { CreateInputFormItemCode }
 */
const crateInputFormItemCode = (item?: CreateInputFormItemCode): string => {
  return `
    <!-- 입력 필드 START -->
    <dl>
      <dt><!-- 라벨명을 입력해주세요. ex) ${ item?.fieldLabel || '이름'} --></dt>
      <dd><!-- 변환 코드를 입력해주세요. --></dd>
    </dl>
    <!-- 입력 필드 END -->
  `;
};

/**
 * 버튼 코드 Template
 */
const crateBtnCode = (): string => {
  return '<a href="#" class="send-data">@buttonImage</a><!-- 버튼 영역, 삭제/수정 금지 -->';
};

/**
 * 단일 약관 코드 Template
 * @param item { CreateInputFormItemCode }
 */
const cratePolicyItemCode = (item: CreateInputFormItemCode): string =>  {
  const { fieldLabel, replaceCode, isUse } = item;

  if (replaceCode === `{#=${FIX_FIELD_NAME.SMS_YN}}`) {
    return `
      <div>
      ${ isUse ? replaceCode : '' }
      </div>
    `;
  }

  return `
    <div>
      <!-- ${fieldLabel} 페이지 링크를 입력해 주세요.-->
      ${ isUse ? replaceCode : '' } <a href="#" target="_blank">[자세히보기]</a>
    </div>
  `;
};


/**
 * 다수 약관 코드 Template
 * @param item { CreateInputFormItemCode }
 */
const cratePolicyCode = (list: CreateInputFormItemCode[]): string => {

  return  `
    <!-- 약관동의 START-->
      <div class="agree">
        ${ list.map((item: CreateInputFormItemCode) => cratePolicyItemCode(item)).join('\n') }
      </div>
    <!-- 약관동의 END-->
  `;
};


/**
 * 입력폼 전체 코드 Template
 * @param list { CreateInputFormItemCode[] }
 */
const crateInputFormAllCode = (list: CreateInputFormItemCode[]): string => {
  return `
    <!-- 삭제 금지 -->
    <form method="post">
      ${crateInputFormItemCode()}

      ${cratePolicyCode(list)}

      ${crateBtnCode()}
    </form>
    <!-- 삭제 금지 -->
  `;
};

/**
 * Modal 컴포넌트의 close 함수 수행.
 * @author hjs0703
 * @returns
 */
const onClose = (): void => modalEL.value?.close();


/**
 * disabled 해제
 * 각 form 컴포넌트 blur 이벤트 발생시, 
 * 수정 버튼 disabled 해제가 진행이 됩니다.
*/
const clearDisabled = (): void => {
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
    editorForm.value = { ..._editorForm };
    inputConfigs.value = [];
    disabled.value = true;
    isShow.value = false;
    emit('on:close');
  });
};

/**
 * inputConfigs에 입력항목 해당값 불러오기
 * @author inputFieldConfig
 * @returns
 */
const getInputFieldsConfig = async (): Promise<void> => {
  try {
    const { results } = await databaseApi.getDbsInputFieldsConfig('inputFieldConfig');
    inputConfigs.value = results.filter(({ isUse }) => isUse === booleanYN.Y);
  } catch (error) {
    util.axiosErrorCatch<GetDbsInputFieldsConfigRes>(error);
  }
};

/**
 * SearchPolicy 컴포넌트의 on:close 이벤트 핸들러
 * @author hjs0622
 * @returns
 */
const onCloseSearchPolicy = (): void => {
  onPopupClose('searchPolicy');
  nextTick(() => {
    const modalDiv: HTMLDivElement = modalEL.value?.$refs.modal as HTMLDivElement;
    // focus 다시 되돌려 주기
    modalDiv.focus();
  });
};

/**
 * 입력항목 변환 코드 복사 팝업 출력
 * @param index 복사할 입력항목 변환 코드 index
 */
const onCopyInputFormItem = (index: number): void => {
  try {
    if (index < 0 || index >= inputConfigs.value.length) {
      throw new Error('참조할 수 있는 index값이 아닙니다.');
    }

    navigator.clipboard.writeText(inputConfigs.value[index].replaceCode);
    codeCopySuccess();
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

/**
 * 복사할 코드 복사 팝업 출력
 * @param index 복사할 코드 양식 index
 */
const onCopyTemplate = (value: string): void => {
  try {
    navigator.clipboard.writeText(value);
    codeCopySuccess();
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

/**
 * [ 등록|수정 ] 버튼 클릭이벤트 핸들러
 * @author hjs0620
 * @returns
 */
const onClickEvnt = async (): Promise<void> => {
  if (!disabled.value && validateForm.value?.validate()) {
    try {
      // 수행할 이벤트
      loading.value = true;
      validateForm.value?.formProtection(true);
      if (isEditor.value) {
        // 수정 모드
        await _editConmponent();
      } else {
        // 등록 모드
        await _createConmponent();
      }
      onClose();
    } catch (err) {
      util.axiosErrorCatch<PostInputFormRes | PutInputFormRes>(err);
    } finally {
      validateForm.value?.formProtection(false);
      loading.value = false;
    }
  }
};

/**
 * PostInputFormParam, PutInputFormParam 공통 객체생성
 * @returns
 */
const _createCommonParam = (): PutInputFormParam => {
  return {
    layoutUid: editorForm.value.layoutUid,
    inputFormName: editorForm.value.inputFormName,
    sourceCode: editorForm.value.sourceCode,
  };
};


/**
 * 컴포넌트 등록버튼 클릭이벤트
 * @author hjs0620
 * @returns
 */
const _createConmponent = async (): Promise<void> => {
  const compInputFormUid: string = uuid();

  const req: PostInputFormParam  = {
    compInputFormUid,
    ..._createCommonParam()
  };

  await smartEditorApi.postInputForm(req);

  const result: GetInputFormItem = {
    ...req,
    layoutName: getLayoutText.value(editorForm.value.layoutUid),
    regDatetime: Date.now()
  };

  emit('on:createComponent', result);
  Toast('정상적으로 등록되었습니다.');
};

/**
 * 컴포넌트 수정버튼 클릭이벤트
 * @author hjs0620
 * @returns
 */
const _editConmponent = async (): Promise<void> => {
  if (!props.data) {
    throw new Error('참조할 수 있는 props.data 값이 아닙니다.');
  }

  const { compInputFormUid, regDatetime } = props.data;
  const req: PutInputFormParam = _createCommonParam();

  await smartEditorApi.putInputForm(compInputFormUid, req);

  const result: GetInputFormItem = {
    compInputFormUid, regDatetime,
    ...req,
    layoutName: getLayoutText.value(editorForm.value.layoutUid)
  };

  emit('on:editComponent', result);
  Toast('정상적으로 수정되었습니다.');
};

watch(() => props.data, (newVal) => {
  const form = { ..._editorForm };

  if (newVal) {
    const { inputFormName, layoutUid, sourceCode } = newVal;
    
    form.inputFormName = inputFormName || _editorForm.inputFormName;
    form.layoutUid = layoutUid || _editorForm.layoutUid;
    form.sourceCode = sourceCode || _editorForm.sourceCode;
  }


  editorForm.value = { ...form };
}, { immediate: true });

getInputFieldsConfig();

</script>
<script lang='ts'> export default { name: 'GetInputFormItemLayerGroupEditor' };</script>
<template>
  <Modal
    access-back
    id="smartLayerInputGrpsEditor"
    ref="modalEL"
    class="smartInputForm smartLayerGroupEditor"
    width="1200px"
    :title="getTitle"
    :esc-close="isEscClose"
    :model-value="isShow"
    @update:model-value="onCloseModal"
  >
    <template #body>
      <div class="flex-center-between">
        <ValidateForm ref="validateForm" v-if="isShow">
          <div class="width-800">
            <TextField
              block
              required
              hide-message
              label="입력폼명"
              placeholder="입력폼명을 입력해주세요."
              :max-length="50"
              :validate="_rule.default"
              @blur="clearDisabled()"
              v-model="editorForm.inputFormName"
            />
            <SelectBox
              block
              required
              searchable
              hide-message
              class="mt-10"
              label="레이아웃"
              placeholder="선택"
              :is-loading="isLoading"
              :options="layoutOptions"
              :validate="_rule.default"
              @blur="clearDisabled()"
              v-model="editorForm.layoutUid"
            />
            <div class="mx-3 pt-3 text-size-xs text-gray-600">미리보기 페이지에 적용되는 레이아웃입니다.</div>

            <CodeMirrorForm
              block
              required
              hide-message
              class="mt-10"
              height="320"
              label="입력폼 소스"
              placeholder="입력폼 소스를 입력해 주세요."
              :validate="_rule.default"
              @blur="clearDisabled()"
              v-model="editorForm.sourceCode"
            />

            <div class="flex-center gap-8 mt-10">
              <StyledButton
                small
                color="primary"
                :icon="mdiMagnify"
                @click="() => modal['searchPolicy'].show = true"
              >
                약관 페이지 검색
              </StyledButton>
              <StyledButton outline small @click="onCopyTemplate(crateInputFormAllCode(policyItems))">
                입력폼 전체 코드 양식 복사
              </StyledButton>
              <StyledButton outline small @click="onCopyTemplate(crateInputFormItemCode())">
                입력항목 추가 코드 복사
              </StyledButton>
              <StyledButton outline small @click="onCopyTemplate(crateBtnCode())">
                버튼 코드 복사
              </StyledButton>
              <StyledButton outline small @click="onCopyTemplate(cratePolicyCode(policyItems))">
                약관 코드 복사
              </StyledButton>
            </div>
          </div>
        </ValidateForm>

        <ListTable
          ref="listTable"
          height="552px"
          class="border"
          :items="inputConfigs"
          :header="tableHeader"
        >
          <template #items="{ props, index }: ListTableItemSlot<GetInputConfigResult>">
            <tr>
              <td>
                {{ props.fieldLabel }} {{ props.replaceCode }}
              </td>
              <td>
                <StyledButton
                  outline
                  x-small
                  color="secondary"
                  @click="onCopyInputFormItem(index)"
                >
                  복사
                </StyledButton>
              </td>
            </tr>
          </template>
        </ListTable>
      </div>

      <ul class="info-box-bullet mt-5">
        <li v-if="isEditor">
          입력폼 수정 후 페이지 버전 업데이트를 통해 수정 내용을 반영해 주세요.
        </li>
        <li>
          최초 입력폼 소스 입력 시 [입력폼 전체 코드 양식 복사] 버튼을 통해 기본 양식 복사, 붙여넣기 후 이용해 주세요.
        </li>
        <li>제공되는 코드 이용 시 ‘주석 태그 &#60;!-- 내용 --&#62;’의 내용을 반드시 확인 후 이용해 주세요.</li>
        <li>[버튼 코드]는 제공되는 코드 형식을 준수해야 하며, 입력항목, 버튼, 약관 코드는 &#60;From> 태그 안에 입력해 주셔야 합니다. ex&#41; &#60;form method="post"> &#123;&#123;코드 위치 &#125;&#125; &#60;/form></li>
        <li>
          약관 코드 이용 시 약관 페이지의 링크를 반드시 확인 후 수정해 주세요. (약관 페이지 링크는 [약관 페이지 검색] 버튼을 통해 복사 할 수 있습니다.)
        </li>
      </ul>

      <SearchPolicy @on:close="onCloseSearchPolicy" v-if="modal['searchPolicy'].show" />
    </template>

    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
          color="primary"
          :disabled="disabled"
          :loading="loading"
          @click="onClickEvnt()"
        >
          {{ isEditor ? '수정' : '등록' }}
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline :disabled="loading" @click="close()">
          취소
        </StyledButton>
      </div>
    </template>
  </Modal>
</template>