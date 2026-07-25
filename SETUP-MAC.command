#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "OUT AT THE FAIR — V0.6 TOGETHER SETUP"
echo "========================================"

rm -f capacitor.config.ts
npm install

if [ ! -d "ios" ]; then
  echo "Creating iOS project..."
  npx cap add ios
else
  echo "iOS project found. Syncing V0.6..."
fi

npx cap sync ios
npx cap open ios
