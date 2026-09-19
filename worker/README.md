# Optional Cloudflare Worker

Routes the small dynamic pieces used by the public website:

- `/api/source` — selected files from the stable v0.2.0 tag, current extension `main`, or Android `main`
- `/api/distribution/stable` — current stable GitHub release metadata
- `/api/distribution/dev` — rolling `dev-build` release metadata
- `/api/android/latest` — latest public Android APK release when one exists
- `/android/manifest.json` — Android updater-facing manifest generated from the same release source

The static site can still read raw GitHub files directly if the Worker is not deployed; bundled snapshots are only a temporary fallback for documentation pages.
