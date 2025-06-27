'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, Edit2, Loader2 } from 'lucide-react';
import { generateSolution } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

type ReviewStatus = 'pending' | 'loading' | 'solved' | 'archived';

interface Review {
  id: number;
  source: string;
  text: string;
  status: ReviewStatus;
  solution?: string;
}

const initialProblems: Review[] = [
  { id: 1, source: 'Google', text: "Your coffee was cold and the service was slow.", status: 'pending' },
  { id: 2, source: 'Yelp', text: "The music is way too loud in here. I couldn't even hear my friend.", status: 'pending' },
  { id: 3, source: 'X', text: "Just waited 25 minutes for a bagel. A single bagel. Never coming back. @YourBrand", status: 'pending' },
  { id: 4, source: 'Amateur', text: "I HATE THIS PLACE IT'S THE WORST EVER", status: 'archived' },
];

export default function TheWinstonWolfe() {
  const [reviews, setReviews] = useState<Review[]>(initialProblems);
  const { toast } = useToast();

  const handleGenerateSolution = async (reviewId: number) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'loading' } : r));

    const result = await generateSolution({ reviewText: review.text });

    setReviews(prev => prev.map(r => 
      r.id === reviewId 
        ? { ...r, status: 'solved', solution: result.suggestedResponse } 
        : r
    ));
  };

  const handleApprove = (reviewId: number) => {
     setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'archived' } : r));
     toast({ title: 'The Fixer', description: "Problem solved. On to the next one." });
  };
  
  const handleRequestAlternative = (reviewId: number) => {
    toast({ title: 'The Fixer', description: "Noted. I'll take a different approach next time." });
    // Re-trigger generation
    handleGenerateSolution(reviewId);
  };

  const activeReviews = reviews.filter(r => r.status !== 'archived');

  return (
    <div className="p-2 h-full flex flex-col">
        <p className="text-xs text-muted-foreground italic px-2">"I solve problems."</p>
        <ScrollArea className="flex-grow pr-2">
            <div className="space-y-3 pt-2">
                {activeReviews.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">The scene is clean.</p>
                    </div>
                )}
                {activeReviews.map(review => (
                    <Card key={review.id} className="bg-background/50">
                        <CardHeader>
                            <CardTitle className="text-base text-foreground/80">Situation on {review.source}</CardTitle>
                            <CardDescription className="text-sm">"{review.text}"</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {review.status === 'pending' && (
                                <Button className="w-full" onClick={() => handleGenerateSolution(review.id)}>
                                    Call The Fixer
                                </Button>
                            )}
                            {review.status === 'loading' && (
                                <Button className="w-full" disabled>
                                    <Loader2 className="animate-spin mr-2" />
                                    Reviewing the situation...
                                </Button>
                            )}
                            {review.status === 'solved' && review.solution && (
                                <Alert className="bg-background border-accent">
                                    <AlertTitle>Suggested Response</AlertTitle>
                                    <AlertDescription className="italic">
                                        {review.solution}
                                    </AlertDescription>
                                    <div className="flex gap-2 mt-3 justify-end">
                                        <Button variant="ghost" size="sm" onClick={() => handleRequestAlternative(review.id)}>
                                            <Edit2 className="mr-2" />
                                            Alternative
                                        </Button>
                                        <Button size="sm" onClick={() => handleApprove(review.id)}>
                                            <Check className="mr-2" />
                                            Approve & Post
                                        </Button>
                                    </div>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    </div>
  );
}
