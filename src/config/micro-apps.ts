// This file serves as a non-database source of truth for micro-app manifests.
// In a larger system, this could be stored in a database and managed via an admin interface.
// UUIDs are hardcoded to ensure stability across requests.

// Based on the MicroAppManifest Schema from api-spec.md
export const microAppManifests = [
  {
    id: 'd1b1b1b1-1111-4111-a111-111111111111',
    name: 'The Oracle',
    description: 'Visualize the real-time pulse of your agentic network, replacing static dashboards with an evolving, biomorphic data stream.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['read:agent_status'],
    routingPath: '/oracle',
    contextAwareCapabilities: ['agent_telemetry_stream'],
  },
  {
    id: 'd2b2b2b2-2222-4222-a222-222222222222',
    name: 'Lahey Surveillance',
    description: 'I am the liquor. And I am watching. Keep an eye on employee productivity with the Shitstorm Index™.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['read:user_activity_logs'],
    routingPath: '/lahey-surveillance',
    contextAwareCapabilities: ['user_activity_stream', 'anomaly_detection_hook'],
  },
  {
    id: 'd3b3b3b3-3333-4333-a333-333333333333',
    name: 'The Kif Kroker',
    description: "*Sigh*. The team's conflict metrics are escalating again. Monitors Slack for passive-aggression and burnout.",
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['integration:slack'],
    routingPath: '/kif-kroker',
    contextAwareCapabilities: ['comms_analysis_stream'],
  },
  {
    id: 'd4b4b4b4-4444-4444-a444-444444444444',
    name: 'The Lucille Bluth',
    description: 'Judgmental budgeting for your allowance. It\'s one banana, Michael. What could it cost, ten dollars?',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['read:expenses'],
    routingPath: '/lucille-bluth',
    contextAwareCapabilities: ['expense_entry_hook'],
  },
  {
    id: 'd5b5b5b5-5555-4555-a555-555555555555',
    name: 'Project Lumbergh',
    description: 'Yeeeeah, about those meetings... Analyzes invites for pointlessness and generates passive-aggressive decline memos.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['read:calendar'],
    routingPath: '/project-lumbergh',
    contextAwareCapabilities: ['calendar_event_hook'],
  },
  {
    id: 'd6b6b6b6-6666-4666-a666-666666666666',
    name: 'The Winston Wolfe',
    description: 'Bad review? Thirty minutes away. I\'ll be there in ten. Solves online reputation problems with surgical precision.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['integration:social_media'],
    routingPath: '/winston-wolfe',
    contextAwareCapabilities: ['reputation_alert_stream'],
  },
  {
    id: 'd7b7b7b7-7777-4777-a777-777777777777',
    name: 'Paper Trail P.I.',
    description: 'The receipts don\'t lie. A noir detective that scans your expense receipts and gives you the \'leads\'.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['write:expenses', 'read:files'],
    routingPath: '/paper-trail',
    contextAwareCapabilities: ['file_upload_hook'],
  },
];
