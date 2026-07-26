import { prisma } from '../../db';

export async function getFinanceSummary(userId: string) {
  return { total: 0, pending: 0, collected: 0, overdue: 0 };
}

export async function getPayments(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({ skip, take: limit, orderBy: { id: 'desc' }, include: { user: true, booking: { include: { property: true } } } }),
    prisma.payment.count(),
  ]);
  return { payments, total };
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({ where: { id }, include: { user: true, booking: { include: { property: true } } } });
}

export async function createPayment(data: { bookingId: string; userId: string; amount: number; status: string; type?: string; method?: string; due_date?: string }) {
  const statusMap: any = { pending: 'PENDING', paid: 'PAID', unpaid: 'UNPAID', failed: 'FAILED', refunded: 'REFUNDED' };
  return prisma.payment.create({
    data: {
      bookingId: data.bookingId,
      userId: data.userId,
      amount: data.amount,
      status: statusMap[data.status] || data.status.toUpperCase() || 'PENDING',
      type: data.type || 'rent',
      method: data.method || 'cash',
      due_date: data.due_date ? new Date(data.due_date) : new Date(),
    },
  });
}

export async function markAsPaid(id: string) {
  return prisma.payment.update({ where: { id }, data: { status: 'PAID' } });
}