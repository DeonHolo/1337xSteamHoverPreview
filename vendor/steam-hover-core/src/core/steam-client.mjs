import SteamTextFuse from '../assets/fuse.basic.min.mjs';

/** Shared Steam providers, matching, request scheduling and field-level cache. No runtime dependencies. */
export const CORE_VERSION = '1.0.15';

const STEAM_SCHEMA = 3;
const STEAM_RESOLVER = 11;
const STEAM_PROVIDER = 2;
const STEAM_DAY = 86400000;
const STEAM_LANGUAGE = 'english';
const STEAM_COUNTRY = 'us';
const STEAM_DEFAULT_SETTINGS = Object.freeze({ preload: 'nearby', theme: 'site', debug: false, reviewPurchaseType: 1 });

function steamError(code, message, extra = {}) {
    return Object.assign(new Error(message), { code, candidates: [], ...extra });
}

function steamAbortError() {
    return steamError('ABORTED', 'The preview request was cancelled.', { name: 'AbortError' });
}

function steamAppId(value) {
    const text = String(value ?? '').trim();
    return /^[1-9]\d{0,9}$/.test(text) && Number(text) <= 4294967295 ? String(Number(text)) : null;
}

function steamParseAppInput(value) {
    const direct = steamAppId(value);
    if (direct) return direct;
    try {
        const url = new URL(String(value).trim());
        if (!['https:', 'http:'].includes(url.protocol) || url.hostname !== 'store.steampowered.com') return null;
        return steamAppId(url.pathname.match(/^\/app\/(\d+)(?:\/|$)/)?.[1]);
    } catch {
        return null;
    }
}

