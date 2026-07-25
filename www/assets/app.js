(() => {
  'use strict';

  const data = window.OATF_DATA;
  const app = document.getElementById('app');
  const STORAGE_KEY = 'oatf-v0.2-state';
  const LEGACY_KEY = 'oatf-v0.1-state';
  let installPrompt = null;
  let toastTimer = null;
  let mapSelected = 'stage';

  const defaultState = {
    demo: false,
    selectedFair: 'san-diego',
    favorites: [],
    savedPartners: [],
    notifications: { schedule: true, fair: true, giveaways: false, community: false },
    passport: ['stage'],
    prefs: { largeType: false, highContrast: false, reducedMotion: false }
  };

  const state = loadState();
  applyPrefs();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY) || '{}';
      const parsed = JSON.parse(saved);
      return {
        ...defaultState,
        ...parsed,
        notifications: { ...defaultState.notifications, ...(parsed.notifications || {}) },
        prefs: { ...defaultState.prefs, ...(parsed.prefs || {}) }
      };
    } catch {
      return JSON.parse(JSON.stringify(defaultState));
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    applyPrefs();
  }

  function applyPrefs() {
    document.documentElement.classList.toggle('large-type', !!state.prefs.largeType);
    document.documentElement.classList.toggle('high-contrast', !!state.prefs.highContrast);
    document.documentElement.classList.toggle('reduced-motion', !!state.prefs.reducedMotion);
  }

  function esc(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function currentRoute() {
    const raw = (location.hash || '#home').slice(1);
    const [name, id] = raw.split('/');
    return { name: name || 'home', id };
  }

  function navigate(route) {
    if (location.hash === `#${route}`) render();
    else location.hash = route;
  }

  function currentFair() {
    if (state.demo || state.selectedFair === data.demoFair.id) return data.demoFair;
    return data.fairs.find((fair) => fair.id === state.selectedFair) || data.fairs[0];
  }

  function findFair(id) {
    if (id === data.demoFair.id) return data.demoFair;
    return data.fairs.find((fair) => fair.id === id);
  }

  function performer(id) { return data.performers.find((item) => item.id === id); }
  function partner(id) { return data.partners.find((item) => item.id === id); }
  function schedule() { return state.demo ? data.demoSchedule : []; }
  function isSaved(id) { return state.favorites.includes(id); }
  function isPartnerSaved(id) { return state.savedPartners.includes(id); }

  function showToast(message) {
    document.querySelector('.toast')?.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.textContent = message;
    document.body.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 2600);
  }

  function topbar() {
    return `
      <header class="topbar">
        <div class="topbar-rainbow" aria-hidden="true"></div>
        <div class="topbar-row">
          <button class="brand-button" data-nav="home" aria-label="Go home">
            <span class="brand-lockup">
              <span class="mini-mark" aria-hidden="true">O</span>
              <span class="brand-copy"><strong>Out at the Fair®</strong><span>${state.demo ? 'Fair-day demo is live' : 'All belong at the fair'}</span></span>
            </span>
          </button>
          <div class="topbar-actions">
            <button class="icon-button" data-nav="search" aria-label="Search the app">⌕</button>
            <button class="icon-button" data-nav="notifications" aria-label="Notifications">🔔</button>
          </div>
        </div>
      </header>`;
  }

  function banners() {
    return `
      ${!navigator.onLine ? '<div class="offline-banner">Offline mode: your saved guide is still available.</div>' : ''}
      ${state.demo ? '<div class="demo-banner"><strong>PARTNER DEMO:</strong> LA County content is a product preview, not an announced event.</div>' : ''}`;
  }

  function bottomNav(route) {
    const items = [
      ['home', '⌂', 'Home'],
      ['fairs', '🎡', 'Fairs'],
      ['schedule', '◷', 'Schedule'],
      ['my', '♥', 'My OATF'],
      ['more', '☰', 'More']
    ];
    const secondary = ['fair', 'performers', 'performer', 'community', 'partner', 'map', 'story', 'accessibility', 'notifications', 'participate', 'contact', 'passport', 'search'];
    const activeName = route.name === 'fair' ? 'fairs' : secondary.includes(route.name) ? 'more' : route.name;
    return `<nav class="bottom-nav" aria-label="Primary navigation">
      ${items.map(([id, icon, label]) => `<button class="nav-button ${activeName === id ? 'active' : ''}" data-nav="${id}" aria-current="${activeName === id ? 'page' : 'false'}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`).join('')}
    </nav>`;
  }

  function shell(content) {
    const route = currentRoute();
    app.innerHTML = `<div class="app-frame">${topbar()}${banners()}<main id="app-main" class="content page-enter">${content}</main>${bottomNav(route)}</div>`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function sectionHead(kicker, title, subtitle = '', action = '') {
    return `<div class="section-head"><div><p class="section-kicker"><span></span>${esc(kicker)}</p><h2>${title}</h2>${subtitle ? `<p class="section-subtitle">${esc(subtitle)}</p>` : ''}</div>${action}</div>`;
  }

  function pageHead(kicker, title, subtitle) {
    return `<header class="page-head"><p class="section-kicker"><span></span>${esc(kicker)}</p><h1>${title}</h1><p>${esc(subtitle)}</p></header>`;
  }

  function statusPill(fair) {
    return `<span class="status ${fair.statusTone}">${fair.statusTone === 'live' ? '<i></i>' : ''}${esc(fair.status)}</span>`;
  }

  function fairCard(fair, wide = false) {
    return `<article class="fair-card ${fair.accent} ${wide ? 'wide' : ''}" data-fair="${fair.id}" tabindex="0" role="button" aria-label="Open ${esc(fair.name)}">
      <div class="fair-card-glow"></div>
      <small>${esc(fair.overline)}</small>
      <div class="fair-card-spacer"></div>
      ${statusPill(fair)}
      <h3>${esc(fair.shortName || fair.name)}</h3>
      <p>${esc(fair.headline || fair.description)}</p>
      <b>Explore fair page <span>→</span></b>
      <em aria-hidden="true">${fair.emoji}</em>
    </article>`;
  }

  function announcementCard(item) {
    return `<article class="announcement-card ${item.tone || ''}">
      <small>${esc(item.label)}</small>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.text)}</p>
      ${item.route ? `<button class="text-action" data-nav="${item.route}">${esc(item.action)} →</button>` : `<a class="text-action" href="${item.url}" target="_blank" rel="noopener">${esc(item.action)} →</a>`}
    </article>`;
  }

  function homePage() {
    const live = state.demo;
    const now = schedule().find((item) => item.status === 'live');
    const upNext = schedule().find((item) => item.status === 'upnext');
    const fairs = live ? [data.demoFair, ...data.fairs] : data.fairs;
    return `
      <section class="editorial-hero ${live ? 'live' : ''}" style="--hero-image:url('${data.brand.heroImage}')">
        <div class="hero-aurora" aria-hidden="true"></div>
        <div class="hero-media" aria-hidden="true"><div class="hero-photo"></div><div class="hero-photo-wash"></div></div>
        <div class="hero-copy">
          <p class="hero-kicker"><span></span>${live ? 'LIVE PRODUCT DEMO' : esc(data.brand.subtitle)}</p>
          <h1>${live ? 'Your fair.<br><em>Your way.</em>' : 'All Belong<br><em>at the Fair.</em>'}</h1>
          <p>${live ? 'A live fair-day command center for schedules, community, accessibility, maps and the moments guests do not want to miss.' : 'A joyful, family-friendly home base for LGBTQ+ people, families, friends and allies—built directly into the fair experience.'}</p>
          <div class="hero-actions">
            <button class="btn btn-primary" data-nav="${live ? 'schedule' : 'fairs'}">${live ? 'Open live schedule' : 'Explore the 2027 fairs'} <span>→</span></button>
            <button class="btn btn-secondary" data-nav="${live ? 'map' : 'story'}">${live ? 'View the fair map' : 'Discover our story'}</button>
          </div>
          <div class="hero-proof">
            ${data.stats.slice(0, 3).map((item) => `<div><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></div>`).join('')}
          </div>
        </div>
        <div class="hero-float"><span>${live ? 'HAPPENING NOW' : 'THE OATF MODEL'}</span><strong>${live && now ? esc(now.title) : 'Visibility without leaving the fair.'}</strong></div>
      </section>

      <div class="signal-marquee" aria-label="OATF experience highlights"><div class="signal-track"><span>Family-friendly</span><i></i><span>Live entertainment</span><i></i><span>Community connection</span><i></i><span>Inside the full fair experience</span><i></i><span>All belong at the fair</span><i></i></div></div>

      ${live && now ? `<section class="section live-dashboard">
        ${sectionHead('Fair-day signal', 'Happening <em>right now.</em>', 'Sample live status for the partner demo', '<button class="text-action" data-nav="schedule">Full schedule →</button>')}
        <article class="now-card">
          <div class="now-card-top"><span class="live-pulse"><i></i> LIVE · ${esc(now.time)}–${esc(now.end)}</span><button class="save-round ${isSaved(now.id) ? 'saved' : ''}" data-action="favorite" data-id="${now.id}" aria-label="Save ${esc(now.title)}">${isSaved(now.id) ? '♥' : '♡'}</button></div>
          <h3>${esc(now.title)}</h3><p>${esc(now.description)}</p>
          <div class="now-meta"><span>📍 ${esc(now.location)}</span>${upNext ? `<span>UP NEXT · ${esc(upNext.title)}</span>` : ''}</div>
        </article>
      </section>` : ''}

      <section class="section">
        ${sectionHead('Your experience', 'Everything you need,<br><em>without the hunt.</em>', live ? 'Built for the fairgrounds in your hand' : 'Explore what V0.2 can already do')}
        <div class="quick-grid editorial">
          <button class="quick-action" data-nav="schedule"><span>◷</span><strong>Schedule</strong><small>Build your day</small></button>
          <button class="quick-action" data-nav="map"><span>⌖</span><strong>Fair Map</strong><small>Find what matters</small></button>
          <button class="quick-action" data-nav="community"><span>✦</span><strong>Community</strong><small>Meet local partners</small></button>
          <button class="quick-action" data-nav="passport"><span>✓</span><strong>Passport</strong><small>Explore and collect</small></button>
        </div>
      </section>

      <section class="section network-section">
        ${sectionHead('California 2027', 'One signal.<br><em>Three fairgrounds.</em>', 'Official dates and schedules activate as each fair is confirmed', '<button class="text-action" data-nav="fairs">View all →</button>')}
        <div class="fair-rail">${fairs.map((fair) => fairCard(fair)).join('')}</div>
      </section>

      <section class="section">
        ${sectionHead('The next chapter', 'Stay connected<br><em>between fair days.</em>')}
        <div class="announcement-grid">${data.announcements.map(announcementCard).join('')}</div>
      </section>

      ${live ? `<section class="section">${passportPreview()}</section>` : `<section class="section legacy-slab">
        ${sectionHead('More than a moment', 'Built over years.<br><em>Remembered for generations.</em>')}
        <div class="stats-grid">${data.stats.map((item) => `<article class="stat-card"><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></article>`).join('')}</div>
        <button class="btn btn-secondary btn-block" data-nav="story">Explore the complete timeline</button>
      </section>`}

      <section class="section">
        <article class="version-card">
          <small>OATF APP · V${esc(data.version)}</small>
          <h2>A real foundation,<br><em>not a throwaway demo.</em></h2>
          <p>V0.2 introduces the website’s new editorial visual system, global search, accessibility preferences, richer fair pages, upgraded passport progress and a cleaner fair-day dashboard.</p>
          <div class="button-row"><button class="btn btn-primary" data-action="toggle-demo">${live ? 'Exit fair-day demo' : 'Try fair-day demo'}</button><button class="btn btn-secondary" data-action="share-app">Share preview</button></div>
        </article>
      </section>`;
  }

  function fairsPage() {
    const fairs = state.demo ? [data.demoFair, ...data.fairs] : data.fairs;
    return `${pageHead('California fair communities', 'Find your <em>fair.</em>', 'Choose a location to make it your home fair. Confirmed dates and schedules can be added without redesigning the app.')}
      <div class="fair-list section">${fairs.map((fair) => fairCard(fair, true)).join('')}</div>`;
  }

  function fairDetailPage(id) {
    const fair = findFair(id) || currentFair();
    const isDemo = fair.id === data.demoFair.id;
    return `
      <article class="fair-detail-hero ${fair.accent}">
        <small>${esc(fair.overline)}</small>${statusPill(fair)}
        <h1>${esc(fair.shortName || fair.name)}</h1><h2>${esc(fair.headline)}</h2><p>${esc(fair.description)}</p>
        <div class="button-row"><button class="btn btn-primary" data-action="select-fair" data-id="${fair.id}">${state.selectedFair === fair.id ? '✓ Selected fair' : 'Make this my fair'}</button><button class="btn btn-secondary" data-action="share-fair" data-id="${fair.id}">Share</button></div>
        <em aria-hidden="true">${fair.emoji}</em>
      </article>

      <section class="section">
        <div class="info-list">
          <div><span>DATE</span><strong>${esc(fair.dateLabel)}</strong><p>${esc(fair.timeLabel)}</p></div>
          <div><span>LOCATION</span><strong>${esc(fair.stage)}</strong><p>${esc(fair.address)}</p></div>
          <div><span>ADMISSION</span><strong>Fair-day access</strong><p>${esc(fair.admission)}</p></div>
        </div>
      </section>

      <section class="section">${sectionHead('What to expect', 'A visible place<br><em>to belong.</em>')}<div class="feature-cloud">${fair.features.map((item) => `<span>${esc(item)}</span>`).join('')}</div></section>

      <section class="section">${sectionHead(isDemo ? 'Fair-day tools' : 'Plan ahead', isDemo ? 'The complete demo<br><em>is ready.</em>' : 'The app is ready<br><em>when the details are.</em>')}
        <div class="tool-grid">
          <button data-nav="schedule"><span>◷</span><strong>${isDemo ? 'Live schedule' : 'Schedule'}</strong><small>${isDemo ? 'Happening now + favorites' : 'Activates when announced'}</small></button>
          <button data-nav="map"><span>⌖</span><strong>Fair map</strong><small>${isDemo ? 'Interactive demo pins' : 'Directions + accessibility'}</small></button>
          <button data-nav="community"><span>✦</span><strong>Community</strong><small>Organizations and resources</small></button>
          <button data-nav="passport"><span>✓</span><strong>Passport</strong><small>Explore the OATF experience</small></button>
        </div>
      </section>

      <section class="section">${sectionHead('Fair information', 'Go beyond<br><em>the app.</em>')}<div class="button-stack"><a class="btn btn-primary btn-block" href="${fair.websiteUrl}" target="_blank" rel="noopener">Open OATF fair page</a><a class="btn btn-secondary btn-block" href="${fair.mapUrl}" target="_blank" rel="noopener">Directions to the fairgrounds</a><a class="btn btn-secondary btn-block" href="${fair.ticketUrl}" target="_blank" rel="noopener">Official fair website</a></div></section>

      <section class="section quote-card"><p>THE OATF MODEL</p><blockquote>${esc(fair.history)}</blockquote></section>`;
  }

  function schedulePage() {
    const items = schedule();
    if (!items.length) return `${pageHead('Your day', 'Schedule <em>coming soon.</em>', 'Confirmed stage times will appear here first. Activate demo mode to test favorites, filters and calendar export.')}
      <article class="empty-state"><span>◷</span><h2>The stage is ready.</h2><p>The 2027 schedule will activate when the first fair is confirmed.</p><button class="btn btn-primary" data-action="toggle-demo">Try the live schedule demo</button></article>`;
    const categories = ['All', ...new Set(items.map((item) => item.category))];
    return `${pageHead('Live partner demo', 'Build your <em>fair day.</em>', 'Filter the stage schedule, save performances and export your personal itinerary.')}
      <div class="filter-row">${categories.map((category) => `<button class="filter-chip ${category === 'All' ? 'active' : ''}" data-filter-schedule="${esc(category)}">${esc(category)}</button>`).join('')}</div>
      <div class="schedule-list">${items.map(scheduleItem).join('')}</div>
      <div class="sticky-actions"><button class="btn btn-secondary" data-action="download-day-calendar">Download full day</button><button class="btn btn-primary" data-action="download-my-calendar">Download My OATF</button></div>`;
  }

  function scheduleItem(item) {
    const p = performer(item.performerId);
    return `<article class="schedule-item ${item.status}" data-category="${esc(item.category)}" data-performer="${esc(item.performerId || '')}">
      <div class="schedule-time"><strong>${esc(item.time)}</strong><span>${esc(item.end)}</span></div>
      <div class="schedule-line"><i></i></div>
      <div class="schedule-copy">${item.status === 'live' ? '<small class="live-label">LIVE NOW</small>' : item.status === 'upnext' ? '<small class="next-label">UP NEXT</small>' : `<small>${esc(item.category)}</small>`}<h3>${esc(item.title)}</h3><p>${esc(item.description)}</p><div class="schedule-meta"><span>📍 ${esc(item.location)}</span>${p ? `<button data-person="${p.id}">${esc(p.name)} →</button>` : ''}</div></div>
      <button class="save-round ${isSaved(item.id) ? 'saved' : ''}" data-action="favorite" data-id="${item.id}" aria-label="${isSaved(item.id) ? 'Remove' : 'Save'} ${esc(item.title)}">${isSaved(item.id) ? '♥' : '♡'}</button>
    </article>`;
  }

  function myPage() {
    const savedEvents = schedule().filter((item) => isSaved(item.id));
    const savedPartners = data.partners.filter((item) => isPartnerSaved(item.id));
    return `${pageHead('Personal fair guide', 'My <em>OATF.</em>', 'Your saved schedule, community connections and home fair live here on this device.')}
      <section class="section">${sectionHead('Home fair', esc(currentFair().shortName || currentFair().name), esc(currentFair().dateLabel), '<button class="text-action" data-nav="fairs">Change →</button>')} ${fairCard(currentFair(), true)}</section>
      <section class="section">${sectionHead('Saved schedule', `${savedEvents.length} ${savedEvents.length === 1 ? 'moment' : 'moments'}`, state.demo ? 'Your personal fair-day itinerary' : 'Activate the demo to test schedule favorites')}
        ${savedEvents.length ? `<div class="schedule-list compact">${savedEvents.map(scheduleItem).join('')}</div><button class="btn btn-primary btn-block" data-action="download-my-calendar">Download personal calendar</button>` : `<div class="mini-empty"><span>♡</span><p>Tap the heart beside a performance to add it here.</p><button class="text-action" data-nav="schedule">Open schedule →</button></div>`}
      </section>
      <section class="section">${sectionHead('Saved community', `${savedPartners.length} ${savedPartners.length === 1 ? 'organization' : 'organizations'}`, 'Keep useful resources close')}
        ${savedPartners.length ? `<div class="partner-list">${savedPartners.map(partnerCard).join('')}</div>` : `<div class="mini-empty"><span>✦</span><p>Save organizations you want to visit or remember.</p><button class="text-action" data-nav="community">Explore community →</button></div>`}
      </section>`;
  }

  function performersPage() {
    return `${pageHead('Meet the stage', 'OATF <em>performers.</em>', 'Discover the hosts, musicians, storytellers and signature shows behind the sample fair-day schedule.')}
      <label class="search-field"><span>⌕</span><input type="search" data-search="performers" placeholder="Search performers" autocomplete="off"></label>
      <div id="performer-list" class="person-grid">${data.performers.map(personCard).join('')}</div>`;
  }

  function personCard(p) {
    return `<article class="person-card" data-person="${p.id}" tabindex="0" role="button"><div class="person-icon">${p.icon}</div><small>${esc(p.type)}</small><h3>${esc(p.name)}</h3><p>${esc(p.bio)}</p><b>View profile →</b></article>`;
  }

  function performerDetailPage(id) {
    const p = performer(id) || data.performers[0];
    const appearances = data.demoSchedule.filter((item) => item.performerId === p.id);
    return `<article class="profile-hero"><div class="profile-icon">${p.icon}</div><p>${esc(p.type)}</p><h1>${esc(p.name)}</h1><blockquote>${esc(p.bio)}</blockquote></article>
      <section class="section">${sectionHead('Demo appearances', 'On the <em>schedule.</em>')}${appearances.length ? `<div class="schedule-list compact">${appearances.map(scheduleItem).join('')}</div>` : '<div class="mini-empty"><p>No sample appearances are connected yet.</p></div>'}</section>
      <section class="section"><button class="btn btn-secondary btn-block" data-nav="performers">Back to all performers</button></section>`;
  }

  function communityPage() {
    const categories = ['All', ...new Set(data.partners.map((item) => item.category))];
    return `${pageHead('Connection beyond the stage', 'Find your <em>community.</em>', 'Search sample organizations, save resources and see how booth information can work on fair day.')}
      <label class="search-field"><span>⌕</span><input type="search" data-search="partners" placeholder="Search organizations or services" autocomplete="off"></label>
      <div class="filter-row">${categories.map((category) => `<button class="filter-chip ${category === 'All' ? 'active' : ''}" data-filter-partner="${esc(category)}">${esc(category)}</button>`).join('')}</div>
      <div id="partner-list" class="partner-list">${data.partners.map(partnerCard).join('')}</div>`;
  }

  function partnerCard(p) {
    return `<article class="partner-card" data-partner="${p.id}" data-category="${esc(p.category)}" tabindex="0" role="button"><div class="partner-icon">${p.icon}</div><div><small>${esc(p.category)} · BOOTH ${esc(p.booth)}</small><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="service-row">${p.services.map((service) => `<span>${esc(service)}</span>`).join('')}</div></div><button class="save-round ${isPartnerSaved(p.id) ? 'saved' : ''}" data-action="favorite-partner" data-id="${p.id}" aria-label="Save ${esc(p.name)}">${isPartnerSaved(p.id) ? '♥' : '♡'}</button></article>`;
  }

  function partnerDetailPage(id) {
    const p = partner(id) || data.partners[0];
    return `<article class="profile-hero community-profile"><div class="profile-icon">${p.icon}</div><p>${esc(p.category)} · BOOTH ${esc(p.booth)}</p><h1>${esc(p.name)}</h1><blockquote>${esc(p.description)}</blockquote><div class="feature-cloud">${p.services.map((service) => `<span>${esc(service)}</span>`).join('')}</div><button class="btn btn-primary btn-block" data-action="favorite-partner" data-id="${p.id}">${isPartnerSaved(p.id) ? '✓ Saved to My OATF' : 'Save organization'}</button></article>`;
  }

  function mapPage() {
    const selected = data.mapPins.find((pin) => pin.id === mapSelected) || data.mapPins[0];
    const types = ['All', ...new Set(data.mapPins.map((pin) => pin.type))];
    return `${pageHead('Fair-day navigation', 'Find your <em>way.</em>', state.demo ? 'Tap a sample map pin to preview live fairground guidance.' : 'Map details activate when fairground layouts are confirmed.')}
      ${!state.demo ? '<div class="notice-card"><strong>Preview map</strong><p>This prototype uses sample locations. Activate demo mode to explore the full map experience.</p><button class="btn btn-primary" data-action="toggle-demo">Open map demo</button></div>' : ''}
      <div class="filter-row">${types.map((type) => `<button class="filter-chip ${type === 'All' ? 'active' : ''}" data-filter-map="${esc(type)}">${esc(type)}</button>`).join('')}</div>
      <div class="map-shell">
        <div class="map-grid" aria-label="Demo OATF fair map">${data.mapPins.map((pin) => `<button class="map-pin ${mapSelected === pin.id ? 'selected' : ''}" data-map-pin="${pin.id}" data-type="${esc(pin.type)}" style="left:${pin.x}%;top:${pin.y}%" aria-label="${esc(pin.label)}"><span>${pin.icon}</span></button>`).join('')}<div class="map-stage-shape">OATF</div><div class="map-path one"></div><div class="map-path two"></div></div>
        <article class="map-detail"><div>${selected.icon}</div><small>${esc(selected.type)}</small><h3>${esc(selected.label)}</h3><p>${esc(selected.detail)}</p>${state.demo ? `<button class="btn btn-secondary btn-block" data-action="passport-stamp" data-id="${selected.id}">${state.passport.includes(selected.id) ? '✓ Passport stamped' : 'Stamp this location'}</button>` : ''}</article>
      </div>`;
  }

  function passportPreview() {
    const total = data.passportChallenges.length;
    const complete = data.passportChallenges.filter((item) => state.passport.includes(item.id)).length;
    const percent = Math.round((complete / total) * 100);
    return `<article class="passport-preview"><div class="passport-orbit" aria-hidden="true"></div><small>OATF PASSPORT</small><h2>Explore more.<br><em>Collect the day.</em></h2><p>${complete} of ${total} sample experiences completed.</p><div class="progress-track"><span style="width:${percent}%"></span></div><button class="btn btn-primary" data-nav="passport">Open passport</button></article>`;
  }

  function passportPage() {
    const total = data.passportChallenges.length;
    const complete = data.passportChallenges.filter((item) => state.passport.includes(item.id)).length;
    const percent = Math.round((complete / total) * 100);
    return `${pageHead('Explore the experience', 'OATF <em>Passport.</em>', state.demo ? 'Tap each sample challenge to add or remove a digital stamp.' : 'The passport becomes active on fair day. Try demo mode to preview it.')}
      <article class="passport-header"><small>YOUR PROGRESS</small><strong>${complete}/${total}</strong><div class="progress-track"><span style="width:${percent}%"></span></div><p>${complete === total ? 'Demo passport complete! This could unlock a giveaway entry or fair-day reward.' : 'Complete experiences across the stage, community row and fairgrounds.'}</p></article>
      <div class="passport-grid">${data.passportChallenges.map((item) => `<button class="passport-stamp ${state.passport.includes(item.id) ? 'complete' : ''}" data-action="passport-stamp" data-id="${item.id}" ${!state.demo ? 'disabled' : ''}><span>${item.icon}</span><div><small>${state.passport.includes(item.id) ? 'STAMPED' : 'CHALLENGE'}</small><strong>${esc(item.title)}</strong><p>${esc(item.text)}</p></div><b>${state.passport.includes(item.id) ? '✓' : '+'}</b></button>`).join('')}</div>`;
  }

  function notificationsPage() {
    const prefs = [
      ['schedule', 'Schedule reminders', 'Get a reminder before saved performances begin.'],
      ['fair', 'Fair announcements', 'Dates, stages, time changes and important attendee updates.'],
      ['giveaways', 'Giveaways', 'App-only giveaways and winner notifications.'],
      ['community', 'Community moments', 'Spotlights and important partner resources.']
    ];
    return `${pageHead('Choose what matters', 'OATF <em>alerts.</em>', 'V0.2 stores your notification preferences. Remote delivery will activate with OneSignal in a future native build.')}
      <div class="settings-list">${prefs.map(([id, title, text]) => `<button class="setting-row" data-action="notification-pref" data-id="${id}"><span><strong>${title}</strong><small>${text}</small></span><i class="toggle ${state.notifications[id] ? 'on' : ''}"><b></b></i></button>`).join('')}</div>
      <section class="section"><button class="btn btn-primary btn-block" data-action="request-notifications">Test device permission</button><p class="fine-print">Browser permission tests are local. Live remote notifications require the native app credentials and OneSignal configuration.</p></section>`;
  }

  function accessibilityPage() {
    const prefs = [
      ['largeType', 'Larger text', 'Increase reading size across the app.'],
      ['highContrast', 'Higher contrast', 'Strengthen borders and text contrast.'],
      ['reducedMotion', 'Reduce motion', 'Limit animation and transition effects.']
    ];
    return `${pageHead('Plan with confidence', 'Accessibility <em>first.</em>', 'The app can provide fair-specific routes, seating, sensory information and guest-services details in one place.')}
      <div class="settings-list">${prefs.map(([id, title, text]) => `<button class="setting-row" data-action="accessibility-pref" data-id="${id}"><span><strong>${title}</strong><small>${text}</small></span><i class="toggle ${state.prefs[id] ? 'on' : ''}"><b></b></i></button>`).join('')}</div>
      <section class="section">${sectionHead('Your selected fair', 'Available <em>guidance.</em>')}<div class="access-list">${currentFair().accessibility.map((item) => `<div><span>✓</span><p>${esc(item)}</p></div>`).join('')}</div></section>
      <section class="section"><article class="notice-card"><strong>Emergency information</strong><p>In a live build, this area can display the selected fair’s emergency number, guest services, first aid and accessible route details—even offline.</p><button class="btn btn-secondary" data-action="demo-help">Preview guest services</button></article></section>`;
  }

  function storyPage() {
    return `${pageHead('More than a moment', 'Built over years.<br><em>Remembered for generations.</em>', 'What started as an unofficial gathering became an official branded program, expanded across fairgrounds and earned one of the fair industry’s highest honors.')}
      <div class="timeline">${data.story.map((item, index) => `<article class="${index === data.story.length - 1 ? 'future' : ''}"><strong>${esc(item.year)}</strong><div><small>${String(index + 1).padStart(2, '0')}</small><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div></article>`).join('')}</div>
      <section class="quote-card"><p>OUR PURPOSE HAS ALWAYS BEEN SIMPLE</p><blockquote>Make sure LGBTQ+ people can see themselves <em>inside the fair.</em></blockquote></section>`;
  }

  function participatePage() {
    const paths = [
      ['01', 'Partner', 'Bring community resources, activations and local connection to an OATF fair.'],
      ['02', 'Perform', 'Share family-friendly entertainment with audiences across the fairgrounds.'],
      ['03', 'Produce', 'Build an OATF experience through licensed production and fair partnership.']
    ];
    return `${pageHead('Find your place', 'The fair is better<br><em>when you are part of it.</em>', 'OATF is built through fair partners, community organizations, artists and experienced production teams.')}
      <div class="path-grid">${paths.map(([number, title, text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p><a href="mailto:${data.brand.email}?subject=${encodeURIComponent(`${title} with Out at the Fair`)}">Start a conversation →</a></article>`).join('')}</div>`;
  }

  function contactPage() {
    return `${pageHead('Connect with OATF', 'Let us meet you<br><em>at the fair.</em>', 'Questions about partnerships, entertainment, community participation, media or the 2027 season can begin here.')}
      <div class="contact-grid"><a href="mailto:${data.brand.email}"><span>✉</span><small>EMAIL</small><strong>${esc(data.brand.email)}</strong></a><a href="tel:+14422229935"><span>☎</span><small>PHONE</small><strong>${esc(data.brand.phone)}</strong></a><a href="${data.brand.instagram}" target="_blank" rel="noopener"><span>◎</span><small>INSTAGRAM</small><strong>@outatthefair</strong></a><a href="${data.brand.website}" target="_blank" rel="noopener"><span>↗</span><small>WEBSITE</small><strong>Explore the new OATF site</strong></a></div>`;
  }

  function searchPage() {
    return `${pageHead('Find it fast', 'Search <em>OATF.</em>', 'Search fairs, performers, organizations, services and history.')}
      <label class="search-field search-main"><span>⌕</span><input id="global-search" type="search" data-search="global" placeholder="Try “Story Time,” “San Diego” or “youth”" autocomplete="off" autofocus></label>
      <div id="search-results" class="search-results"><div class="mini-empty"><span>⌕</span><p>Start typing to search the app.</p></div></div>`;
  }

  function morePage() {
    const menu = [
      ['performers', '🎤', 'Performers', 'Meet the sample stage lineup'],
      ['community', '✦', 'Community', 'Organizations, booths and services'],
      ['map', '⌖', 'Fair map', 'Navigation and accessibility pins'],
      ['passport', '✓', 'OATF Passport', 'Explore and collect experiences'],
      ['story', '◈', 'Our story', 'The complete OATF timeline'],
      ['accessibility', '♿', 'Accessibility', 'Display and fair-day guidance'],
      ['participate', '＋', 'Participate', 'Partner, perform or produce'],
      ['contact', '✉', 'Contact', 'Connect with the OATF team']
    ];
    return `${pageHead('Explore the app', 'More <em>OATF.</em>', 'Everything beyond your home fair and personal schedule.')}
      <div class="more-menu">${menu.map(([route, icon, title, text]) => `<button data-nav="${route}"><span>${icon}</span><div><strong>${title}</strong><small>${text}</small></div><b>›</b></button>`).join('')}</div>
      <section class="section"><article class="demo-switch-card"><div><small>PARTNER PRESENTATION TOOL</small><h2>${state.demo ? 'Fair-day demo is live.' : 'Preview a complete fair day.'}</h2><p>${state.demo ? 'LA County demo data is active throughout the app.' : 'Activate the clearly labeled LA County partner demo to test the schedule, map, favorites and passport.'}</p></div><button class="btn btn-primary" data-action="toggle-demo">${state.demo ? 'Exit demo mode' : 'Activate demo mode'}</button></article></section>
      <section class="section"><div class="button-stack"><button class="btn btn-secondary btn-block" data-action="install-app">Install app</button><button class="btn btn-secondary btn-block" data-action="share-app">Share preview</button><button class="btn btn-secondary btn-block" data-action="reset-app">Reset local app data</button></div></section>
      <footer class="app-footer"><img src="assets/images/oatf-logo-fallback.svg" alt="Out at the Fair"><p>V${esc(data.version)} · Updated ${esc(data.updated)}</p><small>© OutAt Inc. Out at the Fair® is a registered brand of OutAt Inc.</small></footer>`;
  }

  function render() {
    const route = currentRoute();
    let content;
    switch (route.name) {
      case 'home': content = homePage(); break;
      case 'fairs': content = fairsPage(); break;
      case 'fair': content = fairDetailPage(route.id); break;
      case 'schedule': content = schedulePage(); break;
      case 'my': content = myPage(); break;
      case 'performers': content = performersPage(); break;
      case 'performer': content = performerDetailPage(route.id); break;
      case 'community': content = communityPage(); break;
      case 'partner': content = partnerDetailPage(route.id); break;
      case 'map': content = mapPage(); break;
      case 'passport': content = passportPage(); break;
      case 'notifications': content = notificationsPage(); break;
      case 'accessibility': content = accessibilityPage(); break;
      case 'story': content = storyPage(); break;
      case 'participate': content = participatePage(); break;
      case 'contact': content = contactPage(); break;
      case 'search': content = searchPage(); break;
      case 'more': content = morePage(); break;
      default: content = homePage();
    }
    shell(content);
    if (route.name === 'search') setTimeout(() => document.getElementById('global-search')?.focus(), 50);
  }

  function toggleDemo() {
    state.demo = !state.demo;
    state.selectedFair = state.demo ? data.demoFair.id : 'san-diego';
    saveState();
    showToast(state.demo ? 'Fair-day demo activated' : 'Demo mode turned off');
    navigate('home');
  }

  function toggleFavorite(id) {
    state.favorites = isSaved(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id];
    saveState();
    render();
    showToast(isSaved(id) ? 'Added to My OATF' : 'Removed from My OATF');
  }

  function togglePartnerFavorite(id) {
    state.savedPartners = isPartnerSaved(id) ? state.savedPartners.filter((item) => item !== id) : [...state.savedPartners, id];
    saveState();
    render();
    showToast(isPartnerSaved(id) ? 'Community partner saved' : 'Community partner removed');
  }

  function togglePassport(id) {
    if (!state.demo) return showToast('Activate demo mode to test passport stamps');
    state.passport = state.passport.includes(id) ? state.passport.filter((item) => item !== id) : [...state.passport, id];
    saveState();
    render();
    showToast(state.passport.includes(id) ? 'Passport stamped!' : 'Stamp removed');
  }

  function calendarText(items) {
    const date = '20270515';
    const fmtTime = (label) => {
      const [time, meridiem] = label.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (meridiem === 'PM' && h !== 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
    };
    const events = items.map((item) => `BEGIN:VEVENT\nUID:${item.id}@outatthefair.com\nDTSTAMP:20260725T010000Z\nDTSTART:${date}T${fmtTime(item.time)}\nDTEND:${date}T${fmtTime(item.end)}\nSUMMARY:${item.title.replaceAll(',', '\\,')} — OATF Demo\nLOCATION:${item.location.replaceAll(',', '\\,')}\nDESCRIPTION:${item.description.replaceAll(',', '\\,')} Sample event only.\nEND:VEVENT`).join('\n');
    return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//OutAt Inc.//OATF App V0.2//EN\nCALSCALE:GREGORIAN\n${events}\nEND:VCALENDAR`;
  }

  function downloadCalendar(items, filename) {
    if (!items.length) return showToast('Save at least one event first');
    const blob = new Blob([calendarText(items)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Calendar file created');
  }

  async function sharePayload(payload) {
    try {
      if (navigator.share) await navigator.share(payload);
      else { await navigator.clipboard.writeText(payload.url); showToast('Link copied'); }
    } catch (error) { if (error?.name !== 'AbortError') showToast('Could not share the link'); }
  }

  function shareApp() {
    return sharePayload({ title: 'Out at the Fair® App', text: 'Preview the new OATF fair-day app.', url: location.href.split('#')[0] });
  }

  function shareFair(id) {
    const fair = findFair(id);
    if (!fair) return;
    return sharePayload({ title: `${fair.name} — Out at the Fair®`, text: fair.description, url: fair.websiteUrl });
  }

  async function installApp() {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      return;
    }
    showModal('Install Out at the Fair®', 'On iPhone, tap Share in Safari and choose “Add to Home Screen.” On Android or desktop Chrome, use the browser install option.', 'Got it');
  }

  function showModal(title, message, primary = 'Close') {
    document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" onclick="event.stopPropagation()"><div class="modal-handle"></div><h2>${esc(title)}</h2><p>${esc(message)}</p><div class="modal-actions"><button class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="close-modal">${esc(primary)}</button></div></div></div>`);
  }

  function filterSchedule(category, button) {
    document.querySelectorAll('[data-filter-schedule]').forEach((el) => el.classList.toggle('active', el === button));
    document.querySelectorAll('.schedule-item').forEach((el) => { el.hidden = category !== 'All' && el.dataset.category !== category; });
  }

  function filterPartners(category, button) {
    document.querySelectorAll('[data-filter-partner]').forEach((el) => el.classList.toggle('active', el === button));
    document.querySelectorAll('#partner-list .partner-card').forEach((el) => { el.hidden = category !== 'All' && el.dataset.category !== category; });
  }

  function filterMap(type, button) {
    document.querySelectorAll('[data-filter-map]').forEach((el) => el.classList.toggle('active', el === button));
    document.querySelectorAll('.map-pin').forEach((el) => { el.hidden = type !== 'All' && el.dataset.type !== type; });
  }

  function globalSearch(query) {
    const output = document.getElementById('search-results');
    if (!output) return;
    const q = query.toLowerCase().trim();
    if (!q) { output.innerHTML = '<div class="mini-empty"><span>⌕</span><p>Start typing to search the app.</p></div>'; return; }
    const results = [];
    [...data.fairs, data.demoFair].forEach((fair) => {
      const hay = `${fair.name} ${fair.city} ${fair.description} ${fair.features.join(' ')}`.toLowerCase();
      if (hay.includes(q)) results.push({ type: 'FAIR', icon: fair.emoji, title: fair.name, text: fair.city, route: `fair/${fair.id}` });
    });
    data.performers.forEach((p) => {
      if (`${p.name} ${p.type} ${p.bio}`.toLowerCase().includes(q)) results.push({ type: 'PERFORMER', icon: p.icon, title: p.name, text: p.type, route: `performer/${p.id}` });
    });
    data.partners.forEach((p) => {
      if (`${p.name} ${p.category} ${p.description} ${p.services.join(' ')}`.toLowerCase().includes(q)) results.push({ type: 'COMMUNITY', icon: p.icon, title: p.name, text: `${p.category} · Booth ${p.booth}`, route: `partner/${p.id}` });
    });
    data.story.forEach((item) => {
      if (`${item.year} ${item.title} ${item.text}`.toLowerCase().includes(q)) results.push({ type: 'HISTORY', icon: item.year, title: item.title, text: item.text, route: 'story' });
    });
    output.innerHTML = results.length ? results.slice(0, 20).map((item) => `<button class="search-result" data-nav="${item.route}"><span>${esc(item.icon)}</span><div><small>${esc(item.type)}</small><strong>${esc(item.title)}</strong><p>${esc(item.text)}</p></div><b>›</b></button>`).join('') : `<div class="mini-empty"><span>⌕</span><p>No results for “${esc(query)}.”</p></div>`;
  }

  async function requestNotifications() {
    if (!('Notification' in window)) return showToast('Notifications require the native app or a supported browser');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('Out at the Fair®', { body: 'You are ready for fair-day alerts!', icon: 'icons/icon-192.png' });
      showToast('Device notifications enabled');
    } else showToast('Notification permission was not enabled');
  }

  app.addEventListener('click', (event) => {
    const nav = event.target.closest('[data-nav]');
    if (nav) return navigate(nav.dataset.nav);

    const fair = event.target.closest('[data-fair]');
    if (fair) return navigate(`fair/${fair.dataset.fair}`);

    const personEl = event.target.closest('[data-person]');
    if (personEl && !event.target.closest('[data-action]')) return navigate(`performer/${personEl.dataset.person}`);

    const performerEl = event.target.closest('[data-performer]');
    if (performerEl && !event.target.closest('button')) return navigate(`performer/${performerEl.dataset.performer}`);

    const partnerEl = event.target.closest('[data-partner]');
    if (partnerEl && !event.target.closest('[data-action]')) return navigate(`partner/${partnerEl.dataset.partner}`);

    const scheduleFilter = event.target.closest('[data-filter-schedule]');
    if (scheduleFilter) return filterSchedule(scheduleFilter.dataset.filterSchedule, scheduleFilter);

    const partnerFilter = event.target.closest('[data-filter-partner]');
    if (partnerFilter) return filterPartners(partnerFilter.dataset.filterPartner, partnerFilter);

    const mapFilter = event.target.closest('[data-filter-map]');
    if (mapFilter) return filterMap(mapFilter.dataset.filterMap, mapFilter);

    const mapPin = event.target.closest('[data-map-pin]');
    if (mapPin) { mapSelected = mapPin.dataset.mapPin; return render(); }

    const action = event.target.closest('[data-action]');
    if (!action) return;
    const id = action.dataset.id;
    switch (action.dataset.action) {
      case 'toggle-demo': toggleDemo(); break;
      case 'favorite': toggleFavorite(id); break;
      case 'favorite-partner': togglePartnerFavorite(id); break;
      case 'passport-stamp': togglePassport(id); break;
      case 'select-fair': state.selectedFair = id; state.demo = id === data.demoFair.id; saveState(); showToast('Your fair has been updated'); render(); break;
      case 'notification-pref': state.notifications[id] = !state.notifications[id]; saveState(); render(); break;
      case 'accessibility-pref': state.prefs[id] = !state.prefs[id]; saveState(); render(); break;
      case 'request-notifications': requestNotifications(); break;
      case 'download-day-calendar': downloadCalendar(schedule(), 'oatf-demo-day.ics'); break;
      case 'download-my-calendar': downloadCalendar(schedule().filter((item) => isSaved(item.id)), 'my-oatf-schedule.ics'); break;
      case 'share-app': shareApp(); break;
      case 'share-fair': shareFair(id); break;
      case 'install-app': installApp(); break;
      case 'demo-help': showModal('Guest services demo', 'A live fair build can route this button to the selected fair’s official guest-services phone, text line or help desk.', 'Understood'); break;
      case 'reset-app': try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(LEGACY_KEY); } catch {} Object.assign(state, JSON.parse(JSON.stringify(defaultState))); saveState(); showToast('Local app data reset'); navigate('home'); break;
      case 'close-modal': document.querySelector('.modal-backdrop')?.remove(); break;
    }
  });

  app.addEventListener('input', (event) => {
    const type = event.target.dataset.search;
    if (!type) return;
    const query = event.target.value.toLowerCase().trim();
    if (type === 'global') return globalSearch(event.target.value);
    const selector = type === 'performers' ? '#performer-list .person-card' : '#partner-list .partner-card';
    document.querySelectorAll(selector).forEach((el) => { el.hidden = !el.textContent.toLowerCase().includes(query); });
  });

  app.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const fair = event.target.closest('[data-fair]');
    if (fair) navigate(`fair/${fair.dataset.fair}`);
    const personEl = event.target.closest('[data-person]');
    if (personEl) navigate(`performer/${personEl.dataset.person}`);
    const partnerEl = event.target.closest('[data-partner]');
    if (partnerEl) navigate(`partner/${partnerEl.dataset.partner}`);
  });

  window.addEventListener('hashchange', render);
  window.addEventListener('online', () => { render(); showToast('Back online'); });
  window.addEventListener('offline', render);
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPrompt = event; });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }

  if (!location.hash) location.hash = 'home';
  else render();
})();
