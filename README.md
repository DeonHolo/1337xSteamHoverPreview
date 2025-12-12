# 1337x Steam Hover Preview

A userscript that displays Steam game information when hovering over torrent titles on 1337x. Get instant access to game details without leaving the page!

![Preview](https://i.imgur.com/ENXaBgw.png)

## ✨ Features

- **🖼️ Game Thumbnail** - Steam header image displayed in tooltip
- **📝 Description** - Short game description from Steam
- **⭐ Steam Ratings** - Visual star rating with review summary and count
- **🏷️ User-Defined Tags** - Actual Steam community tags (Survival Horror, RPG, etc.)
- **📅 Release Date** - Game release information
- **🎮 Open on Steam** - Direct link to Steam store page
- **🧲 Magnet Download** - One-click magnet link download from tooltip
- **⚡ Smart Caching** - Persistent cache across sessions (24hr TTL)
- **🔄 Background Preloading** - Preloads game data when tab is idle

## 📦 Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://www.greasespot.net/)

2. Install the script:
   - **[Install from Greasy Fork](https://greasyfork.org/en/scripts/533774-1337x-steam-hover-preview)** (Recommended)
   - Or copy the script manually from this repo

## 🌐 Supported Sites

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

## 🎯 How It Works

1. Hover over any game torrent title
2. The script extracts the game name from the torrent title
3. Searches Steam for a matching game
4. Displays a beautiful tooltip with game information
5. Data is cached for instant access on subsequent hovers

## ⚙️ Technical Details

- **API Used**: Steam Store API + Steam Store Page scraping
- **Cache Duration**: 24 hours (persistent) / 15 minutes (memory)
- **Rate Limiting**: 50ms minimum between API requests
- **Preloading**: Concurrent fetching when tab is hidden

## 📋 Changelog

### v3.4.0
- 🏷️ Now displays actual Steam user-defined tags instead of genres/categories
- Tags now match exactly what's shown on Steam store pages

### v3.3.1
- 🧲 Added Magnet Download button in tooltip
- ⚡ Improved background preloading with concurrent fetches
- 💾 Added persistent caching across browser sessions

## 📄 License

MIT License - feel free to use and modify!

## 👤 Author

**DeonHolo**
- [Greasy Fork Profile](https://greasyfork.org/en/users/1340389-deonholo)
- [GitHub](https://github.com/DeonHolo)
