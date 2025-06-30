
export const plans = [
    {
        tierId: "apprentice",
        tierName: "Apprentice",
        price: "$0",
        priceValue: 0,
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
        priceValue: 20,
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
        priceValue: -1, // Sentinel value for custom pricing
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

export const planDetails: Record<string, any> = plans.reduce((acc, plan) => {
    acc[plan.tierId] = {
        name: plan.tierName,
        price: plan.priceValue,
        priceDisplay: plan.price,
        features: plan.features,
    };
    return acc;
}, {} as Record<string, any>);
