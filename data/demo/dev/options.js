const OPENED_KEY = "openedChats";
const OPENED_META_KEY = "openedChatMeta";
const BLOCKED_BOTS_KEY = "blockedBots";
const NOT_INTERESTED_KEY = "notInterestedBots";
const PERSONAS_KEY = "personas";
const LEGACY_PERSONAS_KEY = "savedPersonas";
const OOC_TEMPLATES_KEY = "oocTemplates";
const FAVORITE_CREATORS_KEY = "favoriteCreators";
const FAVORITE_BOTS_KEY = "favoriteBots";
const LATER_BOTS_KEY = "laterBots";
const GENERATION_PROFILES_KEY = "generationProfiles";
const AUTO_AFK_STATUS_KEY = "dsAutoAfkLastScan";
const SAI_TOOLKIT_PRESENCE_KEY = "dsSaiToolkitPresence";
const RELEASE_NOTICE_KEY = "dsReleaseNotice";
const LAST_SEEN_VERSION_KEY = "dsLastSeenReleaseVersion";

const OLD_DEFAULT_OOC_TEMPLATE = "[OOC: Never control Lukas or the user in any way. Do not speak for Lukas. Do not describe what Lukas thinks, feels, wants, notices, decides, does, or how he reacts. Do not move Lukas forward in the scene. Only the user may write Lukas's words, actions, thoughts, emotions, expressions, and decisions. You may control only your character, NPCs, side characters, enemies, and the environment. End every response in a way that leaves Lukas free to respond.]";
const DEFAULT_OOC_TEMPLATE = "[OOC: Never control {user} or the user in any way. Do not speak for {user}. Do not describe what {user} thinks, feels, wants, notices, decides, does, or how {user} reacts. Do not move {user} forward in the scene. Only the user may write {user}'s words, actions, thoughts, emotions, expressions, and decisions. You may control only your character, NPCs, side characters, enemies, and the environment. End every response in a way that leaves {user} free to respond.]";

const DEFAULT_SETTINGS = {
  enabled: true,
  globalNsfwMode: "ignore",
  saiToolkitCompatibility: false,

  autoAfkEnabled: false,
  autoAfkHours: 12,
  autoAfkChats: false,
  autoAfkHome: false,
  autoAfkProfiles: false,
  autoAfkAction: "discard",
  autoAfkProtectActive: false,
  autoAfkResetOnActivate: false,

  autoTags: false,
  includeTags: [],
  excludeTags: [],
  showTagTemplateButton: false,
  showChatTagLinks: false,
  showChatTagAddButtons: false,

  botEditorShowCharButton: false,
  botEditorShowUserButton: false,
  botEditorShowContinueButton: false,
  botEditorShowNoControlButton: false,
  botEditorShowCustomSnippets: false,
  botEditorAutoOpenAdvanced: false,
  lorebookAutoStartNew: false,
  showLorebookEntryExpandButtons: false,
  botEditorDefaultVisibility: "ignore",
  autoAgreeCreationGuidelines: false,
  botEditorSnippets: [],

  enableGenerationProfiles: false,
  showGenerationMetadata: false,
  showMessageTimestamps: false,
  messageTimestamp24Hour: false,
  messageTimestampDateFirst: false,
  messageTimestampShowSeconds: false,
  showGenerationModel: false,
  showGenerationElapsed: false,
  showGenerationSettings: false,
  compactGenerationMetadata: false,

  hidePremium: false,
  hideFloatingPremiumPopups: false,
  hideAdvertBanners: false,
  expandModelSelectorDescriptions: false,
  hideModelUpgradeButtons: false,
  hideNotifications: false,
  hideTabNotificationBadge: false,
  autoReadNotifications: false,

  hideTopBarLanguage: false,
  hideTopBarNotifications: false,
  hideTopBarTheme: false,
  topBarProfilePillMode: "normal",
  topBarProfilePillCustomText: "",
  topBarProfilePillPersonaPrefix: false,

  showChatTopBarTools: false,
  chatTopBarInlineCreator: false,
  chatTopBarAddLaterButton: false,
  closeChatTabAfterSavingLater: false,
  showPerCharacterChatHistory: false,
  showQuickNewChatButton: false,
  hideChatTopBarRatingButton: false,
  hideChatTopBarModelButton: false,
  hideChatTopBarContextDot: false,
  hideChatDropdownVoiceUpsell: false,
  hideChatDropdownMemoryItem: false,
  enableBulkMemoryManager: false,

  blockCards: false,
  blockedTags: [],
  blockedWords: [],
  blockedCreators: [],
  blockedBotIds: [],
  blockedBotNames: [],
  blockedBotSortMode: "newest",
  neverHideFavorites: false,
  protectFavoritesFromBlocking: false,
  showCreatorFavoriteButtons: false,
  protectFavoriteCreatorsFromFiltering: false,
  trackFavoriteBots: false,
  favoriteBotSortMode: "newest",
  showLaterBotButtons: false,
  protectLaterBotsFromFiltering: false,
  hideLaterBotsFromListings: false,
  laterBotSortMode: "newest",
  hideHomeForYouCards: false,
  expandLongCardDescriptions: false,
  hideGroupChats: false,

  enableLanguageFilter: false,
  allowedLanguages: [],
  languageFilterMode: "conservative",

  textNormalizationEnabled: false,
  normalizeFancyUnicode: false,
  normalizePunctuation: false,
  normalizeInvisibleCharacters: false,
  normalizeDecorativeSymbols: false,

  autoFillListings: false,
  autoFillTargetCards: 50,
  autoFillMaxClicks: 8,

  trackOpenedChats: false,
  importOpenedFromChatsPage: false,
  hideOpenedChats: false,
  openedBotSortMode: "newest",

  hiddenCardMode: "hide",
  compactAfterHiding: false,

  showQuickPanel: false,
  quickPanelPlacement: "bottom-right",
  quickPanelDraggable: false,
  quickPanelDefaultClosed: false,
  quickPanelEnabledByDefaultInTab: false,
  quickPanelWidth: 280,
  quickPanelUiScale: 100,
  quickPanelMaxHeightPercent: 80,
  quickPanelAutoCollapseOverlap: false,
  quickPanelShowStatus: false,
  quickPanelStatusShowOpened: false,
  quickPanelStatusShowBlocked: false,
  popupShowOpenedCount: false,
  popupShowBlockedCount: false,
  popupShowStorageDetails: false,
  quickPanelShowFeatureSummary: false,
  quickPanelShowOptions: false,
  quickPanelShowFillNow: false,
  quickPanelShowChatSearch: false,
  quickPanelShowChatSort: false,
  quickPanelShowScanVisible: false,
  quickPanelShowLoadAll: false,
  quickPanelShowOoc: false,
  quickPanelShowAutoVoice: false,
  quickPanelShowAutoAsterisk: false,
  quickPanelShowPersona: false,
  quickPanelShowExport: false,
  quickPanelCustomX: 12,
  quickPanelCustomY: 12,
  quickPanelCustomXPercent: 70,
  quickPanelCustomYPercent: 12,
  showBlockCurrentBotButton: false,
  replaceCardProfileWithBlockButton: false,

  showChatListTools: false,
  showSavedChatQuickActions: false,
  chatListSortMode: "default",
  chatListSearchMode: "all",
  autoLoadAllOpenedChats: false,
  deepImportMaxPages: 80,

  showChatExportButton: false,
  chatExportLoadPreviousMessages: false,
  chatExportIncludeBotInfo: false,
  chatExportIncludeOocDirectives: false,
  showOocTools: false,
  oocTemplates: [{ name: "Strict no-control", text: DEFAULT_OOC_TEMPLATE }],

  autoAcceptPersonaChange: false,
  savePersonasFromPages: false,
  expandPersonaDescriptions: false,
  showPersonaQuickSwitch: false,
  personaQuickSwitchLimit: 6,

  hideChatPlusButton: false,
  hideChatImageButton: false,
  replaceChatImageWithOocButton: false,
  showAsteriskButton: false,
  autoPairAsterisks: false,
  hideChatVoiceButton: false,
  hideUnlockCustomVoices: false,

  showMessageQuickActions: false,
  hideOriginalMessageDropdown: false,
  messageQuickActionCopy: false,
  messageQuickActionEdit: false,
  messageQuickActionReport: false,
  allowTypingWhileAiResponding: false,
  keepChatPositionWhileTyping: false,
  showScrollToTopButton: false,
  showScrollToBottomButton: false,
  protectDraftDuringMessageRemoval: false,
  failedMessageHelper: false,
  chatPerformanceMode: false,
  pauseQolInHiddenTabs: false,

  hideSidebarLogo: false,
  hideSidebarHome: false,
  hideSidebarChats: false,
  hideSidebarPersonas: false,
  hideSidebarCreateMenu: false,
  hideSidebarCreateChatbot: false,
  hideSidebarCreateLorebook: false,
  hideSidebarCreateGroup: false,
  hideSidebarCreateVoice: false,
  hideSidebarMyCreationsMenu: false,
  hideSidebarMyChatbots: false,
  hideSidebarMyLorebooks: false,
  hideSidebarMyGroups: false,
  hideSidebarMyVoices: false,
  hideSidebarFavorites: false,
  hideSidebarRecommendations: false,
  hideSidebarLeaderboard: false,
  hideSidebarBlockedCreators: false,
  hideSidebarSubscribe: false,
  hideSidebarHelp: false,
  hideSidebarSocialLinks: false,
  hideSidebarFooterLinks: false,
  hideSidebarAppDownload: false,
  hideSidebarWebVersion: false,
  hideSidebarSignOut: false,

  debug: false
};

let blockedState = { ids: [], names: [], meta: {} };
let notInterestedState = { ids: [], meta: {} };
let currentOpened = [];
let openedChatMetaState = {};
let currentPersonas = [];
let favoriteCreatorState = { handles: [], meta: {} };
let favoriteBotState = { ids: [], meta: {} };
let laterBotState = { ids: [], meta: {} };

const dirtySavedStores = new Set();
let optionsDataLoaded = false;

function markSavedStoreDirty(kind) {
  if (kind) dirtySavedStores.add(kind);
}

const botManagerUiState = {
  blocked: {
    query: "",
    visible: 20,
    collapsed: true
  },
  notInterested: {
    query: "",
    visible: 20,
    collapsed: true
  },
  later: {
    query: "",
    visible: 20,
    collapsed: true
  },
  favorite: {
    query: "",
    visible: 20,
    collapsed: true
  },
  opened: {
    query: "",
    visible: 20,
    collapsed: true
  }
};

const favoriteCreatorUiState = {
  visible: 20,
  collapsed: true
};

function storageGet(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}

function storageSet(obj) {
  return new Promise(resolve => chrome.storage.local.set(obj, resolve));
}

function runtimeMessage(message) {
  return new Promise(resolve => {
    try {
      chrome.runtime.sendMessage(message, response => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(response || null);
      });
    } catch {
      resolve(null);
    }
  });
}


let pendingImportPayload = null;
let settingsToastTimer = null;
let settingsUndoAction = null;

const PAGE_INTROS = {
  general: "Main switches, quick setup, browser-popup options, Auto-AFK, tags, and site-wide cleanup.",
  "mini-panel": "Choose what the small in-page QoL panel shows and where it sits.",
  "chat-list": "Tools for /chat and /chats, plus opened-chat tracking and favorite protection.",
  "chat-ui": "Message/composer helpers, memories, personas, export, scrolling, and long-chat performance.",
  "bot-tools": "Creation helpers, editor snippets, chat-page bot actions, and bot tag shortcuts.",
  sidebar: "Hide only the sidebar items you do not want. Every item is controlled separately.",
  topbar: "Clean up SpicyChat's top bar and optionally change the text beside your avatar.",
  saved: "Review and manage the local lists QoL keeps for opened, favorite, Later, and creator entries.",
  blocking: "Control card filtering, language/text cleanup, blocked bots, and Not Interested entries.",
  data: "Back up, restore, inspect, and clean the data QoL stores in this browser.",
  changelog: "Short release notes for each development build.",
  help: "Diagnostics, bug-report links, credits, and the quickest way to send useful debug info."
};

const FEATURE_CHANGE_MARKERS = {
  showScrollToBottomButton: { version: "0.1.8.67", label: "New" },
  showScrollToTopButton: { version: "0.1.8.67", label: "Updated" },
  showAsteriskButton: { version: "0.1.8.69", label: "Updated" },
  autoPairAsterisks: { version: "0.1.8.68", label: "New" },
  quickPanelShowAutoAsterisk: { version: "0.1.8.68", label: "New" },
  showLaterBotButtons: { version: "0.1.8.68", label: "Updated" },
  popupShowStorageDetails: { version: "0.1.8.69", label: "New" },
  quickPanelShowFeatureSummary: { version: "0.1.8.69", label: "New" }
};

const CARD_CHANGE_MARKERS = [
  { selector: "#quickSetupCard h2", version: "0.1.8.69", label: "New" },
  { selector: "#backupRestoreCard h2", version: "0.1.8.69", label: "Updated" },
  { selector: "#storageCard h2", version: "0.1.8.69", label: "New" },
  { selector: "#diagnosticsCard h2", version: "0.1.8.69", label: "New" }
];

const OPTIONAL_FEATURE_KEYS = [
  "saiToolkitCompatibility",
  "autoAfkEnabled",
  "autoTags",
  "showTagTemplateButton",
  "showChatTagLinks",
  "showChatTagAddButtons",
  "botEditorShowCharButton",
  "botEditorShowUserButton",
  "botEditorShowContinueButton",
  "botEditorShowNoControlButton",
  "botEditorShowCustomSnippets",
  "botEditorAutoOpenAdvanced",
  "lorebookAutoStartNew",
  "showLorebookEntryExpandButtons",
  "autoAgreeCreationGuidelines",
  "enableGenerationProfiles",
  "showGenerationMetadata",
  "showMessageTimestamps",
  "showGenerationModel",
  "showGenerationElapsed",
  "showGenerationSettings",
  "hidePremium",
  "hideFloatingPremiumPopups",
  "hideAdvertBanners",
  "expandModelSelectorDescriptions",
  "hideModelUpgradeButtons",
  "hideNotifications",
  "hideTabNotificationBadge",
  "autoReadNotifications",
  "hideTopBarLanguage",
  "hideTopBarNotifications",
  "hideTopBarTheme",
  "showChatTopBarTools",
  "chatTopBarInlineCreator",
  "chatTopBarAddLaterButton",
  "closeChatTabAfterSavingLater",
  "showPerCharacterChatHistory",
  "showQuickNewChatButton",
  "hideChatTopBarRatingButton",
  "hideChatTopBarModelButton",
  "hideChatTopBarContextDot",
  "hideChatDropdownVoiceUpsell",
  "hideChatDropdownMemoryItem",
  "enableBulkMemoryManager",
  "blockCards",
  "neverHideFavorites",
  "protectFavoritesFromBlocking",
  "showCreatorFavoriteButtons",
  "protectFavoriteCreatorsFromFiltering",
  "trackFavoriteBots",
  "showLaterBotButtons",
  "protectLaterBotsFromFiltering",
  "hideLaterBotsFromListings",
  "hideHomeForYouCards",
  "expandLongCardDescriptions",
  "hideGroupChats",
  "enableLanguageFilter",
  "textNormalizationEnabled",
  "normalizeFancyUnicode",
  "normalizePunctuation",
  "normalizeInvisibleCharacters",
  "normalizeDecorativeSymbols",
  "autoFillListings",
  "trackOpenedChats",
  "importOpenedFromChatsPage",
  "hideOpenedChats",
  "compactAfterHiding",
  "showQuickPanel",
  "popupShowOpenedCount",
  "popupShowBlockedCount",
  "popupShowStorageDetails",
  "quickPanelShowFeatureSummary",
  "replaceCardProfileWithBlockButton",
  "showChatListTools",
  "showSavedChatQuickActions",
  "showChatExportButton",
  "showOocTools",
  "autoAcceptPersonaChange",
  "savePersonasFromPages",
  "expandPersonaDescriptions",
  "showPersonaQuickSwitch",
  "hideChatPlusButton",
  "hideChatImageButton",
  "replaceChatImageWithOocButton",
  "showAsteriskButton",
  "autoPairAsterisks",
  "hideChatVoiceButton",
  "hideUnlockCustomVoices",
  "showMessageQuickActions",
  "hideOriginalMessageDropdown",
  "messageQuickActionCopy",
  "messageQuickActionEdit",
  "messageQuickActionReport",
  "allowTypingWhileAiResponding",
  "keepChatPositionWhileTyping",
  "showScrollToTopButton",
  "showScrollToBottomButton",
  "protectDraftDuringMessageRemoval",
  "failedMessageHelper",
  "chatPerformanceMode",
  "pauseQolInHiddenTabs",
  "hideSidebarLogo",
  "hideSidebarHome",
  "hideSidebarChats",
  "hideSidebarPersonas",
  "hideSidebarCreateMenu",
  "hideSidebarCreateChatbot",
  "hideSidebarCreateLorebook",
  "hideSidebarCreateGroup",
  "hideSidebarCreateVoice",
  "hideSidebarMyCreationsMenu",
  "hideSidebarMyChatbots",
  "hideSidebarMyLorebooks",
  "hideSidebarMyGroups",
  "hideSidebarMyVoices",
  "hideSidebarFavorites",
  "hideSidebarRecommendations",
  "hideSidebarLeaderboard",
  "hideSidebarBlockedCreators",
  "hideSidebarSubscribe",
  "hideSidebarHelp",
  "hideSidebarSocialLinks",
  "hideSidebarFooterLinks",
  "hideSidebarAppDownload",
  "hideSidebarWebVersion",
  "hideSidebarSignOut",
  "debug"
];

