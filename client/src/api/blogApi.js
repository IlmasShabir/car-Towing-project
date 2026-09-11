import api from './axios';

export const getBlogs = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`/blogs${qs ? `?${qs}` : ''}`);
};

export const getBlogBySlug = async (slug) => {
  const data = await api.get(`/blogs/${slug}`);
  return data;
};

export const getBlogCategories = async () => {
  const data = await api.get('/blogs/categories');
  return data;
};

export const getAdminBlogs = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`/blogs/admin/list${qs ? `?${qs}` : ''}`);
};

export const createBlog = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await api.post('/blogs', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response;
};

export const updateBlog = async (id, data) => {
  const isFormData = data instanceof FormData;
  const response = await api.put(`/blogs/${id}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response;
};

export const updateBlogStatus = async (id, status) => {
  const data = await api.patch(`/blogs/${id}/status`, { status });
  return data;
};

export const deleteBlog = async (id) => {
  const data = await api.delete(`/blogs/${id}`);
  return data;
};

export const uploadBlogImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const data = await api.post('/blogs/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};