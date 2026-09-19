(() => {
  const frame = document.querySelector('[data-settings-frame]');
  if (!frame) return;

  const modeButtons = [...document.querySelectorAll('[data-demo-mode]')];
  const sourceState = document.querySelector('[data-demo-source]');
  const buildLabel = document.querySelector('[data-demo-build]');
  const modeBadge = document.querySelector('[data-demo-mode-badge]');
  const placeholder = document.querySelector('[data-demo-placeholder]');
  const preview = document.querySelector('[data-chat-preview]');
  const messagesHost = document.querySelector('[data-demo-messages]');
  const composer = document.querySelector('[data-demo-composer]');
  const toast = document.querySelector('[data-demo-toast]');
  const DEFAULT_MODE = 'stable';
  const VALID_MODES = new Set(['stable', 'dev']);

  const presetMessages = [
    { who: 'bot', text: '*Yui glances from the bike on the stand to the settings panel beside the chat.*\nThe chain is behaving now. Your turn to see whether the buttons are.' },
    { who: 'user', text: 'This is a dummy chat, so I am turning random QoL options on and off.' },
    { who: 'bot', text: 'Good. Try timestamps, message actions, model details, scroll buttons, OOC tools, persona switching, or the Mini Panel. Nothing here is connected to a real chat.' },
    { who: 'ooc', text: '[OOC: This preset exists only to demonstrate OOC styling and controls.]' },
    { who: 'user', text: '*Action formatting test.* Plain dialogue test. `Backtick dialogue test.`' },
    { who: 'bot', text: '*Yui taps a wrench against the workbench once.*\nThis message is intentionally longer so text size, line spacing, bubble appearance, search, bookmarks, formatting repair and other display options have something obvious to work with. It is still completely fake demo text.' },
    { who: 'user', text: 'Search target: gearbox. Search target: gearbox. Whole-word and case-sensitive tests can use this message.' },
    { who: 'bot', text: 'Model and generation metadata can appear below this reply when those demo settings are enabled.' },
    { who: 'user', text: 'Persona test message. Switching a demo persona should never touch a real SpicyChat persona.' },
    { who: 'bot', text: '*Yui folds her arms.*\nIf a setting normally needs SpicyChat server data, notifications, downloads, another tab, or an external service, the demo only shows or simulates the control.' },
    { who: 'ooc', text: '[OOC: No NSFW content is included in the website demo.]' }
  ];

  let mode = localStorage.getItem('sqol-demo-mode') || DEFAULT_MODE;
  if (!VALID_MODES.has(mode)) mode = DEFAULT_MODE;
  let storedSettings = readStore(mode);
  let draftSettings = {};

  renderPresetMessages();
  setModeUI();
  loadMode(mode);

  modeButtons.forEach(button => button.addEventListener('click', () => {
    const next = button.dataset.demoMode;
    if (!VALID_MODES.has(next) || next === mode) return;
    mode = next;
    localStorage.setItem('sqol-demo-mode', mode);
    storedSettings = readStore(mode);
    draftSettings = {};
    setModeUI();
    loadMode(mode);
  }));

  document.querySelector('[data-demo-reset]')?.addEventListener('click', () => {
    localStorage.removeItem(storageKey(mode));
    storedSettings = {};
    draftSettings = {};
    showToast(`${mode === 'dev' ? 'Development' : 'Stable'} demo settings reset.`);
    loadMode(mode);
  });
  document.querySelector('[data-demo-clear-chat]')?.addEventListener('click', () => { messagesHost.innerHTML = ''; showToast('Dummy chat cleared.'); });
  document.querySelector('[data-demo-reset-chat]')?.addEventListener('click', () => { renderPresetMessages(); showToast('Dummy messages reset.'); });
  document.querySelector('[data-demo-send]')?.addEventListener('click', addDummyMessage);
  composer?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); addDummyMessage(); }
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

  async function loadMode(nextMode) {
    const label = nextMode === 'dev' ? 'Development main' : 'Stable v0.2.0';
    setSource('loading', `Loading ${label} settings from GitHub…`);
    placeholder.hidden = false;
    placeholder.innerHTML = '<strong>Loading settings…</strong><span>The real QoL options page will appear here.</span>';
    frame.removeAttribute('srcdoc');
    frame.style.visibility = 'hidden';

    try {
      const source = await loadSettingsSource(nextMode);
      const manifest = JSON.parse(source.manifest.text);
      const version = manifest.version_name || manifest.version || 'unknown';
      let buildText = nextMode === 'dev' ? `main · v${version}` : `v${version}`;
      if (nextMode === 'dev') {
        try {
          const d = await SQOLSource.developmentLatest();
          if (d.referenceCommit) buildText = `main · ${d.referenceCommit.slice(0, 7)} · v${version}`;
        } catch (_) {}
      }
      buildLabel.textContent = buildText;
      setSource(source.live ? 'live' : 'fallback', source.live
        ? `${label} settings loaded from the public source repository.`
        : `${label} is using the bundled website snapshot because GitHub is temporarily unavailable.`);
      frame.srcdoc = buildSrcdoc(source, manifest, nextMode);
      frame.onload = () => {
        placeholder.hidden = true;
        frame.style.visibility = 'visible';
        applyPreview({ ...readStore(nextMode), ...draftSettings });
      };
    } catch (error) {
      buildLabel.textContent = 'temporarily unavailable';
      setSource('fallback', `Could not load the ${label} settings source right now.`);
      placeholder.hidden = false;
      placeholder.innerHTML = '<strong>Settings demo is temporarily unavailable.</strong><span>The demo deliberately does not substitute an unrelated old build. Refresh when GitHub is reachable again.</span>';
      frame.style.visibility = 'hidden';
      applyPreview(storedSettings);
    }
  }

  async function loadSettingsSource(project) {
    // Stable is pinned to the v0.2.0 tag; Development follows main.
    const fallbackBase = project === 'stable' ? '/data/demo/stable/' : '/data/demo/dev-current/';
    const names = [
      ['html', 'options.html'],
      ['css', 'options.css'],
      ['registry', 'feature-registry.js'],
      ['js', 'options.js'],
      ['manifest', 'manifest.json'],
      ['changelog', 'CHANGELOG.md']
    ];
    const out = {};
    for (const [key, file] of names) {
      let fallback = null;
      try {
        const probe = await fetch(`${fallbackBase}${file}`, { method: 'HEAD', cache: 'no-store' });
        if (probe.ok) fallback = `${fallbackBase}${file}`;
      } catch (_) {}
      out[key] = await SQOLSource.text(project, file, fallback);
    }
    out.live = names.every(([key]) => out[key].source !== 'fallback');
    return out;
  }

  function buildSrcdoc(source, manifest, sourceMode) {
    let html = source.html.text
      .replace(/<link[^>]+href=["']options\.css["'][^>]*>/i, '')
      .replace(/<script[^>]+src=["']feature-registry\.js["'][^>]*><\/script>/i, '')
      .replace(/<script[^>]+src=["']options\.js["'][^>]*><\/script>/i, '');

    const shim = makeShim(sourceMode, manifest, source.changelog.text);
    const bridge = makeBridge(sourceMode);
    const registry = safeScript(source.registry.text);
    const options = safeScript(source.js.text);
    const extraCss = `
      html{color-scheme:dark} body{min-width:0!important} main{max-width:980px!important;padding:22px 22px 90px!important}
      header{position:static!important}.help-link[href^="http"]{cursor:not-allowed}.demo-only-banner{background:#23161c;border:1px solid rgba(236,61,104,.28);border-radius:12px;padding:10px 12px;margin-bottom:14px;color:#d7c9cf;font-size:13px}.demo-only-banner strong{color:#ff91a8}
    `;
    html = html.replace('</head>', `<style>${source.css.text}\n${extraCss}</style><script>${shim}<\/script></head>`);
    html = html.replace(/<main([^>]*)>/i, '<main$1><div class="demo-only-banner"><strong>Website demo:</strong> this is the real QoL settings UI, but its storage and browser actions are sandboxed. Nothing connects to your SpicyChat account.</div>');
    html = html.replace('</body>', `<script>${registry}<\/script><script>${options}<\/script><script>${bridge}<\/script></body>`);
    return html;
  }

  function safeScript(text) { return String(text || '').replace(/<\/script/gi, '<\\/script'); }

  function makeShim(sourceMode, manifest, changelog) {
    const safeManifest = JSON.stringify(manifest).replace(/</g, '\\u003c');
    const safeChangelog = JSON.stringify(changelog).replace(/</g, '\\u003c');
    const safeMode = JSON.stringify(sourceMode);
    return `
      (()=>{
        const MODE=${safeMode};
        const KEY='sqol-demo-storage-'+MODE;
        const MANIFEST=${safeManifest};
        const CHANGELOG=${safeChangelog};
        const changeListeners=[];
        const runtimeListeners=[];
        const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return {}}};
        const notify=(changes)=>{changeListeners.forEach(fn=>{try{fn(changes,'local')}catch{}})};
        const write=(next,changes={})=>{localStorage.setItem(KEY,JSON.stringify(next));notify(changes);parent.postMessage({type:'sqol-demo-storage',mode:MODE,storage:next},'*')};
        const pick=(store,keys)=>{
          if(keys==null)return {...store};
          if(typeof keys==='string')return Object.prototype.hasOwnProperty.call(store,keys)?{[keys]:store[keys]}:{};
          if(Array.isArray(keys)){const o={};keys.forEach(k=>{if(Object.prototype.hasOwnProperty.call(store,k))o[k]=store[k]});return o}
          if(typeof keys==='object'){const o={};Object.keys(keys).forEach(k=>o[k]=store[k]===undefined?keys[k]:store[k]);return o}
          return {};
        };
        const done=(cb,value)=>{if(typeof cb==='function'){queueMicrotask(()=>cb(value));return undefined}return Promise.resolve(value)};
        const storage={
          get(keys,cb){return done(cb,pick(read(),keys))},
          getKeys(cb){return done(cb,Object.keys(read()))},
          set(obj,cb){const prev=read(),next={...prev,...(obj||{})},changes={};Object.entries(obj||{}).forEach(([k,v])=>{if(prev[k]!==v)changes[k]={oldValue:prev[k],newValue:v}});write(next,changes);return done(cb)},
          remove(keys,cb){const prev=read(),next={...prev},changes={};(Array.isArray(keys)?keys:[keys]).forEach(k=>{if(Object.prototype.hasOwnProperty.call(next,k)){changes[k]={oldValue:next[k],newValue:undefined};delete next[k]}});write(next,changes);return done(cb)},
          clear(cb){const prev=read(),changes={};Object.keys(prev).forEach(k=>changes[k]={oldValue:prev[k],newValue:undefined});write({},changes);return done(cb)},
          getBytesInUse(keys,cb){const bytes=new TextEncoder().encode(JSON.stringify(pick(read(),keys))).length;return done(cb,bytes)}
        };
        const event=(list)=>({addListener(fn){if(typeof fn==='function'&&!list.includes(fn))list.push(fn)},removeListener(fn){const i=list.indexOf(fn);if(i>=0)list.splice(i,1)},hasListener(fn){return list.includes(fn)}});
        const demoToast=(message)=>parent.postMessage({type:'sqol-demo-toast',message},'*');
        const runtimeResponse=(msg)=>{
          if(msg&&msg.type==='DS_AUTO_AFK_RUN_NOW')return {ok:true,summary:{at:Date.now(),enabled:true,monitored:4,protected:1,recent:2,eligible:1,cleaned:1,failed:0}};
          if(msg&&msg.type==='DS_GET_DIAGNOSTIC_CONTEXT')return {ok:true,url:'https://demo.invalid/chat/yui',pageType:'chat',title:'Yui Kimura — website demo'};
          if(msg&&msg.type==='DS_GET_PAGE_DIAGNOSTICS')return {ok:true,environment:{browser:'Website demo',platform:'demo'},scheduler:{demo:true}};
          return {ok:true,demo:true};
        };
        window.chrome=window.chrome||{};
        chrome.storage={local:storage,onChanged:event(changeListeners)};
        chrome.runtime={
          lastError:null,
          onMessage:event(runtimeListeners),
          getManifest:()=>MANIFEST,
          getPlatformInfo:(cb)=>done(cb,{os:'android',arch:'x86-64',nacl_arch:'x86-64'}),
          getURL:(path)=>path==='CHANGELOG.md'?'data:text/plain;charset=utf-8,'+encodeURIComponent(CHANGELOG):'data:text/plain;charset=utf-8,',
          sendMessage:(msg,cb)=>done(cb,runtimeResponse(msg))
        };
        chrome.permissions={
          contains:(q,cb)=>done(cb,false),
          request:(q,cb)=>{demoToast('Permission request simulated in the website demo.');return done(cb,false)},
          remove:(q,cb)=>done(cb,true)
        };
        chrome.tabs={
          create:(info,cb)=>{demoToast('Opening browser tabs is disabled in the website demo.');return done(cb,{id:999,url:info?.url||'about:blank',active:true})},
          query:(q,cb)=>done(cb,[{id:999,active:true,currentWindow:true,url:'https://demo.invalid/chat/yui',title:'Yui Kimura — website demo'}]),
          sendMessage:(id,msg,cb)=>done(cb,runtimeResponse(msg))
        };
        chrome.downloads={download:(info,cb)=>{demoToast('Download action simulated; no file was created.');return done(cb,1)}};
        chrome.notifications={create:(id,opts,cb)=>{demoToast('Browser notification simulated.');return done(cb,id||'demo')}};
        try{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{demoToast('Copied inside the demo only.')}},configurable:true})}catch{}
        window.open=()=>{demoToast('External links are disabled inside the demo.');return null};
        addEventListener('click',e=>{const a=e.target.closest?.('a');if(!a)return;if(a.href||a.download){e.preventDefault();e.stopImmediatePropagation();demoToast(a.download?'Demo download action simulated.':'External links are disabled inside the demo.')}},true);
      })();`;
  }

  function makeBridge(sourceMode) {
    const safeMode = JSON.stringify(sourceMode);
    return `
      (()=>{
        const MODE=${safeMode};
        function draft(){
          const d={};
          document.querySelectorAll('input[id],select[id],textarea[id]').forEach(el=>{
            if(el.type==='checkbox')d[el.id]=el.checked;
            else if(el.type==='radio'){if(el.checked&&el.name)d[el.name]=el.value}
            else d[el.id]=el.value;
          });
          parent.postMessage({type:'sqol-demo-draft',mode:MODE,draft:d},'*');
        }
        document.addEventListener('change',()=>setTimeout(draft,0));
        document.addEventListener('input',e=>{if(e.target.matches('select,input[type=range],input[type=number]'))setTimeout(draft,0)});
        setTimeout(()=>{draft();chrome.storage.local.get(null,s=>parent.postMessage({type:'sqol-demo-storage',mode:MODE,storage:s},'*'))},700);
      })();`;
  }

  function setModeUI() {
    modeButtons.forEach(button => button.classList.toggle('active', button.dataset.demoMode === mode));
    modeBadge.textContent = mode === 'dev' ? 'Development' : 'Stable';
    modeBadge.className = `badge ${mode === 'dev' ? 'warn' : 'good'}`;
  }

  function setSource(kind, text) {
    sourceState.className = `source-state ${kind === 'live' ? 'live' : kind === 'fallback' ? 'fallback' : ''}`;
    sourceState.textContent = text;
  }

  function storageKey(which) { return `sqol-demo-storage-${which}`; }
  function readStore(which) {
    try { return JSON.parse(localStorage.getItem(storageKey(which)) || '{}') || {}; }
    catch { return {}; }
  }

  function applyPreview(settings = {}) {
    const on = settings.enabled !== false;
    const enabled = key => on && !!settings[key];
    toggle('[data-preview="quick-panel"]', enabled('showQuickPanel'));
    const panel = preview.querySelector('[data-preview="quick-panel"]');
    if (panel) panel.dataset.placement = settings.quickPanelPlacement || 'bottom-right';
    toggle('[data-preview="timestamps"]', enabled('showMessageTimestamps'));
    toggle('[data-preview="metadata"]', enabled('showGenerationMetadata') || enabled('showGenerationModel') || enabled('showGenerationElapsed') || enabled('showGenerationSettings'));
    toggle('[data-preview="generation-model"]', enabled('showGenerationModel'));
    toggle('[data-preview="generation-elapsed"]', enabled('showGenerationElapsed'));
    toggle('[data-preview="generation-settings"]', enabled('showGenerationSettings'));
    toggle('[data-preview="generation-profile"]', enabled('enableGenerationProfiles'));
    toggle('[data-preview="quick-actions"]', enabled('showMessageQuickActions'));
    toggle('[data-preview-action="copy"]', enabled('showMessageQuickActions') && enabled('messageQuickActionCopy'));
    toggle('[data-preview-action="edit"]', enabled('showMessageQuickActions') && enabled('messageQuickActionEdit'));
    toggle('[data-preview-action="report"]', enabled('showMessageQuickActions') && enabled('messageQuickActionReport'));
    toggle('[data-preview="original-menu"]', !enabled('hideOriginalMessageDropdown'));
    toggle('[data-preview="scroll-top"]', enabled('showScrollToTopButton'));
    toggle('[data-preview="scroll-bottom"]', enabled('showScrollToBottomButton'));
    toggle('[data-preview="chat-history"]', enabled('showPerCharacterChatHistory'));
    toggle('[data-preview="quick-new-chat"]', enabled('showQuickNewChatButton'));
    toggle('[data-preview="later"]', enabled('chatTopBarAddLaterButton'));
    toggle('[data-preview="generation-profile"]', enabled('enableGenerationProfiles'));
    toggle('[data-preview="ooc-button"]', enabled('showOocTools') || enabled('replaceChatImageWithOocButton'));
    toggle('[data-preview="image-button"]', !enabled('hideChatImageButton') && !enabled('replaceChatImageWithOocButton'));
    toggle('[data-preview="asterisk-button"]', enabled('showAsteriskButton'));
    toggle('[data-preview="voice-button"]', !enabled('hideChatVoiceButton'));
    toggle('[data-preview="persona-switch"]', enabled('showPersonaQuickSwitch'));
    toggle('[data-preview="export-button"]', enabled('showChatExportButton'));
    toggle('[data-preview="panel-ooc"]', enabled('quickPanelShowOoc'));
    toggle('[data-preview="panel-persona"]', enabled('quickPanelShowPersona'));
    toggle('[data-preview="panel-export"]', enabled('quickPanelShowExport'));
    toggle('[data-preview="promo"]', !(enabled('hideAdvertBanners') || enabled('hidePremium')));
    sidebar('home', !enabled('hideSidebarHome'));
    sidebar('chats', !enabled('hideSidebarChats'));
    sidebar('personas', !enabled('hideSidebarPersonas'));
    sidebar('create', !(enabled('hideSidebarCreateMenu') || enabled('hideSidebarCreateChatbot')));
    sidebar('favorites', !enabled('hideSidebarFavorites'));
    sidebar('help', !enabled('hideSidebarHelp'));
    topbar('language', !enabled('hideTopBarLanguage'));
    topbar('theme', !enabled('hideTopBarTheme'));
    topbar('notifications', !(enabled('hideTopBarNotifications') || enabled('hideNotifications')));
    preview.classList.toggle('qol-disabled', !on);
  }

  function toggle(selector, show) {
    preview.querySelectorAll(selector).forEach(el => { el.hidden = !show; });
  }
  function sidebar(name, show) { preview.querySelector(`[data-sidebar-item="${name}"]`)?.toggleAttribute('hidden', !show); }
  function topbar(name, show) { preview.querySelector(`[data-topbar-item="${name}"]`)?.toggleAttribute('hidden', !show); }

  function renderPresetMessages() {
    messagesHost.innerHTML = '';
    presetMessages.forEach(m => appendMessage(m.who, m.text));
    applyPreview({ ...storedSettings, ...draftSettings });
  }

  function appendMessage(who, text) {
    const article = document.createElement('article');
    article.className = `fake-message ${who}`;
    const name = who === 'bot' ? 'Yui Kimura' : who === 'user' ? 'Demo user' : 'OOC';
    const avatar = who === 'bot'
      ? '<img src="https://cdn.nd-api.com/avatars/0fb19108-bfb0-453e-85f3-3b5a2655ce29.png?class=image500x650" onerror="this.src=\'/assets/brand/extension-icon.jpg\'" alt="">'
      : `<span class="fake-message-avatar">${who === 'ooc' ? 'O' : 'D'}</span>`;
    article.innerHTML = `<div class="fake-message-head">${avatar}<strong>${escapeHTML(name)}</strong><time data-preview="timestamps" hidden>${fakeTime()}</time><span class="fake-message-spacer"></span><div class="fake-message-quick" data-preview="quick-actions" hidden><button type="button" data-preview-action="copy" hidden>Copy</button><button type="button" data-preview-action="edit" hidden>Edit</button><button type="button" data-preview-action="report" hidden>Report</button></div><button type="button" class="fake-message-menu" data-preview="original-menu">⋮</button></div><div class="fake-message-text">${formatText(text)}</div>${who === 'bot' ? '<div class="fake-meta" data-preview="metadata" hidden><span data-preview="generation-model" hidden>Model: Demo Model</span><span data-preview="generation-elapsed" hidden>1.4s</span><span data-preview="generation-settings" hidden>T 0.8 · P 0.95</span></div>' : ''}`;
    messagesHost.appendChild(article);
  }

  function addDummyMessage() {
    const text = composer.value.trim();
    if (!text) return;
    appendMessage('user', text);
    composer.value = '';
    applyPreview({ ...storedSettings, ...draftSettings });
    messagesHost.scrollTop = messagesHost.scrollHeight;
  }

  function formatText(text) {
    return escapeHTML(text).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
  }
  function fakeTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => toast.hidden = true, 2600);
  }
})();
