# CRM Frontend — Backend API Specification

Every backend that powers this CRM frontend must implement the routes below.
The REST adapter in `src/api/adapters/rest.js` maps all frontend calls to these
routes. Set `VITE_BACKEND_URL` in your `.env` and implement the spec — the UI
works without any other changes.

---

## Conventions

### Base URL
All routes are relative to `{VITE_BACKEND_URL}/api`.

### Authentication
After login, every request carries a Bearer token:
```
Authorization: Bearer <token>
```
Return `401` on expired/missing token. The adapter fires `crm:auth:expired`
so the app redirects to login automatically.

### Request bodies
`Content-Type: application/json` on all POST / PATCH / PUT requests.

### Response format
Return raw JSON — no envelope wrapper. The adapter wraps it internally.

```json
// ✅ correct
{ "data": [...], "total_count": 25 }

// ❌ wrong — do not wrap in message:
{ "message": { "data": [...] } }
```

### Errors
```json
HTTP 4xx / 5xx
{ "message": "Human-readable description" }
```

### Filters
Filters are a JSON-encoded array of triples sent as a query parameter:
```
filters=[["status","=","Open"],["lead_owner","=","sarah@example.com"]]
```
Supported operators: `=` `!=` `>` `<` `>=` `<=` `like` `not like` `in` `not in` `is` `is not`

`like` uses SQL `%` wildcards: `%Ben%` matches any value containing "Ben".

### Pagination
```
page_length=20    number of rows per page (default 20)
page=1            1-based page number
```

### Field types
Fields use Frappe field type names: `Data`, `Select`, `Link`, `Int`, `Float`,
`Currency`, `Date`, `Datetime`, `Long Text`, `Check`, `Percent`, `Rating`,
`Dynamic Link`, `User`, `HTML`, `Button`.

---

## Resources

Seven resources share the same route pattern. Not every sub-route applies
to every resource — see the table below.

| Resource      | Path prefix        | data | CRUD | fields | filters | assign | layout | sidepanel | activities | like |
|---------------|--------------------|:----:|:----:|:------:|:-------:|:------:|:------:|:---------:|:----------:|:----:|
| Lead          | `/leads`           | ✅   | ✅   | ✅     | ✅      | ✅     | ✅     | ✅        | ✅         | ✅   |
| Deal          | `/deals`           | ✅   | ✅   | ✅     | ✅      | ✅     | ✅     | ✅        | ✅         | ✅   |
| Contact       | `/contacts`        | ✅   | ✅   | ✅     | ✅      | —      | ✅     | ✅        | ✅         | ✅   |
| Organization  | `/organizations`   | ✅   | ✅   | ✅     | —       | —      | ✅     | ✅        | ✅         | —    |
| Note          | `/notes`           | ✅   | ✅   | ✅     | —       | —      | ✅     | ✅        | —          | —    |
| Task          | `/tasks`           | ✅   | ✅   | ✅     | —       | —      | ✅     | —         | —          | —    |
| Call Log      | `/call-logs`       | ✅   | ✅   | ✅     | —       | —      | —      | —         | —          | —    |

---

### GET `/{resource}/data`

Main list view. Returns filtered, sorted, paginated rows with column definitions.

**Query parameters**
| Param | Type | Description |
|-------|------|-------------|
| `filters` | JSON array | Filter triples `[field, op, value]` |
| `order_by` | string | e.g. `"modified desc"` |
| `page_length` | integer | Rows per page (default 20) |
| `page` | integer | 1-based page number |
| `columns` | JSON array | Column definitions (see below) |
| `rows` | JSON array | Field names to include in row data |
| `view_type` | string | `"list"` \| `"kanban"` \| `"group_by"` |
| `group_by_field` | string | Field to group by (group_by view) |
| `column_field` | string | Field driving kanban columns |
| `title_field` | string | Field to use as kanban card title |
| `kanban_columns` | JSON array | Ordered kanban column values |
| `kanban_fields` | JSON array | Fields shown on kanban cards |

