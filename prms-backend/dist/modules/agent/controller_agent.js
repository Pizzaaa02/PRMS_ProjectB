"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const agentService = __importStar(require("./service_agent"));
const response_1 = require("../../utils/response");
class AgentController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { search, propertyId } = req.query;
                const { agents, total } = await agentService.getAllAgents(page, limit, search, propertyId);
                res.json((0, response_1.paginatedResponse)(agents, page, limit, total));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const agent = await agentService.getAgentById(String(req.params.id));
                if (!agent)
                    return res.status(404).json({ success: false, error: { message: 'Agent not found' } });
                res.json((0, response_1.successResponse)(agent));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            try {
                const { userId } = req.body;
                const agent = await agentService.createAgent(userId);
                res.status(201).json((0, response_1.successResponse)(agent, 'Agent created'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.update = async (req, res) => {
            try {
                const agent = await agentService.updateAgent(String(req.params.id), req.body);
                res.json((0, response_1.successResponse)(agent, 'Agent updated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.remove = async (req, res) => {
            try {
                await agentService.deleteAgent(String(req.params.id));
                res.json((0, response_1.successResponse)(null, 'Agent deleted'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.assignProperty = async (req, res) => {
            try {
                const { propertyId } = req.body;
                await agentService.assignProperty(String(req.params.id), propertyId);
                res.json((0, response_1.successResponse)(null, 'Property assigned to agent'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.getAssignedProperties = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { agents, total } = await agentService.getAssignedProperties(String(req.params.id), page, limit);
                res.json((0, response_1.paginatedResponse)(agents, page, limit, total));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.AgentController = AgentController;
