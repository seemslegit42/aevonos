'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, User } from 'lucide-react';

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

const SettingsView = () => (
    <div className="flex flex-col gap-4 p-4">
        <label className="font-bold">Persona Tuning</label>
        <Select defaultValue="alpha-hustler">
            <SelectTrigger>
                <SelectValue placeholder="Select dating persona..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="sapiosexual">🧠 Sapiosexual</SelectItem>
                <SelectItem value="alpha-hustler">💼 Alpha Hustler</SelectItem>
                <SelectItem value="chill-demon">😏 Chill Demon</SelectItem>
                <SelectItem value="awkward-sweetheart">🤓 Awkward Sweetheart</SelectItem>
            </SelectContent>
        </Select>

        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-base">Premium Features</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <span>OSINT Vetting</span>
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

export default function BeepWingman() {
  return (
    <div className="h-full">
      <Tabs defaultValue="pipeline" className="flex flex-col h-full">
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
