"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rbac_1 = require("../../middleware/rbac");
const auth_1 = require("../../middleware/auth");
const controller_agent_1 = require("./controller_agent");
const router = express_1.default.Router();
const agent = new controller_agent_1.AgentController();
router.get('/', auth_1.authenticate, rbac_1.adminOrAgent, agent.list);
router.get('/:id', auth_1.authenticate, rbac_1.adminOrAgent, agent.getById);
router.post('/', auth_1.authenticate, rbac_1.adminOrAgent, agent.create);
router.put('/:id', auth_1.authenticate, rbac_1.adminOrAgent, agent.update);
router.delete('/:id', auth_1.authenticate, rbac_1.agentOnly, agent.remove);
router.post('/:id/assign', auth_1.authenticate, rbac_1.adminOrAgent, agent.assignProperty);
router.get('/:id/properties', auth_1.authenticate, rbac_1.adminOrAgent, agent.getAssignedProperties);
exports.default = router;
