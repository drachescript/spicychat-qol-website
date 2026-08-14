## 0.1.8.70
- Fresh installs now open Settings automatically and start with every optional checkbox off; only the main QoL switch is on by default.
- Moved the new/updated settings count out of Settings search and into Changelog.

# Changelog

## 0.1.8.69
- Added Settings search, clearer tab descriptions, and quick setup presets.
- Added safe Copy diagnostic info for easier bug reports.
- Added popup install/update notices and NEW/UPDATED markers for recent settings.
- Added backup import preview with Merge or Replace included categories.
- Added expanded storage details plus one-click duplicate/orphan cleanup.
- Added Undo for local saved-list removals and recently cleared opened-chat history.
- Added an optional current-page feature summary to the Mini Panel.
- Kept new optional features and S.AI Toolkit compatibility opt-in on fresh installs, and cleaned up Settings/docs wording.

## 0.1.8.68
- Reworked the dedicated `*` button recovery so SpicyChat composer rerenders can recreate it independently.
- Added optional automatic `*` pairing while typing and an Auto * Mini Panel toggle.
- Kept Later buttons beside SpicyChat's native favorite control when available.
- Made scroll arrows smaller on Home/listing/profile pages, especially on mobile.
- Removed the unused Mini panel in this SpicyChat tab control from Settings.

## 0.1.8.67
- Added an optional scroll-to-bottom button and restored the scroll-to-top Settings toggle.

## 0.1.8.66
- Moved the dedicated `*` button out of SpicyChat's hidden Plus wrapper and into the composer controls row.

## 0.1.8.65
- Added the first composer-rerender recovery attempt for the dedicated `*` button.

## 0.1.8.64
- Added optional Show full text / Show less buttons to Lorebook entries so long entry text can be expanded without opening the editor.
- Changed the My Personas description helper to add per-persona Show more / Show less buttons instead of expanding every description automatically.

## 0.1.8.63
- Added an optional dedicated asterisk button in the chat composer that wraps selected text in `*asterisks*` or inserts `**` with the cursor between them.

## 0.1.8.62
- Added passive S.AI Toolkit detection with an option to let Toolkit handle overlapping features when it is detected.
- Added a searchable Favorite history for finding bots that were previously seen on the Favorites page, including accidentally unfavorited bots.
- Added an optional floating scroll-to-top button for long SpicyChat pages, including mobile-friendly positioning.

## 0.1.8.61
- Added Pin selected to the bulk Memory Manager so multiple selected memories can be pinned in one batch using SpicyChat's own Pin Memory action.

## 0.1.8.60
- Fixed the chat OOC shortcut duplicating itself whenever SpicyChat rerendered the composer while typing, sending, or clearing a message.

## 0.1.8.59
- Added a new-chatbot visibility default that can automatically select Public or Unlisted while still allowing manual changes before saving.

## 0.1.8.58
- Added an option to automatically click Start New on the Create Lorebook chooser while leaving Import untouched.
- Made Settings saves much faster with large opened/blocked/saved lists by only rewriting saved-list data that was actually edited in Settings.
- Reduced storage-update overhead by applying changed values directly in open SpicyChat tabs instead of rereading every large saved list after each setting change.
- Reduced listing-page rescans by keeping the card cache when unrelated headers, banners, or modals change.
- Reduced Settings-page work by only rendering the large Saved Lists/Blocking managers when those tabs are actually opened.


## 0.1.8.57
- Changed the chat OOC shortcut so Image stays available unless Hide image generation button is also enabled, in which case OOC takes its place.
- Added a Mini Panel Auto voice toggle that uses SpicyChat's native Listen button for each new AI reply without reading the existing backlog.
- Added optional Change Title, Clone, and Remove quick actions to saved conversation cards on `/chats/{character}`.
- Added Select unpinned to the bulk Memory Manager so cloned/branched chats can keep pinned memories while selecting the rest.
- Made long card-description expansion wait until advert-banner cleanup and blocked/opened-card hiding have settled.

## 0.1.8.56
- Added an option to expand full persona descriptions on the My Personas page.
- Cleaned up the changelog wording and added the latest community feedback ideas to the planned list.

## 0.1.8.55
- Fixed My Creations → Chatbots character names being squeezed or covered by QoL card-action buttons.

## 0.1.8.54
- Fixed bulk Memory Manager deletion failing to open SpicyChat's three-dot memory menu and find Delete Memory.

## 0.1.8.53
- Added optional bulk Memory Manager controls with per-memory checkboxes, Select all, Invert, Clear, and Delete selected.
- Fixed automatic notification reading when SpicyChat had more than one unread product update.

