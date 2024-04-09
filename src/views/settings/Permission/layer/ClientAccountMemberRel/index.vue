<script setup lang='ts'>
import {
  ref,
  watch,
  computed,
  onMounted,
  getCurrentInstance,
} from 'vue';
import { v1 as uuid } from 'uuid';
import axios from 'axios';

import type { Rules, OptionItem } from '@/components/types';

import type { MemberListTableItem } from '@/types/settings';

import type { GetMediasRes } from '@/types/api/mediaUtmCodeApi';
import type { PostMembersAuthsParam, PostMembersAuthsRes, PutMembersAuthsReq, PutMembersAuthsRes } from '@/types/api/memberAccountApi';

import { CONST_CODES, booleanYN } from '@/constants/common';
import { useToast } from '@/js/helper/common';

import { useMessageBox } from '@/js/helper/messageBox';
import { useUtil } from '@/js/util';
import { apiErrorCode } from '@/message/apiResponse';

import { useMediaUtmCodeApi } from '@/api/modules/mediaUtmCodeApi';
import { useMemberAccountApi } from '@/api/modules/memberAccountApi';

import Modal from '@/components/Modal/index.vue';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';

type OnOpenOption = {
  target?: MemberListTableItem
};

const { AUTH } = CONST_CODES;

// emit
const emit = defineEmits<{
  // 멤버 초대 완료 이벤트
  (event: 'on:createContent', value: MemberListTableItem): void;
  // 권한 변경 완료 이벤트
  (event: 'on:editContent', value: MemberListTableItem): void;
  // 모달 닫기 이벤트 핸들러
  (event: 'on:close'): void;
}>();

const membersApi = useMemberAccountApi();

// Element
const modalEL = ref<Pick<InstanceType<typeof Modal>, 'close'|'$nextTick'>>();
const validateForm = ref<ValidateFormModel>();
  
// data()
const app = getCurrentInstance();
const modalId = `clientAccountMemberRel${app?.uid}`;

let _clientAccountRel: MemberListTableItem|null = null;


// readonly values ==============================================================================================================
const util = useUtil();

const _rule: Rules = {
  authLevel: [
    (v: string) => (!!v) || '필수 입력값입니다.',
  ],
  memberEmail: [
    (v: string) => (!!v  && Array.isArray(v.match(util.getRegExp('email')))) ||
      '잘못된 이메일 형식입니다.',
    (v: string) => Array.isArray(v.match(/\s/)) && '잘못된 이메일 형식입니다.',
  ],
  mediaUidArr: [
    (v: string[]) => (!!v && Array.isArray(v)) || '필수 입력값입니다.',
    (v: string[]) => (v.length >= 1) || '1개 이상 선택해주세요.',
  ]
};

const _authLevelOptions: OptionItem[] =
  [ AUTH.MASTER, AUTH.MEMBER, AUTH.MEDIA ]
    .map(({ VAL, TXT }) => ({ value: VAL, text: TXT }));
// END readonly values ==========================================================================================================


let isShow = ref<boolean>(false);
let disabled = ref<boolean>(true);
let loading = ref<boolean>(false);
let memberEmail = ref<string>('');
let authLevel = ref<string>('');
let mediaUidArr = ref<string[]>([]);

let mediaOptions = ref<OptionItem[]>([]);

const { Toast, defaultErrors } = useToast();

// computed
const isEditor = computed(() => isShow.value && (_clientAccountRel ? true : false));
const isMedia = computed<boolean>(() => authLevel.value === AUTH.MEDIA.VAL);
const getTitle = computed<string>(() => isEditor.value ? '권한 수정' : '멤버 초대');

// method
const { notInviteMember } = useMessageBox(Toast);

/**
 * LayerPopup 활성
 * @author hjs0619
 * @returns
 */
