"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.deleteNotification = deleteNotification;
exports.createNotification = createNotification;
const db_1 = require("../../db");
async function getNotifications(userId, isRead, archived) {
    const where = { userId };
    if (isRead !== undefined)
        where.is_read = isRead;
    if (archived !== undefined)
        where.archived = archived;
    return db_1.prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
    });
}
async function markRead(id) {
    return db_1.prisma.notification.update({ where: { id }, data: { is_read: true } });
}
async function markAllRead(userId) {
    return db_1.prisma.notification.updateMany({ where: { userId, is_read: false }, data: { is_read: true } });
}
async function deleteNotification(id) {
    return db_1.prisma.notification.delete({ where: { id } });
}
async function createNotification(userId, data) {
    return db_1.prisma.notification.create({
        data: {
            userId,
            title: data.title,
            message: data.message,
            type: data.type,
            is_read: false,
            archived: false,
        },
    });
}
