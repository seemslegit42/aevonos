import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Based on the MicroAppManifest Schema from api-spec.md
const microAppManifests = [
  {
    id: crypto.randomUUID(),
    name: 'The Oracle',
    description: 'Visualize the real-time pulse of your agentic network, replacing static dashboards with an evolving, biomorphic data stream.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['read:agent_status'],
    routingPath: '/oracle',
    contextAwareCapabilities: ['agent_telemetry_stream'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Lahey Surveillance',
    description: 'I am the liquor. And I am watching. Keep an eye on employee productivity with the Shitstorm Index™.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['read:user_activity_logs'],
    routingPath: '/lahey-surveillance',
    contextAwareCapabilities: ['user_activity_stream', 'anomaly_detection_hook'],
  },
  {
    id: crypto.randomUUID(),
    name: 'The Kif Kroker',
    description: '*Sigh*. The team\'s conflict metrics are escalating again. Monitors Slack for passive-aggression and burnout.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['integration:slack'],
    routingPath: '/kif-kroker',
    contextAwareCapabilities: ['comms_analysis_stream'],
  },
  {
    id: crypto.randomUUID(),
    name: 'The Lucille Bluth',
    description: 'Judgmental budgeting for your allowance. It\'s one banana, Michael. What could it cost, ten dollars?',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['read:expenses'],
    routingPath: '/lucille-bluth',
    contextAwareCapabilities: ['expense_entry_hook'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Project Lumbergh',
    description: 'Yeeeeah, about those meetings... Analyzes invites for pointlessness and generates passive-aggressive decline memos.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['read:calendar'],
    routingPath: '/project-lumbergh',
    contextAwareCapabilities: ['calendar_event_hook'],
  },
  {
    id: crypto.randomUUID(),
    name: 'The Winston Wolfe',
    description: 'Bad review? Thirty minutes away. I\'ll be there in ten. Solves online reputation problems with surgical precision.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['integration:social_media'],
    routingPath: '/winston-wolfe',
    contextAwareCapabilities: ['reputation_alert_stream'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Paper Trail P.I.',
    description: 'The receipts don\'t lie. A noir detective that scans your expense receipts and gives you the \'leads\'.',
    iconUrl: 'https://placehold.co/100x100.png',
    permissionsRequired: ['write:expenses', 'read:files'],
    routingPath: '/paper-trail',
    contextAwareCapabilities: ['file_upload_hook'],
  },
];

// GET /api/microapps
// Corresponds to the operationId `listMicroApps` in api-spec.md
export async function GET(request: Request) {
  try {
    // In a real application, you would fetch these from a database
    // and filter them based on the user's plan and permissions.
    return NextResponse.json(microAppManifests);
  } catch (error) {
    console.error('[API /microapps GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve Micro-App manifests.' }, { status: 500 });
  }
}
