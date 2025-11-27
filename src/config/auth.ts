/**
 * Authentication Configuration
 *
 * This configuration adapts authentication behavior based on the environment:
 * - Production: Uses shared cookies (Domain=.hafizmuh.site) for SSO
 * - Development: Uses localStorage + URL token passing
 *
 * Environment Variables Required:
 * - VITE_USE_COOKIE_AUTH: 'true' for cookie-based auth, 'false' for localStorage
 * - VITE_COOKIE_DOMAIN: Cookie domain (e.g., '.hafizmuh.site') - only used if useCookieAuth is true
 * - VITE_AUTH_DOMAIN: URL of auth service (e.g., 'https://auth.hafizmuh.site')
 * - VITE_API_URL: URL of backend API (e.g., 'http://2306223206-be.hafizmuh.site')
 */

interface AuthConfig {
  /**
   * Whether to use cookie-based authentication (true) or localStorage (false)
   * Production: true (cookies shared across *.hafizmuh.site)
   * Development: false (localStorage per origin)
   */
  useCookieAuth: boolean;

  /**
   * Cookie domain for shared authentication
   * Must include leading dot (e.g., '.hafizmuh.site')
   * Only used when useCookieAuth is true
   */
  cookieDomain: string;

  /**
   * URL of the centralized auth service
   * Users are redirected here for login/register
   */
  authDomain: string;

  /**
   * URL of the backend API
   * Used for token validation and API calls
   */
  apiUrl: string;
}

const AUTH_CONFIG: AuthConfig = {
  useCookieAuth: import.meta.env.VITE_USE_COOKIE_AUTH === 'true',
  cookieDomain: import.meta.env.VITE_COOKIE_DOMAIN || '.hafizmuh.site',
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || 'http://localhost:3000',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
};

// Log configuration in development for debugging
if (import.meta.env.DEV) {
  console.log('[Auth Config] Loaded configuration:', {
    mode: import.meta.env.MODE,
    useCookieAuth: AUTH_CONFIG.useCookieAuth,
    authDomain: AUTH_CONFIG.authDomain,
    apiUrl: AUTH_CONFIG.apiUrl,
    cookieDomain: AUTH_CONFIG.useCookieAuth ? AUTH_CONFIG.cookieDomain : 'N/A (using localStorage)',
  });
}

export default AUTH_CONFIG;