**Response**
```json
{
  "data": [
    { "name": "LEAD-0001", "first_name": "Ben", "status": "Open", "modified": "2024-06-01 10:00:00" }
  ],
  "total_count": 25,
  "row_count": 20,
  "columns": [
    { "key": "first_name", "label": "First Name", "type": "Data" },
    { "key": "status",     "label": "Status",     "type": "Select" }
  ],
  "rows": ["name", "first_name", "status", "modified"],
  "view_type": "list",
  "views": [
    { "name": "VIEW-001", "label": "My Leads", "type": "list", "doctype": "CRM Lead" }
  ]
}
```

`data` rows always include `name` (used for navigation links).
`columns` drive the list header. `rows` is the ordered field list used to build each row.

---

### GET `/{resource}/:id`

Fetch a single document.

**Response**
```json
{
  "name": "LEAD-0001",
  "first_name": "Ben",
  "last_name": "Walker",
  "email": "ben.walker@example.com",
  "status": "Open",
  "lead_owner": "sarah@example.com",
  "creation": "2024-01-15 09:00:00",
  "modified": "2024-06-01 10:00:00"
}
```

Return all fields stored for the document. Unknown extra fields are ignored by the UI.

---

### POST `/{resource}`

Create a new document.

**Request body**
```json
{ "first_name": "Alice", "email": "alice@example.com", "status": "Open" }
```

**Response** — the created document with server-assigned `name`:
```json
{ "name": "LEAD-0026", "first_name": "Alice", "creation": "2026-06-21 08:00:00" }
```

---

### PATCH `/{resource}/:id`

Update one or more fields on a document.

**Request body** — only the fields being changed:
```json
{ "status": "Contacted", "lead_owner": "james@example.com" }
```

**Response** — the updated document:
```json
{ "name": "LEAD-0001", "status": "Contacted", "modified": "2026-06-21 08:01:00" }
```

---

### DELETE `/{resource}/:id`

Delete a document.

**Response**
```json
true
```

---

### GET `/{resource}/fields`

All field definitions for this resource. Used by filter builder, column settings, and sort options.

**Response**
```json
[
  { "fieldname": "first_name", "label": "First Name", "fieldtype": "Data", "reqd": 1 },
  { "fieldname": "status",     "label": "Status",     "fieldtype": "Select",
    "options": "Open\nContacted\nNurturing\nQualified\nUnqualified" },
  { "fieldname": "lead_owner", "label": "Lead Owner", "fieldtype": "Link", "options": "User" }
]
```

`options` for `Select` fields: newline-separated string of option values.
`options` for `Link` fields: the linked doctype name.

The same endpoint is called for `/fields`, `/fields/filterable`, `/fields/group-by`,
and `/fields/sortable`. You may return the same list for all four, or filter down
to only the relevant fields per variant.

---

### GET `/{resource}/quick-filters`

The field names pinned as quick filter chips above the list.

**Response**
```json
[
  { "fieldname": "status",     "label": "Status",     "fieldtype": "Select",
    "options": ["Open", "Contacted", "Nurturing", "Qualified", "Unqualified"] },
  { "fieldname": "lead_owner", "label": "Lead Owner", "fieldtype": "Link", "options": "User" }
]
```

Note: `options` for `Select` quick filters is an **array of strings**, not a newline-separated string.

---

### PUT `/{resource}/quick-filters`

Save the user's pinned quick filters.

**Request body**
```json
{ "filters": ["status", "lead_owner", "source"] }
```

**Response** `true`

---

### GET `/{resource}/:id/assigned-users`

Users assigned to this document.

**Response**
```json
[
  { "name": "sarah@example.com", "full_name": "Sarah Chen", "user_image": null }
]
```

---

### POST `/{resource}/:id/assign`

Assign users to a document.

**Request body**
```json
{ "users": ["james@example.com"] }
```

**Response** `true`

