// Field definitions and form layouts for leads and deals

export const LEAD_STATUSES = [
  { name: 'Open', color: 'gray', position: 1, type: 'Open' },
  { name: 'Contacted', color: 'blue', position: 2, type: 'Replied' },
  { name: 'Nurturing', color: 'orange', position: 3, type: 'Replied' },
  { name: 'Qualified', color: 'green', position: 4, type: 'Won' },
  { name: 'Unqualified', color: 'red', position: 5, type: 'Lost' },
]

export const DEAL_STATUSES = [
  { name: 'Qualification', color: 'gray', position: 1, type: 'Open' },
  { name: 'Demo / Discovery', color: 'blue', position: 2, type: 'Open' },
  { name: 'Proposal / Price Quote', color: 'orange', position: 3, type: 'Open' },
  { name: 'Negotiation / Review', color: 'yellow', position: 4, type: 'Open' },
  { name: 'Closed Won', color: 'green', position: 5, type: 'Won' },
  { name: 'Closed Lost', color: 'red', position: 6, type: 'Lost' },
]

export const COMMUNICATION_STATUSES = [
  { name: 'Open' },
  { name: 'Replied' },
]

export const LEAD_FIELDS = [
  { fieldname: 'first_name', label: 'First Name', fieldtype: 'Data', reqd: 1 },
  { fieldname: 'last_name', label: 'Last Name', fieldtype: 'Data' },
  { fieldname: 'email', label: 'Email', fieldtype: 'Data' },
  { fieldname: 'mobile_no', label: 'Mobile No', fieldtype: 'Data' },
  { fieldname: 'company_name', label: 'Company', fieldtype: 'Data' },
  { fieldname: 'website', label: 'Website', fieldtype: 'Data' },
  { fieldname: 'status', label: 'Status', fieldtype: 'Select', options: 'Open\nContacted\nNurturing\nQualified\nUnqualified' },
  { fieldname: 'source', label: 'Source', fieldtype: 'Select', options: 'Website\nCold Calling\nEmail Campaign\nLinkedIn\nReferral\nTrade Show' },
  { fieldname: 'industry', label: 'Industry', fieldtype: 'Data' },
  { fieldname: 'territory', label: 'Territory', fieldtype: 'Data' },
  { fieldname: 'annual_revenue', label: 'Annual Revenue', fieldtype: 'Currency' },
  { fieldname: 'no_of_employees', label: 'No of Employees', fieldtype: 'Int' },
  { fieldname: 'lead_owner', label: 'Lead Owner', fieldtype: 'Link', options: 'User' },
  { fieldname: 'creation', label: 'Created', fieldtype: 'Datetime' },
  { fieldname: 'modified', label: 'Modified', fieldtype: 'Datetime' },
]

export const DEAL_FIELDS = [
  { fieldname: 'deal_name', label: 'Deal Name', fieldtype: 'Data', reqd: 1 },
  { fieldname: 'status', label: 'Status', fieldtype: 'Select', options: 'Qualification\nDemo / Discovery\nProposal / Price Quote\nNegotiation / Review\nClosed Won\nClosed Lost' },
  { fieldname: 'contact', label: 'Contact', fieldtype: 'Link', options: 'Contact' },
  { fieldname: 'organization', label: 'Organization', fieldtype: 'Link', options: 'CRM Organization' },
  { fieldname: 'deal_owner', label: 'Deal Owner', fieldtype: 'Link', options: 'User' },
  { fieldname: 'expected_contract_value', label: 'Expected Value', fieldtype: 'Currency' },
  { fieldname: 'currency', label: 'Currency', fieldtype: 'Select', options: 'USD\nEUR\nGBP\nAED' },
  { fieldname: 'probability', label: 'Probability (%)', fieldtype: 'Percent' },
  { fieldname: 'close_date', label: 'Expected Close Date', fieldtype: 'Date' },
  { fieldname: 'industry', label: 'Industry', fieldtype: 'Data' },
  { fieldname: 'territory', label: 'Territory', fieldtype: 'Data' },
  { fieldname: 'website', label: 'Website', fieldtype: 'Data' },
  { fieldname: 'annual_revenue', label: 'Annual Revenue', fieldtype: 'Currency' },
  { fieldname: 'no_of_employees', label: 'No of Employees', fieldtype: 'Int' },
  { fieldname: 'creation', label: 'Created', fieldtype: 'Datetime' },
  { fieldname: 'modified', label: 'Modified', fieldtype: 'Datetime' },
]

