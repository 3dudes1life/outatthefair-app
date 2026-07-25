# Native iOS Setup

## Requirements

- macOS
- Node.js 22 or later
- Xcode version supported by the installed Capacitor release
- Apple Developer account for device distribution and App Store submission

## First native build

```bash
npm install
npx cap add ios
npx cap sync ios
npx cap open ios
```

Or double-click `SETUP-MAC.command`.

## Every time the web files change

Run:

```bash
npx cap sync ios
npx cap open ios
```

The source app always remains in `www/`. Capacitor copies that content into the native project during sync.

## Xcode identity

In Xcode, select the **App** target and configure:

- Team: OutAt Inc. Apple Developer team
- Bundle Identifier: `com.outatinc.outatthefair`
- Display Name: `Out at the Fair`
- Version: `0.1.0`
- Build: `1`

## Before App Store submission

Replace the temporary app icon with the final official OATF icon and create approved splash screens. Test:

- All external links
- Offline mode
- Safe areas on current iPhones
- VoiceOver labels
- Reduced Motion
- Calendar export
- Notification permission language
- Privacy policy URL
