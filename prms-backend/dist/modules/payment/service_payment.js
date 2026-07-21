"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = getPayments;
exports.getPaymentById = getPaymentById;
exports.createPayment = createPayment;
exports.markAsPaid = markAsPaid;
exports.getFinanceSummary = getFinanceSummary;
const db_1 = require("../../db");
async function getPayments(page = 1, limit = 10, userId, status) {
    const where = {};
    if (userId)
        where.userId = userId;
    if (status)
        where.status = status;
    const [payments, total] = await Promise.all([
        db_1.prisma.payment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { booking: true, user: { select: { id: true, full_name: true } } } }),
        db_1.prisma.payment.count({ where }),
    ]);
    return { payments, total };
}
async function getPaymentById(id) {
    return db_1.prisma.payment.findUnique({ where: { id }, include: { booking: true, user: true } });
}
async function createPayment(data, adminId) {
    return db_1.prisma.payment.create({
        data: { ...data, due_date: new Date() },
        include: { booking: true, user: true },
    });
}
async function markAsPaid(id) {
    return db_1.prisma.payment.update({
        where: { id },
        data: { status: 'PAID', paid_at: new Date() },
    });
}
async function getFinanceSummary(userId) {
    const where = {};
    if (userId)
        where.userId = userId;
    const [allPayments, totalBookings] = await Promise.all([
        db_1.prisma.payment.findMany({ where, include: { booking: { include: { property: true } } } }),
        db_1.prisma.booking.count(),
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
    const byMap = {};
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
