// Keyed by doctype+name: activities['leads']['LEAD-0001']
export const ACTIVITIES = {
  leads: {
    'LEAD-0001': {
      activities: [
        {
          type: 'activity',
          activity_type: 'Note',
          content: 'Initial discovery call went well. John is interested in the enterprise tier. Mentioned their current solution is slow and hard to scale.',
          creation: '2024-01-12 10:30:00',
          owner: 'james.okafor@nexacrm.io',
        },
        {
          type: 'communication',
          communication_type: 'Email',
          subject: 'Following up on our call',
          content: '<p>Hi John, great speaking with you today. I\'ll send over the enterprise proposal by Friday.</p>',
          sent_or_received: 'Sent',
          creation: '2024-01-12 14:00:00',
          owner: 'james.okafor@nexacrm.io',
        },
        {
          type: 'activity',
          activity_type: 'Note',
          content: 'John replied and confirmed Friday works for the proposal review. Set up a follow-up call for 2024-01-19.',
          creation: '2024-01-14 09:00:00',
          owner: 'james.okafor@nexacrm.io',
        },
      ],
      versions: [],
      last_email: {
        subject: 'Following up on our call',
        creation: '2024-01-12 14:00:00',
      },
      last_communication: {
        communication_type: 'Email',
        creation: '2024-01-12 14:00:00',
      },
    },
    'LEAD-0002': {
      activities: [
        {
          type: 'call_log',
          id: 'CALL-0001',
          duration: 240,
          status: 'Completed',
          from: '+44 20 7946 0102',
          to: '+1 800 555 0001',
          creation: '2024-01-18 15:00:00',
        },
        {
          type: 'activity',
          activity_type: 'Note',
          content: 'Elena has budget approval for Q2. Needs sign-off from legal before proceeding. Schedule legal review walkthrough.',
          creation: '2024-01-18 15:45:00',
          owner: 'priya.sharma@nexacrm.io',
        },
      ],
      versions: [],
      last_email: null,
      last_communication: {
        communication_type: 'Phone',
        creation: '2024-01-18 15:00:00',
      },
    },
    'LEAD-0004': {
      activities: [
        {
          type: 'communication',
          communication_type: 'Email',
          subject: 'CRM Compliance Module — Overview',
          content: '<p>Hi Aisha, please find attached the compliance module overview for Meridian\'s review.</p>',
          sent_or_received: 'Sent',
          creation: '2024-02-05 09:30:00',
          owner: 'james.okafor@nexacrm.io',
        },
        {
          type: 'activity',
          activity_type: 'Note',
          content: 'Aisha forwarded docs to their compliance officer. Expecting feedback within 2 weeks.',
          creation: '2024-02-07 11:00:00',
          owner: 'james.okafor@nexacrm.io',
        },
        {
          type: 'call_log',
          id: 'CALL-0002',
          duration: 360,
          status: 'Completed',
          from: '+1 212 555 0104',
          to: '+1 800 555 0001',
          creation: '2024-02-20 14:00:00',
        },
      ],
      versions: [],
      last_email: {
        subject: 'CRM Compliance Module — Overview',
        creation: '2024-02-05 09:30:00',
      },
      last_communication: {
        communication_type: 'Phone',
        creation: '2024-02-20 14:00:00',
      },
    },
  },
  deals: {
    'DEAL-0001': {
      activities: [
        {
          type: 'activity',
          activity_type: 'Note',
          content: 'Deal created from LEAD-0001. John confirmed interest in enterprise licensing. 250-seat minimum.',
          creation: '2024-03-01 09:30:00',
          owner: 'james.okafor@nexacrm.io',
        },
        {
          type: 'communication',
          communication_type: 'Email',
          subject: 'Enterprise Proposal — Acme Corp',
          content: '<p>Hi John, please find your tailored enterprise proposal attached. Happy to walk through it on a call.</p>',
          sent_or_received: 'Sent',
          creation: '2024-03-05 10:00:00',
          owner: 'james.okafor@nexacrm.io',
        },
      ],
      versions: [],
      last_email: {
        subject: 'Enterprise Proposal — Acme Corp',
        creation: '2024-03-05 10:00:00',
      },
      last_communication: {
        communication_type: 'Email',
        creation: '2024-03-05 10:00:00',
      },
    },
    'DEAL-0003': {
      activities: [
        {
          type: 'activity',
          activity_type: 'Note',
          content: 'Proposal sent. Aisha confirmed receipt. Compliance team reviewing. Expected decision by end of month.',
          creation: '2024-04-02 11:00:00',
          owner: 'james.okafor@nexacrm.io',
        },
        {
          type: 'call_log',
          id: 'CALL-0003',
          duration: 480,
          status: 'Completed',
          from: '+1 212 555 0104',
          to: '+1 800 555 0001',
          creation: '2024-05-10 15:00:00',
        },
        {
          type: 'activity',
          activity_type: 'Note',
          content: 'Pricing negotiation call. They are asking for 15% discount on annual plan. Escalated to Sarah for approval.',
          creation: '2024-05-10 16:00:00',
          owner: 'james.okafor@nexacrm.io',
        },
      ],
      versions: [],
      last_email: null,
      last_communication: {
        communication_type: 'Phone',
        creation: '2024-05-10 15:00:00',
      },
    },
    'DEAL-0007': {
      activities: [
        {
          type: 'activity',
          activity_type: 'Note',
          content: 'Contract signed. Kickoff scheduled for 2024-06-03. Onboarding team looped in.',
          creation: '2024-05-20 16:30:00',
          owner: 'priya.sharma@nexacrm.io',
        },
      ],
      versions: [],
      last_email: null,
      last_communication: null,
    },
  },
}

export function getActivities(doctype, name) {
  const group = ACTIVITIES[doctype]
  if (!group) return { activities: [], versions: [], last_email: null, last_communication: null }
  return group[name] || { activities: [], versions: [], last_email: null, last_communication: null }
}
