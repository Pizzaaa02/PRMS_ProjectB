import express from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOrLandlord } from '../../middleware/rbac';
import { UserController } from './controller_user';
import { AuthRequest } from '../../middleware/auth';
import upload from '../../middleware/fileUpload';
import { FileUploadController } from './controller_fileUpload';
import { getUserMedia, deletePropertyImage } from './service_fileUpload';

const router = express.Router();
const ctrl = new UserController();
const fileCtrl = new FileUploadController();

router.use(authenticate);

// File upload endpoints (MUST come before /:id routes)
router.post('/files', upload.single('file'), fileCtrl.upload);
router.get('/files', fileCtrl.list);
router.get('/files/:fileId', fileCtrl.getById);
router.delete('/files/:fileId', fileCtrl.remove);

// My Documents media endpoint (includes property images)
router.get('/my-media', fileCtrl.getUserMedia);

// Delete property image endpoint
router.delete('/my-media/images/:imageId', async (req, res) => {
  const imageId = String(req.params.imageId);
  try {
    const result = await deletePropertyImage(imageId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
