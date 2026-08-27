# SpicyChat QoL website Worker

Optional Cloudflare Worker routes used by the static site.

It proxies the small set of root files the site is allowed to display, reads the public DEV distribution version where possible, and exposes the latest Android release/update metadata when that repo begins publishing it.

Suggested route:

`spicychatqol.drache.uk/api/*`

Endpoints:

- `/api/source?project=stable&file=features.md`
- `/api/source?project=dev&file=CHANGELOG.md`
- `/api/distribution/chrome-dev`
- `/api/distribution/firefox-dev`
- `/api/android/latest`
