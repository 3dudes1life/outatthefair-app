# Out at the Fair® App — V0.6 Together Edition

A mobile-first Out at the Fair® fair-day companion built as an installable PWA and a Capacitor-ready iOS/Android project.

V0.6 is the **Together Edition**: the V0.5 showcase now feels like a connected fair-day product for an individual guest, their crew and the community around them. All sample schedules and fair-day states remain clearly labeled as a showcase demo.

## V0.6 headline features

- **Ask OATF** offline fair concierge
- **Together Mode** for William, Caleb and Daniel
- **OATF Moments** branded photo creator
- **Fair Pulse** live-style updates and crowd levels
- **Memory Capsule** shareable post-fair recap
- Updated six-step 60-second showcase tour
- Cinematic launch, Fair Mode, My Day, OATF Pass and local demo notifications
- Schedules, fair pages, map, community, accessibility, Passport, planner and offline support

## Open V0.6 in Xcode

Download the full ZIP into Downloads, then paste this entire block into Terminal:

```bash
ZIP="$(find "$HOME/Downloads" -maxdepth 1 -type f -name 'outatthefair-app-v0.6*.zip' ! -name '*github-upload*' -print0 | xargs -0 ls -t 2>/dev/null | head -n 1)"

if [ -z "$ZIP" ]; then
  echo "V0.6 ZIP not found in Downloads. Download the full V0.6 ZIP first."
  exit 1
fi

rm -rf "$HOME/Downloads/outatthefair-app-v0.6"
unzip -q "$ZIP" -d "$HOME/Downloads"
cd "$HOME/Downloads/outatthefair-app-v0.6"

rm -f capacitor.config.ts
npm install

if [ -d ios ]; then
  npx cap sync ios
else
  npx cap add ios
  npx cap sync ios
fi

npx cap open ios
```

Do not run `npm audit fix --force` just to open the project.

## GitHub Pages upload

Use the separate `outatthefair-app-v0.6-github-upload.zip`. It intentionally excludes hidden files including `.github`, so the Pages workflow already in the repository remains untouched and Finder does not hide anything you need to upload. Upload everything inside that folder at the repository root and commit to `main`.

## App identity

- App name: `Out at the Fair`
- Bundle identifier: `com.outatinc.outatthefair`
- Version: `0.6.0`
- Web directory: `www`

## Demo and privacy notes

- Showcase fair content is sample product-demo material and does not announce a confirmed event.
- The OATF Pass is not an admission ticket.
- Ask OATF runs from locally stored event information and does not send questions to a server.
- Crew status, planner details, reactions and concierge history remain on the device.
- Uploaded photos stay local unless the user explicitly downloads or shares the generated image.

© OutAt Inc. Out at the Fair® is a registered brand of OutAt Inc.
