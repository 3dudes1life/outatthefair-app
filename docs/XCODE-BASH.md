# Open OATF V0.5 in Xcode

Paste this complete block into Terminal after downloading the full V0.5 ZIP:

```bash
ZIP="$(find "$HOME/Downloads" -maxdepth 1 -type f -name 'outatthefair-app-v0.5*.zip' ! -name '*github-upload*' -print0 | xargs -0 ls -t 2>/dev/null | head -n 1)"

if [ -z "$ZIP" ]; then
  echo "V0.5 ZIP not found in Downloads."
  exit 1
fi

rm -rf "$HOME/Downloads/outatthefair-app-v0.5"
unzip -q "$ZIP" -d "$HOME/Downloads"
cd "$HOME/Downloads/outatthefair-app-v0.5"

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

In Xcode, select an iPhone simulator and press Run.
