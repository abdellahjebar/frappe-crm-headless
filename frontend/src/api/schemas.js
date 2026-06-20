import { z } from 'zod'

// ─── Primitives ───────────────────────────────────────────────────────────────

const User = z.object({
  name: z.string(),
  full_name: z.string().optional(),
  user_image: z.string().nullable().optional(),
})

const View = z.object({
  name: z.string(),
  label: z.string(),
  type: z.string(),
  doctype: z.string(),
})

const Notification = z.object({
  name: z.string(),
  type: z.string().optional(),
  message: z.string().optional(),
  read: z.union([z.number(), z.boolean()]).optional(),
})

const AuthResponse = z.object({
  token: z.string(),
  user: z.string(),
})

// A record with at minimum a name (leads, deals, contacts, etc.)
// Fields are dynamic per installation so we only enforce the identity field.
const AnyRecord = z.object({ name: z.string() }).passthrough()

const ListData = z.object({
  data: z.array(z.record(z.unknown())),
  total_count: z.number().optional(),
  row_count: z.number().optional(),
})

// ─── Per-endpoint schema map ──────────────────────────────────────────────────

const SCHEMAS = {
  // Auth
  'login':                                z.object({ token: z.string(), user: z.string() }),

  // Users
  'crm.api.session.get_users':            z.array(User),

  // Views
  'crm.api.views.get_views':              z.array(View),

  // Notifications
  'crm.api.notifications.get_notifications': z.array(Notification),

  // List data
  'crm.api.doc.get_data':                 ListData,

  // Generic CRUD — must return an object with a name
  'frappe.client.get':                    AnyRecord,
  'frappe.client.insert':                 AnyRecord,
  'frappe.client.set_value':              AnyRecord,

  // Fields
  'crm.api.doc.get_fields':               z.array(z.object({ fieldname: z.string(), label: z.string(), fieldtype: z.string() }).passthrough()),
  'crm.api.doc.get_filterable_fields':    z.array(z.object({ fieldname: z.string() }).passthrough()),
  'crm.api.doc.get_group_by_fields':      z.array(z.object({ fieldname: z.string() }).passthrough()),
  'crm.api.doc.sort_options':             z.array(z.object({ fieldname: z.string() }).passthrough()),

  // Quick filters
  'crm.api.doc.get_quick_filters':        z.array(z.string()),

  // Search
  'frappe.desk.search.search_link':       z.array(z.object({ value: z.string(), label: z.string().optional() }).passthrough()),
}

// ─── Validator ────────────────────────────────────────────────────────────────

function formatError(issues) {
  return issues.map((i) => `${i.path.join('.') || 'root'}: ${i.message}`).join(' | ')
}

/**
 * Validate a backend response against the expected schema for that endpoint.
 * Returns the data unchanged if valid. Throws a descriptive error if not.
 * Passes through endpoints with no defined schema.
 */
export function validate(endpoint, data) {
  const schema = SCHEMAS[endpoint]
  if (!schema) return data

  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(
      `[API] "${endpoint}" returned unexpected shape — ${formatError(result.error.issues)}\n` +
      `Got: ${JSON.stringify(data).slice(0, 200)}`,
    )
  }

  return result.data
}
