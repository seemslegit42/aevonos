
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { signIn } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image';

const credentialSchema = z.object({
  email: z.string().email({ message: 'A valid sigil is required.' }),
  password: z.string().min(1, { message: 'A vow must be spoken.' }),
});
type CredentialFormValues = z.infer<typeof credentialSchema>;

const magicLinkSchema = z.object({
    email: z.string().email({ message: 'A valid sigil is required for the invocation link.' }),
});
type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isCredentialSubmitting, setIsCredentialSubmitting] = useState(false);
  const [isMagicLinkSubmitting, setIsMagicLinkSubmitting] = useState(false);

  const credentialForm = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    defaultValues: { email: '', password: '' },
  });

  const magicLinkForm = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' },
  });

  const onCredentialSubmit = async (values: CredentialFormValues) => {
    setError(null);
    setIsCredentialSubmitting(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        throw new Error('Invalid Sigil or Vow. The ritual was rejected.');
      }
      
      router.push('/');
      router.refresh();

    } catch (err: any) {
      const errorMessage = err.message || 'An unknown disturbance occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Invocation Failed',
        description: errorMessage,
      });
    } finally {
        setIsCredentialSubmitting(false);
    }
  };

  const onMagicLinkSubmit = async (values: MagicLinkFormValues) => {
    setError(null);
    setIsMagicLinkSubmitting(true);
    try {
      // This will redirect to the default NextAuth verification page on success
      const result = await signIn('resend', { email: values.email, redirect: false });

       if (result?.error) {
          throw new Error('Could not send invocation link. The aether is disturbed.');
       }

       toast({
           title: "Invocation Link Sent",
           description: "A temporary key has been sent to your Sigil. Check your inbox."
       });
       // In a real app, you'd show a "check your email" page here.
       // For now, we just inform the user.

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send invocation link.';
      setError(errorMessage);
      toast({
          variant: 'destructive',
          title: 'Invocation Failed',
          description: errorMessage,
      });
    } finally {
        setIsMagicLinkSubmitting(false);
    }
  };

  const isSubmitting = isCredentialSubmitting || isMagicLinkSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 overflow-hidden">
        <div className="absolute top-0 z-[-2] h-screen w-full bg-background">
          <div 
            className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
          />
          <div 
            className="absolute inset-0 animate-aurora bg-[linear-gradient(135deg,hsl(var(--iridescent-one)/0.2),hsl(var(--iridescent-two)/0.2)_50%,hsl(var(--iridescent-three)/0.2)_100%)] bg-[length:600%_600%]"
          />
          <div className="absolute inset-0 grain-overlay" />
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none -z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
                className="relative w-1/2 h-1/2 max-w-lg"
              >
                <Image 
                    src="/logo.png" 
                    alt="Aevon OS Watermark"
                    fill
                    priority
                    className="object-contain"
                />
              </motion.div>
          </div>
        </div>
      
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative w-full max-w-sm group"
        >
            <div className="absolute -inset-0.5 -z-10 rounded-2xl bg-gradient-to-r from-primary via-accent to-roman-aqua blur-lg opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse" />
            <div className="relative p-6 sm:p-8 rounded-2xl bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg text-center space-y-4">
                
                <div className="relative">
                    <Image
                        src="/logo.png"
                        alt="ΛΞVON OS Logo"
                        width={80}
                        height={80}
                        className="mx-auto"
                        priority
                    />
                    <h1 className="text-2xl font-headline mt-4 text-foreground">Resume the Ritual</h1>
                    <p className="text-sm text-muted-foreground mt-1">The Canvas awaits its Architect.</p>
                </div>
                
                <Tabs defaultValue="vow" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="vow">Vow (Password)</TabsTrigger>
                        <TabsTrigger value="magic">Magic Link</TabsTrigger>
                    </TabsList>
                    <TabsContent value="vow" className="pt-4">
                        <Form {...credentialForm}>
                        <form onSubmit={credentialForm.handleSubmit(onCredentialSubmit)} className="space-y-4">
                            <FormField
                            control={credentialForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input
                                    type="email"
                                    placeholder="Enter Sigil..."
                                    className="bg-background/50 text-center h-12 text-base border-border/40 focus-visible:ring-primary"
                                    disabled={isSubmitting}
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={credentialForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                <Input
                                        type="password"
                                        placeholder="Speak Vow..."
                                        className="bg-background/50 text-center h-12 text-base border-border/40 focus-visible:ring-primary"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button variant="summon" type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                            {isCredentialSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            Summon Canvas
                            </Button>
                        </form>
                        </Form>
                    </TabsContent>
                    <TabsContent value="magic" className="pt-4">
                        <p className="text-xs text-muted-foreground pb-4">Receive a temporary key to the Canvas. For those who travel light.</p>
                        <Form {...magicLinkForm}>
                            <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
                                <FormField
                                    control={magicLinkForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormControl>
                                            <Input
                                            type="email"
                                            placeholder="Enter Sigil..."
                                            className="bg-background/50 text-center h-12 text-base border-border/40 focus-visible:ring-primary"
                                            disabled={isSubmitting}
                                            {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button variant="outline" type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                                {isMagicLinkSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                Send Invocation Link
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
                
                <div className="relative text-xs text-muted-foreground">
                    <Separator className="my-4 bg-border/20"/>
                    <p>New Operator?{' '}
                      <Link href="/register" className="font-medium text-roman-aqua hover:text-roman-aqua/80 transition-colors">
                        Perform the Rite of Invocation.
                      </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    </div>
  );
}
