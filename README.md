<p align="center">
  <img src="https://i.imgur.com/GX3lUNF.png" alt="1337x Logo" width="200">
</p>

# 1337x Steam Hover Preview

A userscript that displays Steam game information when hovering over game torrent titles on 1337x. Get Steam details, screenshots, trailers, store links, and magnet actions without leaving the torrent list.

![Preview](https://i.imgur.com/ggAFfuB.png)

The preview screenshot above was taken with the [Dark Reader](https://darkreader.org/) browser extension enabled. The script still fully supports the original 1337x light mode; Dark Reader only changes the page/theme colors.

## Wiki and Code Review

The [project wiki](docs/wiki/Home.md) covers behavior and architecture. The current **unpublished 5.00 draft** includes [title search inside the chooser](docs/wiki/Search-by-Name.md), plus [matching fixes and a plain-language explanation](docs/wiki/Matching-Explained.md). Use the [Markdown release checklist](RELEASE_CHECKLIST.md) and [paste-ready Greasy Fork changelog](GREASYFORK_CHANGELOG.md) to review this release. Older patch labels in dated test reports are internal development snapshots, not public releases.

## Features

- **Steam Media Carousel** - Steam header image first, with screenshots and click-to-play videos when available
- **Thumbnail Strip** - Quickly jump between available Steam media without leaving the hover card
- **Theatre Mode** - Open screenshots and trailers in a larger Steam-style media viewer with navigation, video controls, and fullscreen support
- **Description** - Short game description from Steam
- **Steam Reviews** - Original plain Rating row with stars, Steam category and actual review count, plus distinct zero/error states
- **Actual Steam Tags First** - Real Steam tags in the first meaningful preview, with no genre substitution
- **Release Date** - Game release information
- **Open on Steam** - Direct Steam store link from the hover card and theatre footer
- **Magnet Download** - One-click magnet link download from the hover card and theatre footer
- **Smart Matching** - Prefers the main Steam game page over DLC, upgrades, season passes, and store extras
- **Field-Level Caching** - Persistent AppID data, independently refreshed tags/reviews, saved match corrections, and safe cross-tab merging
- **Tags-First Preloading** - Configurable nearby/full-page warming, including bounded background-tab loading

## Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://www.greasespot.net/)

2. Install the script:
   - **[Install from Greasy Fork](https://greasyfork.org/en/scripts/533774-1337x-steam-hover-preview)** (Recommended)
   - Or copy the script manually from this repo

## Supported Sites

The script works on all 1337x mirror domains:

- `1337x.to`
- `1337x.ws`
- `1337x.is`
- `1337x.gd`
- `x1337x.cc`
- `1337x.st`
- `x1337x.ws`
- `1337x.eu`
- `1337x.se`
- And more...

## How It Works

1. Hover over any game torrent title
2. The script extracts and cleans the game name from the torrent title
3. Searches Steam for a matching base game
4. Displays a tooltip with Steam information and browsable media when available
5. Open theatre mode for larger screenshots or trailers, or use the Steam/magnet actions directly
6. Data is cached for instant access on subsequent hovers

## Technical Details

- **Data**: Official keyless Steam review API, single-AppID storefront details/search, and Steam store-page tag parsing. No SteamDB scraping.
- **Matching**: Confidence-checked base games, verified DLC parents, and persistent per-listing corrections.
- **Cache**: Details/tags fresh for 24 hours; review freshness is 15 minutes for new/unknown/upcoming releases and 3 hours otherwise. Usable stale tags refresh in the background.
- **Preload**: Nearby rows by default; Entire page and On hover only available in the userscript menu. Runnable hidden tabs warm serially; sleeping/discarded/closed tabs cannot run it.
- **Development**: Shared source, reproducible standalone builds, dependency locks, lint/format, unit/browser tests, and CI. See [CONTRIBUTING](CONTRIBUTING.md).
- **Action icons**: Bundled SVGs; see [third-party notices](THIRD_PARTY_NOTICES.md).

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**DeonHolo**

- [Greasy Fork Profile](https://greasyfork.org/en/users/1340389-deonholo)
- [GitHub](https://github.com/DeonHolo)
