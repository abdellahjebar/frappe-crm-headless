import { describe, it, expect, vi } from 'vitest'
import { FieldProxy, SectionProxy, MultiProxy } from '@/utils/FieldProxy'

function makeController() {
  return {
    setFieldProperty: vi.fn(),
    removeFieldProperty: vi.fn(),
  }
}

// ─── FieldProxy ──────────────────────────────────────────────────────────────

describe('FieldProxy', () => {
  it('hide() sets hidden:true', () => {
    const c = makeController()
    new FieldProxy(c, 'status').hide()
    expect(c.setFieldProperty).toHaveBeenCalledWith('status', 'hidden', true, undefined)
  })

  it('show() sets hidden:false', () => {
    const c = makeController()
    new FieldProxy(c, 'status').show()
    expect(c.setFieldProperty).toHaveBeenCalledWith('status', 'hidden', false, undefined)
  })

  it('makeRequired() sets reqd:true', () => {
    const c = makeController()
    new FieldProxy(c, 'email').makeRequired()
    expect(c.setFieldProperty).toHaveBeenCalledWith('email', 'reqd', true, undefined)
  })

  it('makeOptional() sets reqd:false', () => {
    const c = makeController()
    new FieldProxy(c, 'email').makeOptional()
    expect(c.setFieldProperty).toHaveBeenCalledWith('email', 'reqd', false, undefined)
  })

  it('makeReadOnly() sets read_only:true', () => {
    const c = makeController()
    new FieldProxy(c, 'annual_revenue').makeReadOnly()
    expect(c.setFieldProperty).toHaveBeenCalledWith('annual_revenue', 'read_only', true, undefined)
  })

  it('makeWritable() sets read_only:false', () => {
    const c = makeController()
    new FieldProxy(c, 'annual_revenue').makeWritable()
    expect(c.setFieldProperty).toHaveBeenCalledWith('annual_revenue', 'read_only', false, undefined)
  })

  it('setLabel() sets label', () => {
    const c = makeController()
    new FieldProxy(c, 'email').setLabel('Work Email')
    expect(c.setFieldProperty).toHaveBeenCalledWith('email', 'label', 'Work Email', undefined)
  })

  it('setOptions() sets options', () => {
    const c = makeController()
    new FieldProxy(c, 'status').setOptions('New\nOpen\nClosed')
    expect(c.setFieldProperty).toHaveBeenCalledWith('status', 'options', 'New\nOpen\nClosed', undefined)
  })

  it('setDescription() sets description', () => {
    const c = makeController()
    new FieldProxy(c, 'email').setDescription('Primary email address')
    expect(c.setFieldProperty).toHaveBeenCalledWith('email', 'description', 'Primary email address', undefined)
  })

  it('setPlaceholder() sets placeholder', () => {
    const c = makeController()
    new FieldProxy(c, 'email').setPlaceholder('name@company.com')
    expect(c.setFieldProperty).toHaveBeenCalledWith('email', 'placeholder', 'name@company.com', undefined)
  })

  it('set() passes arbitrary property and value', () => {
    const c = makeController()
    new FieldProxy(c, 'amount').set('precision', '2')
    expect(c.setFieldProperty).toHaveBeenCalledWith('amount', 'precision', '2', undefined)
  })

  it('unset() calls removeFieldProperty', () => {
    const c = makeController()
    new FieldProxy(c, 'email').unset('hidden')
    expect(c.removeFieldProperty).toHaveBeenCalledWith('email', 'hidden', undefined)
  })

  it('methods are chainable — return the same FieldProxy instance', () => {
    const c = makeController()
    const proxy = new FieldProxy(c, 'email')
    expect(proxy.hide()).toBe(proxy)
    expect(proxy.show()).toBe(proxy)
    expect(proxy.makeRequired()).toBe(proxy)
    expect(proxy.makeOptional()).toBe(proxy)
    expect(proxy.makeReadOnly()).toBe(proxy)
    expect(proxy.makeWritable()).toBe(proxy)
    expect(proxy.setLabel('x')).toBe(proxy)
    expect(proxy.setOptions('a')).toBe(proxy)
    expect(proxy.setDescription('d')).toBe(proxy)
    expect(proxy.setPlaceholder('p')).toBe(proxy)
    expect(proxy.set('reqd', true)).toBe(proxy)
  })

  it('passes rowName through to setFieldProperty for per-row overrides', () => {
    const c = makeController()
    new FieldProxy(c, 'products.rate', 'row_abc').makeReadOnly()
    expect(c.setFieldProperty).toHaveBeenCalledWith('products.rate', 'read_only', true, 'row_abc')
  })

  it('dot-notation target works for child table column overrides', () => {
    const c = makeController()
    new FieldProxy(c, 'products.discount').hide()
    expect(c.setFieldProperty).toHaveBeenCalledWith('products.discount', 'hidden', true, undefined)
  })

  it('unset with rowName passes rowName to removeFieldProperty', () => {
    const c = makeController()
    new FieldProxy(c, 'products.rate', 'row_xyz').unset('read_only')
    expect(c.removeFieldProperty).toHaveBeenCalledWith('products.rate', 'read_only', 'row_xyz')
  })
})

