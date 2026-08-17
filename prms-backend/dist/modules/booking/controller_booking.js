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
exports.BookingController = void 0;
const bookingService = __importStar(require("./service_booking"));
const response_1 = require("../../utils/response");
const service_audit_1 = require("../admin/service_audit");
const HELPERS = (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'];
    const url = req.originalUrl;
    const method = req.method;
    const auth = req;
    const log = async (ctx) => {
        await (0, service_audit_1.recordAudit)({ ...ctx, userId: auth.user?.id, username: auth.user?.email || undefined, userRole: auth.user?.role, ipAddress: ip, userAgent: ua, requestUrl: url, httpMethod: method, module: 'Booking', status: ctx.status || 'Success', level: ctx.level || 'info' });
    };
    return { log };
};
class BookingController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { userId, status } = req.query;
                const { bookings, total } = await bookingService.getBookings(page, limit, userId, status);
                HELPERS(req).log({ action: 'VIEW_BOOKINGS', entity: 'Booking', description: `Listed bookings (page ${page})` });
                res.json((0, response_1.paginatedResponse)(bookings, page, limit, total));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_BOOKINGS', entity: 'Booking', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const booking = await bookingService.getBookingById(String(req.params.id));
                if (!booking)
                    return res.status(404).json({ success: false, error: { message: 'Booking not found' } });
                HELPERS(req).log({ action: 'VIEW_BOOKING', entity: 'Booking', entityId: booking.id, description: `Viewed booking ${booking.id}` });
                res.json((0, response_1.successResponse)(booking));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_BOOKING', entity: 'Booking', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            try {
                const booking = await bookingService.createBooking(req.body, req.user.id);
                HELPERS(req).log({ action: 'CREATE_BOOKING', entity: 'Booking', entityId: booking.id, description: `Created booking for property ${booking.propertyId}` });
                res.status(201).json((0, response_1.successResponse)(booking, 'Booking created'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'CREATE_BOOKING', entity: 'Booking', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.update = async (req, res) => {
            try {
                const booking = await bookingService.updateBooking(String(req.params.id), req.body);
                HELPERS(req).log({ action: 'UPDATE_BOOKING', entity: 'Booking', entityId: booking?.id, description: `Updated booking ${req.params.id}` });
                res.json((0, response_1.successResponse)(booking, 'Booking updated'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'UPDATE_BOOKING', entity: 'Booking', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.confirm = async (req, res) => {
            try {
                const booking = await bookingService.updateBooking(String(req.params.id), { status: 'CONFIRMED' });
                HELPERS(req).log({ action: 'CONFIRM_BOOKING', entity: 'Booking', entityId: req.params.id, description: `Confirmed booking ${req.params.id}` });
                res.json((0, response_1.successResponse)(booking, 'Booking confirmed'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'CONFIRM_BOOKING', entity: 'Booking', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.reject = async (req, res) => {
            try {
                const booking = await bookingService.updateBooking(String(req.params.id), { status: 'CANCELLED' });
                HELPERS(req).log({ action: 'REJECT_BOOKING', entity: 'Booking', entityId: req.params.id, description: `Rejected booking ${req.params.id}` });
                res.json((0, response_1.successResponse)(booking, 'Booking rejected'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'REJECT_BOOKING', entity: 'Booking', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.cancel = async (req, res) => {
            try {
                await bookingService.cancelBooking(String(req.params.id));
                HELPERS(req).log({ action: 'CANCEL_BOOKING', entity: 'Booking', entityId: req.params.id, description: `Cancelled booking ${req.params.id}` });
                res.json((0, response_1.successResponse)(null, 'Booking cancelled'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'CANCEL_BOOKING', entity: 'Booking', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.getSummary = async (req, res) => {
            try {
                const summary = await bookingService.getBookingSummary();
                HELPERS(req).log({ action: 'VIEW_BOOKING_SUMMARY', entity: 'Booking', description: `Viewed booking summary` });
                res.json((0, response_1.successResponse)(summary));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_BOOKING_SUMMARY', entity: 'Booking', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.myBookings = async (req, res) => {
            try {
                const bookings = await bookingService.getMyBookings(req.user.id);
                HELPERS(req).log({ action: 'VIEW_MY_BOOKINGS', entity: 'Booking', description: `Viewed own bookings` });
                res.json((0, response_1.successResponse)(bookings));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_MY_BOOKINGS', entity: 'Booking', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.checkOverlap = async (req, res) => {
            try {
                const { propertyId, startDate, endDate, excludeBookingId } = req.query;
                const result = await bookingService.checkOverlap(String(propertyId), String(startDate), String(endDate), excludeBookingId ? String(excludeBookingId) : undefined);
                HELPERS(req).log({ action: 'CHECK_OVERLAP', entity: 'Booking', description: `Checked overlap for property ${propertyId}` });
                res.json((0, response_1.successResponse)(result));
            }
            catch (error) {
                HELPERS(req).log({ action: 'CHECK_OVERLAP', entity: 'Booking', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.BookingController = BookingController;
