# OATF App Content Update Guide

The main content file is:

```text
www/assets/data.js
```

The app does not require a build step after ordinary content edits. Commit the updated file and GitHub Pages will redeploy the app.

## Public fairs

Edit objects inside `fairs` to change:

- `status`
- `dateLabel`
- `timeLabel`
- `stage`
- `admission`
- `description`
- `websiteUrl`
- `ticketUrl`
- `mapUrl`
- `features`
- `accessibility`

Keep unconfirmed events in a clear “2027 details coming soon” state.

## Demo mode

The `demoFair` and `demoSchedule` sections power the LA County partner presentation. Keep the demo label visible until an event is officially confirmed.

## Schedule

Each `demoSchedule` item includes:

```js
{
  id: 'unique-id',
  time: '1:00 PM',
  end: '1:15 PM',
  title: 'OATF Story Time',
  performerId: 'summer-daze',
  category: 'Family',
  location: 'Rainbow Stage',
  description: 'A short description.',
  status: 'live'
}
```

Supported sample states are `past`, `live`, `upnext` and `future`.

## Announcements

Items in `announcements` may link to an app route with `route` or an external website with `url`.

## Passport

Edit `passportChallenges` to change the six sample fair-day experiences. Each item needs a unique `id`.

## Version and service worker

When publishing a new release:

1. Update `version` in `www/assets/data.js`.
2. Update `version` in `package.json`.
3. Change the cache name in `www/sw.js` so devices receive the new files.
