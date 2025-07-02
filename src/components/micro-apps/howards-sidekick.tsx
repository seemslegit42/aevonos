
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, HardHat, Feather, BookOpen, Dog, PawPrint, MessageSquare, Plus } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const reminders = [
  { title: "Safety Check", time: "08:00 AM", description: "Tool inspection and PPE check. Howard would've nudged you." },
  { title: "Hydration Break", time: "10:30 AM", description: "Water is your best friend on site. Second best, anyway." },
  { title: "Lunch", time: "12:30 PM", description: "Time to refuel. Even a good boy needs to eat." },
  { title: "End of Day Cleanup", time: "04:30 PM", description: "Leave the site clean. Make Howard proud." },
];

const tools = [
  { title: "Voltage Drop Calculator", content: "A quick link or embedded tool to calculate voltage drop over a specific distance and wire gauge." },
  { title: "NEC Code Quick Reference", content: "A searchable or collapsible list of frequently referenced National Electrical Code articles." },
  { title: "Conduit Bending Cheat Sheet", content: "Diagrams and formulas for common bends like offsets, saddles, and kicks." },
];

const quotes = [
  "The best boy never cuts corners. Neither should you.",
  "Loyalty is measured in watts and weekends. Stay grounded.",
  "A wagging tail means a job well done. Go earn it.",
  "Be the person your dog thinks you are, especially on a 240V circuit.",
];

type Note = {
  id: number;
  content: string;
  timestamp: string;
};

export default function HowardsSidekick() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now(),
      content: newNote,
      timestamp: format(new Date(), "PPpp"),
    };
    setNotes([note, ...notes]);
    setNewNote('');
    toast({
      description: "Note saved to the log.",
    });
  };

  const changeQuote = () => {
    const newIndex = (quotes.indexOf(currentQuote) + 1) % quotes.length;
    setCurrentQuote(quotes[newIndex]);
  };

  return (
    <div className="h-full flex flex-col p-2 bg-sidekick-brown/10 text-sidekick-gold-foreground border border-sidekick-brown/50 rounded-lg">
      <Tabs defaultValue="reminders" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-sidekick-brown/20 text-sidekick-gold-foreground">
          <TabsTrigger value="reminders" className="data-[state=active]:bg-sidekick-brown data-[state=active]:text-sidekick-gold-foreground"><Bell className="h-4 w-4 mr-2" />Reminders</TabsTrigger>
          <TabsTrigger value="logger" className="data-[state=active]:bg-sidekick-brown data-[state=active]:text-sidekick-gold-foreground"><BookOpen className="h-4 w-4 mr-2" />Logger</TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-sidekick-brown data-[state=active]:text-sidekick-gold-foreground"><HardHat className="h-4 w-4 mr-2" />Tools</TabsTrigger>
        </TabsList>
        <TabsContent value="reminders" className="flex-grow mt-2 overflow-y-auto">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="p-1">
              <CardTitle className="text-base flex items-center gap-2"><Dog className="text-sidekick-gold"/> Howard's Beacon</CardTitle>
              <CardDescription className="text-xs">Reminders to keep you safe and sane. He's got your back.</CardDescription>
            </CardHeader>
            <CardContent className="p-1 space-y-2">
              {reminders.map(r => (
                <div key={r.title} className="p-2 rounded-md border border-sidekick-brown/30 bg-sidekick-brown/10">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{r.title}</p>
                    <p className="text-xs font-mono text-sidekick-gold/80">{r.time}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logger" className="flex-grow mt-2 flex flex-col gap-2">
           <Card className="bg-transparent border-0 shadow-none flex-shrink-0">
             <CardHeader className="p-1">
                <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="text-sidekick-gold"/>Legacy Logger</CardTitle>
                <CardDescription className="text-xs">Jot down notes, wins, or moments. It's your private log.</CardDescription>
            </CardHeader>
            <CardContent className="p-1 space-y-2">
                <Textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log a thought..."
                    className="bg-sidekick-brown/10 border-sidekick-brown/50 placeholder:text-muted-foreground"
                    rows={2}
                />
                <Button onClick={handleAddNote} className="w-full bg-sidekick-gold text-sidekick-brown hover:bg-sidekick-gold/90"><Plus className="mr-2"/> Add to Log</Button>
            </CardContent>
           </Card>
           <ScrollArea className="flex-grow">
               <div className="space-y-2">
                {notes.map(note => (
                    <div key={note.id} className="p-2 rounded-md border border-sidekick-brown/30 bg-sidekick-brown/10">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-1 text-right">{note.timestamp}</p>
                    </div>
                ))}
               </div>
           </ScrollArea>
        </TabsContent>
        <TabsContent value="tools" className="flex-grow mt-2 overflow-y-auto">
             <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="p-1">
                    <CardTitle className="text-base flex items-center gap-2"><PawPrint className="text-sidekick-gold"/> Tools of the Trade</CardTitle>
                    <CardDescription className="text-xs">Dustin's favorite shortcuts and wisdom.</CardDescription>
                </CardHeader>
                <CardContent className="p-1">
                     <Accordion type="single" collapsible className="w-full">
                        {tools.map(tool => (
                             <AccordionItem value={tool.title} key={tool.title}>
                                <AccordionTrigger>{tool.title}</AccordionTrigger>
                                <AccordionContent>
                                    {tool.content}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      <div className="flex-shrink-0 mt-2 p-2 border-t border-sidekick-brown/30 flex items-center justify-between gap-2">
         <Feather className="w-4 h-4 text-sidekick-gold/70" />
         <p className="text-xs italic text-muted-foreground flex-grow text-center">"{currentQuote}"</p>
         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={changeQuote}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m12 6-4 4 4 4"/><path d="m16 14 4-4-4-4"/></svg>
         </Button>
      </div>
    </div>
  );
}
