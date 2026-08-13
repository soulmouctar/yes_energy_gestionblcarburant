/**
 * Dynamically resolves avatar URLs based on environment configuration.
 * Solves cross-domain host resolution between React frontend and Laravel backend.
 */
export const getAvatarUrl = (avatarPath, userName = 'User') => {
  if (!avatarPath) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=dc2626&color=fff`;
  }

  if (avatarPath.includes('ui-avatars.com')) {
    return avatarPath;
  }

  // 1. Explicit environment origin override
  let apiOrigin = import.meta.env.VITE_API_ORIGIN;

  // 2. Extract origin from VITE_API_URL environment variable if set
  if (!apiOrigin && import.meta.env.VITE_API_URL) {
    try {
      if (import.meta.env.VITE_API_URL.startsWith('http://') || import.meta.env.VITE_API_URL.startsWith('https://')) {
        const urlObj = new URL(import.meta.env.VITE_API_URL);
        apiOrigin = urlObj.origin;
      }
    } catch (e) {
      apiOrigin = '';
    }
  }

  // 3. Development local proxy fallback
  if (!apiOrigin && import.meta.env.DEV) {
    apiOrigin = 'http://127.0.0.1:8001';
  }

  // 4. Default: fallback to current window location origin
  if (!apiOrigin) {
    apiOrigin = window.location.origin;
  }

  // Strip any legacy hardcoded domain or IP (e.g., http://127.0.0.1:8001/uploads/...)
  const cleanPath = avatarPath.replace(/^https?:\/\/[^\/]+/, '');
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  return `${apiOrigin}${normalizedPath}`;
};

/**
 * Image error handler fallback to prevent broken image icons.
 */
export const handleAvatarError = (e, userName = 'User') => {
  e.target.onerror = null;
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=dc2626&color=fff`;
};