export const CONTACT_FIELDS = [
  { fieldname: 'first_name', label: 'First Name', fieldtype: 'Data', reqd: 1 },
  { fieldname: 'last_name', label: 'Last Name', fieldtype: 'Data' },
  { fieldname: 'email', label: 'Email', fieldtype: 'Data' },
  { fieldname: 'mobile_no', label: 'Mobile No', fieldtype: 'Data' },
  { fieldname: 'company_name', label: 'Company', fieldtype: 'Data' },
  { fieldname: 'job_title', label: 'Job Title', fieldtype: 'Data' },
  { fieldname: 'status', label: 'Status', fieldtype: 'Select', options: 'Open\nReplied' },
  { fieldname: 'creation', label: 'Created', fieldtype: 'Datetime' },
  { fieldname: 'modified', label: 'Modified', fieldtype: 'Datetime' },
]

export const NOTE_FIELDS = [
  { fieldname: 'title', label: 'Title', fieldtype: 'Data', reqd: 1 },
  { fieldname: 'content', label: 'Content', fieldtype: 'Long Text' },
  { fieldname: 'reference_doctype', label: 'Reference Type', fieldtype: 'Link', options: 'DocType' },
  { fieldname: 'reference_docname', label: 'Reference', fieldtype: 'Dynamic Link', options: 'reference_doctype' },
  { fieldname: 'creation', label: 'Created', fieldtype: 'Datetime' },
  { fieldname: 'modified', label: 'Modified', fieldtype: 'Datetime' },
]

export const NOTE_LAYOUT = [
  {
    label: 'Details',
    name: 'details',
    sections: [
      {
        label: '',
        name: 'note_content',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'title', fieldtype: 'Data', label: 'Title', reqd: 1 },
              { fieldname: 'content', fieldtype: 'Long Text', label: 'Content' },
            ],
          },
        ],
      },
    ],
  },
]

// frappe-ui's FormControl Select expects options as an array, not a \n string
export const LEAD_QUICK_FILTERS = [
  { fieldname: 'status', label: 'Status', fieldtype: 'Select', options: ['Open', 'Contacted', 'Nurturing', 'Qualified', 'Unqualified'] },
  { fieldname: 'lead_owner', label: 'Lead Owner', fieldtype: 'Link', options: 'User' },
  { fieldname: 'source', label: 'Source', fieldtype: 'Select', options: ['Website', 'Cold Calling', 'Email Campaign', 'LinkedIn', 'Referral', 'Trade Show'] },
]
export const DEAL_QUICK_FILTERS = [
  { fieldname: 'status', label: 'Status', fieldtype: 'Select', options: ['Qualification', 'Demo / Discovery', 'Proposal / Price Quote', 'Negotiation / Review', 'Closed Won', 'Closed Lost'] },
  { fieldname: 'deal_owner', label: 'Deal Owner', fieldtype: 'Link', options: 'User' },
]
export const CONTACT_QUICK_FILTERS = [
  { fieldname: 'status', label: 'Status', fieldtype: 'Select', options: ['Open', 'Replied'] },
]

// Layouts are plain arrays of tab objects — this is what get_fields_layout returns
// as response.message in the real Frappe API. DoctypeModal passes layout.data
// directly to FieldLayout's :tabs prop, so the array must be the top-level value.

// Layout tabs: columns are objects { name, fields: [...] }, NOT nested arrays.
// Section.vue iterates column.fields, Column.vue renders each field.
export const LEAD_LAYOUT = [
  {
    label: 'Details',
    name: 'details',
    sections: [
      {
        label: 'Contact Info',
        name: 'contact_info',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'first_name', fieldtype: 'Data', label: 'First Name' },
              { fieldname: 'last_name', fieldtype: 'Data', label: 'Last Name' },
              { fieldname: 'email', fieldtype: 'Data', label: 'Email' },
              { fieldname: 'mobile_no', fieldtype: 'Data', label: 'Mobile No' },
            ],
          },
          {
            name: 'col_2',
            fields: [
              { fieldname: 'company_name', fieldtype: 'Data', label: 'Company' },
              { fieldname: 'website', fieldtype: 'Data', label: 'Website' },
              { fieldname: 'source', fieldtype: 'Select', label: 'Source', options: 'Website\nCold Calling\nEmail Campaign\nLinkedIn\nReferral\nTrade Show' },
              { fieldname: 'industry', fieldtype: 'Data', label: 'Industry' },
            ],
          },
        ],
      },
      {
        label: 'Company',
        name: 'company',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'annual_revenue', fieldtype: 'Currency', label: 'Annual Revenue' },
              { fieldname: 'no_of_employees', fieldtype: 'Int', label: 'No of Employees' },
            ],
          },
          {
            name: 'col_2',
            fields: [
              { fieldname: 'territory', fieldtype: 'Data', label: 'Territory' },
            ],
          },
        ],
      },
    ],
  },
]

