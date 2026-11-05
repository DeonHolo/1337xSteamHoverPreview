const escape = (value) =>
    String(value).replace(
        /[&<>"']/g,
        (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]
    );

export const GAMES = {
    632470: { name: 'Disco Elysium - The Final Cut', tags: ['RPG', 'Story Rich', 'Detective'] },
    1173140: { name: 'Disco Elysium - Soundtrack and Artbooklet', type: 'dlc', parent: 632470, tags: ['Music'] },
    1233220: { name: 'Disco Elysium - The Final Cut Soundtrack', type: 'music', tags: ['Music'] },
    489830: { name: 'The Elder Scrolls V: Skyrim Special Edition', tags: ['Open World', 'RPG', 'Fantasy'] },
    598120: {
        name: 'The Elder Scrolls V: Skyrim Special Edition - Creations',
        type: 'dlc',
        parent: 489830,
        tags: ['RPG']
    },
    72850: { name: 'The Elder Scrolls V: Skyrim', tags: ['Open World', 'RPG'] },
    611670: { name: 'The Elder Scrolls V: Skyrim VR', tags: ['VR', 'RPG'] },
    5245310: { name: 'Idle Demon Lord II', tags: ['Idler', 'Action RPG', 'Loot'] },
    2885530: { name: 'MeowPower!Yachiyo', tags: ['Beat em up', 'Action', 'Cute'] },
    2780710: { name: "Asgard's Fall — Viking Survivors", tags: ['Action Roguelike', 'Bullet Hell', 'Roguelite'] },
    999005: { name: 'Portal 2', tags: ['Puzzle'] },
    620: { name: 'Portal 2', tags: ['Puzzle', 'Co-op', 'First-Person', 'Comedy', 'Sci-fi'] },
    4834840: { name: 'Ecstatica', tags: ['Exploration', 'Action', 'Action-Adventure', '3D', 'Stylized'] },
    2778580: { name: 'ELDEN RING Shadow of the Erdtree', type: 'dlc', parent: 1245620, tags: ['Action', 'RPG'] },
    1245620: { name: 'ELDEN RING', tags: ['Souls-like', 'Open World', 'RPG', 'Dark Fantasy', 'Action'] },
    292030: { name: 'The Witcher 3: Wild Hunt', tags: ['Open World', 'RPG', 'Story Rich', 'Fantasy', 'Adventure'] },
    2215430: { name: 'Ghost of Tsushima DIRECTOR’S CUT', tags: ['Open World', 'Action', 'Adventure'] },
    1462570: { name: 'Lost in Random', tags: ['Adventure', 'Action', 'Dark Fantasy'] },
    1929610: { name: 'Demonologist', tags: ['Horror', 'Co-op', 'Multiplayer'] },
    303210: { name: 'The Beginner’s Guide', tags: ['Story Rich', 'Walking Simulator', 'Exploration'] },
    17470: { name: 'Dead Space', tags: ['Horror', 'Sci-fi', 'Survival Horror'] },
    220200: { name: 'Kerbal Space Program', tags: ['Space', 'Simulation', 'Sandbox'] },
    999001: { name: 'Completely Different', tags: ['Strategy'] },
    999002: { name: 'Portal 2 Soundtrack', type: 'music', tags: ['Music'] },
    999003: { name: 'Portal 2 Costume Pack', type: 'dlc', parent: 620, tags: ['Puzzle'] },
    999004: { name: 'Portal Quest', tags: ['Adventure'] }
};

export function game(id) {
    const value = GAMES[id] || {
        name: `Nebula Quest ${Number(id) - 700000}`,
        tags: ['Exploration', 'Adventure', 'Space']
    };
    const appId = Number(id);
    return {
        type: value.type || 'game',
        steam_appid: appId,
        name: value.name,
        header_image: `https://cdn.example.test/header-${id}.svg`,
        short_description: `${value.name} is a controlled browser fixture.`,
        release_date: { coming_soon: false, date: appId === 4834840 ? 'Oct 26, 2026' : 'Apr 18, 2011' },
        genres: [{ id: '1', description: 'GENRE_ONLY_SENTINEL' }],
        screenshots: [
            {
                id: 0,
                path_full: `https://cdn.example.test/full-${id}.svg`,
                path_thumbnail: `https://cdn.example.test/thumb-${id}.svg`
            },
            {
                id: 1,
                path_full: `https://cdn.example.test/full2-${id}.svg`,
                path_thumbnail: `https://cdn.example.test/thumb2-${id}.svg`
            }
        ],
        movies: [
            {
                id: 1,
                name: `${value.name} trailer`,
                thumbnail: `https://cdn.example.test/trailer-${id}.svg`,
                mp4: {
                    480: `https://cdn.example.test/trailer-${id}.mp4`,
                    max: `https://cdn.example.test/trailer-hd-${id}.mp4`
                }
            }
        ],
        ...(value.parent ? { fullgame: { appid: String(value.parent), name: GAMES[value.parent]?.name } } : {})
    };
}

export const defaultRows = [
    { id: 100, appId: 620, title: 'Portal 2' },
    { id: 101, appId: 4834840, title: 'Ecstatica' },
    { id: 102, appId: 2778580, title: 'ELDEN RING Shadow of the Erdtree' },
    { id: 103, appId: 292030, title: 'The Witcher 3: Wild Hunt' }
];

export function listingHtml(site, rows = defaultRows) {
    const heading = site === '1337x' ? '1337x controlled fixture' : 'CS.RIN.RU controlled fixture';
    const content =
        site === '1337x'
            ? `<table class="table-list torrent-list"><thead><tr><th>Name</th><th>Category</th><th>Uploader</th></tr></thead><tbody>${rows.map((row) => `<tr data-topic-id="${row.id}"><td class="name"><i class="flaticon-games"></i><a class="fixture-title" data-fixture-id="${row.id}" href="/torrent/${row.id}/fixture/">${escape(row.title)} [FitGirl Repack]</a></td><td><a href="/sub/10/0/">Games</a></td><td><a href="/user/FitGirl/">FitGirl</a></td></tr>`).join('')}</tbody></table>`
            : `<table class="forumline"><tbody><tr class="section"><td colspan="2">Announcements</td></tr><tr><td><a class="topictitle" href="viewtopic.php?f=10&amp;t=1">Forum rules</a></td></tr><tr class="section"><td colspan="2">Topics</td></tr>${rows.map((row) => `<tr class="topicrow" data-topic-id="${row.id}"><td><a class="topictitle fixture-title" data-fixture-id="${row.id}" href="viewtopic.php?f=10&amp;t=${row.id}">[Info] [CRACKED] ${escape(row.title)}</a><span class="pagination"><a href="viewtopic.php?f=10&amp;t=${row.id}&amp;start=120">5</a> <a href="viewtopic.php?f=10&amp;t=${row.id}&amp;start=30">2</a></span></td><td><a class="lastpost" title="Last post" href="viewtopic.php?f=10&amp;t=${row.id}&amp;p=900${row.id}#p900${row.id}">Last post</a></td></tr>`).join('')}</tbody></table>`;
    return `<!doctype html><html><head><meta charset="utf-8"><title>${heading}</title><style>html{color-scheme:${site === '1337x' ? 'light' : 'dark'}}body{font:16px Arial;margin:24px;min-height:1600px;background:${site === '1337x' ? '#f2f2f2' : '#1c1c1c'};color:${site === '1337x' ? '#111' : '#c1cccc'}}table{width:100%;border-collapse:collapse}td,th{padding:14px;border-bottom:1px solid #777}a{color:${site === '1337x' ? '#174b9a' : '#8dd9ff'}}.pagination{font-size:12px;margin-left:14px}</style></head><body><h1>${heading}</h1>${content}<button id="outside-focus">Outside control</button></body></html>`;
}

export const imageSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="920" height="430" viewBox="0 0 920 430"><rect width="920" height="430" fill="#17334b"/><path d="M0 330L200 120L420 300L650 70L920 330" fill="#72bca3"/><text x="35" y="65" font-family="Arial" font-size="38" fill="white">Steam media fixture</text></svg>';

export function makeMockConfig(overrides = {}) {
    return {
        games: Object.fromEntries(Object.keys(GAMES).map((id) => [id, game(id)])),
        tags: Object.fromEntries(Object.entries(GAMES).map(([id, value]) => [id, value.tags])),
        search: {
            'portal 2': [620, 999002, 999003, 999001, 999004],
            ecstatica: [4834840],
            'elden ring shadow of the erdtree': [2778580],
            'elden ring': [1245620],
            'the witcher 3 wild hunt': [292030],
            'ghost of tsushima directors cut': [2215430],
            'lost in random': [1462570],
            demonologist: [1929610],
            'the beginners guide': [303210],
            'dead space': [17470],
            'kerbal space program': [220200]
        },
        delays: { search: 35, details: 55, tags: 90, reviews: 650, batch: 35 },
        preload: 'hover',
        hidden: false,
        ...overrides
    };
}

// Runs in the page. Keep all helpers inside the function for addInitScript serialization.
export function installMockUserscriptEnvironment(config) {
    const normalize = (value) =>
        String(value)
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[’']/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    const started = performance.now();
    const requests = [];
    const changes = new Map();
    const menus = [];
    let active = 0,
        peak = 0;
    window.__fixture = {
        config,
        requests,
        menus,
        started,
        firstReady: null,
        firstTags: null,
        failures: [],
        active: 0,
        peak: 0
    };
    let hidden = Boolean(config.hidden);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => (hidden ? 'hidden' : 'visible')
    });
    window.__fixture.setHidden = (value) => {
        hidden = Boolean(value);
        document.dispatchEvent(new Event('visibilitychange'));
    };
    window.GM_getValue = (key, fallback) => {
        const value = localStorage.getItem(`gm:${key}`);
        if (value !== null) {
            try {
                return JSON.parse(value);
            } catch {
                return fallback;
            }
        }
        if (/settings/i.test(key))
            return { preload: config.preload, theme: 'site', debug: false, reviewPurchaseType: 1 };
        return fallback;
    };
    window.GM_setValue = (key, value) => {
        const old = window.GM_getValue(key, null);
        localStorage.setItem(`gm:${key}`, JSON.stringify(value));
        for (const listener of changes.get(key) || []) listener(key, old, value, false);
    };
    window.GM_addValueChangeListener = (key, listener) => {
        if (!changes.has(key)) changes.set(key, new Set());
        changes.get(key).add(listener);
        return changes.size;
    };
    window.GM_removeValueChangeListener = () => {};
    window.GM_registerMenuCommand = (label, callback) => {
        menus.push({ label, callback });
        return menus.length;
    };
    window.GM_unregisterMenuCommand = () => {};
    window.GM_addStyle = (css) => {
        const style = document.createElement('style');
        style.textContent = css;
        (document.head || document.documentElement).append(style);
        return style;
    };
    window.GM_setClipboard = (text) => {
        window.__fixture.copied = String(text);
    };
    window.requestIdleCallback = (callback) =>
        setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0);
    window.cancelIdleCallback = clearTimeout;
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
            writeText: async (text) => {
                window.__fixture.copied = String(text);
            }
        }
    });
    window.GM_xmlhttpRequest = (options) => {
        const url = new URL(options.url),
            entry = { url: url.href, start: performance.now() - started, kind: 'unknown' };
        let status = 200,
            payload,
            contentType = 'application/json',
            delay = 50;
        if (url.pathname.includes('storesearch')) {
            entry.kind = 'search';
            entry.term = url.searchParams.get('term');
            const term = normalize(entry.term);
            let ids = Object.hasOwn(config.searchTerms || {}, entry.term)
                ? config.searchTerms[entry.term]
                : config.search[term];
            if (!ids) {
                const number = term.match(/^nebula quest (\d+)$/);
                ids = number ? [700000 + Number(number[1])] : [];
            }
            payload = {
                total: ids.length,
                items: ids.map((id) => ({
                    id,
                    name: config.games[id]?.name || `Nebula Quest ${id - 700000}`,
                    type: 'app',
                    tiny_image: `https://cdn.example.test/header-${id}.svg`
                }))
            };
        } else if (url.pathname === '/search/results/') {
            entry.kind = 'searchFallback';
            entry.term = url.searchParams.get('term');
            const ids = config.storefrontSearch?.[normalize(entry.term)] || [];
            const escapeText = (value) =>
                String(value).replace(
                    /[&<>"]/g,
                    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]
                );
            payload = {
                success: 1,
                total_count: ids.length,
                results_html: ids
                    .map(
                        (id) =>
                            '<a class="search_result_row" data-ds-appid="' +
                            id +
                            '" href="https://store.steampowered.com/app/' +
                            id +
                            '/"><span class="title">' +
                            escapeText(config.games[id]?.name || '') +
                            '</span></a>'
                    )
                    .join('')
            };
        } else if (url.pathname.includes('appdetails')) {
            const ids = (url.searchParams.get('appids') || '').split(',');
            entry.appIds = ids.map(Number);
            entry.kind = ids.length > 1 ? 'batch' : 'details';
            if (ids.length > 1) {
                status = 400;
                payload = null;
            } else {
                const id = Number(ids[0]);
                const value = config.games[id] || {
                    type: 'game',
                    steam_appid: id,
                    name: `Nebula Quest ${id - 700000}`,
                    header_image: `https://cdn.example.test/header-${id}.svg`,
                    short_description: 'Generated fixture',
                    release_date: { coming_soon: false, date: 'Nov 1, 2026' },
                    genres: [{ description: 'GENRE_ONLY_SENTINEL' }]
                };
                payload = { [id]: { success: true, data: value } };
            }
        } else if (url.pathname.includes('GetAppReviews') || url.pathname.includes('appreviews')) {
            entry.kind = 'reviews';
            const input = JSON.parse(url.searchParams.get('input_json') || '{}');
            entry.appId = input.appid || Number(url.pathname.match(/appreviews\/(\d+)/)?.[1]);
            const summary = {
                num_reviews: 1,
                review_score: 7,
                review_score_desc: 'Positive',
                total_positive: 44,
                total_negative: 0,
                total_reviews: 44
            };
            payload = url.pathname.includes('GetAppReviews')
                ? { response: { query_summary: summary, reviews: [], cursor: '*' } }
                : { success: 1, query_summary: summary, reviews: [], cursor: '*' };
            if (config.zeroReviews) {
                summary.total_positive = 0;
                summary.total_reviews = 0;
                summary.review_score_desc = '';
            }
        } else if (/^\/app\/\d+/.test(url.pathname)) {
            entry.kind = 'tags';
            entry.appId = Number(url.pathname.match(/^\/app\/(\d+)/)[1]);
            contentType = 'text/html';
            const labels = config.tags[entry.appId] || ['Exploration', 'Adventure', 'Space'];
            payload = `<!doctype html><html><head><title>${config.games[entry.appId]?.name || 'Steam fixture'}</title></head><body><div class="glance_tags popular_tags">${labels.map((tag) => `<a class="app_tag" href="/tags/en/${encodeURIComponent(tag)}/">${tag}</a>`).join('')}</div></body></html>`;
        } else {
            status = 404;
            payload = { error: 'unmocked endpoint' };
        }
        if (config.failOnce?.[entry.kind]) {
            config.failOnce[entry.kind]--;
            status = 503;
            payload = entry.kind === 'tags' ? '<html>Temporarily unavailable</html>' : { error: 'temporary' };
        }
        if (config.invalidJson?.[entry.kind]) {
            contentType = 'text/html';
            payload = '<html>Unexpected homepage</html>';
        }
        delay =
            config.delaysByTerm?.[entry.term]?.[entry.kind] ??
            config.delaysByApp?.[entry.appId]?.[entry.kind] ??
            config.delays[entry.kind] ??
            delay;
        requests.push(entry);
        active++;
        peak = Math.max(peak, active);
        window.__fixture.active = active;
        window.__fixture.peak = peak;
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            active--;
            window.__fixture.active = active;
            entry.end = performance.now() - started;
            entry.status = status;
        };
        const timer = setTimeout(() => {
            finish();
            const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
            options.onload?.({
                status,
                statusText: status === 200 ? 'OK' : 'Fixture error',
                response: options.responseType === 'json' && typeof payload !== 'string' ? payload : text,
                responseText: text,
                responseHeaders: `Content-Type: ${contentType}\r\n`,
                finalUrl: url.href
            });
        }, delay);
        return {
            abort() {
                if (settled) return;
                clearTimeout(timer);
                entry.aborted = true;
                finish();
                options.onabort?.({ status: 0, statusText: 'Aborted' });
            }
        };
    };
    const observer = new MutationObserver(() => {
        const card = document.querySelector('.steamHoverPreview, .steamHoverTip, .csrinruSteamHoverTip');
        if (!card || getComputedStyle(card).display === 'none') return;
        const tags = card.querySelector('.steamTags');
        const hasTags =
            tags &&
            /Puzzle|Exploration|Souls-like|Open World|Story Rich|Horror|Space/.test(tags.textContent) &&
            !tags.textContent.includes('GENRE_ONLY_SENTINEL');
        const ready = card.dataset.previewState === 'ready' || Boolean(card.querySelector('.steamMediaShell'));
        if (ready && !window.__fixture.firstReady)
            window.__fixture.firstReady = {
                at: performance.now() - started,
                hasTags: Boolean(hasTags),
                text: card.textContent.slice(0, 1200)
            };
        if (hasTags && !window.__fixture.firstTags) window.__fixture.firstTags = performance.now() - started;
    });
    observer.observe(document, { childList: true, subtree: true, attributes: true, characterData: true });
}
