import {
  getData,
  getDoc,
  getCollection,
  insertDoc,
  saveDoc,
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
  getNotes,
  insertNote,
  updateNote,
  deleteNote,
  getTasks,
  insertTask,
  updateTask,
  deleteTask,
  getEvents,
  insertEvent,
  updateEvent,
  deleteEvent,
} from './store.js'

import { getActivities } from './seed/activities.js'
import {
  LEAD_STATUSES,
  DEAL_STATUSES,
  COMMUNICATION_STATUSES,
  LEAD_FIELDS,
  DEAL_FIELDS,
  CONTACT_FIELDS,
  NOTE_FIELDS,
  TASK_FIELDS,
  CALL_LOG_FIELDS,
  LEAD_QUICK_FILTERS,
  DEAL_QUICK_FILTERS,
  CONTACT_QUICK_FILTERS,
  LEAD_LAYOUT,
  LEAD_SIDEPANEL,
  DEAL_LAYOUT,
  DEAL_SIDEPANEL,
  NOTE_LAYOUT,
  CONTACT_SIDEPANEL,
  ORG_SIDEPANEL,
  CALL_LOG_LAYOUT,
  LEAD_QUICK_ENTRY,
  DEAL_QUICK_ENTRY,
  CONTACT_QUICK_ENTRY,
  TASK_QUICK_ENTRY,
  CALL_LOG_QUICK_ENTRY,
  ORG_QUICK_ENTRY,
} from './seed/meta.js'

// ─── Mock boot ───────────────────────────────────────────────────────────────
// Frappe normally sets window.frappe.boot at page load. frappe-ui's formatDate
// and other helpers read date_format from it — without this, every date field
// in the list throws "Cannot read properties of undefined (reading 'date_format')".
;(function seedFrappeBoot() {
  if (typeof window === 'undefined') return
  window.frappe = window.frappe || {}
  window.frappe.boot = window.frappe.boot || {}
  window.frappe.boot.sysdefaults = window.frappe.boot.sysdefaults || {
    date_format: 'yyyy-mm-dd',
    time_format: 'HH:mm:ss',
    number_format: '#,###.##',
    currency: 'USD',
    currency_fraction: 'Cent',
    currency_fraction_units: 100,
    float_precision: 2,
    language: 'en',
  }
  window.frappe.boot.lang = window.frappe.boot.lang || 'en'
  window.frappe.boot.time_zone = window.frappe.boot.time_zone || {
    system: 'UTC',
    user: 'UTC',
  }
  window.frappe.datetime_format = 'yyyy-mm-dd HH:mm:ss'

  // frappe-ui's createDocumentResource caches docs in frappe.model.locals.
  // Without this stub the app throws "Cannot read properties of undefined
  // (reading 'localsInner')" whenever a document is fetched.
  window.frappe.model = window.frappe.model || {
    locals: {},
    docinfo: {},
    get_doc: function (dt, name) { return (this.locals[dt] || {})[name] },
    set_default_values: function () {},
  }
  window.frappe.get_doc = window.frappe.get_doc || function (dt, name) {
    return (window.frappe.model.locals[dt] || {})[name]
  }

  // Onboarding bypass: set localStorage key before any component mounts so
  // useOnboarding() sees isOnboardingStepsCompleted = true immediately.
  const user = import.meta.env.VITE_DEV_USER
  if (user) {
    try {
      localStorage.setItem(`isOnboardingStepsCompletedfrappecrm${user}`, 'true')
    } catch {}
  }
})()

// ─── Auth ─────────────────────────────────────────────────────────────────────

const AUTH_KEY = '__crm_mock_user__'

function mockLogin(email) {
  localStorage.setItem(AUTH_KEY, email)
  document.cookie = `user_id=${email}; path=/; SameSite=Strict`
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
  if (!doctype) return null
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
  if (doctype === 'FCRM Note') return NOTE_FIELDS
  if (doctype === 'CRM Task') return TASK_FIELDS
  if (doctype === 'CRM Call Log') return CALL_LOG_FIELDS
  return []
}

