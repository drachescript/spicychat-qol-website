# Demo / playground architecture

The website demo is a safe compatibility sandbox, not a SpicyChat account mirror.

## Live extension source

Stable resolves the latest public normal release. Development resolves current `main`. The demo then loads the real extension Options files and feature registry inside a sandboxed iframe.

The iframe receives mock implementations of `chrome.storage`, `chrome.runtime`, `chrome.permissions`, `chrome.tabs`, `chrome.downloads`, notifications, clipboard and external navigation. Storage is scoped to website `localStorage` and split between Stable and Development.

## Fake SpicyChat surfaces

The outer playground recreates only the page structures needed to demonstrate QoL behavior. The current fixtures cover:

- Home, search, sort and opened/closed filters
- creator bot cards and chatbot profiles
- Creator Profile
- Chats and folders
- My Personas
- My Creations / Chatbots
- My Lorebooks
- chatbot create/edit
- Lorebook create/edit, Details and Entries
- individual chat and composer

Selectors such as common `data-testid`, `aria-label`, `/chat/<id>`, `/chatbot/<id>` and `/creator/<handle>` shapes are represented where they are useful for extension compatibility testing.

## Content safety

`data/demo/bots.json` contains the SFW bot cards taken from the supplied public `@dragongraf1312` creator-profile snapshot. Private chats, login/session values and private persona/lorebook contents are not copied into the site. Persona, Lorebook and message text in the sandbox is fabricated.

## v10 playground usability

The playground uses an internal scrolling content area, raw public avatar URLs for SFW creator cards, readable non-underlined chat rows, working local Persona create/edit forms, and a working local Lorebook create flow that opens the new Lorebook in the editor. These actions remain sandbox-only and never write to SpicyChat.

## v11 interaction cleanup

The card controls are grouped into fixed left/right action rows and do not use `backdrop-filter`, avoiding browser compositor blur artifacts over bot images. The QoL scroll buttons are mounted at playground level instead of only inside chat: they scroll the active playground surface when it can scroll, then fall back to the full website page when the playground is already at the requested edge or has nothing to scroll.

Dummy chats now have deterministic local preset replies from `data/demo/replies.json`. A user message is matched against simple keywords and receives a short local bot reply; unmatched text uses a generic fallback. There is no model call and no SpicyChat message/API request. Reply history is stored separately per demo bot.

Playground controls no longer claim that an unseen menu was "opened." If a captured surface exists, the control navigates to or edits that local surface. If the corresponding menu/dialog was not supplied, the visible native control is inert and labelled as unavailable in the demo rather than inventing a menu. QoL-specific controls should increasingly come from the real extension source instead of handwritten fake menus.

## Loading/failure behavior

The playground renders immediately from bundled safe fallback data. Live Stable/Development Settings source loading happens in the background with bounded timeouts and parallel file fetches. If GitHub/Worker source loading is unavailable, the playground remains usable and the Settings drawer shows a retry action instead of staying on an endless Loading state.