---

### DELETE `/{resource}/:id/assignments`

Remove all assignments from a document.

**Response** `true`

---

### GET `/{resource}/:id/linked-docs`

Documents from other resources linked to this one (used in the linked docs panel).

**Response**
```json
[
  { "doctype": "CRM Deal", "name": "DEAL-0001", "title": "Acme — Enterprise License" }
]
```

---

### GET `/{resource}/layout`

Tab/section/field layout for the detail form. Used by `DoctypeModal` and the
Lead/Deal detail pages.

**Response** — array of tab objects (returned directly, no wrapper):
```json
[
  {
    "label": "Details",
    "name": "details",
    "sections": [
      {
        "label": "Contact Info",
        "name": "contact_info",
        "columns": [
          {
            "name": "col_1",
            "fields": [
              { "fieldname": "first_name", "fieldtype": "Data",   "label": "First Name" },
              { "fieldname": "email",      "fieldtype": "Data",   "label": "Email" }
            ]
          },
          {
            "name": "col_2",
            "fields": [
              { "fieldname": "company_name", "fieldtype": "Data", "label": "Company" },
              { "fieldname": "website",      "fieldtype": "Data", "label": "Website" }
            ]
          }
        ]
      }
    ]
  }
]
```

Columns are objects `{ name, fields: [...] }` — not nested arrays.
Return `null` if no layout is configured for this resource.

---

### GET `/{resource}/layout/sidepanel`

Sections shown in the right-hand side panel on detail pages.

**Response** — flat array of section objects:
```json
[
  {
    "label": "Details",
    "name": "details",
    "opened": true,
    "columns": [
      {
        "fields": [
          { "fieldname": "lead_owner", "fieldtype": "Link",   "label": "Lead Owner", "options": "User" },
          { "fieldname": "status",     "fieldtype": "Select", "label": "Status",
            "options": "Open\nContacted\nNurturing\nQualified\nUnqualified" },
          { "fieldname": "mobile_no",  "fieldtype": "Data",   "label": "Mobile No" }
        ]
      }
    ]
  }
]
```

`columns[0].fields` is the single-column list of fields shown in the panel.
Return `null` if no sidepanel is configured.

---

### GET `/{resource}/:id/activities`

Timeline of all activity on a document (emails, calls, notes, comments, WhatsApp).

**Response**
```json
{
  "activities": [
    {
      "activity_type": "comment",
      "name": "ACT-001",
      "owner": "sarah@example.com",
      "owner_full_name": "Sarah Chen",
      "creation": "2024-06-01 09:00:00",
      "comment": "Followed up via email."
    },
    {
      "activity_type": "call",
      "name": "ACT-002",
      "owner": "james@example.com",
      "owner_full_name": "James Okafor",
      "creation": "2024-06-02 14:30:00",
      "duration": 180,
      "status": "Completed"
    }
  ],
  "versions": [
    {
      "name": "VER-001",
      "owner": "sarah@example.com",
      "creation": "2024-06-01 08:00:00",
      "data": "{\"changed\": [[\"status\", \"Open\", \"Contacted\"]]}"
    }
  ]
}
```

`activity_type` values: `"comment"` `"email"` `"call"` `"note"` `"whatsapp"` `"activity"`

---

### POST `/{resource}/:id/like`

Toggle the liked state for the current user.

**Request body**
```json
{ "liked": true }
```

**Response** `true`

---

## Resource-specific routes

### GET `/deals/:id/contacts`

Contacts linked to a deal.

**Response**
```json
[
  { "contact": "CONT-0001", "full_name": "Nina Patel", "email": "n.patel@vertexsys.io" }
]
```

---

### POST `/leads/:id/convert-to-deal`

Convert a lead into a deal. Sends a pre-filled deal object and optional
references to an existing contact and organization.

**Request body**
```json
{
  "deal": { "deal_name": "Acme Corp", "status": "Qualification" },
  "existing_contact": "CONT-0001",
  "existing_organization": "ORG-0001"
}
```

