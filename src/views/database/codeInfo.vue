<script setup lang="ts">
import { ref } from 'vue';
import { useDatabaseApi } from '@/api/modules/databaseApi';
import type { ListTableHeader } from '@/components/ListTable/types';
import { getDbsInputFieldsConfigMsg } from '@/constants/api/databaseApi';
import { INPUT_FIELDS_CONFIG } from '@/constants/db';
import type { InputFieldConfigItem } from '@/types/api/databaseApi';
import type { ListTableItemSlot } from '@/components/ListTable/types';

const databaseApi = useDatabaseApi();

const tableHeader: ListTableHeader[] = [
  { text: '구분', width: '' },
  { text: '변환 코드', width: '' },
  { text: '설명', width: '' },
];

let list = ref<InputFieldConfigItem[]>([]);

const getInputFieldConfigData = async () => {
  const { code, results } = await databaseApi.getDbsInputFieldsConfig(INPUT_FIELDS_CONFIG.api);

  if (code === getDbsInputFieldsConfigMsg.DB_INPUT_FIELDS_GET_SUCCESS) {
    list.value = results;
  }
};

getInputFieldConfigData();
</script>

<template>
  <div class="codeInfo table-wrap">
    <div class="table-content">
      <ListTable height="100%" :header="tableHeader" :items="list">
        <template #items="{ props }: ListTableItemSlot<InputFieldConfigItem>">
          <tr>
            <td>{{ props.fieldLabel }}</td>
            <td>{{ props.replaceCode }}</td>
            <td>{{ props.replaceCodeDesc }}</td>
          </tr>
        </template>
      </ListTable>
    </div>
  </div>
</template>