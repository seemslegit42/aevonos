
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PricingCardProps {
    tierId: string;
    tierName: string;
    price: string;
    priceSubtext: string;
    description: string;
    features: string[];
    isFeatured?: boolean;
}

export default function PricingCard({ tierId, tierName, price, priceSubtext, description, features, isFeatured }: PricingCardProps) {
    const link = tierName === "Priesthood" ? "/register" : `/subscribe/${tierId}`;

    return (
        <Card className={cn("flex flex-col", isFeatured ? "border-primary ring-2 ring-primary bg-primary/5 shadow-2xl shadow-primary/10" : "bg-background/80")}>
            <CardHeader className="p-6">
                <CardTitle className="font-headline text-2xl">{tierName}</CardTitle>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight">{price}</span>
                    <span className="text-sm text-muted-foreground">{priceSubtext}</span>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-6 pt-0">
                <ul className="space-y-3">
                    {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-accent" />
                            <span className="text-sm">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="p-6">
                <Link href={link} className="w-full">
                    <Button className="w-full" variant={isFeatured ? "default" : "outline"}>
                       {tierName === "Priesthood" ? "Contact Sales" : "Get Started"}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
