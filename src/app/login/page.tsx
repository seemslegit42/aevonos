
'use client';

import React, { useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
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

function Crystal({ position }: { position: [number, number, number] }) {
  const crystalGroupRef = useRef<THREE.Group>(null!);

  const { scale, rotationSpeed } = useMemo(() => {
    return {
      scale: new THREE.Vector3(
          1 + Math.random() * 0.4, 
          1 + Math.random() * 1.2, // Elongated on Y
          1 + Math.random() * 0.4
      ),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      )
    };
  }, []);


  useFrame(() => {
    if (crystalGroupRef.current) {
        // Apply independent, chaotic rotation to each crystal shard
        crystalGroupRef.current.rotation.x += rotationSpeed.x;
        crystalGroupRef.current.rotation.y += rotationSpeed.y;
        crystalGroupRef.current.rotation.z += rotationSpeed.z;
    }
  });

  return (
    <group position={position}>
      {/* The main crystal shard */}
      <group ref={crystalGroupRef} scale={scale}>
        <mesh>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshPhysicalMaterial 
                color="hsl(var(--primary))"
                transmission={1.0}
                opacity={0.9}
                roughness={0}
                metalness={0.1}
                thickness={0.8}
                ior={2.3} // Index of Refraction, like diamond
                emissive="hsl(var(--accent))"
                emissiveIntensity={0.2}
            />
            <Edges scale={1.01} threshold={15} color="white" />
        </mesh>
      </group>
      
      {/* The ring that defines the sacred geometry */}
      <group>
        <mesh>
            <torusGeometry args={[1, 0.02, 16, 100]} />
            <meshStandardMaterial
                color="hsl(var(--primary))"
                emissive="hsl(var(--accent))"
                emissiveIntensity={0.3}
                metalness={0.9}
                roughness={0.2}
            />
            <Edges scale={1} threshold={15} color="white" />
        </mesh>
      </group>
    </group>
  );
}


function Scene() {
  const groupRef = useRef<THREE.Group>(null!);
  const { mouse, viewport } = useThree();

  const flowerOfLifePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const r = 1;

    positions.push([0, 0, 0]);

    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        positions.push([Math.cos(angle) * r, Math.sin(angle) * r, 0]);
    }
    
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        positions.push([Math.cos(angle) * 2 * r, Math.sin(angle) * 2 * r, 0]);
        
        const angle2 = (Math.PI / 3) * (i + 0.5);
        positions.push([Math.cos(angle2) * r * Math.sqrt(3), Math.sin(angle2) * r * Math.sqrt(3), 0]);
    }

    const uniquePositionsSet = new Set(positions.map(p => JSON.stringify(p)));
    let uniquePositions = Array.from(uniquePositionsSet).map(p => JSON.parse(p));
    
    // Fallback to ensure we have 19 points if floating point issues occur
    if (uniquePositions.length !== 19 && uniquePositions.length > 0) {
        uniquePositions = [
            [0, 0, 0],
            ...Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * r, Math.sin(i * Math.PI / 3) * r, 0]),
            ...Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * r * 2, Math.sin(i * Math.PI / 3) * r * 2, 0]),
            ...Array.from({ length: 6 }, (_, i) => [Math.cos((i + 0.5) * Math.PI / 3) * r * Math.sqrt(3), Math.sin((i + 0.5) * Math.PI / 3) * r * Math.sqrt(3), 0]),
        ].filter((p, i, self) => self.findIndex(t => t[0] === p[0] && t[1] === p[1]) === i);
    }
    
    return uniquePositions.slice(0, 19);
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
      groupRef.current.rotation.x += 0.0003;
      
      const x = (mouse.x * viewport.width) / 100;
      const y = (mouse.y * viewport.height) / 100;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, x, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, y, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {flowerOfLifePositions.map((pos, i) => <Crystal key={i} position={pos} />)}
    </group>
  );
}


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [emailPlaceholder, setEmailPlaceholder] = React.useState(emailPlaceholders[0]);
  const [passwordPlaceholder, setPasswordPlaceholder] = React.useState(passwordPlaceholders[0]);

  React.useEffect(() => {
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
    <div className="relative w-full h-screen">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="hsl(var(--primary))"/>
        <pointLight position={[-10, -10, -10]} intensity={1} color="hsl(var(--accent))" />
        <Scene />
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="w-full max-w-sm bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl text-white">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline tracking-widest text-white">
                Identity Verification
            </CardTitle>
            <CardDescription className="text-white/70">The system requires a handshake.</CardDescription>
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
      </div>
    </div>
  );
}
