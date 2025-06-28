
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../ui/progress';
import { LaheyIcon } from '../icons/LaheyIcon';
import { cn } from '@/lib/utils';

const mockStaff = [
    { id: 'S01', name: 'Kyle D.', image: 'https://placehold.co/100x100.png', imageHint: 'man portrait', shitstorm_index: 78 },
    { id: 'S02', name: 'Tiffany A.', image: 'https://placehold.co/100x100.png', imageHint: 'woman portrait', shitstorm_index: 45 },
    { id: 'S03', name: 'Randy B.', image: 'https://placehold.co/100x100.png', imageHint: 'man eating burger', shitstorm_index: 22 },
];

const mockTimeline = [
    { id: 'T01', text: "Kyle D. opened YouTube for 22 minutes.", commentary: "He thinks I’m not watching. But I *am* the liquor. And I *see* everything.", time: "3:12 PM", severity: 'high' },
    { id: 'T02', text: "Tiffany A. was idle for 17 straight minutes.", commentary: "The shit-winds are blowing, bud. Straight into the eye of the shit-icane.", time: "2:12 PM", severity: 'medium' },
    { id: 'T03', text: "Randy B. left the warehouse with a burger.", commentary: "Just a little drinkypoo to take the edge off this blatant... cheeseburger-related incident.", time: "1:43 PM", severity: 'low' },
];

const severityClasses = {
    high: 'border-destructive text-destructive',
    medium: 'border-ring text-ring',
    low: 'border-accent text-accent',
}

const EmployeeCard = ({ staff }: { staff: (typeof mockStaff)[0] }) => {
    return (
        <Card className="bg-background/50 flex-shrink-0 w-48">
            <CardHeader className="flex flex-row items-center gap-3 p-3 space-y-0">
                <Image src={staff.image} alt={staff.name} width={40} height={40} className="rounded-full" data-ai-hint={staff.imageHint} />
                <div className="flex-grow">
                    <CardTitle className="text-base">{staff.name}</CardTitle>
                    <CardDescription>Shitstorm Index™</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <Progress value={staff.shitstorm_index} className="h-2" indicatorClassName="bg-destructive" />
                <p className="text-right text-xs mt-1 text-destructive font-mono">{staff.shitstorm_index}%</p>
            </CardContent>
        </Card>
    );
};


export default function LaheyCommander() {
  const { toast } = useToast();

  const handleExport = (type: 'PDF' | 'CSV') => {
      const title = type === 'PDF' ? "Shituation Report Generated" : "Paranoia Log Exported";
      const description = type === 'PDF' ? "Your 'Weekly Shituation' is ready for review. It's a real page-turner." : "The numbers don't lie, bud. The numbers don't lie.";
      toast({ title, description });
  }

  return (
    <div className="p-2 h-full flex flex-col gap-3">
        {/* Staff Dashboard */}
        <div>
            <h3 className="text-sm font-semibold mb-2 px-1">Staff Surveillance Dashboard</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                {mockStaff.map(staff => <EmployeeCard key={staff.id} staff={staff} />)}
            </div>
        </div>
        
        <Separator />
        
        {/* Timeline View */}
        <div className="flex-grow flex flex-col min-h-0">
            <h3 className="text-sm font-semibold mb-2 px-1">LaheyCam™ Timeline</h3>
            <ScrollArea className="flex-grow">
                <div className="space-y-3 pr-2">
                {mockTimeline.map(event => (
                    <Alert key={event.id} className={cn(`bg-background/80`, severityClasses[event.severity as keyof typeof severityClasses])}>
                        <LaheyIcon className="h-4 w-4" />
                        <AlertTitle className="flex justify-between">
                            <span>{event.text}</span>
                            <span className="text-xs font-mono">{event.time}</span>
                        </AlertTitle>
                        <AlertDescription className="italic text-foreground/80">
                            Lahey: "{event.commentary}"
                        </AlertDescription>
                    </Alert>
                ))}
                </div>
            </ScrollArea>
        </div>

        {/* Report Builder */}
        <div className="flex-shrink-0">
             <Separator className="my-3"/>
            <Card className="bg-background/50">
                <CardHeader className="p-2 pb-1">
                    <CardTitle className="text-base">Report Builder</CardTitle>
                    <CardDescription className="text-xs">Export The Shituation.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 flex gap-2">
                    <Button variant="secondary" className="w-full" onClick={() => handleExport('PDF')}>
                        <FileDown /> Shituation Report (PDF)
                    </Button>
                     <Button variant="outline" className="w-full" onClick={() => handleExport('CSV')}>
                        <FileDown /> Paranoia Log (CSV)
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
