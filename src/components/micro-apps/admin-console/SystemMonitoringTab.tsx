
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Construction } from 'lucide-react';

export default function SystemMonitoringTab() {
    return (
        <div className="p-2 h-full flex items-center justify-center">
             <Alert className="max-w-md border-dashed">
                <Construction className="h-4 w-4" />
                <AlertTitle>Under Construction</AlertTitle>
                <AlertDescription>
                    The System Monitoring panel is still being forged by the Architect. Check back later for real-time agent status and system health metrics.
                </AlertDescription>
            </Alert>
        </div>
    );
}
