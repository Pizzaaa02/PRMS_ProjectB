import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as paymentService from './service_payment';
import { successResponse, paginatedResponse } from '../../utils/response';

export class PaymentController {
  list = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { payments, total } = await paymentService.getPayments(page, limit);
      res.json(paginatedResponse(payments, page, limit, total));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const payment = await paymentService.getPaymentById(String(req.params.id));
      if (!payment) return res.status(404).json({ success: false, error: { message: 'Payment not found' } });
      res.json(successResponse(payment));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const payment = await paymentService.createPayment({ ...req.body, userId: req.user!.id });
      res.status(201).json(successResponse(payment, 'Payment recorded'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  markPaid = async (req: Request, res: Response) => {
    try {
      const payment = await paymentService.markAsPaid(String(req.params.id));
      res.json(successResponse(payment, 'Payment marked as paid'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  summary = async (req: AuthRequest, res: Response) => {
    try {
      const summary = await paymentService.getFinanceSummary(req.user!.id);
      res.json(successResponse(summary));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };
}
