"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditController = exports.AuditController = void 0;
const auditService = __importStar(require("./service_audit"));
const response_1 = require("../../utils/response");
class AuditController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const { action, level, userId, username, module, entity, status, search, sort, dateFrom, dateTo } = req.query;
                const orderByCol = sort === 'user' ? 'username' : sort === 'module' ? 'module' : sort === 'action' ? 'action' : 'created_at';
                const orderByDir = req.query.sortDir === 'asc' ? 'asc' : 'desc';
                const { logs, total } = await auditService.getAuditLogs(page, limit, {
                    action, level, userId, username, module, entity, status, search, dateFrom, dateTo,
                    orderBy: { [orderByCol]: orderByDir },
                });
                res.json((0, response_1.paginatedResponse)(logs, page, limit, total));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const log = await auditService.getAuditLogById(String(req.params.id));
                if (!log)
                    return res.status(404).json({ success: false, error: { message: 'Log not found' } });
                res.json({ success: true, data: log });
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            try {
                const { action, details, level, resourceId, module, entity, entityId, description } = req.body;
                const data = await auditService.createAuditLog({
                    userId: req.user.id,
                    username: req.user.email,
                    userRole: req.user.role,
                    module: module || 'Admin',
                    action: action || 'MANUAL',
                    entity: entity || 'System',
                    entityId: entityId || resourceId,
                    description: details,
                    level: level || 'info',
                });
                res.status(201).json({ success: true, data });
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.AuditController = AuditController;
exports.auditController = new AuditController();
