import { reactive } from 'vue'
import { getAdapter } from '@/api'

const _cache = new Map()

/**
 * Reactive list-fetching primitive. Drop-in replacement for frappe-ui's
 * createListResource — same option shape, same reactive return object.
 *
 * Sub-resources (.insert, .delete, .setValue) each expose
 * { submit(params, callbacks?), loading, error, params } matching
 * the frappe-ui pattern so existing component call sites work unchanged.
 *
 * @param {object} options
 * @param {string}   options.doctype
 * @param {string[]} [options.fields]
 * @param {Array}    [options.filters]
 * @param {string}   [options.orderBy]
 * @param {number}   [options.pageLength]
 * @param {string|string[]} [options.cache]
 * @param {Array}    [options.initialData]
 * @param {boolean}  [options.auto]
 * @param {Function} [options.transform]
 * @param {Function} [options.onSuccess]
 * @param {Function} [options.onError]
 */
export function useList(options = {}) {
  const {
    doctype,
    fields = ['name'],
    cache: cacheOption,
    initialData = [],
    auto = false,
    transform,
    onSuccess,
    onError,
  } = options

  // Mutable query state — .update() can change these without recreating the resource.
  let _filters = options.filters ?? []
  let _orFilters = options.orFilters ?? null
  let _orderBy = options.orderBy
  let _pageLength = options.pageLength ?? 20
  let _start = 0

  const cacheKey = cacheOption
    ? Array.isArray(cacheOption) ? cacheOption.join(':') : String(cacheOption)
    : null

  const resource = reactive({
    data: initialData ? [...initialData] : [],
    loading: false,
    error: null,
    hasNextPage: false,
  })

  // Some components access .list.data / .list.loading (frappe-ui pattern).
  // Point .list at the resource itself — same reactive object, no copies.
  resource.list = resource

  async function fetch(append = false) {
    // Cache only applies to the first page
    if (!append && cacheKey && _cache.has(cacheKey)) {
      resource.data = _cache.get(cacheKey)
      return
    }

    resource.loading = true
    resource.error = null

    try {
      const requestParams = {
        doctype,
        fields: JSON.stringify(fields),
        filters: JSON.stringify(_filters),
        order_by: _orderBy,
        limit: _pageLength,
        limit_start: _start,
      }
      if (_orFilters) requestParams.or_filters = JSON.stringify(_orFilters)
      const result = await getAdapter().request('POST', 'frappe.client.get_list', requestParams)
      let raw = result?.message ?? result
      if (!Array.isArray(raw)) raw = []
      resource.hasNextPage = raw.length >= _pageLength
      let value = transform ? transform(raw) : raw
      if (append) {
        resource.data = [...resource.data, ...value]
      } else {
        resource.data = value
        if (cacheKey) _cache.set(cacheKey, value)
      }
      onSuccess?.(resource.data)
    } catch (err) {
      resource.error = err
      onError?.(err)
    } finally {
      resource.loading = false
    }
  }

  function reload() {
    _start = 0
    if (cacheKey) _cache.delete(cacheKey)
    return fetch()
  }

  async function next() {
    if (!resource.hasNextPage || resource.loading) return
    _start += _pageLength
    return fetch(true)
  }

  // ─── Sub-resource factory ────────────────────────────────────────────────────
  // Each CRUD operation is a mini-resource with its own loading/error/params,
  // matching the frappe-ui createListResource sub-resource API surface.

  function makeSubResource(handler) {
    const sub = reactive({
      loading: false,
      error: null,
      params: {},
      async submit(params, callbacks = {}) {
        sub.loading = true
        sub.error = null
        sub.params = params ?? {}
        try {
          const result = await handler(params)
          callbacks.onSuccess?.(result)
          return result
        } catch (err) {
          sub.error = err
          callbacks.onError?.(err)
          throw err
        } finally {
          sub.loading = false
        }
      },
    })
    return sub
  }

  resource.insert = makeSubResource(async (doc) => {
    const result = await getAdapter().request('POST', 'frappe.client.insert', {
      doc: { doctype, ...(doc || {}) },
    })
    const newDoc = result?.message ?? result
    // Refresh the list so ordering/filters are respected
    if (cacheKey) _cache.delete(cacheKey)
    await fetch()
    return newDoc
  })

  resource.delete = makeSubResource(async (name) => {
    await getAdapter().request('POST', 'frappe.client.delete', { doctype, name })
    resource.data = resource.data.filter((d) => d.name !== name)
    if (cacheKey) _cache.delete(cacheKey)
  })

  resource.setValue = makeSubResource(async ({ name, fieldname, value }) => {
    const result = await getAdapter().request('POST', 'frappe.client.set_value', {
      doctype,
      name,
      fieldname,
      value,
    })
    const updated = result?.message ?? result
    const idx = resource.data.findIndex((d) => d.name === name)
    if (idx !== -1) resource.data[idx] = { ...resource.data[idx], ...updated }
    return updated
  })

  // update(newOptions) — mutates query state in place, matching frappe-ui's
  // createListResource.update(). Callers call .reload() separately to re-fetch.
  resource.update = function(newOptions = {}) {
    if (newOptions.filters !== undefined) _filters = newOptions.filters
    if (newOptions.orFilters !== undefined) _orFilters = newOptions.orFilters
    if (newOptions.orderBy !== undefined) _orderBy = newOptions.orderBy
    if (newOptions.pageLength !== undefined) _pageLength = newOptions.pageLength
    _start = 0
    if (cacheKey) _cache.delete(cacheKey)
  }

  resource.fetch = fetch
  resource.reload = reload
  resource.next = next

  if (auto) fetch()

  return resource
}
