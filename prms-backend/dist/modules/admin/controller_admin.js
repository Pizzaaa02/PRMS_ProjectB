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
exports.AdminController = void 0;
const adminService = __importStar(require("./service_admin"));
const response_1 = require("../../utils/response");
class AdminController {
    constructor() {
        this.getSettings = async (req, res) => {
            try {
                const settings = await adminService.getSystemSettings();
                res.json((0, response_1.successResponse)(settings));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getSettingsByCategory = async (req, res) => {
            try {
                const { category } = req.params;
                const settings = await adminService.getSystemSettingsByCategory(String(category));
                res.json((0, response_1.successResponse)(settings));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getPublicSettings = async (req, res) => {
            try {
                const settings = await adminService.getPublicSystemSettings();
                res.json((0, response_1.successResponse)(settings));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.bulkUpdateSettings = async (req, res) => {
            try {
                const settingsList = req.body.settings || req.body;
                const updated = await adminService.bulkUpdateSystemSettings(settingsList);
                res.json((0, response_1.successResponse)(updated, 'Settings updated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.updateSetting = async (req, res) => {
            try {
                const { key, value } = req.body;
                const setting = await adminService.updateSystemSetting(key, value);
                res.json((0, response_1.successResponse)(setting, 'Setting updated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.addSetting = async (req, res) => {
            try {
                const { key, value, category, description } = req.body;
                const setting = await adminService.addSystemSetting(key, value, category, description);
                res.status(201).json((0, response_1.successResponse)(setting, 'Setting created'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.uploadLogo = async (req, res) => {
            try {
                const file = req.file;
                if (!file) {
                    return res.status(400).json({ success: false, error: { message: 'No logo file uploaded' } });
                }
                const filePath = `/files/${file.filename}`;
                const setting = await adminService.uploadSystemSetting('branding_logo_url', filePath);
                res.json((0, response_1.successResponse)(setting, 'Logo uploaded'));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getAuditLogs = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const { logs, total } = await adminService.getAuditLogs(page, limit, req.query.entity);
                res.json((0, response_1.paginatedResponse)(logs, page, limit, total));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getNotifications = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const { notifications, total } = await adminService.getNotifications(req.user.id, page, limit);
                res.json((0, response_1.paginatedResponse)(notifications, page, limit, total));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.markNotificationRead = async (req, res) => {
            try {
                await adminService.markNotificationRead(String(req.params.id));
                res.json((0, response_1.successResponse)(null, 'Notification marked as read'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.markAllRead = async (req, res) => {
            try {
                await adminService.markAllNotificationsRead(req.user.id);
                res.json((0, response_1.successResponse)(null, 'All notifications marked as read'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.dismissNotification = async (req, res) => {
            try {
                await adminService.dismissNotification(String(req.params.id));
                res.json((0, response_1.successResponse)(null, 'Notification dismissed'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.AdminController = AdminController;
