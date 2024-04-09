<script setup lang="ts">
import { ref, reactive, watch, computed, inject } from 'vue';
import type { Ref } from 'vue';
import type {
  ApiSetting,
  ApiSettingValueType,
  GetApisItem,
  PostApisRes,
  PutApisRes,
  PostApisParam,
  PutApisParam,
  InputFieldConfigItem
} from '@/types/api/databaseApi';
import type { GetMediasRes } from '@/types/api/mediaUtmCodeApi';
import type { OptionItem, RuleFunc } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ToastModel } from '@/components/Toast/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ConstApiContentKeys, ConstApiMethodKeys, ConstApiResponseKeys, KeyIndex } from '@/types/common';
import { mdiPlus, mdiMinus, mdiCodeNotEqualVariant } from '@/assets/svg/path';
import { getConstCodeOptions } from '@/js/common';
import { v1 as uuid } from 'uuid';
import { useSessionStore } from '@/store';
import { useMediaUtmCodeApi } from '@/api/modules/mediaUtmCodeApi';
import { useDatabaseApi } from '@/api/modules/databaseApi';
import { useUtil } from '@/js/util';
import { apiSettingValueType, putApisMsg, postApisMsg, getDbsInputFieldsConfigMsg } from '@/constants/api/databaseApi';
import { getMediasMsg } from '@/constants/api/mediaUtmCodeApi';
import { CONST_CODES } from '@/constants/common';
import InputCode from '../components/InputCode.vue';
import { INPUT_FIELDS_CONFIG } from '@/constants/db';

const { API_CONTENT, API_METHOD, API_RESPONSE }  = CONST_CODES;

const emit = defineEmits<{
  (event: 'close'): void
}>();

const props = defineProps<{ editIndex: number }>();

const databaseApi = useDatabaseApi();
const mediaUtmCodeApi = useMediaUtmCodeApi();
const util = useUtil();
const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;
const store = useSessionStore();

let list = inject('list') as Ref<GetApisItem[]>;

let isShow = ref<boolean>(true);
let callApiUid = ref<string>('');
let mediaUid = ref<string>('');
let company = ref<string>('');
let contentType = ref<ConstApiContentKeys>(API_CONTENT.FORM.VAL);
let method = ref<ConstApiMethodKeys>(API_METHOD.POST.VAL);
let url = ref<string>('');
let responseType = ref<ConstApiResponseKeys>(API_RESPONSE.JSON.VAL);
let responseProperty = ref<string>('');
let successValue = ref<string>('');
let parameter = ref<ApiSetting[]>([
  {
    key: '',
    valueType: apiSettingValueType.String,
    value: '',
    children: [],
  }
]);
let comment = ref<string>('');
let isSaving = ref<boolean>(false);
const oldValue: KeyIndex<string> = {
  mediaUid: '',
  sendUrl: '',
};

const options = reactive<KeyIndex<OptionItem[]>>({
  apiList: list.value.map(item => {
    const text = `[${item.isUse ? 'ON' : 'OFF'}] ${item.company} - ${item.media === null ? '전체' : item.media}`;

    return {
      text,
      value: item.apiUid
    };
  }),
  media: [],
  contentType: getConstCodeOptions('API_CONTENT'),
  method: getConstCodeOptions('API_METHOD'),
  responseType: getConstCodeOptions('API_RESPONSE'),
  valueType: Object.entries(apiSettingValueType).map(([text, value]) => ({ text, value })),
});

watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});

const getMedia = async (): Promise<void> => {
  try {
    const { code, results } = await mediaUtmCodeApi.getMedias();

    if (code === getMediasMsg.MEDIA_LIST_GET_SUCCESS) {
      const { medias } = results;

      options.media = medias.map(item => ({
        text: item.media,
        value: item.mediaUid
      }));
    }
  } catch (err) {
    util.axiosErrorCatch<GetMediasRes>(err);
  }
};

getMedia();

//======================= Json String 변환 로직 =======================
/**
 * 전송 설정 값을 JSON으로 변환
 * @param params 전송 값 설정 데이터
 */
