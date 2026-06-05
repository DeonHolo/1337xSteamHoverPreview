// ==UserScript==
// @name         1337x - Steam Hover Preview 
// @namespace    https://greasyfork.org/en/users/1340389-deonholo
// @version      4.1
// @description  On-hover Steam media, description, Steam Ratings, user-defined tags (same as Steam store page), release date, and direct Steam/magnet links for 1337x game torrent titles
// @icon         https://greasyfork.s3.us-east-2.amazonaws.com/x432yc9hx5t6o2gbe9ccr7k5l6u8
// @author       DeonHolo
// @license      MIT
// @match        *://*.1337x.to/*
// @match        *://*.1337x.ws/*
// @match        *://*.1337x.is/*
// @match        *://*.1337x.gd/*
// @match        *://*.x1337x.cc/*
// @match        *://*.1337x.st/*
// @match        *://*.x1337x.ws/*
// @match        *://*.1337x.eu/*
// @match        *://*.1337x.se/*
// @match        *://*.x1337x.eu/*
// @match        *://*.x1337x.se/*
// @match        http://l337xdarkkaqfwzntnfk5bmoaroivtl6xsbatabvlb52umg6v3ch44yd.onion/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      store.steampowered.com
// @connect      steamcdn-a.akamaihd.net
// @run-at       document-idle
// ==/UserScript==

