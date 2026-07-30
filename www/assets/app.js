(() => {
  'use strict';

  const data = window.OATF_DATA;
  const app = document.getElementById('app');
  const STORAGE_KEY = 'oatf-v0.7-state';
  const PREVIOUS_KEY = 'oatf-v0.6-state';
  const LEGACY_KEYS = ['oatf-v0.5-state','oatf-v0.4-state', 'oatf-v0.3-state', 'oatf-v0.2-state', 'oatf-v0.1-state'];
  let installPrompt = null;
  let toastTimer = null;
  let mapSelected = 'stage';
  let showcaseTourStep = 0;
  let tiltBound = false;
  let momentImageData = '';
  let momentFrame = 'belong';

  const plannerTasks = [
    ['tickets', 'Tickets ready', 'Save or confirm admission before you leave.'],
    ['parking', 'Parking planned', 'Know your lot, rideshare point or transit route.'],
    ['schedule', 'Schedule saved', 'Favorite the performances you do not want to miss.'],
    ['essentials', 'Fair essentials packed', 'Water, sunscreen, charger and anything your group needs.'],
    ['meetup', 'Meet-up plan set', 'Choose one easy place to reconnect if your group separates.']
  ];

  const tourSteps = [
    { icon: '✦', kicker: '01 · ENTER FAIR MODE', title: 'The app becomes the event.', text: 'A single tap transforms OATF from a year-round guide into a live fair-day command center.' },
    { icon: '◷', kicker: '02 · KNOW WHAT IS NEXT', title: 'No hunting through posts.', text: 'Happening Now, Up Next and your saved schedule stay together in one clear timeline.' },
    { icon: '◉', kicker: '03 · ASK OATF', title: 'An offline fair concierge.', text: 'Guests can ask about schedules, restrooms, accessibility, food, community booths and their group plan.' },
    { icon: '3', kicker: '04 · STAY TOGETHER', title: 'Your fair crew in one place.', text: 'Together Mode keeps William, Caleb and Daniel connected to the same meetup point and live plan.' },
    { icon: '📸', kicker: '05 · MAKE THE MEMORY', title: 'A branded OATF photo moment.', text: 'Take a photo, choose a frame and create a shareable fair-day keepsake right inside the app.' },
    { icon: '🌈', kicker: '06 · COMPLETE THE EXPERIENCE', title: 'The website tells the story. The app guides the day.', text: 'Before, during and after the fair become one connected OATF product.' }
  ];

  const defaultState = {
    demo: false,
    selectedFair: 'san-diego',
    favorites: [],
    savedPartners: [],
    notifications: { schedule: true, fair: true, giveaways: false, community: false },
    passport: ['stage'],
    planner: { completed: [], meetup: '', notes: '' },
    prefs: { largeType: false, highContrast: false, reducedMotion: false },
    showcaseName: 'William',
    showcaseSeen: false,
    group: {
      code: 'OATF-3D1L',
      members: [
        { id: 'william', name: 'William', initials: 'W', status: 0, checkedIn: true },
        { id: 'caleb', name: 'Caleb', initials: 'C', status: 1, checkedIn: false },
        { id: 'daniel', name: 'Daniel', initials: 'D', status: 2, checkedIn: false }
      ]
    },
    concierge: { history: [{ role: 'bot', text: 'Hey! I’m your offline OATF concierge. Ask me what is happening, where to go or what your crew should do next.' }] },
    pulse: { reactions: { heart: 0, sparkle: 0, fire: 0 }, reacted: [] },
    capsuleSealed: false,
    offers: { saved: [], redeemed: [] },
    fairModeEnteredAt: null,
    selectedStage: 'All'
  };

  const state = loadState();
  applyPrefs();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(PREVIOUS_KEY) || LEGACY_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) || '{}';
      const parsed = JSON.parse(saved);
      return {
        ...defaultState,
        ...parsed,
        notifications: { ...defaultState.notifications, ...(parsed.notifications || {}) },
        planner: { ...defaultState.planner, ...(parsed.planner || {}), completed: [...(parsed.planner?.completed || [])] },
        prefs: { ...defaultState.prefs, ...(parsed.prefs || {}) },
        group: { ...defaultState.group, ...(parsed.group || {}), members: parsed.group?.members?.length ? parsed.group.members : defaultState.group.members },
        concierge: { ...defaultState.concierge, ...(parsed.concierge || {}), history: parsed.concierge?.history?.length ? parsed.concierge.history : defaultState.concierge.history },
        pulse: { ...defaultState.pulse, ...(parsed.pulse || {}), reactions: { ...defaultState.pulse.reactions, ...(parsed.pulse?.reactions || {}) }, reacted: [...(parsed.pulse?.reacted || [])] },
        offers: { ...defaultState.offers, ...(parsed.offers || {}), saved: [...(parsed.offers?.saved || [])], redeemed: [...(parsed.offers?.redeemed || [])] }
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


  function capacitorPlugin(name) {
    return window.Capacitor?.Plugins?.[name] || null;
  }

  function haptic(style = 'LIGHT') {
    const Haptics = capacitorPlugin('Haptics');
    if (!Haptics?.impact) return;
    Promise.resolve(Haptics.impact({ style })).catch(() => {});
  }

  function successHaptic() {
    const Haptics = capacitorPlugin('Haptics');
    if (!Haptics?.notification) return haptic('MEDIUM');
    Promise.resolve(Haptics.notification({ type: 'SUCCESS' })).catch(() => {});
  }


  function playCinematic(force = false) {
    try {
      if (!force && sessionStorage.getItem('oatf-v07-cinematic')) return;
      sessionStorage.setItem('oatf-v07-cinematic', '1');
    } catch {}
    document.querySelector('.cinematic-launch')?.remove();
    document.body.insertAdjacentHTML('beforeend', `
      <div class="cinematic-launch" role="presentation">
        <div class="cinematic-signal"></div>
        <div class="cinematic-mark">O</div>
        <p>OUT AT THE FAIR®</p>
        <h1>ALL BELONG<br><em>AT THE FAIR.</em></h1>
        <small>V0.7 · FAIR COMPANION</small>
      </div>`);
    setTimeout(() => haptic('MEDIUM'), 680);
    setTimeout(() => document.querySelector('.cinematic-launch')?.classList.add('leave'), 2350);
    setTimeout(() => document.querySelector('.cinematic-launch')?.remove(), 3000);
  }

  function initializeShowcaseDefaults() {
    state.demo = true;
    state.fairModeEnteredAt = Date.now();
    state.selectedFair = data.demoFair.id;
    state.showcaseSeen = true;
    state.favorites = [...new Set([...state.favorites, 'story-1', 'ross', 'glam'])];
    state.planner.completed = [...new Set([...state.planner.completed, 'tickets', 'parking', 'schedule', 'meetup'])];
    if (!state.planner.meetup) state.planner.meetup = 'OATF Info Booth · 3:00 PM';
    if (!state.planner.notes) state.planner.notes = 'Caleb has the tickets. Daniel has the portable charger. Meet at the OATF stage before the Glam Show.';
    state.group.members = state.group.members.map((member, index) => ({ ...member, checkedIn: index === 0 ? true : member.checkedIn }));
    saveState();
  }

  function celebratePassport() {
    document.querySelector('.celebration-layer')?.remove();
    const pieces = Array.from({ length: 72 }, (_, index) => `<i style="--x:${(index * 37) % 100};--d:${(index % 9) * .08}s;--r:${(index * 47) % 360}deg;--c:${index % 6}"></i>`).join('');
    document.body.insertAdjacentHTML('beforeend', `<div class="celebration-layer" aria-live="polite"><div class="celebration-copy"><span>✓</span><small>PASSPORT COMPLETE</small><strong>You completed<br>Out at the Fair!</strong><button class="btn btn-primary" data-action="close-celebration">Keep exploring</button></div>${pieces}</div>`);
    successHaptic();
    setTimeout(() => document.querySelector('.celebration-layer')?.classList.add('settle'), 1800);
  }

  async function scheduleDemoNotification() {
    const title = '🌈 Glam Show begins in 15 minutes!';
    const body = 'Head to the Rainbow Stage. Showcase demo only.';
    const LocalNotifications = capacitorPlugin('LocalNotifications');
    if (LocalNotifications?.requestPermissions && LocalNotifications?.schedule) {
      try {
        const permission = await LocalNotifications.requestPermissions();
        if (!['granted', 'prompt-with-rationale'].includes(permission.display)) return showToast('Notification permission was not enabled');
        await LocalNotifications.schedule({ notifications: [{ id: 505, title, body, schedule: { at: new Date(Date.now() + 10000) }, extra: { route: 'schedule' } }] });
        showToast('Demo alert scheduled for 10 seconds from now');
        successHaptic();
        return;
      } catch (error) {
        console.warn('Native local notification unavailable', error);
      }
    }
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return showToast('Notification permission was not enabled');
      showToast('Demo alert scheduled for 10 seconds from now');
      setTimeout(() => new Notification(title, { body, icon: 'icons/icon-192.png' }), 10000);
      return;
    }
    showToast('Use the native app to test the local fair-day alert');
  }

  async function enablePassTilt() {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') return showToast('Motion permission was not enabled');
      }
      bindPassTilt();
      showToast('Tilt effect enabled');
    } catch {
      showToast('Tilt is not available on this device');
    }
  }

  function bindPassTilt() {
    if (tiltBound) return;
    tiltBound = true;
    window.addEventListener('deviceorientation', (event) => {
      const card = document.querySelector('.oatf-pass');
      if (!card) return;
      const x = Math.max(-10, Math.min(10, (event.gamma || 0) / 4));
      const y = Math.max(-8, Math.min(8, (event.beta || 0) / 8));
      card.style.setProperty('--pass-rx', `${-y}deg`);
      card.style.setProperty('--pass-ry', `${x}deg`);
      card.style.setProperty('--shine-x', `${50 + x * 3}%`);
      card.style.setProperty('--shine-y', `${50 + y * 3}%`);
    }, true);
  }

  function renderTour() {
    const step = tourSteps[showcaseTourStep];
    document.querySelector('.tour-backdrop')?.remove();
    document.body.insertAdjacentHTML('beforeend', `<div class="tour-backdrop" role="dialog" aria-modal="true" aria-label="OATF showcase tour"><article class="tour-card"><button class="tour-close" data-action="close-tour" aria-label="Close tour">×</button><div class="tour-progress">${tourSteps.map((_, index) => `<i class="${index <= showcaseTourStep ? 'active' : ''}"></i>`).join('')}</div><div class="tour-icon">${step.icon}</div><small>${step.kicker}</small><h2>${step.title}</h2><p>${step.text}</p><div class="tour-actions"><button class="btn btn-secondary" data-action="tour-prev" ${showcaseTourStep === 0 ? 'disabled' : ''}>Back</button><button class="btn btn-primary" data-action="${showcaseTourStep === tourSteps.length - 1 ? 'tour-finish' : 'tour-next'}">${showcaseTourStep === tourSteps.length - 1 ? 'See the vision' : 'Next'}</button></div></article></div>`);
  }

  function startShowcaseTour() {
    initializeShowcaseDefaults();
    showcaseTourStep = 0;
    renderTour();
  }

  async function refreshAppContent() {
    showToast('Checking for the latest OATF content…');
    try {
      const registration = await navigator.serviceWorker?.getRegistration?.();
      await registration?.update?.();
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith('oatf-')).map((key) => caches.delete(key)));
      }
    } catch {}
    setTimeout(() => location.reload(), 450);
  }

  function initNativePolish() {
    if (!window.Capacitor?.isNativePlatform?.()) return;
    document.documentElement.classList.add('native-app');

    const StatusBar = capacitorPlugin('StatusBar');
    StatusBar?.setStyle?.({ style: 'LIGHT' }).catch?.(() => {});
    StatusBar?.setBackgroundColor?.({ color: '#09060f' }).catch?.(() => {});

    const AppPlugin = capacitorPlugin('App');
    AppPlugin?.addListener?.('backButton', () => {
      if ((location.hash || '#home') !== '#home') history.back();
      else AppPlugin.minimizeApp?.();
    }).catch?.(() => {});

    const LocalNotifications = capacitorPlugin('LocalNotifications');
    LocalNotifications?.addListener?.('localNotificationActionPerformed', () => navigate('schedule')).catch?.(() => {});
    LocalNotifications?.addListener?.('localNotificationReceived', () => haptic('MEDIUM')).catch?.(() => {});
  }

  function topbar() {
    return `
      <header class="topbar">
        <div class="topbar-rainbow" aria-hidden="true"></div>
        <div class="topbar-row">
          <button class="brand-button" data-nav="home" aria-label="Go home">
            <span class="brand-lockup">
              <span class="mini-mark" aria-hidden="true">O</span>
              <span class="brand-copy"><strong>Out at the Fair®</strong><span>${state.demo ? 'Showcase Fair Mode is live' : 'All belong at the fair'}</span></span>
            </span>
          </button>
          <div class="topbar-actions">
            <button class="icon-button concierge-button" data-nav="concierge" aria-label="Ask OATF">✦</button>
            <button class="icon-button" data-nav="search" aria-label="Search the app">⌕</button>
            <button class="icon-button" data-nav="notifications" aria-label="Notifications">🔔</button>
          </div>
        </div>
      </header>`;
  }

  function banners() {
    return `
      ${!navigator.onLine ? '<div class="offline-banner">Offline mode: your saved guide is still available.</div>' : ''}
      ${state.demo ? '<div class="demo-banner"><strong>SHOWCASE DEMO:</strong> Sample fair-day content is a product preview, not an announced event.</div>' : ''}`;
  }

  function bottomNav(route) {
    const items = [
      ['home', '⌂', 'Home'],
      ['fairs', '🎡', 'Fairs'],
      ['schedule', '◷', 'Schedule'],
      ['my', '♥', 'My OATF'],
      ['more', '☰', 'More']
    ];
    const secondary = ['fair', 'performers', 'performer', 'community', 'partner', 'map', 'story', 'accessibility', 'notifications', 'participate', 'contact', 'passport', 'planner', 'search', 'showcase', 'pass', 'myday', 'liveactivity', 'vision', 'concierge', 'together', 'moments', 'pulse', 'capsule', 'offers'];
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

  function scheduleMinutes(label) {
    const [clock, meridiem] = String(label || '12:00 PM').split(' ');
    let [h, m] = clock.split(':').map(Number);
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    return h * 60 + (m || 0);
  }

  function liveScheduleSnapshot() {
    const items = schedule();
    if (!items.length) return { now: null, next: null, after: null, progress: 0 };
    const live = items.find((item) => item.status === 'live');
    const next = items.find((item) => item.status === 'upnext') || items.find((item) => item.status === 'future');
    const index = live ? items.findIndex((item) => item.id === live.id) : Math.max(0, items.findIndex((item) => item.id === next?.id));
    return { now: live || items[index], next: next || items[index + 1], after: items[index + 2], progress: Math.round(((index + .45) / items.length) * 100) };
  }

  function offerCard(offer, compact = false) {
    const saved = state.offers.saved.includes(offer.id);
    const redeemed = state.offers.redeemed.includes(offer.id);
    return `<article class="offer-card ${compact ? 'compact' : ''} ${redeemed ? 'redeemed' : ''}" style="--offer-color:${offer.color}">
      <div class="offer-icon">${offer.icon}</div><div class="offer-copy"><small>${esc(offer.label)}</small><h3>${esc(offer.title)}</h3><p>${esc(offer.partner)} · ${esc(offer.location)}</p>${compact ? '' : `<span>${esc(offer.details)}</span>`}</div>
      <div class="offer-actions"><button data-action="save-offer" data-id="${offer.id}" aria-label="Save offer">${saved ? '♥' : '♡'}</button><button data-action="redeem-offer" data-id="${offer.id}" ${redeemed ? 'disabled' : ''}>${redeemed ? 'Used' : 'Use'}</button></div>
    </article>`;
  }

  function homePage() {
    const live = state.demo;
    const fair = currentFair();
    const snap = liveScheduleSnapshot();
    const saved = schedule().filter((item) => isSaved(item.id));
    const crewIn = state.group.members.filter((member) => member.checkedIn).length;
    const passportPct = Math.round((state.passport.length / data.passportChallenges.length) * 100);
    const featuredOffer = data.offers?.[0];
    return `
      <section class="v07-dashboard-hero ${live ? 'is-live' : ''}">
        <div class="dashboard-orb"></div>
        <p class="hero-kicker"><span></span>${live ? 'FAIR MODE · LIVE DEMO' : 'YOUR OATF COMPANION'}</p>
        <div class="v07-welcome"><div><small>GOOD ${new Date().getHours() < 12 ? 'MORNING' : new Date().getHours() < 17 ? 'AFTERNOON' : 'EVENING'}</small><h1>${esc(state.showcaseName || 'Guest')}</h1></div><button class="profile-bubble" data-nav="my">${esc((state.showcaseName || 'G').slice(0,1))}</button></div>
        <article class="home-fair-card ${fair.accent}">
          <div><small>${live ? 'YOUR FAIR IS LIVE' : 'YOUR HOME FAIR'}</small><h2>${esc(fair.shortName || fair.name)}</h2><p>${esc(fair.city)} · ${esc(fair.dateLabel)}</p></div>
          <span>${fair.emoji}</span>
          <button class="btn btn-primary" data-action="${live ? 'open-fair-tools' : 'enter-showcase'}">${live ? 'Open Fair Mode' : 'Preview Fair Mode'} →</button>
        </article>
      </section>

      ${live ? `<section class="section fair-command-center">
        ${sectionHead('Happening now', 'Your day,<br><em>at a glance.</em>', 'The app automatically prioritizes what matters right now')}
        <article class="v07-now-card"><header><span><i></i> LIVE NOW</span><b>${esc(snap.now?.time || '—')}</b></header><h2>${esc(snap.now?.title || 'Fair Mode ready')}</h2><p>${esc(snap.now?.description || 'Your live fair-day dashboard is active.')}</p><div class="v07-progress"><i style="width:${snap.progress}%"></i></div><footer><span>${snap.now ? `📍 ${esc(snap.now.location)}` : 'Select a fair'}</span><button data-nav="schedule">Full schedule →</button></footer></article>
        <div class="v07-next-grid"><button data-nav="schedule"><small>UP NEXT</small><strong>${esc(snap.next?.title || 'Schedule coming soon')}</strong><span>${esc(snap.next?.time || '—')}</span></button><button data-nav="map"><small>QUICK FIND</small><strong>Restrooms + Quiet Space</strong><span>Open map →</span></button></div>
      </section>` : ''}

      <section class="section">
        ${sectionHead('Your day', live ? 'Everything you need,<br><em>one tap away.</em>' : 'Plan now.<br><em>Feel ready later.</em>')}
        <div class="v07-action-grid">
          <button data-nav="schedule"><span>◷</span><strong>Schedule</strong><small>${saved.length} saved</small></button>
          <button data-nav="myday"><span>✓</span><strong>My Day</strong><small>Your itinerary</small></button>
          <button data-nav="map"><span>⌖</span><strong>Fair Map</strong><small>Navigate fast</small></button>
          <button data-nav="together"><span>3</span><strong>Together</strong><small>${crewIn}/${state.group.members.length} checked in</small></button>
          <button data-nav="passport"><span>◎</span><strong>Passport</strong><small>${passportPct}% complete</small></button>
          <button data-nav="offers"><span>✦</span><strong>Offers</strong><small>${state.offers.saved.length} saved</small></button>
        </div>
      </section>

      ${live ? `<section class="section">
        ${sectionHead('My OATF', 'Your personal<br><em>fair-day signal.</em>', 'Saved moments, crew status and passport progress')}
        <div class="v07-personal-strip"><button data-nav="myday"><strong>${saved.length}</strong><span>Saved moments</span></button><button data-nav="together"><strong>${crewIn}/${state.group.members.length}</strong><span>Crew checked in</span></button><button data-nav="passport"><strong>${passportPct}%</strong><span>Passport</span></button></div>
        ${saved.length ? `<div class="v07-saved-preview">${saved.slice(0,2).map((item) => `<button data-nav="schedule"><small>${esc(item.time)}</small><strong>${esc(item.title)}</strong><span>${esc(item.location)}</span></button>`).join('')}</div>` : ''}
      </section>` : ''}

      ${featuredOffer ? `<section class="section">${sectionHead('Partner perk', 'A little extra<br><em>for your fair day.</em>', 'Local demo offers stay on this device', '<button class="text-action" data-nav="offers">View all →</button>')}${offerCard(featuredOffer, true)}</section>` : ''}

      <section class="section">
        ${sectionHead('The OATF network', 'One community.<br><em>More fairgrounds.</em>', 'Choose your home fair and the app adapts')}
        <div class="fair-rail">${(live ? [data.demoFair, ...data.fairs] : data.fairs).map((item) => fairCard(item)).join('')}</div>
      </section>

      <section class="section"><article class="version-card"><small>OATF APP · V${esc(data.version)}</small><h2>The website tells the story.<br><em>The app guides the day.</em></h2><p>V0.7 introduces a true guest dashboard, faster Fair Mode, upgraded schedule signals, expanded crew tools, collectible Passport progress and partner offers.</p><div class="button-row"><button class="btn btn-primary" data-action="enter-showcase">${live ? 'Reset Fair Mode demo' : 'Enter Fair Mode'}</button><button class="btn btn-secondary" data-action="share-app">Share preview</button></div></article></section>`;
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
      <article class="empty-state"><span>◷</span><h2>The stage is ready.</h2><p>The 2027 schedule will activate when the first fair is confirmed.</p><button class="btn btn-primary" data-action="enter-showcase">Enter Fair Mode</button></article>`;
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
      <section class="section">${plannerPreview(true)}</section>
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
      ${!state.demo ? '<div class="notice-card"><strong>Preview map</strong><p>This prototype uses sample locations. Activate demo mode to explore the full map experience.</p><button class="btn btn-primary" data-action="enter-showcase">Enter Fair Mode</button></div>' : ''}
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
      <div class="passport-grid">${data.passportChallenges.map((item) => `<button class="passport-stamp ${state.passport.includes(item.id) ? 'complete' : ''}" data-action="passport-stamp" data-id="${item.id}" ${!state.demo ? 'disabled' : ''}><span>${item.icon}</span><div><small>${state.passport.includes(item.id) ? 'STAMPED' : 'CHALLENGE'}</small><strong>${esc(item.title)}</strong><p>${esc(item.text)}</p></div><b>${state.passport.includes(item.id) ? '✓' : '+'}</b></button>`).join('')}</div>${state.demo && complete < total ? '<button class="btn btn-primary btn-block passport-complete-demo" data-action="complete-passport">Complete demo passport ✦</button>' : ''}`;
  }


  function plannerPreview(compact = false) {
    const complete = plannerTasks.filter(([id]) => state.planner.completed.includes(id)).length;
    const percent = Math.round((complete / plannerTasks.length) * 100);
    return `<article class="planner-preview ${compact ? 'compact' : ''}">
      <div><small>FAIR-DAY PLANNER</small><h3>${complete}/${plannerTasks.length} ready</h3><p>${state.planner.meetup ? `Meet-up: ${esc(state.planner.meetup)}` : 'Tickets, parking, essentials and one clear meet-up plan.'}</p></div>
      <div class="planner-preview-progress"><span style="width:${percent}%"></span></div>
      <button class="btn btn-secondary" data-nav="planner">Open planner →</button>
    </article>`;
  }

  function plannerPage() {
    const complete = plannerTasks.filter(([id]) => state.planner.completed.includes(id)).length;
    const percent = Math.round((complete / plannerTasks.length) * 100);
    return `${pageHead('Arrive ready', 'Plan your <em>fair day.</em>', 'A simple checklist, meet-up spot and group note saved only on this device—even when service is weak.')}
      <article class="planner-score"><small>YOUR READINESS</small><strong>${complete}/${plannerTasks.length}</strong><div class="progress-track"><span style="width:${percent}%"></span></div><p>${complete === plannerTasks.length ? 'Your fair-day basics are ready.' : 'Check off the practical details before you head to the fairgrounds.'}</p></article>
      <div class="planner-list">${plannerTasks.map(([id, title, text]) => `<button class="planner-task ${state.planner.completed.includes(id) ? 'complete' : ''}" data-action="planner-task" data-id="${id}"><b>${state.planner.completed.includes(id) ? '✓' : ''}</b><span><strong>${esc(title)}</strong><small>${esc(text)}</small></span></button>`).join('')}</div>
      <section class="section planner-fields">
        <label><span>GROUP MEET-UP SPOT</span><input type="text" data-planner-field="meetup" value="${esc(state.planner.meetup)}" placeholder="Example: OATF info booth at 3 PM" maxlength="120"></label>
        <label><span>FAIR-DAY NOTE</span><textarea data-planner-field="notes" placeholder="Accessibility needs, parking row, who has the tickets…" maxlength="500">${esc(state.planner.notes)}</textarea></label>
      </section>
      <div class="button-stack"><button class="btn btn-primary btn-block" data-action="share-plan">Share my plan</button><button class="btn btn-secondary btn-block" data-action="clear-plan">Clear planner</button></div>`;
  }

  function notificationsPage() {
    const prefs = [
      ['schedule', 'Schedule reminders', 'Get a reminder before saved performances begin.'],
      ['fair', 'Fair announcements', 'Dates, stages, time changes and important attendee updates.'],
      ['giveaways', 'Giveaways', 'App-only giveaways and winner notifications.'],
      ['community', 'Community moments', 'Spotlights and important partner resources.']
    ];
    return `${pageHead('Choose what matters', 'OATF <em>alerts.</em>', 'V0.6 stores your preferences and can schedule a real local showcase alert. Remote delivery can activate with OneSignal in a future production build.')}
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

  function showcasePage() {
    const now = data.demoSchedule.find((item) => item.status === 'live');
    const upNext = data.demoSchedule.find((item) => item.status === 'upnext');
    const saved = data.demoSchedule.filter((item) => isSaved(item.id));
    const passportPercent = Math.round((state.passport.length / data.passportChallenges.length) * 100);
    return `<section class="showcase-hero">
      <div class="showcase-hero-glow"></div>
      <p><i></i> SHOWCASE FAIR MODE · LIVE</p>
      <small>ORANGE COUNTY FAIR · SAMPLE EXPERIENCE</small>
      <h1>Today is<br><em>OATF day.</em></h1>
      <div class="showcase-clock"><strong>2:18</strong><span>PM</span></div>
      <div class="button-row"><button class="btn btn-primary" data-action="start-tour">Start 60-second tour</button><button class="btn btn-secondary" data-action="exit-showcase">Exit Fair Mode</button></div>
    </section>

    <section class="section">${sectionHead('Fair-day signal', 'Happening <em>right now.</em>', 'Everything important without leaving the fair')}
      <article class="showcase-now"><div class="showcase-now-live"><i></i> LIVE · ${esc(now.time)}–${esc(now.end)}</div><span class="showcase-stage">${esc(now.location)}</span><h2>${esc(now.title)}</h2><p>${esc(now.description)}</p><div class="showcase-next"><small>UP NEXT</small><strong>${esc(upNext.title)}</strong><span>${esc(upNext.time)}</span></div></article>
    </section>

    <section class="section">${sectionHead('Your command center', 'Carry the whole day<br><em>in one place.</em>')}
      <div class="showcase-tool-grid">
        <button data-nav="myday"><span>◷</span><small>MY DAY</small><strong>${saved.length} saved moments</strong><b>Open timeline →</b></button>
        <button data-nav="pass"><span>◈</span><small>OATF PASS</small><strong>${esc(state.showcaseName || 'Guest')}’s fair day</strong><b>Open pass →</b></button>
        <button data-nav="passport"><span>✓</span><small>PASSPORT</small><strong>${passportPercent}% complete</strong><b>Collect stamps →</b></button>
        <button data-action="schedule-demo-notification"><span>⌁</span><small>LIVE ALERT</small><strong>Test a real local notification</strong><b>Send in 10 seconds →</b></button>
      </div>
    </section>

    <section class="section">${sectionHead('Native future', 'See what guests<br><em>could feel.</em>', 'Interactive concepts grounded in a real fair-day use case')}
      <div class="native-preview-grid"><button data-nav="liveactivity"><span class="island-mini"><i></i> OATF · 12 min</span><strong>Dynamic Island + Lock Screen</strong><small>Preview the live event signal</small></button><button data-nav="vision"><span class="vision-mini">BEFORE · DURING · AFTER</span><strong>The complete OATF product vision</strong><small>Finish the showcase</small></button></div>
    </section>`;
  }

  function myDayPage() {
    const saved = data.demoSchedule.filter((item) => isSaved(item.id));
    const events = saved.length ? saved : data.demoSchedule.filter((item) => ['story-1', 'ross', 'glam'].includes(item.id));
    return `${pageHead('Your fair in motion', 'My <em>Day.</em>', 'Saved performances, practical plans and the place your group reconnects—organized as one fair-day timeline.')}
      <article class="myday-summary"><div><small>SHOWCASE SATURDAY</small><strong>${events.length}</strong><span>saved moments</span></div><div><small>MEET-UP</small><strong>3:00</strong><span>${esc(state.planner.meetup || 'OATF Info Booth')}</span></div></article>
      <div class="myday-timeline">${events.map((item, index) => `<article class="${item.status === 'live' ? 'live' : ''}"><time>${esc(item.time)}</time><i></i><div><small>${item.status === 'live' ? 'HAPPENING NOW' : esc(item.category)}</small><h3>${esc(item.title)}</h3><p>${esc(item.location)}</p>${index === events.length - 1 ? '<b>THE BIG FINALE</b>' : ''}</div></article>`).join('')}<article class="meetup"><time>3:00 PM</time><i></i><div><small>YOUR GROUP</small><h3>Meet Caleb & Daniel</h3><p>${esc(state.planner.meetup || 'OATF Info Booth')}</p></div></article></div>
      <section class="section">${plannerPreview(true)}</section>
      <div class="sticky-actions"><button class="btn btn-secondary" data-action="share-plan">Share My Day</button><button class="btn btn-primary" data-nav="pass">Open OATF Pass</button></div>`;
  }

  function demoQr() {
    const cells = [0,1,2,3,4,6,8,9,10,12,14,16,18,20,22,24,25,26,27,28,32,34,36,38,40,42,44,46,48,49,50,51,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,81,82,83,84,88,90,94,96,98,100,102,104,106,108,110,112,114,116,118,120];
    return `<div class="demo-qr" aria-label="Decorative demo code">${Array.from({length:121}, (_, index) => `<i class="${cells.includes(index) ? 'on' : ''}"></i>`).join('')}</div>`;
  }

  function passPage() {
    const saved = data.demoSchedule.filter((item) => isSaved(item.id));
    const passportPercent = Math.round((state.passport.length / data.passportChallenges.length) * 100);
    return `${pageHead('Your fair-day identity', 'The OATF <em>Pass.</em>', 'A showcase-only digital pass—not admission—that gathers your fair, schedule and Passport into one shareable moment.')}
      <article class="oatf-pass" style="--pass-rx:0deg;--pass-ry:0deg;--shine-x:50%;--shine-y:50%">
        <div class="pass-hologram"></div><div class="pass-wheel" aria-hidden="true"><i></i></div>
        <header><div class="pass-mark">O</div><div><small>OUT AT THE FAIR®</small><strong>ALL-ACCESS COMMUNITY PASS</strong></div></header>
        <section><small>PASS HOLDER</small><h2>${esc(state.showcaseName || 'William')}</h2><p>ORANGE COUNTY · SHOWCASE SATURDAY</p></section>
        <div class="pass-details"><div><small>STATUS</small><strong>FAIR MODE LIVE</strong></div><div><small>MY DAY</small><strong>${saved.length || 3} EVENTS</strong></div><div><small>PASSPORT</small><strong>${passportPercent}%</strong></div></div>
        <footer>${demoQr()}<div><small>SHOWCASE DEMO</small><strong>NOT AN ADMISSION TICKET</strong><span>OATF · V0.7 · FAIR COMPANION</span></div></footer>
      </article>
      <label class="pass-name-field"><span>PASS NAME</span><input data-showcase-name type="text" value="${esc(state.showcaseName || 'William')}" maxlength="24" placeholder="Your name"></label>
      <div class="button-stack"><button class="btn btn-primary btn-block" data-action="enable-pass-tilt">Enable phone tilt effect</button><button class="btn btn-secondary btn-block" data-action="share-pass">Share pass</button><button class="btn btn-secondary btn-block" data-nav="myday">Open My Day</button></div>`;
  }

  function liveActivityPage() {
    return `${pageHead('Native concept', 'OATF on the<br><em>Lock Screen.</em>', 'A convincing product preview of how a real ActivityKit extension could keep the current and upcoming stage moments visible.')}
      <section class="activity-stage">
        <article class="phone-preview"><div class="phone-status"><span>2:18</span><span>▮▮▮ )))</span></div><div class="dynamic-island"><i></i><span>OATF</span><strong>Story Time · 12 min</strong><b>🎡</b></div><div class="phone-wallpaper"><small>OUT AT THE FAIR</small><h2>ALL BELONG<br><em>AT THE FAIR.</em></h2></div><div class="lock-activity"><header><span><i></i> HAPPENING NOW</span><b>12 MIN</b></header><h3>OATF Story Time</h3><p>Rainbow Stage · Summer Daze</p><div><small>UP NEXT</small><strong>Nicole & Scotty · 1:15 PM</strong></div></div></article>
      </section>
      <article class="concept-note"><small>CONCEPT PREVIEW</small><h2>The next event stays visible—even when the app is closed.</h2><p>The genuine feature would use Apple ActivityKit and WidgetKit after confirmed schedules and production requirements are ready.</p><button class="btn btn-primary btn-block" data-action="schedule-demo-notification">Test today’s real local alert</button></article>`;
  }

  function visionPage() {
    const cards = [
      ['01', 'BEFORE THE FAIR', 'Discover dates, choose a location, save entertainment and prepare tickets, parking and accessibility needs.'],
      ['02', 'DURING THE FAIR', 'See what is live, follow your personal timeline, find community and receive only the alerts that matter.'],
      ['03', 'AFTER THE FAIR', 'Keep photos, revisit organizations, answer a quick survey and discover the next OATF chapter.']
    ];
    return `<section class="vision-hero"><small>THE FUTURE OF OUT AT THE FAIR®</small><h1>The website<br><em>tells the story.</em></h1><h2>The app<br><em>guides the day.</em></h2><p>One connected product supporting every fair, every partner and every guest journey.</p></section>
      <div class="vision-paths">${cards.map(([number,title,text]) => `<article><span>${number}</span><small>${title}</small><p>${text}</p></article>`).join('')}</div>
      <section class="vision-finale"><div class="vision-rings" aria-hidden="true"></div><p>THE NEXT CHAPTER ARRIVES IN 2027</p><h2>See you<br><em>at the fair.</em></h2><div class="button-row"><button class="btn btn-primary" data-action="replay-cinematic">Replay opening</button><button class="btn btn-secondary" data-nav="showcase">Back to Fair Mode</button></div></section>`;
  }


  function conciergeAnswer(query) {
    const q = query.toLowerCase();
    const now = schedule().find((item) => item.status === 'live');
    const upNext = schedule().find((item) => item.status === 'upnext');
    const meetup = state.planner.meetup || 'OATF Info Booth · 3:00 PM';
    if (/happening|right now|what.*now|live/.test(q)) return { text: `${now?.title || 'Story Time'} is happening now at ${now?.location || 'the Rainbow Stage'}. ${upNext ? `${upNext.title} begins next at ${upNext.time}.` : ''}`, route: 'schedule' };
    if (/restroom|bathroom|toilet/.test(q)) return { text: 'Accessible restrooms are northeast of the Rainbow Stage in this demo map. Open the map and tap the ♿ pin for details.', route: 'map' };
    if (/glam/.test(q)) return { text: 'The OATF Glam Show begins at 5:00 PM on the Rainbow Stage. I can take you to the schedule so you can save it.', route: 'schedule' };
    if (/quiet|sensory|overwhelm|break|calm/.test(q)) return { text: 'The Quiet Space is currently calm with seating available. It is southeast of Community Row and designed for a lower-sensory reset.', route: 'map' };
    if (/access|wheelchair|mobility|asl|hearing/.test(q)) return { text: 'The app can show accessible restrooms, stage viewing, quieter space and guest-services guidance. Open Accessibility for the full fair-day guide.', route: 'accessibility' };
    if (/food|water|lemonade|hungry|drink/.test(q)) return { text: 'Food & Water is showing moderate traffic and the lines are moving steadily. The map pin is southwest of OATF Info.', route: 'map' };
    if (/group|crew|caleb|daniel|meet/.test(q)) return { text: `Your crew meetup is ${meetup}. ${state.group.members.filter((m) => m.checkedIn).length} of ${state.group.members.length} members are checked in.`, route: 'together' };
    if (/parking|ticket|ready|prepare/.test(q)) return { text: 'Your Fair-day Planner keeps tickets, parking, essentials and the meetup point together. Open it before you leave home.', route: 'planner' };
    if (/story/.test(q)) return { text: 'Story Time is live at 1:00 PM and returns at 3:15 PM in the sample schedule.', route: 'schedule' };
    if (/community|booth|resource|partner/.test(q)) return { text: 'Community Row has local LGBTQ+ support, youth, health and arts organizations. Booths begin at C-04 in the demo directory.', route: 'community' };
    if (/next|recommend|should.*do/.test(q)) return { text: `${upNext?.title || 'Nicole & Scotty'} is the best next stop at ${upNext?.time || '1:15 PM'}. After that, meet your crew at ${meetup}.`, route: 'myday' };
    return { text: 'I can help with what is happening now, the next performance, restrooms, accessibility, food, Community Row, the Glam Show or your group meetup. Try one of the quick questions below.' };
  }

  function sendConcierge(raw) {
    const query = String(raw || '').trim();
    if (!query) return;
    const answer = conciergeAnswer(query);
    state.concierge.history.push({ role: 'user', text: query }, { role: 'bot', text: answer.text, route: answer.route || '' });
    state.concierge.history = state.concierge.history.slice(-16);
    saveState();
    render();
    setTimeout(() => document.querySelector('.concierge-thread')?.scrollTo({ top: 99999, behavior: 'smooth' }), 80);
    haptic('LIGHT');
  }

  function conciergePage() {
    const messages = state.concierge.history.map((message) => `<div class="chat-message ${message.role}"><span>${message.role === 'bot' ? 'O' : esc((state.showcaseName || 'You').slice(0,1))}</span><div><p>${esc(message.text)}</p>${message.route ? `<button class="chat-route" data-nav="${message.route}">Open ${message.route === 'myday' ? 'My Day' : message.route} →</button>` : ''}</div></div>`).join('');
    return `${pageHead('Offline intelligence', 'Ask <em>OATF.</em>', 'A fast, private fair concierge powered entirely by the event information already stored in the app.')}
      <section class="concierge-shell">
        <div class="concierge-status"><i></i><div><strong>Ready on the fairgrounds</strong><span>Works even when cellular service does not.</span></div><b>OFFLINE</b></div>
        <div class="concierge-thread" aria-live="polite">${messages}</div>
        <div class="concierge-prompts">${data.conciergePrompts.map((prompt) => `<button data-action="concierge-prompt" data-query="${esc(prompt)}">${esc(prompt)}</button>`).join('')}</div>
        <form class="concierge-form" data-concierge-form><input id="concierge-input" name="question" maxlength="140" autocomplete="off" placeholder="Ask about the fair…"><button type="submit" aria-label="Send question">↑</button></form>
      </section>
      <div class="button-row"><button class="btn btn-secondary" data-action="speak-last-answer">Read last answer</button><button class="btn btn-secondary" data-action="concierge-clear">Clear chat</button></div>`;
  }

  function groupStatusLabel(index) {
    return ['At the Rainbow Stage', 'Getting lemonade', 'Exploring Community Row', 'Heading to the meetup', 'Taking a quiet break'][index % 5];
  }

  function togetherPage() {
    const checked = state.group.members.filter((member) => member.checkedIn).length;
    const meetup = state.planner.meetup || 'OATF Info Booth · 3:00 PM';
    return `${pageHead('Shared fair day', 'Better <em>together.</em>', 'A no-account showcase of how a family or friend group could stay connected without turning the fair into a tracking app.')}
      <article class="crew-pass">
        <div class="crew-orbit"></div><small>3DUDES1LIFE · FAIR CREW</small><h2>WILLIAM<br>CALEB<br>DANIEL</h2><div class="crew-code"><span>GROUP CODE</span><strong>${esc(state.group.code)}</strong></div><p>${checked} OF ${state.group.members.length} CHECKED IN</p>
      </article>
      <section class="section">${sectionHead('Crew status', 'Where everybody<br><em>left off.</em>', 'Demo statuses are stored only on this device')}
        <div class="crew-members">${state.group.members.map((member) => `<article class="crew-member ${member.checkedIn ? 'checked' : ''}"><button class="crew-avatar" data-action="group-checkin" data-id="${member.id}">${member.checkedIn ? '✓' : esc(member.initials)}</button><div><small>${member.checkedIn ? 'CHECKED IN' : 'TAP TO CHECK IN'}</small><h3>${esc(member.name)}</h3><button class="status-cycle" data-action="group-status" data-id="${member.id}">${esc(groupStatusLabel(member.status))} ↻</button></div></article>`).join('')}</div>
      </section>
      <section class="section meetup-beacon"><small>SHARED MEET-UP BEACON</small><h2>${esc(meetup)}</h2><p>${esc(state.planner.notes || 'Meet before the Glam Show and keep one portable charger with the group.')}</p><div class="button-row"><button class="btn btn-primary" data-action="ping-group">Ping the crew</button><button class="btn btn-secondary" data-action="share-group">Share plan</button></div></section>
      <section class="section"><article class="privacy-note"><span>◎</span><div><strong>Connection without surveillance.</strong><p>A production version could use voluntary check-ins and shared meetup notes—not constant background location tracking.</p></div></article></section>`;
  }

  function pulsePage() {
    const reactionDefs = [['heart','♥',142],['sparkle','✦',88],['fire','🔥',64]];
    return `${pageHead('Live fair signal', 'Feel the<br><em>Fair Pulse.</em>', 'A showcase feed combining stage updates, useful crowd signals and lightweight attendee energy.')}
      <section class="pulse-hero"><div class="pulse-radar"><i></i><i></i><i></i><b>◉</b></div><small>OATF ENERGY · LIVE DEMO</small><h2>THE FAIR IS<br><em>BUZZING.</em></h2><p>Story Time is live and Community Row is easy to explore.</p><div class="pulse-reactions">${reactionDefs.map(([id,icon,base]) => `<button class="${state.pulse.reacted.includes(id) ? 'reacted' : ''}" data-action="pulse-react" data-id="${id}"><span>${icon}</span><strong>${base + (state.pulse.reactions[id] || 0)}</strong></button>`).join('')}</div></section>
      <section class="section">${sectionHead('Around the fair', 'Crowd energy,<br><em>not crowd tracking.</em>', 'Simple venue signals can help guests choose a comfortable next stop')}
        <div class="crowd-grid">${data.crowdLevels.map((item) => `<article><header><span>${esc(item.label)}</span><strong>${esc(item.level)}</strong></header><div class="crowd-meter"><i style="width:${item.value}%"></i></div><p>${esc(item.note)}</p></article>`).join('')}</div>
      </section>
      <section class="section">${sectionHead('Live updates', 'The useful stuff,<br><em>right when it matters.</em>')}
        <div class="pulse-feed">${data.pulseUpdates.map((item) => `<article class="${item.tone}"><span>${item.icon}</span><div><small>${esc(item.time)}</small><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div></article>`).join('')}</div>
      </section>`;
  }

  function momentFrameData() { return data.momentFrames.find((frame) => frame.id === momentFrame) || data.momentFrames[0]; }

  function momentsPage() {
    const frame = momentFrameData();
    return `${pageHead('Create the memory', 'OATF <em>Moments.</em>', 'Take a photo or choose one from your library, then turn it into a branded fair-day keepsake.')}
      <section class="moment-studio">
        <div class="moment-preview ${momentImageData ? 'has-photo' : ''}" style="--moment-accent:${frame.accent}">
          ${momentImageData ? `<img src="${momentImageData}" alt="Selected fair-day moment">` : `<div class="moment-placeholder"><span>📸</span><strong>ADD YOUR FAIR-DAY PHOTO</strong><small>Camera and photo library work in the native app.</small></div>`}
          <div class="moment-wash"></div><div class="moment-brand"><small>${esc(frame.kicker)}</small><h2>${esc(frame.headline)}</h2><p>${esc(state.showcaseName || 'William')} · FAIR MODE 2027</p></div><div class="moment-corner">O</div>
        </div>
        <label class="photo-picker"><input type="file" accept="image/*" capture="environment" data-moment-upload><span>＋</span><strong>${momentImageData ? 'Choose another photo' : 'Take or choose a photo'}</strong></label>
        <div class="frame-picker">${data.momentFrames.map((item) => `<button class="${item.id === momentFrame ? 'active' : ''}" style="--swatch:${item.accent}" data-action="moment-frame" data-id="${item.id}"><i></i>${esc(item.label)}</button>`).join('')}</div>
        <div class="button-row"><button class="btn btn-primary" data-action="download-moment">Save image</button><button class="btn btn-secondary" data-action="share-moment">Share moment</button></div>
      </section>
      <article class="moment-tip"><span>✦</span><div><strong>Built for organic reach.</strong><p>Every shared photo carries the OATF name, fair-day energy and a clear visual identity without feeling like a generic sponsor frame.</p></div></article>`;
  }

  async function createMomentBlob() {
    const frame = momentFrameData();
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0,0,1080,1350); gradient.addColorStop(0,'#321044'); gradient.addColorStop(.48,'#101022'); gradient.addColorStop(1,'#09060f'); ctx.fillStyle=gradient; ctx.fillRect(0,0,1080,1350);
    if (momentImageData) {
      const img = new Image(); img.src = momentImageData; await img.decode();
      const scale = Math.max(1080/img.width, 1350/img.height); const w=img.width*scale, h=img.height*scale;
      ctx.drawImage(img,(1080-w)/2,(1350-h)/2,w,h);
    }
    const wash=ctx.createLinearGradient(0,400,0,1350); wash.addColorStop(0,'rgba(9,6,15,0)'); wash.addColorStop(.7,'rgba(9,6,15,.72)'); wash.addColorStop(1,'rgba(9,6,15,.96)'); ctx.fillStyle=wash; ctx.fillRect(0,0,1080,1350);
    ctx.strokeStyle=frame.accent; ctx.lineWidth=18; ctx.strokeRect(28,28,1024,1294);
    ctx.fillStyle=frame.accent; ctx.beginPath(); ctx.arc(920,130,70,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#09060f'; ctx.font='900 72px Arial'; ctx.textAlign='center'; ctx.fillText('O',920,155);
    ctx.textAlign='left'; ctx.fillStyle='#fff'; ctx.font='900 34px Arial'; ctx.fillText(frame.kicker,80,1040);
    ctx.font='900 82px Impact, Arial Narrow, Arial'; const words=frame.headline.split(' '); let lines=[], line=''; words.forEach(word=>{const test=line?line+' '+word:word;if(ctx.measureText(test).width>900){lines.push(line);line=word}else line=test}); if(line)lines.push(line); lines.slice(0,3).forEach((text,i)=>ctx.fillText(text,80,1135+i*78));
    ctx.fillStyle=frame.accent; ctx.font='800 27px Arial'; ctx.fillText(`${state.showcaseName || 'William'} · FAIR MODE 2027`,80,1310);
    return await new Promise((resolve)=>canvas.toBlob(resolve,'image/png',.94));
  }

  async function downloadMoment(share = false) {
    try {
      const blob = await createMomentBlob();
      if (!blob) throw new Error('Image unavailable');
      const file = new File([blob], 'my-oatf-moment.png', { type:'image/png' });
      if (share && navigator.canShare?.({ files:[file] })) { await navigator.share({ title:'My OATF Moment', text:'All belong at the fair. 🌈🎡', files:[file] }); return; }
      const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='my-oatf-moment.png'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); showToast('OATF Moment saved');
    } catch (error) { console.warn(error); showToast('Add a photo and try again'); }
  }

  function capsulePage() {
    const saved = schedule().filter((item) => isSaved(item.id));
    const checked = state.group.members.filter((member) => member.checkedIn).length;
    const passport = Math.round((state.passport.length / data.passportChallenges.length) * 100);
    return `${pageHead('After the fair', 'Your OATF<br><em>Memory Capsule.</em>', 'A closing screen that turns the day into a story worth keeping and sharing.')}
      <section class="capsule-card ${state.capsuleSealed ? 'sealed' : ''}"><div class="capsule-glow"></div><small>${state.capsuleSealed ? 'CAPSULE SEALED' : 'FAIR DAY IN PROGRESS'}</small><h2>${esc(state.showcaseName || 'William')}’S<br>OUT AT THE FAIR</h2><p>Orange County · Showcase Saturday</p><div class="capsule-stats"><div><strong>${saved.length || 3}</strong><span>moments saved</span></div><div><strong>${passport}%</strong><span>passport complete</span></div><div><strong>${checked}/3</strong><span>crew checked in</span></div></div><blockquote>“${esc(state.planner.notes || 'A full day of community, live entertainment and one very sparkly Glam Show.')}”</blockquote></section>
      <section class="section">${sectionHead('Your highlights', 'The day,<br><em>in four signals.</em>')}
        <div class="capsule-highlights"><article><span>📚</span><small>FIRST STOP</small><strong>Story Time</strong></article><article><span>3</span><small>YOUR PEOPLE</small><strong>William, Caleb & Daniel</strong></article><article><span>📸</span><small>YOUR MOMENT</small><strong>${momentImageData ? 'Photo ready to share' : 'Create an OATF Moment'}</strong></article><article><span>👑</span><small>FINALE</small><strong>OATF Glam Show</strong></article></div>
      </section>
      <div class="button-stack"><button class="btn btn-primary btn-block" data-action="seal-capsule">${state.capsuleSealed ? 'Unseal memory capsule' : 'Seal the memory capsule'}</button><button class="btn btn-secondary btn-block" data-action="share-capsule">Share day recap</button><button class="btn btn-secondary btn-block" data-nav="moments">Create photo moment</button></div>`;
  }

  function offersPage() {
    const saved = data.offers.filter((offer) => state.offers.saved.includes(offer.id));
    return `${pageHead('Fair-day perks', 'Partner <em>offers.</em>', 'Save local offers, keep them handy and mark them used. Demo data stays on this device.')}
      ${saved.length ? `<section class="section">${sectionHead('Saved for today', `${saved.length} ${saved.length === 1 ? 'offer' : 'offers'}`, 'Your shortlist')}<div class="offer-list">${saved.map((offer) => offerCard(offer)).join('')}</div></section>` : ''}
      <section class="section">${sectionHead('Available now', 'Small perks.<br><em>Big fair energy.</em>', 'Partner offers can activate by fair, day and location')}<div class="offer-list">${data.offers.map((offer) => offerCard(offer)).join('')}</div></section>
      <article class="privacy-note"><span>◎</span><div><strong>No account needed for this preview.</strong><p>Saved and redeemed states remain locally on this device until a future synced account system is added.</p></div></article>`;
  }

  function morePage() {
    const menu = [
      ['concierge', '✦', 'Ask OATF', 'Offline fair concierge'],
      ['together', '3', 'Together Mode', 'Crew check-ins and meetup beacon'],
      ['moments', '📸', 'OATF Moments', 'Create a branded fair-day photo'],
      ['pulse', '◉', 'Fair Pulse', 'Live updates and crowd energy'],
      ['capsule', '◇', 'Memory Capsule', 'Turn the day into a shareable recap'],
      ['offers', '✦', 'Partner Offers', 'Fair-day perks and samples'],
      ['showcase', '✦', 'Showcase Fair Mode', 'The complete 60-second presentation'],
      ['myday', '◷', 'My Day', 'One live timeline for the fair'],
      ['pass', '◈', 'OATF Pass', 'Animated personalized showcase pass'],
      ['liveactivity', '⌁', 'Lock Screen concept', 'Dynamic Island and Live Activity preview'],
      ['vision', '🌈', 'The vision', 'Before, during and after the fair'],
      ['performers', '🎤', 'Performers', 'Meet the sample stage lineup'],
      ['community', '✦', 'Community', 'Organizations, booths and services'],
      ['map', '⌖', 'Fair map', 'Navigation and accessibility pins'],
      ['passport', '✓', 'OATF Passport', 'Explore and collect experiences'],
      ['planner', '☑', 'Fair-day planner', 'Tickets, parking, essentials and meet-up'],
      ['story', '◈', 'Our story', 'The complete OATF timeline'],
      ['accessibility', '♿', 'Accessibility', 'Display and fair-day guidance'],
      ['participate', '＋', 'Participate', 'Partner, perform or produce'],
      ['contact', '✉', 'Contact', 'Connect with the OATF team']
    ];
    return `${pageHead('Explore the app', 'More <em>OATF.</em>', 'Everything beyond your home fair and personal schedule.')}
      <div class="more-menu">${menu.map(([route, icon, title, text]) => `<button data-nav="${route}"><span>${icon}</span><div><strong>${title}</strong><small>${text}</small></div><b>›</b></button>`).join('')}</div>
      <section class="section"><article class="demo-switch-card"><div><small>PARTNER PRESENTATION TOOL</small><h2>${state.demo ? 'Showcase Fair Mode is live.' : 'Preview the complete OATF product.'}</h2><p>${state.demo ? 'The sample schedule, Ask OATF, Together Mode, photo studio and native showcase tools are active.' : 'Enter the clearly labeled showcase to load a complete sample fair day for Caleb and Daniel—with their own Together Mode crew.'}</p></div><button class="btn btn-primary" data-action="enter-showcase">${state.demo ? 'Open showcase' : 'Enter Fair Mode'}</button></article></section>
      <section class="section"><div class="button-stack"><button class="btn btn-primary btn-block" data-action="start-tour">Start 60-second showcase tour</button><button class="btn btn-secondary btn-block" data-action="replay-cinematic">Replay cinematic opening</button><button class="btn btn-secondary btn-block" data-action="install-app">Install app</button><button class="btn btn-secondary btn-block" data-action="share-app">Share preview</button><button class="btn btn-secondary btn-block" data-action="refresh-app">Refresh app content</button><button class="btn btn-secondary btn-block" data-action="reset-app">Reset local app data</button></div></section>
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
      case 'planner': content = plannerPage(); break;
      case 'notifications': content = notificationsPage(); break;
      case 'accessibility': content = accessibilityPage(); break;
      case 'story': content = storyPage(); break;
      case 'participate': content = participatePage(); break;
      case 'contact': content = contactPage(); break;
      case 'search': content = searchPage(); break;
      case 'showcase': content = showcasePage(); break;
      case 'myday': content = myDayPage(); break;
      case 'pass': content = passPage(); break;
      case 'liveactivity': content = liveActivityPage(); break;
      case 'vision': content = visionPage(); break;
      case 'concierge': content = conciergePage(); break;
      case 'together': content = togetherPage(); break;
      case 'moments': content = momentsPage(); break;
      case 'pulse': content = pulsePage(); break;
      case 'capsule': content = capsulePage(); break;
      case 'offers': content = offersPage(); break;
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
    showToast(state.demo ? 'Showcase Fair Mode activated' : 'Fair Mode turned off');
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
    if (!state.demo) return showToast('Enter Fair Mode to test passport stamps');
    const wasComplete = state.passport.length === data.passportChallenges.length;
    state.passport = state.passport.includes(id) ? state.passport.filter((item) => item !== id) : [...state.passport, id];
    saveState();
    render();
    const isComplete = state.passport.length === data.passportChallenges.length;
    showToast(state.passport.includes(id) ? 'Passport stamped!' : 'Stamp removed');
    if (!wasComplete && isComplete) setTimeout(celebratePassport, 120);
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
    return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//OutAt Inc.//OATF App V0.7//EN\nCALSCALE:GREGORIAN\n${events}\nEND:VCALENDAR`;
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
      else { await navigator.clipboard.writeText(payload.text || payload.url || location.href); showToast(payload.url ? 'Link copied' : 'Plan copied'); }
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


  function sharePlan() {
    const fair = currentFair();
    const completed = plannerTasks.filter(([id]) => state.planner.completed.includes(id)).map(([, title]) => `✓ ${title}`);
    const savedEvents = schedule().filter((item) => isSaved(item.id)).map((item) => `• ${item.time} — ${item.title}`);
    const lines = [
      `My Out at the Fair® plan — ${fair.name}`,
      '',
      completed.length ? completed.join('\n') : 'No checklist items completed yet.',
      state.planner.meetup ? `\nMeet-up spot: ${state.planner.meetup}` : '',
      state.planner.notes ? `Note: ${state.planner.notes}` : '',
      savedEvents.length ? `\nMy saved schedule:\n${savedEvents.join('\n')}` : '',
      `\n${location.href.split('#')[0]}`
    ].filter(Boolean).join('\n');
    return sharePayload({ title: 'My OATF fair-day plan', text: lines });
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
    if (q.length >= 2 && ['showcase','fair mode','demo','tour'].some((term) => term.includes(q) || q.includes(term))) results.push({ type: 'SHOWCASE', icon: '✦', title: 'Showcase Fair Mode', text: 'Open the complete V0.7 fair companion', route: 'showcase' });
    if (q.length >= 2 && ['pass','wallet','ticket'].some((term) => term.includes(q) || q.includes(term))) results.push({ type: 'TOOL', icon: '◈', title: 'OATF Pass', text: 'Animated personalized showcase pass', route: 'pass' });
    if (q.length >= 2 && ['dynamic island','lock screen','live activity'].some((term) => term.includes(q) || q.includes(term))) results.push({ type: 'CONCEPT', icon: '⌁', title: 'Lock Screen concept', text: 'Dynamic Island and Live Activity preview', route: 'liveactivity' });
    if (q.length >= 2 && ['planner','tickets','parking','meetup','essentials','plan'].some((term) => term.includes(q) || q.includes(term))) results.push({ type: 'TOOL', icon: '☑', title: 'Fair-day planner', text: 'Tickets, parking, essentials and meet-up plan', route: 'planner' });
    if (q.length >= 2 && ['ask','help','concierge','restroom','bathroom','quiet'].some((term) => term.includes(q) || q.includes(term))) results.push({ type: 'TOOL', icon: '✦', title: 'Ask OATF', text: 'Offline fair-day concierge', route: 'concierge' });
    if (q.length >= 2 && ['group','together','crew','caleb','daniel'].some((term) => term.includes(q) || q.includes(term))) results.push({ type: 'TOOL', icon: '3', title: 'Together Mode', text: 'Crew statuses and meet-up plan', route: 'together' });
    if (q.length >= 2 && ['photo','moment','camera','memory'].some((term) => term.includes(q) || q.includes(term))) results.push({ type: 'TOOL', icon: '📸', title: 'OATF Moments', text: 'Create a branded fair-day photo', route: 'moments' });
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

  document.addEventListener('click', (event) => {
    if (event.target.closest('button, a, [data-fair], [data-person], [data-partner], [data-map-pin]')) haptic('LIGHT');
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
      case 'concierge-prompt': sendConcierge(action.dataset.query); break;
      case 'concierge-clear': state.concierge.history = JSON.parse(JSON.stringify(defaultState.concierge.history)); saveState(); render(); break;
      case 'speak-last-answer': { const last=[...state.concierge.history].reverse().find((item)=>item.role==='bot'); if (!last || !('speechSynthesis' in window)) return showToast('Speech is not available'); speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(last.text)); break; }
      case 'group-checkin': { const member=state.group.members.find((item)=>item.id===id); if(member){member.checkedIn=!member.checkedIn; saveState(); render(); if(state.group.members.every((item)=>item.checkedIn)) successHaptic();} break; }
      case 'group-status': { const member=state.group.members.find((item)=>item.id===id); if(member){member.status=(member.status+1)%5; saveState(); render();} break; }
      case 'ping-group': haptic('HEAVY'); showToast(`Crew ping sent: ${state.planner.meetup || 'OATF Info Booth · 3:00 PM'}`); break;
      case 'share-group': sharePayload({ title:'Our OATF Crew Plan', text:`William, Caleb & Daniel · Meet at ${state.planner.meetup || 'OATF Info Booth · 3:00 PM'} · Group code ${state.group.code}` }); break;
      case 'pulse-react': if(!state.pulse.reacted.includes(id)){state.pulse.reacted.push(id);state.pulse.reactions[id]=(state.pulse.reactions[id]||0)+1;saveState();successHaptic();render();} break;
      case 'moment-frame': momentFrame=id; render(); break;
      case 'download-moment': downloadMoment(false); break;
      case 'share-moment': downloadMoment(true); break;
      case 'seal-capsule': state.capsuleSealed=!state.capsuleSealed; saveState(); successHaptic(); render(); if(state.capsuleSealed)setTimeout(celebratePassport,100); break;
      case 'share-capsule': sharePayload({ title:'My Out at the Fair Day', text:`${state.showcaseName || 'William'}’s OATF day · ${state.favorites.length || 3} events saved · ${Math.round((state.passport.length/data.passportChallenges.length)*100)}% Passport · William, Caleb & Daniel together at the fair.` }); break;
      case 'save-offer': state.offers.saved = state.offers.saved.includes(id) ? state.offers.saved.filter((item)=>item!==id) : [...state.offers.saved,id]; saveState(); successHaptic(); render(); showToast(state.offers.saved.includes(id)?'Offer saved':'Offer removed'); break;
      case 'redeem-offer': if(!state.offers.redeemed.includes(id)){state.offers.redeemed.push(id);saveState();successHaptic();render();showToast('Offer marked used');} break;
      case 'open-fair-tools': navigate('schedule'); break;
      case 'toggle-demo': toggleDemo(); break;
      case 'enter-showcase': initializeShowcaseDefaults(); successHaptic(); navigate('showcase'); break;
      case 'exit-showcase': state.demo = false; state.selectedFair = 'san-diego'; saveState(); showToast('Fair Mode turned off'); navigate('home'); break;
      case 'start-tour': startShowcaseTour(); break;
      case 'tour-next': showcaseTourStep = Math.min(tourSteps.length - 1, showcaseTourStep + 1); haptic('LIGHT'); renderTour(); break;
      case 'tour-prev': showcaseTourStep = Math.max(0, showcaseTourStep - 1); haptic('LIGHT'); renderTour(); break;
      case 'tour-finish': document.querySelector('.tour-backdrop')?.remove(); navigate('vision'); break;
      case 'close-tour': document.querySelector('.tour-backdrop')?.remove(); break;
      case 'schedule-demo-notification': scheduleDemoNotification(); break;
      case 'enable-pass-tilt': enablePassTilt(); break;
      case 'share-pass': sharePayload({ title: 'My Out at the Fair Pass', text: `${state.showcaseName || 'William'}’s OATF showcase pass · Orange County · Fair Mode Live` }); break;
      case 'complete-passport': state.passport = data.passportChallenges.map((item) => item.id); saveState(); render(); setTimeout(celebratePassport, 120); break;
      case 'close-celebration': document.querySelector('.celebration-layer')?.remove(); break;
      case 'replay-cinematic': playCinematic(true); break;
      case 'favorite': toggleFavorite(id); successHaptic(); break;
      case 'favorite-partner': togglePartnerFavorite(id); successHaptic(); break;
      case 'passport-stamp': togglePassport(id); successHaptic(); break;
      case 'planner-task': state.planner.completed = state.planner.completed.includes(id) ? state.planner.completed.filter((item) => item !== id) : [...state.planner.completed, id]; saveState(); successHaptic(); render(); break;
      case 'select-fair': state.selectedFair = id; state.demo = id === data.demoFair.id; saveState(); showToast('Your fair has been updated'); render(); break;
      case 'notification-pref': state.notifications[id] = !state.notifications[id]; saveState(); render(); break;
      case 'accessibility-pref': state.prefs[id] = !state.prefs[id]; saveState(); render(); break;
      case 'request-notifications': requestNotifications(); break;
      case 'download-day-calendar': downloadCalendar(schedule(), 'oatf-demo-day.ics'); break;
      case 'download-my-calendar': downloadCalendar(schedule().filter((item) => isSaved(item.id)), 'my-oatf-schedule.ics'); break;
      case 'share-app': shareApp(); break;
      case 'refresh-app': refreshAppContent(); break;
      case 'share-fair': shareFair(id); break;
      case 'share-plan': sharePlan(); break;
      case 'clear-plan': state.planner = JSON.parse(JSON.stringify(defaultState.planner)); saveState(); showToast('Planner cleared'); render(); break;
      case 'install-app': installApp(); break;
      case 'demo-help': showModal('Guest services demo', 'A live fair build can route this button to the selected fair’s official guest-services phone, text line or help desk.', 'Understood'); break;
      case 'reset-app': try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(PREVIOUS_KEY); LEGACY_KEYS.forEach((key) => localStorage.removeItem(key)); } catch {} Object.assign(state, JSON.parse(JSON.stringify(defaultState))); saveState(); showToast('Local app data reset'); navigate('home'); break;
      case 'close-modal': document.querySelector('.modal-backdrop')?.remove(); break;
    }
  });

  app.addEventListener('input', (event) => {
    if (event.target.matches('[data-showcase-name]')) { state.showcaseName = event.target.value; saveState(); const passName = document.querySelector('.oatf-pass section h2'); if (passName) passName.textContent = event.target.value || 'Guest'; return; }
    const plannerField = event.target.dataset.plannerField;
    if (plannerField) {
      state.planner[plannerField] = event.target.value;
      saveState();
      return;
    }
    const type = event.target.dataset.search;
    if (!type) return;
    const query = event.target.value.toLowerCase().trim();
    if (type === 'global') return globalSearch(event.target.value);
    const selector = type === 'performers' ? '#performer-list .person-card' : '#partner-list .partner-card';
    document.querySelectorAll(selector).forEach((el) => { el.hidden = !el.textContent.toLowerCase().includes(query); });
  });


  app.addEventListener('change', (event) => {
    const input = event.target.closest('[data-moment-upload]');
    if (!input?.files?.[0]) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) return showToast('Choose an image file');
    const reader = new FileReader();
    reader.onload = () => { momentImageData = String(reader.result || ''); if (!state.passport.includes('photo')) state.passport.push('photo'); saveState(); successHaptic(); render(); };
    reader.readAsDataURL(file);
  });

  app.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-concierge-form]');
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector('input[name="question"]');
    sendConcierge(input?.value || '');
  });

  app.addEventListener('pointermove', (event) => {
    const card = event.target.closest('.oatf-pass');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    card.style.setProperty('--pass-rx', `${(0.5 - py) * 9}deg`);
    card.style.setProperty('--pass-ry', `${(px - 0.5) * 12}deg`);
    card.style.setProperty('--shine-x', `${px * 100}%`);
    card.style.setProperty('--shine-y', `${py * 100}%`);
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

  initNativePolish();

  if (!location.hash) location.hash = 'home';
  else render();
  setTimeout(() => playCinematic(false), 80);
})();
