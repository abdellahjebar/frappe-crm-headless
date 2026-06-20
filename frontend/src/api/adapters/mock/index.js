import {
  getData,
  getDoc,
  insertDoc,
  setValue,
  deleteDoc,
  getUsers,
  getViews,
  insertView,
  updateView,
  deleteView,
  getNotifications,
  markNotificationRead,
  searchRecords,
  getOrgList,
  getDealContacts,
  getContactDeals,
} from './store.js'

import { getActivities } from './seed/activities.js'
import {
  LEAD_STATUSES,
  DEAL_STATUSES,
  COMMUNICATION_STATUSES,
  LEAD_FIELDS,
  DEAL_FIELDS,
  CONTACT_FIELDS,
  LEAD_QUICK_FILTERS,
  DEAL_QUICK_FILTERS,
  CONTACT_QUICK_FILTERS,
  LEAD_LAYOUT,
  LEAD_SIDEPANEL,
  DEAL_LAYOUT,
  DEAL_SIDEPANEL,
} from './seed/meta.js'

// ─── Auth ─────────────────────────────────────────────────────────────────────

const AUTH_KEY = '__crm_mock_user__'

function mockLogin(email) {
  localStorage.setItem(AUTH_KEY, email)
  document.cookie = `user_id=${email}; path=/`
}

