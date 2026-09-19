# SpicyChat QoL Android

SpicyChat QoL Android is the open-source Flutter/WebView wrapper for SpicyChat QoL.

- Android source: https://github.com/drachescript/spicychat-qol-android
- Browser extension source: https://github.com/drachescript/spicychat-qol-extension
- Website: https://spicychatqol.drache.uk/

The wrapper adds native Android navigation, recovery, storage/file/clipboard bridges, diagnostics, long-press message actions, configurable native controls and opt-in multiple chat tabs while sharing the browser extension's QoL JavaScript/CSS.

## Release flow

Tagged Android releases use GitHub Actions to:

1. sync the current extension `main` into Android assets as the embedded known-good fallback;
2. build the signed APK;
3. generate SHA-256/checksum data;
4. generate `update.json`; and
5. publish those files with the GitHub Release.

The website and updater treat the release `update.json` as the Android release metadata source. `/android/manifest.json` remains a compatibility/fallback endpoint.

Until a current tagged APK release is published, the website shows the APK as pending instead of pretending an internal/local build is public.
