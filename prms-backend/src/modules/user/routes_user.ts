import express from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOnly, adminOrLandlord } from '../../middleware/rbac';
import { UserController } from './controller_user';
import upload from '../../middleware/fileUpload';
import { FileUploadController } from './controller_fileUpload';

const router = express.Router();
const ctrl = new UserController();
const fileCtrl = new FileUploadController();

router.use(authenticate);
router.get('/', adminOrLandlord, ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', adminOnly, ctrl.create);
router.put('/:id', adminOnly, ctrl.update);
router.delete('/:id', adminOnly, ctrl.remove);
router.post('/:id/activate', adminOnly, ctrl.activate);
router.post('/:id/suspend', adminOnly, ctrl.suspend);
router.post('/:id/change-role', adminOnly, ctrl.changeRole);

// File upload endpoints
router.post('/files', upload.single('file'), fileCtrl.upload);
router.get('/files', fileCtrl.list);
router.get('/files/:id', fileCtrl.getById);
router.delete('/files/:id', fileCtrl.remove);

export default router;
