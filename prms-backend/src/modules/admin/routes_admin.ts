import express from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';
import { AdminController } from './controller_admin';
import upload from '../../middleware/fileUpload';

const router = express.Router();
const ctrl = new AdminController();

router.use(authenticate);

// Settings - admin only
router.get('/settings', adminOnly, ctrl.getSettings);
router.get('/settings/category/:category', adminOnly, ctrl.getSettingsByCategory);
router.get('/settings/public', ctrl.getPublicSettings);
router.put('/settings', adminOnly, ctrl.updateSetting);
router.put('/settings/bulk', adminOnly, ctrl.bulkUpdateSettings);
router.post('/settings', adminOnly, ctrl.addSetting);
router.post('/settings/logo', adminOnly, upload.single('logo'), ctrl.uploadLogo);

// Audit logs - admin only
router.get('/audit-logs', adminOnly, ctrl.getAuditLogs);

// Notifications - any authenticated user
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/:id/read', ctrl.markNotificationRead);
router.post('/notifications/read-all', ctrl.markAllRead);
router.delete('/notifications/:id', ctrl.dismissNotification);

export default router;
