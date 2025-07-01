
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, GanttChartSquare, FileBarChart, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const mockCrystals = [
  { id: '1', type: 'contract', name: 'Contract-Chimera.pdf', date: '2024-08-15', agent: 'Agent Barbara', integrity: 'verified', icon: FileText, color: 'border-blue-400/50' },
  { id: '2', type: 'report', name: 'Q3_Financials.xlsx', date: '2024-07-30', agent: 'Auditor Generalissimo', integrity: 'verified', icon: FileBarChart, color: 'border-green-400/50' },
  { id: '3', type: 'plan', name: 'Project_Phoenix_Plan.docx', date: '2024-06-01', agent: 'BEEP', integrity: 'verified', icon: GanttChartSquare, color: 'border-purple-400/50' },
  { id: '4', type: 'ingest', name: 'meeting_transcript_09-01.txt', date: '2024-09-01', agent: 'Archivist Spirit', integrity: 'pending', icon: Bot, color: 'border-yellow-400/50' },
];

const DataCrystal = ({ crystal, index }: { crystal: (typeof mockCrystals)[0], index: number }) => {
  const Icon = crystal.icon;
  const duration = Math.random() * 5 + 7; // 7-12 seconds for a slow float
  const yRange = Math.random() * 15 + 10; // 10-25px vertical float

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="w-48 relative"
    >
        <motion.div
            animate={{
                y: [0, -yRange, 0],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
            }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className={cn(
                    "bg-background/50 hover:bg-background/80 hover:border-primary cursor-pointer transition-all crystal-pulse", 
                    crystal.color
                    )}
                     style={{animationDelay: `${index * 0.5}s`}}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 flex-shrink-0 text-primary" />
                      <CardTitle className="text-sm truncate">{crystal.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
                    <p>Type: {crystal.type}</p>
                    <p>Date: {crystal.date}</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p><span className="font-semibold">Agent:</span> {crystal.agent}</p>
                <p><span className="font-semibold">Aegis Integrity:</span> {crystal.integrity}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
    </motion.div>
  );
};


export default function ScribesArchive() {
  return (
    <div className="p-4 h-full overflow-hidden">
      <div className="flex flex-wrap items-start justify-center gap-8 h-full">
        {mockCrystals.map((crystal, index) => (
          <DataCrystal key={crystal.id} crystal={crystal} index={index} />
        ))}
      </div>
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-muted-foreground text-xs">
          <p>This is a sentient library, not a directory.</p>
          <p>Speak your request to BEEP to summon knowledge.</p>
      </div>
    </div>
  );
}
