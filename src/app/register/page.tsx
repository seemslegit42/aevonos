
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, MailCheck, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserPsyche } from '@prisma/client';

const formSchema = z.object({
  email: z.string().email({ message: "A valid designation is required." }),
  whatMustEnd: z.string().min(10, { message: "Your sacrifice must have meaning. Be more descriptive."}),
  goal: z.string().min(10, { message: "A vague vow is a weak vow. Be specific." }),
  workspaceName: z.string().min(2, { message: "Every empire needs a name." }),
  agentAlias: z.string().min(2, { message: "Your voice must have a name." }),
  psyche: z.nativeEnum(UserPsyche, { errorMap: () => ({ message: "You must choose a path." }) }),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 'designation', fields: ['email'], title: 'The Rite of Invocation', description: 'Begin the whisper. State your designation.' },
  { id: 'vow', fields: ['whatMustEnd', 'goal'], title: 'The Vow & Sacrifice', description: "What must end so you can begin? What will you build?" },
  { id: 'naming', fields: ['workspaceName', 'agentAlias'], title: 'The Naming', description: "The system must be named to be commanded." },
  { id: 'covenant', fields: ['psyche'], title: 'The Covenant', description: "Choose your path. This choice is final." },
];

const psycheOptions = [
    { value: UserPsyche.ZEN_ARCHITECT, label: 'The Way of Silence', description: 'Minimalism. Efficiency. Focus. You are the Architect.' },
    { value: UserPsyche.SYNDICATE_ENFORCER, label: 'The Way of Motion', description: 'Speed. Ambition. Results. You are the Enforcer.' },
    { value: UserPsyche.RISK_AVERSE_ARTISAN, label: 'The Way of Worship', description: 'Meticulousness. Perfection. Safety. You are the Artisan.' },
];

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: 'onTouched',
        defaultValues: {
            whatMustEnd: '',
            goal: '',
            workspaceName: '',
            agentAlias: 'BEEP',
            psyche: undefined,
            email: '',
        },
    });

    const handleNext = async () => {
        const fieldsToValidate = steps[currentStep].fields as (keyof FormData)[];
        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep(prev => prev + 1);
        }
    };
    
    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
    };

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to complete the Rite of Invocation.');
            }
            
            window.localStorage.setItem('emailForSignIn', data.email);
            setIsSubmitted(true);
            
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "The Rite Failed",
                description: error instanceof Error ? error.message : "An unknown error occurred.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg">
                 <AnimatePresence mode="wait">
                 {isSubmitted ? (
                     <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center space-y-4 p-8"
                    >
                        <MailCheck className="w-16 h-16 mx-auto text-accent" />
                        <h2 className="text-2xl font-bold font-headline">The Pact is Forged</h2>
                        <p className="text-muted-foreground">The ether has acknowledged your vow. Follow the echo sent to your designation to enter the Canvas.</p>
                        <Button onClick={() => router.push('/login')}>Return to Chamber</Button>
                    </motion.div>
                ) : (
                    <motion.div key="form" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                        <CardHeader>
                            <CardTitle className="text-center font-headline text-2xl text-primary">{steps[currentStep].title}</CardTitle>
                             <CardDescription className="text-center">{steps[currentStep].description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ x: 300, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -300, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="min-h-[180px]"
                                        >
                                            {currentStep === 0 && (
                                                <FormField control={form.control} name="email" render={({ field }) => (
                                                    <FormItem className="space-y-4">
                                                        <FormControl>
                                                            <Input placeholder="initiate@example.com" {...field} className="bg-background/50" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            )}
                                            {currentStep === 1 && (
                                                <div className="space-y-4">
                                                    <FormField control={form.control} name="whatMustEnd" render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Textarea placeholder="What must end... e.g., The tyranny of dashboards and endless SaaS tabs." {...field} rows={3} className="bg-background/50"/>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="goal" render={({ field }) => (
                                                         <FormItem>
                                                            <FormControl>
                                                                <Textarea placeholder="What you will build... e.g., An agentic operating system that anticipates, acts, and disappears." {...field} rows={3} className="bg-background/50"/>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            )}
                                            {currentStep === 2 && (
                                                <div className="space-y-4">
                                                    <FormField control={form.control} name="workspaceName" render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="Your Canvas Name" {...field} className="bg-background/50"/>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                     <FormField control={form.control} name="agentAlias" render={({ field }) => (
                                                         <FormItem>
                                                             <FormControl>
                                                                <Input placeholder="Your Agent's Name (e.g., BEEP)" {...field} className="bg-background/50"/>
                                                             </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            )}
                                            {currentStep === 3 && (
                                                <FormField control={form.control} name="psyche" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="gap-4">
                                                                {psycheOptions.map(option => (
                                                                    <FormItem key={option.value}>
                                                                        <FormControl>
                                                                            <RadioGroupItem value={option.value} className="sr-only" id={option.value} />
                                                                        </FormControl>
                                                                        <Label htmlFor={option.value} className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-accent/10 bg-background/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10">
                                                                             <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary text-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                                                                                <Check className="h-4 w-4" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold">{option.label}</p>
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
                                    <div className="flex justify-between items-center pt-4">
                                        <Button type="button" variant="ghost" onClick={handlePrev} disabled={currentStep === 0 || isSubmitting}>Back</Button>
                                        
                                        {currentStep < steps.length - 1 ? (
                                            <Button type="button" onClick={handleNext}>Next</Button>
                                        ) : (
                                            <Button type="submit" disabled={isSubmitting} variant="summon">
                                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" />Forge the Pact</>}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="mt-4 text-center text-sm">
                                        Already have a pact?{" "}
                                        <Link href="/login" className="underline">
                                            Enter the Chamber.
                                        </Link>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </motion.div>
                )}
                </AnimatePresence>
            </Card>
        </div>
    );
}
