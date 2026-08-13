/**
 * Dynamically resolves avatar URLs based on environment configuration.
 * Prevents hardcoding IP addresses or server hostnames in frontend and database.
 */
export const getAvatarUrl = (avatarPath, userName = 'User') => {
  if (!avatarPath) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=dc2626&color=fff`;
  }

  if (avatarPath.includes('ui-avatars.com')) {
    return avatarPath;
  }

  const apiOrigin = import.meta.env.VITE_API_ORIGIN || (import.meta.env.DEV ? 'http://127.0.0.1:8001' : '');

  // Strip any legacy hardcoded domain or IP (e.g., http://127.0.0.1:8001/uploads/...)
  const cleanPath = avatarPath.replace(/^https?:\/\/[^\/]+/, '');
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  return `${apiOrigin}${normalizedPath}`;
};
