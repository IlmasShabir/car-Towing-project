const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // Already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Relative path - prepend base URL
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BASE_URL}${cleanPath}`;
};

export const getServiceImageUrl = (service) => {
  if (!service?.image) return '';
  return getImageUrl(service.image);
};