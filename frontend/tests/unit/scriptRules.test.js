import { describe, it, expect, vi } from 'vitest'
import { evaluateRules } from '@/utils/ruleEval'

// ─── evaluateRules ────────────────────────────────────────────────────────────

describe('evaluateRules', () => {
  it('returns {} when rules is null', () => {
    expect(evaluateRules(null, {})).toEqual({})
  })

  it('returns {} when rules is undefined', () => {
    expect(evaluateRules(undefined, {})).toEqual({})
  })

  it('evaluates a function predicate — returns true when condition matches', () => {
    const rules = { lost_reason: { hidden: (doc) => doc.status !== 'Lost' } }
    const doc = { status: 'New' }
    expect(evaluateRules(rules, doc)).toEqual({ lost_reason: { hidden: true } })
  })

  it('evaluates a function predicate — returns false when condition does not match', () => {
    const rules = { lost_reason: { hidden: (doc) => doc.status !== 'Lost' } }
    const doc = { status: 'Lost' }
    expect(evaluateRules(rules, doc)).toEqual({ lost_reason: { hidden: false } })
  })

  it('handles multiple fields independently', () => {
    const rules = {
      lost_reason: { hidden: (doc) => doc.status !== 'Lost' },
      revenue: { read_only: (doc) => doc.stage === 'Closed' },
    }
    const doc = { status: 'Lost', stage: 'Closed' }
    expect(evaluateRules(rules, doc)).toEqual({
      lost_reason: { hidden: false },
      revenue: { read_only: true },
    })
  })

  it('handles multiple properties per field rule', () => {
    const rules = {
      email: {
        reqd: (doc) => doc.source === 'Email',
        read_only: (doc) => !!doc.email_verified,
      },
    }
    const doc = { source: 'Email', email_verified: true }
    expect(evaluateRules(rules, doc)).toEqual({
      email: { reqd: true, read_only: true },
    })
  })

  it('supports static (non-function) values in rule definitions', () => {
    const rules = { internal_notes: { hidden: true } }
    const doc = {}
    expect(evaluateRules(rules, doc)).toEqual({ internal_notes: { hidden: true } })
  })

  it('skips a field entry that is not an object', () => {
    const rules = { bad_field: 'not-an-object' }
    const doc = {}
    expect(evaluateRules(rules, doc)).toEqual({})
  })

  it('omits a field from result when all its properties are undefined', () => {
    const rules = { x: { hidden: () => undefined } }
    const doc = {}
    expect(evaluateRules(rules, doc)).toEqual({})
  })

  it('catches a throwing predicate — omits that property, keeps others', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const rules = {
      x: {
        hidden: () => { throw new Error('boom') },
        read_only: () => true,
      },
    }
    const doc = {}
    expect(evaluateRules(rules, doc)).toEqual({ x: { read_only: true } })
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('does not mutate the rules object — function reference is preserved', () => {
    const fn = (doc) => !doc.active
    const rules = { f: { hidden: fn } }
    evaluateRules(rules, { active: false })
    expect(rules.f.hidden).toBe(fn)
    expect(Object.keys(rules.f)).toEqual(['hidden'])
  })

  it('does not mutate the doc object', () => {
    const doc = { status: 'New', amount: 100 }
    const frozen = { ...doc }
    evaluateRules({ f: { hidden: (d) => d.status !== 'Lost' } }, doc)
    expect(doc).toEqual(frozen)
  })

  it('returns {} when rules is an empty object', () => {
    expect(evaluateRules({}, { status: 'New' })).toEqual({})
  })
})
