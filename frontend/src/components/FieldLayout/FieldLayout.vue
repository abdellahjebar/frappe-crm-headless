<template>
  <div
    class="flex flex-col"
    :class="{
      'border border-outline-gray-1 rounded-lg': hasTabs,
      'border-outline-elevation-2': hasTabs,
    }"
  >
    <Tabs
      v-model="tabIndex"
      as="div"
      :tabs="processedTabs"
      :class="[
        !hasTabs ? `[&_[role='tablist']]:hidden` : '',
        `[&_[role='tablist']::-webkit-scrollbar]:h-0 [&_[role='tab']]:shrink-0 [&_[role='tabpanel']]:overflow-visible !overflow-visible`,
      ]"
    >
      <template #tab-panel="{ tab }">
        <div class="sections" :class="{ 'my-4 sm:my-5': hasTabs }">
          <template v-for="section in tab.sections" :key="section.name">
            <Section :section="section" :data-name="section.name" />
          </template>
        </div>
      </template>
    </Tabs>
  </div>
</template>

<script setup>
import Section from '@/components/FieldLayout/Section.vue'
import { useDocument } from '@/data/document'
import { FIELD_LAYOUT_KEY, makeSafeContext } from '@/composables/useFieldLayout'
import { usePermLevel, getPermOverrides } from '@/composables/usePermLevel'
import { getMeta } from '@/stores/meta'
import { Tabs } from 'frappe-ui'
import { ref, computed, provide, inject } from 'vue'

const props = defineProps({
  tabs: { type: Array, default: () => [] },
  data: { type: Object, default: () => ({}) },
  doctype: { type: String, default: 'CRM Lead' },
  docname: { type: String, default: '' },
  isGridRow: { type: Boolean, default: false },
  preview: { type: Boolean, default: false },
  context: { type: Object, default: null },
})

const tabIndex = ref(0)

const resolvedDocname = computed(() => props.docname || props.data?.name || '')

// Always inject — non-null when FieldLayout is a descendant of Grid.vue (via GridRowModal)
const inheritedCtx = inject(FIELD_LAYOUT_KEY, null)

// ── Build the single context object ────────────────────────────────────────
// All state that Field.vue, Grid.vue, and GridRowModal need flows through here.

let ctx = makeSafeContext()

if (props.context) {
  // Standalone mode: parent supplied a full context (e.g. FieldLayoutDialog).
  ctx = {
    ...props.context,
    doctype: props.doctype,
    preview: props.preview,
    isGridRow: false,
  }
} else if (props.isGridRow && inheritedCtx) {
  // Grid-row mode: inherit triggers/overrides from Grid.vue above.
  // Only data and doctype change (child doctype, row as data).
  ctx = {
    ...inheritedCtx,
    doctype: props.doctype,
    preview: props.preview,
    isGridRow: true,
  }
} else if (!props.isGridRow) {
  // Document mode: wire up scripting triggers from useDocument.
  const {
    triggerOnChange,
    triggerButton,
    triggerOnRowAdd,
    triggerOnRowRemove,
    document: formDocument,
  } = useDocument(props.doctype, resolvedDocname.value)

  const permState = usePermLevel(props.doctype)
  const { getFields } = getMeta(props.doctype)

  // Computed so Field.vue re-reads when perm data loads.
  const _permOverrides = computed(() =>
    getPermOverrides(permState, getFields({ restrictNoValueFields: true }))
  )

  ctx = {
    get doctype() { return props.doctype },
    get docname() { return resolvedDocname.value },
    get preview() { return props.preview },
    isGridRow: false,
    triggerOnChange,
    triggerButton,
    triggerOnRowAdd,
    triggerOnRowRemove,
    get fieldPropertyOverrides() { return formDocument.value?.fieldPropertyOverrides || {} },
    get ruleOverrides() { return formDocument.value?.fieldRuleOverrides || {} },
    get permOverrides() { return _permOverrides.value },
    get formDocument() { return formDocument.value },
    parentDoc: null,
    parentFieldname: null,
  }
}