const onOpen = async (params: OnOpenOption): Promise<void> => {
  try {
    if (isShow.value) {
      throw new Error(`${getTitle.value} 서비스를 진행중이십니다.`);
    }

    if (params.target) {
      _clientAccountRel = Object.freeze({ ...params.target });
      authLevel.value = _clientAccountRel.authLevel;
      if (isMedia.value) {
        mediaUidArr.value = params.target.mediaUids || [];
      }
    }

    isShow.value = true;
    disabled.value = isEditor.value;
  } catch (error) {
    let err: Error = new Error('고객센터에 문의를 남겨주세요.');
    if (error instanceof Error) {
      err = new Error(error.message, { cause: error });
    }
    return Promise.reject(err);
  }

  return  Promise.resolve();
};

/**
 * Modal 컴포넌트의 close 함수 수행.
 * @author hjs0619
 * @returns
 */
const onClose = (): void => {
  modalEL.value?.close();
};

const validation = (): void => {
  disabled.value && (disabled.value = false);
};

/**
 * Modal 컴포넌트의 update:modelValue 이벤트 핸들러
 * Modal 컴포넌트의 close 함수 수행시 발생하는 이벤트를 캐치하여 모달을 종료를 수행합니다.
 *
 * 단, mediaOptions 는 clear하지 않습니다. API 조회 수 줄이기 위하여.
 * @author hjs0619
 * @returns
 */
const onCloseModal = (): void => {
  modalEL.value?.$nextTick(() => {
    validateForm.value!.resetForm();
    _clientAccountRel = null;
    disabled.value = true;
    isShow.value = false;
    emit('on:close');
  });
};

const onClickEvnt = async (): Promise<void> => {
  if (!disabled.value && validateForm.value?.validate()) {
    try {
      // 수행할 이벤트
      loading.value = true;
      validateForm.value?.formProtection(true);

      if (isEditor.value) {
        await editContent();
        Toast('정상적으로 수정되었습니다.');
      } else {
        await createContent();
        Toast('정상적으로 초대되었습니다.');
      }

      onClose();
    } catch (err) {
      if (axios.isAxiosError<PostMembersAuthsRes | PutMembersAuthsRes, any>(err) && err.response) {
        const { code } = err.response.data;
        switch (code) {
          case apiErrorCode.MEMBER_EMAIL_NOT_FOUND: {
            if (!isEditor.value) {
              notInviteMember(async () => {
                await membersApi.postMemberJoinEmail({ toEmail: memberEmail.value })
                  .then(onClose);
              });
            } else {
              defaultErrors();
            }
          } return;
          case apiErrorCode.MEMBER_ALREADY_INVITED: {
            if (!isEditor.value) {
              Toast({ color: 'warning', message: '초대 상태의 사용자 ID 입니다.' });
            }
          } return;
          default: {
            defaultErrors();
          } return;
        }
      }
      console.error(err);
    } finally {
      validateForm.value?.formProtection(false);
      loading.value = false;
    }
  }
};

const _cratePutMembersAuthsReq = (): PutMembersAuthsReq => {
  return {
    authLevel: authLevel.value,
    mediaUids: isMedia.value ? (mediaUidArr.value as string[]).join() : undefined
  };
};

/**
 * 멤버 초대 초대버튼 클릭이벤트
 * 1. 멤버 초대 API 연동
 * 2. 응답값에따른 notInviteMemberMessageBox 함수 수행.
 * 3. 마무리로 객체 등록
 * @author hjs0619
 * @returns
 * @throws
 */
const createContent = async (): Promise<void> => {
  const clientAccountMemberRelUid: string = uuid();

  const req: PostMembersAuthsParam = {
    clientAccountMemberRelUid,
    memberEmail: memberEmail.value,
    ..._cratePutMembersAuthsReq()
  };

  if (req.authLevel === AUTH.SUPER.VAL) {
    throw new Error('초대할 수 없는 권한 레벨입니다.');
  }

  await membersApi.postMembersAuths(req);

  emit('on:createContent', {
    clientAccountMemberRelUid,
    authLevel: authLevel.value,
    memberEmail: memberEmail.value,
    mediaUids: isMedia.value ? mediaUidArr.value : [],
    isJoin: booleanYN.N,
    inviteDatetime: Date.now(),
    regDatetime: Date.now(),
    modDatetime: Date.now(),
  } as MemberListTableItem);

};

/**
 * 멤버 권한 수정버튼 클릭이벤트
 * 1. 멤버 권한 수정 API 연동
 * 2. 마무리로 객체 등록
 * @author hjs0619
 * @returns
 */
