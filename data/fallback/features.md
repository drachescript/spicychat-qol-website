# SpicyChat QoL development features

Bundled website snapshot of the post-v0.2 feature catalogue. The website prefers the current public `main/features.md` whenever GitHub is reachable.

## Settings, setup and Control Center
- Searchable Settings and feature catalog with direct links to individual controls.
- Minimal / recommended setup presets, section reset tools, pinned/recent Settings sections and enabled/customized views.
- Parent/child dependency hints, Settings Health Check and read-only data-health checks.
- Control Center for saved data, storage, backups, migration previews, performance baselines and support checks.
- Safe diagnostics, performance reports and combined support reports that avoid chat text and private saved content.
- Per-tab QoL pause switch plus local runtime diagnostics/recovery helpers.
- QoL Command Palette for common actions and locally known saved items.
- Passive S.AI Toolkit detection and compatibility handling for overlapping features.

## Saved lists and bot discovery
- Bot Status Center / Saved Bots Hub for Opened history, Favorites, Later, Recently Seen, Blocked, Not Interested and other local saved states.
- Bot Organizer with folders/collections, personal tags, notes, creator-status labels and bulk organization tools.
- Favorite history, Favorite creators, Later, Recently Seen and local archive/rediscovery helpers.
- Availability and deleted/unavailable-bot helpers where public SpicyChat data can confirm status.
- Local bot copies and revisioned backups for the user's own bots.
- Search, sorting and management tools across the saved lists without merging the underlying lists together.

## Discovery filters and bot cards
- Block or hide cards by bot, name, creator, tags, words, language, opened state, groups and other saved-state rules.
- Smart Filter Presets, recommendation preferences, card density controls and side-by-side local comparison.
- Listing Refill for current paginated listings, with duplicate avoidance and supported QoL actions reattached.
- Quick Not Interested / Unblock and optional card action replacements.
- Token/profile information, exact/available message-count helpers and Lorebook listing filters/shortcuts.
- Text normalization for search/filter matching and displayed bot-card text.
- Animated-image controls and longer/cleaner card presentation options.

## Chat list and organization
- Search, filter, sort and load conversation history on `/chat` and `/chats`.
- Opened, message-count, saved-state and blocked-state chat-list filters.
- Local chat folders plus multi-select organizing.
- Saved-chat quick actions such as Change Title, Clone and Remove.
- Random Chat and rediscovery helpers for known existing conversations.

## Open-chat tools
- Chat top-bar cleanup and character shortcuts for Later, history and new chats.
- OOC presets, OOC insertion controls and a formatting toolbar for common RP markup.
- Persistent Reply Instructions with session/every-message/manual modes.
- Optional Chat Nudges using local reminders/browser notifications.
- Search Inside Current Chat, message bookmarks/notes, multiple pins and QoL Back/Forward navigation.
- Message quick actions, edit/draft guards, failed-message/resubmit helpers and scroll-position helpers.
- Scroll-to-top/bottom controls and long-history loading helpers.
- Context Keeper, Saved Text / Snippets and configurable local text replacements.
- Alternate dialogue styling and RP Format Repair without silently rewriting saved messages.
- Chat bubble appearance controls, Focus/Immersive Mode and accessibility text/spacing controls.
- Auto voice helpers using SpicyChat's native Listen control where available.
- Chat Export to text, Markdown, standalone HTML or JSON, plus browser Print / Save as PDF workflows.

## Generation and model tools
- Generation profiles for supported model/settings values.
- Timestamps, requested/actual model, generation time and captured generation settings where available.
- Model quick menu with favorites, ordering and optional hiding.
- Per-character QoL profiles for selected RP-formatting and Auto voice behavior.

## Personas
- Persona saving and quick switching.
- Persona Organizer with folders, notes, custom ordering and duplication helpers.
- Local Persona Library with backup/restore support and locally saved profile images where supported.
- Persona-related recovery/health checks for incomplete local copies.

## Creator and My Creations tools
- Creation history/snippets, editor helpers and creation-audit/report tools.
- Save & Stay / Save & Chat helpers and local organization shortcuts.
- Bot backups and revision history for the user's own creations.
- Lorebook search/filtering, entry expansion, backup helpers and creation shortcuts.
- My Creations filtering/sorting, local activity data and performance handling for large creator lists.
- PNG/JSON bot import helpers and other safe creation workflow shortcuts.

## Backup, import and local data
- Selective or Everything backups with preview before import.
- Merge/Replace only the categories actually present in an imported backup.
- Backup Manager with revisioned safety snapshots, configurable retention and optional bot-profile backups.
- Recovery snapshots before supported destructive local changes.
- Storage usage, per-dataset cleanup/deletion and local change history/Undo for supported actions.
- Download/file handling designed to work on desktop browsers and compatible Android environments.

## Appearance and interface
- Mini Panel with configurable placement, sizing and visible controls.
- Sidebar/top-bar/composer cleanup and premium/promo/banner cleanup.
- Optional local Soundscapes and custom chat backgrounds.
- Animation controls, chat text size/line spacing and QoL interface scaling.
- Mobile/compact controls for supported Android/WebView/browser environments.

## Performance, browser and compatibility
- Adaptive/Aggressive/Maximum runtime performance modes and automatic large-chat handling.
- Delay non-essential QoL while typing or editing, deep-sleep disabled features and reduce QoL animations.
- Batched/throttled listing, archive and mutation work plus long-chat stability guards.
- Duplicate-tab handling, Auto-AFK and manual tab/session analysis tools.
- Chrome/Chromium, Firefox desktop and Firefox Android development channels, plus dedicated Android/WebView compatibility work.
- Current RC work includes faster Opened tracking and smoother large My Creations/list rendering.

## Planned after v0.2
- Community interface translations and maintainable localization files.
- Exclude-languages mode in the language filter.
- Internal Storydate / Day Tracker for long RP timelines.
- RP State Tracker for per-chat inventory, clothing, injuries, location, stats, equipment and quests.
- Further unsend / failed-message recovery helpers where SpicyChat exposes a safe native path.
- Optional QoL Sync between devices while keeping manual backups separate and secrets device-local.
- Multiple Android chat tabs and further Android parity work.
- New-bot notifications and additional creator-follow/discovery helpers.
- More creator-page multi-select / bulk organization tools.
- Bot Blocking & Dislikes Settings regrouping, including making dislike-on-block explicitly opt-in/default-off.
- SpicyChat QoL Lite / custom smaller builds that can omit whole feature groups.
