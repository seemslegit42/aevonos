
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAppIcon } from '@/components/micro-app-registry';
import { type MicroAppType } from '@/store/app-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Agent as AgentData, AgentStatus } from '@prisma/client';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ServerCrash } from 'lucide-react';

const statusColors: Record<AgentStatus | 'default', string> = {
  [AgentStatus.active]: 'bg-green-400',
  [AgentStatus.processing]: 'bg-primary',
  [AgentStatus.idle]: 'bg-muted-foreground',
  [AgentStatus.paused]: 'bg-yellow-400',
  [AgentStatus.error]: 'bg-destructive',
  'default': 'bg-gray-500' // fallback
};

interface AgentNode {
  type: MicroAppType;
  status: AgentStatus;
  name: string;
  size: number;
  orbit: number;
  speed: number;
  angle: number;
}

const AgentNode = ({ agent, index }: { agent: AgentNode, index: number }) => {
  const Icon = getAppIcon(agent.type);
  const agentName = agent.name;
  const statusColorClass = (statusColors[agent.status] || statusColors.default).replace('bg-','text-');


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
              className={cn("w-full h-full rounded-full flex items-center justify-center border", statusColors[agent.status] || statusColors.default)}
              style={{
                 borderColor: `hsl(var(--${agent.status === 'active' ? 'accent' : 'primary'}))`,
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
            <p className="capitalize">{agentName}: <span className={cn('font-bold', statusColorClass)}>{agent.status}</span></p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};

export default function Oracle() {
  const [agentNodes, setAgentNodes] = useState<AgentNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/agents');
            if (!response.ok) {
                throw new Error('Failed to fetch agent data from the network.');
            }
            const data: AgentData[] = await response.json();
            
            setAgentNodes(data.map((agent, index) => ({
                type: agent.type as MicroAppType,
                name: agent.name,
                status: agent.status,
                size: 40 + Math.random() * 20,
                orbit: 80 + index * 25,
                speed: 20 + Math.random() * 20,
                angle: Math.random() * 360,
            })));

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000); // Poll for updates

    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (isLoading && agentNodes.length === 0) {
        return <Skeleton className="absolute inset-0 rounded-full" />;
    }

    if (error) {
        return (
            <Alert variant="destructive" className="m-auto max-w-sm">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Network Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <>
            <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-primary/5 to-transparent rounded-full" />
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/50 border-2 border-primary shadow-[0_0_20px_hsl(var(--primary))]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="absolute inset-0 bg-radial-gradient from-background/5 to-transparent rounded-full" />
            </motion.div>

            {agentNodes.map((agent, index) => (
                <AgentNode key={agent.type + index} agent={agent} index={index} />
            ))}
        </>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        <div className="relative aspect-square w-full max-w-[500px]">
           {renderContent()}
        </div>
    </div>
  );
}
