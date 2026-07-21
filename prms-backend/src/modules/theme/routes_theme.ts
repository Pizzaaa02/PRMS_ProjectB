import express from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';
import { ThemeController } from './controller_theme';

const router = express.Router();
const ctrl = new ThemeController();

router.use(authenticate);

// Theme data - authenticated users
router.get('/themes', ctrl.getTheme);
router.get('/themes/:themeId/draft', ctrl.getDraft);
router.get('/themes/:themeId/versions', ctrl.getVersions);

// Admin only - write operations
router.put('/themes/:themeId/draft', adminOnly, ctrl.saveDraft);
router.post('/themes/:themeId/publish', adminOnly, ctrl.publishDraft);
router.post('/themes/:themeId/versions/:version/restore', adminOnly, ctrl.restoreVersion);

export default router;
