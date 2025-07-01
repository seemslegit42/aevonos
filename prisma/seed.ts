
import { PrismaClient, AgentStatus, SecurityRiskLevel, TransactionType, PlanTier, UserRole, UserPsyche, Prisma, ChaosCardClass } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { artifactManifests } from '../src/config/artifacts';
import prisma from '../src/lib/prisma';

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
  
  // Create multiple users with different roles
  const adminUser = await prisma.user.create({
    data: {
      email: 'architect@aevonos.com',
      password: hashedPassword,
      firstName: 'The',
      lastName: 'Architect',
      agentAlias: 'BEEP',
      role: UserRole.ADMIN,
      psyche: UserPsyche.ZEN_ARCHITECT,
      foundingVow: "The tyranny of dashboards and endless SaaS tabs.",
      foundingGoal: "An agentic operating system that anticipates, acts, and disappears.",
    },
  });
  console.log(`Created ADMIN user with id: ${adminUser.id}`)

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@aevonos.com',
      password: hashedPassword,
      firstName: 'Project',
      lastName: 'Manager',
      agentAlias: 'Overseer',
      role: UserRole.MANAGER,
      psyche: UserPsyche.SYNDICATE_ENFORCER,
      foundingVow: "Manual follow-ups and chasing status updates.",
      foundingGoal: "A self-driving project management machine.",
    },
  });
  console.log(`Created MANAGER user with id: ${managerUser.id}`)

  const operatorUser = await prisma.user.create({
    data: {
      email: 'operator@aevonos.com',
      password: hashedPassword,
      firstName: 'Field',
      lastName: 'Operator',
      agentAlias: 'Field',
      role: UserRole.OPERATOR,
      psyche: UserPsyche.RISK_AVERSE_ARTISAN,
      foundingVow: "The fear of making a mistake in a complex system.",
      foundingGoal: "A reliable toolkit that I can trust.",
    },
  });
  console.log(`Created OPERATOR user with id: ${operatorUser.id}`)
  
  const auditorUser = await prisma.user.create({
    data: {
      email: 'auditor@aevonos.com',
      password: hashedPassword,
      firstName: 'Compliance',
      lastName: 'Auditor',
      agentAlias: 'Auditron',
      role: UserRole.AUDITOR,
      psyche: UserPsyche.ZEN_ARCHITECT,
      foundingVow: "Ambiguity in audit trails.",
      foundingGoal: "An immutable, self-documenting ledger of all actions.",
    },
  });
  console.log(`Created AUDITOR user with id: ${auditorUser.id}`)

  const users = [adminUser, managerUser, operatorUser, auditorUser];
  for (const user of users) {
    await prisma.pulseProfile.create({
        data: {
            userId: user.id,
            phaseOffset: Math.random() * 2 * Math.PI,
        }
    })
  }
  console.log('Created Pulse Profiles for all users.');


  const newWorkspace = await prisma.workspace.create({
    data: {
      name: 'Primary Canvas',
      ownerId: adminUser.id,
      planTier: PlanTier.Artisan,
      credits: 1000.0,
      members: {
        connect: users.map(u => ({ id: u.id })),
      }
    },
  })
  console.log(`Created workspace with id: ${newWorkspace.id}`)

  // Seed the genesis transaction for the initial credits, which were granted at workspace creation.
  await prisma.transaction.create({
    data: {
        workspaceId: newWorkspace.id,
        type: TransactionType.CREDIT,
        amount: new Prisma.Decimal(1000.0),
        description: "Initial workspace credit grant for Artisan plan.",
        userId: adminUser.id,
        status: 'COMPLETED'
    }
  });
  console.log('Seeded genesis credit transaction log.');


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
      { firstName: 'Art', lastName: 'Vandelay', email: 'art.vandelay@aevonos.com', phone: '555-123-4567', workspaceId: newWorkspace.id },
      { firstName: 'Cosmo', lastName: 'Kramer', email: 'kramer@kramerica.com', phone: '555-987-6543', workspaceId: newWorkspace.id },
    ]
  });
  console.log('Seeded contacts.');

  const chaosCards = artifactManifests.filter(a => a.type === 'CHAOS_CARD');
  await prisma.chaosCard.createMany({
      data: chaosCards.map(card => ({
          key: card.id,
          name: card.name,
          description: card.description,
          cardClass: card.cardClass as ChaosCardClass,
          cost: card.creditCost,
          systemEffect: card.systemEffect || '',
      })),
  });
  console.log('Seeded Chaos Cards.');

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
