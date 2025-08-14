// Get backend URL from environment variable or use default
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const backendUrl = isProduction 
  ? 'https://vinitamart-backend.onrender.com'  // Replace with your actual backend URL
  : 'http://localhost:5000';

export const getBackendUrl = () => {
  return backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
};

export const getImageUrl = (path) => {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // For local development
  if (!isProduction) {
    return `${getBackendUrl()}/images/${path}`;
  }
  
  // For production - use the correct path
  return `https://vinitamart-backend.onrender.com/images/${path}`;
};