const jsonToString = (params: ApiSetting[]): string => {
  let json: string = '{';

  params.forEach((item, i) => {
    if (item.key) {
      json += ((i > 0) ? ',' : '') + `"${item.key}":`;

      if (item.valueType === 'string') {
        json += `"${item.value}"`;
      }

      if (item.children?.length) {
        json += (item.valueType === 'json') ? '{' : '[';

        item.children.forEach((child, j) => {
          json += (j > 0) ? ',' : '';

          if (item.valueType === 'json') {
            // json 형식 처리
            json += `"${child.key}": "${child.value}"`;
          } else {
            // 배열 형식 처리
            json += `"${child.value}"`;
          }
        });

        json += (item.valueType === 'json') ? '}' : ']';
      }
    }
  });

  json += '}';

  return json;
};

const paramsToJson = computed<any>(() => {
  try {
    const json = jsonToString(parameter.value);
    return JSON.parse(json);
  } catch (e) {
    return '입력된 내용에 잘못 사용된 특수문자가 있습니다. [쌍따옴표("), 역슬래쉬(\\)]';
  }
});

//======================= Json String 변환 로직 =======================

//======================= Form Validation =======================
const form = ref<ValidateFormModel>();
const rules: KeyIndex<RuleFunc[]> = {
  input: [v => !!v || '필수 입력 항목입니다.'],
  select: [v => !!v || '필수 선택 항목입니다.'],
};

let isPass = ref<boolean>(true);

const urlPattern: [RegExp, string] = [util.getRegExp('url'), 'http:// 또는 https:// 포함한 전송 URL을 입력해주세요.'];
const jsonKeyPattern: [RegExp, string] = [util.getRegExp('jsonKey'), '영문, 숫자, 특수문자만 입력 가능합니다.'];

const validation = (): void => {
  if (props.editIndex > -1 && !isPass.value) {
    isPass.value = true;
  }
};

/**
 * 매체와 URL값으로 중복 여부를 판단
 * @param v
 * @param type
 */
const duplicateCheck = async (): Promise<boolean> => {
  if (oldValue.mediaUid !== mediaUid.value || oldValue.sendUrl !== url.value) {
    try {
      const { results } = await databaseApi.getApisCount({
        clientId: store.getClientId,
        mediaUid: mediaUid.value,
        sendUrl: url.value
      });

      const { isExist } = results;

      if (isExist) {
        Toast({ color: 'warning', message: '이미 등록된 연동 매체 + 전송 URL 조합이 존재합니다.' });
        return false;
      }
    } catch (err) {
      util.axiosErrorCatch<PutApisRes>(err);
      return false;
    }
  }

  return true;
};
//======================= Form Validation =======================

/**
 * 메인키 라인 추가
 */
const addLine = (): void => {
  parameter.value.push({
    key: '',
    valueType: apiSettingValueType.String,
    value: '',
    children: [],
  });
};

/**
 * 메인 키 라인 삭제
 * @param index 삭제할 라인 index
 */
const removeLine = (index: number): void => {
  parameter.value.splice(index, 1);
};

/**
 * 자식 데이터가 추가
 * @param index 메인키 index
 */
const addChildren = (index: number): void => {
  parameter.value[index].children?.push({
    key: '',
    value: '',
  });
};

/**
 * 자식 데이터 삭제
 * @param parent 메인 키 index
 * @param index 자식 키 index
 */
const removeChildren = (parent: number, index: number): void => {
  parameter.value[parent].children?.splice(index, 1);
};

/**
 * value 형식 변경
 * @param v
 * @param index 메인 키 index
 */
const changedValueType = (v: ApiSettingValueType, index: number): void => {
  if (v === 'string') {
    parameter.value[index].children = [];
  } else {
    parameter.value[index].value = '';

    if (!parameter.value[index].children?.length) {
      addChildren(index);
    }
  }
};

const modal = ref<ModalModel>();

/**
 * 설정 내용 저장
 */
