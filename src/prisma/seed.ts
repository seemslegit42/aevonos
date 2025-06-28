
import { PrismaClient, AgentStatus, SecurityRiskLevel } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // --- SAFE CLEANUP ---
  // To prevent foreign key constraint errors, we manually delete records in the correct order.
  // This is more robust than relying on onDelete: Cascade, which might not be configured.
  
  console.log('Clearing existing data to ensure a clean slate...')

  // Delete all records from models that depend on Workspace or User
  await prisma.workflowRun.deleteMany({});
  await prisma.workflow.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.securityAlert.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.integration.deleteMany({});
  await prisma.threatFeed.deleteMany({});
  console.log('Deleted dependent records (Workflows, Agents, Contacts, etc.).');
  
  // Now, handle the many-to-many relation between User and Workspace.
  const workspaces = await prisma.workspace.findMany({
      include: { members: { select: { id: true }}}
  });

  for (const workspace of workspaces) {
      if (workspace.members.length > 0) {
        await prisma.workspace.update({
            where: { id: workspace.id },
            data: {
                members: {
                    disconnect: workspace.members.map(m => ({ id: m.id }))
                }
            }
        });
      }
  }
  console.log('Disconnected all user-workspace relations.');

  // Now it's safe to delete Workspaces and Users
  await prisma.workspace.deleteMany({});
  console.log('Deleted all workspaces.');

  await prisma.user.deleteMany({});
  console.log('Deleted all users.');

  console.log('Cleared existing data successfully.');
  
  // --- RE-CREATE DEFAULT USER AND WORKSPACE ---

  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'architect@aevonos.com',
      password: hashedPassword,
      firstName: 'The',
      lastName: 'Architect',
    },
  })
  console.log(`Created user with id: ${user.id}`)

  const newWorkspace = await prisma.workspace.create({
    data: {
      name: 'Primary Canvas',
      ownerId: user.id,
      members: {
        connect: { id: user.id }
      }
    },
  })
  console.log(`Created workspace with id: ${newWorkspace.id}`)

  // --- SEED SAMPLE DATA ---

  const statuses: AgentStatus[] = [AgentStatus.active, AgentStatus.idle, AgentStatus.processing, AgentStatus.paused, AgentStatus.error];
  await prisma.agent.createMany({
    data: [
      { name: 'Reputation Management', type: 'winston-wolfe', description: 'Solves online reputation problems.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: newWorkspace.id },
      { name: 'Morale Monitor', type: 'kif-kroker', description: 'Monitors team communications for morale.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: newWorkspace.id },
      { name: 'Compliance Scanner', type: 'sterileish', description: 'Scans logs for compliance issues.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: newWorkspace.id },
      { name: 'Recruiting Assistant', type: 'rolodex', description: 'Analyzes candidates and generates outreach.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: newWorkspace.id },
      { name: 'Security Analyst', type: 'lahey-surveillance', description: 'Investigates suspicious activity.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: newWorkspace.id },
    ]
  })
  console.log('Seeded agents.');

  await prisma.securityAlert.create({
        data: {
            type: 'Anomalous Login',
            explanation: 'Login from an unusual location (e.g., Russia) for this user, outside of typical work hours.',
            riskLevel: SecurityRiskLevel.high,
            timestamp: new Date(Date.now() - 3600 * 1000),
            actionableOptions: ['Lock Account', 'Dismiss Alert', 'View Details'],
            workspaceId: newWorkspace.id,
        },
    });
  console.log('Seeded security alerts.');
  
  await prisma.contact.createMany({
    data: [
      { firstName: 'Art', lastName: 'Vandelay', email: 'art.vandelay@vandelay.com', phone: '555-123-4567', workspaceId: newWorkspace.id },
      { firstName: 'Cosmo', lastName: 'Kramer', email: 'kramer@kramerica.com', phone: '555-987-6543', workspaceId: newWorkspace.id },
    ]
  });
  console.log('Seeded contacts.');

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
