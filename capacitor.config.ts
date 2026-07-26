import type { CapacitorConfig } from '@capacitor/cli';

// Spardha Times Android app (Capacitor WebView wrapper).
// The app loads the DEPLOYED website via server.url — it does NOT bundle
// local files (this Next.js app is server-rendered and cannot be static-exported).
//
// ⚠️ TODO before building the release:
//   1. Renew spardhatimes.in (expired) and deploy the web app (Vercel).
//   2. Point DNS at Vercel and confirm https://spardhatimes.in serves the app.
//   3. Swap the server block below (local test -> production).
//   4. Keep androidScheme 'https' so NextAuth's Secure session cookie is accepted.
const PROD_URL = 'https://spardhatimes.in';

const config: CapacitorConfig = {
  appId: 'com.spardhatimes.app',
  appName: 'Spardha Times',
  webDir: 'public', // placeholder only — remote server.url is used, not local files
  // --- LOCAL TEST MODE (emulator) ---
  // 10.0.2.2 = the host machine's localhost as seen from the Android emulator.
  // For PRODUCTION: comment this block out and use the PROD block below.
  server: {
    url: 'http://10.0.2.2:3000',
    cleartext: true, // allow http for local dev testing
    androidScheme: 'http',
  },
  // --- PRODUCTION (uncomment after Vercel deploy, remove the test block above) ---
  // server: {
  //   url: PROD_URL,
  //   androidScheme: 'https',
  //   allowNavigation: ['spardhatimes.in', '*.spardhatimes.in'],
  // },
  android: {
    // Handy during development (attach chrome://inspect). Turn OFF for release builds.
    webContentsDebuggingEnabled: true,
  },
};

export default config;