const save = async (): Promise<void> => {
  if (form.value?.validate() && isPass.value) {
    isSaving.value = true;

    const duple = await duplicateCheck();

    if (!duple) {
      isSaving.value = false;
      return;
    }

    let apiUid = '';

    if (props.editIndex > -1) {
      apiUid = list.value[props.editIndex].apiUid;
    }

    form.value.formProtection();

    if (apiUid) {
      const param: PutApisParam = {
        mediaUid: mediaUid.value,
        company: company.value,
        contentType: contentType.value,
        method: method.value,
        url: url.value,
        comment: comment.value,
        parameter: JSON.stringify(paramsToJson.value),
        responseType: responseType.value,
        responseProperty: responseProperty.value,
        successValue: successValue.value,
        isUse: list.value[props.editIndex].isUse,
      };

      try {
        const { code } = await databaseApi.putApis(apiUid, param);

        if (code === putApisMsg.API_MODIFY_SUCCESS) {
          Toast('정상적으로 수정되었습니다.');

          const filter = options.media.filter((item) => item.value === mediaUid.value);

          const newData: GetApisItem = {
            ...param,
            apiUid,
            media: filter.length ? filter[0].text : '전체',
          };

          list.value[props.editIndex] = newData;
        }
      } catch (err) {
        util.axiosErrorCatch<PutApisRes>(err);
      }

    } else {
      const param: PostApisParam = {
        apiUid: uuid(),
        mediaUid: mediaUid.value,
        company: company.value,
        contentType: contentType.value,
        method: method.value,
        url: url.value,
        comment: comment.value,
        parameter: JSON.stringify(paramsToJson.value),
        responseType: responseType.value,
        responseProperty: responseProperty.value,
        successValue: successValue.value,
      };

      try {
        const { code } = await databaseApi.postApis(param);

        if (code === postApisMsg.API_REGISTRATION_SUCCESS) {
          Toast('정상적으로 등록되었습니다.');

          const media = options.media.filter(item => mediaUid.value === item.value);

          const newData: GetApisItem = {
            ...param,
            media: media.length ? media[0].text : '전체',
          };

          list.value.unshift(newData);
        }
      } catch (err) {
        util.axiosErrorCatch<PostApisRes>(err);
      }
    }

    form.value.formProtection(false);
    isSaving.value = false;

    modal.value!.close();
  }
};

/**
 * 설정 데이터 적용 처리
 * @param data
 */
const acceptData = (index: number = -1): void => {
  const data: GetApisItem = list.value[index > -1 ? index : props.editIndex];

  if (data) {
    company.value = data.company;
    mediaUid.value = callApiUid.value ? '' : data.mediaUid;
    contentType.value = data.contentType;
    method.value = data.method;
    url.value = data.url;
    responseType.value = data.responseType;
    responseProperty.value = data.responseProperty;
    successValue.value = data.successValue;
    comment.value = data.comment;

    if (callApiUid.value) {
      // 불러오기로 새로운 데이터를 생성할 경우
      oldValue.mediaUid = '';
      oldValue.sendUrl = '';
    } else {
      // 수정일 경우
      oldValue.mediaUid = data.mediaUid;
      oldValue.sendUrl = data.url;
    }

    callApiUid.value = '';

    try {
      const json = JSON.parse(data.parameter);

      if (Object.entries(json).length) {
        parameter.value = [];

        for (const [key, v] of Object.entries(json)) {
          let valueType: ApiSettingValueType = 'string';
          let value = v as string;
          let children: any[] = [];

          if (Array.isArray(v)) {
            valueType = 'array';
            value = '';

            v.forEach(value => children.push({ key: '', value }));
          } else if (v instanceof Object) {
            valueType = 'json';
            value = '';

            for (const [key2, value2] of Object.entries(v)) {
              children.push({
                key: key2,
                value: value2
              });
            }
          }

          parameter.value.push({ key, value, valueType, children });
        }
      }
    } catch (err) {
      console.log('error ==========> ', err);
      console.log('data ===========> ', data.parameter);
    } finally {
      isPass.value = false;
    }
  }
};

/**
 * 폼 초기화
 */
const reset = (): void => {
  mediaUid.value = '';
  company.value = '';
  contentType.value = API_CONTENT.FORM.VAL;
  method.value = API_METHOD.POST.VAL;
  url.value = '';
  responseType.value = API_RESPONSE.JSON.VAL;
  responseProperty.value = '';
  successValue.value = '';
  comment.value = '';

  parameter.value = [];
  addLine();
};

/**
 * API 연동 설정 내역 불러오기
 */
