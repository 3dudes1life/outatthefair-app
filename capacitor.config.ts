import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.outatinc.outatthefair',
  appName: 'Out at the Fair',
  webDir: 'www',
  backgroundColor: '#08111f',
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile'
  },
  android: {
    backgroundColor: '#08111f',
    allowMixedContent: false
  }
};

export default config;