// ─── SectionProxy ────────────────────────────────────────────────────────────

describe('SectionProxy', () => {
  it('hide() sets hidden:true on the section', () => {
    const c = makeController()
    new SectionProxy(c, 'financial_section').hide()
    expect(c.setFieldProperty).toHaveBeenCalledWith('financial_section', 'hidden', true)
  })

  it('show() sets hidden:false on the section', () => {
    const c = makeController()
    new SectionProxy(c, 'financial_section').show()
    expect(c.setFieldProperty).toHaveBeenCalledWith('financial_section', 'hidden', false)
  })

  it('setLabel() updates the section label', () => {
    const c = makeController()
    new SectionProxy(c, 'basic_section').setLabel('Overview')
    expect(c.setFieldProperty).toHaveBeenCalledWith('basic_section', 'label', 'Overview')
  })

  it('collapse() sets collapsible:true and opened:false', () => {
    const c = makeController()
    new SectionProxy(c, 'advanced_section').collapse()
    expect(c.setFieldProperty).toHaveBeenCalledWith('advanced_section', 'collapsible', true)
    expect(c.setFieldProperty).toHaveBeenCalledWith('advanced_section', 'opened', false)
    expect(c.setFieldProperty).toHaveBeenCalledTimes(2)
  })

  it('expand() sets opened:true', () => {
    const c = makeController()
    new SectionProxy(c, 'advanced_section').expand()
    expect(c.setFieldProperty).toHaveBeenCalledWith('advanced_section', 'opened', true)
  })

  it('methods are chainable', () => {
    const c = makeController()
    const proxy = new SectionProxy(c, 's1')
    expect(proxy.hide()).toBe(proxy)
    expect(proxy.show()).toBe(proxy)
    expect(proxy.setLabel('x')).toBe(proxy)
    expect(proxy.collapse()).toBe(proxy)
    expect(proxy.expand()).toBe(proxy)
  })
})

// ─── MultiProxy ──────────────────────────────────────────────────────────────

describe('MultiProxy', () => {
  it('makeRequired() fans out to all targets', () => {
    const c = makeController()
    new MultiProxy(c, ['email', 'phone', 'mobile']).makeRequired()
    expect(c.setFieldProperty).toHaveBeenCalledTimes(3)
    expect(c.setFieldProperty).toHaveBeenCalledWith('email', 'reqd', true, undefined)
    expect(c.setFieldProperty).toHaveBeenCalledWith('phone', 'reqd', true, undefined)
    expect(c.setFieldProperty).toHaveBeenCalledWith('mobile', 'reqd', true, undefined)
  })

  it('hide() fans out to all targets', () => {
    const c = makeController()
    new MultiProxy(c, ['first_name', 'last_name']).hide()
    expect(c.setFieldProperty).toHaveBeenCalledWith('first_name', 'hidden', true, undefined)
    expect(c.setFieldProperty).toHaveBeenCalledWith('last_name', 'hidden', true, undefined)
  })

  it('set(property, value) fans out with correct args', () => {
    const c = makeController()
    new MultiProxy(c, ['email', 'phone']).set('placeholder', 'Enter value')
    expect(c.setFieldProperty).toHaveBeenCalledWith('email', 'placeholder', 'Enter value', undefined)
    expect(c.setFieldProperty).toHaveBeenCalledWith('phone', 'placeholder', 'Enter value', undefined)
  })

  it('unset() fans out to removeFieldProperty for all targets', () => {
    const c = makeController()
    new MultiProxy(c, ['email', 'phone']).unset('hidden')
    expect(c.removeFieldProperty).toHaveBeenCalledWith('email', 'hidden', undefined)
    expect(c.removeFieldProperty).toHaveBeenCalledWith('phone', 'hidden', undefined)
  })

  it('single-element array still works', () => {
    const c = makeController()
    new MultiProxy(c, ['status']).hide()
    expect(c.setFieldProperty).toHaveBeenCalledTimes(1)
    expect(c.setFieldProperty).toHaveBeenCalledWith('status', 'hidden', true, undefined)
  })
})