## 0.1.8.52
- Fixed sidebar and top-bar cleanup sometimes stopping on pages that constantly update in the background.

## 0.1.8.51
- Fixed another persona auto-detection false positive where payment text such as Cryptocurrencies / One time payment could still be saved as a persona.

## 0.1.8.50
- Fixed persona auto-detection accidentally saving unrelated radio-button choices such as Credit Card, VENMO, and Alipay as personas.

## 0.1.8.49
- Updated advert-banner cleanup for SpicyChat's newer Custom Voices, Lorebooks, and Annual Premium carousel banners, including black/empty hidden slides.
- Fixed Auto-AFK inactivity tracking being reset by background page loads or extension/browser restarts.
- Added a once-per-minute Auto-AFK check and a manual cleanup diagnostic in Settings.

## 0.1.8.48
- Reworked QoL scheduling so blocking/opened-chat filtering and direct chat tools run before cosmetic cleanup.
- Reduced repeated listing scans by caching bot cards and using faster saved-ID lookups.
- Reworked long-chat performance mode to react to messages entering or leaving the viewport instead of constantly remeasuring every message.
- Stopped disabled helpers from continuing unnecessary background work.
- Stopped generation metadata from injecting its network bridge unless the feature is enabled.
- Reduced repeated language-filter and compact-layout work on unchanged cards.

## 0.1.8.47
- Added optional Multiple Chats / Chat History controls beside the bot name, including Chats and + New Chat shortcuts.

## 0.1.8.46
- Added optional Auto-AFK cleanup for inactive SpicyChat tabs with page scopes, unload/close actions, active-tab protection, and a configurable timeout.
- Added a Mini panel in this SpicyChat tab switch directly in Settings for Android and browsers where the popup is inconvenient.
- Fixed the saved default for enabling the mini panel in new tabs not being restored correctly.

## 0.1.8.45
- Moved the chat Later button beside the bot name and made it work independently from chat-header cleanup.
- Added an option to close the current chat tab after saving a bot for Later.

## 0.1.8.44
- Added a Bot Tools settings tab for chatbot creation/editing helpers, custom snippets, and chat-page bot tags.
- Added an option to automatically tick the Community Guidelines agreement on chatbot and Lorebook creation pages.

## 0.1.8.43
- Expanded fancy Unicode normalization for more italic, script, fraktur, mixed mathematical letters, and older Android WebViews.
- Added optional cleanup for decorative wrappers such as ꧁ ꧂ ◦ ° and ⋆.
- Added an option to automatically open the Advanced section while creating or editing a chatbot.

## 0.1.8.42
- Fixed advert-banner cleanup hiding the real Create Lorebook page.
- Kept bots visible on My Creations → Chatbots even when opened-chat hiding is enabled.

## 0.1.8.41
- Expanded fancy Unicode normalization for mathematical/script-style bot titles.
- Made message timestamp and generation-detail sub-options start disabled by default.
- Fixed stale mini-panel tab overrides preventing the panel from appearing when enabled globally.

## 0.1.8.40
- Fixed repeated mobile injection creating duplicate mini-panel/open buttons.
- Fixed OOC and persona sections sometimes disappearing after chat navigation.
- Added an option to replace the image-generation button with an OOC button.

## 0.1.8.39
- Fixed the Mini Panel layout preview so Chat list and Bot listing use their own simulated layouts.
- Added optional message timestamps and generation details, including model, engine, generation time, and available generation settings.
- Saved captured generation metadata locally so it can be shown again when the same messages reload.

## 0.1.8.38
- Added generation setting profiles for saving and restoring the selected model and available sliders.
- Added generation-profile backup/import support.
- Added S.AI Toolkit credit for reused GPL-3.0 code.

## 0.1.8.37
- Added optional {{char}}, {{user}}, CONTINUE, and no-control helper buttons in the chatbot editor.
- Added reusable custom bot-editor snippets that insert at the current cursor position and are included in backups.

## 0.1.8.36
- Removed QoL's duplicate Most messages first sort now that SpicyChat has its own Most Active sort.
- Fixed the mini-panel chat-sort dropdown closing while selecting an option.
- Added separate mini-panel settings for opened and blocked counts.
- Added a per-tab mini-panel enable/disable switch with a configurable default for new tabs.

## 0.1.8.35
- Fixed language-filter cards flashing between hidden and visible while SpicyChat recycles them.
- Added optional clickable bot tags on chat pages and + buttons that append tags to the saved include filter.
- Added an option to keep the current chat position while typing after scrolling up.

