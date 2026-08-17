"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_notification_1 = require("./controller_notification");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/', controller_notification_1.notificationController.list);
router.patch('/:id/read', controller_notification_1.notificationController.markRead);
router.patch('/read-all', controller_notification_1.notificationController.markAllRead);
router.delete('/:id', controller_notification_1.notificationController.delete);
router.post('/', rbac_1.adminOnly, controller_notification_1.notificationController.create);
exports.default = router;