// Sidepanel sections: flat array of section objects. Each section has columns[0].fields.
// This is the shape SidePanelLayout.vue expects from get_sidepanel_sections.
export const LEAD_SIDEPANEL = [
  {
    label: 'Details',
    name: 'details',
    opened: true,
    columns: [
      {
        fields: [
          { fieldname: 'lead_owner', fieldtype: 'Link', label: 'Lead Owner', options: 'User' },
          { fieldname: 'status', fieldtype: 'Select', label: 'Status', options: 'Open\nContacted\nNurturing\nQualified\nUnqualified' },
          { fieldname: 'source', fieldtype: 'Select', label: 'Source', options: 'Website\nCold Calling\nEmail Campaign\nLinkedIn\nReferral\nTrade Show' },
          { fieldname: 'mobile_no', fieldtype: 'Data', label: 'Mobile No' },
          { fieldname: 'email', fieldtype: 'Data', label: 'Email' },
          { fieldname: 'company_name', fieldtype: 'Data', label: 'Company' },
        ],
      },
    ],
  },
]

export const DEAL_LAYOUT = [
  {
    label: 'Details',
    name: 'details',
    sections: [
      {
        label: 'Deal Info',
        name: 'deal_info',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'deal_name', fieldtype: 'Data', label: 'Deal Name' },
              { fieldname: 'status', fieldtype: 'Select', label: 'Status', options: 'Qualification\nDemo / Discovery\nProposal / Price Quote\nNegotiation / Review\nClosed Won\nClosed Lost' },
              { fieldname: 'expected_contract_value', fieldtype: 'Currency', label: 'Expected Value' },
              { fieldname: 'currency', fieldtype: 'Select', label: 'Currency', options: 'USD\nEUR\nGBP\nAED' },
            ],
          },
          {
            name: 'col_2',
            fields: [
              { fieldname: 'close_date', fieldtype: 'Date', label: 'Expected Close Date' },
              { fieldname: 'probability', fieldtype: 'Percent', label: 'Probability (%)' },
              { fieldname: 'industry', fieldtype: 'Data', label: 'Industry' },
              { fieldname: 'territory', fieldtype: 'Data', label: 'Territory' },
            ],
          },
        ],
      },
      {
        label: 'Company',
        name: 'company',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'website', fieldtype: 'Data', label: 'Website' },
              { fieldname: 'annual_revenue', fieldtype: 'Currency', label: 'Annual Revenue' },
              { fieldname: 'no_of_employees', fieldtype: 'Int', label: 'No of Employees' },
            ],
          },
        ],
      },
    ],
  },
]

export const DEAL_SIDEPANEL = [
  {
    label: 'Details',
    name: 'details',
    opened: true,
    columns: [
      {
        fields: [
          { fieldname: 'deal_owner', fieldtype: 'Link', label: 'Deal Owner', options: 'User' },
          { fieldname: 'status', fieldtype: 'Select', label: 'Status', options: 'Qualification\nDemo / Discovery\nProposal / Price Quote\nNegotiation / Review\nClosed Won\nClosed Lost' },
          { fieldname: 'contact', fieldtype: 'Link', label: 'Contact', options: 'Contact' },
          { fieldname: 'organization', fieldtype: 'Link', label: 'Organization', options: 'CRM Organization' },
          { fieldname: 'expected_contract_value', fieldtype: 'Currency', label: 'Expected Value' },
          { fieldname: 'close_date', fieldtype: 'Date', label: 'Expected Close Date' },
        ],
      },
    ],
  },
]

export const CONTACT_SIDEPANEL = [
  {
    label: 'Details',
    name: 'details',
    opened: true,
    columns: [
      {
        fields: [
          { fieldname: 'email_id', fieldtype: 'Data', label: 'Email' },
          { fieldname: 'mobile_no', fieldtype: 'Data', label: 'Mobile No' },
          { fieldname: 'company_name', fieldtype: 'Data', label: 'Company' },
          { fieldname: 'job_title', fieldtype: 'Data', label: 'Job Title' },
          { fieldname: 'status', fieldtype: 'Select', label: 'Status', options: 'Open\nReplied' },
        ],
      },
    ],
  },
]

