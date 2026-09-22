# SpicyChat QoL website

Source for https://spicychatqol.drache.uk/.

The public site is mostly static and reads current SpicyChat QoL information from the public GitHub repositories whenever possible. The Cloudflare Worker resolves the latest stable browser release, rolling `dev-build`, selected source files, and Android release metadata.

Current public Android release: **v0.1.0**. Normal compatible QoL updates can update inside the app; a new APK is only required for Android-app changes.

Main projects:

- Extension: https://github.com/drachescript/spicychat-qol-extension
- Android: https://github.com/drachescript/spicychat-qol-android
- Website: https://github.com/drachescript/spicychat-qol-website

The interactive demo uses SFW public creator cards plus fabricated private/account data and never connects to a visitor's SpicyChat account. Its Settings UI and feature registry load automatically from the public extension source.

See `AUTOMATION.md` for the release/manifest flow used by the site and `DEMO.md` for the playground architecture.

## Reviews / creator feedback

`/reviews/` explains the moderation/abuse context behind SpicyChat not having an open public chatbot review wall and records DragonGraf's plan for a more structured creator-feedback system later. The two Discord screenshots on that page are stored locally under `assets/reviews/` and open at full size when clicked.

- `/bot/` explains QoL Bot user installs, public commands, creator-follow DMs, and links back to the QoL Discord community.
