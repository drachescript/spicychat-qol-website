// ==UserScript==
// @name         SpicyChat QoL — Safari Lite (Beta)
// @namespace    https://spicychatqol.drache.uk/
// @version      0.1.0-beta.1
// @description  Free Safari iOS beta: chat folders, saved bot lists, local discovery, bot organizer and backup.
// @author       dragonGRaf
// @match        https://spicychat.ai/*
// @match        https://www.spicychat.ai/*
// @run-at       document-idle
// @grant        none
// @inject-into  content
// @noframes
// ==/UserScript==


// Compiled from SpicyChat QoL Chrome v0.2.53. Original files remain unchanged.

// Safari adapter: browser API replacements and local storage

(() => {
  'use strict';
  if (window.__DSQ_SAFARI_LITE_LOADED__) return;
  window.__DSQ_SAFARI_LITE_LOADED__ = true;
  if (window.DragonScriptQoL && !window.DragonScriptQoL.__safariUserscript) return;
  const DS = window.DragonScriptQoL = window.DragonScriptQoL || {};
  DS.__safariUserscript = true;
  DS.EXT_NAME = 'SpicyChat QoL Safari beta';
  DS.BOT_ORGANIZER_KEY = 'botOrganization';
  DS.CHAT_ORGANIZER_KEY = 'chatOrganization';
  const ROOT_KEY = 'dragonSpicychatQolSafariLite_v1';
  const VERSION = '0.1.0-beta.1';
  const defaults = () => ({
    settings: {
      enabled: true,
      enableChatOrganizer: false,
      enableBotOrganizer: false,
      enableSavedListsOverlay: false,
      enableSafariSaveButtons: false,
      enableSafariDiscovery: false,
      botOrganizerBulkTools: false,
      botOrganizerExplorerFolders: false,
      botOrganizerMobileBulkAllowProfile: true,
      chatCollections: '', botCollections: ''
    },
    botOrganization: { collections: [], folderScopes: {}, folderCovers: {}, meta: {} },
    chatOrganization: { meta: {} },
    favoriteBots: { ids: [], meta: {} },
    laterBots: { ids: [], meta: {} }
  });
  const errorLog = [];
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const unique = values => [...new Set((values || []).filter(v => typeof v === 'string').map(clean).filter(Boolean))];
  DS.uniqueClean = unique;
  const clone = value => JSON.parse(JSON.stringify(value));
  function report(context, error) {
    const message = clean(error?.message || error || 'unknown error').slice(0, 280);
    errorLog.unshift({ time: new Date().toISOString(), context, message });
    errorLog.length = Math.min(errorLog.length, 30);
    console.warn('[QoL Safari]', context, error);
  }
  function validateStore(source) {
    const fresh = defaults();
    if (!source || typeof source !== 'object' || Array.isArray(source)) return fresh;
    for (const key of ['botOrganization','chatOrganization','favoriteBots','laterBots']) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) fresh[key] = source[key];
    }
    // Only recognize this userscript's supported settings; never automatically enable
    // features from a desktop export during import.
    const allowed = Object.keys(fresh.settings);
    for (const key of allowed) {
      if (!Object.prototype.hasOwnProperty.call(source.settings || {}, key)) continue;
      const value = source.settings[key];
      if (typeof fresh.settings[key] === typeof value) fresh.settings[key] = value;
    }
    return fresh;
  }
  let initial = defaults();
  try { initial = validateStore(JSON.parse(localStorage.getItem(ROOT_KEY) || 'null')); }
  catch (e) { report('Reading local data', e); }
  DS.state = initial;
  DS.state.favoriteBotIdSet = new Set(DS.state.favoriteBots?.ids || []);
  DS.state.laterBotIdSet = new Set(DS.state.laterBots?.ids || []);
  function persist() {
    try {
      const {settings, botOrganization, chatOrganization, favoriteBots, laterBots} = DS.state;
      localStorage.setItem(ROOT_KEY, JSON.stringify({settings, botOrganization, chatOrganization, favoriteBots, laterBots}));
      return true;
    } catch (e) { report('Saving (storage may be full or private)', e); DS.setQuickStatus?.('Could not save! Export a backup and check Safari storage.', true); return false; }
  }
  DS.storageSet = async patch => { Object.assign(DS.state, patch || {}); if (!persist()) throw Error('Safari local storage failed'); return true; };
  DS.storageGet = async keys => Object.fromEntries((keys || []).map(key => [key, DS.state[key]]));
  DS.saveChatOrganization = async store => { DS.state.chatOrganization = store; return persist(); };
  DS.saveBotOrganization = async store => { DS.state.botOrganization = store; return persist(); };
  DS.saveLaterBots = async store => { DS.state.laterBots = store; DS.state.laterBotIdSet = new Set(store.ids || []); return persist(); };
  DS.saveSettingsPatch = async patch => DS.storageSet({ settings: { ...DS.state.settings, ...(patch || {}) } });
  DS.recordLocalChange = async () => {};
  DS.qsa = (selector, root = document) => { try { return [...root.querySelectorAll(selector)]; } catch { return []; } };
  DS.qs = (selector, root = document) => { try { return root.querySelector(selector); } catch { return null; } };
  DS.normalize = text => clean(text).toLowerCase();
  DS.normalizeTextForDisplay = text => String(text ?? '');
  DS.setClassState = (el, cls, state) => { el?.classList.toggle(cls, !!state); };
  DS.setTextIfChanged = (el, text) => { if (el && el.textContent !== text) el.textContent = text; };
  DS.setAttributeIfChanged = (el, attr, text) => { if (el && el.getAttribute(attr) !== text) el.setAttribute(attr,text); };
  // This is used only by the copied extension's fixed, trusted Saved Lists markup.
  DS.setSafeMarkup = (el, html) => { if (el) el.innerHTML = html; };
  DS.chatIdFromHref = href => {
    try { const url = new URL(href, location.origin); if (url.origin !== location.origin) return null;
      const path = url.pathname.replace(/^\/[a-z]{2}(?=\/)/i, ''); return path.match(/^\/chat\/([^/?#]+)/i)?.[1] || null;
    } catch { return null; }
  };
  DS.botIdFromHref = href => {
    const fromChat = DS.chatIdFromHref(href);
    if (fromChat) return fromChat;
    try { const u = new URL(href, location.origin); if (u.origin !== location.origin) return null;
      const match = u.pathname.replace(/^\/[a-z]{2}(?=\/)/i, '').match(/^\/chatbot\/([^/?#]+)/i);
      return match && !['create','edit'].includes(match[1].toLowerCase()) ? match[1] : null;
    } catch { return null; }
  };
  DS.getPageState = () => {
    const path = (location.pathname.replace(/\/+$/, '') || '/').replace(/^\/[a-z]{2}(?=\/)/i, '');
    const isChatListPage = /^\/(?:chats|chat)$/i.test(path);
    const isSingleChatPage = /^\/chat\/[^/]+/i.test(path);
    const isBotProfilePage = /^\/chatbot\/[^/]+/i.test(path) && !/\/(create|edit)(?:\/|$)/i.test(path);
    const isFavoriteBotsPage = /^\/favorite-bots(?:\/|$)/i.test(path);
    const isMyCreationsChatbotsPage = /^\/my-creations\/chatbots(?:\/|$)/i.test(path);
    const isBotEditor = /^\/chatbot\/(?:create|edit)(?:\/|$)/i.test(path);
    const isLorebookEditor = /^\/lorebook\/(?:create|edit)/i.test(path);
    const isPersonaPage = /^\/personas?(?:\/|$)/i.test(path);
    const isListingPage = path === '/' || /^\/(?:search|discover|recommended(?:-bots)?|trending|creator|favorite-bots)(?:\/|$)/i.test(path);
    return {path, isChatListPage, isSingleChatPage, isBotProfilePage, isFavoriteBotsPage,
      isMyCreationsChatbotsPage, isBotEditor, isLorebookEditor, isPersonaPage,
      routeType: isChatListPage ? 'chat-list' : isSingleChatPage ? 'chat' : isBotProfilePage ? 'bot-profile' :
        isMyCreationsChatbotsPage ? 'creator-listing' : isListingPage ? 'listing' : 'other'};
  };
  for (const flag of ['isChatListPage','isSingleChatPage','isBotProfilePage','isFavoriteBotsPage','isMyCreationsChatbotsPage'])
    DS[flag] = () => !!DS.getPageState()[flag];
  // Chat row detection adapted directly from content/chat-list.js (v0.2.53).
  DS.collectChatRows = () => {
    const results = [], seen = new Set();
    for (const anchor of DS.qsa("a[href*='/chat/']")) {
      if (anchor.closest('#dsq-safari-panel, #dsq-safari-button, #ds-saved-lists-overlay')) continue;
      const id = DS.chatIdFromHref(anchor.href);
      if (!id) continue;
      for (let el = anchor, level = 0; el && level < 12; el = el.parentElement, level++) {
        if (el === document.body || el.id === 'root' || el.tagName === 'MAIN') break;
        const cls = String(el.className || '');
        const links = DS.qsa("a[href*='/chat/']",el).filter(a => DS.chatIdFromHref(a.href));
        const textLen = clean(el.textContent).length;
        if (cls.includes('rounded') && cls.includes('relative') && links.length >= 1 && links.length <= 3 && textLen > 10 && textLen < 2600) {
          if (!seen.has(el)) { seen.add(el); el.dataset.dsQolChatRow = '1'; results.push({row: el, anchor, id, index: results.length}); }
          break;
        }
      }
    }
    return results;
  };
  DS.getChatRowTitle = row => DS.qsa('p.text-heading-6, span.text-heading-6, h2, h3, p, span',row)
    .map(el => clean(el.textContent)).find(text => text && text !== '•' && text.length <= 100) || '';
  // Bot card discovery adapted from content/cards.js & bot-blocking.js (v0.2.53).
  DS.getCardFromChatLink = anchor => {
    for (let el = anchor, level = 0; el && level < 10; el = el.parentElement, level++) {
      if (el === document.body || el.id === 'root' || el.tagName === 'MAIN') break;
      if (el.closest('#dsq-safari-panel, #ds-saved-lists-overlay')) return null;
      const cls = String(el.className || '');
      const links = DS.qsa("a[href*='/chat/'],a[href*='/chatbot/']",el).filter(a => DS.botIdFromHref(a.href));
      if (cls.includes('rounded') && cls.includes('relative') && links.length >= 1 && links.length <= 4) return el;
    }
    return null; // Never target the whole chat page as a "card".
  };
  DS.collectCards = () => {
    const results = [], seen = new Set();
    for (const anchor of DS.qsa("a[href*='/chat/'],a[href*='/chatbot/']")) {
      if (!DS.botIdFromHref(anchor.href)) continue;
      if (anchor.closest('#dsq-safari-panel, #dsq-safari-button, #ds-saved-lists-overlay')) continue;
      const card = DS.getCardFromChatLink(anchor);
      if (!card || seen.has(card)) continue;
      seen.add(card); results.push({card, anchor});
    }
    return results;
  };
  DS.getCardImageUrl = card => card?.querySelector('img')?.currentSrc || card?.querySelector('img')?.src || '';
  DS.getCardTitle = card => {
    const a = card?.querySelector("a[aria-label^='chat-with-']");
    const named = clean(a?.getAttribute('aria-label')).replace(/^chat-with-/i, '');
    if (named) return named;
    return clean(card?.querySelector('h2, h3, [title]')?.getAttribute('title') || card?.querySelector('h2,h3')?.textContent || card?.querySelector('img[alt]')?.alt || '') || 'Unnamed bot';
  };
  DS.makeBotMeta = ({id, card, anchor}) => ({ id, name: DS.getCardTitle(card), image: DS.getCardImageUrl(card),
    creator: clean(card?.querySelector("a[href*='/creator/']")?.textContent || ''), chatUrl: anchor?.href || `${location.origin}/chat/${id}`,
    profileUrl: `${location.origin}/chatbot/${id}`, savedAt: Date.now() });
  DS.findCardProfileButton = card => card?.querySelector("a[href*='/chatbot/']") || null;
  DS.getBestHideTarget = card => card;
  function toast(message, isError = false) {
    let node = document.getElementById('dsq-safari-toast');
    if (!node) { node = document.createElement('div'); node.id = 'dsq-safari-toast'; document.body.append(node); }
    node.textContent = message;
    node.dataset.error = isError ? '1' : '0';
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => node?.remove(), 3800);
  }
  DS.setQuickStatus = toast;
  DS.__safari = {VERSION, ROOT_KEY, errorLog, persist, clone, validateStore, defaults, unique, clean, report, toast};
})();


// Localized extension styles and the Safari panel styles

(() => { const style = document.createElement('style'); style.id = 'dsq-safari-style'; style.textContent = "/* v0.1.8.83 - local bot organizer */\n.ds-bot-organizer-inline-host {\n  position: relative;\n}\n\n.ds-bot-organizer-button,\n.ds-bot-bulk-select,\n.ds-bot-organizer-toolbar button,\n.ds-bot-organizer-popover button {\n  font: inherit;\n}\n\n.ds-bot-organizer-button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  padding: 0;\n  border: 1px solid rgba(148, 163, 184, 0.38);\n  border-radius: 7px;\n  background: rgba(30, 32, 36, 0.82);\n  color: inherit;\n  cursor: pointer;\n  line-height: 1;\n  font-size: 14px;\n  flex: 0 0 auto;\n}\n\n.ds-bot-organizer-button:hover,\n.ds-bot-organizer-toolbar button:hover,\n.ds-bot-organizer-popover button:hover {\n  filter: brightness(1.12);\n}\n\n.ds-bot-organizer-button-floating {\n  position: absolute;\n  right: 7px;\n  bottom: 7px;\n  z-index: 12;\n}\n\n.ds-bot-organizer-button-image {\n  position: absolute;\n  right: 7px;\n  bottom: 7px;\n  z-index: 12;\n  width: 22px;\n  height: 22px;\n  background: rgba(20, 22, 26, 0.88);\n  backdrop-filter: blur(4px);\n}\n\n.ds-bot-organizer-meta-body {\n  height: auto !important;\n  min-height: 180px !important;\n  overflow: visible !important;\n}\n\n.ds-bot-local-meta {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-wrap: wrap;\n  width: 100%;\n  min-width: 0;\n  flex: 0 0 auto;\n  box-sizing: border-box;\n  padding-top: 2px;\n  font-size: 11px;\n  line-height: 1.2;\n}\n\n.ds-bot-local-chip {\n  display: inline-flex;\n  align-items: center;\n  max-width: 145px;\n  padding: 2px 6px;\n  border-radius: 999px;\n  border: 1px solid rgba(148, 163, 184, 0.28);\n  background: rgba(51, 54, 61, 0.72);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.ds-bot-status-needs-work { background: rgba(153, 73, 19, 0.34); }\n.ds-bot-status-testing { background: rgba(49, 83, 153, 0.35); }\n.ds-bot-status-finished { background: rgba(33, 113, 74, 0.36); }\n\n.ds-bot-local-note {\n  min-width: 0;\n  max-width: min(260px, 100%);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  opacity: 0.82;\n  font-style: italic;\n}\n\n.ds-bot-organizer-toolbar {\n  position: fixed;\n  left: 50%;\n  bottom: 14px;\n  transform: translateX(-50%);\n  z-index: 95;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n  max-width: min(860px, calc(100vw - 24px));\n  padding: 7px;\n  border: 1px solid rgba(148, 163, 184, 0.32);\n  border-radius: 10px;\n  background: rgba(18, 19, 22, 0.94);\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);\n  backdrop-filter: blur(8px);\n}\n\n.ds-bot-organizer-toolbar input,\n.ds-bot-organizer-toolbar select,\n.ds-bot-organizer-toolbar button {\n  min-height: 30px;\n  border: 1px solid rgba(148, 163, 184, 0.34);\n  border-radius: 7px;\n  background: rgba(31, 33, 38, 0.96);\n  color: inherit;\n  padding: 4px 8px;\n}\n\n.ds-bot-organizer-toolbar input[type=\"search\"] {\n  width: min(190px, 40vw);\n}\n\n.ds-bot-organizer-toolbar button {\n  cursor: pointer;\n}\n\n.ds-bot-org-primary {\n  border-color: rgba(59, 130, 246, 0.72) !important;\n  background: rgba(37, 99, 235, 0.78) !important;\n  color: #fff !important;\n}\n\n.ds-bot-bulk-count {\n  font-size: 12px;\n  opacity: 0.82;\n  padding: 0 3px;\n}\n\n.ds-bot-bulk-select {\n  position: absolute;\n  left: 7px;\n  top: 7px;\n  z-index: 20;\n  width: 26px;\n  height: 26px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0;\n  border: 2px solid rgba(255, 255, 255, 0.82);\n  border-radius: 7px;\n  background: rgba(18, 19, 22, 0.9);\n  color: #fff;\n  cursor: pointer;\n  font-weight: 700;\n}\n\n.ds-bot-bulk-select[data-ds-selected=\"1\"] {\n  background: rgba(37, 99, 235, 0.94);\n  border-color: rgba(147, 197, 253, 0.95);\n}\n\n@media (max-width: 760px), (pointer: coarse) {\n  .ds-bot-bulk-select {\n    left: auto;\n    right: 10px;\n    top: 10px;\n    width: 40px;\n    height: 40px;\n    border-radius: 11px;\n    font-size: 18px;\n    touch-action: manipulation;\n    -webkit-tap-highlight-color: transparent;\n  }\n\n  .ds-bot-org-mobile-bulk {\n    cursor: pointer;\n  }\n\n  .ds-bot-org-mobile-bulk .ds-bot-bulk-select {\n    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.42);\n  }\n}\n\n.ds-bot-org-selected {\n  outline: 2px solid rgba(59, 130, 246, 0.82) !important;\n  outline-offset: 2px !important;\n}\n\n.ds-bot-org-filter-hidden {\n  display: none !important;\n}\n\n.ds-bot-organizer-popover {\n  position: fixed;\n  z-index: 2147483000;\n  width: min(330px, calc(100vw - 16px));\n  max-height: min(620px, calc(100dvh - 16px));\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  padding: 10px;\n  border: 1px solid rgba(148, 163, 184, 0.38);\n  border-radius: 12px;\n  background: #1d1f23;\n  color: #f4f4f5;\n  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.42);\n}\n\n.ds-bot-org-popover-head,\n.ds-bot-org-popover-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.ds-bot-org-popover-head {\n  justify-content: space-between;\n  margin-bottom: 10px;\n}\n\n.ds-bot-org-popover-head strong {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.ds-bot-org-popover-head button {\n  width: 30px;\n  height: 30px;\n  padding: 0;\n}\n\n.ds-bot-org-popover-body {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  min-height: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n  padding-right: 2px;\n}\n\n.ds-bot-org-field {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  font-size: 12px;\n}\n\n.ds-bot-org-field input,\n.ds-bot-org-field textarea,\n.ds-bot-org-field select,\n.ds-bot-organizer-popover button {\n  border: 1px solid rgba(148, 163, 184, 0.34);\n  border-radius: 7px;\n  background: #272a30;\n  color: inherit;\n  padding: 7px 8px;\n}\n\n.ds-bot-org-field textarea {\n  resize: vertical;\n  min-height: 74px;\n}\n\n.ds-bot-org-collections {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n  margin: 0;\n  padding: 8px;\n  border: 1px solid rgba(148, 163, 184, 0.28);\n  border-radius: 8px;\n}\n\n.ds-bot-org-collections legend {\n  padding: 0 4px;\n  font-size: 12px;\n}\n\n.ds-bot-org-collections label {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 6px;\n  border-radius: 999px;\n  background: rgba(51, 54, 61, 0.75);\n  font-size: 12px;\n}\n\n.ds-bot-org-popover-actions {\n  justify-content: flex-end;\n  flex: 0 0 auto;\n  position: sticky;\n  bottom: 0;\n  z-index: 2;\n  margin-top: 10px;\n  padding-top: 8px;\n  padding-bottom: max(2px, env(safe-area-inset-bottom));\n  background: #1d1f23;\n}\n\n.ds-bot-org-popover-actions button {\n  cursor: pointer;\n}\n\n@media (max-width: 700px) {\n  .ds-bot-organizer-toolbar {\n    left: 8px;\n    right: 8px;\n    bottom: 70px;\n    transform: none;\n    max-width: none;\n    max-height: min(38dvh, 300px);\n    overflow-y: auto;\n    overscroll-behavior: contain;\n    display: grid;\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n    align-items: stretch;\n    justify-content: stretch;\n  }\n\n  .ds-bot-organizer-toolbar input,\n  .ds-bot-organizer-toolbar select,\n  .ds-bot-organizer-toolbar button {\n    width: 100%;\n    min-width: 0;\n    box-sizing: border-box;\n  }\n\n  .ds-bot-organizer-toolbar input[type=\"search\"] {\n    width: 100%;\n  }\n\n  [data-ds-bot-organizer-card=\"1\"].ds-bot-local-meta {\n    align-items: flex-start;\n    gap: 3px 4px;\n    max-height: 48px;\n    overflow: hidden;\n  }\n\n  [data-ds-bot-organizer-card=\"1\"] .ds-bot-local-chip {\n    max-width: min(120px, 46%);\n  }\n\n  .ds-bot-local-note {\n    flex-basis: 100%;\n    max-width: 100%;\n  }\n\n  /* Make SpicyChat's native Favorite heart a usable touch target whenever the\n     Saved Bots organizer is active. QoL does not replace or click the control. */\n  [data-ds-bot-organizer-card=\"1\"] button[aria-label*=\"favorite\" i] {\n    width: 36px !important;\n    height: 36px !important;\n    min-width: 36px !important;\n    min-height: 36px !important;\n    padding: 7px !important;\n    flex: 0 0 36px !important;\n  }\n\n  [data-ds-bot-organizer-card=\"1\"] button[aria-label*=\"favorite\" i] svg {\n    width: 20px !important;\n    height: 20px !important;\n  }\n\n  .ds-bot-organizer-popover {\n    left: 8px !important;\n    right: 8px !important;\n    width: auto;\n    max-height: calc(100dvh - 112px);\n  }\n}\n\n\n\n\n.ds-chat-organizer-toolbar {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n  margin: 8px 0 12px;\n  padding: 10px;\n  border: 1px solid rgba(140, 140, 155, 0.35);\n  border-radius: 12px;\n  background: rgba(24, 25, 29, 0.96);\n  color: #f4f4f5;\n  position: relative;\n  z-index: 4;\n}\n.ds-chat-organizer-toolbar select,\n.ds-chat-organizer-toolbar button {\n  min-height: 36px;\n  border: 1px solid rgba(145, 145, 160, 0.45);\n  border-radius: 9px;\n  background: #202126;\n  color: inherit;\n  padding: 6px 10px;\n  font: inherit;\n}\n.ds-chat-organizer-toolbar select { min-width: 170px; max-width: min(320px, 100%); }\n.ds-chat-organizer-toolbar button { cursor: pointer; }\n.ds-chat-organizer-toolbar button:hover { background: #2a2c32; }\n.ds-chat-organizer-toolbar .ds-chat-org-primary { border-color: #5a8ee8; }\n.ds-chat-organizer-toolbar .ds-chat-org-danger { border-color: #a84d58; }\n.ds-chat-org-count { opacity: 0.8; white-space: nowrap; }\n.ds-chat-row-hidden-by-folder { display: none !important; }\n[data-ds-qol-chat-row=\"1\"] { position: relative; }\n.ds-chat-org-select {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n  z-index: 12;\n  width: 30px;\n  height: 30px;\n  padding: 0;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: 2px solid rgba(220,220,230,.72);\n  border-radius: 8px;\n  background: rgba(17,18,22,.92);\n  color: white;\n  font-weight: 800;\n  cursor: pointer;\n}\n.ds-chat-org-select[aria-pressed=\"true\"] { background: #2f7fe5; border-color: #77aef4; }\n.ds-chat-org-selected { outline: 2px solid rgba(77, 145, 236, .8) !important; outline-offset: 1px; }\n@media (max-width: 720px) {\n  .ds-chat-organizer-toolbar { gap: 6px; padding: 8px; }\n  .ds-chat-organizer-toolbar select { flex: 1 1 100%; width: 100%; max-width: none; }\n  .ds-chat-organizer-toolbar button { flex: 1 1 auto; }\n  .ds-chat-org-select { width: 34px; height: 34px; }\n}\n\n\n\n/* Safari userscript controls: scoped to avoid changing native SpicyChat styles. */\n#dsq-safari-button {\n  position:fixed; right:max(10px, env(safe-area-inset-right)); top:max(92px, calc(70px + env(safe-area-inset-top)));\n  z-index:2147483600; border:1px solid #7893d7; background:#202944; color:#fff;\n  border-radius:13px; padding:11px 12px; font:700 13px/1 system-ui,sans-serif;\n  box-shadow:0 4px 18px #0008; touch-action:manipulation;\n}\n#dsq-safari-panel {\n  position:fixed; z-index:2147483645; top:max(6px, env(safe-area-inset-top));\n  right:max(6px, env(safe-area-inset-right)); bottom:max(6px, env(safe-area-inset-bottom));\n  width:min(420px, calc(100vw - 12px)); display:flex; flex-direction:column;\n  background:#16191f; border:1px solid #566071; color:#f2f4ff;\n  border-radius:15px; box-shadow:0 8px 30px #000b; font:14px/1.45 system-ui, sans-serif;\n  overflow:hidden; box-sizing:border-box; color-scheme:dark;\n}\n#dsq-safari-panel * {box-sizing:border-box;}\n#dsq-safari-panel .dsq-head {display:flex; align-items:center; gap:12px; justify-content:space-between; padding:10px 13px; border-bottom:1px solid #393e49;}\n#dsq-safari-panel .dsq-head strong {font-size:14px;}\n#dsq-safari-panel button, #dsq-safari-panel select, #dsq-safari-panel input, #dsq-safari-panel textarea {\n  background:#242a34; color:#fff; border:1px solid #576174; border-radius:9px;\n  padding:8px; font:inherit; max-width:100%; min-height:38px;\n}\n#dsq-safari-panel button {cursor:pointer; touch-action:manipulation;}\n#dsq-safari-panel .dsq-close {font-size:22px;min-width:40px;}\n#dsq-safari-panel .dsq-tabs {display:flex; gap:4px; padding:8px; border-bottom:1px solid #393e49; overflow-x:auto;}\n#dsq-safari-panel .dsq-tabs button {white-space:nowrap; min-height:36px; font-size:12px; padding:5px 8px; flex:1;}\n#dsq-safari-panel .dsq-tabs button[data-active='1'] {background:#334f82; border-color:#7da7f5;}\n#dsq-safari-panel .dsq-body {flex:1; overflow-y:auto; overscroll-behavior:contain; padding:12px 14px 25px; -webkit-overflow-scrolling:touch;}\n#dsq-safari-panel h3 {font-size:16px; margin:8px 0 10px;}\n#dsq-safari-panel p {margin:6px 0 12px; font-size:13px; opacity:.86;}\n#dsq-safari-panel small {font-size:12px; display:block; opacity:.75;}\n#dsq-safari-panel .dsq-toggle {display:flex; gap:10px; align-items:flex-start; margin:8px 0; padding:9px; background:#252934; border-radius:10px;}\n#dsq-safari-panel .dsq-toggle input {min-height:auto;width:20px;height:20px;flex:none;margin:3px 0 0;}\n#dsq-safari-panel .dsq-toggle span {min-width:0;}\n#dsq-safari-panel .dsq-toggle strong, #dsq-safari-panel .dsq-toggle small {display:block;}\n#dsq-safari-panel .dsq-actions {display:flex; flex-wrap:wrap; align-items:center; gap:7px; margin:8px 0;}\n#dsq-safari-panel a {color:#bcd5ff;}\n#dsq-safari-panel .dsq-actions > a {border:1px solid #52627b; padding:7px; border-radius:8px; text-decoration:none;}\n#dsq-safari-panel .dsq-rows {display:flex;flex-direction:column;gap:8px;margin:12px 0;}\n#dsq-safari-panel .dsq-entry {display:flex;gap:10px;padding:10px;background:#252a33;border:1px solid #394251;border-radius:10px;}\n#dsq-safari-panel .dsq-entry > img {width:52px;height:64px;object-fit:cover;flex:none;border-radius:7px;}\n#dsq-safari-panel .dsq-entry-body {min-width:0;overflow-wrap:anywhere;flex:1;}\n#dsq-safari-panel .dsq-entry-body > strong {display:block;}\n#dsq-safari-panel .dsq-entry .dsq-actions button {min-height:31px;font-size:12px;padding:5px 9px;}\n#dsq-safari-panel .dsq-log {width:100%;height:240px;white-space:pre;font:11px monospace;}\n#dsq-safari-toast {position:fixed;z-index:2147483646;left:10px;right:10px;bottom:max(80px,env(safe-area-inset-bottom));margin:auto;max-width:430px;text-align:center;padding:12px;border-radius:10px;color:#fff;background:#263958;box-shadow:0 4px 20px #000b;font:13px system-ui;}\n#dsq-safari-toast[data-error='1'] {background:#72272b;}\n.dsq-safari-save {position:relative;z-index:15;display:flex;flex-wrap:wrap;gap:4px;padding:4px;margin-top:4px;}\n.dsq-safari-save button, #dsq-safari-current button {background:#24304a;color:#f6f9ff;border:1px solid #657da5;border-radius:7px;min-height:30px;padding:5px 9px;font:12px system-ui;touch-action:manipulation;}\n#dsq-safari-current {display:inline-flex;gap:5px;margin:4px 8px;flex-wrap:wrap;}\n@media(max-width:700px){\n  #dsq-safari-button {top:auto;right:auto;left:max(10px, env(safe-area-inset-left));bottom:max(65px, calc(53px + env(safe-area-inset-bottom)));font-size:13px;}\n  #dsq-safari-panel .dsq-tabs {gap:3px;}\n  #dsq-safari-panel .dsq-tabs button {font-size:11px;padding:4px 6px;}\n  .ds-bot-organizer-toolbar {bottom:max(68px,calc(56px + env(safe-area-inset-bottom))) !important;}\n  .ds-bot-organizer-popover {max-height:calc(100dvh - 24px) !important; overflow:auto !important;}\n}\n"; (document.head || document.documentElement).append(style); })();


// ---- Original v0.2.53 module: content/chat-organizer.js ----

// No optional feature initialization on a tab whose QoL switch is paused.
if (!window.__DSQ_TAB_GATE__?.paused) {
(() => {
  "use strict";

  const DS = window.DragonScriptQoL;
  if (!DS) return;

  let bulkMode = false;
  let selectedKeys = new Set();
  let folderFilter = "all";

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function unique(values) {
    return [...new Set((values || []).map(clean).filter(Boolean))];
  }

  function normalizeConversationKey(href) {
    try {
      const url = new URL(href, location.origin);
      const path = url.pathname.replace(/\/+$/, "") || "/";
      if (!/^\/chat\/[^/]+/i.test(path)) return "";
      return path;
    } catch {
      return "";
    }
  }

  function normalizeStore(value) {
    const source = value && typeof value === "object" ? value : {};
    const meta = source.meta && typeof source.meta === "object" ? source.meta : {};
    const output = {};

    for (const [rawKey, raw] of Object.entries(meta)) {
      const key = clean(rawKey);
      if (!key || !raw || typeof raw !== "object") continue;
      const collections = unique(raw.collections);
      if (!collections.length) continue;
      output[key] = {
        key,
        title: clean(raw.title),
        url: clean(raw.url),
        botId: clean(raw.botId),
        collections,
        updatedAt: Number(raw.updatedAt) || 0
      };
    }

    return { meta: output };
  }

  function store() {
    DS.state.chatOrganization = normalizeStore(DS.state.chatOrganization);
    return DS.state.chatOrganization;
  }

  async function saveStore(next = store()) {
    DS.state.chatOrganization = normalizeStore(next);
    if (typeof DS.saveChatOrganization === "function") {
      await DS.saveChatOrganization(DS.state.chatOrganization);
    } else {
      await DS.storageSet?.({ [DS.CHAT_ORGANIZER_KEY || "chatOrganization"]: DS.state.chatOrganization });
    }
  }

  function configuredFolders() {
    return unique(String(DS.state.settings?.chatCollections || "").split(/[\n,]+/g));
  }

  async function saveConfiguredFolders(folders) {
    const next = unique(folders);
    const settings = { ...(DS.state.settings || {}), chatCollections: next.join("\n") };
    DS.state.settings = settings;
    await DS.storageSet?.({ settings });
    return next;
  }

  function findOrganizerHost(rows) {
    if (!rows.length) return null;
    const parents = [...new Set(rows.map(item => item.row?.parentElement).filter(Boolean))];
    if (parents.length === 1) return parents[0];

    let node = rows[0].row?.parentElement;
    while (node && node !== document.body && node.id !== "root") {
      if (rows.every(item => node.contains(item.row))) return node;
      node = node.parentElement;
    }
    return parents[0] || null;
  }

  function collectEntries() {
    const seen = new Set();
    const entries = [];
    for (const item of DS.collectChatRows?.() || []) {
      const href = item.anchor?.href || item.anchor?.getAttribute?.("href") || "";
      const key = normalizeConversationKey(href);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      entries.push({
        ...item,
        key,
        href,
        title: clean(DS.getChatRowTitle?.(item.row) || ""),
        botId: clean(DS.chatIdFromHref?.(href) || "")
      });
    }
    return entries;
  }

  function assignedFolders(entry) {
    const configured = new Set(configuredFolders());
    return unique(store().meta?.[entry.key]?.collections || []).filter(name => configured.has(name));
  }

  function matchesFolder(entry) {
    if (folderFilter === "all") return true;
    const folders = assignedFolders(entry);
    if (folderFilter === "__unfoldered__") return folders.length === 0;
    return folders.includes(folderFilter);
  }

  function isRowVisible(row) {
    if (!row?.isConnected) return false;
    return !row.classList.contains("ds-chat-row-hidden-by-search") &&
      !row.classList.contains("ds-chat-row-hidden-by-filter") &&
      !row.classList.contains("ds-chat-row-hidden-by-folder");
  }

  function updateSummary(entries) {
    const summary = document.getElementById("ds-qol-chat-filter-summary");
    if (!summary) return;
    const visible = entries.filter(item => isRowVisible(item.row)).length;
    summary.textContent = `Showing ${visible}/${entries.length}`;
  }

  function cleanupRowSelection(entries = collectEntries()) {
    for (const entry of entries) {
      entry.row.classList.remove("ds-chat-org-selected");
      entry.row.querySelector(":scope > .ds-chat-org-select")?.remove();
    }
  }

  function ensureSelectionButton(entry) {
    let button = entry.row.querySelector(":scope > .ds-chat-org-select");
    if (!bulkMode) {
      button?.remove();
      entry.row.classList.remove("ds-chat-org-selected");
      return;
    }

    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "ds-chat-org-select";
      button.title = "Select this conversation";
      button.setAttribute("aria-label", `Select ${entry.title || "conversation"}`);
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (selectedKeys.has(entry.key)) selectedKeys.delete(entry.key);
        else selectedKeys.add(entry.key);
        applySelectionState(collectEntries());
      }, true);
      entry.row.appendChild(button);
    }

    const selected = selectedKeys.has(entry.key);
    DS.setTextIfChanged?.(button, selected ? "✓" : "");
    DS.setAttributeIfChanged?.(button, "aria-pressed", selected ? "true" : "false");
    DS.setClassState?.(entry.row, "ds-chat-org-selected", selected);
  }

  function applySelectionState(entries) {
    const liveKeys = new Set(entries.map(item => item.key));
    selectedKeys = new Set([...selectedKeys].filter(key => liveKeys.has(key)));
    entries.forEach(ensureSelectionButton);
    const count = document.querySelector("#ds-chat-organizer-toolbar [data-ds-chat-selected-count]");
    if (count) count.textContent = `${selectedKeys.size} selected`;
  }

  async function createFolder() {
    const current = configuredFolders();
    const raw = window.prompt("New chat folder name:", "");
    const name = clean(raw);
    if (!name) return;
    if (current.some(item => item.toLowerCase() === name.toLowerCase())) {
      window.alert("That chat folder already exists.");
      return;
    }
    await saveConfiguredFolders([...current, name]);
    folderFilter = name;
    DS.scheduleRun?.({ priority: "slow", source: "chat-folder-create" });
  }

  function chooseFolder(promptText, folders = configuredFolders()) {
    if (!folders.length) return "";
    if (folders.length === 1) return folders[0];
    const raw = window.prompt(`${promptText}\n\n${folders.join("\n")}`, folders[0]);
    const wanted = clean(raw);
    if (!wanted) return "";
    return folders.find(item => item.toLowerCase() === wanted.toLowerCase()) || "";
  }

  async function addSelectedToFolder(entries) {
    if (!selectedKeys.size) return;
    let folders = configuredFolders();
    if (!folders.length) {
      const raw = window.prompt("Create a chat folder first:", "");
      const name = clean(raw);
      if (!name) return;
      folders = await saveConfiguredFolders([name]);
    }
    const folder = chooseFolder("Add selected chats to which folder?", folders);
    if (!folder) return;

    const byKey = new Map(entries.map(item => [item.key, item]));
    const next = normalizeStore(store());
    for (const key of selectedKeys) {
      const entry = byKey.get(key);
      const previous = next.meta[key] || {};
      next.meta[key] = {
        key,
        title: entry?.title || previous.title || "",
        url: entry?.href || previous.url || "",
        botId: entry?.botId || previous.botId || "",
        collections: unique([...(previous.collections || []), folder]),
        updatedAt: Date.now()
      };
    }
    await saveStore(next);
    DS.setQuickStatus?.(`Added ${selectedKeys.size} chat${selectedKeys.size === 1 ? "" : "s"} to ${folder}.`);
    DS.scheduleRun?.({ priority: "slow", source: "chat-folder-add-selected" });
  }

  async function removeSelectedFromFolder(entries) {
    if (!selectedKeys.size) return;
    const folders = configuredFolders();
    const folder = folderFilter !== "all" && folderFilter !== "__unfoldered__"
      ? folderFilter
      : chooseFolder("Remove selected chats from which folder?", folders);
    if (!folder) return;

    const next = normalizeStore(store());
    let changed = 0;
    for (const key of selectedKeys) {
      const previous = next.meta[key];
      if (!previous?.collections?.includes(folder)) continue;
      previous.collections = unique(previous.collections.filter(item => item !== folder));
      previous.updatedAt = Date.now();
      changed += 1;
      if (!previous.collections.length) delete next.meta[key];
    }
    if (!changed) {
      DS.setQuickStatus?.(`None of the selected chats are in ${folder}.`);
      return;
    }
    await saveStore(next);
    DS.setQuickStatus?.(`Removed ${changed} chat${changed === 1 ? "" : "s"} from ${folder}.`);
    DS.scheduleRun?.({ priority: "slow", source: "chat-folder-remove-selected" });
  }

  async function renameCurrentFolder() {
    if (!folderFilter || folderFilter === "all" || folderFilter === "__unfoldered__") return;
    const folders = configuredFolders();
    const oldName = folderFilter;
    const raw = window.prompt("Rename chat folder:", oldName);
    const nextName = clean(raw);
    if (!nextName || nextName === oldName) return;
    if (folders.some(name => name !== oldName && name.toLowerCase() === nextName.toLowerCase())) {
      window.alert("That chat folder already exists.");
      return;
    }
    const next = normalizeStore(store());
    for (const item of Object.values(next.meta)) {
      if (!(item.collections || []).includes(oldName)) continue;
      item.collections = unique(item.collections.map(name => name === oldName ? nextName : name));
      item.updatedAt = Date.now();
    }
    await saveStore(next);
    await saveConfiguredFolders(folders.map(name => name === oldName ? nextName : name));
    folderFilter = nextName;
    DS.scheduleRun?.({ priority: "slow", source: "chat-folder-rename" });
  }

  async function deleteCurrentFolder() {
    if (!folderFilter || folderFilter === "all" || folderFilter === "__unfoldered__") return;
    const folder = folderFilter;
    if (!window.confirm(`Delete local chat folder "${folder}"?\n\nThe conversations themselves will not be deleted.`)) return;
    const next = normalizeStore(store());
    for (const [key, item] of Object.entries(next.meta)) {
      item.collections = unique((item.collections || []).filter(name => name !== folder));
      if (!item.collections.length) delete next.meta[key];
    }
    await saveStore(next);
    await saveConfiguredFolders(configuredFolders().filter(name => name !== folder));
    folderFilter = "all";
    DS.scheduleRun?.({ priority: "slow", source: "chat-folder-delete" });
  }

  function actionButton(label, handler, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      Promise.resolve(handler()).catch(error => DS.setQuickStatus?.(`Chat organizer: ${error?.message || error}`));
    });
    return button;
  }

  function buildToolbar(entries) {
    const host = findOrganizerHost(entries);
    if (!host?.parentElement) return null;

    let toolbar = document.getElementById("ds-chat-organizer-toolbar");
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.id = "ds-chat-organizer-toolbar";
      toolbar.className = "ds-chat-organizer-toolbar";
    }

    if (!toolbar.isConnected || toolbar.nextElementSibling !== host) {
      host.parentElement.insertBefore(toolbar, host);
    }

    const folders = configuredFolders();
    if (folderFilter !== "all" && folderFilter !== "__unfoldered__" && !folders.includes(folderFilter)) folderFilter = "all";

    // Keep the injected toolbar stable across SpicyChat/MutationObserver passes.
    // Rebuilding a native <select> while it is open makes mobile browsers close it.
    const signature = `${folders.join("\u001f")}|${folderFilter}|${bulkMode ? "bulk" : "normal"}`;
    if (toolbar.dataset.dsSignature === signature && toolbar.childElementCount) {
      const count = toolbar.querySelector("[data-ds-chat-selected-count]");
      if (count) count.textContent = `${selectedKeys.size} selected`;
      return toolbar;
    }
    toolbar.dataset.dsSignature = signature;
    toolbar.replaceChildren();

    const select = document.createElement("select");
    select.setAttribute("aria-label", "Filter conversations by local chat folder");
    const options = [["all", "All chat folders"], ["__unfoldered__", "Unfoldered"], ...folders.map(name => [name, name])];
    for (const [value, label] of options) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    }
    select.value = folderFilter;
    select.addEventListener("change", () => {
      folderFilter = select.value;
      DS.scheduleRun?.({ priority: "slow", source: "chat-folder-filter" });
    });
    toolbar.appendChild(select);

    toolbar.appendChild(actionButton("+ Folder", createFolder));

    const mode = actionButton(bulkMode ? "Done" : "Select chats", () => {
      bulkMode = !bulkMode;
      if (!bulkMode) selectedKeys.clear();
      DS.scheduleRun?.({ priority: "slow", source: "chat-organizer-bulk-toggle" });
    }, bulkMode ? "ds-chat-org-primary" : "");
    toolbar.appendChild(mode);

    if (folderFilter !== "all" && folderFilter !== "__unfoldered__") {
      toolbar.appendChild(actionButton("Rename folder", renameCurrentFolder));
      toolbar.appendChild(actionButton("Delete folder", deleteCurrentFolder, "ds-chat-org-danger"));
    }

    if (bulkMode) {
      const count = document.createElement("span");
      count.dataset.dsChatSelectedCount = "1";
      count.className = "ds-chat-org-count";
      count.textContent = `${selectedKeys.size} selected`;
      toolbar.appendChild(count);
      toolbar.appendChild(actionButton("Select visible", () => {
        for (const entry of collectEntries()) if (isRowVisible(entry.row)) selectedKeys.add(entry.key);
        applySelectionState(collectEntries());
      }));
      toolbar.appendChild(actionButton("Clear", () => {
        selectedKeys.clear();
        applySelectionState(collectEntries());
      }));
      toolbar.appendChild(actionButton("Folder…", () => addSelectedToFolder(collectEntries()), "ds-chat-org-primary"));
      toolbar.appendChild(actionButton("Remove folder…", () => removeSelectedFromFolder(collectEntries())));
    }

    return toolbar;
  }

  function removeOrganizer() {
    document.getElementById("ds-chat-organizer-toolbar")?.remove();
    for (const row of DS.qsa?.(".ds-chat-row-hidden-by-folder,.ds-chat-org-selected") || []) {
      row.classList.remove("ds-chat-row-hidden-by-folder", "ds-chat-org-selected");
    }
    for (const button of DS.qsa?.(".ds-chat-org-select") || []) button.remove();
    selectedKeys.clear();
    bulkMode = false;
  }

  DS.applyChatOrganizer = function applyChatOrganizer() {
    const settings = DS.state?.settings || {};
    if (!settings.enabled || !settings.enableChatOrganizer || !DS.isChatListPage?.()) {
      removeOrganizer();
      return;
    }

    const entries = collectEntries();
    if (!entries.length) {
      document.getElementById("ds-chat-organizer-toolbar")?.remove();
      return;
    }

    buildToolbar(entries);
    for (const entry of entries) {
      entry.row.classList.toggle("ds-chat-row-hidden-by-folder", !matchesFolder(entry));
    }
    applySelectionState(entries);
    updateSummary(entries);
  };

  DS.removeChatOrganizer = removeOrganizer;
})();

}


