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
exports.UserController = void 0;
const userService = __importStar(require("./service_user"));
const service_audit_1 = require("../admin/service_audit");
const response_1 = require("../../utils/response");
const HELPERS = (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'];
    const url = req.originalUrl;
    const method = req.method;
    const auth = req;
    const log = async (ctx) => {
        await (0, service_audit_1.recordAudit)({ ...ctx, userId: auth.user?.id, username: auth.user?.email || undefined, userRole: auth.user?.role, ipAddress: ip, userAgent: ua, requestUrl: url, httpMethod: method, module: 'User Management', status: ctx.status || 'Success', level: ctx.level || 'info' });
    };
    return { log };
};
class UserController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { search, role, is_active } = req.query;
                const { users, total } = await userService.getAllUsers(page, limit, search, role, is_active);
                HELPERS(req).log({ action: 'VIEW_USERS', entity: 'User', description: `Listed users (page ${page})` });
                res.json((0, response_1.paginatedResponse)(users, page, limit, total));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_USERS', entity: 'User', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const user = await userService.getUserById(String(req.params.id));
                if (!user)
                    return res.status(404).json({ success: false, error: { message: 'User not found' } });
                HELPERS(req).log({ action: 'VIEW_USER', entity: 'User', entityId: user.id, description: `Viewed user ${user.email}` });
                res.json((0, response_1.successResponse)(user));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_USER', entity: 'User', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            try {
                const { email, password, full_name, phone, role } = req.body;
                const user = await userService.createUser(email, password, full_name, phone, role);
                HELPERS(req).log({ action: 'CREATE_USER', entity: 'User', entityId: user.id, description: `Created user ${email} with role ${role}` });
                res.status(201).json((0, response_1.successResponse)(user, 'User created'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'CREATE_USER', entity: 'User', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.update = async (req, res) => {
            try {
                const user = await userService.updateUser(String(req.params.id), req.body);
                HELPERS(req).log({ action: 'UPDATE_USER', entity: 'User', entityId: user.id, description: `Updated user ${user.email}` });
                res.json((0, response_1.successResponse)(user, 'User updated'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'UPDATE_USER', entity: 'User', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.remove = async (req, res) => {
            try {
                const userId = String(req.params.id);
                const user = await userService.getUserById(userId);
                await userService.softDeleteUser(userId);
                HELPERS(req).log({ action: 'DELETE_USER', entity: 'User', entityId: userId, description: `Deactivated user ${user?.email || userId}` });
                res.json((0, response_1.successResponse)(null, 'User deactivated'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'DELETE_USER', entity: 'User', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.activate = async (req, res) => {
            try {
                const user = await userService.activateUser(String(req.params.id));
                HELPERS(req).log({ action: 'ACTIVATE_USER', entity: 'User', entityId: user.id, description: `Activated user ${user.email}` });
                res.json((0, response_1.successResponse)(user, 'User activated'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'ACTIVATE_USER', entity: 'User', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.suspend = async (req, res) => {
            try {
                const user = await userService.suspendUser(String(req.params.id));
                HELPERS(req).log({ action: 'SUSPEND_USER', entity: 'User', entityId: user.id, description: `Suspended user ${user.email}` });
                res.json((0, response_1.successResponse)(user, 'User suspended'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'SUSPEND_USER', entity: 'User', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.changeRole = async (req, res) => {
            try {
                const { role } = req.body;
                const userId = String(req.params.id);
                await userService.changeUserRole(userId, role);
                HELPERS(req).log({ action: 'CHANGE_USER_ROLE', entity: 'User', entityId: userId, description: `Changed role to ${role}` });
                res.json((0, response_1.successResponse)(null, `Role changed to ${role}`));
            }
            catch (error) {
                HELPERS(req).log({ action: 'CHANGE_USER_ROLE', entity: 'User', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.UserController = UserController;
