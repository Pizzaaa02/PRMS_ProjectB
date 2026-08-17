"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemSettings = getSystemSettings;
exports.updateSystemSetting = updateSystemSetting;
exports.addSystemSetting = addSystemSetting;
exports.getSystemSettingsByCategory = getSystemSettingsByCategory;
exports.getPublicSystemSettings = getPublicSystemSettings;
exports.bulkUpdateSystemSettings = bulkUpdateSystemSettings;
exports.getAuditLogs = getAuditLogs;
exports.createAuditLog = createAuditLog;
exports.getNotifications = getNotifications;
exports.createNotification = createNotification;
exports.markNotificationRead = markNotificationRead;
exports.markAllNotificationsRead = markAllNotificationsRead;
exports.dismissNotification = dismissNotification;
const db_1 = require("../../db");
async function getSystemSettings() {
    return db_1.prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
}
async function updateSystemSetting(key, value) {
    if (!key || key === 'undefined') {
        throw new Error('Setting key is required');
    }
    if (value === undefined || value === null) {
        value = '';
    }
    const category = String(key).split('_')[0] ?? 'general';
    return db_1.prisma.systemSetting.upsert({
        where: { key: String(key) },
        update: { value: String(value) },
        create: { key: String(key), value: String(value), category },
    });
}
async function addSystemSetting(key, value, category = 'general', description) {
    return db_1.prisma.systemSetting.create({ data: { key, value, category, description } });
}
async function getSystemSettingsByCategory(category) {
    return db_1.prisma.systemSetting.findMany({
        where: { category },
        orderBy: { key: 'asc' },
    });
}
// Categories safe for public consumption (no sensitive internal config)
const publicCategories = ['theme', 'branding', 'header', 'footer', 'homepage', 'features'];
async function getPublicSystemSettings() {
    return db_1.prisma.systemSetting.findMany({
        where: { category: { in: publicCategories } },
        orderBy: { key: 'asc' },
    });
}
async function bulkUpdateSystemSettings(settingsList) {
    if (!Array.isArray(settingsList)) {
        throw new Error('Settings must be an array');
    }
    const results = await Promise.all(settingsList.map(async ({ key, value }) => {
        if (!key || value === undefined)
            return null;
        const strKey = String(key);
        const strValue = String(value);
        return db_1.prisma.systemSetting.upsert({
            where: { key: strKey },
            update: { value: strValue },
            create: { key: strKey, value: strValue, category: 'general' },
        });
    }));
    return results.filter(Boolean);
}
async function getAuditLogs(page = 1, limit = 50, entity) {
    const where = {};
    if (entity)
        where.entity = entity;
    const [logs, total] = await Promise.all([
        db_1.prisma.auditLog.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { created_at: 'desc' }, include: { user: { select: { id: true, full_name: true, email: true } } } }),
        db_1.prisma.auditLog.count({ where }),
    ]);
    return { logs, total };
}
async function createAuditLog(data) {
    return db_1.prisma.auditLog.create({
        data: {
            userId: data.userId,
            action: data.action,
            entity: data.entity,
            entityId: data.entityId,
            description: data.description,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            module: data.module || 'Admin',
            status: data.status || 'Success',
            level: data.level || 'info',
        },
    });
}
async function getNotifications(userId, page = 1, limit = 20) {
    const [notifications, total] = await Promise.all([
        db_1.prisma.notification.findMany({ where: { userId }, skip: (page - 1) * limit, take: limit, orderBy: { created_at: 'desc' } }),
        db_1.prisma.notification.count({ where: { userId } }),
    ]);
    return { notifications, total };
}
async function createNotification(data) {
    return db_1.prisma.notification.create({ data });
}
async function markNotificationRead(notificationId) {
    return db_1.prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
}
async function markAllNotificationsRead(userId) {
    return db_1.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
async function dismissNotification(notificationId) {
    return db_1.prisma.notification.delete({ where: { id: notificationId } });
}
