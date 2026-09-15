# SpicyChat QoL Android development notes

Android is tracked separately from the browser extension. The dedicated app is still an active development/testing wrapper and does not promise exact feature parity with the current browser DEV build.

## Current direction
- Keep the embedded QoL bundle synchronized with browser DEV where the same feature can work safely inside Android WebView.
- Keep login/session handling persistent, including flows that hand Google login to the normal browser/account chooser.
- Keep SpicyChat links, chat/profile navigation and normal page changes inside the app where appropriate instead of unexpectedly escaping to an external browser.
- Keep Android file import/export reliable for QoL settings, backups and supported chat/data exports.
- Keep the QoL Settings entry as its own mobile control instead of overlapping SpicyChat's language selector or other native buttons.
- Preserve scroll/list state when returning from a chat where possible instead of needlessly reloading Home.

## Known Android-specific work
- Opened/Later/list filtering can still need wrapper-specific fixes when SpicyChat changes how cards are loaded.
- Persona switching and the mobile “Don't show again” behavior need to stay reliable across app restarts/navigation.
- Mobile placement must avoid the composer, send button, chat header and other native SpicyChat controls.
- Internal profile/chat links should stay in the app unless the link genuinely belongs outside it.
- Long chats and repeated navigation continue to get performance/stability work.

## Planned
- Multiple chat tabs are opt-in only and remain disabled by default until the Android implementation is ready.
- Continue creator/tool parity where the browser feature can be supported safely in the wrapper.
- Keep Android release/update metadata separate from browser-extension version numbers.

## Other Android ways to run QoL
- Titanium or Kiwi Browser can run the Chrome extension on supported Android setups.
- Firefox Android can use the Firefox QoL build where the current Firefox release supports installation.
- Waterfox Android's Gecko version can be compatible, but arbitrary third-party XPI installation is currently the limiting factor rather than QoL itself.
