<script setup lang="ts">
import List from './list.vue';
import Invited from './invitedList.vue';
import TabMenu from '@/views/common/TabMenu/index.vue';

import { ref } from 'vue';
import type { TabOption } from '@/types/common/TabMenu';

let tabindex = ref(0);
let tabs = ref<TabOption[]>([
  {
    value: 'list',
    title: '내 관리 내역',
  },
  {
    value: 'invited',
    title: '초대 받은 내역',
  },
]);

let newClientAccept = ref(false);

/**
 * 초대 수락한 클라이언트 내 관리내역에 추가
 * @param data 초대 수락한 클리이언트 정보
 */
const onAccept = (): void => {
  newClientAccept.value = true;
};

</script>

<template>
  <TabMenu
    :options="tabs"
    v-model="tabindex"
  >
    <template #body-list>
      <List :new-client-accept="newClientAccept" @accepted="newClientAccept = false" />
    </template>
    <template #body-invited>
      <Invited :is-active="tabindex === 1" @on-accept="onAccept" />
    </template>
  </TabMenu>
</template>

<style lang="scss">
#mypage .component.tabMenu {
  display: flex;
  flex-direction: column;
  .bodyLayout {
    flex: 1 0 0;
     > .tabMenuItem {
      display: flex;
    }
  }
}
</style>