**Response** — the newly created deal:
```json
{ "name": "DEAL-0016", "deal_name": "Acme Corp", "status": "Qualification" }
```

---

### POST `/{resource}/layout`

Save a user-edited field layout. Called from the layout editor modals.

**Request body**
```json
{
  "type": "Quick Entry",
  "layout": "[{\"label\":\"Details\",\"name\":\"details\",\"sections\":[...]}]"
}
```

`type` values: `"Quick Entry"` `"Side Panel"` `"Default"` `"Required Fields"`

**Response** `true`

---

### DELETE `/{resource}/layout`

Reset a layout to system defaults.

**Request body**
```json
{ "type": "Quick Entry" }
```

**Response** `true`

---

### GET `/contacts/search`

Search contacts by email for the email composer autocomplete.

**Query params:** `query=nina`

**Response**
```json
[
  { "value": "n.patel@vertexsys.io", "label": "Nina Patel", "description": "n.patel@vertexsys.io" }
]
```

---

### GET `/contacts/:id/deals`

Deals linked to a contact.

**Response**
```json
[
  { "name": "DEAL-0005", "deal_name": "Vertex Systems — SaaS Expansion", "status": "Demo / Discovery" }
]
```

---

### GET `/contacts/by-phone/:number`

Look up a contact by phone number (used by telephony integration).

**Response** — the matching contact object, or `null`:
```json
{ "name": "CONT-0001", "full_name": "Nina Patel", "email": "n.patel@vertexsys.io" }
```

---

### GET `/organizations/list`

Lightweight org list for dropdowns (not paginated).

**Response**
```json
[
  { "name": "ORG-0001", "organization_name": "Vertex Systems" }
]
```

---

### POST `/call-logs/:id/notes`

Add a note to a call log.

**Request body**
```json
{ "note": "Discussed Q3 pricing." }
```

**Response** `true`

---

### POST `/call-logs/:id/tasks`

Add a follow-up task to a call log.

**Request body**
```json
{ "task": "Send proposal by Friday." }
```

**Response** `true`

---

## Auth & Users

### POST `/auth/login`

**Request body**
```json
{ "email": "sarah@example.com", "password": "secret" }
```

**Response**
```json
{ "token": "eyJ...", "user": "sarah@example.com" }
```

---

### POST `/auth/logout`

**Response** `true`

---

### GET `/users`

All CRM users (for assignee dropdowns, owner filters, avatar display).

**Response**
```json
[
  {
    "name": "sarah@example.com",
    "full_name": "Sarah Chen",
    "user_image": "https://example.com/avatars/sarah.jpg",
    "role": "Sales Manager"
  }
]
```

---

### POST `/users/invite`

Invite a new user by email.

**Request body**
```json
{ "email": "newuser@example.com" }
```

**Response** `true`

---

### POST `/users/add`

Add existing system users to the CRM.

**Request body**
```json
{ "users": ["existing@example.com"] }
```

**Response** `true`

---

### POST `/users/change-password`

**Request body**
```json
{ "old_password": "old", "new_password": "new" }
```

**Response** `true`

---

### GET `/users/me/signature`

Email signature for the current user.

**Response**
```json
"<p>Best regards,<br>Sarah Chen</p>"
```

---

### POST `/user-settings`

Save per-user UI settings (column widths, sort preferences, etc.).

**Request body** — arbitrary JSON key/value map:
```json
{ "CRM Lead": "{\"column_widths\": {\"first_name\": 200}}" }
```

**Response** `true`

---

### GET `/timezones`

List of timezone identifiers for the settings screen.

**Response**
```json
["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Dubai", "Asia/Kolkata"]
```

---

## Views

User-saved list/kanban/group-by views.

### GET `/views`

**Query params:** `doctype=CRM Lead`

