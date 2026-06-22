import { useQuery } from '@/composables/useQuery'
import { noValueFieldTypes, standardFieldsMeta } from '@/utils/model.js'
import { formatCurrency, formatNumber } from '@/utils/numberFormat.js'
import { computed, reactive } from 'vue'

const doctypesMeta = reactive({})
const userSettings = reactive({})

export function getMeta(doctype) {
  const meta = useQuery({
    url: 'frappe.desk.form.load.getdoctype',
    params: {
      doctype: doctype,
      with_parent: 1,
      cached_timestamp: null,
    },
    cache: ['Meta', doctype],
    onSuccess: (res) => {
      let dtMetas = res.docs
      for (let dtMeta of dtMetas) {
        doctypesMeta[dtMeta.name] = dtMeta
      }

      userSettings[doctype] = JSON.parse(res.user_settings)
    },
  })

  const doctypeMeta = computed(() => doctypesMeta[doctype] || null)

  if (!doctypesMeta[doctype] && !meta.loading) {
    meta.fetch()
  }

  function getFormattedPercent(fieldname, doc) {
    let value = getFormattedFloat(fieldname, doc)
    return value + '%'
  }

  function getFormattedFloat(fieldname, doc) {
    let df = doctypesMeta[doctype]?.fields.find((f) => f.fieldname == fieldname)
    let precision = df?.precision || null
    return formatNumber(doc[fieldname], '', precision)
  }

  function getFloatWithPrecision(fieldname, doc) {
    let df = doctypesMeta[doctype]?.fields.find((f) => f.fieldname == fieldname)
    let precision = df?.precision || null
    return formatNumber(doc[fieldname], '', precision)
  }

  function getCurrencyWithPrecision(fieldname, doc) {
    let df = doctypesMeta[doctype]?.fields.find((f) => f.fieldname == fieldname)
    let precision = df?.precision || null
    return formatCurrency(doc[fieldname], '', '', precision)
  }

  function getFormattedCurrency(fieldname, doc, parentDoc = null) {
    let currency = window.sysdefaults.currency || 'USD'
    let df = doctypesMeta[doctype]?.fields.find((f) => f.fieldname == fieldname)
    let precision = df?.precision || null

    if (df && df.options) {
      if (df.options.indexOf(':') != -1) {
        // TODO: Handle this case
      } else if (doc && doc[df.options]) {
        currency = doc[df.options]
      } else if (parentDoc && parentDoc[df.options]) {
        currency = parentDoc[df.options]
      }
    }

    return formatCurrency(doc[fieldname], '', currency, precision)
  }

  function getGridSettings() {
    return doctypeMeta.value || {}
  }

  function getGridViewSettings(parentDoctype) {
    if (!userSettings[parentDoctype]?.['GridView']?.[doctype]) return {}
    return userSettings[parentDoctype]['GridView'][doctype]
  }

  // Returns a cloned, transformed copy of a single field from doctypesMeta.
  // Never mutates the raw meta object — callers receive their own copy.
  function getField(fieldname, { dt = doctype } = {}) {
    const raw = (doctypesMeta[dt]?.fields || []).find(
      (f) => f.fieldname === fieldname,
    )
    if (!raw) return null
    const f = { ...raw }
    if (f.fieldtype === 'Select' && typeof f.options === 'string') {
      const opts = f.options.split('\n').map((o) => ({ label: o, value: o }))
      if (opts[0]?.value !== '' && f.reqd !== 1) {
        opts.unshift({ label: '', value: '' })
      }
      f.options = opts
    }
    if (f.fieldtype === 'Link' && f.options === 'User') {
      f.fieldtype = 'User'
    }
    return f
  }

  function getFields(options = {}) {
    let {
      dt = doctype,
      withStandardFields = false,
      restrictNoValueFields = true,
      restrictedFieldTypes = [],
    } = options

    let fieldsMeta =
      (doctypesMeta[dt]?.fields || [])
        .filter(
          (f) =>
            (!restrictNoValueFields ||
              !noValueFieldTypes.includes(f.fieldtype)) &&
            (!restrictedFieldTypes.length ||
              !restrictedFieldTypes.includes(f.fieldtype)),
        )
        .map((f) => getField(f.fieldname, { dt }))
        .filter(Boolean)

    if (withStandardFields) {
      fieldsMeta = fieldsMeta.concat(standardFieldsMeta)
    }

    return fieldsMeta
  }

  function saveUserSettings(parentDoctype, key, value, callback) {
    let oldUserSettings = userSettings[parentDoctype] || {}
    let newUserSettings = JSON.parse(JSON.stringify(oldUserSettings))

    if (newUserSettings[key] === undefined) {
      newUserSettings[key] = { [doctype]: value }
    } else {
      newUserSettings[key][doctype] = value
    }

    if (JSON.stringify(oldUserSettings) !== JSON.stringify(newUserSettings)) {
      return useQuery({
        url: 'frappe.model.utils.user_settings.save',
        params: {
          doctype: parentDoctype,
          user_settings: JSON.stringify(newUserSettings),
        },
        auto: true,
        onSuccess: () => {
          userSettings[parentDoctype] = newUserSettings
          callback?.()
        },
      })
    }
    userSettings[parentDoctype] = newUserSettings
    return callback?.()
  }

  function isTranslatable(dt = null) {
    dt = dt || doctype
    let meta = doctypesMeta[dt]
    return meta && meta.translated_doctype
  }

  return {
    meta,
    doctypeMeta,
    doctypesMeta,
    userSettings,
    getField,
    getFields,
    getGridSettings,
    getGridViewSettings,
    saveUserSettings,
    getFloatWithPrecision,
    getCurrencyWithPrecision,
    getFormattedFloat,
    getFormattedPercent,
    getFormattedCurrency,
    isTranslatable,
  }
}
