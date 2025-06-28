
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';

const formSchema = z.object({
  workspaceName: z.string().trim().min(1, { message: "Every masterpiece needs a title." }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email({ message: "A valid email is required to establish a connection." }),
  password: z.string().min(8, { message: "Key must be at least 8 characters. For your own good." }),
});

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      workspaceName: "",
      email: "",
      password: "",
    },
    mode: 'onChange',
  });
  
  const { isSubmitting, trigger } = form.formState;

  const updateStep = async (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    
    if (newStep > step) {
        let fieldsToValidate: (keyof FormData)[] = [];
        if (step === 1) fieldsToValidate = ['workspaceName'];
        if (step === 2) fieldsToValidate = ['firstName', 'lastName'];
        const isValid = await trigger(fieldsToValidate);
        if (isValid) setStep(newStep);
    } else {
        setStep(newStep);
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
        throw new Error(errorMsg || 'Workspace creation failed.');
      }
      
      toast({
        title: 'Build Request Received.',
        description: 'Your canvas is being prepared. Welcome to ΛΞVON OS.',
      });

      router.push('/');
      router.refresh();

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Build Failed.',
        description: (error as Error).message,
      });
    }
  }

  const stepVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'tween', duration: 0.4, ease: "easeInOut" }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: { type: 'tween', duration: 0.4, ease: "easeInOut" }
    })
  };
  
  return (
    <div className="w-full h-screen relative">
       <div className="absolute inset-0 z-0 flex items-center justify-center">
            <FlowerOfLifeIcon className="w-full max-w-3xl h-full max-h-3xl" />
        </div>
      <div className="w-full h-screen flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-sm bg-background/80 backdrop-blur-md">
          <CardHeader className="text-center space-y-4 pt-8">
              <div className="flex justify-center">
                   <CrystalIcon className="w-16 h-16 text-primary crystal-pulse" />
              </div>
              <div>
                <CardTitle className="text-3xl font-headline tracking-widest text-foreground">
                  Request a Build
                </CardTitle>
                <CardDescription className="text-muted-foreground h-5">
                   <AnimatePresence mode="wait">
                      <motion.span
                          key={step}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="block"
                      >
                          {step === 1 && "First, every masterpiece needs a title."}
                          {step === 2 && "Excellent. Now, who is the architect?"}
                          {step === 3 && "Finally, secure your creation."}
                      </motion.span>
                  </AnimatePresence>
                </CardDescription>
              </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="relative min-h-[12rem]">
                  <AnimatePresence mode="wait" initial={false} custom={direction}>
                      <motion.div
                          key={step}
                          custom={direction}
                          variants={stepVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="space-y-3 absolute w-full"
                      >
                      {step === 1 && (
                          <FormField
                          control={form.control}
                          name="workspaceName"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Canvas Title</FormLabel>
                              <FormControl>
                                  <Input placeholder="Vandelay Industries" {...field} disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      )}
                      {step === 2 && (
                          <div className="grid grid-cols-2 gap-4">
                              <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Art" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                              />
                              <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Vandelay" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                              />
                          </div>
                      )}
                      {step === 3 && (
                          <div className="space-y-3">
                              <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>System Handle</FormLabel>
                                  <FormControl>
                                      <Input type="email" placeholder="agent@aevonos.com" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                              />
                              <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Encryption Key</FormLabel>
                                  <FormControl>
                                      <Input type="password" placeholder="Min. 8 characters" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                              />
                          </div>
                      )}
                      </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex gap-4 pt-2">
                  {step > 1 && (
                      <Button type="button" variant="outline" onClick={() => updateStep(step-1)} className="w-full" disabled={isSubmitting}>
                          <ArrowLeft /> Back
                      </Button>
                  )}
                  {step < 3 ? (
                      <Button type="button" onClick={() => updateStep(step+1)} className="w-full" disabled={isSubmitting}>
                          Next <ArrowRight />
                      </Button>
                  ) : (
                       <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Forge Canvas'}
                      </Button>
                  )}
                </div>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have a build?{' '}
              <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                Verify Identity
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
