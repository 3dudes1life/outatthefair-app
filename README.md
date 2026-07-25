# Out at the Fair® App — V0.2

A mobile-first Out at the Fair® fair-day companion built as an installable PWA and a Capacitor-ready iOS/Android project foundation.

V0.2 brings the app into the same visual world as the rebuilt OATF website: deep plum-black backgrounds, aurora color, editorial typography, bold fair cards, rainbow signal details and a more premium fair-day dashboard.

## V0.2 highlights

- New **All Belong at the Fair** editorial home experience
- Visual system aligned with the new OATF website
- Public 2027 holding experience for Riverside, San Diego and Orange County
- Clearly labeled LA County **partner demo mode**
- Live demo schedule with Happening Now and Up Next states
- My OATF favorites and downloadable `.ics` calendars
- Global app search across fairs, performers, community and history
- Richer fair pages with direct links to the rebuilt website
- Searchable performer and community directories
- Interactive proof-of-concept fair map
- Expanded six-step OATF Passport
- Notification preference center
- Larger text, higher contrast and reduced-motion settings
- Offline PWA caching
- App install and native share controls
- GitHub Pages deployment workflow
- Capacitor configuration for future iOS and Android builds

## Update the existing GitHub repository

Upload the contents of this package over the existing `outatthefair-app` repository and choose **Replace** when GitHub asks about files with the same names.

The existing `.github/workflows/deploy-pages.yml` workflow remains compatible with V0.2 and will publish the `www` folder automatically.

## Test locally

From the repository folder:

```bash
python3 -m http.server 4173 --directory www
```

Then open:

```text
http://localhost:4173
```

Do not open `www/index.html` directly as a normal file. Service workers and some browser features require a local server or HTTPS.

## Create or refresh the native iOS project

Capacitor 8 requires Node.js 22 or later and a current supported Xcode version.

```bash
npm install
npx cap sync ios
npx cap open ios
```

When creating the native project for the first time:

```bash
npm install
npx cap add ios
npx cap sync ios
npx cap open ios
```

A double-click Mac helper is also included:

```text
SETUP-MAC.command
```

## Updating app content

Most editable content remains in one file:

```text
www/assets/data.js
```

Use it to update:

- Fairs and confirmed 2027 dates
- Stages, addresses, ticket links and website links
- Performers and bios
- Entertainment schedules
- Community organizations and booth numbers
- Map pins
- Passport challenges
- Announcements
- History timeline

## Important notes

- The app icon remains a temporary V0.x icon and should be replaced with the final approved OATF icon before App Store submission.
- LA County Fair content is intentionally labeled as a product demonstration and is not a public event announcement.
- Favorites, preferences and passport progress are stored locally on the device.
- Remote push delivery, remote schedule editing, QR validation, user accounts and a production admin dashboard remain future phases.
- The demo calendar uses a placeholder 2027 date solely to demonstrate calendar export.

## App identity

- App name: `Out at the Fair`
- Bundle identifier: `com.outatinc.outatthefair`
- Version: `0.2.0`
- Web directory: `www`

© OutAt Inc. Out at the Fair® is a registered brand of OutAt Inc.
