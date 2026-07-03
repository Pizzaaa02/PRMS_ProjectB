import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as bookingService from './service_booking';
import { successResponse, paginatedResponse } from '../../utils/response';

export class BookingController {
  list = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { userId, status } = req.query;
      const { bookings, total } = await bookingService.getBookings(page, limit, userId as any, status as any);
      res.json(paginatedResponse(bookings, page, limit, total));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const booking = await bookingService.getBookingById(String(req.params.id));
      if (!booking) return res.status(404).json({ success: false, error: { message: 'Booking not found' } });
      res.json(successResponse(booking));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const booking = await bookingService.createBooking(req.body, req.user!.id);
      res.status(201).json(successResponse(booking, 'Booking created'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const booking = await bookingService.updateBooking(String(req.params.id), req.body);
      res.json(successResponse(booking, 'Booking updated'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  cancel = async (req: Request, res: Response) => {
    try {
      await bookingService.cancelBooking(String(req.params.id));
      res.json(successResponse(null, 'Booking cancelled'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  myBookings = async (req: AuthRequest, res: Response) => {
    try {
      const bookings = await bookingService.getMyBookings(req.user!.id);
      res.json(successResponse(bookings));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  checkOverlap = async (req: Request, res: Response) => {
    try {
      const { propertyId, startDate, endDate, excludeBookingId } = req.query;
      const result = await bookingService.checkOverlap(
        String(propertyId),
        String(startDate),
        String(endDate),
        excludeBookingId ? String(excludeBookingId) : undefined,
      );
      res.json(successResponse(result));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };
}
