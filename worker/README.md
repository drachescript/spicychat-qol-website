# Optional Cloudflare Worker

Routes the dynamic release/source pieces used by the public website.

## Endpoints

- `/api/source` — selected source files from the latest stable extension release tag, current extension `main`, or Android `main`
- `/api/distribution/stable` — latest non-prerelease extension GitHub release
- `/api/distribution/dev` — rolling `dev-build` prerelease metadata
- `/api/extension/latest` — normalized stable + development extension metadata
- `/extension/manifest.json` — same normalized extension metadata for manifest-style consumers
- `/api/android/latest` — latest tagged Android release, preferring its attached `update.json`
- `/android/manifest.json` — normalized Android release/updater metadata
- `/android/update.json` — alias of the normalized Android manifest endpoint

## Source-of-truth rules

### Browser extension

Stable resolves from GitHub's latest non-prerelease release, so future stable tags do not require a website edit. Development follows `main` plus the rolling `dev-build` prerelease.

### Android

The tagged Android GitHub Release is authoritative. The Worker looks for `update.json` attached to that release first. If the asset is missing, it falls back to conservative release/APK metadata; it does not promote a random local/internal build.

The static site can still read raw GitHub files directly if the Worker is unavailable. Bundled snapshots and static manifests are fallbacks only.
