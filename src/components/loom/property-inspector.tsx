
'use client';
import React from 'react';
import type { Node } from './types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import { StonksBotModeSchema } from '@/ai/agents/stonks-bot-schemas';
import { JrocInputSchema } from '@/ai/agents/jroc-schemas';
import { WingmanInputSchema } from '@/ai/agents/wingman-schemas';
import { BarbaraTaskSchema } from '@/ai/agents/barbara-schemas';
import { SterileishAnalysisInputSchema } from '@/ai/agents/sterileish-schemas';
import { PamScriptInputSchema } from '@/ai/agents/pam-poovey-schemas';

interface PropertyInspectorProps {
    node: Node | null;
    onUpdate: (nodeId: string, data: any) => void;
}

const LogicProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        <div>
            <Label>Variable Path</Label>
            <Input value={node.data.variable || ''} onChange={(e) => onUpdate({ ...node.data, variable: e.target.value })} className="bg-background/80 font-mono" placeholder="e.g., newContact.email" />
        </div>
        <div>
            <Label>Operator</Label>
            <Select value={node.data.operator || 'exists'} onValueChange={(value) => onUpdate({ ...node.data, operator: value })}>
                <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="exists">exists</SelectItem>
                    <SelectItem value="not_exists">does not exist</SelectItem>
                    <SelectItem value="eq">===</SelectItem>
                    <SelectItem value="neq">!==</SelectItem>
                    <SelectItem value="gt">&gt;</SelectItem>
                    <SelectItem value="lt">&lt;</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label>Comparison Value</Label>
            <Input value={node.data.value || ''} onChange={(e) => onUpdate({ ...node.data, value: e.target.value })} className="bg-background/80" placeholder="e.g., true, 'text', 123" />
        </div>
    </div>
);

const CRMProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => {
    const action = node.data.action || 'list';
    
    const handleFieldChange = (field: string, value: string) => {
        const newData = { ...node.data, [field]: value };
        if (field === 'action') {
            const labelMap = { list: 'CRM: List Contacts', create: 'CRM: Create Contact', update: 'CRM: Update Contact', delete: 'CRM: Delete Contact' };
            newData.label = labelMap[value as keyof typeof labelMap] || `CRM: ${value}`;
        }
        onUpdate(newData);
    };

    return (
        <div className="space-y-3">
            <div>
                <Label>Action</Label>
                <Select value={action} onValueChange={(value) => handleFieldChange('action', value)}>
                    <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="list">List Contacts</SelectItem>
                        <SelectItem value="create">Create Contact</SelectItem>
                        <SelectItem value="update">Update Contact</SelectItem>
                        <SelectItem value="delete">Delete Contact</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {action === 'create' && (
                <>
                    <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={node.data.firstName || ''} onChange={(e) => handleFieldChange('firstName', e.target.value)} className="bg-background/80" placeholder="Jane" /></div>
                    <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={node.data.lastName || ''} onChange={(e) => handleFieldChange('lastName', e.target.value)} className="bg-background/80" placeholder="Doe" /></div>
                    <div><Label htmlFor="email">Email</Label><Input id="email" value={node.data.email || ''} onChange={(e) => handleFieldChange('email', e.target.value)} className="bg-background/80" placeholder="jane.doe@vandelay.com" /></div>
                    <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={node.data.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} className="bg-background/80" placeholder="555-1234"/></div>
                </>
            )}
             {(action === 'update' || action === 'delete') && (
                 <div><Label htmlFor="id">Contact ID</Label><Input id="id" value={node.data.id || ''} onChange={(e) => handleFieldChange('id', e.target.value)} className="bg-background/80" placeholder="Variable e.g., {payload.contactId}" /></div>
            )}
        </div>
    );
};

const TextareaProperties = ({ node, onUpdate, field, label, placeholder }: { node: Node, onUpdate: (data: any) => void, field: string, label: string, placeholder?: string }) => (
    <div>
        <Label htmlFor={field}>{label}</Label>
        <Textarea id={field} value={node.data[field] || ''} onChange={(e) => onUpdate({ ...node.data, [field]: e.target.value })} className="bg-background/80" placeholder={placeholder} rows={5} />
    </div>
);

const WingmanProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        <div>
            <Label>Message Mode</Label>
            <Select value={node.data.messageMode} onValueChange={(value) => onUpdate({ ...node.data, messageMode: value })}>
                <SelectTrigger className="bg-background/80"><SelectValue placeholder="Select mode..."/></SelectTrigger>
                <SelectContent>
                    {WingmanInputSchema.shape.messageMode.options.map(mode => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <TextareaProperties node={node} onUpdate={onUpdate} field="situationContext" label="Situation Context" placeholder="Describe the situation..." />
    </div>
);

const BarbaraProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
     <div className="space-y-3">
        <div>
            <Label>Task</Label>
            <Select value={node.data.task} onValueChange={(value) => onUpdate({ ...node.data, task: value })}>
                <SelectTrigger className="bg-background/80"><SelectValue placeholder="Select task..."/></SelectTrigger>
                <SelectContent>
                    {BarbaraTaskSchema.options.map(task => <SelectItem key={task} value={task}>{task.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <TextareaProperties node={node} onUpdate={onUpdate} field="documentText" label="Document Text" placeholder="Paste document here..." />
    </div>
);

const StonksBotProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        <div><Label htmlFor="ticker">Ticker Symbol</Label><Input id="ticker" value={node.data.ticker || ''} onChange={(e) => onUpdate({ ...node.data, ticker: e.target.value })} className="bg-background/80 font-mono" placeholder="GME" /></div>
        <div>
            <Label>Mode</Label>
            <Select value={node.data.mode || 'Meme-Lord'} onValueChange={(value) => onUpdate({ ...node.data, mode: value })}>
                <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {StonksBotModeSchema.options.map(mode => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    </div>
);

const JrocProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        <div><Label htmlFor="businessType">Business Type</Label><Input id="businessType" value={node.data.businessType || ''} onChange={(e) => onUpdate({ ...node.data, businessType: e.target.value })} className="bg-background/80" placeholder="e.g., mobile audio" /></div>
        <div>
            <Label>Logo Style</Label>
            <Select value={node.data.logoStyle || 'bling'} onValueChange={(value) => onUpdate({ ...node.data, logoStyle: value })}>
                <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {JrocInputSchema.shape.logoStyle.options.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    </div>
);

const SterileishProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        <div>
            <Label>Entry Type</Label>
            <Select value={node.data.entryType || 'general'} onValueChange={(value) => onUpdate({ ...node.data, entryType: value })}>
                <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                <SelectContent>
                     {SterileishAnalysisInputSchema.shape.entryType.options.map(type => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <TextareaProperties node={node} onUpdate={onUpdate} field="logText" label="Log Text" placeholder="e.g., Particle count for ISO-5 hood #3..." />
    </div>
);

const PamPooveyProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
     <div>
        <Label>HR Topic</Label>
        <Select value={node.data.topic || 'onboarding'} onValueChange={(value) => onUpdate({ ...node.data, topic: value })}>
            <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
            <SelectContent>
                {PamScriptInputSchema.shape.topic.options.map(topic => <SelectItem key={topic} value={topic}>{topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
        </Select>
    </div>
)


const GenericProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        {Object.entries(node.data).map(([key, value]) => (
            <div key={key}>
                <Label htmlFor={key} className="capitalize">{key}</Label>
                 <Input type="text" id={key} value={typeof value === 'object' ? JSON.stringify(value) : value} onChange={(e) => onUpdate({ ...node.data, [key]: e.target.value })} className="bg-background/80" />
            </div>
        ))}
    </div>
);


export default function PropertyInspector({ node, onUpdate }: PropertyInspectorProps) {
  const isMobile = useIsMobile();
  
  if (!node) {
    return (
      <div className="w-80 flex-shrink-0 bg-foreground/10 backdrop-blur-xl border border-foreground/20 rounded-lg p-4 items-center justify-center hidden lg:flex">
        <p className="text-sm text-muted-foreground">Select a node to inspect its properties.</p>
      </div>
    );
  }

  const handleDataUpdate = (newData: any) => onUpdate(node.id, newData);

  const renderContent = () => {
      switch(node.type) {
          case 'logic': return <LogicProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-crm_agent': return <CRMProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-winston_wolfe': return <TextareaProperties node={node} onUpdate={handleDataUpdate} field="reviewText" label="Review Text" placeholder="Paste negative review..." />;
          case 'tool-kif_kroker': return <div><Label>Channel ID</Label><Input value={node.data.channelId || ''} onChange={(e) => handleDataUpdate({channelId: e.target.value})} placeholder="e.g. C012AB3CD" /></div>;
          case 'tool-vandelay': return <div className="space-y-3"><div><Label>Topic Hint</Label><Input value={node.data.topicHint || ''} onChange={(e) => handleDataUpdate({ ...node.data, topicHint: e.target.value })} placeholder="e.g. design review" /></div><div className="flex items-center gap-2"><Switch checked={node.data.addAttendees} onCheckedChange={(val) => handleDataUpdate({...node.data, addAttendees: val})} /><Label>Add Fake Attendees</Label></div></div>;
          case 'tool-rolodex': return <div className="space-y-3"><div><Label>Candidate Name</Label><Input value={node.data.candidateName || ''} onChange={(e) => handleDataUpdate({...node.data, candidateName: e.target.value})} /></div><div><Label>Candidate Summary</Label><Textarea value={node.data.candidateSummary || ''} onChange={(e) => handleDataUpdate({...node.data, candidateSummary: e.target.value})} rows={3} /></div><div><Label>Job Description</Label><Textarea value={node.data.jobDescription || ''} onChange={(e) => handleDataUpdate({...node.data, jobDescription: e.target.value})} rows={3} /></div></div>;
          case 'tool-dr_syntax': return <div className="space-y-3"><div><Label>Content Type</Label><Select value={node.data.contentType || 'prompt'} onValueChange={(v) => handleDataUpdate({ ...node.data, contentType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="prompt">Prompt</SelectItem><SelectItem value="code">Code</SelectItem><SelectItem value="copy">Copy</SelectItem></SelectContent></Select></div><TextareaProperties node={node} onUpdate={handleDataUpdate} field="content" label="Content to Critique" /></div>;
          case 'tool-jroc': return <JrocProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-lahey_surveillance': return <TextareaProperties node={node} onUpdate={handleDataUpdate} field="logEntry" label="Log Entry" />;
          case 'tool-foremanator': return <TextareaProperties node={node} onUpdate={handleDataUpdate} field="logText" label="Daily Log" />;
          case 'tool-sterileish': return <SterileishProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-paper_trail': return <div><Label>Case File Name</Label><Input value={node.data.caseFile || ''} onChange={(e) => handleDataUpdate({caseFile: e.target.value})} placeholder="e.g., The Chicago Incident" /></div>;
          case 'tool-lumbergh': return <TextareaProperties node={node} onUpdate={handleDataUpdate} field="inviteText" label="Meeting Invite" />;
          case 'tool-lucille_bluth': return <div className="space-y-3"><div><Label>Expense</Label><Input value={node.data.expenseDescription || ''} onChange={(e) => handleDataUpdate({...node.data, expenseDescription: e.target.value})} /></div><div><Label>Amount</Label><Input type="number" value={node.data.expenseAmount || ''} onChange={(e) => handleDataUpdate({...node.data, expenseAmount: e.target.value})} /></div></div>;
          case 'tool-stonks_bot': return <StonksBotProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-barbara': return <BarbaraProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-wingman': return <WingmanProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-auditor': return <TextareaProperties node={node} onUpdate={handleDataUpdate} field="transactions" label="Transactions" placeholder="Paste CSV data..." />;
          case 'tool-kendra': return <TextareaProperties node={node} onUpdate={handleDataUpdate} field="productIdea" label="Product Idea" placeholder="Your revolutionary idea..." />;
          case 'tool-reno_mode': return <div><Label>Photo Variable Path</Label><Input value={node.data.photoDataUri || ''} onChange={(e) => handleDataUpdate({photoDataUri: e.target.value})} placeholder="{payload.car_photo_uri}" /></div>;
          case 'tool-vin_diesel': return <div><Label>VIN</Label><Input value={node.data.vin || ''} onChange={(e) => handleDataUpdate({vin: e.target.value})} placeholder="{payload.vehicle_id}" /></div>;
          case 'tool-pam_poovey': return <PamPooveyProperties node={node} onUpdate={handleDataUpdate} />;
          default:
              return <GenericProperties node={node} onUpdate={handleDataUpdate} />;
      }
  }

  const InspectorContainer = isMobile ? React.Fragment : Card;

  return (
    <div className="w-full lg:w-80 flex-shrink-0 bg-foreground/10 lg:backdrop-blur-xl lg:border lg:border-foreground/20 lg:rounded-lg p-4 flex-col gap-4 flex h-full">
      <h2 className="font-headline text-lg text-foreground">Inspector</h2>
      <ScrollArea className="flex-grow -mr-4 pr-4">
        <InspectorContainer>
            <CardHeader className="p-0">
                <CardTitle className="text-base">Properties: {node.data.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-0 pt-4">
                {renderContent()}
            </CardContent>
        </InspectorContainer>
      </ScrollArea>
    </div>
  );
}
