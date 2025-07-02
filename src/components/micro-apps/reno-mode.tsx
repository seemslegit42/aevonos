'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, Sparkles, UserCheck, HeartHand, Flame, Wind, Droplets } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { UserPsyche } from '@prisma/client';
enum UserPsyche {
  ZEN_ARCHITECT = 'ZEN_ARCHITECT',
  SYNDICATE_ENFORCER = 'SYNDICATE_ENFORCER',
  RISK_AVERSE_ARTISAN = 'RISK_AVERSE_ARTISAN',
}
import type { RenoModeAnalysisOutput } from '@/ai/agents/reno-mode-schemas';

import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
