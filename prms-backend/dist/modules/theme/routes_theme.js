"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_theme_1 = require("./controller_theme");
const router = express_1.default.Router();
const ctrl = new controller_theme_1.ThemeController();
router.use(auth_1.authenticate);
// Theme data - authenticated users
router.get('/themes', ctrl.getTheme);
router.get('/themes/:themeId/draft', ctrl.getDraft);
router.get('/themes/:themeId/versions', ctrl.getVersions);
// Admin only - write operations
router.put('/themes/:themeId/draft', rbac_1.adminOnly, ctrl.saveDraft);
router.post('/themes/:themeId/publish', rbac_1.adminOnly, ctrl.publishDraft);
router.post('/themes/:themeId/versions/:version/restore', rbac_1.adminOnly, ctrl.restoreVersion);
exports.default = router;
