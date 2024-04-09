<script setup lang='ts'>
import { computed } from 'vue';

import type { ListTableItem, ListTableItemSlot } from '@/components/ListTable/types';
import type { Template, PropsTemplateItem } from '@/types/settings';

const props = withDefaults(defineProps<{
  default?: PropsTemplateItem
  header?: PropsTemplateItem
  parameta?: PropsTemplateItem
  response?: PropsTemplateItem
}>(), {
});

let templateItems: Template  = {
  default: { title: '기본정보', headers: [ { key: 'method', text: 'Method', width: '200px' }, { key: 'url', text: 'URL' } ] },
  header: { title: 'Header', headers: [ { key: 'header', text: 'Header', width: '200px' }, { key: 'description', text: 'Description' } ] },
  parameta: { title: 'Parameter', headers: [
    { key: 'name', text: 'Name', width: '150px' },
    { key: 'type', text: 'Type', width: '100px' },
    { key: 'size', text: 'Size', width: '70px' },
    { key: 'description', text: 'Description' },
    { key: 'required', text: 'Required', width: '100px' }
  ] },
  response: { title: 'Response (JSON)', headers: [
    { key: 'field', text: 'Field', width: '150px' },
    { key: 'name', text: 'Name', width: '100px' },
    { key: 'description', text: 'Description' }
  ] },
};
// computed
const getTemplates = computed(() => {

  const res: Template = {
    default: Object.assign({}, templateItems.default, props.default || {}),
    header: Object.assign({}, templateItems.header, props.header || {}),
  };

  if ( props.parameta) {
    Object.assign(res, { parameta: Object.assign({}, templateItems.parameta, props.parameta || {} ) });
  }

  if ( props.response) {
    Object.assign(res, { response: Object.assign({}, templateItems.response, props.response || {}) });
  }

  return res;
});

</script>
<script lang='ts'> export default { name: 'SettingsApiDocTemplate' };</script>
<template>
  <div>
    <h3 class="subTitle">고객 DB 등록</h3>
    <div class="mainContent mx-20 mt-20 mb-50">
      <div :key="key" v-for="(item, key) in getTemplates">
        <h4 class="font-m-2 mb-10">
          <slot :name="`${key}:title`">
            {{ item?.title }}
          </slot>
        </h4>
        <ListTable
          class="mb-20"
          :header="item?.headers"
          :items="item?.items || []"
        >
          <template #items="{ props }:ListTableItemSlot<ListTableItem>">
            <slot :name="`${key}:items`" :props="props">
              <tr>
                <template :key="h" v-for="(header, h) in (item?.headers || [])">
                  <slot :name="`${key}:item:${header.key}`" :props="props[`${header.key}`]">
                    <td>
                      {{ props[`${header.key}`] }}
                    </td>
                  </slot>
                </template>
              </tr>
            </slot>
          </template>
        </ListTable>
      </div>
    </div>
  </div>
</template>