**Response**
```json
[
  {
    "name": "VIEW-001",
    "label": "My Open Leads",
    "type": "list",
    "doctype": "CRM Lead",
    "filters": "[[\"status\",\"=\",\"Open\"]]",
    "order_by": "modified desc",
    "columns": "[...]",
    "rows": "[...]",
    "is_public": 0,
    "owner": "sarah@example.com"
  }
]
```

---

### POST `/views`

**Request body** — view object (same shape as above, without `name`)

**Response** — the created view with server-assigned `name`

---

### PATCH `/views/:id`

**Request body** — partial view object with fields to update

**Response** — the updated view

---

### DELETE `/views/:id`

**Response** `true`

---

## Notifications

### GET `/notifications`

**Response**
```json
[
  {
    "name": "NOTIF-001",
    "type": "mention",
    "message": "Sarah mentioned you in LEAD-0001",
    "read": 0,
    "creation": "2026-06-20 09:00:00",
    "reference_doctype": "CRM Lead",
    "reference_name": "LEAD-0001"
  }
]
```

---

### PATCH `/notifications/:id/read`

Mark a single notification as read.

**Response** `true`

---

### PATCH `/notifications/read-all`

Mark all notifications as read.

**Response** `true`

---

## Meta & Search

### GET `/meta/:doctype`

DocType field schema. Used by the meta store to build field type maps for
rendering and validation.

**Response**
```json
{
  "name": "CRM Lead",
  "fields": [
    { "fieldname": "first_name", "label": "First Name", "fieldtype": "Data", "reqd": 1 },
    { "fieldname": "status",     "label": "Status",     "fieldtype": "Select",
      "options": "Open\nContacted\nNurturing\nQualified\nUnqualified" }
  ],
  "issingle": 0,
  "istable": 0
}
```

---

### GET `/search`

Link field autocomplete search.

**Query params:** `doctype=Contact&query=nina&filters=[]`

**Response**
```json
[
  { "value": "CONT-0001", "label": "Nina Patel", "description": "n.patel@vertexsys.io" }
]
```

---

### PATCH `/:doctype/:id/rename`

Rename a document (change its `name` field).

**Request body**
```json
{ "new_name": "LEAD-RENAMED" }
```

**Response**
```json
"LEAD-RENAMED"
```

---

## Files

### POST `/files`

Upload a file attachment.

**Request** — `multipart/form-data` with a `file` field.

**Response**
```json
{
  "name": "FILE-001",
  "file_url": "/files/attachment.pdf",
  "file_name": "attachment.pdf",
  "is_private": 0
}
```

---

### GET `/files/defaults`

File upload configuration for the uploader component.

**Response**
```json
{ "max_file_size": 10485760, "allowed_file_types": [] }
```

`max_file_size` in bytes. Empty `allowed_file_types` means all types are allowed.

---

### DELETE `/files/:id`

Delete an attachment.

**Response** `true`

---

## Dashboard

### GET `/dashboards/:id`

Dashboard chart definitions.

**Response**
```json
[
  { "chart_name": "Leads by Status", "chart_type": "donut", "doctype": "CRM Lead", "based_on": "status" },
  { "chart_name": "Deal Pipeline",   "chart_type": "bar",   "doctype": "CRM Deal", "based_on": "status" }
]
```

---

### GET `/dashboards/:id/charts/:chart_name`

Data for a single chart.

**Response**
```json
{
  "labels": ["Open", "Contacted", "Nurturing", "Qualified"],
  "datasets": [{ "values": [8, 6, 5, 4] }]
}
```

---

### POST `/dashboards/:id/reset`

Reset dashboard to default configuration.

**Response** `true`

---

## Settings

### GET `/assignment-rules`

List of auto-assignment rules.

**Response**
```json
[
  { "name": "RULE-001", "document_type": "CRM Lead", "rule": "Round Robin", "active": 1 }
]
```

---

### POST `/assignment-rules/:id/duplicate`

Duplicate an assignment rule.

**Response** `true`

---

