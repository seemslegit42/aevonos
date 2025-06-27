
import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    profileId: string;
  };
}

const mockProfiles: Record<string, any> = {
    '123': {
        id: '123',
        name: 'Alex',
        age: 28,
        bio: 'Just a human bean looking for my other half. I love hiking, indie concerts, and trying new craft breweries. My dog is my world. Not looking for anything serious, just seeing what\'s out there.',
        interests: ['hiking', 'live music', 'craft beer', 'dogs', 'travel'],
        photos: [
            'https://placehold.co/600x800.png',
            'https://placehold.co/600x800.png',
        ],
        imageHints: ['woman smiling', 'dog park'],
        promptResponses: [
            {
                prompt: 'My simple pleasures...',
                response: 'A good cup of coffee on a rainy morning.'
            },
            {
                prompt: 'I\'m looking for someone who...',
                response: 'Doesn\'t take themselves too seriously and can make me laugh.'
            }
        ]
    },
    '456': {
        id: '456',
        name: 'Sam',
        age: 32,
        bio: 'Software engineer by day, aspiring chef by night. I can cook a mean carbonara. Let\'s trade book recommendations or debate about sci-fi movies. 🚀',
        interests: ['cooking', 'sci-fi films', 'reading', 'board games'],
        photos: [
            'https://placehold.co/600x800.png',
        ],
        imageHints: ['man cooking'],
        promptResponses: [
            {
                prompt: 'A hill I will die on...',
                response: 'Star Wars is better than Star Trek. No question.'
            },
        ]
    }
}

// Mock endpoint to simulate fetching a dating profile
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { profileId } = params;
    
    // In a real integration, you would verify the active integration/auth here.
    const profile = mockProfiles[profileId];

    if (!profile) {
      return NextResponse.json({ error: 'Dating profile not found.' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error(`[API /integrations/dating/{profileId} GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve dating profile.' }, { status: 500 });
  }
}
