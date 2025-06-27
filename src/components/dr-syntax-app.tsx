'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { handleDrSyntaxCritique } from '@/app/actions';
import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
            className={`w-4 h-4 ${i < rating ? 'text-primary fill-primary' : 'text-muted-foreground/50'}`}
          />
        ))}
        <span className="ml-2 font-bold text-md text-foreground">{rating}/10</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Content to be Judged</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste your prompt, code, or copy here..."
                    className="min-h-[100px] bg-input/10 border-foreground/20 text-sm"
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
              <FormItem>
                <FormLabel className="sr-only">Content Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="copy" />
                      </FormControl>
                      <FormLabel className="font-normal text-xs">Copy</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="code" />
                      </FormControl>
                      <FormLabel className="font-normal text-xs">Code</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="prompt" />
                      </FormControl>
                      <FormLabel className="font-normal text-xs">Prompt</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending} className="w-full h-8 text-xs">
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Awaiting Judgment...</> : 'Submit'}
          </Button>
        </form>
      </Form>

      {isPending && !result && (
        <div className="text-center pt-4">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground text-xs">Dr. Syntax is sharpening his red pen...</p>
        </div>
      )}

      {result && (
        <div className="mt-4 pt-4 border-t border-foreground/20 space-y-3">
          <h4 className="font-headline text-md text-foreground">The Verdict</h4>
          <div className="space-y-3 text-xs">
            <div>
              <h5 className="font-semibold text-muted-foreground mb-1">Rating:</h5>
              {renderRating(result.rating)}
            </div>
              <div>
              <h5 className="font-semibold text-muted-foreground mb-1">Critique:</h5>
              <p className="text-foreground/90 italic">"{result.critique}"</p>
            </div>
            <div>
              <h5 className="font-semibold text-muted-foreground mb-1">Suggestion:</h5>
              <p className="text-foreground/90 font-mono bg-secondary/50 p-2 rounded-md">{result.suggestion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
