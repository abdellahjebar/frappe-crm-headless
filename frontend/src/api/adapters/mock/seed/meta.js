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

export const LEAD_QUICK_FILTERS = ['status', 'lead_owner', 'source']
export const DEAL_QUICK_FILTERS = ['status', 'deal_owner']
export const CONTACT_QUICK_FILTERS = ['status']

export const LEAD_LAYOUT = {
  tabs: [
    {
      label: 'Details',
      sections: [
        {
          label: 'Contact Info',
          columns: [
            [
              { fieldname: 'first_name', fieldtype: 'Data', label: 'First Name' },
              { fieldname: 'last_name', fieldtype: 'Data', label: 'Last Name' },
              { fieldname: 'email', fieldtype: 'Data', label: 'Email' },
              { fieldname: 'mobile_no', fieldtype: 'Data', label: 'Mobile No' },
            ],
            [
              { fieldname: 'company_name', fieldtype: 'Data', label: 'Company' },
              { fieldname: 'website', fieldtype: 'Data', label: 'Website' },
              { fieldname: 'source', fieldtype: 'Select', label: 'Source' },
              { fieldname: 'industry', fieldtype: 'Data', label: 'Industry' },
            ],
          ],
        },
        {
          label: 'Company',
          columns: [
            [
              { fieldname: 'annual_revenue', fieldtype: 'Currency', label: 'Annual Revenue' },
              { fieldname: 'no_of_employees', fieldtype: 'Int', label: 'No of Employees' },
            ],
            [
              { fieldname: 'territory', fieldtype: 'Data', label: 'Territory' },
            ],
          ],
        },
      ],
    },
  ],
}

export const LEAD_SIDEPANEL = {
  tabs: [
    {
      label: 'Overview',
      sections: [
        {
          label: 'Details',
          columns: [
            [
              { fieldname: 'lead_owner', fieldtype: 'Link', label: 'Lead Owner' },
              { fieldname: 'status', fieldtype: 'Select', label: 'Status' },
              { fieldname: 'source', fieldtype: 'Select', label: 'Source' },
            ],
          ],
        },
      ],
    },
  ],
}

export const DEAL_LAYOUT = {
  tabs: [
    {
      label: 'Details',
      sections: [
        {
          label: 'Deal Info',
          columns: [
            [
              { fieldname: 'deal_name', fieldtype: 'Data', label: 'Deal Name' },
              { fieldname: 'status', fieldtype: 'Select', label: 'Status' },
              { fieldname: 'expected_contract_value', fieldtype: 'Currency', label: 'Expected Value' },
              { fieldname: 'currency', fieldtype: 'Select', label: 'Currency' },
            ],
            [
              { fieldname: 'close_date', fieldtype: 'Date', label: 'Expected Close Date' },
              { fieldname: 'probability', fieldtype: 'Percent', label: 'Probability (%)' },
              { fieldname: 'industry', fieldtype: 'Data', label: 'Industry' },
              { fieldname: 'territory', fieldtype: 'Data', label: 'Territory' },
            ],
          ],
        },
        {
          label: 'Company',
          columns: [
            [
              { fieldname: 'website', fieldtype: 'Data', label: 'Website' },
              { fieldname: 'annual_revenue', fieldtype: 'Currency', label: 'Annual Revenue' },
              { fieldname: 'no_of_employees', fieldtype: 'Int', label: 'No of Employees' },
            ],
          ],
        },
      ],
    },
  ],
}

export const DEAL_SIDEPANEL = {
  tabs: [
    {
      label: 'Overview',
      sections: [
        {
          label: 'Details',
          columns: [
            [
              { fieldname: 'deal_owner', fieldtype: 'Link', label: 'Deal Owner' },
              { fieldname: 'status', fieldtype: 'Select', label: 'Status' },
              { fieldname: 'contact', fieldtype: 'Link', label: 'Contact' },
              { fieldname: 'organization', fieldtype: 'Link', label: 'Organization' },
            ],
          ],
        },
      ],
    },
  ],
}