function mockLogout() {
  localStorage.removeItem(AUTH_KEY)
  document.cookie = 'user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

function mockGetUser() {
  return localStorage.getItem(AUTH_KEY) || null
}

// ─── Doctype → collection key helper ─────────────────────────────────────────

function doctypeToKey(doctype) {
  const map = {
    'CRM Lead': 'leads',
    'CRM Deal': 'deals',
    'Contact': 'contacts',
    'CRM Organization': 'organizations',
    'FCRM Note': 'notes',
  }
  return map[doctype] || doctype.toLowerCase().replace(/\s+/g, '_')
}

// ─── Field definitions by doctype ────────────────────────────────────────────

function fieldsFor(doctype) {
  if (doctype === 'CRM Lead') return LEAD_FIELDS
  if (doctype === 'CRM Deal') return DEAL_FIELDS
  if (doctype === 'Contact') return CONTACT_FIELDS
  return []
}

function quickFiltersFor(doctype) {
  if (doctype === 'CRM Lead') return LEAD_QUICK_FILTERS
  if (doctype === 'CRM Deal') return DEAL_QUICK_FILTERS
  if (doctype === 'Contact') return CONTACT_QUICK_FILTERS
  return []
}

// ─── Core request handler ─────────────────────────────────────────────────────

async function request(_method, endpoint, data, params) {
  const d = data || {}
  const p = params || {}

  await tick() // simulate async

  switch (endpoint) {

    // ── Session / Auth ──────────────────────────────────────────────────────
    case 'frappe.auth.get_logged_user':
    case 'crm.api.session.get_current_user': {
      const user = mockGetUser()
      if (!user) throw Object.assign(new Error('Not authenticated'), { status: 401 })
      return { message: user }
    }

    case 'crm.api.session.get_users':
      return { message: getUsers() }

    // ── List data ───────────────────────────────────────────────────────────
    case 'crm.api.doc.get_data': {
      const result = getData(d.doctype, d)
      return { message: result }
    }

    // ── Single doc ──────────────────────────────────────────────────────────
    case 'frappe.client.get': {
      const doctype = d.doctype || p.doctype
      const name = d.name || p.name

      // Pseudo-doctypes backed by meta arrays
      if (doctype === 'CRM Lead Status') {
        return { message: LEAD_STATUSES.find((s) => s.name === name) || null }
      }
      if (doctype === 'CRM Deal Status') {
        return { message: DEAL_STATUSES.find((s) => s.name === name) || null }
      }

      const doc = getDoc(doctype, name)
      if (!doc) throw new Error(`${doctype} "${name}" not found`)
      return { message: doc }
    }

    // ── List resource (used by statuses store) ──────────────────────────────
    case 'frappe.client.get_list': {
      const doctype = d.doctype || p.doctype
      if (doctype === 'CRM Lead Status') return { message: LEAD_STATUSES }
      if (doctype === 'CRM Deal Status') return { message: DEAL_STATUSES }
      if (doctype === 'CRM Communication Status') return { message: COMMUNICATION_STATUSES }
      const result = getData(doctype, d)
      return { message: result.data }
    }

    // ── Insert ──────────────────────────────────────────────────────────────
    case 'frappe.client.insert': {
      const doc = d.doc || d
      const created = insertDoc(doc)
      return { message: created }
    }

    // ── Set value ───────────────────────────────────────────────────────────
    case 'frappe.client.set_value': {
      const doctype = d.doctype
      const name = d.name
      const fieldname = d.fieldname
      const value = d.value
      const updated = setValue(doctype, name, fieldname, value)
      return { message: updated }
    }

    // ── Delete ──────────────────────────────────────────────────────────────
    case 'frappe.client.delete': {
      deleteDoc(d.doctype, d.name)
      return { message: true }
    }

    // ── Fields metadata ─────────────────────────────────────────────────────
    case 'crm.api.doc.get_fields':
    case 'crm.api.doc.get_filterable_fields':
    case 'crm.api.doc.sort_options':
    case 'crm.api.doc.get_group_by_fields': {
      return { message: fieldsFor(d.doctype || p.doctype) }
    }

    case 'crm.api.doc.get_quick_filters': {
      return { message: quickFiltersFor(d.doctype || p.doctype) }
    }

    case 'crm.api.doc.set_quick_filters': {
      // persisted in memory only — no-op for the store
      return { message: true }
    }

    // ── Form layout ─────────────────────────────────────────────────────────
    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.get_fields_layout': {
      const dt = d.doctype || p.doctype
      if (dt === 'CRM Lead') return { message: LEAD_LAYOUT }
      if (dt === 'CRM Deal') return { message: DEAL_LAYOUT }
      return { message: { tabs: [] } }
    }

    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.get_sidepanel_sections': {
      const dt = d.doctype || p.doctype
      if (dt === 'CRM Lead') return { message: LEAD_SIDEPANEL }
      if (dt === 'CRM Deal') return { message: DEAL_SIDEPANEL }
      return { message: { tabs: [] } }
    }

    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.save_fields_layout':
    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.reset_fields_layout': {
      return { message: true }
    }

    // ── Views ───────────────────────────────────────────────────────────────
    case 'crm.api.views.get_views': {
      return { message: getViews(d.doctype || p.doctype) }
    }

    case 'crm.api.views.create_view':
    case 'frappe.client.insert_view': {
      const view = insertView(d.doc || d)
      return { message: view }
    }

    case 'crm.api.views.update_view': {
      const view = updateView(d.name, d.doc || d)
      return { message: view }
    }

    case 'crm.api.views.delete_view': {
      deleteView(d.name)
      return { message: true }
    }

    // ── Activities ──────────────────────────────────────────────────────────
    case 'crm.api.activities.get_activities': {
      const dt = doctypeToKey(d.doctype || p.doctype)
      const result = getActivities(dt, d.name || p.name)
      return { message: result }
    }

    // ── Notes ───────────────────────────────────────────────────────────────
    case 'crm.api.doc.add_note':
    case 'frappe.client.insert_note': {
      return { message: { name: `NOTE-${Date.now()}`, content: d.content, creation: new Date().toISOString() } }
    }

    // ── Notifications ───────────────────────────────────────────────────────
    case 'crm.api.notifications.get_notifications': {
      return { message: getNotifications() }
    }

    case 'crm.api.notifications.mark_as_read': {
      markNotificationRead(d.name || p.name)
      return { message: true }
    }

    case 'crm.api.notifications.mark_all_as_read': {
      getNotifications().forEach((n) => { n.read = 1 })
      return { message: true }
    }

    // ── Leads-specific ──────────────────────────────────────────────────────
    case 'crm.fcrm.doctype.crm_lead.crm_lead.convert_to_deal':
    case 'crm.api.doc.convert_lead_to_deal': {
      return { message: { name: `DEAL-${Date.now()}` } }
    }

    case 'crm.api.doc.get_assigned_users':
    case 'crm.api.lead.get_assigned_users':
    case 'crm.api.deal.get_assigned_users': {
      return { message: [] }
    }

    case 'crm.api.doc.assign_user':
    case 'crm.api.doc.remove_assignment':
    case 'frappe.desk.form.assign_to.add':
    case 'frappe.desk.form.assign_to.remove_all': {
      return { message: true }
    }

    // ── Search (link fields) ────────────────────────────────────────────────
    case 'frappe.desk.search.search_link':
    case 'crm.api.search.search': {
      const doctype = d.doctype || d.txt?.split(':')[0] || 'CRM Lead'
      const query = d.txt || d.query || ''
      return { message: searchRecords(doctype, query) }
    }

    // ── Organizations list (dropdown) ───────────────────────────────────────
    case 'crm.api.doc.get_organizations':
    case 'crm.api.organization.list': {
      return { message: getOrgList() }
    }

    // ── Deal contacts ───────────────────────────────────────────────────────
    case 'crm.api.deal.get_contacts':
    case 'crm.fcrm.doctype.crm_deal.crm_deal.get_contacts': {
      return { message: getDealContacts(d.name || p.name) }
    }

    // ── Contact deals ───────────────────────────────────────────────────────
    case 'crm.api.contact.get_deals': {
      return { message: getContactDeals(d.name || p.name) }
    }

    // ── Dashboard ───────────────────────────────────────────────────────────
    case 'crm.api.dashboard.get_dashboard_data':
    case 'crm.api.dashboard.get_chart_data': {
      return {
        message: {
          labels: ['Open', 'Contacted', 'Nurturing', 'Qualified'],
          datasets: [{ values: [8, 6, 5, 4] }],
        },
      }
    }

    // ── File upload (no-op in mock) ─────────────────────────────────────────
    case 'upload_file':
    case 'frappe.handler.upload_file': {
      return {
        message: {
          name: `FILE-${Date.now()}`,
          file_url: '/files/mock-upload.jpg',
          file_name: 'mock-upload.jpg',
          is_private: 0,
        },
      }
    }

    // ── WhatsApp / telephony feature flags ──────────────────────────────────
    case 'crm.api.whatsapp.is_whatsapp_enabled':
    case 'crm.integrations.utils.get_integration_status': {
      return { message: false }
    }

    case 'crm.api.telephony.is_telephony_enabled': {
      return { message: false }
    }

    // ── Settings / misc ─────────────────────────────────────────────────────
    case 'crm.api.settings.get_system_settings':
    case 'frappe.client.get_value': {
      return { message: {} }
    }

    case 'crm.api.doc.get_linked_docs': {
      return { message: [] }
    }

    case 'crm.api.doc.toggle_like': {
      return { message: true }
    }

    default:
      // Non-fatal — return empty so the UI doesn't crash on optional calls
      console.warn(`[mock] Unhandled endpoint: "${endpoint}"`)
      return { message: null }
  }
}

// Minimal async tick so callers don't need to handle sync vs async differently
function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// ─── Exported adapter ─────────────────────────────────────────────────────────

export const MockAdapter = {
  request,
  auth: {
    async login(email, _password) {
      mockLogin(email || 'sarah.chen@nexacrm.io')
    },
    async logout() {
      mockLogout()
    },
    getUser() {
      return mockGetUser()
    },
  },
}
