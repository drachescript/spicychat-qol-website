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

`/android/manifest.json` normalizes the same data for compatibility. The public site is static, so `android/manifest.json` and `android/update.json` are also synchronized into this repository by `.github/workflows/sync-android-manifest.yml`. This keeps the direct URLs current even when they are served straight from GitHub Pages instead of through the optional Worker.

The sync workflow runs on a schedule, can be started manually, and can also accept a future `repository_dispatch` event named `android-release`. It reads the latest tagged Android release, prefers its attached `update.json`, fills missing checksum/version-code data from the release/tag when needed, and commits only when the generated files actually changed.

A typical release `update.json` contains:

```json
{
  "app": "SpicyChat QOL",
  "packageName": "uk.drache.spicychatqol",
  "versionName": "0.1.3",
  "versionCode": 74,
  "tag": "v0.1.3",
  "apkFile": "SpicyChat-QOL-Android-v0.1.3.apk",
  "apkUrl": "https://github.com/drachescript/spicychat-qol-android/releases/download/v0.1.3/SpicyChat-QOL-Android-v0.1.3.apk",
  "releaseUrl": "https://github.com/drachescript/spicychat-qol-android/releases/tag/v0.1.3",
  "sha256": "...",
  "minimumAndroidSdk": 24,
  "publishedAt": "..."
}
```

Only published tagged releases should update public Android release metadata. Internal/local builds must not appear as public updates.

## Website playground / demo source sync

The playground deliberately separates two things:

1. **QoL source of truth** — Stable and Development settings are loaded from the public extension repository at runtime. The demo requests `options.html`, `options.css`, `options.js`, `feature-registry.js`, `manifest.json`, and `CHANGELOG.md`. This means normal Settings changes do not require a hand-maintained copy in the website.
2. **SpicyChat compatibility fixtures** — The fake Home/Chats/Personas/creator/Lorebook/chat pages are local, SFW fixtures shaped from saved real page structures. They contain no login/session data and all actions remain local/simulated.

The playground's bot allowlist is stored in `data/demo/creator-allowlist.json` and the safe card snapshot in `data/demo/bots.json`. Both were generated from the supplied public creator-profile snapshot for `@dragongraf1312`.

The site intentionally does not execute private SpicyChat APIs or reuse authentication. New QoL settings still appear automatically in the real Options drawer even when a matching fake-page effect has not yet been implemented.

## Demo Settings source sync

The demo no longer depends on every visitor fetching several large extension Settings files directly from raw GitHub.

`.github/workflows/sync-demo-source.yml` runs on demand and every 15 minutes. It copies the latest normal release Settings source into `data/demo/stable/` and current extension `main` Settings source into `data/demo/dev-current/`. The demo prefers these same-origin synchronized copies and only falls back to direct public-source fetching when a synchronized copy is unavailable.

The workflow follows the `<script src="...">` entries in `options.html`, so new Settings registry/helper scripts are copied automatically instead of needing to be added to the website by hand. If a Development `options.html` temporarily references a helper script that has not been committed yet, the sync logs a warning and continues with the files that actually exist instead of failing the entire demo refresh. Required core files (`options.html`, `options.css`, `options.js`, `manifest.json`, and `CHANGELOG.md`) are still validated and will fail the sync if they are missing or empty.
