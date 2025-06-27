
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MicroAppListingCard } from '@/components/armory/micro-app-listing-card';

const mockApps = [
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
    <div className="flex flex-col min-h-screen p-4 sm:p-6 lg:p-8 gap-4">
      <header className="flex items-center justify-between w-full flex-wrap gap-4">
         <Button asChild variant="ghost" className="text-sm">
           <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Canvas</Link>
         </Button>
         <h1 className="text-3xl font-headline font-bold text-foreground text-center">
          The Armory
         </h1>
         <div className="w-[140px]"></div>
      </header>
      <main className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
          {mockApps.map(app => <MicroAppListingCard key={app.id} app={app} />)}
        </div>
      </main>
      <footer className="text-center text-xs text-muted-foreground">
        <p>All transactions are final. Choose your instruments wisely.</p>
      </footer>
    </div>
  );
}