(() => {
    'use strict';

    const tip = document.createElement('div');
    tip.className = 'steamHoverTip';
    const theatre = document.createElement('div');
    theatre.className = 'csrinruSteamTheatre';
    theatre.setAttribute('role', 'dialog');
    theatre.setAttribute('aria-modal', 'true');
    theatre.setAttribute('aria-hidden', 'true');
    const SEL = 'table.torrent-list td.name a[href^="/torrent/"], table.torrents td.name a[href^="/torrent/"], table.table-list td.name a[href^="/torrent/"]';
    const MIN_INTERVAL = 50;
    const MAX_CACHE = 100;
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for persistent cache
    const MEMORY_CACHE_TTL = 15 * 60 * 1000; // 15 min for failed lookups during session
    const HIDE_DELAY = 100;
    const FADE_DURATION = 180;
    const API_TIMEOUT = 8000;
    const SHOW_DELAY = 0;
    const STORAGE_KEY = 'steamHoverCache_v2';
    const CONCURRENT_VISIBLE = 3; // Fetch 3 games at once when tab is visible
    const CONCURRENT_HIDDEN = 4; // Fetch 4 games at once when tab is hidden
    const PRIORITY_PRELOAD_COUNT = 15; // Warm the top rows first
    const CONCURRENT_TAG_VISIBLE = 1; // Scrape real tags gently while browsing
    const CONCURRENT_TAG_HIDDEN = 3; // Scrape real tags faster in background tabs
    const MAX_SEARCH_CANDIDATES = 5; // Check top Steam results to avoid DLC/store-extra mismatches
    const DEBUG_MODE = false; // Set to true for debugging

    // Game detection - URL-based + uploader name detection
    const isGameCategoryPage = /\/(Games|category-search\/[^\/]+\/Games)\//i.test(window.location.pathname);

    // Known game uploaders/repackers
    const GAME_UPLOADERS = [
        'fitgirl', 'dodi', 'elamigos', 'kaoskrew', 'kaos', 'johncena141',
        'masquerade', 'gnarly', 'cpasbien', 'rg mechanics', 'flt', 'codex',
        'plaza', 'skidrow', 'razor1911', 'prophet', 'reloaded', 'hoodlum',
        'darksiders', 'empress', 'tenoke', 'tinyiso', 'gog', 'igggamescom',
        'igggames', 'ovagames', 'xatab', 'r.g. catalyst', 'decepticon',
        'heroskeep', 'gamedrive', 'emadmoner'
    ];

    function isGameTorrent(link) {
        // If we're on a Games category page, all torrents are games
        if (isGameCategoryPage) return true;

        const row = link.closest('tr');
        if (!row) return false;

        const titleText = link.textContent.toLowerCase();

        // EXCLUSION: Skip if title contains software keywords
        const softwareKeywords = [
            'adobe', 'photoshop', 'illustrator', 'premiere', 'after effects', 'acrobat',
            'microsoft', 'office', 'windows', 'visual studio', 'autocad', 'matlab',
            'pdf', 'antivirus', 'vmware', 'virtualbox', 'driver', 'daemon tools',
            'spotify', 'netflix', 'vlc', 'winrar', 'idm', 'internet download',
            'fl studio', 'ableton', 'logic pro', 'cubase', 'pro tools',
            'final cut', 'davinci', 'sony vegas', 'camtasia', 'obs studio',
            'malwarebytes', 'avast', 'kaspersky', 'norton', 'bitdefender',
            'ccleaner', 'teamviewer', 'anydesk', 'zoom', 'discord', 'slack',
            'android', 'apk', 'mod apk', 'ipa', 'ios app'
        ];
        if (softwareKeywords.some(kw => titleText.includes(kw))) {
            return false;
        }

        // EXCLUSION: Known software uploaders
        const uploaderLink = row.querySelector('td a[href*="/user/"]');
        const uploaderName = uploaderLink ? uploaderLink.textContent.trim().toLowerCase() : '';
        const softwareUploaders = ['crackshash', 'appdoze', 'haxnode', 'softwarecave'];
        if (softwareUploaders.some(u => uploaderName.includes(u))) {
            return false;
        }

        // DETECTION: Check for game/PC icons
        const nameCell = link.closest('td');
        if (nameCell) {
            const gameIcon = nameCell.querySelector('i.flaticon-games, i.flaticon-apps');
            if (gameIcon) return true;
        }

        // DETECTION: Known game uploaders
        if (uploaderLink && GAME_UPLOADERS.some(u => uploaderName.includes(u))) {
            return true;
        }

        // DETECTION: Title contains repacker markers
        const titleMarkers = ['fitgirl', 'dodi', 'elamigos', 'plaza', 'codex', 'skidrow', 'repack', 'gog'];
        if (titleMarkers.some(m => titleText.includes(m))) {
            return true;
        }

        return false;
    }

    // Debug logger helper
    function debugLog(...args) {
        if (DEBUG_MODE) console.log('[Steam Hover]', ...args);
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Flag to pause preloading when user is actively hovering
    let userHovering = false;
    let isPageHidden = document.hidden || false;

    // Page Visibility API - detect when user leaves/returns
    document.addEventListener('visibilitychange', () => {
        isPageHidden = document.hidden;
        if (isPageHidden) {
            console.log('[Steam Hover] Tab hidden - enabling fast preload mode');
        } else {
            console.log('[Steam Hover] Tab visible - switching to normal mode');
        }
    });

    // Persistent cache: Load from storage on init
    function loadPersistentCache() {
        try {
            const stored = GM_getValue(STORAGE_KEY, null);
            if (stored) {
                const parsed = JSON.parse(stored);
                const now = Date.now();
                let loaded = 0;
                for (const [key, value] of Object.entries(parsed)) {
                    // Only load if not expired AND has valid data (skip null entries!)
                    if (value.data && value.ts && (now - value.ts) < CACHE_TTL) {
                        apiCache.set(key, value);
                        loaded++;
                    }
                }
                console.log(`[Steam Hover] Loaded ${loaded} cached games from storage`);
            }
        } catch (e) {
            console.warn('[Steam Hover] Failed to load persistent cache:', e);
        }
    }

    // Persistent cache: Save to storage (debounced)
    let saveTimeout = null;
    function savePersistentCache() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            try {
                const obj = {};
                const now = Date.now();
                for (const [key, value] of apiCache.entries()) {
                    // Only save valid entries that aren't expired
                    if (value.data && value.ts && (now - value.ts) < CACHE_TTL) {
                        obj[key] = value;
                    }
                }
                GM_setValue(STORAGE_KEY, JSON.stringify(obj));
            } catch (e) {
                console.warn('[Steam Hover] Failed to save persistent cache:', e);
            }
        }, 1000); // Debounce saves by 1 second
    }

    // Expose cache clearing function to console
    window.clearSteamHoverCache = function () {
        apiCache.clear();
        inFlightFetches.clear();
        inFlightTagFetches.clear();
        GM_setValue(STORAGE_KEY, '{}');
        console.log('[Steam Hover] ✅ Cache cleared! Refresh the page to re-fetch all games.');
    };

    function getFreshCacheEntry(name, now = Date.now()) {
        const hit = apiCache.get(name);
        if (!hit) return null;

        if (now - hit.ts < (hit.data ? CACHE_TTL : MEMORY_CACHE_TTL)) {
            return hit;
        }

        apiCache.delete(name);
        return null;
    }

    // Concurrent fetch helper for preload mode
    async function fetchBatch(names) {
        await Promise.all(names.map(name => fetchSteamWithFallback(name).catch(() => null)));
    }

    async function waitForPreloadTurn() {
        while (userHovering && !isPageHidden) {
            await delay(200);
        }
    }

    function getPreloadNames() {
        const links = Array.from(document.querySelectorAll(SEL));
        const seen = new Set();
        const ranked = [];

        links.forEach((link, index) => {
            // Only preload game torrents
            if (!isGameTorrent(link)) return;

            const name = cleanName(link.textContent);
            if (!name || seen.has(name) || getFreshCacheEntry(name)) return;

            seen.add(name);
            const rect = link.getBoundingClientRect();
            ranked.push({
                name,
                index,
                inViewport: rect.bottom >= 0 && rect.top <= window.innerHeight
            });
        });

        return ranked
            .sort((a, b) => Number(b.inViewport) - Number(a.inViewport) || a.index - b.index)
            .map(item => item.name);
    }

    async function preloadNames(names) {
        let i = 0;
        while (i < names.length) {
            await waitForPreloadTurn();

            const batchSize = isPageHidden ? CONCURRENT_HIDDEN : CONCURRENT_VISIBLE;
            const batch = names.slice(i, i + batchSize);
            await fetchBatch(batch);
            i += batchSize;
            await delay(isPageHidden ? MIN_INTERVAL : MIN_INTERVAL * 2);
        }
    }

    async function preloadTagsForNames(names) {
        let i = 0;
        while (i < names.length) {
            await waitForPreloadTurn();

            const batchSize = isPageHidden ? CONCURRENT_TAG_HIDDEN : CONCURRENT_TAG_VISIBLE;
            const batch = names.slice(i, i + batchSize);
            await Promise.all(batch.map(async (name) => {
                const data = await fetchSteamWithFallback(name).catch(() => null);
                if (data) await warmSteamTags(data);
            }));
            i += batchSize;
            await delay(isPageHidden ? MIN_INTERVAL * 2 : MIN_INTERVAL * 8);
        }
    }

    async function preloadAll() {
        const names = getPreloadNames();
        console.log(`[Steam Hover] Preloading ${names.length} games...`);

        await preloadNames(names.slice(0, PRIORITY_PRELOAD_COUNT));
        await preloadNames(names.slice(PRIORITY_PRELOAD_COUNT));

        console.log(`[Steam Hover] Preloading complete!`);
        console.log(`[Steam Hover] Warming Steam tags in the background...`);
        await preloadTagsForNames(names);
        console.log(`[Steam Hover] Steam tag warming complete!`);
    }

    // Start preloading after page is idle
    window.addEventListener('load', () => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => preloadAll(), { timeout: 3000 });
        } else {
            setTimeout(preloadAll, 2000);
        }
    });

    GM_addStyle(`
        .steamHoverTip {
            position: absolute;
            padding: 8px;
            background: rgb(240, 240, 240);
            border: 1px solid #555;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
            z-index: 2147483647;
            max-width: 420px;
            font-size: 12px;
            line-height: 1.45;
            display: none;
            white-space: normal !important;
            overflow-wrap: break-word;
            color: #111;
            opacity: 0;
            transition: opacity ${FADE_DURATION}ms ease-in-out;
            pointer-events: none;
        }
 
        .steamHoverTip p {
            margin: 0 0 5px 0;
            padding: 0;
        }
        .steamHoverTip p:last-child {
            margin-bottom: 0;
        }
        .steamHoverTip img {
            display: block;
            width: 100%;
            margin-bottom: 8px;
            border-radius: 2px;
        }
        .steamHoverTip .steamMediaShell {
            margin-bottom: 8px;
        }
        .steamHoverTip .steamMediaFrame {
            position: relative;
            width: 100%;
            aspect-ratio: 460 / 215;
            overflow: hidden;
            background: #111;
            border-radius: 2px;
        }
        .steamHoverTip .steamMediaViewport {
            width: 100%;
            height: 100%;
            background: #111;
        }
        .steamHoverTip .steamMediaImage,
        .steamHoverTip .steamMediaPoster,
        .steamHoverTip .steamMediaVideo {
            display: block;
            width: 100%;
            height: 100%;
            margin: 0;
            border-radius: 0;
            object-fit: cover;
        }
        .steamHoverTip .steamMediaVideo {
            background: #000;
        }
        .steamHoverTip .steamMediaError {
            display: grid;
            place-items: center;
            gap: 6px;
            width: 100%;
            height: 100%;
            padding: 12px;
            background: #151515;
            color: #d6e8ee;
            font-size: 12px;
            text-align: center;
            box-sizing: border-box;
        }
        .steamHoverTip .steamMediaError a,
        .csrinruSteamTheatreError a {
            color: #99d2f7 !important;
            font-weight: bold;
            text-decoration: underline;
        }
        .steamHoverTip .steamMediaNavBtn {
            position: absolute;
            top: 50%;
            display: grid;
            place-items: center;
            width: 26px;
            height: 36px;
            margin: 0;
            padding: 0;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: rgba(0, 0, 0, 0.58);
            color: #f2f2f2;
            font: bold 19px/1 Arial, sans-serif;
            cursor: pointer;
            opacity: 0.82;
            touch-action: manipulation;
            transform: translateY(-50%);
        }
        .steamHoverTip .steamMediaNavBtn:hover,
        .steamHoverTip .steamMediaNavBtn:focus {
            opacity: 1;
            background: rgba(0, 0, 0, 0.74);
            outline: 1px solid #99d2f7;
        }
        .steamHoverTip .steamMediaPrevBtn {
            left: 5px;
        }
        .steamHoverTip .steamMediaNextBtn {
            right: 5px;
        }
        .steamHoverTip .steamMediaCounter {
            position: absolute;
            top: 6px;
            right: 6px;
            padding: 1px 5px;
            background: rgba(0, 0, 0, 0.68);
            border-radius: 3px;
            color: #d6e8ee;
            font: normal 10px/1.35 Verdana, Helvetica, Arial, sans-serif;
            letter-spacing: 0;
        }
        .steamHoverTip .steamMediaPlayBtn {
            position: relative;
            display: block;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            border: 0;
            background: #111;
            cursor: pointer;
            touch-action: manipulation;
        }
        .steamHoverTip .steamMediaPlayBtn:hover .steamMediaPlayIcon,
        .steamHoverTip .steamMediaPlayBtn:focus .steamMediaPlayIcon {
            background: rgba(0, 0, 0, 0.78);
            outline: 1px solid #99d2f7;
        }
        .steamHoverTip .steamMediaPlayIcon {
            position: absolute;
            top: 50%;
            left: 50%;
            display: grid;
            place-items: center;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.62);
            color: #f2f2f2;
            font-size: 24px;
            line-height: 1;
            transform: translate(-50%, -50%);
        }
        .steamHoverTip .steamMediaThumbStrip {
            display: flex;
            gap: 3px;
            margin-top: 4px;
            overflow-x: auto;
            scrollbar-width: thin;
            scrollbar-color: #40566a #151515;
        }
        .steamHoverTip .steamMediaThumbStrip::-webkit-scrollbar {
            height: 6px;
        }
        .steamHoverTip .steamMediaThumbStrip::-webkit-scrollbar-track {
            background: #151515;
        }
        .steamHoverTip .steamMediaThumbStrip::-webkit-scrollbar-thumb {
            background: #40566a;
            border-radius: 999px;
        }
        .steamHoverTip .steamMediaThumbBtn {
            position: relative;
            flex: 0 0 52px;
            width: 52px;
            height: 32px;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #111;
            border: 1px solid #333;
            border-radius: 2px;
            cursor: pointer;
            opacity: 0.74;
            touch-action: manipulation;
        }
        .steamHoverTip .steamMediaThumbStripFit {
            overflow-x: hidden;
        }
        .steamHoverTip .steamMediaThumbStripFit .steamMediaThumbBtn {
            flex: 1 1 0;
            width: auto;
            min-width: 0;
        }
        .steamHoverTip .steamMediaThumbBtn:hover,
        .steamHoverTip .steamMediaThumbBtn:focus {
            opacity: 1;
            border-color: #99d2f7;
            outline: 1px solid rgba(153, 210, 247, 0.62);
        }
        .steamHoverTip .steamMediaThumbActive {
            opacity: 1;
            border-color: #99d2f7;
            box-shadow: 0 0 0 1px rgba(153, 210, 247, 0.45);
        }
        .steamHoverTip .steamMediaThumbImage {
            display: block;
            width: 100%;
            height: 100%;
            margin: 0;
            border-radius: 0;
            object-fit: cover;
        }
        .steamHoverTip .steamMediaThumbPlayIcon {
            position: absolute;
            right: 3px;
            bottom: 3px;
            display: grid;
            place-items: center;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.72);
            color: #f2f2f2;
            font-size: 10px;
            line-height: 1;
        }
        .steamHoverTip .steamMediaExpandBtn {
            position: absolute;
            top: 6px;
            left: 6px;
            display: grid;
            place-items: center;
            width: 24px;
            height: 24px;
            margin: 0;
            padding: 0;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: rgba(0, 0, 0, 0.58);
            color: #f2f2f2;
            font: bold 16px/1 Arial, sans-serif;
            cursor: pointer;
            opacity: 0.82;
            touch-action: manipulation;
        }
        .steamHoverTip .steamMediaExpandBtn:hover,
        .steamHoverTip .steamMediaExpandBtn:focus {
            opacity: 1;
            background: rgba(0, 0, 0, 0.74);
            outline: 1px solid #99d2f7;
        }
        .steamHoverTip .steamTheatreIcon,
        .csrinruSteamTheatre .steamTheatreIcon {
            position: relative;
            display: block;
            width: 17px;
            height: 11px;
            border: 2px solid currentColor;
            border-radius: 1px;
            box-sizing: border-box;
        }
        .steamHoverTip .steamTheatreIcon::after,
        .csrinruSteamTheatre .steamTheatreIcon::after {
            content: '';
            position: absolute;
            left: 4px;
            right: 4px;
            bottom: -5px;
            height: 2px;
            background: currentColor;
            opacity: 0.72;
        }
        .steamHoverTip .steamMediaExpandHidden {
            display: none;
        }
        .steamHoverTip strong {
            color: #000;
        }
        .steamHoverTip .steamRating,
        .steamHoverTip .steamTags,
        .steamHoverTip .steamReleaseDate {
            margin-top: 8px;
            font-size: 12px;
            color: #333;
        }
        .steamHoverTip .steamReleaseDate {
            margin-top: 2px;
            font-size: 11px;
            color: #555;
        }
        .steamHoverTip .steamTags strong,
        .steamHoverTip .steamRating strong {
            color: #111;
            margin-right: 4px;
        }
        .steamHoverTip .ratingStars {
            color: #f5c518;
            margin-right: 6px;
            letter-spacing: 1px;
            font-size: 14px;
            display: inline-block;
            vertical-align: middle;
        }
        .steamHoverTip .ratingText {
            vertical-align: middle;
        }
        .steamHoverTip a,
        .steamHoverTip a:visited {
            color: #0645ad !important;
            text-decoration: underline;
            cursor: pointer;
        }
        .steamHoverTip a:hover,
        .steamHoverTip a:visited:hover {
            color: #043b91 !important;
        }
        .steamHoverTip .loadingContainer {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .steamHoverTip .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid #ddd;
            border-top-color: #1b2838;
            border-radius: 50%;
            animation: steamSpinner 0.8s linear infinite;
            flex-shrink: 0;
        }
        @keyframes steamSpinner {
            to { transform: rotate(360deg); }
        }

        /* Magnet Download Button in Tooltip - matches existing link style */
        .steamHoverTip .magnetDownloadBtn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 0;
            margin: 0;
            border: none;
            background: none;
            color: #0645ad !important;
            font-size: 12px;
            cursor: pointer;
            text-decoration: underline;
            font-family: inherit;
        }
        .steamHoverTip .magnetDownloadBtn:hover {
            color: #043b91 !important;
        }
        .steamHoverTip .magnetDownloadBtn.loading {
            pointer-events: none;
            opacity: 0.7;
            text-decoration: none;
        }
        .steamHoverTip .tipActions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .csrinruSteamTheatre {
            position: fixed;
            inset: 0;
            display: none;
            place-items: center;
            padding: 48px;
            background: rgba(0, 0, 0, 0.78);
            color: #c7d5e0;
            font: 12px/1.45 Arial, Helvetica, sans-serif;
            z-index: 2147483647;
            box-sizing: border-box;
        }
        .csrinruSteamTheatreOpen {
            display: grid;
        }
        .csrinruSteamTheatreShell {
            display: grid;
            grid-template-rows: 34px minmax(0, 1fr) auto;
            width: min(1416px, calc(100vw - 96px));
            height: min(866px, calc(100vh - 96px));
            overflow: hidden;
            background: #050505;
            box-shadow: 0 8px 36px rgba(0, 0, 0, 0.72);
        }
        .csrinruSteamTheatreVideoMode .csrinruSteamTheatreShell {
            grid-template-rows: 34px minmax(0, 1fr) auto 33px;
        }
        .csrinruSteamTheatre:fullscreen {
            padding: 0;
            background: #000;
        }
        .csrinruSteamTheatre:fullscreen .csrinruSteamTheatreShell {
            width: 100vw;
            height: 100vh;
        }
        .csrinruSteamTheatreHeader {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
            padding: 0 96px;
            background: #20262e;
            box-sizing: border-box;
        }
        .csrinruSteamTheatreTitle {
            overflow: hidden;
            color: #b8c6d4;
            font-size: 13px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .csrinruSteamTheatreHeaderControls {
            position: absolute;
            top: 5px;
            right: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .csrinruSteamTheatreBtn,
        .csrinruSteamTheatreNavBtn {
            margin: 0;
            border: 0;
            color: #f2f2f2;
            cursor: pointer;
            touch-action: manipulation;
        }
        .csrinruSteamTheatreBtn {
            display: grid;
            place-items: center;
            width: 24px;
            height: 24px;
            padding: 0;
            background: transparent;
            font: bold 21px/1 Arial, sans-serif;
            opacity: 0.82;
        }
        .csrinruSteamTheatreBtn:hover,
        .csrinruSteamTheatreBtn:focus {
            opacity: 1;
            outline: 1px solid #99d2f7;
        }
        .csrinruSteamTheatreStage {
            position: relative;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            background: #050505;
        }
        .csrinruSteamTheatreViewport {
            display: grid;
            place-items: center;
            width: 100%;
            height: 100%;
        }
        .csrinruSteamTheatreImage,
        .csrinruSteamTheatrePoster,
        .csrinruSteamTheatreVideo {
            display: block;
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            margin: 0;
            object-fit: contain;
            background: #000;
        }
        .csrinruSteamTheatreVideoWrap {
            position: relative;
            width: 100%;
            height: 100%;
            background: #000;
        }
        .csrinruSteamTheatreVideoWrap:fullscreen {
            width: 100vw;
            height: 100vh;
        }
        .csrinruSteamTheatreVideoControls {
            display: grid;
            gap: 6px;
            align-content: end;
            min-height: 72px;
            padding: 18px 20px 12px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.76) 0%, rgba(0, 0, 0, 0.54) 48%, rgba(0, 0, 0, 0.16) 82%, rgba(0, 0, 0, 0) 100%);
            color: #f2f2f2;
            box-sizing: border-box;
        }
        .csrinruSteamTheatreVideoControlsFullscreen {
            display: none;
        }
        .csrinruSteamTheatreVideoWrap:fullscreen .csrinruSteamTheatreVideoControlsFullscreen {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            display: grid;
            min-height: 96px;
            padding: 34px 20px max(16px, env(safe-area-inset-bottom));
            z-index: 3;
        }
        .csrinruSteamTheatre:fullscreen .csrinruSteamTheatreVideoControls {
            min-height: 72px;
            padding: 18px 20px 12px;
        }
        .csrinruSteamTheatreVideoSeek {
            width: 100%;
            height: 10px;
            margin: 0;
            accent-color: #1a9fff;
            cursor: pointer;
        }
        .csrinruSteamTheatreVideoControlRow {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
        }
        .csrinruSteamTheatreVideoControlSpacer {
            flex: 1 1 auto;
        }
        .csrinruSteamTheatreVideoControlBtn {
            display: grid;
            place-items: center;
            width: 28px;
            height: 24px;
            margin: 0;
            padding: 0;
            background: transparent;
            border: 0;
            color: #f2f2f2;
            font: bold 18px/1 Arial, Helvetica, sans-serif;
            cursor: pointer;
            opacity: 0.86;
            touch-action: manipulation;
        }
        .csrinruSteamTheatreVideoControlBtn:hover,
        .csrinruSteamTheatreVideoControlBtn:focus {
            opacity: 1;
            outline: 1px solid #99d2f7;
        }
        .csrinruSteamTheatreVideoTime {
            flex: 0 0 auto;
            color: #d6e8ee;
            font-size: 13px;
            white-space: nowrap;
        }
        .csrinruSteamTheatreNavBtn {
            position: absolute;
            top: 50%;
            display: grid;
            place-items: center;
            width: 48px;
            height: 72px;
            padding: 0;
            background: rgba(0, 0, 0, 0.26);
            font: bold 52px/1 Arial, sans-serif;
            opacity: 0.62;
            transform: translateY(-50%);
        }
        .csrinruSteamTheatreNavBtn:hover,
        .csrinruSteamTheatreNavBtn:focus {
            opacity: 1;
            background: rgba(0, 0, 0, 0.42);
            outline: 1px solid #99d2f7;
        }
        .csrinruSteamTheatrePrevBtn {
            left: 0;
        }
        .csrinruSteamTheatreNextBtn {
            right: 0;
        }
        .csrinruSteamTheatreFooter {
            position: relative;
            display: grid;
            place-items: center;
            min-height: 33px;
            padding: 7px 72px 8px;
            background: #20262e;
            box-sizing: border-box;
        }
        .csrinruSteamTheatreVideoMode .csrinruSteamTheatreFooter {
            padding: 7px 72px 8px;
        }
        .csrinruSteamTheatreFooterActions {
            position: absolute;
            top: 50%;
            left: 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            max-width: calc(50% - 72px);
            min-width: 0;
            overflow: hidden;
            transform: translateY(-50%);
        }
        .csrinruSteamTheatreFooterActions a,
        .csrinruSteamTheatreFooterActions button {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            min-width: 0;
            margin: 0;
            padding: 0;
            overflow: hidden;
            border: 0;
            background: transparent;
            color: #99d2f7 !important;
            font: 12px/1.35 Arial, Helvetica, sans-serif;
            text-decoration: underline;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;
            opacity: 0.92;
            touch-action: manipulation;
        }
        .csrinruSteamTheatreFooterActions a:hover,
        .csrinruSteamTheatreFooterActions a:focus,
        .csrinruSteamTheatreFooterActions button:hover,
        .csrinruSteamTheatreFooterActions button:focus {
            color: #c7ebff !important;
            opacity: 1;
            outline: none;
        }
        .csrinruSteamTheatreFooterActions button.loading {
            pointer-events: none;
            opacity: 0.7;
            text-decoration: none;
        }
        .csrinruSteamTheatreCounter {
            color: #9fb0bf;
            font-size: 12px;
            text-align: center;
        }
        .csrinruSteamTheatreFooterControlsHost {
            position: absolute;
            top: 50%;
            right: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
            transform: translateY(-50%);
        }
        .csrinruSteamTheatreError {
            display: grid;
            place-items: center;
            gap: 8px;
            width: 100%;
            height: 100%;
            padding: 24px;
            color: #d6e8ee;
            text-align: center;
            box-sizing: border-box;
        }
    `);

    const apiCache = new Map();
    const inFlightFetches = new Map();
    const inFlightTagFetches = new Map();
    loadPersistentCache(); // Load cached data from previous sessions
    let lastRequest = 0;
    let requestGate = Promise.resolve();
    let hoverId = 0;
    let showTimeout = null;
    let hideTimeout = null;
    let displayTimeout = null;
    let currentFetch = null;
    let trackingMove = false;
    let lastMoveEvent = null;
    let currentHoveredLink = null;
    let currentMedia = [];
    let currentMediaIndex = 0;
    let currentMediaTitle = '';
    let currentStoreUrl = '';
    let currentTorrentUrl = '';
    let theatreMedia = [];
    let theatreMediaIndex = 0;
    let theatreMediaTitle = '';
    let theatreMode = 'screenshots';
    let theatreAllMedia = [];
    let previousDocumentOverflow = '';

    document.body.appendChild(tip);
    document.body.appendChild(theatre);

    function pruneCache(map) {
        if (map.size > MAX_CACHE) {
            map.delete(map.keys().next().value);
        }
    }

    function getRatingStars(percent, desc) {
        const filled = '★';
        const empty = '☆';
        const p = parseInt(percent, 10);
        let stars = '';

        if (!isNaN(p)) {
            if (p >= 95) stars = filled.repeat(5);
            else if (p >= 80) stars = filled.repeat(4) + empty;
            else if (p >= 70) stars = filled.repeat(3) + empty.repeat(2);
            else if (p >= 40) stars = filled.repeat(2) + empty.repeat(3);
            else if (p >= 20) stars = filled + empty.repeat(4);
            else stars = empty.repeat(5);
        } else if (desc) {
            const d = desc.toLowerCase();
            if (d.includes('overwhelmingly positive')) stars = filled.repeat(5);
            else if (d.includes('very positive')) stars = filled.repeat(4) + empty;
            else if (d.includes('mostly positive')) stars = filled.repeat(4) + empty;
            else if (d.includes('positive')) stars = filled.repeat(4) + empty;
            else if (d.includes('mixed')) stars = filled.repeat(3) + empty.repeat(2);
            else if (d.includes('mostly negative')) stars = filled.repeat(2) + empty.repeat(3);
            else if (d.includes('negative')) stars = filled + empty.repeat(4);
            else if (d.includes('very negative')) stars = filled + empty.repeat(4);
            else if (d.includes('overwhelmingly negative')) stars = filled + empty.repeat(4);
        }
        return stars ? `<span class="ratingStars">${stars}</span>` : '';
    }

    function isUsableUrl(value) {
        try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    function getUsableMediaUrl(value) {
        try {
            const url = new URL(value);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
            if (url.protocol === 'http:' && /(^|\.)steamstatic\.com$|(^|\.)akamai\.steamstatic\.com$|(^|\.)akamaihd\.net$/.test(url.hostname)) {
                url.protocol = 'https:';
            }
            return url.href;
        } catch (_) {
            return '';
        }
    }

    function getPreferredVideoUrl(source) {
        if (!source) return '';
        if (typeof source === 'string') return getUsableMediaUrl(source);

        for (const key of ['max', '720', '720p', '480', '480p']) {
            const url = getUsableMediaUrl(source[key]);
            if (url) return url;
        }

        return Object.values(source)
            .map(getUsableMediaUrl)
            .find(Boolean) || '';
    }

    function getVideoQualityValue(key) {
        const normalized = String(key || '').toLowerCase();
        if (normalized === 'max' || normalized === 'hd') return 10000;

        const numeric = parseInt(normalized.replace(/[^\d]/g, ''), 10);
        return isNaN(numeric) ? 0 : numeric;
    }

    function getVideoSourceLabel(format, key) {
        const upperFormat = String(format || 'Video').toUpperCase();
        const normalized = String(key || '').toLowerCase();

        if (normalized === 'max') return `${upperFormat} HD`;
        if (/^\d+p?$/.test(normalized)) return `${upperFormat} ${parseInt(normalized, 10)}p`;
        if (normalized) return `${upperFormat} ${normalized.toUpperCase()}`;
        return upperFormat;
    }

    function collectVideoSources(source, format) {
        if (!source) return [];

        if (typeof source === 'string') {
            const url = getUsableMediaUrl(source);
            return url ? [{
                url,
                label: getVideoSourceLabel(format, ''),
                format: String(format || 'video').toLowerCase(),
                quality: 0
            }] : [];
        }

        return Object.entries(source)
            .map(([key, value]) => {
                const url = getUsableMediaUrl(value);
                if (!url) return null;

                return {
                    url,
                    label: getVideoSourceLabel(format, key),
                    format: String(format || 'video').toLowerCase(),
                    quality: getVideoQualityValue(key)
                };
            })
            .filter(Boolean);
    }

    function getMovieVideoSources(movie) {
        const sources = [
            ...collectVideoSources(movie?.mp4, 'MP4'),
            ...collectVideoSources(movie?.webm, 'WebM'),
            ...collectVideoSources(movie?.video_url, 'MP4')
        ];
        const seen = new Set();

        return sources
            .filter((source) => {
                if (!source.url || seen.has(source.url)) return false;
                seen.add(source.url);
                return true;
            })
            .sort((a, b) => {
                const qualityDiff = b.quality - a.quality;
                if (qualityDiff) return qualityDiff;
                if (a.format === b.format) return 0;
                if (a.format === 'mp4') return -1;
                if (b.format === 'mp4') return 1;
                return a.format.localeCompare(b.format);
            });
    }

    function getMovieSources(movie) {
        const videoSources = getMovieVideoSources(movie);
        const videoUrl = getPreferredVideoUrl(movie?.mp4) ||
            getPreferredVideoUrl(movie?.webm) ||
            getUsableMediaUrl(movie?.video_url);

        const hlsUrl = getUsableMediaUrl(movie?.hls_h264) ||
            getUsableMediaUrl(movie?.hlsManifest) ||
            getUsableMediaUrl(movie?.hls);

        const dashUrl = getUsableMediaUrl(movie?.dash_h264) ||
            getUsableMediaUrl(movie?.dash_av1);

        return { videoUrl: videoSources[0]?.url || videoUrl, hlsUrl, dashUrl, videoSources };
    }

    function normalizeSteamMedia(appData) {
        const media = [];
        const seen = new Set();
        const title = appData?.name || 'Steam media';

        function addMedia(item) {
            const key = item.url || item.videoUrl || item.posterUrl;
            if (!key || seen.has(key)) return;
            seen.add(key);
            media.push(item);
        }

        if (isUsableUrl(appData?.header_image)) {
            addMedia({
                type: 'image',
                source: 'header',
                url: appData.header_image,
                alt: `${title} Steam header image`
            });
        }

        (appData?.movies || []).forEach((movie, index) => {
            const posterUrl = getUsableMediaUrl(movie?.thumbnail);
            const { videoUrl, hlsUrl, dashUrl, videoSources } = getMovieSources(movie);
            if (!isUsableUrl(posterUrl) || (!isUsableUrl(videoUrl) && !isUsableUrl(hlsUrl))) return;

            addMedia({
                type: 'video',
                source: 'movie',
                posterUrl,
                videoUrl,
                videoSources,
                hlsUrl,
                dashUrl,
                alt: movie?.name || `${title} video ${index + 1}`
            });
        });

        (appData?.screenshots || []).forEach((screenshot, index) => {
            const url = getUsableMediaUrl(screenshot?.path_full) || getUsableMediaUrl(screenshot?.path_thumbnail);
            const thumbUrl = getUsableMediaUrl(screenshot?.path_thumbnail) || url;
            if (!isUsableUrl(url)) return;

            addMedia({
                type: 'image',
                source: 'screenshot',
                url,
                thumbUrl,
                alt: `${title} screenshot ${index + 1}`
            });
        });

        return media;
    }

    function getMediaSortRank(item) {
        if (item?.source === 'header') return 0;
        if (item?.type === 'video' || item?.source === 'movie') return 1;
        if (item?.source === 'screenshot') return 2;
        return 3;
    }

    function orderSteamMediaItems(media) {
        if (!Array.isArray(media)) return [];

        return media
            .map((item, index) => ({ item, index }))
            .sort((a, b) => {
                const rankDiff = getMediaSortRank(a.item) - getMediaSortRank(b.item);
                return rankDiff || a.index - b.index;
            })
            .map(({ item }) => item);
    }

    function stopActiveVideo() {
        tip.querySelectorAll('.steamMediaVideo').forEach((video) => {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
            } catch (_) {
                // Ignore cleanup failures from browser media internals.
            }
        });
    }

    function stopTheatreVideo() {
        theatre.querySelectorAll('.csrinruSteamTheatreVideo').forEach((video) => {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
            } catch (_) {
                // Ignore cleanup failures from browser media internals.
            }
        });
    }

    function resetMediaState() {
        stopActiveVideo();
        currentMedia = [];
        currentMediaIndex = 0;
        currentMediaTitle = '';
        currentStoreUrl = '';
        currentTorrentUrl = '';
    }

    function getRenderMedia(data) {
        const normalizedMedia = normalizeSteamMedia(data);
        const media = normalizedMedia.length ? normalizedMedia : (data?.media || []);
        return orderSteamMediaItems(media);
    }

    function renderMediaItem(item, index, title) {
        if (!item) return '';

        const label = escapeHtml(item.alt || title || 'Steam media');
        if (item.type === 'video') {
            return `
                <button type="button" class="steamMediaPlayBtn" data-media-index="${index}" aria-label="Play ${label}" title="Play video">
                    <img class="steamMediaPoster" src="${escapeHtml(item.posterUrl)}" alt="${label}" loading="lazy" onerror="this.style.display='none'">
                    <span class="steamMediaPlayIcon" aria-hidden="true">&#9658;</span>
                </button>
            `;
        }

        return `<img class="steamMediaImage" src="${escapeHtml(item.url)}" alt="${label}" loading="lazy" onerror="this.style.display='none'">`;
    }

    function getCurrentSteamUrl() {
        const storeUrl = getUsableMediaUrl(currentStoreUrl);
        if (storeUrl) return storeUrl;

        const title = theatreMediaTitle || currentMediaTitle || 'Steam';
        return `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`;
    }

    function renderVideoPlaybackFallback(className) {
        const steamUrl = escapeHtml(getCurrentSteamUrl());
        return `
            <div class="${className}">
                <span>Trailer format cannot play on this page.</span>
                <a href="${steamUrl}" target="_blank" rel="noopener noreferrer">Open on Steam</a>
            </div>
        `;
    }

    function bindVideoPlaybackFallback(video, viewport, className, root) {
        if (!video || !viewport) return;

        video.addEventListener('error', () => {
            if (root?.contains(video)) {
                viewport.innerHTML = renderVideoPlaybackFallback(className);
            }
        }, { once: true });
    }

    function getMediaThumbUrl(item) {
        if (!item) return '';
        return item.type === 'video' ? item.posterUrl : (item.thumbUrl || item.url);
    }

    function isScreenshotMedia(item) {
        return item?.type === 'image' && item?.source === 'screenshot';
    }

    function isVideoMedia(item) {
        return item?.type === 'video';
    }

    function canOpenMediaTheatre(item) {
        return isScreenshotMedia(item) || isVideoMedia(item);
    }

    function getTheatreCounterText() {
        const item = theatreMedia[theatreMediaIndex];
        const ordinal = theatreAllMedia.indexOf(item);
        const count = theatreAllMedia.length || theatreMedia.length;
        const position = ordinal >= 0 ? ordinal + 1 : theatreMediaIndex + 1;
        return `${position} of ${count}`;
    }

    function renderMediaThumbs(media, activeIndex, title) {
        if (!media?.length || media.length <= 1) return '';

        const thumbsHtml = media.map((item, index) => {
            const thumbUrl = getMediaThumbUrl(item);
            if (!isUsableUrl(thumbUrl)) return '';

            const label = escapeHtml(item.alt || title || `Steam media ${index + 1}`);
            const activeClass = index === activeIndex ? ' steamMediaThumbActive' : '';
            const current = index === activeIndex ? 'true' : 'false';
            const videoIcon = item.type === 'video' ?
                '<span class="steamMediaThumbPlayIcon" aria-hidden="true">&#9658;</span>' :
                '';

            return `
                <button type="button" class="steamMediaThumbBtn${activeClass}" data-media-index="${index}" aria-label="Show ${label}" aria-current="${current}" title="${label}">
                    <img class="steamMediaThumbImage" src="${escapeHtml(thumbUrl)}" alt="" loading="lazy" onerror="this.style.display='none'">
                    ${videoIcon}
                </button>
            `;
        }).join('');

        const fitClass = media.length <= 7 ? ' steamMediaThumbStripFit' : '';
        return `<div class="steamMediaThumbStrip${fitClass}" aria-label="Steam media thumbnails">${thumbsHtml}</div>`;
    }

    function renderMediaCarousel(media, title) {
        if (!media?.length) return '';

        const hasMultiple = media.length > 1;
        const controlsHtml = hasMultiple ? `
            <button type="button" class="steamMediaNavBtn steamMediaPrevBtn" aria-label="Previous Steam media" title="Previous media">&#8249;</button>
            <button type="button" class="steamMediaNavBtn steamMediaNextBtn" aria-label="Next Steam media" title="Next media">&#8250;</button>
            <span class="steamMediaCounter" aria-live="polite">1 / ${escapeHtml(media.length)}</span>
        ` : '';
        const expandClass = canOpenMediaTheatre(media[0]) ? '' : ' steamMediaExpandHidden';

        return `
            <div class="steamMediaShell">
                <div class="steamMediaFrame" aria-label="Steam media preview">
                    <div class="steamMediaViewport">${renderMediaItem(media[0], 0, title)}</div>
                    <button type="button" class="steamMediaExpandBtn${expandClass}" aria-label="Open media theatre" title="Open theatre mode"><span class="steamTheatreIcon" aria-hidden="true"></span></button>
                    ${controlsHtml}
                </div>
                ${renderMediaThumbs(media, 0, title)}
            </div>
        `;
    }

    function renderTheatreMediaItem(item, index, title) {
        if (!item) return '';

        const label = escapeHtml(item.alt || title || 'Steam media');
        if (item.type === 'video') {
            return `
                <div class="csrinruSteamTheatreVideoWrap">
                    <video class="csrinruSteamTheatreVideo" data-theatre-media-index="${index}" autoplay playsinline tabindex="0" aria-label="${label}"></video>
                    ${renderTheatreVideoControls('csrinruSteamTheatreVideoControlsFullscreen')}
                </div>
            `;
        }

        return `<img class="csrinruSteamTheatreImage" src="${escapeHtml(item.url)}" alt="${label}" loading="lazy" onerror="this.style.display='none'">`;
    }

    function renderTheatreVideoControls(extraClass = '') {
        const className = `csrinruSteamTheatreVideoControls${extraClass ? ` ${extraClass}` : ''}`;
        return `
            <div class="${className}" aria-label="Video controls">
                <input class="csrinruSteamTheatreVideoSeek" type="range" min="0" max="0" step="0.1" value="0" aria-label="Seek video">
                <div class="csrinruSteamTheatreVideoControlRow">
                    <button type="button" class="csrinruSteamTheatreVideoControlBtn csrinruSteamTheatreVideoPlayToggle" aria-label="Play video" title="Play">&#9658;</button>
                    <button type="button" class="csrinruSteamTheatreVideoControlBtn csrinruSteamTheatreVideoMuteToggle" aria-label="Mute video" title="Mute">&#128266;</button>
                    <span class="csrinruSteamTheatreVideoTime">0:00 / 0:00</span>
                    <span class="csrinruSteamTheatreVideoControlSpacer"></span>
                    <button type="button" class="csrinruSteamTheatreVideoControlBtn csrinruSteamTheatreVideoFullscreenBtn" aria-label="Toggle video fullscreen" title="Video fullscreen">&#9974;</button>
                </div>
            </div>
        `;
    }

    function renderTheatreFooterControls() {
        if (!isScreenshotMedia(theatreMedia[theatreMediaIndex])) return '';

        const fullscreenLabel = document.fullscreenElement === theatre ? 'Exit fullscreen' : 'Enter fullscreen';
        return `
            <button type="button" class="csrinruSteamTheatreVideoControlBtn csrinruSteamTheatreFullscreenBtn" aria-label="${fullscreenLabel}" title="${fullscreenLabel}">&#9974;</button>
        `;
    }

    function renderTheatreFooterActions() {
        const steamUrl = getUsableMediaUrl(currentStoreUrl);
        const torrentUrl = currentTorrentUrl || '';
        const steamAction = steamUrl ?
            `<a href="${escapeHtml(steamUrl)}" target="_blank" rel="noopener noreferrer">🎮 Open on Steam</a>` :
            '';
        const magnetAction = torrentUrl ?
            `<button type="button" class="csrinruSteamTheatreMagnetBtn" data-torrent-url="${escapeHtml(torrentUrl)}">🧲 Magnet Download</button>` :
            '';

        return steamAction || magnetAction ?
            `<div class="csrinruSteamTheatreFooterActions">${steamAction}${magnetAction}</div>` :
            '';
    }

    function renderTheatre() {
        if (!theatreMedia.length) return;

        const hasMultiple = theatreMedia.length > 1;
        const navHtml = hasMultiple ? `
            <button type="button" class="csrinruSteamTheatreNavBtn csrinruSteamTheatrePrevBtn" aria-label="Previous Steam media" title="Previous media">&#8249;</button>
            <button type="button" class="csrinruSteamTheatreNavBtn csrinruSteamTheatreNextBtn" aria-label="Next Steam media" title="Next media">&#8250;</button>
        ` : '';
        const videoControlsHtml = isVideoMedia(theatreMedia[theatreMediaIndex]) ? renderTheatreVideoControls() : '';
        const footerControlsHtml = renderTheatreFooterControls();
        const footerActionsHtml = renderTheatreFooterActions();

        theatre.innerHTML = `
            <div class="csrinruSteamTheatreShell">
                <div class="csrinruSteamTheatreHeader">
                    <div class="csrinruSteamTheatreTitle">${escapeHtml(theatreMediaTitle)} - Trailers &amp; Screenshots</div>
                    <div class="csrinruSteamTheatreHeaderControls">
                        <button type="button" class="csrinruSteamTheatreBtn csrinruSteamTheatreCloseBtn" aria-label="Close theatre" title="Close">&times;</button>
                    </div>
                </div>
                <div class="csrinruSteamTheatreStage">
                    <div class="csrinruSteamTheatreViewport">${renderTheatreMediaItem(theatreMedia[theatreMediaIndex], theatreMediaIndex, theatreMediaTitle)}</div>
                    ${navHtml}
                </div>
                ${videoControlsHtml}
                <div class="csrinruSteamTheatreFooter">
                    ${footerActionsHtml}
                    <div class="csrinruSteamTheatreCounter" aria-live="polite">${getTheatreCounterText()}</div>
                    <div class="csrinruSteamTheatreFooterControlsHost">${footerControlsHtml}</div>
                </div>
            </div>
        `;
    }

    function setTheatreMedia(index) {
        if (!theatreMedia.length) return;

        const nextIndex = (index + theatreMedia.length) % theatreMedia.length;
        const nextItem = theatreMedia[nextIndex];

        stopTheatreVideo();

        if (theatreMode === 'video' && isScreenshotMedia(nextItem)) {
            const screenshots = currentMedia.filter(isScreenshotMedia);
            const screenshotIndex = screenshots.indexOf(nextItem);
            if (screenshotIndex >= 0) {
                theatreMode = 'screenshots';
                theatreMedia = screenshots;
                theatreMediaIndex = screenshotIndex;
                theatre.classList.remove('csrinruSteamTheatreVideoMode');
                renderTheatre();
                return;
            }
        }

        theatreMediaIndex = nextIndex;

        const viewport = theatre.querySelector('.csrinruSteamTheatreViewport');
        if (viewport) {
            viewport.innerHTML = renderTheatreMediaItem(theatreMedia[theatreMediaIndex], theatreMediaIndex, theatreMediaTitle);
        }

        const counter = theatre.querySelector('.csrinruSteamTheatreCounter');
        if (counter) {
            counter.textContent = getTheatreCounterText();
        }

        const footerControls = theatre.querySelector('.csrinruSteamTheatreFooterControlsHost');
        if (footerControls) {
            footerControls.innerHTML = renderTheatreFooterControls();
        }

        if (theatreMode === 'video') {
            playTheatreVideo();
        }
    }

    function formatVideoTime(value) {
        if (!isFinite(value) || value < 0) return '0:00';

        const total = Math.floor(value);
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        const paddedSeconds = String(seconds).padStart(2, '0');

        return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}` : `${minutes}:${paddedSeconds}`;
    }

    function updateTheatreVideoControls(video) {
        if (!video) return;

        const playButtons = theatre.querySelectorAll('.csrinruSteamTheatreVideoPlayToggle');
        const muteButtons = theatre.querySelectorAll('.csrinruSteamTheatreVideoMuteToggle');
        const seekInputs = theatre.querySelectorAll('.csrinruSteamTheatreVideoSeek');
        const timeLabels = theatre.querySelectorAll('.csrinruSteamTheatreVideoTime');
        const duration = isFinite(video.duration) ? video.duration : 0;
        const currentTime = isFinite(video.currentTime) ? video.currentTime : 0;

        playButtons.forEach((playButton) => {
            playButton.innerHTML = video.paused ? '&#9658;' : '&#10074;&#10074;';
            playButton.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
            playButton.setAttribute('title', video.paused ? 'Play' : 'Pause');
        });

        muteButtons.forEach((muteButton) => {
            muteButton.innerHTML = video.muted || video.volume === 0 ? '&#128263;' : '&#128266;';
            muteButton.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
            muteButton.setAttribute('title', video.muted ? 'Unmute' : 'Mute');
        });

        seekInputs.forEach((seek) => {
            seek.max = String(duration || 0);
            seek.value = String(Math.min(currentTime, duration || currentTime));
        });

        timeLabels.forEach((timeLabel) => {
            timeLabel.textContent = `${formatVideoTime(currentTime)} / ${formatVideoTime(duration)}`;
        });
    }

    function bindTheatreVideoEvents(video) {
        if (!video || video.dataset.controlsBound === 'true') return;

        video.dataset.controlsBound = 'true';
        ['timeupdate', 'durationchange', 'play', 'pause', 'volumechange', 'loadedmetadata'].forEach((eventName) => {
            video.addEventListener(eventName, () => updateTheatreVideoControls(video));
        });
        updateTheatreVideoControls(video);
    }

    function loadTheatreVideoSource(video, sourceUrl, preserveState = false) {
        const playableUrl = getUsableMediaUrl(sourceUrl);
        if (!video || !playableUrl) return;

        const previousTime = preserveState && isFinite(video.currentTime) ? video.currentTime : 0;
        const shouldResume = preserveState ? !video.paused : true;

        video.src = playableUrl;
        video.load();
        video.addEventListener('loadedmetadata', () => {
            if (previousTime && isFinite(video.duration)) {
                video.currentTime = Math.min(previousTime, Math.max(0, video.duration - 0.25));
            }

            if (shouldResume) {
                video.play().catch(() => null);
            }
            updateTheatreVideoControls(video);
        }, { once: true });

        if (shouldResume) {
            video.play().catch(() => null);
        }
    }

    async function playTheatreVideo() {
        const item = theatreMedia[theatreMediaIndex];
        if (!item || item.type !== 'video' || (!isUsableUrl(item.videoUrl) && !isUsableUrl(item.hlsUrl))) return;

        const label = escapeHtml(item.alt || theatreMediaTitle || 'Steam video');
        const viewport = theatre.querySelector('.csrinruSteamTheatreViewport');
        if (!viewport) return;

        stopTheatreVideo();
        const directSrc = isUsableUrl(item.videoUrl) ? ` src="${escapeHtml(item.videoUrl)}"` : '';
        let video = viewport.querySelector('.csrinruSteamTheatreVideo');
        if (!video) {
            viewport.innerHTML = `<video class="csrinruSteamTheatreVideo"${directSrc} autoplay playsinline tabindex="0" aria-label="${label}"></video>`;
            video = viewport.querySelector('.csrinruSteamTheatreVideo');
        }

        if (!video) return;
        video.setAttribute('aria-label', label);
        bindVideoPlaybackFallback(video, viewport, 'csrinruSteamTheatreError', theatre);
        bindTheatreVideoEvents(video);

        if (isUsableUrl(item.videoUrl)) {
            loadTheatreVideoSource(video, item.videoUrl);
            return;
        }

        if (isUsableUrl(item.hlsUrl) && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = item.hlsUrl;
            video.play().catch(() => null);
            return;
        }

        viewport.innerHTML = renderVideoPlaybackFallback('csrinruSteamTheatreError');
    }

    function isTheatreOpen() {
        return theatre.classList.contains('csrinruSteamTheatreOpen');
    }

    function getTheatreSelection(index) {
        const selectedItem = currentMedia[index];
        if (!canOpenMediaTheatre(selectedItem)) return null;

        const mode = isVideoMedia(selectedItem) ? 'video' : 'screenshots';
        const screenshots = currentMedia.filter(isScreenshotMedia);
        const allItems = currentMedia.filter(canOpenMediaTheatre);
        const items = mode === 'video' ? [selectedItem, ...screenshots] : screenshots;
        const selectedIndex = items.indexOf(selectedItem);
        if (!items.length || selectedIndex < 0) return null;

        return { mode, items, selectedIndex, allItems };
    }

    function openTheatre(index) {
        const selection = getTheatreSelection(index);
        if (!selection) return;

        theatreMode = selection.mode;
        theatreMedia = selection.items;
        theatreAllMedia = selection.allItems;
        theatreMediaIndex = selection.selectedIndex;
        theatreMediaTitle = currentMediaTitle || 'Steam media';
        stopActiveVideo();
        clearTimeout(hideTimeout);
        clearTimeout(displayTimeout);
        clearTimeout(showTimeout);

        theatre.classList.toggle('csrinruSteamTheatreVideoMode', theatreMode === 'video');
        renderTheatre();
        previousDocumentOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        theatre.classList.add('csrinruSteamTheatreOpen');
        theatre.setAttribute('aria-hidden', 'false');
        tip.style.opacity = '0';
        tip.style.pointerEvents = 'none';
        tip.style.display = 'none';
        trackingMove = false;

        const closeButton = theatre.querySelector('.csrinruSteamTheatreCloseBtn');
        if (closeButton) {
            try {
                closeButton.focus({ preventScroll: true });
            } catch (_) {
                closeButton.focus();
            }
        }

        if (theatreMode === 'video') {
            playTheatreVideo();
        }
    }

    function closeTheatre() {
        if (!isTheatreOpen()) return;

        const fullscreenElement = document.fullscreenElement;
        if (fullscreenElement && (fullscreenElement === theatre || theatre.contains(fullscreenElement))) {
            document.exitFullscreen().catch(() => null);
        }

        stopTheatreVideo();
        theatre.classList.remove('csrinruSteamTheatreOpen');
        theatre.setAttribute('aria-hidden', 'true');
        theatre.innerHTML = '';
        document.documentElement.style.overflow = previousDocumentOverflow;
        previousDocumentOverflow = '';
        theatreMedia = [];
        theatreAllMedia = [];
        theatreMediaIndex = 0;
        theatreMediaTitle = '';
        theatreMode = 'screenshots';
        theatre.classList.remove('csrinruSteamTheatreVideoMode');
    }

    async function toggleTheatreFullscreen() {
        if (!isTheatreOpen()) return;

        try {
            if (document.fullscreenElement === theatre) {
                await document.exitFullscreen();
            } else if (!document.fullscreenElement && theatre.requestFullscreen) {
                await theatre.requestFullscreen();
            }
        } catch (_) {
            // Ignore browser fullscreen denials.
        }

        updateTheatreFullscreenButton();
    }

    function updateTheatreFullscreenButton() {
        const theatreFullscreenButtons = theatre.querySelectorAll('.csrinruSteamTheatreFullscreenBtn');
        const videoFullscreenButton = theatre.querySelector('.csrinruSteamTheatreVideoFullscreenBtn');
        const videoWrap = theatre.querySelector('.csrinruSteamTheatreVideoWrap');

        const label = document.fullscreenElement === theatre ? 'Exit fullscreen' : 'Enter fullscreen';
        theatreFullscreenButtons.forEach((button) => {
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
        });

        if (videoFullscreenButton) {
            const videoLabel = document.fullscreenElement === videoWrap ? 'Exit video fullscreen' : 'Enter video fullscreen';
            videoFullscreenButton.setAttribute('aria-label', videoLabel);
            videoFullscreenButton.setAttribute('title', videoLabel);
        }
    }

    function getTheatreVideoElement() {
        return theatre.querySelector('.csrinruSteamTheatreVideo');
    }

    function toggleTheatreVideoPlayback() {
        const video = getTheatreVideoElement();
        if (!video) return;

        if (video.paused) {
            video.play().catch(() => null);
        } else {
            video.pause();
        }
        updateTheatreVideoControls(video);
    }

    function toggleTheatreVideoMute() {
        const video = getTheatreVideoElement();
        if (!video) return;

        video.muted = !video.muted;
        updateTheatreVideoControls(video);
    }

    function seekTheatreVideo(deltaSeconds) {
        const video = getTheatreVideoElement();
        if (!video) return false;

        const duration = isFinite(video.duration) ? video.duration : 0;
        const currentTime = isFinite(video.currentTime) ? video.currentTime : 0;
        const nextTime = duration ?
            Math.max(0, Math.min(duration, currentTime + deltaSeconds)) :
            Math.max(0, currentTime + deltaSeconds);
        video.currentTime = nextTime;
        updateTheatreVideoControls(video);
        return true;
    }

    async function toggleTheatreVideoFullscreen() {
        const videoWrap = theatre.querySelector('.csrinruSteamTheatreVideoWrap');
        if (!videoWrap) return;

        try {
            if (document.fullscreenElement === videoWrap) {
                await document.exitFullscreen();
            } else if (!document.fullscreenElement && videoWrap.requestFullscreen) {
                await videoWrap.requestFullscreen();
            }
        } catch (_) {
            // Ignore browser fullscreen denials.
        }
    }

    function setActiveMedia(index) {
        if (!currentMedia.length) return;

        stopActiveVideo();
        currentMediaIndex = (index + currentMedia.length) % currentMedia.length;

        const viewport = tip.querySelector('.steamMediaViewport');
        if (viewport) {
            viewport.innerHTML = renderMediaItem(currentMedia[currentMediaIndex], currentMediaIndex, currentMediaTitle);
        }

        const counter = tip.querySelector('.steamMediaCounter');
        if (counter) {
            counter.textContent = `${currentMediaIndex + 1} / ${currentMedia.length}`;
        }

        const expandButton = tip.querySelector('.steamMediaExpandBtn');
        if (expandButton) {
            expandButton.classList.toggle('steamMediaExpandHidden', !canOpenMediaTheatre(currentMedia[currentMediaIndex]));
        }

        tip.querySelectorAll('.steamMediaThumbBtn').forEach((button) => {
            const buttonIndex = parseInt(button.dataset.mediaIndex, 10);
            const isActive = buttonIndex === currentMediaIndex;
            button.classList.toggle('steamMediaThumbActive', isActive);
            button.setAttribute('aria-current', isActive ? 'true' : 'false');
        });

        const activeThumb = tip.querySelector('.steamMediaThumbActive');
        if (activeThumb) {
            const strip = activeThumb.closest('.steamMediaThumbStrip');
            if (strip) {
                const stripRect = strip.getBoundingClientRect();
                const thumbRect = activeThumb.getBoundingClientRect();

                if (thumbRect.left < stripRect.left) {
                    strip.scrollLeft -= stripRect.left - thumbRect.left;
                } else if (thumbRect.right > stripRect.right) {
                    strip.scrollLeft += thumbRect.right - stripRect.right;
                }
            }
        }
    }

    async function playActiveVideo() {
        const item = currentMedia[currentMediaIndex];
        if (!item || item.type !== 'video' || (!isUsableUrl(item.videoUrl) && !isUsableUrl(item.hlsUrl))) return;

        const label = escapeHtml(item.alt || currentMediaTitle || 'Steam video');
        const poster = isUsableUrl(item.posterUrl) ? ` poster="${escapeHtml(item.posterUrl)}"` : '';
        const viewport = tip.querySelector('.steamMediaViewport');
        if (!viewport) return;

        stopActiveVideo();
        const directSrc = isUsableUrl(item.videoUrl) ? ` src="${escapeHtml(item.videoUrl)}"` : '';
        viewport.innerHTML = `<video class="steamMediaVideo"${directSrc}${poster} controls autoplay playsinline aria-label="${label}"></video>`;

        const video = viewport.querySelector('.steamMediaVideo');
        if (!video) return;
        bindVideoPlaybackFallback(video, viewport, 'steamMediaError', tip);

        if (isUsableUrl(item.videoUrl)) {
            video.play().catch(() => null);
            return;
        }

        if (isUsableUrl(item.hlsUrl) && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = item.hlsUrl;
            video.play().catch(() => null);
            return;
        }

        viewport.innerHTML = renderVideoPlaybackFallback('steamMediaError');
    }

    function cleanName(raw) {
        // Early exclusions for non-games
        if (/soundtrack|ost|demo|dlc pack|artbook|season pass|multiplayer crack|trainer/i.test(raw)) {
            return null;
        }

        let name = raw.trim();

        // Remove bracketed prefixes like [Bober Bros], [FitGirl], etc. at the START
        name = name.replace(/^\[[^\]]*\]\s*/g, '');

        // Normalize separators: dots and underscores to spaces
        name = name.replace(/[._]/g, ' ');

        // Remove common technical suffixes
        name = name.replace(/\s+(x64|x86|64bit|32bit|64-bit|32-bit)\b/gi, '');
        name = name.replace(/\s+MULTI\d*\b/gi, '');
        name = name.replace(/\s+(incl|incl\.|including)\s+.*/gi, '');

        // Strip years and season/episode markers
        name = name.replace(/\(\d{4}\)/, '').replace(/S\d{1,2}(E\d{1,2})?/, '').trim();

        // Remove bracketed content with known group/repack patterns
        name = name.replace(/\[[^\]]*(?:Repack|FitGirl|DODI|ElAmigos|GOG|P2P|ISO)\][^\]]*$/gi, '').trim();

        // Split on version/build/technical markers AND brackets/parentheses
        const delim = /(?:\s-\s|\(|\[|\bUpdate\b|\bBuild\b|\bHotfix\b|\bPatch\b|v\d[\d.]*|v\s+\d|\bCrack\b|\bFixed?\b|\bLinux\b|\bMac\b|\bMacOS\b|\bWindows\b|\bPortable\b|\bREPACK\b|\bRIP\b)/i;
        name = name.split(delim)[0].trim();

        // Expanded scene group removal (at end of name)
        const sceneGroups = /\s*[-\s](CODEX|CPY|SKIDROW|PLAZA|HOODLUM|FLT|DOGE|DARKSiDERS|EMPRESS|RUNE|TENOKE|TiNYiSO|ElAmigos|FitGirl|DODI|RAZOR1911|RELOADED|PROPHET|FAIRLIGHT|GOG|P2P|STEAM|STEAMPUNKS|3DM|ALI213|ANOMALY|KAOS|REVOLT|SiMPLEX|ISO|elamigos|Bober\s*Bros)$/i;
        name = name.replace(sceneGroups, '').trim();

        // Remove "The", "Sid Meier's", etc. ONLY if > 3 words remain
        const words = name.split(/\s+/);
        if (words.length > 3) {
            name = name.replace(/^(The|Sid Meier'?s|Tom Clancy'?s)\s+/i, '').trim();
        }

        // Clean up extra whitespace
        name = name.replace(/\s{2,}/g, ' ').trim();

        return name.length >= 2 ? name : null;
    }

    async function waitForRequestSlot() {
        const wait = Math.max(0, MIN_INTERVAL - (Date.now() - lastRequest));
        if (wait) await delay(wait);
        lastRequest = Date.now();
    }

    function gmFetch(url, responseType = 'json', timeout = API_TIMEOUT) {
        const slot = requestGate.then(waitForRequestSlot, waitForRequestSlot);
        requestGate = slot.catch(() => null);

        return slot
            .then(() => new Promise((resolve, reject) => {
                lastRequest = Date.now();
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    responseType: responseType,
                    timeout: timeout,
                    headers: {
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Cookie': 'birthtime=0; mature_content=1; wants_mature_content=1; lastagecheckage=1-0-1990'
                    },
                    onload: (res) => {
                        if (res.status >= 200 && res.status < 300) {
                            if (responseType === 'json') {
                                if (typeof res.response === 'object' && res.response !== null) {
                                    resolve(res.response);
                                } else {
                                    try {
                                        resolve(JSON.parse(res.responseText));
                                    } catch (e) {
                                        console.error(`JSON parse error for ${url}:`, e, res.responseText);
                                        reject(new Error(`JSON parse error for ${url}`));
                                    }
                                }
                            } else {
                                resolve(res.response || res.responseText);
                            }
                        } else {
                            console.warn(`HTTP ${res.status} for ${url}`);
                            reject(new Error(`HTTP ${res.status} for ${url}`));
                        }
                    },
                    onerror: (err) => {
                        console.error(`Network error for ${url}:`, err);
                        reject(new Error(`Network error for ${url}: ${err.statusText || err.error || 'Unknown'}`));
                    },
                    ontimeout: () => {
                        console.warn(`Timeout ${timeout}ms for ${url}`);
                        reject(new Error(`Timeout ${timeout}ms for ${url}`));
                    },
                    onabort: () => {
                        console.warn(`Aborted request for ${url}`);
                        reject(new Error(`Aborted request for ${url}`));
                    }
                });
            }));
    }

    function stripEditionSuffixForSearch(name) {
        return name
            .replace(/\s*[:\-]\s*(Digital\s+Deluxe|Deluxe|Ultimate|Gold|Premium|Collector'?s)\s+Edition\b.*$/i, '')
            .replace(/\s+(Digital\s+Deluxe|Deluxe|Ultimate|Gold|Premium|Collector'?s)\s+Edition\b.*$/i, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    // Fallback strategy: try the base game, then progressively remove words from the end
    async function fetchSteamWithFallback(originalName) {
        const words = originalName.split(/\s+/);
        const attempts = [];
        const baseName = stripEditionSuffixForSearch(originalName);

        if (baseName && baseName.toLowerCase() !== originalName.toLowerCase()) {
            attempts.push(baseName);
        }

        attempts.push(originalName);

        // Try the full name and progressively shorter versions after any base-game attempt.
        // For single-word names, only try once. For multi-word, try up to 4 versions.
        const maxAttempts = Math.min(words.length, 4);

        for (let i = 0; i < maxAttempts; i++) {
            const tryName = words.slice(0, words.length - i).join(' ');
            if (tryName.length >= 2) {
                attempts.push(tryName);
            }
        }

        const uniqueAttempts = [...new Set(attempts)];

        for (let i = 0; i < uniqueAttempts.length; i++) {
            const tryName = uniqueAttempts[i];
            if (tryName.length < 2) continue;

            debugLog(`🔄 Fallback attempt ${i + 1}/${uniqueAttempts.length}: "${tryName}"`);
            const result = await fetchSteam(tryName);
            if (result) return result;
        }

        return null;
    }

    async function fetchAppDetailsForIds(appIds) {
        const ids = [...new Set(appIds.filter(Boolean))].slice(0, MAX_SEARCH_CANDIDATES);
        if (!ids.length) return {};

        const batchUrl = `https://store.steampowered.com/api/appdetails?appids=${ids.join(',')}&cc=us&l=en`;
        try {
            return await gmFetch(batchUrl, 'json');
        } catch (batchErr) {
            debugLog('Batch appdetails lookup failed, trying individually:', batchErr.message);
            const details = {};
            for (const id of ids) {
                const singleUrl = `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=en`;
                const singleRes = await gmFetch(singleUrl, 'json').catch(() => null);
                if (singleRes?.[id]) {
                    details[id] = singleRes[id];
                }
            }
            return details;
        }
    }

    function getReviewInfo(reviewRes) {
        if (!reviewRes?.success || !reviewRes.query_summary) return null;

        const summary = reviewRes.query_summary;
        const percent = summary.total_reviews ? Math.round((summary.total_positive / summary.total_reviews) * 100) : null;
        return {
            desc: summary.review_score_desc || 'No Reviews',
            percent: percent,
            total: summary.total_reviews || 0
        };
    }

    function getGenreTags(appData) {
        return (appData?.genres || [])
            .map(genre => genre.description)
            .filter(Boolean)
            .slice(0, 5);
    }

    function getTagSource(data) {
        if (data?.tagsSource) return data.tagsSource;
        return data?.tags?.length ? 'steam' : 'genres';
    }

    function updateCachedDataForApp(appId, updater) {
        let updated = false;
        const now = Date.now();

        for (const [key, value] of apiCache.entries()) {
            if (value.data?.steam_appid !== appId && value.data?.appId !== appId) continue;

            apiCache.set(key, {
                ...value,
                data: updater(value.data, now),
                ts: now
            });
            updated = true;
        }

        if (updated) savePersistentCache();
    }

    async function fetchSteamTags(appId) {
        const storePageUrl = `https://store.steampowered.com/app/${appId}/`;
        debugLog(`Fetching tags from store page:`, storePageUrl);

        const storeHtml = await gmFetch(storePageUrl, 'text');
        if (!storeHtml) return [];

        const parser = new DOMParser();
        const doc = parser.parseFromString(storeHtml, 'text/html');
        return Array.from(doc.querySelectorAll('a.app_tag'))
            .map(el => el.textContent.trim())
            .filter(tag => tag && tag !== '+')
            .slice(0, 5);
    }

    function warmSteamTags(data) {
        const appId = data?.steam_appid || data?.appId;
        if (!appId) return null;
        if (getTagSource(data) === 'steam') return null;
        if (data.steamTagsAttemptTs && Date.now() - data.steamTagsAttemptTs < MEMORY_CACHE_TTL) return null;

        const inFlight = inFlightTagFetches.get(appId);
        if (inFlight) return inFlight;

        updateCachedDataForApp(appId, (cachedData, now) => ({
            ...cachedData,
            steamTagsAttemptTs: now
        }));

        const request = fetchSteamTags(appId)
            .then(tags => {
                if (!tags.length) return;

                updateCachedDataForApp(appId, (cachedData, now) => ({
                    ...cachedData,
                    tags,
                    tagsSource: 'steam',
                    steamTagsAttemptTs: now
                }));
            })
            .catch(err => {
                debugLog(`Tag scraping failed for AppID ${appId}:`, err.message);
            })
            .finally(() => inFlightTagFetches.delete(appId));

        inFlightTagFetches.set(appId, request);
        return request;
    }

    function normalizeForMatch(value) {
        return String(value ?? '')
            .toLowerCase()
            .replace(/&/g, ' and ')
            .replace(/[®™©]/g, '')
            .replace(/['’]/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getBaseMatchName(value) {
        return normalizeForMatch(stripEditionSuffixForSearch(value));
    }

    function hasDlcNameMarker(item, data) {
        const type = normalizeForMatch(data?.type);
        const name = normalizeForMatch(`${item?.name || ''} ${data?.name || ''}`);

        return type === 'dlc' ||
            /\b(dlc|upgrade|season pass|expansion pass|soundtrack|ost|artbook|skin pack|costume pack|weapon pack|bonus content)\b/.test(name);
    }

    function getTokenOverlapScore(baseName, candidateName) {
        const tokens = baseName.split(' ').filter(token => token.length > 1);
        if (!tokens.length) return 0;

        const candidateTokens = new Set(candidateName.split(' '));
        const matches = tokens.filter(token => candidateTokens.has(token)).length;
        return matches / tokens.length;
    }

    function scoreSearchCandidate(searchName, candidate, index) {
        const itemName = candidate.item?.name || '';
        const dataName = candidate.data?.name || itemName;
        const candidateName = normalizeForMatch(dataName);
        const itemMatchName = normalizeForMatch(itemName);
        const searchMatchName = normalizeForMatch(searchName);
        const baseMatchName = getBaseMatchName(searchName);
        const type = normalizeForMatch(candidate.data?.type);

        let score = 100 - index;

        if (type === 'game') score += 40;
        else if (type) score -= 120;

        if (candidateName === searchMatchName || itemMatchName === searchMatchName) score += 35;
        if (baseMatchName && (candidateName === baseMatchName || itemMatchName === baseMatchName)) score += 120;
        if (baseMatchName && (candidateName.startsWith(baseMatchName) || itemMatchName.startsWith(baseMatchName))) score += 35;
        if (baseMatchName) score += Math.round(getTokenOverlapScore(baseMatchName, candidateName) * 50);

        if (hasDlcNameMarker(candidate.item, candidate.data)) score -= 170;

        return score;
    }

    async function fetchSteam(name) {
        debugLog(`🔍 Searching for: "${name}"`);
        const now = Date.now();
        const hit = getFreshCacheEntry(name, now);
        if (hit) {
            debugLog(`📦 Cache hit for "${name}"`, hit.data ? '✓ has data' : '✗ cached as null');
            return hit.data;
        }

        const inFlight = inFlightFetches.get(name);
        if (inFlight) return inFlight;

        const request = fetchSteamUncached(name, now)
            .finally(() => inFlightFetches.delete(name));
        inFlightFetches.set(name, request);
        return request;
    }

    async function fetchSteamUncached(name, now) {
        let appId = null;
        let appData = null;
        let reviewInfo = null;

        // First: Search for the game
        try {
            const searchUrl = `https://store.steampowered.com/api/storesearch/?cc=us&l=en&term=${encodeURIComponent(name)}`;
            debugLog(`📡 Fetching search API:`, searchUrl);
            const searchRes = await gmFetch(searchUrl, 'json');
            debugLog(`📥 Search response:`, searchRes ? `${searchRes.total || 0} results` : 'null/undefined');
            const items = searchRes?.items || [];
            if (!items.length) {
                throw new Error('No suitable AppID found in search results.');
            }

            const exactMatches = items.filter(item => item.name?.toLowerCase() === name.toLowerCase());
            const orderedCandidates = [];
            const seenIds = new Set();
            for (const item of [...exactMatches, ...items]) {
                if (!item?.id || seenIds.has(item.id)) continue;
                orderedCandidates.push(item);
                seenIds.add(item.id);
                if (orderedCandidates.length >= MAX_SEARCH_CANDIDATES) break;
            }

            const detailsRes = await fetchAppDetailsForIds(orderedCandidates.map(item => item.id));
            const enriched = orderedCandidates.map(item => ({
                item,
                data: detailsRes?.[item.id]?.success ? detailsRes[item.id].data : null
            }));

            const scoredCandidates = enriched
                .map((candidate, index) => ({
                    ...candidate,
                    score: scoreSearchCandidate(name, candidate, index)
                }))
                .sort((a, b) => b.score - a.score);
            const result = scoredCandidates[0] || { item: orderedCandidates[0], data: null, score: 0 };

            debugLog('Candidate scores:', scoredCandidates.map(candidate =>
                `${candidate.item?.name || candidate.data?.name || candidate.item?.id}: ${candidate.score}`
            ).join(' | '));

            appId = result.item?.id;
            appData = result.data;

            if (appId && result.item?.name?.toLowerCase() === name.toLowerCase()) {
                debugLog(`🎯 Found exact match: "${result.item.name}" (AppID: ${appId})`);
            } else if (appId && appData?.type === 'game') {
                debugLog(`🎮 Selected main game: "${appData.name || result.item?.name}" (AppID: ${appId})`);
            } else if (appId) {
                debugLog(`✓ Selected AppID: ${appId} for "${result.item?.name}"`);
            }

            if (appData?.type && appData.type !== 'game') {
                const mainGame = enriched.find(candidate => candidate.data?.type === 'game');
                if (mainGame) {
                    appId = mainGame.item.id;
                    appData = mainGame.data;
                    debugLog(`🎮 Switched from ${result.data?.type || 'non-game'} to main game "${appData.name}" (AppID: ${appId})`);
                }
            }

            if (!appId) {
                debugLog(`❌ No AppID found for "${name}"`);
                throw new Error('No suitable AppID found in search results.');
            }
        } catch (err) {
            debugLog(`❌ Steam search failed for "${name}":`, err.message);
            console.warn(`Steam search failed for "${name}":`, err.message);
            apiCache.set(name, { data: null, ts: now });
            pruneCache(apiCache);
            return null;
        }

        // Second: Fetch reviews, and details if the search-candidate lookup did not already get them
        try {
            const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`;
            const reviewUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all&filter=summary`;
            debugLog(appData ? `📡 Fetching reviews for AppID: ${appId}` : `📡 Fetching details and reviews for AppID: ${appId}`);

            if (appData) {
                const reviewRes = await gmFetch(reviewUrl, 'json').catch((e) => { debugLog(`❌ Reviews fetch error:`, e.message); return null; });
                reviewInfo = getReviewInfo(reviewRes);
            } else {
                const [detailsRes, reviewRes] = await Promise.all([
                    gmFetch(detailsUrl, 'json').catch((e) => { debugLog(`❌ Details fetch error:`, e.message); return null; }),
                    gmFetch(reviewUrl, 'json').catch((e) => { debugLog(`❌ Reviews fetch error:`, e.message); return null; })
                ]);

                debugLog(`📥 Details response:`, detailsRes ? (detailsRes[appId]?.success ? '✓ success' : '✗ failed') : 'null');
                if (detailsRes?.[appId]?.success) {
                    appData = detailsRes[appId].data;
                    debugLog(`✓ Got app data: "${appData.name}"`);
                } else {
                    throw new Error('Failed to fetch app details or API indicated failure.');
                }

                reviewInfo = getReviewInfo(reviewRes);
            }

            if (reviewInfo) {
                debugLog(`✓ Got reviews: ${reviewInfo.desc} (${reviewInfo.total} reviews)`);
            }
        } catch (err) {
            debugLog(`❌ Details/reviews fetch failed for AppID ${appId}:`, err.message);
            console.warn(`Steam details/reviews fetch failed for AppID ${appId}:`, err.message);
            if (!appData) {
                apiCache.set(name, { data: null, ts: now });
                pruneCache(apiCache);
                return null;
            }
        }

        const tags = getGenreTags(appData);
        const media = normalizeSteamMedia(appData);

        const data = {
            ...appData,
            appId,
            media,
            tags,
            tagsSource: 'genres',
            reviewInfo: reviewInfo,
            releaseDate: appData.release_date?.date || null,
            storeUrl: `https://store.steampowered.com/app/${appId}/`
        };
        debugLog(`✅ Successfully fetched Steam data for "${name}" -> "${data.name}"`);
        apiCache.set(name, { data: data, ts: now });
        pruneCache(apiCache);
        savePersistentCache(); // Save to storage for future sessions
        return data;
    }

    function positionTip(ev) {
        if (!tip) return;
        let x = ev.pageX + 15;
        let y = ev.pageY + 15;
        const tipWidth = tip.offsetWidth;
        const tipHeight = tip.offsetHeight;
        const margin = 10;
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;
        if (x + tipWidth + margin > scrollX + viewWidth) {
            x = ev.pageX - tipWidth - 15;
            if (x < scrollX + margin) {
                x = scrollX + margin;
            }
        }
        if (x < scrollX + margin) {
            x = scrollX + margin;
        }
        if (y + tipHeight + margin > scrollY + viewHeight) {
            let yAbove = ev.pageY - tipHeight - 15;
            if (yAbove > scrollY + margin) {
                y = yAbove;
            } else {
                y = scrollY + viewHeight - tipHeight - margin;
                if (y < scrollY + margin) {
                    y = scrollY + margin;
                }
            }
        }
        if (y < scrollY + margin) {
            y = scrollY + margin;
        }
        tip.style.left = `${x}px`;
        tip.style.top = `${y}px`;
    }

    function startHideAnimation() {
        if (tip.style.display !== 'none' && tip.style.opacity !== '0') {
            resetMediaState();
            tip.style.opacity = '0';
            tip.style.pointerEvents = 'none';
            trackingMove = false;
            clearTimeout(displayTimeout);
            displayTimeout = setTimeout(() => {
                tip.style.display = 'none';
            }, FADE_DURATION);
        } else if (tip.style.display !== 'none') {
            resetMediaState();
            clearTimeout(displayTimeout);
            displayTimeout = setTimeout(() => { tip.style.display = 'none'; }, FADE_DURATION);
        }
    }

    function actuallyHideTip() {
        hoverId++;
        currentFetch = null;
        currentHoveredLink = null;
        clearTimeout(showTimeout);
        startHideAnimation();
    }

    function scheduleHideTip() {
        clearTimeout(hideTimeout);
        clearTimeout(displayTimeout);
        hideTimeout = setTimeout(actuallyHideTip, HIDE_DELAY);
    }

    function cancelHideTip() {
        clearTimeout(hideTimeout);
        clearTimeout(displayTimeout);
        if (tip.style.display === 'block' && tip.style.opacity === '0') {
            tip.style.opacity = '1';
            tip.style.pointerEvents = 'auto';
        }
    }

    function triggerShowAndFadeIn(event, gameName) {
        cancelHideTip();
        clearTimeout(displayTimeout);
        resetMediaState();
        tip.innerHTML = `<div class="loadingContainer"><div class="spinner"></div><span>Loading <strong>${escapeHtml(gameName)}</strong>…</span></div>`;
        positionTip(event);
        tip.style.display = 'block';
        void tip.offsetHeight;
        tip.style.opacity = '1';
        tip.style.pointerEvents = 'auto';
    }

    tip.addEventListener('mouseenter', () => {
        cancelHideTip();
        if (trackingMove) {
            trackingMove = false;
        }
    });

    tip.addEventListener('mouseleave', () => {
        scheduleHideTip();
    });

    document.addEventListener('mouseover', async (e) => {
        const targetLink = e.target.closest(SEL);
        const isOverTip = tip.contains(e.target);

        if (targetLink || isOverTip) {
            cancelHideTip();
        }

        if (!targetLink || (targetLink === currentHoveredLink && !trackingMove)) {
            return;
        }

        // Only show Steam info for game torrents
        if (!isGameTorrent(targetLink)) {
            return;
        }

        if (currentHoveredLink && targetLink !== currentHoveredLink && tip.style.display === 'block') {
            tip.style.opacity = '0';
            tip.style.pointerEvents = 'none';
            tip.style.display = 'none';
            hoverId++;
            trackingMove = false;
            currentFetch = null;
        }

        currentHoveredLink = targetLink;
        userHovering = true;
        const rawName = targetLink.textContent;
        debugLog(`👆 HOVER on: "${rawName}"`);
        let gameName = cleanName(rawName);
        debugLog(`🧹 Cleaned name: "${gameName}"`);

        // Fallback: if cleanName returned null, use a basic cleaned version
        if (!gameName) {
            // Basic cleanup: split on brackets/parens, take first part
            gameName = rawName.trim()
                .replace(/^\[[^\]]*\]\s*/g, '')  // Remove [brackets] at start
                .replace(/[._]/g, ' ')            // Normalize separators
                .split(/[\(\[]/)[0]               // Split on ( or [
                .split(/\s+/)
                .slice(0, 4)                      // First 4 words
                .join(' ')
                .trim();
            if (!gameName || gameName.length < 2) {
                currentHoveredLink = null;
                userHovering = false;
                return;
            }
        }

        clearTimeout(showTimeout);

        const thisId = ++hoverId;
        trackingMove = true;
        lastMoveEvent = e;

        triggerShowAndFadeIn(e, gameName);

        showTimeout = setTimeout(async () => {
            if (hoverId !== thisId || !currentHoveredLink || currentHoveredLink !== targetLink) {
                if (!currentHoveredLink || currentHoveredLink !== targetLink) {
                    trackingMove = false;
                }
                return;
            }

            currentFetch = fetchSteamWithFallback(gameName);
            const data = await currentFetch;
            debugLog(`📝 Hover fetch result for "${gameName}":`, data ? `✓ got data for "${data.name}"` : '✗ null');
            currentFetch = null;

            if (hoverId !== thisId || !currentHoveredLink || currentHoveredLink !== targetLink) {
                if (!currentHoveredLink || currentHoveredLink !== targetLink) {
                    trackingMove = false;
                }
                return;
            }

            if (!data) {
                resetMediaState();
                const searchUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(gameName)}`;
                tip.innerHTML = `<p>No Steam info found for<br><strong>${escapeHtml(gameName)}</strong></p><p><a href="${escapeHtml(searchUrl)}" target="_blank" rel="noopener noreferrer">Search on Steam</a></p>`;
            } else {
                const title = escapeHtml(data.name || gameName);
                const shortDescription = escapeHtml(data.short_description || 'No description available.');
                const releaseDate = escapeHtml(data.releaseDate || '');
                const rawStoreUrl = data.storeUrl || `https://store.steampowered.com/search/?term=${encodeURIComponent(gameName)}`;
                const storeUrl = escapeHtml(rawStoreUrl);
                const rawTorrentUrl = `${window.location.origin}${targetLink.getAttribute('href')}`;
                const torrentUrl = escapeHtml(rawTorrentUrl);
                const tagLabel = getTagSource(data) === 'steam' ? 'Tags' : 'Genres';
                const tagsHtml = data.tags?.length ?
                    `<p class="steamTags"><strong>${tagLabel}:</strong> ${data.tags.map(escapeHtml).join(' • ')}</p>` :
                    '';
                const reviewHtml = (data.reviewInfo && data.reviewInfo.desc !== 'N/A' && data.reviewInfo.desc !== 'No Reviews') ?
                    `<p class="steamRating"><strong>Rating:</strong> ${getRatingStars(data.reviewInfo.percent, data.reviewInfo.desc)}<span class="ratingText">${escapeHtml(data.reviewInfo.desc)}${data.reviewInfo.total ? `  |  ${escapeHtml(data.reviewInfo.total.toLocaleString())} reviews` : ''}</span></p>` :
                    '';
                const releaseDateHtml = data.releaseDate ?
                    `<p class="steamReleaseDate"><strong>Released:</strong> ${releaseDate}</p>` :
                    '';
                const media = getRenderMedia(data);
                const mediaHtml = renderMediaCarousel(media, data.name || gameName);

                stopActiveVideo();
                currentMedia = media;
                currentMediaIndex = 0;
                currentMediaTitle = data.name || gameName;
                currentStoreUrl = rawStoreUrl;
                currentTorrentUrl = rawTorrentUrl;

                tip.innerHTML = `
                    ${mediaHtml}
                    <p><strong>${title}</strong></p>
                    ${releaseDateHtml}
                    <p>${shortDescription}</p>
                    ${reviewHtml}
                    ${tagsHtml}
                    <div class="tipActions">
                        ${data.storeUrl ? `<a href="${storeUrl}" target="_blank" rel="noopener noreferrer">🎮 Open on Steam</a>` : '<span></span>'}
                        <button class="magnetDownloadBtn" data-torrent-url="${torrentUrl}">
                            🧲 Magnet Download
                        </button>
                    </div>
                `;
                warmSteamTags(data);
            }

            if (hoverId === thisId && currentHoveredLink === targetLink) {
                positionTip(lastMoveEvent);
                trackingMove = false;
                tip.style.opacity = '1';
                tip.style.pointerEvents = 'auto';
            } else {
                startHideAnimation();
            }

        }, SHOW_DELAY);
    }, true);


    document.addEventListener('mouseout', (e) => {
        const leavingCurrentLink = currentHoveredLink && currentHoveredLink === e.target.closest(SEL);
        const destinationIsTip = tip.contains(e.relatedTarget);
        if (leavingCurrentLink && !destinationIsTip) {
            scheduleHideTip();
            currentHoveredLink = null;
            userHovering = false;
        }
    }, true);

    document.addEventListener('pointermove', (e) => {
        if (trackingMove && tip.style.display === 'block') {
            lastMoveEvent = e;
            positionTip(e);
        }
    }, { capture: true, passive: true });

    // ═══════════════════════════════════════════════════════════════════════════
    // MAGNET DOWNLOAD BUTTON (in hover card)
    // ═══════════════════════════════════════════════════════════════════════════

    // Magnet link cache to avoid re-fetching
    const magnetCache = new Map();

    // Fetch magnet link from torrent page
    async function fetchMagnetLink(torrentUrl) {
        // Ensure full URL
        const fullUrl = torrentUrl.startsWith('http')
            ? torrentUrl
            : window.location.origin + torrentUrl;

        console.log('[Magnet Download] Fetching:', fullUrl);

        // Check cache first
        if (magnetCache.has(fullUrl)) {
            console.log('[Magnet Download] Cache hit!');
            return magnetCache.get(fullUrl);
        }

        // Use regular fetch - same origin so cookies are included automatically
        const response = await fetch(fullUrl, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'text/html'
            }
        });

        console.log('[Magnet Download] Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const magnetLink = doc.querySelector('a[href^="magnet:"]');

        if (magnetLink) {
            const magnet = magnetLink.getAttribute('href');
            magnetCache.set(fullUrl, magnet);
            console.log('[Magnet Download] Found magnet link!');
            return magnet;
        } else {
            console.error('[Magnet Download] No magnet link found in page');
            throw new Error('Magnet link not found');
        }
    }

    async function runMagnetButton(btn) {
        if (!btn || btn.classList.contains('loading')) return;

        const torrentUrl = btn.dataset.torrentUrl;
        console.log('[Magnet Download] Torrent URL:', torrentUrl);

        if (!torrentUrl) {
            console.error('[Magnet Download] No torrent URL found in button data');
            return;
        }

        const originalContent = btn.innerHTML;
        btn.classList.add('loading');
        btn.textContent = 'Loading...';

        try {
            const magnet = await fetchMagnetLink(torrentUrl);
            console.log('[Magnet Download] Got magnet link:', magnet.substring(0, 60) + '...');

            window.location.href = magnet;

            btn.classList.remove('loading');
            btn.textContent = 'Opening...';

            setTimeout(() => {
                btn.innerHTML = originalContent;
            }, 2000);
        } catch (err) {
            console.error('[Magnet Download] Error:', err);
            btn.classList.remove('loading');
            btn.textContent = 'Failed - ' + err.message;

            setTimeout(() => {
                btn.innerHTML = originalContent;
            }, 3000);
        }
    }

    // Handle clicks on magnet download button inside tooltip
    tip.addEventListener('click', async (e) => {
        const expandButton = e.target.closest('.steamMediaExpandBtn');
        if (expandButton) {
            e.preventDefault();
            e.stopPropagation();
            openTheatre(currentMediaIndex);
            return;
        }

        const prevButton = e.target.closest('.steamMediaPrevBtn');
        if (prevButton) {
            e.preventDefault();
            e.stopPropagation();
            setActiveMedia(currentMediaIndex - 1);
            return;
        }

        const nextButton = e.target.closest('.steamMediaNextBtn');
        if (nextButton) {
            e.preventDefault();
            e.stopPropagation();
            setActiveMedia(currentMediaIndex + 1);
            return;
        }

        const thumbButton = e.target.closest('.steamMediaThumbBtn');
        if (thumbButton) {
            e.preventDefault();
            e.stopPropagation();
            const index = parseInt(thumbButton.dataset.mediaIndex, 10);
            if (!isNaN(index)) {
                setActiveMedia(index);
            }
            return;
        }

        const playButton = e.target.closest('.steamMediaPlayBtn');
        if (playButton) {
            e.preventDefault();
            e.stopPropagation();
            const index = parseInt(playButton.dataset.mediaIndex, 10);
            if (!isNaN(index) && index !== currentMediaIndex) {
                setActiveMedia(index);
            }
            await playActiveVideo();
            return;
        }

        const btn = e.target.closest('.magnetDownloadBtn');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        if (btn.classList.contains('loading')) return;

        const torrentUrl = btn.dataset.torrentUrl;
        console.log('[Magnet Download] Torrent URL:', torrentUrl);

        if (!torrentUrl) {
            console.error('[Magnet Download] No torrent URL found in button data');
            return;
        }

        // Show loading state
        const originalContent = btn.innerHTML;
        btn.classList.add('loading');
        btn.textContent = '⏳ Loading...';

        try {
            const magnet = await fetchMagnetLink(torrentUrl);
            console.log('[Magnet Download] Got magnet link:', magnet.substring(0, 60) + '...');

            // Open magnet link - this triggers qBittorrent!
            window.location.href = magnet;

            // Show success briefly
            btn.classList.remove('loading');
            btn.textContent = '✓ Opening...';

            setTimeout(() => {
                btn.innerHTML = originalContent;
            }, 2000);

        } catch (err) {
            console.error('[Magnet Download] Error:', err);
            btn.classList.remove('loading');
            btn.textContent = '✗ Failed - ' + err.message;

            setTimeout(() => {
                btn.innerHTML = originalContent;
            }, 3000);
        }
    });

    theatre.addEventListener('click', async (e) => {
        if (e.target === theatre) {
            e.preventDefault();
            e.stopPropagation();
            closeTheatre();
            return;
        }

        const magnetButton = e.target.closest('.csrinruSteamTheatreMagnetBtn');
        if (magnetButton) {
            e.preventDefault();
            e.stopPropagation();
            await runMagnetButton(magnetButton);
            return;
        }

        const closeButton = e.target.closest('.csrinruSteamTheatreCloseBtn');
        if (closeButton) {
            e.preventDefault();
            e.stopPropagation();
            closeTheatre();
            return;
        }

        const playToggle = e.target.closest('.csrinruSteamTheatreVideoPlayToggle');
        if (playToggle) {
            e.preventDefault();
            e.stopPropagation();
            toggleTheatreVideoPlayback();
            return;
        }

        const muteToggle = e.target.closest('.csrinruSteamTheatreVideoMuteToggle');
        if (muteToggle) {
            e.preventDefault();
            e.stopPropagation();
            toggleTheatreVideoMute();
            return;
        }

        const fullscreenButton = e.target.closest('.csrinruSteamTheatreFullscreenBtn');
        if (fullscreenButton) {
            e.preventDefault();
            e.stopPropagation();
            await toggleTheatreFullscreen();
            return;
        }

        const videoFullscreenButton = e.target.closest('.csrinruSteamTheatreVideoFullscreenBtn');
        if (videoFullscreenButton) {
            e.preventDefault();
            e.stopPropagation();
            await toggleTheatreVideoFullscreen();
            return;
        }

        const videoSurface = e.target.closest('.csrinruSteamTheatreVideo');
        if (videoSurface) {
            e.preventDefault();
            e.stopPropagation();
            try {
                videoSurface.focus({ preventScroll: true });
            } catch (_) {
                videoSurface.focus();
            }
            toggleTheatreVideoPlayback();
            return;
        }

        const prevButton = e.target.closest('.csrinruSteamTheatrePrevBtn');
        if (prevButton) {
            e.preventDefault();
            e.stopPropagation();
            setTheatreMedia(theatreMediaIndex - 1);
            return;
        }

        const nextButton = e.target.closest('.csrinruSteamTheatreNextBtn');
        if (nextButton) {
            e.preventDefault();
            e.stopPropagation();
            setTheatreMedia(theatreMediaIndex + 1);
        }
    });

    theatre.addEventListener('input', (e) => {
        const seek = e.target.closest('.csrinruSteamTheatreVideoSeek');
        if (!seek) return;

        const video = getTheatreVideoElement();
        if (!video) return;

        const value = parseFloat(seek.value);
        if (!isNaN(value)) {
            video.currentTime = value;
            updateTheatreVideoControls(video);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!isTheatreOpen()) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closeTheatre();
            return;
        }

        if (e.target.closest?.('.csrinruSteamTheatreVideoControls')) return;

        if (theatreMode === 'video' && isVideoMedia(theatreMedia[theatreMediaIndex])) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                seekTheatreVideo(-5);
                return;
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                seekTheatreVideo(5);
                return;
            }

            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                toggleTheatreVideoPlayback();
                return;
            }
        }

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setTheatreMedia(theatreMediaIndex - 1);
            return;
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            setTheatreMedia(theatreMediaIndex + 1);
        }
    });

    document.addEventListener('fullscreenchange', updateTheatreFullscreenButton);

    console.log("1337x Steam Hover Preview script loaded.");

})();
