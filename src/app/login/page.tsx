
'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const Crystal = React.memo(({ position, scale, rotation }: { position: [number, number, number], scale: [number, number, number], rotation: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geomRef = useRef<THREE.IcosahedronGeometry>(null!);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotation[0] * 0.01;
      meshRef.current.rotation.y += rotation[1] * 0.01;
      meshRef.current.rotation.z += rotation[2] * 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={scale}>
        <icosahedronGeometry ref={geomRef} args={[1, 15]} />
        <meshPhysicalMaterial
          roughness={0}
          transmission={1}
          thickness={0.5}
          ior={2.3}
          color="white"
        />
        <Edges>
          <lineBasicMaterial color="white" />
        </Edges>
      </mesh>
    </group>
  );
});
Crystal.displayName = 'Crystal';


const Scene = () => {
    const groupRef = useRef<THREE.Group>(null!);
    
    useFrame(() => {
        if(groupRef.current) {
            groupRef.current.rotation.y += 0.001;
        }
    });

    const crystals = useMemo(() => {
        const temp = [];
        const r = 2;
        
        const calculatedPositions = [
            [0, 0], // Center
            ...Array.from({ length: 6 }, (_, i) => [r * Math.cos(i * Math.PI / 3), r * Math.sin(i * Math.PI / 3)]),
            ...Array.from({ length: 6 }, (_, i) => [r * 2 * Math.cos(i * Math.PI / 3), r * 2 * Math.sin(i * Math.PI / 3)]),
            ...Array.from({ length: 6 }, (_, i) => [r * Math.sqrt(3) * Math.cos(i * Math.PI / 3 + Math.PI / 6), r * Math.sqrt(3) * Math.sin(i * Math.PI / 3 + Math.PI / 6)])
        ];
        
        const uniquePositions = Array.from(
            new Map(calculatedPositions.map(p => [`${p[0].toFixed(2)},${p[1].toFixed(2)}`, p])).values()
        ).slice(0, 19);

        for (let i = 0; i < uniquePositions.length; i++) {
            const [x, z] = uniquePositions[i];
            temp.push({
                key: i,
                position: [x, 0, z] as [number, number, number],
                scale: [Math.random() * 0.4 + 0.2, Math.random() * 0.8 + 0.3, Math.random() * 0.4 + 0.2] as [number, number, number],
                rotation: [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1] as [number, number, number],
            });
        }
        return temp;
    }, []);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="hsl(var(--primary))"/>
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="hsl(var(--accent))" />
      {crystals.map((crystal) => (
        <Crystal key={crystal.key} {...crystal} />
      ))}
    </group>
  );
};

const formSchema = z.object({
  email: z.string().email({ message: "A valid email is required for system entry." }),
  password: z.string().min(1, { message: "An encryption key is required." }),
});

const emailPlaceholders = [
    'architect@aevonos.com',
    'the.one@the.matrix',
    'your.handle@the.grid',
    'operator@zion.net',
];

const passwordPlaceholders = [
    '••••••••••••••••',
    'The password is \'password\'. Or is it?',
    'Cognito, ergo sum.',
    'There is no spoon.',
];


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [emailPlaceholder, setEmailPlaceholder] = React.useState(emailPlaceholders[0]);
  const [passwordPlaceholder, setPasswordPlaceholder] = React.useState(passwordPlaceholders[0]);

  React.useEffect(() => {
    const emailInterval = setInterval(() => {
        setEmailPlaceholder(prev => {
            const currentIndex = emailPlaceholders.indexOf(prev);
            return emailPlaceholders[(currentIndex + 1) % emailPlaceholders.length];
        });
    }, 3000);

    const passwordInterval = setInterval(() => {
        setPasswordPlaceholder(prev => {
            const currentIndex = passwordPlaceholders.indexOf(prev);
            return passwordPlaceholders[(currentIndex + 1) % passwordPlaceholders.length];
        });
    }, 3500);

    return () => {
        clearInterval(emailInterval);
        clearInterval(passwordInterval);
    };
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "architect@aevonos.com",
      password: "password123",
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
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 z-0">
         <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
            <Scene />
        </Canvas>
      </div>
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-full max-w-sm z-10"
        >
          <Card className="bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl text-white">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline tracking-widest text-white">
                    Identity Verification
                </CardTitle>
                <CardDescription className="text-white/70">The system requires a handshake.</CardDescription>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
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
                    <Button type="submit" className="w-full bg-primary/80 backdrop-blur-sm border border-primary text-primary-foreground hover:bg-primary" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Authenticate & Enter'}
                    </Button>
                  </form>
                </Form>
              </TooltipProvider>
              <div className="mt-4 text-center text-sm text-white/60">
                Need system access?{' '}
                <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Request a build.
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
