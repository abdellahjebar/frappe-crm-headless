import { reactive } from 'vue'
import { getAdapter } from '@/api'

// In-memory cache shared across all useQuery instances.
// Keyed by the cache option (string or joined array).
const _cache = new Map()

/**
 * Reactive data-fetching primitive. Drop-in replacement for frappe-ui's
 * createResource — same option shape, same reactive return object.
 *
 * Routes through the active adapter instead of frappe-ui internals,
 * making it backend-agnostic.
 *
 * @param {object} options
 * @param {string}   options.url          - Endpoint key (from endpoints.js)
 * @param {object}   [options.params]     - Initial request params
 * @param {boolean}  [options.auto]       - Fetch immediately on creation
 * @param {string|string[]} [options.cache] - Cache key; omit to skip caching
 * @param {*}        [options.initialData] - Value of .data before first fetch
 * @param {Function} [options.transform]  - Transform raw response before storing
 * @param {Function} [options.onSuccess]  - Called with transformed data on success
 * @param {Function} [options.onError]    - Called with error on failure
 *
 * @returns {{ data, loading, error, params, fetch, reload, submit }}
 */
export function useQuery(options = {}) {
  const {
    url,
    params: initialParams = {},
    auto = false,
    cache: cacheOption,
    initialData = null,
    transform,
    onSuccess,
    onError,
  } = options

  const cacheKey = cacheOption
    ? Array.isArray(cacheOption) ? cacheOption.join(':') : String(cacheOption)
    : null

  const resource = reactive({
    data: initialData,
    loading: false,
    error: null,
    params: { ...(initialParams || {}) },
  })

  // .promise mirrors frappe-ui createResource: the active fetch Promise, or an
  // already-resolved Promise when idle. Callers do `await resource.promise.catch(…)`.
  let _promise = Promise.resolve()
  Object.defineProperty(resource, 'promise', { get: () => _promise, configurable: true })

  // fetch(overrideParams, callbackOverrides?) — callbackOverrides lets callers
  // pass per-call onSuccess/onError that override the resource-level ones.
  async function fetch(overrideParams, callbackOverrides = {}) {
    // Serve from cache unless the caller explicitly passes new params
    if (cacheKey && _cache.has(cacheKey) && overrideParams === undefined) {
      resource.data = _cache.get(cacheKey)
      return resource.data
    }

    const _onSuccess = callbackOverrides.onSuccess ?? onSuccess
    const _onError = callbackOverrides.onError ?? onError

    resource.loading = true
    resource.error = null

    _promise = (async () => {
      try {
        const p = overrideParams !== undefined ? overrideParams : resource.params
        const result = await getAdapter().request('POST', url, p, p)
        // Use result.message when the key exists (even if the value is null),
        // falling back to result only when the message key is absent entirely.
        let value = Object.prototype.hasOwnProperty.call(result ?? {}, 'message')
          ? result.message
          : result
        if (transform) {
          const transformed = transform(value)
          // forEach-based transforms mutate in place and return undefined;
          // in that case keep the (mutated) original value.
          if (transformed !== undefined) value = transformed
        }
        resource.data = value
        if (cacheKey) _cache.set(cacheKey, value)
        _onSuccess?.(value)
        return value
      } catch (err) {
        resource.error = err
        _onError?.(err)
        throw err
      } finally {
        resource.loading = false
      }
    })()

    return _promise
  }

  function reload() {
    if (cacheKey) _cache.delete(cacheKey)
    return fetch()
  }

  // submit(params, callbacks?) — matches frappe-ui createResource.submit().
  // callbacks = { validate, onSuccess, onError } are per-call overrides.
  // validate() runs first; if it returns a truthy error string, fetch is aborted.
  function submit(params, callbacks = {}) {
    if (typeof callbacks.validate === 'function') {
      const err = callbacks.validate()
      if (err) {
        resource.error = err
        return
      }
    }
    return fetch(params, callbacks)
  }

  // update(newOptions) — mutates params in place, matching frappe-ui's
  // createResource.update(). Callers call .reload() separately to re-fetch.
  function update(newOptions = {}) {
    if (newOptions.params !== undefined) {
      Object.assign(resource.params, newOptions.params)
    }
    if (cacheKey) _cache.delete(cacheKey)
  }

  resource.fetch = fetch
  resource.reload = reload
  resource.submit = submit
  resource.update = update

  if (auto) fetch()

  return resource
}