export const ORG_SIDEPANEL = [
  {
    label: 'Details',
    name: 'details',
    opened: true,
    columns: [
      {
        fields: [
          { fieldname: 'organization_name', fieldtype: 'Data', label: 'Organization Name' },
          { fieldname: 'website', fieldtype: 'Data', label: 'Website' },
          { fieldname: 'industry', fieldtype: 'Data', label: 'Industry' },
          { fieldname: 'annual_revenue', fieldtype: 'Currency', label: 'Annual Revenue' },
          { fieldname: 'no_of_employees', fieldtype: 'Int', label: 'No of Employees' },
          { fieldname: 'territory', fieldtype: 'Data', label: 'Territory' },
          { fieldname: 'address', fieldtype: 'Data', label: 'Address' },
        ],
      },
    ],
  },
]

export const CALL_LOG_LAYOUT = [
  {
    label: 'Details',
    name: 'details',
    sections: [
      {
        label: 'Call Info',
        name: 'call_info',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'from', fieldtype: 'Data', label: 'From' },
              { fieldname: 'to', fieldtype: 'Data', label: 'To' },
              { fieldname: 'status', fieldtype: 'Select', label: 'Status', options: 'Completed\nNo Answer\nBusy\nFailed' },
              { fieldname: 'duration', fieldtype: 'Int', label: 'Duration (s)' },
            ],
          },
          {
            name: 'col_2',
            fields: [
              { fieldname: 'note', fieldtype: 'Long Text', label: 'Note' },
            ],
          },
        ],
      },
    ],
  },
]

// ─── Task / CallLog field lists ───────────────────────────────────────────────

export const TASK_FIELDS = [
  { fieldname: 'title', label: 'Title', fieldtype: 'Data', reqd: 1 },
  { fieldname: 'description', label: 'Description', fieldtype: 'Long Text' },
  { fieldname: 'status', label: 'Status', fieldtype: 'Select', options: 'Backlog\nTodo\nIn Progress\nDone\nCancelled' },
  { fieldname: 'priority', label: 'Priority', fieldtype: 'Select', options: 'Low\nMedium\nHigh' },
  { fieldname: 'assigned_to', label: 'Assigned To', fieldtype: 'Link', options: 'User' },
  { fieldname: 'due_date', label: 'Due Date', fieldtype: 'Date' },
  { fieldname: 'reference_doctype', label: 'Reference Type', fieldtype: 'Link', options: 'DocType' },
  { fieldname: 'reference_docname', label: 'Reference', fieldtype: 'Dynamic Link', options: 'reference_doctype' },
  { fieldname: 'creation', label: 'Created', fieldtype: 'Datetime' },
  { fieldname: 'modified', label: 'Modified', fieldtype: 'Datetime' },
]

export const CALL_LOG_FIELDS = [
  { fieldname: 'from', label: 'From', fieldtype: 'Data' },
  { fieldname: 'to', label: 'To', fieldtype: 'Data' },
  { fieldname: 'status', label: 'Status', fieldtype: 'Select', options: 'Completed\nNo Answer\nBusy\nFailed' },
  { fieldname: 'duration', label: 'Duration (s)', fieldtype: 'Int' },
  { fieldname: 'note', label: 'Note', fieldtype: 'Long Text' },
  { fieldname: 'creation', label: 'Created', fieldtype: 'Datetime' },
  { fieldname: 'modified', label: 'Modified', fieldtype: 'Datetime' },
]

// ─── Quick Entry layouts (used by LeadModal, DealModal, ContactModal, DoctypeModal) ──

export const LEAD_QUICK_ENTRY = [
  {
    label: 'Details',
    name: 'details',
    sections: [
      {
        label: '',
        name: 'main',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'first_name', fieldtype: 'Data', label: 'First Name', reqd: 1 },
              { fieldname: 'last_name', fieldtype: 'Data', label: 'Last Name' },
              { fieldname: 'email', fieldtype: 'Data', label: 'Email' },
              { fieldname: 'mobile_no', fieldtype: 'Data', label: 'Mobile No' },
            ],
          },
          {
            name: 'col_2',
            fields: [
              { fieldname: 'company_name', fieldtype: 'Data', label: 'Company' },
              { fieldname: 'source', fieldtype: 'Select', label: 'Source', options: 'Website\nCold Calling\nEmail Campaign\nLinkedIn\nReferral\nTrade Show' },
              { fieldname: 'status', fieldtype: 'Select', label: 'Status', options: 'Open\nContacted\nNurturing\nQualified\nUnqualified' },
              { fieldname: 'lead_owner', fieldtype: 'Link', label: 'Lead Owner', options: 'User' },
            ],
          },
        ],
      },
    ],
  },
]

