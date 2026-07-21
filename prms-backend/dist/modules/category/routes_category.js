"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_category_1 = require("./controller_category");
const router = express_1.default.Router();
const ctrl = new controller_category_1.CategoryController();
router.use(auth_1.authenticate);
// Shared categories - any authenticated user can read
router.get('/shared', ctrl.shared);
// Admin endpoints
router.get('/', rbac_1.adminOnly, ctrl.list);
router.post('/', rbac_1.adminOnly, ctrl.create);
router.post('/seed', rbac_1.adminOnly, ctrl.seedDefaults);
router.get('/:id', rbac_1.adminOnly, ctrl.getById);
router.put('/:id', rbac_1.adminOnly, ctrl.update);
router.patch('/:id/toggle', rbac_1.adminOnly, ctrl.toggle);
router.delete('/:id', rbac_1.adminOnly, ctrl.remove);
exports.default = router;
