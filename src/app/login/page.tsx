
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Icosahedron, Edges } from '@react-three/drei';
import * as THREE from 'three';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
  email: z.string().email({ message: "A valid email is required for system entry." }),
  password: z.string().min(1, { message: "A password is required. Even I can't get you in without it." }),
});

const emailPlaceholders = [
    "architect@aevonos.com",
    "the.one@the.matrix",
    "beep_is_my_friend@aevonos.com",
    "agent.smith@the.system",
    "enter.the.void@aevonos.com"
];

const passwordPlaceholders = [
    "••••••••••••••",
    "The password is 'password'. Just kidding. Or am I?",
    "It's definitely not '123456'",
    "The key to the universe... or just your password.",
];

// 3D Scene Component
function LoginScene() {
  const group = useRef<THREE.Group>(null!);

  const crystals = useMemo(() => {
    return Array.from({ length: 100 }, () => ({
      position: [
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 20 - 5,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as const,
      scale: Math.random() * 0.2 + 0.1,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    }));
  }, []);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.position.lerp(new THREE.Vector3(state.mouse.x * 1.5, state.mouse.y * 1.5, 0), 0.05);
      group.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={group}>
      {crystals.map((crystal, i) => (
        <group key={i} position={crystal.position} rotation={crystal.rotation}>
            <Icosahedron
              args={[1, 1]}
              scale={crystal.scale}
            >
              <meshStandardMaterial
                color="hsl(var(--primary))"
                emissive="hsl(var(--primary))"
                emissiveIntensity={0.4}
                roughness={0.1}
                metalness={0.9}
                transparent
                opacity={0.6}
              />
              <Edges scale={1.001} color="white" />
            </Icosahedron>
        </group>
      ))}
    </group>
  );
}


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [emailPlaceholder, setEmailPlaceholder] = useState(emailPlaceholders[0]);
  const [passwordPlaceholder, setPasswordPlaceholder] = useState(passwordPlaceholders[0]);

  useEffect(() => {
      const emailInterval = setInterval(() => {
          setEmailPlaceholder(p => {
              const currentIndex = emailPlaceholders.indexOf(p);
              const nextIndex = (currentIndex + 1) % emailPlaceholders.length;
              return emailPlaceholders[nextIndex];
          });
      }, 3000);

      const passwordInterval = setInterval(() => {
          setPasswordPlaceholder(p => {
              const currentIndex = passwordPlaceholders.indexOf(p);
              const nextIndex = (currentIndex + 1) % passwordPlaceholders.length;
              return passwordPlaceholders[nextIndex];
          });
      }, 4500);

      return () => {
          clearInterval(emailInterval);
          clearInterval(passwordInterval);
      };
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

      toast({
        title: 'Identity Verified.',
        description: 'Welcome back, Architect. The canvas awaits.',
      });
      router.push('/');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Access Denied.',
        description: (error as Error).message,
      });
    }
  }

  return (
    <div className="w-full h-screen bg-background">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={5} color="hsl(var(--primary))" />
        <pointLight position={[-10, -10, 5]} intensity={3} color="hsl(var(--accent))" />
        
        <LoginScene />
        
        <Html center>
           <Card className="w-full max-w-sm bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl text-white">
            <CardHeader className="text-center space-y-4 pt-8">
                <div className="flex justify-center">
                    <CrystalIcon className="w-16 h-16 text-primary crystal-pulse" />
                </div>
                <div>
                    <CardTitle className="text-3xl font-headline tracking-widest text-white">
                        Identity Verification
                    </CardTitle>
                    <CardDescription className="text-white/70">The system requires a handshake.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">System Handle</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder={emailPlaceholder} 
                            {...field} 
                            disabled={isSubmitting} 
                            className="bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary"
                          />
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
                        <div className="flex justify-between items-center">
                            <FormLabel className="text-white/80">Encryption Key</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">
                                            Key forgotten?
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tough luck. Try to remember it. I'm an OS, not a locksmith.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder={passwordPlaceholder}
                            {...field} 
                            disabled={isSubmitting} 
                            className="bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary/80 backdrop-blur-sm border border-primary text-white hover:bg-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Authenticate & Enter'}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm text-white/60">
                Need system access?{' '}
                <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Request a build.
                </Link>
              </div>
            </CardContent>
          </Card>
        </Html>
      </Canvas>
    </div>
  );
}
