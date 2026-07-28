# SpicyChat QoL Website

Static website for:

```text
https://spicychatqol.drache.uk
```

## Included

- Responsive one-page project website
- Chrome Web Store and GitHub links
- Android release placeholder
- Public Android update metadata
- Privacy policy landing page
- Custom 404 page
- GitHub Pages `CNAME`
- `.nojekyll`
- Discord domain verification file
- Open Graph card, favicon, web manifest, robots.txt, and sitemap.xml

## Publish with GitHub Pages

1. Create or open the public repository `spicychat-qol-website`.
2. Upload the **contents of this folder** to the repository root.
3. Open **Settings → Pages**.
4. Set **Source** to `Deploy from a branch`.
5. Select the `main` branch and `/ (root)`.
6. Save.
7. GitHub should detect the included `CNAME` file and use:
   `spicychatqol.drache.uk`

## Cloudflare DNS

Create this record under `drache.uk`:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | spicychatqol | drachescript.github.io | DNS only |

After GitHub accepts the domain, enable **Enforce HTTPS** under repository
**Settings → Pages**.

## Discord domain verification

The required verification file is already included at:

```text
.well-known/discord
```

Its exact contents are:

```text
dh=22ed5df8384535c1cdded7830bdefdc3536138fc
```

After deployment, this URL must display only that value:

```text
https://spicychatqol.drache.uk/.well-known/discord
```

The included `.nojekyll` file is important because it allows the `.well-known`
directory to be published by GitHub Pages.

## Updating the website's release data

Edit:

```text
updates/latest.json
```

### When the Android app is released

Change the Android object to something similar to:

```json
{
  "available": true,
  "versionName": "0.0.1",
  "versionCode": 1,
  "minimumSupportedVersionCode": 1,
  "mandatory": false,
  "status": "stable",
  "apkUrl": "https://github.com/OWNER/REPOSITORY/releases/download/v0.0.1/spicychat-qol-v0.0.1.apk",
  "releaseUrl": "https://github.com/OWNER/REPOSITORY/releases/tag/v0.0.1",
  "repositoryUrl": "https://github.com/OWNER/REPOSITORY",
  "sha256": "APK_SHA256_HERE",
  "publishedAt": "2026-07-28",
  "updateMessage": "First public Android release."
}
```

The website automatically enables the Android download button when:

- `android.available` is `true`
- `android.apkUrl` is not empty

The future Android app can compare its installed `versionCode` against the
website's `android.versionCode`.

## Privacy policy

The privacy page points to:

```text
https://docs.google.com/document/d/1sXusv78vQ_B5xawQNiEowY1meEz7XWXR4l4hCL8LbNU/edit?usp=sharing
```

## Important files

- `index.html` — main website
- `privacy.html` — privacy landing page
- `assets/css/style.css` — entire visual design
- `assets/js/site.js` — menu, tabs, year, and update metadata
- `updates/latest.json` — release/update source
- `.well-known/discord` — Discord domain verification
- `CNAME` — custom GitHub Pages domain