function quickEntryFor(doctype) {
  if (doctype === 'CRM Lead') return LEAD_QUICK_ENTRY
  if (doctype === 'CRM Deal') return DEAL_QUICK_ENTRY
  if (doctype === 'Contact') return CONTACT_QUICK_ENTRY
  if (doctype === 'CRM Task') return TASK_QUICK_ENTRY
  if (doctype === 'CRM Call Log') return CALL_LOG_QUICK_ENTRY
  if (doctype === 'CRM Organization') return ORG_QUICK_ENTRY
  return null
}

function quickFiltersFor(doctype) {
  if (doctype === 'CRM Lead') return LEAD_QUICK_FILTERS
  if (doctype === 'CRM Deal') return DEAL_QUICK_FILTERS
  if (doctype === 'Contact') return CONTACT_QUICK_FILTERS
  return []
}

// Default list columns — key/type format expected by parseRows()
const DEFAULT_COLUMNS = {
  'CRM Lead': [
    { key: 'first_name', label: 'First Name', type: 'Data' },
    { key: 'email', label: 'Email', type: 'Data' },
    { key: 'company_name', label: 'Company', type: 'Data' },
    { key: 'status', label: 'Status', type: 'Select' },
    { key: 'lead_owner', label: 'Lead Owner', type: 'Link' },
    { key: 'modified', label: 'Modified', type: 'Datetime' },
  ],
  'CRM Deal': [
    { key: 'deal_name', label: 'Deal Name', type: 'Data' },
    { key: 'status', label: 'Status', type: 'Select' },
    { key: 'expected_contract_value', label: 'Expected Value', type: 'Currency' },
    { key: 'close_date', label: 'Close Date', type: 'Date' },
    { key: 'deal_owner', label: 'Owner', type: 'Link' },
    { key: 'modified', label: 'Modified', type: 'Datetime' },
  ],
  'Contact': [
    { key: 'first_name', label: 'First Name', type: 'Data' },
    { key: 'email', label: 'Email', type: 'Data' },
    { key: 'company_name', label: 'Company', type: 'Data' },
    { key: 'mobile_no', label: 'Mobile', type: 'Data' },
    { key: 'modified', label: 'Modified', type: 'Datetime' },
  ],
  'CRM Organization': [
    { key: 'organization_name', label: 'Organization', type: 'Data' },
    { key: 'industry', label: 'Industry', type: 'Data' },
    { key: 'territory', label: 'Territory', type: 'Data' },
    { key: 'modified', label: 'Modified', type: 'Datetime' },
  ],
  'CRM Task': [
    { key: 'title', label: 'Title', type: 'Data' },
    { key: 'status', label: 'Status', type: 'Select' },
    { key: 'priority', label: 'Priority', type: 'Select' },
    { key: 'assigned_to', label: 'Assigned To', type: 'Link' },
    { key: 'due_date', label: 'Due Date', type: 'Date' },
    { key: 'modified', label: 'Modified', type: 'Datetime' },
  ],
  'CRM Call Log': [
    { key: 'from', label: 'From', type: 'Data' },
    { key: 'to', label: 'To', type: 'Data' },
    { key: 'status', label: 'Status', type: 'Select' },
    { key: 'duration', label: 'Duration (s)', type: 'Int' },
    { key: 'modified', label: 'Modified', type: 'Datetime' },
  ],
}

function defaultColumns(doctype) {
  return DEFAULT_COLUMNS[doctype] || []
}

function defaultRows(doctype) {
  return (DEFAULT_COLUMNS[doctype] || []).map((c) => c.key)
}

function parseListColumns(raw) {
  if (!raw) return null
  if (Array.isArray(raw)) {
    // Already parsed — normalize fieldname→key, fieldtype→type
    return raw.map((c) => ({
      ...c,
      key: c.key || c.fieldname,
      type: c.type || c.fieldtype,
    }))
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parseListColumns(parsed) : null
    } catch {
      return null
    }
  }
  return null
}

