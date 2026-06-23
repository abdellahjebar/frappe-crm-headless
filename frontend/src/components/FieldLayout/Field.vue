<template>
  <div v-if="field.visible" class="field">
    <div
      v-if="
        field.fieldtype != 'Check' &&
        field.fieldtype != 'Button' &&
        field.fieldtype != 'HTML'
      "
      class="mb-2 text-sm text-ink-gray-5"
    >
      {{ __(field.label) }}
      <span
        v-if="
          field.reqd ||
          (field.mandatory_depends_on && field.mandatory_via_depends_on)
        "
        class="text-ink-red-5"
        >*</span
      >
    </div>
    <FormControl
      v-if="
        (field.read_only || field.fieldtype === 'Read Only') &&
        ![
          'Int',
          'Float',
          'Currency',
          'Percent',
          'Check',
          'Duration',
          'Rating',
          'Button',
          'Attach',
          'Attach Image',
          'HTML',
          'Geolocation',
          'Text Editor',
        ].includes(field.fieldtype)
      "
      v-model="data[field.fieldname]"
      type="text"
      :placeholder="getPlaceholder(field)"
      :disabled="true"
      :description="field.description"
    />
    <Grid
      v-else-if="field.fieldtype === 'Table'"
      v-model="data[field.fieldname]"
      v-model:parent="data"
      :doctype="field.options"
      :parentDoctype="ctx.doctype"
      :parentFieldname="field.fieldname"
    />
    <FormControl
      v-else-if="field.fieldtype === 'Select'"
      v-model="data[field.fieldname]"
      type="select"
      class="form-control"
      :class="field.prefix ? 'prefix' : ''"
      :options="field.options"
      :placeholder="getPlaceholder(field)"
      :description="field.description"
      @update:modelValue="(e) => fieldChange(e, field)"
    >
      <template v-if="field.prefix" #prefix>
        <IndicatorIcon :class="field.prefix" />
      </template>
    </FormControl>
    <div v-else-if="field.fieldtype == 'Check'" class="flex items-center gap-2">
      <FormControl
        v-model="data[field.fieldname]"
        class="form-control"
        type="checkbox"
        :disabled="Boolean(field.read_only)"
        :description="field.description"
        @change="(e) => fieldChange(e.target.checked, field)"
      />
      <label
        class="text-sm text-ink-gray-5"
        @click="
          () => {
            if (!Boolean(field.read_only)) {
              data[field.fieldname] = !data[field.fieldname]
            }
          }
        "
      >
        {{ __(field.label) }}
        <span v-if="field.mandatory" class="text-ink-red-6">*</span>
      </label>
    </div>
    <div
      v-else-if="['Link', 'Dynamic Link'].includes(field.fieldtype)"
      class="flex gap-1"
    >
      <Link
        class="form-control flex-1 truncate"
        :value="data[field.fieldname]"
        :doctype="
          field.fieldtype == 'Link' ? field.options : data[field.options]
        "
        :filters="field.filters"
        :placeholder="getPlaceholder(field)"
        :onCreate="field.create"
        @change="(v) => fieldChange(v, field)"
      />
      <Button
        v-if="data[field.fieldname] && field.edit"
        class="shrink-0"
        :label="__('Edit')"
        :iconLeft="EditIcon"
        @click="field.edit(data[field.fieldname])"
      />
    </div>

    <TableMultiselectInput
      v-else-if="field.fieldtype === 'Table MultiSelect'"
      v-model="data[field.fieldname]"
      :doctype="field.options"
      @change="(v) => fieldChange(v, field)"
    />

    <Link
      v-else-if="field.fieldtype === 'User'"
      class="form-control"
      :value="data[field.fieldname] && getUser(data[field.fieldname]).full_name"
      :doctype="field.options"
      :filters="field.filters"
      :placeholder="getPlaceholder(field)"
      :hideMe="true"
      @change="(v) => fieldChange(v, field)"
    >
      <template #prefix>
        <UserAvatar
          v-if="data[field.fieldname]"
          class="mr-2"
          :user="data[field.fieldname]"
          size="sm"
        />
      </template>
      <template #item-prefix="{ option }">
        <UserAvatar class="mr-2" :user="option.value" size="sm" />
      </template>
      <template #item-label="{ option }">
        <Tooltip :text="option.value">
          <div class="cursor-pointer">
            {{ getUser(option.value).full_name }}
          </div>
        </Tooltip>
      </template>
    </Link>
    <Combobox
      v-else-if="field.fieldtype === 'Autocomplete'"
      v-model="data[field.fieldname]"
      :options="getOptions(field.options)"
      :placeholder="getPlaceholder(field)"
      :disabled="Boolean(field.read_only)"
      @update:modelValue="(v) => fieldChange(v, field, data)"
    />
    <TimePicker
      v-else-if="field.fieldtype === 'Time'"
      :value="data[field.fieldname]"
      :format="getFormat('', '', false, true, false)"
      :placeholder="getPlaceholder(field)"
      input-class="border-none"
      @change="(v) => fieldChange(v, field)"
    />
    <DateTimePicker
      v-else-if="field.fieldtype === 'Datetime'"
      :value="data[field.fieldname]"
      :format="getFormat('', '', true, true, false)"
      :placeholder="getPlaceholder(field)"
      input-class="border-none"
      @change="(v) => fieldChange(v, field)"
    />
    <DatePicker
      v-else-if="field.fieldtype === 'Date'"
      :value="data[field.fieldname]"
      :format="getFormat('', '', true, false, false)"
      :placeholder="getPlaceholder(field)"
      input-class="border-none"
      @change="(v) => fieldChange(v, field)"
    />
    <FormControl
      v-else-if="
        ['Small Text', 'Text', 'Long Text', 'Code'].includes(field.fieldtype)
      "
      type="textarea"
      :value="data[field.fieldname]"
      :placeholder="getPlaceholder(field)"
      :description="field.description"
      @change="fieldChange($event.target.value, field)"
    />
    <Password
      v-else-if="field.fieldtype === 'Password'"
      :value="data[field.fieldname]"
      :placeholder="getPlaceholder(field)"
      :description="field.description"
      @change="fieldChange($event.target.value, field)"
    />
    <FormattedInput
      v-else-if="field.fieldtype === 'Int'"
      type="text"
      :placeholder="getPlaceholder(field)"
      :value="data[field.fieldname] || '0'"
      :disabled="Boolean(field.read_only)"
      :description="field.description"
      @change="fieldChange($event.target.value, field)"
    />
    <FormattedInput
      v-else-if="field.fieldtype === 'Percent'"
      type="text"
      :value="getFormattedPercent(field.fieldname, data)"
      :placeholder="getPlaceholder(field)"
      :disabled="Boolean(field.read_only)"
      :description="field.description"
      @change="fieldChange(flt($event.target.value), field)"
    />
    <FormattedInput
      v-else-if="field.fieldtype === 'Float'"
      type="text"
      :value="getFormattedFloat(field.fieldname, data)"
      :placeholder="getPlaceholder(field)"
      :disabled="Boolean(field.read_only)"
      :description="field.description"
      @change="fieldChange(flt($event.target.value), field)"
    />
    <FormattedInput
      v-else-if="field.fieldtype === 'Currency'"
      type="text"
      :value="getFormattedCurrency(field.fieldname, data, ctx.parentDoc)"
      :placeholder="getPlaceholder(field)"
      :disabled="Boolean(field.read_only)"
      :description="field.description"
      @change="fieldChange(flt($event.target.value), field)"
    />
    <DurationInput
      v-else-if="field.fieldtype === 'Duration'"
      :value="data[field.fieldname]"
      :placeholder="getPlaceholder(field)"
      :disabled="Boolean(field.read_only)"
      :description="field.description"
      @change="(v) => fieldChange(v, field)"
    />
    <RatingInput
      v-else-if="field.fieldtype === 'Rating'"
      :value="data[field.fieldname]"
      :max="field.options || 5"
      :disabled="Boolean(field.read_only)"
      @change="(v) => fieldChange(v, field)"
    />
    <ButtonControl
      v-else-if="field.fieldtype === 'Button'"
      :label="field.label"
      :icon="field.icon"
      :theme="getButtonTheme(field.button_color)"
      :variant="getButtonVariant(field.button_color)"
      :disabled="Boolean(field.read_only)"
      @click="handleButtonClick(field)"
    />
    <AttachControl
      v-else-if="['Attach', 'Attach Image'].includes(field.fieldtype)"
      :value="data[field.fieldname]"
      :doctype="ctx.doctype"
      :docname="data.name"
      :fieldname="field.fieldname"
      :imageOnly="field.fieldtype === 'Attach Image'"
      :disabled="Boolean(field.read_only)"
      @change="(v) => fieldChange(v, field)"
    />
    <HtmlControl v-else-if="field.fieldtype === 'HTML'" :html="resolvedHtml" />
    <TextEditorControl
      v-else-if="field.fieldtype === 'Text Editor'"
      :value="data[field.fieldname]"
      :placeholder="getPlaceholder(field)"
      :disabled="Boolean(field.read_only)"
      @change="(v) => fieldChange(v, field)"
    />
    <GeolocationControl
      v-else-if="field.fieldtype === 'Geolocation'"
      :value="data[field.fieldname]"
      :disabled="Boolean(field.read_only)"
      @change="(v) => fieldChange(v, field)"
    />
    <FormControl
      v-else
      type="text"
      :placeholder="getPlaceholder(field)"
      :value="data[field.fieldname]"
      :disabled="Boolean(field.read_only)"
      :description="field.description"
      @change="fieldChange($event.target.value, field)"
    />
  </div>
