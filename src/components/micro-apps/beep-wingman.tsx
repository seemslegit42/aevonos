
'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, User, Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import type { WingmanInput } from '@/ai/agents/wingman-schemas';
import { handleGenerateWingmanMessage } from '@/app/actions';


const mockPipeline = {
  'New Matches': [{ id: '1', name: 'Jessica, 28', lastMessage: 'Hey! Your profile is...', avatar: 'J' }],
  'Chatting': [{ id: '2', name: 'Amanda, 29', lastMessage: 'Agent: So what are you passionate about?', avatar: 'A' }],
  'Date Scheduled': [{ id: '3', name: 'Sophia, 27', lastMessage: 'Confirmed for Thursday at 7pm.', avatar: 'S' }],
  'Debrief': [{ id: '4', name: 'Chloe, 31', lastMessage: 'Feedback submitted: Good conversation.', avatar: 'C' }],
};

const mockInbox = [
  {
    id: 'msg-1',
    name: 'Amanda, 29',
    messages: [
      { from: 'them', text: 'Hey there! Loved your profile, especially the part about being a "spreadsheet artist". I can relate haha.' },
      { from: 'agent', text: 'Haha, thanks! It\'s a gift and a curse. What kind of trouble are you getting into this week?' },
      { from: 'them', text: 'Just trying to survive a big project at work. How about you?' },
    ],
  },
];

const PipelineColumn = ({ title, prospects }: { title: string; prospects: any[] }) => (
  <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
    <h3 className="font-bold text-sm text-muted-foreground tracking-wider uppercase">{title} ({prospects.length})</h3>
    <div className="flex flex-col gap-2">
      {prospects.map(p => (
        <Card key={p.id} className="bg-background/50">
          <CardContent className="p-3 flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{p.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground truncate">{p.lastMessage}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const InboxView = () => (
  <div className="flex flex-col gap-4">
    {mockInbox.map(convo => (
      <Card key={convo.id}>
        <CardHeader>
          <CardTitle className="text-base">Conversation with {convo.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {convo.messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-2 ${msg.from === 'agent' ? 'justify-end' : ''}`}>
              {msg.from === 'them' && <Avatar className="w-8 h-8"><AvatarFallback><User size={16} /></AvatarFallback></Avatar>}
              <p className={`max-w-[75%] p-2 rounded-lg text-sm ${msg.from === 'agent' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {msg.text}
              </p>
              {msg.from === 'agent' && <Avatar className="w-8 h-8"><AvatarFallback className="bg-accent text-accent-foreground"><Bot size={16} /></AvatarFallback></Avatar>}
            </div>
          ))}
        </CardContent>
      </Card>
    ))}
  </div>
);

const SettingsView = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [targetDescription, setTargetDescription] = useState('');
    const [persona, setPersona] = useState<WingmanInput['persona']>('alpha-hustler');
    
    const handleGenerate = async () => {
        if (!targetDescription) {
            setResult("Error: Target profile description cannot be empty.");
            return;
        }
        setIsLoading(true);
        setResult(null);
        const response = await handleGenerateWingmanMessage({ targetDescription, persona });
        setResult(response.openingMessage);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <Card className="bg-background/50">
                <CardHeader>
                    <CardTitle className="text-base">Agent Configuration</CardTitle>
                    <CardDescription className="text-xs">"RicoSuave-bot deployed. Initiating Phase 1: Compliment, then confuse."</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <label className="text-sm font-medium">Persona Tuning</label>
                    <Select value={persona} onValueChange={(v: WingmanInput['persona']) => setPersona(v)} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select dating persona..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="alpha-hustler">💼 RicoSuaveBot™</SelectItem>
                            <SelectItem value="chill-demon">😏 Savage</SelectItem>
                            <SelectItem value="awkward-sweetheart">🥰 Sweetheart</SelectItem>
                            <SelectItem value="sapiosexual">🤖 Turing-Tested Seducer</SelectItem>
                        </SelectContent>
                    </Select>

                    <label className="text-sm font-medium">Target Sales Funnel</label>
                     <Textarea 
                        placeholder="Describe the target's profile (e.g., 'Name is Sarah, bio says \"fluent in sarcasm and movie quotes\", has a picture with a golden retriever...')" 
                        value={targetDescription}
                        onChange={(e) => setTargetDescription(e.target.value)}
                        disabled={isLoading}
                        className="bg-background/80"
                    />

                    <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Bot className="mr-2 h-4 w-4" /> Generate Opener</>}
                    </Button>
                     {result && (
                        <Alert variant={result.startsWith("Error:") ? "destructive" : "default"} className="mt-3 bg-background/80">
                            <Bot className="h-4 w-4" />
                            <AlertTitle>{result.startsWith("Error:") ? "Generation Failed" : "Agent Suggestion"}</AlertTitle>
                            <AlertDescription className={result.startsWith("Error:") ? "" : "italic"}>
                                {result.startsWith("Error:") ? result : `"${result}"`}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card className="mt-4 bg-background/50">
                <CardHeader>
                    <CardTitle className="text-base">Premium Features</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span>Burner Phone Mode</span>
                        <Badge variant="destructive">VIP</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Ghost Handler™</span>
                         <Badge variant="destructive">VIP</Badge>
                    </div>
                    <Button>Upgrade to VIP Degenerate</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default function BeepWingman() {
  return (
    <div className="h-full">
      <Tabs defaultValue="settings" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline" className="flex-grow overflow-auto p-2">
           <div className="flex gap-4">
             {Object.entries(mockPipeline).map(([title, prospects]) => (
                <PipelineColumn key={title} title={title} prospects={prospects} />
             ))}
           </div>
        </TabsContent>
        <TabsContent value="inbox" className="flex-grow overflow-auto p-2">
            <InboxView />
        </TabsContent>
        <TabsContent value="settings" className="flex-grow overflow-auto">
            <SettingsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
