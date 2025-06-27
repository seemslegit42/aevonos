
'use client';
import React from 'react';
import type { Node } from '@/app/loom/page';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PropertyInspectorProps {
    node: Node | null;
    onUpdate: (nodeId: string, data: any) => void;
}

const renderPropertyInput = (key: string, value: any, handleUpdate: (key: string, value: any) => void) => {
    if (typeof value === 'string') {
        if (value.length > 50) { // Use textarea for longer strings
            return (
                <Textarea 
                    id={key}
                    name={key}
                    value={value}
                    onChange={(e) => handleUpdate(key, e.target.value)}
                    className="bg-background/80"
                    rows={3}
                />
            )
        }
        return (
            <Input 
                type="text" 
                id={key} 
                name={key}
                value={value} 
                onChange={(e) => handleUpdate(key, e.target.value)} 
                className="bg-background/80"
            />
        )
    }
    
    // For non-string values, show a disabled input with JSON representation
    return (
        <Input 
            type="text" 
            id={key} 
            name={key}
            value={JSON.stringify(value)} 
            disabled
            className="bg-muted/50"
        />
    )
}

export default function PropertyInspector({ node, onUpdate }: PropertyInspectorProps) {
  if (!node) {
    return (
      <div className="w-80 flex-shrink-0 bg-foreground/10 backdrop-blur-xl border border-foreground/20 rounded-lg p-4 items-center justify-center hidden lg:flex">
        <p className="text-sm text-muted-foreground">Select a node to inspect its properties.</p>
      </div>
    );
  }

  const handleUpdate = (key: string, value: any) => {
    onUpdate(node.id, { [key]: value });
  };


  return (
    <div className="w-80 flex-shrink-0 bg-foreground/10 backdrop-blur-xl border border-foreground/20 rounded-lg p-4 flex-col gap-4 hidden lg:flex">
      <h2 className="font-headline text-lg text-foreground">Inspector</h2>
      <ScrollArea className="flex-grow -mr-4 pr-4">
        <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="p-0">
                <CardTitle className="text-base">Properties: {node.data.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-0 pt-4">
                {Object.entries(node.data).map(([key, value]) => {
                    return (
                        <div key={key} className="grid w-full items-center gap-1.5">
                            <Label htmlFor={key} className="capitalize">{key}</Label>
                            {renderPropertyInput(key, value, handleUpdate)}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
}
