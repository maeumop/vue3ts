<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import type { StyleValue } from 'vue';
import type { KeyIndex, Options } from '@/types/common';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import FontSize from 'tiptap-extension-font-size';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TableRow from '@tiptap/extension-table-row';
import {
  mdiFormatColorText,
  mdiFormatColorHighlight,
  mdiFormatBold,
  mdiFormatItalic,
  mdiFormatUnderline,
  mdiFormatStrikethroughVariant,
  mdiFormatAlignLeft,
  mdiFormatAlignCenter,
  mdiFormatAlignRight,
  mdiFormatAlignJustify,
  mdiFormatHeader1,
  mdiFormatHeader2,
  mdiFormatHeader3,
  mdiFormatHeader4,
  mdiFormatHeader5,
  mdiCommentQuoteOutline,
  mdiFormatListBulleted,
  mdiFormatListNumbered,
  mdiLinkVariant,
  mdiTableLarge,
  mdiMenuDown,
  mdiImageMultipleOutline,
} from './svg';

// import Uploader from './uploader.vue';

const emit = defineEmits<{
  (event: 'blur'): void
  (event: 'update:modelValue', value: string): void
}>();

const props = withDefaults(defineProps<{
  modelValue: string
  width?: string
  height?: string
  maxHeight?: string
  tools?: string[][]
}>(), {
  width: '100%',
  height: '300px',
  // table, image, link, heading4, heading5
  tools: () => [
    ['size', 'color', 'mark'],
    ['bold', 'italic', 'underline', 'strike'],
    ['textAlign'],
    ['heading1', 'heading2', 'heading3'],
    ['blockquote', 'bulletlist', 'orderedlist'],
  ],
});

// let fontSizeText =  ref<string>('글자 사이즈 선택');
let linkURL =  ref<string>('');
let imageURL =  ref<string>('');
// let linkTarget =  ref<string>('_blank');
let tableRows =  ref<number>(2);
let tableCols =  ref<number>(3);
let selection =  ref<boolean>(false);

const inputBox = reactive<KeyIndex<any>>({
  image: {
    left: '0px',
    right: '',
    transformOrigin: 'top left',
  },
  link: {
    left: '0px',
    right: '',
    transformOrigin: 'top left',
  },
  table: {
    left: '0px',
    right: '',
    transformOrigin: 'top left',
  }
});

const show = reactive<KeyIndex<boolean>>({
  link: false,
  table: false,
  tableMenu: false,
  uploader: false,
  image: false,
});

const fontSize = ref<Options[]>([]);

for (let i = 8; i <= 60; i = i + 2) {
  fontSize.value.push({
    text: `${i}px`,
    value: i
  });
}

const custHighlight = Highlight.extend({
  renderHTML: ({ HTMLAttributes }) => ['mark', HTMLAttributes, 0]
});

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      history: {
        depth: 30,
      },
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      }
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    TextStyle,
    Underline,
    FontSize,
    Color.configure({
      types: ['textStyle']
    }),
    custHighlight.configure({
      multicolor: true
    }),
    Link.configure({
      autolink: true,
      protocols: ['http', 'https', 'mailto'],
      openOnClick: false
    }),
    Table.configure({
      resizable: true,
    }),
    TableHeader,
    TableRow,
    TableCell,
    Image.configure({
      inline: true,
      allowBase64: true
    })
  ],
  onUpdate: ({ editor }): void => {
    console.log('update');
    emit('update:modelValue', editor.getHTML());
  },
  onBlur: ({ editor }): void => {
    emit('blur');
  },
  onSelectionUpdate: ({ editor }): void => {
    const { $head, $anchor } = editor.state.selection;
    const range = $head.pos - $anchor.pos;

    if (range > 0 || range < 0) {
      selection.value = true;
    } else {
      selection.value = false;
    }
  }
});

watch(() => props.modelValue, (v) => {
  if (editor.value?.getHTML() === v) {
    return;
  }

  editor.value?.commands.setContent(v, false);
});

