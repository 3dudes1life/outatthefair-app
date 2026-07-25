# Out at the Fair® App — V0.3 Final Preview

A mobile-first Out at the Fair® fair-day companion built as an installable PWA and a Capacitor-ready iOS/Android project foundation.

## V0.3 final polish

- Matches the new OATF website typography: **Impact** display headlines and **Inter/system sans** body copy
- Removes the mismatched serif accent treatment from V0.2
- Adds a locally saved **Fair-day Planner** for tickets, parking, schedule, essentials and a meet-up plan
- Adds sharing for the user’s planner and saved demo itinerary
- Adds planner access from Home, My OATF, More and PWA shortcuts
- Preserves the V0.2 search, accessibility, offline, map, schedule, favorites, community and passport features

## GitHub upload

Upload everything in the V0.3 GitHub upload package to the repository root. Allow GitHub to replace matching files. The upload package intentionally excludes `.github`, so the existing Pages workflow remains untouched.

## Local preview

```bash
python3 -m http.server 4173 --directory www
```

Open `http://localhost:4173`.

## Native setup

```bash
npm install
npx cap add ios
npx cap sync ios
npx cap open ios
```

## App identity

- App name: `Out at the Fair`
- Bundle identifier: `com.outatinc.outatthefair`
- Version: `0.3.0`
- Web directory: `www`

© OutAt Inc. Out at the Fair® is a registered brand of OutAt Inc.
