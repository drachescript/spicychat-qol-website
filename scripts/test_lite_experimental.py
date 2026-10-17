#!/usr/bin/env python3
"""Experimental selectable-module website builder source/closure smoke checks.

Executed by the website branch CI. Static proof only, not live Chrome runtime.
"""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / 'lite/early-access/experimental-release.json'
PAGE = ROOT / 'lite/early-access/experimental/index.html'
SCRIPT = ROOT / 'assets/js/lite-experimental.js'


class HTMLAssets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.files = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == 'script' and data.get('src'):
            self.files.append(data['src'])
        elif tag == 'link' and 'stylesheet' in data.get('rel', '') and data.get('href'):
            self.files.append(data['href'])


def fetch_json(url):
    with urllib.request.urlopen(
        urllib.request.Request(url, headers={'User-Agent':'SQoL-Custom-Experimental-CI'}),
        timeout=35
    ) as response:
        return json.load(response)


def main():
    release = json.loads(RELEASE.read_text(encoding='utf-8'))
    assert release['schema'] == 'sqol-experimental-modules/v1'
    assert release['status'] == 'experimental-unvalidated'
    assert release['version'] == '0.2.50'
    assert release['repository'] == 'drachescript/spicychat-qol-extension'
    assert len(release['commit']) == len(release['tree']) == 40
    assert SCRIPT.is_file() and PAGE.is_file()

    refs = HTMLAssets()
    refs.feed(PAGE.read_text(encoding='utf-8'))
    for path in refs.files:
        if path.startswith('/'):
            assert (ROOT / path.lstrip('/')).is_file(), path
    assert '/lite/early-access/experimental/' in (
        ROOT / 'lite/index.html').read_text(encoding='utf-8')

    base = f"https://raw.githubusercontent.com/{release['repository']}/{release['commit']}"
    modules = fetch_json(base + '/build/modules.json')
    manifest = fetch_json(base + '/manifest.json')
    tree = fetch_json(
        f"https://api.github.com/repos/{release['repository']}/git/trees/{release['tree']}?recursive=1"
    )
    assert manifest['version'] == release['version']
    assert not tree['truncated']
    sources = {item['path'] for item in tree['tree'] if item['type'] == 'blob'}
    owners = {f for b in modules['bundles'].values() for f in b['files']}
    all_content_scripts = {f for s in manifest['content_scripts'] for f in s.get('js', [])}
    css_owners = {f for a in modules['runtimeAssets']['styles'].values() for f in a}
    all_css = {f for s in manifest['content_scripts'] for f in s.get('css', [])}
    assert all_content_scripts <= owners
    assert all_css == css_owners
    assert owners <= sources
    assert 'core' in modules['bundleOrder']
    assert len(modules['bundleOrder']) == 9

    def closure(wanted):
        selected = set()
        def walk(bundle):
            if bundle in selected:
                return
            for dep in modules['bundles'][bundle].get('dependsOn', []):
                walk(dep)
            selected.add(bundle)
        walk('core')
        for item in wanted: walk(item)
        return selected

    minimal = closure(['interface'])
    combined = closure(['chat', 'creator'])
    selected_min = {f for b in minimal for f in modules['bundles'][b]['files']}
    selected_combined = {f for b in combined for f in modules['bundles'][b]['files']}
    assert 'content/core.js' in selected_min
    assert 'content/ooc.js' not in selected_min
    assert 'content/lorebook-backup.js' not in selected_combined
    assert 'content/ooc.js' in selected_combined
    assert 'content/bot-backup.js' in selected_combined
    assert 'content/styles/ooc.css' in all_css
    assert 'background-entry.js' in sources
    assert 'options.html' in sources
    assert 'content/build-profile.js' in sources
    assert 'background/feature-build-profile.js' in sources
    print('PASS experimental module catalog:', len(modules['bundleOrder']),
          'groups,', len(owners), 'registered runtime scripts,',
          len(all_css), 'CSS; pinned to v' + release['version'])
    print('PASS dependency closure: Core+Interface', len(selected_min),
          'scripts; Chat+Creator', len(selected_combined), 'scripts')


if __name__ == '__main__':
    main()
