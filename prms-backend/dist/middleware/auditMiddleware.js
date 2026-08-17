"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = auditMiddleware;
const service_audit_1 = require("../modules/admin/service_audit");
async function logAuditWithContext(ctx, req) {
    const ip = req.ip || req.socket.remoteAddress || '';
    return (0, service_audit_1.recordAudit)({
        ...ctx,
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
        requestUrl: req.originalUrl,
        httpMethod: req.method,
    });
}
/**
 * Middleware that attaches `req.logAudit(ctx)` and wraps `res.json` to auto-log on error responses.
 */
function auditMiddleware(moduleName) {
    return (req, _res, next) => {
        const authReq = req;
        req.logAudit = async (ctx) => {
            await logAuditWithContext({
                ...ctx,
                module: ctx.module || moduleName,
                userId: ctx.userId || authReq.user?.id,
                username: ctx.username || authReq.user?.email,
                userRole: ctx.userRole || authReq.user?.role,
                status: ctx.status || 'Success',
                level: ctx.level || 'info',
            }, req);
        };
        next();
    };
}
