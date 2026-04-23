export const resolveApiUrl = (path: string | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const apiBase = import.meta.env.VITE_API_URL;
  const baseUrl = apiBase 
    ? apiBase.replace(/\/api\/?$/, '') 
    : window.location.origin.replace(/:\d+$/, ':5001');
    
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
