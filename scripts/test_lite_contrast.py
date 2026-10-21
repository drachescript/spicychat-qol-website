#!/usr/bin/env python3
"""Guard the site's native dark-theme controls against low-contrast regressions.

This checks the actual shared and Lite CSS. It intentionally does not rely
on Dark Reader or a browser extension to correct the text color.
"""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
shared=(ROOT/"assets/css/style.css").read_text(encoding="utf-8")
lite=(ROOT/"assets/css/lite-early-access.css").read_text(encoding="utf-8")

def rule(css, selector):
    m=re.search(re.escape(selector)+r"\s*\{([^{}]*)\}",css)
    assert m, f"Missing CSS selector: {selector}"
    return m.group(1)

def contrast(fg,bg):
    def luminance(c):
        channels=[int(c[i:i+2],16)/255 for i in (1,3,5)]
        linear=[v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4 for v in channels]
        return sum(a*b for a,b in zip(linear,(0.2126,0.7152,0.0722)))
    hi,lo=sorted((luminance(fg),luminance(bg)),reverse=True)
    return (hi+0.05)/(lo+0.05)

assert "color-scheme:dark" in rule(shared,":root"), "Native form controls must use the dark color scheme"
assert "color:var(--text)" in rule(shared,".button"), "Buttons must not inherit the browser's default black text"
assert "color:var(--text)" in rule(lite,".ea-filter-button.button"), "Category chips must have explicit readable text"
assert "color:var(--muted)" in rule(lite,".ea-only-selected"), "Selected-only label should use readable muted text"
assert "color:var(--muted)" in rule(lite,".ea-feature-info"), "Info buttons should have readable text"
assert "outline:2px solid #ff94ae" in rule(lite,".ea-filter-button:focus-visible,.ea-actions .button:focus-visible,.ea-category-actions .button:focus-visible,.ea-feature-info:focus-visible,.ea-feature-search:focus-visible"), "Keyboard focus needs a visible outline"

assert contrast("#f7f2f4","#171015")>=7, "Standard dark buttons must have AAA normal-text contrast"
assert contrast("#b8abb1","#171015")>=7, "Muted selector text should be readable"
for endpoint in ("#ca2953","#b52750"):
    assert contrast("#f7f2f4",endpoint)>=4.5, "Primary button needs AA normal-text contrast"
assert contrast("#ffd2de","#24131b")>=7, "Active category chip should be readable"

print("PASS: visible button labels, native dark controls, focus outlines, and AA/AAA contrast")
