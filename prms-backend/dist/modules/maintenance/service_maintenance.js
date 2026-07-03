"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTickets = getTickets;
exports.getTicketById = getTicketById;
exports.createTicket = createTicket;
exports.updateTicket = updateTicket;
exports.resolveTicket = resolveTicket;
const db_1 = require("../../db");
async function getTickets(page = 1, limit = 10, userId, status) {
    const where = {};
    if (userId)
        where.userId = userId;
    if (status)
        where.status = status;
    const [tickets, total] = await Promise.all([
        db_1.prisma.maintenanceTicket.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { user: { select: { id: true, full_name: true, email: true } } } }),
        db_1.prisma.maintenanceTicket.count({ where }),
    ]);
    return { tickets, total };
}
async function getTicketById(id) {
    return db_1.prisma.maintenanceTicket.findUnique({ where: { id }, include: { user: true } });
}
async function createTicket(data, userId) {
    return db_1.prisma.maintenanceTicket.create({
        data: { ...data, user: { connect: { id: userId } } },
        include: { user: true },
    });
}
async function updateTicket(id, data) {
    return db_1.prisma.maintenanceTicket.update({
        where: { id }, data,
        include: { user: true },
    });
}
async function resolveTicket(id) {
    return db_1.prisma.maintenanceTicket.update({
        where: { id }, data: { status: 'RESOLVED', resolved_at: new Date() },
    });
}
