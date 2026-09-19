# SpicyChat QoL Android changelog

## Current open-source release work

### Release automation
- Android release builds sync the current browser-extension `main` into the app assets before packaging.
- Tagged releases build the signed APK through GitHub Actions.
- Release assets include the APK, SHA-256/checksum data and generated `update.json`.
- `update.json` is the release metadata source used by the website/updater; `/android/manifest.json` is a compatibility/fallback endpoint.
- Android `versionCode` remains monotonic across releases even when the public `versionName` starts a new release line.

### Android diagnostics, performance & runtime bridge
- Fixed Android Options diagnostics/performance reports reaching the live SpicyChat WebView.
- Improved runtime bridging and recovery for wrapper-specific flows.

### Android reliability & navigation
- Improved black-page recovery, navigation handling and native/WebView coordination.
- Synchronized current extension scripts, CSS, Settings assets, CHANGELOG, features and feature registry into Android builds.

### Android-only interaction features
- Native storage/file/clipboard bridges and long-press message actions.
- Configurable wrapper controls and internal navigation behavior.

### Multiple Android Chat Tabs
- Experimental and opt-in; disabled by default.
- Uses one active WebView with lightweight inactive-tab state.
- Supports a permanent Home tab, same-bot separate conversations, switching/closing/restoration, Android Back integration and scroll recovery.
