<script setup lang="ts">
import type { InputFieldConfigItem } from '@/types/api/databaseApi';
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  items: InputFieldConfigItem[],
  modelValue: string
  disabled?: boolean
  onBlur?:  (Function | Function[])
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>();

let list = ref<InputFieldConfigItem[]>([...props.items]);
let isShow = ref<boolean>(false);
let timeout: number = 0;
let timeout2: number = 0;

const inputCode = ref<HTMLDivElement>();

const updateValue = (evt: Event): void => {
  const target = evt.target as HTMLInputElement;
  emit('update:modelValue', target.value);

  clearTimeout(timeout);

  timeout = setTimeout(() => {
    showCodeList(target.value);
  }, 300);
};

/**
 * 치환 코드 선택 완료
 * @param code
 */
const selected = (code: string): void => {
  emit('update:modelValue', code);
  isShow.value = false;
};

const regExp: RegExp = /^({#=)[(a-z|A-Z|\d){1}_?(a-z|A-Z|\d)?]+}$/;
let position = ref<string>('bottom');
let transitionName = ref<string>('slide-down');

const codeList = ref<HTMLUListElement>();

/**
 * 치환 코드 자동 완성 목록 표시 및 필터
 * @param v
 */
const showCodeList = (v: string): void => {
  if (regExp.test(v)) {
    isShow.value = false;
    return;
  }

  const windowHeight = window.innerHeight;
  const rect = inputCode.value?.getBoundingClientRect();

  position.value = 'bottom';
  transitionName.value = 'slide-down';

  if (windowHeight < rect!.y + 350) {
    position.value = 'top';
    transitionName.value = 'slide-up';
  }

  if (position.value === 'bottom') {
    codeList.value!.style.top = `${rect!.y + 42}px`;
  } else {
    codeList.value!.style.bottom = `${windowHeight - rect!.y + 2}px`;
  }

  const startCode = ['{', '{#', '{#='];
  const startWord = v.substring(0, 3);

  if (startCode.includes(startWord)) {
    clearTimeout(timeout2);

    const keyword = v.replace('{#=', '').replace('{#', '').replace('{', '');

    // 변환 코드 시작 상태에서 keyword를 입력 할 경우
    if (keyword) {
      // 너무 잦은 filter를 방지 하기 위한 timeout 설정
      timeout2 = setTimeout(() => {
        list.value = list.value.filter(item => item.replaceCode.includes(keyword));
      }, 10);
    } else {
      list.value = [...props.items];
    }

    isShow.value = true;
  } else {
    isShow.value = false;
  }
};

/**
 * 마우스 클릭시 본 컴포넌트에 클릭 되지 않을 경우 코드 목록 창을 닫아 준다.
 * @param event
 */
const isInBound = (event: MouseEvent): void => {
  const target = event.target as HTMLElement;

  if (!inputCode.value!.contains(target)) {
    isShow.value = false;
  }
};

/**
 * blur event 처리
 */
const onBlurEvent = (): void => {
  if (Array.isArray(props.onBlur)) {
    props.onBlur.forEach((func) => {
      if (func instanceof Function) {
        func();
      }
    });
  } else if (props.onBlur instanceof Function) {
    props.onBlur();
  }
};

let modalBody: HTMLDivElement;

const codeInfoListClose = (): void => {
  isShow.value = false;
};

let selectedKeyIndex = ref<number>(0);

const onKeyHandler = (event: KeyboardEvent): void => {
  const code = event.code.toLowerCase();

  if (isShow.value) {
    const li = codeList.value?.querySelectorAll<HTMLLIElement>('.option-item');

    if (li) {
      const len = li.length;

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
        const index = selectedKeyIndex.value;
        const value = list.value[index].replaceCode;
        selected(value);
      } else if (code === 'escape') {
        isShow.value = false;
      }
    }
  } else if (code === 'arrowdown' || code === 'arrowup') {
    isShow.value = true;
  }
};

onMounted(() => {
  modalBody = document.querySelector('.modal-body') as HTMLDivElement;
  document.addEventListener('click', isInBound);
  modalBody.addEventListener('scroll', codeInfoListClose);
  inputCode.value?.addEventListener('keydown', onKeyHandler);
});

onUnmounted(() => {
  document.removeEventListener('click', isInBound);
  modalBody.removeEventListener('scroll', codeInfoListClose);
  inputCode.value?.removeEventListener('keydown', onKeyHandler);
});
</script>

<template>
  <div ref="inputCode" class="input-code">
    <input
      type="text"
      placeholder="Value 입력"
      :disabled="props.disabled"
      :value="props.modelValue"
      @input="updateValue"
      @focus="showCodeList(props.modelValue)"
      @blur="onBlurEvent"
    />

    <Transition :name="transitionName">
      <ul
        ref="codeList"
        :class="['code-info-list', position]"
        v-show="isShow"
      >
        <li
          :key="item.replaceCode"
          :class="['option-item', selectedKeyIndex === i && 'key-selected']"
          @click.prevent="selected(item.replaceCode)"
          v-for="(item, i) in list"
        >
          {{ item.fieldLabel }}
          <span>{{ item.replaceCode }}</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style lang="scss">
.error .input-code input {
  border-color: $red !important;
}

.input-code {
  position: relative;

  input[type=text] {
    width: 100%;
    border: 1px solid $gray-300;
    height: 40px;
    padding: 9px 16px;

    &:focus {
      outline: none;
      border: 1px solid $primary;
    }
  }

  .code-info-list {
    border: 1px solid $gray-300;
    position: fixed;
    background-color: #fff;
    z-index: 100;
    width: max-content;
    max-height: 300px;
    overflow-y: auto;

    &.bottom {
      transform-origin: top center;
    }

    &.top {
      transform-origin: bottom center;
    }


    .option-item {
      display: block;
      padding: 7px 10px !important;
      font-size: 13px;
      border: 1px solid #fff;

      &.key-selected {
        border: 2px solid $primary;
      }

      span {
        font-size: 15px;
        font-weight: bold;
        font-family: monospace !important;
      }

      &:hover {
        background-color: $gray-100;
      }

      &:focus {
        border: 1px solid $primary;
        background-color: $gray-100;
      }
    }
  }
}
</style>
<script lang="ts">
export default { name: 'InputCode' };
</script>