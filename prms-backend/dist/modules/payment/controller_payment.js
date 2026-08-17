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
const service_audit_1 = require("../admin/service_audit");
const HELPERS = (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'];
    const url = req.originalUrl;
    const method = req.method;
    const auth = req;
    const log = async (ctx) => {
        await (0, service_audit_1.recordAudit)({ ...ctx, userId: auth.user?.id, username: auth.user?.email || undefined, userRole: auth.user?.role, ipAddress: ip, userAgent: ua, requestUrl: url, httpMethod: method, module: 'Payment', status: ctx.status || 'Success', level: ctx.level || 'info' });
    };
    return { log };
};
class PaymentController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { payments, total } = await paymentService.getPayments(page, limit);
                HELPERS(req).log({ action: 'VIEW_PAYMENTS', entity: 'Payment', description: `Listed payments (page ${page})` });
                res.json((0, response_1.paginatedResponse)(payments, page, limit, total));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_PAYMENTS', entity: 'Payment', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const payment = await paymentService.getPaymentById(String(req.params.id));
                if (!payment)
                    return res.status(404).json({ success: false, error: { message: 'Payment not found' } });
                HELPERS(req).log({ action: 'VIEW_PAYMENT', entity: 'Payment', entityId: payment.id, description: `Viewed payment` });
                res.json((0, response_1.successResponse)(payment));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_PAYMENT', entity: 'Payment', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            try {
                const payment = await paymentService.createPayment({ ...req.body, userId: req.user.id });
                HELPERS(req).log({ action: 'CREATE_PAYMENT', entity: 'Payment', entityId: payment.id, description: `Created payment of amount ${req.body.amount}` });
                res.status(201).json((0, response_1.successResponse)(payment, 'Payment recorded'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'CREATE_PAYMENT', entity: 'Payment', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.markPaid = async (req, res) => {
            try {
                const payment = await paymentService.markAsPaid(String(req.params.id));
                HELPERS(req).log({ action: 'MARK_PAYMENT_PAID', entity: 'Payment', entityId: req.params.id, description: `Payment marked as paid` });
                res.json((0, response_1.successResponse)(payment, 'Payment marked as paid'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'MARK_PAYMENT_PAID', entity: 'Payment', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.summary = async (req, res) => {
            try {
                const summary = await paymentService.getFinanceSummary(req.user.id);
                HELPERS(req).log({ action: 'VIEW_PAYMENT_SUMMARY', entity: 'Payment', description: `Viewed financial summary` });
                res.json((0, response_1.successResponse)(summary));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_PAYMENT_SUMMARY', entity: 'Payment', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.PaymentController = PaymentController;