## 0.1.8.34
- Removed QoL's automatic scrolling after send, continue, or regenerate actions.
- Fixed QoL trying to hold the chat at the bottom when SpicyChat wanted to control scrolling itself.

## 0.1.8.33
- Added an option to hide SpicyChat's unread notification badge from the browser-tab favicon.
- Reworked automatic notification clearing so it reacts to real unread product updates instead of opening the panel on every page load.

## 0.1.8.32
- Kept the newest chat messages fully rendered in performance mode so long chats still scroll correctly at the bottom.
- Fixed bottom mini-panel placement moving unnecessarily when the message box grows taller.

## 0.1.8.31
- Fixed card description expansion selecting the wrong part of some bot cards and collapsing again while scrolling.

## 0.1.8.30
- Kept bottom mini-panel placements above the composer and send controls.
- Saved dragged custom panel positions separately for each browser tab.
- Added a draggable Mini Panel layout preview in Settings.

## 0.1.8.29
- Fixed the saved-persona count being shown more than once.
- Added Mini Panel controls for width, control size, and maximum screen height.
- Added an option to collapse the panel when it would cover chat messages on narrow windows.
- Fixed panel height so it shrinks to the controls currently enabled.

## 0.1.8.28
- Fixed the mini panel stretching down the page instead of fitting its visible controls.
- Added a dedicated Mini Panel settings tab with per-item show/hide controls.
- Reorganized opened chats, favorite bots, favorite creators, and Later bots under Saved Lists.
- Added Show more and Expand all controls to saved-list managers.
- Added optional local tracking for bots seen on SpicyChat's Favorites page.
- Moved the creator-favorite star beside the creator name in chat headers.

## 0.1.8.27
- Fixed extra empty space in the mini panel and reordered its controls.
- Added an option to open the mini panel collapsed on new SpicyChat pages.
- Stopped normal background QoL clicks from scrolling chat pages.
- Removed the extra mini-panel placement hint from Settings.

## 0.1.8.26
- Removed the chat-header mini-panel dock because it covered messages too easily.
- Improved top-corner panel placement around the SpicyChat header/sidebar.
- Made the panel shorter with internal scrolling instead of stretching down the page.
- Fixed custom dragged panel positions saving more reliably.
- Reordered the chat mini-panel controls.

## 0.1.8.25
- Added mini-panel docking options for the chat header and sidebar.
- Fixed dragging docked panels into custom positions.
- Improved mini-panel behavior on mobile screens.
- Fixed long card descriptions flipping between expanded and normal while scrolling.
- Added `features.md` and a separate Android changelog for project/site notes.

## 0.1.8.24
- Changed backup imports to merge and dedupe saved data instead of replacing current lists.
- Cleaned mobile Settings text that could render incorrectly in older Android WebViews.
- Tightened mini-panel corner placement on phones.
- Made expanded card descriptions more persistent while scrolling.
- Added multiple Android chat tabs to the future Android notes.

## 0.1.8.23
- Added long-chat performance options with lighter off-screen rendering and slower cleanup scans.
- Added an option to pause most QoL checks while a tab is not focused.
- Added fixed-corner mini-panel placement and optional dragging with saved custom positions.

## 0.1.8.22
- Changed opened-chat tracking so right-click alone no longer marks a bot as opened, while real opens still do.
- Added an Opened Chats manager with search, sorting, images, links, and remove buttons.
- Added an option to hide bots after saving them for Later.
- Refreshed card description expansion while scrolling so newly loaded cards stay expanded.

## 0.1.8.21
- Reworked chat export to read actual message blocks, group messages by speaker, and keep optional bot info separate from the transcript.

## 0.1.8.20
- Improved the Later bots manager with larger cards, better links, search, and sorting.
- Added a failed-message helper with Restore, Copy, and Resubmit controls for SpicyChat's red Resubmit error.
- Cleaned up card action placement across different card sizes.

## 0.1.8.19
- Made fresh installs start with the main extension switch enabled while optional features stay disabled.
- Added separate draft protection for Remove Messages.

## 0.1.8.18
- Added the installed extension version to the popup.

## 0.1.8.17
- Added SpicyChat's failed-message Resubmit button to the planned resend-helper work.

## 0.1.8.16
- Fixed Remove Messages clearing the user's current draft by saving and restoring only the text typed before removal mode.

## 0.1.8.15
- Added the first draft-recovery pass for Remove Messages and planned copy/unsend/resend helpers.

