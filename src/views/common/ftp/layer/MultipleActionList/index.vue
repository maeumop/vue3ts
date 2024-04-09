<script setup lang="ts">
import { useWebFtpApi } from '@/api/modules/webFtpApi';
import { mdiAlertCircle } from '@/assets/svg/path';
import type { RuleFunc } from '@/components/types';
import { useToast } from '@/js/helper/common';
import { ActionItemClass } from '@/js/helper/ftp';
import { apiErrorCode } from '@/message/apiResponse';
import type { DeleteFtpRes, GetS3uploadUrlRes, PostFtpSendRes, PostFtpUploadRes } from '@/types/api/webFtpApi';
import axios, { HttpStatusCode, type AxiosRequestConfig } from 'axios';
import { computed, nextTick, ref, watch } from 'vue';

import { ACTION_MODE, ACTION_MODE_VALUE } from '@/constants/common';
import type { ACTION_MODE_TYPE, ACTION_MODE_TYPE_VALUE, ActionContentOption, DeleteContentOption, UploadContentOption } from '@/types/common/ftp/layer/MultipleActionList';

import Modal from '@/components/Modal/index.vue';

type OnOpenOption  = {
  validate?: RuleFunc[];
  mode: ACTION_MODE_TYPE
  path: string
  options: ActionContentOption[]
};

// props

