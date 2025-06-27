
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAppIcon } from '@/components/micro-app-registry';
import { type MicroAppType } from '@/store/app-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const agents: MicroAppType[] = [
  'aegis-control',
  'beep-wingman',
  'dr-syntax',
  'echo-control',
  'infidelity-radar',
  'jroc-business-kit',
  'kif-kroker',
  'lahey-surveillance',
  'lucille-bluth',
  'project-lumbergh',
  'pam-poovey-onboarding',
  'paper-trail',
  'rolodex',
  'sterileish',
  'the-foremanator',
  'vandelay',
  'vin-diesel',
  'winston-wolfe',
];

const statusColors: Record<string, string> = {
  Nominal: 'bg-accent',
  Active: 'bg-green-400',
  Strained: 'bg-yellow-400',
  Idle: 'bg-muted-foreground',
  Cycling: 'bg-primary',
};

const agentStatuses = Object.keys(statusColors);

interface AgentNode {
  type: MicroAppType;
  status: string;
  size: number;
  orbit: number;
  speed: number;
  angle: number;
}

const AgentNode = ({ agent, index }: { agent: AgentNode, index: number }) => {
  const Icon = getAppIcon(agent.type);
  const agentName = agent.type.replace(/-/g, ' ').replace('control', '').trim();

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{
        width: agent.size,
        height: agent.size,
        x: '-50%',
        y: '-50%',
      }}
      animate={{
        rotate: 360,
        transform: [
          `rotate(0deg) translateX(${agent.orbit}px) rotate(0deg)`,
          `rotate(360deg) translateX(${agent.orbit}px) rotate(-360deg)`,
        ],
      }}
      transition={{
        duration: agent.speed,
        ease: 'linear',
        repeat: Infinity,
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn("w-full h-full rounded-full flex items-center justify-center border", statusColors[agent.status])}
              style={{
                 borderColor: `hsl(var(--${agent.status === 'Nominal' ? 'accent' : 'primary'}))`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
               transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Icon className="w-1/2 h-1/2 text-foreground" />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="capitalize">{agentName}: <span className={cn('font-bold', `text-${statusColors[agent.status].replace('bg-','')}-400`)}>{agent.status}</span></p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};

export default function Oracle() {
  const [agentNodes, setAgentNodes] = useState<AgentNode[]>([]);

  useEffect(() => {
    // Initialize agents
    setAgentNodes(
      agents.map((type, index) => ({
        type,
        status: agentStatuses[Math.floor(Math.random() * agentStatuses.length)],
        size: 40 + Math.random() * 20,
        orbit: 80 + index * 18,
        speed: 20 + Math.random() * 20,
        angle: Math.random() * 360,
      }))
    );
    
    // Update statuses periodically
    const interval = setInterval(() => {
        setAgentNodes(prev => prev.map(agent => ({
            ...agent,
            status: agentStatuses[Math.floor(Math.random() * agentStatuses.length)]
        })))
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        <div className="relative aspect-square w-full max-w-[500px]">
            <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-primary/5 to-transparent rounded-full" />

            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/50 border-2 border-primary shadow-[0_0_20px_hsl(var(--primary))]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="absolute inset-0 bg-radial-gradient from-background/5 to-transparent rounded-full" />
            </motion.div>

            {agentNodes.map((agent, index) => (
                <AgentNode key={agent.type} agent={agent} index={index} />
            ))}
        </div>
    </div>
  );
}
