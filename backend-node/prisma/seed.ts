import { PrismaClient, Role, TimelineEventType, WorkorderPriority, WorkorderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  const users = [
    { username: 'admin', email: 'admin@example.com', name: 'Admin User', role: Role.admin, password: 'admin123' },
    { username: 'agent', email: 'agent@example.com', name: 'Field Agent', role: Role.agent, password: 'agent123' },
    { username: 'viewer', email: 'viewer@example.com', name: 'Viewer User', role: Role.viewer, password: 'viewer123' },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        name: user.name,
        role: user.role,
        passwordHash,
      },
      create: {
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
      },
    });
  }
}

async function seedWorkorders() {
  const seedData = [
    {
      title: 'Instalacao de Sistema de Ar Condicionado',
      description: 'Instalacao completa de sistema split em escritorio comercial',
      status: WorkorderStatus.in_progress,
      priority: WorkorderPriority.high,
      clientName: 'Empresa ABC Ltda',
      clientEmail: 'contato@empresaabc.com',
      assignedTo: 'Joao Silva',
    },
    {
      title: 'Manutencao Preventiva - Sistema Eletrico',
      description: 'Verificacao e manutencao do sistema eletrico predial',
      status: WorkorderStatus.pending,
      priority: WorkorderPriority.medium,
      clientName: 'Condominio Residencial XYZ',
      clientEmail: 'sindico@condominioxyz.com',
      assignedTo: null,
    },
    {
      title: 'Reparo de Vazamento Hidraulico',
      description: 'Correcao de vazamento em tubulacao principal',
      status: WorkorderStatus.completed,
      priority: WorkorderPriority.urgent,
      clientName: 'Maria Santos',
      clientEmail: 'maria.santos@email.com',
      assignedTo: 'Pedro Costa',
    },
  ];

  for (const order of seedData) {
    const exists = await prisma.workorder.findFirst({
      where: {
        title: order.title,
        clientEmail: order.clientEmail,
      },
    });

    if (exists) {
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const created = await tx.workorder.create({
        data: {
          title: order.title,
          description: order.description,
          status: order.status,
          priority: order.priority,
          clientName: order.clientName,
          clientEmail: order.clientEmail,
          assignedTo: order.assignedTo,
          completedAt: order.status === WorkorderStatus.completed ? new Date() : null,
        },
      });

      await tx.timelineEvent.create({
        data: {
          orderId: created.id,
          type: TimelineEventType.created,
          description: 'Ordem de servico criada',
          userId: null,
          userName: null,
          metadata: { status: created.status },
        },
      });

      if (created.assignedTo) {
        await tx.timelineEvent.create({
          data: {
            orderId: created.id,
            type: TimelineEventType.assigned,
            description: `Ordem atribuida para ${created.assignedTo}`,
            userId: null,
            userName: null,
          },
        });
      }

      if (created.status !== WorkorderStatus.pending) {
        await tx.timelineEvent.create({
          data: {
            orderId: created.id,
            type: TimelineEventType.status_change,
            description: `Status alterado para ${created.status}`,
            userId: null,
            userName: null,
            metadata: { status: created.status },
          },
        });
      }
    });
  }
}

async function main() {
  await seedUsers();
  await seedWorkorders();
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });