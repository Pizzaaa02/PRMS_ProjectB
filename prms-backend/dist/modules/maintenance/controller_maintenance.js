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
exports.MaintenanceController = void 0;
const maintenanceService = __importStar(require("./service_maintenance"));
const response_1 = require("../../utils/response");
const service_audit_1 = require("../admin/service_audit");
const HELPERS = (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'];
    const url = req.originalUrl;
    const method = req.method;
    const auth = req;
    const log = async (ctx) => {
        await (0, service_audit_1.recordAudit)({ ...ctx, userId: auth.user?.id, username: auth.user?.email || undefined, userRole: auth.user?.role, ipAddress: ip, userAgent: ua, requestUrl: url, httpMethod: method, module: 'Maintenance', status: ctx.status || 'Success', level: ctx.level || 'info' });
    };
    return { log };
};
class MaintenanceController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { tickets, total } = await maintenanceService.getTickets(page, limit);
                HELPERS(req).log({ action: 'VIEW_TICKETS', entity: 'MaintenanceTicket', description: `Listed tickets (page ${page})` });
                res.json((0, response_1.paginatedResponse)(tickets, page, limit, total));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_TICKETS', entity: 'MaintenanceTicket', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            try {
                const ticket = await maintenanceService.createTicket(req.body, req.user.id);
                HELPERS(req).log({ action: 'CREATE_TICKET', entity: 'MaintenanceTicket', entityId: ticket.id, description: `Created maintenance ticket for ${ticket.title}` });
                res.status(201).json((0, response_1.successResponse)(ticket, 'Ticket created'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'CREATE_TICKET', entity: 'MaintenanceTicket', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.update = async (req, res) => {
            try {
                const ticket = await maintenanceService.updateTicket(String(req.params.id), req.body);
                HELPERS(req).log({ action: 'UPDATE_TICKET', entity: 'MaintenanceTicket', entityId: req.params.id, description: `Updated ticket ${req.params.id}` });
                res.json((0, response_1.successResponse)(ticket, 'Ticket updated'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'UPDATE_TICKET', entity: 'MaintenanceTicket', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.resolve = async (req, res) => {
            try {
                await maintenanceService.resolveTicket(String(req.params.id));
                HELPERS(req).log({ action: 'RESOLVE_TICKET', entity: 'MaintenanceTicket', entityId: req.params.id, description: `Resolved ticket ${req.params.id}` });
                res.json((0, response_1.successResponse)(null, 'Ticket resolved'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'RESOLVE_TICKET', entity: 'MaintenanceTicket', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const ticket = await maintenanceService.getTicketById(String(req.params.id));
                if (!ticket)
                    return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
                HELPERS(req).log({ action: 'VIEW_TICKET', entity: 'MaintenanceTicket', entityId: ticket.id, description: `Viewed ticket ${ticket.id}` });
                res.json((0, response_1.successResponse)(ticket));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_TICKET', entity: 'MaintenanceTicket', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.MaintenanceController = MaintenanceController;
