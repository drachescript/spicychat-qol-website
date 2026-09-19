# Release metadata automation

The website no longer needs a manual version edit for normal releases.

## Browser extension

Source: `drachescript/spicychat-qol-extension`

- **Stable** comes from GitHub's latest non-prerelease release.
- Stable source-backed pages resolve that release tag automatically.
- **Development** comes from the rolling `dev-build` prerelease and current `main`.
- `/extension/manifest.json` is generated dynamically by the Worker from those two release channels.
- The static `extension/manifest.json` in this repository is only a fallback when the Worker/GitHub is unavailable.

No extra website Action is required for browser-version bumps. Existing extension release Actions remain the source of truth.

## Android

Source: `drachescript/spicychat-qol-android`

The Android tagged-release workflow is expected to publish:

- `SpicyChat-QOL-Android-v<version>.apk`
- APK SHA-256/checksum data
- `update.json`

The website Worker queries the latest GitHub Release, loads its `update.json` asset first, and only falls back to ordinary release/APK metadata if that asset is missing.

`/android/manifest.json` normalizes the same data for compatibility. The static `android/manifest.json` and `android/update.json` files in this website are offline fallbacks only.

A typical release `update.json` contains:

```json
{
  "app": "SpicyChat QOL",
  "packageName": "uk.drache.spicychatqol",
  "versionName": "0.1.0",
  "versionCode": 71,
  "tag": "v0.1.0",
  "apkFile": "SpicyChat-QOL-Android-v0.1.0.apk",
  "apkUrl": "https://github.com/drachescript/spicychat-qol-android/releases/download/v0.1.0/SpicyChat-QOL-Android-v0.1.0.apk",
  "releaseUrl": "https://github.com/drachescript/spicychat-qol-android/releases/tag/v0.1.0",
  "sha256": "...",
  "minimumAndroidSdk": 24,
  "publishedAt": "..."
}
```

Only published tagged releases should update public Android release metadata. Internal/local builds must not appear as public updates.
