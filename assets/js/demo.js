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
  const APP_STATE_KEY = 'sqol-demo-app-v3';
  const CREATOR = '@dragongraf1312';
  const DEFAULT_BOT = 'b376faf0-8c37-4b37-8861-8ca68cdd64b6';

  const fallbackBots = [
    {id:DEFAULT_BOT,name:'Yui Kimura',title:'The Mechanic She Trusts. AU',blurb:'Safe dummy fallback data for the website playground.',image:'https://cdn.nd-api.com/avatars/0fb19108-bfb0-453e-85f3-3b5a2655ce29.png?class=avatar256x256',tags:['Female','MalePOV','Romantic','Fictional Media'],creator:CREATOR,demoMessages:442,favorite:true,later:true,opened:true,hasLorebook:true,folder:'Fandom'},
    {id:'5d2df83e-1ee3-4654-8897-c280742a0fe2',name:'Sable Hart',title:'The Popular Girl Thinks You Hate Her (Mute POV)',blurb:'Safe dummy fallback data for the website playground.',image:'https://cdn.nd-api.com/avatars/f6795cc1-8dbf-46df-bcd7-0adec3544ba3.jpg?class=avatar256x256',tags:['Female','MalePOV','Romantic','Drama'],creator:CREATOR,demoMessages:80400,favorite:true,later:false,opened:true,hasLorebook:true,folder:'Accessibility'}
  ];

  let bots = [];
  let mode = localStorage.getItem('sqol-demo-mode') || DEFAULT_MODE;
  if (!VALID_MODES.has(mode)) mode = DEFAULT_MODE;
  let storedSettings = readStore(mode);
  let draftSettings = {};
  let app = readAppState();
  let activeBotId = app.activeBotId || DEFAULT_BOT;
  let currentManifest = null;

  init();

  async function init() {
    bots = await loadBots();
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
      if (botChat) { event.preventDefault(); activeBotId = botChat.dataset.demoOpenChat || activeBotId; app.activeBotId = activeBotId; saveAppState(); renderRoute('chat'); return; }
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
      const editCreation = event.target.closest('[data-demo-edit-bot]');
      if (editCreation) { activeBotId=editCreation.dataset.demoEditBot; app.activeBotId=activeBotId; saveAppState(); renderRoute('create'); return; }
      const editLorebook = event.target.closest('[data-demo-edit-lorebook]');
      if (editLorebook) { app.activeLorebook=editLorebook.dataset.demoEditLorebook || 'wayfarer'; saveAppState(); renderRoute('lorebook-edit'); return; }

      const advanced = event.target.closest('[data-demo-toggle-advanced]');
      if (advanced) { app.editorAdvancedOpen = !app.editorAdvancedOpen; saveAppState(); renderRoute('create'); return; }
      const loreTab = event.target.closest('[data-demo-lore-tab]');
      if (loreTab) { app.loreTab = loreTab.dataset.demoLoreTab; saveAppState(); renderRoute('lorebook-edit'); return; }

      const saveEditor = event.target.closest('[data-demo-save-editor]');
      if (saveEditor) { showToast(`${saveEditor.dataset.demoSaveEditor} simulated. Nothing was sent to SpicyChat.`); return; }
      const simulated = event.target.closest('[data-demo-simulate]');
      if (simulated) { event.preventDefault(); showToast(simulated.dataset.demoSimulate || 'Action simulated in the website playground.'); return; }
      const send = event.target.closest('[data-demo-send]');
      if (send) { addDummyMessage(); return; }
      const clearChat = event.target.closest('[data-demo-clear-chat]');
      if (clearChat) { app.messages = []; saveAppState(); renderRoute('chat'); return; }
      const resetChat = event.target.closest('[data-demo-reset-chat]');
      if (resetChat) { delete app.messages; saveAppState(); renderRoute('chat'); return; }
    });

    routeHost.addEventListener('input', event => {
      if (event.target.matches('[data-demo-home-search]')) { app.homeSearch = event.target.value; saveAppState(); renderHomeResultsOnly(); }
      if (event.target.matches('[data-demo-creation-search]')) { app.creationSearch = event.target.value; saveAppState(); renderCreationsResultsOnly(); }
      if (event.target.matches('[data-demo-persona-search]')) { app.personaSearch = event.target.value; saveAppState(); renderPersonasResultsOnly(); }
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

  function defaultAppState() {
    return { route:'home', activeBotId:DEFAULT_BOT, hiddenBots:[], chatFolder:'All', persona:'Demo user', homeSearch:'', homeSort:'Trending', quickFilter:'', filtersOpen:false, creationSearch:'', personaSearch:'', botFlags:{}, editorAdvancedOpen:false, loreTab:'entries', activeLorebook:'wayfarer' };
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
    const valid = new Set(['home','chats','favorites','personas','creations','lorebooks','create','lorebook-create','lorebook-edit','profile','creator','chat']);
    if (!valid.has(route)) route = 'home';
    app.route = route; saveAppState();
    preview.classList.remove('demo-nav-open');
    const activeSidebarRoute = ['profile','creator'].includes(route) ? 'home' : route === 'lorebook-create' || route === 'lorebook-edit' ? 'lorebooks' : route;
    document.querySelectorAll('[data-demo-route]').forEach(btn => btn.classList.toggle('active', btn.dataset.demoRoute === activeSidebarRoute));
    const labels = {
      home:['Home','SFW creator cards'], chats:['Chats','dummy saved conversations'], favorites:['Favorites','local demo favorites'], personas:['My Personas','dummy persona data'], creations:['My Creations','creator workflow sandbox'], lorebooks:['My Lorebooks','dummy lorebook data'], create:['Chatbot editor','safe editor sandbox'], 'lorebook-create':['Create Lorebook','safe lorebook sandbox'], 'lorebook-edit':['Edit Lorebook','details and entries'], profile:['Chatbot profile','local sandbox profile'], creator:['Creator profile',CREATOR], chat:['Chat','dummy conversation']
    };
    pageTitle.textContent = labels[route][0]; pageSubtitle.textContent = labels[route][1];
    if (route === 'home') renderHome();
    if (route === 'chats') renderChats();
    if (route === 'favorites') renderBotListing('Favorites', bots.filter(b => botState(b).favorite));
    if (route === 'personas') renderPersonas();
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
      <div class="demo-sc-carousel" data-preview="promo"><div><strong>Build Worlds They Remember</strong><span>Harmless demo banner so QoL cleanup can remove a real-looking promo surface.</span></div><button data-demo-simulate="Demo promo dismissed.">×</button></div>
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
    routeHost.innerHTML = `<section class="demo-view"><div class="demo-view-toolbar"><div><h3>${escapeHTML(title)}</h3><p>${filtered.length} local demo bot${filtered.length===1?'':'s'}.</p></div><div class="demo-list-controls"><button data-demo-simulate="Saved Bots Hub filters opened.">Saved-state filter</button><button data-demo-simulate="Bot Organizer bulk mode opened.">Select</button></div></div><div class="demo-sc-card-grid">${filtered.map(botCardHTML).join('') || '<div class="demo-empty-state"><strong>Nothing here yet.</strong></div>'}</div></section>`;
  }

  function botCardHTML(bot) {
    const s = botState(bot); const settings = { ...storedSettings, ...draftSettings };
    const exact = settingTrue(settings,['showExactMessageCounts','exactMessageCounts','showExactBotMessageCounts'],['exact','message','count']);
    const longDesc = settingTrue(settings,['showLongerCardDescriptions','longerCardDescriptions'],['long','card','description']);
    return `<article class="demo-sc-card relative group" data-bot-id="${escapeAttr(bot.id)}" data-qol-demo-card>
      <div class="demo-sc-card-image-wrap"><a href="/chat/${escapeAttr(bot.id)}" data-demo-open-chat="${escapeAttr(bot.id)}" aria-label="chat-with-${escapeAttr(bot.name)}"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="${escapeAttr(bot.name)}"></a><div class="demo-sc-top-fade"></div><button class="demo-sc-heart ${s.favorite?'active':''}" aria-label="favorite" data-demo-favorite="${escapeAttr(bot.id)}">♡</button><a class="demo-sc-info" href="/chatbot/${escapeAttr(bot.id)}" data-demo-open-bot="${escapeAttr(bot.id)}" aria-label="character-info">ⓘ</a><button class="demo-qol-card-hide" data-demo-hide-bot="${escapeAttr(bot.id)}" title="QoL demo hide">×</button><button class="demo-qol-card-later ${s.later?'active':''}" data-demo-later="${escapeAttr(bot.id)}">Later</button></div>
      <div class="demo-sc-card-body"><div class="demo-sc-card-name-row"><div><a href="/chat/${escapeAttr(bot.id)}" data-demo-open-chat="${escapeAttr(bot.id)}" title="${escapeAttr(bot.name)}">${escapeHTML(bot.name)}</a><a href="/creator/dragongraf1312" data-demo-open-creator aria-label="creator">${CREATOR}</a></div><button data-demo-simulate="Native card menu opened.">⋮</button></div><p class="demo-sc-card-desc ${longDesc?'expanded':''}">${escapeHTML(bot.title)}</p><div class="demo-sc-tags">${bot.hasLorebook?'<span class="demo-lorebook-badge" aria-label="lorebook" role="img" title="Lorebook attached">▤</span>':''}${(bot.tags||[]).slice(0,6).map(t=>`<span aria-label="${escapeAttr(t)}">${escapeHTML(t)}</span>`).join('')}</div><div class="demo-sc-card-footer"><span>▣ ${exact?Number(bot.demoMessages||0).toLocaleString():compactNumber(bot.demoMessages||0)}</span>${bot.likeRate?`<span>♧ ${escapeHTML(bot.likeRate)}</span>`:''}<span>${s.opened?'Opened':'Unopened'}</span></div></div>
    </article>`;
  }

  function renderChats() {
    const folders=['All','Favorites','DID','Accessibility','Raptors','Dragons','Fandom','Unfoldered'];
    let list=bots.filter(b=>botState(b).opened);
    if (app.chatFolder && app.chatFolder!=='All') list=list.filter(b => app.chatFolder==='Favorites' ? botState(b).favorite : (b.folder||'Unfoldered')===app.chatFolder);
    if ((app.chatSort||'Recent')==='Name') list.sort((a,b)=>a.name.localeCompare(b.name));
    routeHost.innerHTML=`<section class="demo-view demo-chats-view"><div class="demo-sc-chats-toolbar" data-testid="ChatsListToolbar"><div><h3>Chats</h3><span data-testid="ChatsListToolbar-Count">${list.length} conversations</span></div><div><button aria-label="Search-button" data-demo-simulate="Chat search opened.">⌕</button><select data-testid="ChatsSortDropdown-Trigger" data-demo-chat-sort aria-label="Sort conversations"><option ${app.chatSort!=='Name'?'selected':''}>Recent</option><option ${app.chatSort==='Name'?'selected':''}>Name</option></select><button data-demo-simulate="Select chats mode opened.">Select chats</button></div></div><div class="demo-folder-tabs">${folders.map(f=>`<button class="${(app.chatFolder||'All')===f?'active':''}" data-demo-chat-folder="${escapeAttr(f)}">${escapeHTML(f)}</button>`).join('')}</div><div class="demo-chat-list">${list.slice(0,16).map((b,i)=>chatRowHTML(b,i)).join('')||'<div class="demo-empty-state"><strong>No chats in this folder.</strong></div>'}</div></section>`;
  }
  function chatRowHTML(bot,i){return `<article class="demo-chat-row"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="${escapeAttr(bot.name)}"><a class="demo-chat-row-main" href="/chat/${escapeAttr(bot.id)}" data-demo-open-chat="${escapeAttr(bot.id)}"><strong>${escapeHTML(bot.name)}</strong><span>${i%2?'Last dummy reply: this row exists for list filters and folders.':'Open this conversation to test the chat surface and message tools.'}</span><small>${escapeHTML(bot.folder||'Unfoldered')} · ${12+i*7} messages · today</small></a><div class="demo-chat-row-actions"><button data-demo-simulate="Change Title simulated.">Rename</button><button data-demo-simulate="Clone Conversation simulated.">Clone</button><button aria-label="EllipsisVertical-button" data-demo-simulate="Native conversation menu opened.">⋮</button></div></article>`;}

  const demoPersonas=[{name:'Demo user',note:'Default safe website persona',folder:'General',initial:'D'},{name:'Mechanic AU',note:'Used for creator/chat testing',folder:'Roleplay',initial:'M'},{name:'Dragon POV',note:'Generic fantasy test persona',folder:'Roleplay',initial:'R'},{name:'Quiet POV',note:'Accessibility testing persona',folder:'POV',initial:'Q'}];
  function renderPersonas(){routeHost.innerHTML=`<section class="demo-view" data-testid="Personas-PageStaticMetaTags"><div class="demo-view-toolbar"><div><h3>My Personas</h3><p>Dummy personas only; the supplied page is used for structure, not private account data.</p></div><div class="demo-list-controls"><label class="demo-search-input small"><span>⌕</span><input data-demo-persona-search value="${escapeAttr(app.personaSearch||'')}" aria-label="Search..." placeholder="Search..."></label><button data-demo-simulate="Create persona simulated.">Create Persona</button></div></div><div class="demo-persona-grid" data-demo-persona-grid></div></section>`;renderPersonasResultsOnly();}
  function renderPersonasResultsOnly(){const host=routeHost.querySelector('[data-demo-persona-grid]');if(!host)return;const q=(app.personaSearch||'').toLowerCase();const list=demoPersonas.filter(p=>!q||[p.name,p.note,p.folder].join(' ').toLowerCase().includes(q));host.innerHTML=list.map(p=>`<article class="demo-persona-card ${app.persona===p.name?'selected':''}"><div class="demo-persona-avatar">${p.initial}</div><strong>${escapeHTML(p.name)}</strong><span>${escapeHTML(p.note)}</span><small>${escapeHTML(p.folder)}</small><div><button data-demo-persona-select="${escapeAttr(p.name)}">Use</button><button aria-label="edit-persona" data-demo-simulate="Persona editor opened with dummy data.">Edit</button></div></article>`).join('');}

  function renderCreations(){routeHost.innerHTML=`<section class="demo-view" data-testid="ChatbotMy-PageStaticMetaTags"><div class="demo-creation-tabs"><button id="creation-tab-chatbots" class="active">Chatbots</button><button id="creation-tab-lorebooks" data-demo-route="lorebooks">Lorebooks</button><button id="creation-tab-groups" data-demo-simulate="Groups are represented but not connected.">Groups</button><button id="creation-tab-voices" data-demo-simulate="Voices are represented but not connected.">Voices</button></div><div class="demo-sc-creation-toolbar"><label class="demo-search-input" data-testid="BotListToolbarV2-SearchInput"><span>⌕</span><input data-demo-creation-search value="${escapeAttr(app.creationSearch||'')}" placeholder="Search my chatbots"></label><div data-testid="BotListToolbarV2-Dropdowns"><button aria-label="All" data-demo-simulate="Visibility filter opened.">All ▾</button><button aria-label="Latest" data-demo-simulate="Sort menu opened.">Latest ▾</button><button data-demo-route="create">＋ Create Chatbot</button></div></div><div class="demo-creation-list" data-demo-creation-list></div></section>`;renderCreationsResultsOnly();}
  function renderCreationsResultsOnly(){const host=routeHost.querySelector('[data-demo-creation-list]');if(!host)return;const q=(app.creationSearch||'').toLowerCase();const list=bots.filter(b=>!q||[b.name,b.title,...(b.tags||[])].join(' ').toLowerCase().includes(q)).slice(0,30);host.innerHTML=list.map((b,i)=>`<article class="demo-creation-row"><img src="${escapeAttr(b.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="${escapeAttr(b.name)}"><div class="demo-creation-main"><strong>${escapeHTML(b.name)}</strong><span>${escapeHTML(b.title)}</span><small>Public · ${Number(b.demoMessages||0).toLocaleString()} messages · ${b.hasLorebook?'Lorebook':'No Lorebook'}</small></div><span class="demo-audit ${i%6===0?'warn':'good'}">${i%6===0?'Review':'Looks good'}</span><div class="demo-creation-actions"><a href="/chat/${escapeAttr(b.id)}" data-demo-open-chat="${escapeAttr(b.id)}">Chat</a><button data-demo-simulate="Backup saved locally in the demo.">Backup</button><button data-demo-edit-bot="${escapeAttr(b.id)}">Edit</button><button aria-label="${i%5===0?'Unlisted':'Public'}" data-demo-simulate="Visibility control opened.">${i%5===0?'Unlisted':'Public'}</button></div></article>`).join('');}

  const lorebooks=[{id:'wayfarer',name:"The Wayfarer's Shrine",description:'Six strangers, six races and a shared setting used as safe demo lore.',entries:14,visibility:'Public'},{id:'raptors',name:'The Raptor Pack',description:'Safe demo world details for raptor characters.',entries:11,visibility:'Private'},{id:'systems',name:'DID / System RP Notes',description:'Dummy lorebook surface for organizer and backup testing.',entries:9,visibility:'Private'},{id:'dragons',name:'Dragon Hybrid World Notes',description:'Safe fantasy demo setting.',entries:12,visibility:'Public'}];
  function renderLorebooks(){routeHost.innerHTML=`<section class="demo-view" data-testid="LorebookMy-PageStaticMetaTags"><div class="demo-creation-tabs"><button id="creation-tab-chatbots" data-demo-route="creations">Chatbots</button><button id="creation-tab-lorebooks" class="active">Lorebooks</button><button id="creation-tab-groups" data-demo-simulate="Groups represented only.">Groups</button><button id="creation-tab-voices" data-demo-simulate="Voices represented only.">Voices</button></div><div class="demo-sc-creation-toolbar"><label class="demo-search-input" data-testid="BotListToolbarV2-SearchInput"><span>⌕</span><input placeholder="Search lorebooks"></label><div data-testid="BotListToolbarV2-Dropdowns"><button aria-label="All">All ▾</button><button aria-label="Latest">Latest ▾</button><button data-demo-route="lorebook-create">＋ Create Lorebook</button></div></div><div class="demo-lorebook-list">${lorebooks.map(l=>`<article class="demo-lorebook-row"><div class="demo-lorebook-icon">▤</div><div><strong>${escapeHTML(l.name)}</strong><span>${escapeHTML(l.description)}</span><small>${l.entries} entries · ${l.visibility}</small></div><div class="demo-lorebook-actions"><button data-demo-simulate="Lorebook backup saved in demo storage.">Backup</button><button data-demo-edit-lorebook="${escapeAttr(l.id)}">Entries</button><button data-demo-edit-lorebook="${escapeAttr(l.id)}">Edit</button></div></article>`).join('')}</div></section>`;}

  function renderCreate(){const bot=bots.find(b=>b.id===activeBotId)||bots.find(b=>b.name==='Yui Kimura')||bots[0];const s={...storedSettings,...draftSettings};const saveStay=settingTrue(s,['showSaveAndStay','enableSaveAndStay','creatorSaveAndStay'],['save','stay']);const saveChat=settingTrue(s,['showSaveAndChat','enableSaveAndChat','creatorSaveAndChat'],['save','chat']);const drafts=settingTrue(s,['enableChatbotDraftHistory','chatbotDraftHistory','showDraftHistory'],['draft','history']);const backup=settingTrue(s,['enableChatbotBackupTools','chatbotBackupTools','showChatbotBackupTools'],['chatbot','backup']);routeHost.innerHTML=`<section class="demo-view demo-editor-view" data-testid="ChatbotCreate-PageStaticMetaTags"><div class="demo-view-toolbar"><div><h3>${bot?'Edit '+escapeHTML(bot.name):'Create Chatbot'}</h3><p>Structure follows the supplied chatbot editor. Fields contain safe local demo text.</p></div><div class="demo-list-controls">${backup?'<button data-demo-simulate="Manual chatbot backup simulated.">Save backup</button>':''}${drafts?'<button data-demo-simulate="Draft History opened.">Draft History</button>':''}<button data-demo-route="creations">Back to My Creations</button></div></div><div class="demo-editor-real"><div class="demo-avatar-upload" data-testid="CharacterFormAvatarUploadCapabilityGate"><img src="${escapeAttr(bot?.image||'/assets/brand/extension-icon.jpg')}" alt=""><div><strong>Avatar</strong><button data-testid="AvatarCreate-UploadButton" data-demo-simulate="Avatar upload simulated.">Upload</button><button aria-label="generate-avatar" data-demo-simulate="Avatar generation simulated.">Generate</button></div></div><label>Chatbot name<input value="${escapeAttr(bot?.name||'Demo chatbot')}"></label><label>Title<input value="${escapeAttr(bot?.title||'Safe website demo')}"></label><label>Greeting<textarea rows="5">*The character looks up as you arrive.* This is safe dummy greeting text for the website playground.</textarea><button data-testid="generate-greeting-button" data-demo-simulate="Greeting generation simulated.">Generate greeting</button></label><label>Personality<textarea rows="6">Safe dummy personality text. The demo never publishes this.</textarea><button data-testid="generate-persona-button" data-demo-simulate="Personality generation simulated.">Generate personality</button></label><button class="demo-advanced-toggle" data-demo-toggle-advanced>Advanced ${app.editorAdvancedOpen?'▴':'▾'}</button>${app.editorAdvancedOpen?`<div class="demo-advanced-box"><label>Scenario<textarea rows="4">A safe scenario used only to exercise QoL creator helpers.</textarea><button data-testid="generate-scenario-button" data-demo-simulate="Scenario generation simulated.">Generate scenario</button></label><label>Example Dialogue<textarea rows="4">{{char}}: This is example demo dialogue.\n{{user}}: Nothing here is published.</textarea><button data-testid="generate-dialogue-button" data-demo-simulate="Dialogue generation simulated.">Generate dialogue</button></label><label>Tags<input value="${escapeAttr((bot?.tags||[]).slice(0,6).join(', '))}"></label><div data-testid="CharacterFormAdvancedLorebookSectionCapabilityGate"><strong>Lorebook</strong><button data-demo-simulate="Lorebook attachment chooser opened.">Attach Lorebook</button></div></div>`:''}<div class="demo-qol-creator-strip"><strong>QoL creator helpers</strong><button data-demo-simulate="{{char}} inserted into the active field.">Insert {{char}}</button><button data-demo-simulate="{{user}} inserted into the active field.">Insert {{user}}</button><button data-demo-simulate="Moderation wording check simulated.">Wording check</button></div><div class="demo-editor-save-row"><button data-demo-save-editor="Normal Save">Save</button>${saveStay?'<button data-demo-save-editor="Save & Stay">Save & Stay</button>':''}${saveChat?'<button data-demo-save-editor="Save & Chat">Save & Chat</button>':''}</div></div></section>`;}

  function renderLorebookCreate(){routeHost.innerHTML=`<section class="demo-view demo-editor-view" data-testid="Lorebook-PageStaticMetaTags"><div class="demo-view-toolbar"><div><h3>Create Lorebook</h3><p>Safe dummy form based on the supplied Lorebook page.</p></div><button data-demo-route="lorebooks">Back</button></div><div class="demo-editor-real"><label>Name<input value="Website Demo Lorebook"></label><label>Description<textarea rows="4">Dummy world information used only to test QoL Lorebook tools.</textarea></label><label>Tags<input value="demo, sfw, worldbuilding"></label><label>Visibility<select><option>Private</option><option>Public</option></select></label><label class="demo-checkbox"><input type="checkbox" checked> I agree to the community guidelines for this fake form.</label><button data-testid="LorebookForm-DetailsTabSubmitButton" data-demo-save-editor="Create Lorebook">Create Lorebook</button></div></section>`;}

  function renderLorebookEdit(){const l=lorebooks.find(x=>x.id===app.activeLorebook)||lorebooks[0];const tab=app.loreTab||'entries';routeHost.innerHTML=`<section class="demo-view demo-editor-view"><div class="demo-view-toolbar"><div><h3>Edit ${escapeHTML(l.name)}</h3><p>${escapeHTML(l.description)}</p></div><div class="demo-list-controls"><button data-demo-simulate="Lorebook backup simulated.">Backup</button><button data-demo-route="lorebooks">Back</button></div></div><div class="demo-lore-tabs"><button class="${tab==='details'?'active':''}" data-demo-lore-tab="details">Details</button><button class="${tab==='entries'?'active':''}" data-demo-lore-tab="entries">Entries</button></div>${tab==='details'?`<div class="demo-editor-real"><label>Name<input value="${escapeAttr(l.name)}"></label><label>Description<textarea rows="5">${escapeHTML(l.description)}</textarea></label><label>Visibility<select><option>${escapeHTML(l.visibility)}</option><option>${l.visibility==='Public'?'Private':'Public'}</option></select></label><button data-demo-save-editor="Lorebook details save">Save Details</button></div>`:loreEntriesHTML(l)}</section>`;}
  function loreEntriesHTML(l){const entries=Array.from({length:Math.min(8,l.entries)},(_,i)=>({name:['Setting overview','Important location','Character relationship','Rules of the world','History note','Keyword example','Faction note','Travel note'][i],keys:['world, setting','shrine, temple','friend, rival','rule, custom','history, past','keyword, trigger','faction, group','road, travel'][i]}));return `<div class="demo-lore-entry-toolbar"><button data-demo-simulate="New entry form opened.">＋ New Entry</button><button data-demo-simulate="Wiki/Web importer opened.">Wiki / Web Importer</button><button data-demo-simulate="Bulk selection opened.">Select entries</button></div><div class="demo-lore-entry-list">${entries.map((e,i)=>`<article><div><strong>${escapeHTML(e.name)}</strong><small>Keywords: ${escapeHTML(e.keys)}</small><p>Safe dummy Lorebook entry text used for list, full-text and bulk-tool demonstrations.</p></div><div><button data-demo-simulate="Entry duplicated.">Duplicate</button><button data-demo-simulate="Entry editor opened.">Edit</button></div></article>`).join('')}</div>`;}

  function renderProfile(){const bot=bots.find(b=>b.id===activeBotId)||bots[0];if(!bot)return;const s=botState(bot);routeHost.innerHTML=`<section class="demo-view demo-profile-view"><div class="demo-profile-hero-real"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="${escapeAttr(bot.name)}"><div><a href="/creator/dragongraf1312" data-demo-open-creator aria-label="creator-profile">${CREATOR}</a><h3>${escapeHTML(bot.name)}</h3><p>${escapeHTML(bot.title)}</p><div class="demo-sc-tags">${(bot.tags||[]).slice(0,8).map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div><div class="demo-profile-actions"><a class="primary" href="/chat/${escapeAttr(bot.id)}" data-demo-open-chat="${escapeAttr(bot.id)}">Chat</a><button class="${s.favorite?'active':''}" data-demo-favorite="${escapeAttr(bot.id)}">♡ Favorite</button><button class="${s.later?'active':''}" data-demo-later="${escapeAttr(bot.id)}">Later</button><button data-demo-simulate="Chatbot profile menu opened.">⋮</button></div></div></div><div class="demo-profile-body"><article><h4>Description</h4><p>${escapeHTML(bot.blurb||bot.title)}</p></article><article><h4>Definition</h4><p>Safe dummy definition area. The real profile snapshot is used only as structural reference.</p></article><article><h4>Stats</h4><p>${Number(bot.demoMessages||0).toLocaleString()} messages · ${bot.likeRate||'—'} likes · ${bot.hasLorebook?'Lorebook attached':'No Lorebook'}</p></article></div></section>`;}

  function renderCreator(){routeHost.innerHTML=`<section class="demo-view demo-creator-profile"><div class="demo-creator-head"><div class="demo-creator-avatar">D</div><div><span>Creator Profile</span><h3>${CREATOR}</h3><p>Only the SFW cards from the supplied creator-profile snapshot are used in this playground.</p><div><button data-demo-simulate="Creator follow toggled in demo.">Follow</button><button data-demo-simulate="Creator profile menu opened.">⋮</button></div></div></div><div class="demo-view-toolbar"><div><h3>Chatbots</h3><p>${bots.length} SFW demo cards loaded from the creator snapshot.</p></div></div><div class="demo-sc-card-grid">${bots.map(botCardHTML).join('')}</div></section>`;}

  function renderChat(){const bot=bots.find(b=>b.id===activeBotId)||bots.find(b=>b.name==='Yui Kimura')||bots[0];if(!bot)return;const messages=Array.isArray(app.messages)?app.messages:presetMessages(bot.name);routeHost.innerHTML=`<section class="demo-view demo-chat-view" data-testid="PageStaticMetaTags"><div class="demo-real-chat-top"><div><a href="/chatbot/${escapeAttr(bot.id)}" data-demo-open-bot="${escapeAttr(bot.id)}" aria-label="chatbot-profile"><img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="${escapeAttr(bot.name)}"></a><div><strong>${escapeHTML(bot.name)}</strong><a href="/creator/dragongraf1312" data-demo-open-creator aria-label="creator-profile">${CREATOR}</a></div></div><div class="demo-chat-native-actions"><button aria-label="ThumbsUp-button" data-demo-simulate="Rating simulated.">♡</button><button aria-label="Sparkles-button" data-demo-simulate="Model menu opened.">✦</button><button aria-label="chat-dropdown" data-demo-simulate="Native chat menu opened.">⋮</button><button data-preview="chat-history" hidden data-demo-simulate="Chat history opened.">History</button><button data-preview="quick-new-chat" hidden data-demo-simulate="New chat simulated.">New chat</button><button data-preview="later" hidden data-demo-later="${escapeAttr(bot.id)}">Later</button></div></div><div class="fake-generation-profile" data-preview="generation-profile" hidden>Generation profile: <strong>Demo Balanced</strong></div><div class="demo-chat-context-row"><button data-demo-simulate="Context Keeper opened with dummy details.">Context Keeper</button><button data-demo-simulate="Message Bookmarks opened.">Bookmarks</button><button data-demo-simulate="Storydate / RP State opened.">Story / RP State</button><button data-demo-clear-chat>Clear</button><button data-demo-reset-chat>Reset</button></div><div class="fake-messages demo-full-messages" data-demo-messages>${messages.map((m,i)=>messageHTML(m,bot,i)).join('')}</div><div class="fake-scroll-tools"><button type="button" data-preview="scroll-top" hidden title="Scroll to top">↑</button><button type="button" data-preview="scroll-bottom" hidden title="Scroll to bottom">↓</button></div><div class="fake-composer demo-full-composer"><div class="fake-composer-tools"><button aria-label="Plus-button">＋</button><button data-testid="ImageGenerationButton" data-preview="image-button">Image</button><button data-preview="ooc-button" hidden>OOC</button><button data-preview="asterisk-button" hidden>*</button><button data-testid="ChatBar-ListenButton" data-preview="voice-button">Voice</button><button data-preview="persona-switch" hidden>Persona</button><button data-preview="export-button" hidden>Export</button></div><div class="fake-compose-row"><textarea data-demo-composer rows="2" maxlength="500" placeholder="Type a dummy message… nothing gets sent anywhere."></textarea><button type="button" class="fake-send" data-demo-send>Send</button></div></div></section>`;}

  function presetMessages(botName){return [{who:'bot',text:`*${botName} glances toward the demo controls.* This is fake SFW website text for testing message tools.`},{who:'user',text:'I am testing timestamps, quick actions, search, bookmarks and formatting.'},{who:'bot',text:'Try the QoL settings gear. This longer reply gives bubble appearance, line spacing, generation metadata and display-only formatting something visible to change.'},{who:'ooc',text:'[OOC: This is a preset demo OOC line.]'},{who:'user',text:'Search target: gearbox. `Backtick dialogue test.` *Action formatting test.*'},{who:'bot',text:'If an option normally needs server data, a browser permission, a download, or another tab, the playground only simulates the action.'}];}
  function messageHTML(message,bot,i){const who=message.who||'user';const name=who==='bot'?bot.name:who==='ooc'?'OOC':(app.persona||'Demo user');const avatar=who==='bot'?`<img src="${escapeAttr(bot.image)}" onerror="this.src='/assets/brand/extension-icon.jpg'" alt="">`:`<span class="fake-message-avatar">${who==='ooc'?'O':'D'}</span>`;return `<article id="message-demo-${i}" class="fake-message ${escapeAttr(who)}"><div class="fake-message-head">${avatar}<strong>${escapeHTML(name)}</strong><time data-preview="timestamps" hidden>${fakeTime()}</time><span class="fake-message-spacer"></span><div class="fake-message-quick" data-preview="quick-actions" hidden><button type="button" data-preview-action="copy" hidden>Copy</button><button type="button" data-preview-action="edit" hidden>Edit</button><button type="button" data-preview-action="report" hidden>Report</button></div><button type="button" class="fake-message-menu" data-preview="original-menu" aria-label="message-dropdown">⋮</button></div><div class="fake-message-text">${formatText(message.text||'')}</div>${who==='bot'?'<div class="fake-meta" data-preview="metadata" hidden><span data-preview="generation-model" hidden>Model: Demo Model</span><span data-preview="generation-elapsed" hidden>1.4s</span><span data-preview="generation-settings" hidden>T 0.8 · P 0.95</span></div>':''}</article>`;}
  function addDummyMessage(){const composer=routeHost.querySelector('[data-demo-composer]');if(!composer)return;const text=composer.value.trim();if(!text)return;const current=Array.isArray(app.messages)?app.messages:presetMessages((bots.find(b=>b.id===activeBotId)||{}).name||'Yui Kimura');app.messages=[...current,{who:'user',text}];saveAppState();renderRoute('chat');requestAnimationFrame(()=>{const host=routeHost.querySelector('[data-demo-messages]');if(host)host.scrollTop=host.scrollHeight;});}

  function filterCardsBySettings(list, settings) {
    const on = settings.enabled !== false; if (!on) return list;
    let out=[...list];
    if (settingTrue(settings,['hideOpenedBots','hideOpenedCards','hideOpenedChats','hideOpenedOnHome'],['hide','opened'])) out=out.filter(b=>!botState(b).opened);
    if (settingTrue(settings,['hideFavoriteBots','hideFavoritesFromHome'],['hide','favorite'])) out=out.filter(b=>!botState(b).favorite);
    if (settingTrue(settings,['hideOwnBots','recommendationsHideOwnBots'],['hide','own','bot'])) out=[];
    if (settingTrue(settings,['onlyLorebookBots','recommendationsLorebookOnly'],['lorebook','only'])) out=out.filter(b=>b.hasLorebook);
    return out;
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
