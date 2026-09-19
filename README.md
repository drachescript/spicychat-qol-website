# SpicyChat QoL website

Source for https://spicychatqol.drache.uk/.

The public site is mostly static and reads current SpicyChat QoL information from the public GitHub repositories whenever possible. The optional Cloudflare Worker proxies the small set of repository/release data used by the feature browser, changelog, demo and Android update checks.

Main projects:

- Extension: https://github.com/drachescript/spicychat-qol-extension
- Android: https://github.com/drachescript/spicychat-qol-android
- Website: https://github.com/drachescript/spicychat-qol-website

The interactive demo uses fake, SFW data and never connects to a visitor's SpicyChat account.
