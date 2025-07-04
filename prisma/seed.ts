
import { PrismaClient, AgentStatus, SecurityRiskLevel, TransactionType, PlanTier, UserRole, UserPsyche, Prisma, ChaosCardClass, PurchaseOrderStatus } from '@prisma/client'
import { artifactManifests } from '../src/config/artifacts';
import prisma from '../src/lib/prisma';
import { createHmac } from 'crypto';

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
  
  // Create multiple users with different roles
  const adminUser = await prisma.user.create({
    data: {
      email: 'architect@aevonos.com',
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

  // Create default pulse engine config for the workspace
  await prisma.pulseEngineConfig.create({
    data: {
      workspaceId: newWorkspace.id,
    }
  });
  console.log(`Created default Pulse Engine config for workspace ${newWorkspace.id}`);

  const genesisDescription = "Initial workspace credit grant for Artisan plan.";
  const genesisSignature = createHmac('sha256', 'seed-secret').update(genesisDescription).digest('hex');

  // Seed the genesis transaction for the initial credits, which were granted at workspace creation.
  await prisma.transaction.create({
    data: {
        workspaceId: newWorkspace.id,
        type: TransactionType.CREDIT,
        amount: new Prisma.Decimal(1000.0),
        description: genesisDescription,
        userId: adminUser.id,
        status: 'COMPLETED',
        aegisSignature: genesisSignature,
    }
  });
  console.log('Seeded genesis credit transaction log.');

  const defaultEdicts = [
    'Session integrity must be maintained (e.g., no unusual command sequences).',
    'Agentic actions must remain within their designated purview.',
    'Workflows must not exfiltrate data to unauthorized channels.',
    'User commands must not resemble the trickery of a foreign agent (phishing).',
    'Access boundaries must be respected at all times. An OPERATOR attempting to access administrative functions is a critical anomaly.',
  ];

  await prisma.securityEdict.createMany({
    data: defaultEdicts.map((description) => ({
      workspaceId: newWorkspace.id,
      description: description,
      isActive: true,
    })),
  });
  console.log('Seeded default security edicts.');

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

  await prisma.product.createMany({
    data: [
        { name: 'Obsidian Shard', description: 'Raw material for agentic cores.', stockLevel: 150, workspaceId: newWorkspace.id },
        { name: 'Crystalline Matrix', description: 'Used in advanced UI rendering.', stockLevel: 42, workspaceId: newWorkspace.id },
        { name: 'Aetheric Capacitor', description: 'Stores and discharges raw potential.', stockLevel: 8, workspaceId: newWorkspace.id },
    ]
  });
  console.log('Seeded products.');
  
  await prisma.supplier.create({
    data: {
        name: 'The Foundry',
        contactEmail: 'procurement@foundry.aevon',
        workspaceId: newWorkspace.id,
    }
  });
  console.log('Seeded suppliers.');

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
