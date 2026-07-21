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
exports.PaymentController = void 0;
const paymentService = __importStar(require("./service_payment"));
const response_1 = require("../../utils/response");
class PaymentController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { payments, total } = await paymentService.getPayments(page, limit);
                res.json((0, response_1.paginatedResponse)(payments, page, limit, total));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const payment = await paymentService.getPaymentById(String(req.params.id));
                if (!payment)
                    return res.status(404).json({ success: false, error: { message: 'Payment not found' } });
                res.json((0, response_1.successResponse)(payment));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            try {
                const payment = await paymentService.createPayment({ ...req.body, userId: req.user.id });
                res.status(201).json((0, response_1.successResponse)(payment, 'Payment recorded'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.markPaid = async (req, res) => {
            try {
                const payment = await paymentService.markAsPaid(String(req.params.id));
                res.json((0, response_1.successResponse)(payment, 'Payment marked as paid'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.summary = async (req, res) => {
            try {
                const summary = await paymentService.getFinanceSummary(req.user.id);
                res.json((0, response_1.successResponse)(summary));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.PaymentController = PaymentController;
