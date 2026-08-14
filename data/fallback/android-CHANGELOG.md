# SpicyChat QoL Android changelog

## Current testing status
- Login and session persistence has remained stable for several days during current phone testing/using.
- Extension compatibility patch 0.1.8.40 prevents duplicate mobile mini-panel buttons and restores missing OOC/persona panel sections after chat navigation.

## Planned / in progress
- Added a Mini panel in this tab switch inside Settings so Android does not need the extension popup to control the current tab.
- Fixed the saved default for enabling the mini panel in new tabs not being restored correctly in Settings.
- Add support for multiple chat tabs so different conversations can stay open inside the app.
- Keep Google login reliable through the default browser or Android account chooser without requiring users to share login details.
- Keep QoL scripts injected across normal navigation and chat changes without forcing full page reloads.
- Preserve page position and loaded listings when returning from a chat instead of reloading the Home page.
- Improve performance in long chats and reduce unnecessary work in chats or tabs that are not currently visible.
- Keep the mobile QoL controls away from the message box, send button, chat header, and other important SpicyChat controls.
- Make opened-chat hiding work consistently across Home, Recommendations, Search, and Chats.
- Keep persona switching reliable and make the mobile "Don't show again" choice persist properly.
- Support importing and exporting extension settings, opened chats, blocked bots, Later bots, personas, OOC presets, and other saved data.
- Improve Android file handling for backups and exported chat files.
