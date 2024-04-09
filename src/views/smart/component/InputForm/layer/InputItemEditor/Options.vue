<script setup lang='ts'>
import { ref, watch, computed } from 'vue';
import { DragHandle, SlickItem, SlickList } from 'vue-slicksort';

import type { RuleFunc } from '@/components/types';
import type { InputConfigEditFormValuesItem, InputConfigListItemOptionsItem, OptionsFieldType } from '@/types/smart/component/inputForm';

import { CONST_CODES } from '@/constants/common';

import { mdiPlus, mdiMinus, mdiDragVertical } from '@/assets/svg/path';
import OptionItem from '@/views/smart/component/InputForm/layer/InputItemEditor/OptionItem.vue';


const { DB_INPUT_FIELD_TYPE } = CONST_CODES;

type ToolIconType = 'plus' | 'minus';
type ModelValueType = InputConfigListItemOptionsItem;

type Props = {
  modelValue: ModelValueType[]
  label?: string
  fieldType: OptionsFieldType
  validate?: { [K in keyof ModelValueType]?: RuleFunc[] }
  required?: boolean
  isDragHandle?: boolean
  isUseTool?: boolean
  isInfoBox?: boolean
};

const props = withDefaults(defineProps<Props>(), {
  label: '',
  required: false,
  modelValue: (): ModelValueType[] => [],
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: ModelValueType[]): void
  (event: 'sortStart', value: number): void
  (event: 'sortEnd'): void
  (event: 'on:clickTool', value: ToolIconType): void
  (event: 'update:after'): void
}>();

const _defaultOptionItem: InputConfigEditFormValuesItem = { value: '', label: '' };

let isDragMoveIndex = ref<number>(-1);

const items = computed<ModelValueType[]>({
  get: () => (props.modelValue),
  set: (items: ModelValueType[]) => emit('update:modelValue', items)
});

const defaultOptionItem = computed<ModelValueType>(
  () => {
    const result: ModelValueType = { ..._defaultOptionItem, key: `${items.value.length}_${Date.now()}` };
    props.fieldType === DB_INPUT_FIELD_TYPE.CHECK.VAL && (result.checked = false);

    return result;
  }
);

/** 
 * 드래그 시작 이벤트 
 * isDragMoveIndex는 드래그 하고 있는 객체의 index 값을 저장
 * @returns
*/
const onSortStart = ($event: { event: MouseEvent, node: HTMLElement, index: number }) => {
  isDragMoveIndex.value = $event.index;
  emit('sortStart', $event.index);
};

/** 
 * 드래그 종료 이벤트 
 * 갖고 있던 isDragMoveIndex 값 초기화
 * @returns
*/
const onSortEnd = () => {
  isDragMoveIndex.value = -1;
  emit('sortEnd');
};


/** 
 * plus, minus 버튼 클릭 이벤트 
 * @returns
*/
const onClickEditorFormValue = (type: ToolIconType = 'plus', index: number): void => {
  switch (type) {
    case 'plus': {
      // 신규 등록
      items.value.splice(items.value.length, 0, { ...defaultOptionItem.value });
      emit('on:clickTool', type);
    } return;
    case 'minus': {
      if (index >= 0 && index < items.value.length) {
        items.value = items.value.filter((_, i) => i !== index);
        emit('on:clickTool', type);
      }
    } return;
  }
};

watch(() => props.modelValue, () => {
  items.value.length < 1 && (items.value = [ { ...defaultOptionItem.value } ]);
}, { immediate: true, deep: true });

</script>
<script lang='ts'> export default { name: 'Options' };</script>
<template>
  <div class="flex-center height-23">
    <span class="custom inline mx-3 height-p-100">
      {{ props.label }}&nbsp;
      <span :class="{ required: props.required }" v-if="props.required"></span>
    </span>
  </div>
  <SlickList
    lock-axis="y"
    :hide-sortable-ghost="false"
    :class="['selectOption mx-3 py-5', { move: isDragMoveIndex > -1 }]"
    @sort-start="onSortStart"
    @sort-end="onSortEnd()"
    v-model:list="items"
  >
    <SlickItem
      :key="item.key"
      :index="index"
      :class="[ 'flex', 'gap-8', { 'mt-3': index > 0 }, { moveItem: isDragMoveIndex === index } ]"
      :disabled="!props.isDragHandle"
      v-for="(item, index) in items"
    >
      <DragHandle tag="div" class="tool" v-if="props.isUseTool">
        <SvgIcon
          class="mdi mdiDragVertical"
          type="mdi"
          size="18"
          :path="mdiDragVertical"
          v-if="props.isDragHandle"
        />
        <template v-else>
          <a
            href="#"
            class="plus"
            @click.prevent="onClickEditorFormValue('plus', index)"
            v-if="index === 0"
          >
            <SvgIcon type="mdi" size="20" :path="mdiPlus" />
          </a>
          <a
            href="#"
            class="minus"
            @click.prevent="onClickEditorFormValue('minus', index)"
            v-else
          >
            <SvgIcon type="mdi" size="20" :path="mdiMinus" />
          </a>
        </template>
      </DragHandle>
      <div class="px-0" v-else></div>
      <OptionItem
        class="width-p-100"
        :field-type="props.fieldType"
        :validate="props.validate"
        :is-value-readonly="props.isDragHandle"
        @update:after="emit('update:after')"
        v-model="items[index]"
      />
    </SlickItem>
  </SlickList>

  <div class="mx-3 pt-10" v-if="props.isInfoBox">
    <ul class="info-box-bullet py-10">
      <li>value는 실제 DB에 저장되는 값을 의미합니다.</li>
      <li>사용자 출력 문구는 사용자 화면에 표시되는 문구를 의미합니다.</li>
    </ul>
  </div>
</template>