const apiLoad = (): void => {
  if (callApiUid.value) {
    MessageBox.confirm({
      title: '선택하신 내역을 불러 오시겠습니까?',
      message: '[불러오기] 버튼 클릭 시 이전에 작성한 내용은 모두 초기화됩니다.',
      btnOkayText: '초기화 후 불러오기',
      okay: () => {
        const index = list.value.findIndex(item => item.apiUid === callApiUid.value);

        if (index >= 0) {
          reset();
          acceptData(index);
          isPass.value = true;
        }
      }
    });
  }
};

const layerClose = (close: Function): void => {
  MessageBox.confirm({
    title: '입력을 취소하시겠습니까?',
    message: '[입력 취소하기] 버튼 클릭 시 입력하신 내용은 초기화됩니다.',
    btnOkayText: '입력 취소하기',
    btnCancelText: '이어서 입력하기',
    okay: () => {
      close();
    },
  });
};


const configItems = ref<InputFieldConfigItem[]>([]);

const getInputFieldConfigData = async () => {
  const { code, results } = await databaseApi.getDbsInputFieldsConfig(INPUT_FIELDS_CONFIG.api);

  if (code === getDbsInputFieldsConfigMsg.DB_INPUT_FIELDS_GET_SUCCESS) {
    configItems.value = results;
  }
};

getInputFieldConfigData();

if (props.editIndex > -1) {
  acceptData();
}
</script>

