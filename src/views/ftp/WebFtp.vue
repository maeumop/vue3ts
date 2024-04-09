<script setup lang="ts">
import { ref, inject } from 'vue';

import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { TabOption } from '@/types/common/TabMenu';

// vue
import TabMenu from '@/views/common/TabMenu/index.vue';
import FTPContents from '@/views/common/ftp/Contents/index.vue';
import { FTP_CONTENTS_ROLE } from '@/constants/store/modules/ftp';
import type { FTP_CONTENTS_ROLE_TYPE } from '@/types/store/modules/ftp';

const MessageBox = inject('MessageBox') as MessageBoxModel;


// data()
const roles: FTP_CONTENTS_ROLE_TYPE[] = [
  FTP_CONTENTS_ROLE.UPLOAD_BUTTON, FTP_CONTENTS_ROLE.NEW_FOLDER_BUTTON, FTP_CONTENTS_ROLE.RELOAD_BUTTON,
  FTP_CONTENTS_ROLE.ALL_CHECKBOX, FTP_CONTENTS_ROLE.IMAGE_VIEWER, FTP_CONTENTS_ROLE.DELETE_BUTTON,
  FTP_CONTENTS_ROLE.CONTEXT_MENU
];
let tabindex = ref<number>(0);
let tabs = ref<TabOption[]>([
  {
    value: 'fileManage',
    title: '파일 관리',
  },
]);

// onCreate

// methods
const updateModelValueTabMenu = (value: number) => {
  if (value === 1) {
    MessageBox.alert('서비스 준비중입니다.');
  }
};
</script>
<template>
  <div id="pageWebFtp">
    <TabMenu
      :options="tabs"
      @update:model-value="updateModelValueTabMenu"
      v-model="tabindex"
    >
      <template #body-fileManage>
        <div class="layout">
          <FTPContents :roles="roles" />
        </div>
      </template>
    </TabMenu>
  </div>
</template>