</template>

<script setup>
import Password from '@/components/Controls/Password.vue'
import FormattedInput from '@/components/Controls/FormattedInput.vue'
import DurationInput from '@/components/Controls/DurationInput.vue'
import RatingInput from '@/components/Controls/RatingInput.vue'
import AttachControl from '@/components/Controls/AttachControl.vue'
import HtmlControl from '@/components/Controls/HtmlControl.vue'
import TextEditorControl from '@/components/Controls/TextEditorControl.vue'
import GeolocationControl from '@/components/Controls/GeolocationControl.vue'
import ButtonControl, {
  getButtonTheme,
  getButtonVariant,
} from '@/components/Controls/ButtonControl.vue'
import EditIcon from '@/components/Icons/EditIcon.vue'
import IndicatorIcon from '@/components/Icons/IndicatorIcon.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import TableMultiselectInput from '@/components/Controls/TableMultiselectInput.vue'
import Link from '@/components/Controls/Link.vue'
import Grid from '@/components/Controls/Grid.vue'
import { createDocument } from '@/composables/document'
import {
  getFormat,
  evaluateDependsOnValue,
  isNull,
  interpolateTemplate,
} from '@/utils'
import { flt, formatNumber, formatCurrency } from '@/utils/numberFormat.js'
import { getMeta } from '@/stores/meta'
import { parseLinkFilters } from '@/utils/fieldTransforms'
import { usersStore } from '@/stores/users'
import { useDocument } from '@/data/document'
import { FIELD_LAYOUT_KEY, makeSafeContext } from '@/composables/useFieldLayout'

