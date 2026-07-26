import { prisma } from '../../db';

interface AuditFilters {
  action?: string;
  level?: string;
  userId?: string;
  search?: string;
  orderBy?: any;
}

export async function getAuditLogs(page: number, limit: number, filters: AuditFilters) {
  const where: any = {};
  if (filters.action) where.action = filters.action;
  if (filters.userId) where.userId = filters.userId;
  if (filters.search) {
    where.OR = [
      { action: { contains: filters.search, mode: 'insensitive' } },
      { details: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, skip, take: limit, orderBy: filters.orderBy || { created_at: 'desc' }, include: { user: { select: { id: true, full_name: true, email: true } } } }),
    prisma.auditLog.count({ where }),
  ]);
  return { logs, total };
}

export async function getAuditLogById(id: string) {
  return prisma.auditLog.findUnique({ where: { id }, include: { user: true } });
}

export async function createAuditLog(userId: string, action: string, details: string, _level: string, resourceId?: string) {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entity: action,
      entityId: resourceId || undefined,
      details: details,
    },
  });
}