import express from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOrLandlord } from '../../middleware/rbac';
import { BookingController } from './controller_booking';

const router = express.Router();
const ctrl = new BookingController();

router.get('/', authenticate, adminOrLandlord, ctrl.list);
router.get('/my-bookings', authenticate, ctrl.myBookings);
router.get('/:id', authenticate, ctrl.getById);
router.post('/', authenticate, ctrl.create);
router.put('/:id', authenticate, adminOrLandlord, ctrl.update);
router.patch('/:id/cancel', authenticate, ctrl.cancel);
router.get('/check-overlap', authenticate, ctrl.checkOverlap);

export default router;
