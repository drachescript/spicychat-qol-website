# Optional Cloudflare Worker

The website works without this.

If the domain is proxied through Cloudflare later, route `/api/*` to `worker.js`. It proxies the allowed root GitHub files and exposes `/api/android/latest` for the Android updater.
