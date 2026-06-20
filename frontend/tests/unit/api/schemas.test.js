import { describe, it, expect } from 'vitest'
import { validate } from '@/api/schemas'

describe('validate — response shape checking', () => {

  describe('login', () => {
    it('passes valid auth response', () => {
      const data = { token: 'abc123', user: 'user@test.com' }
      expect(validate('login', data)).toEqual(data)
    })

    it('throws when token is missing', () => {
      expect(() => validate('login', { user: 'user@test.com' }))
        .toThrow('token')
    })

    it('throws when user is missing', () => {
      expect(() => validate('login', { token: 'abc123' }))
        .toThrow('user')
    })
  })

  describe('crm.api.session.get_users', () => {
    it('passes valid users array', () => {
      const data = [{ name: 'user@test.com', full_name: 'Test User' }]
      expect(validate('crm.api.session.get_users', data)).toEqual(data)
    })

    it('passes users with missing optional fields', () => {
      const data = [{ name: 'user@test.com' }]
      expect(() => validate('crm.api.session.get_users', data)).not.toThrow()
    })

    it('throws when name is missing from a user', () => {
      expect(() => validate('crm.api.session.get_users', [{ full_name: 'No Name' }]))
        .toThrow()
    })

    it('throws when response is not an array', () => {
      expect(() => validate('crm.api.session.get_users', { users: [] }))
        .toThrow()
    })
  })

  describe('crm.api.doc.get_data', () => {
    it('passes valid list data', () => {
      const data = { data: [{ name: 'LEAD-001', first_name: 'John' }], total_count: 1 }
      expect(validate('crm.api.doc.get_data', data)).toEqual(data)
    })

    it('passes with empty data array', () => {
      expect(() => validate('crm.api.doc.get_data', { data: [] })).not.toThrow()
    })

    it('throws when data field is missing', () => {
      expect(() => validate('crm.api.doc.get_data', [{ name: 'LEAD-001' }]))
        .toThrow()
    })

    it('throws when data is not an array', () => {
      expect(() => validate('crm.api.doc.get_data', { data: 'not-an-array' }))
        .toThrow()
    })
  })

  describe('frappe.client.get', () => {
    it('passes any record with a name', () => {
      const data = { name: 'LEAD-001', first_name: 'John', custom_field: 'anything' }
      expect(validate('frappe.client.get', data)).toEqual(data)
    })

    it('throws when name is missing', () => {
      expect(() => validate('frappe.client.get', { first_name: 'John' }))
        .toThrow()
    })
  })

  describe('crm.api.doc.get_quick_filters', () => {
    it('passes array of strings', () => {
      const data = ['status', 'lead_owner', 'source']
      expect(validate('crm.api.doc.get_quick_filters', data)).toEqual(data)
    })

    it('throws when not an array of strings', () => {
      expect(() => validate('crm.api.doc.get_quick_filters', [{ field: 'status' }]))
        .toThrow()
    })
  })

  describe('unknown endpoints', () => {
    it('passes through without validation', () => {
      const data = { anything: 'goes', here: 42 }
      expect(validate('some.unknown.endpoint', data)).toEqual(data)
    })

    it('passes through null without throwing', () => {
      expect(() => validate('unknown', null)).not.toThrow()
    })
  })

  describe('error messages', () => {
    it('includes the field path in the error', () => {
      try {
        validate('login', { token: 123 })
      } catch (e) {
        expect(e.message).toContain('token')
      }
    })

    it('includes the endpoint name in the error', () => {
      try {
        validate('login', {})
      } catch (e) {
        expect(e.message).toContain('login')
      }
    })
  })
})
