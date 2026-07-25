(() => {
  'use strict';

  const data = window.OATF_DATA;
  const app = document.getElementById('app');
  const STORAGE_KEY = 'oatf-v0.1-state';
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
    seenWelcome: false
  };

  const state = loadState();

  function loadState() {
    try {
      return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return { ...defaultState };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Some privacy modes block storage. The app still works for the current session.
    }
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

  function performer(id) {
    return data.performers.find((item) => item.id === id);
  }

  function partner(id) {
    return data.partners.find((item) => item.id === id);
  }

  function schedule() {
    return state.demo ? data.demoSchedule : [];
  }

  function isSaved(id) {
    return state.favorites.includes(id);
  }

  function isPartnerSaved(id) {
    return state.savedPartners.includes(id);
  }

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
        <div class="topbar-row">
          <button class="brand-button" data-nav="home" aria-label="Go home">
            <span class="brand-lockup">
              <span class="mini-mark" aria-hidden="true"></span>
              <span class="brand-copy"><strong>Out at the Fair®</strong><span>${state.demo ? 'Live partner preview' : 'Your fair-day companion'}</span></span>
            </span>
          </button>
          <button class="icon-button" data-nav="notifications" aria-label="Notifications">🔔</button>
        </div>
      </header>`;
  }

  function banners() {
    return `
      ${!navigator.onLine ? '<div class="offline-banner">Offline mode: your saved fair guide is still available.</div>' : ''}
      ${state.demo ? '<div class="demo-banner"><strong>DEMO MODE:</strong> LA County Fair content is a partner preview, not an announced event.</div>' : ''}`;
  }

  function bottomNav(route) {
    const items = [
      ['home', '🏠', 'Home'],
      ['fairs', '🎡', 'Fairs'],
      ['schedule', '🗓️', 'Schedule'],
      ['my', '💖', 'My OATF'],
      ['more', '☰', 'More']
    ];
    const activeName = ['fair', 'performer', 'community', 'map', 'story', 'accessibility', 'notifications', 'partners', 'contact', 'passport'].includes(route.name)
      ? (route.name === 'fair' ? 'fairs' : route.name === 'performer' || route.name === 'community' || route.name === 'map' || route.name === 'story' || route.name === 'accessibility' || route.name === 'notifications' || route.name === 'partners' || route.name === 'contact' || route.name === 'passport' ? 'more' : route.name)
      : route.name;
    return `<nav class="bottom-nav" aria-label="Primary navigation">
      ${items.map(([id, icon, label]) => `<button class="nav-button ${activeName === id ? 'active' : ''}" data-nav="${id}" aria-current="${activeName === id ? 'page' : 'false'}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`).join('')}
    </nav>`;
  }

  function shell(content) {
    const route = currentRoute();
    app.innerHTML = `<div class="app-frame">${topbar()}${banners()}<main id="app-main" class="content page-enter">${content}</main>${bottomNav(route)}</div>`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function sectionHead(title, subtitle = '', action = '') {
    return `<div class="section-head"><div><h2>${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>${action}</div>`;
  }

  function statusPill(fair) {
    return `<span class="status ${fair.statusTone}">${fair.statusTone === 'live' ? '<span class="live-dot"></span>' : ''}${esc(fair.status)}</span>`;
  }

  function fairCard(fair) {
    return `<article class="card fair-card ${fair.accent}" data-fair="${fair.id}" data-emoji="${fair.emoji}" tabindex="0" role="button" aria-label="Open ${esc(fair.name)}">
      ${statusPill(fair)}
      <h3>${esc(fair.name)}</h3>
      <p>${esc(fair.dateLabel)} · ${esc(fair.city)}</p>
    </article>`;
  }

  function homePage() {
    const fair = currentFair();
    const live = state.demo;
    const now = schedule().find((item) => item.status === 'live');
    return `
      <section class="hero ${live ? 'hero-live' : ''}">
        <div>${live ? '<span class="live-pill"><span class="live-dot"></span> Live demo fair day</span>' : '<span class="eyebrow">The next chapter</span>'}</div>
        <h1>${live ? 'Your fair.<br>Your way.' : 'See you<br>in 2027.'}</h1>
        <p>${live ? 'Build your schedule, find community, and know exactly what is happening next.' : 'A refreshed Out at the Fair experience is coming—with the same community, more connection, and a fair-day app built around you.'}</p>
        <div class="hero-actions">
          <button class="btn btn-primary" data-nav="${live ? 'schedule' : 'fairs'}">${live ? 'View live schedule' : 'Explore the fairs'} <span>→</span></button>
          <button class="btn btn-secondary" data-nav="${live ? 'map' : 'story'}">${live ? 'Open fair map' : 'Our story'}</button>
        </div>
      </section>

      ${live && now ? `<section class="section">${sectionHead('Happening now', 'Sample live fair-day status', '<button class="text-link" data-nav="schedule">Full schedule</button>')}
        <article class="card now-card">
          <div class="now-time">Now · ${esc(now.time)}–${esc(now.end)}</div>
          <h3>${esc(now.title)}</h3>
          <p>${esc(now.description)}</p>
          <div class="now-meta"><span class="meta-chip">📍 ${esc(now.location)}</span><span class="meta-chip">Up next: Nicole & Scotty</span></div>
        </article>
      </section>` : ''}

      <section class="section">
        ${sectionHead('Jump right in', live ? 'Everything you need for today' : 'Start planning the next fair season')}
        <div class="quick-grid">
          <button class="quick-action" data-nav="schedule"><span>🗓️</span><strong>Schedule</strong></button>
          <button class="quick-action" data-nav="map"><span>🗺️</span><strong>Fair Map</strong></button>
          <button class="quick-action" data-nav="community"><span>🌈</span><strong>Community</strong></button>
          <button class="quick-action" data-nav="my"><span>💖</span><strong>My OATF</strong></button>
        </div>
      </section>

      <section class="section">
        ${sectionHead(live ? 'Your selected fair' : 'Find your fair', live ? 'Partner preview active' : '2027 dates will appear here first', '<button class="text-link" data-nav="fairs">View all</button>')}
        <div class="fair-strip">${(live ? [data.demoFair, ...data.fairs] : data.fairs).map(fairCard).join('')}</div>
      </section>

      ${live ? `<section class="section">${passportPreview()}</section>` : `
      <section class="section">
        ${sectionHead('Built on belonging', 'More than a day at the fair')}
        <div class="stats-grid">${data.stats.map((item) => `<article class="card stat-card"><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></article>`).join('')}</div>
      </section>`}

      <section class="section">
        <article class="card card-pad">
          <div class="page-kicker">V0.1 Preview</div>
          <h2 style="margin:7px 0 8px;letter-spacing:-.04em">Help shape the app</h2>
          <p class="page-subtitle" style="margin:0 0 16px">This first release is designed to test the fair selector, personal schedule, community directory, map, offline experience, and partner-demo mode.</p>
          <button class="btn btn-ghost btn-block" data-action="share-app">Share the preview</button>
        </article>
      </section>`;
  }

  function fairsPage() {
    const fairs = state.demo ? [data.demoFair, ...data.fairs] : data.fairs;
    return `
      <header class="page-head"><div class="page-kicker">California fair communities</div><h1 class="page-title">Find your fair</h1><p class="page-subtitle">Choose a location to save it as your home fair. Confirmed 2027 dates and schedules can be added without redesigning the app.</p></header>
      <div class="grid section">
        ${fairs.map((fair) => `<article class="card fair-list-card" data-fair="${fair.id}" tabindex="0" role="button">
          <div class="fair-list-top"><div class="fair-list-icon">${fair.emoji}</div><div class="fair-list-copy"><h3>${esc(fair.name)}</h3><p>${esc(fair.description)}</p></div><span class="chevron">›</span></div>
          <div class="fair-list-meta"><span class="meta-chip">${esc(fair.dateLabel)}</span><span class="meta-chip">📍 ${esc(fair.city)}</span>${state.selectedFair === fair.id ? '<span class="meta-chip">✓ Your fair</span>' : ''}</div>
        </article>`).join('')}
      </div>`;
  }

  function fairDetailPage(id) {
    const fair = findFair(id) || currentFair();
    const isDemo = fair.id === data.demoFair.id;
    return `
      <article class="card detail-hero ${fair.accent}">
        <div class="detail-emoji">${fair.emoji}</div>${statusPill(fair)}
        <h1>${esc(fair.name)}</h1><p>${esc(fair.description)}</p>
        <div class="detail-actions">
          <button class="btn btn-primary btn-small" data-action="select-fair" data-id="${fair.id}">${state.selectedFair === fair.id ? '✓ Selected fair' : 'Make this my fair'}</button>
          <a class="btn btn-secondary btn-small" href="${fair.mapUrl}" target="_blank" rel="noopener">Directions</a>
        </div>
      </article>

      <section class="section">
        <div class="card info-list">
          <div class="info-row"><div class="info-row-icon">📅</div><div><strong>${esc(fair.dateLabel)}</strong><span>${esc(fair.timeLabel)}</span></div></div>
          <div class="info-row"><div class="info-row-icon">📍</div><div><strong>${esc(fair.stage)}</strong><span>${esc(fair.address)}</span></div></div>
          <div class="info-row"><div class="info-row-icon">🎟️</div><div><strong>Admission</strong><span>${esc(fair.admission)}</span></div></div>
        </div>
      </section>

      <section class="section">${sectionHead('What to expect')}<div class="card card-pad"><div class="feature-cloud">${fair.features.map((item) => `<span class="feature-chip">${esc(item)}</span>`).join('')}</div></div></section>

      <section class="section">${sectionHead(isDemo ? 'Sample fair-day tools' : '2027 updates', isDemo ? 'Every item below is interactive' : 'The app is ready when the details are')}
        ${isDemo ? `<div class="grid grid-2"><button class="btn btn-accent" data-nav="schedule">Live schedule</button><button class="btn btn-ghost" data-nav="map">Interactive map</button><button class="btn btn-ghost" data-nav="community">Community row</button><button class="btn btn-ghost" data-nav="passport">OATF Passport</button></div>` : `<article class="card empty-state"><span class="empty-icon">✨</span><h2>Details coming soon</h2><p>Once a 2027 date, stage, ticket link, and schedule are confirmed, this page updates from one content file.</p><button class="btn btn-accent" data-nav="notifications">Choose alert preferences</button></article>`}
      </section>

      <section class="section">${sectionHead('Accessibility')}<div class="card card-pad"><div class="feature-cloud">${fair.accessibility.map((item) => `<span class="feature-chip">♿ ${esc(item)}</span>`).join('')}</div><button class="btn btn-ghost btn-block" style="margin-top:14px" data-nav="accessibility">View accessibility guide</button></div></section>

      <section class="section"><article class="card card-pad"><div class="page-kicker">Part of the story</div><h2 style="margin:7px 0 8px">${esc(fair.region)}</h2><p class="page-subtitle" style="margin:0">${esc(fair.history)}</p></article></section>`;
  }

  function schedulePage() {
    const items = schedule();
    if (!state.demo) {
      return `<header class="page-head"><div class="page-kicker">Entertainment</div><h1 class="page-title">Schedule</h1><p class="page-subtitle">Your 2027 lineup will live here with favorites, personal reminders, and automatic “Happening Now” updates.</p></header>
        <section class="section"><article class="card empty-state"><span class="empty-icon">🗓️</span><h2>2027 schedule coming soon</h2><p>Turn on partner demo mode to test the complete live schedule and My OATF experience right now.</p><button class="btn btn-accent" data-action="toggle-demo">Try demo fair day</button></article></section>`;
    }
    const categories = ['All', ...new Set(items.map((item) => item.category))];
    return `<header class="page-head"><div class="page-kicker">LA County Fair · Demo</div><h1 class="page-title">Live schedule</h1><p class="page-subtitle">Save any event to build your personal OATF day. All times and programming below are sample content.</p></header>
      <div class="filter-row" aria-label="Schedule filters">${categories.map((cat, i) => `<button class="filter-chip ${i === 0 ? 'active' : ''}" data-filter-schedule="${esc(cat)}">${esc(cat)}</button>`).join('')}</div>
      <section class="section" style="margin-top:12px"><div class="card schedule-list">${items.map(scheduleItem).join('')}</div></section>
      <section class="section"><button class="btn btn-ghost btn-block" data-action="download-day-calendar">Add the demo day to calendar</button></section>`;
  }

  function scheduleItem(item) {
    const p = performer(item.performerId);
    const label = item.status === 'live' ? 'Happening now' : item.status === 'upnext' ? 'Up next' : item.category;
    return `<article class="schedule-item ${item.status}" data-category="${esc(item.category)}">
      <div class="schedule-time"><strong>${esc(item.time)}</strong><span>${esc(item.end)}</span></div>
      <div class="schedule-copy" data-performer="${item.performerId}"><h3>${p?.icon || '🎤'} ${esc(item.title)}</h3><p>${esc(item.description)}</p><span class="schedule-label">${esc(label)} · ${esc(item.location)}</span></div>
      <button class="favorite-button ${isSaved(item.id) ? 'saved' : ''}" data-action="favorite" data-id="${item.id}" aria-label="${isSaved(item.id) ? 'Remove from' : 'Add to'} My OATF">${isSaved(item.id) ? '♥' : '♡'}</button>
    </article>`;
  }

  function myPage() {
    const saved = schedule().filter((item) => isSaved(item.id));
    const savedCommunity = data.partners.filter((item) => isPartnerSaved(item.id));
    if (!saved.length && !savedCommunity.length) {
      return `<header class="page-head"><div class="page-kicker">Your day</div><h1 class="page-title">My OATF</h1><p class="page-subtitle">Favorite performances and community organizations to create a personal guide that stays on this device.</p></header>
        <section class="section"><article class="card empty-state"><span class="empty-icon">💖</span><h2>Your day starts here</h2><p>${state.demo ? 'Tap the heart beside any demo performance or community partner and it will appear here.' : 'When 2027 schedules arrive, save the performances and community partners you do not want to miss.'}</p><button class="btn btn-accent" data-nav="${state.demo ? 'schedule' : 'fairs'}">${state.demo ? 'Explore the schedule' : 'Choose your fair'}</button></article></section>`;
    }
    return `<header class="page-head"><div class="page-kicker">Your day</div><h1 class="page-title">My OATF</h1><p class="page-subtitle">Everything you saved, in one simple fair-day plan.</p></header>
      ${saved.length ? `<section class="section">${sectionHead('My schedule', `${saved.length} saved event${saved.length === 1 ? '' : 's'}`)}<div class="card">${saved.map(scheduleItem).join('')}</div></section>` : ''}
      ${savedCommunity.length ? `<section class="section">${sectionHead('Saved community', `${savedCommunity.length} organization${savedCommunity.length === 1 ? '' : 's'}`)}<div class="grid">${savedCommunity.map(partnerCard).join('')}</div></section>` : ''}
      <section class="section"><button class="btn btn-ghost btn-block" data-action="download-my-calendar" ${saved.length ? '' : 'disabled'}>Add my schedule to calendar</button></section>`;
  }

  function performersPage() {
    return `<header class="page-head"><div class="page-kicker">Meet the lineup</div><h1 class="page-title">Performers</h1><p class="page-subtitle">V0.1 includes reusable artist profiles. The 2027 lineup can be swapped in through the content file.</p></header>
      <div class="search-bar"><span>⌕</span><input type="search" placeholder="Search performers" data-search="performers" aria-label="Search performers"></div>
      <section class="section"><div class="grid" id="performer-list">${data.performers.map(personCard).join('')}</div></section>`;
  }

  function personCard(p) {
    return `<article class="card person-card" data-person="${p.id}" tabindex="0" role="button"><div class="person-icon">${p.icon}</div><div><h3>${esc(p.name)}</h3><p>${esc(p.type)} · ${esc(p.bio)}</p></div><span class="chevron">›</span></article>`;
  }

  function performerDetailPage(id) {
    const p = performer(id) || data.performers[0];
    const appearances = data.demoSchedule.filter((item) => item.performerId === p.id);
    return `<article class="card detail-hero sunset"><div class="detail-emoji">${p.icon}</div><span class="status coming">${esc(p.type)}</span><h1>${esc(p.name)}</h1><p>${esc(p.bio)}</p></article>
      ${appearances.length ? `<section class="section">${sectionHead('Demo appearances')}<div class="card">${appearances.map(scheduleItem).join('')}</div></section>` : ''}
      <section class="section"><article class="card card-pad"><h2 style="margin:0 0 8px">Artist profile system</h2><p class="page-subtitle" style="margin:0">V0.1 is ready for an official photo, full bio, social links, streaming links, schedule appearances, and “Add to My OATF.”</p></article></section>`;
  }

  function communityPage() {
    const cats = ['All', ...new Set(data.partners.map((p) => p.category))];
    return `<header class="page-head"><div class="page-kicker">Connection beyond the stage</div><h1 class="page-title">Community</h1><p class="page-subtitle">Discover organizations, services, and affirming resources throughout the fair.</p></header>
      <div class="search-bar"><span>⌕</span><input type="search" placeholder="Search organizations or services" data-search="partners" aria-label="Search community"></div>
      <div class="filter-row">${cats.map((cat, i) => `<button class="filter-chip ${i === 0 ? 'active' : ''}" data-filter-partner="${esc(cat)}">${esc(cat)}</button>`).join('')}</div>
      <section class="section" style="margin-top:12px"><div class="grid" id="partner-list">${data.partners.map(partnerCard).join('')}</div></section>`;
  }

  function partnerCard(p) {
    return `<article class="card partner-card" data-partner="${p.id}" data-category="${esc(p.category)}" tabindex="0" role="button"><div class="partner-icon">${p.icon}</div><div><h3>${esc(p.name)}</h3><p>${esc(p.category)} · Booth ${esc(p.booth)}<br>${esc(p.description)}</p></div><button class="favorite-button ${isPartnerSaved(p.id) ? 'saved' : ''}" data-action="favorite-partner" data-id="${p.id}" aria-label="Save ${esc(p.name)}">${isPartnerSaved(p.id) ? '♥' : '♡'}</button></article>`;
  }

  function partnerDetailPage(id) {
    const p = partner(id) || data.partners[0];
    return `<article class="card detail-hero ocean"><div class="detail-emoji">${p.icon}</div><span class="status coming">${esc(p.category)}</span><h1>${esc(p.name)}</h1><p>${esc(p.description)}</p><div class="detail-actions"><button class="btn btn-primary btn-small" data-action="favorite-partner" data-id="${p.id}">${isPartnerSaved(p.id) ? '♥ Saved' : '♡ Save organization'}</button><button class="btn btn-secondary btn-small" data-nav="map">Find booth ${esc(p.booth)}</button></div></article>
      <section class="section">${sectionHead('Services')}<div class="card card-pad"><div class="feature-cloud">${p.services.map((item) => `<span class="feature-chip">${esc(item)}</span>`).join('')}</div></div></section>
      <section class="section"><article class="card card-pad"><h2 style="margin:0 0 8px">Booth ${esc(p.booth)}</h2><p class="page-subtitle" style="margin:0">Partner contact links, official logo, operating hours, downloadable resources, and fair-specific booth placement can be connected in the next content update.</p></article></section>`;
  }

  function mapPage() {
    const pin = data.mapPins.find((p) => p.id === mapSelected) || data.mapPins[0];
    return `<header class="page-head"><div class="page-kicker">Fair-day navigation</div><h1 class="page-title">OATF Map</h1><p class="page-subtitle">A stylized interactive proof of concept. Official fair maps and exact coordinates will replace this demo layout.</p></header>
      <div class="filter-row">${['All', 'Entertainment', 'Community', 'Accessibility', 'Services', 'Food'].map((cat, i) => `<button class="filter-chip ${i === 0 ? 'active' : ''}" data-filter-map="${cat}">${cat}</button>`).join('')}</div>
      <section class="section" style="margin-top:12px"><div class="card map-shell"><div class="map-path one"></div><div class="map-path two"></div><div class="map-lawn"></div><div class="map-arena"></div>
        ${data.mapPins.map((p) => `<button class="map-pin ${mapSelected === p.id ? 'active' : ''}" style="left:${p.x}%;top:${p.y}%" data-map-pin="${p.id}" data-type="${p.type}" aria-label="${esc(p.label)}"><span class="map-pin-bubble"><span>${p.icon}</span></span><span class="map-label">${esc(p.label)}</span></button>`).join('')}
        <article class="card map-detail"><h3>${pin.icon} ${esc(pin.label)}</h3><p>${esc(pin.detail)}</p></article>
      </div></section>
      <section class="section"><div class="grid grid-2"><a class="btn btn-ghost" href="${currentFair().mapUrl}" target="_blank" rel="noopener">Open Apple Maps</a><button class="btn btn-ghost" data-nav="accessibility">Accessibility guide</button></div></section>`;
  }

  function passportPreview() {
    const count = state.passport.length;
    return `${sectionHead('OATF Passport', `${count} of 5 demo stamps collected`, '<button class="text-link" data-nav="passport">Open passport</button>')}
      <article class="card passport-card"><div class="passport-stamps">${['stage','community','story','photo','glam'].map((id, i) => `<div class="stamp ${state.passport.includes(id) ? 'filled' : ''}">${state.passport.includes(id) ? ['🎤','🌈','📚','📸','👑'][i] : '○'}</div>`).join('')}</div><div class="progress"><span style="width:${count * 20}%"></span></div></article>`;
  }

  function passportPage() {
    const tasks = [
      ['stage', '🎤', 'Visit the OATF stage', 'Automatically stamped in this demo'],
      ['community', '🌈', 'Explore Community Row', 'Tap to simulate a QR booth scan'],
      ['story', '📚', 'Attend OATF Story Time', 'Tap to add the demo stamp'],
      ['photo', '📸', 'Take an OATF photo', 'Camera frames are planned for V0.2'],
      ['glam', '👑', 'Catch the Glam Show', 'Tap to complete the finale stamp']
    ];
    return `<header class="page-head"><div class="page-kicker">Explore. Connect. Celebrate.</div><h1 class="page-title">OATF Passport</h1><p class="page-subtitle">The V0.1 passport demonstrates local progress and future QR check-ins without requiring accounts or a backend.</p></header>
      <section class="section">${passportPreview()}</section>
      <section class="section"><div class="grid">${tasks.map(([id, icon, title, text]) => `<article class="card card-pad"><div class="toggle-row"><div class="toggle-copy"><strong>${icon} ${esc(title)}</strong><span>${esc(text)}</span></div><button class="switch ${state.passport.includes(id) ? 'on' : ''}" data-action="passport-stamp" data-id="${id}" aria-label="Toggle passport stamp"></button></div></article>`).join('')}</div></section>
      ${state.passport.length >= 5 ? '<section class="section"><article class="card now-card center"><div class="now-time">Passport complete</div><h3>You found the whole fair! 🎉</h3><p>Future versions can unlock a giveaway entry, digital badge, sponsor offer, or physical prize claim screen.</p></article></section>' : ''}`;
  }

  function notificationsPage() {
    const alerts = state.demo ? [
      ['🎤', 'Story Time is happening now', 'Summer Daze is live at the Rainbow Stage.', 'Now'],
      ['🗓️', 'Nicole & Scotty in 15 minutes', 'Your saved performance is coming up next.', '2 min ago'],
      ['🌈', 'Community Passport challenge', 'Visit any three community booths to unlock a demo stamp.', '18 min ago']
    ] : [
      ['✨', 'Welcome to the new OATF app', 'Choose which 2027 updates you want to receive.', 'Today']
    ];
    return `<header class="page-head"><div class="page-kicker">Stay in the loop</div><h1 class="page-title">Notifications</h1><p class="page-subtitle">V0.1 saves your alert preferences. Real remote delivery will connect to OneSignal after the native app identifiers are ready.</p></header>
      <section class="section">${sectionHead('Preferences')}<div class="grid">${Object.entries({ schedule: ['🗓️','Schedule reminders','Saved events and “starting soon” alerts'], fair: ['🎡','Fair announcements','Dates, stages, tickets, and important changes'], giveaways: ['🎁','Giveaways','App-exclusive entries and winner alerts'], community: ['🌈','Community updates','Partners, resources, and fair-day opportunities'] }).map(([key, [icon,title,text]]) => `<article class="card card-pad"><div class="toggle-row"><div class="toggle-copy"><strong>${icon} ${title}</strong><span>${text}</span></div><button class="switch ${state.notifications[key] ? 'on' : ''}" data-action="notification-pref" data-id="${key}" aria-label="Toggle ${title}"></button></div></article>`).join('')}</div></section>
      <section class="section"><button class="btn btn-accent btn-block" data-action="request-notifications">Enable device notifications</button><p class="small-note center">Browser permission is requested where supported. Native push requires OneSignal configuration in a later build.</p></section>
      <section class="section">${sectionHead('Notification center')}<div class="grid">${alerts.map(([icon,title,text,time]) => `<article class="card alert-card"><div class="alert-icon">${icon}</div><div><h3>${esc(title)}</h3><p>${esc(text)}</p><time>${esc(time)}</time></div></article>`).join('')}</div></section>`;
  }

  function accessibilityPage() {
    const items = [
      ['♿','Mobility & routes','Fair-specific accessible entrances, paths, seating, and transportation details can live in one place.'],
      ['🫶','Quiet and lower-sensory spaces','Map pins help guests find a place to pause when the fair becomes overwhelming.'],
      ['👁️','Readable by design','High contrast, large tap targets, semantic structure, reduced-motion support, and screen-reader labels are built into V0.1.'],
      ['🦮','Service animals','Host-fair policies and relief locations can be linked directly once each fair provides them.'],
      ['🩹','First aid and guest services','One-tap map directions can make immediate assistance easier to locate.'],
      ['📝','Performance details','Future schedules can flag ASL interpretation, captions, lighting effects, volume, and sensory notes.']
    ];
    return `<header class="page-head"><div class="page-kicker">A fair for everyone</div><h1 class="page-title">Accessibility</h1><p class="page-subtitle">This guide is structured to combine OATF information with each host fair’s official accessibility resources.</p></header>
      <section class="section"><div class="grid">${items.map(([icon,title,text]) => `<article class="card card-pad"><h2 style="font-size:17px;margin:0 0 7px">${icon} ${esc(title)}</h2><p class="page-subtitle" style="margin:0">${esc(text)}</p></article>`).join('')}</div></section>
      <section class="section"><article class="card card-pad"><h2 style="margin:0 0 8px">Need help at the fair?</h2><p class="page-subtitle" style="margin:0 0 15px">In a live event, this button can call or message the correct fair guest-services team for the selected location.</p><button class="btn btn-ghost btn-block" data-action="demo-help">Contact guest services</button></article></section>`;
  }

  function storyPage() {
    return `<header class="page-head"><div class="page-kicker">A safe place inside the fair</div><h1 class="page-title">Our story</h1><p class="page-subtitle">Out at the Fair brings family-friendly LGBTQ+ visibility, entertainment, and community connection into the wider fairgrounds experience.</p></header>
      <section class="section"><article class="card card-pad"><div class="timeline">${data.story.map((item) => `<div class="timeline-item"><strong>${esc(item.year)}</strong><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div>`).join('')}</div></article></section>
      <section class="section"><article class="card now-card"><div class="now-time">The idea that still matters</div><h3>A place to return to.</h3><p>Guests can enjoy the entire fairgrounds while knowing there is a visible, affirming OATF space waiting whenever they need it.</p></article></section>`;
  }

  function partnersPage() {
    return `<header class="page-head"><div class="page-kicker">Bring OATF to your community</div><h1 class="page-title">Partner with us</h1><p class="page-subtitle">The app can become part of the full partnership package: event discovery, live schedules, partner visibility, community engagement, and measurable fair-day actions.</p></header>
      <section class="section"><div class="grid">
        ${[['🎡','Fair partners','Explore a proven, family-friendly LGBTQ+ inclusion model built inside the fair experience.'],['🌈','Community partners','Connect attendees with affirming services, nonprofits, programs, and local resources.'],['✨','Brand partners','Support fair-day moments, giveaways, digital recognition, and audience engagement.'],['🎤','Talent','Join future OATF stages as a singer, band, drag artist, dancer, storyteller, or host.']].map(([icon,title,text]) => `<article class="card card-pad"><h2 style="font-size:18px;margin:0 0 7px">${icon} ${esc(title)}</h2><p class="page-subtitle" style="margin:0 0 14px">${esc(text)}</p><a class="btn btn-ghost btn-small" href="mailto:${data.brand.email}?subject=${encodeURIComponent(title + ' inquiry')}" target="_blank">Start a conversation</a></article>`).join('')}
      </div></section>`;
  }

  function contactPage() {
    return `<header class="page-head"><div class="page-kicker">Talk to the team</div><h1 class="page-title">Contact</h1><p class="page-subtitle">Questions about a fair, partnership, media, accessibility, community participation, or talent?</p></header>
      <section class="section"><div class="card menu-list">
        <a class="menu-button" href="mailto:${data.brand.email}"><span class="menu-icon">✉️</span><span class="menu-copy"><strong>General inquiries</strong><span>${esc(data.brand.email)}</span></span><span class="chevron">›</span></a>
        <a class="menu-button" href="mailto:${data.brand.mediaEmail}"><span class="menu-icon">📰</span><span class="menu-copy"><strong>Media inquiries</strong><span>${esc(data.brand.mediaEmail)}</span></span><span class="chevron">›</span></a>
        <a class="menu-button" href="${data.brand.instagram}" target="_blank" rel="noopener"><span class="menu-icon">📱</span><span class="menu-copy"><strong>Instagram</strong><span>@outatthefair</span></span><span class="chevron">›</span></a>
        <a class="menu-button" href="${data.brand.website}" target="_blank" rel="noopener"><span class="menu-icon">🌐</span><span class="menu-copy"><strong>Official website</strong><span>OutAtTheFair.com</span></span><span class="chevron">›</span></a>
      </div></section>`;
  }

  function morePage() {
    const menu = [
      ['performers','🎤','Performers','Talent profiles and appearances'],
      ['community','🌈','Community','Organizations, services, and booth details'],
      ['map','🗺️','Fair map','Stage, community, accessibility, and services'],
      ['passport','🎟️','OATF Passport','Demo check-ins and fair-day challenges'],
      ['accessibility','♿','Accessibility','Plan an easier, more welcoming fair day'],
      ['story','✨','Our story','The community-building journey since 2011'],
      ['partners','🤝','Partner with us','Fairs, brands, community, and talent'],
      ['contact','✉️','Contact','Reach the OATF team']
    ];
    return `<header class="page-head"><div class="page-kicker">Explore OATF</div><h1 class="page-title">More</h1><p class="page-subtitle">Community resources, app settings, partner tools, and the complete OATF story.</p></header>
      <section class="section"><article class="card card-pad"><div class="toggle-row"><div class="toggle-copy"><strong>🧪 Partner demo mode</strong><span>Turn on the full LA County Fair sample schedule, live status, map, passport, and alerts.</span></div><button class="switch ${state.demo ? 'on' : ''}" data-action="toggle-demo" aria-label="Toggle partner demo mode"></button></div></article></section>
      <section class="section"><div class="card menu-list">${menu.map(([route,icon,title,text]) => `<button class="menu-button" data-nav="${route}"><span class="menu-icon">${icon}</span><span class="menu-copy"><strong>${esc(title)}</strong><span>${esc(text)}</span></span><span class="chevron">›</span></button>`).join('')}</div></section>
      <section class="section"><div class="card menu-list">
        <button class="menu-button" data-action="install-app"><span class="menu-icon">⬇️</span><span class="menu-copy"><strong>Install app</strong><span>Add the PWA to your device</span></span><span class="chevron">›</span></button>
        <button class="menu-button" data-action="share-app"><span class="menu-icon">↗️</span><span class="menu-copy"><strong>Share preview</strong><span>Send the current app link</span></span><span class="chevron">›</span></button>
        <button class="menu-button" data-action="reset-app"><span class="menu-icon">↻</span><span class="menu-copy"><strong>Reset demo data</strong><span>Clear favorites, stamps, and preferences</span></span><span class="chevron">›</span></button>
      </div></section>
      <p class="small-note center">Out at the Fair® App V${data.version}<br>Content updated ${data.updated}</p>`;
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
      case 'partners': content = partnersPage(); break;
      case 'contact': content = contactPage(); break;
      case 'more': content = morePage(); break;
      default: content = homePage();
    }
    shell(content);
  }

  function toggleDemo() {
    state.demo = !state.demo;
    state.selectedFair = state.demo ? data.demoFair.id : 'san-diego';
    if (!state.demo) state.favorites = [];
    saveState();
    showToast(state.demo ? 'Partner demo mode activated' : 'Demo mode turned off');
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
    state.passport = state.passport.includes(id) ? state.passport.filter((item) => item !== id) : [...state.passport, id];
    saveState();
    render();
    showToast(state.passport.includes(id) ? 'Passport stamped!' : 'Stamp removed');
  }

  function calendarText(items) {
    const date = '20270515';
    const fmtTime = (label) => {
      const [time, meridiem] = label.split(' ');
      let [h,m] = time.split(':').map(Number);
      if (meridiem === 'PM' && h !== 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;
      return `${String(h).padStart(2,'0')}${String(m).padStart(2,'0')}00`;
    };
    const events = items.map((item) => `BEGIN:VEVENT\nUID:${item.id}@outatthefair.com\nDTSTAMP:20260725T010000Z\nDTSTART:${date}T${fmtTime(item.time)}\nDTEND:${date}T${fmtTime(item.end)}\nSUMMARY:${item.title.replaceAll(',', '\\,')} — OATF Demo\nLOCATION:${item.location.replaceAll(',', '\\,')}\nDESCRIPTION:${item.description.replaceAll(',', '\\,')} Sample event only.\nEND:VEVENT`).join('\n');
    return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//OutAt Inc.//OATF App V0.1//EN\nCALSCALE:GREGORIAN\n${events}\nEND:VCALENDAR`;
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

  async function shareApp() {
    const payload = { title: 'Out at the Fair® App', text: 'Preview the new OATF fair-day app.', url: location.href.split('#')[0] };
    try {
      if (navigator.share) await navigator.share(payload);
      else {
        await navigator.clipboard.writeText(payload.url);
        showToast('App link copied');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('Could not share the link');
    }
  }

  async function installApp() {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      return;
    }
    showModal('Install Out at the Fair®', 'On iPhone, tap the Share button in Safari and choose “Add to Home Screen.” On Android or desktop Chrome, use the browser install option.', 'Got it');
  }

  function showModal(title, message, primary = 'Close') {
    document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" onclick="event.stopPropagation()"><div class="modal-handle"></div><h2>${esc(title)}</h2><p>${esc(message)}</p><div class="modal-actions"><button class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-accent" data-action="close-modal">${esc(primary)}</button></div></div></div>`);
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
    if (personEl) return navigate(`performer/${personEl.dataset.person}`);

    const performerEl = event.target.closest('[data-performer]');
    if (performerEl && !event.target.closest('button')) return navigate(`performer/${performerEl.dataset.performer}`);

    const partnerEl = event.target.closest('[data-partner]');
    if (partnerEl && !event.target.closest('button')) return navigate(`partner/${partnerEl.dataset.partner}`);

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
      case 'request-notifications': requestNotifications(); break;
      case 'download-day-calendar': downloadCalendar(schedule(), 'oatf-demo-day.ics'); break;
      case 'download-my-calendar': downloadCalendar(schedule().filter((item) => isSaved(item.id)), 'my-oatf-schedule.ics'); break;
      case 'share-app': shareApp(); break;
      case 'install-app': installApp(); break;
      case 'demo-help': showModal('Guest services demo', 'A live fair build would route this button to the selected fair’s official guest-services phone, text, or help desk.', 'Understood'); break;
      case 'reset-app': try { localStorage.removeItem(STORAGE_KEY); } catch {} Object.assign(state, JSON.parse(JSON.stringify(defaultState))); saveState(); showToast('Demo data reset'); navigate('home'); break;
      case 'close-modal': document.querySelector('.modal-backdrop')?.remove(); break;
    }
  });

  app.addEventListener('input', (event) => {
    const type = event.target.dataset.search;
    if (!type) return;
    const query = event.target.value.toLowerCase().trim();
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
