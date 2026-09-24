#!/usr/bin/env python3
"""Refresh the public browser-store counts used by /portfolio.

Firefox has a public AMO API. Chrome does not expose the same simple public
user-count API, so the script tries to parse the public listing and falls back
to the last confirmed value if Google changes/blocks the page.

The file is only rewritten when a count actually changes. That way the scheduled
workflow does not create a useless commit every day just to update a timestamp.
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "portfolio-stats.json"

AMO_API = "https://addons.mozilla.org/api/v5/addons/addon/dragonscript-spicychat-qol-dev/"
AMO_PAGE = "https://addons.mozilla.org/en-US/firefox/addon/dragonscript-spicychat-qol-dev/"
CHROME_PAGE = "https://chromewebstore.google.com/detail/spicychat-qol/jdbhnaohfjnmkfpfddnjilmpaemkmabh?hl=en-GB"
UA = "Mozilla/5.0 (compatible; SpicyChatQoL-PortfolioStats/1.0; +https://spicychatqol.drache.uk/)"


def existing() -> dict:
    return json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}


def text(url: str) -> str:
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "en-GB,en;q=0.9"})
    with urlopen(req, timeout=25) as response:
        return response.read().decode("utf-8", "replace")


def get_firefox_users() -> int:
    data = json.loads(text(AMO_API))
    value = int(data["average_daily_users"])
    if value < 0:
        raise ValueError("invalid AMO user count")
    return value


def get_chrome_users() -> int:
    html = text(CHROME_PAGE)
    patterns = (
        r'"userCount"\s*:\s*"?([0-9][0-9,.]*)',
        r'"users"\s*:\s*"?([0-9][0-9,.]*)',
        r'([0-9][0-9,.]*)\s+users\b',
        r'([0-9][0-9,.]*)\s+user\b',
    )
    for pattern in patterns:
        for match in re.finditer(pattern, html, re.I):
            raw = re.sub(r"[^0-9]", "", match.group(1))
            if raw:
                value = int(raw)
                if 0 <= value <= 1_000_000:
                    return value
    raise ValueError("could not find public Chrome user count in listing HTML")


def main() -> None:
    old = existing()
    chrome_old = int(old.get("chrome", {}).get("users", 27))
    firefox_old = int(old.get("firefox", {}).get("users", 16))

    try:
        chrome = get_chrome_users()
    except Exception as exc:
        chrome = chrome_old
        print(f"Chrome refresh failed, keeping {chrome_old}: {exc}")

    try:
        firefox = get_firefox_users()
    except Exception as exc:
        firefox = firefox_old
        print(f"Firefox refresh failed, keeping {firefox_old}: {exc}")

    if chrome == chrome_old and firefox == firefox_old:
        print(f"No count change: Chrome {chrome}, Firefox {firefox}")
        return

    now = datetime.now(timezone.utc)
    day = now.date().isoformat()
    history = list(old.get("history") or [])
    point = {"date": day, "chromeUsers": chrome, "firefoxUsers": firefox}
    if history and history[-1].get("date") == day:
        history[-1] = point
    else:
        history.append(point)

    chrome_block = dict(old.get("chrome") or {})
    chrome_block.update({"users": chrome, "status": "cached", "source": CHROME_PAGE.split("?", 1)[0], "metric": "public store user count"})
    firefox_block = dict(old.get("firefox") or {})
    firefox_block.update({"users": firefox, "status": "cached", "source": AMO_PAGE, "metric": "average daily users / public listing user count"})

    result = {
        "updatedAt": now.replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "chrome": chrome_block,
        "firefox": firefox_block,
        "history": history[-365:],
    }
    OUT.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"Updated counts: Chrome {chrome_old} → {chrome}; Firefox {firefox_old} → {firefox}")


if __name__ == "__main__":
    main()
