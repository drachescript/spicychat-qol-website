#!/usr/bin/env python3
"""Static and pinned-source checks for the Lite EA website branch.

Uses the canonical immutable GitHub commit and Git blob SHA-1s. This is NOT
a live File System Access permission/browser test.
"""
from __future__ import annotations
import hashlib
import json
import re
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / 'lite/early-access/release.json'
PAGE = ROOT / 'lite/early-access/index.html'
SCRIPT = ROOT / 'assets/js/lite-early-access.js'
CSS = ROOT / 'assets/css/lite-early-access.css'
MINIMAL = {
    'content/core-settings-defaults.js',
    'custom/ooc-runtime-core.js',
    'content/ooc.js',
    'content/ooc-composer.js',
    'content/styles/ooc.css',
    'custom/ooc-options.html',
    'custom/ooc-options.css',
    'custom/ooc-options.js',
    'icons/icon48.png',
}


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.files = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'script' and d.get('src'):
            self.files.append(d['src'])
        if tag == 'link' and d.get('href') and 'stylesheet' in d.get('rel', ''):
            self.files.append(d['href'])


def main():
    data = json.loads(RELEASE.read_text(encoding='utf-8'))
    assert data['schema'] == 'sqol-lite-early-access/v1'
    assert data['channel'] == 'core-ooc-ea'
    assert data['features'] == ['ooc']
    assert data['status'] == 'experimental-test-only'
    assert data['source']['repository'] == 'drachescript/spicychat-qol-extension'
    assert re.fullmatch(r'[0-9a-f]{40}', data['source']['commit'])
    assert set(data['files']) == MINIMAL
    assert SCRIPT.is_file() and CSS.is_file()
    refs = References()
    refs.feed(PAGE.read_text(encoding='utf-8'))
    for ref in refs.files:
        if ref.startswith('/'):
            assert (ROOT / ref.lstrip('/')).is_file(), 'Missing site asset: ' + ref
    assert '/lite/early-access/' in (ROOT / 'lite/index.html').read_text(encoding='utf-8')

    base = 'https://raw.githubusercontent.com/{}/{}'.format(
        data['source']['repository'], data['source']['commit']
    )
    total = 0
    for path, expected in data['files'].items():
        url = base + '/' + path
        with urllib.request.urlopen(
            urllib.request.Request(url, headers={'User-Agent':'SQoL-Custom-Early-Access-Validator'}),
            timeout=25
        ) as response:
            content = response.read()
        actual = hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest()
        assert actual == expected, 'Pinned source hash mismatch: ' + path
        total += len(content)
        print('PASS', path, len(content), 'bytes')
    print('PASS early-access source pinning:', len(data['files']), 'assets,', total, 'bytes')


if __name__ == '__main__':
    main()
