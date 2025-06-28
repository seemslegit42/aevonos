'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';

// --- LOGIN --- //
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: 'Invalid email or password.',
    };
  }
  
  const { email, password } = validatedFields.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: 'Invalid credentials.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return { error: 'Invalid credentials.' };
    }
    
    const workspace = await prisma.workspace.findFirst({
        where: { ownerId: user.id }
    });
    
    if (!workspace) {
        return { error: "User doesn't have a workspace." };
    }

    // Create the session
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour
    const sessionPayload = {
        userId: user.id,
        workspaceId: workspace.id,
        expires: expires,
    };

    const token = await encrypt(sessionPayload);
    
    cookies().set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expires,
        path: '/',
    });

  } catch (error) {
    console.error(error);
    return { error: 'An internal error occurred.' };
  }
  
  redirect('/');
}


// --- REGISTER --- //
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  workspaceName: z.string().min(1, 'Workspace name is required.'),
});

export async function register(prevState: any, formData: FormData) {
    const validatedFields = RegisterSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        const firstError = validatedFields.error.errors[0]?.message || 'Invalid registration data.';
        return { error: firstError };
    }

    const { email, password, firstName, lastName, workspaceName } = validatedFields.data;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { error: 'User with this email already exists.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { user, workspace } = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                }
            });
            
            const newWorkspace = await tx.workspace.create({
                data: {
                    name: workspaceName,
                    ownerId: newUser.id,
                    members: {
                        connect: { id: newUser.id }
                    }
                }
            });
            
            return { user: newUser, workspace: newWorkspace };
        });

        // Create the session
        const expires = new Date(Date.now() + 3600 * 1000); // 1 hour
        const sessionPayload = {
            userId: user.id,
            workspaceId: workspace.id,
            expires: expires,
        };
        const token = await encrypt(sessionPayload);
        
        cookies().set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: expires,
            path: '/',
        });

    } catch (error) {
        console.error(error);
        return { error: 'An internal error occurred.' };
    }

    redirect('/');
}


// --- LOGOUT --- //
export async function logout() {
  cookies().delete('session');
  redirect('/login');
}
