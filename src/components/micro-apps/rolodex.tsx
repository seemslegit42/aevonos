'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { analyzeCandidate } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Mail, FileText, Check, X, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

// Mock data, in a real app this would come from a DB
const initialCandidates = [
  { id: 1, name: 'Jessica Miller', summary: 'Senior Frontend Engineer with 8 years of experience in React and Next.js, led a team of 5 at Acme Inc.', fitScore: 88 },
  { id: 2, name: 'David Chen', summary: 'Full-stack developer specializing in Node.js and Python. Passionate about building scalable APIs.', fitScore: 72 },
  { id: 3, name: 'Samantha Carter', summary: 'Astrophysicist turned data scientist. Expert in quantum computing and wormhole theory.', fitScore: 95 },
  { id: 4, name: 'Michael West', summary: 'Junior developer with a certificate from a 3-month bootcamp. Eager to learn.', fitScore: 45 },
];

const jobDescription = "Senior Frontend Developer with experience in Next.js, GraphQL, and leading a team.";

export default function TheRolodex() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSwipe = (id: number, direction: 'left' | 'right' | 'up') => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error("Sound effect failed", e));
    }

    const candidateName = initialCandidates.find(c => c.id === id)?.name || 'Candidate';
    let description = '';
    if (direction === 'left') description = `Filed away ${candidateName}.`;
    if (direction === 'right') description = `Kept ${candidateName} on file.`;
    if (direction === 'up') description = `Interview scheduled with ${candidateName}.`;
    
    toast({ title: 'The Rolodex', description });
  };
  
  const CandidateCard = ({ candidate, onSwipe }: { candidate: any; onSwipe: (id: number, dir: 'left'|'right'|'up') => void }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            style={{ x, y, rotate, position: 'absolute' }}
            onDragEnd={(event, info) => {
                if (info.offset.x > 100) onSwipe(candidate.id, 'right');
                else if (info.offset.x < -100) onSwipe(candidate.id, 'left');
                else if (info.offset.y < -100) onSwipe(candidate.id, 'up');
            }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
        >
            <Card className="w-full h-full p-4 flex flex-col justify-between bg-foreground/10 border-foreground/30 shadow-lg">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-headline text-foreground">{candidate.name}</h3>
                        <Badge variant="outline" className="border-primary text-primary">{candidate.fitScore}% Fit</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{candidate.summary}</p>
                </div>
                <div className="flex justify-between items-center text-muted-foreground text-xs mt-4">
                    <span className='flex items-center gap-1'><X/> File Away</span>
                    <span className='flex items-center gap-1'><ArrowUp/> Interview</span>
                    <span className='flex items-center gap-1'>Keep on File <Check/></span>
                </div>
            </Card>
        </motion.div>
    );
  };

  return (
    <div className="p-2 h-full flex flex-col items-center justify-center">
        <div className="relative w-full max-w-xs h-64">
            {candidates.length > 0 ? candidates.map((c, index) => (
                <CandidateCard key={c.id} candidate={c} onSwipe={handleSwipe} />
            )).reverse() : (
                <div className="text-center text-muted-foreground">
                    <p>All candidates reviewed.</p>
                    <Button variant="link" onClick={() => setCandidates(initialCandidates)}>Reset Stack</Button>
                </div>
            )}
        </div>
        <audio ref={audioRef} src="https://res.cloudinary.com/delba/video/upload/v1701123190/rolodex-click.mp3" preload="auto" />
    </div>
  );
}
