#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "OUT AT THE FAIR — V0.4 NATIVE SETUP"
echo "===================================="

# V0.3 used a TypeScript config. Remove it if this folder was merged over an older copy.
rm -f capacitor.config.ts

npm install

if [ ! -d "ios" ]; then
  echo "Creating iOS project..."
  npx cap add ios
else
  echo "iOS project found. Syncing the update..."
fi

npx cap sync ios
npx cap open ios
