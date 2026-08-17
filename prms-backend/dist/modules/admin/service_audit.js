"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.recordAudit = recordAudit;
exports.getAuditLogs = getAuditLogs;
exports.getAuditLogById = getAuditLogById;
exports.getAuditStats = getAuditStats;
exports.exportAuditLogsCSV = exportAuditLogsCSV;
const db_1 = require("../../db");
// ─── Create / Record ─────────────────────────────────────────────────────────
async function createAuditLog(input) {
    return db_1.prisma.auditLog.create({
        data: {
            userId: input.userId,
            username: input.username,
            userRole: input.userRole,
            module: input.module,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            description: input.description,
            oldValue: input.oldValue,
            newValue: input.newValue,
            status: input.status || 'Success',
            level: input.level || 'info',
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
            requestUrl: input.requestUrl,
            httpMethod: input.httpMethod,
            errorMessage: input.errorMessage,
        },
    });
}
/**
 * Async fire-and-forget helper so controllers don't block on audit writes.
 * Errors are logged silently so audit logging never fails a user request.
 */
async function recordAudit(input) {
    try {
        await createAuditLog(input);
    }
    catch (err) {
        console.error('[AuditLog] write failed:', err.message);
    }
}
// ─── Read / Query ────────────────────────────────────────────────────────────
function buildWhere(filters) {
    const where = {};
    if (filters.action)
        where.action = filters.action;
    if (filters.level)
        where.level = filters.level;
    if (filters.userId)
        where.userId = filters.userId;
    if (filters.username) {
        where.username = { contains: filters.username, mode: 'insensitive' };
    }
    if (filters.module) {
        where.module = { equals: filters.module, mode: 'insensitive' };
    }
    if (filters.entity) {
        where.entity = { contains: filters.entity, mode: 'insensitive' };
    }
    if (filters.status) {
        where.status = { equals: filters.status, mode: 'insensitive' };
    }
    if (filters.dateFrom || filters.dateTo) {
        where.created_at = {};
        if (filters.dateFrom)
            where.created_at.gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            where.created_at.lte = new Date(filters.dateTo);
    }
    if (filters.search) {
        where.OR = [
            { action: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { username: { contains: filters.search, mode: 'insensitive' } },
            { entity: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    return where;
}
async function getAuditLogs(page, limit, filters) {
    const where = buildWhere(filters);
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        db_1.prisma.auditLog.findMany({
            where,
            skip,
            take: limit,
            orderBy: filters.orderBy || { created_at: 'desc' },
            include: {
                user: { select: { id: true, full_name: true, email: true } },
            },
        }),
        db_1.prisma.auditLog.count({ where }),
    ]);
    return { logs, total };
}
async function getAuditLogById(id) {
    return db_1.prisma.auditLog.findUnique({
        where: { id },
        include: { user: { select: { id: true, full_name: true, email: true } } },
    });
}
async function getAuditStats() {
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const [totalActivities, todaysActivities, failedLogins, mostActiveUsers, mostModifiedModules, totalSuccess, recentActivities,] = await Promise.all([
        db_1.prisma.auditLog.count(),
        db_1.prisma.auditLog.count({ where: { created_at: { gte: startToday } } }),
        db_1.prisma.auditLog.count({
            where: {
                action: { contains: 'login', mode: 'insensitive' },
                status: { equals: 'Failed', mode: 'insensitive' },
            },
        }),
        db_1.prisma.auditLog.groupBy({
            by: ['userId', 'username'],
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 10,
        }),
        db_1.prisma.auditLog.groupBy({
            by: ['module'],
            _count: { module: true },
            orderBy: { _count: { module: 'desc' } },
            take: 10,
        }),
        db_1.prisma.auditLog.count({
            where: { status: { equals: 'Success', mode: 'insensitive' } },
        }),
        db_1.prisma.auditLog.findMany({
            take: 10,
            orderBy: { created_at: 'desc' },
            include: {
                user: { select: { id: true, full_name: true, email: true } },
            },
        }),
    ]);
    return {
        totalActivities,
        todaysActivities,
        failedLogins,
        mostActiveUsers: mostActiveUsers.map((u) => ({
            userId: u.userId || 'system',
            username: u.username || 'System',
            count: u._count.userId,
        })),
        mostModifiedModules: mostModifiedModules.map((m) => ({
            module: m.module,
            count: m._count.module,
        })),
        successRate: totalActivities > 0 ? Math.round((totalSuccess / totalActivities) * 100) : 0,
        recentActivities,
    };
}
// ─── Export ───────────────────────────────────────────────────────────────────
async function exportAuditLogsCSV(filters) {
    const where = buildWhere(filters);
    const logs = await db_1.prisma.auditLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: 10000,
        include: {
            user: { select: { full_name: true, email: true } },
        },
    });
    const headers = [
        'Timestamp',
        'User ID',
        'Username',
        'User Role',
        'Module',
        'Action',
        'Entity',
        'Entity ID',
        'Description',
        'Status',
        'Level',
        'IP Address',
        'Request URL',
        'HTTP Method',
        'Error Message',
    ];
    const csvRows = [
        headers.join(','),
        ...logs.map((log) => [
            new Date(log.created_at).toISOString(),
            `"${log.userId || ''}"`,
            `"${log.username || ''}"`,
            `"${log.userRole || ''}"`,
            `"${log.module || ''}"`,
            `"${log.action}"`,
            `"${log.entity}"`,
            `"${log.entityId || ''}"`,
            `"${(log.description || '').replace(/"/g, '""')}"`,
            `"${log.status}"`,
            `"${log.level}"`,
            `"${log.ipAddress || ''}"`,
            `"${log.requestUrl || ''}"`,
            `"${log.httpMethod || ''}"`,
            `"${(log.errorMessage || '').replace(/"/g, '""')}"`,
        ].join(',')),
    ];
    return csvRows.join('\n');
}
