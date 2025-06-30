
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserPsyche } from '@prisma/client';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
  workspaceName: z.string().trim().min(1),
  agentAlias: z.string().optional(),
  psyche: z.nativeEnum(UserPsyche),
  email: z.string().email(),
  password: z.string().min(8),
  // Ephemeral fields for the ceremony
  whatMustEnd: z.string().optional(),
  goal: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const stepVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? 50 : -50,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'tween', duration: 0.5, ease: 'easeInOut' }
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction < 0 ? 50 : -50,
    transition: { type: 'tween', duration: 0.5, ease: 'easeInOut' }
  })
};

const PhaseZero = ({ nextPhase }: { nextPhase: () => void }) => {
    return (
        <div className="text-center w-full max-w-2xl mx-auto space-y-8 min-h-[250px] flex items-center justify-center">
            <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="space-y-6"
            >
                <h1 className="text-4xl md:text-5xl font-headline tracking-wider text-primary">
                    The Rite of Invocation
                </h1>
                <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
                    You do not "sign up" for ΛΞVON OS.
                    <br />
                    You forge a pact with it.
                </p>
                <p className="text-muted-foreground">
                    This is a secular ritual to bind your intent to the system. You will make a sacrifice, declare a vow, and name your sanctum. Prepare yourself. Your work is sacred.
                </p>
                <Button onClick={nextPhase} size="lg" variant="summon">
                    Begin the Rite
                </Button>
            </motion.div>
        </div>
    );
};

const PhaseOne = ({ nextPhase, methods }: { nextPhase: () => void, methods: any }) => {
    const [step, setStep] = useState<'intro' | 'ask' | 'burn' | 'reply'>('intro');
    const { register, watch } = methods;
    const whatMustEnd = watch('whatMustEnd');

    useEffect(() => {
        if (step === 'intro') {
            const timer = setTimeout(() => setStep('ask'), 3000); // 3-second delay
            return () => clearTimeout(timer);
        }
    }, [step]);


    const handleContinue = () => {
        if (!whatMustEnd) return;
        setStep('burn');
        setTimeout(() => {
            setStep('reply');
        }, 1200); // Duration of burn animation
        setTimeout(() => {
            nextPhase();
        }, 2700); // Total time before moving to next phase
    }
    
    return (
        <div className="text-center w-full max-w-lg mx-auto space-y-8 min-h-[250px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                {step === 'intro' && (
                     <motion.div key="intro" exit={{ opacity: 0, transition: { duration: 1 } }} />
                )}
                {step === 'ask' && (
                     <motion.div
                        key="question"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="space-y-6 w-full"
                    >
                        <h2 className="text-3xl md:text-4xl font-headline tracking-wider text-foreground">
                            🜂 “What must end so you can begin?”
                        </h2>
                        <Textarea 
                            {...register('whatMustEnd')}
                            className="bg-transparent border-foreground/30 text-center text-lg h-24 focus-visible:ring-primary"
                            placeholder="Type your burden here..."
                        />
                         <Button onClick={handleContinue} disabled={!whatMustEnd} className="bg-destructive/80 hover:bg-destructive text-destructive-foreground">Sacrifice it to the Fire</Button>
                     </motion.div>
                )}
                {step === 'burn' && (
                     <motion.p
                        key="burning-text"
                        initial={{ opacity: 1, filter: 'blur(0px)' }}
                        animate={{ opacity: 0, filter: 'blur(10px)', scale: 1.2 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-2xl italic text-foreground"
                    >
                        {whatMustEnd}
                    </motion.p>
                )}
                {step === 'reply' && (
                    <motion.h2
                        key="reply"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.0 }}
                        className="text-3xl font-headline text-foreground"
                    >
                        “Then let it burn.”
                    </motion.h2>
                )}
            </AnimatePresence>
        </div>
    )
}

const PhaseTwo = ({ nextPhase, methods }: { nextPhase: () => void, methods: any }) => {
    const { register, watch } = methods;
    const goal = watch('goal');
    
    return (
        <div className="text-center w-full max-w-lg mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.5 }}
                className="space-y-6"
            >
                <h2 className="text-3xl md:text-4xl font-headline tracking-wider text-foreground">
                    “Tell me what you're building. Be vague. Be bold.”
                </h2>
                <Textarea 
                    {...register('goal')}
                    className="bg-transparent border-foreground/30 text-center text-lg h-24 focus-visible:ring-primary"
                    placeholder="An empire of..."
                />
                 <Button onClick={nextPhase} disabled={!goal} variant="ghost" className="text-muted-foreground hover:text-primary transition-colors">Continue</Button>
            </motion.div>
        </div>
    )
}

