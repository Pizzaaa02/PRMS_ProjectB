import { apiClient } from './ApiClient';

export const adminApi = {
  /* Settings */
  getSettings() {
    return apiClient.get('/admin/settings');
  },
  getSettingsByCategory(category) {
    return apiClient.get(`/admin/settings/category/${category}`);
  },
  getPublicSettings() {
    return apiClient.get('/admin/settings/public');
  },
  updateSetting(data) {
    return apiClient.put('/admin/settings', data);
  },
  uploadLogo(logoFile) {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return apiClient.post('/admin/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  bulkUpdateSettings(dataArray) {
    return apiClient.put('/admin/settings/bulk', { settings: dataArray });
  },
  addSetting(data) {
    return apiClient.post('/admin/settings', data);
  },

  /* Audit logs */
  getAuditLogs(params) {
    return apiClient.get('/admin/audit-logs', { params });
  },

  /* Notifications */
  getNotifications(params) {
    return apiClient.get('/admin/notifications', { params });
  },
  markAsRead(id) {
    return apiClient.patch(`/admin/notifications/${id}/read`);
  },
  markAllAsRead() {
    return apiClient.post('/admin/notifications/read-all');
  },
  dismiss(id) {
    return apiClient.delete(`/admin/notifications/${id}`);
  },

  /* Dashboard / Reporting (proxied through /reports) */
  getDashboardStats() {
    return apiClient.get('/reports/dashboard');
  },
  getRevenueReport() {
    return apiClient.get('/reports/revenue');
  },

  /* Theme / Customization */
  getTheme() {
    return apiClient.get('/admin/themes');
  },
  saveDraft(themeId, lightConfig, darkConfig) {
    return apiClient.put(`/admin/themes/${themeId}/draft`, { themeId, lightConfig, darkConfig });
  },
  publishTheme(themeId) {
    return apiClient.post(`/admin/themes/${themeId}/publish`);
  },
  getVersions(themeId) {
    return apiClient.get(`/admin/themes/${themeId}/versions`);
  },
  restoreVersion(themeId, version) {
    return apiClient.post(`/admin/themes/${themeId}/versions/${version}/restore`, { version });
  },
  /* Theme / Published theme */
  getThemeById(themeId) {
    return apiClient.get(`/admin/themes/${themeId}`);
  },

  /* Website Customizer (Flask API) */
  // These use the standalone Flask customizer server at /api/customizer

  getCustomizerConfig() {
    return apiClient.get('/admin/customizer');
  },

  updateCustomizerConfig(data) {
    return apiClient.put('/admin/customizer', data);
  },

  patchCustomizerField(field, value) {
    return apiClient.patch(`/admin/customizer/${field}`, { [field]: value });
  },

  generateCustomizerHtml() {
    return apiClient.get('/admin/customizer/generate-html');
  },

  resetCustomizerConfig() {
    return apiClient.post('/admin/customizer/reset', {});
  },

};
