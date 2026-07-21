import { prisma } from '../../db';

export async function getPayments(page = 1, limit = 10, userId?: string, status?: string) {
  const where: any = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { booking: true, user: { select: { id: true, full_name: true } } } }),
    prisma.payment.count({ where }),
  ]);
  return { payments, total };
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({ where: { id }, include: { booking: true, user: true } });
}

export async function createPayment(data: { bookingId: string; userId: string; amount: number; type?: string; method?: string; reference?: string; }, adminId?: string) {
  return prisma.payment.create({
    data: { ...data, due_date: new Date() },
    include: { booking: true, user: true },
  });
}

export async function markAsPaid(id: string) {
  return prisma.payment.update({
    where: { id },
    data: { status: 'PAID', paid_at: new Date() },
  });
}

export async function getFinanceSummary(userId?: string) {
  const where: any = {};
  if (userId) where.userId = userId;

  const [allPayments, totalBookings] = await Promise.all([
    prisma.payment.findMany({ where, include: { booking: { include: { property: true } } } }),
    prisma.booking.count(),
  ]);

  const totalRevenue = allPayments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const collected = allPayments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pending = allPayments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Revenue by property
  const byMap: Record<string, number> = {};
  allPayments
    .filter((p) => p.status === 'PAID')
    .forEach((p) => {
      const propName = p.booking?.property?.title ?? 'Unknown';
      byMap[propName] = (byMap[propName] ?? 0) + Number(p.amount);
    });

  const byProperty = Object.entries(byMap).map(([property, amount]) => ({
    property,
    amount,
  }));

  return { totalRevenue, collected, pending, totalBookings, byProperty };
}