import {
  Combobox,
  Tooltip,
  DatePicker,
  DateTimePicker,
  TimePicker,
} from 'frappe-ui'
import { computed, provide, inject } from 'vue'

const props = defineProps({
  field: { type: Object, required: true },
})

// ── Single envelope inject ─────────────────────────────────────────────────
// FieldLayout provides this. Grid.vue re-provides an enriched version for grid rows.
const ctx = inject(FIELD_LAYOUT_KEY, makeSafeContext())

// data and hasTabs stay as separate lightweight inject keys (pure display).
const data = inject('data')
const preview = inject('preview', computed(() => false))

// Guard getMeta — skip when doctype is empty (inline/standalone mode)
let getFormattedPercent, getFormattedFloat, getFormattedCurrency
if (ctx.doctype) {
  ;({ getFormattedPercent, getFormattedFloat, getFormattedCurrency } =
    getMeta(ctx.doctype))
} else {
  getFormattedPercent = (fn, doc) => formatNumber(doc[fn], '', null) + '%'
  getFormattedFloat = (fn, doc) => formatNumber(doc[fn], '', null)
  getFormattedCurrency = (fn, doc) =>
    formatCurrency(doc[fn], '', window.sysdefaults?.currency || 'USD', null)
}

const { users, getUser } = usersStore()

// ── Document binding (document mode only) ─────────────────────────────────
// In standalone and grid-row modes, FieldLayout already resolved the triggers.
// In document mode, Field.vue calls useDocument to enrich the context and
// re-provide it so that Grid.vue below gets triggers too.
if (!ctx.isGridRow && !ctx.formDocument && ctx.doctype) {
  const resolvedName = ctx.docname || data?.value?.name || ''
  const doc = useDocument(ctx.doctype, resolvedName)

  // Enrich the context object in place — it's a plain object so mutation is fine.
  ctx.triggerOnChange = doc.triggerOnChange
  ctx.triggerButton = doc.triggerButton
  ctx.triggerOnRowAdd = doc.triggerOnRowAdd
  ctx.triggerOnRowRemove = doc.triggerOnRowRemove
  Object.defineProperty(ctx, 'fieldPropertyOverrides', {
    get() { return doc.document?.value?.fieldPropertyOverrides || {} },
    configurable: true,
  })
  Object.defineProperty(ctx, 'formDocument', {
    get() { return doc.document?.value },
    configurable: true,
  })
}

// Re-provide the (potentially enriched) context so Grid.vue below sees it.
provide(FIELD_LAYOUT_KEY, ctx)

// ── Field override resolution ─────────────────────────────────────────────
function getFieldOverrides(fieldname) {
  if (ctx.isGridRow) {
    const ov = ctx.fieldPropertyOverrides || {}
    const pf = ctx.parentFieldname
    if (!pf) return undefined

    const colKey = `${pf}.${fieldname}`
    const rowName = data.value?.name
    const rowKey = rowName ? `${colKey}:${rowName}` : null

    // Priority (lowest → highest): rules < perm < script column < script row.
    const ruleOv = ctx.ruleOverrides?.[fieldname]
    const permOv = ctx.permOverrides?.[fieldname]
    const colOv = ov[colKey]
    const rowOv = rowKey ? ov[rowKey] : null

    if (!ruleOv && !permOv && !colOv && !rowOv) return undefined
    return { ...(ruleOv || {}), ...(permOv || {}), ...(colOv || {}), ...(rowOv || {}) }
  }
  // Priority (lowest → highest): rules < perm < script field.
  const ruleOv = ctx.ruleOverrides?.[fieldname]
  const permOv = ctx.permOverrides?.[fieldname]
  const scriptOv = ctx.formDocument?.fieldPropertyOverrides?.[fieldname]
  if (!ruleOv && !permOv && !scriptOv) return undefined
  return { ...(ruleOv || {}), ...(permOv || {}), ...(scriptOv || {}) }
}

