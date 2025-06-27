
'use client';
import React from 'react';
import type { Node } from '@/app/loom/page';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PropertyInspectorProps {
    node: Node | null;
    onUpdate: (nodeId: string, data: any) => void;
}

export default function PropertyInspector({ node, onUpdate }: PropertyInspectorProps) {
  if (!node) {
    return (
      <div className="w-80 flex-shrink-0 bg-foreground/10 backdrop-blur-xl border border-foreground/20 rounded-lg p-4 items-center justify-center hidden lg:flex">
        <p className="text-sm text-muted-foreground">Select a node to inspect its properties.</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(node.id, { [e.target.name]: e.target.value });
  };


  return (
    <div className="w-80 flex-shrink-0 bg-foreground/10 backdrop-blur-xl border border-foreground/20 rounded-lg p-4 flex-col gap-4 hidden lg:flex">
      <h2 className="font-headline text-lg text-foreground">Inspector</h2>
      <Card className="bg-background/50">
          <CardHeader>
              <CardTitle className="text-base">Properties for: {node.data.label}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="label">Label</Label>
                  <Input 
                    type="text" 
                    id="label" 
                    name="label"
                    value={node.data.label} 
                    onChange={handleInputChange} 
                  />
              </div>
              {Object.entries(node.data).map(([key, value]) => {
                  if (key === 'label') return null;
                  return (
                      <div key={key} className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor={key} className="capitalize">{key}</Label>
                          <Input 
                            type="text" 
                            id={key} 
                            name={key}
                            value={value} 
                            onChange={handleInputChange} 
                          />
                      </div>
                  )
              })}
          </CardContent>
      </Card>
    </div>
  );
}
