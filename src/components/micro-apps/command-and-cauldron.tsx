
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, FileSignature, GitBranch, ListVideo, Zap, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { useAppStore } from '@/store/app-store';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import type { Workspace, UserRole, PlanTier } from '@prisma/client';

const exampleRitual = `on: outboundHttp
if:
  dest: "*.thirdpartyapi.com"
  data.contains: ["user_email"]
then:
  block
  log: "Forbidden data egress detected to third-party API."
  charge: 250`;
  
type LogEntry = {
    id: string;
    timestamp: string;
    ritualName: string;
    status: 'Blocked' | 'Allowed' | 'Alerted';
    details: string;
}

const GatedView = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
        <Lock className="w-16 h-16 mb-4" />
        <h3 className="font-headline text-2xl text-foreground">Access Denied by Decree</h3>
        <p>Your Sovereignty Class is insufficient to command the Cauldron.</p>
        <p className="text-xs mt-2">Acquire the 'Priesthood' pact to unlock this sanctum.</p>
    </div>
);

const LoadingView = () => (
    <div className="p-2 h-full flex flex-col gap-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-full w-full" />
    </div>
)

export default function CommandAndCauldron() {
    const [ritualCode, setRitualCode] = useState(exampleRitual);
    const [ritualName, setRitualName] = useState('Egress Containment Ward');
    const [isLoading, setIsLoading] = useState(false);
    const [replayLog, setReplayLog] = useState<LogEntry[]>([]);
    const [drainEstimate, setDrainEstimate] = useState(0);
    const { toast } = useToast();
    const { handleCommandSubmit, isLoading: isBeepLoading } = useAppStore();
    
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
      async function fetchAuthData() {
        try {
          const [wsRes, userRes] = await Promise.all([
            fetch('/api/workspaces/me'),
            fetch('/api/users/me')
          ]);
          if (!wsRes.ok || !userRes.ok) throw new Error("Could not verify credentials.");
          const wsData = await wsRes.json();
          const userData = await userRes.json();
          setWorkspace(wsData);
          setUserRole(userData.role);
        } catch (e) {
          console.error(e);
          setUserRole(null);
        } finally {
          setIsCheckingAuth(false);
        }
      }
      fetchAuthData();
    }, []);

    useEffect(() => {
        const lines = ritualCode.split('\n').length;
        const complexity = ritualCode.length;
        const estimate = Math.round((lines * 5 + complexity * 0.1) % 50 + 5);
        setDrainEstimate(estimate);
    }, [ritualCode]);

    const handleConsecrate = async () => {
        setIsLoading(true);

        // Rule #3: Billing must occur before execution
        if (!workspace || (workspace.credits as unknown as number) < drainEstimate) {
            toast({
                variant: 'destructive',
                title: 'Insufficient Sovereignty',
                description: `Your tribute of ${drainEstimate} Ξ exceeds your available balance. The ritual is aborted.`,
            });
            setIsLoading(false);
            return;
        }

        // Simulate debiting credits before proceeding
        const command = `debit ${drainEstimate} credits for consecrating the ritual "${ritualName}"`;
        await handleCommandSubmit(command); // This is a mock call for the ledger

        toast({
            title: "Consecrating Ritual...",
            description: "The incantation is being bound to the aether.",
        });

        // Mock API call to C&C
        setTimeout(() => {
            const success = Math.random() > 0.15;
            setIsLoading(false);

            if (success) {
                toast({
                    title: "Ritual Bound",
                    description: `The "${ritualName}" ritual is now active and will be enforced by Aegis.`,
                });
                const newLogEntry: LogEntry = {
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    ritualName: ritualName,
                    status: 'Alerted',
                    details: 'Aegis detected an outbound call matching the ritual pattern. Action was logged.',
                };
                setReplayLog(prev => [newLogEntry, ...prev]);
            } else {
                toast({
                    variant: 'destructive',
                    title: "Binding Failed",
                    description: "The aether is turbulent. The ritual could not be bound.",
                });
            }
        }, 1500);
    }

    if (isCheckingAuth) {
      return <LoadingView />;
    }

    // Rule #1: Gated Access
    if (userRole !== UserRole.ADMIN) {
        return <GatedView />;
    }
    
    const isPriesthood = workspace?.planTier === 'Priesthood';

    return (
        <div className="p-2 h-full flex flex-col gap-3 bg-purple-950/10 border border-purple-500/30 rounded-lg text-gray-200">
            <div className="flex-grow grid md:grid-cols-2 gap-3 min-h-0">
                <Card className="bg-background/30 border-purple-500/50 flex flex-col">
                    <CardHeader className="p-3">
                        <CardTitle className="text-purple-300 flex items-center gap-2"><FileSignature /> Incantation Composer</CardTitle>
                        <CardDescription className="text-xs">Forge your security spells in the Cauldron.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 flex-grow flex flex-col gap-2">
                        <Input 
                            placeholder="Ritual Name..."
                            value={ritualName}
                            onChange={(e) => setRitualName(e.target.value)}
                            className="bg-[#1a101a]/50 border-purple-500/50 text-purple-200 placeholder:text-gray-500 focus-visible:ring-purple-400 font-semibold"
                        />
                        <Textarea 
                            value={ritualCode}
                            onChange={(e) => setRitualCode(e.target.value)}
                            className="h-full bg-[#1a101a]/50 border-purple-500/50 text-purple-200 placeholder:text-gray-500 focus-visible:ring-purple-400 font-mono text-xs"
                        />
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3 min-h-0">
                     {/* Rule #4: Tier-specific features */}
                     <Card className="bg-background/30 border-purple-500/50">
                        <CardHeader className="p-3">
                            <CardTitle className="text-purple-300 flex items-center gap-2"><GitBranch /> Advanced Bindings</CardTitle>
                             <CardDescription className="text-xs">Bind this ritual to specific agents or trigger external proxies. Requires Priesthood plan.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 grid grid-cols-2 gap-2">
                             <Button variant="outline" className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200" disabled={!isPriesthood}>
                                Bind to Agent
                            </Button>
                            <Button variant="outline" className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200" disabled={!isPriesthood}>
                                Bind to Proxy
                            </Button>
                        </CardContent>
                    </Card>
                     <Card className="bg-background/30 border-purple-500/50 flex flex-col flex-grow min-h-0">
                        <CardHeader className="p-3">
                            <CardTitle className="text-purple-300 flex items-center gap-2"><ListVideo /> Replay Log</CardTitle>
                            <CardDescription className="text-xs">A record of this ritual's past invocations.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 flex-grow">
                            <ScrollArea className="h-full">
                                {replayLog.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground">
                                        <p>No invocations recorded for this session.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {replayLog.map(log => (
                                            <div key={log.id} className="text-xs p-2 rounded-md bg-[#1a101a]/50 border border-purple-500/30">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-purple-300">{log.status}: {log.ritualName}</span>
                                                    <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="font-mono text-gray-400">{log.details}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex-shrink-0">
                 <Card className="bg-background/30 border-purple-500/50">
                    <CardContent className="p-3 flex items-center justify-between">
                         <div className="text-xs flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400"/>
                            <div>
                                <p className="font-bold text-purple-300">ΞDrain Estimate</p>
                                <p className="text-muted-foreground">~{drainEstimate} Ξ per invocation</p>
                            </div>
                        </div>
                        <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleConsecrate} disabled={isLoading || isBeepLoading}>
                            {(isLoading || isBeepLoading) ? <Loader2 className="animate-spin mr-2" /> : <Shield className="mr-2"/>}
                            Consecrate Ritual
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

