// Get backend URL from environment variable or use default
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const getBackendUrl = () => {
  return backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${getBackendUrl()}/images/${path}`;
};
