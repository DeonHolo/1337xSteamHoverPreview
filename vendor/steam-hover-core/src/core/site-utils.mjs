/** Same-origin source pages are fetched by site actions or bounded recovery after failed name matching. */
export function createSourcePageTools({ window: win, document: doc, timeout = 8000 }) {
    const pending = new Map();
    const completed = new Map();
    function safeUrl(value) {
        const url = new URL(value, win.location.href);
        if (url.origin !== win.location.origin || !/^https?:$/.test(url.protocol)) {
            throw new Error('This action requires a page on the current site.');
        }
        url.hash = '';
        return url;
    }
    function fetchDocument(value) {
        const url = safeUrl(value).href;
        if (completed.has(url)) return Promise.resolve(completed.get(url));
        if (pending.has(url)) return pending.get(url);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const request = win
            .fetch(url, {
                credentials: 'same-origin',
                signal: controller.signal,
                headers: { Accept: 'text/html' }
            })
            .then(async (response) => {
                if (!response.ok) throw new Error(`Source page returned HTTP ${response.status}.`);
                const contentType = response.headers?.get('content-type') || '';
                if (contentType && !contentType.includes('text/html'))
                    throw new Error('Source page did not return HTML.');
                const finalUrl = safeUrl(response.url || url);
                if (finalUrl.pathname !== new URL(url).pathname)
                    throw new Error('Source page redirected. Open it to check access.');
                const topic = new URL(url).searchParams.get('t');
                if (topic && finalUrl.searchParams.get('t') && finalUrl.searchParams.get('t') !== topic)
                    throw new Error('Source page redirected to a different topic.');
                const html = await response.text();
                if (html.length > 2000000)
                    throw new Error('Source page is too large to inspect safely. Open it to check the Steam link.');
                const parsed = new win.DOMParser().parseFromString(html, 'text/html');
                completed.set(url, parsed);
                while (completed.size > 20) completed.delete(completed.keys().next().value);
                return parsed;
            })
            .catch((error) => {
                if (error.name === 'AbortError') throw new Error('Source page timed out. Try again.');
                throw error;
            })
            .finally(() => {
                clearTimeout(timer);
                pending.delete(url);
            });
        pending.set(url, request);
        return request;
    }
    return {
        safeUrl,
        fetchDocument,
        getSteamLinks: (root) => extractSteamAppLinks(root || doc),
        invalidate: (value) => completed.delete(safeUrl(value).href)
    };
}

/** Only consider links in a caller-selected content region, never unrelated sidebar links. */
export function extractSteamAppLinks(root) {
    if (!root?.querySelectorAll) return [];
    const apps = new Map();
    for (const anchor of root.querySelectorAll('a[href]')) {
        try {
            const url = new URL(anchor.getAttribute('href'));
            if (url.protocol !== 'https:' && url.protocol !== 'http:') continue;
            if (url.hostname !== 'store.steampowered.com') continue;
            const appId = url.pathname.match(/^\/app\/(\d+)(?:\/|$)/)?.[1];
            if (!appId || !/^[1-9]\d{0,9}$/.test(appId) || Number(appId) > 4294967295) continue;
            apps.set(appId, {
                appId: Number(appId),
                name: anchor.textContent.trim().slice(0, 160) || `Steam App ${appId}`
            });
        } catch {
            /* Relative/forum redirect links are not explicit Steam identity evidence. */
        }
    }
    return [...apps.values()];
}

export function threadTagColor(tag, theme = 'dark') {
    let hash = 0;
    for (const ch of String(tag).toLowerCase()) hash = (ch.charCodeAt(0) + ((hash << 5) - hash)) | 0;
    // Generic theme-aware palette; the CS.RIN adapter preserves Enhanced colours separately.
    const hue = ((hash % 360) + 360) % 360;
    const dark = theme !== 'light';
    let light = dark ? 72 : 28;
    for (let attempt = 0; attempt < 8; attempt++) {
        const rgb = tagHslToRgb(hue / 360, 0.65, light / 100);
        const luminance = tagRelativeLuminance(rgb);
        const background = dark ? tagRelativeLuminance([28, 28, 28]) : tagRelativeLuminance([240, 240, 240]);
        const contrast = (Math.max(luminance, background) + 0.05) / (Math.min(luminance, background) + 0.05);
        if (contrast >= 4.5) return '#' + rgb.map((value) => value.toString(16).padStart(2, '0')).join('');
        light += dark ? 3 : -3;
    }
    return dark ? '#eeeeee' : '#171717';
}

function tagRelativeLuminance(rgb) {
    const linear = rgb.map((value) => {
        const c = value / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function tagHslToRgb(h, s, l) {
    const a = s * Math.min(l, 1 - l);
    return [0, 8, 4].map((n) => {
        const k = (n + h * 12) % 12;
        return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
    });
}
