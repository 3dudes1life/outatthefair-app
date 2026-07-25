# Open OATF V0.6 in Xcode

Download the full V0.6 ZIP into Downloads, then paste this complete block into Terminal:

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

In Xcode, select an iPhone simulator and press Run. Do not run `npm audit fix --force` just to open the project.
