import type { CapacitorConfig } from '@capacitor/cli';

// Spardha Times Android app (Capacitor WebView wrapper).
// The app loads the DEPLOYED website via server.url — it does NOT bundle
// local files (this Next.js app is server-rendered and cannot be static-exported).
//
// Live on Vercel. The apex (spardhatimes.in) 308-redirects to www, so www is
// the canonical origin — pointing server.url straight at it avoids a redirect
// hop on every app launch.
const PROD_URL = 'https://www.spardhatimes.in';

const config: CapacitorConfig = {
  appId: 'com.spardhatimes.app',
  appName: 'Spardha Times',
  webDir: 'public', // placeholder only — remote server.url is used, not local files
  // --- PRODUCTION ---
  server: {
    url: PROD_URL,
    // Must stay 'https' — it makes the WebView origin https:// so NextAuth's
    // Secure session cookie is accepted. On the default http scheme the cookie
    // is silently dropped and the user is logged out on every launch.
    androidScheme: 'https',
    // Hosts the WebView may load in-app. Anything else should open in the
    // system browser instead; keep this list tight, it is a security boundary.
    allowNavigation: ['www.spardhatimes.in', 'spardhatimes.in'],
  },
  // --- LOCAL TEST MODE (emulator against `npm run dev`) ---
  // 10.0.2.2 = the host machine's localhost as seen from the Android emulator.
  // server: {
  //   url: 'http://10.0.2.2:3000',
  //   cleartext: true,
  //   androidScheme: 'http',
  // },
  android: {
    // Handy during development (attach chrome://inspect). Turn OFF for release builds.
    webContentsDebuggingEnabled: true,
  },
};

export default config;
