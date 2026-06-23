// Chainable ergonomic wrappers over setFieldProperty / removeFieldProperty.
// Each class receives the form controller instance and delegates to its public
// prototype methods — no imports from script.js, document.js, or Vue.

export class FieldProxy {
  constructor(controller, target, rowName) {
    this._c = controller
    this._t = target
    this._r = rowName
  }

  _set(property, value) {
    this._c.setFieldProperty(this._t, property, value, this._r)
    return this
  }

  _unset(property) {
    this._c.removeFieldProperty(this._t, property, this._r)
    return this
  }

  hide()               { return this._set('hidden', true) }
  show()               { return this._set('hidden', false) }
  makeRequired()       { return this._set('reqd', true) }
  makeOptional()       { return this._set('reqd', false) }
  makeReadOnly()       { return this._set('read_only', true) }
  makeWritable()       { return this._set('read_only', false) }
  setLabel(label)      { return this._set('label', label) }
  setOptions(options)  { return this._set('options', options) }
  setDescription(text) { return this._set('description', text) }
  setPlaceholder(text) { return this._set('placeholder', text) }
  set(property, value) { return this._set(property, value) }
  unset(property)      { return this._unset(property) }
}

export class SectionProxy {
  constructor(controller, name) {
    this._c = controller
    this._n = name
  }

  _set(property, value) {
    this._c.setFieldProperty(this._n, property, value)
    return this
  }

  hide()         { return this._set('hidden', true) }
  show()         { return this._set('hidden', false) }
  setLabel(text) { return this._set('label', text) }
  collapse() {
    this._set('collapsible', true)
    return this._set('opened', false)
  }
  expand() { return this._set('opened', true) }
}

export class MultiProxy {
  constructor(controller, targets) {
    this._proxies = targets.map((t) => new FieldProxy(controller, t))
  }

  _each(method, ...args) {
    this._proxies.forEach((p) => p[method](...args))
    return this
  }

  hide()               { return this._each('hide') }
  show()               { return this._each('show') }
  makeRequired()       { return this._each('makeRequired') }
  makeOptional()       { return this._each('makeOptional') }
  makeReadOnly()       { return this._each('makeReadOnly') }
  makeWritable()       { return this._each('makeWritable') }
  setLabel(label)      { return this._each('setLabel', label) }
  setOptions(options)  { return this._each('setOptions', options) }
  setDescription(text) { return this._each('setDescription', text) }
  setPlaceholder(text) { return this._each('setPlaceholder', text) }
  set(property, value) { return this._each('set', property, value) }
  unset(property)      { return this._each('unset', property) }
}
