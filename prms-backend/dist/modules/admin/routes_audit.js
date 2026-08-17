"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_audit_1 = require("./controller_audit");
const router = express_1.default.Router();
router.use(auth_1.authenticate, rbac_1.adminOnly);
router.get('/audit-logs', controller_audit_1.auditController.list);
router.get('/audit-logs/:id', controller_audit_1.auditController.getById);
router.post('/audit-logs', controller_audit_1.auditController.create);
exports.default = router;
