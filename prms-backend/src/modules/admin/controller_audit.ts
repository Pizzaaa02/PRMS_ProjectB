import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as auditService from './service_audit';
import { paginatedResponse } from '../../utils/response';

export class AuditController {
  list = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const { action, level, userId, search, sort } = req.query as any;
      const orderBy: any = sort === 'asc' ? { created_at: 'asc' } : { created_at: 'desc' };
      const { logs, total } = await auditService.getAuditLogs(page, limit, { action, level, userId, search, orderBy });
      res.json(paginatedResponse(logs, page, limit, total));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const log = await auditService.getAuditLogById(String(req.params.id));
      if (!log) return res.status(404).json({ success: false, error: { message: 'Log not found' } });
      res.json({ success: true, data: log });
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const { action, details, level, resourceId } = req.body;
      const log = await auditService.createAuditLog(req.user!.id, action, details, level, resourceId);
      res.status(201).json({ success: true, data: log });
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };
}

export const auditController = new AuditController();