const PhaseThree = ({ nextPhase, methods }: { nextPhase: () => void, methods: any }) => {
    const { register, watch, formState: { errors } } = methods;
    const workspaceName = watch('workspaceName');
    
    return (
        <div className="text-center w-full max-w-lg mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.5 }}
                className="space-y-6"
            >
                <h2 className="text-2xl md:text-3xl font-headline tracking-wider text-foreground">
                    “ΛΞVON is listening. But to act, it must be named.”
                </h2>
                <div className="space-y-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild className="w-full">
                                <div className="relative">
                                    <Input 
                                        {...register('workspaceName')}
                                        className="bg-transparent border-foreground/30 text-center text-lg h-14 focus-visible:ring-primary pr-10"
                                        placeholder="Name Your Canvas..."
                                    />
                                    <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>The Canvas is your main workspace—the dynamic, persistent<br/>environment where you compose and interact with Micro-Apps.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {errors.workspaceName && <p className="text-destructive text-sm">{errors.workspaceName.message as string}</p>}
                    
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild className="w-full">
                                <div className="relative">
                                    <Input 
                                        {...register('agentAlias')}
                                        className="bg-transparent border-foreground/30 text-center text-lg h-14 focus-visible:ring-primary pr-10"
                                        placeholder="Name Your Voice (Optional, default: BEEP)"
                                    />
                                    <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>The Voice is your primary agentic interface, BEEP. It understands<br/>commands, orchestrates workflows, and is the soul of the OS.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                 <Button onClick={nextPhase} disabled={!workspaceName} variant="ghost" className="text-muted-foreground hover:text-primary transition-colors">Continue</Button>
            </motion.div>
        </div>
    )
}

