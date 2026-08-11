import { apiClient } from './ApiClient';

export const propertyApi = {
  /* Public */
  list(params) {
    return apiClient.get('/properties', { params });
  },
  getById(id) {
    return apiClient.get(`/properties/${id}`);
  },

  /* Authenticated */
  myProperties() {
    return apiClient.get('/properties/my-properties');
  },
  create(data) {
    return apiClient.post('/properties', data);
  },
  update(id, data) {
    return apiClient.put(`/properties/${id}`, data);
  },
  deactivate(id) {
    return apiClient.delete(`/properties/${id}`);
  },
  addImage(propertyId, formData) {
    return apiClient.post(`/properties/${propertyId}/images`, formData, {
      headers: { 'Content-Type': undefined },
    });
  },
  deleteImage(imageId) {
    return apiClient.delete(`/properties/images/${imageId}`);
  },
};
