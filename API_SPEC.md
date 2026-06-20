# API Spec

This document defines every HTTP endpoint the CRM UI expects from your backend.

Implement these routes and set `VITE_BACKEND_URL=https://your-api.com` — the UI handles the rest.

---

## Conventions

- All endpoints are prefixed with `/api`
- Request bodies are JSON (`Content-Type: application/json`)
- All responses are JSON
- Auth via `Authorization: Bearer <token>` header on every request except login
- Filters are JSON-encoded arrays: `[["field", "operator", "value"], ...]`
- Operators: `=`, `!=`, `like`, `not like`, `in`, `not in`, `>`, `<`, `>=`, `<=`, `is`, `is not`

---

## Auth

### `POST /api/auth/login`

```json
// Request
{ "email": "user@example.com", "password": "secret" }

// Response
{ "token": "eyJ...", "user": "user@example.com" }
```

### `POST /api/auth/logout`

No body. Returns `200`.

---

## Users

### `GET /api/users`

Returns all CRM users.

```json
[
  {
    "name": "user@example.com",
    "full_name": "John Smith",
    "user_image": "https://...",
    "role": "Sales User"
  }
]
```

### `POST /api/users/invite`

```json
// Request
{ "email": "newuser@example.com" }

// Response
{ "message": "Invitation sent" }
```

### `POST /api/users/add`

Add existing users to CRM. Body: array of user emails.

### `POST /api/users/change-password`

```json
// Request
{ "old_password": "...", "new_password": "..." }
```

### `GET /api/users/me/signature`

Returns the current user's email signature HTML string.

---

## Leads

### `GET /api/leads/data`

Main list endpoint. Used for list, kanban, and group-by views.

Query params:

| Param | Type | Description |
|---|---|---|
| `filters` | JSON | Array of filter conditions |
| `order_by` | string | e.g. `"modified desc"` |
| `page_length` | number | Page size |
| `columns` | JSON | Column definitions for list view |
| `rows` | JSON | Field rows for list view |
| `view_type` | string | `"list"` \| `"kanban"` \| `"group_by"` |
| `group_by_field` | string | Field to group by |
| `column_field` | string | Kanban column field |
| `kanban_columns` | JSON | Kanban column definitions |
| `kanban_fields` | JSON | Fields to show on kanban cards |

```json
// Response
{
  "data": [
    {
      "name": "LEAD-0001",
      "first_name": "John",
      "last_name": "Smith",
      "email": "john@acme.com",
      "mobile_no": "+1234567890",
      "company_name": "Acme Corp",
      "status": "Open",
      "lead_owner": "sales@example.com",
      "modified": "2024-01-15 10:30:00",
      "creation": "2024-01-10 09:00:00"
    }
  ],
  "total_count": 142,
  "row_count": 20
}
```

### `GET /api/leads/fields`

Returns all fields defined on leads.

```json
[
  { "fieldname": "first_name", "label": "First Name", "fieldtype": "Data", "reqd": 1 },
  { "fieldname": "email", "label": "Email", "fieldtype": "Data" },
  { "fieldname": "status", "label": "Status", "fieldtype": "Select", "options": "Open\nContacted\nConverted" }
]
```

### `GET /api/leads/fields/filterable`

Returns fields that can be used as filters. Same shape as `/fields`.

### `GET /api/leads/fields/sortable`

Returns fields available for sorting. Same shape as `/fields`.

### `GET /api/leads/fields/group-by`

Returns fields available for group-by. Same shape as `/fields`.

### `GET /api/leads/quick-filters`

```json
["status", "lead_owner", "source"]
```

### `PUT /api/leads/quick-filters`

```json
// Request
{ "filters": ["status", "lead_owner", "source"] }
```

### `GET /api/leads/:name`

```json
{
  "name": "LEAD-0001",
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@acme.com",
  "mobile_no": "+1234567890",
  "company_name": "Acme Corp",
  "website": "https://acme.com",
  "status": "Open",
  "source": "Website",
  "industry": "Technology",
  "territory": "North America",
  "annual_revenue": 1000000,
  "no_of_employees": 50,
  "lead_owner": "sales@example.com",
  "notes": [],
  "modified": "2024-01-15 10:30:00",
  "creation": "2024-01-10 09:00:00"
}
```

### `POST /api/leads`

```json
// Request
{
  "doctype": "CRM Lead",
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@acme.com",
  "company_name": "Acme Corp"
}

// Response — the created lead
{ "name": "LEAD-0002", "first_name": "John", ... }
```

