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
  const DEFAULT_MODE = 'dev';
  const VALID_MODES = new Set(['stable', 'dev']);

  const presetMessages = [
    { who: 'bot', text: '*Yui glances from the bike on the stand to the settings panel beside the chat.*\nThe chain is behaving now. Your turn to see whether the buttons are.' },
    { who: 'user', text: 'Good. I changed a few QoL options.' },
    { who: 'bot', text: 'Then this is probably the part where you turn half the interface on and off just to prove you can.' },
    { who: 'ooc', text: '[OOC: This is a harmless preset used only to demonstrate OOC styling.]' }
  ];

  let mode = localStorage.getItem('sqol-demo-mode') || DEFAULT_MODE;
  if (!VALID_MODES.has(mode)) mode = DEFAULT_MODE;
  let storedSettings = readStore(mode);
  let draftSettings = {};
  let currentSource = null;

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

  document.querySelector('[data-demo-clear-chat]')?.addEventListener('click', () => {
    messagesHost.innerHTML = '';
    showToast('Dummy chat cleared.');
  });

  document.querySelector('[data-demo-reset-chat]')?.addEventListener('click', () => {
    renderPresetMessages();
    showToast('Dummy messages reset.');
  });

  document.querySelector('[data-demo-send]')?.addEventListener('click', addDummyMessage);
  composer?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      addDummyMessage();
    }
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
    setSource('loading', `Loading ${nextMode === 'dev' ? 'Development' : 'Stable'} settings…`);
    placeholder.hidden = false;
    placeholder.innerHTML = '<strong>Loading settings…</strong><span>The exact options page will appear here.</span>';
    frame.removeAttribute('srcdoc');
    frame.style.visibility = 'hidden';
    currentSource = null;

    try {
      const source = await loadSettingsSource(nextMode);
      currentSource = source;
      const manifest = JSON.parse(source.manifest.text);
      const version = manifest.version || 'unknown';
      buildLabel.textContent = `v${version}`;
      setSource(source.live ? 'live' : 'fallback', source.live
        ? `${nextMode === 'dev' ? 'Development' : 'Stable'} settings loaded from the live GitHub root.`
        : `Development root settings are not uploaded yet — running the bundled exact v${version} settings snapshot.`);
      frame.srcdoc = buildSrcdoc(source, manifest, nextMode);
      frame.onload = () => {
        placeholder.hidden = true;
        frame.style.visibility = 'visible';
        applyPreview({ ...readStore(nextMode), ...draftSettings });
      };
    } catch (error) {
      buildLabel.textContent = 'not available yet';
      setSource('fallback', nextMode === 'stable'
        ? 'Stable settings cannot be embedded 1:1 yet because the Stable repository is still empty. This mode will activate automatically when the root settings files are uploaded.'
        : 'Could not load the demo settings source right now.');
      placeholder.hidden = false;
      placeholder.innerHTML = nextMode === 'stable'
        ? '<strong>Stable settings source is not published yet.</strong><span>I am not substituting the DEV UI and pretending it is Stable. Switch to Development for the full working demo.</span>'
        : '<strong>Could not load the settings demo.</strong><span>Try refreshing the page.</span>';
      frame.style.visibility = 'hidden';
      applyPreview(storedSettings);
    }
  }

  async function loadSettingsSource(project) {
    const fallbackBase = project === 'dev' ? '/data/demo/dev/' : null;
    const names = [
      ['html', 'options.html'],
      ['css', 'options.css'],
      ['js', 'options.js'],
      ['manifest', 'manifest.json'],
      ['changelog', 'CHANGELOG.md']
    ];
    const out = {};
    for (const [key, file] of names) {
      out[key] = await SQOLSource.text(project, file, fallbackBase ? `${fallbackBase}${file}` : null);
    }
    out.live = names.every(([key]) => out[key].source !== 'fallback');
    return out;
  }

  function buildSrcdoc(source, manifest, sourceMode) {
    let html = source.html.text
      .replace(/<link[^>]+href=["']options\.css["'][^>]*>/i, '')
      .replace(/<script[^>]+src=["']options\.js["'][^>]*><\/script>/i, '');

    const shim = makeShim(sourceMode, manifest, source.changelog.text);
    const bridge = makeBridge(sourceMode);
    const extraCss = `
      html{color-scheme:dark} body{min-width:0!important} main{max-width:980px!important;padding:22px 22px 90px!important}
      header{position:static!important}.help-link[href^="http"]{cursor:not-allowed}.demo-only-banner{background:#23161c;border:1px solid rgba(236,61,104,.28);border-radius:12px;padding:10px 12px;margin-bottom:14px;color:#d7c9cf;font-size:13px}.demo-only-banner strong{color:#ff91a8}
    `;
    html = html.replace('</head>', `<style>${source.css.text}\n${extraCss}</style><script>${shim}<\/script></head>`);
    html = html.replace('<main>', '<main><div class="demo-only-banner"><strong>Website demo:</strong> settings are stored only in this page\'s demo localStorage. External actions are disabled.</div>');
    html = html.replace('</body>', `<script>${source.js.text}<\/script><script>${bridge}<\/script></body>`);
    return html;
  }

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
        const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return {}}};
        const write=(v)=>{localStorage.setItem(KEY,JSON.stringify(v)); parent.postMessage({type:'sqol-demo-storage',mode:MODE,storage:v},'*')};
        const pick=(store,keys)=>{
          if(keys==null)return {...store};
          if(typeof keys==='string')return Object.prototype.hasOwnProperty.call(store,keys)?{[keys]:store[keys]}:{};
          if(Array.isArray(keys)){const o={};keys.forEach(k=>{if(Object.prototype.hasOwnProperty.call(store,k))o[k]=store[k]});return o}
          if(typeof keys==='object'){const o={};Object.keys(keys).forEach(k=>o[k]=store[k]===undefined?keys[k]:store[k]);return o}
          return {};
        };
        const storage={
          get(keys,cb){const out=pick(read(),keys);queueMicrotask(()=>cb&&cb(out));},
          set(obj,cb){const s={...read(),...(obj||{})};write(s);queueMicrotask(()=>cb&&cb());},
          remove(keys,cb){const s=read();(Array.isArray(keys)?keys:[keys]).forEach(k=>delete s[k]);write(s);queueMicrotask(()=>cb&&cb());},
          clear(cb){write({});queueMicrotask(()=>cb&&cb());},
          getBytesInUse(keys,cb){const data=pick(read(),keys);const bytes=new TextEncoder().encode(JSON.stringify(data)).length;queueMicrotask(()=>cb&&cb(bytes));}
        };
        window.chrome=window.chrome||{};
        window.chrome.storage={local:storage};
        window.chrome.runtime={
          lastError:null,
          getManifest:()=>MANIFEST,
          getURL:(path)=>path==='CHANGELOG.md'?'data:text/plain;charset=utf-8,'+encodeURIComponent(CHANGELOG):'data:text/plain,',
          sendMessage:(msg,cb)=>{
            let response={ok:true};
            if(msg&&msg.type==='DS_AUTO_AFK_RUN_NOW')response={ok:true,summary:{at:Date.now(),enabled:true,monitored:4,protected:1,recent:2,eligible:1,cleaned:1,failed:0}};
            if(msg&&msg.type==='DS_GET_DIAGNOSTIC_CONTEXT')response={ok:true,url:'https://demo.invalid/chat/yui',pageType:'chat',title:'Yui Kimura — website demo'};
            queueMicrotask(()=>cb&&cb(response));
          }
        };
        try{Object.defineProperty(navigator,'clipboard',{value:{writeText:async(text)=>{parent.postMessage({type:'sqol-demo-toast',message:'Copied inside the demo only.'},'*');return undefined}},configurable:true})}catch{}
        window.open=()=>{parent.postMessage({type:'sqol-demo-toast',message:'External links are disabled inside the demo.'},'*');return null};
        addEventListener('click',e=>{const a=e.target.closest?.('a');if(!a)return;if(a.href||a.download){e.preventDefault();e.stopImmediatePropagation();parent.postMessage({type:'sqol-demo-toast',message:a.download?'Demo download action simulated.':'External links are disabled inside the demo.'},'*')}},true);
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
            else if(el.type==='radio'){if(el.checked&&el.name)d[el.name]=el.value;}
            else d[el.id]=el.value;
          });
          parent.postMessage({type:'sqol-demo-draft',mode:MODE,draft:d},'*');
        }
        document.addEventListener('change',()=>setTimeout(draft,0));
        document.addEventListener('input',e=>{if(e.target.matches('select,input[type=range],input[type=number]'))setTimeout(draft,0)});
        setTimeout(()=>{draft(); chrome.storage.local.get(null,s=>parent.postMessage({type:'sqol-demo-storage',mode:MODE,storage:s},'*'))},500);
      })();`;
  }

  function setModeUI() {
    modeButtons.forEach(button => button.classList.toggle('active', button.dataset.demoMode === mode));
    modeBadge.textContent = mode === 'dev' ? 'DEV' : 'Stable';
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
