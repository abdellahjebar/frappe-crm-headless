import { LEADS } from './seed/leads.js'
import { DEALS } from './seed/deals.js'
import { CONTACTS } from './seed/contacts.js'
import { ORGANIZATIONS } from './seed/organizations.js'
import { USERS } from './seed/users.js'
import { VIEWS } from './seed/views.js'
import { NOTIFICATIONS } from './seed/notifications.js'
import { NOTES } from './seed/notes.js'
import { TASKS } from './seed/tasks.js'
import { EVENTS } from './seed/events.js'

// Deep-clone seed data so mutations never affect the originals
function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

const store = {
  leads: clone(LEADS),
  deals: clone(DEALS),
  contacts: clone(CONTACTS),
  organizations: clone(ORGANIZATIONS),
  users: clone(USERS),
  views: clone(VIEWS),
  notifications: clone(NOTIFICATIONS),
  notes: clone(NOTES),
  tasks: clone(TASKS),
  call_logs: [],
  events: clone(EVENTS),
  counters: { leads: 25, deals: 15, contacts: 10, organizations: 8, notes: 11, tasks: 12, call_logs: 0, events: 6 },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getCollection(doctype) {
  const map = {
    'CRM Lead': 'leads',
    'CRM Deal': 'deals',
    'Contact': 'contacts',
    'CRM Organization': 'organizations',
    'FCRM Note': 'notes',
    'CRM Task': 'tasks',
    'CRM Call Log': 'call_logs',
    'Event': 'events',
    'CRM Lead Status': null,
    'CRM Deal Status': null,
    'CRM Communication Status': null,
  }
  const key = map[doctype]
  if (key === undefined) return null
  return store[key] ?? null
}

function generateName(doctype) {
  const prefixes = {
    'CRM Lead': 'LEAD',
    'CRM Deal': 'DEAL',
    'Contact': 'CONT',
    'CRM Organization': 'ORG',
    'FCRM Note': 'NOTE',
    'CRM Task': 'TASK',
    'CRM Call Log': 'CALL',
    'Event': 'EVT',
  }
  const prefix = prefixes[doctype] || 'DOC'
  const key = prefix.toLowerCase() + 's'
  store.counters[key] = (store.counters[key] || 0) + 1
  return `${prefix}-${String(store.counters[key]).padStart(4, '0')}`
}

function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

// ─── Filter engine ────────────────────────────────────────────────────────────

function applyFilter(record, [field, op, value]) {
  const rv = record[field]
  switch (op) {
    case '=': return rv == value
    case '!=': return rv != value
    case '>': return rv > value
    case '<': return rv < value
    case '>=': return rv >= value
    case '<=': return rv <= value
    case 'like': {
      const pattern = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*')
      // eslint-disable-next-line security/detect-non-literal-regexp -- pattern is escaped above
      return new RegExp(`^${pattern}$`, 'i').test(String(rv ?? ''))
    }
    case 'not like': {
      const pattern = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*')
      // eslint-disable-next-line security/detect-non-literal-regexp -- pattern is escaped above
      return !new RegExp(`^${pattern}$`, 'i').test(String(rv ?? ''))
    }
    case 'in': return Array.isArray(value) ? value.includes(rv) : String(value).split(',').includes(String(rv))
    case 'not in': return Array.isArray(value) ? !value.includes(rv) : !String(value).split(',').includes(String(rv))
    case 'is': return value === 'set' ? rv != null && rv !== '' : rv == null || rv === ''
    case 'is not': return value === 'set' ? rv == null || rv === '' : rv != null && rv !== ''
    default: return true
  }
}

function applyFilters(records, filters) {
  if (!filters || !filters.length) return records
  return records.filter((r) => filters.every((f) => applyFilter(r, f)))
}

function applySort(records, orderBy) {
  if (!orderBy) return records
  const [field, dir] = orderBy.trim().split(/\s+/)
  const desc = dir?.toLowerCase() === 'desc'
  return [...records].sort((a, b) => {
    const av = a[field] ?? ''
    const bv = b[field] ?? ''
    if (av < bv) return desc ? 1 : -1
    if (av > bv) return desc ? -1 : 1
    return 0
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getData(doctype, options = {}) {
  const col = getCollection(doctype)
  if (!col) return { data: [], total_count: 0, row_count: 0 }

  let filters = options.filters || []
  if (typeof filters === 'string') {
    try { filters = JSON.parse(filters) } catch { filters = [] }
  }

  let records = applyFilters(col, filters)
  records = applySort(records, options.order_by || 'modified desc')

  const total_count = records.length
  const page_length = Number(options.limit || options.page_length) || 20
  const offset = options.limit_start != null
    ? Number(options.limit_start)
    : ((Number(options.page) || 1) - 1) * page_length
  const data = records.slice(offset, offset + page_length)

  return { data, total_count, row_count: data.length }
}

export function getDoc(doctype, name) {
  const col = getCollection(doctype)
  if (!col) return null
  return col.find((r) => r.name === name) || null
}

export function insertDoc(doc) {
  const col = getCollection(doc.doctype)
  if (!col) throw new Error(`Unknown doctype: ${doc.doctype}`)
  const newDoc = {
    ...doc,
    name: generateName(doc.doctype),
    creation: now(),
    modified: now(),
    notes: [],
  }
  col.push(newDoc)
  return newDoc
}

export function setValue(doctype, name, fieldname, value) {
  const col = getCollection(doctype)
  if (!col) throw new Error(`Unknown doctype: ${doctype}`)
  const record = col.find((r) => r.name === name)
  if (!record) throw new Error(`${doctype} "${name}" not found`)

  if (typeof fieldname === 'object') {
    Object.assign(record, fieldname)
  } else {
    record[fieldname] = value
  }
  record.modified = now()
  return record
}

export function saveDoc(doc) {
  const col = getCollection(doc.doctype)
  if (!col) throw new Error(`Unknown doctype: ${doc.doctype}`)
  const record = col.find((r) => r.name === doc.name)
  if (!record) throw new Error(`${doc.doctype} "${doc.name}" not found`)
  const { doctype: _dt, name: _n, creation: _c, ...fields } = doc
  Object.assign(record, fields)
  record.modified = now()
  return record
}

export function deleteDoc(doctype, name) {
  const col = getCollection(doctype)
  if (!col) return
  const idx = col.findIndex((r) => r.name === name)
  if (idx !== -1) col.splice(idx, 1)
}

export function getUsers() {
  return store.users
}

export function getViews(doctype) {
  return store.views.filter((v) => !doctype || v.doctype === doctype)
}

export function insertView(view) {
  const newView = {
    ...view,
    name: `VIEW-${Date.now()}`,
    creation: now(),
    modified: now(),
  }
  store.views.push(newView)
  return newView
}

export function updateView(name, patch) {
  const view = store.views.find((v) => v.name === name)
  if (view) Object.assign(view, patch, { modified: now() })
  return view
}

export function deleteView(name) {
  const idx = store.views.findIndex((v) => v.name === name)
  if (idx !== -1) store.views.splice(idx, 1)
}

export function getNotifications() {
  return store.notifications
}

export function markNotificationRead(name) {
  const n = store.notifications.find((x) => x.name === name)
  if (n) n.read = 1
}

export function searchRecords(doctype, query) {
  const col = getCollection(doctype)
  if (!col || !query) return []
  const q = query.toLowerCase()
  return col
    .filter((r) => {
      const label = r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.deal_name || r.organization_name || r.name
      return label.toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q)
    })
    .slice(0, 10)
    .map((r) => ({
      value: r.name,
      label: r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.deal_name || r.organization_name,
      description: r.company_name || r.email || '',
    }))
}

export function getOrgList() {
  return store.organizations.map((o) => ({ name: o.name, organization_name: o.organization_name }))
}

export function getDealContacts(dealName) {
  const deal = store.deals.find((d) => d.name === dealName)
  if (!deal || !deal.contact) return []
  const contact = store.contacts.find((c) => c.name === deal.contact)
  if (!contact) return []
  return [{
    contact: contact.name,
    full_name: contact.full_name,
    email: contact.email,
  }]
}

export function getContactDeals(contactName) {
  return store.deals
    .filter((d) => d.contact === contactName)
    .map((d) => ({ name: d.name, deal_name: d.deal_name, status: d.status }))
}

export function getNotes(doctype, name) {
  return store.notes.filter(
    (n) => n.reference_doctype === doctype && n.reference_docname === name,
  )
}

export function insertNote(note) {
  store.counters.notes++
  const newNote = {
    ...note,
    name: `NOTE-${String(store.counters.notes).padStart(4, '0')}`,
    creation: now(),
    modified: now(),
  }
  store.notes.push(newNote)
  return newNote
}

export function updateNote(name, content) {
  const note = store.notes.find((n) => n.name === name)
  if (note) {
    note.content = content
    note.modified = now()
  }
  return note
}

export function deleteNote(name) {
  const idx = store.notes.findIndex((n) => n.name === name)
  if (idx !== -1) store.notes.splice(idx, 1)
}

export function getTasks(doctype, name) {
  return store.tasks.filter(
    (t) => t.reference_doctype === doctype && t.reference_docname === name,
  )
}

export function insertTask(task) {
  store.counters.tasks++
  const newTask = {
    ...task,
    name: `TASK-${String(store.counters.tasks).padStart(4, '0')}`,
    creation: now(),
    modified: now(),
  }
  store.tasks.push(newTask)
  return newTask
}

export function updateTask(name, patch) {
  const task = store.tasks.find((t) => t.name === name)
  if (task) Object.assign(task, patch, { modified: now() })
  return task
}

export function deleteTask(name) {
  const idx = store.tasks.findIndex((t) => t.name === name)
  if (idx !== -1) store.tasks.splice(idx, 1)
}

export function getEvents(filters = []) {
  let events = [...store.events]
  for (const [field, op, value] of filters) {
    if (op === '<=' && field === 'ends_on') {
      events = events.filter((e) => e.ends_on <= value)
    } else if (op === '>=' && field === 'starts_on') {
      events = events.filter((e) => e.starts_on >= value)
    }
  }
  return events
}

export function insertEvent(event) {
  store.counters.events++
  const newEvent = {
    ...event,
    name: `EVT-${String(store.counters.events).padStart(4, '0')}`,
    creation: now(),
    modified: now(),
  }
  store.events.push(newEvent)
  return newEvent
}

export function updateEvent(name, patch) {
  const event = store.events.find((e) => e.name === name)
  if (event) Object.assign(event, patch, { modified: now() })
  return event
}

export function deleteEvent(name) {
  const idx = store.events.findIndex((e) => e.name === name)
  if (idx !== -1) store.events.splice(idx, 1)
}
