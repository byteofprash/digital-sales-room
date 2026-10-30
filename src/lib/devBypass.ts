/**
 * Front-end counterpart of the API's DEV_AUTH_BYPASS (a build-time variable: set it, then rebuild).
 * The app starts signed in as the dev AE, and when Firebase is configured, rooms are read and saved
 * through /api/rooms (which the server's own DEV_AUTH_BYPASS leaves open) instead of straight to
 * Firestore, whose rules would refuse an anonymous browser.
 */
export const devAuthBypass = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'
