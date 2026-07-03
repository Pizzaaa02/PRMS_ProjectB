import { prisma } from '../../db';

export async function getBookings(page = 1, limit = 10, userId?: string, status?: string) {
  const where: any = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { user: { select: { id: true, full_name: true, email: true } }, property: true } }),
    prisma.booking.count({ where }),
  ]);
  return { bookings, total };
}

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({ where: { id }, include: { user: true, property: true } });
}

export async function createBooking(data: { propertyId: string; start_date: string; end_date: string; totalAmount?: number; }, userId: string) {
  return prisma.booking.create({
    data: {
      property: { connect: { id: data.propertyId } },
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      totalAmount: data.totalAmount,
      user: { connect: { id: userId } },
    },
    include: { user: true, property: true },
  });
}

export async function updateBooking(id: string, data: { status?: string; totalAmount?: number; }) {
  return prisma.booking.update({ where: { id }, data, include: { user: true, property: true } });
}

export async function cancelBooking(id: string) {
  return prisma.booking.update({ where: { id }, data: { status: 'cancelled' } });
}

export async function getMyBookings(userId: string) {
  return prisma.booking.findMany({ where: { userId }, include: { property: true } });
}

export async function checkOverlap(
  propertyId: string,
  startDate: string,
  endDate: string,
  excludeBookingId?: string,
): Promise<{ hasOverlap: boolean; overlapping: any[] }> {
  const overlaps = await prisma.booking.findMany({
    where: {
      propertyId,
      status: { notIn: ['CANCELLED', 'EXPIRED'] },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      OR: [
        {
          start_date: { lte: new Date(endDate) },
          end_date: { gte: new Date(startDate) },
        },
      ],
    },
    include: { user: { select: { id: true, full_name: true } } },
  });

  return { hasOverlap: overlaps.length > 0, overlapping: overlaps };
}
