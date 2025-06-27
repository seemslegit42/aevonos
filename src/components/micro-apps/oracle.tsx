
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAppIcon } from '@/components/micro-app-registry';
import { type MicroAppType } from '@/store/app-store';

const agents: MicroAppType[] = [
  'aegis-control',
  'beep-wingman',
  'echo-control',
  'infidelity-radar',
  'jroc-business-kit',
  'kif-kroker',
  'lucille-bluth',
  'lumbergh',
  'pam-poovey-onboarding',
  'paper-trail',
  'rolodex',
  'vandelay',
  'vin-diesel',
  'winston-wolfe',
];

const agentStatuses = ['Nominal', 'Active', 'Strained', 'Idle', 'Cycling'];
const statusColors = {
  Nominal: 'bg-accent',
  Active: 'bg-green-400',
  Strained: 'bg-yellow-400',
  Idle: 'bg-muted-foreground',
  Cycling: 'bg-primary',
};


const AgentStatusIndicator = ({ agentType }: { agentType: MicroAppType }) => {
  const [status, setStatus] = React.useState(agentStatuses[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatus(agentStatuses[Math.floor(Math.random() * agentStatuses.length)]);
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  const Icon = getAppIcon(agentType);

  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-background/50 hover:bg-background transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 flex-shrink-0" />
        <span className="text-sm font-medium capitalize">{agentType.replace(/-/g, ' ').replace('control', '').trim()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{status}</span>
        <motion.div
          className={cn("w-3 h-3 rounded-full", statusColors[status as keyof typeof statusColors])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};


export default function Oracle() {
  return (
    <div className="p-2 h-full flex flex-col">
      <p className="text-xs text-muted-foreground px-2 pb-2">Agentic pulse network status. All kernels online.</p>
      <ScrollArea className="flex-grow pr-2">
        <div className="space-y-1">
          {agents.map(agent => (
            <AgentStatusIndicator key={agent} agentType={agent} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
