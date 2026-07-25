/*
  OUT AT THE FAIR® APP — V0.4 CONTENT
  -----------------------------------
  Update fair dates, schedules, people, partners and announcements here.
  The public 2027 fairs remain in a "coming soon" state until confirmed.
*/
window.OATF_DATA = {
  version: '0.4.0',
  updated: 'July 24, 2026',
  brand: {
    name: 'Out at the Fair®',
    shortName: 'OATF',
    tagline: 'All belong at the fair.',
    subtitle: 'California’s LGBTQ+ fair tradition since 2011',
    website: 'https://3dudes1life.github.io/outatthefair_2/',
    officialWebsite: 'https://www.outatthefair.com',
    instagram: 'https://www.instagram.com/outatthefair/',
    email: 'OATF@outatinc.com',
    phone: '(442) 222-9935',
    heroImage: 'https://static.wixstatic.com/media/d0a21d_62f3dc4d5f394edeba6f858dd2f947c5~mv2.jpg/v1/fill/w_1200,h_950,al_c,q_90/d0a21d_62f3dc4d5f394edeba6f858dd2f947c5~mv2.jpg'
  },
  stats: [
    { value: '2011', label: 'The first gathering' },
    { value: '2014', label: 'OATF becomes official' },
    { value: '2018', label: 'Barham Award winner' },
    { value: '2027', label: 'The next chapter' }
  ],
  announcements: [
    {
      id: 'next-chapter',
      tone: 'feature',
      label: 'THE NEXT CHAPTER',
      title: 'A refreshed OATF experience arrives in 2027.',
      text: 'Official dates, stages, schedules and ticket information will activate as each fair is confirmed.',
      action: 'Explore the fairs',
      route: 'fairs'
    },
    {
      id: 'mailing-list',
      tone: 'cyan',
      label: 'GET UPDATES',
      title: 'Never miss a fair announcement.',
      text: 'Join the OutAt & OATF email list for dates, performers, applications and giveaways.',
      action: 'Join the list',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSfAS6I4LZRoBka-N1WjSLTloXrZtRxAJInguGRQadTCViRnRg/viewform'
    }
  ],
  fairs: [
    {
      id: 'riverside',
      shortName: 'Riverside',
      name: 'Riverside County Fair',
      venue: 'Riverside County Fair & National Date Festival',
      city: 'Indio, California',
      address: '82-503 CA-111, Indio, CA 92201',
      stage: 'Programming location to be announced',
      status: '2027 details coming soon',
      statusTone: 'coming',
      dateLabel: 'See you in 2027',
      timeLabel: 'Date and programming to be announced',
      admission: 'Admission and event details vary by fair season.',
      accent: 'desert',
      color: '#ff8c3d',
      emoji: '🌴',
      overline: 'INDIO, CALIFORNIA',
      headline: 'Desert joy. Community connection.',
      description: 'A distinctive desert chapter of the OATF story with entertainment, connection and the full Date Festival experience.',
      websiteUrl: 'https://3dudes1life.github.io/outatthefair_2/riversidecountyfair/',
      ticketUrl: 'https://www.datefest.org/',
      mapUrl: 'https://maps.apple.com/?q=82503%20CA-111%20Indio%20CA%2092201',
      features: ['Community celebration', 'Live entertainment', 'Fair attractions', 'All-ages programming'],
      accessibility: ['Fairground accessibility services', 'Guest assistance', 'Event-specific information when announced'],
      history: 'The Riverside County Fair & National Date Festival added a desert fair chapter to the OATF network.'
    },
    {
      id: 'san-diego',
      shortName: 'San Diego',
      name: 'San Diego County Fair',
      venue: 'Del Mar Fairgrounds',
      city: 'Del Mar, California',
      address: '2260 Jimmy Durante Blvd, Del Mar, CA 92014',
      stage: 'Chevrolet Paddock Stage',
      status: '2027 details coming soon',
      statusTone: 'coming',
      dateLabel: 'See you in 2027',
      timeLabel: 'Date and schedule to be announced',
      admission: 'OATF programming has traditionally been included with fair admission.',
      accent: 'ocean',
      color: '#35d8ff',
      emoji: '🌊',
      overline: 'DEL MAR, CALIFORNIA',
      headline: 'The original home of Out at the Fair.',
      description: 'Where an informal community gathering grew into an official, award-winning LGBTQ+ fair tradition.',
      websiteUrl: 'https://3dudes1life.github.io/outatthefair_2/sdfair/',
      ticketUrl: 'https://www.sdfair.com/',
      mapUrl: 'https://maps.apple.com/?q=2260%20Jimmy%20Durante%20Blvd%20Del%20Mar%20CA%2092014',
      features: ['Live entertainment', 'Community connections', 'Story Time', 'Glam Show'],
      accessibility: ['Accessible fairgrounds routes', 'Accessible seating subject to fair availability', 'First aid and guest services on site'],
      history: 'OATF grew from an informal San Diego gathering into an official fair event and an award-winning inclusion model.'
    },
    {
      id: 'orange-county',
      shortName: 'Orange County',
      name: 'Orange County Fair',
      venue: 'OC Fair & Event Center',
      city: 'Costa Mesa, California',
      address: '88 Fair Dr, Costa Mesa, CA 92626',
      stage: 'Plaza Stage',
      status: '2027 details coming soon',
      statusTone: 'coming',
      dateLabel: 'See you in 2027',
      timeLabel: 'Date and schedule to be announced',
      admission: 'OATF programming has traditionally been included with fair admission.',
      accent: 'sunset',
      color: '#ff3d91',
      emoji: '🎡',
      overline: 'COSTA MESA, CALIFORNIA',
      headline: 'Pride, music and fair-day joy.',
      description: 'A full afternoon of live music, family-friendly entertainment, Story Time, community and the OATF Glam Show.',
      websiteUrl: 'https://3dudes1life.github.io/outatthefair_2/orangecountyfair/',
      ticketUrl: 'https://ocfair.com/',
      mapUrl: 'https://maps.apple.com/?q=88%20Fair%20Dr%20Costa%20Mesa%20CA%2092626',
      features: ['Plaza Stage', 'Community partners', 'Live music', 'Glam Show'],
      accessibility: ['Accessible paths and seating', 'Guest services resources', 'Schedule details available in-app'],
      history: 'OATF launched at the Orange County Fair in 2019 and grew into a colorful annual community celebration.'
    }
  ],
  demoFair: {
    id: 'la-county-demo',
    shortName: 'LA County Demo',
    name: 'LA County Fair',
    venue: 'Fairplex',
    city: 'Pomona, California',
    address: '1101 W McKinley Ave, Pomona, CA 91768',
    stage: 'Rainbow Stage — Partner Demo',
    status: 'LIVE DEMO FAIR DAY',
    statusTone: 'live',
    dateLabel: 'Partner preview only',
    timeLabel: 'Sample schedule — not an announced event',
    admission: 'This page demonstrates the app experience. It does not announce a confirmed OATF event.',
    accent: 'la',
    color: '#8b47ff',
    emoji: '✨',
    overline: 'POMONA, CALIFORNIA · DEMO',
    headline: 'Your fair. Your schedule. Your community.',
    description: 'A fully interactive sample showing how the app can guide attendees through a future OATF fair day.',
    websiteUrl: 'https://www.lacountyfair.com/',
    ticketUrl: 'https://www.lacountyfair.com/',
    mapUrl: 'https://maps.apple.com/?q=1101%20W%20McKinley%20Ave%20Pomona%20CA%2091768',
    features: ['Live updates', 'Personal itinerary', 'Interactive map', 'Community passport'],
    accessibility: ['Accessible stage viewing', 'Quiet space locator', 'Accessible restroom pins', 'Guest services information'],
    history: 'Demo mode is not a public event announcement. It exists to preview the complete OATF app experience.'
  },
  performers: [
    { id: 'alexander-rodriguez', name: 'Alexander Rodriguez', type: 'Host', icon: '🎙️', bio: 'Media personality and returning OATF host bringing quick humor, warmth and nonstop fair-day energy.', socials: [] },
    { id: 'steven-dehler', name: 'Steven Dehler', type: 'Host', icon: '🌟', bio: 'Model, host and OATF favorite helping keep the celebration moving from welcome through the Glam Show.', socials: [] },
    { id: 'golden-state-squares', name: 'Golden State Squares', type: 'Dance', icon: '🕺', bio: 'LGBTQ+ square dancers serving community, movement, color and an irresistible opening to the day.', socials: [] },
    { id: 'summer-daze', name: 'Summer Daze', type: 'Drag Artist & Storyteller', icon: '📚', bio: 'Orange County drag performer bringing colorful, uplifting, family-friendly storytelling and Glam Show magic.', socials: [] },
    { id: 'nicole-scotty', name: 'Nicole & Scotty', type: 'Music', icon: '🎶', bio: 'A high-energy musical duo with crowd-friendly songs, harmonies and the kind of set that keeps a fair moving.', socials: [] },
    { id: 'ross-alan', name: 'Ross Alan', type: 'Music', icon: '🎤', bio: 'Singer and performer delivering a powerful live set built for a joyful, all-ages fair crowd.', socials: [] },
    { id: 'ryan-cassata', name: 'Ryan Cassata', type: 'Music', icon: '🎸', bio: 'Award-winning singer-songwriter and LGBTQ+ advocate known for honest lyrics, connection and energetic performances.', socials: [] },
    { id: 'glam-show', name: 'OATF Glam Show', type: 'Signature Show', icon: '👑', bio: 'The signature all-ages finale featuring drag kings, queens, local favorites, music, sparkle and celebration.', socials: [] }
  ],
  demoSchedule: [
    { id: 'welcome', time: '12:00 PM', end: '12:15 PM', title: 'Welcome to Out at the Fair', performerId: 'alexander-rodriguez', category: 'Special', location: 'Rainbow Stage', description: 'Opening celebration, community welcome and everything you need to know for the day.', status: 'past' },
    { id: 'squares', time: '12:15 PM', end: '12:55 PM', title: 'Golden State Squares', performerId: 'golden-state-squares', category: 'Dance', location: 'Rainbow Stage', description: 'Kick off the afternoon with colorful LGBTQ+ square dancing.', status: 'past' },
    { id: 'story-1', time: '1:00 PM', end: '1:15 PM', title: 'OATF Story Time', performerId: 'summer-daze', category: 'Family', location: 'Rainbow Stage', description: 'A joyful, family-friendly reading with Summer Daze.', status: 'live' },
    { id: 'nicole-scotty', time: '1:15 PM', end: '1:55 PM', title: 'Nicole & Scotty', performerId: 'nicole-scotty', category: 'Music', location: 'Rainbow Stage', description: 'Live music and feel-good fair energy.', status: 'upnext' },
    { id: 'ross', time: '2:15 PM', end: '3:00 PM', title: 'Ross Alan', performerId: 'ross-alan', category: 'Music', location: 'Rainbow Stage', description: 'A powerful live vocal set for the whole family.', status: 'future' },
    { id: 'community-moment', time: '3:05 PM', end: '3:15 PM', title: 'Community Spotlight', performerId: 'steven-dehler', category: 'Community', location: 'Rainbow Stage', description: 'Meet local organizations creating safer, stronger communities.', status: 'future' },
    { id: 'story-2', time: '3:15 PM', end: '3:30 PM', title: 'OATF Story Time', performerId: 'summer-daze', category: 'Family', location: 'Rainbow Stage', description: 'A second colorful story and family moment.', status: 'future' },
    { id: 'ryan', time: '3:45 PM', end: '4:30 PM', title: 'Ryan Cassata', performerId: 'ryan-cassata', category: 'Music', location: 'Rainbow Stage', description: 'Singer-songwriter set with heart, humor and Pride.', status: 'future' },
    { id: 'glam', time: '5:00 PM', end: '6:00 PM', title: 'OATF Glam Show', performerId: 'glam-show', category: 'Glam', location: 'Rainbow Stage', description: 'The sparkling signature finale hosted by Alexander Rodriguez and Steven Dehler.', status: 'future' }
  ],
  partners: [
    { id: 'lgbtq-center', name: 'LGBTQ+ Community Center', category: 'Community', icon: '🏳️‍🌈', booth: 'C-04', description: 'Local programs, community connection, support and referrals.', services: ['Community programs', 'Referrals', 'Events'] },
    { id: 'trans-support', name: 'TransFamily Support Services', category: 'Support', icon: '🏳️‍⚧️', booth: 'C-06', description: 'Family-centered support and resources for transgender and gender-diverse youth.', services: ['Family support', 'Education', 'Resources'] },
    { id: 'health-partner', name: 'Community Health Partner', category: 'Health', icon: '❤️', booth: 'C-09', description: 'Welcoming health information, prevention resources and community services.', services: ['Health resources', 'Prevention', 'Referrals'] },
    { id: 'youth-partner', name: 'Queer Youth Network', category: 'Youth', icon: '🌈', booth: 'C-11', description: 'Safe, affirming programs and creative connection for LGBTQ+ youth.', services: ['Youth programs', 'Mentorship', 'Events'] },
    { id: 'arts-partner', name: 'Pride Arts Collective', category: 'Arts', icon: '🎨', booth: 'C-14', description: 'Celebrating queer artists, makers, performers and stories.', services: ['Art programs', 'Artist directory', 'Workshops'] }
  ],
  mapPins: [
    { id: 'stage', label: 'Rainbow Stage', type: 'Entertainment', icon: '🎤', x: 52, y: 28, detail: 'OATF entertainment, Story Time, community moments and the Glam Show.' },
    { id: 'community', label: 'Community Row', type: 'Community', icon: '🌈', x: 23, y: 51, detail: 'Meet LGBTQ+ nonprofits, health partners, youth groups and local resources.' },
    { id: 'quiet', label: 'Quiet Space', type: 'Accessibility', icon: '🫶', x: 76, y: 62, detail: 'A lower-sensory place to pause, reset and return when you are ready.' },
    { id: 'restroom', label: 'Accessible Restrooms', type: 'Accessibility', icon: '♿', x: 80, y: 34, detail: 'Accessible restroom location near the OATF stage.' },
    { id: 'first-aid', label: 'First Aid', type: 'Services', icon: '➕', x: 56, y: 79, detail: 'Fair first-aid services and immediate assistance.' },
    { id: 'food', label: 'Food & Water', type: 'Food', icon: '🍋', x: 30, y: 80, detail: 'Nearby food stands and water refill options.' },
    { id: 'info', label: 'OATF Info', type: 'Services', icon: 'ℹ️', x: 42, y: 53, detail: 'Schedule help, giveaway information, lost-and-found guidance and OATF questions.' }
  ],
  passportChallenges: [
    { id: 'stage', icon: '🎤', title: 'Find the OATF stage', text: 'Visit the OATF home base and open the live schedule.' },
    { id: 'community', icon: '🌈', title: 'Meet community', text: 'Visit at least one community partner booth.' },
    { id: 'story', icon: '📚', title: 'Story Time', text: 'Catch one family-friendly OATF Story Time.' },
    { id: 'music', icon: '🎶', title: 'Live music', text: 'See one live musical performance.' },
    { id: 'photo', icon: '📸', title: 'Fair-day memory', text: 'Take and share an OATF fair-day photo.' },
    { id: 'glam', icon: '👑', title: 'Glam Show', text: 'Finish the day with the signature OATF Glam Show.' }
  ],
  story: [
    { year: '2011', title: 'The first gathering', text: 'An unofficial Gay Days meetup begins at the San Diego County Fair.' },
    { year: '2014', title: 'Out at the Fair becomes official', text: 'The community gathering becomes an official branded fair experience.' },
    { year: '2017', title: 'The idea expands', text: 'OATF begins reaching fair communities beyond San Diego.' },
    { year: '2018', title: 'Industry recognition', text: 'The Western Fairs Association honors OATF with the Barham Award.' },
    { year: '2019', title: 'Orange County launches', text: 'The OATF footprint continues growing across California fairgrounds.' },
    { year: '2027', title: 'The next chapter', text: 'A renewed model built for sustainable partnership, visibility and belonging.' }
  ]
};
