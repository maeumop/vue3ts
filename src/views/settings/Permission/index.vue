<script setup lang='ts'>
import { ref, reactive, computed, toValue, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import type { ListTableHeader, ListTableItemSlot } from '@/components/ListTable/types';
import type { ConstAuthKeys } from '@/types/common';
import type { TabOption } from '@/types/common/TabMenu';
import type { GetMembersAuthsRes } from '@/types/api/memberAccountApi';
import type { MemberListTableItem } from '@/types/settings';

import { CONST_CODES } from '@/constants/common';
import { useListTable, useToast } from '@/js/helper/common';

import { useUtil } from '@/js/util';

import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import { useSessionStore } from '@/store/modules/session/index';
import { useClientStore } from '@/store/modules/client/index';

import { mdiPlus } from '@/assets/svg/path';
import TabMenu from '@/views/common/TabMenu/index.vue';
import ClientAccountMemberRel from '@/views/settings/Permission/layer/ClientAccountMemberRel/index.vue';
import { useMessageBox } from '@/js/helper/messageBox';


const { AUTH } = CONST_CODES;

const util = useUtil();
const membersApi = useMemberAccountApi();

// store
const sessionStore = useSessionStore();
const clientStore = useClientStore();
const { getUid } = storeToRefs(sessionStore);
const { getClientAccount } = storeToRefs(clientStore);

// element
const clientAccountMemberRelEL = ref<Pick<InstanceType<typeof ClientAccountMemberRel>, 'onOpen'|'$nextTick'>>();

// data()
let tabindex = ref<number>(0);
let tabs = ref<TabOption[]>([
  {
    value: 'member',
    title: '멤버 관리',
  },
  {
    value: 'inviteMember',
    title: '초대 중인 멤버 관리',
  },
]);

const _memberHeader: ListTableHeader[] = [
  { text: '멤버 ID' },
  { text: '권한 레벨', width: '100' },
  { text: '수락일', width: '150' },
  { text: '관리', width: '220' },
];
const memberTable = useListTable<MemberListTableItem>({ headers: _memberHeader });


const _inviteMemberListTableHeader: ListTableHeader[] = [
  { text: '멤버 ID' },
  { text: '권한 레벨', width: '100' },
  { text: '초대일', width: '150' },
  { text: '관리', width: '220' },
];
const inviteMemberTable = useListTable<MemberListTableItem>({ headers: _inviteMemberListTableHeader });

// 팝업들 설정 =========================
// clientAccountMember : 멤버초대/ 권한수정 팝업
interface AuthEditModal<T> {
  show: boolean
  target?: T | null
}

type ModalType = {
  clientAccountMember: AuthEditModal<MemberListTableItem>,
};

type ModalKeys = keyof ModalType;

const modal = reactive<ModalType>({
  clientAccountMember: { show: false },
});

const onPopupClose = (key: ModalKeys): void => {
  modal[key].show = false;
  if (modal[key].target) {
    modal[key].target = null;
  }
};
// END - 팝업들 설정 ====================

// computed
const memberItems = computed<MemberListTableItem[]>(() => toValue(memberTable.items));
const inviteMemberItems = computed<MemberListTableItem[]>(() => toValue(inviteMemberTable.items));

// methods
const { Toast } = useToast();
const { authRelease, inviteCancel } = useMessageBox(Toast);

const _getMembersAuths = async (): Promise<void> => {
  const { clientId } = getClientAccount.value;

  if (!clientId) {
    throw new Error('광고주 정보를 불러올 수 없습니다.');
  }

  const { results }: GetMembersAuthsRes = await membersApi.getMembersAuths();

  const _memberItems: MemberListTableItem[] = [];
  const _inviteMemberItems: MemberListTableItem[] = [];

  for (let index = 0; index < results.length; index++) {
    const member = results[index];
    if (member.memberUid === getUid.value) {
      // 본인 정보관련 권한은 화면에 노출하지 않습니다!
      continue;
    }

    if (member.authLevel === AUTH.SUPER.VAL) {
      // 슈퍼 관리자 권한 레벨은 화면에 노출하지 않습니다!
      continue;
    }

    const mediaUids: string[] = member.mediaUids ? member.mediaUids.split(',') : [];

    const item: MemberListTableItem = {
      clientAccountMemberRelUid: member.clientAccountMemberRelUid,
      memberUid: member.memberUid,
      isJoin: member.isJoin,
      authLevel: member.authLevel as Exclude<ConstAuthKeys, 'SUPER'>,
      mediaUids,
      inviteDatetime: member.inviteDatetime,
      memberEmail: member.memberEmail,
      regDatetime: member.regDatetime,
      modDatetime: member.modDatetime,
    };

    let _items: MemberListTableItem[] = _inviteMemberItems;

    if (item.isJoin) {
      item.joinDatetime = member.joinDatetime;
      _items = _memberItems;
    }
    _items.push(item);
  }


  memberItems.value.splice(0, memberItems.value.length, ..._memberItems.sort((a, b) => b.joinDatetime! - a.joinDatetime!));
  inviteMemberItems.value.splice(0, inviteMemberItems.value.length, ..._inviteMemberItems.sort((a, b) => b.inviteDatetime - a.inviteDatetime));
};

const _loadMembersAuths = async (): Promise<void> => {
  try {
    memberItems.value.splice(0, memberItems.value.length);
    inviteMemberItems.value.splice(0, inviteMemberItems.value.length);

    memberTable.loading.value = true;
    inviteMemberTable.loading.value = true;

    await _getMembersAuths();
    _unWatch();
  } catch (err) {
    util.axiosErrorCatch<GetMembersAuthsRes>(err);
  } finally {
    memberTable.loading.value = false;
    inviteMemberTable.loading.value = false;
  }
};

/**
 * [ 멤버 초대 | 권한 수정 ] layer popup 활성화 이벤트
 *  @author hjs0619
 *  @param {MemberListTableItem} target 클릭된 객체
 *  @returns
 */
const onOpen = async (target?: MemberListTableItem): Promise<void> => {
  if (memberTable.loading.value || inviteMemberTable.loading.value) {
    return;
  }

  const _key: ModalKeys = 'clientAccountMember';

  try {
    if (!modal[_key].show) {
      modal[_key].show = true;
      await clientAccountMemberRelEL.value?.$nextTick();
    }

    await clientAccountMemberRelEL.value?.onOpen(target ? { target } : {});
    if (target) {
      modal[_key].target = target;
    }
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};

/**
 * 멤버 초대 버튼 클릭 이벤트 핸들러
 * @author hjs0622
 * @param {MemberListTableItem} value 초대한 멤버 객체
 * @returns
 */
const onCreateContent =  (value: MemberListTableItem): void => {
  inviteMemberItems.value.splice(0, 0, value);
};

/**
 * 권한 수정 layer popup 완료 이벤트
 * @author hjs0619
 * @param {MemberListTableItem} edit 궈한 수정 멤버 객체
 * @returns
 */
const onEditContent =  (edit: MemberListTableItem): void => {
  const _key: ModalKeys = 'clientAccountMember';
  Object.assign(modal[_key].target!, edit);
};

/**
 * 도메인 연결 정보 객체의 권한 해제
 * 초대 중인 멤버 관리 객체의 초대 취소
 * @author hjs0809
 * @param {number} index inviteMemberItems | memberItems 의 index 값
 * @returns
 */
const onClickDeleteAuth = async (index: number): Promise<void> => {
  try {
    let list: MemberListTableItem[] = [];
    let messageBox: Function | null = null;

    switch (tabindex.value) {
      case 0:
        list = memberItems.value;
        messageBox = authRelease;
        break;
      case 1:
        list = inviteMemberItems.value;
        messageBox = inviteCancel;
        break;

      default: throw new Error('참조할 수 없는 값입니다.');
    }

    if (index < 0 || index >= list.length) {
      throw new Error('참조할 수 없는 값입니다.');
    }

    await messageBox(async () => {
      const target: MemberListTableItem = list[index];
      try {
        await membersApi.deleteMembersAuths(target.clientAccountMemberRelUid);
        list.splice(index, 1);
      } catch (err) {
        util.axiosErrorCatch(err);
      }
    });
  } catch (err) {
    console.error(err);
    // defaultErrors();
  }
};


/**
 * 해당 페이지에서 새로고침 할시,
 * 광고주 정보 불러오는 부분이 느리기에 1번 조회후 바로 unWatch 실행
 * @author hjs0809
 * @returns
 */
const _unWatch = watch(() => getClientAccount.value.clientId, () => _loadMembersAuths());


onMounted(() => getClientAccount.value.clientId && _loadMembersAuths());
</script>
<script lang='ts'> export default { name: 'SettingsPermission' };</script>
<template>
  <div id="settingsPermission" class="narrow-content">
    <TabMenu
      :options="tabs"
      v-model="tabindex"
    >
      <template #body-member>
        <div>
          <div class="memberBtnWrap">
            <div class="memberBtn">
              <StyledButton
                small
                color="primary"
                :icon="mdiPlus"
                @click="onOpen()"
              >
                멤버 초대
              </StyledButton>

            </div>
          </div>
          <div class="memberWrap">
            <div class="mainContent">
              <ListTable
                height="calc(100vh - 230px)"
                :header="_memberHeader"
                :items="memberItems"
                :empty-text="toValue(memberTable.emptyText)"
                :loading="toValue(memberTable.loading)"
              >
                <template #items="{ props, index }:ListTableItemSlot<MemberListTableItem>">
                  <tr>
                    <td>{{ props.memberEmail }}</td>
                    <td>{{ AUTH[props.authLevel].TXT }}</td>
                    <td>{{ util.getDateFormat(props.joinDatetime!, 'Y-m-d') }}</td>
                    <td>
                      <div class="flex-center gap-8">
                        <StyledButton
                          small
                          outline
                          @click="onClickDeleteAuth(index)"
                        >
                          권한 해제
                        </StyledButton>
                        <StyledButton
                          small
                          color="primary"
                          @click="onOpen(props)"
                        >
                          권한 수정
                        </StyledButton>
                      </div>
                    </td>
                  </tr>
                </template>
              </ListTable>
            </div>
          </div>
        </div>
      </template>

      <template #body-inviteMember>
        <div>
          <ListTable
            height="calc(100vh - 230px)"
            :header="_inviteMemberListTableHeader"
            :items="inviteMemberItems"
            :empty-text="toValue(inviteMemberTable.emptyText)"
            :loading="toValue(inviteMemberTable.loading)"
          >
            <template #items="{ props, index }:ListTableItemSlot<MemberListTableItem>">
              <tr>
                <td>{{ props.memberEmail }}</td>
                <td>{{ AUTH[props.authLevel].TXT }}</td>
                <td>{{ util.getDateFormat(props.inviteDatetime, 'Y-m-d') }}</td>
                <td>
                  <div class="flex-center gap-8">
                    <StyledButton
                      small
                      outline
                      @click="onClickDeleteAuth(index)"
                    >
                      초대 취소
                    </StyledButton>
                    <StyledButton
                      small
                      color="primary"
                      @click="onOpen(props)"
                    >
                      권한 수정
                    </StyledButton>
                  </div>
                </td>
              </tr>
            </template>
          </ListTable>
        </div>
      </template>
    </TabMenu>
    <ClientAccountMemberRel
      ref="clientAccountMemberRelEL"
      @on:create-content="onCreateContent"
      @on:edit-content="onEditContent"
      @on:close="onPopupClose('clientAccountMember')"
      v-if="modal['clientAccountMember'].show"
    />
  </div>
</template>