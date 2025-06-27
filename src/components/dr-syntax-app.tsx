'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { handleDrSyntaxCritique } from '@/app/actions';
import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star } from 'lucide-react';

const formSchema = z.object({
  content: z.string().min(10, { message: "Surely you can write more than that. I need at least 10 characters to critique." }),
  contentType: z.enum(['prompt', 'code', 'copy'], { required_error: "You must select a content type. I'm not a mind reader." }),
});

type FormValues = z.infer<typeof formSchema>;

export function DrSyntaxApp() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<DrSyntaxOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      contentType: 'copy',
    },
  });

  function onSubmit(values: FormValues) {
    setResult(null);
    startTransition(async () => {
      const critiqueResult = await handleDrSyntaxCritique(values);
      setResult(critiqueResult);
    });
  }

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
          />
        ))}
        <span className="ml-2 font-bold text-lg text-foreground">{rating}/10</span>
      </div>
    );
  };

  return (
    <div className="p-4 bg-background/50 rounded-lg">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-foreground">Consult Dr. Syntax</CardTitle>
          <CardDescription className="text-muted-foreground">Submit your pitiful content for a brutally honest, yet effective, critique.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content to be Judged</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your prompt, code, or copy here. Don't be shy, I've seen worse. Probably."
                        className="min-h-[150px] bg-input/10 border-foreground/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Content Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="copy" />
                          </FormControl>
                          <FormLabel className="font-normal">Copy</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="code" />
                          </FormControl>
                          <FormLabel className="font-normal">Code</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="prompt" />
                          </FormControl>
                          <FormLabel className="font-normal">Prompt</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Awaiting Judgment...</> : 'Submit for Critique'}
              </Button>
            </form>
          </Form>

          {isPending && !result && (
            <div className="text-center mt-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Dr. Syntax is sharpening his red pen...</p>
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-6">
              <Card className="bg-foreground/5 border-foreground/20">
                <CardHeader>
                  <CardTitle className="font-headline text-xl text-foreground">The Verdict</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-1">Rating:</h4>
                    {renderRating(result.rating)}
                  </div>
                   <div>
                    <h4 className="font-semibold text-muted-foreground mb-1">Critique:</h4>
                    <p className="text-foreground/90 italic">"{result.critique}"</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-1">Suggestion:</h4>
                    <p className="text-foreground/90 font-mono bg-secondary/50 p-3 rounded-md">{result.suggestion}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
