import { describe, it, expect, beforeEach } from 'vitest'
import { getPermOverrides, clearPermLevelCache } from '@/composables/usePermLevel'

beforeEach(() => {
  clearPermLevelCache()
})

// ─── helpers ─────────────────────────────────────────────────────────────────

function field(fieldname, permlevel = 0) {
  return { fieldname, fieldtype: 'Data', label: fieldname, permlevel }
}

function permState(writeLevels, readLevels) {
  return { write_levels: writeLevels, read_levels: readLevels }
}

// ─── getPermOverrides ─────────────────────────────────────────────────────────

describe('getPermOverrides', () => {
  it('returns empty object when all fields are at level 0', () => {
    const state = permState([0], [0])
    const fields = [field('name', 0), field('status', 0), field('email', 0)]
    expect(getPermOverrides(state, fields)).toEqual({})
  })

  it('returns empty object when user has write access to all levels in use', () => {
    const state = permState([0, 1, 2], [0, 1, 2])
    const fields = [field('name', 0), field('secret', 1), field('internal', 2)]
    expect(getPermOverrides(state, fields)).toEqual({})
  })

  it('marks level-1 field read_only when user has read but not write at level 1', () => {
    const state = permState([0], [0, 1])
    const fields = [field('name', 0), field('secret', 1)]
    expect(getPermOverrides(state, fields)).toEqual({
      secret: { read_only: true },
    })
  })

  it('marks level-1 field hidden when user has no read access at level 1', () => {
    const state = permState([0], [0])
    const fields = [field('name', 0), field('secret', 1)]
    expect(getPermOverrides(state, fields)).toEqual({
      secret: { hidden: true },
    })
  })

  it('hidden takes precedence over read_only (no read → hidden, not read_only)', () => {
    const state = permState([0], [0])
    const fields = [field('restricted', 2)]
    const result = getPermOverrides(state, fields)
    expect(result.restricted).toEqual({ hidden: true })
    expect(result.restricted.read_only).toBeUndefined()
  })

  it('applies restrictions at multiple levels independently', () => {
    const state = permState([0], [0, 1])  // can read level 1, cannot read level 2
    const fields = [
      field('public',    0),
      field('sensitive', 1),  // can read, not write → read_only
      field('internal',  2),  // cannot read → hidden
    ]
    expect(getPermOverrides(state, fields)).toEqual({
      sensitive: { read_only: true },
      internal:  { hidden: true },
    })
  })

  it('does not restrict level-0 fields even when write_levels is empty', () => {
    const state = permState([], [])
    const fields = [field('name', 0), field('status', 0)]
    expect(getPermOverrides(state, fields)).toEqual({})
  })

  it('treats missing permlevel as level 0 — never restricted', () => {
    const state = permState([0], [0])
    const fields = [{ fieldname: 'legacy', fieldtype: 'Data', label: 'Legacy' }]
    expect(getPermOverrides(state, fields)).toEqual({})
  })

  it('returns empty object for empty fields array', () => {
    const state = permState([0], [0])
    expect(getPermOverrides(state, [])).toEqual({})
  })

  it('does not mutate the fields array', () => {
    const state = permState([0], [0])
    const fields = [field('secret', 1)]
    const original = JSON.parse(JSON.stringify(fields))
    getPermOverrides(state, fields)
    expect(fields).toEqual(original)
  })

  it('handles admin user with all levels — no restrictions', () => {
    const state = permState([0, 1, 2, 3], [0, 1, 2, 3])
    const fields = [field('a', 0), field('b', 1), field('c', 2), field('d', 3)]
    expect(getPermOverrides(state, fields)).toEqual({})
  })
})