const PRESET_VALUES = {
  minimal: {
    trackOpenedChats: true,
    trackFavoriteBots: true,
    showLaterBotButtons: true,
    showScrollToTopButton: true,
    showScrollToBottomButton: true,
    protectDraftDuringMessageRemoval: true
  },
  recommended: {
    trackOpenedChats: true,
    importOpenedFromChatsPage: true,
    trackFavoriteBots: true,
    showLaterBotButtons: true,
    protectLaterBotsFromFiltering: true,
    showAsteriskButton: true,
    autoPairAsterisks: true,
    showScrollToTopButton: true,
    showScrollToBottomButton: true,
    protectDraftDuringMessageRemoval: true,
    failedMessageHelper: true,
    savePersonasFromPages: true,
    expandPersonaDescriptions: true,
    showLorebookEntryExpandButtons: true,
    popupShowOpenedCount: true,
    popupShowBlockedCount: true
  }
};

function storageBytesInUse(keys = null) {
  return new Promise(resolve => {
    try {
      if (typeof chrome.storage.local.getBytesInUse !== "function") {
        resolve(null);
        return;
      }
      chrome.storage.local.getBytesInUse(keys, bytes => {
        if (chrome.runtime.lastError) resolve(null);
        else resolve(Number(bytes) || 0);
      });
    } catch {
      resolve(null);
    }
  });
}

function compareVersions(a, b) {
  const left = String(a || "0").split(".").map(x => Number(x) || 0);
  const right = String(b || "0").split(".").map(x => Number(x) || 0);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff) return diff > 0 ? 1 : -1;
  }
  return 0;
}

function showSettingsToast(message, undoAction = null) {
  const toast = $("settingsToast");
  const text = $("settingsToastText");
  const undo = $("settingsToastUndo");
  if (!toast || !text || !undo) return;

  clearTimeout(settingsToastTimer);
  settingsUndoAction = typeof undoAction === "function" ? undoAction : null;
  text.textContent = String(message || "Done.");
  undo.hidden = !settingsUndoAction;
  toast.hidden = false;

  settingsToastTimer = setTimeout(() => {
    toast.hidden = true;
    settingsUndoAction = null;
  }, settingsUndoAction ? 8000 : 3200);
}

function cloneJson(value) {
  try { return JSON.parse(JSON.stringify(value)); } catch { return value; }
}

function setupSettingsToast() {
  $("settingsToastUndo")?.addEventListener("click", async () => {
    const action = settingsUndoAction;
    settingsUndoAction = null;
    if (!action) return;
    try {
      await action();
      showSettingsToast("Undone.");
    } catch {
      showSettingsToast("Undo failed.");
    }
  });
}

function formatAutoAfkStatus(summary) {
  if (!summary || typeof summary !== "object") {
    return "No cleanup check recorded yet.";
  }

  const when = Number(summary.at)
    ? new Date(Number(summary.at)).toLocaleString()
    : "unknown time";

  if (!summary.enabled) {
    return `Last check ${when}: Auto-AFK was disabled.`;
  }

  const actionWord = summary.action === "close" ? "closed" : "unloaded";
  const parts = [
    `Last check ${when}: ${Number(summary.monitored || 0)} monitored`,
    `${Number(summary.protected || 0)} protected`,
    `${Number(summary.recent || 0)} still active`,
    `${Number(summary.eligible || 0)} eligible`,
    `${Number(summary.cleaned || 0)} ${actionWord}`
  ];

  if (Number(summary.alreadyDiscarded || 0) > 0) {
    parts.push(`${Number(summary.alreadyDiscarded)} already unloaded`);
  }

  if (Number(summary.failed || 0) > 0) {
    parts.push(`${Number(summary.failed)} failed`);
  }

  if (Number(summary.nextDueAt) > Date.now()) {
    parts.push(`next eligible around ${new Date(Number(summary.nextDueAt)).toLocaleString()}`);
  }

  if (Array.isArray(summary.errors) && summary.errors[0]) {
    parts.push(`browser error: ${summary.errors[0]}`);
  }

  return `${parts.join("; ")}.`;
}

function renderAutoAfkStatus(summary) {
  const el = $("autoAfkStatus");
  if (el) el.textContent = formatAutoAfkStatus(summary);
}

async function runAutoAfkCheckNow() {
  const button = $("autoAfkCheckNow");
  if (button) button.disabled = true;

  try {
    // Save the controls first so the check uses exactly what is visible here.
    await storageSet({ settings: readSettingsFromPage() });
    const response = await runtimeMessage({ type: "DS_AUTO_AFK_RUN_NOW" });

    if (response?.ok) {
      renderAutoAfkStatus(response.summary);
    } else {
      renderAutoAfkStatus({
        at: Date.now(),
        enabled: true,
        monitored: 0,
        protected: 0,
        recent: 0,
        eligible: 0,
        cleaned: 0,
        failed: 1,
        errors: [response?.error || "Could not contact the extension background worker"]
      });
    }
  } finally {
    if (button) button.disabled = false;
  }
}

function $(id) {
  return document.getElementById(id);
}

function checked(id, fallback = false) {
  const el = $(id);
  return el ? !!el.checked : fallback;
}

function value(id, fallback = "") {
  const el = $(id);
  return el ? el.value : fallback;
}

function linesToArray(raw) {
  return String(raw || "")
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean);
}

function arrayToLines(arr) {
  return (arr || []).join("\n");
}

function uniqueClean(values) {
  return [
    ...new Set(
      (values || [])
        .map(x => String(x).trim())
        .filter(Boolean)
    )
  ];
}

function setChecked(id, enabled) {
  const el = $(id);
  if (el) el.checked = !!enabled;
}

function setValue(id, next) {
  const el = $(id);
  if (el) el.value = next;
}

function setAllowedLanguages(values) {
  const allowed = new Set(Array.isArray(values) ? values : []);

  document.querySelectorAll(".allowed-language").forEach(input => {
    input.checked = allowed.has(input.value);
  });
}

function getAllowedLanguages() {
  return [...document.querySelectorAll(".allowed-language:checked")]
    .map(input => input.value)
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}


// Converts common Unicode "fancy text" letters and digits to ASCII even on
// older Android WebViews where String.normalize("NFKC") can be incomplete.
function normalizeMathematicalLatinFallback(value) {
  const ranges = [
    [0x2102, 0x2102, 0x43], [0x210A, 0x210A, 0x67],
    [0x210B, 0x210B, 0x48], [0x210C, 0x210C, 0x48],
    [0x210D, 0x210D, 0x48], [0x210E, 0x210E, 0x68],
    [0x2110, 0x2110, 0x49], [0x2111, 0x2111, 0x49],
    [0x2112, 0x2112, 0x4C], [0x2113, 0x2113, 0x6C],
    [0x2115, 0x2115, 0x4E], [0x2119, 0x211B, 0x50],
    [0x211C, 0x211C, 0x52], [0x211D, 0x211D, 0x52],
    [0x2124, 0x2124, 0x5A], [0x2128, 0x2128, 0x5A],
    [0x212A, 0x212A, 0x4B], [0x212C, 0x212D, 0x42],
    [0x212F, 0x212F, 0x65], [0x2130, 0x2131, 0x45],
    [0x2133, 0x2133, 0x4D], [0x2134, 0x2134, 0x6F],
    [0x2139, 0x2139, 0x69], [0x2145, 0x2145, 0x44],
    [0x2146, 0x2147, 0x64], [0x2148, 0x2149, 0x69],
    [0x1D400, 0x1D419, 0x41], [0x1D41A, 0x1D433, 0x61],
    [0x1D434, 0x1D44D, 0x41], [0x1D44E, 0x1D454, 0x61],
    [0x1D456, 0x1D467, 0x69], [0x1D468, 0x1D481, 0x41],
    [0x1D482, 0x1D49B, 0x61], [0x1D49C, 0x1D49C, 0x41],
    [0x1D49E, 0x1D49F, 0x43], [0x1D4A2, 0x1D4A2, 0x47],
    [0x1D4A5, 0x1D4A6, 0x4A], [0x1D4A9, 0x1D4AC, 0x4E],
    [0x1D4AE, 0x1D4B5, 0x53], [0x1D4B6, 0x1D4B9, 0x61],
    [0x1D4BB, 0x1D4BB, 0x66], [0x1D4BD, 0x1D4C3, 0x68],
    [0x1D4C5, 0x1D4CF, 0x70], [0x1D4D0, 0x1D4E9, 0x41],
    [0x1D4EA, 0x1D503, 0x61], [0x1D504, 0x1D505, 0x41],
    [0x1D507, 0x1D50A, 0x44], [0x1D50D, 0x1D514, 0x4A],
    [0x1D516, 0x1D51C, 0x53], [0x1D51E, 0x1D537, 0x61],
    [0x1D538, 0x1D539, 0x41], [0x1D53B, 0x1D53E, 0x44],
    [0x1D540, 0x1D544, 0x49], [0x1D546, 0x1D546, 0x4F],
    [0x1D54A, 0x1D550, 0x53], [0x1D552, 0x1D56B, 0x61],
    [0x1D56C, 0x1D585, 0x41], [0x1D586, 0x1D59F, 0x61],
    [0x1D5A0, 0x1D5B9, 0x41], [0x1D5BA, 0x1D5D3, 0x61],
    [0x1D5D4, 0x1D5ED, 0x41], [0x1D5EE, 0x1D607, 0x61],
    [0x1D608, 0x1D621, 0x41], [0x1D622, 0x1D63B, 0x61],
    [0x1D63C, 0x1D655, 0x41], [0x1D656, 0x1D66F, 0x61],
    [0x1D670, 0x1D689, 0x41], [0x1D68A, 0x1D6A3, 0x61],
    [0x1D7CE, 0x1D7D7, 0x30], [0x1D7D8, 0x1D7E1, 0x30],
    [0x1D7E2, 0x1D7EB, 0x30], [0x1D7EC, 0x1D7F5, 0x30],
    [0x1D7F6, 0x1D7FF, 0x30]
  ];

  let output = "";

  for (const character of String(value || "")) {
    const codePoint = character.codePointAt(0);
    let replacement = character;

    for (const [start, end, asciiStart] of ranges) {
      if (codePoint < start || codePoint > end) continue;
      replacement = String.fromCharCode(asciiStart + (codePoint - start));
      break;
    }

    output += replacement;
  }

  return output;
}

