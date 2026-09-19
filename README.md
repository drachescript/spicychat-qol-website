# SpicyChat QoL website

Source for https://spicychatqol.drache.uk/.

The public site is mostly static and reads current SpicyChat QoL information from the public GitHub repositories whenever possible. The Cloudflare Worker resolves the latest stable browser release, rolling `dev-build`, selected source files, and Android release metadata.

Main projects:

- Extension: https://github.com/drachescript/spicychat-qol-extension
- Android: https://github.com/drachescript/spicychat-qol-android
- Website: https://github.com/drachescript/spicychat-qol-website

The interactive demo uses fake, SFW data and never connects to a visitor's SpicyChat account.

See `AUTOMATION.md` for the release/manifest flow used by the site.
