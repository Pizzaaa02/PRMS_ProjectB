"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_payment_1 = require("./controller_payment");
const router = express_1.default.Router();
const ctrl = new controller_payment_1.PaymentController();
router.use(auth_1.authenticate);
router.get('/', rbac_1.adminOrLandlord, ctrl.list);
router.get('/summary', ctrl.summary);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.patch('/:id/mark-paid', rbac_1.adminOrLandlord, ctrl.markPaid);
exports.default = router;
