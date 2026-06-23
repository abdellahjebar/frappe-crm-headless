import { describe, it, expect } from 'vitest'

// ─── Pure merge helpers (copied from FieldLayout.vue logic) ──────────────────
// These are tested in isolation — no Vue runtime needed.

function mergeVirtualFields(sections, vfs) {
  if (!vfs.length) return sections
  return sections.map((section) => {
    const forSection = vfs.filter((f) => f._sectionName === section.name)
    if (!forSection.length) return section
    const cols = section.columns.map((col) => ({ ...col, fields: [...col.fields] }))
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSection(name, fieldnames) {
  return {
    name,
    label: name,
    columns: [{
      name: `${name}_col1`,
      fields: fieldnames.map((fn) => ({ fieldname: fn, fieldtype: 'Data', label: fn })),
    }],
  }
}

// ─── mergeVirtualFields ───────────────────────────────────────────────────────

describe('mergeVirtualFields', () => {
  it('returns sections unchanged when no virtual fields', () => {
    const sections = [makeSection('s1', ['a', 'b'])]
    expect(mergeVirtualFields(sections, [])).toBe(sections)
  })

  it('appends field to the end of the first column when no after is given', () => {
    const sections = [makeSection('s1', ['a', 'b'])]
    const vfs = [{ _sectionName: 's1', fieldname: '_x', fieldtype: 'HTML', label: 'X' }]
    const result = mergeVirtualFields(sections, vfs)
    const names = result[0].columns[0].fields.map((f) => f.fieldname)
    expect(names).toEqual(['a', 'b', '_x'])
  })

  it('inserts field after a named field', () => {
    const sections = [makeSection('s1', ['a', 'b', 'c'])]
    const vfs = [{ _sectionName: 's1', fieldname: '_x', fieldtype: 'Data', label: 'X', after: 'a' }]
    const result = mergeVirtualFields(sections, vfs)
    const names = result[0].columns[0].fields.map((f) => f.fieldname)
    expect(names).toEqual(['a', '_x', 'b', 'c'])
  })

  it('falls back to appending when after field does not exist', () => {
    const sections = [makeSection('s1', ['a', 'b'])]
    const vfs = [{ _sectionName: 's1', fieldname: '_x', fieldtype: 'Data', label: 'X', after: 'zzz' }]
    const result = mergeVirtualFields(sections, vfs)
    const names = result[0].columns[0].fields.map((f) => f.fieldname)
    expect(names).toEqual(['a', 'b', '_x'])
  })

  it('does not modify sections with a different name', () => {
    const sections = [makeSection('s1', ['a']), makeSection('s2', ['b'])]
    const vfs = [{ _sectionName: 's2', fieldname: '_x', fieldtype: 'Data', label: 'X' }]
    const result = mergeVirtualFields(sections, vfs)
    expect(result[0].columns[0].fields.map((f) => f.fieldname)).toEqual(['a'])
    expect(result[1].columns[0].fields.map((f) => f.fieldname)).toEqual(['b', '_x'])
  })

  it('does not mutate original sections', () => {
    const sections = [makeSection('s1', ['a', 'b'])]
    const original = JSON.parse(JSON.stringify(sections))
    const vfs = [{ _sectionName: 's1', fieldname: '_x', fieldtype: 'Data', label: 'X', after: 'a' }]
    mergeVirtualFields(sections, vfs)
    expect(sections).toEqual(original)
  })

  it('preserves add-order when multiple fields target the same after position', () => {
    const sections = [makeSection('s1', ['a', 'b'])]
    const vfs = [
      { _sectionName: 's1', fieldname: '_x', fieldtype: 'Data', label: 'X', after: 'a' },
      { _sectionName: 's1', fieldname: '_y', fieldtype: 'Data', label: 'Y', after: 'a' },
    ]
    const result = mergeVirtualFields(sections, vfs)
    const names = result[0].columns[0].fields.map((f) => f.fieldname)
    // _x goes after 'a'; _y also targets 'a' but chains to '_x' automatically
    expect(names).toEqual(['a', '_x', '_y', 'b'])
  })

  it('inserts into the correct column when after targets a field in column 2', () => {
    const section = {
      name: 's1',
      label: 's1',
      columns: [
        { name: 's1_col1', fields: [{ fieldname: 'a', fieldtype: 'Data', label: 'a' }] },
        { name: 's1_col2', fields: [{ fieldname: 'b', fieldtype: 'Data', label: 'b' }] },
      ],
    }
    const vfs = [{ _sectionName: 's1', fieldname: '_x', fieldtype: 'Data', label: 'X', after: 'b' }]
    const result = mergeVirtualFields([section], vfs)
    expect(result[0].columns[0].fields.map((f) => f.fieldname)).toEqual(['a'])
    expect(result[0].columns[1].fields.map((f) => f.fieldname)).toEqual(['b', '_x'])
  })
})

// ─── mergeVirtualSections ────────────────────────────────────────────────────

describe('mergeVirtualSections', () => {
  it('returns sections unchanged when no virtual sections', () => {
    const sections = [makeSection('s1', ['a'])]
    expect(mergeVirtualSections(sections, [])).toBe(sections)
  })

  it('appends section when no after is given', () => {
    const sections = [makeSection('s1', ['a'])]
    const vss = [{ name: '_new', label: 'New', fields: [{ fieldname: '_f', fieldtype: 'Data', label: 'F' }] }]
    const result = mergeVirtualSections(sections, vss)
    expect(result.map((s) => s.name)).toEqual(['s1', '_new'])
    expect(result[1].columns[0].fields[0].fieldname).toBe('_f')
  })

  it('inserts section after named sibling', () => {
    const sections = [makeSection('s1', []), makeSection('s2', []), makeSection('s3', [])]
    const vss = [{ name: '_new', label: 'New', after: 's1', fields: [] }]
    const result = mergeVirtualSections(sections, vss)
    expect(result.map((s) => s.name)).toEqual(['s1', '_new', 's2', 's3'])
  })

  it('falls back to appending when after section does not exist', () => {
    const sections = [makeSection('s1', []), makeSection('s2', [])]
    const vss = [{ name: '_new', label: 'New', after: 'zzz', fields: [] }]
    const result = mergeVirtualSections(sections, vss)
    expect(result.map((s) => s.name)).toEqual(['s1', 's2', '_new'])
  })

  it('generates a single-column wrapper for virtual section fields', () => {
    const sections = []
    const vss = [{ name: '_s', label: 'S', fields: [{ fieldname: '_f', fieldtype: 'Int', label: 'F' }] }]
    const result = mergeVirtualSections(sections, vss)
    expect(result[0].columns).toHaveLength(1)
    expect(result[0].columns[0].name).toBe('_s_col1')
    expect(result[0].columns[0].fields[0].fieldname).toBe('_f')
  })

  it('does not mutate original sections array', () => {
    const sections = [makeSection('s1', []), makeSection('s2', [])]
    const original = sections.map((s) => s.name)
    const vss = [{ name: '_new', label: 'New', after: 's1', fields: [] }]
    mergeVirtualSections(sections, vss)
    expect(sections.map((s) => s.name)).toEqual(original)
  })

  it('inserts multiple virtual sections at their respective positions', () => {
    const sections = [makeSection('s1', []), makeSection('s2', []), makeSection('s3', [])]
    const vss = [
      { name: '_a', label: 'A', after: 's1', fields: [] },
      { name: '_b', label: 'B', after: 's2', fields: [] },
    ]
    const result = mergeVirtualSections(sections, vss)
    expect(result.map((s) => s.name)).toEqual(['s1', '_a', 's2', '_b', 's3'])
  })
})
