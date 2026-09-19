# SpicyChat QoL Android changelog

## Recent

### Android diagnostics, performance & runtime bridge
- Fixed Android Options diagnostics/performance reports reaching the live SpicyChat WebView.
- Added a safe synthetic active-tab bridge for Settings/runtime communication without pretending the APK has normal browser tabs.
- Kept browser-only tab/session automation unavailable in the APK.

### Android reliability & navigation
- Improved black-page and stalled-load recovery, SPA navigation, renderer diagnostics and duplicate-injection protection.
- Fixed the Save & Stay device-Back edge case.
- Added optional pinch-to-zoom, default launch-page choices, configurable native QoL control placement and improved internal navigation.

### Storage, backup & files
- Added modern `chrome.storage.local` compatibility including remove, clear, getKeys and getBytesInUse.
- Improved large-value storage, import rollback, Persona/local-copy handling and native Save File/file-picking bridges.
- Synchronized current extension scripts, CSS, Settings assets, CHANGELOG, features and feature-registry into Android builds.

### Android-only interaction features
- Added native long-press message actions including Copy, Edit, Report, Resend, Remove Image and temporary Select text where applicable.
- Fixed long-press Copy by preferring the native Android clipboard bridge.

### Multiple Android Chat Tabs
- Experimental and opt-in; disabled by default.
- Uses one active WebView while inactive tabs keep lightweight URL/title/scroll/last-used state.
- Includes a permanent Home tab, separate conversations with the same bot, switching/closing/restoration and Android Back integration.

## Planned
- Remote QoL bundle updates separate from native APK releases.
- Use `https://spicychatqol.drache.uk/android/manifest.json` as the Android update source of truth.
- Add compatibility/rollback checks and public APK update notifications when releases are published.
- Continue chat-tab, navigation, long-chat, backup/import/export and mobile-layout improvements.
