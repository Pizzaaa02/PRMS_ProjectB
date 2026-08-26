"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_admin_1 = require("./controller_admin");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const router = express_1.default.Router();
const ctrl = new controller_admin_1.AdminController();
router.use(auth_1.authenticate);
// Settings - admin only
router.get('/settings', rbac_1.adminOnly, ctrl.getSettings);
router.get('/settings/category/:category', rbac_1.adminOnly, ctrl.getSettingsByCategory);
router.get('/settings/public', ctrl.getPublicSettings);
router.put('/settings', rbac_1.adminOnly, ctrl.updateSetting);
router.put('/settings/bulk', rbac_1.adminOnly, ctrl.bulkUpdateSettings);
router.post('/settings', rbac_1.adminOnly, ctrl.addSetting);
router.post('/settings/logo', rbac_1.adminOnly, fileUpload_1.default.single('logo'), ctrl.uploadLogo);
// Audit logs - admin only
router.get('/audit-logs', rbac_1.adminOnly, ctrl.getAuditLogs);
// Notifications - any authenticated user
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/:id/read', ctrl.markNotificationRead);
router.post('/notifications/read-all', ctrl.markAllRead);
router.delete('/notifications/:id', ctrl.dismissNotification);
exports.default = router;
