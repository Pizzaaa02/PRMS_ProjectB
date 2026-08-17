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
exports.notificationController = exports.NotificationController = void 0;
const notificationService = __importStar(require("./service_notification"));
const response_1 = require("../../utils/response");
class NotificationController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const userId = req.user?.id;
                if (!userId)
                    return res.status(401).json({ success: false, error: { message: 'User required' } });
                const { isRead, archived } = req.query;
                const data = await notificationService.getNotifications(userId, isRead === 'true' ? true : isRead === 'false' ? false : undefined, archived === 'true' ? true : archived === 'false' ? false : undefined);
                res.json((0, response_1.successResponse)(data));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.markRead = async (req, res) => {
            try {
                const userId = req.user?.id;
                if (!userId)
                    return res.status(401).json({ success: false, error: { message: 'User required' } });
                const data = await notificationService.markRead(String(req.params.id));
                res.json((0, response_1.successResponse)(data));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.markAllRead = async (req, res) => {
            try {
                const userId = req.user?.id;
                if (!userId)
                    return res.status(401).json({ success: false, error: { message: 'User required' } });
                await notificationService.markAllRead(userId);
                res.json((0, response_1.successResponse)(null, 'All marked as read'));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.delete = async (req, res) => {
            try {
                const userId = req.user?.id;
                if (!userId)
                    return res.status(401).json({ success: false, error: { message: 'User required' } });
                await notificationService.deleteNotification(String(req.params.id));
                res.json((0, response_1.successResponse)(null, 'Notification deleted'));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            try {
                const userId = req.user?.id;
                const data = await notificationService.createNotification(userId, req.body);
                res.status(201).json((0, response_1.successResponse)(data, 'Notification created'));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
