#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
echo "🌈 Building Out at the Fair V0.7..."
command -v node >/dev/null || { echo "Node.js 22+ is required."; exit 1; }
node_major="$(node -p "process.versions.node.split('.')[0]")"
if [ "$node_major" -lt 22 ]; then echo "Node.js 22+ is required. Current: $(node -v)"; exit 1; fi
npm install
if [ ! -d ios/App ]; then npx cap add ios; fi
npx cap sync ios
PBX="ios/App/App.xcodeproj/project.pbxproj"
PLIST="ios/App/App/Info.plist"
if [ -f "$PBX" ]; then
  /usr/bin/sed -i '' 's/PRODUCT_BUNDLE_IDENTIFIER = [^;]*/PRODUCT_BUNDLE_IDENTIFIER = com.outatinc.outatthefair/g' "$PBX"
  /usr/bin/sed -i '' 's/MARKETING_VERSION = [^;]*/MARKETING_VERSION = 0.7.0/g' "$PBX"
fi
if [ -f "$PLIST" ]; then
  /usr/libexec/PlistBuddy -c "Delete :CFBundleDisplayName" "$PLIST" 2>/dev/null || true
  /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string 'Out at the Fair'" "$PLIST"
  /usr/libexec/PlistBuddy -c "Delete :CFBundleName" "$PLIST" 2>/dev/null || true
  /usr/libexec/PlistBuddy -c "Add :CFBundleName string 'Out at the Fair'" "$PLIST"
fi
npx cap open ios
echo "✅ Xcode opened. Select your iPhone and press Run."
