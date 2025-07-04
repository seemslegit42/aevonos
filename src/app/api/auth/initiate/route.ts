
'use server';

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { z } from 'zod';
import { Resend } from 'resend';

const InitiateRequestSchema = z.object({
  email: z.string().email(),
});

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMagicLink(email: string, host: string | null, protocol: string) {
    const continueUrl = `${protocol}://${host}/auth/action`;
    const actionCodeSettings = {
        url: continueUrl,
        handleCodeInApp: true,
    };
    
    const link = await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);

    await resend.emails.send({
      from: 'oracle@aevonos.com',
      to: email,
      subject: 'The Echo | Your Sovereign Signature',
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 2rem; background: #0a0a0c; color: #f5f5f5;">
          <h1 style="color: #6A0DAD;">The First Whisper</h1>
          <p>A path has opened. To cross the threshold, you must follow this echo before it fades.</p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; margin-top: 1rem; background: #6A0DAD; color: white; text-decoration: none; border-radius: 8px;">Cross the Threshold</a>
          <p style="font-size: 12px; color: #888; margin-top: 2rem;">This echo will dissipate in 15 minutes.</p>
        </div>
      `,
    });
}

export async function POST(request: NextRequest) {
  try {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin SDK is not initialized.");
    }
    const body = await request.json();
    const validation = InitiateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request.', issues: validation.error.issues }, { status: 400 });
    }

    const { email } = validation.data;
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    
    try {
        await admin.auth().getUserByEmail(email);
        // User exists, send login link
        await sendMagicLink(email, host, protocol);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            // User does not exist, create user and send link
            await admin.auth().createUser({ email });
            await sendMagicLink(email, host, protocol);
        } else {
            // Re-throw other errors
            throw error;
        }
    }

    return NextResponse.json({ success: true, message: 'Authentication process initiated.' });

  } catch (error: any) {
    console.error('[API /auth/initiate POST]', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
