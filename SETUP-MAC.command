#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "OUT AT THE FAIR — V0.1 NATIVE SETUP"
echo "===================================="

echo "Checking Node.js..."
node --version

echo "Installing Capacitor packages..."
npm install

if [ ! -d "ios" ]; then
  echo "Creating iOS project..."
  npx cap add ios
else
  echo "iOS folder already exists. Skipping cap add ios."
fi

echo "Syncing the web app into iOS..."
npx cap sync ios

echo "Opening Xcode..."
npx cap open ios