// ---- Original v0.2.53 module: content/bot-organizer.js ----

// No optional feature initialization on a tab whose QoL switch is paused.
if (!window.__DSQ_TAB_GATE__?.paused) {
(() => {
  "use strict";

  const DS = window.DragonScriptQoL;
  if (!DS) return;

  let bulkMode = false;
  let selectedIds = new Set();
  let filterCollection = "all";
  let explorerView = "root";
  let latestFolderPage = "";
  let newFolderScope = "";
  let filterStatus = "all";
  let filterQuery = "";
  let activePopoverId = "";

  const STATUS_LABELS = {
    "needs-work": "Needs work",
    testing: "Testing",
    finished: "Finished"
  };

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function displayText(value) {
    const raw = clean(value);
    return typeof DS.normalizeTextForDisplay === "function" ? DS.normalizeTextForDisplay(raw) : raw;
  }

  function unique(values) {
    return [...new Set((values || []).map(clean).filter(Boolean))];
  }

  // Folder locations affect only Favorites and My Creations. Home and
  // Recommendations still support local notes/tags, but not folder controls.
  function pageFolderScope() {
    if (DS.isFavoriteBotsPage?.()) return "favorites";
    if (DS.isMyCreationsChatbotsPage?.()) return "chatbots";
    return "";
  }

  function normalizeFolderScope(scope) {
    return ["favorites", "chatbots", "shared"].includes(scope) ? scope : "shared";
  }

  function visibleFolder(name) {
    const page = pageFolderScope();
    if (!page) return false;
    const folderScope = normalizeFolderScope(DS.state.botOrganization?.folderScopes?.[name]);
    return folderScope === "shared" || folderScope === page;
  }

  function visibleCollections() {
    return parseConfiguredCollections().filter(visibleFolder);
  }

  function visibleMemberCollections(data) {
    return unique(data?.collections).filter(visibleFolder);
  }

  function parseConfiguredCollections() {
    const settingsCollections = String(DS.state.settings?.botCollections || "").split(/[\n,]+/g);
    const storedCollections = Array.isArray(DS.state.botOrganization?.collections)
      ? DS.state.botOrganization.collections
      : [];
    return unique([...settingsCollections, ...storedCollections]);
  }

  async function saveConfiguredCollections(collections, scopeUpdates = {}) {
    const next = unique(collections);
    const settings = { ...(DS.state.settings || {}), botCollections: next.join("\n") };
    const organizer = normalizeStore(DS.state.botOrganization);
    organizer.collections = next;
    organizer.folderScopes = { ...(organizer.folderScopes || {}), ...scopeUpdates };
    for (const name of Object.keys(organizer.folderScopes)) {
      if (!next.includes(name)) delete organizer.folderScopes[name];
    }
    DS.state.settings = settings;
    DS.state.botOrganization = organizer;
    await Promise.all([
      DS.saveSettingsPatch?.({ botCollections: settings.botCollections }),
      DS.storageSet?.({ [DS.BOT_ORGANIZER_KEY || "botOrganization"]: organizer })
    ]);
    return next;
  }

  async function createFolder() {
    const current = parseConfiguredCollections();
    const raw = window.prompt("New chatbot folder name:", "");
    const name = clean(raw);
    if (!name) return;
    if (current.some(item => item.toLowerCase() === name.toLowerCase())) {
      window.alert("That folder already exists.");
      return;
    }
    const beforeSettings = { ...(DS.state.settings || {}) };
    await saveConfiguredCollections([...current, name], { [name]: normalizeFolderScope(newFolderScope || pageFolderScope()) });
    await DS.recordLocalChange?.(`Created chatbot folder: ${name}`, { settings: beforeSettings }, { settings: { ...(DS.state.settings || {}) } });
    const createdHere = visibleFolder(name);
    filterCollection = createdHere ? name : "all";
    explorerView = createdHere ? "folder" : "root";
    if (!createdHere) DS.setQuickStatus?.(`Created ${name} for another page. Open that page to see it.`);
    DS.scheduleRun?.({ priority: "slow", source: "bot-folder-create" });
  }

  async function renameCurrentFolder() {
    if (!filterCollection || filterCollection === "all" || filterCollection === "__unfoldered__") return;
    const current = parseConfiguredCollections();
    const oldName = current.find(item => item === filterCollection);
    if (!oldName) return;
    const beforeStore = JSON.parse(JSON.stringify(store()));
    const beforeSettings = { ...(DS.state.settings || {}) };
    const raw = window.prompt("Rename chatbot folder:", oldName);
    const nextName = clean(raw);
    if (!nextName || nextName === oldName) return;
    if (current.some(item => item !== oldName && item.toLowerCase() === nextName.toLowerCase())) {
      window.alert("That folder already exists.");
      return;
    }

    const nextStore = store();
    for (const data of Object.values(nextStore.meta || {})) {
      data.collections = unique((data.collections || []).map(item => item === oldName ? nextName : item));
      if ((data.collections || []).includes(nextName)) data.updatedAt = Date.now();
    }
    if (nextStore.folderScopes?.[oldName]) {
      nextStore.folderScopes[nextName] = nextStore.folderScopes[oldName];
      delete nextStore.folderScopes[oldName];
    }
    if (nextStore.folderCovers?.[oldName]) {
      nextStore.folderCovers[nextName] = nextStore.folderCovers[oldName];
      delete nextStore.folderCovers[oldName];
    }
    await saveStore(nextStore);
    await saveConfiguredCollections(current.map(item => item === oldName ? nextName : item));
    await DS.recordLocalChange?.(`Renamed chatbot folder: ${oldName} → ${nextName}`, { [DS.BOT_ORGANIZER_KEY]: beforeStore, settings: beforeSettings }, { [DS.BOT_ORGANIZER_KEY]: nextStore, settings: { ...(DS.state.settings || {}) } });
    filterCollection = nextName;
    DS.scheduleRun?.({ priority: "slow", source: "bot-folder-rename" });
  }

  async function deleteCurrentFolder() {
    if (!filterCollection || filterCollection === "all" || filterCollection === "__unfoldered__") return;
    const current = parseConfiguredCollections();
    const folder = current.find(item => item === filterCollection);
    if (!folder) return;
    if (!window.confirm(`Delete the local folder "${folder}"?\n\nThe chatbots themselves will NOT be deleted. They will only be removed from this QoL folder.`)) return;

    const beforeStore = JSON.parse(JSON.stringify(store()));
    const beforeSettings = { ...(DS.state.settings || {}) };
    const nextStore = store();
    for (const [id, data] of Object.entries(nextStore.meta || {})) {
      data.collections = unique((data.collections || []).filter(item => item !== folder));
      data.updatedAt = Date.now();
      if (!hasLocalData(data)) delete nextStore.meta[id];
    }
    delete nextStore.folderCovers?.[folder];
    delete nextStore.folderScopes?.[folder];
    await saveStore(nextStore);
    await saveConfiguredCollections(current.filter(item => item !== folder));
    await DS.recordLocalChange?.(`Deleted chatbot folder: ${folder}`, { [DS.BOT_ORGANIZER_KEY]: beforeStore, settings: beforeSettings }, { [DS.BOT_ORGANIZER_KEY]: nextStore, settings: { ...(DS.state.settings || {}) } });
    filterCollection = "all";
    DS.scheduleRun?.({ priority: "slow", source: "bot-folder-delete" });
  }

  // Small folder-cover records live alongside folder names in the existing
  // Bot Organizer storage/backup. Avatars are URLs; uploaded pictures are
  // resized thumbnails, never original uploads or copies of bot avatars.
  function normalizeFolderCover(raw) {
    if (!raw || typeof raw !== "object") return null;
    const mode = ["icon", "auto", "selected", "custom"].includes(raw.mode) ? raw.mode : "icon";
    const ids = unique(Array.isArray(raw.ids) ? raw.ids : []).slice(0, 2);
    const image = typeof raw.image === "string" && raw.image.length <= 55000 &&
      /^data:image\/(?:webp|jpeg|png);base64,[a-zA-Z0-9+/=]+$/.test(raw.image) ? raw.image : "";
    return { mode: mode === "custom" && !image ? "icon" : mode, ids, image, updatedAt: Number(raw.updatedAt) || 0 };
  }

  function normalizeFolderCovers(value) {
    const output = {};
    if (!value || typeof value !== "object" || Array.isArray(value)) return output;
    for (const [name, cover] of Object.entries(value)) {
      const key = clean(name);
      const normalized = normalizeFolderCover(cover);
      if (key && normalized) output[key] = normalized;
    }
    return output;
  }

  function normalizeFolderScopes(raw) {
    const scopes = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return scopes;
    for (const [name, scope] of Object.entries(raw)) {
      const key = clean(name);
      if (key) scopes[key] = normalizeFolderScope(scope);
    }
    return scopes;
  }

  function normalizeStore(value) {
    const source = value && typeof value === "object" ? value : {};
    const meta = source.meta && typeof source.meta === "object" ? source.meta : {};
    const output = {};

    for (const [id, raw] of Object.entries(meta)) {
      const key = clean(id);
      if (!key || !raw || typeof raw !== "object") continue;
      const status = Object.prototype.hasOwnProperty.call(STATUS_LABELS, raw.status) ? raw.status : "";
      output[key] = {
        id: key,
        name: clean(raw.name),
        image: clean(raw.image),
        creator: clean(raw.creator),
        chatUrl: clean(raw.chatUrl),
        profileUrl: clean(raw.profileUrl),
        collections: unique(raw.collections),
        tags: unique(raw.tags).slice(0, 40),
        note: clean(raw.note).slice(0, 1000),
        status,
        updatedAt: Number(raw.updatedAt) || 0
      };
    }

    return {
      collections: unique(source.collections),
      folderCovers: normalizeFolderCovers(source.folderCovers),
      folderScopes: normalizeFolderScopes(source.folderScopes),
      meta: output
    };
  }

  function store() {
    DS.state.botOrganization = normalizeStore(DS.state.botOrganization);
    return DS.state.botOrganization;
  }

  async function saveStore(next = store()) {
    const previous = DS.state.botOrganization;
    DS.state.botOrganization = normalizeStore(next);
    try {
      if (typeof DS.saveBotOrganization === "function") {
        const saved = await DS.saveBotOrganization(DS.state.botOrganization);
        if (saved === false) throw new Error("QoL could not save the folder changes.");
      } else {
        const saved = await DS.storageSet?.({ [DS.BOT_ORGANIZER_KEY || "botOrganization"]: DS.state.botOrganization });
        if (saved === false || saved === undefined) throw new Error("QoL could not save the folder changes.");
      }
    } catch (error) {
      // A caller may have already edited the live object, so reload the last
      // committed copy rather than reusing the possibly mutated reference.
      try {
        const key = DS.BOT_ORGANIZER_KEY || "botOrganization";
        const persisted = await DS.storageGet?.([key]);
        DS.state.botOrganization = normalizeStore(persisted?.[key]);
      } catch {
        DS.state.botOrganization = previous;
      }
      throw error;
    }
  }

  function cardCreator(card) {
    const link = card?.querySelector?.("a[href*='/creator/']");
    if (!link) return "";
    const href = link.getAttribute("href") || "";
    const match = href.match(/\/creator\/([^/?#]+)/i);
    return match?.[1] ? `@${decodeURIComponent(match[1])}` : clean(link.textContent);
  }

  function cardTitle(card) {
    const links = [...(card?.querySelectorAll?.("a[aria-label^='chat-with-'][title], a[href*='/chat/'][title]") || [])];
    for (const link of links) {
      const title = clean(link.getAttribute("title"));
      if (title) return title;
    }
    return "";
  }

  function entryFrom(card, anchor) {
    const id = DS.botIdFromHref?.(anchor?.href || "") || "";
    if (!id) return null;

    const base = DS.makeBotMeta?.({ id, card, anchor }) || {};
    return {
      id,
      card,
      anchor,
      name: clean(cardTitle(card) || base.name || DS.getCardTitle?.(card) || id),
      image: clean(base.image || DS.getCardImageUrl?.(card) || ""),
      creator: clean(base.creator || cardCreator(card)),
      chatUrl: clean(base.chatUrl || anchor?.href || `${location.origin}/chat/${id}`),
      profileUrl: clean(base.profileUrl || `${location.origin}/chatbot/${id}`)
    };
  }

  function collectEntries() {
    const seen = new Set();
    const entries = [];
    for (const pair of DS.collectCards?.() || []) {
      const entry = entryFrom(pair.card, pair.anchor);
      if (!entry || seen.has(entry.id)) continue;
      seen.add(entry.id);
      entries.push(entry);
    }
    return entries;
  }

  function dataFor(id) {
    return store().meta[id] || { id, collections: [], tags: [], note: "", status: "" };
  }

  function hasLocalData(data) {
    return !!(
      data?.note ||
      data?.status ||
      (Array.isArray(data?.collections) && data.collections.length) ||
      (Array.isArray(data?.tags) && data.tags.length)
    );
  }

  function clearCardUi(card) {
    card?.querySelector?.(".ds-bot-organizer-button")?.remove();
    card?.querySelector?.(".ds-bot-local-meta")?.remove();
    card?.querySelector?.(".ds-bot-bulk-select")?.remove();
    card?.querySelectorAll?.(".ds-bot-organizer-inline-host")?.forEach(host => {
      host.classList.remove("ds-bot-organizer-inline-host");
    });
    card?.querySelectorAll?.(".ds-bot-organizer-meta-body")?.forEach(host => {
      host.classList.remove("ds-bot-organizer-meta-body");
    });
    card?.classList?.remove("ds-bot-org-filter-hidden", "ds-bot-org-selected", "ds-bot-org-mobile-bulk");
    if (card?.dataset) {
      delete card.dataset.dsBotOrganizerCard;
      delete card.dataset.dsBulkBotId;
    }
  }

  function findInlineHost(card) {
    const creator = card?.querySelector?.("a[href*='/creator/']");
    if (creator?.parentElement) return { host: creator.parentElement, after: creator };

    const title = card?.querySelector?.("a[aria-label^='chat-with-'], a[href*='/chatbot/']");
    if (title?.parentElement) return { host: title.parentElement, after: title };

    return null;
  }

  function findImageHost(card) {
    const chatLink = card?.querySelector?.("a[aria-label^='chat-with-']");
    const host = chatLink?.parentElement;
    if (host?.classList?.contains("relative") && host.classList.contains("aspect-square")) return host;
    return [...(card?.children || [])].find(node =>
      node instanceof Element &&
      node.classList.contains("relative") &&
      node.classList.contains("aspect-square")
    ) || null;
  }

  function findCardBody(card) {
    return [...(card?.children || [])].find(node =>
      node instanceof Element &&
      node.classList.contains("flex") &&
      node.classList.contains("flex-col") &&
      node.classList.contains("grow")
    ) || null;
  }

  function placeLocalMeta(card, host) {
    const body = findCardBody(card);
    if (!body || !host) return false;
    const footer = [...body.children].find(node =>
      node !== host && node.classList?.contains("mt-auto") && node.classList?.contains("flex-col")
    ) || null;
    if (host.parentElement !== body || host.nextElementSibling !== footer) body.insertBefore(host, footer);
    if (!body.classList.contains("ds-bot-organizer-meta-body")) body.classList.add("ds-bot-organizer-meta-body");
    return true;
  }

  function makeOrganizeButton(entry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ds-bot-organizer-button";
    button.dataset.dsBotId = entry.id;
    button.textContent = "▦";
    button.title = "Organize bot / folders";
    button.setAttribute("aria-label", `Organize ${entry.name || "bot"} / folders`);
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openPopover(entry, button);
    });
    return button;
  }

  function ensureOrganizeButton(entry) {
    if (!entry?.card) return;

    let button = entry.card.querySelector(".ds-bot-organizer-button");
    if (!button) button = makeOrganizeButton(entry);

    const label = `Organize ${entry.name || "bot"} / folders`;
    if (button.getAttribute("aria-label") !== label) button.setAttribute("aria-label", label);

    const imageHost = findImageHost(entry.card);
    if (imageHost) {
      button.classList.remove("ds-bot-organizer-button-floating");
      button.classList.add("ds-bot-organizer-button-image");
      if (button.parentElement !== imageHost) imageHost.appendChild(button);
      return;
    }

    button.classList.remove("ds-bot-organizer-button-image");
    if (getComputedStyle(entry.card).position === "static") entry.card.style.position = "relative";
    button.classList.add("ds-bot-organizer-button-floating");
    if (button.parentElement !== entry.card) entry.card.appendChild(button);
  }

  function makeChip(text, cls = "") {
    const chip = document.createElement("span");
    chip.className = `ds-bot-local-chip${cls ? ` ${cls}` : ""}`;
    chip.textContent = text;
    return chip;
  }

  function ensureLocalMeta(entry) {
    const settings = DS.state.settings || {};
    let host = entry.card.querySelector(".ds-bot-local-meta");
    const data = dataFor(entry.id);
    const body = findCardBody(entry.card);

    if (!settings.botOrganizerShowCardMeta || !hasLocalData(data)) {
      host?.remove();
      if (body?.classList.contains("ds-bot-organizer-meta-body")) body.classList.remove("ds-bot-organizer-meta-body");
      return;
    }

    if (!host) {
      host = document.createElement("div");
      host.className = "ds-bot-local-meta";
    }
    placeLocalMeta(entry.card, host);

    const visible = {
      status: data.status || "",
      collections: pageFolderScope() ? visibleMemberCollections(data).slice(0, 2) : [],
      tags: (data.tags || []).slice(0, 2),
      note: data.note || ""
    };
    const signature = JSON.stringify(visible);
    if (host.dataset.dsMetaSignature === signature) return;
    host.dataset.dsMetaSignature = signature;
    host.replaceChildren();

    if (visible.status) host.appendChild(makeChip(STATUS_LABELS[visible.status] || visible.status, `ds-bot-status-${visible.status}`));
    for (const collection of visible.collections) host.appendChild(makeChip(`📁 ${collection}`));
    for (const tag of visible.tags) host.appendChild(makeChip(`#${tag}`));

    if (visible.note) {
      const note = document.createElement("span");
      note.className = "ds-bot-local-note";
      note.textContent = visible.note;
      note.title = visible.note;
      host.appendChild(note);
    }
  }

  function mobileBulkMode() {
    try {
      return window.matchMedia?.("(pointer: coarse)")?.matches || window.innerWidth <= 760;
    } catch {
      return window.innerWidth <= 760;
    }
  }

  function toggleBulkEntry(entry) {
    if (!entry?.id) return;
    if (selectedIds.has(entry.id)) selectedIds.delete(entry.id);
    else selectedIds.add(entry.id);
    refreshSelectionUi();
  }

  function ensureBulkSelector(entry) {
    const card = entry.card;
    let button = card.querySelector(".ds-bot-bulk-select");

    if (!bulkMode) {
      button?.remove();
      card.classList.remove("ds-bot-org-selected", "ds-bot-org-mobile-bulk");
      delete card.dataset.dsBulkBotId;
      return;
    }

    if (!button) {
      if (getComputedStyle(card).position === "static") card.style.position = "relative";
      button = document.createElement("button");
      button.type = "button";
      button.className = "ds-bot-bulk-select";
      button.dataset.dsBotId = entry.id;
      button.setAttribute("aria-label", `Select ${entry.name || "bot"}`);
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        toggleBulkEntry(entry);
      });
      card.appendChild(button);
    }

    card.dataset.dsBulkBotId = entry.id;
    const isMobileBulk = mobileBulkMode();
    card.classList.toggle("ds-bot-org-mobile-bulk", isMobileBulk);
    const wantedPosition = clean(DS.state?.settings?.botOrganizerMobileBulkSelectorPosition || "bottom-right");
    button.dataset.dsPosition = ["top-left", "top-right", "bottom-left", "bottom-right"].includes(wantedPosition) ? wantedPosition : "bottom-right";
    const selected = selectedIds.has(entry.id);
    button.textContent = selected ? "✓" : "";
    button.dataset.dsSelected = selected ? "1" : "0";
    card.classList.toggle("ds-bot-org-selected", selected);
  }

  function setNodeText(label, text) {
    const span = document.createElement("span");
    span.textContent = text;
    label.appendChild(span);
  }

  function labeledControl(text, control) {
    const label = document.createElement("label");
    label.className = "ds-bot-org-field";
    setNodeText(label, text);
    label.appendChild(control);
    return label;
  }

  function closePopover() {
    document.getElementById("ds-bot-organizer-popover")?.remove();
    activePopoverId = "";
  }

  function openPopover(entry, anchorButton) {
    closePopover();
    const current = dataFor(entry.id);
    const collections = visibleCollections();
    activePopoverId = entry.id;

    const panel = document.createElement("div");
    panel.id = "ds-bot-organizer-popover";
    panel.className = "ds-bot-organizer-popover";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", `Organize ${entry.name || "bot"}`);

    const header = document.createElement("div");
    header.className = "ds-bot-org-popover-head";
    const title = document.createElement("strong");
    title.textContent = displayText(entry.name || "Bot Organizer");
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.title = "Close";
    close.setAttribute("aria-label", "Close Bot Organizer");
    close.addEventListener("click", closePopover);
    header.append(title, close);

    const note = document.createElement("textarea");
    note.maxLength = 1000;
    note.rows = 3;
    note.value = current.note || "";
    note.placeholder = "Private QoL note";

    const tags = document.createElement("input");
    tags.type = "text";
    tags.value = (current.tags || []).join(", ");
    tags.placeholder = "tested, good greeting, needs lorebook";

    const body = document.createElement("div");
    body.className = "ds-bot-org-popover-body";
    body.append(labeledControl("Private note", note), labeledControl("Personal tags", tags));

    const collectionBox = document.createElement("fieldset");
    collectionBox.className = "ds-bot-org-collections";
    const legend = document.createElement("legend");
    legend.textContent = "Folders";
    collectionBox.appendChild(legend);

    if (pageFolderScope() && collections.length) {
      for (const collection of collections) {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = collection;
        checkbox.checked = (current.collections || []).includes(collection);
        label.append(checkbox, document.createTextNode(collection));
        collectionBox.appendChild(label);
      }
    } else {
      const empty = document.createElement("small");
      empty.textContent = pageFolderScope() ? "Create folders here or in Settings → Saved Lists → Bot Organizer." : "Folders are available on Favorites and My Creations.";
      collectionBox.appendChild(empty);
    }
    if (pageFolderScope()) body.appendChild(collectionBox);

    let statusSelect = null;
    if (DS.isMyCreationsChatbotsPage?.()) {
      statusSelect = document.createElement("select");
      const statusOptions = [
        ["", "No status"],
        ["needs-work", "Needs work"],
        ["testing", "Testing"],
        ["finished", "Finished"]
      ];
      for (const [value, labelText] of statusOptions) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = labelText;
        statusSelect.appendChild(option);
      }
      statusSelect.value = current.status || "";
      body.appendChild(labeledControl("Creator status", statusSelect));
    }

    const footer = document.createElement("div");
    footer.className = "ds-bot-org-popover-actions";
    const clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = "Clear local data";
    clear.addEventListener("click", async () => {
      const beforeStore = JSON.parse(JSON.stringify(store()));
      const next = store();
      delete next.meta[entry.id];
      await saveStore(next);
      await DS.recordLocalChange?.(`Cleared local bot data: ${entry.name || entry.id}`, { [DS.BOT_ORGANIZER_KEY]: beforeStore }, { [DS.BOT_ORGANIZER_KEY]: next });
      closePopover();
      DS.scheduleRun?.({ priority: "slow", source: "bot-organizer-clear" });
    });

    const save = document.createElement("button");
    save.type = "button";
    save.className = "ds-bot-org-primary";
    save.textContent = "Save";
    save.addEventListener("click", async () => {
      const beforeStore = JSON.parse(JSON.stringify(store()));
      const visible = visibleCollections();
      const selectedVisible = [...collectionBox.querySelectorAll("input[type='checkbox']:checked")].map(input => input.value);
      const chosenCollections = unique([
        ...(current.collections || []).filter(name => !visible.includes(name)),
        ...selectedVisible
      ]);
      const tagValues = unique(tags.value.split(/[,\n]+/g)).slice(0, 40);
      const next = store();
      next.meta[entry.id] = {
        ...current,
        id: entry.id,
        name: entry.name,
        image: entry.image,
        creator: entry.creator,
        chatUrl: entry.chatUrl,
        profileUrl: entry.profileUrl,
        collections: chosenCollections,
        tags: tagValues,
        note: clean(note.value).slice(0, 1000),
        status: statusSelect?.value || "",
        updatedAt: Date.now()
      };
      if (!hasLocalData(next.meta[entry.id])) delete next.meta[entry.id];
      await saveStore(next);
      await DS.recordLocalChange?.(`Updated private note/tags: ${entry.name || entry.id}`, { [DS.BOT_ORGANIZER_KEY]: beforeStore }, { [DS.BOT_ORGANIZER_KEY]: next });
      closePopover();
      DS.scheduleRun?.({ priority: "slow", source: "bot-organizer-save" });
    });
    footer.append(clear, save);

    panel.append(header, body, footer);
    document.body.appendChild(panel);

    const rect = anchorButton?.getBoundingClientRect?.();
    if (rect) {
      const mobile = window.matchMedia?.("(max-width: 700px)")?.matches;
      const width = 330;
      if (mobile) {
        // Keep Save/Cancel reachable above mobile/browser wrapper controls.
        panel.style.top = `${Math.max(8, Math.min(72, rect.top || 8))}px`;
      } else {
        const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.left - width + rect.width));
        const top = Math.max(8, Math.min(window.innerHeight - 420, rect.bottom + 8));
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
      }
    }
  }

  function isFilteredOut(entry) {
    const data = dataFor(entry.id);
    const onFolderPage = !!pageFolderScope();
    if (onFolderPage && DS.state.settings?.botOrganizerExplorerFolders && explorerView === "root") {
      if (visibleMemberCollections(data).length) return true;
    } else if (onFolderPage && filterCollection === "__unfoldered__") {
      if (visibleMemberCollections(data).length) return true;
    } else if (onFolderPage && filterCollection !== "all" && !(data.collections || []).includes(filterCollection)) return true;
    if (filterStatus !== "all") {
      if (filterStatus === "none") {
        if (data.status) return true;
      } else if (data.status !== filterStatus) return true;
    }
    if (filterQuery) {
      const haystack = [
        entry.name,
        entry.creator,
        data.note,
        ...(data.collections || []),
        ...(data.tags || [])
      ].join(" ").toLowerCase();
      if (!haystack.includes(filterQuery)) return true;
    }
    return false;
  }

  function applyFilters(entries) {
    for (const entry of entries) {
      // The SpicyChat grid item wraps the card. Hiding only the inner card
      // leaves an empty grid cell and makes a one-bot folder look stranded.
      const target = DS.getBestHideTarget?.(entry.card) || entry.card;
      if (target !== entry.card) entry.card.classList.remove("ds-bot-org-filter-hidden");
      target.classList.toggle("ds-bot-org-filter-hidden", isFilteredOut(entry));
    }
  }

  function explorerPage() {
    return !!(DS.isFavoriteBotsPage?.() || DS.isMyCreationsChatbotsPage?.());
  }

  function folderMembers(name, entries, meta) {
    const known = new Map();
    // Loaded avatar URLs take precedence. Saved URLs fill in when the bot is
    // not among the current listing cards (without fetching hidden pages).
    for (const [id, data] of Object.entries(meta || {})) {
      if ((data?.collections || []).includes(name)) known.set(id, {
        id, name: data.name || id, image: data.image || ""
      });
    }
    for (const entry of entries || []) {
      if (!known.has(entry.id)) continue;
      const previous = known.get(entry.id);
      known.set(entry.id, { id: entry.id, name: entry.name || previous.name, image: entry.image || previous.image });
    }
    return [...known.values()];
  }

  function createFolderCover(name, entries, meta, cover) {
    const icon = document.createElement("span");
    icon.className = "ds-bot-explorer-icon";
    icon.textContent = "📁";
    icon.setAttribute("aria-hidden", "true");
    if (!cover || cover.mode === "icon") return icon;
    const members = folderMembers(name, entries, meta);
    const memberById = new Map(members.map(item => [item.id, item]));
    const urls = cover.mode === "custom" ? [cover.image] :
      cover.mode === "selected" ? (cover.ids || []).map(id => memberById.get(id)?.image) :
      members.map(item => item.image);
    const images = urls.filter(url => typeof url === "string" &&
      (/^https:\/\//i.test(url) || /^data:image\/(?:webp|jpeg|png);base64,/i.test(url))).slice(0, 2);
    if (!images.length) return icon;
    const visuals = document.createElement("span");
    visuals.className = `ds-bot-explorer-cover${images.length === 2 ? " ds-bot-explorer-cover-pair" : ""}`;
    visuals.setAttribute("aria-hidden", "true");
    for (const url of images) {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = "";
      img.referrerPolicy = "no-referrer";
      img.src = url;
      visuals.appendChild(img);
    }
    return visuals;
  }

  async function resizedCoverData(file) {
    if (!file || !/^image\/(?:png|jpeg|webp|gif)$/i.test(file.type)) throw new Error("Choose a PNG, JPEG, WebP or GIF picture.");
    if (file.size > 8 * 1024 * 1024) throw new Error("Picture exceeds the 8 MiB import limit.");
    const objectUrl = URL.createObjectURL(file);
    let bitmap;
    try {
      bitmap = new Image();
      bitmap.decoding = "async";
      bitmap.src = objectUrl;
      await new Promise((resolve, reject) => { bitmap.onload = resolve; bitmap.onerror = () => reject(new Error("Couldn't read that picture.")); });
      const canvas = document.createElement("canvas");
      // Fixed 160 x 96 cover. Downscaling before storage keeps archive/backup
      // payloads small and prevents large animated images running in tiles.
      canvas.width = 160;
      canvas.height = 96;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Image resizing isn't available in this browser.");
      const scale = Math.max(160 / bitmap.naturalWidth, 96 / bitmap.naturalHeight);
      const w = bitmap.naturalWidth * scale, h = bitmap.naturalHeight * scale;
      context.fillStyle = "#222";
      context.fillRect(0, 0, 160, 96);
      context.drawImage(bitmap, (160 - w) / 2, (96 - h) / 2, w, h);
      let result = canvas.toDataURL("image/webp", 0.72);
      if (!result.startsWith("data:image/webp;")) result = canvas.toDataURL("image/jpeg", 0.70);
      if (result.length > 55000) result = canvas.toDataURL("image/jpeg", 0.48);
      if (result.length > 55000) throw new Error("Picture cannot fit the folder cover storage limit.");
      return result;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function openFolderCoverEditor(name, entries) {
    document.getElementById("ds-bot-explorer-cover-editor")?.remove();
    const current = normalizeFolderCover(store().folderCovers?.[name]) || { mode: "icon", ids: [], image: "" };
    const members = folderMembers(name, entries, store().meta);
    const overlay = document.createElement("div");
    overlay.id = "ds-bot-explorer-cover-editor";
    overlay.className = "ds-bot-explorer-cover-overlay";
    const dialog = document.createElement("section");
    dialog.className = "ds-bot-explorer-cover-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", `Folder picture for ${name}`);
    const heading = document.createElement("h3");
    heading.textContent = `Folder picture: ${name}`;
    const label = (caption, control) => {
      const wrap = document.createElement("label");
      wrap.className = "ds-bot-explorer-cover-field";
      const title = document.createElement("span"); title.textContent = caption;
      wrap.append(title, control); return wrap;
    };
    const scope = document.createElement("select");
    scope.setAttribute("aria-label", "Folder location");
    for (const [value, title] of [["favorites", "Favorites"], ["chatbots", "My Chatbots"], ["shared", "Shared (both pages)"]]) {
      const option = document.createElement("option"); option.value = value; option.textContent = title; scope.append(option);
    }
    scope.value = normalizeFolderScope(store().folderScopes?.[name]);
    const mode = document.createElement("select");
    mode.setAttribute("aria-label", "Folder cover type");
    for (const [value, title] of [
      ["icon", "Normal folder icon"], ["auto", "First two bot pictures"],
      ["selected", "Choose up to two bots"], ["custom", "Upload my own picture"]
    ]) {
      const option = document.createElement("option"); option.value = value; option.textContent = title; mode.append(option);
    }
    mode.value = current.mode;
    const makeBotSelect = (index) => {
      const select = document.createElement("select");
      select.setAttribute("aria-label", `Folder cover bot ${index + 1}`);
      const empty = document.createElement("option"); empty.value = ""; empty.textContent = index ? "No second bot" : "Select a bot";
      select.append(empty);
      for (const item of members) {
        const option = document.createElement("option"); option.value = item.id;
        option.textContent = item.name; select.append(option);
      }
      select.value = current.ids?.[index] || "";
      return select;
    };
    const first = makeBotSelect(0), second = makeBotSelect(1);
    const file = document.createElement("input"); file.type = "file"; file.accept = "image/png,image/jpeg,image/webp,image/gif";
    const note = document.createElement("small");
    note.textContent = "Bot images use existing avatar links. Uploaded covers are saved as small, static thumbnails in local QoL backups.";
    const status = document.createElement("small"); status.setAttribute("role", "status");
    let chosenImage = current.image || "";
    const existing = document.createElement("img");
    existing.className = "ds-bot-explorer-cover-preview";
    existing.alt = "Current custom folder cover";
    if (chosenImage) existing.src = chosenImage;
    const rows = [label("First bot", first), label("Second bot (optional)", second)];
    const fileRow = label("Picture", file);
    function updateFields() {
      rows.forEach(row => row.hidden = mode.value !== "selected");
      fileRow.hidden = mode.value !== "custom";
      existing.hidden = mode.value !== "custom" || !chosenImage;
    }
    mode.addEventListener("change", updateFields); updateFields();
    file.addEventListener("change", async () => {
      status.textContent = "Preparing thumbnail…";
      try {
        chosenImage = await resizedCoverData(file.files?.[0]);
        existing.src = chosenImage; updateFields();
        status.textContent = "Picture ready — click Save to keep it.";
      } catch (error) { status.textContent = error.message || "Unable to use picture."; }
    });
    const actions = document.createElement("div"); actions.className = "ds-bot-explorer-cover-actions";
    const cancel = document.createElement("button"); cancel.type = "button"; cancel.textContent = "Cancel";
    const save = document.createElement("button"); save.type = "button"; save.textContent = "Save";
    const close = () => overlay.remove();
    cancel.addEventListener("click", close);
    overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
    save.addEventListener("click", async () => {
      const chosenMode = mode.value;
      const ids = unique([first.value, second.value]).slice(0, 2);
      if (chosenMode === "selected" && (!ids.length || ids.some(id => !members.some(item => item.id === id)))) {
        status.textContent = "Choose at least one bot in this folder."; return;
      }
      if (chosenMode === "custom" && !chosenImage) { status.textContent = "Upload a picture first."; return; }
      save.disabled = true;
      try {
        const previous = JSON.parse(JSON.stringify(store()));
        const next = store();
        const covers = { ...(next.folderCovers || {}) };
        if (chosenMode === "icon") delete covers[name];
        else covers[name] = normalizeFolderCover({
          mode: chosenMode,
          ids: chosenMode === "selected" ? ids : [],
          image: chosenMode === "custom" ? chosenImage : "",
          updatedAt: Date.now()
        });
        // Limit the total stored thumbnails. A large folder collection should
        // never silently generate multi-megabyte backups.
        const totalBytes = Object.values(covers).reduce((sum, item) => sum + (item?.image?.length || 0), 0);
        if (totalBytes > 1024 * 1024) throw new Error("Folder pictures exceed the 1 MiB total limit. Remove an old cover first.");
        next.folderCovers = covers;
        next.folderScopes = { ...(next.folderScopes || {}), [name]: normalizeFolderScope(scope.value) };
        await saveStore(next);
        await DS.recordLocalChange?.(`Updated folder cover: ${name}`, { [DS.BOT_ORGANIZER_KEY]: previous }, { [DS.BOT_ORGANIZER_KEY]: next });
        close();
        document.getElementById("ds-bot-organizer-explorer")?.removeAttribute("data-signature");
        const entries = collectEntries();
        renderFolderExplorer(entries);
        applyFilters(entries);
        document.getElementById("ds-bot-organizer-toolbar")?.removeAttribute("data-ds-toolbar-signature");
        DS.scheduleRun?.({ priority: "slow", source: "bot-folder-cover-or-location" });
      } catch (error) { status.textContent = error.message || "Failed to save picture."; }
      finally { save.disabled = false; }
    });
    actions.append(cancel, save);
    dialog.append(heading, label("Location", scope), label("Display", mode), ...rows, fileRow, existing, note, status, actions);
    overlay.append(dialog); document.body.append(overlay);
    mode.focus();
  }

  function renderFolderExplorer(entries) {
    const settings = DS.state.settings || {};
    const enabled = !!(settings.enabled && settings.enableBotOrganizer && settings.botOrganizerExplorerFolders && explorerPage());
    let panel = document.getElementById("ds-bot-organizer-explorer");
    if (!enabled) { panel?.remove(); explorerView = "root"; return; }
    const grid = entries[0]?.card?.parentElement?.parentElement;
    // Insert only beside the live native grid, never into React-owned card trees.
    if (!grid?.isConnected || !grid.classList?.contains("grid")) return;
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "ds-bot-organizer-explorer";
      panel.className = "ds-bot-organizer-explorer";
      panel.setAttribute("aria-label", "Private QoL bot folders");
    }
    if (panel.nextElementSibling !== grid) grid.parentElement.insertBefore(panel, grid);
    grid.classList.add("ds-bot-organizer-explorer-grid");
    const collections = visibleCollections();
    if (explorerView === "folder" && filterCollection !== "__unfoldered__" && !collections.includes(filterCollection)) explorerView = "root";
    const organizer = store();
    const storeMeta = organizer.meta || {};
    const covers = organizer.folderCovers || {};
    const counts = new Map(collections.map(name => [name, entries.filter(item => (storeMeta[item.id]?.collections || []).includes(name)).length]));
    const coverState = collections.map(name => {
      const cover = covers[name];
      const people = cover?.mode === "auto" ? folderMembers(name, entries, storeMeta).slice(0, 2).map(item => [item.id, item.image]) : [];
      return [name, cover?.mode || "icon", cover?.updatedAt || 0, normalizeFolderScope(organizer.folderScopes?.[name]), people];
    });
    const signature = JSON.stringify([explorerView, filterCollection, collections, [...counts], entries.length, coverState]);
    if (panel.dataset.signature === signature) return;
    panel.dataset.signature = signature;
    panel.replaceChildren();
    const head = document.createElement("div");
    head.className = "ds-bot-explorer-head";
    const title = document.createElement("strong");
    title.textContent = explorerView === "folder" ? `Folders / ${filterCollection}` : explorerView === "all" ? "All bots" : pageFolderScope() === "favorites" ? "Favorites folders" : "My Chatbots folders";
    head.append(title);
    const nav = document.createElement("div");
    nav.className = "ds-bot-explorer-nav";
    const navButton = (label, view, collection = "all") => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = label;
      b.disabled = explorerView === view && (view !== "folder" || filterCollection === collection);
      b.addEventListener("click", () => {
        explorerView = view; filterCollection = collection;
        document.getElementById("ds-bot-organizer-toolbar")?.removeAttribute("data-ds-toolbar-signature");
        applyFilters(collectEntries());
        renderFolderExplorer(collectEntries());
        DS.scheduleRun?.({ priority: "slow", source: "bot-folder-explorer-navigation" });
      });
      return b;
    };
    nav.append(navButton("← Folders", "root"), navButton("All bots", "all"), navButton("Unfoldered", "folder", "__unfoldered__"));
    head.append(nav);
    if (explorerView === "folder" && collections.includes(filterCollection)) {
      const configure = document.createElement("button"); configure.type = "button";
      configure.className = "ds-bot-explorer-cover-settings";
      configure.textContent = "Change folder picture";
      configure.addEventListener("click", () => openFolderCoverEditor(filterCollection, collectEntries()));
      head.append(configure);
    }
    panel.append(head);
    if (explorerView === "root") {
      const tiles = document.createElement("div"); tiles.className = "ds-bot-explorer-tiles";
      for (const name of collections) {
        const tile = document.createElement("div"); tile.className = "ds-bot-explorer-tile";
        const btn = document.createElement("button"); btn.type = "button"; btn.className = "ds-bot-explorer-folder";
        const folder = createFolderCover(name, entries, storeMeta, covers[name]);
        const text = document.createElement("span"); text.textContent = name;
        const count = document.createElement("small");
        const location = normalizeFolderScope(organizer.folderScopes?.[name]);
        count.textContent = `${counts.get(name) || 0} loaded · ${location === "shared" ? "Shared" : location === "favorites" ? "Favorites" : "My Chatbots"}`;
        btn.append(folder, text, count); btn.title = `Open ${name}`;
        btn.addEventListener("click", () => {
          explorerView = "folder"; filterCollection = name;
          applyFilters(collectEntries()); renderFolderExplorer(collectEntries());
          DS.scheduleRun?.({ priority: "slow", source: "bot-folder-explorer-open" });
        });
        const configure = document.createElement("button"); configure.type = "button";
        configure.className = "ds-bot-explorer-cover-settings";
        configure.textContent = "✎";
        configure.title = `Change folder picture for ${name}`;
        configure.setAttribute("aria-label", `Change folder picture for ${name}`);
        configure.addEventListener("click", () => openFolderCoverEditor(name, collectEntries()));
        tile.append(btn, configure); tiles.append(tile);
      }
      if (!collections.length) {
        const empty = document.createElement("small"); empty.textContent = "No private folders yet. Create one using the bottom organizer menu."; tiles.append(empty);
      }
      panel.append(tiles);
    }
    const help = document.createElement("small");
    help.className = "ds-bot-explorer-help";
    help.textContent = explorerView === "root" ? "Unfoldered bots below · folders are local to QoL" : "Showing loaded bots only · use the bottom toolbar to organize or move bots";
    panel.append(help);
  }

  function makeSelect(options, currentValue, aria) {
    const select = document.createElement("select");
    select.setAttribute("aria-label", aria);
    for (const [value, label] of options) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    }
    select.value = currentValue;
    return select;
  }

  function selectedEntries() {
    return collectEntries().filter(entry => selectedIds.has(entry.id));
  }

  function chooseCollection() {
    const collections = visibleCollections();
    if (!collections.length) {
      window.alert("Create at least one chatbot folder first.");
      return "";
    }
    const answer = window.prompt(`Folder name:\n${collections.join(", ")}`, collections[0]);
    const chosen = clean(answer);
    if (!chosen) return "";
    const exact = collections.find(item => item.toLowerCase() === chosen.toLowerCase());
    if (!exact) {
      window.alert("That folder is not configured yet.");
      return "";
    }
    return exact;
  }

  async function bulkAddCollection() {
    const collection = chooseCollection();
    if (!collection) return;
    const beforeStore = JSON.parse(JSON.stringify(store()));
    const next = store();
    for (const entry of selectedEntries()) {
      const current = dataFor(entry.id);
      next.meta[entry.id] = {
        ...current,
        ...entry,
        card: undefined,
        anchor: undefined,
        collections: unique([...(current.collections || []), collection]),
        updatedAt: Date.now()
      };
      delete next.meta[entry.id].card;
      delete next.meta[entry.id].anchor;
    }
    await saveStore(next);
    await DS.recordLocalChange?.(`Added ${selectedIds.size} bot${selectedIds.size === 1 ? "" : "s"} to folder: ${collection}`, { [DS.BOT_ORGANIZER_KEY]: beforeStore }, { [DS.BOT_ORGANIZER_KEY]: next });
    DS.scheduleRun?.({ priority: "slow", source: "bot-bulk-collection" });
  }

  async function bulkAddTag() {
    const tag = clean(window.prompt("Personal tag to add to selected bots:", ""));
    if (!tag) return;
    const beforeStore = JSON.parse(JSON.stringify(store()));
    const next = store();
    for (const entry of selectedEntries()) {
      const current = dataFor(entry.id);
      next.meta[entry.id] = {
        ...current,
        id: entry.id,
        name: entry.name,
        image: entry.image,
        creator: entry.creator,
        chatUrl: entry.chatUrl,
        profileUrl: entry.profileUrl,
        tags: unique([...(current.tags || []), tag]).slice(0, 40),
        updatedAt: Date.now()
      };
    }
    await saveStore(next);
    await DS.recordLocalChange?.(`Added personal tag: ${tag}`, { [DS.BOT_ORGANIZER_KEY]: beforeStore }, { [DS.BOT_ORGANIZER_KEY]: next });
    DS.scheduleRun?.({ priority: "slow", source: "bot-bulk-tag" });
  }

  async function bulkSetStatus() {
    if (!DS.isMyCreationsChatbotsPage?.()) return;
    const beforeStore = JSON.parse(JSON.stringify(store()));
    const raw = clean(window.prompt("Creator status: needs-work, testing, finished, or blank to clear", "testing")).toLowerCase();
    if (raw && !Object.prototype.hasOwnProperty.call(STATUS_LABELS, raw)) {
      window.alert("Use needs-work, testing, finished, or leave it blank.");
      return;
    }
    const next = store();
    for (const entry of selectedEntries()) {
      const current = dataFor(entry.id);
      next.meta[entry.id] = {
        ...current,
        id: entry.id,
        name: entry.name,
        image: entry.image,
        creator: entry.creator,
        chatUrl: entry.chatUrl,
        profileUrl: entry.profileUrl,
        status: raw,
        updatedAt: Date.now()
      };
      if (!hasLocalData(next.meta[entry.id])) delete next.meta[entry.id];
    }
    await saveStore(next);
    await DS.recordLocalChange?.(`Changed creator status for selected bots`, { [DS.BOT_ORGANIZER_KEY]: beforeStore }, { [DS.BOT_ORGANIZER_KEY]: next });
    DS.scheduleRun?.({ priority: "slow", source: "bot-bulk-status" });
  }

  async function bulkLater() {
    const entries = selectedEntries();
    if (!entries.length) return;
    const later = DS.state.laterBots || { ids: [], meta: {} };
    later.ids = unique([...(later.ids || []), ...entries.map(entry => entry.id)]);
    later.meta = later.meta && typeof later.meta === "object" ? later.meta : {};
    for (const entry of entries) {
      later.meta[entry.id] = {
        ...(later.meta[entry.id] || {}),
        id: entry.id,
        name: entry.name,
        image: entry.image,
        creator: entry.creator,
        chatUrl: entry.chatUrl,
        profileUrl: entry.profileUrl,
        savedAt: later.meta[entry.id]?.savedAt || Date.now()
      };
    }
    await DS.saveLaterBots?.(later);
    DS.setQuickStatus?.(`Saved ${entries.length} selected bot${entries.length === 1 ? "" : "s"} to Later.`);
  }

  async function bulkCopyLinks() {
    const links = selectedEntries().map(entry => entry.profileUrl || entry.chatUrl).filter(Boolean);
    if (!links.length) return;
    const text = links.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      DS.setQuickStatus?.(`Copied ${links.length} bot link${links.length === 1 ? "" : "s"}.`);
    } catch {
      window.prompt("Copy selected bot links:", text);
    }
  }

  function actionButton(text, handler, cls = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    if (cls) button.className = cls;
    button.addEventListener("click", handler);
    return button;
  }

  function ensureToolbar() {
    const settings = DS.state.settings || {};
    let toolbar = document.getElementById("ds-bot-organizer-toolbar");
    if (!settings.enabled || !settings.enableBotOrganizer) {
      toolbar?.remove();
      return null;
    }

    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.id = "ds-bot-organizer-toolbar";
      toolbar.className = "ds-bot-organizer-toolbar";
      document.body.appendChild(toolbar);
    }

    const scope = pageFolderScope();
    const collections = visibleCollections();
    const isMyCreations = scope === "chatbots";
    const isFolderPage = !!scope;
    if (latestFolderPage !== scope) {
      latestFolderPage = scope;
      explorerView = "root";
      filterCollection = "all";
      newFolderScope = scope;
    }
    if (filterCollection !== "all" && filterCollection !== "__unfoldered__" && !collections.includes(filterCollection)) {
      filterCollection = "all";
    }

    // Do not rebuild this toolbar on every scheduler pass. Replacing its
    // children while a native <select> is open immediately closes that menu
    // (and also steals focus from the search box), which made the folder picker
    // look like it was opening and closing by itself. Only rebuild when the
    // controls that actually determine the toolbar structure change.
    const toolbarSignature = JSON.stringify({
      collections,
      isMyCreations,
      isFolderPage,
      scope,
      bulkTools: !!settings.botOrganizerBulkTools,
      bulkMode: !!bulkMode,
      filterCollection
    });
    if (toolbar.dataset.dsToolbarSignature === toolbarSignature && toolbar.childElementCount) {
      return toolbar;
    }
    toolbar.dataset.dsToolbarSignature = toolbarSignature;
    toolbar.replaceChildren();

    const collectionSelect = makeSelect(
      [["all", "All folders"], ["__unfoldered__", "Unfoldered"], ...collections.map(item => [item, item])],
      (filterCollection === "__unfoldered__" || collections.includes(filterCollection)) ? filterCollection : "all",
      "Filter by local chatbot folder"
    );
    filterCollection = collectionSelect.value;
    collectionSelect.addEventListener("change", () => {
      filterCollection = collectionSelect.value;
      explorerView = filterCollection === "all" ? "all" : "folder";
      renderFolderExplorer(collectEntries());
      applyFilters(collectEntries());
      DS.scheduleRun?.({ priority: "slow", source: "bot-folder-filter-change" });
    });

    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Search local notes/tags";
    search.value = filterQuery;
    search.setAttribute("aria-label", "Search bot organizer notes and tags");
    search.addEventListener("input", () => {
      filterQuery = clean(search.value).toLowerCase();
      applyFilters(collectEntries());
    });

    if (isFolderPage) toolbar.append(collectionSelect);

    if (isFolderPage) {
      const location = makeSelect([
        [scope, scope === "favorites" ? "New: Favorites" : "New: My Chatbots"],
        ["shared", "New: Shared"],
        [scope === "favorites" ? "chatbots" : "favorites", scope === "favorites" ? "New: My Chatbots" : "New: Favorites"]
      ], newFolderScope || scope, "New folder location");
      location.addEventListener("change", () => { newFolderScope = location.value; });
      toolbar.append(location);
      toolbar.appendChild(actionButton("+ Folder", createFolder));
      if (filterCollection !== "all" && filterCollection !== "__unfoldered__") {
        toolbar.append(
          actionButton("Rename folder", renameCurrentFolder),
          actionButton("Delete folder", deleteCurrentFolder, "ds-bot-org-danger")
        );
      }
    }

    toolbar.append(search);

    if (isMyCreations) {
      const statusSelect = makeSelect([
        ["all", "All statuses"],
        ["needs-work", "Needs work"],
        ["testing", "Testing"],
        ["finished", "Finished"],
        ["none", "No status"]
      ], filterStatus, "Filter by local creator status");
      statusSelect.addEventListener("change", () => {
        filterStatus = statusSelect.value;
        applyFilters(collectEntries());
      });
      toolbar.appendChild(statusSelect);
    } else {
      filterStatus = "all";
    }

    if (settings.botOrganizerBulkTools) {
      const toggle = actionButton(bulkMode ? "Exit bulk" : "Select bots", () => {
        bulkMode = !bulkMode;
        if (!bulkMode) selectedIds.clear();
        DS.scheduleRun?.({ priority: "slow", source: "bot-organizer-bulk-toggle" });
      }, bulkMode ? "ds-bot-org-primary" : "");
      toolbar.appendChild(toggle);

      if (bulkMode) {
        const selected = document.createElement("span");
        selected.className = "ds-bot-bulk-count";
        selected.dataset.dsSelectedCount = "1";
        selected.textContent = `${selectedIds.size} selected`;
        toolbar.append(
          selected,
          ...(isFolderPage ? [actionButton("Folder…", bulkAddCollection)] : []),
          actionButton("Tag…", bulkAddTag),
          actionButton("Later", bulkLater),
          actionButton("Copy links", bulkCopyLinks)
        );
        if (isMyCreations) toolbar.appendChild(actionButton("Status…", bulkSetStatus));
        toolbar.appendChild(actionButton("Clear", () => {
          selectedIds.clear();
          refreshSelectionUi();
        }));
      }
    }

    return toolbar;
  }

  function refreshSelectionUi() {
    const entries = collectEntries();
    for (const entry of entries) ensureBulkSelector(entry);
    const count = document.querySelector("#ds-bot-organizer-toolbar [data-ds-selected-count='1']");
    if (count) count.textContent = `${selectedIds.size} selected`;
  }

  function stableOrganizerListingRoute() {
    const page = DS.getPageState?.() || {};
    if (page.isSingleChatPage || page.isBotProfilePage || page.isBotEditor || page.isLorebookEditor || page.isPersonaPage || page.isChatListPage) return false;
    if (page.routeType === "listing" || page.routeType === "creator-listing") return true;
    if (page.isFavoriteBotsPage || page.isMyCreationsChatbotsPage) return true;
    const path = String(page.path || location.pathname || "");
    return /^\/(?:creator|recommended-bots|search|discover|trending)(?:\/|$)/i.test(path);
  }

  function currentPageEntry() {
    let id = "";
    const chatMatch = location.pathname.match(/^\/chat\/([^/?#]+)/i);
    const profileMatch = location.pathname.match(/^\/chatbot\/([^/?#]+)/i);
    id = decodeURIComponent(chatMatch?.[1] || profileMatch?.[1] || "");
    if (!id) return null;
    const profileAnchor = document.querySelector(`a[href*='/chatbot/${CSS.escape(id)}']`);
    const creatorAnchor = document.querySelector("a[aria-label='creator-profile'], a[href*='/creator/']");
    const h1 = document.querySelector("h1");
    const image = document.querySelector("a[aria-label='chatbot-profile'] img, main img[alt], [data-testid='PageStaticMetaTags'] ~ * img[alt]");
    return {
      id,
      name: clean(h1?.textContent || document.title.replace(/^Chat with\s+/i, "").replace(/\s+on Spicychat.*$/i, "") || id),
      image: clean(image?.src || ""),
      creator: clean(creatorAnchor?.textContent || ""),
      chatUrl: chatMatch ? location.href : `${location.origin}/chat/${id}`,
      profileUrl: profileMatch ? location.href : (profileAnchor?.href || `${location.origin}/chatbot/${id}`)
    };
  }

  function ensureContextOrganizerButton() {
    const settings = DS.state.settings || {};
    let button = document.getElementById("ds-bot-organizer-context-button");
    if (!settings.enabled || !settings.enableBotOrganizer || (!DS.isSingleChatPage?.() && !DS.isBotProfilePage?.())) {
      button?.remove();
      return;
    }
    const entry = currentPageEntry();
    if (!entry) return;
    if (button && button.dataset.dsBotId !== entry.id) { button.remove(); button = null; }
    if (!button) {
      button = makeOrganizeButton(entry);
      button.id = "ds-bot-organizer-context-button";
      button.classList.add("ds-bot-organizer-context-button");
    }
    button.dataset.dsBotId = entry.id;
    button.setAttribute("aria-label", `Private note / tags for ${entry.name || "bot"}`);
    button.title = "Private note / personal tags / folders";
    // Prefer the smallest stable title/action host. React often replaces the
    // larger chat/profile header wrapper; attaching two levels above the h1 made
    // this button disappear and reappear during those remounts.
    const profile = document.querySelector("a[aria-label='chatbot-profile'][href*='/chatbot/']");
    const title = profile?.querySelector?.("h1") || document.querySelector("h1");
    const chatActions = profile?.parentElement?.querySelector?.(":scope > .ds-chat-title-buttons");
    const host = chatActions || profile?.parentElement || title?.parentElement;
    if (!host) return;
    if (button.parentElement !== host) host.appendChild(button);
  }

  // On coarse/mobile pointers, bulk mode becomes a deliberate selection mode.
  // Tapping anywhere on the card selects it and native card actions (especially
  // the very-near Favorite heart on Firefox Android) cannot fire accidentally.
  let mobileBulkListenerAttached = false;
  function onMobileBulkSelectionClick(event) {
    if (!DS.state?.settings?.enabled || !DS.state?.settings?.enableBotOrganizer || !bulkMode || !mobileBulkMode()) return;
    if (event.target?.closest?.(".ds-bot-bulk-select, #ds-bot-organizer-toolbar, .ds-bot-organizer-popover")) return;
    const card = event.target?.closest?.("[data-ds-bulk-bot-id]");
    const id = clean(card?.dataset?.dsBulkBotId || "");
    if (!card || !id) return;

    // Let users inspect the bot while mobile bulk selection is active. Other
    // native card actions (especially Favorite/unfavorite) remain intercepted
    // so a selection tap cannot accidentally change the public Favorite state.
    if (DS.state?.settings?.botOrganizerMobileBulkAllowProfile !== false) {
      const profileControl = DS.findCardProfileButton?.(card);
      if (profileControl && (profileControl === event.target || profileControl.contains?.(event.target))) return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    toggleBulkEntry({ id, card });
  }
  function setMobileBulkListener(active) {
    if (active === mobileBulkListenerAttached) return;
    if (active) document.addEventListener("click", onMobileBulkSelectionClick, true);
    else document.removeEventListener("click", onMobileBulkSelectionClick, true);
    mobileBulkListenerAttached = active;
  }

  DS.removeBotOrganizer = function removeBotOrganizer() {
    setMobileBulkListener(false);
    closePopover();
    document.getElementById("ds-bot-organizer-toolbar")?.remove();
    document.getElementById("ds-bot-organizer-explorer")?.remove();
    document.getElementById("ds-bot-explorer-cover-editor")?.remove();
    document.querySelectorAll(".ds-bot-organizer-explorer-grid").forEach(grid => grid.classList.remove("ds-bot-organizer-explorer-grid"));
    document.getElementById("ds-bot-organizer-context-button")?.remove();
    for (const card of DS.qsa?.(".ds-bot-org-filter-hidden, .ds-bot-org-selected, [data-ds-bot-organizer-card]") || []) {
      card.classList.remove("ds-bot-org-filter-hidden", "ds-bot-org-selected", "ds-bot-org-mobile-bulk");
      delete card.dataset.dsBotOrganizerCard;
      delete card.dataset.dsBulkBotId;
    }
    for (const el of DS.qsa?.(".ds-bot-org-filter-hidden") || []) el.classList.remove("ds-bot-org-filter-hidden");
    for (const el of DS.qsa?.(".ds-bot-organizer-button, .ds-bot-local-meta, .ds-bot-bulk-select") || []) el.remove();
    bulkMode = false;
    selectedIds.clear();
    DS.state.botOrganizerWasActive = false;
  };

  DS.applyBotOrganizer = function applyBotOrganizer() {
    const settings = DS.state.settings || {};
    const contextPage = !!(DS.isSingleChatPage?.() || DS.isBotProfilePage?.());
    const hasCards = !!DS.qs?.("a[href*='/chat/'], a[href*='/chatbot/']");
    // Keep the organizer alive across temporary React listing remounts. During
    // those remounts every card can disappear for a moment; the old DOM-based
    // route test treated that as leaving the listing and closed the open folder
    // menu/removed the launcher before recreating it a moment later.
    const listing = !contextPage && (stableOrganizerListingRoute() || hasCards);
    if (!settings.enabled || !settings.enableBotOrganizer || (!listing && !contextPage)) {
      if (DS.state.botOrganizerWasActive || mobileBulkListenerAttached || document.querySelector("#ds-bot-organizer-toolbar, #ds-bot-organizer-context-button, #ds-bot-organizer-explorer, .ds-bot-org-filter-hidden, [data-ds-bot-organizer-card]")) DS.removeBotOrganizer?.();
      return;
    }

    DS.state.botOrganizerWasActive = true;
    // The capture listener is only needed while organizing listing cards.
    setMobileBulkListener(!contextPage);
    if (contextPage) {
      document.getElementById("ds-bot-organizer-toolbar")?.remove();
      ensureContextOrganizerButton();
      return;
    }

    document.getElementById("ds-bot-organizer-context-button")?.remove();
    const entries = collectEntries();
    ensureToolbar();
    renderFolderExplorer(entries);
    // An empty card array can be a transient React remount. Do not clear the
    // active fixed popover or reset its state; just wait for the cards to return.
    if (!entries.length) return;
    applyFilters(entries);

    for (const entry of entries) {
      entry.card.dataset.dsBotOrganizerCard = "1";
      ensureOrganizeButton(entry);
      ensureLocalMeta(entry);
      ensureBulkSelector(entry);
    }

    const loaded = new Set(entries.map(entry => entry.id));
    selectedIds = new Set([...selectedIds].filter(id => loaded.has(id)));
    refreshSelectionUi();
  };
})();

}


// ---- Original v0.2.53 module: content/mobile-bot-organizer.js ----

// Compact mobile launcher for the existing optional Bot Organizer toolbar.
// Leaves all organizer controls intact and never changes native SpicyChat layout.
if (!window.__DSQ_TAB_GATE__?.paused) {
(() => {
  'use strict';
  const ID = 'ds-bot-org-mobile-toggle';
  const STYLE_ID = 'ds-bot-org-mobile-compact-style';
  const QUERY = '(max-width: 700px)';
  const DS = window.DragonScriptQoL || {};
  const media = window.matchMedia?.(QUERY);
  if (!media) return;
  let expanded = false;
  let toolbarObserver = null;
  let observedToolbar = null;

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        #ds-bot-organizer-toolbar[data-ds-mobile-collapsed="1"] {
          left: auto !important;
          right: max(8px, env(safe-area-inset-right)) !important;
          bottom: max(70px, calc(58px + env(safe-area-inset-bottom))) !important;
          width: auto !important;
          max-width: calc(100vw - 16px) !important;
          padding: 5px !important;
          display: flex !important;
          overflow: visible !important;
          grid-template-columns: none !important;
        }
        #ds-bot-organizer-toolbar[data-ds-mobile-collapsed="1"] > :not(#${ID}) {
          display: none !important;
        }
        #ds-bot-organizer-toolbar #${ID} {
          display: inline-flex !important;
          width: auto !important;
          min-width: 0 !important;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          padding: 6px 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        #ds-bot-organizer-toolbar[data-ds-mobile-collapsed="0"] #${ID} {
          grid-column: 1 / -1;
        }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function updateToolbar(toolbar) {
    const button = toolbar.querySelector(`#${ID}`);
    if (!button) return;
    toolbar.dataset.dsMobileCollapsed = expanded ? '0' : '1';
    button.textContent = expanded ? 'Close organizer' : 'Organize bots';
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', expanded ? 'Close bot organizer controls' : 'Open bot organizer controls');
  }

  function refresh() {
    const toolbar = document.getElementById('ds-bot-organizer-toolbar');
    if (!media.matches || !toolbar) {
      if (observedToolbar) {
        toolbarObserver?.disconnect();
        observedToolbar.removeAttribute('data-ds-mobile-collapsed');
        observedToolbar.querySelector(`#${ID}`)?.remove();
        observedToolbar = null;
      }
      return;
    }
    const settings = DS.state?.settings;
    if (settings && (!settings.enabled || !settings.enableBotOrganizer)) return;
    installStyle();
    if (observedToolbar !== toolbar) {
      toolbarObserver?.disconnect();
      observedToolbar = toolbar;
      toolbarObserver = new MutationObserver(() => {
        // The organizer occasionally replaces all controls after mode changes.
        // Observe only its immediate children, never the full page subtree.
        if (!toolbar.querySelector(`#${ID}`)) refresh();
      });
      toolbarObserver.observe(toolbar, { childList: true });
    }
    if (!toolbar.querySelector(`#${ID}`)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = ID;
      button.addEventListener('click', () => {
        expanded = !expanded;
        updateToolbar(toolbar);
      });
      toolbar.prepend(button);
    }
    updateToolbar(toolbar);
  }

  function start() {
    // The original organizer appends this toolbar directly to document.body.
    // A direct-child observer catches its creation/removal without watching
    // thousands of listing/card mutations.
    const parent = document.body;
    if (!parent) return;
    const observer = new MutationObserver(records => {
      if (records.some(record => [...record.addedNodes, ...record.removedNodes]
        .some(node => node.nodeType === 1 && (node.id === 'ds-bot-organizer-toolbar' || node.querySelector?.('#ds-bot-organizer-toolbar'))))) {
        refresh();
      }
    });
    observer.observe(parent, { childList: true });
    media.addEventListener?.('change', refresh);
    window.addEventListener('pagehide', () => {
      observer.disconnect();
      toolbarObserver?.disconnect();
    }, { once: true });
    refresh();
  }
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
}


// ---- Original v0.2.53 module: content/saved-lists-overlay.js ----

// No optional feature initialization on a tab whose QoL switch is paused.
if (!window.__DSQ_TAB_GATE__?.paused) {
(() => {
  "use strict";
  const DS=window.DragonScriptQoL;if(!DS)return;
  const BTN_ID="ds-saved-lists-open", MODAL_ID="ds-saved-lists-overlay";
  const clean=v=>String(v||"").replace(/\s+/g," ").trim();
  function safeUrl(value,fallback=""){try{const u=new URL(String(value||""),location.origin);return /^https?:$/i.test(u.protocol)?u.href:fallback;}catch{return fallback;}}
  function org(id){return DS.state.botOrganization?.meta?.[id]||{};}
  function entries(kind){const source=kind==="later"?DS.state.laterBots:DS.state.favoriteBots;const ids=Array.isArray(source?.ids)?source.ids:[];return ids.map((id,index)=>{const m=source?.meta?.[id]||{};const o=org(id);return{id,name:m.name||o.name||id,creator:m.creator||o.creator||"",image:safeUrl(m.image||o.image||""),description:m.description||"",profileUrl:safeUrl(m.profileUrl||o.profileUrl,`${location.origin}/chatbot/${id}`),chatUrl:safeUrl(m.chatUrl||o.chatUrl,`${location.origin}/chat/${id}`),savedAt:Number(m.savedAt||0),folders:Array.isArray(o.collections)?o.collections:[],tags:Array.isArray(o.tags)?o.tags:[],note:o.note||"",inLater:!!DS.state.laterBotIdSet?.has(id),inFavorite:!!DS.state.favoriteBotIdSet?.has(id),index};});}
  async function saveLater(next){DS.state.laterBots=next;DS.state.laterBotIdSet=new Set(next.ids||[]);await DS.saveLaterBots?.(next);}
  async function toggleLater(entry){const src=DS.state.laterBots||{ids:[],meta:{}};const next={ids:[...(src.ids||[])],meta:{...(src.meta||{})}};if(next.ids.includes(entry.id)){next.ids=next.ids.filter(id=>id!==entry.id);delete next.meta[entry.id];}else{next.ids.unshift(entry.id);next.meta[entry.id]={id:entry.id,name:entry.name,creator:entry.creator,image:entry.image,profileUrl:entry.profileUrl,chatUrl:entry.chatUrl,savedAt:Date.now()};}await saveLater(next);DS.setQuickStatus?.(next.ids.includes(entry.id)?"Added to Later.":"Removed from Later.");}
  function open(){
    document.getElementById(MODAL_ID)?.remove();const modal=document.createElement("div");modal.id=MODAL_ID;modal.style.cssText="position:fixed;inset:0;z-index:1000000;background:rgba(0,0,0,.58);display:flex;align-items:center;justify-content:center;padding:14px";
    DS.setSafeMarkup?.(modal, `<div style="width:min(1050px,98vw);height:min(780px,94vh);display:flex;flex-direction:column;background:#17181b;color:#f5f5f5;border:1px solid #444;border-radius:14px;padding:16px;font:14px system-ui"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><h2 style="margin:0">Saved lists</h2><small style="opacity:.72">QoL-local Favorites history + Later. Nothing here creates a new SpicyChat account list.</small></div><button data-close>×</button></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><button data-tab="favorite">Favorites</button><button data-tab="later">Later</button><input data-search type="search" placeholder="Search name, creator, note, folder…" style="flex:1;min-width:210px"><select data-sort><option value="newest">Newest</option><option value="name">Name A-Z</option><option value="creator">Creator A-Z</option><option value="folder">Folder</option></select></div><div data-summary style="opacity:.75;margin-bottom:8px"></div><div data-list style="overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px"></div></div>`);
    document.documentElement.appendChild(modal);let tab=DS.isFavoriteBotsPage?.()?"favorite":"later";const search=modal.querySelector("[data-search]"),sort=modal.querySelector("[data-sort]"),list=modal.querySelector("[data-list]"),summary=modal.querySelector("[data-summary]");
    const render=()=>{
      let rows=entries(tab);
      const q=clean(search.value).toLowerCase();
      if(q)rows=rows.filter(e=>[e.name,e.creator,e.note,...e.folders,...e.tags].join(" ").toLowerCase().includes(q));
      if(sort.value==="name")rows.sort((a,b)=>a.name.localeCompare(b.name));
      else if(sort.value==="creator")rows.sort((a,b)=>a.creator.localeCompare(b.creator)||a.name.localeCompare(b.name));
      else if(sort.value==="folder")rows.sort((a,b)=>(a.folders[0]||"~").localeCompare(b.folders[0]||"~")||a.name.localeCompare(b.name));
      else rows.sort((a,b)=>b.savedAt-a.savedAt||b.index-a.index);
      summary.textContent=`${rows.length} ${tab==="later"?"Later bot":"favorite-history entr"}${rows.length===1?(tab==="later"?"":"y"):(tab==="later"?"s":"ies")}`;
      const cards=rows.map(e=>{
        const card=document.createElement("div"); card.style.cssText="border:1px solid #333;border-radius:10px;padding:10px;display:grid;grid-template-columns:52px 1fr;gap:9px";
        const media=document.createElement("div");
        if(e.image){const img=document.createElement("img");img.src=e.image;img.alt="";img.style.cssText="width:52px;height:52px;border-radius:8px;object-fit:cover";media.appendChild(img);}
        const body=document.createElement("div"); const name=document.createElement("strong");name.textContent=e.name;body.appendChild(name);
        if(e.creator){const creator=document.createElement("div");creator.style.opacity=".72";creator.textContent=e.creator;body.appendChild(creator);}
        if(e.folders.length){const folders=document.createElement("div");folders.style.fontSize="12px";folders.textContent=`📁 ${e.folders.join(", ")}`;body.appendChild(folders);}
        if(e.note){const note=document.createElement("div");note.style.cssText="font-size:12px;margin-top:4px";note.textContent=e.note;body.appendChild(note);}
        const actions=document.createElement("div");actions.style.cssText="display:flex;gap:7px;flex-wrap:wrap;margin-top:7px";
        const profile=document.createElement("a");profile.href=e.profileUrl;profile.target="_self";profile.rel="noopener";profile.textContent="Profile";
        const chat=document.createElement("a");chat.href=e.chatUrl;chat.target="_self";chat.rel="noopener";chat.textContent="Chat";
        const later=document.createElement("button");later.type="button";later.textContent=e.inLater?"Remove Later":"Add Later";later.addEventListener("click",async()=>{await toggleLater(e);render();});
        actions.append(profile,chat,later);body.appendChild(actions);card.append(media,body);return card;
      });
      list.replaceChildren(...cards);
    };
    modal.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();});search.oninput=render;sort.onchange=render;modal.querySelector("[data-close]").onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove();};render();search.focus();
  }
  function cleanup(){document.getElementById(BTN_ID)?.remove();document.getElementById(MODAL_ID)?.remove();}
  DS.applySavedListsOverlay=function(){const s=DS.state.settings||{};if(!s.enabled||!s.enableSavedListsOverlay)return cleanup();if(!DS.isFavoriteBotsPage?.()&&!/^\/recommended-bots\/?$/i.test(location.pathname))return cleanup();if(document.getElementById(BTN_ID))return;const h=[...document.querySelectorAll("h1,h2,h3")].find(el=>/favorites|recommend/i.test(clean(el.textContent)));if(!h?.parentElement)return;const b=document.createElement("button");b.id=BTN_ID;b.type="button";b.textContent="Saved lists";b.style.cssText="margin-left:8px;border:1px solid rgba(148,163,184,.35);border-radius:7px;background:transparent;color:inherit;padding:6px 9px;cursor:pointer;font:600 12px system-ui";b.onclick=e=>{e.preventDefault();e.stopPropagation();open();};h.insertAdjacentElement("afterend",b);};
  DS.removeSavedListsOverlay=cleanup;
})();

}