const field = computed(() => {
  let field = { ...props.field }

  const overrides = getFieldOverrides(field.fieldname)
  if (overrides) {
    Object.assign(field, overrides)
  }

  if (field.fieldtype == 'Select' && typeof field.options === 'string') {
    field.options = field.options.split('\n').map((option) => {
      return { label: option, value: option }
    })

    if (field.options[0].value !== '' && !field.reqd) {
      field.options.unshift({ label: '', value: '' })
    }
  }

  if (field.fieldtype === 'Link' && field.options === 'User') {
    field.fieldtype = 'User'
    field.link_filters = JSON.stringify({
      name: ['in', users.data.crmUsers?.map((user) => user.name)],
      ignore_user_type: 1,
      ...(parseLinkFilters(field.link_filters) || {}),
    })
  }

  if (field.fieldtype === 'Link' && field.options !== 'User') {
    if (!field.create) {
      field.create = (value, close) => {
        const callback = (d) => {
          if (d) fieldChange(d.name, field)
        }
        createDocument(field.options, value, close, callback)
      }
    }
  }

  const read_only_via_depends_on = evaluateDependsOnValue(
    field.read_only_depends_on,
    data.value,
  )

  const scriptReadOnly = overrides?.read_only
  const effectiveReadOnly =
    scriptReadOnly !== undefined
      ? scriptReadOnly
      : field.read_only ||
        (field.read_only_depends_on && read_only_via_depends_on)

  const scriptHidden = overrides?.hidden
  const displayViaDependsOn = evaluateDependsOnValue(
    field.depends_on,
    data.value,
  )

  let _field = {
    ...field,
    filters: parseLinkFilters(field.link_filters),
    placeholder: field.placeholder || field.label,
    display_via_depends_on: displayViaDependsOn,
    mandatory_via_depends_on: evaluateDependsOnValue(
      field.mandatory_depends_on,
      data.value,
    ),
    read_only: effectiveReadOnly,
  }

  _field.visible = isFieldVisible(_field, scriptHidden)
  return _field
})

function isFieldVisible(field, scriptHidden) {
  if (preview?.value) return true

  if (scriptHidden !== undefined) return !scriptHidden

  let readOnlyField =
    field.read_only || field.fieldtype === 'Read Only' ? true : false

  let hideEmptyReadOnlyField =
    isNull(data.value[field.fieldname]) &&
    Number(window.sysdefaults?.hide_empty_read_only_fields ?? 1)

  let showReadOnlyField = readOnlyField && !hideEmptyReadOnlyField

  return (
    (field.fieldtype == 'Check' || showReadOnlyField || !readOnlyField) &&
    (!field.depends_on || field.display_via_depends_on) &&
    !field.hidden
  )
}

const resolvedHtml = computed(() => {
  if (field.value.fieldtype !== 'HTML') return ''
  const injected = ctx.formDocument?.fieldHtmlMap?.[field.value.fieldname]
  if (injected !== undefined) return injected
  return interpolateTemplate(field.value.options || '', data.value)
})

const getPlaceholder = (field) => {
  if (field.placeholder) {
    return __(field.placeholder)
  }
  if (['Select', 'Link'].includes(field.fieldtype)) {
    return __('Select {0}', [__(field.label)])
  } else {
    return __('Enter {0}', [__(field.label)])
  }
}

const getOptions = (options) => {
  if (Array.isArray(options)) {
    return options
  } else if (typeof options === 'string') {
    return options.split('\n').map((option) => {
      return { label: option, value: option }
    })
  } else {
    return []
  }
}

async function handleButtonClick(field) {
  if (typeof field.click === 'function') {
    return await field.click(data.value)
  } else {
    return await ctx.triggerButton(field.fieldname)
  }
}

async function fieldChange(value, df) {
  value = Array.isArray(value)
    ? value
    : typeof value === 'object' && value !== null && 'value' in value
      ? value.value
      : value

  if (ctx.isGridRow) {
    await ctx.triggerOnChange(df.fieldname, value, data.value)
  } else {
    await ctx.triggerOnChange(df.fieldname, value)
  }
}
</script>

<style scoped>
:deep(.form-control.prefix select) {
  padding-left: 2rem;
}
</style>
