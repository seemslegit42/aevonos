

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import PricingCard from '@/components/pricing/pricing-card';
import PlanAdvisorWidget from '@/components/pricing/plan-advisor-widget';
import { plans } from '@/config/plans';

export default function PricingPage() {
    return (
        <div className="min-h-screen w-full">
            <header className="fixed top-0 left-0 right-0 z-40 bg-background/50 backdrop-blur-lg">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo-neutral.svg" alt="ΛΞVON OS Logo" width={80} height={24} className="h-6 w-auto" />
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                         <Link href="/register">
                            <Button>Request a Build</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="pt-24 pb-12">
                <section className="text-center">
                    <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl md:text-6xl text-primary">
                        The Canvas Awaits.
                    </h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                        Choose the plan that fits your ambition. From solo architects to autonomous enterprises.
                    </p>
                </section>

                <section className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-4 md:px-6">
                    {plans.map(plan => (
                        <PricingCard key={plan.tierName} {...plan} />
                    ))}
                </section>
            </main>
            
            <PlanAdvisorWidget />
        </div>
    );
}
