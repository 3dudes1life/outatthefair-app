# Content Update Guide

All primary content is stored in:

`www/assets/data.js`

## Add a confirmed date

Find the correct fair in the `fairs` array and replace:

```js
status: '2027 details coming soon',
statusTone: 'coming',
dateLabel: 'See you in 2027',
timeLabel: 'Date and schedule to be announced',
```

Example after confirmation:

```js
status: 'ON SALE NOW',
statusTone: 'coming',
dateLabel: 'Saturday, July 24, 2027',
timeLabel: '12 PM–6 PM',
```

## Update the selected fair automatically

The initial selected fair is set in `www/assets/app.js`:

```js
selectedFair: 'san-diego'
```

Change the value to any fair `id` from `data.js`.

## Add a performer

Add an object inside `performers`:

```js
{
  id: 'performer-slug',
  name: 'Performer Name',
  type: 'Music',
  icon: '🎤',
  bio: 'Approved performer bio.',
  socials: []
}
```

Use a unique lowercase ID with hyphens.

## Add a schedule entry

V0.1 uses `demoSchedule`. When the real 2027 schedule is ready, the same structure can be renamed or expanded into fair-specific schedules.

```js
{
  id: 'unique-event-id',
  time: '2:15 PM',
  end: '3:00 PM',
  title: 'Performer Name',
  performerId: 'performer-slug',
  category: 'Music',
  location: 'Plaza Stage',
  description: 'Short schedule description.',
  status: 'future'
}
```

Allowed V0.1 visual states:

- `past`
- `live`
- `upnext`
- `future`

Only one event should normally be `live` and one should be `upnext`.

## Community organizations

Edit the `partners` array. Each organization supports:

- Name
- Category
- Booth number
- Short description
- Service tags
- Emoji placeholder

V0.2 can add official logos, URLs, phone numbers, operating hours, and remote partner editing.

## Map pins

Coordinates are percentages of the demo map:

```js
x: 52,
y: 30
```

`x: 0, y: 0` is the top-left. `x: 100, y: 100` is the bottom-right.

## Change app version

Update all three places:

1. `package.json`
2. `www/assets/data.js`
3. The service-worker cache name in `www/sw.js`

Changing the cache name ensures returning users receive updated files.
