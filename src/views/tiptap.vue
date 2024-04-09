<script setup lang="ts">
import { ref } from 'vue';
import TiptapEditor from '@/components/TiptapEditor/index.vue';

let content = ref<string>('');
const tools = [
  ['size', 'color', 'mark'],
  ['bold', 'italic', 'underline', 'strike'],
  ['textAlign'],
  ['heading1', 'heading2', 'heading3', 'heading4', 'heading5'],
  ['blockquote', 'bulletlist', 'orderedlist'],
  ['image', 'link'],
  ['table'],
];
</script>

<template>
  <div class="content p-15">
    <div class="card">
      <div class="card-header">
        Tiptap Editor
      </div>
      <div class="card-body icons">
        <TiptapEditor height="500px" :tools="tools" v-model="content" />
      </div>
    </div>
  </div>
</template>
