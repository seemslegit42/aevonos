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
import { useIsMobile } from '@/hooks/use-is-mobile';

interface PropertyInspectorProps {
    node: Node | null;
    onUpdate: (nodeId: string, data: any) => void;
}

const CRMProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => {
    const action = node.data.action || 'list';
    
    const handleFieldChange = (field: string, value: string) => {
        const newData = { ...node.data, [field]: value };
        if (field === 'action') {
            newData.label = value === 'create' ? 'CRM: Create Contact' : 'CRM: List Contacts';
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
                    </SelectContent>
                </Select>
            </div>
            {action === 'create' && (
                <>
                    <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={node.data.firstName || ''} onChange={(e) => handleFieldChange('firstName', e.target.value)} className="bg-background/80" placeholder="Jane" />
                    </div>
                     <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={node.data.lastName || ''} onChange={(e) => handleFieldChange('lastName', e.target.value)} className="bg-background/80" placeholder="Doe" />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={node.data.email || ''} onChange={(e) => handleFieldChange('email', e.target.value)} className="bg-background/80" placeholder="jane.doe@vandelay.com" />
                    </div>
                     <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={node.data.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} className="bg-background/80" placeholder="555-1234"/>
                    </div>
                </>
            )}
        </div>
    )
};

const WinstonWolfeProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => {
    return (
        <div className="space-y-3">
            <div>
                <Label htmlFor="reviewText">Review Text</Label>
                <Textarea 
                    id="reviewText"
                    value={node.data.reviewText || ''} 
                    onChange={(e) => onUpdate({ ...node.data, reviewText: e.target.value })} 
                    className="bg-background/80" 
                    placeholder="Paste the negative review here..."
                    rows={5}
                />
            </div>
        </div>
    )
};

const KifKrokerProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => {
    return (
        <div className="space-y-3">
            <div>
                <Label htmlFor="channelName">Channel Name</Label>
                <Input 
                    id="channelName"
                    value={node.data.channelName || ''} 
                    onChange={(e) => onUpdate({ ...node.data, channelName: e.target.value })} 
                    className="bg-background/80" 
                    placeholder="#project-phoenix"
                />
            </div>
            <div>
                <Label htmlFor="messageSamples">Message Samples</Label>
                <Textarea 
                    id="messageSamples"
                    value={Array.isArray(node.data.messageSamples) ? node.data.messageSamples.join('\\n') : ''}
                    onChange={(e) => onUpdate({ ...node.data, messageSamples: e.target.value.split('\\n') })} 
                    className="bg-background/80" 
                    placeholder="One message per line..."
                    rows={5}
                />
                 <p className="text-xs text-muted-foreground mt-1">Enter one message sample per line.</p>
            </div>
        </div>
    )
};

const VandelayProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => {
    return (
        <div className="space-y-3">
            <div>
                <Label htmlFor="topicHint">Topic Hint</Label>
                <Input 
                    id="topicHint"
                    value={node.data.topicHint || ''} 
                    onChange={(e) => onUpdate({ ...node.data, topicHint: e.target.value })} 
                    className="bg-background/80" 
                    placeholder="e.g., design review"
                />
            </div>
            <div className="flex items-center space-x-2">
                <Switch 
                    id="addAttendees"
                    checked={node.data.addAttendees || false}
                    onCheckedChange={(checked) => onUpdate({ ...node.data, addAttendees: checked })}
                />
                <Label htmlFor="addAttendees">Add Fake Attendees</Label>
            </div>
        </div>
    )
};

const RolodexProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        <div>
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input id="candidateName" value={node.data.candidateName || ''} onChange={(e) => onUpdate({ ...node.data, candidateName: e.target.value })} className="bg-background/80" placeholder="e.g., John Smith" />
        </div>
        <div>
            <Label htmlFor="candidateSummary">Candidate Summary</Label>
            <Textarea id="candidateSummary" value={node.data.candidateSummary || ''} onChange={(e) => onUpdate({ ...node.data, candidateSummary: e.target.value })} className="bg-background/80" placeholder="Paste resume summary here..." rows={4} />
        </div>
        <div>
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea id="jobDescription" value={node.data.jobDescription || ''} onChange={(e) => onUpdate({ ...node.data, jobDescription: e.target.value })} className="bg-background/80" placeholder="Paste job description here..." rows={4} />
        </div>
    </div>
);

const DrSyntaxProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        <div>
            <Label>Content Type</Label>
            <Select value={node.data.contentType || 'prompt'} onValueChange={(value) => onUpdate({ ...node.data, contentType: value })}>
                <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="prompt">Prompt</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="copy">Copy</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="content">Content to Critique</Label>
            <Textarea id="content" value={node.data.content || ''} onChange={(e) => onUpdate({ ...node.data, content: e.target.value })} className="bg-background/80" placeholder="Paste content here..." rows={6} />
        </div>
    </div>
);

const JrocProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Input id="businessType" value={node.data.businessType || ''} onChange={(e) => onUpdate({ ...node.data, businessType: e.target.value })} className="bg-background/80" placeholder="e.g., mobile audio" />
        </div>
        <div>
            <Label>Logo Style</Label>
            <Select value={node.data.logoStyle || 'bling'} onValueChange={(value) => onUpdate({ ...node.data, logoStyle: value })}>
                <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="bling">Bling</SelectItem>
                    <SelectItem value="chrome">Chrome</SelectItem>
                    <SelectItem value="dank minimal">Dank Minimal</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
);

const LaheyProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div>
        <Label htmlFor="logEntry">Log Entry</Label>
        <Textarea id="logEntry" value={node.data.logEntry || ''} onChange={(e) => onUpdate({ ...node.data, logEntry: e.target.value })} className="bg-background/80" placeholder="e.g., Kyle D. opened YouTube for 22 minutes." rows={4} />
    </div>
);

const ForemanatorProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div>
        <Label htmlFor="logText">Daily Log Text</Label>
        <Textarea id="logText" value={node.data.logText || ''} onChange={(e) => onUpdate({ ...node.data, logText: e.target.value })} className="bg-background/80" placeholder="Paste raw site log here..." rows={5} />
    </div>
);

const SterileishProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        <div>
            <Label>Entry Type</Label>
            <Select value={node.data.entryType || 'general'} onValueChange={(value) => onUpdate({ ...node.data, entryType: value })}>
                <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="calibration">Calibration</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="logText">Log Text</Label>
            <Textarea id="logText" value={node.data.logText || ''} onChange={(e) => onUpdate({ ...node.data, logText: e.target.value })} className="bg-background/80" placeholder="e.g., Particle count for ISO-5 hood #3..." rows={4} />
        </div>
    </div>
);

const PaperTrailProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
     <div>
        <Label htmlFor="caseFile">Case File Name</Label>
        <Input id="caseFile" value={node.data.caseFile || ''} onChange={(e) => onUpdate({ ...node.data, caseFile: e.target.value })} className="bg-background/80" placeholder="e.g., The Chicago Incident" />
        <p className="text-xs text-muted-foreground mt-1">Note: Receipt photo must be passed as a variable from a preceding node or trigger payload.</p>
    </div>
);

const GenericProperties = ({ node, onUpdate }: { node: Node, onUpdate: (data: any) => void }) => (
    <div className="space-y-3">
        {Object.entries(node.data).map(([key, value]) => (
            <div key={key}>
                <Label htmlFor={key} className="capitalize">{key}</Label>
                 <Input 
                    type="text" 
                    id={key}
                    value={typeof value === 'object' ? JSON.stringify(value) : value} 
                    onChange={(e) => onUpdate({ ...node.data, [key]: e.target.value })} 
                    className="bg-background/80"
                />
            </div>
        ))}
    </div>
);


export default function PropertyInspector({ node, onUpdate }: PropertyInspectorProps) {
  const isMobile = useIsMobile();
  
  if (!node) {
    // On desktop, show a placeholder. On mobile, this component won't be rendered if there's no node.
    return (
      <div className="w-80 flex-shrink-0 bg-foreground/10 backdrop-blur-xl border border-foreground/20 rounded-lg p-4 items-center justify-center hidden lg:flex">
        <p className="text-sm text-muted-foreground">Select a node to inspect its properties.</p>
      </div>
    );
  }

  const handleDataUpdate = (newData: any) => {
    onUpdate(node.id, newData);
  };

  const renderContent = () => {
      switch(node.type) {
          case 'tool-crm':
              return <CRMProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-winston-wolfe':
              return <WinstonWolfeProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-kif-kroker':
              return <KifKrokerProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-vandelay':
              return <VandelayProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-rolodex':
              return <RolodexProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-dr-syntax':
              return <DrSyntaxProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-jroc':
              return <JrocProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-lahey':
              return <LaheyProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-foremanator':
              return <ForemanatorProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-sterileish':
              return <SterileishProperties node={node} onUpdate={handleDataUpdate} />;
          case 'tool-paper-trail':
              return <PaperTrailProperties node={node} onUpdate={handleDataUpdate} />;
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