// ---- Safari panel: installation controls, local lists, diagnostics, export/import ----

(() => {
  'use strict';
  const DS = window.DragonScriptQoL;
  if (!DS?.__safariUserscript) return;
  const {VERSION, errorLog, clone, validateStore, defaults, report, toast, clean} = DS.__safari;
  const FEATURES = [
    ['enableChatOrganizer', 'Chat folders', 'Organize conversations on /chats.'],
    ['enableBotOrganizer', 'Bot folders & notes', 'Original organizer on bot listings, profiles and chat pages.'],
    ['enableSavedListsOverlay', 'Saved Lists overlay', 'Original Favorites / Later overlay on supported listing pages.'],
    ['enableSafariSaveButtons', 'Quick-save buttons', 'Add bots from visible cards and profiles to local Favorites or Later.'],
    ['enableSafariDiscovery', 'Local discovery', 'Search your saved bots and visible listings; does not search every bot on SpicyChat.']
  ];
  const pref = 'dsq-safari-';
  function node(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) {
      if (k === 'className') el.className = v;
      else if (k === 'text') el.textContent = String(v);
      else if (k === 'type' || k === 'placeholder' || k === 'title') el[k] = v;
      else el.setAttribute(k, String(v));
    }
    for (const child of children) if (child != null) el.append(typeof child === 'string' ? document.createTextNode(child) : child);
    return el;
  }
  function button(label, fn, role = '') {
    const btn = node('button', {type:'button', text:label, className:role});
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); try { Promise.resolve(fn(e)).catch(er => report('Action',er)); } catch(er) {report('Action',er);} });
    return btn;
  }
  const metaFor = id => DS.state.botOrganization?.meta?.[id] || {};
  const uniqueIds = ids => [...new Set((ids || []).map(String).filter(Boolean))];
  function saveTo(kind, data) {
    const source = DS.state[kind] || {ids:[],meta:{}};
    const id = clean(data.id);
    if (!id) return;
    const item = {...data, id, name: data.name || id, savedAt: Date.now()};
    const next = {ids: uniqueIds([id,...(source.ids || [])]), meta: {...(source.meta || {}), [id]: {...(source.meta?.[id] || {}), ...item}}};
    DS.state[kind] = next;
    DS.state[kind === 'laterBots' ? 'laterBotIdSet' : 'favoriteBotIdSet'] = new Set(next.ids);
    if (DS.__safari.persist()) toast(`Saved to ${kind === 'laterBots' ? 'Later' : 'Favorites'} (local).`);
    updatePanelIfOpen();
  }
  function removeFrom(kind,id) {
    const source = DS.state[kind] || {ids:[],meta:{}};
    const next = {ids: (source.ids || []).filter(key => key !== id),meta:{...source.meta}};
    delete next.meta[id];
    DS.state[kind] = next;
    DS.state[kind === 'laterBots' ? 'laterBotIdSet' : 'favoriteBotIdSet'] = new Set(next.ids);
    DS.__safari.persist(); updatePanelIfOpen();
  }
  function fromCard(card, anchor) { const id = DS.botIdFromHref(anchor?.href || ''); return id ? DS.makeBotMeta({id,card,anchor}) : null; }
  function currentEntry() {
    const id = DS.botIdFromHref(location.href);
    if (!id) return null;
    const header = document.querySelector('h1')?.textContent;
    const image = document.querySelector("a[aria-label='chatbot-profile'] img, main img")?.src || '';
    return {id, name:clean(header) || id, image, chatUrl:`${location.origin}/chat/${id}`, profileUrl:`${location.origin}/chatbot/${id}`};
  }
  function applySaveButtons() {
    const enabled = !!DS.state.settings.enableSafariSaveButtons;
    if (!enabled) { document.querySelectorAll('.dsq-safari-save, #dsq-safari-current').forEach(el=>el.remove()); return; }
    for (const {card, anchor} of DS.collectCards().slice(0,100)) {
      if (card.querySelector(':scope > .dsq-safari-save')) continue;
      const item = fromCard(card,anchor); if (!item) continue;
      const wrap = node('div',{className:'dsq-safari-save'});
      wrap.append(button('☆ Save', () => saveTo('favoriteBots',item)), button('+ Later', () => saveTo('laterBots',item)));
      card.append(wrap);
    }
    const item = (DS.isSingleChatPage() || DS.isBotProfilePage()) ? currentEntry() : null;
    let box = document.getElementById('dsq-safari-current');
    if (!item) {box?.remove();return;}
    if (box?.dataset.id === item.id) return;
    box?.remove();box=node('div',{id:'dsq-safari-current'});box.dataset.id=item.id;
    box.append(button('☆ Save',()=>saveTo('favoriteBots',item)),button('+ Later',()=>saveTo('laterBots',item)));
    const header = document.querySelector('h1');
    if (header?.parentElement) header.parentElement.append(box);
  }
  let activeTab = 'settings';
  let savedQuery = '';
  let savedKind = 'laterBots';
  function panel() {return document.getElementById('dsq-safari-panel');}
  function updatePanelIfOpen() { if (panel()) render(); }
  function makeClose(){return button('×',()=>panel()?.remove(),'dsq-close');}
  function sectionTitle(text){return node('h3',{text});}
  function checkbox(key, label, info) {
    const input = node('input',{type:'checkbox'});
    input.checked = !!DS.state.settings[key];
    const line = node('label',{className:'dsq-toggle'}, input, node('span',{},node('strong',{text:label}),node('small',{text:info})));
    input.addEventListener('change', async () => {
      try { await DS.saveSettingsPatch({[key]:input.checked}); DS.scheduleRun(); }
      catch(e) { report('Saving toggle',e); input.checked = !input.checked; }
    });
    return line;
  }
  function renderSettings(host) {
    host.append(sectionTitle('Features'), node('p',{text:'Nothing optional runs until enabled. Try Chat folders and Quick-save first, then Bot folders.'}));
    for (const [key,name,description] of FEATURES) host.append(checkbox(key,name,description));
    host.append(sectionTitle('Data & backup'));
    host.append(node('p',{text:'Stored only in Safari for this website. Not synced to Chrome, Firefox or Android. Back up before clearing website data.'}));
    const actions=node('div',{className:'dsq-actions'});
    actions.append(button('Export backup',exportBackup),button('Import backup',()=>document.getElementById('dsq-safari-import')?.click()));
    const file=node('input',{type:'file',id:'dsq-safari-import'});file.accept='application/json,.json';file.style.display='none';
    file.addEventListener('change',()=>{if(file.files?.[0]) importBackup(file.files[0]);file.value='';});
    actions.append(file);
    host.append(actions);
    host.append(node('small',{text:'v'+VERSION+' • experimental Safari/iPhone compatibility • no background requests or additional tabs.'}));
  }
  function cardsFor(kind) {
    const store = DS.state[kind] || {ids:[],meta:{}};
    return (store.ids || []).map(id => {
      const data = {...(metaFor(id) || {}),...(store.meta?.[id] || {})};
      return {...data,id,name:data.name || id,chatUrl:data.chatUrl || `${location.origin}/chat/${id}`,profileUrl:data.profileUrl || `${location.origin}/chatbot/${id}`};
    });
  }
  function listRow(item, kind, removable=true) {
    const row=node('div',{className:'dsq-entry'});
    if (item.image && /^https?:|^data:image\//.test(item.image)) { const image=node('img',{});image.src=item.image;image.alt='';row.append(image); }
    const body=node('div',{className:'dsq-entry-body'});
    body.append(node('strong',{text:item.name}),node('small',{text:[item.creator, (item.collections || []).join(', ')].filter(Boolean).join(' • ')}));
    const actions=node('div',{className:'dsq-actions'});
    const url = (()=>{try { const u = new URL(item.profileUrl, location.origin);return u.origin === location.origin ? u.href : `${location.origin}/chatbot/${item.id}`;} catch {return `${location.origin}/chatbot/${item.id}`;}})();
    const link=node('a',{href:url,text:'Open'});actions.append(link);
    if (removable) actions.append(button('Remove',()=>removeFrom(kind,item.id)));
    else actions.append(button('☆ Favorite',()=>saveTo('favoriteBots',item)),button('+ Later',()=>saveTo('laterBots',item)));
    body.append(actions);row.append(body);return row;
  }
  function renderSaved(host) {
    host.append(sectionTitle('Saved bots'));
    const actions=node('div',{className:'dsq-actions'});
    const select=node('select');for (const [kind,name] of [['laterBots','Later'],['favoriteBots','Local Favorites']]) {
      const opt=node('option',{value:kind,text:name}); select.append(opt);
    }select.value=savedKind;select.addEventListener('change',()=>{savedKind=select.value;render();});
    const input=node('input',{type:'search',placeholder:'Search names, creators, notes, folders'});input.value=savedQuery;
    input.addEventListener('input',()=>{savedQuery=input.value; renderSavedRows(host);});
    actions.append(select,input);host.append(actions);
    const savedRows=node('div',{id:'dsq-saved-rows',className:'dsq-rows'});host.append(savedRows);
    renderSavedRows(host);
    host.append(node('small',{text:'These are QoL-local lists, not native SpicyChat account Favorites. Use Quick-save on bot cards to populate them.'}));
  }
  function renderSavedRows(host){
    const rows=host.querySelector('#dsq-saved-rows'); if(!rows)return;
    const q=clean(savedQuery).toLowerCase();
    const filtered=cardsFor(savedKind).filter(row=>!q || [row.name,row.creator,row.note,...(row.collections||[]),...(row.tags||[])].join(' ').toLowerCase().includes(q));
    rows.replaceChildren(...filtered.slice(0,300).map(item=>listRow(item,savedKind)));
    if(!filtered.length)rows.append(node('p',{text:'No locally saved bots yet.'}));
    if(filtered.length>300) rows.append(node('small',{text:`Showing 300 of ${filtered.length} matches` }));
  }
  let discoverQuery = '';
  function renderDiscovery(host) {
    host.append(sectionTitle('Discover & organize'));
    if (!DS.state.settings.enableSafariDiscovery) {
      host.append(node('p',{text:'Local Discovery is OFF. Enable it in Setup to search saved bots and currently loaded listing cards.'}));
      host.append(button('Enable Local Discovery',async()=>{await DS.saveSettingsPatch({enableSafariDiscovery:true});render();}));
      return;
    }
    host.append(node('p',{text:'Search bots currently loaded on this page and your locally saved bot history. This is not an online search of all SpicyChat bots.'}));
    const search=node('input',{type:'search',placeholder:'Filter visible bots or saved bots'});search.value=discoverQuery;
    search.addEventListener('input',()=>{discoverQuery=search.value;renderDiscoveryRows(host);});host.append(search);
    const quick=node('div',{className:'dsq-actions'});
    for(const [label,path] of [['SpicyChat Search','/search'],['Favorites','/favorite-bots'],['Chats','/chats']]) quick.append(node('a',{href:path,text:label}));
    host.append(quick,node('div',{id:'dsq-discovery-rows',className:'dsq-rows'}));
    renderDiscoveryRows(host);
  }
  function renderDiscoveryRows(host) {
    const rows=host.querySelector('#dsq-discovery-rows');if(!rows)return;
    const visible=DS.collectCards().map(({card,anchor})=>fromCard(card,anchor)).filter(Boolean);
    const combined=new Map();
    for(const kind of ['favoriteBots','laterBots'])for(const item of cardsFor(kind))combined.set(item.id,item);
    for(const item of visible)combined.set(item.id,{...(combined.get(item.id)||{}),...item});
    const q=clean(discoverQuery).toLowerCase();
    const found=[...combined.values()].filter(item=>!q || [item.name,item.creator,item.note,...(item.tags||[]),...(item.collections||[])].join(' ').toLowerCase().includes(q));
    rows.replaceChildren(...found.slice(0,80).map(item=>listRow(item,'',false)));
    if(!found.length)rows.append(node('p',{text:'No matching bots loaded. Open a SpicyChat listing to discover more.'}));
    if(found.length>80)rows.append(node('small',{text:`Showing 80 of ${found.length} matching bots` }));
  }
  function renderDiagnostics(host) {
    host.append(sectionTitle('Diagnostics'));
    const summary={version:VERSION,website:location.hostname,pathname:location.pathname,
      userAgent:navigator.userAgent, features:Object.fromEntries(FEATURES.map(([key])=>[key,DS.state.settings[key]])),
      loadedCards:DS.collectCards().length, chatRows:DS.isChatListPage() ? DS.collectChatRows().length : 0, errors:errorLog};
    const raw=JSON.stringify(summary,null,2);
    const area=node('textarea',{className:'dsq-log'});area.value=raw;area.readOnly=true;
    host.append(area,button('Copy report',async()=>{try{await navigator.clipboard.writeText(raw);toast('Diagnostic report copied.');}catch{area.focus();area.select();toast('Select and copy the report manually.');}}));
    host.append(node('small',{text:'Reports do not include chat message bodies or local saved-list contents.'}));
  }
  function render() {
    const p=panel();if(!p)return;
    p.replaceChildren();
    const head=node('div',{className:'dsq-head'},node('strong',{text:'SpicyChat QoL • Safari beta'}),makeClose());p.append(head);
    const nav=node('div',{className:'dsq-tabs'});
    for(const [id,label] of [['settings','Setup'],['saved','Saved'],['discovery','Discover'],['diagnostics','Diagnostics']]) {
      const tab=button(label,()=>{activeTab=id;render();});if(id===activeTab)tab.dataset.active='1';nav.append(tab);
    }p.append(nav);
    const host=node('div',{className:'dsq-body'});p.append(host);
    if(activeTab==='settings')renderSettings(host);
    else if(activeTab==='saved')renderSaved(host);
    else if(activeTab==='discovery')renderDiscovery(host);
    else renderDiagnostics(host);
  }
  function open(tab) { if(tab)activeTab=tab; if(panel()) {panel().remove();return;}
    if(!document.body)return;
    const p=node('section',{id:'dsq-safari-panel','role':'dialog','aria-label':'SpicyChat QoL Safari controls'});
    document.body.append(p);render();
  }
  function mount() {
    if (!document.body) return;
    if(!document.getElementById('dsq-safari-button')){
      const launcher=button('QoL',()=>open(),'');launcher.id='dsq-safari-button';launcher.title='SpicyChat QoL Safari beta';
      document.body.append(launcher);
    }
  }
  function exportBackup() {
    const {settings,botOrganization,chatOrganization,favoriteBots,laterBots}=DS.state;
    const obj={kind:'SpicyChat QoL Safari Userscript backup',version:VERSION,exportedAt:new Date().toISOString(),
      settings:clone(settings),botOrganization:clone(botOrganization),chatOrganization:clone(chatOrganization),favoriteBots:clone(favoriteBots),laterBots:clone(laterBots)};
    const blob = new Blob([JSON.stringify(obj,null,2)], {type:'application/json'});
    const url=URL.createObjectURL(blob),a=node('a',{href:url,download:`spicychat-qol-safari-backup-${new Date().toISOString().slice(0,10)}.json`});
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
    toast('Backup export requested. Check Files / Downloads.');
  }
  async function importBackup(file) {
    try {
      if(file.size>9_000_000)throw Error('This backup is too large for Safari Lite import.');
      const parsed=JSON.parse(await file.text());
      if(!parsed || typeof parsed!=='object' || !['botOrganization','chatOrganization','laterBots','favoriteBots'].some(key => parsed[key])) throw Error('Not a recognized QoL organization backup.');
      if(!confirm('Import this backup? It REPLACES current Safari Lite folders and lists. Export your Safari backup first. Optional features will stay OFF unless enabled again.'))return;
      const next=validateStore(parsed); // Restore lists, but never turn on imported desktop feature switches.
      next.settings={...defaults().settings,chatCollections:next.settings.chatCollections,botCollections:next.settings.botCollections};
      DS.state={...next,favoriteBotIdSet:new Set(next.favoriteBots?.ids||[]),laterBotIdSet:new Set(next.laterBots?.ids||[])};
      if(!DS.__safari.persist())throw Error('Storage write failed; import not saved.');
      toast('Imported. Features OFF. Reload the page to start fresh.');render();DS.scheduleRun();
    } catch(e){report('Backup import',e);toast('Import failed: '+clean(e.message),true);}
  }
  let scheduled=false;
  DS.scheduleRun = () => {
    if (scheduled) return;
    scheduled=true;setTimeout(()=>{scheduled=false;run();},450);
  };
  let lastPath = location.pathname;
  let lastErrorAt = 0;
  function run() {
    if (!document.body) return;
    if(lastPath!==location.pathname){lastPath=location.pathname;panel()?.remove();}
    mount();
    for(const [name] of [['applyChatOrganizer'],['applyBotOrganizer'],['applySavedListsOverlay']]){
      try{DS[name]?.();}catch(e){if(Date.now()-lastErrorAt>3000){report(name,e);lastErrorAt=Date.now();}}
    }
    try{applySaveButtons();}catch(e){report('Quick-save',e);}
  }
  // Only childList changes are observed: our classes/styles don't retrigger a loop.
  // Ignore own UI-only mutations, and pace scans for iOS performance.
  function start() {
    if(!document.body){setTimeout(start,100);return;}
    mount(); DS.scheduleRun();
    const observer=new MutationObserver(records=>{
      for(const r of records){
        if([...r.addedNodes,...r.removedNodes].some(n => n.nodeType===1 && !n.closest?.('#dsq-safari-panel, #ds-saved-lists-overlay, #dsq-safari-button, #dsq-safari-toast, .dsq-safari-save, #dsq-safari-current, #ds-bot-organizer-toolbar, #ds-chat-organizer-toolbar, .ds-bot-organizer-popover'))){DS.scheduleRun();break;}
      }
    });
    observer.observe(document.body,{subtree:true,childList:true});
    window.addEventListener('popstate',DS.scheduleRun);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)DS.scheduleRun();});
    setInterval(()=>{if(location.pathname!==lastPath)DS.scheduleRun();},2500);
  }
  start();
})();
