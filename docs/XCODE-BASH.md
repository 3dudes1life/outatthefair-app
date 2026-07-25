# Paste This in Terminal — V0.4

Download the full `outatthefair-app-v0.4.zip` file into Downloads. Then paste this entire block into Terminal:

```bash
ZIP="$(find "$HOME/Downloads" -maxdepth 1 -type f -name 'outatthefair-app-v0.4*.zip' ! -name '*github-upload*' -print0 | xargs -0 ls -t | head -n 1)"
rm -rf "$HOME/Downloads/outatthefair-app-v0.4"
unzip -q "$ZIP" -d "$HOME/Downloads"
cd "$HOME/Downloads/outatthefair-app-v0.4"
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

The command deliberately ignores the GitHub-upload ZIP and uses the complete project ZIP. It also removes the older TypeScript config if one exists.
