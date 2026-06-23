import { reactive } from 'vue'
import { getAdapter } from '@/api'

const _cache = new Map()

/**
 * Fetches the current user's permitted perm levels for a doctype.
 * Result is cached per doctype for the lifetime of the page.
 *
 * Backend contract — `crm.api.doc.get_user_perm_levels`:
 *   { message: { write_levels: number[], read_levels: number[] } }
 *
 * write_levels: perm levels at which the user has write access (default [0])
 * read_levels:  perm levels at which the user has read access  (default [0])
 *
 * Level 0 is always assumed accessible; fields with permlevel === 0 are never
 * restricted by this composable regardless of the backend response.
 */
export function usePermLevel(doctype) {
  if (_cache.has(doctype)) return _cache.get(doctype)

  const state = reactive({
    loading: true,
    error: null,
    write_levels: [0],
    read_levels: [0],
  })

  _cache.set(doctype, state)

  getAdapter()
    .request('POST', 'crm.api.doc.get_user_perm_levels', { doctype })
    .then((result) => {
      const data = result?.message || {}
      state.write_levels = data.write_levels ?? [0]
      state.read_levels = data.read_levels ?? [0]
    })
    .catch((err) => {
      state.error = err
      // On error: fall back to level-0-only access (most restrictive safe default)
    })
    .finally(() => {
      state.loading = false
    })

  return state
}

/**
 * Pure function — computes field-level overrides from a loaded perm state.
 *
 * @param {object} permState  - reactive state from usePermLevel() (write_levels, read_levels)
 * @param {Array}  fields     - field definitions with .fieldname and optional .permlevel
 * @returns {object}          - { [fieldname]: { hidden: true } | { read_only: true } }
 *
 * Priority: hidden > read_only (if a user can't read, hide beats read_only)
 * Level 0 fields are never restricted — they are always skipped.
 */
export function getPermOverrides(permState, fields) {
  const writeSet = new Set(permState.write_levels ?? [0])
  const readSet = new Set(permState.read_levels ?? [0])
  const overrides = {}
  for (const field of fields) {
    const level = field.permlevel ?? 0
    if (level === 0) continue
    if (!readSet.has(level)) {
      overrides[field.fieldname] = { hidden: true }
    } else if (!writeSet.has(level)) {
      overrides[field.fieldname] = { read_only: true }
    }
  }
  return overrides
}

/** Clear the cache — useful in tests or on logout. */
export function clearPermLevelCache() {
  _cache.clear()
}
