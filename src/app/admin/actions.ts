
'use server';

import prisma from '@/lib/prisma';
import { AgentStatus, UserRole } from '@prisma/client';
import { getServerActionSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { confirmPendingTransaction as confirmTxService } from '@/services/ledger-service';

const UpdateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(UserRole),
});

export async function updateUserRole(formData: FormData) {
  const session = await getServerActionSession();
  if (!session?.workspaceId || !session.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: session.workspaceId },
    select: { ownerId: true }
  });

  if (!workspace || session.userId !== workspace.ownerId) {
    return { success: false, error: 'Forbidden: Only the workspace Architect can perform this action.' };
  }

  const validation = UpdateUserRoleSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
  });

  if (!validation.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { userId, role } = validation.data;
  
  if (userId === session.userId) {
      return { success: false, error: 'Cannot change your own role.'};
  }
  
  // Protect the workspace owner from being modified by other admins
  if (userId === workspace?.ownerId) {
    return { success: false, error: 'The workspace owner\'s role cannot be changed.' };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath('/'); // Revalidate to update the admin console
    return { success: true, message: 'User role updated.' };
  } catch (error) {
    console.error('updateUserRole error:', error);
    return { success: false, error: 'Database operation failed.' };
  }
}

const RemoveUserSchema = z.object({
    userId: z.string(),
});

export async function removeUserFromWorkspace(formData: FormData) {
    const session = await getServerActionSession();
    if (!session?.workspaceId || !session.userId) {
        return { success: false, error: 'Unauthorized' };
    }
    
    const workspace = await prisma.workspace.findUnique({
      where: { id: session.workspaceId },
      select: { ownerId: true }
    });

    if (!workspace || session.userId !== workspace.ownerId) {
        return { success: false, error: 'Forbidden: Only the workspace Architect can perform this action.' };
    }
    
    const validation = RemoveUserSchema.safeParse({
        userId: formData.get('userId'),
    });
    
    if (!validation.success) {
        return { success: false, error: 'Invalid input.' };
    }

    const { userId } = validation.data;

    if (userId === session.userId) {
        return { success: false, error: 'Cannot remove yourself from the workspace.' };
    }

    // Protect the workspace owner from being removed by other admins
    if (userId === workspace?.ownerId) {
        return { success: false, error: 'The workspace owner cannot be removed.' };
    }

    try {
        await prisma.workspace.update({
            where: { id: session.workspaceId },
            data: {
                members: {
                    disconnect: { id: userId },
                },
            },
        });
        revalidatePath('/');
        return { success: true, message: 'User removed from workspace.' };
    } catch (error) {
        console.error('removeUserFromWorkspace error:', error);
        return { success: false, error: 'Database operation failed.' };
    }
}

const UpdateAgentStatusSchema = z.object({
  agentId: z.string(),
  status: z.nativeEnum(AgentStatus),
});

export async function updateAgentStatus(formData: FormData) {
  const session = await getServerActionSession();
  if (!session?.workspaceId || !session.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: session.workspaceId },
    select: { ownerId: true }
  });

  if (!workspace || session.userId !== workspace.ownerId) {
    return { success: false, error: 'Forbidden: Only the workspace Architect can perform this action.' };
  }

  const validation = UpdateAgentStatusSchema.safeParse({
    agentId: formData.get('agentId'),
    status: formData.get('status'),
  });

  if (!validation.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { agentId, status } = validation.data;

  try {
    const agent = await prisma.agent.findFirst({
        where: { id: agentId, workspaceId: session.workspaceId },
    });

    if (!agent) {
        return { success: false, error: 'Agent not found in this workspace.' };
    }

    await prisma.agent.update({
      where: { id: agentId },
      data: { status },
    });
    revalidatePath('/'); // Revalidate to update the admin console
    return { success: true, message: 'Agent status updated.' };
  } catch (error) {
    console.error('updateAgentStatus error:', error);
    return { success: false, error: 'Database operation failed.' };
  }
}

const DeleteAgentSchema = z.object({
    agentId: z.string(),
});

export async function deleteAgent(formData: FormData) {
    const session = await getServerActionSession();
    if (!session?.workspaceId || !session.userId) {
        return { success: false, error: 'Unauthorized' };
    }
    
    const workspace = await prisma.workspace.findUnique({
      where: { id: session.workspaceId },
      select: { ownerId: true }
    });

    if (!workspace || session.userId !== workspace.ownerId) {
        return { success: false, error: 'Forbidden: Only the workspace Architect can perform this action.' };
    }
    
    const validation = DeleteAgentSchema.safeParse({
        agentId: formData.get('agentId'),
    });
    
    if (!validation.success) {
        return { success: false, error: 'Invalid input.' };
    }

    const { agentId } = validation.data;

    try {
        const agent = await prisma.agent.findFirst({
            where: { id: agentId, workspaceId: session.workspaceId },
        });

        if (!agent) {
            return { success: false, error: 'Agent not found in this workspace.' };
        }

        await prisma.agent.delete({
            where: { id: agentId },
        });

        revalidatePath('/');
        return { success: true, message: 'Agent decommissioned.' };
    } catch (error) {
        console.error('deleteAgent error:', error);
        return { success: false, error: 'Database operation failed.' };
    }
}


export async function confirmPendingTransactionAction(transactionId: string) {
    const session = await getServerActionSession();
    if (!session?.workspaceId || !session.userId) {
        return { success: false, error: 'Unauthorized' };
    }
    
    const workspace = await prisma.workspace.findUnique({
      where: { id: session.workspaceId },
      select: { ownerId: true }
    });

    if (!workspace || session.userId !== workspace.ownerId) {
        return { success: false, error: 'Forbidden: Only the workspace Architect can perform this action.' };
    }

    try {
        await confirmTxService(transactionId, session.workspaceId);
        revalidatePath('/');
        return { success: true, message: 'Transaction confirmed.' };
    } catch (e) {
        const error = e instanceof Error ? e : new Error('An unknown error occurred.');
        console.error('[Action: confirmPendingTransaction]', error);
        return { success: false, error: error.message };
    }
}
