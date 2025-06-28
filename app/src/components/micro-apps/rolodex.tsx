'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Clipboard, FileText, UserPlus, UserCheck } from 'lucide-react';
import type { RolodexAnalysisOutput } from '@/ai/agents/rolodex-schemas';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Contact } from '@/ai/tools/crm-schemas';
import { Skeleton } from '../ui/skeleton';
import { useAppStore } from '@/store/app-store';

function RolodexResult({ result }: { result: RolodexAnalysisOutput }) {
    const { toast } = useToast();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
          title: 'Icebreaker Copied',
          description: 'Ready to paste into your outreach email.',
        });
    };

    return (
        <div className="space-y-3 pt-2">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-primary">Fit Score</span>
                    <span className="text-lg font-bold text-primary">{result.fitScore}%</span>
                </div>
                <Progress value={result.fitScore} className="h-2 [&>div]:bg-primary" />
            </div>

            <Alert variant="default" className="bg-background/50">
              <FileText className="h-4 w-4" />
              <AlertTitle>AI-Generated Summary</AlertTitle>
              <AlertDescription>{result.summary}</AlertDescription>
            </Alert>
            
            <Alert variant="default" className="bg-background/50">
              <Clipboard className="h-4 w-4" />
              <AlertTitle className="flex justify-between items-center">
                  <span>Outreach Icebreaker</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(result.icebreaker)}>
                      <Clipboard className="h-3 w-3" />
                  </Button>
              </AlertTitle>
              <AlertDescription className="italic">"{result.icebreaker}"</AlertDescription>
            </Alert>
        </div>
    )
}

export default function TheRolodex(props: RolodexAnalysisOutput | {}) {
  const { handleCommandSubmit, isLoading } = useAppStore(state => ({
    handleCommandSubmit: state.handleCommandSubmit,
    isLoading: state.isLoading
  }));
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<RolodexAnalysisOutput | null>(null);
  const [activeTab, setActiveTab] = useState("new");
  
  const [candidateName, setCandidateName] = useState('');
  const [candidateSummary, setCandidateSummary] = useState('');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  useEffect(() => {
    if (props && 'fitScore' in props) {
      setResult(props);
    }
  }, [props]);


  useEffect(() => {
    async function fetchContacts() {
      setIsContactLoading(true);
      try {
        const response = await fetch('/api/contacts');
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error("Failed to fetch contacts", error);
      } finally {
        setIsContactLoading(false);
      }
    }
    if (activeTab === 'existing') {
        fetchContacts();
    }
  }, [activeTab]);

  const handleAnalysis = (name: string, summary: string) => {
    if (!summary || !jobDescription) return;
    const command = `analyze candidate "${name}" with summary "${summary}" for the job description: "${jobDescription}"`;
    handleCommandSubmit(command);
  };
  
  const handleNewCandidateAnalysis = () => {
      handleAnalysis(candidateName, candidateSummary);
  }
  
  const handleExistingContactAnalysis = () => {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (!contact) return;
      const summary = `Existing contact. Name: ${contact.firstName} ${contact.lastName}. Email: ${contact.email}. Phone: ${contact.phone}.`;
      handleAnalysis(`${contact.firstName} ${contact.lastName}`, summary);
  }
  
  const isAnalysisDisabled = isLoading || !jobDescription || (activeTab === 'new' && !candidateSummary) || (activeTab === 'existing' && !selectedContactId);

  return (
    <div className="p-2 space-y-3 h-full flex flex-col">
        <Tabs defaultValue="new" onValueChange={setActiveTab} className="flex-grow flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new"><UserPlus className="mr-2"/>New Candidate</TabsTrigger>
                <TabsTrigger value="existing"><UserCheck className="mr-2"/>Analyze Contact</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="flex-grow space-y-2 mt-2">
                <Input 
                    placeholder="Candidate Name (Optional)"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/50"
                />
                <Textarea
                  placeholder="Paste candidate resume summary here..."
                  value={candidateSummary}
                  onChange={(e) => setCandidateSummary(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  className="bg-background/50"
                />
            </TabsContent>
            <TabsContent value="existing" className="flex-grow space-y-2 mt-2">
                 {isContactLoading ? (
                    <Skeleton className="h-10 w-full" />
                 ) : (
                    <Select onValueChange={setSelectedContactId} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a contact to analyze..." />
                        </SelectTrigger>
                        <SelectContent>
                            {contacts.map(contact => (
                                <SelectItem key={contact.id} value={contact.id}>
                                    {contact.firstName} {contact.lastName} ({contact.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 )}
            </TabsContent>

            <div className="flex-shrink-0 space-y-2 pt-2 border-t border-border/50">
                <Textarea
                    placeholder="Paste job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                    className="bg-background/50"
                />
                <Button className="w-full" onClick={() => {
                    if (activeTab === 'new') {
                         handleNewCandidateAnalysis()
                    } else {
                        handleExistingContactAnalysis()
                    }
                }} disabled={isAnalysisDisabled}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2"/>Analyze Fit</>}
                </Button>
            </div>
        </Tabs>
      
      {result && <RolodexResult result={result} />}
    </div>
  );
}
