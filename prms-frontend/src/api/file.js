import { apiClient } from './ApiClient';

const client = apiClient;

/**
 * Upload a file to the user's profile.
 * @param {File} file - The file object from an input element
 * @param {string} [description] - Optional description
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export function uploadFile(file, description = '') {
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }

  return client.axios.post('/users/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data)
    .catch(err => {
      const msg = err.response?.data?.error?.message || err.message;
      return { success: false, error: { message: msg } };
    });
}

/**
 * List files for the current user (paginated).
 * @param {number} [page=1]
 * @param {number} [limit=10]
 * @param {'image'|'document'} [category]
 * @returns {Promise<Object>}
 */
export function listFiles(page = 1, limit = 10, category = undefined) {
  const params = { page, limit };
  if (category) {
    params.category = category;
  }
  return client.axios.get('/users/files', { params })
    .then(res => res.data)
    .catch(err => {
      const msg = err.response?.data?.error?.message || err.message;
      return { success: false, error: { message: msg } };
    });
}

/**
 * Get a single file by ID.
 * @param {string} fileId
 * @returns {Promise<Object>}
 */
export function getFile(fileId) {
  return client.axios.get(`/users/files/${fileId}`)
    .then(res => res.data)
    .catch(err => {
      const msg = err.response?.data?.error?.message || err.message;
      return { success: false, error: { message: msg } };
    });
}

/**
 * Delete a file by ID.
 * @param {string} fileId
 * @returns {Promise<Object>}
 */
export function deleteFile(fileId) {
  return client.axios.delete(`/users/files/${fileId}`)
    .then(res => res.data)
    .catch(err => {
      const msg = err.response?.data?.error?.message || err.message;
      return { success: false, error: { message: msg } };
    });
}
