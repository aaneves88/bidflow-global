import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.orca.mento',
  appName: 'Orca',
  webDir: 'dist',
  // For Lovable in-sandbox hot-reload during development, uncomment and use
  // the project's preview URL. Remove the `server` block before publishing.
  // server: {
  //   url: 'https://id-preview--4f1c7d3a-9fb6-4d83-b13d-ec53ce26f9fa.lovable.app?forceHideBadge=true',
  //   cleartext: true,
  // },
  android: {
    backgroundColor: '#0F172A',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#0F172A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0F172A',
    },
  },
};

export default config;
