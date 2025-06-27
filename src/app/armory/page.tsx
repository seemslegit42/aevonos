
import React from 'react';
import Link from 'next/link';
import { MicroAppListingCard } from '@/components/armory/micro-app-listing-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const disgruntledPackApps = [
  { name: 'Lahey Surveillance Commander™' },
  { name: 'The Kif Kroker™' },
  { name: 'The Lucille Bluth™' },
  { name: 'Project Lumbergh™' },
  { name: 'The Winston Wolfe™' },
  { name: 'The Rolodex™' },
];

const allApps = [
  {
    id: 'oracle',
    name: 'The Oracle',
    author: 'ΛΞVON OS',
    description: 'Visualize the real-time pulse of your agentic network, replacing static dashboards with an evolving, biomorphic data stream.',
    price: 'Included',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'data visualization network',
  },
  {
    id: 'lahey-surveillance',
    name: 'Lahey Surveillance',
    author: 'Sunnyvale Security',
    description: 'I am the liquor. And I am watching. Keep an eye on employee productivity with the Shitstorm Index™.',
    price: '$9/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'surveillance camera bottle',
  },
  {
    id: 'kif-kroker',
    name: 'The Kif Kroker',
    author: 'DOOP',
    description: "*Sigh*. The team's conflict metrics are escalating again. Monitors Slack for passive-aggression and burnout.",
    price: '$9/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'alien defeated sad',
  },
  {
    id: 'lucille-bluth',
    name: 'The Lucille Bluth',
    author: 'Bluth Company',
    description: "Judgmental budgeting for your allowance. It's one banana, Michael. What could it cost, ten dollars?",
    price: '$5/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'martini glass eye',
  },
  {
    id: 'project-lumbergh',
    name: 'Project Lumbergh',
    author: 'Initech',
    description: "Yeeeeah, about those meetings... Analyzes invites for pointlessness and generates passive-aggressive decline memos.",
    price: '$5/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'red stapler office',
  },
  {
    id: 'winston-wolfe',
    name: 'The Winston Wolfe',
    author: 'The Fixer',
    description: "Bad review? Thirty minutes away. I'll be there in ten. Solves online reputation problems with surgical precision.",
    price: '$29/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'sharp suit cleaning',
  },
  {
    id: 'rolodex',
    name: 'The Rolodex',
    author: 'Sterling Cooper',
    description: "Let's put a pin in that candidate. Analyzes resumes and generates non-cringey outreach icebreakers.",
    price: '$9/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'vintage rolodex office',
  },
  {
    id: 'jroc-business-kit',
    name: "J-ROC'S BIZ KIT™",
    author: 'Roc Pile Inc.',
    description: "Get dat cheddar legit, my dawg. Generates a business name, tagline, and logo concept for your new hustle.",
    price: '$15 one-time',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'boombox graffiti microphone',
  },
  {
    id: 'the-foremanator',
    name: 'The Foremanator',
    author: 'SiteCommand',
    description: 'He doesn’t sleep. He doesn’t eat. He just yells about deadlines. Processes construction site logs.',
    price: '$19/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'hard hat construction',
  },
  {
    id: 'sterileish',
    name: 'STERILE-ish™',
    author: 'Basically Compliant LLC',
    description: 'We’re basically compliant. An irreverent vibe-checker for ISO 13485, FDA, and other cleanroom logs.',
    price: '$49/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'cleanroom laboratory science',
  },
  {
    id: 'paper-trail',
    name: 'Paper Trail P.I.',
    author: 'The Agency',
    description: "The receipts don't lie. A noir detective that scans your expense receipts and gives you the 'leads'.",
    price: '$9/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'detective office noir',
  },
  {
    id: 'vandelay',
    name: 'Vandelay Industries',
    author: 'Art Vandelay',
    description: 'Importing, exporting, and ghosting. Generates impeccably boring, jargon-filled calendar invites to block off your time.',
    price: '$5/mo',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'latex architecture design',
  }
];

export default function ArmoryPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 pt-6 text-center">
        <h1 className="text-3xl font-headline font-bold text-foreground tracking-wider">The Micro-App Cabinet</h1>
        <p className="text-muted-foreground mt-1">A Showcase of Dysfunctional Excellence.</p>
      </header>
      <main className="flex-grow overflow-y-auto p-4">
        <section id="featured-bundle" className="mb-12">
            <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Featured Drop</h2>
            <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-foreground">🔻 The Disgruntled Employee Pack</CardTitle>
                    <CardDescription className="text-foreground/80">The essential toolkit for surviving corporate life. Free forever for solo founders and burned-out teams.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mb-6">
                        {disgruntledPackApps.map(app => (
                            <li key={app.name} className="flex items-center gap-2 text-sm text-foreground">
                                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                                <span>{app.name}</span>
                            </li>
                        ))}
                    </ul>
                    <Button size="lg" className="w-full">Get The Bundle (Free)</Button>
                </CardContent>
            </Card>
        </section>

        <section id="full-catalog">
             <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Full Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allApps.map(app => <MicroAppListingCard key={app.id} app={app} />)}
            </div>
        </section>
      </main>
      <footer className="text-center text-xs text-muted-foreground pb-4 flex-shrink-0">
        <p>All transactions are final. Choose your instruments wisely.</p>
        <p className="mt-2"><Link href="/" className="hover:text-primary underline">Return to Canvas</Link></p>
      </footer>
    </div>
  );
}