### POST `/settings/email-accounts`

Create or connect an email account for inbound/outbound email.

**Request body**
```json
{ "email": "crm@example.com", "password": "apppassword", "service": "gmail" }
```

**Response** `true`

---

## Optional Integrations

Return `false` or empty arrays if an integration is not supported.
The UI hides all related UI elements automatically.

### GET `/integrations/whatsapp/status`

**Response** `false` (disabled) or `true` (enabled)

---

### GET `/integrations/whatsapp/installed`

**Response** `false` or `true`

---

### GET `/{resource}/:id/whatsapp`

WhatsApp message thread for a lead or deal.

**Response**
```json
[
  {
    "name": "WA-001",
    "content": "Hi, are you still interested?",
    "sender": "sarah@example.com",
    "creation": "2026-06-20 10:00:00",
    "type": "outgoing"
  }
]
```

---

### POST `/whatsapp/messages`

Send a WhatsApp message.

**Request body**
```json
{ "to": "+1234567890", "message": "Hello!", "reference_doctype": "CRM Lead", "reference_name": "LEAD-0001" }
```

**Response** `true`

---

### POST `/whatsapp/messages/:id/react`

Add an emoji reaction to a WhatsApp message.

**Request body**
```json
{ "emoji": "👍" }
```

**Response** `true`

---

### POST `/whatsapp/templates/send`

Send a WhatsApp template message.

**Request body**
```json
{ "template_name": "follow_up", "to": "+1234567890", "params": {} }
```

**Response** `true`

---

### GET `/integrations/telephony/status`

Whether a call integration (Twilio, Exotel, etc.) is enabled.

**Response**
```json
{ "integrations": {}, "default_calling_medium": "" }
```

When enabled:
```json
{
  "integrations": { "Twilio": { "enabled": true } },
  "default_calling_medium": "Twilio"
}
```

---

### POST `/integrations/exotel/call`

Initiate an Exotel outbound call.

**Request body**
```json
{ "to": "+1234567890", "from": "+0987654321" }
```

**Response**
```json
{ "call_id": "CALL-ABC123" }
```

---

## Statuses (read-only reference data)

The status dropdowns (Lead Status, Deal Status, Communication Status) are loaded
via `frappe.client.get_list`. Implement these as list endpoints or return them
from the `/meta` endpoint. Minimum shape:

```json
[
  { "name": "Open",      "color": "gray",  "position": 1, "type": "Open" },
  { "name": "Contacted", "color": "blue",  "position": 2, "type": "Replied" },
  { "name": "Qualified", "color": "green", "position": 4, "type": "Won" },
  { "name": "Unqualified","color": "red",  "position": 5, "type": "Lost" }
]
```

`type` must be one of: `"Open"` `"Replied"` `"Won"` `"Lost"` — drives status badge colours.

---

## Implementation checklist

**Day 1 — core CRM working:**
- [ ] Auth (login / logout)
- [ ] Users list
- [ ] Leads: data, CRUD, fields, quick-filters, layout, sidepanel, activities
- [ ] Deals: same as leads + contacts sub-route
- [ ] Contacts: data, CRUD, fields, layout, sidepanel, activities
- [ ] Views: CRUD
- [ ] Notifications: list + mark read
- [ ] Search
- [ ] Meta (field schema per doctype)
- [ ] Status reference data (Lead Status, Deal Status)

**Day 2 — full feature set:**
- [ ] Organizations: data, CRUD, layout
- [ ] Notes: data, CRUD, layout
- [ ] Tasks: data, CRUD
- [ ] Call Logs: data, CRUD
- [ ] Assignments (assign / unassign)
- [ ] Like toggle
- [ ] File upload / delete
- [ ] Dashboard charts

**Day 3 — settings & integrations:**
- [ ] Assignment rules
- [ ] Email accounts
- [ ] User management (invite, add, change password, signature)
- [ ] WhatsApp (if supported)
- [ ] Telephony (if supported)