const editorStyle = computed<StyleValue>(() => ({
  maxHeight: props.maxHeight ? props.maxHeight : props.height,
  height: props.height,
  width: props.width,
}));

const isActive = (flag: any): boolean => {
  return editor.value?.isActive(flag) ? true : false;
};

const disabled = (flag: string): boolean => {
  const can: any = editor.value?.can();

  return !(can[flag]()) ? true : false;
};

const editorAction = (flag: string, v: any = null): void => {
  const chain: any = editor.value?.chain().focus();

  if (v !== null) {
    chain[flag](v).run();
  } else {
    chain[flag]().run();
  }
};

const setFontSize = (evt: Event): void => {
  const target = evt.target as HTMLSelectElement;
  const selectedIndex = target.selectedIndex;
  const value = target.options[selectedIndex].value;

  editor.value?.chain().focus().setFontSize(value + 'px').run();
};

const createImage = (): void => {
  if (imageURL.value !== '') {
    editor.value?.chain().focus().setImage({ src: imageURL.value }).run();
    imageURL.value = '';
  }
  show.image = false;
};

const createLink = (): void => {
  if (linkURL.value !== '') {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: linkURL.value, target: '_blank' }).run();
    linkURL.value = '';
  } else {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run();
  }

  show.link = false;
};

const createTable = (): void => {
  show.table = false;

  const config = {
    rows: tableRows.value,
    cols: tableCols.value,
    withHeaderRow: true
  };

  editor.value?.chain().focus().insertTable(config).run();
};

const el = ref<HTMLDivElement>();

const toggleInputLayer = (evt: Event, flag: string): void => {
  if (flag === 'link' && !selection.value) {
    return;
  }

  const target = evt.target as HTMLElement;

  const elRect = el.value!.getBoundingClientRect();
  const tgRect = target.getBoundingClientRect();
  const rightMax = elRect.x + elRect.width;
  const leftPos = tgRect.x + 300;
  const boxName = flag.toLowerCase();

  if (rightMax < leftPos) {
    inputBox[boxName].left = '';
    inputBox[boxName].right = '0px';
    inputBox[boxName].transformOrigin = 'top right';
  } else {
    inputBox[boxName].left = '0px';
    inputBox[boxName].right = '';
    inputBox[boxName].transformOrigin = 'top left';
  }

  // 링크 생성인 경우 선택된 블럭에 링크가 있다면 링크를 제거한다.
  if (selection.value && editor.value?.isActive('link')) {
    linkURL.value = editor.value?.getAttributes('link').href;
  } else if (selection.value && editor.value?.isActive('image')) {
    imageURL.value = editor.value?.getAttributes('image').src;
  }
  show[flag] = !show[flag];
};

const toggleTableMenu = (): void => {
  show.tableMenu = !show.tableMenu;
};

const closeLayerPopup = (evt: MouseEvent): void => {
  const target = evt.target as HTMLElement;

  const table = el.value!.querySelector('.input-tools.table');
  const tableMenu = el.value!.querySelector('.drop-down');
  const link = el.value!.querySelector('.input-tools.link');
  const image = el.value!.querySelector('.input-tools.image');

  if (table && !table.contains(target)) {
    show.table = false;
  }

  if (image && !image.contains(target)) {
    show.image = false;
  }

  if (tableMenu && !tableMenu.contains(target)) {
    show.tableMenu = false;
  }

  if (link && !link.contains(target)) {
    show.link = false;
  }
};

// 파일 업로드
// const setImages = (imgs: string[]): void => {
//   imgs.forEach(img => {
//     editor.value?.chain().focus().setImage({ src: img }).run();
//   });
// };

onMounted(() => {
  document.addEventListener('click', closeLayerPopup);
});

onUnmounted(() => {
  document.removeEventListener('click', closeLayerPopup);
  editor.value?.destroy();
});
</script>

