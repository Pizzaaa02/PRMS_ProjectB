import { apiClient } from './ApiClient';

export const bookingApi = {
  list(params) {
    return apiClient.get('/bookings', { params });
  },
  myBookings() {
    return apiClient.get('/bookings/my-bookings');
  },
  getById(id) {
    return apiClient.get(`/bookings/${id}`);
  },
  create(data) {
    return apiClient.post('/bookings', data);
  },
  update(id, data) {
    return apiClient.put(`/bookings/${id}`, data);
  },
  cancel(id) {
    return apiClient.patch(`/bookings/${id}/cancel`);
  },
  /**
   * Check for date overlap on a property.
   * Expects params: { propertyId, startDate, endDate }
   * Returns { hasOverlap: boolean, conflictingBookings: Booking[] }
   */
  checkOverlap(params) {
    return apiClient.get('/booking/check-overlap', { params });
  },
};
