import { apiClient } from './ApiClient';

export const userApi = {
  list(params) {
    return apiClient.get('/users', { params });
  },
  // Real database-wide totals (total/active/suspended/per-role), independent
  // of the current search/filter/pagination - see service_user.ts's
  // getUserSummaryStats. Used by both AdminDashboard and UserManagement's
  // summary cards so they can't show mismatched numbers again.
  summary() {
    return apiClient.get('/users/summary');
  },
  getById(id) {
    return apiClient.get(`/users/${id}`);
  },
  create(data) {
    return apiClient.post('/users', data);
  },
  update(id, data) {
    return apiClient.put(`/users/${id}`, data);
  },
  remove(id) {
    return apiClient.delete(`/users/${id}`);
  },
  activate(id) {
    return apiClient.post(`/users/${id}/activate`);
  },
  suspend(id) {
    return apiClient.post(`/users/${id}/suspend`);
  },
  changeRole(id, data) {
    return apiClient.post(`/users/${id}/change-role`, data);
  },
};
