
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: React.ReactNode;
    description: string;
    loading?: boolean;
}

export default function StatCard({ icon: Icon, title, value, description, loading }: StatCardProps) {
    return (
        <Card className="bg-background/50">
            <CardHeader className="p-3 pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <div className="text-2xl font-bold font-headline">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}
