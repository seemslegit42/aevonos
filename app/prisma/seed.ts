
import { PrismaClient, AgentStatus, SecurityRiskLevel } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Clear existing data to ensure a clean slate
  await prisma.workflowRun.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.securityAlert.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.integration.deleteMany();
  
  // We need to delete workspaces and users carefully due to relations
  const workspaces = await prisma.workspace.findMany({ select: { id: true }});
  if (workspaces.length > 0) {
    await prisma.workspace.deleteMany({ where: { id: { in: workspaces.map(w => w.id) }}});
  }
  
  const users = await prisma.user.findMany({ select: { id: true }});
   if (users.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) }}});
  }


  console.log('Cleared existing data.');

  // Create a default user and workspace
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

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Primary Canvas',
      ownerId: user.id,
      members: {
        connect: { id: user.id }
      }
    },
  })
  console.log(`Created workspace with id: ${workspace.id}`)

  // Seed Agents
  const statuses: AgentStatus[] = [AgentStatus.active, AgentStatus.idle, AgentStatus.processing, AgentStatus.paused, AgentStatus.error];
  await prisma.agent.createMany({
    data: [
      { name: 'Reputation Management', type: 'winston-wolfe', description: 'Solves online reputation problems.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: workspace.id },
      { name: 'Morale Monitor', type: 'kif-kroker', description: 'Monitors team communications for morale.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: workspace.id },
      { name: 'Compliance Scanner', type: 'sterileish', description: 'Scans logs for compliance issues.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: workspace.id },
      { name: 'Recruiting Assistant', type: 'rolodex', description: 'Analyzes candidates and generates outreach.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: workspace.id },
      { name: 'Security Analyst', type: 'lahey-surveillance', description: 'Investigates suspicious activity.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: workspace.id },
    ]
  })
  console.log('Seeded agents.');

  // Seed Security Alerts
  await prisma.securityAlert.create({
        data: {
            type: 'Anomalous Login',
            explanation: 'Login from an unusual location (e.g., Russia) for this user, outside of typical work hours.',
            riskLevel: SecurityRiskLevel.high,
            timestamp: new Date(Date.now() - 3600 * 1000),
            actionableOptions: ['Lock Account', 'Dismiss Alert', 'View Details'],
            workspaceId: workspace.id,
        },
    });
  console.log('Seeded security alerts.');
  
  // Seed Contacts
  await prisma.contact.createMany({
    data: [
      { firstName: 'Art', lastName: 'Vandelay', email: 'art.vandelay@vandelay.com', phone: '555-123-4567', workspaceId: workspace.id },
      { firstName: 'Cosmo', lastName: 'Kramer', email: 'kramer@kramerica.com', phone: '555-987-6543', workspaceId: workspace.id },
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
