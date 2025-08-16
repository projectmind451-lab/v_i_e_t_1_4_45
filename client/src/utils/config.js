// Backend base URL should come from environment (no hardcoded URLs)
// Define VITE_BACKEND_URL in client/.env or hosting provider envs
const backendUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) || '';

export const getBackendUrl = () => {
  const base = backendUrl || (typeof window !== 'undefined' ? window.__BACKEND_URL__ || '' : '');
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

export const getImageUrl = (path) => {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Remove any leading slashes or uploads/ or uploads/images/ from the path
  // Handles legacy records stored as 'uploads/<file>' and new ones as just '<file>' or 'uploads/images/<file>'
  const cleanPath = path
    .replace(/^\/+/, '')
    .replace(/^uploads\//, '')
    .replace(/^images\//, '')
    .replace(/^uploads\/images\//, '');
  
  // For both development and production, use the /uploads/images path
  return `${getBackendUrl()}/uploads/images/${cleanPath}`;
};