// emit
const emit = defineEmits<{
  /**
   * 파일 액션 성공 이벤트
   * @author hjs0609
   * @param {UploadContentOption[]} items 액션 성공한 파일 목록
   * @returns
   */
  (event: 'on:uploadSuccess', items: UploadContentOption[]): void
  (event: 'on:deleteSuccess', items: DeleteContentOption[]): void
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();

const ftpApi = useWebFtpApi();
const { Toast } = useToast();

// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'|'$nextTick'>>();

const modalId = 'ftpMutipleActionListLayerPopup';
const _options: ActionContentOption[] = [];
const _RESULT_MESSAGE = '고객센터에 문의를 남겨주세요.' as const;

// ref
let isShow = ref<boolean>(false);
let validate: RuleFunc[] = [];
let path = ref<string>('');

let mode = ref<ACTION_MODE_TYPE>(ACTION_MODE.NONE);
let list = ref<ActionItemClass[]>([]);
let disabled = ref<boolean>(true);

// computed
const modeValue = computed<ACTION_MODE_TYPE_VALUE>(() => (ACTION_MODE_VALUE[mode.value]));

// methods

/**
 * FtpLayerUploadList 활성
 * @author hjs0613
 * @returns
 */
const onOpen = (parmas: OnOpenOption): Promise<void> => {
  try {
    if (isShow.value) {
      throw new Error('이미 수행중인 프로세스입니다.');
    }

    if (parmas.mode === ACTION_MODE.NONE) {
      throw new Error('수행할 mode를 설정해 주세요.');
    }

    
    mode.value = parmas.mode;
    path.value = parmas.path;

    const { options } = parmas;
    
    if (!options.length) {
      throw new Error( `${modeValue.value}할 항목이 없습니다.`);
    }

    _options.splice(0, _options.length, ...options);
    list.value = _options.map((item) => new ActionItemClass(item));

    Array.isArray(parmas.validate) && validate.splice(0, validate.length, ...parmas.validate);
    isShow.value = true;

    doAction();
  } catch (error) {
    let err: Error = new Error(_RESULT_MESSAGE);
    if (error instanceof Error) {
      err = error;
    }

    return Promise.reject(err);
  }

  return  Promise.resolve();
};

/**
 * Modal 컴포넌트의 update:modelValue 이벤트 핸들러
 * Modal 컴포넌트의 close 함수 수행시 발생하는 이벤트를 캐치하여 모달을 종료를 수행합니다.
 * @author hjs0613
 * @returns
 */
const onClose = (): void => {
  modalEL.value?.close();
};

/**
 * 액션 목록의 확인 버튼 클릭이벤트
 * @author hjs0609
 * @returns
 */
const onClickEvnt = async (): Promise<void> => {
  let result: ActionContentOption[] = [];

  for (let index = 0; index < list.value.length; index++) {
    const { statusCode, title, file } = list.value[index];

    if (statusCode === HttpStatusCode.Ok) {
      let res: ActionContentOption = { name: title, path: path.value };

      if (mode.value === ACTION_MODE.UPLOAD_ITEM) {
        file && Object.assign(res, { file });
      }

      result.push(res);
    }
  }

  result.length && Toast(`정상적으로 ${modeValue.value} 되었습니다.`);

  switch (mode.value) {
    case ACTION_MODE.UPLOAD_ITEM: emit('on:uploadSuccess', result); break;
    case ACTION_MODE.DELETE_ITEM: emit('on:deleteSuccess', result as DeleteContentOption[]); break;
  }
  
  onClose();
};

/**
 * 목록 validate 체크 및 _actionItem 수행 처리 프로세스
 * @author hjs0609
 * @returns
 */
const doAction = async (): Promise<void> => {
  if (!list.value.some(({ statusCode }) => statusCode > 0)) {
    let actionCnt: number = 0;
    for (let index = 0; index < list.value.length; index++) {
      const item = list.value[index];
      const result: string | boolean = _validateItem(item);

      if (typeof result === 'string') {
        item.setResult(HttpStatusCode.InternalServerError, result);
        await nextTick();
        continue;
      }

      mode.value === ACTION_MODE.UPLOAD_ITEM && _postFtpSend(item);
      mode.value === ACTION_MODE.DELETE_ITEM && _deleteFtp(item);
      actionCnt++;
    }


    if (!actionCnt && list.value.every(({ statusCode }) => statusCode > 0)) {
      disabled.value = false;
    }
  }
};

const _validateItem = (item: ActionItemClass): string | boolean => {
  let result: string | boolean = true;

  if (validate.length) {
    for (let i = 0; i < validate.length; i++) {
      result = validate[i](item);
      if (typeof result === 'string') {
        break;
      }
    }
  }

  return result;
};

const _transErrorMessage = (err: unknown): string => { 
  let result: string = '';

  if (axios.isAxiosError<GetS3uploadUrlRes | DeleteFtpRes | PostFtpUploadRes | PostFtpSendRes, any>(err) && err.response) {
    const { code } = err.response.data;
    if (code === apiErrorCode.FTP_RESOURCE_NOT_FOUND) {
      result = '이미 삭제된 파일입니다.';
    } else if (code === apiErrorCode.INVALID_FTP_FILE_NAME) {
      result = '파일명은 숫자, 영문자, 특수문자(_, -)만 사용 가능합니다.';
    } else if (code === apiErrorCode.FTP_NAME_ALREADY_EXIST) {
      result = '동일한 파일명+확장자가 존재합니다.';
    } else if (code === apiErrorCode.INVALID_FTP_FILE_EXTENSION) {
      result = '허용되지 않은 확장자입니다.';
    }

  } else if (err instanceof Error) {
    result = err.message;
    console.error(err);
  }

  return result || _RESULT_MESSAGE; 
};

const _deleteFtp = async (item: ActionItemClass): Promise<void> => {
  try {
    _progressTimer(item);
    await ftpApi.deleteFtp({ path: `${path.value}/${item.title}` })
      .finally(() => (item.timer && globalThis.clearInterval(item.timer)));

    item.setResult(HttpStatusCode.Ok);
    item.progress = 100;

  } catch (err) {
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    if (axios.isAxiosError<GetS3uploadUrlRes | PostFtpSendRes, any>(err) && err.response) {
      status = err.response.status;
    }

    item.setResult(status, _transErrorMessage(err));
  } finally {
    await nextTick();
    list.value.every(item => item.statusCode > 0) && (disabled.value = false);
  }
};

const _postFtpSend = async (item: ActionItemClass): Promise<void> => { 
  try {
    _progressTimer(item);
    const { results } =  await ftpApi.getS3uploadUrl({ path: path.value, fileName: item.title });

    const formData = new FormData();

    Object.keys(results.fields).forEach((key) => {
      formData.set(key, results.fields[key as keyof typeof results.fields]);
    });
    formData.set('file', item.file!);

    const config: AxiosRequestConfig = {
      baseURL: results.url,
      timeout: 2 * 60 * 1000 // 2분
    };

    await axios.postForm('/', formData, config);

    item.timer && globalThis.clearInterval(item.timer);
    item.setResult(HttpStatusCode.Ok);
    item.progress = 100;

  } catch (err) {
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    item.timer && globalThis.clearInterval(item.timer);

    if (axios.isAxiosError<GetS3uploadUrlRes | PostFtpSendRes, any>(err) && err.response) {
      status = err.response.status;
    }

    item.setResult(status, _transErrorMessage(err));
  } finally {
    await nextTick();
    list.value.every(item => item.statusCode > 0) && (disabled.value = false);
  }
};

/**
 * 해당 항목마다 0.1초마다 1% 씩 증감
 * 단, API 응답보다 먼저 100% 도달하게 된다면 오버 되지 않게 99% 고정
 * @author hjs0609
 * @returns
 */
const _progressTimer = (item: ActionItemClass): void => {
  if (!item.timer) {
    item.timer = globalThis.setInterval(async () => {
      let progress: number =  item.progress + 1;

      (progress >= 100) && (progress = 99);
      item.progress = progress;
      await nextTick();

    }, 100);
  }
};

/**
 * Modal 컴포넌트의 update:modelValue 이벤트 핸들러
 * Modal 컴포넌트의 close 함수 수행시 발생하는 이벤트를 캐치하여 모달을 종료를 수행합니다.
 * @author hjs0609
 * @returns
 */
const onCloseModal = (): void => {
  modalEL.value?.$nextTick(() => {
    isShow.value = false;
    emit('on:close');
  });
};

// watch
/**
 * 모달의 활성화 여부에따라 초가화 작업을 수행.
 * @author hjs0613
 * @returns
 */
watch(() => isShow.value, (v) => {
  if (!v) {
    disabled.value = true;
    validate.splice(0, validate.length);
    list.value.splice(0, list.value.length);

    _options.splice(0, _options.length);
    mode.value = ACTION_MODE.NONE;
    path.value = '';
  }
}, { immediate: true });

defineExpose({
  onOpen,
  onClose,
});
</script>
<script lang="ts">
export default { name: 'FtpLayerMultipleActionList' };
</script>
<template>
  <Modal
    hide-close
    access-back
    :id="modalId"
    ref="modalEL"
    class="ftpMutipleActionList"
    width="800px"
    :title="`${modeValue} 목록`"
    :model-value="isShow"
    @update:model-value="onCloseModal"
  >
    <template #body>
      <div class="actionList">
        <div :key="i" class="actionItem" v-for="(item, i) in list">
          <div>
            <SvgIcon
              type="mdi"
              :class="['mdi', item.contentIcon.color]"
              :size="40"
              :path="item.contentIcon.path"
            />
          </div>
          <div>
            <div :class="['title', item.statusIcon.color]">
              {{ item.title }}
            </div>
            <div
              class="capacity"
              v-if="item.file"
            >
              {{ item.file.size.fileSize(0) }}
            </div>
            <div>
              <div :class="['contents', 'mt-5',{ progressbar: !item.errorMessage }, item.statusIcon.color]">
                <span
                  :class="[
                    `width-p-${item.getProgressPercent() < 5 ? 5 : item.getProgressPercent()}`,
                  ]"
                  v-if="!item.errorMessage"
                >
                  {{ item.progress < 100 ? item.progress : item.getProgressPercent() }}%
                </span>
                <template v-else>
                  <SvgIcon
                    type="mdi"
                    :class="['mdi', item.statusIcon.color]"
                    :size="17"
                    :path="mdiAlertCircle"
                  />
                  {{ item.errorMessage || '' }}
                </template>
              </div>
            </div>
          </div>
          <div>
            <SvgIcon
              type="mdi"
              :class="['mdi', item.statusIcon.color]"
              :size="25"
              :path="item.statusIcon.path"
            />
          </div>
        </div>
      </div>
    </template>
    <template #action>
      <div class="rowReverse">
        <StyledButton
          color="primary"
          :disabled="disabled"
          @click="onClickEvnt"
        >
          확인
        </styledbutton>
      </div>
    </template>
  </Modal>
</template>