export function normalizeForMatch(value) {
    return String(value ?? '')
        .replace(/[®™©℠]/g, '')
        .normalize('NFKD')
        .replace(/\p{M}+/gu, '')
        .toLocaleLowerCase('en')
        .replace(/\bs[. ]t[. ]a[. ]l[. ]k[. ]e[. ]r\b/g, 'stalker')
        .replace(/\bf[. ]e[. ]a[. ]r\b/g, 'fear')
        .replace(/&/g, ' and ')
        .replace(/[®™©]/g, '')
        .replace(/[’'`]/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function steamStripCommercialEdition(value) {
    const title = String(value).trim();
    // A purchase year belongs to the package only after an explicit subtitle separator.
    // Keep years in the game's own name, and keep standalone Anniversary Edition identities.
    const datedPackage = title.match(
        /^(.+?)\s*(?::|[–—]|\s-\s)\s*(?:(?:19|20)\d{2}\s+)?(?:(?:digital\s+)?deluxe|ultimate|gold|premium|complete|collector['’]?s|game\s+of\s+the\s+year|goty)\s+(?:edition|bundle)$/i
    );
    if (datedPackage) return datedPackage[1].trim();
    const anniversaryPackage = title.match(/^(.+?)\s*(?::|[–—]|\s-\s)\s*\d{1,2}[- ]year\s+anniversary\s+edition$/i);
    if (anniversaryPackage) return anniversaryPackage[1].trim();
    // Explicit game + soundtrack bundles do not turn a soundtrack into the target product.
    // Do not unwrap arbitrary multi-game bundles.
    const soundtrackBundle = title.match(/^(.+?)\s+(?:&|and|\+)\s+(?:original\s+)?soundtrack\s+bundle$/i);
    if (soundtrackBundle) return soundtrackBundle[1].trim();
    const standard = title
        .replace(
            /\s*[:\-–—]?\s+(?:(?:digital\s+)?deluxe|ultimate|gold|premium|complete|collector['’]?s|game\s+of\s+the\s+year|goty)\s+(?:edition|bundle)$/i,
            ''
        )
        .trim();
    if (standard !== title) return standard;
    // Named commercial editions, e.g. ": Apex Predator Edition", still belong to the base game.
    // Preserve standalone remakes/remasters/definitive editions rather than dropping their identity.
    const named = title.match(/^(.+?)\s*[:–—]\s*([^:]{1,80})\s+edition$/i);
    return named &&
        !/\b(?:remake|remaster(?:ed)?|redux|vr|intergrade|definitive|enhanced|special|anniversary)\b/i.test(named[2])
        ? named[1].trim()
        : title;
}

function steamStripIncludedExtra(value) {
    // Require an explicit join/including marker and a complete metadata component.
    // Keep names such as DLC Quest, C++ DLC and named expansions intact.
    return String(value)
        .replace(
            /(?:\s*(?<![+&])[+&](?![+&])\s*|\s+(?:incl\.?|including)\s+)(?:(?:(?:all|\d+)\s*)?dlcs?(?:\s*\/\s*(?:bonuses|extras))?|(?:original\s+|digital\s+)?soundtrack|ost|(?:digital\s+)?artbook|bonus(?:es|\s+content)?|extras?)\s*[.…]*$/i,
            ''
        )
        .trim();
}

function steamStripPackaging(value) {
    let title = String(value).trim();
    // Components compose in either order. Never remove arbitrary subtitle words.
    for (let pass = 0; pass < 16; pass++) {
        const next = steamStripCommercialEdition(steamStripIncludedExtra(title));
        if (!next || next === title) break;
        title = next;
    }
    return title;
}

export function steamTitleQueries(value) {
    const title = String(value).trim();
    const primary = steamStripPackaging(title);
    const variants = [];
    if (/\benhanced\s+remaster\b/i.test(primary) && /\b4k\s*[/ ]\s*hd\s+edition\b/i.test(primary)) {
        variants.push(
            primary
                .replace(/\b4k\s*[/ ]\s*hd\s+edition\b\s*[-:–—]?\s*/i, '')
                .replace(/\s+/g, ' ')
                .trim()
        );
    }
    variants.push(primary, title);
    const presentation = steamPresentationTitle(primary);
    if (presentation.kind) variants.push(presentation.title);
    return [...new Set(variants.filter(Boolean))];
}

/** Search syntax is separate from game identity: compare the complete title even after a broader lookup. */
export function steamSearchQueries(value) {
    const queries = [];
    const broader = [];
    for (const title of steamTitleQueries(value)) {
        const neutral = title
            .replace(/[®™©℠]/g, '')
            .replace(/[’‘]/g, "'")
            .replace(/&/g, ' and ')
            // Query punctuation is broader than subtitle separators: !, ?, /, quotes, Unicode marks, etc.
            // Preserve apostrophes and meaningful +/# symbols; the original title remains an available fallback.
            .replace(/[^\p{L}\p{N}\s'+#]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const spaced = steamComparisonText(neutral);
        queries.push(neutral, title);
        if (spaced !== neutral) broader.push(spaced);
        // Only an explicit subtitle boundary supplies a fallback. Never remove arbitrary trailing words.
        const prefix = title.split(/\s+[-‐‑‒–—―]\s+|\s*[:–—]\s*/)[0].trim();
        const words = normalizeForMatch(prefix).split(' ');
        if (prefix !== title && (words.length >= 2 || words[0].length >= 6)) queries.push(prefix);
        // Broaden retrieval only, after full queries. Complete identity is still scored below.
        // Keep every protected number/edition marker in each fallback search.
        const terms = spaced.split(/\s+/);
        const protectedWords = steamIdentity(title).important;
        if (terms.length >= 3 && prefix === title) {
            for (const count of [terms.length - 1, 2]) {
                const fallback = terms.slice(0, count).join(' ');
                const identity = steamIdentity(fallback);
                const substantial = identity.tokens.filter((word) => !STEAM_STOP_WORDS.has(word));
                if (substantial.length >= 2 && [...protectedWords].every((word) => identity.important.has(word)))
                    broader.push(fallback);
            }
        }
        const meaningful = terms.filter((word) => !STEAM_STOP_WORDS.has(word.toLowerCase()));
        if (prefix === title && !protectedWords.size && meaningful.length >= 2) {
            for (const word of [meaningful[0], meaningful.at(-1)]) {
                if (word.length >= 5 && !STEAM_GENERIC_WORDS.has(word.toLowerCase())) broader.push(word);
            }
        }
    }
    return [...new Set([...queries, ...broader].filter(Boolean))].slice(0, 6);
}

function steamCleanCommonTitle(value) {
    return String(value ?? '')
        .replace(/\u00a0/g, ' ')
        .replace(/\bS\.T\.A\.L\.K\.E\.R\.?/gi, 'STALKER')
        .replace(/\bF\.E\.A\.R\.?/gi, 'FEAR')
        .replace(/[._]+/g, ' ')
        .replace(/\s+(?:update|hotfix|patch)\b(?=\s+(?:v(?:ersion)?\s*)?\d).*$/i, '')
        .replace(/\s*-\s*b\d{5,}\b.*$/i, '')
        .replace(/\s+(?:incl\.?|including)\s+(?:all\s+)?(?:dlcs?|updates?|bonus|extras?)\b.*$/i, '')
        .replace(/\s+(?:v(?:ersion)?\s*\d+(?:[. -]\d+)*|build\s*[#:]?\s*\d+)\b.*$/i, '')
        .replace(/\s*\((?:v\d|build\s*\d|multi\d|\d{4}[-/]\d{2}[-/]\d{2})[^)]*\)\s*/gi, ' ')
        .replace(/\s+(?:x64|x86|64[- ]?bit|32[- ]?bit|multi\d+)\b/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/** Release metadata belongs to the adapter. Proper-title substrings such as Ghost, Lost and Demonologist survive. */
export function cleanTorrentTitle(raw) {
    if (typeof raw !== 'string') return null;
    let title = raw.replace(/^\s*(?:\[(?:fitgirl|dodi|elamigos|repack|bober\s*bros|gog)[^\]]*\]\s*)+/i, '');
    title = title.replace(
        /\[[^\]]*\b(?:repack|fitgirl|dodi|elamigos|gog|multi\d*|p2p|iso|linux|windows|x64|x86)\b[^\]]*\]/gi,
        ' '
    );
    // Two-letter publisher fragments are metadata only in a clipped tag after a version block.
    // Without that release context, bracketed title words must survive.
    const fragment = title.match(/\[\s*([a-z][a-z ]{1,15})(?:\.{2,}|…)?$/i);
    if (
        fragment &&
        /\(\s*(?:v\d|build\s*[#:]?\s*\d+|multi\d+)[^()]*\)\s*$/i.test(title.slice(0, fragment.index)) &&
        ['fitgirl', 'dodi', 'elamigos', 'repack', 'gog', 'p2p', 'multi', 'x64', 'x86'].some((name) =>
            name.startsWith(fragment[1].trim().toLowerCase())
        )
    )
        title = title.slice(0, fragment.index);
    // Listings can end midway through a release tag. Strip only recognized trailing metadata.
    title = title
        .replace(/\[\s*(?:fitgirl|dodi|elamigos|repack|bober\s*bros|gog|p2p|multi\d+|x64|x86)\b[^[\]]*$/i, ' ')
        .replace(/\(\s*(?:v\d+(?=[.\s+…-]|$)|build\s*[#:]?\s*\d+|multi\d+)[^()]*$/i, ' ');
    title = steamCleanCommonTitle(title);
    title = title.replace(
        /\s*[- ]\s*(?:codex|cpy|skidrow|plaza|hoodlum|flt|doge|darksiders|empress|rune|tenoke|tinyiso|elamigos|fitgirl|dodi|razor1911|reloaded|prophet|fairlight|gog|p2p|steam|steamworks|3dm|ali213|anomaly|kaos|revolt|simplex|iso|bober\s*bros)\s*$/i,
        ''
    );
    title = title
        .replace(/\s+(?:repack|portable|linux|macos|windows)\s*$/i, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    if (/^(?:soundtrack|artbook|trainer|multiplayer\s+crack)\s*(?:for\b|[:\-])/i.test(title)) return null;
    return title.length >= 2 ? title : null;
}

/** Administrative-thread eligibility is structural in the forum adapter, not a word blacklist. */
export function cleanForumTitle(raw) {
    if (typeof raw !== 'string') return null;
    let title = raw.replace(
        /^\s*(?:\[(?:info|request|steam|gog|epic|cracked|not\s+cracked|hypervisor|early\s+access|pre[- ]release|playable|build|update|linux|mac|windows|goldberg|rune|tenoke|flt|skidrow|codex)[^\]]*\]\s*)+/i,
        ''
    );
    title = title.replace(
        /\[(?:info|request|steam|gog|epic|cracked|not\s+cracked|hypervisor|early\s+access|pre[- ]release|playable|build|update|linux|mac|windows|goldberg|rune|tenoke|flt|skidrow|codex)[^\]]*\]/gi,
        ' '
    );
    title = title.replace(
        /\((?:request\s+and\s+share|(?:not\s+)?cracked|hypervisor|multi\d+|build\s*\d+|v\d[^)]*|windows|linux|mac)(?:[^)]*)\)/gi,
        ' '
    );
    title = title.replace(/\s+MOD\s+TOPIC\b.*$/i, '');
    title = steamCleanCommonTitle(title)
        .replace(/\s{2,}/g, ' ')
        .trim();
    return title.length >= 2 ? title : null;
}

const STEAM_ROMAN = Object.freeze({
    ii: '2',
    iii: '3',
    iv: '4',
    v: '5',
    vi: '6',
    vii: '7',
    viii: '8',
    ix: '9',
    x: '10',
    xi: '11',
    xii: '12',
    xiii: '13',
    xiv: '14',
    xv: '15',
    xvi: '16'
});
const STEAM_STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'of', 'for', 'to', 'in', 'on', 'with', 'by']);
const STEAM_EDITION_WORDS = new Set([
    'remake',
    'remastered',
    'remaster',
    'redux',
    'vr',
    'intergrade',
    'definitive',
    'enhanced',
    'special',
    'anniversary'
]);

// Product roles are identity-bearing even when Steam declares a prologue as a "game".
const STEAM_PRODUCT_WORDS = new Set([
    'demo',
    'prologue',
    'playtest',
    'soundtrack',
    'artbook',
    'artbooklet',
    'benchmark',
    'sdk',
    'dedicated',
    'server'
]);
const STEAM_GENERIC_WORDS = new Set([
    'game',
    'games',
    'simulator',
    'simulation',
    'adventure',
    'adventures',
    'quest',
    'story',
    'stories',
    'edition',
    'online'
]);

// Comparison formatting never changes source fingerprints or saved correction keys.
function steamComparisonText(value) {
    return String(value)
        .replace(/\b(?:[a-z][. ]+){2,}[a-z]\b/gi, (word) => word.replace(/[. ]+/g, ''))
        .replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2');
}

// A naming grammar used for every title, without an AppID/title exception table.
// Cut labels are weaker than an exact full title; conflicting cuts remain distinct.
function steamPresentationTitle(value) {
    const text = String(value).trim();
    const match = text.match(/^(.*?)\s+(?:[-:–—]\s*)?(?:the\s+)?(director['’]?s?|final|extended|uncut)\s+cut$/i);
    if (!match || normalizeForMatch(match[1]).length < 4) return { title: text, kind: null };
    return {
        title: match[1].replace(/\s*[-:–—]\s*$/, '').trim(),
        kind: /^director/i.test(match[2]) ? 'directors' : match[2].toLowerCase()
    };
}

function steamIdentity(value) {
    const title = steamComparisonText(steamStripPackaging(value));
    const normalized = normalizeForMatch(title).replace(/\s+dlc$/i, '');
    const tokens = normalized
        .split(' ')
        .filter(Boolean)
        .map((token) => STEAM_ROMAN[token] || (token === 'remastered' ? 'remaster' : token));
    const important = new Set(
        tokens.flatMap((token) => [
            ...(token.match(/\d+/g) || []),
            ...(/^s\d+(?:e\d+)?$/.test(token) || STEAM_EDITION_WORDS.has(token) || STEAM_PRODUCT_WORDS.has(token)
                ? [token]
                : [])
        ])
    );
    const presentation = steamPresentationTitle(title);
    const coreTokens = normalizeForMatch(presentation.title)
        .split(' ')
        .filter(Boolean)
        .map((token) => STEAM_ROMAN[token] || (token === 'remastered' ? 'remaster' : token));
    return { normalized, tokens, important, presentation: presentation.kind, coreTokens };
}

function steamFuseDistance(pattern, text, threshold = 0.25) {
    const result = new SteamTextFuse([text], {
        includeScore: true,
        ignoreLocation: true,
        ignoreFieldNorm: true,
        isCaseSensitive: true,
        threshold,
        minMatchCharLength: 3
    }).search(pattern, { limit: 1 })[0];
    return result?.score ?? 1;
}

function steamWordDistance(a, b, limit) {
    const left = Array.from(a),
        right = Array.from(b);
    if (Math.abs(left.length - right.length) > limit || Math.max(left.length, right.length) > 64) return Infinity;
    let before = null,
        previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let i = 1; i <= left.length; i++) {
        const row = [i];
        for (let j = 1; j <= right.length; j++) {
            row[j] = Math.min(
                previous[j] + 1,
                row[j - 1] + 1,
                previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)
            );
            if (i > 1 && j > 1 && left[i - 1] === right[j - 2] && left[i - 2] === right[j - 1])
                row[j] = Math.min(row[j], before[j - 2] + 1);
        }
        if (Math.min(...row) > limit) return Infinity;
        before = previous;
        previous = row;
    }
    return previous[right.length];
}

function steamFuzzyTitleScore(left, right) {
    const l = left.tokens.filter((token) => !STEAM_STOP_WORDS.has(token));
    const r = right.tokens.filter((token) => !STEAM_STOP_WORDS.has(token));
    if (l.length !== r.length) return 0;
    const changed = l.map((word, index) => (word === r[index] ? null : [word, r[index]])).filter(Boolean);
    if (!changed.length || changed.length > 2) return 0;
    const anchorChars = l.reduce(
        (sum, word, index) => sum + (word === r[index] && !STEAM_GENERIC_WORDS.has(word) ? word.length : 0),
        0
    );
    if (l.length > 1 && anchorChars < 4) return 0;
    if (changed.length > 1 && (l.length < 3 || anchorChars < 7)) return 0;
    let edits = 0;
    for (const [a, b] of changed) {
        const length = Math.min(a.length, b.length);
        if (length < 4) return 0;
        if (l.length === 1 && (length < 7 || (a[0] !== b[0] && length < 10))) return 0;
        // Four-letter words need a transposition or substantial unchanged context.
        // This accepts "Wras" -> "Wars" without treating "Dawn" -> "Down" as a typo.
        if (
            length < 5 &&
            anchorChars < 10 &&
            (a.length !== b.length || [...a].sort().join('') !== [...b].sort().join(''))
        )
            return 0;
        edits += steamWordDistance(a, b, length >= 9 ? 2 : 1);
        if (edits > 2) return 0;
    }
    const aTitle = left.tokens.join(' '),
        bTitle = right.tokens.join(' ');
    const distance = Math.max(steamFuseDistance(aTitle, bTitle), steamFuseDistance(bTitle, aTitle));
    const editScore = 100 * (1 - edits / Math.max(aTitle.length, bTitle.length));
    // Bounded edit checks handle transpositions; Fuse supplies an additional whole-title ranking signal.
    return Math.min(94, Math.round(Math.max(editScore, 100 * (1 - distance))));
}

/** A ranking heuristic, not a probability. Protected sequel/edition mismatches are rejected. */
export function scoreCandidate(query, candidate) {
    const left = steamIdentity(query);
    const right = steamIdentity(typeof candidate === 'string' ? candidate : candidate?.name);
    if (!left.tokens.length || !right.tokens.length) return 0;
    if (
        [...left.important].some((token) => !right.important.has(token)) ||
        [...right.important].some((token) => !left.important.has(token))
    )
        return -Infinity;
    const leftCanonical = left.tokens.join(' ');
    const rightCanonical = right.tokens.join(' ');
    if (leftCanonical === rightCanonical) return 100;
    if (leftCanonical.replace(/ /g, '') === rightCanonical.replace(/ /g, '')) return 98;
    const meaningful = (tokens) => tokens.filter((word) => !STEAM_STOP_WORDS.has(word)).join(' ');
    if (meaningful(left.tokens) === meaningful(right.tokens)) return 98;
    if (left.presentation && right.presentation && left.presentation !== right.presentation) return -Infinity;
    if (left.presentation || right.presentation) {
        if (meaningful(left.coreTokens) === meaningful(right.coreTokens)) return 94;
        const fuzzy = steamFuzzyTitleScore({ tokens: left.coreTokens }, { tokens: right.coreTokens });
        if (fuzzy >= 85) return Math.min(90, fuzzy);
    }
    const l = new Set(left.tokens);
    const r = new Set(right.tokens);
    const weight = (token) => (STEAM_STOP_WORDS.has(token) ? 0.25 : 1);
    const intersection = [...l].reduce((sum, token) => sum + (r.has(token) ? weight(token) : 0), 0);
    const lWeight = [...l].reduce((sum, token) => sum + weight(token), 0);
    const rWeight = [...r].reduce((sum, token) => sum + weight(token), 0);
    const precision = intersection / rWeight;
    const recall = intersection / lWeight;
    const tokenScore = precision + recall ? Math.round((100 * (2 * precision * recall)) / (precision + recall)) : 0;
    // Overlap alone cannot authorize dropping meaningful subtitle words or reordering a title.
    return Math.max(Math.min(tokenScore, 84), steamFuzzyTitleScore(left, right));
}

// These describe a DLC product, not a removable game subtitle. Use the variant to retrieve
// candidates, but authorize it only after appdetails confirms a DLC and its game parent.
function steamDlcTitle(value) {
    return String(value)
        .replace(/^(?:expansion|downloadable\s+content|dlc)\s*[-:–—]\s*/i, '')
        .replace(
            /\s*[-:–—]\s*(?:(?:immersion|mechanics|content|story|cosmetic|music|expansion)\s+pack|expansion|dlc)\s*$/i,
            ''
        )
        .trim();
}

/** Steam's website search can find localized aliases missing from the small storesearch API index. */
export function parseSteamSearchResults(body, DOMParserClass) {
    if (
        !body ||
        ![1, true].includes(body.success) ||
        typeof body.results_html !== 'string' ||
        !Number.isInteger(body.total_count) ||
        body.total_count < 0 ||
        body.results_html.length > 300000
    )
        throw steamError('SCHEMA', 'Steam returned invalid website search results.');
    if (body.total_count === 0) return [];
    if (typeof DOMParserClass !== 'function')
        throw steamError('SCHEMA', 'This browser cannot parse Steam search results.');
    const doc = new DOMParserClass().parseFromString(body.results_html, 'text/html');
    const rows = [...doc.querySelectorAll('a.search_result_row')];
    if (!rows.length) throw steamError('SCHEMA', 'Steam website search markup was not recognized.');
    const items = [];
    const seen = new Set();
    for (const row of rows) {
        let href;
        try {
            href = new URL(row.getAttribute('href'), 'https://store.steampowered.com').href;
        } catch {
            continue;
        }
        const appId = steamParseAppInput(href);
        const declared = row.getAttribute('data-ds-appid');
        if (!appId || seen.has(appId) || (declared && steamAppId(declared) !== appId)) continue;
        const name = String(row.querySelector('.title')?.textContent || '')
            .trim()
            .slice(0, 400);
        if (!name) continue;
        seen.add(appId);
        items.push({ appId: Number(appId), name });
        if (items.length >= 10) break;
    }
    return items;
}

/** Manual suggestions are deliberately permissive; automatic identity scoring remains separate. */
export function rankSteamSuggestions(query, candidates) {
    const normalize = (value) =>
        normalizeForMatch(value)
            .split(' ')
            .map((token) => STEAM_ROMAN[token] || token)
            .join(' ');
    const pattern = normalize(query);
    const seen = new Set();
    return candidates
        .flatMap((candidate) => {
            const appId = steamAppId(candidate?.appId);
            const name = String(candidate?.name || '')
                .trim()
                .slice(0, 400);
            if (!appId || !name || seen.has(appId)) return [];
            seen.add(appId);
            const title = normalize(name);
            const nameScore =
                pattern && title
                    ? pattern === title
                        ? 100
                        : Math.max(
                              0,
                              Math.round(
                                  100 *
                                      (1 -
                                          Math.max(
                                              steamFuseDistance(pattern, title, 1),
                                              steamFuseDistance(title, pattern, 1)
                                          ))
                              )
                          )
                    : 0;
            return [
                {
                    appId: Number(appId),
                    name,
                    score: Number.isFinite(candidate.score) ? candidate.score : null,
                    nameScore
                }
            ];
        })
        .sort((a, b) => b.nameScore - a.nameScore)
        .slice(0, 8);
}

function steamPriority(priority) {
    if (typeof priority === 'number') return priority;
    return priority === 'hover' ? 0 : priority === 'nearby' ? 10 : 30;
}

/** One bounded worker pool. Identical resources share a job while each consumer can cancel independently. */
export function createRequestScheduler(options = {}) {
    const now = options.now || Date.now;
    const random = options.random || Math.random;
    const scheduleTimer = options.setTimeout || globalThis.setTimeout.bind(globalThis);
    const clearTimer = options.clearTimeout || globalThis.clearTimeout.bind(globalThis);
    const isHidden = options.isHidden || (() => false);
    const concurrency = Math.max(1, options.concurrency ?? 3);
    const hiddenConcurrency = Math.min(concurrency, Math.max(1, options.hiddenConcurrency ?? 1));
    const minInterval = Math.max(0, options.minInterval ?? 100);
    const maxRetries = options.maxRetries ?? 1;
    const maxCooldownWait = options.maxCooldownWait ?? 2000;
    const jobs = new Map();
    const cooldowns = new Map();
    let active = 0;
    let serial = 0;
    let lastStart = -Infinity;
    let timer = null;
    let disposed = false;
    const counters = { started: 0, shared: 0, cancelled: 0, retried: 0, peakActive: 0 };

    function settle(job, error, value) {
        if (jobs.get(job.key) === job) jobs.delete(job.key);
        job.state = 'done';
        for (const consumer of job.consumers.values()) {
            consumer.cleanup?.();
            if (error) consumer.reject(error);
            else consumer.resolve(value);
        }
        job.consumers.clear();
    }

    function wake(delay = 0) {
        if (disposed) return;
        if (timer !== null) clearTimer(timer);
        timer = scheduleTimer(
            () => {
                timer = null;
                pump();
            },
            Math.max(0, delay)
        );
    }

    function pump() {
        if (disposed) return;
        if (timer !== null) {
            clearTimer(timer);
            timer = null;
        }
        const cap = isHidden() ? hiddenConcurrency : concurrency;
        while (active < cap) {
            const queued = [...jobs.values()]
                .filter((job) => job.state === 'queued' && job.consumers.size)
                .sort((a, b) => a.priority - b.priority || a.order - b.order);
            if (!queued.length) return;
            const time = now();
            let nextWake = Infinity;
            let job = null;
            for (const item of queued) {
                const cooldownRemaining = (cooldowns.get(item.host) || 0) - time;
                if (cooldownRemaining > maxCooldownWait) {
                    settle(
                        item,
                        steamError('HTTP', 'Steam is temporarily rate limited. Try again shortly.', {
                            status: 429,
                            retryable: true,
                            retryAfter: cooldownRemaining
                        })
                    );
                    continue;
                }
                const readyAt = Math.max(item.readyAt, cooldowns.get(item.host) || 0, lastStart + minInterval);
                if (readyAt <= time) {
                    job = item;
                    break;
                }
                nextWake = Math.min(nextWake, readyAt - time);
            }
            if (!job) {
                if (Number.isFinite(nextWake)) wake(nextWake);
                return;
            }
            job.state = 'active';
            active++;
            lastStart = now();
            counters.started++;
            counters.peakActive = Math.max(counters.peakActive, active);
            Promise.resolve()
                .then(() =>
                    job.task({
                        setAbort(fn) {
                            job.abort = typeof fn === 'function' ? fn : null;
                            if (!job.consumers.size) job.abort?.();
                        }
                    })
                )
                .then(
                    (value) => settle(job, null, value),
                    (error) => {
                        const retryAfter = Number(error?.retryAfter) || 0;
                        if (error?.status === 429) cooldowns.set(job.host, now() + Math.max(1000, retryAfter || 30000));
                        const cooldownWait = error?.status === 429 ? Math.max(1000, retryAfter || 30000) : retryAfter;
                        if (
                            job.consumers.size &&
                            error?.retryable &&
                            cooldownWait <= maxCooldownWait &&
                            job.attempt < maxRetries &&
                            !disposed
                        ) {
                            job.attempt++;
                            counters.retried++;
                            job.abort = null;
                            job.state = 'queued';
                            job.readyAt =
                                now() + Math.max(retryAfter, 500 * 2 ** (job.attempt - 1) + Math.round(random() * 200));
                        } else settle(job, error);
                    }
                )
                .finally(() => {
                    active--;
                    wake();
                });
        }
    }

    function run(key, task, { priority = 'background', signal, host = '' } = {}) {
        if (disposed || signal?.aborted) return Promise.reject(steamAbortError());
        let job = jobs.get(key);
        if (!job) {
            job = {
                key,
                task,
                host,
                priority: steamPriority(priority),
                order: serial++,
                readyAt: now(),
                state: 'queued',
                attempt: 0,
                abort: null,
                consumers: new Map()
            };
            jobs.set(key, job);
        } else {
            counters.shared++;
            job.priority = Math.min(job.priority, steamPriority(priority));
        }
        const id = serial++;
        const promise = new Promise((resolve, reject) => {
            const consumer = { resolve, reject, cleanup: null };
            const cancel = () => {
                if (!job.consumers.delete(id)) return;
                consumer.cleanup?.();
                counters.cancelled++;
                reject(steamAbortError());
                if (!job.consumers.size) {
                    if (job.state === 'queued') {
                        job.state = 'done';
                        jobs.delete(key);
                    } else if (job.state === 'active') job.abort?.();
                }
                wake();
            };
            if (signal) {
                signal.addEventListener('abort', cancel, { once: true });
                consumer.cleanup = () => signal.removeEventListener('abort', cancel);
            }
            job.consumers.set(id, consumer);
        });
        wake();
        return promise;
    }

    function cancelAll() {
        if (timer !== null) {
            clearTimer(timer);
            timer = null;
        }
        for (const job of [...jobs.values()]) {
            job.abort?.();
            settle(job, steamAbortError());
        }
    }

    return {
        run,
        promote(key, priority = 'hover') {
            const job = jobs.get(key);
            if (job) job.priority = Math.min(job.priority, steamPriority(priority));
            wake();
        },
        cancelAll,
        onVisibilityChange: () => wake(),
        stats: () => ({
            ...counters,
            active,
            queued: [...jobs.values()].filter((job) => job.state === 'queued').length
        }),
        dispose() {
            cancelAll();
            disposed = true;
            if (timer !== null) clearTimer(timer);
        }
    };
}

function steamSettings(input) {
    return {
        preload: ['nearby', 'all', 'hover'].includes(input?.preload) ? input.preload : 'nearby',
        theme: ['site', 'light', 'dark'].includes(input?.theme) ? input.theme : 'site',
        debug: input?.debug === true,
        reviewPurchaseType: input?.reviewPurchaseType === 0 ? 0 : 1
    };
}

function steamDecodeStored(value) {
    try {
        return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
        return null;
    }
}

function steamHttpUrl(value) {
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch {
        return '';
    }
}

function steamDetailsRecord(raw, expectedId) {
    const id = steamAppId(raw?.steam_appid);
    if (
        !raw ||
        !id ||
        !expectedId ||
        id !== expectedId ||
        typeof raw.name !== 'string' ||
        !raw.name.trim() ||
        typeof raw.type !== 'string'
    )
        throw steamError('SCHEMA', 'Steam returned incomplete app details.');
    const movies = Array.isArray(raw.movies)
        ? raw.movies.slice(0, 12).map((movie) => {
              const result = { name: String(movie.name || '').slice(0, 200), thumbnail: steamHttpUrl(movie.thumbnail) };
              for (const key of [
                  'mp4',
                  'webm',
                  'video_url',
                  'hls_h264',
                  'hlsManifest',
                  'hls',
                  'dash_h264',
                  'dash_av1'
              ]) {
                  if (typeof movie[key] === 'string') result[key] = steamHttpUrl(movie[key]);
                  else if (movie[key] && typeof movie[key] === 'object')
                      result[key] = Object.fromEntries(
                          Object.entries(movie[key])
                              .slice(0, 8)
                              .map(([label, url]) => [label, steamHttpUrl(url)])
                              .filter(([, url]) => url)
                      );
              }
              return result;
          })
        : [];
    return {
        steam_appid: Number(id),
        type: raw.type.toLowerCase(),
        name: raw.name.trim().slice(0, 400),
        short_description: String(raw.short_description || '').slice(0, 3000),
        header_image: steamHttpUrl(raw.header_image),
        release_date: {
            coming_soon: raw.release_date?.coming_soon === true,
            date: String(raw.release_date?.date || '').slice(0, 120)
        },
        screenshots: Array.isArray(raw.screenshots)
            ? raw.screenshots
                  .slice(0, 40)
                  .map((item) => ({
                      path_full: steamHttpUrl(item.path_full),
                      path_thumbnail: steamHttpUrl(item.path_thumbnail)
                  }))
                  .filter((item) => item.path_full || item.path_thumbnail)
            : [],
        movies,
        ...(steamAppId(raw.fullgame?.appid)
            ? {
                  fullgame: {
                      appid: steamAppId(raw.fullgame.appid),
                      name: String(raw.fullgame.name || '').slice(0, 400)
                  }
              }
            : {})
    };
}

export function parseReviewSummary(body) {
    const summary = body?.response?.query_summary;
    if (
        !summary ||
        !Number.isInteger(summary.total_reviews) ||
        summary.total_reviews < 0 ||
        !Number.isInteger(summary.total_positive) ||
        summary.total_positive < 0 ||
        !Number.isInteger(summary.total_negative) ||
        summary.total_negative < 0 ||
        summary.total_positive + summary.total_negative !== summary.total_reviews
    ) {
        throw steamError('SCHEMA', 'Steam returned an incomplete review summary.');
    }
    return {
        desc: String(
            summary.review_score_desc || (summary.total_reviews ? 'User reviews' : 'No user reviews yet')
        ).slice(0, 120),
        percent: summary.total_reviews ? Math.round((100 * summary.total_positive) / summary.total_reviews) : null,
        total: summary.total_reviews,
        positive: summary.total_positive,
        negative: summary.total_negative
    };
}

export function createSteamClient(env = {}) {
    if (typeof env.gmRequest !== 'function') throw new TypeError('createSteamClient requires a GM request transport.');
    const now = env.now || Date.now;
    const scheduleTimer = env.setTimeout || globalThis.setTimeout.bind(globalThis);
    const clearTimer = env.clearTimeout || globalThis.clearTimeout.bind(globalThis);
    const scheduler = createRequestScheduler({
        now,
        random: env.random,
        setTimeout: scheduleTimer,
        clearTimeout: clearTimer,
        isHidden: env.isHidden,
        concurrency: env.concurrency ?? 3,
        hiddenConcurrency: env.hiddenConcurrency ?? 1,
        minInterval: env.minInterval ?? 100,
        maxRetries: env.maxRetries ?? 1
    });
    const storageKey = env.storageKey || 'steamHoverCore_v3';
    const settingsKey = env.settingsKey || `${storageKey}_settings`;
    const listeners = new Set();
    const tables = Object.fromEntries(
        ['details', 'tags', 'reviews', 'mappings', 'corrections', 'negative'].map((name) => [name, new Map()])
    );
    const searchCache = new Map();
    const refreshingDetails = new Map();
    const reviewing = new Map();
    const matches = new Map();
    let settings = { ...STEAM_DEFAULT_SETTINGS };
    let epoch = 0;
    let generation = 0;
    let saveTimer = null;
    let disposed = false;
    let initialized = false;
    let removeStorageListener = null;
    const measurements = {
        requests: 0,
        bytes: 0,
        previews: 0,
        tagCacheHits: 0,
        previewCacheHits: 0,
        tagReadyMs: [],
        errors: []
    };
    const limits = { details: 180, tags: 240, reviews: 240, mappings: 500, corrections: 250, negative: 120 };
    const stamp = () => Math.max(now(), epoch);

    function emit(kind, appId = null) {
        if (disposed) return;
        const event = { kind, appId: appId ? Number(appId) : null, data: appId ? getPreviewData(appId) : undefined };
        if (settings.debug) console.debug('[Steam Hover]', { kind, appId: event.appId });
        for (const listener of listeners) {
            try {
                listener(event);
            } catch {
                /* One consumer cannot break another. */
            }
        }
    }

    function noteError(error, resource) {
        if (error?.code === 'ABORTED') return;
        measurements.errors.push({
            at: now(),
            resource: resource.split(':').slice(0, 2).join(':'),
            code: error?.code || 'UNKNOWN',
            status: error?.status || null
        });
        measurements.errors = measurements.errors.slice(-30);
    }

    function checkGeneration(token, signal) {
        if (disposed || token !== generation || signal?.aborted) throw steamAbortError();
    }

    function touch(table, key) {
        const item = tables[table].get(String(key));
        if (item) item.used = now();
        return item || null;
    }

    function setRecord(table, key, item) {
        if (table === 'corrections')
            item = { ...item, ts: Math.max(item.ts, (tables.corrections.get(String(key))?.ts || 0) + 1) };
        tables[table].set(String(key), { ...item, used: now() });
        prune();
        saveSoon();
    }

    function prune() {
        for (const [name, table] of Object.entries(tables)) {
            if (table.size <= limits[name]) continue;
            const oldest = [...table].sort((a, b) => (a[1].used || a[1].ts) - (b[1].used || b[1].ts));
            for (const [key] of oldest.slice(0, table.size - limits[name])) table.delete(key);
        }
    }

    function snapshot() {
        prune();
        const value = {
            schema: STEAM_SCHEMA,
            provider: STEAM_PROVIDER,
            resolver: STEAM_RESOLVER,
            epoch,
            savedAt: stamp(),
            ...Object.fromEntries(Object.entries(tables).map(([name, table]) => [name, Object.fromEntries(table)]))
        };
        let text = JSON.stringify(value);
        // Bound stored text as well as counts. Corrections are intentionally retained longest.
        while (text.length > (env.maxStorageChars || 650000)) {
            const records = ['details', 'reviews', 'tags', 'mappings', 'negative'].flatMap((name) =>
                [...tables[name]].map(([key, item]) => ({ name, key, used: item.used || item.ts }))
            );
            if (!records.length) break;
            records.sort((a, b) => a.used - b.used);
            const oldest = records[0];
            tables[oldest.name].delete(oldest.key);
            value[oldest.name] = Object.fromEntries(tables[oldest.name]);
            text = JSON.stringify(value);
        }
        return text;
    }

    function saveNow() {
        if (saveTimer !== null) {
            clearTimer(saveTimer);
            saveTimer = null;
        }
        try {
            return Promise.resolve(env.setValue?.(storageKey, snapshot())).catch(() => {});
        } catch {
            return Promise.resolve();
        }
    }

    function saveSoon() {
        if (disposed || saveTimer !== null) return;
        saveTimer = scheduleTimer(() => {
            saveTimer = null;
            saveNow();
        }, env.persistDelay ?? 250);
    }

    function validIncoming(name, key, item, incomingEpoch) {
        if (
            !item ||
            typeof item !== 'object' ||
            !Number.isFinite(item.ts) ||
            item.ts < incomingEpoch ||
            item.ts > now() + STEAM_DAY ||
            String(key).length > 800
        )
            return false;
        if (name === 'details') {
            try {
                item.data = steamDetailsRecord(item.data, steamAppId(key));
            } catch {
                return false;
            }
        } else if (name === 'tags') {
            if (
                !steamAppId(key) ||
                !['ready', 'empty', 'error'].includes(item.state) ||
                !Array.isArray(item.tags) ||
                item.tags.some((tag) => typeof tag !== 'string' || tag.length > 100) ||
                item.tags.length > 20
            )
                return false;
        } else if (name === 'reviews') {
            if (
                !/^\d+:[01]$/.test(key) ||
                !steamAppId(key.split(':')[0]) ||
                !['ready', 'empty', 'error'].includes(item.state)
            )
                return false;
            if (
                item.info &&
                (!Number.isInteger(item.info.total) ||
                    item.info.total < 0 ||
                    !Number.isInteger(item.info.positive) ||
                    !Number.isInteger(item.info.negative) ||
                    item.info.positive + item.info.negative !== item.info.total)
            )
                return false;
        } else if (name === 'mappings' || name === 'corrections') {
            if (
                (!(name === 'corrections' && item.deleted === true) && !steamAppId(item.appId)) ||
                typeof item.fingerprint !== 'string' ||
                item.fingerprint.length > 600
            )
                return false;
        } else if (name === 'negative' && !['NO_MATCH', 'AMBIGUOUS_MATCH'].includes(item.code)) return false;
        return true;
    }

    function mergeStored(input, remote = false) {
        const value = steamDecodeStored(input);
        if (
            !value ||
            value.schema !== STEAM_SCHEMA ||
            value.provider !== STEAM_PROVIDER ||
            !Number.isFinite(value.epoch) ||
            value.epoch < epoch
        )
            return;
        let preservedCorrections = null;
        const changedApps = new Set();
        if (value.epoch > epoch) {
            preservedCorrections = new Map(tables.corrections);
            epoch = value.epoch;
            generation++;
            scheduler.cancelAll();
            for (const table of Object.values(tables)) table.clear();
            searchCache.clear();
            matches.clear();
            if (remote) emit('clear');
        }
        for (const name of Object.keys(tables)) {
            if (value.resolver !== STEAM_RESOLVER && (name === 'mappings' || name === 'negative')) continue;
            if (!value[name] || typeof value[name] !== 'object' || Array.isArray(value[name])) continue;
            for (const [key, raw] of Object.entries(value[name]).slice(0, limits[name] * 2)) {
                const item = { ...raw };
                if (!validIncoming(name, key, item, value.epoch)) continue;
                const current = tables[name].get(key);
                if (!current || current.ts < item.ts) {
                    tables[name].set(key, item);
                    if (['details', 'tags', 'reviews'].includes(name)) changedApps.add(key.split(':')[0]);
                } else if (current.ts === item.ts) current.used = Math.max(current.used || 0, item.used || 0);
            }
        }
        if (preservedCorrections) {
            for (const [key, item] of preservedCorrections)
                if (!tables.corrections.has(key)) tables.corrections.set(key, { ...item, ts: stamp() });
            if (remote && preservedCorrections.size) saveSoon();
        }
        prune();
        if (remote) {
            emit('cache');
            for (const appId of changedApps) emit('tags', appId);
        }
    }

    const ready = Promise.all([
        Promise.resolve()
            .then(() => env.getValue?.(storageKey, null))
            .then((value) => mergeStored(value))
            .catch(() => {}),
        Promise.resolve()
            .then(() => env.getValue?.(settingsKey, STEAM_DEFAULT_SETTINGS))
            .then((value) => {
                settings = steamSettings(steamDecodeStored(value));
            })
            .catch(() => {})
    ]).then(() => {
        initialized = true;
        if (typeof env.addValueChangeListener === 'function') {
            try {
                removeStorageListener = env.addValueChangeListener(storageKey, (_key, _old, value, remote) => {
                    if (remote !== false) mergeStored(value, true);
                });
            } catch {
                /* Optional userscript API. */
            }
        }
        emit('settings');
    });

    function retryAfter(headers) {
        const match = String(headers || '').match(/^retry-after:\s*(.+)$/im);
        if (!match) return 0;
        const seconds = Number(match[1]);
        return Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : Math.max(0, Date.parse(match[1]) - now()) || 0;
    }

    async function request(resource, url, { priority, signal, text = false, token = generation } = {}) {
        checkGeneration(token, signal);
        const host = new URL(url).hostname;
        try {
            const value = await scheduler.run(
                resource,
                ({ setAbort }) =>
                    new Promise((resolve, reject) => {
                        let settled = false;
                        const finish = (error, data) => {
                            if (settled) return;
                            settled = true;
                            if (error) reject(error);
                            else resolve(data);
                        };
                        const headers = { 'Accept-Language': 'en-US,en;q=0.9' };
                        if (text && host === 'store.steampowered.com')
                            headers.Cookie =
                                'birthtime=631152000; mature_content=1; wants_mature_content=1; lastagecheckage=1-0-1990';
                        measurements.requests++;
                        let handle;
                        try {
                            handle = env.gmRequest({
                                method: 'GET',
                                url,
                                responseType: text ? 'text' : 'json',
                                timeout: env.timeout ?? 8000,
                                headers,
                                onload(response) {
                                    const bodyText =
                                        typeof response.responseText === 'string'
                                            ? response.responseText
                                            : typeof response.response === 'string'
                                              ? response.response
                                              : '';
                                    measurements.bytes += bodyText.length;
                                    const status = Number(response.status);
                                    if (status < 200 || status >= 300)
                                        return finish(
                                            steamError('HTTP', `Steam returned HTTP ${status}.`, {
                                                status,
                                                retryable: status === 429 || status >= 500,
                                                retryAfter: retryAfter(response.responseHeaders)
                                            })
                                        );
                                    if (text) {
                                        const finalUrl = response.finalUrl || response.responseURL || url;
                                        let finalPage;
                                        try {
                                            finalPage = new URL(finalUrl);
                                        } catch {
                                            /* Handled by schema error. */
                                        }
                                        const expectedId = new URL(url).pathname.match(/^\/app\/(\d+)\//)?.[1];
                                        if (
                                            !finalPage ||
                                            finalPage.hostname !== 'store.steampowered.com' ||
                                            finalPage.pathname.match(/^\/app\/(\d+)\//)?.[1] !== expectedId
                                        )
                                            return finish(
                                                steamError(
                                                    'SCHEMA',
                                                    'Steam redirected away from the requested game page.'
                                                )
                                            );
                                        return finish(null, bodyText);
                                    }
                                    let body = response.response;
                                    if (!body || typeof body !== 'object') {
                                        try {
                                            body = JSON.parse(bodyText);
                                        } catch {
                                            return finish(steamError('SCHEMA', 'Steam returned HTML or invalid JSON.'));
                                        }
                                    }
                                    finish(null, body);
                                },
                                onerror: () =>
                                    finish(steamError('NETWORK', 'Steam could not be reached.', { retryable: true })),
                                ontimeout: () =>
                                    finish(
                                        steamError('NETWORK', 'Steam did not respond in time.', { retryable: true })
                                    ),
                                onabort: () => finish(steamAbortError())
                            });
                        } catch {
                            finish(
                                steamError('NETWORK', 'The userscript manager could not start a Steam request.', {
                                    retryable: false
                                })
                            );
                        }
                        setAbort(() => {
                            try {
                                handle?.abort?.();
                            } finally {
                                finish(steamAbortError());
                            }
                        });
                    }),
                { priority, signal, host }
            );
            checkGeneration(token, signal);
            return value;
        } catch (error) {
            noteError(error, resource);
            throw error;
        }
    }

    async function details(appId, context, force = false) {
        const id = steamAppId(appId);
        if (!id) throw steamError('NO_MATCH', 'The Steam AppID is invalid.');
        const cached = touch('details', id);
        if (cached && !force && now() - cached.ts < STEAM_DAY) return cached.data;
        const body = await request(
            `details:${id}`,
            `https://store.steampowered.com/api/appdetails?appids=${id}&cc=${STEAM_COUNTRY}&l=en`,
            context
        );
        if (body?.[id]?.success !== true) throw steamError('NO_MATCH', 'This Steam app is unavailable.');
        const data = steamDetailsRecord(body[id].data, id);
        checkGeneration(context.token, context.signal);
        setRecord('details', id, { data, ts: stamp() });
        emit('details', id);
        return data;
    }

    async function baseGame(appId, context) {
        let id = steamAppId(appId);
        const originalAppId = id;
        const parentChain = [];
        const visited = new Set();
        for (let depth = 0; depth < 5; depth++) {
            if (!id || visited.has(id)) throw steamError('NO_MATCH', 'Steam supplied a missing or cyclic DLC parent.');
            visited.add(id);
            const app = await details(id, context);
            if (app.type === 'game')
                return {
                    app,
                    match: {
                        kind: parentChain.length ? 'dlc-parent' : 'search',
                        originalAppId: Number(originalAppId),
                        parentChain
                    }
                };
            if (app.type !== 'dlc')
                throw steamError('NO_MATCH', 'This Steam result is not a base game or a DLC with a verified parent.');
            const parent = steamAppId(app.fullgame?.appid);
            if (!parent) throw steamError('NO_MATCH', 'This DLC does not identify a base game.');
            parentChain.push({ appId: Number(id), name: app.name, parentAppId: Number(parent) });
            id = parent;
        }
        throw steamError('NO_MATCH', 'The Steam DLC parent chain is too deep.');
    }

    function sourceIdentity(source) {
        const title = String(source?.title || '')
            .trim()
            .slice(0, 400);
        const fingerprint = normalizeForMatch(title).slice(0, 600);
        if (!title || !fingerprint) throw steamError('NO_MATCH', 'The listing has no searchable game title.');
        const key = String(source?.key || `title:${fingerprint}`).slice(0, 700);
        return { title, fingerprint, key, queryKey: `query:${fingerprint}` };
    }

    function mapIdentity(identity, resolution, queryAlias = true) {
        const mapping = {
            appId: String(resolution.app.steam_appid),
            fingerprint: identity.fingerprint,
            match: resolution.match,
            ts: Math.max(stamp(), (touch('corrections', identity.key)?.ts || 0) + 1)
        };
        setRecord('mappings', identity.key, mapping);
        if (queryAlias) setRecord('mappings', identity.queryKey, mapping);
        tables.negative.delete(identity.key);
        matches.set(mapping.appId, resolution.match);
    }

    async function search(query, context, force = false, storefront = false) {
        // Steam distinguishes punctuation variants, including their empty results.
        const cacheKey =
            (storefront ? 'storefront:' : 'api:') + String(query).trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
        const hit = searchCache.get(cacheKey);
        if (!force && hit && now() - hit.ts < 10 * 60000) return hit.items;
        const body = await request(
            `search:${cacheKey}`,
            storefront
                ? `https://store.steampowered.com/search/results/?cc=${STEAM_COUNTRY}&l=${STEAM_LANGUAGE}&term=${encodeURIComponent(query)}&start=0&count=10&infinite=1`
                : `https://store.steampowered.com/api/storesearch/?cc=${STEAM_COUNTRY}&l=en&term=${encodeURIComponent(query)}`,
            context
        );
        if (storefront) {
            const items = parseSteamSearchResults(body, env.DOMParser);
            searchCache.set(cacheKey, { ts: now(), items });
            if (searchCache.size > 150) searchCache.delete(searchCache.keys().next().value);
            return items;
        }
        if (!body || !Array.isArray(body.items))
            throw steamError('SCHEMA', 'Steam returned an invalid search response.');
        const seen = new Set();
        const items = body.items
            .filter((item) => {
                const id = steamAppId(item?.id);
                if (!id || seen.has(id) || (item.type && item.type !== 'app') || typeof item.name !== 'string')
                    return false;
                seen.add(id);
                return true;
            })
            .slice(0, 10)
            .map((item) => ({ appId: Number(item.id), name: item.name.slice(0, 400) }));
        searchCache.set(cacheKey, { ts: now(), items });
        if (searchCache.size > 150) searchCache.delete(searchCache.keys().next().value);
        return items;
    }

    /** Explicit chooser searches return names only; they neither assign a match nor fetch app metadata. */
    async function searchGames(input, options = {}) {
        await ready;
        const query = String(input ?? '')
            .trim()
            .slice(0, 200);
        const context = { priority: 'hover', signal: options.signal, token: generation };
        checkGeneration(context.token, context.signal);
        if (!query) throw steamError('INVALID_QUERY', 'Enter a game title to search.');
        const terms = steamSearchQueries(query).slice(0, 2);
        const candidates = new Map();
        let problem = null;
        const add = (items) => {
            for (const item of items) candidates.set(item.appId, item);
        };
        const exact = () =>
            rankSteamSuggestions(query, [...candidates.values()]).some((item) => item.nameScore === 100);
        for (const term of terms) {
            try {
                add(await search(term, context, options.force === true));
            } catch (error) {
                if (error?.code === 'ABORTED') throw error;
                problem = error;
                break;
            }
            if (exact()) break;
        }
        if (!exact()) {
            try {
                add(await search(terms[0], context, options.force === true, true));
            } catch (error) {
                if (error?.code === 'ABORTED') throw error;
                problem ||= error;
            }
        }
        checkGeneration(context.token, context.signal);
        if (!candidates.size && problem) throw problem;
        return { query, candidates: rankSteamSuggestions(query, [...candidates.values()]), partial: Boolean(problem) };
    }

    async function resolveSource(source, context, force = false) {
        const identity = sourceIdentity(source);
        const correctionRecord = touch('corrections', identity.key);
        const correction = correctionRecord?.deleted ? null : correctionRecord;
        const resetMarker =
            correctionRecord?.deleted && correctionRecord.fingerprint === identity.fingerprint
                ? correctionRecord
                : null;
        const explicitId =
            correction?.fingerprint === identity.fingerprint
                ? steamAppId(correction.appId)
                : steamAppId(source.explicitAppId);
        if (explicitId) {
            const resolved = await baseGame(explicitId, context);
            resolved.match = {
                ...resolved.match,
                kind: resolved.match.kind === 'dlc-parent' ? 'dlc-parent' : correction ? 'correction' : 'source-link',
                reason: correction ? 'Saved match correction' : 'Steam link from the source listing'
            };
            mapIdentity(identity, resolved, false);
            return resolved;
        }
        const candidateMapping = touch('mappings', identity.key) || touch('mappings', identity.queryKey);
        const mapping = resetMarker && candidateMapping?.ts <= resetMarker.ts ? null : candidateMapping;
        if (!force && mapping?.fingerprint === identity.fingerprint && now() - mapping.ts < 30 * STEAM_DAY) {
            const cachedApp = touch('details', mapping.appId);
            if (cachedApp?.data?.type === 'game') {
                const resolved = { app: cachedApp.data, match: mapping.match || { kind: 'cache' } };
                matches.set(String(mapping.appId), resolved.match);
                return resolved;
            }
            const resolved = await baseGame(mapping.appId, context);
            mapIdentity(identity, resolved);
            return resolved;
        }
        const negative = touch('negative', identity.key);
        if (!force && negative?.fingerprint === identity.fingerprint && now() - negative.ts < 5 * 60000)
            throw steamError(negative.code, negative.message, { candidates: negative.candidates || [] });
        const primary = steamTitleQueries(identity.title)[0];
        const queries = steamSearchQueries(identity.title);
        const considered = new Map();
        let lastFailure = null;
        let sourceChecked = false;
        const sourceEvidence = async () => {
            checkGeneration(context.token, context.signal);
            if (sourceChecked || typeof env.findSourceAppIds !== 'function') return null;
            sourceChecked = true;
            let timer, aborted;
            let found;
            try {
                // A slow/inaccessible source must not hold a failed preview indefinitely.
                // Its existing shared fetch can finish in the background, but late results cannot map a title.
                found = await Promise.race([
                    Promise.resolve().then(() => env.findSourceAppIds(source)),
                    new Promise((resolve, reject) => {
                        timer = setTimeout(() => resolve([]), env.sourceLookupTimeout ?? 1500);
                        aborted = () => reject(steamAbortError());
                        context.signal?.addEventListener('abort', aborted, { once: true });
                    })
                ]);
            } catch (error) {
                if (error?.code === 'ABORTED') throw error;
                return null;
            } finally {
                clearTimeout(timer);
                context.signal?.removeEventListener('abort', aborted);
            }
            checkGeneration(context.token, context.signal);
            if (!Array.isArray(found)) return null;
            const ids = [
                ...new Map(
                    found.filter((item) => steamAppId(item?.appId)).map((item) => [steamAppId(item.appId), item])
                ).values()
            ];
            if (!ids.length) return null;
            if (ids.length > 1)
                throw steamError(
                    'AMBIGUOUS_MATCH',
                    'The source contains multiple Steam games. Choose the correct game.',
                    {
                        candidates: rankSteamSuggestions(
                            identity.title,
                            ids.map((item) => considered.get(Number(item.appId)) || item)
                        )
                    }
                );
            try {
                const resolved = await baseGame(ids[0].appId, context);
                resolved.match = {
                    ...resolved.match,
                    kind: resolved.match.parentChain.length ? 'dlc-parent' : 'source-link',
                    reason: 'Steam link from the source content'
                };
                mapIdentity(identity, resolved, false);
                return resolved;
            } catch (error) {
                if (error?.code !== 'NO_MATCH') throw error;
                return null;
            }
        };
        const lookups = queries.map((query) => ({ query, storefront: false }));
        // One compact website fallback after API variants fail; do not add a request to successful API matches.
        lookups.push({ query: queries[0], storefront: true });
        for (const lookup of lookups) {
            const items = await search(lookup.query, context, force, lookup.storefront);
            for (const item of items) {
                const score = Math.max(
                    scoreCandidate(primary, item),
                    Math.min(84, scoreCandidate(primary, steamDlcTitle(item.name)))
                );
                if (!considered.has(item.appId)) considered.set(item.appId, { ...item, score });
            }
            const ranked = [...considered.values()]
                .filter((item) => Number.isFinite(item.score) && item.score >= 50)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
            const valid = [];
            const validateCandidate = async (candidate) => {
                try {
                    const resolved = await baseGame(candidate.appId, context);
                    const original = touch('details', candidate.appId)?.data;
                    const originalScore = scoreCandidate(primary, original || candidate);
                    const parentScore = scoreCandidate(primary, resolved.app);
                    const verifiedDlcScore =
                        original?.type === 'dlc' && resolved.match.parentChain.length
                            ? Math.min(94, scoreCandidate(primary, steamDlcTitle(original.name)))
                            : -Infinity;
                    const score = resolved.match.parentChain.length
                        ? Math.max(originalScore, parentScore, verifiedDlcScore)
                        : parentScore;
                    if (!Number.isFinite(score) || score < 85) return;
                    if (!valid.some((item) => item.app.steam_appid === resolved.app.steam_appid))
                        valid.push({ ...resolved, score });
                } catch (error) {
                    if (!['NO_MATCH'].includes(error?.code)) throw error;
                    lastFailure = error;
                }
            };
            // Strong exact results require one detail lookup. Ambiguous alternatives share the bounded worker pool.
            if (ranked.length) await validateCandidate(ranked[0]);
            if (!(valid.length === 1 && valid[0].score === 100 && (ranked[1]?.score ?? -Infinity) < 92)) {
                await Promise.all(ranked.slice(1).map(validateCandidate));
            }
            valid.sort((a, b) => b.score - a.score);
            if (
                valid.length &&
                (valid.length === 1 ||
                    (valid[0].score === 100 && valid[1].score < 100) ||
                    valid[0].score - valid[1].score >= 8)
            ) {
                const winner = valid[0];
                winner.match = {
                    ...winner.match,
                    score: winner.score,
                    reason: winner.match.parentChain.length
                        ? 'Verified DLC parent'
                        : winner.score === 100
                          ? 'Validated full title'
                          : 'Validated title variant',
                    candidates: rankSteamSuggestions(identity.title, [...considered.values()])
                };
                mapIdentity(identity, winner);
                return winner;
            }
            if (valid.length > 1) {
                const linked = await sourceEvidence();
                if (linked) return linked;
                const error = steamError(
                    'AMBIGUOUS_MATCH',
                    'More than one Steam game matches this title. Choose the correct game.',
                    {
                        candidates: rankSteamSuggestions(
                            identity.title,
                            valid.map((item) => ({
                                appId: item.app.steam_appid,
                                name: item.app.name,
                                score: item.score
                            }))
                        )
                    }
                );
                setRecord('negative', identity.key, {
                    fingerprint: identity.fingerprint,
                    code: error.code,
                    message: error.message,
                    candidates: error.candidates,
                    ts: stamp()
                });
                throw error;
            }
        }
        const linked = await sourceEvidence();
        if (linked) return linked;
        const candidates = rankSteamSuggestions(identity.title, [...considered.values()]);
        const error = steamError(
            'NO_MATCH',
            lastFailure?.message || 'A confident base-game match was not found. Choose a Steam game or try its AppID.',
            { candidates }
        );
        setRecord('negative', identity.key, {
            fingerprint: identity.fingerprint,
            code: error.code,
            message: error.message,
            candidates,
            ts: stamp()
        });
        throw error;
    }

    function parseTags(html) {
        if (typeof env.DOMParser !== 'function')
            throw steamError('SCHEMA', 'This browser cannot parse the Steam tag page.');
        const doc = new env.DOMParser().parseFromString(html, 'text/html');
        const tags = [...doc.querySelectorAll('a.app_tag')]
            .map((element) => String(element.textContent || '').trim())
            .filter((tag) => tag && tag !== '+')
            .slice(0, 10);
        if (tags.length) return [...new Set(tags)].slice(0, 5);
        if (
            doc.querySelector('#agegate_box, .agegate_birthday_selector') ||
            /access\s+denied|verify\s+you\s+are\s+human|captcha/i.test(doc.title || '')
        )
            throw steamError('SCHEMA', 'Steam tags are blocked or require a store-page check.');
        if (!doc.querySelector('.apphub_AppName, .game_area_purchase, #game_area_description'))
            throw steamError('SCHEMA', 'Steam returned a page without the expected game information.');
        return [];
    }

    function tagUsable(record) {
        return (
            record &&
            (record.state === 'ready'
                ? record.tags.length > 0 && now() - record.ts < 7 * STEAM_DAY
                : now() - record.ts < (record.state === 'empty' ? 15 * 60000 : 30000))
        );
    }

    async function ensureTags(appId, context, force = false) {
        const id = steamAppId(appId);
        const cached = touch('tags', id);
        if (
            !force &&
            tagUsable(cached) &&
            (cached.state !== 'ready' ||
                now() - cached.ts < STEAM_DAY ||
                (cached.attemptTs && now() - cached.attemptTs < 30000))
        ) {
            measurements.tagCacheHits++;
            return cached;
        }
        try {
            const html = await request(
                `tags:${id}`,
                `https://store.steampowered.com/app/${id}/?l=${STEAM_LANGUAGE}&cc=${STEAM_COUNTRY}`,
                { ...context, priority: steamPriority(context.priority) - 2, text: true }
            );
            const tags = parseTags(html);
            checkGeneration(context.token, context.signal);
            const record = { tags, state: tags.length ? 'ready' : 'empty', ts: stamp() };
            setRecord('tags', id, record);
            emit('tags', id);
            return record;
        } catch (error) {
            if (error?.code === 'ABORTED') throw error;
            checkGeneration(context.token, context.signal);
            const record = cached?.tags?.length
                ? { ...cached, attemptTs: stamp(), error: error.message }
                : { tags: [], state: 'error', error: error.message, ts: stamp() };
            setRecord('tags', id, record);
            emit('tags', id);
            return record;
        }
    }

    function reviewKey(appId) {
        return `${steamAppId(appId)}:${settings.reviewPurchaseType}`;
    }

    function reviewTtl(appId) {
        const app = tables.details.get(String(appId))?.data;
        const date = Date.parse(app?.release_date?.date || '');
        return app?.release_date?.coming_soon || !Number.isFinite(date) || now() - date < 14 * STEAM_DAY
            ? 15 * 60000
            : 3 * 3600000;
    }

    async function ensureReviews(appId, context, force = false) {
        const id = steamAppId(appId);
        const key = reviewKey(id);
        const existing = touch('reviews', key);
        if (
            !force &&
            existing &&
            (now() - existing.ts < (existing.state === 'error' ? 30000 : reviewTtl(id)) ||
                (existing.attemptTs && now() - existing.attemptTs < 30000))
        )
            return existing;
        if (reviewing.has(key)) {
            scheduler.promote(`reviews:${key}`, steamPriority(context.priority) + 15);
            return reviewing.get(key);
        }
        const purchaseType = settings.reviewPurchaseType;
        const input = {
            appid: Number(id),
            filter: 0,
            languages: ['all'],
            review_type: 0,
            purchase_type: purchaseType,
            num_per_page: 1,
            cursor: '*',
            day_range: 0
        };
        const run = (async () => {
            try {
                const body = await request(
                    `reviews:${key}`,
                    `https://api.steampowered.com/IUserReviewsService/GetAppReviews/v1/?input_json=${encodeURIComponent(JSON.stringify(input))}`,
                    { ...context, signal: undefined, priority: steamPriority(context.priority) + 15 }
                );
                const info = parseReviewSummary(body);
                checkGeneration(context.token);
                const record = { info, state: info.total ? 'ready' : 'empty', ts: stamp() };
                setRecord('reviews', key, record);
                emit('reviews', id);
                return record;
            } catch (error) {
                if (error?.code === 'ABORTED' || context.token !== generation || disposed) return null;
                const record = existing?.info
                    ? { ...existing, attemptTs: stamp(), error: error.message }
                    : { info: null, state: 'error', error: error.message, ts: stamp() };
                setRecord('reviews', key, record);
                emit('reviews', id);
                return record;
            } finally {
                if (reviewing.get(key) === run) reviewing.delete(key);
            }
        })();
        reviewing.set(key, run);
        return run;
    }

    function getPreviewData(appId) {
        const id = steamAppId(appId);
        const app = id && touch('details', id)?.data;
        if (!app || app.type !== 'game') return null;
        const tag = touch('tags', id);
        const review = touch('reviews', reviewKey(id));
        return {
            ...app,
            appId: Number(id),
            releaseDate: app.release_date.date || null,
            comingSoon: app.release_date.coming_soon,
            tags: tag?.tags || [],
            tagsSource: 'steam',
            tagState: tag?.state || 'loading',
            tagError: tag?.error || null,
            reviewInfo: review?.info || null,
            reviewState: review?.state || 'loading',
            reviewError: review?.error || null,
            reviewPurchaseType: settings.reviewPurchaseType,
            storeUrl: `https://store.steampowered.com/app/${id}/`,
            match: matches.get(id) || { kind: 'cache' }
        };
    }

    function mappingForSource(source) {
        const identity = sourceIdentity(source);
        const overrideRecord = touch('corrections', identity.key);
        const override = overrideRecord?.deleted ? null : overrideRecord;
        const resetMarker =
            overrideRecord?.deleted && overrideRecord.fingerprint === identity.fingerprint ? overrideRecord : null;
        const record =
            override?.fingerprint === identity.fingerprint
                ? override
                : touch('mappings', identity.key) || touch('mappings', identity.queryKey);
        if (
            !record ||
            (resetMarker && record.ts <= resetMarker.ts) ||
            record.fingerprint !== identity.fingerprint ||
            (record !== override && now() - record.ts >= 30 * STEAM_DAY)
        )
            return null;
        return record;
    }

    function peekPreview(source) {
        if (!initialized || disposed) return null;
        let mapping;
        try {
            mapping = mappingForSource(source);
        } catch {
            return null;
        }
        if (!mapping || !tagUsable(touch('tags', mapping.appId))) return null;
        const data = getPreviewData(mapping.appId);
        if (!data) return null;
        measurements.previewCacheHits++;
        return { ...data, match: mapping.match || data.match };
    }

    async function loadPreview(source, options = {}) {
        await ready;
        const started = now();
        const context = { priority: options.priority || 'hover', signal: options.signal, token: generation };
        checkGeneration(context.token, context.signal);
        measurements.previews++;
        const resolved = await resolveSource(source, context, options.force === true);
        const id = String(resolved.app.steam_appid);
        const cachedTags = touch('tags', id);
        const usableTags = tagUsable(cachedTags) && cachedTags.state === 'ready';
        const tagPromise = ensureTags(id, context, options.force === true);
        // The tag request is enqueued first. Reviews use spare capacity and never delay the tags-ready promise.
        ensureReviews(id, { ...context, signal: undefined }).catch(() => {});
        if (usableTags && !options.force) tagPromise.catch(() => {});
        else await tagPromise;
        checkGeneration(context.token, context.signal);
        const data = getPreviewData(id);
        if (!data) throw steamError('NO_MATCH', 'The verified game details are no longer available.');
        measurements.tagReadyMs.push(Math.max(0, now() - started));
        measurements.tagReadyMs = measurements.tagReadyMs.slice(-100);
        const cachedDetails = touch('details', id);
        if (cachedDetails && now() - cachedDetails.ts >= STEAM_DAY && !refreshingDetails.has(id)) {
            const refresh = details(
                id,
                { ...context, signal: undefined, priority: steamPriority(context.priority) + 20 },
                true
            )
                .catch(() => {})
                .finally(() => refreshingDetails.delete(id));
            refreshingDetails.set(id, refresh);
        }
        return { ...data, match: resolved.match };
    }

    async function correctMatch(source, value) {
        await ready;
        const id = steamParseAppInput(value);
        if (!id) throw steamError('NO_MATCH', 'Enter a numeric Steam AppID or a store.steampowered.com/app/ URL.');
        const context = { priority: 'hover', token: generation };
        const identity = sourceIdentity(source);
        const resolved = await baseGame(id, context);
        resolved.match = {
            ...resolved.match,
            kind: resolved.match.parentChain.length ? 'dlc-parent' : 'correction',
            reason: 'Saved match correction'
        };
        setRecord('corrections', identity.key, {
            appId: String(resolved.app.steam_appid),
            fingerprint: identity.fingerprint,
            title: identity.title.slice(0, 400),
            match: resolved.match,
            ts: stamp()
        });
        mapIdentity(identity, resolved, false);
        return loadPreview(source, { priority: 'hover' });
    }

    async function forgetMatch(source) {
        await ready;
        const identity = sourceIdentity(source);
        setRecord('corrections', identity.key, {
            deleted: true,
            fingerprint: identity.fingerprint,
            title: identity.title,
            ts: Math.max(stamp(), (touch('mappings', identity.key)?.ts || 0) + 1)
        });
        tables.mappings.delete(identity.key);
        tables.mappings.delete(identity.queryKey);
        tables.negative.delete(identity.key);
        saveSoon();
    }

    function exportCorrections() {
        return {
            schema: 1,
            exportedAt: new Date(now()).toISOString(),
            corrections: [...tables.corrections]
                .filter(([, item]) => !item.deleted)
                .map(([key, item]) => ({
                    key,
                    appId: Number(item.appId),
                    fingerprint: item.fingerprint,
                    title: item.title || ''
                }))
        };
    }

    async function importCorrections(input) {
        await ready;
        const data = steamDecodeStored(input);
        if (
            !data ||
            data.schema !== 1 ||
            !Array.isArray(data.corrections) ||
            data.corrections.length > limits.corrections
        )
            throw steamError('SCHEMA', 'The match-corrections file is invalid.');
        const entries = data.corrections.map((item) => {
            if (
                !item ||
                typeof item.key !== 'string' ||
                !item.key ||
                item.key.length > 700 ||
                !steamAppId(item.appId) ||
                typeof item.fingerprint !== 'string' ||
                !item.fingerprint ||
                item.fingerprint.length > 600 ||
                normalizeForMatch(item.title || '').slice(0, 600) !== item.fingerprint
            )
                throw steamError('SCHEMA', 'The match-corrections file contains an invalid entry.');
            return [
                item.key,
                {
                    appId: steamAppId(item.appId),
                    fingerprint: item.fingerprint,
                    title: String(item.title).slice(0, 400),
                    ts: stamp()
                }
            ];
        });
        for (const [key, item] of entries) setRecord('corrections', key, item);
        tables.negative.clear();
        await saveNow();
        return entries.length;
    }

    async function clear() {
        await ready;
        generation++;
        epoch = Math.max(now(), epoch + 1);
        scheduler.cancelAll();
        for (const [name, table] of Object.entries(tables)) if (name !== 'corrections') table.clear();
        // Preserve user-authored overrides across a data-cache clear, advancing their merge timestamp.
        for (const item of tables.corrections.values()) item.ts = stamp();
        searchCache.clear();
        matches.clear();
        reviewing.clear();
        refreshingDetails.clear();
        await saveNow();
        emit('clear');
    }

    function updateSettings(partial) {
        const oldPurchaseType = settings.reviewPurchaseType;
        settings = steamSettings({ ...settings, ...partial });
        try {
            Promise.resolve(env.setValue?.(settingsKey, JSON.stringify(settings))).catch(() => {});
        } catch {
            /* Remains usable in memory. */
        }
        emit('settings');
        if (oldPurchaseType !== settings.reviewPurchaseType)
            for (const id of tables.details.keys()) emit('reviews', id);
        return { ...settings };
    }

    function getDebugReport() {
        return {
            coreVersion: CORE_VERSION,
            textMatcher: 'Fuse.js 7.5.0 basic, local conservative fallback',
            schema: STEAM_SCHEMA,
            resolver: STEAM_RESOLVER,
            provider: STEAM_PROVIDER,
            capturedAt: new Date(now()).toISOString(),
            settings: { ...settings },
            cache: Object.fromEntries(Object.entries(tables).map(([name, table]) => [name, table.size])),
            scheduler: scheduler.stats(),
            measurements: {
                ...measurements,
                tagReadyMs: [...measurements.tagReadyMs],
                errors: [...measurements.errors]
            },
            // Identifiers and match reasons suffice; source URLs, session parameters and magnet URIs are excluded.
            matches: [...matches].slice(-30).map(([appId, match]) => ({
                appId: Number(appId),
                kind: match.kind,
                reason: match.reason || '',
                score: match.score ?? null,
                parentChain: match.parentChain || [],
                candidates: match.candidates || []
            })),
            fieldAges: [...tables.details].slice(-30).map(([appId, detail]) => ({
                appId: Number(appId),
                detailsAgeMs: Math.max(0, now() - detail.ts),
                tagsAgeMs: tables.tags.has(appId) ? Math.max(0, now() - tables.tags.get(appId).ts) : null,
                reviewsAgeMs: tables.reviews.has(reviewKey(appId))
                    ? Math.max(0, now() - tables.reviews.get(reviewKey(appId)).ts)
                    : null
            }))
        };
    }

    return {
        ready,
        loadPreview,
        searchGames,
        peekPreview,
        getPreviewData,
        correctMatch,
        forgetMatch,
        exportCorrections,
        importCorrections,
        clear,
        retryTags: async (appId) => {
            await ready;
            const id = steamAppId(appId);
            if (!id || !tables.details.has(id)) throw steamError('NO_MATCH', 'Load a game before retrying its tags.');
            await ensureTags(id, { priority: 'hover', token: generation }, true);
            return getPreviewData(id);
        },
        retryReviews: async (appId) => {
            await ready;
            const id = steamAppId(appId);
            if (!id || !tables.details.has(id))
                throw steamError('NO_MATCH', 'Load a game before retrying its reviews.');
            await ensureReviews(id, { priority: 'hover', token: generation }, true);
            return getPreviewData(id);
        },
        subscribe(fn) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
        getSettings: () => ({ ...settings }),
        updateSettings,
        getDebugReport,
        onVisibilityChange: () => scheduler.onVisibilityChange(),
        flush: saveNow,
        dispose() {
            if (disposed) return;
            saveNow();
            disposed = true;
            generation++;
            scheduler.dispose();
            if (typeof removeStorageListener === 'function') removeStorageListener();
            listeners.clear();
        }
    };
}
