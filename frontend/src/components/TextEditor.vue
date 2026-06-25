<template>
  <Editor
    ref="editorRef"
    v-model="localContent"
    :extensions="extensions"
    :placeholder="placeholder"
    :editable="editable"
    @change="(v) => emit('change', v)"
    @blur="emit('blur')"
  >
    <template #default="{ editor: frappe_editor }">
      <slot name="top" />
      <EditorFixedMenu v-if="fixedMenu && editable" :items="articleToolbar" />
      <slot name="editor" :editor="frappe_editor">
        <EditorContent :class="editorClass" />
      </slot>
      <EditorBubbleMenu v-if="bubbleMenu && editable" :items="minimalToolbar" />
      <slot name="bottom" />
    </template>
  </Editor>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import {
  Editor,
  EditorContent,
  EditorFixedMenu,
  EditorBubbleMenu,
  CommentKit,
  articleToolbar,
  minimalToolbar,
} from 'frappe-ui/editor'

const props = defineProps({
  content: { type: String, default: '' },
  placeholder: { type: String, default: null },
  editable: { type: Boolean, default: true },
  mentions: { type: Array, default: () => [] },
  editorClass: { type: [String, Array, Object], default: '' },
  fixedMenu: { type: Boolean, default: false },
  bubbleMenu: { type: Boolean, default: true },
  starterkitOptions: { type: Object, default: () => ({}) },
  extensions: { type: Array, default: () => [] },
})

const emit = defineEmits(['change', 'blur'])

const localContent = ref(props.content)

watch(
  () => props.content,
  (val) => {
    if (val !== localContent.value) localContent.value = val
  },
)

// Extensions created once at setup time. Mention items use a getter so they
// stay reactive without recreating the editor. Additional extensions (e.g.
// a custom Paragraph with extra attributes) are merged in after CommentKit.
const extensions = [
  CommentKit.configure({
    mention: {
      items: () =>
        props.mentions.map((m) => ({ id: m.value, label: m.label })),
    },
    starterKit: props.starterkitOptions || {},
  }),
  ...props.extensions,
]

const editorRef = ref(null)

// Expose the tiptap editor instance. Vue auto-unwraps the computed when
// accessed via a template ref, so parent.editor gives the Editor directly.
const editor = computed(() => editorRef.value?.editor?.value ?? null)
defineExpose({ editor })
</script>
