'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Mail } from 'lucide-react';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email({ message: 'A valid sigil is required.' }),
  password: z.string().min(1, 'A vow must be made.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const stepVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? 30 : -30,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'tween', duration: 0.5, ease: 'easeInOut' }
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction < 0 ? 30 : -30,
    transition: { type: 'tween', duration: 0.5, ease: 'easeInOut' }
  })
};

const StepOne = ({ nextStep }: { nextStep: () => void }) => (
    <motion.div
        key="step1"
        custom={1}
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="text-center space-y-4"
    >
        <div className="flex justify-center">
            <img src="/logo-green.png" alt="Aevon OS Logo" width="80" height="80" className="w-20 h-20" />
        </div>
        <h1 className="text-3xl font-headline tracking-widest text-primary">Rite of Invocation</h1>
        <p className="text-muted-foreground">The canvas must be summoned. State your claim.</p>
        <Button onClick={nextStep} variant="outline" className="w-full max-w-xs mx-auto text-lg h-12 border-2 text-roman-aqua border-roman-aqua hover:bg-primary/20 hover:text-primary-foreground">Cross the Threshold</Button>
    </motion.div>
);

const StepTwo = ({ nextStep, methods }: { nextStep: () => void, methods: any }) => {
    const { trigger, control } = methods;
    const handleContinue = async () => {
        const isValid = await trigger("email");
        if (isValid) nextStep();
    }
    return (
        <motion.div
            key="step2"
            custom={1}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center space-y-6 w-full max-w-sm"
        >
             <h2 className="text-2xl font-headline tracking-wider text-primary">Present your Sigil.</h2>
             <FormField
                control={control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="architect@aevonos.com" {...field} className="pl-10 text-center" />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <Button onClick={handleContinue} className="w-full">Continue</Button>
        </motion.div>
    );
}

const StepThree = ({ methods }: { methods: any }) => {
     const { control, formState: { isSubmitting } } = methods;
    return (
         <motion.div
            key="step3"
            custom={1}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center space-y-6 w-full max-w-sm"
        >
            <h2 className="text-2xl font-headline tracking-wider text-primary">Reaffirm your Vow.</h2>
            <FormField
                control={control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••••••••••" {...field} className="pl-10 text-center" />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Invoke The Canvas'}
            </Button>
        </motion.div>
    )
}


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'architect@aevonos.com',
      password: 'password123',
    },
  });

  const nextStep = () => {
      setDirection(1);
      setStep(s => s + 1);
  }

  async function onSubmit(values: LoginFormData) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication sequence failed. Check credentials.');
      }
      
      setStep(4); // Success step

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Vow Rejected.',
        description: (error as Error).message,
      });
    }
  }
  
  const renderStep = () => {
      switch(step) {
          case 1:
              return <StepOne nextStep={nextStep} />;
          case 2:
              return <StepTwo nextStep={nextStep} methods={methods} />;
          case 3:
              return <StepThree methods={methods} />;
          case 4:
              return (
                   <motion.div
                        key="step4"
                        custom={1}
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="text-center space-y-4"
                    >
                        <h1 className="text-2xl font-headline tracking-widest text-primary">Vow Accepted.</h1>
                        <p className="text-muted-foreground">The canvas materializes before you.</p>
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    </motion.div>
              );
          default:
              return null;
      }
  }

  return (
    <div className="w-full h-screen relative">
        <div className="absolute inset-0 z-0 flex items-center justify-center">
            <FlowerOfLifeIcon className="w-full max-w-3xl h-full max-h-3xl" />
        </div>
        <div className="w-full h-screen flex flex-col items-center justify-center p-4 relative z-10">
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full max-w-sm flex items-center justify-center min-h-[350px]">
                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                        {renderStep()}
                    </AnimatePresence>
                </form>
            </FormProvider>
            {step < 3 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                    Need system access?{' '}
                    <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                        Request a Build.
                    </Link>
                </div>
            )}
        </div>
    </div>
  );
}
