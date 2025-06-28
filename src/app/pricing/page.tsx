
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PricingCard from '@/components/pricing/pricing-card';
import PlanAdvisorWidget from '@/components/pricing/plan-advisor-widget';

const plans = [
    {
        tierId: "apprentice",
        tierName: "Apprentice",
        price: "$0",
        priceSubtext: "Free Forever",
        description: "For individuals, explorers, and developers testing the canvas.",
        features: [
            "100 Agent Actions / month",
            "Core Micro-App Access",
            "Limited Loom Studio Features",
            "Community Support"
        ],
        isFeatured: false,
    },
    {
        tierId: "artisan",
        tierName: "Artisan",
        price: "$20",
        priceSubtext: "per user / month",
        description: "For solo operators, small teams, and power users.",
        features: [
            "2,000 Agent Actions / month",
            "Full Armory Marketplace Access",
            "Unlimited Loom Workflows",
            "Priority Support",
            "Prepaid Overage Credits"
        ],
        isFeatured: true,
    },
    {
        tierId: "priesthood",
        tierName: "Priesthood",
        price: "Custom",
        priceSubtext: "Contact Sales",
        description: "For larger organizations with advanced security and support needs.",
        features: [
            "Unlimited Agent Actions",
            "Advanced Security & Governance",
            "Single Sign-On (SSO)",
            "Dedicated Support & SLA",
            "Custom Agent Development"
        ],
        isFeatured: false,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen w-full">
            <header className="fixed top-0 left-0 right-0 z-40 bg-background/50 backdrop-blur-lg">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                         <h1 className="text-xl font-headline font-bold text-foreground tracking-widest">
                            <span className="text-primary">ΛΞ</span>VON
                        </h1>
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