<template>
  <Modal
    hide-close
    ref="modal"
    title="API 연동"
    width="90%"
    id="ApiSettingForm"
    v-model="isShow"
  >
    <template #title>
      <SelectBox
        in-label
        width="300px"
        label="불러오기"
        placeholder="선택"
        :options="options.apiList"
        v-model="callApiUid"
      />
      <StyledButton
        class="ml-3"
        color="primary"
        :disabled="!callApiUid"
        @click="apiLoad"
      >
        불러오기
      </StyledButton>
    </template>
    <template #body>
      <ValidateForm ref="form">
        <div class="section-title mb-10">
          기본 설정
        </div>
        <div class="row">
          <div class="col-2">
            <TextField
              block
              required
              max-length="10"
              label="업체명"
              placeholder="업체명 입력"
              :validate="rules.input"
              @blur="validation"
              v-model="company"
            />
          </div>
          <div class="col-2">
            <SelectBox
              block
              searchable
              clearable
              ref="mediaSelector"
              label="매체"
              placeholder="전체"
              :options="options.media"
              @update:model-value="validation"
              v-model="mediaUid"
            />
          </div>
          <div class="col-3">
            <SelectBox
              block
              required
              label="Content-Type"
              :options="options.contentType"
              v-model="contentType"
            />
          </div>
          <div class="col">
            <SelectBox
              block
              required
              key="method"
              label="Method"
              :options="options.method"
              v-model="method"
            />
          </div>
          <div class="col-5">
            <TextField
              block
              required
              label="전송 URL"
              placeholder="http, https:// 포함한 전송 URL을 입력해주세요."
              :pattern="urlPattern"
              @blur="validation"
              v-model="url"
            />
          </div>
        </div>

        <div class="divider my-25"></div>

        <div class="section-title mb-10">
          전송 값 (Parameter)
        </div>

        <ul class="params-setting">
          <li class="setting">
            <!-- parameter header -->
            <div class="header row">
              <div class="tool">
                <a href="#" class="plus" @click.prevent="addLine">
                  <SvgIcon type="mdi" size="20" :path="mdiPlus" />
                </a>
              </div>
              <div class="col self-center required pl-5">
                Key
              </div>
              <div class="col self-center required pl-5">
                Value
              </div>
              <div class="col-3 text-right pr-15">
                <StyledButton
                  small
                  outline
                  href="/database/codeInfo"
                  target="_dbCodeInfo"
                  :icon="mdiCodeNotEqualVariant"
                >
                  변환 코드 정보
                </StyledButton>
              </div>
            </div>

            <!-- parameter main property -->
            <template
              :key="`params-list-${i}`"
              v-for="(item, i) in parameter"
            >
              <div class="parameters row mt-5">
                <div class="tool">
                  <a
                    href="#"
                    class="minus"
                    @click.prevent="removeLine(i)"
                    v-if="i > 0"
                  >
                    <SvgIcon type="mdi" size="20" :path="mdiMinus" />
                  </a>
                  <span v-else>-</span>
                </div>
                <div class="col">
                  <TextField
                    block
                    placeholder="Key 입력"
                    :pattern="jsonKeyPattern"
                    @blur="validation"
                    v-model="item.key"
                  />
                </div>
                <div class="col">
                  <SelectBox
                    block
                    :options="options.valueType"
                    @update:model-value="changedValueType($event, i)"
                    v-model="item.valueType"
                  />
                </div>
                <div class="col-3 pr-5">
                  <ValidateWrap
                    ref="inputCode"
                    :disabled="item.valueType !== 'string'"
                    :validate="rules.input"
                    :check-value="item.value"
                  >
                    <template #default="{ onBlur }">
                      <InputCode
                        :items="configItems"
                        :on-blur="[validation, onBlur]"
                        :disabled="item.valueType !== 'string'"
                        v-model="item.value"
                      />
                    </template>
                  </ValidateWrap>
                </div>
              </div>

              <!-- parameter child property -->
              <template v-if="item.valueType != 'string'">
                <div
                  :key="`children-${i}-${j}`"
                  class="children-params row mt-5"
                  v-for="(child, j) in item.children"
                >
                  <div class="tool">&nbsp;</div>
                  <div class="col">&nbsp;</div>
                  <div class="row col-4">
                    <div class="tool">
                      <a
                        href="#"
                        class="plus"
                        @click.prevent="addChildren(i)"
                        v-if="j === 0"
                      >
                        <SvgIcon type="mdi" size="20" :path="mdiPlus" />
                      </a>
                      <a
                        href="#"
                        class="minus"
                        @click.prevent="removeChildren(i, j)"
                        v-else
                      >
                        <SvgIcon type="mdi" size="20" :path="mdiMinus" />
                      </a>
                    </div>
                    <div class="col" v-if="item.valueType === 'json'">
                      <TextField
                        block
                        placeholder="Key 입력"
                        :pattern="jsonKeyPattern"
                        @blur="validation"
                        v-model="child.key"
                      />
                    </div>
                    <div class="col pr-3">
                      <ValidateWrap
                        ref="inputCode"
                        :validate="rules.input"
                        :check-value="child.value"
                      >
                        <template #default="{ onBlur }">
                          <InputCode
                            :items="configItems"
                            :on-blur="[validation, onBlur]"
                            v-model="child.value"
                          />
                        </template>
                      </ValidateWrap>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </li>

          <!-- parameter json viewer -->
          <li class="json-viewer">
            <pre>{{ paramsToJson }}</pre>
          </li>
        </ul>

        <div class="divider my-25"></div>

        <div class="section-title mb-10">
          결과 값 (Response)
        </div>

        <div class="row">
          <div class="col">
            <SelectBox
              block
              required
              label="Response Type"
              :options="options.responseType"
              v-model="responseType"
            />
          </div>
          <div class="col" v-if="responseType === API_RESPONSE.JSON.VAL">
            <TextField
              block
              required
              label="Response Property"
              placeholder="Response Property 입력"
              :pattern="jsonKeyPattern"
              @blur="validation"
              v-model="responseProperty"
            />
          </div>
          <div class="col">
            <TextField
              block
              required
              label="성공 Value"
              placeholder="성공 value 입력"
              :validate="rules.input"
              @blur="validation"
              v-model="successValue"
            />
          </div>
        </div>

        <div class="divider my-25"></div>

        <div class="section-title mb-10">
          특이사항
        </div>

        <div class="row">
          <div class="col">
            <TextField
              block
              multiline
              placeholder="특이사항을 입력해주세요."
              v-model="comment"
            />
          </div>
        </div>
      </ValidateForm>
    </template>
    <template #action="{ close }">
      <StyledButton
        outline
        ref="closeButton"
        class="mr-5"
        @click="layerClose(close)"
      >
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        :loading="isSaving"
        :disabled="!isPass || isSaving"
        @click="save"
      >
        {{ props.editIndex > -1 ? '수정' : '등록' }}
      </StyledButton>
    </template>
  </Modal>
</template>