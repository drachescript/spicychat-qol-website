# SpicyChat QoL Safari Lite — 0.1.0 beta 1

**Experimental / untested on an actual iPhone.** Built from the supplied **SpicyChat QoL Chrome 0.2.53** source. This is not a Chrome/Firefox extension or an Apple App Store app.

## Install on iPhone/iPad with the free Userscripts app

1. Install/open **[Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887)** by quoid, and ensure it has a scripts folder. In iOS Settings > Safari > Extensions, enable Userscripts and grant it permission for **spicychat.ai**.
2. In Files, save **`spicychat-qol-safari-lite-v0.1.0-beta.1.user.js`** inside the folder selected in Userscripts. You can also host that exact `.user.js` file and open its URL in Safari, then use the Userscripts extension popup's install prompt.
3. Open the Userscripts extension popup once to refresh its list if you copied the file through Files. Ensure this script is enabled for SpicyChat.
4. Load/reload `https://spicychat.ai/`. Tap the small **QoL** launcher on screen. Enable one feature at a time in **Setup**.
5. Start with **Quick-save buttons** and **Chat folders**. Try **Bot folders & notes** on `/favorite-bots` or `/my-creations/chatbots`. The latter is more complex and may need fixes on mobile.
6. If anything breaks, open **QoL > Diagnostics**, copy the report, and send it to dragonGRaf, along with the exact page and a screenshot. Disable the affected toggle if needed.

If the launcher doesn't appear: reload Safari, open the Userscripts popup to confirm this file matches/has permission, and check that Safari wasn't set to disable extensions for that site.

## What is included

- **Original v0.2.53 `chat-organizer.js`**: chat folders, select chats, assign/remove folders, rename/delete.
- **Original v0.2.53 `bot-organizer.js`**: folders, notes, tags, filters, bulk actions, plus original `mobile-bot-organizer.js` layout helper.
- **Original v0.2.53 `saved-lists-overlay.js`**: Favorites/Later overlay, with a separate Safari-specific save UI to populate QoL-local lists.
- Safari-only **QoL launcher**, **Quick-save** (Favorites/Later), **local discovery** (saved and currently loaded bot cards), **JSON import/export**, and **diagnostics**.
- Every optional feature is **OFF by default**. No cross-domain API calls, remote code, background browser workers or new background tabs are used.

## Important limitations

- **Not tested in iPhone 17 Pro Safari.** This is beta 1, and page selectors may need adjustment based on Yak's screenshots and diagnostics.
- **Bot Discovery here is LOCAL**: only loaded listing cards and saved records are searchable. It is **not** the full extension's online discovery/archive/indexing functionality.
- Your browser's **native SpicyChat Favorites are not automatically copied** into QoL's local Favorites history. Use Quick-save to add them.
- **Safari local storage is not Chrome/Firefox/Android sync**. It can be erased by clearing website data. Use the backup export often. Only flat JSON backups containing `botOrganization`, `chatOrganization`, `laterBots`, or `favoriteBots` at the top level are recognized. Very large extension backups may exceed Safari local storage quota; avoid importing huge backups.
- Backups **replace**, not merge, existing Safari Lite data. Imported features are always reset to OFF. Export a Safari backup before importing.
- No `chrome.*` APIs, background jobs, sync, bulk archive imports, global block list or tab-dependent features.
- Original bot organizer may be heavy on very large listings; turn it off if scrolling becomes sluggish.
- No changes to the source extension or GitHub repositories were made.

## Test checklist for Yak

1. Open SpicyChat with Userscripts enabled; does the **QoL** button appear?
2. Enable **Quick-save buttons**, open a bot card, save it to Later, and verify it in **QoL > Saved**.
3. Reload SpicyChat; check the saved bot is still in **Saved**.
4. Open `/chats`, enable **Chat folders**, create a folder, select and assign one chat. Change the filter and refresh.
5. Enable **Bot folders & notes**, add a bot to a folder on Favorites, see whether the mobile panel is usable.
6. Use **Discover** to filter visible bot cards, and try Export backup to Files.
7. Send a **Diagnostics** report and mention which step failed, if any.

### Maintenance

The `.user.js` is self-contained and should be the ONLY file Yak installs from this package. The ZIP exists for convenient delivery; do not install both copies. Do not install the extracted Chrome extension files into Userscripts.

Userscripts installation source: https://github.com/quoid/userscripts (README, iOS Usage).