<template>
  <div>
    <div ref="el" id="editorContent" v-if="editor">
      <div class="tools">
        <div
          :key="`sector-${i}`"
          class="sector"
          v-for="(items, i) in props.tools"
        >
          <template v-for="item in items">
            <!-- 글꼴 크기 -->
            <select
              :key="`tools-${item}`"
              class="box"
              @change="setFontSize"
              v-if="item === 'size'"
            >
              <option value="">글꼴 크기 선택</option>
              <option
                :key="`fontSize-${item.value}px`"
                :selected="editor.isActive('textStyle', {fontSize: item.value + 'px'})"
                :value="item.value"
                v-for="item in fontSize"
              >
                {{ item.value }}px
              </option>
            </select>

            <!-- 텍스트 정렬 -->
            <div :key="`tools-textalign-${item}`" class="button-group" v-else-if="item === 'textAlign'">
              <a
                href="#"
                :class="{ active: isActive({ textAlign: 'left' }) }"
                @click.prevent="editorAction('setTextAlign', 'left')"
              >
                <SvgIcon type="mdi" :path="mdiFormatAlignLeft" />
              </a>
              <a
                href="#"
                :class="{ active: isActive({ textAlign: 'center' }) }"
                @click.prevent="editorAction('setTextAlign', 'center')"
              >
                <SvgIcon type="mdi" :path="mdiFormatAlignCenter" />
              </a>
              <a
                href="#"
                :class="{ active: isActive({ textAlign: 'right' }) }"
                @click.prevent="editorAction('setTextAlign', 'right')"
              >
                <SvgIcon type="mdi" :path="mdiFormatAlignRight" />
              </a>
              <a
                href="#"
                :class="{ active: isActive({ textAlign: 'justify' }) }"
                @click.prevent="editorAction('setTextAlign', 'justify')"
              >
                <SvgIcon type="mdi" :path="mdiFormatAlignJustify" />
              </a>
            </div>

            <!-- 테이블 -->
            <div :key="`tools-table-${item}`" class="table-tools" v-else-if="item === 'table'">
              <div class="input-tools table">
                <a href="#" @click.prevent="toggleInputLayer($event, 'table')">
                  <SvgIcon type="mdi" :path="mdiTableLarge" />
                </a>

                <Transition name="box-scale">
                  <div
                    class="input-layer"
                    :style="inputBox.table"
                    @click.stop
                    v-if="show.table"
                  >
                    Rows:&nbsp;<input type="text" maxlength="2" v-model="tableRows" />
                    Cols:&nbsp;<input type="text" maxlength="2" v-model="tableCols" />
                    <a href="#" class="create-button" @click.prevent="createTable">만들기</a>
                  </div>
                </Transition>
              </div>

              <div class="drop-down" @click="toggleTableMenu">
                <SvgIcon type="mdi" size="18" :path="mdiMenuDown" />

                <Transition name="box-scale">
                  <div class="drop-down-menu" v-if="show.tableMenu">
                    <a
                      href="#"
                      :class="['text-icon', { disabled: disabled('toggleHeaderCell') }]"
                      @click.prevent="editorAction('toggleHeaderCell')"
                    >
                      강조 칸
                    </a>
                    <a
                      href="#"
                      :class="['text-icon', { disabled: disabled('addColumnBefore') }]"
                      @click.prevent="editorAction('addColumnBefore')"
                    >
                      왼쪽 열 삽입
                    </a>
                    <a
                      href="#"
                      :class="['text-icon', { disabled: disabled('addColumnAfter') }]"
                      @click.prevent="editorAction('addColumnAfter')"
                    >
                      오른쪽 열 삽입
                    </a>
                    <a
                      href="#"
                      :class="['text-icon', { disabled: disabled('addRowBefore') }]"
                      @click.prevent="editorAction('addRowBefore')"
                    >
                      위쪽 행 삽입
                    </a>
                    <a
                      href="#"
                      :class="['text-icon', { disabled: disabled('addRowAfter') }]"
                      @click.prevent="editorAction('addRowAfter')"
                    >
                      아래쪽 행 삽입
                    </a>
                    <a
                      href="#"
                      :class="['text-icon', { disabled: disabled('mergeCells') }]"
                      @click.prevent="editorAction('mergeCells')"
                    >
                      칸 합치기
                    </a>
                    <a
                      href="#"
                      :class="['text-icon', { disabled: disabled('splitCell') }]"
                      @click.prevent="editorAction('splitCell')"
                    >
                      칸 분리
                    </a>
                    <a
                      href="#"
                      :class="['text-icon', { disabled: disabled('deleteColumn') }]"
                      @click.prevent="editorAction('deleteColumn')"
                    >
                      열 삭제
                    </a>
                    <a
                      href="#"
                      :class="['text-icon', { disabled: disabled('deleteRow') }]"
                      @click.prevent="editorAction('deleteRow')"
                    >
                      줄 삭제
                    </a>
                    <a
                      href="#"
                      :class="['text-icon', { disabled: disabled('deleteTable') }]"
                      @click.prevent="editorAction('deleteTable')"
                    >
                      표 삭제
                    </a>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- 링크 생성 -->
            <a
              :key="`tools-link-${item}`"
              href="#"
              :class="['input-tools link', { disabled: !selection, active: selection && isActive('link') }]"
              @click.prevent="toggleInputLayer($event, 'link')"
              v-else-if="item === 'link'"
            >
              <SvgIcon type="mdi" :path="mdiLinkVariant" />

              <Transition name="box-scale">
                <div
                  class="input-layer"
                  :style="inputBox.link"
                  @click.stop
                  v-if="show.link"
                >
                  Link:&nbsp;<input type="text" v-model="linkURL" />
                  <a href="#" class="create-button" @click.prevent="createLink">Link 생성</a>
                </div>
              </Transition>
            </a>

            <!-- 폰트 색상 -->
            <span
              :key="`tools-color-${item}`"
              class="box"
              @click.stop
              v-else-if="item === 'color'"
            >
              <SvgIcon type="mdi" :path="mdiFormatColorText" />
              <input
                class="in-editor"
                type="color"
                @input="editorAction('setColor', ($event.target as HTMLInputElement)?.value)"
              />
            </span>

            <!-- 폰트 하일라이트 -->
            <span
              :key="`tools-mark-${item}`"
              class="box"
              @click.stop
              v-else-if="item === 'mark'"
            >
              <SvgIcon type="mdi" :path="mdiFormatColorHighlight" />
              <input
                class="in-editor"
                type="color"
                @input="editorAction('setHighlight', { color: ($event.target as HTMLInputElement)?.value })"
              />
            </span>

            <!-- 이미지 삽입 -->
            <a
              :key="`tools-image-${item}`"
              href="#"
              :class="['input-tools image', { active: isActive('image')}]"
              @click.prevent="toggleInputLayer($event, 'image')"
              v-else-if="item === 'image'"
            >
              <SvgIcon type="mdi" :path="mdiImageMultipleOutline" />

              <Transition name="box-scale">
                <div
                  class="input-layer"
                  :style="inputBox.image"
                  @click.stop
                  v-if="show.image"
                >
                  image url :&nbsp;<input type="text" style="width: 120px" v-model="imageURL" />
                  <a href="#" class="create-button" @click.prevent="createImage">넣기</a>
                </div>
              </Transition>
            </a>

            <!-- 두꺼운 글씨 -->
            <a
              :key="`tools-bold-${item}`"
              href="#"
              :class="{ active: isActive('bold')}"
              @click.prevent="editorAction('toggleBold')"
              v-else-if="item === 'bold'"
            >
              <SvgIcon type="mdi" :path="mdiFormatBold" />
            </a>

            <!-- 텍스트 기울기 -->
            <a
              :key="`tools-italic-${item}`"
              href="#"
              :class="{ active: isActive('italic')}"
              @click.prevent="editorAction('toggleItalic')"
              v-else-if="item === 'italic'"
            >
              <SvgIcon type="mdi" :path="mdiFormatItalic" />
            </a>

            <!-- 밑줄 긋기 -->
            <a
              :key="`tools-underline-${item}`"
              href="#"
              :class="{ active: isActive('underline')}"
              @click.prevent="editorAction('toggleUnderline')"
              v-else-if="item === 'underline'"
            >
              <SvgIcon type="mdi" :path="mdiFormatUnderline" />
            </a>

            <!-- 취소선 긋기 -->
            <a
              :key="`tools-strike-${item}`"
              href="#"
              :class="{ active: isActive('strike')}"
              @click.prevent="editorAction('toggleStrike')"
              v-else-if="item === 'strike'"
            >
              <SvgIcon type="mdi" :path="mdiFormatStrikethroughVariant" />
            </a>

            <!-- 해드 사이즈 -->
            <a
              :key="`tools-heading-${item}`"
              href="#"
              :class="{ active: isActive({ level: 1 }) }"
              @click.prevent="editorAction('toggleHeading', { level: 1 })"
              v-else-if="item === 'heading1'"
            >
              <SvgIcon type="mdi" :path="mdiFormatHeader1" />
            </a>
            <a
              :key="`tools-heading2-${item}`"
              href="#"
              :class="{ active: isActive({ level: 2 }) }"
              @click.prevent="editorAction('toggleHeading', { level: 2 })"
              v-else-if="item === 'heading2'"
            >
              <SvgIcon type="mdi" :path="mdiFormatHeader2" />
            </a>
            <a
              :key="`tools-heading3-${item}`"
              href="#"
              :class="{ active: isActive({ level: 3 }) }"
              @click.prevent="editorAction('toggleHeading', { level: 3 })"
              v-else-if="item === 'heading3'"
            >
              <SvgIcon type="mdi" :path="mdiFormatHeader3" />
            </a>
            <a
              :key="`tools-heading4-${item}`"
              href="#"
              :class="{ active: isActive({ level: 4 }) }"
              @click.prevent="editorAction('toggleHeading', { level: 4 })"
              v-else-if="item === 'heading4'"
            >
              <SvgIcon type="mdi" :path="mdiFormatHeader4" />
            </a>
            <a
              :key="`tools-heading5-${item}`"
              href="#"
              :class="{ active: isActive({ level: 5 }) }"
              @click.prevent="editorAction('toggleHeading', { level: 5 })"
              v-else-if="item === 'heading5'"
            >
              <SvgIcon type="mdi" :path="mdiFormatHeader5" />
            </a>
            <!-- // 해드 사이즈 -->

            <!-- 덧글 -->
            <a
              :key="`tools-blockquote-${item}`"
              href="#"
              :class="{ active: isActive('blockquote')}"
              @click.prevent="editorAction('toggleBlockquote')"
              v-else-if="item === 'blockquote'"
            >
              <SvgIcon type="mdi" :path="mdiCommentQuoteOutline" />
            </a>

            <!-- 목록 (아이콘) -->
            <a
              :key="`tools-bulletlist-${item}`"
              href="#"
              :class="{ active: isActive('bulletList')}"
              @click.prevent="editorAction('toggleBulletList')"
              v-else-if="item === 'bulletlist'"
            >
              <SvgIcon type="mdi" :path="mdiFormatListBulleted" />
            </a>

            <!-- 목록 (숫자) -->
            <a
              :key="`tools-orderedlist-${item}`"
              href="#"
              :class="{ active: isActive('orderedList')}"
              @click.prevent="editorAction('toggleOrderedList')"
              v-else-if="item === 'orderedlist'"
            >
              <SvgIcon type="mdi" :path="mdiFormatListNumbered" />
            </a>
          </template>
        </div>
      </div>

      <EditorContent class="editor-wrap" :style="editorStyle" :editor="editor" />
    </div>

    <!-- <Transition name="box-scale">
      <Uploader @uploaded="setImages" @close="show.uploader = false" v-if="show.uploader" />
    </Transition> -->
  </div>
</template>

<script lang="ts">
export default { name: 'TiptapEditor' };
</script>
<style lang="scss">
@import './style.scss';
</style>
