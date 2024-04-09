<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { mdiChevronDown, mdiMagnify, mdiPencil } from '@/assets/svg/path';

const emit = defineEmits<{
  (event: 'update:modelValue', value: any): void
}>();

const props = withDefaults(defineProps<{
  modelValue: string | string[]
  options: any[]
  placeholder?: string
  searchable?: boolean
  readonly?: boolean
}>(), {
  placeholder: '',
  searchable: false,
});

let selectedText = ref<string>('');
let selectedValue = ref<string>('');
let isShowOption = ref<boolean>(false);
let searchText = ref<string>('');

const optionList = ref<any[]>([]);

const Selector = ref<HTMLDivElement>();
const searchInput = ref<HTMLInputElement>();
const selectorList = ref<HTMLDivElement>();

watch(() => props.modelValue, () => {
  setDefaultModelValue();
});

watch(() => props.options, () => {
  optionList.value = [...props.options];
  setDefaultModelValue();
});

/**
 * 초기 modelValue 바로 대입할시 selectedValue의 값이 modelValue 메모리를 참조
 * 다중선택(btnAccept) 적용 버튼을 만족 시키기 위해 구조분해 할당 적용
 */
const setDefaultModelValue = () => {
  props.options.forEach(({ value, text }) => {
    if (props.modelValue === value) {
      selectedText.value = text;
      selectedValue.value = value;
    }
  });
};

/**
 * options 항목 선택 이벤트
 *
 * @param index
 */
const selectOption = (v: any): void => {
  const [{ text }] = optionList.value.filter(item => item.value === v);

  selectedValue.value = v;
  selectedText.value = text;

  emit('update:modelValue', v);
  toggleOption();
};

/**
 * 이미 선택된 옵션인지 판별
 *
 * @param index
 */
const isOptionSelected = (v: any): boolean => {
  return props.modelValue === v;
};

/**
 * 옵션 목록 표시
 */
const toggleOption = (): void => {
  if (!props.readonly) {
    isShowOption.value = !isShowOption.value;

    if (isShowOption.value) {
      if (props.searchable) {
        searchInput.value!.value = '';
      }

      optionList.value = [...props.options];

      nextTick(() => {
        const selected = selectorList.value?.querySelector('.selected');
        selected?.scrollIntoView();
      });
    }
  }
};

/**
 * 본 객체 외의 부분을 클릭할 경우 옵션 목록 숨김
 *
 * @param evt
 */
const outSideClickEvent = (evt: MouseEvent): void => {
  const target = evt.target as HTMLBodyElement;

  if (isShowOption.value && !Selector.value!.contains(target)) {
    toggleOption();
  }
};

optionList.value = [...props.options];

let selectedKeyIndex = ref<number>(0);

const onKeyHandler = (event: KeyboardEvent): void => {
  if (isShowOption.value) {
    const li = selectorList.value?.querySelectorAll<HTMLLIElement>('.option-item');

    if (li) {
      const len = li.length;
      const code = event.code.toLowerCase();

      if (code === 'arrowdown' && selectedKeyIndex.value < len) {
        selectedKeyIndex.value++;

        if (selectedKeyIndex.value >= len) {
          selectedKeyIndex.value = 0;
        }

        li[selectedKeyIndex.value].scrollIntoView({ block: 'center' });

      } else if (code === 'arrowup' && selectedKeyIndex.value >= -1) {
        selectedKeyIndex.value--;

        if (selectedKeyIndex.value === -1) {
          selectedKeyIndex.value = len - 1;
        }

        li[selectedKeyIndex.value].scrollIntoView({ block: 'center' });

      } else if (code === 'enter') {
        const value = optionList.value[selectedKeyIndex.value].value;
        selectOption(value);
      } else if (code === 'escape') {
        isShowOption.value = false;
      }
    }
  }
};

let timeout: number = 0;

// props.searchable 적용시
const searching = (evt: KeyboardEvent): void => {
  const key = evt.key.toLowerCase();

  clearTimeout(timeout);

  if (key !== 'arrowup' && key !== 'arrowdown') {
    timeout = setTimeout(() => {
      const { value } = evt.target as HTMLInputElement;

      if (value) {
        optionList.value = props.options.filter(({ text }) => text.toLowerCase().indexOf(value) > -1);
      } else {
        optionList.value = [...props.options];
      }
    }, 300);
  }
};

watch(isShowOption, (v) => {
  if (v) {
    document.addEventListener('keyup', onKeyHandler);
  } else {
    document.removeEventListener('keyup', onKeyHandler);
  }
});

onMounted(() => {
  document.addEventListener('click', outSideClickEvent);
});

onUnmounted(() => {
  document.removeEventListener('click', outSideClickEvent);
  document.removeEventListener('keyup', onKeyHandler);
});

setDefaultModelValue();
</script>

<template>
  <div
    ref="Selector"
    class="smart-editor-selector"
    @click="toggleOption"
  >
    <div class="text" v-if="selectedText">
      {{ selectedText }}
    </div>
    <div class="text ph" v-else>
      {{ props.placeholder }}
    </div>

    <div :class="['arrow', { rotate: isShowOption }]">
      <SvgIcon type="mdi" :path="mdiChevronDown" />
    </div>

    <Transition name="options-view">
      <div class="option-list" v-show="isShowOption">
        <div
          class="search"
          @click.stop
          v-if="props.searchable"
        >
          <div class="search-wrap">
            <input
              ref="searchInput"
              placeholder="페이지명, 페이지 코드를 입력해 주세요."
              type="text"
              @keydown="searching"
              v-model="searchText"
            />
            <SvgIcon type="mdi" size="30" :path="mdiMagnify" />
          </div>
        </div>
        <ul ref="selectorList" class="scrollbar">
          <template v-if="optionList.length">
            <li
              :key="`select-${item.value}`"
              :class="['option-item', { selected: isOptionSelected(item.value) }, selectedKeyIndex === index && 'key-selected']"
              @click.stop="selectOption(item.value)"
              v-for="(item, index) in optionList"
            >
              <SvgIcon
                type="mdi"
                size="18"
                :class="isOptionSelected(item.value) && 'selected'"
                :path="mdiPencil"
              />

              <span>{{ item.text }}</span>

              <template v-if="item.add">
                <div class="spacer"></div>
                <div class="tail-text">{{ item.add }}</div>
              </template>
            </li>
          </template>
          <li class="items-loading" v-else-if="searchText">
            검색된 내용이 없습니다.
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