### `PATCH /api/leads/:name`

Update one or more fields.

```json
// Request
{ "status": "Contacted" }
// or multiple fields
{ "status": "Contacted", "lead_owner": "newowner@example.com" }

// Response — updated lead
{ "name": "LEAD-0001", "status": "Contacted", ... }
```

### `DELETE /api/leads/:name`

Returns `200`.

### `GET /api/leads/:name/activities`

See [Activities](#activities).

### `GET /api/leads/:name/assigned-users`

```json
["user1@example.com", "user2@example.com"]
```

### `POST /api/leads/:name/assign`

```json
// Request
{ "users": ["user1@example.com"] }
```

### `DELETE /api/leads/:name/assignments`

Remove all assignments.

### `GET /api/leads/:name/linked-docs`

Returns documents linked to this lead (emails, calls, etc.).

### `POST /api/leads/:name/like`

```json
// Request
{ "liked": true }
```

### `GET /api/leads/layout`

Returns the form field layout for leads.

```json
{
  "tabs": [
    {
      "label": "Details",
      "sections": [
        {
          "label": "Contact Info",
          "columns": [
            [
              { "fieldname": "first_name", "fieldtype": "Data", "label": "First Name" },
              { "fieldname": "last_name",  "fieldtype": "Data", "label": "Last Name" }
            ]
          ]
        }
      ]
    }
  ]
}
```

### `GET /api/leads/layout/sidepanel`

Returns the sidepanel sections layout. Same structure as `/layout`.

---

## Deals

Same endpoints as Leads, at `/api/deals/*`.

### `POST /api/deals`

```json
// Request
{
  "lead": "LEAD-0001",
  "deal_name": "Acme Corp - Enterprise",
  "contact": "CONT-0001",
  "organization": "ORG-0001"
}

// Response — the created deal
{ "name": "DEAL-0001", ... }
```

### `GET /api/deals/:name/contacts`

```json
[
  { "contact": "CONT-0001", "full_name": "John Smith", "email": "john@acme.com" }
]
```

---

## Contacts

Same list/CRUD endpoints as Leads, at `/api/contacts/*`.

### `GET /api/contacts/search`

Query param: `query` (string to match against name/email).

```json
[
  { "name": "CONT-0001", "full_name": "John Smith", "email": "john@acme.com" }
]
```

### `GET /api/contacts/:name/deals`

```json
[
  { "name": "DEAL-0001", "deal_name": "Acme Corp - Enterprise", "status": "Qualification" }
]
```

---

## Organizations

Same list/CRUD endpoints at `/api/organizations/*`.

### `GET /api/organizations/list`

Lightweight list for dropdowns.

```json
[
  { "name": "ORG-0001", "organization_name": "Acme Corp" }
]
```

---

## Views

### `GET /api/views`

Query param: `doctype` (e.g. `CRM Lead`).

```json
[
  {
    "name": "VIEW-0001",
    "label": "My Open Leads",
    "type": "list",
    "doctype": "CRM Lead",
    "filters": "[['status','=','Open'],['lead_owner','=','me']]",
    "order_by": "modified desc",
    "columns": "...",
    "is_default": 1,
    "is_public": 0
  }
]
```

### `POST /api/views`

Create a new saved view.

### `PATCH /api/views/:name`

Update a view.

### `DELETE /api/views/:name`

---

## Activities

### `GET /api/:doctype/:name/activities`

Where `:doctype` is `leads` or `deals`.

```json
{
  "activities": [
    {
      "type": "activity",
      "activity_type": "Note",
      "content": "Called the client, interested in enterprise plan",
      "creation": "2024-01-15 10:30:00",
      "owner": "sales@example.com"
    },
    {
      "type": "communication",
      "communication_type": "Email",
      "subject": "Follow up",
      "content": "<p>Hi John...</p>",
      "sent_or_received": "Sent",
      "creation": "2024-01-14 09:00:00",
      "owner": "sales@example.com"
    },
    {
      "type": "call_log",
      "id": "CALL-0001",
      "duration": 180,
      "status": "Completed",
      "from": "+1234567890",
      "to": "+0987654321",
      "creation": "2024-01-13 15:00:00"
    }
  ],
  "versions": [...],
  "last_email": {...},
  "last_communication": {...}
}
```

---

## Notifications

### `GET /api/notifications`

```json
[
  {
    "name": "NOTIF-0001",
    "type": "Lead",
    "document": "LEAD-0001",
    "message": "New lead assigned to you",
    "read": 0,
    "creation": "2024-01-15 10:30:00"
  }
]
```

### `PATCH /api/notifications/:name/read`

Mark a notification as read. Returns `200`.

---

## Dashboard

### `GET /api/dashboards/:name`

```json
{
  "name": "default",
  "charts": [
    { "name": "leads-by-status", "label": "Leads by Status", "type": "donut", "width": "half" }
  ]
}
```

### `GET /api/dashboards/:name/charts/:chart`

Returns chart data.

```json
{
  "labels": ["Open", "Contacted", "Converted"],
  "datasets": [{ "values": [42, 18, 7] }]
}
```

### `POST /api/dashboards/:name/reset`

Reset dashboard to default layout.

---

## Search

### `GET /api/search`

Global link search — used by link fields throughout the UI.

Query params: `doctype`, `query`, `filters` (optional JSON).

```json
[
  { "value": "LEAD-0001", "label": "John Smith", "description": "Acme Corp" }
]
```

---

## Files

### `POST /api/method/upload_file`

File uploads use multipart form data. This path is frappe-ui's default and is proxied to your backend automatically via Vite (dev) and Nginx (prod).

```
Content-Type: multipart/form-data

Fields:
  file          — the file binary
  is_private    — 0 or 1
  doctype       — e.g. "CRM Lead"
  docname       — e.g. "LEAD-0001"
  fieldname     — e.g. "image"
```

```json
// Response
{
  "message": {
    "name": "FILE-0001",
    "file_url": "/files/photo.jpg",
    "file_name": "photo.jpg",
    "is_private": 0
  }
}
```

### `GET /api/files/defaults`

```json
{
  "max_file_size": 10485760,
  "allowed_extensions": ["jpg", "png", "pdf", "xlsx"]
}
```

### `DELETE /api/files/:name`

---

## Call Logs

### `GET /api/call-logs/:name`

```json
{
  "name": "CALL-0001",
  "from": "+1234567890",
  "to": "+0987654321",
  "duration": 180,
  "status": "Completed",
  "recording_url": "https://...",
  "creation": "2024-01-15 10:30:00"
}
```

---

## Assignment Rules

### `GET /api/assignment-rules`

```json
[
  { "name": "AR-0001", "document_type": "CRM Lead", "rule": "Round Robin", "enabled": 1 }
]
```

### `POST /api/assignment-rules/:name/duplicate`

---

## Settings

### `POST /api/settings/email-accounts`

Create email account for sending from CRM.

---

## Optional Integrations

These endpoints are only needed if you enable the respective integration.

### WhatsApp

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/integrations/whatsapp/status` | Returns `{ "enabled": true }` |
| `GET` | `/api/integrations/whatsapp/installed` | Returns `{ "installed": true }` |
| `GET` | `/api/leads/:name/whatsapp` | WhatsApp messages for a lead |
| `POST` | `/api/whatsapp/messages` | Send a message |
| `POST` | `/api/whatsapp/messages/:id/react` | React to a message |
| `POST` | `/api/whatsapp/templates/send` | Send a template message |

### Telephony

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/integrations/telephony/status` | Returns `{ "enabled": true }` |
| `GET` | `/api/contacts/by-phone/:number` | Find contact by phone number |
| `POST` | `/api/call-logs/:name/notes` | Add a note to a call log |
| `POST` | `/api/call-logs/:name/tasks` | Add a task to a call log |
| `POST` | `/api/integrations/exotel/call` | Initiate a call via Exotel |

---

## Minimal Implementation

To get a working CRM with leads and deals, implement only these endpoints first:

1. `POST /api/auth/login`
2. `POST /api/auth/logout`
3. `GET /api/users`
4. `GET /api/leads/data`
5. `GET /api/leads/fields`
6. `GET /api/leads/fields/filterable`
7. `GET /api/leads/fields/sortable`
8. `GET /api/leads/quick-filters`
9. `GET /api/leads/:name`
10. `POST /api/leads`
11. `PATCH /api/leads/:name`
12. `DELETE /api/leads/:name`
13. `GET /api/leads/layout`
14. `GET /api/leads/layout/sidepanel`
15. `GET /api/views`
16. `GET /api/deals/data` (same structure as leads)
17. `GET /api/deals/:name`
18. `POST /api/deals`
19. `PATCH /api/deals/:name`

That's 19 endpoints for a functional lead and deal management CRM.
