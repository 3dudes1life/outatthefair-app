# Out at the Fair® App — V0.4

A mobile-first fair-day companion built as an installable PWA and Capacitor-ready iOS/Android app.

## V0.4 focus

V0.4 is the real-device polish release. The OATF Model card now sits in its own full-width card between the hero description and buttons on phones instead of overlapping “All Belong.” Larger screens retain the floating editorial treatment.

It also adds native haptic feedback, native status-bar styling, Android back-button handling, a non-destructive content refresh control, tighter narrow-iPhone spacing, and a JSON Capacitor config that opens without TypeScript.

## Upload to GitHub

Upload the contents of the separate `outatthefair-app-v0.4-github-upload` package to the repository root. Keep the existing `.github/workflows/deploy-pages.yml` file.

## Open in Xcode

For a fresh folder:

```bash
rm -f capacitor.config.ts
npm install
npx cap add ios
npx cap sync ios
npx cap open ios
```

For an existing `ios` project:

```bash
npx cap sync ios
npx cap open ios
```


## One-paste Xcode command

See `docs/XCODE-BASH.md` for a single Terminal block that finds the downloaded V0.4 ZIP, unzips it, installs dependencies, syncs Capacitor and opens Xcode.

## App identity

- App name: `Out at the Fair`
- Bundle identifier: `com.outatinc.outatthefair`
- Version: `0.4.0`
- Web directory: `www`

© OutAt Inc. Out at the Fair® is a registered brand of OutAt Inc.
