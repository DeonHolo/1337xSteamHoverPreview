<p align="center">
  <img src="https://i.imgur.com/GX3lUNF.png" alt="1337x Logo" width="200">
</p>

# 1337x Steam Hover Preview

A userscript that displays Steam game information when hovering over game torrent titles on 1337x. Get Steam details, screenshots, trailers, store links, and magnet actions without leaving the torrent list.

![Preview](https://i.imgur.com/ggAFfuB.png)

The preview screenshot above was taken with the [Dark Reader](https://darkreader.org/) browser extension enabled. The script still fully supports the original 1337x light mode; Dark Reader only changes the page/theme colors.

## Features

- **Steam Media Carousel** - Steam header image first, with screenshots and click-to-play videos when available
- **Thumbnail Strip** - Quickly jump between available Steam media without leaving the hover card
- **Theatre Mode** - Open screenshots and trailers in a larger Steam-style media viewer with navigation, video controls, and fullscreen support
- **Description** - Short game description from Steam
- **Steam Ratings** - Visual star rating with review summary and count
- **User-Defined Tags** - Actual Steam community tags from the Steam store page when available, with genres as fallback
- **Release Date** - Game release information
- **Open on Steam** - Direct Steam store link from the hover card and theatre footer
- **Magnet Download** - One-click magnet link download from the hover card and theatre footer
- **Smart Matching** - Prefers the main Steam game page over DLC, upgrades, season passes, and store extras
- **Smart Caching** - Persistent cache across sessions (24hr TTL), including media metadata
- **Background Preloading** - Preloads game data when the tab is idle

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

- **API Used**: Steam Store API + Steam Store Page scraping
- **Cache Duration**: 24 hours for successful Steam data / 15 minutes for failed lookups
- **Rate Limiting**: 50ms minimum between API requests
- **Preloading**: Concurrent fetching when tab is hidden
- **Game Filtering**: Activates for game category pages, game icons, known game uploaders, and common repack markers

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**DeonHolo**

- [Greasy Fork Profile](https://greasyfork.org/en/users/1340389-deonholo)
- [GitHub](https://github.com/DeonHolo)