function normalizeTextPreviewValue(value) {
  const settings = readTextNormalizationSettingsFromPage();
  let text = String(value || "");

  if (!settings.textNormalizationEnabled) return text.trim();

  if (settings.normalizeInvisibleCharacters) {
    text = text
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, "")
      .replace(/[\u00AD]/g, "");
  }

  if (settings.normalizeFancyUnicode) {
    if (typeof text.normalize === "function") {
      try {
        text = text.normalize("NFKC");
      } catch {}
    }
    text = normalizeMathematicalLatinFallback(text);
  }

  if (settings.normalizePunctuation) {
    text = text
      .replace(/[‘’‚‛`´]/g, "'")
      .replace(/[“”„‟]/g, '"')
      .replace(/[‐‑‒–—―]/g, "-")
      .replace(/[⁄∕]/g, "/")
      .replace(/[…]/g, "...")
      .replace(/[•·∙]/g, " ");
  }

  if (settings.normalizeDecorativeSymbols) {
    text = text
      .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, " ")
      .replace(/[★☆✦✧✩✪✫✬✭✮✯✰♡♥❤💕💖💗💘💝💞💟]/gu, " ")
      .replace(/[꧁꧂◦°⋆]+/gu, " ")
      .replace(/[|｜¦]+/g, " | ");
  }

  return text.replace(/\s+/g, " ").trim();
}

function readTextNormalizationSettingsFromPage() {
  return {
    textNormalizationEnabled: checked("textNormalizationEnabled"),
    normalizeFancyUnicode: checked("normalizeFancyUnicode"),
    normalizePunctuation: checked("normalizePunctuation"),
    normalizeInvisibleCharacters: checked("normalizeInvisibleCharacters"),
    normalizeDecorativeSymbols: checked("normalizeDecorativeSymbols")
  };
}

function updateTextNormalizationPreview() {
  const input = $("textNormalizationPreviewInput");
  const output = $("textNormalizationPreviewOutput");
  if (!input || !output) return;

  output.textContent = normalizeTextPreviewValue(input.value || "");
}

function setVersionText() {
  const versionEl = $("versionText");
  if (!versionEl) return;

  const manifest = chrome.runtime.getManifest();
  versionEl.textContent = `v${manifest.version}`;
}

function renderHeavyManagersForTab(tabName) {
  if (!optionsDataLoaded) return;

  if (tabName === "saved") {
    renderFavoriteCreators();
    renderBotManager("favorite");
    renderBotManager("later");
    renderBotManager("opened");
  } else if (tabName === "blocking") {
    renderBotManager("blocked");
    renderBotManager("notInterested");
  }
}

function setActiveTab(tabName) {
  document.querySelectorAll(".tab-button").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-page").forEach(page => {
    page.classList.toggle("active", page.dataset.page === tabName);
  });

  const footer = $("settingsFooter");
  if (footer) footer.classList.toggle("hidden", tabName === "help" || tabName === "changelog");

  sessionStorage.setItem("spicychatQolOptionsTab", tabName);
  renderHeavyManagersForTab(tabName);
}

function setupTabs() {
  document.querySelectorAll(".tab-button").forEach(button => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  const savedTab = sessionStorage.getItem("spicychatQolOptionsTab");
  const hashTab = String(location.hash || "").replace(/^#/, "");
  const validTabs = new Set([...document.querySelectorAll(".tab-button")].map(button => button.dataset.tab));
  setActiveTab(validTabs.has(hashTab) ? hashTab : (validTabs.has(savedTab) ? savedTab : "general"));
}


function setupPageIntros() {
  document.querySelectorAll(".tab-page").forEach(page => {
    const tabName = page.dataset.page || "";
    const text = PAGE_INTROS[tabName];
    if (!text || page.querySelector(":scope > .page-intro")) return;
    const intro = document.createElement("p");
    intro.className = "page-intro";
    intro.textContent = text;
    page.prepend(intro);
  });
}

function cardSearchText(card) {
  return String(card?.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

function setupSettingsSearch() {
  const input = $("settingsSearch");
  const host = $("settingsSearchResults");
  if (!input || !host) return;

  const cards = [...document.querySelectorAll(".tab-page .card")]
    .map((card, index) => {
      const page = card.closest(".tab-page");
      const tabName = page?.dataset.page || "general";
      const tabButton = document.querySelector(`.tab-button[data-tab="${CSS.escape(tabName)}"]`);
      const heading = card.querySelector("h2")?.textContent?.trim() || "Settings";
      return {
        card,
        index,
        tabName,
        tabLabel: tabButton?.textContent?.trim() || tabName,
        heading,
        searchText: cardSearchText(card).toLowerCase()
      };
    });

  const render = () => {
    const query = String(input.value || "").trim().toLowerCase();
    if (!query) {
      host.hidden = true;
      host.innerHTML = "";
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const matches = cards.filter(item => terms.every(term => item.searchText.includes(term))).slice(0, 24);
    host.hidden = false;

    if (!matches.length) {
      host.innerHTML = `<div class="settings-search-empty">No settings matched “${escapeHtml(query)}”.</div>`;
      return;
    }

    host.innerHTML = matches.map(item => {
      const text = cardSearchText(item.card);
      const snippet = text.length > 150 ? `${text.slice(0, 150)}...` : text;
      return `
        <button type="button" class="settings-search-result" data-tab="${escapeHtml(item.tabName)}" data-card-index="${item.index}">
          <strong>${escapeHtml(item.tabLabel)} › ${escapeHtml(item.heading)}</strong>
          <small>${escapeHtml(snippet)}</small>
        </button>
      `;
    }).join("");

    host.querySelectorAll(".settings-search-result").forEach(button => {
      button.addEventListener("click", () => {
        const item = cards.find(candidate => candidate.index === Number(button.dataset.cardIndex));
        if (!item) return;
        setActiveTab(item.tabName);
        input.value = "";
        host.hidden = true;
        host.innerHTML = "";
        document.querySelectorAll(".card.ds-search-target").forEach(card => card.classList.remove("ds-search-target"));
        item.card.classList.add("ds-search-target");
        item.card.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => item.card.classList.remove("ds-search-target"), 1800);
      });
    });
  };

  input.addEventListener("input", render);
  input.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    input.value = "";
    host.hidden = true;
    host.innerHTML = "";
  });
}

function applyFeatureChangeBadges(lastSeenVersion) {
  document.querySelectorAll(".feature-badge").forEach(badge => badge.remove());
  const currentVersion = chrome.runtime.getManifest?.().version || "0";
  let visible = 0;

  Object.entries(FEATURE_CHANGE_MARKERS).forEach(([id, marker]) => {
    if (compareVersions(marker.version, currentVersion) > 0) return;
    if (lastSeenVersion && compareVersions(marker.version, lastSeenVersion) <= 0) return;

    const control = $(id);
    const label = control?.closest("label");
    const target = label?.querySelector("span") || label;
    if (!target) return;

    const badge = document.createElement("span");
    badge.className = "feature-badge";
    badge.textContent = marker.label || "New";
    badge.title = `${marker.label || "Changed"} in v${marker.version}`;
    target.appendChild(badge);
    visible += 1;
  });

  CARD_CHANGE_MARKERS.forEach(marker => {
    if (compareVersions(marker.version, currentVersion) > 0) return;
    if (lastSeenVersion && compareVersions(marker.version, lastSeenVersion) <= 0) return;
    const target = document.querySelector(marker.selector);
    if (!target) return;
    const badge = document.createElement("span");
    badge.className = "feature-badge";
    badge.textContent = marker.label || "New";
    badge.title = `${marker.label || "Changed"} in v${marker.version}`;
    target.appendChild(badge);
    visible += 1;
  });

  const summary = $("settingsUpdateSummary");
  if (summary) {
    summary.hidden = visible === 0;
    summary.textContent = visible
      ? `${visible} setting${visible === 1 ? " is" : "s are"} new or updated since the version you last reviewed.`
      : "";
  }

  const tabBadge = $("changelogUpdateBadge");
  if (tabBadge) {
    tabBadge.hidden = visible === 0;
    tabBadge.textContent = visible ? String(visible) : "";
    tabBadge.title = visible ? `${visible} new or updated setting${visible === 1 ? "" : "s"}` : "";
  }
}

function setPageSetting(id, value) {
  const el = $(id);
  if (!el) return;
  if (el.type === "checkbox" || el.type === "radio") el.checked = !!value;
  else el.value = value;
}

async function applyPreset(name) {
  const preset = PRESET_VALUES[name];
  if (!preset) return;

  OPTIONAL_FEATURE_KEYS.forEach(key => setPageSetting(key, false));
  Object.entries(preset).forEach(([key, value]) => setPageSetting(key, value));
  setPageSetting("enabled", true);

  // Keep safety/behavior sub-options sensible even though their parent features remain opt-in.
  setPageSetting("autoAfkProtectActive", true);
  setPageSetting("autoAfkResetOnActivate", true);
  setPageSetting("autoAfkChats", true);
  setPageSetting("quickPanelEnabledByDefaultInTab", true);
  setPageSetting("quickPanelAutoCollapseOverlap", true);

  await save();
  const status = $("presetStatus");
  if (status) status.textContent = name === "recommended" ? "Recommended setup applied and saved." : "Minimal setup applied and saved.";
}

async function disableOptionalFeatures() {
  OPTIONAL_FEATURE_KEYS.forEach(key => setPageSetting(key, false));
  setPageSetting("enabled", true);
  await save();
  const status = $("presetStatus");
  if (status) status.textContent = "Optional features turned off. Your saved lists and presets were kept.";
}

function setupPresets() {
  $("applyMinimalPreset")?.addEventListener("click", () => applyPreset("minimal"));
  $("applyRecommendedPreset")?.addEventListener("click", () => applyPreset("recommended"));
  $("disableOptionalFeatures")?.addEventListener("click", disableOptionalFeatures);
}

function oocNameFromText(text, index = 0) {
  const clean = String(text || "")
    .replace(/^\s*\[?OOC\s*:?\s*/i, "")
    .replace(/\]?\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean || clean === ":") return `OOC ${index + 1}`;
  return clean.length > 28 ? `${clean.slice(0, 28)}...` : clean;
}

function templatesToArray(raw) {
  return String(raw || "")
    .split(/\n\s*---\s*\n/g)
    .map(x => x.trim())
    .filter(Boolean);
}

function normalizeOocTemplates(input) {
  let items = [];

  if (Array.isArray(input)) {
    items = input;
  } else if (typeof input === "string" && input.trim()) {
    items = templatesToArray(input);
  }

  if (!items.length) {
    items = [{ name: "Strict no-control", text: DEFAULT_OOC_TEMPLATE }];
  }

  return items
    .map((item, index) => {
      if (typeof item === "string") {
        let text = item.trim();
        if (!text) return null;
        if (text === OLD_DEFAULT_OOC_TEMPLATE) text = DEFAULT_OOC_TEMPLATE;

        return {
          id: `ooc-${Date.now()}-${index}`,
          name: oocNameFromText(text, index),
          text
        };
      }

      if (!item || typeof item !== "object") return null;

      let text = String(item.text || item.body || item.value || "").trim();
      if (!text) return null;
      if (text === OLD_DEFAULT_OOC_TEMPLATE) text = DEFAULT_OOC_TEMPLATE;

      return {
        id: String(item.id || `ooc-${Date.now()}-${index}`),
        name: String(item.name || item.title || "").trim() || oocNameFromText(text, index),
        text
      };
    })
    .filter(Boolean);
}

function oocTemplatesFromPage() {
  const rows = [...document.querySelectorAll(".ooc-template-card")];

  return normalizeOocTemplates(
    rows.map((row, index) => ({
      id: row.dataset.oocId || `ooc-${Date.now()}-${index}`,
      name: row.querySelector(".ooc-template-name")?.value?.trim() || `OOC ${index + 1}`,
      text: row.querySelector(".ooc-template-text")?.value?.trim() || ""
    }))
  );
}

function renderOocTemplates(templates) {
  const host = $("oocTemplateList");
  if (!host) return;

  const normalized = normalizeOocTemplates(templates);

  host.innerHTML = normalized
    .map(template => `
      <div class="ooc-template-card" data-ooc-id="${escapeHtml(template.id)}">
        <div class="ooc-template-head">
          <label>
            Name
            <input class="ooc-template-name" type="text" value="${escapeHtml(template.name)}" placeholder="Example: Strict no-control">
          </label>
          <button class="ooc-template-remove" type="button" title="Remove this OOC">×</button>
        </div>
        <label>
          Text
          <textarea class="ooc-template-text" spellcheck="false" placeholder="[OOC: ...]">${escapeHtml(template.text)}</textarea>
        </label>
      </div>
    `)
    .join("");

  host.querySelectorAll(".ooc-template-remove").forEach(button => {
    button.addEventListener("click", () => {
      button.closest(".ooc-template-card")?.remove();

      if (!host.querySelector(".ooc-template-card")) {
        renderOocTemplates([{ name: "Blank OOC", text: "[OOC: ]" }]);
      }
    });
  });
}

function addOocTemplate() {
  const current = oocTemplatesFromPage();
  current.push({ id: `ooc-${Date.now()}`, name: `OOC ${current.length + 1}`, text: "[OOC: ]" });
  renderOocTemplates(current);
}


function normalizeBotEditorSnippets(input) {
  if (!Array.isArray(input)) return [];

  const seen = new Set();
  const snippets = [];

  input.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const name = String(item.name || item.title || `Snippet ${index + 1}`).trim();
    const text = String(item.text || item.value || "").trim();
    if (!name || !text) return;

    const key = `${name.toLowerCase()}\n${text}`;
    if (seen.has(key)) return;
    seen.add(key);

    snippets.push({
      id: String(item.id || `snippet-${Date.now()}-${index}`),
      name,
      text
    });
  });

  return snippets;
}

function rawBotEditorSnippetsFromPage() {
  return [...document.querySelectorAll(".bot-editor-snippet-card")].map((row, index) => ({
    id: row.dataset.snippetId || `snippet-${Date.now()}-${index}`,
    name: row.querySelector(".bot-editor-snippet-name")?.value || "",
    text: row.querySelector(".bot-editor-snippet-text")?.value || ""
  }));
}

function botEditorSnippetsFromPage() {
  return normalizeBotEditorSnippets(rawBotEditorSnippetsFromPage());
}

function snippetCardHtml(snippet) {
  return `
    <div class="bot-editor-snippet-card" data-snippet-id="${escapeHtml(snippet.id)}">
      <div class="ooc-template-head">
        <label>
          Button name
          <input class="bot-editor-snippet-name" type="text" value="${escapeHtml(snippet.name)}" placeholder="Example: Writing rule">
        </label>
        <button class="bot-editor-snippet-remove" type="button" title="Remove this snippet">×</button>
      </div>
      <label>
        Text to insert
        <textarea class="bot-editor-snippet-text" spellcheck="false" placeholder="Text inserted at the cursor">${escapeHtml(snippet.text)}</textarea>
      </label>
    </div>
  `;
}

function bindBotEditorSnippetRemoveButtons() {
  const host = $("botEditorSnippetList");
  if (!host) return;

  host.querySelectorAll(".bot-editor-snippet-remove").forEach(button => {
    if (button.dataset.bound === "1") return;
    button.dataset.bound = "1";
    button.addEventListener("click", () => {
      button.closest(".bot-editor-snippet-card")?.remove();
      if (!host.querySelector(".bot-editor-snippet-card")) {
        host.innerHTML = `<div class="bot-manager-empty">No custom snippets saved yet.</div>`;
      }
    });
  });
}

function renderBotEditorSnippets(input) {
  const host = $("botEditorSnippetList");
  if (!host) return;

  const snippets = normalizeBotEditorSnippets(input);
  if (!snippets.length) {
    host.innerHTML = `<div class="bot-manager-empty">No custom snippets saved yet.</div>`;
    return;
  }

  host.innerHTML = snippets.map(snippetCardHtml).join("");
  bindBotEditorSnippetRemoveButtons();
}

function addBotEditorSnippet() {
  const host = $("botEditorSnippetList");
  if (!host) return;

  host.querySelector(".bot-manager-empty")?.remove();
  const snippet = {
    id: `snippet-${Date.now()}`,
    name: `Snippet ${host.querySelectorAll(".bot-editor-snippet-card").length + 1}`,
    text: ""
  };
  host.insertAdjacentHTML("beforeend", snippetCardHtml(snippet));
  bindBotEditorSnippetRemoveButtons();
  host.lastElementChild?.querySelector(".bot-editor-snippet-name")?.focus();
}

function mergeBotEditorSnippetLists(...lists) {
  return normalizeBotEditorSnippets(lists.flatMap(list => Array.isArray(list) ? list : []));
}

function normalizeBotStore(store) {
  const raw = store && typeof store === "object" ? store : {};

  return {
    ids: uniqueClean(Array.isArray(raw.ids) ? raw.ids : []),
    names: uniqueClean(Array.isArray(raw.names) ? raw.names : []),
    meta: raw.meta && typeof raw.meta === "object" ? raw.meta : {}
  };
}

function normalizeCreatorHandle(value) {
  return String(value || "")
    .replace(/^https?:\/\/[^/]+\/creator\//i, "")
    .replace(/^\/creator\//i, "")
    .replace(/[?#].*$/g, "")
    .replace(/^@+/, "")
    .trim();
}

function normalizeCreatorStore(store) {
  const raw = store && typeof store === "object" ? store : {};
  return {
    handles: uniqueClean(Array.isArray(raw.handles) ? raw.handles.map(normalizeCreatorHandle) : []),
    meta: raw.meta && typeof raw.meta === "object" ? raw.meta : {}
  };
}

function creatorEntriesFromStore(store) {
  const normalized = normalizeCreatorStore(store);

  return normalized.handles.map(handle => {
    const item = normalized.meta?.[handle] || {};
    return {
      handle,
      name: item.name || `@${handle}`,
      url: item.url || `https://spicychat.ai/creator/${encodeURIComponent(handle)}`,
      savedAt: item.savedAt || 0
    };
  });
}

function renderFavoriteCreators() {
  const host = $("favoriteCreatorManager");
  const summary = $("favoriteCreatorManagerSummary");
  if (!host) return;

  const entries = creatorEntriesFromStore(favoriteCreatorState)
    .sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0));

  const limit = Math.max(20, Number(favoriteCreatorUiState.visible || 20));
  const shownEntries = favoriteCreatorUiState.collapsed
    ? entries.slice(0, limit)
    : entries;

  if (summary) {
    summary.textContent = entries.length
      ? `${entries.length} saved, showing ${shownEntries.length}`
      : "0 saved";
  }

  const showMore = $("favoriteCreatorShowMore");
  const showLess = $("favoriteCreatorShowLess");
  const collapse = $("favoriteCreatorCollapse");

  if (showMore) {
    showMore.style.display = entries.length > shownEntries.length ? "" : "none";
    showMore.textContent = `Show 20 more (${Math.max(0, entries.length - shownEntries.length)} left)`;
  }

  if (showLess) {
    showLess.style.display = shownEntries.length > 20 || !favoriteCreatorUiState.collapsed ? "" : "none";
  }

  if (collapse) {
    collapse.style.display = entries.length > 20 ? "" : "none";
    collapse.textContent = favoriteCreatorUiState.collapsed ? "Expand all" : "Collapse to 20";
  }

  if (!entries.length) {
    host.innerHTML = `<div class="bot-manager-empty">No favorite creators saved yet.</div>`;
    return;
  }

  host.innerHTML = shownEntries
    .map(entry => `
      <div class="bot-manager-card ds-creator-fav-row" data-handle="${escapeHtml(entry.handle)}">
        <div class="bot-manager-placeholder">★</div>
        <div class="bot-manager-main">
          <div class="bot-manager-title">${escapeHtml(entry.name)}</div>
          <div class="bot-manager-id">@${escapeHtml(entry.handle)}</div>
          <div class="bot-manager-actions">
            <a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer">Creator</a>
            <button type="button" class="favorite-creator-remove">Remove</button>
          </div>
        </div>
      </div>
    `)
    .join("");

  host.querySelectorAll(".favorite-creator-remove").forEach(button => {
    button.addEventListener("click", () => {
      const handle = button.closest(".ds-creator-fav-row")?.dataset.handle || "";
      const before = cloneJson(favoriteCreatorState);
      favoriteCreatorState.handles = favoriteCreatorState.handles.filter(item => item !== handle);
      delete favoriteCreatorState.meta[handle];
      markSavedStoreDirty("favoriteCreators");
      renderFavoriteCreators();
      showSettingsToast(`Removed @${handle || "creator"}.`, () => {
        favoriteCreatorState = normalizeCreatorStore(before);
        markSavedStoreDirty("favoriteCreators");
        renderFavoriteCreators();
      });
    });
  });
}

function addFavoriteCreator() {
  const handleInput = $("favoriteCreatorAddHandle");
  const nameInput = $("favoriteCreatorAddName");
  const handle = normalizeCreatorHandle(handleInput?.value || "");
  const name = String(nameInput?.value || "").trim() || (handle ? `@${handle}` : "");

  if (!handle) return;

  favoriteCreatorState = normalizeCreatorStore(favoriteCreatorState);
  if (!favoriteCreatorState.handles.includes(handle)) favoriteCreatorState.handles.push(handle);
  markSavedStoreDirty("favoriteCreators");
  favoriteCreatorState.meta[handle] = {
    ...(favoriteCreatorState.meta[handle] || {}),
    handle,
    name,
    url: `https://spicychat.ai/creator/${encodeURIComponent(handle)}`,
    savedAt: Date.now()
  };

  if (handleInput) handleInput.value = "";
  if (nameInput) nameInput.value = "";
  renderFavoriteCreators();
  renderBotManager("favorite");
  renderBotManager("later");
  renderBotManager("opened");
  loadChangelog();
}

function normalizeMetaStore(raw) {
  return raw && typeof raw === "object" ? { ...raw } : {};
}

function mergeMetaStores(...stores) {
  return stores.reduce((merged, store) => ({
    ...merged,
    ...normalizeMetaStore(store)
  }), {});
}

function mergeBotStores(...stores) {
  const normalized = stores.map(normalizeBotStore);

  return {
    ids: uniqueClean(normalized.flatMap(store => store.ids || [])),
    names: uniqueClean(normalized.flatMap(store => store.names || [])),
    meta: normalized.reduce((merged, store) => ({
      ...merged,
      ...(store.meta || {})
    }), {})
  };
}

function mergeCreatorStores(...stores) {
  const normalized = stores.map(normalizeCreatorStore);

  return {
    handles: uniqueClean(normalized.flatMap(store => store.handles || [])),
    meta: normalized.reduce((merged, store) => ({
      ...merged,
      ...(store.meta || {})
    }), {})
  };
}

function mergePersonas(...lists) {
  const seen = new Set();
  const merged = [];

  for (const list of lists) {
    if (!Array.isArray(list)) continue;

    for (const persona of list) {
      if (!persona || typeof persona !== "object") continue;

      const key = String(persona.id || persona.key || persona.name || JSON.stringify(persona)).trim();
      if (!key || seen.has(key)) continue;

      seen.add(key);
      merged.push(persona);
    }
  }

  return merged;
}

function mergeOocTemplateLists(...lists) {
  const seen = new Set();
  const merged = [];

  for (const list of lists) {
    for (const template of normalizeOocTemplates(list)) {
      const key = `${String(template.name || "").trim()}\n${String(template.text || "").trim()}`;
      if (seen.has(key)) continue;

      seen.add(key);
      merged.push(template);
    }
  }

  return normalizeOocTemplates(merged);
}

function normalizeGenerationProfiles(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([name, profile]) =>
      String(name || "").trim() && profile && typeof profile === "object" && !Array.isArray(profile)
    )
  );
}

