'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Loader2, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserPsyche } from '@prisma/client';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';

const formSchema = z.object({
  whatMustEnd: z.string().min(10, { message: "Your sacrifice must have meaning. Be more descriptive."}),
  goal: z.string().min(10, { message: "A vague vow is a weak vow. Be specific." }),
  workspaceName: z.string().min(2, { message: "Every empire needs a name." }),
  agentAlias: z.string().min(2, { message: "Your voice must have a name." }),
  psyche: z.nativeEnum(UserPsyche, { errorMap: () => ({ message: "You must choose a path." }) }),
});

type FormData = z.infer<typeof formSchema>;

const stepFields: (keyof FormData)[][] = [
    ['whatMustEnd', 'goal'],
    ['workspaceName', 'agentAlias'],
    ['psyche']
];

const psycheOptions = [
    { value: UserPsyche.ZEN_ARCHITECT, label: 'The Way of Silence', description: 'Minimalism. Efficiency. Focus. You are the Architect.', symbol: '🜄' },
    { value: UserPsyche.SYNDICATE_ENFORCER, label: 'The Way of Motion', description: 'Speed. Ambition. Results. You are the Enforcer.', symbol: '🜁' },
    { value: UserPsyche.RISK_AVERSE_ARTISAN, label: 'The Way of Worship', description: 'Meticulousness. Perfection. Safety. You are the Artisan.', symbol: '🜃' },
];

const motionVariants = {
    hidden: { opacity: 0, x: 50 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

export default function VowPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: 'onTouched',
        defaultValues: {
            agentAlias: 'BEEP',
        },
    });

    const { isSubmitting } = form.formState;

    const handleNext = async () => {
        const fields = stepFields[step - 1];
        const isValid = await form.trigger(fields);
        if (isValid) {
            setStep(prev => prev + 1);
        }
    }

    const handlePrev = () => {
        setStep(prev => prev - 1);
    }

    const onSubmit = async (data: FormData) => {
        try {
            const response = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to complete the Rite of Invocation.');
            }
            
            toast({
                title: 'Pact Forged',
                description: 'Your pact is complete. Welcome to the Canvas.',
            });
            router.push('/');
            router.refresh();

        } catch (error) {
            toast({
                variant: 'destructive',
                title: "The Rite Failed",
                description: error instanceof Error ? error.message : "An unknown error occurred.",
            });
        }
    };
    
    return (
        <div className="flex h-screen w-screen items-center justify-center p-4 relative overflow-hidden">
             <div className="absolute top-0 z-[-2] h-full w-full bg-background">
                <div 
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
                />
                <div 
                    className="absolute inset-0 animate-aurora bg-[linear-gradient(135deg,hsl(var(--iridescent-one)/0.2),hsl(var(--iridescent-two)/0.2)_50%,hsl(var(--iridescent-three)/0.2)_100%)] bg-[length:600%_600%]"
                />
                <div className="absolute inset-0 grain-overlay" />
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none -z-10">
                    <FlowerOfLifeIcon className="w-full h-full max-w-3xl max-h-3xl" />
                </div>
            </div>

            <div className="w-full max-w-lg bg-background/50 backdrop-blur-xl border border-border/20 p-8 rounded-2xl shadow-2xl">
                 <div className="text-center mb-6">
                    <h1 className="text-3xl font-headline text-primary">Make Your Vow</h1>
                    <p className="text-muted-foreground mt-1">Forge your pact. Define your purpose. The system awakens for you.</p>
                </div>
                
                <div className="relative pt-1 mb-6">
                    <div className="overflow-hidden h-1 text-xs flex rounded bg-primary/20">
                        <div style={{ width: `${((step - 1) / 3) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"></div>
                        <div style={{ width: `${(1 / 3) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary/50 animate-pulse"></div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                variants={motionVariants}
                                initial="hidden"
                                animate="enter"
                                exit="exit"
                                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                                className="min-h-[310px]"
                            >
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <FormField control={form.control} name="whatMustEnd" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>The Sacrifice</FormLabel>
                                                <FormDescription>What aspect of the old world must end?</FormDescription>
                                                <FormControl><Textarea placeholder="e.g., The tyranny of dashboards and endless SaaS tabs." {...field} rows={3} className="bg-background/50"/></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="goal" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>The Vow</FormLabel>
                                                <FormDescription>What new reality will you build?</FormDescription>
                                                <FormControl><Textarea placeholder="e.g., An agentic OS that anticipates, acts, and disappears." {...field} rows={3} className="bg-background/50"/></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                )}
                                {step === 2 && (
                                        <div className="space-y-4">
                                        <FormField control={form.control} name="workspaceName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name Your Canvas</FormLabel>
                                                <FormDescription>This is the name of your sovereign digital nation.</FormDescription>
                                                <FormControl><Input placeholder="My Empire" {...field} className="bg-background/50"/></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="agentAlias" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name Your Voice</FormLabel>
                                                <FormDescription>This is the name of your agentic core.</FormDescription>
                                                <FormControl><Input placeholder="BEEP" {...field} className="bg-background/50"/></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                )}
                                {step === 3 && (
                                    <FormField control={form.control} name="psyche" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Choose Your Covenant</FormLabel>
                                            <FormDescription>This choice attunes the OS to your will and cannot be changed.</FormDescription>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="gap-4 pt-2">
                                                    {psycheOptions.map(option => (
                                                        <FormItem key={option.value}>
                                                            <FormControl>
                                                                <RadioGroupItem value={option.value} className="sr-only" id={option.value} />
                                                            </FormControl>
                                                            <Label htmlFor={option.value} className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-accent/10 bg-background/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10">
                                                                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary text-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                                                                    <Check className="h-4 w-4" />
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <p className="font-semibold flex items-center gap-2">
                                                                        <span className="text-lg">{option.symbol}</span>
                                                                        {option.label}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">{option.description}</p>
                                                                </div>
                                                            </Label>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between items-center pt-6">
                            <div>
                                {step > 1 && (
                                    <Button type="button" variant="ghost" onClick={handlePrev} disabled={isSubmitting}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                {step < 3 && (
                                    <Button type="button" onClick={handleNext}>
                                        Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                                {step === 3 && (
                                        <Button type="submit" disabled={isSubmitting} variant="summon">
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" />Forge the Pact</>}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
