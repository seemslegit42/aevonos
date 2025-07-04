
export type IntegrationManifest = {
    id: string; // UUID
    name: string;
    description: string;
    iconUrl: string;
    authMethod: 'oauth2' | 'api_key' | 'webhook';
    setupGuideUrl: string;
    imageHint: string;
};

// Based on IntegrationManifest schema from api-spec.md
export const integrationManifests: IntegrationManifest[] = [
    {
        id: 'f9d1b1e0-5a3d-4e8c-9b1a-2c6f8d7e4a5b',
        name: "Slack",
        description: "Connect your workspace to Slack for notifications and commands.",
        iconUrl: "https://placehold.co/100x100.png",
        imageHint: 'collaboration chat logo',
        authMethod: "api_key",
        setupGuideUrl: "https://api.slack.com/authentication/token-types#bot"
    },
    {
        id: 'a2c4b6e8-8d0f-4f6e-9c1b-3e7d9a8c5b4d',
        name: "Google Workspace",
        description: "Integrate with Google Calendar, Drive, and Gmail.",
        iconUrl: "https://placehold.co/100x100.png",
        imageHint: 'productivity suite logo',
        authMethod: "oauth2",
        setupGuideUrl: "https://support.google.com/a/answer/6123543"
    },
    {
        id: 'c5e8d9f0-1a2b-4c3d-8e4f-6a7b8c9d0e1f',
        name: "Stripe",
        description: "Connect Stripe to manage payments and subscriptions.",
        iconUrl: "https://placehold.co/100x100.png",
        imageHint: 'payment processing logo',
        authMethod: "api_key",
        setupGuideUrl: "https://stripe.com/docs/keys"
    }
];
