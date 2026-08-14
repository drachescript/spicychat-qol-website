# SpicyChat QoL

A small quality-of-life extension for SpicyChat.

It adds optional filters, card buttons, chat tools, OOC helpers, layout cleanup, and local backup/import tools.

Everything is configurable. Fresh installs start with the main extension switch on, but the optional tools start off until you enable them.

## Install

### Chrome Web Store

Stable release: https://chromewebstore.google.com/detail/dragonscript-spicychat-qo/hjnipnpdfegilehicfkholhbomigfabl

Development build: https://chrome.google.com/webstore/detail/jdbhnaohfjnmkfpfddnjilmpaemkmabh

The development listing receives working test features first and may be ahead of the currently approved Web Store version.

### Manual install

1. Download or clone this repository.
2. Open `chrome://extensions/` in Chrome or Brave.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the extension folder.
6. Open the extension settings and enable the features you want.

When updating manually, reload the extension on `chrome://extensions/` and refresh SpicyChat.

## Status

Current manual patch version: 0.1.8.69.

The next proper public/store milestone is v0.2.

## Android app

In development. This section is for the Android app status, fixed issues, known issues, and public release notes once the app is ready to share.

Current Android goal: a standalone SpicyChat wrapper that can keep the QoL tools working without needing a browser extension.

## Current features

- Settings search, setup presets, recent-feature markers, update notices, diagnostics, and optional S.AI Toolkit compatibility.
- Opened chats, favorite history, favorite creators, Later, blocked bots, and Not Interested lists with local search/sort management.
- Card/list filtering by tags, words, creators, language, groups, opened state, and saved lists.
- Chat tools for OOC, personas, memories, asterisk actions, message shortcuts, scroll navigation, generation details, export, drafts, saved-chat actions, and Auto voice.
- Bot creation helpers for snippets, Lorebook Start New, Public/Unlisted defaults, entry expansion, and guideline agreement.
- Sidebar, top-bar, composer, premium, notification, model, and advert cleanup.
- Mini Panel with configurable layout, per-tab controls, Auto voice/Auto *, and an optional current-page feature summary.
- Auto-AFK and long-chat/background performance helpers.
- Backup/export by category, import preview with Merge/Replace, storage details, and safe local cleanup.

See `features.md` for the full grouped feature list.

## Settings tabs

- General
- Mini Panel
- Chat List
- Chat UI
- Bot Tools
- Sidebar
- Top Bar
- Saved Lists
- Blocking
- Data / Backup
- Changelog
- Help

## Data you can export/import

- Settings
- Opened chats
- Blocked bots
- Not interested bots
- Later bots
- Favorite creators
- Favorite bots
- Personas
- OOC presets
- Generation profiles (included with settings)
- Everything

Imports are previewed before applying. You can merge with current data or replace only the categories included in the backup.

## Planned features

- Better dislike/rating and quick-unblocking helpers.
- Better resend/unsend recovery for broken replies.
- More reliable listing refill/loading and more mobile/performance tuning.
- Better Later/favorite/persona/chat-list organization.
- Local folders, personal tags, private notes, and better My Chatbots sorting.
- More export formats and better device-to-device backup/sync.
- Full bot/profile export where SpicyChat exposes enough information.
- More Android/Mini Panel layout options and multiple Android chat tabs.
- Custom local chat backgrounds and selected S.AI Toolkit ideas where they fit cleanly.
- Save & Open Chat after editing, more paired-symbol wrapping, and multilingual creator helpers where technically possible.

See `CHANGELOG.md` or the Changelog tab in settings for the patch history.


## Project files for the website

- `features.md` keeps the public feature list in one place so the project website can reuse it later.
- `CHANGELOG.md` tracks extension builds.
- `android-CHANGELOG.md` tracks android changes.


## Credits and third-party code

[S.AI Toolkit](https://github.com/OnyxMizuna/SAI-Toolkit) by OnyxMizuna. See `THIRD-PARTY-NOTICES.md` for details.


### Fresh installs
Fresh installs open Settings automatically. The main QoL switch starts on, while optional features start off until you choose them or apply a setup preset.
