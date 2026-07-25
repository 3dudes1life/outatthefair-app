# Native iOS Setup — V0.4

The project now uses `capacitor.config.json`, so TypeScript is not required to open it in Xcode.

## First native build

```bash
npm install
npx cap add ios
npx cap sync ios
npx cap open ios
```

Or double-click `SETUP-MAC.command`.

## Updating the existing Xcode project

After replacing the `www` folder, `package.json` and Capacitor config with V0.4:

```bash
rm -f capacitor.config.ts
npm install
npx cap sync ios
npx cap open ios
```

The `rm` line safely removes the older TypeScript config if it is still present. V0.4 uses `capacitor.config.json`.

In Xcode, use:

- Team: OutAt Inc.
- Bundle Identifier: `com.outatinc.outatthefair`
- Display Name: `Out at the Fair`
- Version: `0.4.0`
- Build: increment from the previous build

V0.4 also includes native haptic feedback, dark-app status-bar styling and Android hardware-back handling when the matching Capacitor plugins are available.
