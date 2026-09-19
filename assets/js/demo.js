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
  const runtimeBadge = document.querySelector('[data-demo-runtime-source]');
  const DEFAULT_MODE = 'stable';
  const VALID_MODES = new Set(['stable', 'dev']);
  const APP_STATE_KEY = 'sqol-demo-app-v4';
  const CREATOR = '@dragongraf1312';
  const DEFAULT_BOT = 'b376faf0-8c37-4b37-8861-8ca68cdd64b6';

  const fallbackBots = [
    {id:DEFAULT_BOT,name:'Yui Kimura',title:'The Mechanic She Trusts. AU',blurb:'Safe dummy fallback data for the website playground.',image:'https://cdn.nd-api.com/avatars/0fb19108-bfb0-453e-85f3-3b5a2655ce29.png',tags:['Female','MalePOV','Romantic','Fictional Media'],creator:CREATOR,demoMessages:442,favorite:true,later:true,opened:true,hasLorebook:true,folder:'Fandom'},
    {id:'5d2df83e-1ee3-4654-8897-c280742a0fe2',name:'Sable Hart',title:'The Popular Girl Thinks You Hate Her (Mute POV)',blurb:'Safe dummy fallback data for the website playground.',image:'https://cdn.nd-api.com/avatars/f6795cc1-8dbf-46df-bcd7-0adec3544ba3.jpg',tags:['Female','MalePOV','Romantic','Drama'],creator:CREATOR,demoMessages:80400,favorite:true,later:false,opened:true,hasLorebook:true,folder:'Accessibility'}
  ];

  let bots = [];
  let mode = localStorage.getItem('sqol-demo-mode') || DEFAULT_MODE;
  if (!VALID_MODES.has(mode)) mode = DEFAULT_MODE;
  let storedSettings = readStore(mode);
  let draftSettings = {};
  let app = readAppState();
  let activeBotId = app.activeBotId || DEFAULT_BOT;
  let currentManifest = null;
  let replyRules = [];

  init();

  async function init() {
    bots = await loadBots();
    replyRules = await loadReplyRules();
    if (!bots.some(b => b.id === activeBotId)) activeBotId = bots.find(b=>b.name==='Yui Kimura')?.id || bots[0]?.id || DEFAULT_BOT;
    app.activeBotId = activeBotId;
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
      if (routeButton) { event.preventDefault(); renderRoute(routeButton.dataset.demoRoute); return; }

      const botProfile = event.target.closest('[data-demo-open-bot]');
      if (botProfile) { event.preventDefault(); activeBotId = botProfile.dataset.demoOpenBot; app.activeBotId = activeBotId; saveAppState(); renderRoute('profile'); return; }
      const botChat = event.target.closest('[data-demo-open-chat]');
      if (botChat) { event.preventDefault(); activeBotId = botChat.dataset.demoOpenChat || activeBotId; app.activeBotId = activeBotId; app.botFlags[activeBotId] = { ...(app.botFlags[activeBotId] || {}), opened:true }; saveAppState(); renderRoute('chat'); return; }
      const creator = event.target.closest('[data-demo-open-creator]');
      if (creator) { event.preventDefault(); renderRoute('creator'); return; }

      const fav = event.target.closest('[data-demo-favorite]');
      if (fav) { event.preventDefault(); toggleBotFlag(fav.dataset.demoFavorite, 'favorite'); return; }
      const later = event.target.closest('[data-demo-later]');
      if (later) { event.preventDefault(); toggleBotFlag(later.dataset.demoLater, 'later'); return; }
      const block = event.target.closest('[data-demo-hide-bot]');
      if (block) { event.preventDefault(); app.hiddenBots = unique([...(app.hiddenBots || []), block.dataset.demoHideBot]); saveAppState(); renderRoute(app.route); showToast('Hidden in this playground only.'); return; }
      const restore = event.target.closest('[data-demo-restore-hidden]');
      if (restore) { app.hiddenBots = []; saveAppState(); renderRoute(app.route); showToast('Hidden demo cards restored.'); return; }

      const filterToggle = event.target.closest('[data-demo-filter-toggle]');
      if (filterToggle) { app.filtersOpen = !app.filtersOpen; saveAppState(); renderRoute('home'); return; }
      const filterChip = event.target.closest('[data-demo-filter-chip]');
      if (filterChip) { app.quickFilter = app.quickFilter === filterChip.dataset.demoFilterChip ? '' : filterChip.dataset.demoFilterChip; saveAppState(); renderHomeResultsOnly(); syncHomeFilterControls(); return; }
      const resetFilters = event.target.closest('[data-demo-reset-filters]');
      if (resetFilters) { app.quickFilter=''; app.homeSearch=''; saveAppState(); renderRoute('home'); return; }

      const folder = event.target.closest('[data-demo-chat-folder]');
      if (folder) { app.chatFolder = folder.dataset.demoChatFolder; saveAppState(); renderRoute('chats'); return; }
      const persona = event.target.closest('[data-demo-persona-select]');
      if (persona) { app.persona = persona.dataset.demoPersonaSelect; saveAppState(); renderRoute('personas'); showToast(`Demo persona switched to ${app.persona}.`); return; }
      const editPersona = event.target.closest('[data-demo-persona-edit]');
      if (editPersona) { app.activePersonaName = editPersona.dataset.demoPersonaEdit; saveAppState(); renderRoute('persona-edit'); return; }
      const createPersona = event.target.closest('[data-demo-persona-create]');
      if (createPersona) { app.activePersonaName = ''; saveAppState(); renderRoute('persona-create'); return; }
      const savePersona = event.target.closest('[data-demo-save-persona]');
      if (savePersona) { savePersonaFromEditor(savePersona.dataset.demoSavePersona === 'create'); return; }
      const editCreation = event.target.closest('[data-demo-edit-bot]');
      if (editCreation) { activeBotId=editCreation.dataset.demoEditBot; app.activeBotId=activeBotId; saveAppState(); renderRoute('create'); return; }
      const editLorebook = event.target.closest('[data-demo-edit-lorebook]');
      if (editLorebook) { app.activeLorebook=editLorebook.dataset.demoEditLorebook || 'wayfarer'; app.loreTab=editLorebook.dataset.demoLorebookTab || 'details'; saveAppState(); renderRoute('lorebook-edit'); return; }
      const createLorebook = event.target.closest('[data-demo-create-lorebook]');
      if (createLorebook) { createLorebookFromEditor(); return; }
      const saveLorebookDetails = event.target.closest('[data-demo-save-lorebook-details]');
      if (saveLorebookDetails) { saveLorebookDetailsFromEditor(); return; }

      const advanced = event.target.closest('[data-demo-toggle-advanced]');
      if (advanced) { app.editorAdvancedOpen = !app.editorAdvancedOpen; saveAppState(); renderRoute('create'); return; }
      const loreTab = event.target.closest('[data-demo-lore-tab]');
      if (loreTab) { app.loreTab = loreTab.dataset.demoLoreTab; saveAppState(); renderRoute('lorebook-edit'); return; }

      const fill = event.target.closest('[data-demo-fill]');
      if (fill) { fillEditorField(fill.dataset.demoFill); return; }
      const insert = event.target.closest('[data-demo-insert]');
      if (insert) { insertIntoActiveEditor(insert.dataset.demoInsert); return; }
      const saveEditor = event.target.closest('[data-demo-save-editor]');
      if (saveEditor) { saveChatbotEditor(saveEditor.dataset.demoSaveEditor); return; }
      const dismissPromo = event.target.closest('[data-demo-dismiss-promo]');
      if (dismissPromo) { app.promoDismissed = true; saveAppState(); renderRoute(app.route); return; }
      const creatorFollow = event.target.closest('[data-demo-creator-follow]');
      if (creatorFollow) { app.creatorFollowed = !app.creatorFollowed; saveAppState(); renderRoute('creator'); return; }
      const chatSearchToggle = event.target.closest('[data-demo-chat-search-toggle]');
      if (chatSearchToggle) { app.chatSearchOpen = !app.chatSearchOpen; saveAppState(); renderRoute('chats'); return; }
      const scrollTopButton = event.target.closest('[data-preview="scroll-top"]');
      if (scrollTopButton) { scrollDemoOrPage('top'); return; }
      const scrollBottomButton = event.target.closest('[data-preview="scroll-bottom"]');
      if (scrollBottomButton) { scrollDemoOrPage('bottom'); return; }
      const composeToken = event.target.closest('[data-demo-compose-token]');
      if (composeToken) { insertComposerToken(composeToken.dataset.demoComposeToken || ''); return; }
      const exportChat = event.target.closest('[data-demo-export-chat]');
      if (exportChat) { exportDemoChat(); return; }
      const copyAction = event.target.closest('[data-preview-action="copy"]');
      if (copyAction) { copyDemoMessage(copyAction); return; }
      const editAction = event.target.closest('[data-preview-action="edit"]');
      if (editAction) { editDemoMessage(editAction); return; }
      const inert = event.target.closest('[data-demo-inert]');
      if (inert) { event.preventDefault(); return; }
      const send = event.target.closest('[data-demo-send]');
      if (send) { addDummyMessage(); return; }
      const clearChat = event.target.closest('[data-demo-clear-chat]');
      if (clearChat) { const bot=bots.find(b=>b.id===activeBotId)||bots[0]; setCurrentMessages(bot,[]); renderRoute('chat'); return; }
      const resetChat = event.target.closest('[data-demo-reset-chat]');
      if (resetChat) { const bot=bots.find(b=>b.id===activeBotId)||bots[0]; resetCurrentMessages(bot); renderRoute('chat'); return; }
    });

    routeHost.addEventListener('input', event => {
      if (event.target.matches('[data-demo-home-search]')) { app.homeSearch = event.target.value; saveAppState(); renderHomeResultsOnly(); }
      if (event.target.matches('[data-demo-creation-search]')) { app.creationSearch = event.target.value; saveAppState(); renderCreationsResultsOnly(); }
      if (event.target.matches('[data-demo-persona-search]')) { app.personaSearch = event.target.value; saveAppState(); renderPersonasResultsOnly(); }
      if (event.target.matches('[data-demo-chat-search]')) { app.chatSearch = event.target.value; saveAppState(); renderChatsResultsOnly(); }
    });
    routeHost.addEventListener('change', event => {
      if (event.target.matches('[data-demo-home-sort]')) { app.homeSort = event.target.value; saveAppState(); renderHomeResultsOnly(); }
      if (event.target.matches('[data-demo-chat-sort]')) { app.chatSort = event.target.value; saveAppState(); renderRoute('chats'); }
    });
    routeHost.addEventListener('keydown', event => {
      if (event.target.matches('[data-demo-composer]') && event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); addDummyMessage(); }
    });

    document.querySelector('[data-demo-reset]')?.addEventListener('click', () => {
      localStorage.removeItem(storageKey(mode)); storedSettings = {}; draftSettings = {};
      showToast(`${mode === 'dev' ? 'Development' : 'Stable'} demo settings reset.`); loadMode(mode);
    });
    document.querySelector('[data-demo-reset-app]')?.addEventListener('click', () => {
      localStorage.removeItem(APP_STATE_KEY); app = defaultAppState(); activeBotId = app.activeBotId; hydrateBotState(true); renderRoute('home'); closeDrawer(); showToast('Playground reset.');
    });
    document.querySelectorAll('[data-demo-mobile-nav]').forEach(button => button.addEventListener('click', () => preview.classList.toggle('demo-nav-open')));

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
      if (!response.ok) throw new Error('demo bot data unavailable');
      const data = await response.json();
      const list = Array.isArray(data.bots) ? data.bots : [];
      return list.filter(b => b && b.nsfw !== true && b.visibility !== 'archived').length ? list.filter(b => b && b.nsfw !== true && b.visibility !== 'archived') : fallbackBots;
    } catch (_) { return fallbackBots; }
  }


  async function loadReplyRules() {
    try {
      const response = await fetch('/data/demo/replies.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('demo reply data unavailable');
      const data = await response.json();
      return Array.isArray(data.rules) ? data.rules : [];
    } catch (_) {
      return [
        { keywords:['hello','hi','hey'], replies:['Hey. This is a local preset reply from {bot}.'] },
        { keywords:['demo','qol','setting','settings'], replies:['The website is only matching your message against local reply presets. No AI or SpicyChat request is involved.'] },
        { keywords:['lorebook','lore'], replies:['Lorebook keyword spotted. In the playground, Lorebooks are local dummy data only.'] },
        { keywords:['persona'], replies:['Persona keyword spotted. The active demo persona stays local to this browser.'] },
        { keywords:['dragon'], replies:['Dragon keyword spotted. {bot} gives you a cautious look, clearly waiting to see where you take the scene.'] },
        { keywords:['raptor','indoraptor'], replies:['Raptor keyword spotted. {bot} pauses, alert and watchful.'] }
      ];
    }
  }

  function defaultAppState() {
    return { route:'home', activeBotId:DEFAULT_BOT, hiddenBots:[], chatFolder:'All', persona:'Demo user', homeSearch:'', homeSort:'Trending', quickFilter:'', filtersOpen:false, creationSearch:'', personaSearch:'', chatSearch:'', chatSearchOpen:false, botFlags:{}, editorAdvancedOpen:false, loreTab:'entries', activeLorebook:'wayfarer', activePersonaName:'Demo user', customPersonas:[], personaOverrides:{}, customLorebooks:[], lorebookOverrides:{}, creatorFollowed:false, promoDismissed:false, botTyping:false, typingBotId:'', messagesByBot:{} };
  }
  function readAppState() { try { return { ...defaultAppState(), ...(JSON.parse(localStorage.getItem(APP_STATE_KEY) || '{}') || {}) }; } catch { return defaultAppState(); } }
  function saveAppState() { localStorage.setItem(APP_STATE_KEY, JSON.stringify(app)); }
  function hydrateBotState(reset=false) {
    if (reset) app.botFlags = {};
    bots.forEach(bot => { if (!app.botFlags[bot.id]) app.botFlags[bot.id] = { favorite: !!bot.favorite, later: !!bot.later, opened: !!bot.opened }; });
    saveAppState();
  }
  function botState(bot) { return { ...bot, ...(app.botFlags[bot.id] || {}) }; }
  function toggleBotFlag(id, key) {
    const current = app.botFlags[id] || {};
    app.botFlags[id] = { ...current, [key]: !current[key] };
    saveAppState(); renderRoute(app.route); showToast(`${key === 'favorite' ? 'Favorite' : 'Later'} changed in demo only.`);
  }

  function renderRoute(route) {
    const valid = new Set(['home','chats','favorites','personas','persona-create','persona-edit','creations','lorebooks','create','lorebook-create','lorebook-edit','profile','creator','chat']);
    if (!valid.has(route)) route = 'home';
    app.route = route; saveAppState();
    preview.classList.remove('demo-nav-open');
    const activeSidebarRoute = ['profile','creator'].includes(route) ? 'home' : route === 'persona-create' || route === 'persona-edit' ? 'personas' : route === 'lorebook-create' || route === 'lorebook-edit' ? 'lorebooks' : route;
    document.querySelectorAll('[data-demo-route]').forEach(btn => btn.classList.toggle('active', btn.dataset.demoRoute === activeSidebarRoute));
    const labels = {
      home:['Home','SFW creator cards'], chats:['Chats','dummy saved conversations'], favorites:['Favorites','local demo favorites'], personas:['My Personas','dummy persona data'], 'persona-create':['Create Persona','safe local persona editor'], 'persona-edit':['Edit Persona','safe local persona editor'], creations:['My Creations','creator workflow sandbox'], lorebooks:['My Lorebooks','dummy lorebook data'], create:['Chatbot editor','safe editor sandbox'], 'lorebook-create':['Create Lorebook','safe lorebook sandbox'], 'lorebook-edit':['Edit Lorebook','details and entries'], profile:['Chatbot profile','local sandbox profile'], creator:['Creator profile',CREATOR], chat:['Chat','dummy conversation']
    };
    pageTitle.textContent = labels[route][0]; pageSubtitle.textContent = labels[route][1];
    if (route === 'home') renderHome();
    if (route === 'chats') renderChats();
    if (route === 'favorites') renderBotListing('Favorites', bots.filter(b => botState(b).favorite));
    if (route === 'personas') renderPersonas();
    if (route === 'persona-create') renderPersonaEditor(true);
    if (route === 'persona-edit') renderPersonaEditor(false);
    if (route === 'creations') renderCreations();
    if (route === 'lorebooks') renderLorebooks();
    if (route === 'create') renderCreate();
    if (route === 'lorebook-create') renderLorebookCreate();
    if (route === 'lorebook-edit') renderLorebookEdit();
    if (route === 'profile') renderProfile();
    if (route === 'creator') renderCreator();
    if (route === 'chat') renderChat();
    applyPreview({ ...storedSettings, ...draftSettings });
  }

  function renderHome() {
    routeHost.innerHTML = `<section class="demo-view demo-home-view" data-testid="SearchClientCharacterListing">
      ${app.promoDismissed?'':`<div class="demo-sc-carousel" data-preview="promo"><div><strong>Build Worlds They Remember</strong><span>Harmless demo banner so QoL cleanup can remove a real-looking promo surface.</span></div><button data-demo-dismiss-promo aria-label="Dismiss banner">×</button></div>`}
      <div class="demo-sc-toolbar">
        <div class="demo-sc-search-group"><button class="demo-square-button" aria-label="filter" data-demo-filter-toggle title="Filters">☷</button><label class="demo-search-input"><span>⌕</span><input data-demo-home-search value="${escapeAttr(app.homeSearch||'')}" placeholder="Dive into endless fantasies - start searching!"></label></div>
        <div class="demo-sc-toolbar-right"><label class="demo-nsfw-switch" title="Locked off in this SFW website demo"><input type="checkbox" disabled><span></span><b>NSFW</b></label><select data-demo-home-sort aria-label="Sort bots"><option ${app.homeSort==='Trending'?'selected':''}>Trending</option><option ${app.homeSort==='Newest'?'selected':''}>Newest</option><option ${app.homeSort==='Name'?'selected':''}>Name</option><option ${app.homeSort==='Messages'?'selected':''}>Messages</option></select></div>
      </div>
      <div class="demo-home-stats"><span data-demo-result-count></span><div class="demo-quick-filter-row"><button data-demo-filter-chip="opened">Opened</button><button data-demo-filter-chip="favorites">Favorites</button><button data-demo-filter-chip="later">Later</button><button data-demo-filter-chip="lorebook">Lorebook</button><button data-demo-reset-filters>Clear</button><button data-demo-restore-hidden>Restore hidden</button></div></div>
      <div class="demo-native-listing-layout ${app.filtersOpen?'filters-open':''}">
        ${app.filtersOpen ? homeFilterPanelHTML() : ''}
        <div class="demo-sc-card-grid" data-demo-home-grid></div>
      </div>
    </section>`;
    renderHomeResultsOnly(); syncHomeFilterControls();
  }

  function homeFilterPanelHTML() {
    return `<aside class="demo-native-filter-panel" aria-label="Home filters"><div class="demo-filter-head"><strong>Filters</strong><button data-demo-filter-toggle>×</button></div><section><span>Saved state</span><button data-demo-filter-chip="opened">Opened</button><button data-demo-filter-chip="favorites">Favorites</button><button data-demo-filter-chip="later">Later</button></section><section><span>Lorebook</span><button data-demo-filter-chip="lorebook">Has Lorebook</button></section><section><span>Language</span><label><input type="checkbox" checked disabled> English / untagged</label><small>The public sandbox is SFW and English-first.</small></section><section><span>Creator</span><div class="demo-filter-token">${CREATOR}</div></section></aside>`;
  }

  function homeFilteredList() {
    const q = (app.homeSearch || '').trim().toLowerCase();
    let list = bots.filter(b => !(app.hiddenBots || []).includes(b.id));
    if (q) list = list.filter(b => [b.name,b.title,b.blurb,b.creator,...(b.tags||[])].join(' ').toLowerCase().includes(q));
    if (app.quickFilter === 'opened') list = list.filter(b => botState(b).opened);
    if (app.quickFilter === 'favorites') list = list.filter(b => botState(b).favorite);
    if (app.quickFilter === 'later') list = list.filter(b => botState(b).later);
    if (app.quickFilter === 'lorebook') list = list.filter(b => b.hasLorebook);
    list = filterCardsBySettings(list, { ...storedSettings, ...draftSettings });
    const sort=app.homeSort||'Trending';
    if (sort==='Name') list.sort((a,b)=>a.name.localeCompare(b.name));
    if (sort==='Messages') list.sort((a,b)=>(b.demoMessages||0)-(a.demoMessages||0));
    if (sort==='Newest') list=[...list].reverse();
    return list;
  }

  function renderHomeResultsOnly() {
    const grid = routeHost.querySelector('[data-demo-home-grid]'); if (!grid) return;
    const list = homeFilteredList();
    const count = routeHost.querySelector('[data-demo-result-count]'); if (count) count.textContent = `${list.length} SFW demo result${list.length===1?'':'s'} from ${CREATOR}`;
    grid.innerHTML = list.length ? list.map(botCardHTML).join('') : `<div class="demo-empty-state"><strong>No cards match this demo state.</strong><span>Clear the search/filter or restore hidden bots.</span></div>`;
  }

  function syncHomeFilterControls() {
    routeHost.querySelectorAll('[data-demo-filter-chip]').forEach(btn=>btn.classList.toggle('active',btn.dataset.demoFilterChip===app.quickFilter));
  }

  function renderBotListing(title, list) {
    const filtered = list.filter(b => !(app.hiddenBots || []).includes(b.id));
    routeHost.innerHTML = `<section class="demo-view"><div class="demo-view-toolbar"><div><h3>${escapeHTML(title)}</h3><p>${filtered.length} local demo bot${filtered.length===1?'':'s'}.</p></div></div><div class="demo-sc-card-grid">${filtered.map(botCardHTML).join('') || '<div class="demo-empty-state"><strong>Nothing here yet.</strong></div>'}</div></section>`;
  }

  function botCardHTML(bot) {
    const s = botState(bot); const settings = { ...storedSettings, ...draftSettings };
    const exact = settingTrue(settings,['showExactMessageCounts','exactMessageCounts','showExactBotMessageCounts'],['exact','message','count']);
    const longDesc = settingTrue(settings,['showLongerCardDescriptions','longerCardDescriptions'],['long','card','description']);
    return `<article class="demo-sc-card relative group" data-bot-id="${escapeAttr(bot.id)}" data-qol-demo-card>
      <div class="demo-sc-card-image-wrap"><a href="/chat/${escapeAttr(bot.id)}" data-demo-open-chat="${escapeAttr(bot.id)}" aria-label="chat-with-${escapeAttr(bot.name)}"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="${escapeAttr(bot.name)}"></a><div class="demo-sc-top-fade"></div><div class="demo-sc-card-actions-left"><button class="demo-sc-heart ${s.favorite?'active':''}" aria-label="favorite" data-demo-favorite="${escapeAttr(bot.id)}">♡</button><button class="demo-qol-card-later ${s.later?'active':''}" data-demo-later="${escapeAttr(bot.id)}">Later</button></div><div class="demo-sc-card-actions-right"><a class="demo-sc-info" href="/chatbot/${escapeAttr(bot.id)}" data-demo-open-bot="${escapeAttr(bot.id)}" aria-label="character-info">i</a><button class="demo-qol-card-hide" data-demo-hide-bot="${escapeAttr(bot.id)}" title="Hide in this demo">×</button></div></div>
      <div class="demo-sc-card-body"><div class="demo-sc-card-name-row"><div><a href="/chat/${escapeAttr(bot.id)}" data-demo-open-chat="${escapeAttr(bot.id)}" title="${escapeAttr(bot.name)}">${escapeHTML(bot.name)}</a><a href="/creator/dragongraf1312" data-demo-open-creator aria-label="creator">${CREATOR}</a></div><button data-demo-inert title="Menu state was not captured for this demo" aria-label="Card menu">⋮</button></div><p class="demo-sc-card-desc ${longDesc?'expanded':''}">${escapeHTML(bot.title)}</p><div class="demo-sc-tags">${bot.hasLorebook?'<span class="demo-lorebook-badge" aria-label="lorebook" role="img" title="Lorebook attached">▤</span>':''}${(bot.tags||[]).slice(0,6).map(t=>`<span aria-label="${escapeAttr(t)}">${escapeHTML(t)}</span>`).join('')}</div><div class="demo-sc-card-footer"><span>▣ ${exact?Number(bot.demoMessages||0).toLocaleString():compactNumber(bot.demoMessages||0)}</span>${bot.likeRate?`<span>♧ ${escapeHTML(bot.likeRate)}</span>`:''}<span>${s.opened?'Opened':'Unopened'}</span></div></div>
    </article>`;
  }

  function filteredChatList(){
    let list=bots.filter(b=>botState(b).opened);
    if (app.chatFolder && app.chatFolder!=='All') list=list.filter(b => app.chatFolder==='Favorites' ? botState(b).favorite : (b.folder||'Unfoldered')===app.chatFolder);
    const q=(app.chatSearch||'').trim().toLowerCase();
    if(q) list=list.filter(b=>[b.name,b.title,b.folder,...(b.tags||[])].join(' ').toLowerCase().includes(q));
    if ((app.chatSort||'Recent')==='Name') list.sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  }
  function renderChats() {
    const folders=['All','Favorites','DID','Accessibility','Raptors','Dragons','Fandom','Unfoldered'];
    routeHost.innerHTML=`<section class="demo-view demo-chats-view"><div class="demo-sc-chats-toolbar" data-testid="ChatsListToolbar"><div><h3>Chats</h3><span data-testid="ChatsListToolbar-Count" data-demo-chat-count></span></div><div><button aria-label="Search-button" data-demo-chat-search-toggle title="Search chats">⌕</button><select data-testid="ChatsSortDropdown-Trigger" data-demo-chat-sort aria-label="Sort conversations"><option ${app.chatSort!=='Name'?'selected':''}>Recent</option><option ${app.chatSort==='Name'?'selected':''}>Name</option></select></div></div>${app.chatSearchOpen?`<label class="demo-search-input demo-chat-search"><span>⌕</span><input data-demo-chat-search value="${escapeAttr(app.chatSearch||'')}" placeholder="Search chats"></label>`:''}<div class="demo-folder-tabs">${folders.map(f=>`<button class="${(app.chatFolder||'All')===f?'active':''}" data-demo-chat-folder="${escapeAttr(f)}">${escapeHTML(f)}</button>`).join('')}</div><div class="demo-chat-list" data-demo-chat-list></div></section>`;
    renderChatsResultsOnly();
  }
  function renderChatsResultsOnly(){const host=routeHost.querySelector('[data-demo-chat-list]');if(!host)return;const list=filteredChatList();const count=routeHost.querySelector('[data-demo-chat-count]');if(count)count.textContent=`${list.length} conversation${list.length===1?'':'s'}`;host.innerHTML=list.slice(0,16).map((b,i)=>chatRowHTML(b,i)).join('')||'<div class="demo-empty-state"><strong>No chats match.</strong></div>';}
  function chatRowHTML(bot,i){return `<article class="demo-chat-row"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="${escapeAttr(bot.name)}"><a class="demo-chat-row-main" href="/chat/${escapeAttr(bot.id)}" data-demo-open-chat="${escapeAttr(bot.id)}"><strong>${escapeHTML(bot.name)}</strong><span>${i%2?'Last dummy reply: local preset chat data.':'Open this conversation to test the chat surface and message tools.'}</span><small>${escapeHTML(bot.folder||'Unfoldered')} · ${12+i*7} messages · today</small></a><div class="demo-chat-row-actions"><button data-demo-inert title="Rename dialog was not captured">Rename</button><button data-demo-inert title="Clone dialog was not captured">Clone</button><button aria-label="EllipsisVertical-button" data-demo-inert title="Conversation menu state was not captured">⋮</button></div></article>`;}

  const demoPersonas=[
    {name:'Demo user',note:'Default safe website persona',folder:'General',initial:'D',description:'A neutral demo persona used by default in the sandbox.'},
    {name:'Mechanic AU',note:'Used for creator/chat testing',folder:'Roleplay',initial:'M',description:'A safe mechanic-themed test persona for roleplay controls.'},
    {name:'Dragon POV',note:'Generic fantasy test persona',folder:'Roleplay',initial:'R',description:'A generic fantasy POV used to exercise persona switching.'},
    {name:'Quiet POV',note:'Accessibility testing persona',folder:'POV',initial:'Q',description:'A quiet POV persona used for accessibility-oriented demo chats.'}
  ];
  function personaList(){
    const overrides=app.personaOverrides||{};
    const base=demoPersonas.map(p=>({...p,...(overrides[p.name]||{})}));
    return [...base,...(Array.isArray(app.customPersonas)?app.customPersonas:[])];
  }
  function renderPersonas(){routeHost.innerHTML=`<section class="demo-view" data-testid="Personas-PageStaticMetaTags"><div class="demo-view-toolbar"><div><h3>My Personas</h3><p>Dummy personas only; the supplied page is used for structure, not private account data.</p></div><div class="demo-list-controls"><label class="demo-search-input small"><span>⌕</span><input data-demo-persona-search value="${escapeAttr(app.personaSearch||'')}" aria-label="Search..." placeholder="Search..."></label><button data-demo-persona-create>＋ Create Persona</button></div></div><div class="demo-persona-grid" data-demo-persona-grid></div></section>`;renderPersonasResultsOnly();}
  function renderPersonasResultsOnly(){const host=routeHost.querySelector('[data-demo-persona-grid]');if(!host)return;const q=(app.personaSearch||'').toLowerCase();const list=personaList().filter(p=>!q||[p.name,p.note,p.folder,p.description].join(' ').toLowerCase().includes(q));host.innerHTML=list.map(p=>`<article class="demo-persona-card ${app.persona===p.name?'selected':''}"><div class="demo-persona-avatar">${escapeHTML(p.initial||p.name?.[0]||'P')}</div><strong>${escapeHTML(p.name)}</strong><span>${escapeHTML(p.note||'')}</span><small>${escapeHTML(p.folder||'Unfoldered')}</small><div><button data-demo-persona-select="${escapeAttr(p.name)}">Use</button><button aria-label="edit-persona" data-demo-persona-edit="${escapeAttr(p.name)}">Edit</button></div></article>`).join('');}
  function renderPersonaEditor(isCreate){
    const existing=isCreate?null:personaList().find(p=>p.name===app.activePersonaName)||personaList()[0];
    const name=existing?.name||'New Demo Persona';
    const note=existing?.note||'A safe local website persona';
    const folder=existing?.folder||'General';
    const description=existing?.description||'This persona exists only inside the website playground and is never sent to SpicyChat.';
    routeHost.innerHTML=`<section class="demo-view demo-editor-view" data-testid="PersonaEdit-PageStaticMetaTags"><div class="demo-view-toolbar"><div><h3>${isCreate?'Create Persona':'Edit '+escapeHTML(name)}</h3><p>This is a working local dummy editor based on the supplied Persona editor. Saving changes only the playground.</p></div><button data-demo-route="personas">Back to My Personas</button></div><div class="demo-editor-real demo-persona-editor"><div class="demo-avatar-upload"><div class="demo-persona-editor-avatar">${escapeHTML((name||'P')[0])}</div><div><strong>Persona image</strong><button data-demo-inert title="Image picker is not included in this demo">Upload image</button></div></div><label>Persona name<input data-demo-persona-field="name" value="${escapeAttr(name)}"></label><label>Short note<input data-demo-persona-field="note" value="${escapeAttr(note)}"></label><label>Folder<input data-demo-persona-field="folder" value="${escapeAttr(folder)}"></label><label>Persona description<textarea data-demo-persona-field="description" rows="8">${escapeHTML(description)}</textarea></label><div class="demo-editor-save-row"><button data-demo-route="personas">Cancel</button><button data-demo-save-persona="${isCreate?'create':'edit'}">${isCreate?'Create Persona':'Save Persona'}</button></div></div></section>`;
  }
  function savePersonaFromEditor(isCreate){
    const get=(name)=>routeHost.querySelector(`[data-demo-persona-field="${name}"]`)?.value.trim()||'';
    const name=get('name')||'Unnamed Demo Persona'; const note=get('note'); const folder=get('folder')||'Unfoldered'; const description=get('description');
    const persona={name,note,folder,description,initial:(name[0]||'P').toUpperCase()};
    if(isCreate){app.customPersonas=[...(Array.isArray(app.customPersonas)?app.customPersonas:[]),persona];}
    else {
      const old=app.activePersonaName||name;
      const customIndex=(app.customPersonas||[]).findIndex(p=>p.name===old);
      if(customIndex>=0){const next=[...app.customPersonas];next[customIndex]=persona;app.customPersonas=next;}
      else {app.personaOverrides={...(app.personaOverrides||{}),[old]:persona};}
      if(app.persona===old) app.persona=name;
    }
    app.activePersonaName=name; saveAppState(); renderRoute('personas'); showToast(`${isCreate?'Persona created':'Persona saved'} locally in the playground.`);
  }

  function renderCreations(){routeHost.innerHTML=`<section class="demo-view" data-testid="ChatbotMy-PageStaticMetaTags"><div class="demo-creation-tabs"><button id="creation-tab-chatbots" class="active">Chatbots</button><button id="creation-tab-lorebooks" data-demo-route="lorebooks">Lorebooks</button><button id="creation-tab-groups" data-demo-inert title="Groups page was not included in the supplied fixtures">Groups</button><button id="creation-tab-voices" data-demo-inert title="Voices page was not included in the supplied fixtures">Voices</button></div><div class="demo-sc-creation-toolbar"><label class="demo-search-input" data-testid="BotListToolbarV2-SearchInput"><span>⌕</span><input data-demo-creation-search value="${escapeAttr(app.creationSearch||'')}" placeholder="Search my chatbots"></label><div data-testid="BotListToolbarV2-Dropdowns"><button aria-label="All" data-demo-inert title="Dropdown open state was not captured">All ▾</button><button aria-label="Latest" data-demo-inert title="Dropdown open state was not captured">Latest ▾</button><button data-demo-route="create">＋ Create Chatbot</button></div></div><div class="demo-creation-list" data-demo-creation-list></div></section>`;renderCreationsResultsOnly();}
  function renderCreationsResultsOnly(){const host=routeHost.querySelector('[data-demo-creation-list]');if(!host)return;const q=(app.creationSearch||'').toLowerCase();const list=bots.filter(b=>!q||[b.name,b.title,...(b.tags||[])].join(' ').toLowerCase().includes(q)).slice(0,30);host.innerHTML=list.map((b,i)=>`<article class="demo-creation-row"><img src="${escapeAttr(b.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="${escapeAttr(b.name)}"><div class="demo-creation-main"><strong>${escapeHTML(b.name)}</strong><span>${escapeHTML(b.title)}</span><small>Public · ${Number(b.demoMessages||0).toLocaleString()} messages · ${b.hasLorebook?'Lorebook':'No Lorebook'}</small></div><span class="demo-audit ${i%6===0?'warn':'good'}">${i%6===0?'Review':'Looks good'}</span><div class="demo-creation-actions"><a href="/chat/${escapeAttr(b.id)}" data-demo-open-chat="${escapeAttr(b.id)}">Chat</a><button data-demo-inert title="Backup manager UI is supplied by QoL when enabled">Backup</button><button data-demo-edit-bot="${escapeAttr(b.id)}">Edit</button><button aria-label="${i%5===0?'Unlisted':'Public'}" data-demo-inert title="Visibility menu open state was not captured">${i%5===0?'Unlisted':'Public'}</button></div></article>`).join('');}

  const lorebooks=[
    {id:'wayfarer',name:"The Wayfarer's Shrine",description:'Six strangers, six races and a shared setting used as safe demo lore.',entries:14,visibility:'Public'},
    {id:'raptors',name:'The Raptor Pack',description:'Safe demo world details for raptor characters.',entries:11,visibility:'Private'},
    {id:'systems',name:'DID / System RP Notes',description:'Dummy lorebook surface for organizer and backup testing.',entries:9,visibility:'Private'},
    {id:'dragons',name:'Dragon Hybrid World Notes',description:'Safe fantasy demo setting.',entries:12,visibility:'Public'}
  ];
  function lorebookList(){
    const overrides=app.lorebookOverrides||{};
    const base=lorebooks.map(l=>({...l,...(overrides[l.id]||{})}));
    return [...base,...(Array.isArray(app.customLorebooks)?app.customLorebooks:[])];
  }
  function renderLorebooks(){const books=lorebookList();routeHost.innerHTML=`<section class="demo-view" data-testid="LorebookMy-PageStaticMetaTags"><div class="demo-creation-tabs"><button id="creation-tab-chatbots" data-demo-route="creations">Chatbots</button><button id="creation-tab-lorebooks" class="active">Lorebooks</button><button id="creation-tab-groups" data-demo-inert title="Groups page was not included in the supplied fixtures">Groups</button><button id="creation-tab-voices" data-demo-inert title="Voices page was not included in the supplied fixtures">Voices</button></div><div class="demo-sc-creation-toolbar"><label class="demo-search-input" data-testid="BotListToolbarV2-SearchInput"><span>⌕</span><input placeholder="Search lorebooks"></label><div data-testid="BotListToolbarV2-Dropdowns"><button aria-label="All" data-demo-inert title="Dropdown open state was not captured">All ▾</button><button aria-label="Latest" data-demo-inert title="Dropdown open state was not captured">Latest ▾</button><button data-demo-route="lorebook-create">＋ Create Lorebook</button></div></div><div class="demo-lorebook-list">${books.map(l=>`<article class="demo-lorebook-row"><div class="demo-lorebook-icon">▤</div><div><strong>${escapeHTML(l.name)}</strong><span>${escapeHTML(l.description)}</span><small>${Number(l.entries||0)} entries · ${escapeHTML(l.visibility||'Private')}</small></div><div class="demo-lorebook-actions"><button data-demo-inert title="Backup manager UI is supplied by QoL when enabled">Backup</button><button data-demo-edit-lorebook="${escapeAttr(l.id)}" data-demo-lorebook-tab="entries">Entries</button><button data-demo-edit-lorebook="${escapeAttr(l.id)}" data-demo-lorebook-tab="details">Edit</button></div></article>`).join('')}</div></section>`;}

  function renderLorebookCreate(){routeHost.innerHTML=`<section class="demo-view demo-editor-view" data-testid="Lorebook-PageStaticMetaTags"><div class="demo-view-toolbar"><div><h3>Create Lorebook</h3><p>This form actually creates a local demo Lorebook, then opens its editor. Nothing is sent to SpicyChat.</p></div><button data-demo-route="lorebooks">Back to My Lorebooks</button></div><div class="demo-editor-real"><label>Name<input data-demo-lorebook-create-field="name" value="Website Demo Lorebook"></label><label>Description<textarea data-demo-lorebook-create-field="description" rows="4">Dummy world information used only to test QoL Lorebook tools.</textarea></label><label>Tags<input data-demo-lorebook-create-field="tags" value="demo, sfw, worldbuilding"></label><label>Visibility<select data-demo-lorebook-create-field="visibility"><option>Private</option><option>Public</option></select></label><label class="demo-checkbox"><input type="checkbox" checked> I agree to the community guidelines for this fake form.</label><div class="demo-editor-save-row"><button data-demo-route="lorebooks">Cancel</button><button data-testid="LorebookForm-DetailsTabSubmitButton" data-demo-create-lorebook>Create Lorebook</button></div></div></section>`;}
  function createLorebookFromEditor(){
    const get=(name)=>routeHost.querySelector(`[data-demo-lorebook-create-field="${name}"]`)?.value.trim()||'';
    const name=get('name')||'Untitled Demo Lorebook'; const id=`demo-lorebook-${Date.now()}`;
    const book={id,name,description:get('description')||'Local demo Lorebook.',tags:get('tags'),visibility:get('visibility')||'Private',entries:0,custom:true};
    app.customLorebooks=[...(Array.isArray(app.customLorebooks)?app.customLorebooks:[]),book]; app.activeLorebook=id; app.loreTab='entries'; saveAppState(); renderRoute('lorebook-edit'); showToast('Demo Lorebook created locally and opened for editing.');
  }
  function renderLorebookEdit(){const l=lorebookList().find(x=>x.id===app.activeLorebook)||lorebookList()[0];if(!l){renderRoute('lorebooks');return;}const tab=app.loreTab||'entries';routeHost.innerHTML=`<section class="demo-view demo-editor-view"><div class="demo-view-toolbar"><div><h3>Edit ${escapeHTML(l.name)}</h3><p>${escapeHTML(l.description)}</p></div><div class="demo-list-controls"><button data-demo-inert title="Backup manager UI is supplied by QoL when enabled">Backup</button><button data-demo-route="lorebooks">Back to My Lorebooks</button></div></div><div class="demo-lore-tabs"><button class="${tab==='details'?'active':''}" data-demo-lore-tab="details">Details</button><button class="${tab==='entries'?'active':''}" data-demo-lore-tab="entries">Entries</button></div>${tab==='details'?`<div class="demo-editor-real"><label>Name<input data-demo-lorebook-edit-field="name" value="${escapeAttr(l.name)}"></label><label>Description<textarea data-demo-lorebook-edit-field="description" rows="5">${escapeHTML(l.description)}</textarea></label><label>Visibility<select data-demo-lorebook-edit-field="visibility"><option ${l.visibility==='Public'?'selected':''}>Public</option><option ${l.visibility!=='Public'?'selected':''}>Private</option></select></label><div class="demo-editor-save-row"><button data-demo-save-lorebook-details>Save Details</button></div></div>`:loreEntriesHTML(l)}</section>`;}
  function saveLorebookDetailsFromEditor(){
    const l=lorebookList().find(x=>x.id===app.activeLorebook); if(!l)return;
    const name=routeHost.querySelector('[data-demo-lorebook-edit-field="name"]')?.value.trim()||l.name;
    const description=routeHost.querySelector('[data-demo-lorebook-edit-field="description"]')?.value.trim()||'';
    const visibility=routeHost.querySelector('[data-demo-lorebook-edit-field="visibility"]')?.value||l.visibility||'Private';
    const customIndex=(app.customLorebooks||[]).findIndex(x=>x.id===l.id);
    if(customIndex>=0){const next=[...app.customLorebooks];next[customIndex]={...next[customIndex],name,description,visibility};app.customLorebooks=next;}
    else app.lorebookOverrides={...(app.lorebookOverrides||{}),[l.id]:{...(app.lorebookOverrides||{})[l.id],name,description,visibility}};
    saveAppState(); renderRoute('lorebook-edit'); showToast('Lorebook details saved locally in the playground.');
  }
  function loreEntriesHTML(l){const entries=Array.from({length:Math.max(1,Math.min(8,Number(l.entries||0)||1))},(_,i)=>({name:['Setting overview','Important location','Character relationship','Rules of the world','History note','Keyword example','Faction note','Travel note'][i]||`Entry ${i+1}`,keys:['world, setting','shrine, temple','friend, rival','rule, custom','history, past','keyword, trigger','faction, group','road, travel'][i]||'demo'}));return `<div class="demo-lore-entry-toolbar"><button data-demo-inert title="Entry editor open state was not captured">＋ New Entry</button><button data-demo-inert title="Importer UI is supplied by QoL when enabled">Wiki / Web Importer</button><button data-demo-inert title="Bulk tools are supplied by QoL when enabled">Select entries</button></div><div class="demo-lore-entry-list">${entries.map((e,i)=>`<article><div><strong>${escapeHTML(e.name)}</strong><small>Keywords: ${escapeHTML(e.keys)}</small><p>Safe dummy Lorebook entry text used for list, full-text and bulk-tool demonstrations.</p></div><div><button data-demo-inert title="Entry duplication UI is not included in this demo">Duplicate</button><button data-demo-inert title="Entry editor open state was not captured">Edit</button></div></article>`).join('')}</div>`;}

  function renderCreate(){const bot=bots.find(b=>b.id===activeBotId)||bots.find(b=>b.name==='Yui Kimura')||bots[0];const s={...storedSettings,...draftSettings};const saveStay=settingTrue(s,['showSaveAndStay','enableSaveAndStay','creatorSaveAndStay'],['save','stay']);const saveChat=settingTrue(s,['showSaveAndChat','enableSaveAndChat','creatorSaveAndChat'],['save','chat']);const drafts=settingTrue(s,['enableChatbotDraftHistory','chatbotDraftHistory','showDraftHistory'],['draft','history']);const backup=settingTrue(s,['enableChatbotBackupTools','chatbotBackupTools','showChatbotBackupTools'],['chatbot','backup']);routeHost.innerHTML=`<section class="demo-view demo-editor-view" data-testid="ChatbotCreate-PageStaticMetaTags"><div class="demo-view-toolbar"><div><h3>${bot?'Edit '+escapeHTML(bot.name):'Create Chatbot'}</h3><p>Structure follows the supplied chatbot editor. Fields contain safe local demo text.</p></div><div class="demo-list-controls">${backup?'<button data-demo-inert title="Backup manager UI is supplied by QoL when enabled">Save backup</button>':''}${drafts?'<button data-demo-inert title="Draft History UI is supplied by QoL when enabled">Draft History</button>':''}<button data-demo-route="creations">Back to My Creations</button></div></div><div class="demo-editor-real"><div class="demo-avatar-upload" data-testid="CharacterFormAvatarUploadCapabilityGate"><img src="${escapeAttr(bot?.image||'/assets/brand/extension-icon.jpg')}" alt=""><div><strong>Avatar</strong><button data-testid="AvatarCreate-UploadButton" data-demo-inert title="File picker is not included in this demo">Upload</button><button aria-label="generate-avatar" data-demo-inert title="Image generation is not run in this demo">Generate</button></div></div><label>Chatbot name<input value="${escapeAttr(bot?.name||'Demo chatbot')}"></label><label>Title<input value="${escapeAttr(bot?.title||'Safe website demo')}"></label><label>Greeting<textarea rows="5">*The character looks up as you arrive.* This is safe dummy greeting text for the website playground.</textarea><button data-testid="generate-greeting-button" data-demo-fill="greeting">Generate greeting</button></label><label>Personality<textarea rows="6">Safe dummy personality text. The demo never publishes this.</textarea><button data-testid="generate-persona-button" data-demo-fill="personality">Generate personality</button></label><button class="demo-advanced-toggle" data-demo-toggle-advanced>Advanced ${app.editorAdvancedOpen?'▴':'▾'}</button>${app.editorAdvancedOpen?`<div class="demo-advanced-box"><label>Scenario<textarea rows="4">A safe scenario used only to exercise QoL creator helpers.</textarea><button data-testid="generate-scenario-button" data-demo-fill="scenario">Generate scenario</button></label><label>Example Dialogue<textarea rows="4">{{char}}: This is example demo dialogue.\n{{user}}: Nothing here is published.</textarea><button data-testid="generate-dialogue-button" data-demo-fill="dialogue">Generate dialogue</button></label><label>Tags<input value="${escapeAttr((bot?.tags||[]).slice(0,6).join(', '))}"></label><div data-testid="CharacterFormAdvancedLorebookSectionCapabilityGate"><strong>Lorebook</strong><button data-demo-inert title="Lorebook chooser open state was not captured">Attach Lorebook</button></div></div>`:''}<div class="demo-qol-creator-strip"><strong>QoL creator helpers</strong><button data-demo-insert="{{char}}">Insert {{char}}</button><button data-demo-insert="{{user}}">Insert {{user}}</button><button data-demo-inert title="This check is supplied by QoL when enabled">Wording check</button></div><div class="demo-editor-save-row"><button data-demo-save-editor="Normal Save">Save</button>${saveStay?'<button data-demo-save-editor="Save & Stay">Save & Stay</button>':''}${saveChat?'<button data-demo-save-editor="Save & Chat">Save & Chat</button>':''}</div></div></section>`;}



  function fillEditorField(kind){
    const map={greeting:'Greeting',personality:'Personality',scenario:'Scenario',dialogue:'Example Dialogue'};
    const label=[...routeHost.querySelectorAll('.demo-editor-real label')].find(l=>l.firstChild?.textContent?.trim()===map[kind]);
    const field=label?.querySelector('textarea,input');if(!field)return;
    const demo={greeting:'*The character looks over as you arrive.* “Hey. You made it.”',personality:'Calm, observant, direct, and adaptable. This is safe local dummy text.',scenario:'A safe local scenario used only to test creator helpers in the website sandbox.',dialogue:'{{char}}: “This is a local example.”\n{{user}}: “Nothing is being published.”'};
    field.value=demo[kind]||field.value;field.dispatchEvent(new Event('input',{bubbles:true}));
  }
  function insertIntoActiveEditor(token){
    const field=document.activeElement?.matches?.('.demo-editor-real textarea,.demo-editor-real input')?document.activeElement:routeHost.querySelector('.demo-editor-real textarea');
    if(!field)return;const start=field.selectionStart??field.value.length,end=field.selectionEnd??start;field.value=field.value.slice(0,start)+token+field.value.slice(end);field.focus();field.setSelectionRange?.(start+token.length,start+token.length);
  }

  function renderProfile(){const bot=bots.find(b=>b.id===activeBotId)||bots[0];if(!bot)return;const s=botState(bot);routeHost.innerHTML=`<section class="demo-view demo-profile-view"><div class="demo-profile-hero-real"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="${escapeAttr(bot.name)}"><div><a href="/creator/dragongraf1312" data-demo-open-creator aria-label="creator-profile">${CREATOR}</a><h3>${escapeHTML(bot.name)}</h3><p>${escapeHTML(bot.title)}</p><div class="demo-sc-tags">${(bot.tags||[]).slice(0,8).map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div><div class="demo-profile-actions"><a class="primary" href="/chat/${escapeAttr(bot.id)}" data-demo-open-chat="${escapeAttr(bot.id)}">Chat</a><button class="${s.favorite?'active':''}" data-demo-favorite="${escapeAttr(bot.id)}">♡ Favorite</button><button class="${s.later?'active':''}" data-demo-later="${escapeAttr(bot.id)}">Later</button><button data-demo-inert title="Profile menu open state was not captured">⋮</button></div></div></div><div class="demo-profile-body"><article><h4>Description</h4><p>${escapeHTML(bot.blurb||bot.title)}</p></article><article><h4>Definition</h4><p>Safe dummy definition area. The real profile snapshot is used only as structural reference.</p></article><article><h4>Stats</h4><p>${Number(bot.demoMessages||0).toLocaleString()} messages · ${bot.likeRate||'—'} likes · ${bot.hasLorebook?'Lorebook attached':'No Lorebook'}</p></article></div></section>`;}

  function renderCreator(){routeHost.innerHTML=`<section class="demo-view demo-creator-profile"><div class="demo-creator-head"><div class="demo-creator-avatar">D</div><div><span>Creator Profile</span><h3>${CREATOR}</h3><p>Only the SFW cards from the supplied creator-profile snapshot are used in this playground.</p><div><button data-demo-creator-follow>${app.creatorFollowed?'Following':'Follow'}</button><button data-demo-inert title="Creator menu open state was not captured">⋮</button></div></div></div><div class="demo-view-toolbar"><div><h3>Chatbots</h3><p>${bots.length} SFW demo cards loaded from the creator snapshot.</p></div></div><div class="demo-sc-card-grid">${bots.map(botCardHTML).join('')}</div></section>`;}

  function renderChat(){const bot=bots.find(b=>b.id===activeBotId)||bots.find(b=>b.name==='Yui Kimura')||bots[0];if(!bot)return;const messages=currentMessages(bot);routeHost.innerHTML=`<section class="demo-view demo-chat-view" data-testid="PageStaticMetaTags"><div class="demo-real-chat-top"><div><a href="/chatbot/${escapeAttr(bot.id)}" data-demo-open-bot="${escapeAttr(bot.id)}" aria-label="chatbot-profile"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="${escapeAttr(bot.name)}"></a><div><strong>${escapeHTML(bot.name)}</strong><a href="/creator/dragongraf1312" data-demo-open-creator aria-label="creator-profile">${CREATOR}</a></div></div><div class="demo-chat-native-actions"><button aria-label="ThumbsUp-button" data-demo-inert title="Rating action is not sent anywhere">♡</button><button aria-label="Sparkles-button" data-demo-inert title="Model menu open state was not captured">✦</button><button aria-label="chat-dropdown" data-demo-inert title="Chat menu open state was not captured">⋮</button><button data-preview="chat-history" hidden data-demo-inert>History</button><button data-preview="quick-new-chat" hidden data-demo-inert>New chat</button><button data-preview="later" hidden data-demo-later="${escapeAttr(bot.id)}">Later</button></div></div><div class="fake-generation-profile" data-preview="generation-profile" hidden>Generation profile: <strong>Demo Balanced</strong></div><div class="demo-chat-context-row"><span class="demo-local-reply-note">Local preset replies only — try “hello”, “demo”, “lorebook”, “persona”, “dragon”, or “raptor”.</span><button data-demo-clear-chat>Clear</button><button data-demo-reset-chat>Reset</button></div><div class="fake-messages demo-full-messages" data-demo-messages>${messages.map((m,i)=>messageHTML(m,bot,i)).join('')}${app.botTyping&&app.typingBotId===bot.id?`<article class="fake-message bot demo-typing"><div class="fake-message-head"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt=""><strong>${escapeHTML(bot.name)}</strong></div><div class="fake-message-text">typing…</div></article>`:''}</div><div class="fake-composer demo-full-composer"><div class="fake-composer-tools"><button aria-label="Plus-button" data-demo-inert title="Plus menu open state was not captured">＋</button><button data-testid="ImageGenerationButton" data-preview="image-button" data-demo-inert title="Image generation is not run in this demo">Image</button><button data-preview="ooc-button" hidden data-demo-compose-token="[OOC: ]">OOC</button><button data-preview="asterisk-button" hidden data-demo-compose-token="*">*</button><button data-testid="ChatBar-ListenButton" data-preview="voice-button" data-demo-inert title="Voice playback is not run in this demo">Voice</button><button data-preview="persona-switch" hidden data-demo-route="personas">Persona</button><button data-preview="export-button" hidden data-demo-export-chat>Export</button></div><div class="fake-compose-row"><textarea data-demo-composer rows="2" maxlength="500" placeholder="Type a dummy message… nothing gets sent anywhere."></textarea><button type="button" class="fake-send" data-demo-send>Send</button></div></div></section>`;}

  function presetMessages(botName){return [{who:'bot',text:`*${botName} glances toward the demo controls.* This is fake SFW website text for testing message tools.`},{who:'user',text:'I am testing timestamps, quick actions, search, bookmarks and formatting.'},{who:'bot',text:'Try the QoL settings gear. This longer reply gives bubble appearance, line spacing, generation metadata and display-only formatting something visible to change.'},{who:'ooc',text:'[OOC: This is a preset demo OOC line.]'},{who:'user',text:'Search target: gearbox. `Backtick dialogue test.` *Action formatting test.*'},{who:'bot',text:'If an option normally needs server data, a browser permission, a download, or another tab, the playground only simulates the action.'}];}
  function messageHTML(message,bot,i){const who=message.who||'user';const name=who==='bot'?bot.name:who==='ooc'?'OOC':(app.persona||'Demo user');const avatar=who==='bot'?`<img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="">`:`<span class="fake-message-avatar">${who==='ooc'?'O':'D'}</span>`;return `<article id="message-demo-${i}" class="fake-message ${escapeAttr(who)}"><div class="fake-message-head">${avatar}<strong>${escapeHTML(name)}</strong><time data-preview="timestamps" hidden>${fakeTime()}</time><span class="fake-message-spacer"></span><div class="fake-message-quick" data-preview="quick-actions" hidden><button type="button" data-preview-action="copy" hidden>Copy</button><button type="button" data-preview-action="edit" hidden>Edit</button><button type="button" data-preview-action="report" data-demo-inert title="Report is not sent anywhere in the demo" hidden>Report</button></div><button type="button" class="fake-message-menu" data-preview="original-menu" aria-label="message-dropdown" data-demo-inert title="Message menu open state was not captured">⋮</button></div><div class="fake-message-text">${formatText(message.text||'')}</div>${who==='bot'?'<div class="fake-meta" data-preview="metadata" hidden><span data-preview="generation-model" hidden>Model: Demo Model</span><span data-preview="generation-elapsed" hidden>1.4s</span><span data-preview="generation-settings" hidden>T 0.8 · P 0.95</span></div>':''}</article>`;}
  function insertComposerToken(token){
    if(app.route!=='chat'){renderRoute('chat');requestAnimationFrame(()=>insertComposerToken(token));return;}
    const field=routeHost.querySelector('[data-demo-composer]');if(!field)return;const start=field.selectionStart??field.value.length,end=field.selectionEnd??start;field.value=field.value.slice(0,start)+token+field.value.slice(end);field.focus();field.setSelectionRange?.(start+token.length,start+token.length);
  }
  function exportDemoChat(){
    const bot=bots.find(b=>b.id===activeBotId)||bots[0];const messages=currentMessages(bot);
    const blob=new Blob([JSON.stringify({demo:true,bot:{id:bot?.id,name:bot?.name},persona:app.persona,messages},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='spicychat-qol-demo-chat.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  }
  async function copyDemoMessage(button){const article=button.closest('.fake-message');const txt=article?.querySelector('.fake-message-text')?.innerText||'';try{await navigator.clipboard.writeText(txt);showToast('Demo message copied.');}catch{showToast('Copy was unavailable in this browser.');}}
  function editDemoMessage(button){
    const article=button.closest('.fake-message');if(!article)return;const all=[...routeHost.querySelectorAll('.fake-message')];const index=all.indexOf(article);const bot=bots.find(b=>b.id===activeBotId)||bots[0];const current=currentMessages(bot);if(index<0||index>=current.length)return;
    const next=window.prompt('Edit this local demo message:',current[index].text||'');if(next===null)return;const copy=current.map(x=>({...x}));copy[index].text=next;setCurrentMessages(bot,copy);renderRoute('chat');
  }
  function currentMessages(bot){const saved=app.messagesByBot?.[bot?.id];return Array.isArray(saved)?saved:presetMessages(bot?.name||'Demo bot');}
  function setCurrentMessages(bot,messages){if(!bot)return;app.messagesByBot={...(app.messagesByBot||{}),[bot.id]:messages};saveAppState();}
  function resetCurrentMessages(bot){if(!bot)return;const next={...(app.messagesByBot||{})};delete next[bot.id];app.messagesByBot=next;if(app.typingBotId===bot.id){app.botTyping=false;app.typingBotId='';}saveAppState();}
  function choosePresetReply(text,bot){
    const lower=String(text||'').toLowerCase();
    const matching=replyRules.find(rule=>Array.isArray(rule.keywords)&&rule.keywords.some(k=>lower.includes(String(k).toLowerCase())));
    const pool=(matching&&Array.isArray(matching.replies)&&matching.replies.length)?matching.replies:[
      '{bot} nods once. “Got it.”',
      '{bot} pauses for a moment, then answers in a short, neutral way so the demo can show another bot message.',
      '“That works for the demo,” {bot} replies. “Nothing here is being sent anywhere.”'
    ];
    const idx=Math.abs([...lower].reduce((a,c)=>a+c.charCodeAt(0),0))%pool.length;
    return String(pool[idx]).replaceAll('{bot}',bot.name).replaceAll('{title}',bot.title||'');
  }
  function addDummyMessage(){
    const composer=routeHost.querySelector('[data-demo-composer]');if(!composer)return;const text=composer.value.trim();if(!text)return;
    const bot=bots.find(b=>b.id===activeBotId)||bots.find(b=>b.name==='Yui Kimura')||bots[0];
    const current=currentMessages(bot);
    setCurrentMessages(bot,[...current,{who:'user',text}]);app.botTyping=true;app.typingBotId=bot.id;saveAppState();renderRoute('chat');scrollChatToBottom();
    window.setTimeout(()=>{
      const latest=currentMessages(bot);
      setCurrentMessages(bot,[...latest,{who:'bot',text:choosePresetReply(text,bot)}]);app.botTyping=false;app.typingBotId='';saveAppState();if(activeBotId===bot.id&&app.route==='chat'){renderRoute('chat');scrollChatToBottom();}
    },420);
  }
  function scrollChatToBottom(){requestAnimationFrame(()=>{const host=routeHost.querySelector('[data-demo-messages]');if(host)host.scrollTop=host.scrollHeight;});}
  function scrollDemoOrPage(direction){
    const messageHost=routeHost.querySelector('[data-demo-messages]');
    const candidates=[messageHost,routeHost].filter(Boolean);
    const target=candidates.find(el=>el.scrollHeight>el.clientHeight+4);
    if(target){
      const atEnd=direction==='bottom' ? target.scrollTop+target.clientHeight>=target.scrollHeight-6 : target.scrollTop<=6;
      if(!atEnd){target.scrollTo({top:direction==='bottom'?target.scrollHeight:0,behavior:'smooth'});return;}
    }
    window.scrollTo({top:direction==='bottom'?document.documentElement.scrollHeight:0,behavior:'smooth'});
  }
  function saveChatbotEditor(modeName){
    const fields=[...routeHost.querySelectorAll('.demo-editor-real input,.demo-editor-real textarea')];
    if(fields.length){showToast(`${modeName} saved to the local playground only.`);}
    if(modeName==='Save & Chat'){renderRoute('chat');}
  }

  function applyPreview(settings={}) {
    const on=settings.enabled!==false;
    const yes=(names,tokens)=>on&&settingTrue(settings,names,tokens);
    toggleAll('[data-preview="quick-panel"]',yes(['showQuickPanel'],['quick','panel']));
    const panel=preview.querySelector('[data-preview="quick-panel"]'); if(panel) panel.dataset.placement=firstSetting(settings,['quickPanelPlacement'])||'bottom-right';
    toggleAll('[data-preview="timestamps"]',yes(['showMessageTimestamps'],['message','timestamp']));
    const metadata=yes(['showGenerationMetadata'],['generation','metadata'])||yes(['showGenerationModel'],['generation','model'])||yes(['showGenerationElapsed'],['generation','elapsed'])||yes(['showGenerationSettings'],['generation','settings']);
    toggleAll('[data-preview="metadata"]',metadata);
    toggleAll('[data-preview="generation-model"]',yes(['showGenerationModel'],['generation','model']));
    toggleAll('[data-preview="generation-elapsed"]',yes(['showGenerationElapsed'],['generation','elapsed']));
    toggleAll('[data-preview="generation-settings"]',yes(['showGenerationSettings'],['generation','settings']));
    toggleAll('[data-preview="generation-profile"]',yes(['enableGenerationProfiles'],['generation','profile']));
    const quick=yes(['showMessageQuickActions'],['message','quick','action']);
    toggleAll('[data-preview="quick-actions"]',quick);
    toggleAll('[data-preview-action="copy"]',quick&&yes(['messageQuickActionCopy'],['quick','copy']));
    toggleAll('[data-preview-action="edit"]',quick&&yes(['messageQuickActionEdit'],['quick','edit']));
    toggleAll('[data-preview-action="report"]',quick&&yes(['messageQuickActionReport'],['quick','report']));
    toggleAll('[data-preview="original-menu"]',!yes(['hideOriginalMessageDropdown'],['hide','message','dropdown']));
    toggleAll('[data-preview="scroll-top"]',yes(['showScrollToTopButton'],['scroll','top']));
    toggleAll('[data-preview="scroll-bottom"]',yes(['showScrollToBottomButton'],['scroll','bottom']));
    toggleAll('[data-preview="chat-history"]',yes(['showPerCharacterChatHistory'],['chat','history']));
    toggleAll('[data-preview="quick-new-chat"]',yes(['showQuickNewChatButton'],['quick','new','chat']));
    toggleAll('[data-preview="later"]',yes(['chatTopBarAddLaterButton'],['top','later']));
    toggleAll('[data-preview="ooc-button"]',yes(['showOocTools','replaceChatImageWithOocButton'],['ooc']));
    toggleAll('[data-preview="image-button"]',!yes(['hideChatImageButton'],['hide','chat','image'])&&!yes(['replaceChatImageWithOocButton'],['replace','image','ooc']));
    toggleAll('[data-preview="asterisk-button"]',yes(['showAsteriskButton'],['asterisk','button']));
    toggleAll('[data-preview="voice-button"]',!yes(['hideChatVoiceButton'],['hide','chat','voice']));
    toggleAll('[data-preview="persona-switch"]',yes(['showPersonaQuickSwitch'],['persona','quick','switch']));
    toggleAll('[data-preview="export-button"]',yes(['showChatExportButton'],['chat','export']));
    toggleAll('[data-preview="panel-ooc"]',yes(['quickPanelShowOoc'],['panel','ooc']));
    toggleAll('[data-preview="panel-persona"]',yes(['quickPanelShowPersona'],['panel','persona']));
    toggleAll('[data-preview="panel-export"]',yes(['quickPanelShowExport'],['panel','export']));
    toggleAll('[data-preview="promo"]',!(yes(['hideAdvertBanners'],['hide','banner'])||yes(['hidePremium'],['hide','premium'])));
    sidebarRoute('home',!yes(['hideSidebarHome'],['hide','sidebar','home']));
    sidebarRoute('chats',!yes(['hideSidebarChats'],['hide','sidebar','chat']));
    sidebarRoute('personas',!yes(['hideSidebarPersonas'],['hide','sidebar','persona']));
    topbar('language',!yes(['hideTopBarLanguage'],['hide','top','language']));
    topbar('theme',!yes(['hideTopBarTheme'],['hide','top','theme']));
    topbar('notifications',!(yes(['hideTopBarNotifications','hideNotifications'],['hide','notification'])));
    topbar('premium',!yes(['hidePremium'],['hide','premium']));
    preview.classList.toggle('qol-disabled',!on);
    const density=firstSetting(settings,['cardDensity','botCardDensity','cardDensityPreset','listingCardDensity'])||findValueByTokens(settings,['density']);
    preview.dataset.cardDensity=String(density||'normal').toLowerCase();
    if(app.route==='home') renderHomeResultsOnly();
  }
  function toggleAll(selector,show){preview.querySelectorAll(selector).forEach(el=>{el.hidden=!show;});}
  function sidebarRoute(route,show){document.querySelectorAll(`[data-demo-route="${route}"]`).forEach(el=>el.toggleAttribute('hidden',!show));}
  function topbar(name,show){preview.querySelector(`[data-topbar-item="${name}"]`)?.toggleAttribute('hidden',!show);}
  function settingTrue(settings,names=[],tokens=[]){if(names.some(name=>!!settings[name]))return true;if(!tokens.length)return false;const wanted=tokens.map(t=>t.toLowerCase());for(const [key,val] of Object.entries(settings)){if(!val)continue;const k=key.toLowerCase();if(wanted.every(t=>k.includes(t)))return true;}return false;}
  function findValueByTokens(settings,tokens=[]){const wanted=tokens.map(t=>t.toLowerCase());for(const [key,val] of Object.entries(settings)){const k=key.toLowerCase();if(wanted.every(t=>k.includes(t))&&val!=null&&val!=='')return val;}return null;}
  function firstSetting(settings,names){for(const name of names)if(settings[name]!=null&&settings[name]!=='')return settings[name];return null;}

  function openDrawer(){drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');backdrop.hidden=false;document.body.classList.add('demo-drawer-open');}
  function closeDrawer(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');backdrop.hidden=true;document.body.classList.remove('demo-drawer-open');}

  async function loadMode(nextMode) {
    const label=nextMode==='dev'?'Development main':'Stable';
    placeholder.hidden=false; placeholder.innerHTML='<strong>Loading settings…</strong><span>The public extension Options page is being loaded.</span>'; frame.style.visibility='hidden';
    try {
      const source=await loadSettingsSource(nextMode); const manifest=JSON.parse(source.manifest.text); currentManifest=manifest;
      let buildText=nextMode==='dev'?'main':`v${manifest.version||'current'}`;
      try { const version=manifest.version_name||manifest.version||''; buildText=nextMode==='dev'?`main · v${version}`:`v${version}`; } catch(_) {}
      buildLabel.textContent=buildText;
      if(runtimeBadge) runtimeBadge.textContent=`Options + registry synced · ${manifest.version_name||manifest.version||'current'}`;
      setSource(source.live?'live':'fallback',source.live?`${label} Options UI and feature registry loaded from the public extension source.`:`${label} is using bundled snapshots because the public source is temporarily unavailable.`);
      frame.srcdoc=buildSrcdoc(source,manifest,nextMode);
      frame.onload=()=>{placeholder.hidden=true;frame.style.visibility='visible';applyPreview({...readStore(nextMode),...draftSettings});};
    } catch(error) {
      buildLabel.textContent='temporarily unavailable'; if(runtimeBadge) runtimeBadge.textContent='source unavailable';
      setSource('fallback',`Could not load the ${label} settings source right now.`);
      placeholder.hidden=false; placeholder.innerHTML='<strong>Settings demo is temporarily unavailable.</strong><span>The sandbox pages still work; refresh when GitHub is reachable again.</span>'; frame.style.visibility='hidden'; applyPreview(storedSettings);
    }
  }

  async function loadSettingsSource(project) {
    const fallbackBase=project==='stable'?'/data/demo/stable/':'/data/demo/dev-current/';
    const names=[['html','options.html'],['css','options.css'],['registry','feature-registry.js'],['js','options.js'],['manifest','manifest.json'],['changelog','CHANGELOG.md']];
    const out={};
    for(const [key,file] of names){let fallback=null;try{const probe=await fetch(`${fallbackBase}${file}`,{method:'HEAD',cache:'no-store'});if(probe.ok)fallback=`${fallbackBase}${file}`;}catch(_){}out[key]=await SQOLSource.text(project,file,fallback);}
    out.live=names.every(([key])=>out[key].source!=='fallback');return out;
  }

  function buildSrcdoc(source,manifest,sourceMode){let html=source.html.text.replace(/<link[^>]+href=["']options\.css["'][^>]*>/i,'').replace(/<script[^>]+src=["']feature-registry\.js["'][^>]*><\/script>/i,'').replace(/<script[^>]+src=["']options\.js["'][^>]*><\/script>/i,'');const shim=makeShim(sourceMode,manifest,source.changelog.text),bridge=makeBridge(sourceMode),registry=safeScript(source.registry.text),options=safeScript(source.js.text);const extraCss=`html{color-scheme:dark}body{min-width:0!important}main{max-width:980px!important;padding:20px 20px 90px!important}header{position:static!important}.help-link[href^="http"]{cursor:not-allowed}.demo-only-banner{background:#23161c;border:1px solid rgba(236,61,104,.28);border-radius:12px;padding:10px 12px;margin-bottom:14px;color:#d7c9cf;font-size:13px}.demo-only-banner strong{color:#ff91a8}`;html=html.replace('</head>',`<style>${source.css.text}\n${extraCss}</style><script>${shim}<\/script></head>`);html=html.replace(/<main([^>]*)>/i,'<main$1><div class="demo-only-banner"><strong>Website sandbox:</strong> this is the real QoL Options UI with demo-only storage/actions.</div>');html=html.replace('</body>',`<script>${registry}<\/script><script>${options}<\/script><script>${bridge}<\/script></body>`);return html;}
  function safeScript(text){return String(text||'').replace(/<\/script/gi,'<\\/script');}

  function makeShim(sourceMode,manifest,changelog){const safeManifest=JSON.stringify(manifest).replace(/</g,'\\u003c'),safeChangelog=JSON.stringify(changelog).replace(/</g,'\\u003c'),safeMode=JSON.stringify(sourceMode);return `( ()=>{const MODE=${safeMode};const KEY='sqol-demo-storage-'+MODE;const MANIFEST=${safeManifest};const CHANGELOG=${safeChangelog};const changeListeners=[];const runtimeListeners=[];const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return {}}};const notify=(changes)=>{changeListeners.forEach(fn=>{try{fn(changes,'local')}catch{}})};const write=(next,changes={})=>{localStorage.setItem(KEY,JSON.stringify(next));notify(changes);parent.postMessage({type:'sqol-demo-storage',mode:MODE,storage:next},'*')};const pick=(store,keys)=>{if(keys==null)return {...store};if(typeof keys==='string')return Object.prototype.hasOwnProperty.call(store,keys)?{[keys]:store[keys]}:{};if(Array.isArray(keys)){const o={};keys.forEach(k=>{if(Object.prototype.hasOwnProperty.call(store,k))o[k]=store[k]});return o}if(typeof keys==='object'){const o={};Object.keys(keys).forEach(k=>o[k]=store[k]===undefined?keys[k]:store[k]);return o}return {}};const done=(cb,value)=>{if(typeof cb==='function'){queueMicrotask(()=>cb(value));return undefined}return Promise.resolve(value)};const storage={get(keys,cb){return done(cb,pick(read(),keys))},getKeys(cb){return done(cb,Object.keys(read()))},set(obj,cb){const prev=read(),next={...prev,...(obj||{})},changes={};Object.entries(obj||{}).forEach(([k,v])=>{if(prev[k]!==v)changes[k]={oldValue:prev[k],newValue:v}});write(next,changes);return done(cb)},remove(keys,cb){const prev=read(),next={...prev},changes={};(Array.isArray(keys)?keys:[keys]).forEach(k=>{if(Object.prototype.hasOwnProperty.call(next,k)){changes[k]={oldValue:next[k],newValue:undefined};delete next[k]}});write(next,changes);return done(cb)},clear(cb){const prev=read(),changes={};Object.keys(prev).forEach(k=>changes[k]={oldValue:prev[k],newValue:undefined});write({},changes);return done(cb)},getBytesInUse(keys,cb){const bytes=new TextEncoder().encode(JSON.stringify(pick(read(),keys))).length;return done(cb,bytes)}};const event=(list)=>({addListener(fn){if(typeof fn==='function'&&!list.includes(fn))list.push(fn)},removeListener(fn){const i=list.indexOf(fn);if(i>=0)list.splice(i,1)},hasListener(fn){return list.includes(fn)}});const demoToast=(message)=>parent.postMessage({type:'sqol-demo-toast',message},'*');const runtimeResponse=(msg)=>{if(msg&&msg.type==='DS_AUTO_AFK_RUN_NOW')return {ok:true,summary:{at:Date.now(),enabled:true,monitored:4,protected:1,recent:2,eligible:1,cleaned:1,failed:0}};if(msg&&msg.type==='DS_GET_DIAGNOSTIC_CONTEXT')return {ok:true,url:'https://demo.invalid/chat/yui',pageType:'chat',title:'Website sandbox'};if(msg&&msg.type==='DS_GET_PAGE_DIAGNOSTICS')return {ok:true,environment:{browser:'Website demo',platform:'demo'},scheduler:{demo:true}};return {ok:true,demo:true}};window.chrome=window.chrome||{};chrome.storage={local:storage,onChanged:event(changeListeners)};chrome.runtime={lastError:null,onMessage:event(runtimeListeners),getManifest:()=>MANIFEST,getPlatformInfo:(cb)=>done(cb,{os:'android',arch:'x86-64',nacl_arch:'x86-64'}),getURL:(path)=>path==='CHANGELOG.md'?'data:text/plain;charset=utf-8,'+encodeURIComponent(CHANGELOG):'data:text/plain;charset=utf-8,',sendMessage:(msg,cb)=>done(cb,runtimeResponse(msg))};chrome.permissions={contains:(q,cb)=>done(cb,false),request:(q,cb)=>{demoToast('Permission request simulated in the website demo.');return done(cb,false)},remove:(q,cb)=>done(cb,true)};chrome.tabs={create:(info,cb)=>{demoToast('Opening browser tabs is disabled in the website demo.');return done(cb,{id:999,url:info?.url||'about:blank',active:true})},query:(q,cb)=>done(cb,[{id:999,active:true,currentWindow:true,url:'https://demo.invalid/',title:'Website sandbox'}]),sendMessage:(id,msg,cb)=>done(cb,runtimeResponse(msg))};chrome.downloads={download:(info,cb)=>{demoToast('Download action simulated; no file was created.');return done(cb,1)}};chrome.notifications={create:(id,opts,cb)=>{demoToast('Browser notification simulated.');return done(cb,id||'demo')}};try{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{demoToast('Copied inside the demo only.')}},configurable:true})}catch{}window.open=()=>{demoToast('External links are disabled inside the demo.');return null};addEventListener('click',e=>{const a=e.target.closest?.('a');if(!a)return;if(a.href||a.download){e.preventDefault();e.stopImmediatePropagation();demoToast(a.download?'Demo download action simulated.':'External links are disabled inside the demo.')}},true);})();`;}
  function makeBridge(sourceMode){const safeMode=JSON.stringify(sourceMode);return `( ()=>{const MODE=${safeMode};function draft(){const d={};document.querySelectorAll('input[id],select[id],textarea[id]').forEach(el=>{if(el.type==='checkbox')d[el.id]=el.checked;else if(el.type==='radio'){if(el.checked&&el.name)d[el.name]=el.value}else d[el.id]=el.value});parent.postMessage({type:'sqol-demo-draft',mode:MODE,draft:d},'*')}document.addEventListener('change',()=>setTimeout(draft,0));document.addEventListener('input',e=>{if(e.target.matches('select,input[type=range],input[type=number]'))setTimeout(draft,0)});setTimeout(()=>{draft();chrome.storage.local.get(null,s=>parent.postMessage({type:'sqol-demo-storage',mode:MODE,storage:s},'*'))},700);})();`;}

  function setModeUI(){modeButtons.forEach(button=>button.classList.toggle('active',button.dataset.demoMode===mode));modeBadge.textContent=mode==='dev'?'Development':'Stable';modeBadge.className=`badge ${mode==='dev'?'warn':'good'}`;}
  function setSource(kind,text){sourceState.className=`source-state ${kind==='live'?'live':kind==='fallback'?'fallback':''}`;sourceState.textContent=text;}
  function storageKey(which){return `sqol-demo-storage-${which}`;}
  function readStore(which){try{return JSON.parse(localStorage.getItem(storageKey(which))||'{}')||{}}catch{return {}}}
  function formatText(text){return escapeHTML(text).replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>');}
  function fakeTime(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
  function compactNumber(n){n=Number(n)||0;return n>=1000000?`${(n/1000000).toFixed(1).replace('.0','')}m`:n>=1000?`${(n/1000).toFixed(n>=10000?0:1).replace('.0','')}k`:String(n);}
  function unique(arr){return [...new Set(arr)];}
  function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function escapeAttr(value){return escapeHTML(value);}
  let toastTimer;function showToast(message){clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;toastTimer=setTimeout(()=>toast.hidden=true,2600);}
})();
