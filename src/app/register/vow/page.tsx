
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserPsyche } from '@prisma/client';

const formSchema = z.object({
  whatMustEnd: z.string().min(10, { message: "Your sacrifice must have meaning. Be more descriptive."}),
  goal: z.string().min(10, { message: "A vague vow is a weak vow. Be specific." }),
  workspaceName: z.string().min(2, { message: "Every empire needs a name." }),
  agentAlias: z.string().min(2, { message: "Your voice must have a name." }),
  psyche: z.nativeEnum(UserPsyche, { errorMap: () => ({ message: "You must choose a path." }) }),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 'sacrifice', fields: ['whatMustEnd'], title: 'The Sacrifice', description: "What must end so you can begin?" },
  { id: 'vow', fields: ['goal'], title: 'The Vow', description: "Tell me what you will build." },
  { id: 'naming', fields: ['workspaceName', 'agentAlias'], title: 'The Naming', description: "The system must be named to be commanded." },
  { id: 'covenant', fields: ['psyche'], title: 'The Covenant', description: "Choose your path. This choice is final." },
];

const psycheOptions = [
    { value: UserPsyche.ZEN_ARCHITECT, label: 'The Way of Silence', description: 'Minimalism. Efficiency. Focus. You are the Architect.' },
    { value: UserPsyche.SYNDICATE_ENFORCER, label: 'The Way of Motion', description: 'Speed. Ambition. Results. You are the Enforcer.' },
    { value: UserPsyche.RISK_AVERSE_ARTISAN, label: 'The Way of Worship', description: 'Meticulousness. Perfection. Safety. You are the Artisan.' },
];

export default function VowPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            whatMustEnd: '',
            goal: '',
            workspaceName: '',
            agentAlias: 'BEEP',
            psyche: undefined,
        },
    });

    if (loading) {
        return <div className="flex h-screen w-screen items-center justify-center"><Loader2 className="animate-spin h-12 w-12" /></div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

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
            const token = await user.getIdToken();
            const response = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to complete the Rite of Invocation.');
            }
            
            const result = await response.json();

            toast({
                title: "The Pact is Forged.",
                description: result.benediction || "Welcome, Sovereign.",
                duration: 10000,
            });

            router.push('/');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "The Rite Failed",
                description: error instanceof Error ? error.message : "An unknown error occurred.",
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-center font-headline text-2xl text-primary">The Rite of Invocation</CardTitle>
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="font-semibold">{steps[currentStep].title}</h3>
                                    <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
                                </div>
                                
                                {currentStep === 0 && (
                                     <Textarea {...form.register('whatMustEnd')} placeholder="e.g., The tyranny of dashboards and endless SaaS tabs." rows={4} />
                                )}
                                {currentStep === 1 && (
                                     <Textarea {...form.register('goal')} placeholder="e.g., An agentic operating system that anticipates, acts, and disappears." rows={4} />
                                )}
                                {currentStep === 2 && (
                                    <div className="space-y-4">
                                        <Input {...form.register('workspaceName')} placeholder="Your Canvas Name" />
                                        <Input {...form.register('agentAlias')} placeholder="Your Agent's Name" />
                                    </div>
                                )}
                                {currentStep === 3 && (
                                    <RadioGroup
                                        onValueChange={(value) => form.setValue('psyche', value as UserPsyche)}
                                        defaultValue={form.getValues('psyche')}
                                        className="gap-4"
                                    >
                                        {psycheOptions.map(option => (
                                            <Label key={option.value} className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                                <RadioGroupItem value={option.value} />
                                                <div>
                                                    <p className="font-semibold">{option.label}</p>
                                                    <p className="text-xs text-muted-foreground">{option.description}</p>
                                                </div>
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                )}
                                <AnimatePresence>
                                {Object.values(form.formState.errors).length > 0 && (
                                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                        <p className="text-sm font-medium text-destructive text-center">
                                            {Object.values(form.formState.errors)[0].message}
                                        </p>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                                <div className="flex justify-between items-center pt-4">
                                    <Button type="button" variant="ghost" onClick={handlePrev} disabled={currentStep === 0}>Back</Button>
                                    
                                    {currentStep < steps.length - 1 ? (
                                        <Button type="button" onClick={handleNext}>Next</Button>
                                    ) : (
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" />Forge the Pact</>}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}
