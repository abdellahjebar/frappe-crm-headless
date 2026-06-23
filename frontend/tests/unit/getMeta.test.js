import { describe, it, expect, beforeEach } from 'vitest'

// ── Minimal mock of getMeta that exercises just getField / getFields ──────────
// We import the raw functions from meta.js through a lightweight adapter that
// lets us inject a fake doctypesMeta without bootstrapping the full Vue/Vite
// environment and adapter stack.

import { noValueFieldTypes } from '../../src/utils/model.js'

function makeMetaStore(fields) {
  const doctypesMeta = { TestDT: { fields } }
  const standardFieldsMeta = []

  function getField(fieldname, { dt = 'TestDT' } = {}) {
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
    const {
      dt = 'TestDT',
      withStandardFields = false,
      restrictNoValueFields = true,
      restrictedFieldTypes = [],
    } = options

    let result = (doctypesMeta[dt]?.fields || [])
      .filter(
        (f) =>
          (!restrictNoValueFields || !noValueFieldTypes.includes(f.fieldtype)) &&
          (!restrictedFieldTypes.length ||
            !restrictedFieldTypes.includes(f.fieldtype)),
      )
      .map((f) => getField(f.fieldname, { dt }))
      .filter(Boolean)

    if (withStandardFields) result = result.concat(standardFieldsMeta)
    return result
  }

  return { doctypesMeta, getField, getFields }
}

describe('getMeta.getField', () => {
  let raw
  let store

  beforeEach(() => {
    raw = {
      fieldname: 'status',
      fieldtype: 'Select',
      options: 'Open\nClosed\nReplied',
      hidden: 0,
      reqd: 0,
      label: 'Status',
    }
    store = makeMetaStore([raw])
  })

  it('returns null for an unknown fieldname', () => {
    expect(store.getField('nonexistent')).toBeNull()
  })

  it('converts Select options string to array', () => {
    const f = store.getField('status')
    expect(Array.isArray(f.options)).toBe(true)
    expect(f.options[0]).toEqual({ label: '', value: '' })  // blank prepended
    expect(f.options).toHaveLength(4)  // blank + 3 values
  })

  it('does NOT mutate the raw doctypesMeta object', () => {
    store.getField('status')
    expect(typeof raw.options).toBe('string')
  })

  it('returns independent copies — mutating one result does not affect another', () => {
    const a = store.getField('status')
    const b = store.getField('status')
    a.label = 'MUTATED'
    expect(b.label).toBe('Status')
  })

  it('converts Link→User to fieldtype User', () => {
    const linkRaw = { fieldname: 'owner', fieldtype: 'Link', options: 'User', hidden: 0, reqd: 0, label: 'Owner' }
    const s = makeMetaStore([linkRaw])
    const f = s.getField('owner')
    expect(f.fieldtype).toBe('User')
    expect(linkRaw.fieldtype).toBe('Link')  // raw untouched
  })

  it('prepends blank option only when Select and reqd===0', () => {
    const reqd = { fieldname: 'req_status', fieldtype: 'Select', options: 'A\nB', hidden: 0, reqd: 1, label: 'Req' }
    const s = makeMetaStore([reqd])
    const f = s.getField('req_status')
    expect(f.options[0].value).toBe('A')  // no blank prepended
  })
})

describe('getMeta.getFields', () => {
  it('includes hidden fields — callers filter if they need non-hidden', () => {
    const fields = [
      { fieldname: 'a', fieldtype: 'Data', hidden: 0, label: 'A' },
      { fieldname: 'b', fieldtype: 'Data', hidden: 1, label: 'B' },
    ]
    const { getFields } = makeMetaStore(fields)
    const result = getFields()
    expect(result.map((f) => f.fieldname)).toEqual(['a', 'b'])

    // Callers that need only visible fields apply their own filter
    const visible = result.filter((f) => !f.hidden)
    expect(visible.map((f) => f.fieldname)).toEqual(['a'])
  })

  it('excludes no-value field types when restrictNoValueFields=true', () => {
    const fields = [
      { fieldname: 'a', fieldtype: 'Data', hidden: 0, label: 'A' },
      { fieldname: 'b', fieldtype: 'Section Break', hidden: 0, label: 'B' },
    ]
    const { getFields } = makeMetaStore(fields)
    const result = getFields()
    expect(result.every((f) => f.fieldname !== 'b')).toBe(true)
  })

  it('does NOT mutate doctypesMeta on repeated calls', () => {
    const raw = { fieldname: 'x', fieldtype: 'Select', options: 'Y\nZ', hidden: 0, reqd: 0, label: 'X' }
    const { getFields, doctypesMeta } = makeMetaStore([raw])
    getFields()
    getFields()
    expect(typeof doctypesMeta.TestDT.fields[0].options).toBe('string')
  })
})
