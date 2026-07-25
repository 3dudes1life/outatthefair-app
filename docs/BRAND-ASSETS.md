# Brand Asset Replacement

The V0.4 package includes an original temporary icon created only so the PWA can install and the Capacitor project has a complete icon set.

Before public launch, replace:

- `www/icons/icon-1024.png`
- `www/icons/icon-512.png`
- `www/icons/icon-192.png`
- `www/icons/icon-maskable-512.png`
- `www/icons/apple-touch-icon.png`

The final source icon should be a 1024 × 1024 PNG with generous safe padding. The official Out at the Fair logo/unicorn should not touch the outer edges.

The header currently uses a CSS mini-mark so the app does not depend on an unavailable logo file. A future native build can replace `.mini-mark` in `www/assets/styles.css` with the official transparent logo.
