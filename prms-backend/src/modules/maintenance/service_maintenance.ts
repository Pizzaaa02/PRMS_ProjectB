import { prisma } from '../../db';

export async function getTickets(page = 1, limit = 10, userId?: string, status?: string) {
  const where: any = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;
  const [tickets, total] = await Promise.all([
    prisma.maintenanceTicket.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { user: { select: { id: true, full_name: true, email: true } } } }),
    prisma.maintenanceTicket.count({ where }),
  ]);
  return { tickets, total };
}

export async function getTicketById(id: string) {
  return prisma.maintenanceTicket.findUnique({ where: { id }, include: { user: true } });
}

export async function createTicket(data: { title: string; description: string; priority?: string; }, userId: string) {
  return prisma.maintenanceTicket.create({
    data: { ...data, user: { connect: { id: userId } } },
    include: { user: true },
  });
}

export async function updateTicket(id: string, data: { status?: string; assignedTo?: string; }) {
  return prisma.maintenanceTicket.update({
    where: { id }, data,
    include: { user: true },
  });
}

export async function resolveTicket(id: string) {
  return prisma.maintenanceTicket.update({
    where: { id }, data: { status: 'RESOLVED', resolved_at: new Date() },
  });
}