function mergeGenerationProfiles(currentValue, importedValue) {
  const current = normalizeGenerationProfiles(currentValue);
  const imported = normalizeGenerationProfiles(importedValue);
  const merged = { ...current };

  for (const [originalName, profile] of Object.entries(imported)) {
    let name = originalName.trim();
    if (!merged[name]) {
      merged[name] = profile;
      continue;
    }

    if (JSON.stringify(merged[name]) === JSON.stringify(profile)) continue;

    const base = `${name} (imported)`;
    name = base;
    let number = 2;
    while (merged[name]) name = `${base} ${number++}`;
    merged[name] = profile;
  }

  return merged;
}

function mergeSettingsForImport(currentSettings, importedSettings) {
  const current = { ...DEFAULT_SETTINGS, ...(currentSettings || {}) };
  const imported = importedSettings && typeof importedSettings === "object" ? importedSettings : {};
  const next = { ...current, ...imported };

  [
    "includeTags",
    "excludeTags",
    "blockedTags",
    "blockedWords",
    "blockedCreators",
    "blockedBotIds",
    "blockedBotNames",
    "allowedLanguages"
  ].forEach(key => {
    next[key] = uniqueClean([
      ...(Array.isArray(current[key]) ? current[key] : []),
      ...(Array.isArray(imported[key]) ? imported[key] : [])
    ]);
  });

  next.oocTemplates = mergeOocTemplateLists(current.oocTemplates, imported.oocTemplates);
  next.botEditorSnippets = mergeBotEditorSnippetLists(current.botEditorSnippets, imported.botEditorSnippets);

  return next;
}

function openedStoreFromState() {
  return {
    ids: uniqueClean(currentOpened),
    meta: normalizeMetaStore(openedChatMetaState)
  };
}

function botEntriesFromStore(store, includeNames = true) {
  const entries = [];
  const seen = new Set();
  const meta = store.meta || {};

  (store.ids || []).forEach((id, index) => {
    const item = meta[id] || {};
    entries.push({
      type: "id",
      id,
      name: item.name || id,
      image: item.image || "",
      creator: item.creator || item.creatorName || item.creatorHandle || "",
      description: item.description || "",
      profileUrl: item.profileUrl || (id ? `https://spicychat.ai/chatbot/${id}` : ""),
      chatUrl: item.chatUrl || (id ? `https://spicychat.ai/chat/${id}` : ""),
      savedAt: Number(item.savedAt || 0) || 0,
      index
    });
    seen.add(`id:${id}`);
  });

  if (includeNames) {
    (store.names || []).forEach((name, index) => {
      if (seen.has(`name:${name.toLowerCase()}`)) return;
      const item = meta[`name:${name}`] || meta[name] || {};
      entries.push({
        type: "name",
        id: "",
        name,
        image: "",
        profileUrl: "",
        chatUrl: "",
        savedAt: Number(item.savedAt || 0) || 0,
        index: (store.ids || []).length + index
      });
    });
  }

  return entries;
}

function managerElementId(kind, suffix) {
  const prefixes = {
    blocked: "blockedBot",
    notInterested: "notInterestedBot",
    later: "laterBot",
    favorite: "favoriteBot",
    opened: "openedBot"
  };

  return `${prefixes[kind] || prefixes.notInterested}${suffix}`;
}

function storeForManagerKind(kind) {
  if (kind === "opened") return openedStoreFromState();
  if (kind === "later") return laterBotState;
  if (kind === "favorite") return favoriteBotState;
  if (kind === "blocked") return blockedState;
  return notInterestedState;
}

function updateBotManagerSummary(kind, total, filtered, shown) {
  const summary = $(managerElementId(kind, "ManagerSummary"));
  if (!summary) return;

  if (!total) {
    summary.textContent = "0 saved";
    return;
  }

  if (filtered !== total) {
    summary.textContent = `${filtered} match${filtered === 1 ? "" : "es"} of ${total}, showing ${shown}`;
  } else {
    summary.textContent = `${total} saved, showing ${shown}`;
  }
}

function getBotManagerSearch(kind) {
  const input = $(managerElementId(kind, "Search"));
  return String(input?.value || botManagerUiState[kind]?.query || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getBotSortMode(kind) {
  const settingKeys = {
    blocked: "blockedBotSortMode",
    later: "laterBotSortMode",
    favorite: "favoriteBotSortMode",
    opened: "openedBotSortMode"
  };
  const key = settingKeys[kind];
  if (!key) return "newest";

  const selected = value(key, DEFAULT_SETTINGS[key] || "newest");
  return ["newest", "oldest", "name-asc", "name-desc"].includes(selected)
    ? selected
    : "newest";
}

function sortBotManagerEntries(entries, kind) {
  if (!["blocked", "later", "favorite", "opened"].includes(kind)) return entries;

  const mode = getBotSortMode(kind);
  const copy = [...entries];
  const savedTime = entry => Number(entry.savedAt || 0) || 0;
  const originalIndex = entry => Number(entry.index || 0) || 0;
  const nameValue = entry => String(entry.name || entry.id || "").toLowerCase();

  if (mode === "oldest") {
    return copy.sort((a, b) => savedTime(a) - savedTime(b) || originalIndex(a) - originalIndex(b));
  }

  if (mode === "name-asc") {
    return copy.sort((a, b) => nameValue(a).localeCompare(nameValue(b)) || originalIndex(a) - originalIndex(b));
  }

  if (mode === "name-desc") {
    return copy.sort((a, b) => nameValue(b).localeCompare(nameValue(a)) || originalIndex(a) - originalIndex(b));
  }

  return copy.sort((a, b) => savedTime(b) - savedTime(a) || originalIndex(b) - originalIndex(a));
}

function getBotManagerEntries(kind) {
  const isBlocked = kind === "blocked";
  const entries = botEntriesFromStore(storeForManagerKind(kind), isBlocked);
  const query = getBotManagerSearch(kind);

  if (!query) return sortBotManagerEntries(entries, kind);

  return sortBotManagerEntries(entries.filter(entry => {
    const haystack = [
      entry.name,
      entry.id,
      entry.chatUrl,
      entry.profileUrl,
      entry.creator,
      entry.description,
      entry.type
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  }), kind);
}

function renderBotManager(kind) {
  const isBlocked = kind === "blocked";
  const host = $(managerElementId(kind, "Manager"));
  if (!host) return;

  const allEntries = botEntriesFromStore(storeForManagerKind(kind), isBlocked);
  const entries = getBotManagerEntries(kind);
  const ui = botManagerUiState[kind] || { visible: 20, collapsed: true, query: "" };
  const hasSearch = !!getBotManagerSearch(kind);

  let limit = Number(ui.visible || 20);
  if (!Number.isFinite(limit) || limit < 1) limit = 20;

  const shownEntries = ui.collapsed && !hasSearch
    ? entries.slice(0, limit)
    : entries;

  updateBotManagerSummary(kind, allEntries.length, entries.length, shownEntries.length);

  const showMore = $(managerElementId(kind, "ShowMore"));
  const showLess = $(managerElementId(kind, "ShowLess"));
  const collapse = $(managerElementId(kind, "Collapse"));

  if (showMore) {
    showMore.style.display = entries.length > shownEntries.length ? "" : "none";
    showMore.textContent = `Show 20 more (${Math.max(0, entries.length - shownEntries.length)} left)`;
  }

  if (showLess) {
    showLess.style.display = shownEntries.length > 20 || !ui.collapsed ? "" : "none";
  }

  if (collapse) {
    collapse.style.display = entries.length > 20 ? "" : "none";
    collapse.textContent = ui.collapsed && !hasSearch ? "Expand all" : "Collapse to 20";
  }

  if (!allEntries.length) {
    host.innerHTML = `<div class="bot-manager-empty">Nothing saved here yet.</div>`;
    return;
  }

  if (!entries.length) {
    host.innerHTML = `<div class="bot-manager-empty">No matches for that search.</div>`;
    return;
  }

  host.innerHTML = shownEntries
    .map(entry => `
      <div class="bot-manager-card" data-kind="${kind}" data-type="${entry.type}" data-id="${escapeHtml(entry.id)}" data-name="${escapeHtml(entry.name)}">
        ${entry.image
          ? `<img class="bot-manager-image" src="${escapeHtml(entry.image)}" alt="">`
          : `<div class="bot-manager-placeholder">?</div>`}
        <div class="bot-manager-main">
          <div class="bot-manager-title">${escapeHtml(entry.name || entry.id || "Unknown bot")}</div>
          ${entry.creator ? `<div class="bot-manager-creator">${escapeHtml(entry.creator)}</div>` : ""}
          <div class="bot-manager-id">${escapeHtml(entry.id || "name-only block")}</div>
          ${kind === "favorite" ? `<div class="bot-manager-creator">Saved in favorite history${entry.savedAt ? ` · ${escapeHtml(new Date(entry.savedAt).toLocaleString())}` : ""}</div>` : ""}
          ${entry.description ? `<div class="bot-manager-description">${escapeHtml(entry.description)}</div>` : ""}
          <div class="bot-manager-actions">
            ${entry.chatUrl ? `<a href="${escapeHtml(entry.chatUrl)}" target="_blank" rel="noopener noreferrer">Open chat</a>` : ""}
            ${entry.profileUrl ? `<a href="${escapeHtml(entry.profileUrl)}" target="_blank" rel="noopener noreferrer">Open profile</a>` : ""}
            <button type="button" class="bot-manager-remove">Remove</button>
          </div>
        </div>
      </div>
    `)
    .join("");

  host.querySelectorAll(".bot-manager-remove").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".bot-manager-card");
      const id = card?.dataset.id || "";
      const name = card?.dataset.name || "";
      const type = card?.dataset.type || "id";
      const before = kind === "opened"
        ? { ids: [...currentOpened], meta: cloneJson(openedChatMetaState) }
        : cloneJson(storeForManagerKind(kind));

      if (kind === "blocked") {
        if (type === "id") {
          blockedState.ids = blockedState.ids.filter(x => x !== id);
          delete blockedState.meta[id];
        } else {
          blockedState.names = blockedState.names.filter(x => x !== name);
          delete blockedState.meta[`name:${name}`];
          delete blockedState.meta[name];
        }
      } else if (kind === "later") {
        laterBotState.ids = laterBotState.ids.filter(x => x !== id);
        delete laterBotState.meta[id];
      } else if (kind === "favorite") {
        favoriteBotState.ids = favoriteBotState.ids.filter(x => x !== id);
        delete favoriteBotState.meta[id];
      } else if (kind === "opened") {
        currentOpened = currentOpened.filter(x => x !== id);
        delete openedChatMetaState[id];
      } else {
        notInterestedState.ids = notInterestedState.ids.filter(x => x !== id);
        delete notInterestedState.meta[id];
      }

      markSavedStoreDirty(kind);
      renderBotManager(kind);
      showSettingsToast(`Removed ${name || id || "saved item"}.`, () => {
        if (kind === "blocked") blockedState = normalizeBotStore(before);
        else if (kind === "later") laterBotState = normalizeBotStore(before);
        else if (kind === "favorite") favoriteBotState = normalizeBotStore(before);
        else if (kind === "opened") {
          currentOpened = uniqueClean(before.ids || []);
          openedChatMetaState = normalizeMetaStore(before.meta);
        } else notInterestedState = normalizeBotStore(before);
        markSavedStoreDirty(kind);
        renderBotManager(kind);
      });
    });
  });
}

function addManagedBot(kind) {
  const isBlocked = kind === "blocked";
  const idInput = $(isBlocked ? "blockedAddId" : "notInterestedAddId");
  const nameInput = $(isBlocked ? "blockedAddName" : "notInterestedAddName");
  const id = String(idInput?.value || "").trim();
  const name = String(nameInput?.value || "").trim();

  if (!id && !name) return;

  const store = isBlocked ? blockedState : notInterestedState;
  store.ids = store.ids || [];
  store.names = store.names || [];
  store.meta = store.meta || {};

  if (id && !store.ids.includes(id)) store.ids.push(id);

  if (isBlocked && name && !store.names.includes(name)) {
    store.names.push(name);
    store.meta[`name:${name}`] = {
      ...(store.meta[`name:${name}`] || {}),
      name,
      savedAt: Date.now()
    };
  }

  if (id) {
    store.meta[id] = {
      ...(store.meta[id] || {}),
      id,
      name: name || store.meta[id]?.name || id,
      chatUrl: `https://spicychat.ai/chat/${id}`,
      profileUrl: `https://spicychat.ai/chatbot/${id}`,
      savedAt: Date.now()
    };
  }

  if (idInput) idInput.value = "";
  if (nameInput) nameInput.value = "";
  markSavedStoreDirty(kind);
  renderBotManager(kind);
}


function previewClamp(number, min, max) {
  return Math.max(min, Math.min(max, Number(number) || 0));
}

function setPreviewShown(id, shown) {
  const el = $(id);
  if (!el) return;
  el.hidden = !shown;
  el.style.display = shown ? "" : "none";
}

function previewComposerTop(preview) {
  const composer = preview?.querySelector(".mini-panel-preview-composer");
  if (!preview || !composer || composer.hidden || getComputedStyle(composer).display === "none") {
    return preview?.clientHeight || 430;
  }

  const previewRect = preview.getBoundingClientRect();
  const composerRect = composer.getBoundingClientRect();
  if (!composerRect.width || !composerRect.height) return preview.clientHeight || 430;
  return composerRect.top - previewRect.top;
}

function previewPanelBounds(preview, panel) {
  const margin = 12;
  const maxX = Math.max(margin, preview.clientWidth - panel.offsetWidth - margin);
  const composerTop = previewComposerTop(preview);
  const maxY = Math.max(
    margin,
    Math.min(
      preview.clientHeight - panel.offsetHeight - margin,
      composerTop - panel.offsetHeight - margin
    )
  );

  return { margin, maxX, maxY };
}

function positionMiniPanelPreview() {
  const preview = $("miniPanelPreview");
  const panel = $("miniPanelPreviewPanel");
  if (!preview || !panel) return;

  const placement = value("quickPanelPlacement", "bottom-right");
  const mode = value("miniPanelPreviewMode", "chat");
  const composer = preview.querySelector(".mini-panel-preview-composer");
  const composerHeight = mode === "chat" ? (composer?.offsetHeight || 42) : 0;
  const margin = 12;

  panel.style.left = "auto";
  panel.style.right = "auto";
  panel.style.top = "auto";
  panel.style.bottom = "auto";

  if (placement === "custom") {
    const { maxX, maxY } = previewPanelBounds(preview, panel);
    const xPercent = previewClamp(value("quickPanelCustomXPercent", "70"), 0, 100);
    const yPercent = previewClamp(value("quickPanelCustomYPercent", "12"), 0, 100);
    panel.style.left = `${(maxX * xPercent) / 100}px`;
    panel.style.top = `${(maxY * yPercent) / 100}px`;
    return;
  }

  if (placement === "sidebar-below-blocked-creators") {
    panel.style.left = `${margin}px`;
    panel.style.top = "64px";
    return;
  }

  if (placement.includes("right")) panel.style.right = `${margin}px`;
  if (placement.includes("left")) panel.style.left = `${margin}px`;
  if (placement.includes("top")) panel.style.top = "58px";
  if (placement.includes("bottom")) panel.style.bottom = `${composerHeight + 26}px`;
}

function renderMiniPanelPreview() {
  const preview = $("miniPanelPreview");
  const panel = $("miniPanelPreviewPanel");
  const body = $("miniPanelPreviewBody");
  if (!preview || !panel || !body) return;

  const mode = value("miniPanelPreviewMode", "chat");
  const width = previewClamp(value("quickPanelWidth", "280"), 200, 440);
  const scale = previewClamp(value("quickPanelUiScale", "100"), 80, 125) / 100;
  const maxHeight = previewClamp(value("quickPanelMaxHeightPercent", "80"), 25, 95);

  const maxVisualHeight = Math.max(150, (preview.clientHeight * maxHeight) / 100);
  panel.style.width = `${Math.min(width, Math.max(200, preview.clientWidth - 24))}px`;
  panel.style.setProperty("--preview-scale", String(scale));
  panel.style.maxHeight = `${maxVisualHeight}px`;
  body.style.maxHeight = `${Math.max(90, maxVisualHeight - 42)}px`;

  setPreviewShown("miniPanelPreviewChatScene", mode === "chat");
  setPreviewShown("miniPanelPreviewChatsScene", mode === "chats");
  setPreviewShown("miniPanelPreviewListingScene", mode === "listing");

  const previewStatus = $("miniPanelPreviewStatus");
  const previewStatusParts = [];

  if (checked("quickPanelStatusShowOpened", true)) {
    previewStatusParts.push("350 opened stored");
  }

  if (checked("quickPanelStatusShowBlocked", true)) {
    previewStatusParts.push("25 blocked");
  }

  if (mode === "chat") previewStatusParts.push("3 personas saved");
  if (mode === "chats") previewStatusParts.push("20 chats visible");
  if (mode === "listing") previewStatusParts.push("50 visible", "12 hidden");

  if (previewStatus) {
    previewStatus.textContent = `${previewStatusParts.join(". ")}.`;
  }

  setPreviewShown("miniPanelPreviewStatus", checked("quickPanelShowStatus", true));
  setPreviewShown("miniPanelPreviewOptions", checked("quickPanelShowOptions", true));
  setPreviewShown("miniPanelPreviewFill", mode === "listing" && checked("quickPanelShowFillNow", true));
  setPreviewShown("miniPanelPreviewSearch", mode === "chats" && checked("quickPanelShowChatSearch", true));
  setPreviewShown("miniPanelPreviewSort", mode === "chats" && checked("quickPanelShowChatSort", true));
  setPreviewShown("miniPanelPreviewScan", mode === "chats" && checked("quickPanelShowScanVisible", true));
  setPreviewShown("miniPanelPreviewLoad", mode === "chats" && checked("quickPanelShowLoadAll", true));
  setPreviewShown(
    "miniPanelPreviewChatButtons",
    mode === "chats" && (checked("quickPanelShowScanVisible", true) || checked("quickPanelShowLoadAll", true))
  );
  setPreviewShown("miniPanelPreviewOoc", mode === "chat" && checked("quickPanelShowOoc", true));
  setPreviewShown("miniPanelPreviewAutoVoice", mode === "chat" && checked("quickPanelShowAutoVoice", true));
  setPreviewShown("miniPanelPreviewAutoAsterisk", mode === "chat" && checked("quickPanelShowAutoAsterisk", true));
  const autoAsteriskPreview = $("miniPanelPreviewAutoAsterisk");
  if (autoAsteriskPreview) autoAsteriskPreview.textContent = checked("autoPairAsterisks") ? "Auto *: On" : "Auto *: Off";
  setPreviewShown("miniPanelPreviewPersona", mode === "chat" && checked("quickPanelShowPersona", true));
  setPreviewShown("miniPanelPreviewExport", mode === "chat" && checked("quickPanelShowExport", true));

  if (!panel.dataset.previewManuallyToggled) {
    panel.classList.toggle("closed", checked("quickPanelDefaultClosed"));
  }

  const toggle = $("miniPanelPreviewToggle");
  if (toggle) toggle.textContent = panel.classList.contains("closed") ? "+" : "-";

  requestAnimationFrame(positionMiniPanelPreview);
}

