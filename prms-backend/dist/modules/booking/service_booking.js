"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookings = getBookings;
exports.getBookingById = getBookingById;
exports.createBooking = createBooking;
exports.updateBooking = updateBooking;
exports.cancelBooking = cancelBooking;
exports.getMyBookings = getMyBookings;
exports.checkOverlap = checkOverlap;
exports.getBookingSummary = getBookingSummary;
const db_1 = require("../../db");
async function getBookings(page = 1, limit = 10, userId, status) {
    const where = {};
    if (userId)
        where.userId = userId;
    if (status)
        where.status = status;
    const [bookings, total] = await Promise.all([
        db_1.prisma.booking.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { user: { select: { id: true, full_name: true, email: true } }, property: true } }),
        db_1.prisma.booking.count({ where }),
    ]);
    return { bookings, total };
}
async function getBookingById(id) {
    return db_1.prisma.booking.findUnique({ where: { id }, include: { user: true, property: true } });
}
async function createBooking(data, userId) {
    return db_1.prisma.booking.create({
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
async function updateBooking(id, data) {
    return db_1.prisma.booking.update({ where: { id }, data, include: { user: true, property: true } });
}
async function cancelBooking(id) {
    return db_1.prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
}
async function getMyBookings(userId) {
    return db_1.prisma.booking.findMany({ where: { userId }, include: { property: true } });
}
async function checkOverlap(propertyId, startDate, endDate, excludeBookingId) {
    const overlaps = await db_1.prisma.booking.findMany({
        where: {
            propertyId,
            status: { notIn: ['CANCELLED'] },
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
async function getBookingSummary() {
    const [pending, confirmed, active, cancelled] = await Promise.all([
        db_1.prisma.booking.count({ where: { status: 'PENDING' } }),
        db_1.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
        db_1.prisma.booking.count({ where: { status: 'CHECKED_IN' } }),
        db_1.prisma.booking.count({ where: { status: 'CANCELLED' } }),
    ]);
    return { pending, confirmed, active, cancelled, total: pending + confirmed + active + cancelled };
}
