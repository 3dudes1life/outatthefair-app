/*
  OATF V0.1 CONTENT FILE
  ----------------------
  This file is intentionally plain JavaScript so non-developers can update
  fairs, schedules, performers and partners without a build system.
*/
window.OATF_DATA = {
  version: '0.1.0',
  updated: 'July 24, 2026',
  brand: {
    name: 'Out at the Fair®',
    shortName: 'OATF',
    tagline: 'Come as you are. Celebrate together.',
    website: 'https://www.outatthefair.com',
    instagram: 'https://www.instagram.com/outatthefair/',
    email: 'info@outatthefair.com',
    mediaEmail: 'media@outatthefair.com'
  },
  stats: [
    { value: '2011', label: 'Community gathering began' },
    { value: '2014', label: 'Official OATF brand launched' },
    { value: '10+', label: 'Fair communities reached' },
    { value: 'All ages', label: 'Family-friendly celebration' }
  ],
  fairs: [
    {
      id: 'san-diego',
      name: 'San Diego County Fair',
      region: 'San Diego County',
      city: 'Del Mar, California',
      address: '2260 Jimmy Durante Blvd, Del Mar, CA 92014',
      stage: 'Chevrolet Paddock Stage',
      status: '2027 details coming soon',
      statusTone: 'coming',
      dateLabel: 'See you in 2027',
      timeLabel: 'Date and schedule to be announced',
      admission: 'OATF programming has traditionally been included with fair admission.',
      accent: 'ocean',
      emoji: '🌊',
      description: 'The original home of Out at the Fair and one of Southern California’s longest-running LGBTQ+ fair traditions.',
      ticketUrl: 'https://www.sdfair.com/',
      mapUrl: 'https://maps.apple.com/?q=2260%20Jimmy%20Durante%20Blvd%20Del%20Mar%20CA%2092014',
      features: ['Live entertainment', 'Community connections', 'Story Time', 'Glam Show'],
      accessibility: ['Accessible fairgrounds routes', 'Accessible seating subject to fair availability', 'First aid and guest services on site'],
      history: 'Out at the Fair grew from an informal San Diego gathering into an official fair event and an award-winning inclusion model.'
    },
    {
      id: 'orange-county',
      name: 'Orange County Fair',
      region: 'Orange County',
      city: 'Costa Mesa, California',
      address: '88 Fair Dr, Costa Mesa, CA 92626',
      stage: 'Plaza Stage',
      status: '2027 details coming soon',
      statusTone: 'coming',
      dateLabel: 'See you in 2027',
      timeLabel: 'Date and schedule to be announced',
      admission: 'OATF programming has traditionally been included with fair admission.',
      accent: 'sunset',
      emoji: '🎡',
      description: 'A full afternoon of Pride, live music, family-friendly entertainment, Story Time, and the OATF Glam Show.',
      ticketUrl: 'https://ocfair.com/',
      mapUrl: 'https://maps.apple.com/?q=88%20Fair%20Dr%20Costa%20Mesa%20CA%2092626',
      features: ['Plaza Stage', 'Pride perks', 'Live music', 'Glam Show'],
      accessibility: ['Accessible paths and seating', 'Guest services resources', 'Schedule details available in-app'],
      history: 'OATF launched at the Orange County Fair in 2019 and has grown into a colorful annual community celebration.'
    },
    {
      id: 'riverside',
      name: 'Riverside County Fair',
      region: 'Coachella Valley',
      city: 'Indio, California',
      address: '82-503 CA-111, Indio, CA 92201',
      stage: 'Fairgrounds programming locations',
      status: '2027 details coming soon',
      statusTone: 'coming',
      dateLabel: 'See you in 2027',
      timeLabel: 'Date and programming to be announced',
      admission: 'Admission and add-on event details vary by year.',
      accent: 'desert',
      emoji: '🌴',
      description: 'A desert fair celebration with entertainment, community programming, and fair-specific special events.',
      ticketUrl: 'https://www.datefest.org/',
      mapUrl: 'https://maps.apple.com/?q=82503%20CA-111%20Indio%20CA%2092201',
      features: ['Special events', 'Community celebration', 'Entertainment', 'Fair attractions'],
      accessibility: ['Fairground accessibility services', 'Guest assistance', 'Event-specific information when announced'],
      history: 'The Riverside County Fair & National Date Festival added a distinctive desert chapter to the OATF story.'
    }
  ],
  demoFair: {
    id: 'la-county-demo',
    name: 'LA County Fair',
    region: 'Partner Preview',
    city: 'Pomona, California',
    address: '1101 W McKinley Ave, Pomona, CA 91768',
    stage: 'Rainbow Stage — Demo',
    status: 'DEMO FAIR DAY',
    statusTone: 'live',
    dateLabel: 'Live partner preview',
    timeLabel: 'Sample schedule — not an announced event',
    admission: 'This entire fair page is demonstration content for app testing and partner presentations.',
    accent: 'la',
    emoji: '✨',
    description: 'A fully interactive sample showing how OATF could guide attendees through a future fair-day experience.',
    ticketUrl: 'https://www.lacountyfair.com/',
    mapUrl: 'https://maps.apple.com/?q=1101%20W%20McKinley%20Ave%20Pomona%20CA%2091768',
    features: ['Live updates', 'Personal schedule', 'Interactive map', 'Community passport'],
    accessibility: ['Accessible stage viewing', 'Quiet space locator', 'Accessible restroom pins', 'Guest services information'],
    history: 'Demo mode is not a public event announcement. It exists to preview the OATF app experience.'
  },
  performers: [
    {
      id: 'alexander-rodriguez',
      name: 'Alexander Rodriguez',
      type: 'Host',
      icon: '🎙️',
      bio: 'Media personality and returning OATF host bringing quick humor, warmth, and nonstop fair-day energy.',
      socials: [{ label: 'Instagram', url: 'https://www.instagram.com/' }]
    },
    {
      id: 'steven-dehler',
      name: 'Steven Dehler',
      type: 'Host',
      icon: '🌟',
      bio: 'Model, host, and OATF favorite helping keep the celebration moving from opening remarks through the Glam Show.',
      socials: [{ label: 'Instagram', url: 'https://www.instagram.com/' }]
    },
    {
      id: 'golden-state-squares',
      name: 'Golden State Squares',
      type: 'Dance',
      icon: '🕺',
      bio: 'LGBTQ+ square dancers serving community, movement, color, and an irresistible opening to the day.',
      socials: []
    },
    {
      id: 'summer-daze',
      name: 'Summer Daze',
      type: 'Drag Artist & Storyteller',
      icon: '📚',
      bio: 'Orange County drag performer bringing colorful, uplifting, family-friendly storytelling and Glam Show magic.',
      socials: []
    },
    {
      id: 'nicole-scotty',
      name: 'Nicole & Scotty',
      type: 'Music',
      icon: '🎶',
      bio: 'A high-energy musical duo with crowd-friendly songs, harmonies, and the kind of set that keeps a fair moving.',
      socials: []
    },
    {
      id: 'ross-alan',
      name: 'Ross Alan',
      type: 'Music',
      icon: '🎤',
      bio: 'Singer and performer delivering a powerful live set built for a joyful, all-ages fair crowd.',
      socials: []
    },
    {
      id: 'ryan-cassata',
      name: 'Ryan Cassata',
      type: 'Music',
      icon: '🎸',
      bio: 'Award-winning singer-songwriter and LGBTQ+ advocate known for honest lyrics, connection, and energetic live performances.',
      socials: []
    },
    {
      id: 'glam-show',
      name: 'OATF Glam Show',
      type: 'Signature Show',
      icon: '👑',
      bio: 'The signature all-ages finale featuring drag kings, queens, local favorites, music, sparkle, and celebration.',
      socials: []
    }
  ],
  demoSchedule: [
    { id: 'welcome', time: '12:00 PM', end: '12:15 PM', title: 'Welcome to Out at the Fair', performerId: 'alexander-rodriguez', category: 'Special', location: 'Rainbow Stage', description: 'Opening celebration, community welcome, and everything you need to know for the day.', status: 'past' },
    { id: 'squares', time: '12:15 PM', end: '12:55 PM', title: 'Golden State Squares', performerId: 'golden-state-squares', category: 'Dance', location: 'Rainbow Stage', description: 'Kick off the afternoon with colorful LGBTQ+ square dancing.', status: 'past' },
    { id: 'story-1', time: '1:00 PM', end: '1:15 PM', title: 'OATF Story Time', performerId: 'summer-daze', category: 'Family', location: 'Rainbow Stage', description: 'A joyful, family-friendly reading with Summer Daze.', status: 'live' },
    { id: 'nicole-scotty', time: '1:15 PM', end: '1:55 PM', title: 'Nicole & Scotty', performerId: 'nicole-scotty', category: 'Music', location: 'Rainbow Stage', description: 'Live music and feel-good fair energy.', status: 'upnext' },
    { id: 'ross', time: '2:15 PM', end: '3:00 PM', title: 'Ross Alan', performerId: 'ross-alan', category: 'Music', location: 'Rainbow Stage', description: 'A powerful live vocal set for the whole family.', status: 'future' },
    { id: 'community-moment', time: '3:05 PM', end: '3:15 PM', title: 'Community Spotlight', performerId: 'steven-dehler', category: 'Community', location: 'Rainbow Stage', description: 'Meet local organizations creating safer, stronger communities.', status: 'future' },
    { id: 'story-2', time: '3:15 PM', end: '3:30 PM', title: 'OATF Story Time', performerId: 'summer-daze', category: 'Family', location: 'Rainbow Stage', description: 'A second colorful story and family moment.', status: 'future' },
    { id: 'ryan', time: '3:45 PM', end: '4:30 PM', title: 'Ryan Cassata', performerId: 'ryan-cassata', category: 'Music', location: 'Rainbow Stage', description: 'Singer-songwriter set with heart, humor, and Pride.', status: 'future' },
    { id: 'glam', time: '5:00 PM', end: '6:00 PM', title: 'OATF Glam Show', performerId: 'glam-show', category: 'Glam', location: 'Rainbow Stage', description: 'The sparkling signature finale hosted by Alexander Rodriguez and Steven Dehler.', status: 'future' }
  ],
  partners: [
    { id: 'lgbtq-center', name: 'LGBTQ+ Community Center', category: 'Community', icon: '🏳️‍🌈', booth: 'C-04', description: 'Local programs, community connection, support, and referrals.', services: ['Community programs', 'Referrals', 'Events'] },
    { id: 'trans-support', name: 'TransFamily Support Services', category: 'Support', icon: '🏳️‍⚧️', booth: 'C-06', description: 'Family-centered support and resources for transgender and gender-diverse youth.', services: ['Family support', 'Education', 'Resources'] },
    { id: 'health-partner', name: 'Community Health Partner', category: 'Health', icon: '❤️', booth: 'C-09', description: 'Welcoming health information, prevention resources, and community services.', services: ['Health resources', 'Prevention', 'Referrals'] },
    { id: 'youth-partner', name: 'Queer Youth Network', category: 'Youth', icon: '🌈', booth: 'C-11', description: 'Safe, affirming programs and creative connection for LGBTQ+ youth.', services: ['Youth programs', 'Mentorship', 'Events'] },
    { id: 'arts-partner', name: 'Pride Arts Collective', category: 'Arts', icon: '🎨', booth: 'C-14', description: 'Celebrating queer artists, makers, performers, and stories.', services: ['Art programs', 'Artist directory', 'Workshops'] }
  ],
  mapPins: [
    { id: 'stage', label: 'Rainbow Stage', type: 'Entertainment', icon: '🎤', x: 52, y: 30, detail: 'OATF entertainment, Story Time, community moments, and the Glam Show.' },
    { id: 'community', label: 'Community Row', type: 'Community', icon: '🌈', x: 25, y: 52, detail: 'Meet LGBTQ+ nonprofits, health partners, youth groups, and local resources.' },
    { id: 'quiet', label: 'Quiet Space', type: 'Accessibility', icon: '🫶', x: 74, y: 62, detail: 'A lower-sensory place to pause, reset, and return when you are ready.' },
    { id: 'restroom', label: 'Accessible Restrooms', type: 'Accessibility', icon: '♿', x: 79, y: 35, detail: 'Accessible restroom location near the OATF stage.' },
    { id: 'first-aid', label: 'First Aid', type: 'Services', icon: '➕', x: 55, y: 78, detail: 'Fair first-aid services and immediate assistance.' },
    { id: 'food', label: 'Food & Water', type: 'Food', icon: '🍋', x: 31, y: 78, detail: 'Nearby food stands and refill options.' },
    { id: 'info', label: 'OATF Info', type: 'Services', icon: 'ℹ️', x: 42, y: 52, detail: 'Schedule help, giveaway information, lost-and-found guidance, and OATF questions.' }
  ],
  story: [
    { year: '2011', title: 'The gathering begins', text: 'A community day at the San Diego County Fair starts the story.' },
    { year: '2014', title: 'Out at the Fair® is born', text: 'The gathering becomes an official fair event with a new identity and a bigger mission.' },
    { year: '2017', title: 'The idea expands', text: 'OATF begins reaching fair communities beyond San Diego.' },
    { year: '2018', title: 'Industry recognition', text: 'The program receives the Western Fairs Association Barham Award.' },
    { year: '2019', title: 'Orange County launches', text: 'The OATF footprint continues growing across California fairgrounds.' },
    { year: '2027', title: 'The next chapter', text: 'A refreshed website and app create a more connected fair-day experience.' }
  ]
};
