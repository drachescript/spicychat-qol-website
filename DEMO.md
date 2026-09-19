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
