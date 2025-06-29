
import { PrismaClient, AgentStatus, SecurityRiskLevel, TransactionType, PlanTier, UserRole, ChaosCardClass } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { chaosCardManifest } from '../src/config/chaos-cards';

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
  
  // Create multiple users with different roles
  const adminUser = await prisma.user.create({
    data: {
      email: 'architect@aevonos.com',
      password: hashedPassword,
      firstName: 'The',
      lastName: 'Architect',
      role: UserRole.ADMIN,
      pulseProfile: {
        create: {
          phaseOffset: Math.random() * 2 * Math.PI,
        }
      }
    },
  });
  console.log(`Created ADMIN user with id: ${adminUser.id}`)

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@aevonos.com',
      password: hashedPassword,
      firstName: 'Project',
      lastName: 'Manager',
      role: UserRole.MANAGER,
       pulseProfile: {
        create: {
          phaseOffset: Math.random() * 2 * Math.PI,
        }
      }
    },
  });
  console.log(`Created MANAGER user with id: ${managerUser.id}`)

  const operatorUser = await prisma.user.create({
    data: {
      email: 'operator@aevonos.com',
      password: hashedPassword,
      firstName: 'Field',
      lastName: 'Operator',
      role: UserRole.OPERATOR,
       pulseProfile: {
        create: {
          phaseOffset: Math.random() * 2 * Math.PI,
        }
      }
    },
  });
  console.log(`Created OPERATOR user with id: ${operatorUser.id}`)
  
  const auditorUser = await prisma.user.create({
    data: {
      email: 'auditor@aevonos.com',
      password: hashedPassword,
      firstName: 'Compliance',
      lastName: 'Auditor',
      role: UserRole.AUDITOR,
       pulseProfile: {
        create: {
          phaseOffset: Math.random() * 2 * Math.PI,
        }
      }
    },
  });
  console.log(`Created AUDITOR user with id: ${auditorUser.id}`)


  const newWorkspace = await prisma.workspace.create({
    data: {
      name: 'Primary Canvas',
      ownerId: adminUser.id,
      planTier: PlanTier.Artisan,
      credits: 0.0,
      members: {
        connect: [
          { id: adminUser.id },
          { id: managerUser.id },
          { id: operatorUser.id },
          { id: auditorUser.id },
        ],
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
        userId: adminUser.id,
        status: 'COMPLETED',
        // Also update the workspace balance since this is a seed script bypassing the service
        workspace: {
          update: {
            data: {
              credits: 1000 // Give them a good starting balance to buy cards
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

  await prisma.chaosCard.createMany({
      data: chaosCardManifest.map(card => ({
          key: card.key,
          name: card.name,
          description: card.description,
          cardClass: card.cardClass as ChaosCardClass,
          cost: card.cost,
          systemEffect: card.systemEffect,
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
