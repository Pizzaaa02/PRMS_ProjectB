"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_booking_1 = require("./controller_booking");
const router = express_1.default.Router();
const ctrl = new controller_booking_1.BookingController();
router.get('/', auth_1.authenticate, rbac_1.adminOrLandlord, ctrl.list);
router.get('/my-bookings', auth_1.authenticate, ctrl.myBookings);
router.get('/:id', auth_1.authenticate, ctrl.getById);
router.post('/', auth_1.authenticate, ctrl.create);
router.put('/:id', auth_1.authenticate, rbac_1.adminOrLandlord, ctrl.update);
router.patch('/:id/cancel', auth_1.authenticate, ctrl.cancel);
router.get('/check-overlap', auth_1.authenticate, ctrl.checkOverlap);
exports.default = router;