export const DEAL_QUICK_ENTRY = [
  {
    label: 'Details',
    name: 'details',
    sections: [
      {
        label: '',
        name: 'main',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'deal_name', fieldtype: 'Data', label: 'Deal Name', reqd: 1 },
              { fieldname: 'status', fieldtype: 'Select', label: 'Status', options: 'Qualification\nDemo / Discovery\nProposal / Price Quote\nNegotiation / Review\nClosed Won\nClosed Lost' },
              { fieldname: 'expected_contract_value', fieldtype: 'Currency', label: 'Expected Value' },
              { fieldname: 'close_date', fieldtype: 'Date', label: 'Expected Close Date' },
            ],
          },
          {
            name: 'col_2',
            fields: [
              { fieldname: 'deal_owner', fieldtype: 'Link', label: 'Deal Owner', options: 'User' },
              { fieldname: 'industry', fieldtype: 'Data', label: 'Industry' },
              { fieldname: 'territory', fieldtype: 'Data', label: 'Territory' },
            ],
          },
        ],
      },
    ],
  },
]

export const CONTACT_QUICK_ENTRY = [
  {
    label: 'Details',
    name: 'details',
    sections: [
      {
        label: '',
        name: 'main',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'first_name', fieldtype: 'Data', label: 'First Name', reqd: 1 },
              { fieldname: 'last_name', fieldtype: 'Data', label: 'Last Name' },
              { fieldname: 'email_id', fieldtype: 'Data', label: 'Email' },
              { fieldname: 'mobile_no', fieldtype: 'Data', label: 'Mobile No' },
            ],
          },
          {
            name: 'col_2',
            fields: [
              { fieldname: 'company_name', fieldtype: 'Data', label: 'Company' },
              { fieldname: 'job_title', fieldtype: 'Data', label: 'Job Title' },
            ],
          },
        ],
      },
    ],
  },
]

export const TASK_QUICK_ENTRY = [
  {
    label: 'Details',
    name: 'details',
    sections: [
      {
        label: '',
        name: 'main',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'title', fieldtype: 'Data', label: 'Title', reqd: 1 },
              { fieldname: 'description', fieldtype: 'Long Text', label: 'Description' },
              { fieldname: 'status', fieldtype: 'Select', label: 'Status', options: 'Backlog\nTodo\nIn Progress\nDone\nCancelled' },
              { fieldname: 'priority', fieldtype: 'Select', label: 'Priority', options: 'Low\nMedium\nHigh' },
              { fieldname: 'assigned_to', fieldtype: 'Link', label: 'Assigned To', options: 'User' },
              { fieldname: 'due_date', fieldtype: 'Date', label: 'Due Date' },
            ],
          },
        ],
      },
    ],
  },
]

export const ORG_QUICK_ENTRY = [
  {
    label: 'Details',
    name: 'details',
    sections: [
      {
        label: '',
        name: 'main',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'organization_name', fieldtype: 'Data', label: 'Organization Name', reqd: 1 },
              { fieldname: 'website', fieldtype: 'Data', label: 'Website' },
              { fieldname: 'industry', fieldtype: 'Data', label: 'Industry' },
            ],
          },
          {
            name: 'col_2',
            fields: [
              { fieldname: 'annual_revenue', fieldtype: 'Currency', label: 'Annual Revenue' },
              { fieldname: 'no_of_employees', fieldtype: 'Int', label: 'No of Employees' },
              { fieldname: 'territory', fieldtype: 'Data', label: 'Territory' },
            ],
          },
        ],
      },
    ],
  },
]

export const CALL_LOG_QUICK_ENTRY = [
  {
    label: 'Details',
    name: 'details',
    sections: [
      {
        label: '',
        name: 'main',
        columns: [
          {
            name: 'col_1',
            fields: [
              { fieldname: 'from', fieldtype: 'Data', label: 'From' },
              { fieldname: 'to', fieldtype: 'Data', label: 'To' },
              { fieldname: 'status', fieldtype: 'Select', label: 'Status', options: 'Completed\nNo Answer\nBusy\nFailed' },
              { fieldname: 'duration', fieldtype: 'Int', label: 'Duration (s)' },
              { fieldname: 'note', fieldtype: 'Long Text', label: 'Note' },
            ],
          },
        ],
      },
    ],
  },
]
