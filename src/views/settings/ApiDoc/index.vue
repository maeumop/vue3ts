<script setup lang='ts'>
import { ref } from 'vue';
import type { ListTableItem } from '@/components/ListTable/types';
import type { PropsTemplateItem } from '@/types/settings';

import ApiDocumentTemplate from '@/views/settings/ApiDoc/Template/index.vue';

let defaultProps = ref<PropsTemplateItem>({
  items: [
    { method: 'POST', url: '{API URL 출력}' }
  ]
});

let headerProps = ref<PropsTemplateItem>({
  items: [
    { header: 'Content-Type', description: 'application/json' }
  ]
});

let parametaProps = ref<PropsTemplateItem>({
  items: [
    { name: 'code', type: 'String', size: '50', description: '매체코드 값', required: 'T' },
    { name: 'name', type: 'String', size: '5', description: '고객 이름', required: 'T' },
  ]
});


let responseProps = ref<PropsTemplateItem>({
  items: [
    {
      'field': 'result',
      'values': [
        {
          'field': 'result', 'name': 'success', 'nameDesc': '성공', 'description': ''
        },
        {
          'field': 'result', 'name': 'fail', 'nameDesc': '실패', 'description': '{Parameter}_field : {Parameter} 값 미 제공'
        },
        {
          'field': 'result', 'name': 'fail', 'nameDesc': '실패', 'description': '400 : BadRequest'
        },
        {
          'field': 'result', 'name': 'fail', 'nameDesc': '실패', 'description': '401 : BadRequest'
        }
      ]
    },
  ]
});


</script>
<script lang='ts'> export default { name: 'SettingsApiDoc' };</script>
<template>
  <div id="settingsApiDocument" class="narrow-content">
    <ApiDocumentTemplate
      :default="defaultProps"
      :header="headerProps"
      :parameta="parametaProps"
      :response="responseProps"
    >

      <template #default:title></template>
      <template #parameta:item:required="{ props }: { props: string }">
        <td class="text-center">
          {{ props === 'T' ? '○' : '' }}
        </td>
      </template>

      <template #response:items="{ props }: { props: ListTableItem }">
        <tr>
          <td :rowspan="(props['values']).length"> {{ props['field'] }} </td>
          <td> {{ props['values'][0]['name'] }} </td>
          <td> {{ props['values'][0]['nameDesc'] }} </td>
        </tr>
        <tr :key="i" v-for="(i) in ((props['values']).length - 1)">
          <td> {{ props['values'][i]['name'] }} </td>
          <td>
            <div class="row">
              <div class="col-3">{{ props['values'][i]['nameDesc'] }}</div>
              <div class="col-9">{{ props['values'][i]['description'] }}</div>
            </div>
          </td>
        </tr>
      </template>
    </ApiDocumentTemplate>
  </div>
</template>