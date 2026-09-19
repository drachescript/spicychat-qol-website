(() => {
  const frame = document.querySelector('[data-settings-frame]');
  const preview = document.querySelector('[data-chat-preview]');
  const routeHost = document.querySelector('[data-demo-route-host]');
  if (!frame || !preview || !routeHost) return;

  const modeButtons = [...document.querySelectorAll('[data-demo-mode]')];
  const sourceState = document.querySelector('[data-demo-source]');
  const buildLabel = document.querySelector('[data-demo-build]');
  const modeBadge = document.querySelector('[data-demo-mode-badge]');
  const placeholder = document.querySelector('[data-demo-placeholder]');
  const toast = document.querySelector('[data-demo-toast]');
  const drawer = document.querySelector('[data-demo-settings-drawer]');
  const backdrop = document.querySelector('[data-demo-settings-backdrop]');
  const pageTitle = document.querySelector('[data-demo-page-title]');
  const pageSubtitle = document.querySelector('[data-demo-page-subtitle]');
  const DEFAULT_MODE = 'stable';
  const VALID_MODES = new Set(['stable', 'dev']);
  const APP_STATE_KEY = 'sqol-demo-app-v2';

  const fallbackBots = [
    {id:'b376faf0-8c37-4b37-8861-8ca68cdd64b6',name:'Yui Kimura',title:'The Mechanic She Trusts. AU',blurb:'No-Fog AU. Yui brings you a damaged bike and slowly starts trusting the mechanic fixing it.',image:'https://cdn.nd-api.com/avatars/0fb19108-bfb0-453e-85f3-3b5a2655ce29.png?class=avatar256x256',tags:['Dead by Daylight','mechanic','AU'],creator:'@dragongraf',demoMessages:1284,favorite:true,later:true,opened:true,hasLorebook:true,folder:'Favorites'},
    {id:'2d0a994a-65cd-4f94-accd-ffed0c45230e',name:'Nova',title:'The Singer You Never Heard (deaf POV)',blurb:"She's a singer. You can't hear her music, so the connection has to start somewhere else.",image:'https://cdn.nd-api.com/avatars/0f6b9387-a114-45bf-b4ba-893512ebfef9.jpg?class=avatar256x256',tags:['deaf POV','singer','accessibility','romance'],creator:'@dragongraf',demoMessages:842,favorite:true,later:false,opened:true,hasLorebook:false,folder:'Favorites'},
    {id:'c1fe4367-501f-472c-967c-275c71d38378',name:'Rhea Mercer',title:'DID Users Social alter met her first',blurb:"Rhea met Ren first. it takes her a bit to realise that wasn't the whole picture.",image:'https://cdn.nd-api.com/avatars/1433aa28-b509-43b3-902f-32058a1e4fc4.jpg?class=avatar256x256',tags:['DID POV','system','alter','romance'],creator:'@dragongraf',demoMessages:611,favorite:true,later:true,opened:true,hasLorebook:true,folder:'DID'},
    {id:'5d2df83e-1ee3-4654-8897-c280742a0fe2',name:'Sable Hart',title:'The Popular Girl Thinks You Hate Her (Mute POV)',blurb:'She thinks your silence means you hate her. eventually she actually asks.',image:'https://cdn.nd-api.com/avatars/f6795cc1-8dbf-46df-bcd7-0adec3544ba3.jpg?class=avatar256x256',tags:['mute POV','accessibility','popular girl'],creator:'@dragongraf',demoMessages:477,favorite:true,later:false,opened:true,hasLorebook:false,folder:'Accessibility'}
  ];

  let bots = [];
  let mode = localStorage.getItem('sqol-demo-mode') || DEFAULT_MODE;
  if (!VALID_MODES.has(mode)) mode = DEFAULT_MODE;
  let storedSettings = readStore(mode);
  let draftSettings = {};
  let app = readAppState();
  let activeBotId = app.activeBotId || 'b376faf0-8c37-4b37-8861-8ca68cdd64b6';

  init();

  async function init() {
    bots = await loadBots();
    hydrateBotState();
    setModeUI();
    renderRoute(app.route || 'home');
    loadMode(mode);
    bindGlobalEvents();
  }

  function bindGlobalEvents() {
    modeButtons.forEach(button => button.addEventListener('click', () => {
      const next = button.dataset.demoMode;
      if (!VALID_MODES.has(next) || next === mode) return;
      mode = next;
      localStorage.setItem('sqol-demo-mode', mode);
      storedSettings = readStore(mode);
      draftSettings = {};
      setModeUI();
      loadMode(mode);
      renderRoute(app.route || 'home');
    }));

    document.addEventListener('click', event => {
      const openSettings = event.target.closest('[data-demo-open-settings]');
      if (openSettings) { event.preventDefault(); openDrawer(); return; }
      if (event.target.closest('[data-demo-close-settings]') || event.target === backdrop) { closeDrawer(); return; }
      const routeButton = event.target.closest('[data-demo-route]');
      if (routeButton) { renderRoute(routeButton.dataset.demoRoute); return; }
      const botOpen = event.target.closest('[data-demo-open-bot]');
      if (botOpen) { activeBotId = botOpen.dataset.demoOpenBot; app.activeBotId = activeBotId; saveAppState(); renderRoute('profile'); return; }
      const chatOpen = event.target.closest('[data-demo-open-chat]');
      if (chatOpen) { activeBotId = chatOpen.dataset.demoOpenChat || activeBotId; app.activeBotId = activeBotId; saveAppState(); renderRoute('chat'); return; }
      const fav = event.target.closest('[data-demo-favorite]');
      if (fav) { toggleBotFlag(fav.dataset.demoFavorite, 'favorite'); return; }
      const later = event.target.closest('[data-demo-later]');
      if (later) { toggleBotFlag(later.dataset.demoLater, 'later'); return; }
      const block = event.target.closest('[data-demo-hide-bot]');
      if (block) { app.hiddenBots = unique([...(app.hiddenBots || []), block.dataset.demoHideBot]); saveAppState(); renderRoute(app.route); showToast('Bot hidden in demo only.'); return; }
      const restore = event.target.closest('[data-demo-restore-hidden]');
      if (restore) { app.hiddenBots = []; saveAppState(); renderRoute(app.route); showToast('Hidden demo bots restored.'); return; }
      const folder = event.target.closest('[data-demo-chat-folder]');
      if (folder) { app.chatFolder = folder.dataset.demoChatFolder; saveAppState(); renderRoute('chats'); return; }
      const persona = event.target.closest('[data-demo-persona-select]');
      if (persona) { app.persona = persona.dataset.demoPersonaSelect; saveAppState(); renderRoute('personas'); showToast(`Demo persona switched to ${app.persona}.`); return; }
      const saveEditor = event.target.closest('[data-demo-save-editor]');
      if (saveEditor) { showToast(`${saveEditor.dataset.demoSaveEditor} simulated. Nothing was saved to SpicyChat.`); return; }
      const simulated = event.target.closest('[data-demo-simulate]');
      if (simulated) { showToast(simulated.dataset.demoSimulate || 'Action simulated in the website demo.'); return; }
      const send = event.target.closest('[data-demo-send]');
      if (send) { addDummyMessage(); return; }
      const clearChat = event.target.closest('[data-demo-clear-chat]');
      if (clearChat) { app.messages = []; saveAppState(); renderRoute('chat'); return; }
      const resetChat = event.target.closest('[data-demo-reset-chat]');
      if (resetChat) { delete app.messages; saveAppState(); renderRoute('chat'); return; }
    });

    document.querySelector('[data-demo-reset]')?.addEventListener('click', () => {
      localStorage.removeItem(storageKey(mode)); storedSettings = {}; draftSettings = {};
      showToast(`${mode === 'dev' ? 'Development' : 'Stable'} demo settings reset.`); loadMode(mode);
    });
    document.querySelector('[data-demo-reset-app]')?.addEventListener('click', () => {
      localStorage.removeItem(APP_STATE_KEY); app = defaultAppState(); activeBotId = app.activeBotId; hydrateBotState(true); renderRoute('home'); closeDrawer(); showToast('Playground reset.');
    });
    document.querySelector('[data-demo-mobile-nav]')?.addEventListener('click', () => preview.classList.toggle('demo-nav-open'));

    routeHost.addEventListener('input', event => {
      if (event.target.matches('[data-demo-home-search]')) { app.homeSearch = event.target.value; saveAppState(); renderHomeResultsOnly(); }
    });
    routeHost.addEventListener('keydown', event => {
      if (event.target.matches('[data-demo-composer]') && event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); addDummyMessage(); }
    });

    window.addEventListener('message', event => {
      if (event.source !== frame.contentWindow || !event.data || typeof event.data !== 'object') return;
      const data = event.data;
      if (data.type === 'sqol-demo-storage' && data.mode === mode) {
        storedSettings = data.storage || {};
        localStorage.setItem(storageKey(mode), JSON.stringify(storedSettings));
        applyPreview({ ...storedSettings, ...draftSettings });
      }
      if (data.type === 'sqol-demo-draft' && data.mode === mode) {
        draftSettings = data.draft || {};
        applyPreview({ ...storedSettings, ...draftSettings });
      }
      if (data.type === 'sqol-demo-toast' && data.message) showToast(data.message);
    });
  }

  async function loadBots() {
    try {
      const response = await fetch('/data/demo/bots.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('bot data unavailable');
      const data = await response.json();
      return Array.isArray(data.bots) && data.bots.length ? data.bots : fallbackBots;
    } catch (_) { return fallbackBots; }
  }

  function defaultAppState() {
    return { route:'home', activeBotId:'b376faf0-8c37-4b37-8861-8ca68cdd64b6', hiddenBots:[], chatFolder:'All', persona:'Demo user', homeSearch:'', botFlags:{} };
  }
  function readAppState() { try { return { ...defaultAppState(), ...(JSON.parse(localStorage.getItem(APP_STATE_KEY) || '{}') || {}) }; } catch { return defaultAppState(); } }
  function saveAppState() { localStorage.setItem(APP_STATE_KEY, JSON.stringify(app)); }
  function hydrateBotState(reset=false) {
    if (reset) app.botFlags = {};
    bots.forEach(bot => {
      if (!app.botFlags[bot.id]) app.botFlags[bot.id] = { favorite: !!bot.favorite, later: !!bot.later, opened: !!bot.opened };
    });
    saveAppState();
  }
  function botState(bot) { return { ...bot, ...(app.botFlags[bot.id] || {}) }; }
  function toggleBotFlag(id, key) {
    const current = app.botFlags[id] || {};
    app.botFlags[id] = { ...current, [key]: !current[key] };
    saveAppState(); renderRoute(app.route); showToast(`${key === 'favorite' ? 'Favorite' : 'Later'} changed in demo only.`);
  }

  function renderRoute(route) {
    const valid = new Set(['home','chats','favorites','personas','creations','lorebooks','create','profile','chat']);
    if (!valid.has(route)) route = 'home';
    app.route = route; saveAppState();
    preview.classList.remove('demo-nav-open');
    document.querySelectorAll('[data-demo-route]').forEach(btn => btn.classList.toggle('active', btn.dataset.demoRoute === route));
    const labels = {
      home:['Home','safe public bot cards'], chats:['Chats','dummy saved conversations'], favorites:['Favorites','local demo favorites'], personas:['Personas','dummy persona manager'], creations:['My Creations','creator workflow demo'], lorebooks:['Lorebooks','dummy creator lorebooks'], create:['Create chatbot','safe editor simulation'], profile:['Chatbot profile','local demo profile'], chat:['Chat','dummy Yui conversation']
    };
    pageTitle.textContent = labels[route][0]; pageSubtitle.textContent = labels[route][1];
    if (route === 'home') renderHome();
    if (route === 'chats') renderChats();
    if (route === 'favorites') renderBotListing('Favorites', bots.filter(b => botState(b).favorite));
    if (route === 'personas') renderPersonas();
    if (route === 'creations') renderCreations();
    if (route === 'lorebooks') renderLorebooks();
    if (route === 'create') renderCreate();
    if (route === 'profile') renderProfile();
    if (route === 'chat') renderChat();
    applyPreview({ ...storedSettings, ...draftSettings });
  }

  function renderHome() {
    routeHost.innerHTML = `
      <section class="demo-view demo-home-view">
        <div class="demo-view-toolbar"><div><h3>For You</h3><p>Only safe cards from the creator's own collection are used here.</p></div><div class="demo-list-controls"><input type="search" data-demo-home-search value="${escapeAttr(app.homeSearch || '')}" placeholder="Search demo bots"><button type="button" data-demo-simulate="Smart filters opened in demo.">Filters</button><button type="button" data-demo-restore-hidden>Restore hidden</button></div></div>
        <div class="demo-native-carousel" data-preview="promo-secondary"><strong>Demo discovery banner</strong><span>A harmless native-style carousel slot for banner cleanup/refill tests.</span></div>
        <div class="demo-chip-row"><button class="active">For You</button><button>New</button><button>Following</button><button data-demo-simulate="Random visible demo bot selected.">Random</button></div>
        <div class="demo-bot-grid" data-demo-home-grid></div>
      </section>`;
    renderHomeResultsOnly();
  }

  function renderHomeResultsOnly() {
    const grid = routeHost.querySelector('[data-demo-home-grid]');
    if (!grid) return;
    const q = (app.homeSearch || '').trim().toLowerCase();
    let list = bots.filter(b => !(app.hiddenBots || []).includes(b.id));
    if (q) list = list.filter(b => [b.name,b.title,b.blurb,...(b.tags||[])].join(' ').toLowerCase().includes(q));
    list = filterCardsBySettings(list, { ...storedSettings, ...draftSettings });
    grid.innerHTML = list.length ? list.map(botCardHTML).join('') : `<div class="demo-empty-state"><strong>No cards match the current demo state.</strong><span>Try clearing the search/filter settings or restoring hidden bots.</span></div>`;
  }

  function renderBotListing(title, list) {
    const filtered = list.filter(b => !(app.hiddenBots || []).includes(b.id));
    routeHost.innerHTML = `<section class="demo-view"><div class="demo-view-toolbar"><div><h3>${escapeHTML(title)}</h3><p>${filtered.length} local demo bot${filtered.length===1?'':'s'}.</p></div><div class="demo-list-controls"><button data-demo-simulate="Saved Bots Hub filter opened.">Saved-state filter</button><button data-demo-simulate="Bot Organizer bulk mode opened.">Select</button></div></div><div class="demo-bot-grid">${filtered.map(botCardHTML).join('') || '<div class="demo-empty-state"><strong>Nothing here yet.</strong></div>'}</div></section>`;
  }

  function botCardHTML(bot) {
    const s = botState(bot);
    const settings = { ...storedSettings, ...draftSettings };
    const exact = boolSetting(settings,['showExactMessageCounts','exactMessageCounts','showExactBotMessageCounts']);
    const longDesc = boolSetting(settings,['showLongerCardDescriptions','longerCardDescriptions']);
    return `<article class="demo-bot-card" data-bot-id="${escapeAttr(bot.id)}">
      <button class="demo-card-image" type="button" data-demo-open-bot="${escapeAttr(bot.id)}"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt=""><span class="demo-card-overlay">View profile</span></button>
      <button type="button" class="demo-card-heart ${s.favorite?'active':''}" data-demo-favorite="${escapeAttr(bot.id)}" aria-label="Toggle favorite">♥</button>
      <button type="button" class="demo-card-later ${s.later?'active':''}" data-demo-later="${escapeAttr(bot.id)}" aria-label="Toggle Later">Later</button>
      <button type="button" class="demo-card-hide" data-demo-hide-bot="${escapeAttr(bot.id)}" aria-label="Hide bot in demo">×</button>
      <div class="demo-card-body"><div class="demo-card-name-row"><strong>${escapeHTML(bot.name)}</strong>${s.opened?'<span class="demo-opened-dot" title="Opened"></span>':''}</div><span class="demo-card-title">${escapeHTML(bot.title)}</span><p class="${longDesc?'expanded':''}">${escapeHTML(bot.blurb)}</p><div class="demo-tag-row">${(bot.tags||[]).slice(0,3).map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div><div class="demo-card-meta"><span>${escapeHTML(bot.creator||'@dragongraf')}</span><span>${exact ? Number(bot.demoMessages||0).toLocaleString() : compactNumber(bot.demoMessages||0)} msgs</span>${bot.hasLorebook?'<span class="demo-lorebook-mark">Lorebook</span>':''}</div></div>
    </article>`;
  }

  function renderChats() {
    const folders = ['All','Favorites','DID','Accessibility','Unfoldered'];
    let list = bots.filter(b => botState(b).opened).slice(0,6);
    if (app.chatFolder && app.chatFolder !== 'All') list = list.filter(b => (b.folder || 'Unfoldered') === app.chatFolder);
    routeHost.innerHTML = `<section class="demo-view demo-chats-view"><div class="demo-view-toolbar"><div><h3>Chats</h3><p>Dummy saved conversations with QoL folder/filter surfaces.</p></div><div class="demo-list-controls"><button data-demo-simulate="Select chats mode opened.">Select chats</button><button data-demo-simulate="Saved-state chat filter opened.">Saved-state filter</button></div></div><div class="demo-folder-tabs">${folders.map(f=>`<button class="${(app.chatFolder||'All')===f?'active':''}" data-demo-chat-folder="${escapeAttr(f)}">${escapeHTML(f)}</button>`).join('')}</div><div class="demo-chat-list">${list.map((b,i)=>chatRowHTML(b,i)).join('') || '<div class="demo-empty-state"><strong>No chats in this folder.</strong></div>'}</div></section>`;
  }
  function chatRowHTML(bot, i) {
    return `<article class="demo-chat-row"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt=""><button class="demo-chat-row-main" type="button" data-demo-open-chat="${escapeAttr(bot.id)}"><strong>${escapeHTML(bot.name)}</strong><span>${escapeHTML(i%2 ? 'Last dummy reply: this conversation is only here for the QoL demo.' : 'Last dummy reply: open this chat to test message tools and the composer.')}</span><small>${escapeHTML(bot.folder||'Unfoldered')} · ${12+i*7} messages · today</small></button><div class="demo-chat-row-actions"><button data-demo-simulate="Change Title simulated.">Rename</button><button data-demo-simulate="Clone Conversation simulated.">Clone</button><button data-demo-simulate="Remove Conversation simulated.">Remove</button></div></article>`;
  }

  function renderPersonas() {
    const personaManager = boolSetting({...storedSettings,...draftSettings},['enablePersonaManager','showPersonaManager','personaManagerEnabled']);
    const personas = [
      {name:'Demo user',note:'Default safe website persona',folder:'General',initial:'D'},
      {name:'Mechanic AU',note:'Used for Yui demo chats',folder:'Roleplay',initial:'M'},
      {name:'Dragon POV',note:'Generic fantasy test persona',folder:'Roleplay',initial:'R'}
    ];
    routeHost.innerHTML = `<section class="demo-view"><div class="demo-view-toolbar"><div><h3>Personas</h3><p>Dummy personas so Persona Manager/quick-switch UI has a safe surface.</p></div><div class="demo-list-controls">${personaManager?'<button data-demo-simulate="Persona folder manager opened.">Folders</button><button data-demo-simulate="Local Persona Library opened.">Local Library</button>':''}<button data-demo-simulate="Create persona simulated.">New persona</button></div></div><div class="demo-persona-grid">${personas.map(p=>`<article class="demo-persona-card ${app.persona===p.name?'selected':''}"><div class="demo-persona-avatar">${escapeHTML(p.initial)}</div><strong>${escapeHTML(p.name)}</strong><span>${escapeHTML(p.note)}</span>${personaManager?`<small>${escapeHTML(p.folder)} · ★ favorite</small>`:''}<button data-demo-persona-select="${escapeAttr(p.name)}">${app.persona===p.name?'Selected':'Use persona'}</button></article>`).join('')}</div></section>`;
  }

  function renderCreations() {
    const audit = boolSetting({...storedSettings,...draftSettings},['enableCreationAudit','creationAuditEnabled','showCreationAudit']);
    const backup = boolSetting({...storedSettings,...draftSettings},['enableChatbotBackupTools','chatbotBackupTools','showChatbotBackupTools']);
    routeHost.innerHTML = `<section class="demo-view"><div class="demo-view-toolbar"><div><h3>My Creations</h3><p>A safe creator listing using only this creator's SFW bot cards.</p></div><div class="demo-list-controls"><button data-demo-simulate="My Creations filters opened.">Filters</button><button data-demo-simulate="Load More simulated.">Load More</button><button data-demo-route="create">Create chatbot</button></div></div><div class="demo-creation-list">${bots.slice(0,6).map((b,i)=>`<article class="demo-creation-row"><img src="${escapeAttr(b.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt=""><div class="demo-creation-main"><strong>${escapeHTML(b.name)}</strong><span>${escapeHTML(b.title)}</span><small>Public · ${Number(b.demoMessages||0).toLocaleString()} messages ${b.hasLorebook?'· Lorebook attached':''}</small></div>${audit?`<span class="demo-audit ${i===4?'warn':'good'}">${i===4?'1 note':'Audit clear'}</span>`:''}<div class="demo-creation-actions">${backup?'<button data-demo-simulate="Backup saved locally in demo.">Backup</button>':''}<button data-demo-simulate="Editor opened in demo.">Edit</button></div></article>`).join('')}</div></section>`;
  }

  function renderLorebooks() {
    const backup = boolSetting({...storedSettings,...draftSettings},['enableLorebookBackupTools','lorebookBackupTools','showLorebookBackupTools']);
    const books = [
      {name:'Yui Workshop Notes',entries:12,bot:'Yui Kimura'},
      {name:'Rhea / System Context',entries:9,bot:'Rhea Mercer'},
      {name:'Dragon Hybrid World',entries:21,bot:'Seren Vale'}
    ];
    routeHost.innerHTML = `<section class="demo-view"><div class="demo-view-toolbar"><div><h3>Lorebooks</h3><p>Dummy entries/relationships for Lorebook tools and creator backups.</p></div><div class="demo-list-controls"><button data-demo-simulate="Create Lorebook simulated.">New Lorebook</button><button data-demo-simulate="Wiki / Web Importer opened with dummy content.">Importer</button></div></div><div class="demo-lorebook-list">${books.map((b,i)=>`<article class="demo-lorebook-row"><div class="demo-lorebook-icon">▤</div><div><strong>${escapeHTML(b.name)}</strong><span>${b.entries} entries · linked to ${escapeHTML(b.bot)}</span><small>${i===0?'Edited today':'Edited this week'}</small></div><div class="demo-lorebook-actions">${backup?'<button data-demo-simulate="Lorebook backup simulated.">Backup</button>':''}<button data-demo-simulate="Lorebook entries opened.">Entries</button><button data-demo-simulate="Lorebook editor opened.">Edit</button></div></article>`).join('')}</div></section>`;
  }

  function renderCreate() {
    const s = {...storedSettings,...draftSettings};
    const saveStay = boolSetting(s,['showSaveAndStay','enableSaveAndStay','creatorSaveAndStay']);
    const saveChat = boolSetting(s,['showSaveAndChat','enableSaveAndChat','creatorSaveAndChat']);
    const drafts = boolSetting(s,['enableChatbotDraftHistory','chatbotDraftHistory','showDraftHistory']);
    const backup = boolSetting(s,['enableChatbotBackupTools','chatbotBackupTools','showChatbotBackupTools']);
    routeHost.innerHTML = `<section class="demo-view demo-editor-view"><div class="demo-view-toolbar"><div><h3>Create chatbot</h3><p>Native-style form fields plus QoL creator controls. Nothing here can publish.</p></div><div class="demo-list-controls">${backup?'<button data-demo-simulate="Manual chatbot backup simulated.">Save backup</button>':''}${drafts?'<button data-demo-simulate="Draft History opened.">Draft History</button>':''}</div></div><div class="demo-editor-grid"><div class="demo-editor-main"><label>Name<input value="Yui Kimura — Demo Copy" maxlength="60"></label><label>Title<input value="The Mechanic She Trusts. AU — website demo"></label><label>Greeting<textarea rows="5">*Yui rolls a bike into the workshop and looks around.* This is placeholder SFW demo text.</textarea></label><label>Personality<textarea rows="5">Safe dummy creator text used only to show the editor surface.</textarea></label><label>Scenario<textarea rows="4">A workshop AU used for the website demonstration.</textarea></label><label>Example Dialogue<textarea rows="4">{{char}}: This is example demo dialogue.\n{{user}}: Nothing here is published.</textarea></label><label>Tags<input value="mechanic, AU, demo"></label></div><aside class="demo-editor-side"><div class="demo-editor-panel"><strong>QoL creator helpers</strong><button data-demo-simulate="{{char}} inserted into the active field.">Insert {{char}}</button><button data-demo-simulate="{{user}} inserted into the active field.">Insert {{user}}</button><button data-demo-simulate="Lorebook relationship selector opened.">Lorebook</button><button data-demo-simulate="Moderation wording check simulated.">Wording check</button></div><div class="demo-editor-panel"><strong>Save actions</strong><button data-demo-save-editor="Normal Save">Save</button>${saveStay?'<button data-demo-save-editor="Save & Stay">Save & Stay</button>':''}${saveChat?'<button data-demo-save-editor="Save & Chat">Save & Chat</button>':''}</div></aside></div></section>`;
  }

  function renderProfile() {
    const bot = bots.find(b=>b.id===activeBotId) || bots[0]; if (!bot) return;
    const s = botState(bot);
    routeHost.innerHTML = `<section class="demo-view demo-profile-view"><div class="demo-profile-hero"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt=""><div><span class="demo-profile-kicker">${escapeHTML(bot.creator||'@dragongraf')}</span><h3>${escapeHTML(bot.name)}</h3><p>${escapeHTML(bot.title)}</p><div class="demo-tag-row">${(bot.tags||[]).map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div><div class="demo-profile-actions"><button class="primary" data-demo-open-chat="${escapeAttr(bot.id)}">Start demo chat</button><button class="${s.favorite?'active':''}" data-demo-favorite="${escapeAttr(bot.id)}">♥ Favorite</button><button class="${s.later?'active':''}" data-demo-later="${escapeAttr(bot.id)}">Later</button></div></div></div><div class="demo-profile-body"><article><h4>Description</h4><p>${escapeHTML(bot.blurb)}</p></article><article><h4>Demo profile notes</h4><p>This fake profile exists so card/profile shortcuts, saved-state tools and bot status features have somewhere to land without opening SpicyChat.</p></article><article><h4>Stats</h4><p>${Number(bot.demoMessages||0).toLocaleString()} demo messages · ${bot.hasLorebook?'Lorebook attached':'No Lorebook'} · Public</p></article></div></section>`;
  }

  function renderChat() {
    const bot = bots.find(b=>b.id===activeBotId) || bots.find(b=>b.name==='Yui Kimura') || bots[0]; if (!bot) return;
    const messages = Array.isArray(app.messages) ? app.messages : presetMessages(bot.name);
    routeHost.innerHTML = `<section class="demo-view demo-chat-view"><div class="demo-chat-top"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt=""><div><strong>${escapeHTML(bot.name)}</strong><small>${escapeHTML(bot.creator||'@dragongraf')} · ${escapeHTML(app.persona || 'Demo user')}</small></div><div class="demo-chat-native-actions"><button data-demo-simulate="Rate Chatbot modal simulated.">👍</button><button data-demo-simulate="Model menu opened.">✦</button><button data-demo-simulate="Native chat menu opened.">⋮</button><button data-preview="chat-history" hidden data-demo-simulate="Chat history opened.">History</button><button data-preview="quick-new-chat" hidden data-demo-simulate="New chat simulated.">New chat</button><button data-preview="later" hidden data-demo-later="${escapeAttr(bot.id)}">Later</button></div></div><div class="fake-generation-profile" data-preview="generation-profile" hidden>Generation profile: <strong>Demo Balanced</strong></div><div class="demo-chat-context-row"><button data-demo-simulate="Context Keeper opened with dummy details.">Context Keeper</button><button data-demo-simulate="Message Bookmarks opened.">Bookmarks</button><button data-demo-simulate="Storydate / RP State demo opened.">Story / RP State</button><button data-demo-clear-chat>Clear</button><button data-demo-reset-chat>Reset</button></div><div class="fake-messages demo-full-messages" data-demo-messages>${messages.map(m=>messageHTML(m,bot)).join('')}</div><div class="fake-scroll-tools"><button type="button" data-preview="scroll-top" hidden title="Scroll to top">↑</button><button type="button" data-preview="scroll-bottom" hidden title="Scroll to bottom">↓</button></div><div class="fake-composer demo-full-composer"><div class="fake-composer-tools"><button>＋</button><button data-preview="image-button">Image</button><button data-preview="ooc-button" hidden>OOC</button><button data-preview="asterisk-button" hidden>*</button><button data-preview="voice-button">Voice</button><button data-preview="persona-switch" hidden>Persona</button><button data-preview="export-button" hidden>Export</button></div><div class="fake-compose-row"><textarea data-demo-composer rows="2" maxlength="500" placeholder="Type a dummy message… nothing gets sent anywhere."></textarea><button type="button" class="fake-send" data-demo-send>Send</button></div></div></section>`;
  }

  function presetMessages(botName) {
    return [
      {who:'bot',text:`*${botName} glances toward the demo controls.* This is fake SFW website text for testing message tools.`},
      {who:'user',text:'I am testing timestamps, quick actions, search, bookmarks and formatting.'},
      {who:'bot',text:'Try the QoL settings gear. This message is intentionally longer so bubble appearance, line spacing, generation metadata and display-only formatting changes are visible without using a real conversation.'},
      {who:'ooc',text:'[OOC: This is a preset demo OOC line.]'},
      {who:'user',text:'Search target: gearbox. `Backtick dialogue test.` *Action formatting test.*'},
      {who:'bot',text:'If an option normally needs the SpicyChat server, a browser permission, a download, or another tab, the playground only simulates the control.'}
    ];
  }
  function messageHTML(message, bot) {
    const who = message.who || 'user';
    const name = who==='bot' ? bot.name : who==='ooc' ? 'OOC' : (app.persona || 'Demo user');
    const avatar = who==='bot' ? `<img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="">` : `<span class="fake-message-avatar">${who==='ooc'?'O':'D'}</span>`;
    return `<article class="fake-message ${escapeAttr(who)}"><div class="fake-message-head">${avatar}<strong>${escapeHTML(name)}</strong><time data-preview="timestamps" hidden>${fakeTime()}</time><span class="fake-message-spacer"></span><div class="fake-message-quick" data-preview="quick-actions" hidden><button type="button" data-preview-action="copy" hidden>Copy</button><button type="button" data-preview-action="edit" hidden>Edit</button><button type="button" data-preview-action="report" hidden>Report</button></div><button type="button" class="fake-message-menu" data-preview="original-menu">⋮</button></div><div class="fake-message-text">${formatText(message.text||'')}</div>${who==='bot'?'<div class="fake-meta" data-preview="metadata" hidden><span data-preview="generation-model" hidden>Model: Demo Model</span><span data-preview="generation-elapsed" hidden>1.4s</span><span data-preview="generation-settings" hidden>T 0.8 · P 0.95</span></div>':''}</article>`;
  }

  function addDummyMessage() {
    const composer = routeHost.querySelector('[data-demo-composer]');
    if (!composer) return;
    const text = composer.value.trim(); if (!text) return;
    const current = Array.isArray(app.messages) ? app.messages : presetMessages((bots.find(b=>b.id===activeBotId)||{}).name || 'Yui Kimura');
    app.messages = [...current,{who:'user',text}]; saveAppState(); renderRoute('chat');
    requestAnimationFrame(()=>{ const host=routeHost.querySelector('[data-demo-messages]'); if(host) host.scrollTop=host.scrollHeight; });
  }

  function filterCardsBySettings(list, settings) {
    const on = settings.enabled !== false; if (!on) return list;
    let out = [...list];
    if (boolSetting(settings,['hideOpenedBots','hideOpenedCards','hideOpenedChats','hideOpenedOnHome'])) out = out.filter(b=>!botState(b).opened);
    if (boolSetting(settings,['hideFavoriteBots','hideFavoritesFromHome'])) out = out.filter(b=>!botState(b).favorite);
    if (boolSetting(settings,['hideOwnBots','recommendationsHideOwnBots'])) out = [];
    if (boolSetting(settings,['onlyLorebookBots','recommendationsLorebookOnly'])) out = out.filter(b=>b.hasLorebook);
    return out;
  }

  function applyPreview(settings = {}) {
    const on = settings.enabled !== false;
    const enabled = key => on && !!settings[key];
    toggleAll('[data-preview="quick-panel"]', enabled('showQuickPanel'));
    const panel = preview.querySelector('[data-preview="quick-panel"]'); if (panel) panel.dataset.placement = settings.quickPanelPlacement || 'bottom-right';
    toggleAll('[data-preview="timestamps"]', enabled('showMessageTimestamps'));
    toggleAll('[data-preview="metadata"]', enabled('showGenerationMetadata') || enabled('showGenerationModel') || enabled('showGenerationElapsed') || enabled('showGenerationSettings'));
    toggleAll('[data-preview="generation-model"]', enabled('showGenerationModel'));
    toggleAll('[data-preview="generation-elapsed"]', enabled('showGenerationElapsed'));
    toggleAll('[data-preview="generation-settings"]', enabled('showGenerationSettings'));
    toggleAll('[data-preview="generation-profile"]', enabled('enableGenerationProfiles'));
    toggleAll('[data-preview="quick-actions"]', enabled('showMessageQuickActions'));
    toggleAll('[data-preview-action="copy"]', enabled('showMessageQuickActions') && enabled('messageQuickActionCopy'));
    toggleAll('[data-preview-action="edit"]', enabled('showMessageQuickActions') && enabled('messageQuickActionEdit'));
    toggleAll('[data-preview-action="report"]', enabled('showMessageQuickActions') && enabled('messageQuickActionReport'));
    toggleAll('[data-preview="original-menu"]', !enabled('hideOriginalMessageDropdown'));
    toggleAll('[data-preview="scroll-top"]', enabled('showScrollToTopButton'));
    toggleAll('[data-preview="scroll-bottom"]', enabled('showScrollToBottomButton'));
    toggleAll('[data-preview="chat-history"]', enabled('showPerCharacterChatHistory'));
    toggleAll('[data-preview="quick-new-chat"]', enabled('showQuickNewChatButton'));
    toggleAll('[data-preview="later"]', enabled('chatTopBarAddLaterButton'));
    toggleAll('[data-preview="ooc-button"]', enabled('showOocTools') || enabled('replaceChatImageWithOocButton'));
    toggleAll('[data-preview="image-button"]', !enabled('hideChatImageButton') && !enabled('replaceChatImageWithOocButton'));
    toggleAll('[data-preview="asterisk-button"]', enabled('showAsteriskButton'));
    toggleAll('[data-preview="voice-button"]', !enabled('hideChatVoiceButton'));
    toggleAll('[data-preview="persona-switch"]', enabled('showPersonaQuickSwitch'));
    toggleAll('[data-preview="export-button"]', enabled('showChatExportButton'));
    toggleAll('[data-preview="panel-ooc"]', enabled('quickPanelShowOoc'));
    toggleAll('[data-preview="panel-persona"]', enabled('quickPanelShowPersona'));
    toggleAll('[data-preview="panel-export"]', enabled('quickPanelShowExport'));
    toggleAll('[data-preview="promo"]', !(enabled('hideAdvertBanners') || enabled('hidePremium')));
    sidebarRoute('home', !enabled('hideSidebarHome'));
    sidebarRoute('chats', !enabled('hideSidebarChats'));
    sidebarRoute('personas', !enabled('hideSidebarPersonas'));
    sidebarRoute('create', !(enabled('hideSidebarCreateMenu') || enabled('hideSidebarCreateChatbot')));
    sidebarRoute('favorites', !enabled('hideSidebarFavorites'));
    topbar('language', !enabled('hideTopBarLanguage'));
    topbar('theme', !enabled('hideTopBarTheme'));
    topbar('notifications', !(enabled('hideTopBarNotifications') || enabled('hideNotifications')));
    preview.classList.toggle('qol-disabled', !on);
    const density = firstSetting(settings,['cardDensity','botCardDensity','cardDensityPreset','listingCardDensity']);
    preview.dataset.cardDensity = String(density || 'normal').toLowerCase();
    if (app.route === 'home') renderHomeResultsOnly();
  }
  function toggleAll(selector, show) { preview.querySelectorAll(selector).forEach(el=>{el.hidden=!show;}); }
  function sidebarRoute(route, show) { preview.querySelector(`[data-demo-route="${route}"]`)?.toggleAttribute('hidden', !show); }
  function topbar(name, show) { preview.querySelector(`[data-topbar-item="${name}"]`)?.toggleAttribute('hidden', !show); }
  function boolSetting(settings, names) { return names.some(name => !!settings[name]); }
  function firstSetting(settings,names) { for (const name of names) if (settings[name] != null && settings[name] !== '') return settings[name]; return null; }

  function openDrawer() { drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); backdrop.hidden=false; document.body.classList.add('demo-drawer-open'); }
  function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); backdrop.hidden=true; document.body.classList.remove('demo-drawer-open'); }

  async function loadMode(nextMode) {
    let label = nextMode === 'dev' ? 'Development main' : 'Stable';
    if (nextMode === 'stable') { try { const s = await SQOLSource.stableLatest(); label = `Stable v${s.version || 'current'}`; } catch (_) {} }
    setSource('loading', `Loading ${label} settings from GitHub…`);
    placeholder.hidden = false;
    placeholder.innerHTML = '<strong>Loading settings…</strong><span>The real QoL options page will appear here.</span>';
    frame.removeAttribute('srcdoc'); frame.style.visibility = 'hidden';
    try {
      const source = await loadSettingsSource(nextMode);
      const manifest = JSON.parse(source.manifest.text);
      const version = manifest.version_name || manifest.version || 'unknown';
      let buildText = nextMode === 'dev' ? `main · v${version}` : `v${version}`;
      if (nextMode === 'dev') { try { const d = await SQOLSource.developmentLatest(); if (d.referenceCommit) buildText = `main · ${d.referenceCommit.slice(0,7)} · v${version}`; } catch (_) {} }
      buildLabel.textContent = buildText;
      setSource(source.live ? 'live' : 'fallback', source.live ? `${label} settings loaded from the public source repository.` : `${label} is using the bundled website snapshot because GitHub is temporarily unavailable.`);
      frame.srcdoc = buildSrcdoc(source, manifest, nextMode);
      frame.onload = () => { placeholder.hidden = true; frame.style.visibility='visible'; applyPreview({ ...readStore(nextMode), ...draftSettings }); };
    } catch (error) {
      buildLabel.textContent = 'temporarily unavailable';
      setSource('fallback', `Could not load the ${label} settings source right now.`);
      placeholder.hidden=false; placeholder.innerHTML='<strong>Settings demo is temporarily unavailable.</strong><span>The playground still works; refresh when GitHub is reachable again.</span>'; frame.style.visibility='hidden'; applyPreview(storedSettings);
    }
  }

  async function loadSettingsSource(project) {
    const fallbackBase = project === 'stable' ? '/data/demo/stable/' : '/data/demo/dev-current/';
    const names = [['html','options.html'],['css','options.css'],['registry','feature-registry.js'],['js','options.js'],['manifest','manifest.json'],['changelog','CHANGELOG.md']];
    const out = {};
    for (const [key,file] of names) {
      let fallback = null;
      try { const probe = await fetch(`${fallbackBase}${file}`,{method:'HEAD',cache:'no-store'}); if (probe.ok) fallback=`${fallbackBase}${file}`; } catch (_) {}
      out[key] = await SQOLSource.text(project,file,fallback);
    }
    out.live = names.every(([key]) => out[key].source !== 'fallback'); return out;
  }

  function buildSrcdoc(source, manifest, sourceMode) {
    let html = source.html.text.replace(/<link[^>]+href=["']options\.css["'][^>]*>/i,'').replace(/<script[^>]+src=["']feature-registry\.js["'][^>]*><\/script>/i,'').replace(/<script[^>]+src=["']options\.js["'][^>]*><\/script>/i,'');
    const shim=makeShim(sourceMode,manifest,source.changelog.text), bridge=makeBridge(sourceMode), registry=safeScript(source.registry.text), options=safeScript(source.js.text);
    const extraCss=`html{color-scheme:dark}body{min-width:0!important}main{max-width:980px!important;padding:20px 20px 90px!important}header{position:static!important}.help-link[href^="http"]{cursor:not-allowed}.demo-only-banner{background:#23161c;border:1px solid rgba(236,61,104,.28);border-radius:12px;padding:10px 12px;margin-bottom:14px;color:#d7c9cf;font-size:13px}.demo-only-banner strong{color:#ff91a8}`;
    html=html.replace('</head>',`<style>${source.css.text}\n${extraCss}</style><script>${shim}<\/script></head>`);
    html=html.replace(/<main([^>]*)>/i,'<main$1><div class="demo-only-banner"><strong>Website demo:</strong> real QoL settings UI, sandboxed storage/actions. Nothing connects to your SpicyChat account.</div>');
    html=html.replace('</body>',`<script>${registry}<\/script><script>${options}<\/script><script>${bridge}<\/script></body>`); return html;
  }
  function safeScript(text){return String(text||'').replace(/<\/script/gi,'<\\/script');}

  function makeShim(sourceMode, manifest, changelog) {
    const safeManifest=JSON.stringify(manifest).replace(/</g,'\\u003c'), safeChangelog=JSON.stringify(changelog).replace(/</g,'\\u003c'), safeMode=JSON.stringify(sourceMode);
    return `( ()=>{const MODE=${safeMode};const KEY='sqol-demo-storage-'+MODE;const MANIFEST=${safeManifest};const CHANGELOG=${safeChangelog};const changeListeners=[];const runtimeListeners=[];const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return {}}};const notify=(changes)=>{changeListeners.forEach(fn=>{try{fn(changes,'local')}catch{}})};const write=(next,changes={})=>{localStorage.setItem(KEY,JSON.stringify(next));notify(changes);parent.postMessage({type:'sqol-demo-storage',mode:MODE,storage:next},'*')};const pick=(store,keys)=>{if(keys==null)return {...store};if(typeof keys==='string')return Object.prototype.hasOwnProperty.call(store,keys)?{[keys]:store[keys]}:{};if(Array.isArray(keys)){const o={};keys.forEach(k=>{if(Object.prototype.hasOwnProperty.call(store,k))o[k]=store[k]});return o}if(typeof keys==='object'){const o={};Object.keys(keys).forEach(k=>o[k]=store[k]===undefined?keys[k]:store[k]);return o}return {}};const done=(cb,value)=>{if(typeof cb==='function'){queueMicrotask(()=>cb(value));return undefined}return Promise.resolve(value)};const storage={get(keys,cb){return done(cb,pick(read(),keys))},getKeys(cb){return done(cb,Object.keys(read()))},set(obj,cb){const prev=read(),next={...prev,...(obj||{})},changes={};Object.entries(obj||{}).forEach(([k,v])=>{if(prev[k]!==v)changes[k]={oldValue:prev[k],newValue:v}});write(next,changes);return done(cb)},remove(keys,cb){const prev=read(),next={...prev},changes={};(Array.isArray(keys)?keys:[keys]).forEach(k=>{if(Object.prototype.hasOwnProperty.call(next,k)){changes[k]={oldValue:next[k],newValue:undefined};delete next[k]}});write(next,changes);return done(cb)},clear(cb){const prev=read(),changes={};Object.keys(prev).forEach(k=>changes[k]={oldValue:prev[k],newValue:undefined});write({},changes);return done(cb)},getBytesInUse(keys,cb){const bytes=new TextEncoder().encode(JSON.stringify(pick(read(),keys))).length;return done(cb,bytes)}};const event=(list)=>({addListener(fn){if(typeof fn==='function'&&!list.includes(fn))list.push(fn)},removeListener(fn){const i=list.indexOf(fn);if(i>=0)list.splice(i,1)},hasListener(fn){return list.includes(fn)}});const demoToast=(message)=>parent.postMessage({type:'sqol-demo-toast',message},'*');const runtimeResponse=(msg)=>{if(msg&&msg.type==='DS_AUTO_AFK_RUN_NOW')return {ok:true,summary:{at:Date.now(),enabled:true,monitored:4,protected:1,recent:2,eligible:1,cleaned:1,failed:0}};if(msg&&msg.type==='DS_GET_DIAGNOSTIC_CONTEXT')return {ok:true,url:'https://demo.invalid/chat/yui',pageType:'chat',title:'Yui Kimura — website demo'};if(msg&&msg.type==='DS_GET_PAGE_DIAGNOSTICS')return {ok:true,environment:{browser:'Website demo',platform:'demo'},scheduler:{demo:true}};return {ok:true,demo:true}};window.chrome=window.chrome||{};chrome.storage={local:storage,onChanged:event(changeListeners)};chrome.runtime={lastError:null,onMessage:event(runtimeListeners),getManifest:()=>MANIFEST,getPlatformInfo:(cb)=>done(cb,{os:'android',arch:'x86-64',nacl_arch:'x86-64'}),getURL:(path)=>path==='CHANGELOG.md'?'data:text/plain;charset=utf-8,'+encodeURIComponent(CHANGELOG):'data:text/plain;charset=utf-8,',sendMessage:(msg,cb)=>done(cb,runtimeResponse(msg))};chrome.permissions={contains:(q,cb)=>done(cb,false),request:(q,cb)=>{demoToast('Permission request simulated in the website demo.');return done(cb,false)},remove:(q,cb)=>done(cb,true)};chrome.tabs={create:(info,cb)=>{demoToast('Opening browser tabs is disabled in the website demo.');return done(cb,{id:999,url:info?.url||'about:blank',active:true})},query:(q,cb)=>done(cb,[{id:999,active:true,currentWindow:true,url:'https://demo.invalid/chat/yui',title:'Yui Kimura — website demo'}]),sendMessage:(id,msg,cb)=>done(cb,runtimeResponse(msg))};chrome.downloads={download:(info,cb)=>{demoToast('Download action simulated; no file was created.');return done(cb,1)}};chrome.notifications={create:(id,opts,cb)=>{demoToast('Browser notification simulated.');return done(cb,id||'demo')}};try{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{demoToast('Copied inside the demo only.')}},configurable:true})}catch{}window.open=()=>{demoToast('External links are disabled inside the demo.');return null};addEventListener('click',e=>{const a=e.target.closest?.('a');if(!a)return;if(a.href||a.download){e.preventDefault();e.stopImmediatePropagation();demoToast(a.download?'Demo download action simulated.':'External links are disabled inside the demo.')}},true);})();`;
  }

  function makeBridge(sourceMode) {
    const safeMode=JSON.stringify(sourceMode);
    return `( ()=>{const MODE=${safeMode};function draft(){const d={};document.querySelectorAll('input[id],select[id],textarea[id]').forEach(el=>{if(el.type==='checkbox')d[el.id]=el.checked;else if(el.type==='radio'){if(el.checked&&el.name)d[el.name]=el.value}else d[el.id]=el.value});parent.postMessage({type:'sqol-demo-draft',mode:MODE,draft:d},'*')}document.addEventListener('change',()=>setTimeout(draft,0));document.addEventListener('input',e=>{if(e.target.matches('select,input[type=range],input[type=number]'))setTimeout(draft,0)});setTimeout(()=>{draft();chrome.storage.local.get(null,s=>parent.postMessage({type:'sqol-demo-storage',mode:MODE,storage:s},'*'))},700);})();`;
  }

  function setModeUI(){modeButtons.forEach(button=>button.classList.toggle('active',button.dataset.demoMode===mode));modeBadge.textContent=mode==='dev'?'Development':'Stable';modeBadge.className=`badge ${mode==='dev'?'warn':'good'}`;}
  function setSource(kind,text){sourceState.className=`source-state ${kind==='live'?'live':kind==='fallback'?'fallback':''}`;sourceState.textContent=text;}
  function storageKey(which){return `sqol-demo-storage-${which}`;}
  function readStore(which){try{return JSON.parse(localStorage.getItem(storageKey(which))||'{}')||{}}catch{return {}}}
  function formatText(text){return escapeHTML(text).replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>');}
  function fakeTime(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
  function compactNumber(n){n=Number(n)||0;return n>=1000?`${(n/1000).toFixed(n>=10000?0:1).replace('.0','')}k`:String(n);}
  function unique(arr){return [...new Set(arr)];}
  function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function escapeAttr(value){return escapeHTML(value);}
  let toastTimer; function showToast(message){clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;toastTimer=setTimeout(()=>toast.hidden=true,2600);}
})();