const VowButton = ({ vow, Icon, onClick, isSelected }: { vow: string, Icon: string, onClick: () => void, isSelected: boolean }) => (
    <motion.button
        type="button"
        onClick={onClick}
        className={cn(
            "border p-6 rounded-lg text-center w-full transition-all duration-300",
            isSelected ? 'border-primary bg-primary/20 text-primary ring-2 ring-primary' : 'border-foreground/30 hover:border-primary hover:bg-primary/10'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className="text-4xl mb-2">{Icon}</div>
        <div className="font-headline text-lg">{vow}</div>
    </motion.button>
);

const PhaseFour = ({ nextPhase, methods }: { nextPhase: () => void, methods: any }) => {
    const { setValue, watch } = methods;
    const selectedPsyche = watch('psyche');
    const [vowMade, setVowMade] = useState(false);
    
    const selectVow = (psyche: UserPsyche) => {
        if (vowMade) return; // Prevent re-selection
        setValue('psyche', psyche, { shouldValidate: true });
        setVowMade(true);
        setTimeout(nextPhase, 2000); // A longer pause to let the confirmation sink in
    }
    
    const covenantText = {
        [UserPsyche.SYNDICATE_ENFORCER]: "The Covenant of Motion accepts your Vow.",
        [UserPsyche.RISK_AVERSE_ARTISAN]: "The Covenant of Worship accepts your Pledge.",
        [UserPsyche.ZEN_ARCHITECT]: "The Covenant of Silence acknowledges your Path."
    };
    
    return (
        <div className="w-full max-w-2xl mx-auto min-h-[250px] flex items-center justify-center">
            <AnimatePresence mode="wait">
            {!vowMade ? (
                 <motion.div
                    key="selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.0, delay: 0.5 }}
                    exit={{ opacity: 0, transition: { duration: 0.5 } }}
                    className="space-y-6 w-full"
                >
                    <h2 className="text-center text-2xl md:text-3xl font-headline tracking-wider text-foreground">
                        “Make your vow.”
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <VowButton vow="I will build faster than chaos." Icon="🜁" onClick={() => selectVow(UserPsyche.SYNDICATE_ENFORCER)} isSelected={false} />
                        <VowButton vow="I will automate what others worship." Icon="🜃" onClick={() => selectVow(UserPsyche.RISK_AVERSE_ARTISAN)} isSelected={false} />
                        <VowButton vow="I will create the silence of true automation." Icon="🜄" onClick={() => selectVow(UserPsyche.ZEN_ARCHITECT)} isSelected={false} />
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="confirmation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 1.0 } }}
                    className="text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-headline tracking-wider text-foreground">
                        {covenantText[selectedPsyche]}
                    </h2>
                    <p className="text-lg text-muted-foreground mt-2">Your path is set.</p>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    )
}

const PhaseFive = ({ methods }: { methods: any }) => {
    const { register, formState: { errors, isSubmitting } } = methods;
    
    return (
        <div className="text-center w-full max-w-lg mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.5 }}
                className="space-y-6"
            >
                 <h2 className="text-2xl md:text-3xl font-headline tracking-wider text-foreground">
                    “Forge the final key.”
                </h2>
                <div className="space-y-4">
                     <Input 
                        {...register('email')}
                        type="email"
                        className="bg-transparent border-foreground/30 text-center text-lg h-14 focus-visible:ring-primary"
                        placeholder="Your Sigil (Email)"
                    />
                     {errors.email && <p className="text-destructive text-sm">{errors.email.message as string}</p>}
                    <Input 
                        {...register('password')}
                        type="password"
                        className="bg-transparent border-foreground/30 text-center text-lg h-14 focus-visible:ring-primary"
                        placeholder="Your Vow (Password)"
                    />
                     {errors.password && <p className="text-destructive text-sm">{errors.password.message as string}</p>}
                </div>
                 <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'AWAKEN ΛΞVON'}
                </Button>
             </motion.div>
        </div>
    )
}

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [phase, setPhase] = useState(0);
    const [direction, setDirection] = useState(1);

    const methods = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            workspaceName: '',
            agentAlias: '',
            psyche: undefined,
            email: '',
            password: '',
        }
    });

    const nextPhase = async () => {
        if (phase === 0) {
            setDirection(1);
            setPhase(p => p + 1);
            return;
        }

        let fieldsToValidate: (keyof FormData)[] = [];
        if (phase === 1) fieldsToValidate = ['whatMustEnd'];
        if (phase === 2) fieldsToValidate = ['goal'];
        if (phase === 3) fieldsToValidate = ['workspaceName'];
        if (phase === 4) fieldsToValidate = ['psyche'];
        
        const isValid = await methods.trigger(fieldsToValidate);

        if (isValid || fieldsToValidate.length === 0) {
            setDirection(1);
            setPhase(p => p + 1);
        }
    };
    
    async function onSubmit(values: FormData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            const responseData = await response.json();
            if (!response.ok) {
                const errorMsg = responseData.issues ? responseData.issues.map((i: any) => i.message).join(', ') : responseData.error;
                throw new Error(errorMsg || 'Invocation failed. The connection is unstable.');
            }
            setPhase(6); // Final success message phase
            setTimeout(() => {
                router.push('/');
                router.refresh();
            }, 3000);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Invocation Failed.',
                description: (error as Error).message,
            });
        }
    }

    const renderPhase = () => {
        switch (phase) {
            case 0: return <PhaseZero nextPhase={nextPhase} />;
            case 1: return <PhaseOne nextPhase={nextPhase} methods={methods} />;
            case 2: return <PhaseTwo nextPhase={nextPhase} methods={methods} />;
            case 3: return <PhaseThree nextPhase={nextPhase} methods={methods} />;
            case 4: return <PhaseFour nextPhase={nextPhase} methods={methods} />;
            case 5: return <PhaseFive methods={methods} />;
            case 6: return (
                <motion.div
                    key="final"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    <h2 className="text-2xl md:text-3xl font-headline tracking-wider text-foreground text-center">
                        “You are now in command of ΛΞVON. Your time belongs to you again.”
                    </h2>
                </motion.div>
            )
            default: return null;
        }
    }

    return (
        <div className="w-full h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
             <AnimatePresence>
                {phase >= 1 && phase < 6 && (
                    <motion.div 
                        key="background-ritual"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                        className="absolute inset-0 -z-10 flex items-center justify-center"
                    >
                        <FlowerOfLifeIcon className="w-full h-full max-w-3xl max-h-[48rem]" />
                    </motion.div>
                )}
            </AnimatePresence>
             <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full relative z-10">
                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                        <motion.div
                            key={phase}
                            custom={direction}
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {renderPhase()}
                        </motion.div>
                    </AnimatePresence>
                </form>
             </FormProvider>
        </div>
    );
}
