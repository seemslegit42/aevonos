'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BeepIcon } from '@/components/icons/BeepIcon';
import { cn } from '@/lib/utils';

interface BeepAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function BeepAvatar({ className, ...props }: BeepAvatarProps) {
  return (
    <Avatar className={cn('bg-primary/10', className)} {...props}>
      <AvatarFallback className="bg-transparent p-1">
        <BeepIcon className="h-full w-full text-primary" />
      </AvatarFallback>
    </Avatar>
  );
}
