import api from './axios';

export const getServices = async () => {
  const data = await api.get('/services');
  return data;
};

export const createService = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await api.post('/services', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response;
};

export const updateService = async (id, data) => {
  const isFormData = data instanceof FormData;
  const response = await api.put(`/services/${id}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response;
};

export const deleteService = async (id) => {
  const data = await api.delete(`/services/${id}`);
  return data;
};