function setupMiniPanelPreview() {
  const preview = $("miniPanelPreview");
  const panel = $("miniPanelPreviewPanel");
  const head = panel?.querySelector(".mini-panel-preview-head");
  const toggle = $("miniPanelPreviewToggle");
  if (!preview || !panel || !head) return;

  const watched = [
    "quickPanelPlacement",
    "quickPanelDefaultClosed",
    "quickPanelWidth",
    "quickPanelUiScale",
    "quickPanelMaxHeightPercent",
    "quickPanelShowStatus",
    "quickPanelStatusShowOpened",
    "quickPanelStatusShowBlocked",
    "quickPanelShowOptions",
    "quickPanelShowFillNow",
    "quickPanelShowChatSearch",
    "quickPanelShowChatSort",
    "quickPanelShowScanVisible",
    "quickPanelShowLoadAll",
    "quickPanelShowOoc",
    "quickPanelShowAutoVoice",
    "quickPanelShowAutoAsterisk",
    "autoPairAsterisks",
    "quickPanelShowPersona",
    "quickPanelShowExport",
    "miniPanelPreviewMode"
  ];

  watched.forEach(id => {
    $(id)?.addEventListener("input", renderMiniPanelPreview);
    $(id)?.addEventListener("change", renderMiniPanelPreview);
  });

  toggle?.addEventListener("click", event => {
    event.stopPropagation();
    panel.dataset.previewManuallyToggled = "1";
    panel.classList.toggle("closed");
    renderMiniPanelPreview();
  });

  let dragging = null;

  head.addEventListener("pointerdown", event => {
    if (event.button !== 0 || event.target.closest("button")) return;

    const panelRect = panel.getBoundingClientRect();
    dragging = {
      offsetX: event.clientX - panelRect.left,
      offsetY: event.clientY - panelRect.top
    };
    head.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  head.addEventListener("pointermove", event => {
    if (!dragging) return;

    const previewRect = preview.getBoundingClientRect();
    const { margin, maxX, maxY } = previewPanelBounds(preview, panel);
    const x = previewClamp(event.clientX - previewRect.left - dragging.offsetX, margin, maxX);
    const y = previewClamp(event.clientY - previewRect.top - dragging.offsetY, margin, maxY);

    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";

    setValue("quickPanelPlacement", "custom");
    setValue("quickPanelCustomXPercent", maxX > 0 ? String((x / maxX) * 100) : "0");
    setValue("quickPanelCustomYPercent", maxY > 0 ? String((y / maxY) * 100) : "0");
    event.preventDefault();
  });

  const stop = event => {
    if (!dragging) return;
    dragging = null;
    try { head.releasePointerCapture?.(event.pointerId); } catch {}
    renderMiniPanelPreview();
  };

  head.addEventListener("pointerup", stop);
  head.addEventListener("pointercancel", stop);
  window.addEventListener("resize", renderMiniPanelPreview);
  renderMiniPanelPreview();
}

async function dismissFirstRunNotice() {
  const version = chrome.runtime.getManifest?.().version || "";
  await storageSet({
    [RELEASE_NOTICE_KEY]: null,
    ...(version ? { [LAST_SEEN_VERSION_KEY]: version } : {})
  });
  const notice = $("firstRunNotice");
  if (notice) notice.hidden = true;
}

function showFirstRunNoticeIfNeeded(releaseNotice) {
  const notice = $("firstRunNotice");
  if (!notice) return;
  notice.hidden = releaseNotice?.reason !== "install";
}

async function load() {
  setVersionText();

  const result = await storageGet([
    "settings",
    OPENED_KEY,
    OPENED_META_KEY,
    BLOCKED_BOTS_KEY,
    NOT_INTERESTED_KEY,
    PERSONAS_KEY,
    LEGACY_PERSONAS_KEY,
    OOC_TEMPLATES_KEY,
    FAVORITE_CREATORS_KEY,
    FAVORITE_BOTS_KEY,
    LATER_BOTS_KEY,
    GENERATION_PROFILES_KEY,
    AUTO_AFK_STATUS_KEY,
    SAI_TOOLKIT_PRESENCE_KEY,
    LAST_SEEN_VERSION_KEY,
    RELEASE_NOTICE_KEY,
    "generationMetadataDefaultsMigrationV01841"
  ]);

  const rawSettings = result.settings || {};
  const settings = { ...DEFAULT_SETTINGS, ...rawSettings };
  showFirstRunNoticeIfNeeded(result[RELEASE_NOTICE_KEY]);
  const migrationPayload = {};
  let shouldSaveMigratedSettings = false;

  if (result.generationMetadataDefaultsMigrationV01841 !== true) {
    if (!settings.showGenerationMetadata) {
      settings.showMessageTimestamps = false;
      settings.messageTimestamp24Hour = false;
      settings.messageTimestampDateFirst = false;
      settings.messageTimestampShowSeconds = false;
      settings.showGenerationModel = false;
      settings.showGenerationElapsed = false;
      settings.showGenerationSettings = false;
      settings.compactGenerationMetadata = false;
      shouldSaveMigratedSettings = true;
    }
    migrationPayload.generationMetadataDefaultsMigrationV01841 = true;
  }

  if (shouldSaveMigratedSettings || Object.keys(migrationPayload).length) {
    await storageSet({
      ...(shouldSaveMigratedSettings ? { settings } : {}),
      ...migrationPayload
    });
  }
  settings.oocTemplates = normalizeOocTemplates(
    Array.isArray(result[OOC_TEMPLATES_KEY]) ? result[OOC_TEMPLATES_KEY] : settings.oocTemplates
  );

  currentOpened = Array.isArray(result[OPENED_KEY]) ? result[OPENED_KEY] : [];
  openedChatMetaState = normalizeMetaStore(result[OPENED_META_KEY]);

  currentPersonas = uniqueClean([
    ...(Array.isArray(result[PERSONAS_KEY]) ? result[PERSONAS_KEY].map(p => p?.name || p?.id || "") : []),
    ...(Array.isArray(result[LEGACY_PERSONAS_KEY]) ? result[LEGACY_PERSONAS_KEY].map(p => p?.name || p?.id || "") : [])
  ]);

  blockedState = normalizeBotStore(result[BLOCKED_BOTS_KEY]);
  blockedState.ids = uniqueClean([...(settings.blockedBotIds || []), ...blockedState.ids]);
  blockedState.names = uniqueClean([...(settings.blockedBotNames || []), ...blockedState.names]);

  notInterestedState = normalizeBotStore(result[NOT_INTERESTED_KEY]);
  favoriteCreatorState = normalizeCreatorStore(result[FAVORITE_CREATORS_KEY]);
  favoriteBotState = normalizeBotStore(result[FAVORITE_BOTS_KEY]);
  laterBotState = normalizeBotStore(result[LATER_BOTS_KEY]);

  setChecked("enabled", settings.enabled);
  setChecked("saiToolkitCompatibility", !!settings.saiToolkitCompatibility);
  setValue("globalNsfwMode", settings.globalNsfwMode || "ignore");

  const saiStatus = $("saiToolkitStatus");
  if (saiStatus) {
    const presence = result[SAI_TOOLKIT_PRESENCE_KEY];
    if (presence?.detected && presence.detectedAt) {
      const when = new Date(Number(presence.detectedAt));
      saiStatus.textContent = `S.AI Toolkit detected on SpicyChat (${when.toLocaleString()}).`;
    } else {
      saiStatus.textContent = "S.AI Toolkit has not been detected on a SpicyChat page yet.";
    }
  }

  setChecked("autoTags", settings.autoTags);
  setChecked("showTagTemplateButton", !!settings.showTagTemplateButton);
  setChecked("showChatTagLinks", !!settings.showChatTagLinks);
  setChecked("showChatTagAddButtons", !!settings.showChatTagAddButtons);
  setChecked("botEditorShowCharButton", !!settings.botEditorShowCharButton);
  setChecked("botEditorShowUserButton", !!settings.botEditorShowUserButton);
  setChecked("botEditorShowContinueButton", !!settings.botEditorShowContinueButton);
  setChecked("botEditorShowNoControlButton", !!settings.botEditorShowNoControlButton);
  setChecked("botEditorShowCustomSnippets", !!settings.botEditorShowCustomSnippets);
  setChecked("botEditorAutoOpenAdvanced", !!settings.botEditorAutoOpenAdvanced);
  setChecked("lorebookAutoStartNew", !!settings.lorebookAutoStartNew);
  setChecked("showLorebookEntryExpandButtons", !!settings.showLorebookEntryExpandButtons);
  setValue("botEditorDefaultVisibility", ["public", "unlisted"].includes(settings.botEditorDefaultVisibility) ? settings.botEditorDefaultVisibility : "ignore");
  setChecked("autoAgreeCreationGuidelines", !!settings.autoAgreeCreationGuidelines);
  renderBotEditorSnippets(settings.botEditorSnippets);
  setChecked("enableGenerationProfiles", !!settings.enableGenerationProfiles);
  setChecked("showGenerationMetadata", !!settings.showGenerationMetadata);
  setChecked("showMessageTimestamps", !!settings.showMessageTimestamps);
  setChecked("messageTimestamp24Hour", !!settings.messageTimestamp24Hour);
  setChecked("messageTimestampDateFirst", !!settings.messageTimestampDateFirst);
  setChecked("messageTimestampShowSeconds", !!settings.messageTimestampShowSeconds);
  setChecked("showGenerationModel", !!settings.showGenerationModel);
  setChecked("showGenerationElapsed", !!settings.showGenerationElapsed);
  setChecked("showGenerationSettings", !!settings.showGenerationSettings);
  setChecked("compactGenerationMetadata", !!settings.compactGenerationMetadata);
  if ($("generationProfileCount")) {
    const profileCount = result[GENERATION_PROFILES_KEY] && typeof result[GENERATION_PROFILES_KEY] === "object"
      ? Object.keys(result[GENERATION_PROFILES_KEY]).length
      : 0;
    $("generationProfileCount").textContent = `${profileCount} saved`;
  }
  setValue("includeTags", arrayToLines(settings.includeTags));
  setValue("excludeTags", arrayToLines(settings.excludeTags));

  setChecked("autoAfkEnabled", !!settings.autoAfkEnabled);
  setValue("autoAfkHours", Math.min(720, Math.max(1, Number(settings.autoAfkHours) || 12)));
  setChecked("autoAfkChats", settings.autoAfkChats !== false);
  setChecked("autoAfkHome", !!settings.autoAfkHome);
  setChecked("autoAfkProfiles", !!settings.autoAfkProfiles);
  setChecked("autoAfkActionDiscard", (settings.autoAfkAction || "discard") !== "close");
  setChecked("autoAfkActionClose", (settings.autoAfkAction || "discard") === "close");
  setChecked("autoAfkProtectActive", settings.autoAfkProtectActive !== false);
  setChecked("autoAfkResetOnActivate", settings.autoAfkResetOnActivate !== false);
  renderAutoAfkStatus(result[AUTO_AFK_STATUS_KEY]);

  setChecked("hidePremium", settings.hidePremium);
  setChecked("hideFloatingPremiumPopups", settings.hideFloatingPremiumPopups);
  setChecked("hideAdvertBanners", !!settings.hideAdvertBanners);
  setChecked("expandModelSelectorDescriptions", !!settings.expandModelSelectorDescriptions);
  setChecked("hideModelUpgradeButtons", !!settings.hideModelUpgradeButtons);
  setChecked("hideNotifications", settings.hideNotifications);
  setChecked("hideTabNotificationBadge", !!settings.hideTabNotificationBadge);
  setChecked("autoReadNotifications", settings.autoReadNotifications);

  setChecked("hideTopBarLanguage", settings.hideTopBarLanguage);
  setChecked("hideTopBarNotifications", settings.hideTopBarNotifications);
  setChecked("hideTopBarTheme", settings.hideTopBarTheme);
  setValue("topBarProfilePillMode", settings.topBarProfilePillMode || "normal");
  setValue("topBarProfilePillCustomText", settings.topBarProfilePillCustomText || "");
  setChecked("topBarProfilePillPersonaPrefix", !!settings.topBarProfilePillPersonaPrefix);

  setChecked("showChatTopBarTools", !!settings.showChatTopBarTools);
  setChecked("chatTopBarInlineCreator", !!settings.chatTopBarInlineCreator);
  setChecked("chatTopBarAddLaterButton", !!settings.chatTopBarAddLaterButton);
  setChecked("closeChatTabAfterSavingLater", !!settings.closeChatTabAfterSavingLater);
  setChecked("showPerCharacterChatHistory", !!settings.showPerCharacterChatHistory);
  setChecked("showQuickNewChatButton", !!settings.showQuickNewChatButton);
  setChecked("hideChatTopBarRatingButton", !!settings.hideChatTopBarRatingButton);
  setChecked("hideChatTopBarModelButton", !!settings.hideChatTopBarModelButton);
  setChecked("hideChatTopBarContextDot", !!settings.hideChatTopBarContextDot);
  setChecked("hideChatDropdownVoiceUpsell", !!settings.hideChatDropdownVoiceUpsell);
  setChecked("hideChatDropdownMemoryItem", !!settings.hideChatDropdownMemoryItem);
  setChecked("enableBulkMemoryManager", !!settings.enableBulkMemoryManager);

  setChecked("showChatListTools", settings.showChatListTools);
  setChecked("showSavedChatQuickActions", !!settings.showSavedChatQuickActions);
  setValue("chatListSortMode", settings.chatListSortMode === "messages-desc" ? "default" : (settings.chatListSortMode || "default"));

  setChecked("trackOpenedChats", settings.trackOpenedChats);
  setChecked("importOpenedFromChatsPage", settings.importOpenedFromChatsPage);
  setChecked("hideOpenedChats", settings.hideOpenedChats);
  setValue("openedBotSortMode", settings.openedBotSortMode || "newest");
  setChecked("showQuickPanel", settings.showQuickPanel);
  setValue("quickPanelPlacement", settings.quickPanelPlacement === "chat-header" ? "bottom-right" : (settings.quickPanelPlacement || "bottom-right"));
  setChecked("quickPanelDraggable", !!settings.quickPanelDraggable);
  setChecked("quickPanelDefaultClosed", !!settings.quickPanelDefaultClosed);
  setChecked("quickPanelEnabledByDefaultInTab", settings.quickPanelEnabledByDefaultInTab !== false);
  setValue("quickPanelWidth", Math.min(440, Math.max(200, Number(settings.quickPanelWidth) || 280)));
  setValue("quickPanelUiScale", Math.min(125, Math.max(80, Number(settings.quickPanelUiScale) || 100)));
  setValue("quickPanelMaxHeightPercent", Math.min(95, Math.max(25, Number(settings.quickPanelMaxHeightPercent) || 80)));
  setValue("quickPanelCustomXPercent", Math.min(100, Math.max(0, Number.isFinite(Number(settings.quickPanelCustomXPercent)) ? Number(settings.quickPanelCustomXPercent) : 70)));
  setValue("quickPanelCustomYPercent", Math.min(100, Math.max(0, Number.isFinite(Number(settings.quickPanelCustomYPercent)) ? Number(settings.quickPanelCustomYPercent) : 12)));
  setChecked("quickPanelAutoCollapseOverlap", settings.quickPanelAutoCollapseOverlap !== false);
  setChecked("quickPanelShowStatus", settings.quickPanelShowStatus !== false);
  setChecked("quickPanelStatusShowOpened", settings.quickPanelStatusShowOpened !== false);
  setChecked("quickPanelStatusShowBlocked", settings.quickPanelStatusShowBlocked !== false);
  setChecked("popupShowOpenedCount", !!settings.popupShowOpenedCount);
  setChecked("popupShowBlockedCount", !!settings.popupShowBlockedCount);
  setChecked("popupShowStorageDetails", !!settings.popupShowStorageDetails);
  setChecked("quickPanelShowFeatureSummary", !!settings.quickPanelShowFeatureSummary);
  setChecked("quickPanelShowOptions", settings.quickPanelShowOptions !== false);
  setChecked("quickPanelShowFillNow", settings.quickPanelShowFillNow !== false);
  setChecked("quickPanelShowChatSearch", settings.quickPanelShowChatSearch !== false);
  setChecked("quickPanelShowChatSort", settings.quickPanelShowChatSort !== false);
  setChecked("quickPanelShowScanVisible", settings.quickPanelShowScanVisible !== false);
  setChecked("quickPanelShowLoadAll", settings.quickPanelShowLoadAll !== false);
  setChecked("quickPanelShowOoc", settings.quickPanelShowOoc !== false);
  setChecked("quickPanelShowAutoVoice", settings.quickPanelShowAutoVoice !== false);
  setChecked("quickPanelShowAutoAsterisk", settings.quickPanelShowAutoAsterisk !== false);
  setChecked("quickPanelShowPersona", settings.quickPanelShowPersona !== false);
  setChecked("quickPanelShowExport", settings.quickPanelShowExport !== false);
  setChecked("compactAfterHiding", settings.compactAfterHiding);
  setChecked("neverHideFavorites", !!settings.neverHideFavorites);
  setChecked("protectFavoritesFromBlocking", !!settings.protectFavoritesFromBlocking);
  setChecked("showCreatorFavoriteButtons", !!settings.showCreatorFavoriteButtons);
  setChecked("protectFavoriteCreatorsFromFiltering", !!settings.protectFavoriteCreatorsFromFiltering);
  setChecked("trackFavoriteBots", !!settings.trackFavoriteBots);
  setValue("favoriteBotSortMode", settings.favoriteBotSortMode || "newest");
  setChecked("showLaterBotButtons", !!settings.showLaterBotButtons);
  setChecked("protectLaterBotsFromFiltering", !!settings.protectLaterBotsFromFiltering);
  setChecked("hideLaterBotsFromListings", !!settings.hideLaterBotsFromListings);
  setValue("laterBotSortMode", settings.laterBotSortMode || "newest");

  setChecked("hideHomeForYouCards", settings.hideHomeForYouCards);
  setChecked("expandLongCardDescriptions", settings.expandLongCardDescriptions);

  setChecked("autoFillListings", settings.autoFillListings);
  setValue("autoFillTargetCards", String(settings.autoFillTargetCards || 50));
  setValue("autoFillMaxClicks", String(settings.autoFillMaxClicks || 8));

  setChecked("hideChatPlusButton", settings.hideChatPlusButton);
  setChecked("hideChatImageButton", settings.hideChatImageButton);
  setChecked("replaceChatImageWithOocButton", !!settings.replaceChatImageWithOocButton);
  setChecked("showAsteriskButton", !!settings.showAsteriskButton);
  setChecked("autoPairAsterisks", !!settings.autoPairAsterisks);
  setChecked("hideChatVoiceButton", settings.hideChatVoiceButton);
  setChecked("hideUnlockCustomVoices", settings.hideUnlockCustomVoices);

  setChecked("showMessageQuickActions", !!settings.showMessageQuickActions);
  setChecked("hideOriginalMessageDropdown", !!settings.hideOriginalMessageDropdown);
  setChecked("messageQuickActionCopy", !!settings.messageQuickActionCopy);
  setChecked("messageQuickActionEdit", !!settings.messageQuickActionEdit);
  setChecked("messageQuickActionReport", !!settings.messageQuickActionReport);
  setChecked("allowTypingWhileAiResponding", !!settings.allowTypingWhileAiResponding);
  setChecked("keepChatPositionWhileTyping", !!settings.keepChatPositionWhileTyping);
  setChecked("showScrollToTopButton", !!settings.showScrollToTopButton);
  setChecked("showScrollToBottomButton", !!settings.showScrollToBottomButton);
  setChecked("protectDraftDuringMessageRemoval", !!settings.protectDraftDuringMessageRemoval);
  setChecked("failedMessageHelper", !!settings.failedMessageHelper);
  setChecked("chatPerformanceMode", !!settings.chatPerformanceMode);
  setChecked("pauseQolInHiddenTabs", !!settings.pauseQolInHiddenTabs);

  setChecked("showChatExportButton", settings.showChatExportButton);
  setChecked("chatExportLoadPreviousMessages", !!settings.chatExportLoadPreviousMessages);
  setChecked("chatExportIncludeBotInfo", !!settings.chatExportIncludeBotInfo);
  setChecked("chatExportIncludeOocDirectives", !!settings.chatExportIncludeOocDirectives);
  setChecked("showOocTools", settings.showOocTools);
  renderOocTemplates(settings.oocTemplates);

  setChecked("savePersonasFromPages", settings.savePersonasFromPages);
  setChecked("expandPersonaDescriptions", !!settings.expandPersonaDescriptions);
  setChecked("showPersonaQuickSwitch", !!settings.showPersonaQuickSwitch);
  setChecked("autoAcceptPersonaChange", settings.autoAcceptPersonaChange);
  setValue("personaQuickSwitchLimit", String(settings.personaQuickSwitchLimit || 6));

  for (const key of Object.keys(DEFAULT_SETTINGS).filter(key => key.startsWith("hideSidebar"))) {
    setChecked(key, settings[key]);
  }

  setChecked("blockCards", settings.blockCards);
  setChecked("hideGroupChats", settings.hideGroupChats);
  setChecked("replaceCardProfileWithBlockButton", settings.replaceCardProfileWithBlockButton);
  setChecked("enableLanguageFilter", settings.enableLanguageFilter);
  setAllowedLanguages(settings.allowedLanguages);
  setValue("languageFilterMode", settings.languageFilterMode || "conservative");
  setChecked("textNormalizationEnabled", !!settings.textNormalizationEnabled);
  setChecked("normalizeFancyUnicode", !!settings.normalizeFancyUnicode);
  setChecked("normalizePunctuation", !!settings.normalizePunctuation);
  setChecked("normalizeInvisibleCharacters", !!settings.normalizeInvisibleCharacters);
  setChecked("normalizeDecorativeSymbols", settings.normalizeDecorativeSymbols);
  updateTextNormalizationPreview();
  setValue("blockedTags", arrayToLines(settings.blockedTags));
  setValue("blockedWords", arrayToLines(settings.blockedWords));
  setValue("blockedCreators", arrayToLines(settings.blockedCreators));
  setValue("blockedBotSortMode", settings.blockedBotSortMode || "newest");
  setValue("hiddenCardMode", settings.hiddenCardMode || "hide");

  setChecked("debug", settings.debug);

  if ($("openedCount")) $("openedCount").textContent = `${currentOpened.length} stored`;
  if ($("personaCount")) $("personaCount").textContent = `${currentPersonas.length} stored`;

  optionsDataLoaded = true;
  const activeTab = document.querySelector(".tab-button.active")?.dataset.tab || "general";
  renderHeavyManagersForTab(activeTab);
  loadChangelog();
  renderMiniPanelPreview();
  applyFeatureChangeBadges(String(result[LAST_SEEN_VERSION_KEY] || ""));
  refreshStorageUsage().catch(() => {});

  dirtySavedStores.clear();
}

function readSettingsFromPage() {
  const oocTemplates = oocTemplatesFromPage();

  return {
    enabled: checked("enabled"),
    saiToolkitCompatibility: checked("saiToolkitCompatibility", false),
    globalNsfwMode: value("globalNsfwMode", "ignore"),

    autoAfkEnabled: checked("autoAfkEnabled"),
    autoAfkHours: Math.min(720, Math.max(1, Number(value("autoAfkHours", "12")) || 12)),
    autoAfkChats: checked("autoAfkChats", true),
    autoAfkHome: checked("autoAfkHome"),
    autoAfkProfiles: checked("autoAfkProfiles"),
    autoAfkAction: $("autoAfkActionClose")?.checked ? "close" : "discard",
    autoAfkProtectActive: checked("autoAfkProtectActive", true),
    autoAfkResetOnActivate: checked("autoAfkResetOnActivate", true),

    autoTags: checked("autoTags"),
    showTagTemplateButton: checked("showTagTemplateButton"),
    showChatTagLinks: checked("showChatTagLinks"),
    showChatTagAddButtons: checked("showChatTagAddButtons"),
    botEditorShowCharButton: checked("botEditorShowCharButton"),
    botEditorShowUserButton: checked("botEditorShowUserButton"),
    botEditorShowContinueButton: checked("botEditorShowContinueButton"),
    botEditorShowNoControlButton: checked("botEditorShowNoControlButton"),
    botEditorShowCustomSnippets: checked("botEditorShowCustomSnippets"),
    botEditorAutoOpenAdvanced: checked("botEditorAutoOpenAdvanced"),
    lorebookAutoStartNew: checked("lorebookAutoStartNew"),
    showLorebookEntryExpandButtons: checked("showLorebookEntryExpandButtons"),
    botEditorDefaultVisibility: ["public", "unlisted"].includes(value("botEditorDefaultVisibility")) ? value("botEditorDefaultVisibility") : "ignore",
    autoAgreeCreationGuidelines: checked("autoAgreeCreationGuidelines"),
    botEditorSnippets: botEditorSnippetsFromPage(),
    enableGenerationProfiles: checked("enableGenerationProfiles"),
    showGenerationMetadata: checked("showGenerationMetadata"),
    showMessageTimestamps: checked("showMessageTimestamps"),
    messageTimestamp24Hour: checked("messageTimestamp24Hour"),
    messageTimestampDateFirst: checked("messageTimestampDateFirst"),
    messageTimestampShowSeconds: checked("messageTimestampShowSeconds"),
    showGenerationModel: checked("showGenerationModel"),
    showGenerationElapsed: checked("showGenerationElapsed"),
    showGenerationSettings: checked("showGenerationSettings"),
    compactGenerationMetadata: checked("compactGenerationMetadata"),
    includeTags: linesToArray(value("includeTags")),
    excludeTags: linesToArray(value("excludeTags")),

    hidePremium: checked("hidePremium"),
    hideFloatingPremiumPopups: checked("hideFloatingPremiumPopups"),
    hideAdvertBanners: checked("hideAdvertBanners"),
    expandModelSelectorDescriptions: checked("expandModelSelectorDescriptions"),
    hideModelUpgradeButtons: checked("hideModelUpgradeButtons"),
    hideNotifications: checked("hideNotifications"),
    hideTabNotificationBadge: checked("hideTabNotificationBadge"),
    autoReadNotifications: checked("autoReadNotifications"),

    hideTopBarLanguage: checked("hideTopBarLanguage"),
    hideTopBarNotifications: checked("hideTopBarNotifications"),
    hideTopBarTheme: checked("hideTopBarTheme"),
    topBarProfilePillMode: value("topBarProfilePillMode", "normal"),
    topBarProfilePillCustomText: value("topBarProfilePillCustomText", ""),
    topBarProfilePillPersonaPrefix: checked("topBarProfilePillPersonaPrefix"),

    showChatTopBarTools: checked("showChatTopBarTools"),
    chatTopBarInlineCreator: checked("chatTopBarInlineCreator"),
    chatTopBarAddLaterButton: checked("chatTopBarAddLaterButton"),
    closeChatTabAfterSavingLater: checked("closeChatTabAfterSavingLater"),
    showPerCharacterChatHistory: checked("showPerCharacterChatHistory"),
    showQuickNewChatButton: checked("showQuickNewChatButton"),
    hideChatTopBarRatingButton: checked("hideChatTopBarRatingButton"),
    hideChatTopBarModelButton: checked("hideChatTopBarModelButton"),
    hideChatTopBarContextDot: checked("hideChatTopBarContextDot"),
    hideChatDropdownVoiceUpsell: checked("hideChatDropdownVoiceUpsell"),
    hideChatDropdownMemoryItem: checked("hideChatDropdownMemoryItem"),
    enableBulkMemoryManager: checked("enableBulkMemoryManager"),

    showChatListTools: checked("showChatListTools"),
    showSavedChatQuickActions: checked("showSavedChatQuickActions"),
    chatListSortMode: value("chatListSortMode", "default") === "messages-desc" ? "default" : value("chatListSortMode", "default"),
    chatListSearchMode: "all",

    trackOpenedChats: checked("trackOpenedChats"),
    importOpenedFromChatsPage: checked("importOpenedFromChatsPage"),
    hideOpenedChats: checked("hideOpenedChats"),
    openedBotSortMode: value("openedBotSortMode", "newest"),
    showQuickPanel: checked("showQuickPanel"),
    quickPanelPlacement: value("quickPanelPlacement", "bottom-right") || "bottom-right",
    quickPanelDraggable: checked("quickPanelDraggable"),
    quickPanelDefaultClosed: checked("quickPanelDefaultClosed"),
    quickPanelEnabledByDefaultInTab: checked("quickPanelEnabledByDefaultInTab", true),
    quickPanelWidth: Math.min(440, Math.max(200, Number(value("quickPanelWidth", "280")) || 280)),
    quickPanelUiScale: Math.min(125, Math.max(80, Number(value("quickPanelUiScale", "100")) || 100)),
    quickPanelMaxHeightPercent: Math.min(95, Math.max(25, Number(value("quickPanelMaxHeightPercent", "80")) || 80)),
    quickPanelCustomXPercent: Math.min(100, Math.max(0, Number.isFinite(Number(value("quickPanelCustomXPercent", "70"))) ? Number(value("quickPanelCustomXPercent", "70")) : 70)),
    quickPanelCustomYPercent: Math.min(100, Math.max(0, Number.isFinite(Number(value("quickPanelCustomYPercent", "12"))) ? Number(value("quickPanelCustomYPercent", "12")) : 12)),
    quickPanelAutoCollapseOverlap: checked("quickPanelAutoCollapseOverlap", true),
    quickPanelShowStatus: checked("quickPanelShowStatus", true),
    quickPanelStatusShowOpened: checked("quickPanelStatusShowOpened", true),
    quickPanelStatusShowBlocked: checked("quickPanelStatusShowBlocked", true),
    popupShowOpenedCount: checked("popupShowOpenedCount", false),
    popupShowBlockedCount: checked("popupShowBlockedCount", false),
    popupShowStorageDetails: checked("popupShowStorageDetails"),
    quickPanelShowFeatureSummary: checked("quickPanelShowFeatureSummary"),
    quickPanelShowOptions: checked("quickPanelShowOptions", true),
    quickPanelShowFillNow: checked("quickPanelShowFillNow", true),
    quickPanelShowChatSearch: checked("quickPanelShowChatSearch", true),
    quickPanelShowChatSort: checked("quickPanelShowChatSort", true),
    quickPanelShowScanVisible: checked("quickPanelShowScanVisible", true),
    quickPanelShowLoadAll: checked("quickPanelShowLoadAll", true),
    quickPanelShowOoc: checked("quickPanelShowOoc", true),
    quickPanelShowAutoVoice: checked("quickPanelShowAutoVoice", true),
    quickPanelShowAutoAsterisk: checked("quickPanelShowAutoAsterisk", true),
    quickPanelShowPersona: checked("quickPanelShowPersona", true),
    quickPanelShowExport: checked("quickPanelShowExport", true),
    compactAfterHiding: checked("compactAfterHiding"),
    neverHideFavorites: checked("neverHideFavorites"),
    protectFavoritesFromBlocking: checked("protectFavoritesFromBlocking"),
    showCreatorFavoriteButtons: checked("showCreatorFavoriteButtons"),
    protectFavoriteCreatorsFromFiltering: checked("protectFavoriteCreatorsFromFiltering"),
    trackFavoriteBots: checked("trackFavoriteBots"),
    favoriteBotSortMode: value("favoriteBotSortMode", "newest"),
    showLaterBotButtons: checked("showLaterBotButtons"),
    protectLaterBotsFromFiltering: checked("protectLaterBotsFromFiltering"),
    hideLaterBotsFromListings: checked("hideLaterBotsFromListings"),
    laterBotSortMode: value("laterBotSortMode", "newest"),

    autoFillListings: checked("autoFillListings"),
    autoFillTargetCards: Math.max(1, Math.min(200, Number(value("autoFillTargetCards", "50")) || 50)),
    autoFillMaxClicks: Math.max(1, Math.min(30, Number(value("autoFillMaxClicks", "8")) || 8)),

    hideChatPlusButton: checked("hideChatPlusButton"),
    hideChatImageButton: checked("hideChatImageButton"),
    replaceChatImageWithOocButton: checked("replaceChatImageWithOocButton"),
    showAsteriskButton: checked("showAsteriskButton"),
    autoPairAsterisks: checked("autoPairAsterisks"),
    hideChatVoiceButton: checked("hideChatVoiceButton"),
    hideUnlockCustomVoices: checked("hideUnlockCustomVoices"),

    showMessageQuickActions: checked("showMessageQuickActions"),
    hideOriginalMessageDropdown: checked("hideOriginalMessageDropdown"),
    messageQuickActionCopy: checked("messageQuickActionCopy"),
    messageQuickActionEdit: checked("messageQuickActionEdit"),
    messageQuickActionReport: checked("messageQuickActionReport"),
    allowTypingWhileAiResponding: checked("allowTypingWhileAiResponding"),
    keepChatPositionWhileTyping: checked("keepChatPositionWhileTyping"),
    showScrollToTopButton: checked("showScrollToTopButton"),
    showScrollToBottomButton: checked("showScrollToBottomButton"),
    protectDraftDuringMessageRemoval: checked("protectDraftDuringMessageRemoval"),
    failedMessageHelper: checked("failedMessageHelper"),
    chatPerformanceMode: checked("chatPerformanceMode"),
    pauseQolInHiddenTabs: checked("pauseQolInHiddenTabs"),

    showChatExportButton: checked("showChatExportButton"),
    chatExportLoadPreviousMessages: checked("chatExportLoadPreviousMessages"),
    chatExportIncludeBotInfo: checked("chatExportIncludeBotInfo"),
    chatExportIncludeOocDirectives: checked("chatExportIncludeOocDirectives"),
    showOocTools: checked("showOocTools"),
    oocTemplates,

    savePersonasFromPages: checked("savePersonasFromPages"),
    expandPersonaDescriptions: checked("expandPersonaDescriptions"),
    showPersonaQuickSwitch: checked("showPersonaQuickSwitch"),
    autoAcceptPersonaChange: checked("autoAcceptPersonaChange"),
    personaQuickSwitchLimit: Math.max(1, Math.min(12, Number(value("personaQuickSwitchLimit", "6")) || 6)),

    hideSidebarLogo: checked("hideSidebarLogo"),
    hideSidebarHome: checked("hideSidebarHome"),
    hideSidebarChats: checked("hideSidebarChats"),
    hideSidebarPersonas: checked("hideSidebarPersonas"),
    hideSidebarCreateMenu: checked("hideSidebarCreateMenu"),
    hideSidebarCreateChatbot: checked("hideSidebarCreateChatbot"),
    hideSidebarCreateLorebook: checked("hideSidebarCreateLorebook"),
    hideSidebarCreateGroup: checked("hideSidebarCreateGroup"),
    hideSidebarCreateVoice: checked("hideSidebarCreateVoice"),
    hideSidebarMyCreationsMenu: checked("hideSidebarMyCreationsMenu"),
    hideSidebarMyChatbots: checked("hideSidebarMyChatbots"),
    hideSidebarMyLorebooks: checked("hideSidebarMyLorebooks"),
    hideSidebarMyGroups: checked("hideSidebarMyGroups"),
    hideSidebarMyVoices: checked("hideSidebarMyVoices"),
    hideSidebarFavorites: checked("hideSidebarFavorites"),
    hideSidebarRecommendations: checked("hideSidebarRecommendations"),
    hideSidebarLeaderboard: checked("hideSidebarLeaderboard"),
    hideSidebarBlockedCreators: checked("hideSidebarBlockedCreators"),
    hideSidebarSubscribe: checked("hideSidebarSubscribe"),
    hideSidebarHelp: checked("hideSidebarHelp"),
    hideSidebarSocialLinks: checked("hideSidebarSocialLinks"),
    hideSidebarFooterLinks: checked("hideSidebarFooterLinks"),
    hideSidebarAppDownload: checked("hideSidebarAppDownload"),
    hideSidebarWebVersion: checked("hideSidebarWebVersion"),
    hideSidebarSignOut: checked("hideSidebarSignOut"),

    blockCards: checked("blockCards"),
    hideHomeForYouCards: checked("hideHomeForYouCards"),
    expandLongCardDescriptions: checked("expandLongCardDescriptions"),
    hideGroupChats: checked("hideGroupChats"),
    replaceCardProfileWithBlockButton: checked("replaceCardProfileWithBlockButton"),
    enableLanguageFilter: checked("enableLanguageFilter"),
    allowedLanguages: getAllowedLanguages(),
    languageFilterMode: "conservative",
    ...readTextNormalizationSettingsFromPage(),
    blockedTags: linesToArray(value("blockedTags")),
    blockedWords: linesToArray(value("blockedWords")),
    blockedCreators: linesToArray(value("blockedCreators")),
    blockedBotIds: uniqueClean(blockedState.ids),
    blockedBotNames: uniqueClean(blockedState.names),
    blockedBotSortMode: getBotSortMode("blocked"),
    hiddenCardMode: value("hiddenCardMode", "hide"),

    autoLoadAllOpenedChats: false,
    deepImportMaxPages: 80,
    showBlockCurrentBotButton: false,
    debug: checked("debug")
  };
}

async function save() {
  const settings = readSettingsFromPage();
  const payload = {
    settings,
    [OOC_TEMPLATES_KEY]: settings.oocTemplates
  };

  // Large saved lists can contain thousands of entries. Older builds rewrote
  // every list and metadata map on every Settings save, even when the user
  // only changed one checkbox. Only write managers that were actually edited.
  if (dirtySavedStores.has("blocked")) payload[BLOCKED_BOTS_KEY] = blockedState;
  if (dirtySavedStores.has("notInterested")) payload[NOT_INTERESTED_KEY] = notInterestedState;
  if (dirtySavedStores.has("favoriteCreators")) payload[FAVORITE_CREATORS_KEY] = normalizeCreatorStore(favoriteCreatorState);
  if (dirtySavedStores.has("favorite")) payload[FAVORITE_BOTS_KEY] = normalizeBotStore(favoriteBotState);
  if (dirtySavedStores.has("later")) payload[LATER_BOTS_KEY] = normalizeBotStore(laterBotState);
  if (dirtySavedStores.has("opened")) {
    payload[OPENED_KEY] = uniqueClean(currentOpened);
    payload[OPENED_META_KEY] = normalizeMetaStore(openedChatMetaState);
  }

  const status = $("status");
  if (status) status.textContent = "Saving...";

  await storageSet(payload);
  dirtySavedStores.clear();

  if (status) {
    status.textContent = "Saved.";
    setTimeout(() => { status.textContent = ""; }, 1200);
  }
}

async function clearOpened() {
  const current = await storageGet([OPENED_KEY, OPENED_META_KEY]);
  const opened = Array.isArray(current[OPENED_KEY]) ? current[OPENED_KEY] : [];
  if (!opened.length) {
    showSettingsToast("There are no opened chats to clear.");
    return;
  }
  if (!confirm(`Clear ${opened.length} opened chat${opened.length === 1 ? "" : "s"}? You can undo it for a few seconds.`)) return;

  const backup = {
    [OPENED_KEY]: [...opened],
    [OPENED_META_KEY]: normalizeMetaStore(current[OPENED_META_KEY])
  };
  await storageSet({ [OPENED_KEY]: [], [OPENED_META_KEY]: {} });
  await load();
  showSettingsToast(`Cleared ${opened.length} opened chat${opened.length === 1 ? "" : "s"}.`, async () => {
    await storageSet(backup);
    await load();
  });
}

function buildExportPayload(scope, result) {
  const settings = { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
  const payload = {};

  if (scope === "all" || scope === "settings") {
    payload.settings = settings;
    payload.generationProfiles = normalizeGenerationProfiles(result[GENERATION_PROFILES_KEY]);
  }
  if (scope === "all" || scope === "opened") {
    payload.openedChats = Array.isArray(result[OPENED_KEY]) ? result[OPENED_KEY] : [];
    payload.openedChatMeta = result[OPENED_META_KEY] || {};
  }
  if (scope === "all" || scope === "blocked") payload.blockedBots = result[BLOCKED_BOTS_KEY] || { ids: [], names: [], meta: {} };
  if (scope === "all" || scope === "notInterested") payload.notInterestedBots = result[NOT_INTERESTED_KEY] || { ids: [], meta: {} };
  if (scope === "all" || scope === "favoriteCreators") payload.favoriteCreators = result[FAVORITE_CREATORS_KEY] || { handles: [], meta: {} };
  if (scope === "all" || scope === "favoriteBots") payload.favoriteBots = result[FAVORITE_BOTS_KEY] || { ids: [], meta: {} };
  if (scope === "all" || scope === "laterBots") payload.laterBots = result[LATER_BOTS_KEY] || { ids: [], meta: {} };
  if (scope === "all" || scope === "personas") {
    payload.personas = Array.isArray(result[PERSONAS_KEY])
      ? result[PERSONAS_KEY]
      : (Array.isArray(result[LEGACY_PERSONAS_KEY]) ? result[LEGACY_PERSONAS_KEY] : []);
  }
  if (scope === "all" || scope === "ooc") payload.oocTemplates = normalizeOocTemplates(result[OOC_TEMPLATES_KEY] || settings.oocTemplates);

  return payload;
}

async function exportSettings() {
  const result = await storageGet([
    "settings",
    OPENED_KEY,
    OPENED_META_KEY,
    BLOCKED_BOTS_KEY,
    NOT_INTERESTED_KEY,
    PERSONAS_KEY,
    LEGACY_PERSONAS_KEY,
    OOC_TEMPLATES_KEY,
    FAVORITE_CREATORS_KEY,
    FAVORITE_BOTS_KEY,
    LATER_BOTS_KEY,
    GENERATION_PROFILES_KEY
  ]);

  const scope = value("exportScope", "all");
  $("settingsJson").value = JSON.stringify(buildExportPayload(scope, result), null, 2);
}

function replaceSettingsForImport(importedSettings) {
  const imported = importedSettings && typeof importedSettings === "object" ? importedSettings : {};
  const next = { ...DEFAULT_SETTINGS, ...imported };

  [
    "includeTags",
    "excludeTags",
    "blockedTags",
    "blockedWords",
    "blockedCreators",
    "blockedBotIds",
    "blockedBotNames",
    "allowedLanguages"
  ].forEach(key => {
    next[key] = uniqueClean(Array.isArray(imported[key]) ? imported[key] : DEFAULT_SETTINGS[key]);
  });

  next.oocTemplates = Array.isArray(imported.oocTemplates)
    ? normalizeOocTemplates(imported.oocTemplates)
    : normalizeOocTemplates(DEFAULT_SETTINGS.oocTemplates);
  next.botEditorSnippets = Array.isArray(imported.botEditorSnippets)
    ? normalizeBotEditorSnippets(imported.botEditorSnippets)
    : [];

  return next;
}

function importCategoryCounts(parsed) {
  const counts = [];
  const source = parsed && typeof parsed === "object" ? parsed : {};
  const settingsLike = source.settings || (
    !source.openedChats &&
    !source.blockedBots &&
    !source.notInterestedBots &&
    !source.favoriteCreators &&
    !source.favoriteBots &&
    !source.laterBots &&
    !source.personas &&
    !source.oocTemplates &&
    !source.generationProfiles
  );

  if (settingsLike) {
    const settings = source.settings || source;
    counts.push(["Settings", Object.keys(settings || {}).length]);
  }
  if (Array.isArray(source.openedChats)) counts.push(["Opened chats", source.openedChats.length]);
  if (source.blockedBots && typeof source.blockedBots === "object") {
    counts.push(["Blocked bots", uniqueClean([...(source.blockedBots.ids || []), ...(source.blockedBots.names || [])]).length]);
  }
  if (source.notInterestedBots && typeof source.notInterestedBots === "object") counts.push(["Not interested", uniqueClean(source.notInterestedBots.ids || []).length]);
  if (source.favoriteCreators && typeof source.favoriteCreators === "object") counts.push(["Favorite creators", uniqueClean(source.favoriteCreators.handles || []).length]);
  if (source.favoriteBots && typeof source.favoriteBots === "object") counts.push(["Favorite bots", uniqueClean(source.favoriteBots.ids || []).length]);
  if (source.laterBots && typeof source.laterBots === "object") counts.push(["Later bots", uniqueClean(source.laterBots.ids || []).length]);
  if (Array.isArray(source.personas)) counts.push(["Personas", source.personas.length]);
  if (Array.isArray(source.oocTemplates)) counts.push(["OOC presets", source.oocTemplates.length]);
  if (source.generationProfiles && typeof source.generationProfiles === "object") counts.push(["Generation profiles", Object.keys(source.generationProfiles).length]);
  return counts;
}

function previewImportSettings() {
  const preview = $("importPreview");
  const summary = $("importPreviewSummary");
  const countsHost = $("importPreviewCounts");

  try {
    const parsed = JSON.parse(value("settingsJson"));
    const counts = importCategoryCounts(parsed);
    if (!counts.length) throw new Error("Nothing importable found");

    pendingImportPayload = parsed;
    if (preview) preview.hidden = false;
    if (summary) summary.textContent = `${counts.length} categor${counts.length === 1 ? "y" : "ies"} found. Nothing changes until you press Import now.`;
    if (countsHost) {
      countsHost.innerHTML = counts
        .map(([name, count]) => `<span>${escapeHtml(name)}: ${Number(count) || 0}</span>`)
        .join("");
    }
  } catch {
    pendingImportPayload = null;
    if (preview) preview.hidden = true;
    const status = $("status");
    if (status) status.textContent = "Import preview failed: that does not look like a valid QoL backup.";
  }
}

function cancelImportPreview() {
  pendingImportPayload = null;
  const preview = $("importPreview");
  if (preview) preview.hidden = true;
}

async function importSettings() {
  try {
    const parsed = pendingImportPayload || JSON.parse(value("settingsJson"));
    const mode = document.querySelector("input[name='importMode']:checked")?.value === "replace" ? "replace" : "merge";
    const current = await storageGet([
      "settings",
      OPENED_KEY,
      OPENED_META_KEY,
      BLOCKED_BOTS_KEY,
      NOT_INTERESTED_KEY,
      PERSONAS_KEY,
      LEGACY_PERSONAS_KEY,
      OOC_TEMPLATES_KEY,
      FAVORITE_CREATORS_KEY,
      FAVORITE_BOTS_KEY,
      LATER_BOTS_KEY,
      GENERATION_PROFILES_KEY
    ]);

    const payload = {};
    const parsedLooksLikeSettings =
      parsed.settings ||
      (!parsed.openedChats &&
        !parsed.blockedBots &&
        !parsed.notInterestedBots &&
        !parsed.favoriteCreators &&
        !parsed.favoriteBots &&
        !parsed.laterBots &&
        !parsed.personas &&
        !parsed.oocTemplates &&
        !parsed.generationProfiles);

    if (parsedLooksLikeSettings) {
      payload.settings = mode === "replace"
        ? replaceSettingsForImport(parsed.settings || parsed)
        : mergeSettingsForImport(current.settings, parsed.settings || parsed);
    }

    if (Array.isArray(parsed.openedChats)) {
      payload[OPENED_KEY] = mode === "replace"
        ? uniqueClean(parsed.openedChats)
        : uniqueClean([...(Array.isArray(current[OPENED_KEY]) ? current[OPENED_KEY] : []), ...parsed.openedChats]);
    }

    if (parsed.openedChatMeta && typeof parsed.openedChatMeta === "object") {
      payload[OPENED_META_KEY] = mode === "replace"
        ? normalizeMetaStore(parsed.openedChatMeta)
        : mergeMetaStores(current[OPENED_META_KEY], parsed.openedChatMeta);
    }

    if (parsed.blockedBots && typeof parsed.blockedBots === "object") {
      payload[BLOCKED_BOTS_KEY] = mode === "replace"
        ? normalizeBotStore(parsed.blockedBots)
        : mergeBotStores(current[BLOCKED_BOTS_KEY], parsed.blockedBots);
    }

    if (parsed.notInterestedBots && typeof parsed.notInterestedBots === "object") {
      payload[NOT_INTERESTED_KEY] = mode === "replace"
        ? normalizeBotStore(parsed.notInterestedBots)
        : mergeBotStores(current[NOT_INTERESTED_KEY], parsed.notInterestedBots);
    }

    if (parsed.favoriteCreators && typeof parsed.favoriteCreators === "object") {
      payload[FAVORITE_CREATORS_KEY] = mode === "replace"
        ? normalizeCreatorStore(parsed.favoriteCreators)
        : mergeCreatorStores(current[FAVORITE_CREATORS_KEY], parsed.favoriteCreators);
    }

    if (parsed.favoriteBots && typeof parsed.favoriteBots === "object") {
      payload[FAVORITE_BOTS_KEY] = mode === "replace"
        ? normalizeBotStore(parsed.favoriteBots)
        : mergeBotStores(current[FAVORITE_BOTS_KEY], parsed.favoriteBots);
    }

    if (parsed.laterBots && typeof parsed.laterBots === "object") {
      payload[LATER_BOTS_KEY] = mode === "replace"
        ? normalizeBotStore(parsed.laterBots)
        : mergeBotStores(current[LATER_BOTS_KEY], parsed.laterBots);
    }

    if (Array.isArray(parsed.personas)) {
      payload[PERSONAS_KEY] = mode === "replace"
        ? mergePersonas([], parsed.personas)
        : mergePersonas(
            Array.isArray(current[PERSONAS_KEY])
              ? current[PERSONAS_KEY]
              : (Array.isArray(current[LEGACY_PERSONAS_KEY]) ? current[LEGACY_PERSONAS_KEY] : []),
            parsed.personas
          );
    }

    if (Array.isArray(parsed.oocTemplates)) {
      payload[OOC_TEMPLATES_KEY] = mode === "replace"
        ? normalizeOocTemplates(parsed.oocTemplates)
        : mergeOocTemplateLists(current[OOC_TEMPLATES_KEY], parsed.oocTemplates);
    }

    if (parsed.generationProfiles && typeof parsed.generationProfiles === "object") {
      payload[GENERATION_PROFILES_KEY] = mode === "replace"
        ? normalizeGenerationProfiles(parsed.generationProfiles)
        : mergeGenerationProfiles(current[GENERATION_PROFILES_KEY], parsed.generationProfiles);
    }

    if (!Object.keys(payload).length) throw new Error("Nothing importable found");

    await storageSet(payload);
    pendingImportPayload = null;
    cancelImportPreview();
    await load();

    const status = $("status");
    if (status) {
      status.textContent = mode === "replace" ? "Imported. Included categories were replaced." : "Imported and merged.";
      setTimeout(() => { status.textContent = ""; }, 2200);
    }
  } catch {
    const status = $("status");
    if (status) status.textContent = "Import failed: the backup could not be read.";
  }
}

function countStoreItems(value, kind = "bot") {
  if (kind === "opened") return Array.isArray(value) ? value.length : 0;
  if (kind === "creator") return uniqueClean(value?.handles || []).length;
  if (kind === "persona") return Array.isArray(value) ? value.length : 0;
  if (kind === "ooc") return Array.isArray(value) ? value.length : 0;
  if (kind === "profiles") return value && typeof value === "object" ? Object.keys(value).length : 0;
  return uniqueClean([...(value?.ids || []), ...(value?.names || [])]).length;
}

async function refreshStorageUsage() {
  const host = $("storageUsage");
  if (!host) return;

  const result = await storageGet([
    OPENED_KEY,
    BLOCKED_BOTS_KEY,
    NOT_INTERESTED_KEY,
    FAVORITE_CREATORS_KEY,
    FAVORITE_BOTS_KEY,
    LATER_BOTS_KEY,
    PERSONAS_KEY,
    LEGACY_PERSONAS_KEY,
    OOC_TEMPLATES_KEY,
    GENERATION_PROFILES_KEY
  ]);
  const bytes = await storageBytesInUse(null);
  const personas = Array.isArray(result[PERSONAS_KEY]) ? result[PERSONAS_KEY] : result[LEGACY_PERSONAS_KEY];
  const chips = [
    ["Opened", countStoreItems(result[OPENED_KEY], "opened")],
    ["Blocked", countStoreItems(result[BLOCKED_BOTS_KEY])],
    ["Not interested", countStoreItems(result[NOT_INTERESTED_KEY])],
    ["Favorite bots", countStoreItems(result[FAVORITE_BOTS_KEY])],
    ["Favorite creators", countStoreItems(result[FAVORITE_CREATORS_KEY], "creator")],
    ["Later", countStoreItems(result[LATER_BOTS_KEY])],
    ["Personas", countStoreItems(personas, "persona")],
    ["OOC presets", countStoreItems(result[OOC_TEMPLATES_KEY], "ooc")],
    ["Generation profiles", countStoreItems(result[GENERATION_PROFILES_KEY], "profiles")]
  ];
  if (Number.isFinite(bytes)) chips.unshift(["Storage", `${Math.max(0, bytes / 1024).toFixed(bytes >= 10240 ? 0 : 1)} KB`]);

  host.innerHTML = chips.map(([name, count]) => `<span class="storage-chip">${escapeHtml(name)}: ${escapeHtml(String(count))}</span>`).join("");
}

function pruneMeta(meta, allowedKeys) {
  const raw = meta && typeof meta === "object" ? meta : {};
  const allowed = new Set(allowedKeys.filter(Boolean));
  return Object.fromEntries(Object.entries(raw).filter(([key]) => allowed.has(key)));
}

function cleanedBotStore(raw, { keepNames = false } = {}) {
  const store = normalizeBotStore(raw);
  const ids = uniqueClean(store.ids);
  const names = keepNames ? uniqueClean(store.names) : [];
  const allowedMeta = [
    ...ids,
    ...names,
    ...names.map(name => `name:${name}`)
  ];
  return { ids, ...(keepNames ? { names } : {}), meta: pruneMeta(store.meta, allowedMeta) };
}

async function cleanLocalData() {
  const status = $("cleanupStatus");
  if (status) status.textContent = "Cleaning...";

  const result = await storageGet([
    "settings",
    OPENED_KEY,
    OPENED_META_KEY,
    BLOCKED_BOTS_KEY,
    NOT_INTERESTED_KEY,
    PERSONAS_KEY,
    LEGACY_PERSONAS_KEY,
    OOC_TEMPLATES_KEY,
    FAVORITE_CREATORS_KEY,
    FAVORITE_BOTS_KEY,
    LATER_BOTS_KEY,
    GENERATION_PROFILES_KEY
  ]);

  const beforeBytes = await storageBytesInUse(null);
  const opened = uniqueClean(result[OPENED_KEY] || []);
  const favoriteCreators = normalizeCreatorStore(result[FAVORITE_CREATORS_KEY]);
  favoriteCreators.meta = pruneMeta(favoriteCreators.meta, favoriteCreators.handles);
  const personas = mergePersonas([], Array.isArray(result[PERSONAS_KEY]) ? result[PERSONAS_KEY] : (result[LEGACY_PERSONAS_KEY] || []));
  const currentSettings = { ...DEFAULT_SETTINGS, ...(result.settings || {}) };

  ["includeTags", "excludeTags", "blockedTags", "blockedWords", "blockedCreators", "blockedBotIds", "blockedBotNames", "allowedLanguages"]
    .forEach(key => { currentSettings[key] = uniqueClean(currentSettings[key] || []); });
  currentSettings.botEditorSnippets = normalizeBotEditorSnippets(currentSettings.botEditorSnippets);
  currentSettings.oocTemplates = normalizeOocTemplates(currentSettings.oocTemplates);

  const payload = {
    settings: currentSettings,
    [OPENED_KEY]: opened,
    [OPENED_META_KEY]: pruneMeta(result[OPENED_META_KEY], opened),
    [BLOCKED_BOTS_KEY]: cleanedBotStore(result[BLOCKED_BOTS_KEY], { keepNames: true }),
    [NOT_INTERESTED_KEY]: cleanedBotStore(result[NOT_INTERESTED_KEY]),
    [FAVORITE_CREATORS_KEY]: favoriteCreators,
    [FAVORITE_BOTS_KEY]: cleanedBotStore(result[FAVORITE_BOTS_KEY]),
    [LATER_BOTS_KEY]: cleanedBotStore(result[LATER_BOTS_KEY]),
    [PERSONAS_KEY]: personas,
    [OOC_TEMPLATES_KEY]: mergeOocTemplateLists([], result[OOC_TEMPLATES_KEY] || currentSettings.oocTemplates),
    [GENERATION_PROFILES_KEY]: normalizeGenerationProfiles(result[GENERATION_PROFILES_KEY])
  };

  await storageSet(payload);
  const afterBytes = await storageBytesInUse(null);
  await load();

  const saved = Number.isFinite(beforeBytes) && Number.isFinite(afterBytes)
    ? Math.max(0, beforeBytes - afterBytes)
    : 0;
  if (status) {
    status.textContent = saved > 0
      ? `Cleanup finished. Removed duplicates/orphaned metadata and freed about ${(saved / 1024).toFixed(1)} KB.`
      : "Cleanup finished. Saved lists are normalized and no duplicate/orphan cleanup was needed.";
  }
  showSettingsToast("Local QoL data cleaned.");
}

function sanitizeDiagnosticPath(url) {
  try {
    const parsed = new URL(url || "");
    return parsed.pathname
      .replace(/\/(chat|chats|chatbot)\/[0-9a-f-]{8,}/ig, "/$1/:id")
      .replace(/\/(creator|profile)\/[^/]+/ig, "/$1/:name");
  } catch {
    return "unknown";
  }
}

async function copyDiagnostics() {
  const status = $("diagnosticsStatus");
  if (status) status.textContent = "Building diagnostic info...";

  const result = await storageGet([
    "settings",
    OPENED_KEY,
    BLOCKED_BOTS_KEY,
    NOT_INTERESTED_KEY,
    FAVORITE_CREATORS_KEY,
    FAVORITE_BOTS_KEY,
    LATER_BOTS_KEY,
    PERSONAS_KEY,
    LEGACY_PERSONAS_KEY,
    OOC_TEMPLATES_KEY,
    GENERATION_PROFILES_KEY,
    SAI_TOOLKIT_PRESENCE_KEY
  ]);
  const context = await runtimeMessage({ type: "DS_GET_DIAGNOSTIC_CONTEXT" });
  const bytes = await storageBytesInUse(null);
  const settings = { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
  const enabledFeatures = OPTIONAL_FEATURE_KEYS.filter(key => settings[key] === true);
  const personas = Array.isArray(result[PERSONAS_KEY]) ? result[PERSONAS_KEY] : result[LEGACY_PERSONAS_KEY];

  const text = [
    "SpicyChat QoL diagnostics",
    `Version: ${chrome.runtime.getManifest?.().version || "unknown"}`,
    `Browser: ${navigator.userAgent}`,
    `Platform: ${navigator.platform || "unknown"}`,
    `SpicyChat page: ${sanitizeDiagnosticPath(context?.url || "")}`,
    `S.AI Toolkit detected: ${result[SAI_TOOLKIT_PRESENCE_KEY]?.detected ? "yes" : "no"}`,
    `S.AI compatibility enabled: ${settings.saiToolkitCompatibility ? "yes" : "no"}`,
    Number.isFinite(bytes) ? `QoL storage: ${(bytes / 1024).toFixed(1)} KB` : "QoL storage: unavailable",
    `Opened: ${countStoreItems(result[OPENED_KEY], "opened")}`,
    `Blocked: ${countStoreItems(result[BLOCKED_BOTS_KEY])}`,
    `Not interested: ${countStoreItems(result[NOT_INTERESTED_KEY])}`,
    `Favorite bots: ${countStoreItems(result[FAVORITE_BOTS_KEY])}`,
    `Favorite creators: ${countStoreItems(result[FAVORITE_CREATORS_KEY], "creator")}`,
    `Later: ${countStoreItems(result[LATER_BOTS_KEY])}`,
    `Personas: ${countStoreItems(personas, "persona")}`,
    `OOC presets: ${countStoreItems(result[OOC_TEMPLATES_KEY], "ooc")}`,
    `Generation profiles: ${countStoreItems(result[GENERATION_PROFILES_KEY], "profiles")}`,
    `Enabled optional features (${enabledFeatures.length}): ${enabledFeatures.join(", ") || "none"}`
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    if (status) status.textContent = "Copied. No chat text or saved private content was included.";
  } catch {
    const box = $("settingsJson");
    if (box) {
      box.value = text;
      setActiveTab("data");
      box.focus();
      box.select();
    }
    if (status) status.textContent = "Clipboard access failed, so the diagnostic text was placed in Data / Backup instead.";
  }
}

async function markUpdatesSeen() {
  const version = chrome.runtime.getManifest?.().version || "";
  if (!version) return;
  await storageSet({ [LAST_SEEN_VERSION_KEY]: version, [RELEASE_NOTICE_KEY]: null });
  applyFeatureChangeBadges(version);
  showSettingsToast("New/updated setting markers cleared.");
}

async function loadChangelog() {
  const host = $("changelogContent");
  if (!host || host.dataset.loaded === "1") return;

  try {
    const response = await fetch(chrome.runtime.getURL("CHANGELOG.md"));
    const text = await response.text();
    const blocks = text
      .split(/\n(?=##\s+)/g)
      .map(block => block.trim())
      .filter(block => /^##\s+/.test(block));

    host.innerHTML = blocks.map(block => {
      const lines = block.split(/\n+/).map(line => line.trim()).filter(Boolean);
      const title = lines.shift().replace(/^##\s+/, "");
      const items = lines
        .map(line => line.replace(/^[-*]\s+/, "").trim())
        .filter(Boolean)
        .map(line => `<li>${escapeHtml(line)}</li>`)
        .join("");

      return `
        <div class="changelog-version">
          <h3>${escapeHtml(title)}</h3>
          <ul>${items}</ul>
        </div>
      `;
    }).join("") || "No changelog entries yet.";

    host.dataset.loaded = "1";
  } catch {
    host.textContent = "Could not load the changelog.";
  }
}

function setupBotManagerControls(kind) {
  const search = $(managerElementId(kind, "Search"));
  const showMore = $(managerElementId(kind, "ShowMore"));
  const showLess = $(managerElementId(kind, "ShowLess"));
  const collapse = $(managerElementId(kind, "Collapse"));
  const sort = ["blocked", "later", "favorite", "opened"].includes(kind)
    ? $(managerElementId(kind, "SortMode"))
    : null;

  sort?.addEventListener("change", () => {
    botManagerUiState[kind].visible = 20;
    botManagerUiState[kind].collapsed = true;
    renderBotManager(kind);
  });

  search?.addEventListener("input", () => {
    botManagerUiState[kind].query = search.value || "";
    botManagerUiState[kind].visible = 20;
    botManagerUiState[kind].collapsed = true;
    renderBotManager(kind);
  });

  showMore?.addEventListener("click", () => {
    botManagerUiState[kind].collapsed = true;
    botManagerUiState[kind].visible = Math.min(
      5000,
      Number(botManagerUiState[kind].visible || 20) + 20
    );
    renderBotManager(kind);
  });

  showLess?.addEventListener("click", () => {
    botManagerUiState[kind].visible = 20;
    botManagerUiState[kind].collapsed = true;
    renderBotManager(kind);
  });

  collapse?.addEventListener("click", () => {
    const query = getBotManagerSearch(kind);
    const entries = getBotManagerEntries(kind);

    if (botManagerUiState[kind].collapsed && !query) {
      botManagerUiState[kind].collapsed = false;
      botManagerUiState[kind].visible = entries.length;
    } else {
      botManagerUiState[kind].collapsed = true;
      botManagerUiState[kind].visible = 20;
    }

    renderBotManager(kind);
  });
}

function setupFavoriteCreatorControls() {
  const showMore = $("favoriteCreatorShowMore");
  const showLess = $("favoriteCreatorShowLess");
  const collapse = $("favoriteCreatorCollapse");

  showMore?.addEventListener("click", () => {
    favoriteCreatorUiState.collapsed = true;
    favoriteCreatorUiState.visible = Math.min(
      5000,
      Number(favoriteCreatorUiState.visible || 20) + 20
    );
    renderFavoriteCreators();
  });

  showLess?.addEventListener("click", () => {
    favoriteCreatorUiState.visible = 20;
    favoriteCreatorUiState.collapsed = true;
    renderFavoriteCreators();
  });

  collapse?.addEventListener("click", () => {
    const entries = creatorEntriesFromStore(favoriteCreatorState);

    if (favoriteCreatorUiState.collapsed) {
      favoriteCreatorUiState.collapsed = false;
      favoriteCreatorUiState.visible = entries.length;
    } else {
      favoriteCreatorUiState.collapsed = true;
      favoriteCreatorUiState.visible = 20;
    }

    renderFavoriteCreators();
  });
}

$("save")?.addEventListener("click", save);
$("autoAfkCheckNow")?.addEventListener("click", runAutoAfkCheckNow);
$("clearOpened")?.addEventListener("click", clearOpened);
$("exportSettings")?.addEventListener("click", exportSettings);
$("previewImport")?.addEventListener("click", previewImportSettings);
$("importSettings")?.addEventListener("click", importSettings);
$("cancelImportPreview")?.addEventListener("click", cancelImportPreview);
$("refreshStorageUsage")?.addEventListener("click", refreshStorageUsage);
$("cleanLocalData")?.addEventListener("click", cleanLocalData);
$("copyDiagnostics")?.addEventListener("click", copyDiagnostics);
$("markUpdatesSeen")?.addEventListener("click", markUpdatesSeen);
$("startFirstRunSetup")?.addEventListener("click", () => {
  setActiveTab("general");
  $("quickSetupCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
});
$("dismissFirstRunNotice")?.addEventListener("click", dismissFirstRunNotice);
$("addOocTemplate")?.addEventListener("click", addOocTemplate);
$("addBotEditorSnippet")?.addEventListener("click", addBotEditorSnippet);
$("addBlockedBot")?.addEventListener("click", () => addManagedBot("blocked"));
$("addNotInterestedBot")?.addEventListener("click", () => addManagedBot("notInterested"));
$("addFavoriteCreator")?.addEventListener("click", addFavoriteCreator);
[
  "textNormalizationEnabled",
  "normalizeFancyUnicode",
  "normalizePunctuation",
  "normalizeInvisibleCharacters",
  "normalizeDecorativeSymbols",
  "textNormalizationPreviewInput"
].forEach(id => $(id)?.addEventListener("input", updateTextNormalizationPreview));
[
  "textNormalizationEnabled",
  "normalizeFancyUnicode",
  "normalizePunctuation",
  "normalizeInvisibleCharacters",
  "normalizeDecorativeSymbols"
].forEach(id => $(id)?.addEventListener("change", updateTextNormalizationPreview));
setupBotManagerControls("blocked");
setupBotManagerControls("notInterested");
setupBotManagerControls("later");
setupBotManagerControls("favorite");
setupBotManagerControls("opened");
setupFavoriteCreatorControls();
setupMiniPanelPreview();
setupSettingsToast();
setupPageIntros();
setupSettingsSearch();
setupPresets();

setupTabs();
load();
