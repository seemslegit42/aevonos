
import { PrismaClient, AgentStatus, SecurityRiskLevel, TransactionType, PlanTier } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Idempotent seeding: check if the default user already exists.
  const existingUser = await prisma.user.findUnique({
    where: { email: 'architect@aevonos.com' },
  });

  // If the user exists, we assume the database is already seeded.
  if (existingUser) {
    console.log('Database already seeded. Skipping.');
    return;
  }
  
  console.log('No existing data found. Seeding from scratch...');

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
      planTier: PlanTier.Artisan,
      // The ledger service will handle setting the initial credits via a transaction.
      // We set it to 0 here initially.
      credits: 0.0,
      members: {
        connect: { id: user.id }
      }
    },
  })
  console.log(`Created workspace with id: ${newWorkspace.id}`)

  // Seed the genesis transaction for the initial credits
  await prisma.transaction.create({
    data: {
        workspaceId: newWorkspace.id,
        type: TransactionType.CREDIT,
        amount: 100.0,
        description: "Initial workspace credit grant.",
        userId: user.id,
        // Also update the workspace balance since this is a seed script bypassing the service
        workspace: {
          update: {
            data: {
              credits: 100.0
            }
          }
        }
    }
  });
  console.log('Seeded genesis credit transaction.');


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
