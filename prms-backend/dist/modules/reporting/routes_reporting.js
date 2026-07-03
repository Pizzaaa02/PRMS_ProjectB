"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_reporting_1 = require("./controller_reporting");
const router = express_1.default.Router();
const ctrl = new controller_reporting_1.ReportingController();
router.use(auth_1.authenticate, rbac_1.adminOrLandlord);
router.get('/dashboard', ctrl.dashboard);
router.get('/revenue', ctrl.revenue);
router.get('/properties', ctrl.properties);
router.get('/occupancy', ctrl.occupancy);
exports.default = router;
