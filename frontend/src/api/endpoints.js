/**
 * Endpoint registry — every backend route the CRM uses, in one place.
 *
 * The default values are Frappe dot-notation method paths. When integrating
 * a different backend, call setEndpoints() with your own route mappings.
 *
 * Usage in a component/store (after Phase 3 migration):
 *   import { ep } from '@/api/endpoints'
 *   createResource({ url: ep.getUsers })
 *
 * Backend integration:
 *   import { setEndpoints } from '@/api/endpoints'
 *   setEndpoints({ getUsers: 'users', getLeads: 'leads', ... })
 */

const defaults = {
  // ─── Session & Users ────────────────────────────────────────────────────────
  login:              'login',
  logout:             'logout',
  getUsers:           'crm.api.session.get_users',
  getOrganizations:   'crm.api.session.get_organizations',
  inviteByEmail:      'crm.api.invite_by_email',

  // ─── Document (generic Frappe ORM) ──────────────────────────────────────────
  getDoctype:         'frappe.desk.form.load.getdoctype',
  getDoc:             'frappe.client.get',
  insertDoc:          'frappe.client.insert',
  deleteDoc:          'frappe.client.delete',
  setValue:           'frappe.client.set_value',
  getList:            'frappe.client.get_list',
  renameDoc:          'frappe.client.rename_doc',
  getDocPermissions:  'frappe.client.get_doc_permissions',
  saveUserSettings:   'frappe.model.utils.user_settings.save',
  searchLink:         'frappe.desk.search.search_link',
  toggleLike:         'frappe.desk.like.toggle_like',
  assignTo:           'frappe.desk.form.assign_to.add',
  getApps:            'frappe.apps.get_apps',
  getTimezones:       'frappe.core.doctype.user.user.get_timezones',
  getFileUploaderDefaults: 'crm.api.get_file_uploader_defaults',
  getUserSignature:   'crm.api.get_user_signature',
  deleteAttachment:   'crm.api.delete_attachment',

  // ─── Notifications ───────────────────────────────────────────────────────────
  getNotifications:   'crm.api.notifications.get_notifications',
  markNotificationRead: 'crm.api.notifications.mark_as_read',

  // ─── Views ───────────────────────────────────────────────────────────────────
  getViews:           'crm.api.views.get_views',

  // ─── Document helpers (CRM-specific) ─────────────────────────────────────────
  getData:            'crm.api.doc.get_data',
  getFields:          'crm.api.doc.get_fields',
  getFilterableFields: 'crm.api.doc.get_filterable_fields',
  getGroupByFields:   'crm.api.doc.get_group_by_fields',
  getSortOptions:     'crm.api.doc.sort_options',
  getQuickFilters:    'crm.api.doc.get_quick_filters',
  updateQuickFilters: 'crm.api.doc.update_quick_filters',
  getAssignedUsers:   'crm.api.doc.get_assigned_users',
  removeAssignments:  'crm.api.doc.remove_assignments',
  getLinkedDocs:      'crm.api.doc.get_linked_docs_of_document',

  // ─── Fields Layout ───────────────────────────────────────────────────────────
  getFieldsLayout:    'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.get_fields_layout',
  getSidepanelSections: 'crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.get_sidepanel_sections',

  // ─── Activities ───────────────────────────────────────────────────────────────
  getActivities:      'crm.api.activities.get_activities',

  // ─── Contacts ────────────────────────────────────────────────────────────────
  searchEmails:       'crm.api.contact.search_emails',
  getLinkedDeals:     'crm.api.contact.get_linked_deals',

  // ─── Deals ───────────────────────────────────────────────────────────────────
  createDeal:         'crm.fcrm.doctype.crm_deal.crm_deal.create_deal',
  getDealContacts:    'crm.fcrm.doctype.crm_deal.api.get_deal_contacts',

  // ─── Call Logs ───────────────────────────────────────────────────────────────
  getCallLog:         'crm.fcrm.doctype.crm_call_log.crm_call_log.get_call_log',

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  getDashboard:       'crm.api.dashboard.get_dashboard',
  getChart:           'crm.api.dashboard.get_chart',
  resetDashboard:     'crm.api.dashboard.reset_to_default',

  // ─── Assignment Rules ─────────────────────────────────────────────────────────
  getAssignmentRules:       'crm.api.assignment_rule.get_assignment_rules_list',
  duplicateAssignmentRule:  'crm.api.assignment_rule.duplicate_assignment_rule',

  // ─── Settings ────────────────────────────────────────────────────────────────
  createEmailAccount: 'crm.api.settings.create_email_account',

  // ─── User ────────────────────────────────────────────────────────────────────
  changePassword:     'crm.api.user.change_password',
  addExistingUsers:   'crm.api.user.add_existing_users',

  // ─── WhatsApp ────────────────────────────────────────────────────────────────
  isWhatsappEnabled:        'crm.api.whatsapp.is_whatsapp_enabled',
  isWhatsappInstalled:      'crm.api.whatsapp.is_whatsapp_installed',
  getWhatsappMessages:      'crm.api.whatsapp.get_whatsapp_messages',
  createWhatsappMessage:    'crm.api.whatsapp.create_whatsapp_message',
  reactOnWhatsappMessage:   'crm.api.whatsapp.react_on_whatsapp_message',
  sendWhatsappTemplate:     'crm.api.whatsapp.send_whatsapp_template',

  // ─── Telephony / Integrations ─────────────────────────────────────────────────
  isCallIntegrationEnabled:   'crm.integrations.api.is_call_integration_enabled',
  getContactByPhoneNumber:    'crm.integrations.api.get_contact_by_phone_number',
  addNoteToCallLog:           'crm.integrations.api.add_note_to_call_log',
  addTaskToCallLog:           'crm.integrations.api.add_task_to_call_log',
  makeExotelCall:             'crm.integrations.exotel.handler.make_a_call',

  // ─── Frappe Cloud ────────────────────────────────────────────────────────────
  getCurrentSiteInfo:   'frappe.integrations.frappe_providers.frappecloud_billing.current_site_info',

  // ─── Demo ─────────────────────────────────────────────────────────────────────
  clearDemoData:  'crm.demo.api.clear_demo_data',
}

let _endpoints = { ...defaults }

/**
 * Override endpoint mappings for your backend.
 * Merges with defaults — only provide the endpoints your backend exposes differently.
 *
 * @param {Partial<typeof defaults>} overrides
 */
export function setEndpoints(overrides) {
  _endpoints = { ...defaults, ...overrides }
}

/**
 * Active endpoint map. Use `ep.keyName` in stores and composables.
 *
 * @type {typeof defaults}
 */
export const ep = new Proxy(_endpoints, {
  get(_, key) {
    return _endpoints[key]
  },
})