## 0.1.8.14
- Made cleanup safer so one failed helper no longer stops the rest of QoL.
- Fixed a DOMException in card/Later-button checks.
- Improved opened-chat tracking for right-click and middle-click opens.
- Added an option to expand longer card descriptions.

## 0.1.8.13
- Fixed the Later button not appearing on bot cards.
- Improved opened-chat tracking for right-click and middle-click opens.
- Changed the custom-name placeholder to use User as the example.

## 0.1.8.12
- Fixed chat three-dot menus being interrupted by QoL cleanup and added a short pause after important chat-menu actions.

## 0.1.8.11
- Rebuilt the changelog into versioned patch notes.
- Added chat top-bar tools for the bot title area.
- Added optional cleanup for rating, model, memory/context, voice-upsell, and memory-menu controls.
- Added a Later button and creator-favorite alignment options to the chat header.
- Added blocked-bot rating/backfill ideas to the planned list.

## 0.1.8.10
- Fixed a storage error after extension reloads or updates.
- Added Later bots with saved name, image, description, chat/profile links, Settings management, and backup/import/export support.
- Added a Changelog tab and Android section to the project files.
- Restored the card Info/Profile button beside the block X.

## 0.1.8.9
- Added sorting for blocked bots in Settings.
- Changed fresh-install defaults so optional features start disabled.
- Cleaned README/Settings wording, including the NSFW toggle and avatar-name setting.
- Improved OOC spacing and appending.
- Added the card dislike idea to the planned list.

## 0.1.8.8
- Added local favorite creators with star buttons, Settings management, and optional filtering protection.
- Added a Home-only filter for purple For You cards.
- Added a Copy button beside Narrow by tag Reset to restore the saved include/exclude tag template.

## 0.1.8.7
- Reworked OOC insertion so it appends to the active text box without overwriting existing text.

## 0.1.8.6
- Fixed blocked words matching inside unrelated words and made short entries match as words/phrases instead of random substrings.
- Rechecked previously hidden chat rows so old false positives can become visible again.
- Improved cleanup when the main extension switch is turned off.

## 0.1.8.5
- Added an option to hide large advert/promo banners such as Memory, Custom Voice, and Lorebook promos.

## 0.1.8.4
- Adjusted persona quick-button sizing.
- Added an option to keep the chat box usable while the bot is responding.
- Added an option to reduce forced scrolling while typing.
- Improved message quick-action button usability.

## 0.1.8.3
- Added model-selector cleanup with expanded descriptions and optional locked-model upgrade cleanup.
- Added quick message actions for Copy, Edit, and Report.

## 0.1.8.2
- Fixed persona names accidentally including Default and improved persona detection.
- Moved persona modal controls so the Chat with button is easier to reach.

## 0.1.8.1
- Added top-bar cleanup for language, notifications, theme, and avatar-name display.
- Fixed model-selector protection around SpicyChat's own controls.

## 0.1.8
- Added configurable text normalization for filters, search, and language checks, including fancy Unicode, punctuation, invisible characters, and decorative symbols.

## 0.1.7
- Added paging/search/sorting controls for blocked and Not interested bots.
- Added visible controls for beta listing refill and Fill now.

## 0.1.6
- Added a conservative language filter with allowed-language settings.
- Added beta listing auto-fill after cards are hidden.

## 0.1.5.1
- Fixed persona switching sometimes choosing the wrong persona or failing to confirm the change.

## 0.1.5
- Added better saved-persona detection and quick switching from the mini panel.

## 0.1.4
- Reworked Settings into clearer tabs.
- Added managers for blocked and Not interested bots plus category-based import/export.
- Added more sidebar cleanup options, favorite-page protection, soft hiding/dimming, and debug badges.

## 0.1.3
- Added background chat-list loading so longer operations can continue without tab focus.
- Added stop/cancel handling for longer chat-list loading.

## 0.1.2
- Added OOC placeholders and safer insertion behavior.
- Added stop controls for chat loading.
- Improved persona detection and opened-chat hiding behavior.

## 0.1.1
- Added chat-list search/sorting, early persona helpers, first chat export tools, and the first OOC insert button.

## 0.1.0
- Prepared the first Web Store-style baseline with cleaner public wording, a Help tab, and install notes.

## 0.0.6
- Fixed send/mic cleanup, added the card block X, and improved premium/chat-control hiding.

## 0.0.4
- Split the extension into separate files for easier patching.

## 0.0.1
- Started SpicyChat QoL with the first NSFW helper, premium cleanup, opened-chat tracking, card hiding, and bot blocking.