function parseListRows(raw) {
  if (!raw) return null
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return raw.split(',').filter(Boolean) }
  }
  return null
}

// ─── Core request handler ─────────────────────────────────────────────────────

async function request(_method, endpoint, data, params) {
  // createResource passes everything through options.params → our `params` arg.
  // Direct calls (auth, etc.) use `data`. Merge so handlers always find their keys.
  const m = { ...(params || {}), ...(data || {}) }

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

    case 'crm.api.session.get_organizations':
      return { message: getOrgList() }

    case 'crm.api.invite_by_email':
    case 'crm.api.user.invite_by_email':
      return { message: true }

    // ── List data ───────────────────────────────────────────────────────────
    case 'crm.api.doc.get_data': {
      const result = getData(m.doctype, m)
      const columns = parseListColumns(m.columns) || defaultColumns(m.doctype)
      const rawRows = parseListRows(m.rows) || defaultRows(m.doctype)
      // 'name' must always be present so list rows can build router links (leadId / dealId)
      const rows = rawRows.includes('name') ? rawRows : ['name', ...rawRows]
      const view_type = m.view?.view_type || 'list'
      return {
        message: {
          ...result,
          columns,
          rows,
          view_type,
          views: getViews(m.doctype),
        },
      }
    }

    // ── Single doc ──────────────────────────────────────────────────────────
    case 'frappe.client.get': {
      const doctype = m.doctype
      const name = m.name

      // Pseudo-doctypes backed by meta arrays
      if (doctype === 'CRM Lead Status') {
        return { message: LEAD_STATUSES.find((s) => s.name === name) || null }
      }
      if (doctype === 'CRM Deal Status') {
        return { message: DEAL_STATUSES.find((s) => s.name === name) || null }
      }

      // User lookup — serve from the users seed; never throw for a user
      if (doctype === 'User') {
        const user = getUsers().find((u) => u.name === name || u.email === name)
        return { message: user || { name, full_name: name, user_image: null, email: name } }
      }

      const doc = getDoc(doctype, name)
      // Singleton docs (name === doctype) that aren't in our store return a default
      // so createDocumentResource doesn't throw and crash the settings store.
      if (!doc) {
        if (name === doctype) return { message: { name, doctype } }
        throw new Error(`${doctype} "${name}" not found`)
      }
      return { message: doc }
    }

    // ── List resource (used by statuses store) ──────────────────────────────
    case 'frappe.client.get_list': {
      const doctype = m.doctype
      if (doctype === 'CRM Lead Status') return { message: LEAD_STATUSES }
      if (doctype === 'CRM Deal Status') return { message: DEAL_STATUSES }
      if (doctype === 'CRM Communication Status') return { message: COMMUNICATION_STATUSES }
      const result = getData(doctype, m)
      return { message: result.data }
    }

    // ── Insert ──────────────────────────────────────────────────────────────
    case 'frappe.client.insert': {
      const doc = m.doc || m
      const created = insertDoc(doc)
      return { message: created }
    }

    // ── Save full doc ───────────────────────────────────────────────────────
    case 'frappe.client.save': {
      const doc = m.doc || m
      const saved = saveDoc(doc)
      return { message: saved }
    }

    // ── Set value ───────────────────────────────────────────────────────────
    case 'frappe.client.set_value': {
      const updated = setValue(m.doctype, m.name, m.fieldname, m.value)
      return { message: updated }
    }

    // ── Delete ──────────────────────────────────────────────────────────────
    case 'frappe.client.delete': {
      deleteDoc(m.doctype, m.name)
      return { message: true }
    }

    // ── Fields metadata ─────────────────────────────────────────────────────
    case 'crm.api.doc.get_fields':
    case 'crm.api.doc.get_filterable_fields':
    case 'crm.api.doc.sort_options':
    case 'crm.api.doc.get_group_by_fields': {
      return { message: fieldsFor(m.doctype) }
    }

    case 'crm.api.doc.get_quick_filters': {
      return { message: quickFiltersFor(m.doctype) }
    }

    case 'crm.api.doc.set_quick_filters':
    case 'crm.api.doc.update_quick_filters': {
      return { message: true }
    }

    // ── Quick Entry / Full layout (used by create modals and detail pages) ─────
    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.get_fields_layout': {
      const type = m.type || 'Quick Entry'
      const doctype = m.doctype

      if (type === 'Quick Entry') {
        const layout = quickEntryFor(doctype)
        if (layout) return { message: layout }
        return { message: [] }
      }

      // Full detail layouts
      if (doctype === 'CRM Lead') return { message: LEAD_LAYOUT }
      if (doctype === 'CRM Deal') return { message: DEAL_LAYOUT }
      if (doctype === 'FCRM Note') return { message: NOTE_LAYOUT }
      if (doctype === 'CRM Call Log') return { message: CALL_LOG_LAYOUT }
      return { message: [] }
    }

    // ── Deal create (custom Python API) ─────────────────────────────────────
    case 'crm.fcrm.doctype.crm_deal.crm_deal.create_deal': {
      const dealDoc = { doctype: 'CRM Deal', ...(m.doc || m) }
      const created = insertDoc(dealDoc)
      // Return only the name string — DealModal.onSuccess(name) passes it
      // directly to router.push({ params: { dealId: name } }).
      return { message: created.name }
    }

    // ── Lead create (custom Python API, mirrors frappe.client.insert) ────────
    case 'crm.fcrm.doctype.crm_lead.crm_lead.create_lead': {
      const leadDoc = { doctype: 'CRM Lead', ...(m.doc || m) }
      const created = insertDoc(leadDoc)
      return { message: created.name }
    }

    // ── Doctype meta (used by stores/meta.js getMeta()) ─────────────────────
    // Returns { docs: [{ name, fields, ... }], user_settings: '{}' }
    case 'frappe.desk.form.load.getdoctype': {
      const fields = fieldsFor(m.doctype)
      return {
        message: {
          docs: [{ name: m.doctype, doctype: 'DocType', fields, issingle: 0, istable: 0, module: 'CRM' }],
          user_settings: '{}',
        },
      }
    }

    case 'frappe.model.utils.user_settings.save':
    case 'frappe.model.utils.user_settings.get': {
      return { message: '{}' }
    }

    case 'frappe.client.rename_doc': {
      const col = getCollection(m.doctype)
      if (col) {
        const rec = col.find((r) => r.name === m.name)
        if (rec) { rec.name = m.new_name || m.name }
      }
      return { message: m.new_name || m.name }
    }

    case 'frappe.client.get_doc_permissions': {
      return {
        message: {
          permissions: {
            read: 1, write: 1, create: 1, delete: 1,
            submit: 0, cancel: 0, amend: 0,
            print: 1, email: 1, report: 1, import: 1, export: 1, share: 1,
          },
        },
      }
    }

    // Mock admin user has write access at all perm levels (0–3).
    // A restricted user would get e.g. { write_levels: [0], read_levels: [0, 1] }
    case 'crm.api.doc.get_user_perm_levels': {
      return {
        message: {
          write_levels: [0, 1, 2, 3],
          read_levels: [0, 1, 2, 3],
        },
      }
    }

    case 'frappe.apps.get_apps': {
      return { message: [] }
    }

    case 'frappe.core.doctype.user.user.get_timezones': {
      return {
        message: [
          'UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
          'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
          'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Singapore',
          'Asia/Tokyo', 'Australia/Sydney',
        ],
      }
    }

    case 'crm.api.get_file_uploader_defaults': {
      return { message: { max_file_size: 10485760, allowed_file_types: [] } }
    }

    case 'crm.api.get_user_signature': {
      return { message: '' }
    }

    case 'crm.api.delete_attachment': {
      return { message: true }
    }

    case 'frappe.desk.like.toggle_like': {
      return { message: true }
    }

    // ── Form layout ─────────────────────────────────────────────────────────
    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.get_fields_layout': {
      if (m.doctype === 'CRM Lead') return { message: LEAD_LAYOUT }
      if (m.doctype === 'CRM Deal') return { message: DEAL_LAYOUT }
      if (m.doctype === 'FCRM Note') return { message: NOTE_LAYOUT }
      if (m.doctype === 'CRM Call Log') return { message: CALL_LOG_LAYOUT }
      return { message: [] }
    }

    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.get_sidepanel_sections': {
      if (m.doctype === 'CRM Lead') return { message: LEAD_SIDEPANEL }
      if (m.doctype === 'CRM Deal') return { message: DEAL_SIDEPANEL }
      if (m.doctype === 'Contact') return { message: CONTACT_SIDEPANEL }
      if (m.doctype === 'CRM Organization') return { message: ORG_SIDEPANEL }
      return { message: [] }
    }

    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.save_fields_layout':
    case 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.reset_fields_layout': {
      return { message: true }
    }

    // ── Views ───────────────────────────────────────────────────────────────
    case 'crm.api.views.get_views': {
      return { message: getViews(m.doctype) }
    }

    case 'crm.api.views.create_view':
    case 'frappe.client.insert_view': {
      const view = insertView(m.doc || m)
      return { message: view }
    }

    case 'crm.api.views.update_view': {
      const view = updateView(m.name, m.doc || m)
      return { message: view }
    }

    case 'crm.api.views.delete_view': {
      deleteView(m.name)
      return { message: true }
    }

    // ── Activities ──────────────────────────────────────────────────────────
    // Activities.vue transform: ([versions, calls, notes, tasks, attachments])
    // versions     = main timeline items (comms, comments, activity entries)
    // calls        = CRM Call Log records (Calls tab)
    // notes/tasks/attachments = dedicated tab arrays
    case 'crm.api.activities.get_activities': {
      const dt = doctypeToKey(m.doctype)
      if (!dt) return { message: [[], [], [], [], []] }
      const seed = getActivities(dt, m.name)
      const raw = seed.activities || []

      const versions = raw
        .filter((a) => a.type !== 'call_log')
        .map((a, i) => ({
          name: a.name || `ACT-${i}-${m.name}`,
          activity_type: a.type === 'communication' ? 'communication' : 'activity',
          creation: a.creation,
          owner: a.owner,
          content: a.content,
          subject: a.subject,
          sent_or_received: a.sent_or_received,
          communication_type: a.communication_type,
        }))

      const calls = raw
        .filter((a) => a.type === 'call_log')
        .map((a) => ({
          name: a.id || a.name,
          duration: a.duration,
          status: a.status,
          from: a.from,
          to: a.to,
          creation: a.creation,
          note: a.note || '',
        }))

      const notes = getNotes(m.doctype, m.name)
      const tasks = getTasks(m.doctype, m.name)

      return { message: [versions, calls, notes, tasks, []] }
    }

    // ── Notes ───────────────────────────────────────────────────────────────
    case 'crm.api.doc.add_note':
    case 'frappe.client.insert_note':
    case 'crm.api.doc.create_note': {
      const note = insertNote({
        title: m.title || '',
        content: m.content || '',
        reference_doctype: m.reference_doctype || m.doctype,
        reference_docname: m.reference_docname || m.name,
        owner: m.owner || mockGetUser(),
      })
      return { message: note }
    }

    case 'crm.api.doc.update_note':
    case 'frappe.client.update_note': {
      const note = updateNote(m.name, m.content)
      return { message: note }
    }

    case 'crm.api.doc.delete_note':
    case 'frappe.client.delete_note': {
      deleteNote(m.name)
      return { message: true }
    }

    // ── Tasks ────────────────────────────────────────────────────────────────
    case 'crm.api.doc.create_task':
    case 'frappe.client.insert_task': {
      const task = insertTask({
        title: m.title || '',
        status: m.status || 'Todo',
        priority: m.priority || 'Medium',
        due_date: m.due_date || null,
        assigned_to: m.assigned_to || mockGetUser(),
        reference_doctype: m.reference_doctype || m.doctype,
        reference_docname: m.reference_docname || m.name,
        owner: mockGetUser(),
      })
      return { message: task }
    }

    case 'crm.api.doc.update_task':
    case 'frappe.client.update_task': {
      const { name: taskName, ...taskPatch } = m
      const updatedTask = updateTask(taskName, taskPatch)
      return { message: updatedTask || true }
    }

    case 'crm.api.doc.delete_task':
    case 'frappe.client.delete_task': {
      deleteTask(m.name)
      return { message: true }
    }

    // ── Calendar Events ──────────────────────────────────────────────────────
    case 'crm.api.doc.create_event':
    case 'frappe.client.insert_event': {
      const event = insertEvent({
        subject: m.subject || '',
        description: m.description || '',
        starts_on: m.starts_on,
        ends_on: m.ends_on,
        all_day: m.all_day || 0,
        status: m.status || 'Open',
        color: m.color || '',
        event_type: m.event_type || 'Public',
        owner: mockGetUser(),
        event_participants: m.event_participants || [],
      })
      return { message: event }
    }

    case 'crm.api.doc.update_event':
    case 'frappe.client.update_event': {
      const { name: evtName, ...evtPatch } = m
      updateEvent(evtName, evtPatch)
      return { message: true }
    }

    case 'crm.api.doc.delete_event':
    case 'frappe.client.delete_event': {
      deleteEvent(m.name)
      return { message: true }
    }

    // ── Notifications ───────────────────────────────────────────────────────
    case 'crm.api.notifications.get_notifications': {
      return { message: getNotifications() }
    }

    case 'crm.api.notifications.mark_as_read': {
      markNotificationRead(m.name)
      return { message: true }
    }

    case 'crm.api.notifications.mark_all_as_read': {
      getNotifications().forEach((n) => { n.read = 1 })
      return { message: true }
    }

    // ── Onboarding ──────────────────────────────────────────────────────────
    // frappe.onboarding.get_onboarding_status is called by useOnboarding().
    // It returns { [appName]_onboarding_status: [...steps] } so syncStatus()
    // sees all steps completed and sets isOnboardingStepsCompleted = true.
    case 'frappe.onboarding.get_onboarding_status': {
      return {
        message: {
          frappecrm_onboarding_status: [
            { name: 'setup_your_password', completed: true },
            { name: 'create_first_lead', completed: true },
            { name: 'invite_your_team', completed: true },
            { name: 'create_first_deal', completed: true },
            { name: 'create_first_contact', completed: true },
          ],
        },
      }
    }
    case 'frappe.onboarding.update_user_onboarding_status': {
      return { message: true }
    }
    case 'crm.api.onboarding.get_onboarding_status':
    case 'crm.fcrm.doctype.crm_onboarding_step.crm_onboarding_step.get_onboarding_steps':
    case 'frappe.desk.doctype.onboarding_step.onboarding_step.get_user_onboarding_status': {
      return {
        message: {
          steps: [],
          is_complete: true,
          percent_complete: 100,
        },
      }
    }

    // ── Integration feature flags ────────────────────────────────────────────
    case 'frappe.utils.telemetry.pulse.client.is_enabled': {
      return { message: false }
    }
    case 'crm.integrations.api.is_call_integration_enabled': {
      // onSuccess expects { integrations: {}, default_calling_medium: '' }
      return { message: { integrations: {}, default_calling_medium: '' } }
    }
    case 'crm.integrations.api.is_whatsapp_installed':
    case 'crm.integrations.api.get_integration_status': {
      return { message: false }
    }

    // ── Leads-specific ──────────────────────────────────────────────────────
    case 'crm.fcrm.doctype.crm_lead.crm_lead.convert_to_deal':
    case 'crm.api.doc.convert_lead_to_deal': {
      const dealDoc = { doctype: 'CRM Deal', ...(m.deal || {}) }
      const created = insertDoc(dealDoc)
      return { message: created }
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
      const doctype = m.doctype || m.txt?.split(':')[0] || 'CRM Lead'
      const query = m.txt || m.query || ''
      return { message: searchRecords(doctype, query) }
    }

    // ── Organizations list (dropdown) ───────────────────────────────────────
    case 'crm.api.doc.get_organizations':
    case 'crm.api.organization.list': {
      return { message: getOrgList() }
    }

    // ── Deal contacts ───────────────────────────────────────────────────────
    case 'crm.api.deal.get_contacts':
    case 'crm.fcrm.doctype.crm_deal.crm_deal.get_contacts':
    case 'crm.fcrm.doctype.crm_deal.api.get_deal_contacts': {
      return { message: getDealContacts(m.name) }
    }

    // ── Contact emails / deals ──────────────────────────────────────────────
    case 'crm.api.contact.search_emails': {
      const q = (m.txt || m.query || '').toLowerCase()
      // Attendee.vue transform expects tuples: [fullName, email, contactName]
      const results = getUsers()
        .filter((u) => u.email && (u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q)))
        .slice(0, 10)
        .map((u) => [u.full_name || u.name, u.email, u.name])
      return { message: results }
    }

    case 'crm.api.contact.get_linked_deals': {
      return { message: getContactDeals(m.contact) }
    }

    case 'crm.api.contact.get_deals': {
      return { message: getContactDeals(m.name) }
    }

    // ── Call Logs ────────────────────────────────────────────────────────────
    case 'crm.fcrm.doctype.crm_call_log.crm_call_log.get_call_log': {
      return {
        message: {
          name: m.name || '',
          caller: '',
          receiver: '',
          duration: 0,
          status: 'Completed',
          note: '',
        },
      }
    }

    // ── Dashboard ───────────────────────────────────────────────────────────
    // Items shape: { type, label, data: {chartConfig}, layout: {i,x,y,w,h} }
    // type values used by DashboardItem.vue: 'donut_chart', 'axis_chart', 'number_chart', 'spacer'
    case 'crm.api.dashboard.get_dashboard': {
      return {
        message: [
          {
            type: 'donut_chart',
            label: 'Leads by Status',
            layout: { i: 0, x: 0, y: 0, w: 10, h: 6 },
            data: {
              title: 'Leads by Status',
              data: [
                { status: 'Open', count: 8 },
                { status: 'Contacted', count: 6 },
                { status: 'Nurturing', count: 5 },
                { status: 'Qualified', count: 4 },
                { status: 'Unqualified', count: 2 },
              ],
              categoryColumn: 'status',
              valueColumn: 'count',
              colors: ['#6b7280', '#3b82f6', '#f97316', '#22c55e', '#ef4444'],
            },
          },
          {
            type: 'axis_chart',
            label: 'Deals Pipeline',
            layout: { i: 1, x: 10, y: 0, w: 10, h: 6 },
            data: {
              title: 'Deals Pipeline',
              type: 'bar',
              data: {
                labels: ['Qualification', 'Demo', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
                datasets: [{ name: 'Deals', values: [4, 3, 3, 2, 2, 1] }],
              },
            },
          },
          {
            type: 'axis_chart',
            label: 'Leads over Time',
            layout: { i: 2, x: 0, y: 6, w: 20, h: 6 },
            data: {
              title: 'Leads over Time',
              type: 'line',
              data: {
                labels: ['Jun 1', 'Jun 7', 'Jun 14', 'Jun 21'],
                datasets: [{ name: 'Leads', values: [3, 7, 5, 10] }],
              },
            },
          },
        ],
      }
    }

    case 'crm.api.dashboard.get_chart':
    case 'crm.api.dashboard.get_dashboard_data':
    case 'crm.api.dashboard.get_chart_data': {
      const isLine = (m.chart_type || '') === 'line'
      if (isLine) {
        return {
          message: {
            labels: ['Jun 1', 'Jun 7', 'Jun 14', 'Jun 21'],
            datasets: [{ name: 'Leads', values: [3, 7, 5, 10] }],
          },
        }
      }
      return {
        message: {
          labels: ['Open', 'Contacted', 'Nurturing', 'Qualified', 'Unqualified'],
          datasets: [{ values: [8, 6, 5, 4, 2] }],
        },
      }
    }

    case 'crm.api.dashboard.reset_to_default': {
      return { message: true }
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

    // ── Assignment Rules ────────────────────────────────────────────────────
    case 'crm.api.assignment_rule.get_assignment_rules_list': {
      return { message: [] }
    }

    case 'crm.api.assignment_rule.duplicate_assignment_rule': {
      return { message: true }
    }

    // ── Settings / User ─────────────────────────────────────────────────────
    case 'crm.api.settings.create_email_account': {
      return { message: true }
    }

    case 'crm.api.user.change_password': {
      return { message: true }
    }

    case 'crm.api.user.add_existing_users': {
      return { message: [] }
    }

    // ── WhatsApp messages ───────────────────────────────────────────────────
    case 'crm.api.whatsapp.get_whatsapp_messages': {
      return { message: [] }
    }

    case 'crm.api.whatsapp.create_whatsapp_message':
    case 'crm.api.whatsapp.react_on_whatsapp_message':
    case 'crm.api.whatsapp.send_whatsapp_template': {
      return { message: true }
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

    // ── Telephony integration actions ───────────────────────────────────────
    case 'crm.integrations.api.get_contact_by_phone_number': {
      const phone = m.phone_number || m.mobile_no || ''
      const results = searchRecords('Contact', phone)
      return { message: results[0] || null }
    }

    case 'crm.integrations.api.add_note_to_call_log':
    case 'crm.integrations.api.add_task_to_call_log': {
      return { message: true }
    }

    case 'crm.integrations.exotel.handler.make_a_call': {
      return { message: { call_id: `MOCK-CALL-${Date.now()}` } }
    }

    // ── Frappe Cloud site info ───────────────────────────────────────────────
    case 'frappe.integrations.frappe_providers.frappecloud_billing.current_site_info': {
      return { message: { plan: 'Free', is_trial: false, trial_ends_on: null } }
    }

    // ── Demo data ───────────────────────────────────────────────────────────
    case 'crm.demo.api.clear_demo_data': {
      return { message: true }
    }

    default:
      // Non-fatal — return empty so the UI doesn't crash on optional calls
      if (import.meta.env.DEV) console.debug(`[mock] unhandled: ${endpoint}`)
      return { message: null }
  }
}

// Minimal async tick so callers don't need to handle sync vs async differently
function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// ─── Client-side CSV export ───────────────────────────────────────────────────

function exportData({ doctype, fields, filters, format, pageLength, selectedItems }) {
  let parsedFields
  try { parsedFields = typeof fields === 'string' ? JSON.parse(fields) : (fields || []) } catch { parsedFields = [] }

  let filterArray = []
  try {
    const parsed = typeof filters === 'string' ? JSON.parse(filters) : (filters || {})
    filterArray = Array.isArray(parsed)
      ? parsed
      : Object.entries(parsed).map(([k, v]) => [k, '=', v])
  } catch {}

  const result = getData(doctype, { filters: filterArray, page_length: pageLength || 9999 })
  let rows = result.data
  if (selectedItems?.length) rows = rows.filter((r) => selectedItems.includes(r.name))

  function escapeCell(val) {
    const s = String(val ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }

  const header = parsedFields.map(escapeCell).join(',')
  const body = rows.map((row) => parsedFields.map((f) => escapeCell(row[f])).join(',')).join('\n')
  const csv = header + '\n' + body

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doctype.replace(/\s+/g, '_')}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Exported adapter ─────────────────────────────────────────────────────────

export const MockAdapter = {
  request,
  exportData,
  // Returns a fake file URL instantly — no real upload in mock mode.
  async upload(file) {
    return {
      file_url: URL.createObjectURL(file),
      file_name: file.name,
      name: `mock-file-${Date.now()}`,
    }
  },
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