const editContent = async (): Promise<void> => {
  if (!_clientAccountRel) {
    throw new Error('수정할 멤버 정보를 불러올 수 없습니다.');
  }

  const req: PutMembersAuthsReq = _cratePutMembersAuthsReq();

  if (req.authLevel === AUTH.SUPER.VAL) {
    throw new Error('수정할 수 없는 권한 레벨입니다.');
  }

  const { clientAccountMemberRelUid } = _clientAccountRel;
  await membersApi.putMembersAuths(clientAccountMemberRelUid, req);

  emit('on:editContent', {
    ..._clientAccountRel,
    authLevel: authLevel.value, mediaUids: mediaUidArr.value,
  } as MemberListTableItem);
};

const onClickStopCapture = ($event: MouseEvent) => {
  if (loading.value) {
    $event.preventDefault();
    $event.stopPropagation();
  }
};

// watch
/**
 * 매체사 선택 해제시, 선택했었던 매체사들 초기화
 * @author hjs0619
 * @returns
 */
watch(isMedia, () => {
  if (!isMedia.value) {
    mediaUidArr.value = [];
  }
});

onMounted(async () => {
  try {
    const { results } = await useMediaUtmCodeApi().getMedias();
    mediaOptions.value = results.medias.map(({ mediaUid, media }) => ({ value: mediaUid, text: media }));
  } catch (err) {
    util.axiosErrorCatch<GetMediasRes>(err);
  }
});

defineExpose({
  onOpen,
  onClose
});
</script>
<script lang='ts'> export default { name: 'ClientAccountMemberRelLayer' };</script>
<template>
  <Modal
    access-back
    :id="modalId"
    ref="modalEL"
    class="permissionClientAccountMemberRel"
    width="520px"
    :title="getTitle"
    :esc-close="!loading"
    :model-value="isShow"
    @click.capture="onClickStopCapture"
    @update:model-value="onCloseModal"
  >
    <template #body>
      <ValidateForm ref="validateForm" v-if="isShow">
        <div class="row mb-10" v-if="!isEditor">
          <div class="col">
            <TextField
              block
              required
              label="사용자 ID (이메일)"
              placeholder="사용자 ID (이메일)을 입력해주세요."
              :max-length="100"
              :validate="_rule.memberEmail"
              @blur="validation()"
              v-model="memberEmail"
            />
          </div>
        </div>
        <div class="row authLevel">
          <div class="col-6 mr-10 self-end">
            <SelectBox
              block
              required
              hide-message
              label="권한 레벨"
              placeholder="선택"
              :options="_authLevelOptions"
              :validate="_rule.authLevel"
              @blur="validation()"
              v-model="authLevel"
            />
          </div>
          <div class="col-6 self-end">
            <SelectBox
              block
              required
              multiple
              is-short
              searchable
              hide-message
              placeholder="매체: 선택"
              :validate="_rule.mediaUidArr"
              :options="mediaOptions"
              @blur="validation()"
              v-model="mediaUidArr"
              v-if="isMedia"
            />
          </div>
        </div>
        <div class="row mt-10">
          <div class="col">
            <ul class="info-box-bullet">
              <li>마스터 : 모든 기능을 사용, 관리 할 수 있는 권합니다.</li>
              <li>멤버 : [권한 관리]를 제외한 모든 기능을 사용, 관리 할 수 있는 권합니다.</li>
              <li>매체사 : 할당된 매체의 고객 DB만 조회 할 수 있으며, [DB관리], [API 문서] 메뉴만 접근 가능합니다.</li>
            </ul>
          </div>
        </div>
      </ValidateForm>
    </template>
    <template #action="{ close }">
      <div class="rowReverse">
        <StyledButton
          color="primary"
          :disabled="disabled"
          :loading="loading"
          @click="!loading && onClickEvnt()"
        >
          {{ isEditor ? '수정' : '초대' }}
        </StyledButton>
        &nbsp;&nbsp;
        <StyledButton outline :disabled="loading" @click="close()">
          닫기
        </StyledButton>
      </div>
    </template>
  </Modal>
</template>
