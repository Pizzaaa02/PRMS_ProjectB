"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_user_1 = require("./controller_user");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const controller_fileUpload_1 = require("./controller_fileUpload");
const router = express_1.default.Router();
const ctrl = new controller_user_1.UserController();
const fileCtrl = new controller_fileUpload_1.FileUploadController();
router.use(auth_1.authenticate);
router.get('/', rbac_1.adminOrLandlord, ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', rbac_1.adminOnly, ctrl.create);
router.put('/:id', rbac_1.adminOnly, ctrl.update);
router.delete('/:id', rbac_1.adminOnly, ctrl.remove);
router.post('/:id/activate', rbac_1.adminOnly, ctrl.activate);
router.post('/:id/suspend', rbac_1.adminOnly, ctrl.suspend);
router.post('/:id/change-role', rbac_1.adminOnly, ctrl.changeRole);
// File upload endpoints
router.post('/files', fileUpload_1.default.single('file'), fileCtrl.upload);
router.get('/files', fileCtrl.list);
router.get('/files/:id', fileCtrl.getById);
router.delete('/files/:id', fileCtrl.remove);
exports.default = router;
