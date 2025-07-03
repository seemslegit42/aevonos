
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { clearFirstWhisper } from '@/app/actions';
import type { User } from '@prisma/client';
import { Sparkles } from 'lucide-react';

interface FirstWhisperCardProps {
  user: Pick<User, 'firstWhisper' | 'firstCommand'>;
  onAction: () => void;
}

export default function FirstWhisperCard({ user, onAction }: FirstWhisperCardProps) {
  const { handleCommandSubmit, isLoading } = useAppStore();

  const handleAccept = () => {
    if (user.firstCommand) {
      handleCommandSubmit(user.firstCommand);
    }
    clearFirstWhisper(); // Call server action
    onAction(); // Update local UI state
  };

  const handleDecline = () => {
    clearFirstWhisper();
    onAction();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
      className="max-w-md w-full"
    >
      <Card className="bg-primary/10 border-primary/30 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl text-primary flex items-center justify-center gap-2">
            <Sparkles /> A Message from the Aether
          </CardTitle>
          <CardDescription>BEEP whispers...</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg italic text-foreground">
            "{user.firstWhisper}"
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleAccept} disabled={isLoading}>Accept Quest</Button>
            <Button variant="outline" onClick={handleDecline} disabled={isLoading}>Decline</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
