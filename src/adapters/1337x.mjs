export function create1337xAdapter({ window: win, document: doc, cleanTitle, sourceTools }) {
    const selector =
        'table.torrent-list td.name a[href*="/torrent/"], table.torrents td.name a[href*="/torrent/"], table.table-list td.name a[href*="/torrent/"]';
    const rows = new WeakMap();
    const magnets = new Map();
    const uploaderPattern =
        /(?:^|[^a-z0-9])(?:fitgirl|dodi|elamigos|kaoskrew|kaos|johncena141|masquerade|gnarly|flt|codex|plaza|skidrow|razor1911|prophet|reloaded|hoodlum|darksiders|empress|tenoke|tinyiso|igggames(?:com)?|ovagames|xatab|gamedrive|emadmoner)(?:$|[^a-z0-9])/i;
    const gamePage =
        /\/(?:games|category-search\/[^/]+\/games)(?:\/|$)/i.test(win.location.pathname) ||
        /\/cat\/(?:games)(?:\/|$)/i.test(win.location.pathname);

    function getSource(link) {
        if (!link?.matches?.(selector)) return null;
        let url;
        try {
            url = sourceTools.safeUrl(link.getAttribute('href'));
        } catch {
            return null;
        }
        const id = url.pathname.match(/^\/torrent\/(\d+)(?:\/|$)/)?.[1];
        if (!id) return null;
        const row = link.closest('tr');
        if (!row) return null;
        const rawTitle = link.textContent.replace(/\s+/g, ' ').trim();
        const categories = [...row.querySelectorAll('a[href*="/cat/"], a[href*="/sub/"], [data-category]')]
            .map((a) => `${a.textContent} ${a.getAttribute('data-category') || ''}`)
            .join(' ')
            .trim();
        const uploader = row.querySelector('a[href*="/user/"]')?.textContent.trim() || '';
        const fingerprint = `${rawTitle}|${url.href}|${categories}|${uploader}|${row.className}|${row.querySelector('i')?.className || ''}`;
        const previous = rows.get(row);
        if (previous?.fingerprint === fingerprint && previous.link === link) return previous.source;
        const explicitGame =
            gamePage ||
            /\b(?:games?|windows|pc(?: games?)?)\b/i.test(categories) ||
            row.matches('[data-category="Games"], [data-category="games"]') ||
            Boolean(
                row.querySelector(
                    'i.flaticon-games, i.flaticon-apps, i.flaticon-windows, i.fa-windows, [data-category="Games"], [data-category="games"], [data-category="Windows"]'
                )
            );
        const explicitOther = /\b(?:applications?|software|movies|television|tv|music|anime)\b/i.test(categories);
        const titleHint = /\b(?:fitgirl|dodi|elamigos|repack|tenoke|skidrow|codex|gog)\b/i.test(rawTitle);
        const eligible = explicitGame || (!explicitOther && (uploaderPattern.test(uploader) || titleHint));
        const title = eligible ? cleanTitle(rawTitle) : null;
        const explicit = sourceTools.getSteamLinks(row);
        const titleAppId = rawTitle.match(/\b(?:steam[ _-]*)?app[ _-]*id\s*[:=]\s*([1-9]\d{1,9})\b/i)?.[1];
        const source = title
            ? {
                  key: `1337x:${id}`,
                  title,
                  rawTitle,
                  url: url.href,
                  link,
                  explicitAppId:
                      explicit.length === 1 ? explicit[0].appId : titleAppId ? Number(titleAppId) : undefined,
                  detectionReason: explicitGame
                      ? 'game-category'
                      : uploaderPattern.test(uploader)
                        ? 'game-uploader'
                        : 'release-marker'
              }
            : null;
        rows.set(row, { fingerprint, link, source });
        return source;
    }

    async function getMagnet(source) {
        if (magnets.has(source.url)) return magnets.get(source.url);
        const request = sourceTools
            .fetchDocument(source.url)
            .then((parsed) => {
                const value = parsed.querySelector('a[href^="magnet:"]')?.getAttribute('href');
                if (!isValidMagnet(value))
                    throw new Error('No valid magnet link was found. Open the torrent page to check it.');
                return value;
            })
            .catch((error) => {
                magnets.delete(source.url);
                sourceTools.invalidate?.(source.url);
                throw error;
            });
        magnets.set(source.url, request);
        return request;
    }

    return {
        id: '1337x',
        name: '1337x Steam Hover Preview',
        selector,
        defaultTheme: 'light',
        showAppId: false,
        getLinks: (root = doc) => [...root.querySelectorAll(selector)],
        getSource,
        getActions: () => [{ id: 'magnet', label: 'Magnet Download', icon: 'magnet' }],
        async runAction(id, source) {
            if (id !== 'magnet') return;
            try {
                const magnet = await getMagnet(source);
                win.location.href = magnet;
                return { message: 'Opening magnet…' };
            } catch (error) {
                error.sourceUrl = source.url;
                error.retryable = true;
                throw error;
            }
        },
        async findAppIds(source) {
            const parsed = await sourceTools.fetchDocument(source.url);
            const content = parsed.querySelector(
                '#description, .torrent-description, .torrent-detail-description, article'
            );
            if (!content) throw new Error('No description region was found. Paste the correct Steam URL or AppID.');
            return sourceTools.getSteamLinks(content);
        }
    };
}

export function isValidMagnet(value) {
    if (typeof value !== 'string' || value.length > 32768) return false;
    try {
        const url = new URL(value);
        return (
            url.protocol === 'magnet:' &&
            url.searchParams
                .getAll('xt')
                .some(
                    (xt) =>
                        /^urn:btih:(?:[a-f0-9]{40}|[a-z2-7]{32})$/i.test(xt) || /^urn:btmh:1220[a-f0-9]{64}$/i.test(xt)
                )
        );
    } catch {
        return false;
    }
}