// ── Tab / section visibility (uses overrides for hidden flags) ─────────────
const overrides = computed(() => ctx.fieldPropertyOverrides || {})
const virtualFields = computed(() => ctx.formDocument?.virtualFields || [])
const virtualSections = computed(() => ctx.formDocument?.virtualSections || [])

// Insert virtual fields into the section they target.
// For each virtual field: find the section by _sectionName, then insert after
// the named `after` field (searching all columns). Falls back to appending at
// the end of the first column when `after` is absent or not found.
function mergeVirtualFields(sections, vfs) {
  if (!vfs.length) return sections
  return sections.map((section) => {
    const forSection = vfs.filter((f) => f._sectionName === section.name)
    if (!forSection.length) return section
    const cols = section.columns.map((col) => ({ ...col, fields: [...col.fields] }))
    // Tracks the last inserted fieldname for each `after` anchor so that multiple
    // fields targeting the same anchor stay in add-order rather than reversing.
    const lastInsertedFor = {}
    for (const { _sectionName: _, after, ...fieldDef } of forSection) {
      const effectiveAfter = after != null && lastInsertedFor[after] != null
        ? lastInsertedFor[after]
        : after
      let inserted = false
      if (effectiveAfter != null) {
        for (let ci = 0; ci < cols.length; ci++) {
          const fi = cols[ci].fields.findIndex((f) => f.fieldname === effectiveAfter)
          if (fi !== -1) {
            cols[ci].fields.splice(fi + 1, 0, fieldDef)
            lastInsertedFor[after] = fieldDef.fieldname
            inserted = true
            break
          }
        }
      }
      if (!inserted) {
        cols[0]?.fields.push(fieldDef)
        if (after != null) lastInsertedFor[after] = fieldDef.fieldname
      }
    }
    return { ...section, columns: cols }
  })
}

// Insert virtual sections after named sibling sections within a tab.
// Falls back to appending at the end of the tab when `after` is not found.
function mergeVirtualSections(sections, vss) {
  if (!vss.length) return sections
  const result = [...sections]
  for (const { after, fields = [], ...sectionDef } of vss) {
    const section = {
      ...sectionDef,
      columns: [{ name: `${sectionDef.name}_col1`, label: '', fields }],
    }
    const afterIdx = after != null ? result.findIndex((s) => s.name === after) : -1
    if (afterIdx !== -1) {
      result.splice(afterIdx + 1, 0, section)
    } else {
      result.push(section)
    }
  }
  return result
}

const processedTabs = computed(() => {
  const ov = overrides.value
  const vf = virtualFields.value
  const vs = virtualSections.value
  return props.tabs
    .map((tab) => {
      const tabOverrides = ov[tab.name]
      const processedTab = tabOverrides ? { ...tab, ...tabOverrides } : tab
      let sections = processedTab.sections.map((section) => {
        const sectionOverrides = ov[section.name]
        return sectionOverrides
          ? { ...section, ...sectionOverrides }
          : section
      })
      sections = mergeVirtualFields(sections, vf)
      sections = mergeVirtualSections(sections, vs)
      return { ...processedTab, sections }
    })
    .filter((tab) => !tab.hidden)
})

const hasTabs = computed(() => {
  return (
    processedTabs.value.length > 1 ||
    (processedTabs.value.length == 1 && processedTabs.value[0].label)
  )
})

// ── Provide ────────────────────────────────────────────────────────────────
// data and hasTabs stay as light separate keys (display concerns, not scripting).
// Everything else lives in the single context envelope.
provide('data', computed(() => props.data))
provide('hasTabs', hasTabs)
provide(FIELD_LAYOUT_KEY, ctx)
</script>

<style scoped>
.section:not(:has(.field)) {
  display: none;
}

.section:has(.field):nth-child(1 of .section:has(.field)) {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}
</style>
