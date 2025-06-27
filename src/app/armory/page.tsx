
import React from 'react';
import Link from 'next/link';
import { MicroAppListingCard } from '@/components/armory/micro-app-listing-card';

const mockApps = [
  {
    id: 'infidelity-radar',
    name: 'Infidelity Radar',
    author: 'Aegis Systems',
    description: 'Trust is earned. So is suspicion. Tap into AI-enhanced pattern analysis, social scraping, and behavioral drift detection to finally know the truth. Scan for free. Confirm for real.',
    price: '$19/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'private investigation security',
  },
  {
    id: 'rico-suave',
    name: 'Rico Suave: Vibe Check',
    author: 'ΛΞVON Labs',
    description: 'Advanced social dynamics analysis tool. Instantly determines the "vibe" of any text-based communication with 98.7% accuracy.',
    price: '$49.99',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'social network analysis',
  },
  {
    id: 'osint-harvester',
    name: 'OSINT Harvester',
    author: 'Aegis Systems',
    description: 'Automated open-source intelligence agent that continuously scours the web for mentions, threats, and opportunities.',
    price: '$129.99',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'data intelligence security',
  },
  {
    id: 'verdigris-pack',
    name: 'Verdigris Theme Pack',
    author: 'Artificer Guild',
    description: 'A premium cosmetic pack adhering to the Verdigris Interface Protocol™. Includes new glass tones and icon sets.',
    price: '$19.99',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'user interface design',
  },
  {
    id: 'chaos-monkey',
    name: 'Chaos Monkey',
    author: 'Forge Priesthood',
    description: 'Unleash the Chaos Monkey to randomly test the resilience of your workflows and agent configurations. For advanced users.',
    price: '$79.99',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'server infrastructure',
  },
  {
    id: 'automated-scribe',
    name: 'Automated Scribe',
    author: 'Echo Archives',
    description: 'An agent that joins your virtual meetings, provides real-time transcription, and delivers an executive summary via BEEP.',
    price: '$99.99',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'meeting notes',
  },
  {
    id: 'quantum-chronometer',
    name: 'Quantum Chronometer',
    author: 'Timeless Inc.',
    description: 'A hyper-accurate, quantum-entangled time-keeping Micro-App. Because precision is everything.',
    price: '$29.99',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'abstract clock',
  },
];

export default function ArmoryPage() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
          {mockApps.map(app => <MicroAppListingCard key={app.id} app={app} />)}
        </div>
      </main>
      <footer className="text-center text-xs text-muted-foreground pb-4 flex-shrink-0">
        <p>All transactions are final. Choose your instruments wisely.</p>
        <p className="mt-2"><Link href="/" className="hover:text-primary underline">Return to Canvas</Link></p>
      </footer>
    </div>
  );
}
