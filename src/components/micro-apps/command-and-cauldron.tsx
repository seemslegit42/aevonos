
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, FileSignature, GitBranch, ListVideo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const exampleRitual = `on: outboundHttp
if:
  dest: "*.thirdpartyapi.com"
  data.contains: ["user_email"]
then:
  block
  log: "Forbidden: email egress detected"
  charge: 250`;

export default function CommandAndCauldron() {
    const [ritualCode, setRitualCode] = useState(exampleRitual);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleConsecrate = () => {
        setIsLoading(true);
        toast({
            title: "Consecrating Ritual...",
            description: "The incantation is being bound to the aether. This is a mock action.",
        });
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Ritual Bound",
                description: "The security ritual is now active and will be enforced by Aegis.",
            });
        }, 1500);
    }
    
    return (
        <div className="p-2 h-full flex flex-col gap-3 bg-purple-950/10 border border-purple-500/30 rounded-lg text-gray-200">
            <div className="flex-grow grid md:grid-cols-2 gap-3 min-h-0">
                {/* Left Panel: Composer */}
                <Card className="bg-background/30 border-purple-500/50 flex flex-col">
                    <CardHeader className="p-3">
                        <CardTitle className="text-purple-300 flex items-center gap-2"><FileSignature /> Ritual Composer</CardTitle>
                        <CardDescription className="text-xs">Forge your security incantations here.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 flex-grow">
                        <Textarea 
                            value={ritualCode}
                            onChange={(e) => setRitualCode(e.target.value)}
                            className="h-full bg-[#1a101a]/50 border-purple-500/50 text-purple-200 placeholder:text-gray-500 focus-visible:ring-purple-400 font-mono text-xs"
                        />
                    </CardContent>
                </Card>

                {/* Right Panel: Binders & Logs */}
                <div className="flex flex-col gap-3 min-h-0">
                    <Card className="bg-background/30 border-purple-500/50">
                        <CardHeader className="p-3">
                            <CardTitle className="text-purple-300 flex items-center gap-2"><GitBranch /> Sigil Binder</CardTitle>
                             <CardDescription className="text-xs">Bind this ritual to specific agents or workflows.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                             <Button variant="outline" className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200" disabled>
                                Bind to Workflow...
                            </Button>
                        </CardContent>
                    </Card>
                     <Card className="bg-background/30 border-purple-500/50 flex flex-col flex-grow min-h-0">
                        <CardHeader className="p-3">
                            <CardTitle className="text-purple-300 flex items-center gap-2"><ListVideo /> Replay Log</CardTitle>
                            <CardDescription className="text-xs">A record of this ritual's past invocations.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 flex-grow">
                            <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground border border-dashed border-purple-500/30 rounded-md">
                                <p>No invocations recorded for this session.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0">
                 <Card className="bg-background/30 border-purple-500/50">
                    <CardContent className="p-3 flex items-center justify-between">
                         <div className="text-xs">
                            <p className="font-bold text-purple-300">ΞDrain Estimate</p>
                            <p className="text-muted-foreground">~{ritualCode.length % 50} Ξ per invocation</p>
                        </div>
                        <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleConsecrate} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Shield className="mr-2"/>}
                            Consecrate Ritual
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
