"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getRevenueReport = getRevenueReport;
exports.getPropertyReport = getPropertyReport;
exports.getOccupancyReport = getOccupancyReport;
const db_1 = require("../../db");
async function getDashboardStats() {
    const [totalUsers, totalProperties, totalBookings, totalRevenue] = await Promise.all([
        db_1.prisma.user.count(),
        db_1.prisma.property.count(),
        db_1.prisma.booking.count(),
        db_1.prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    ]);
    return {
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue: totalRevenue._sum?.amount || 0,
    };
}
async function getRevenueReport(month, year) {
    const where = { status: 'PAID' };
    if (month && year) {
        const start = new Date(`${year}-${month}-01`);
        const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        where.paid_at = { gte: start, lte: end };
    }
    const payments = await db_1.prisma.payment.findMany({
        where,
        select: { amount: true, paid_at: true, type: true },
        orderBy: { paid_at: 'desc' },
    });
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    return { payments, total, count: payments.length };
}
async function getPropertyReport() {
    const properties = await db_1.prisma.property.findMany({
        include: {
            _count: { select: { bookings: true } },
        },
    });
    return properties.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        rent: p.rent,
        bookingCount: p._count.bookings,
    }));
}
async function getOccupancyReport() {
    const totalProperties = await db_1.prisma.property.count();
    const activeBookings = await db_1.prisma.booking.count({ where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } } });
    return {
        totalProperties,
        activeBookings,
        occupancyRate: totalProperties > 0 ? Math.round((activeBookings / totalProperties) * 100) : 0,
    };
}
