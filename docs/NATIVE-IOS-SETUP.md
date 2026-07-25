# Native iOS Notes — V0.5

The project uses `capacitor.config.json`, so TypeScript is not required to parse the Capacitor configuration.

Native plugins included:

- App
- Haptics
- Status Bar
- Local Notifications

The local-notification showcase asks for permission only when the user taps the test button. It schedules a sample Glam Show alert ten seconds ahead.

After changing anything inside `www`, run:

```bash
npx cap sync ios
npx cap open ios
```
