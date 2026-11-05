import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    createSteamClient,
    createRequestScheduler,
    cleanTorrentTitle,
    cleanForumTitle,
    normalizeForMatch,
    scoreCandidate,
    parseReviewSummary,
    parseSteamSearchResults,
    rankSteamSuggestions
} from '../src/core/steam-client.mjs';

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
const source = (title = 'Example Game', key = 'test:1') => ({
    title,
    rawTitle: title,
    key,
    url: 'https://example.test/listing/1?sid=private'
});
const app = (id, name = 'Example Game', type = 'game', fullgame) => ({
    steam_appid: Number(id),
    type,
    name,
    short_description: 'A useful game.',
    header_image: 'https://cdn.example.test/header.jpg',
    release_date: { coming_soon: false, date: 'Nov 1, 2026' },
    screenshots: [],
    movies: [],
    ...(fullgame ? { fullgame } : {})
});
const review = (positive = 44, negative = 0) => ({
    response: {
        query_summary: {
            total_reviews: positive + negative,
            total_positive: positive,
            total_negative: negative,
            review_score_desc: positive + negative ? 'Positive' : 'No Reviews'
        }
    }
});
const tagHtml =
    '<html><title>Example Game on Steam</title><div class="apphub_AppName">Example Game</div><a class="app_tag">Exploration</a><a class="app_tag">Story Rich</a></html>';

// A minimal fixture DOM interface; production uses the browser's real DOMParser.
class FixtureDOMParser {
    parseFromString(html) {
        return {
            title: html.match(/<title>(.*?)<\/title>/)?.[1] || '',
            querySelectorAll(selector) {
                assert.equal(selector, 'a.app_tag');
                return [...html.matchAll(/class="app_tag">([^<]+)</g)].map((match) => ({ textContent: match[1] }));
            },
            querySelector(selector) {
                if (selector.includes('agegate')) return html.includes('id="agegate_box"') ? {} : null;
                return html.includes('apphub_AppName') || html.includes('game_area_purchase') ? {} : null;
            }
        };
    }
}

function fixtureClient(handler, options = {}) {
    const calls = [];
    const pending = [];
    const store = options.store || new Map();
    let aborted = 0;
    const client = createSteamClient({
        DOMParser: FixtureDOMParser,
        minInterval: 0,
        maxRetries: 0,
        persistDelay: 0,
        now: options.now,
        concurrency: options.concurrency,
        isHidden: options.isHidden,
        storageKey: 'test-cache',
        getValue: (key, fallback) => (store.has(key) ? store.get(key) : fallback),
        setValue: (key, value) => store.set(key, value),
        gmRequest(request) {
            calls.push(request);
            const result = handler(new URL(request.url), request, calls.length) || {};
            let timer;
            let done = false;
            const deliver = () => {
                if (done && !result.deliverAfterAbort) return;
                done = true;
                if (result.error) return request.onerror({});
                if (result.timeout) return request.ontimeout();
                const body = result.body ?? {};
                request.onload({
                    status: result.status ?? 200,
                    response: body,
                    responseText: typeof body === 'string' ? body : JSON.stringify(body),
                    responseHeaders: result.headers || '',
                    finalUrl: result.finalUrl || request.url
                });
            };
            if (result.hold) pending.push({ request, deliver, result });
            else timer = setTimeout(deliver, result.delay ?? 0);
            return {
                abort() {
                    aborted++;
                    done = true;
                    clearTimeout(timer);
                    request.onabort();
                }
            };
        },
        ...options.env
    });
    return {
        client,
        calls,
        pending,
        store,
        get aborted() {
            return aborted;
        }
    };
}

function normalHandler(url) {
    if (url.pathname === '/search/results/') return { body: { success: 1, total_count: 0, results_html: '' } };
    if (url.pathname.includes('storesearch'))
        return { body: { items: [{ id: 10, name: 'Example Game', type: 'app' }] } };
    if (url.pathname.includes('appdetails')) {
        const id = url.searchParams.get('appids');
        return { body: { [id]: { success: true, data: app(id) } } };
    }
    if (url.pathname.includes('GetAppReviews')) return { body: review() };
    if (url.pathname.includes('/app/')) return { body: tagHtml };
    throw new Error(`Unexpected test request: ${url}`);
}

async function waitFor(predicate) {
    for (let i = 0; i < 100; i++) {
        if (predicate()) return;
        await tick(2);
    }
    assert.fail('Expected condition did not settle.');
}

test('title cleanup protects real names, subtitles, season identity and Unicode', () => {
    assert.equal(
        cleanTorrentTitle('Ghost of Tsushima DIRECTORS CUT [FitGirl Repack]'),
        'Ghost of Tsushima DIRECTORS CUT'
    );
    assert.equal(cleanTorrentTitle('Lost in Random v1.0-TENOKE'), 'Lost in Random');
    assert.equal(cleanTorrentTitle('Demonologist v1.0'), 'Demonologist');
    assert.equal(cleanTorrentTitle('Command & Conquer - Red Alert 3 [Repack]'), 'Command & Conquer - Red Alert 3');
    assert.equal(cleanTorrentTitle('The Walking Dead S1 Complete'), 'The Walking Dead S1 Complete');
    assert.equal(cleanForumTitle('[Info] The Beginner’s Guide'), 'The Beginner’s Guide');
    assert.equal(cleanForumTitle('[Info] [NOT CRACKED / HYPERVISOR] Ecstatica'), 'Ecstatica');
    assert.equal(cleanForumTitle('[Pre-Release] Example Game'), 'Example Game');
    assert.equal(cleanForumTitle('[PROTOTYPE]'), '[PROTOTYPE]');
    assert.equal(normalizeForMatch('Pokémon 大侠立志传'), 'pokemon 大侠立志传');
    assert.equal(cleanTorrentTitle('S.T.A.L.K.E.R. 2: Heart of Chornobyl v1.2-RUNE'), 'STALKER 2: Heart of Chornobyl');
    assert.equal(
        scoreCandidate('S T A L K E R 2 Heart of Chornobyl', { name: 'S.T.A.L.K.E.R. 2: Heart of Chornobyl' }),
        100
    );
});

test('candidate scoring uses both directions and rejects sequel/remake/VR mismatches', () => {
    assert.equal(scoreCandidate('Example Game', { name: 'Example Game' }), 100);
    assert.equal(scoreCandidate('Example Game', { name: 'Completely Different', type: 'game' }), 0);
    assert.ok(scoreCandidate('Example Game', { name: 'Example Game Extra Stuff' }) < 85);
    assert.equal(scoreCandidate('Example Game 2', { name: 'Example Game' }), -Infinity);
    assert.equal(scoreCandidate('Example Game', { name: 'Example Game 2' }), -Infinity);
    assert.equal(scoreCandidate('Example Game Remastered', { name: 'Example Game' }), -Infinity);
    assert.equal(scoreCandidate('Example Game VR', { name: 'Example Game' }), -Infinity);
    assert.equal(
        scoreCandidate('Final Fantasy VII Remake Intergrade', { name: 'FINAL FANTASY 7 REMAKE INTERGRADE' }),
        100
    );
});

const discoSkyrim = JSON.parse(readFileSync(new URL('./fixtures/steam/disco-skyrim.json', import.meta.url), 'utf8'));

test('verified Disco rename is restricted to the returned AppID and the two official names', () => {
    const current = { appId: 632470, name: 'Disco Elysium - The Final Cut' };
    assert.equal(scoreCandidate('Disco Elysium', current), 100);
    assert.equal(
        scoreCandidate('Disco Elysium - The Final Cut', { steam_appid: 632470, name: 'Disco Elysium', type: 'game' }),
        100
    );
    assert.ok(scoreCandidate('Disco Elysium', { ...current, appId: 1233220 }) < 85);
    assert.ok(scoreCandidate('Disco Elysium', { ...current, type: 'dlc' }) < 85);
    assert.ok(scoreCandidate('Disco Elysium', { ...current, name: 'Disco Elysium - The Final Cut Soundtrack' }) < 85);
    assert.ok(scoreCandidate('Disco Elysium 2', current) < 85);
    assert.ok(scoreCandidate('Disco Elysium', 'Disco Elysium - The Final Cut') < 85);
    assert.ok(scoreCandidate('Another Game', { appId: 10, name: 'Another Game - The Final Cut' }) < 85);
});

test('Skyrim punctuation is harmless while Special Edition, original and VR remain separate identities', () => {
    const special = { appId: 489830, name: 'The Elder Scrolls V: Skyrim Special Edition' };
    const original = { appId: 72850, name: 'The Elder Scrolls V: Skyrim' };
    const vr = { appId: 611670, name: 'The Elder Scrolls V: Skyrim VR' };
    assert.equal(scoreCandidate('The Elder Scrolls V Skyrim Special Edition', special), 100);
    assert.equal(scoreCandidate('The Elder Scrolls V: Skyrim Special Edition', special), 100);
    assert.equal(scoreCandidate('The Elder Scrolls V Skyrim', special), -Infinity);
    assert.equal(scoreCandidate(special.name, original), -Infinity);
    assert.equal(scoreCandidate(special.name, vr), -Infinity);
    assert.equal(scoreCandidate('The Elder Scrolls V Skyrim Anniversary Edition', special), -Infinity);
});

for (const [title, appId] of [
    ['Disco Elysium', 632470],
    ['The Elder Scrolls V Skyrim Special Edition', 489830]
]) {
    test('recorded Steam candidates resolve directly without DLC detours: ' + title, async (t) => {
        const f = fixtureClient((url) => {
            if (url.pathname.includes('storesearch'))
                return {
                    body: {
                        items:
                            discoSkyrim.searches.find((item) => item.query === url.searchParams.get('term'))?.items ||
                            []
                    }
                };
            if (url.pathname.includes('appdetails')) {
                const id = Number(url.searchParams.get('appids'));
                const data = discoSkyrim.apps.find((item) => item.steam_appid === id);
                return { body: { [id]: { success: Boolean(data), data: data && { ...app(id, data.name), ...data } } } };
            }
            return normalHandler(url);
        });
        t.after(() => f.client.dispose());
        const data = await f.client.loadPreview(source(title));
        assert.equal(data.appId, appId);
        assert.deepEqual(data.match.parentChain, []);
        assert.equal(data.match.kind, appId === 632470 ? 'alias' : 'search');
        assert.deepEqual(data.tags, ['Exploration', 'Story Rich']);
        const detailIds = f.calls
            .filter((call) => call.url.includes('appdetails'))
            .map((call) => Number(new URL(call.url).searchParams.get('appids')));
        assert.equal(detailIds[0], appId, 'The exact base game must be validated first');
        assert.equal(detailIds.includes(1746860), false, 'Special Edition must not depend on the Anniversary Upgrade');
        if (appId === 632470) assert.equal(detailIds.length, 1);
        assert.equal(f.calls.filter((call) => call.url.includes('storesearch')).length, 1);
        assert.ok(f.calls.every((call) => !call.url.includes('/search/results/')));
    });
}

test('a stale or dishonest search name cannot bypass appdetails validation with a known alias ID', async (t) => {
    const f = fixtureClient((url) => {
        if (url.pathname.includes('storesearch'))
            return { body: { items: [{ id: 632470, name: 'Disco Elysium - The Final Cut', type: 'app' }] } };
        if (url.pathname.includes('appdetails'))
            return { body: { 632470: { success: true, data: app(632470, 'Unrelated Game') } } };
        return normalHandler(url);
    });
    t.after(() => f.client.dispose());
    await assert.rejects(f.client.loadPreview(source('Disco Elysium')), { code: 'NO_MATCH' });
    assert.equal(
        f.calls.some((call) => call.url.includes('/app/632470/')),
        false
    );
});

test('new review envelope distinguishes zero, a small valid count and malformed data', () => {
    assert.deepEqual(parseReviewSummary(review(4, 1)), {
        desc: 'Positive',
        percent: 80,
        total: 5,
        positive: 4,
        negative: 1
    });
    assert.equal(parseReviewSummary(review(0, 0)).total, 0);
    assert.equal(parseReviewSummary(review(0, 0)).percent, null);
    assert.throws(() => parseReviewSummary({ success: 1, query_summary: review().response.query_summary }), {
        code: 'SCHEMA'
    });
    assert.throws(
        () =>
            parseReviewSummary({
                response: { query_summary: { total_reviews: 5, total_positive: 9, total_negative: 0 } }
            }),
        { code: 'SCHEMA' }
    );
});

test('a cold preview waits for real tags and does not wait for reviews or images', async (t) => {
    const f = fixtureClient((url) =>
        url.pathname.includes('GetAppReviews') ? { hold: true, body: review() } : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    const data = await f.client.loadPreview(source());
    assert.deepEqual(data.tags, ['Exploration', 'Story Rich']);
    assert.equal(data.tagsSource, 'steam');
    assert.equal(data.reviewState, 'loading');
    const urls = f.calls.map((request) => request.url);
    assert.equal(urls.filter((url) => url.includes('appdetails')).length, 1);
    assert.ok(urls.every((url) => !url.includes('appids=10,')));
    assert.ok(
        urls.findIndex((url) => url.includes('/app/10/')) < urls.findIndex((url) => url.includes('GetAppReviews'))
    );
    const newReviewRequest = f.calls.find((request) => request.url.includes('GetAppReviews'));
    assert.equal(newReviewRequest.headers.Cookie, undefined);
    const input = JSON.parse(new URL(newReviewRequest.url).searchParams.get('input_json'));
    assert.equal(input.review_type, 0);
    assert.equal(input.purchase_type, 1);
    assert.equal(input.num_per_page, 1);
    f.pending[0].deliver();
    await waitFor(() => f.client.getPreviewData(10).reviewState === 'ready');
    assert.equal(f.client.getPreviewData(10).reviewInfo.total, 44);
});

test('different source aliases share per-AppID details, tags and reviews', async (t) => {
    const f = fixtureClient(normalHandler);
    t.after(() => f.client.dispose());
    const [a, b] = await Promise.all([
        f.client.loadPreview(source('Example Game', 'test:1')),
        f.client.loadPreview(source('Example Game Deluxe Edition', 'test:2'))
    ]);
    assert.equal(a.appId, b.appId);
    await waitFor(() => f.client.getPreviewData(10).reviewState === 'ready');
    assert.equal(f.calls.filter((request) => request.url.includes('storesearch')).length, 1);
    assert.equal(f.calls.filter((request) => request.url.includes('appdetails')).length, 1);
    assert.equal(f.calls.filter((request) => request.url.includes('/app/10/')).length, 1);
    assert.equal(f.calls.filter((request) => request.url.includes('GetAppReviews')).length, 1);
});

test('DLC resolution follows verified parent and all preview fields use that base AppID', async (t) => {
    const f = fixtureClient((url) => {
        if (url.pathname.includes('storesearch'))
            return { body: { items: [{ id: 20, name: 'Example Game Expansion', type: 'app' }] } };
        if (url.pathname.includes('appdetails')) {
            const id = url.searchParams.get('appids');
            return {
                body: {
                    [id]: {
                        success: true,
                        data:
                            id === '20'
                                ? app(20, 'Example Game Expansion', 'dlc', { appid: '10', name: 'Example Game' })
                                : app(10)
                    }
                }
            };
        }
        return normalHandler(url);
    });
    t.after(() => f.client.dispose());
    const data = await f.client.loadPreview(source('Example Game Expansion'));
    assert.equal(data.appId, 10);
    assert.equal(data.name, 'Example Game');
    assert.equal(data.match.kind, 'dlc-parent');
    assert.equal(data.match.originalAppId, 20);
    assert.equal(data.match.parentChain[0].parentAppId, 10);
    assert.equal(data.storeUrl, 'https://store.steampowered.com/app/10/');
    assert.ok(f.calls.some((request) => request.url.includes('/app/10/')));
    assert.ok(!f.calls.some((request) => request.url.includes('/app/20/')));
    const reviewRequest = f.calls.find((request) => request.url.includes('GetAppReviews'));
    assert.equal(JSON.parse(new URL(reviewRequest.url).searchParams.get('input_json')).appid, 10);
});

for (const parentCase of ['missing', 'cycle', 'non-game']) {
    test(`DLC ${parentCase} parent does not silently switch to an unrelated game`, async (t) => {
        const f = fixtureClient((url) => {
            if (url.pathname.includes('storesearch'))
                return {
                    body: {
                        items: [
                            { id: 20, name: 'Example Game Expansion', type: 'app' },
                            { id: 30, name: 'Unrelated Game', type: 'app' }
                        ]
                    }
                };
            if (url.pathname.includes('appdetails')) {
                const id = url.searchParams.get('appids');
                const data =
                    id === '20'
                        ? app(
                              20,
                              'Example Game Expansion',
                              'dlc',
                              parentCase === 'missing' ? undefined : { appid: '21' }
                          )
                        : parentCase === 'cycle'
                          ? app(21, 'Parent DLC', 'dlc', { appid: '20' })
                          : app(21, 'Music', 'music');
                return { body: { [id]: { success: true, data } } };
            }
            return normalHandler(url);
        });
        t.after(() => f.client.dispose());
        await assert.rejects(f.client.loadPreview(source('Example Game Expansion')), { code: 'NO_MATCH' });
        assert.ok(!f.calls.some((request) => request.url.includes('appids=30')));
        assert.ok(!f.calls.some((request) => request.url.includes('/app/')));
    });
}

test('two same-name base games require explicit selection', async (t) => {
    const f = fixtureClient((url) =>
        url.pathname.includes('storesearch')
            ? {
                  body: {
                      items: [
                          { id: 10, name: 'Example Game', type: 'app' },
                          { id: 11, name: 'Example Game', type: 'app' }
                      ]
                  }
              }
            : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    await assert.rejects(
        f.client.loadPreview(source()),
        (error) => error.code === 'AMBIGUOUS_MATCH' && error.candidates.length === 2
    );
    assert.ok(!f.calls.some((request) => request.url.includes('/app/')));
});

test('a query fallback never removes sequel identity', async (t) => {
    const f = fixtureClient((url) =>
        url.pathname.includes('storesearch')
            ? { body: { items: [{ id: 10, name: 'Example Game', type: 'app' }] } }
            : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    await assert.rejects(f.client.loadPreview(source('Example Game 2 Deluxe Edition')), { code: 'NO_MATCH' });
    assert.ok(
        f.calls
            .filter((request) => request.url.includes('storesearch'))
            .every((request) => new URL(request.url).searchParams.get('term').includes('2'))
    );
    assert.ok(!f.calls.some((request) => request.url.includes('appdetails')));
});

test('tag HTML failures settle as unavailable without genre substitution', async (t) => {
    const f = fixtureClient((url) =>
        url.pathname.includes('/app/') ? { body: '<html><title>Access denied</title></html>' } : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    const data = await f.client.loadPreview(source());
    assert.equal(data.tagState, 'error');
    assert.deepEqual(data.tags, []);
    assert.equal(data.tagsSource, 'steam');
    assert.match(data.tagError, /blocked|store-page/);
});

test('HTTP 200 HTML reviews remain an error, never zero reviews', async (t) => {
    const f = fixtureClient((url) =>
        url.pathname.includes('GetAppReviews') ? { body: '<html>Steam homepage</html>' } : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    await f.client.loadPreview(source());
    await waitFor(() => f.client.getPreviewData(10).reviewState === 'error');
    assert.equal(f.client.getPreviewData(10).reviewInfo, null);
});

test('a tag redirect to a different Steam app is rejected', async (t) => {
    const f = fixtureClient((url) =>
        url.pathname.includes('/app/')
            ? { body: tagHtml, finalUrl: 'https://store.steampowered.com/app/999/' }
            : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    const data = await f.client.loadPreview(source());
    assert.equal(data.tagState, 'error');
    assert.deepEqual(data.tags, []);
});

test('actual zero reviews are a successful empty state', async (t) => {
    const f = fixtureClient((url) =>
        url.pathname.includes('GetAppReviews') ? { body: review(0, 0) } : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    await f.client.loadPreview(source());
    await waitFor(() => f.client.getPreviewData(10).reviewState === 'empty');
    assert.equal(f.client.getPreviewData(10).reviewInfo.total, 0);
});

test('persistent field cache restores tags immediately with no requests', async (t) => {
    const f = fixtureClient(normalHandler);
    await f.client.loadPreview(source());
    await waitFor(() => f.client.getPreviewData(10).reviewState === 'ready');
    await f.client.flush();
    f.client.dispose();
    const second = fixtureClient(() => assert.fail('Fresh cache must not request the network'), { store: f.store });
    t.after(() => second.client.dispose());
    await second.client.ready;
    assert.deepEqual(second.client.peekPreview(source()).tags, ['Exploration', 'Story Rich']);
    const result = await second.client.loadPreview(source());
    assert.equal(result.reviewInfo.total, 44);
    assert.equal(second.calls.length, 0);
});

test('release-week reviews refresh independently without refreshing details/tags', async (t) => {
    let clock = Date.parse('2026-11-04T00:00:00Z');
    const f = fixtureClient(normalHandler, { now: () => clock });
    t.after(() => f.client.dispose());
    await f.client.loadPreview(source());
    await waitFor(() => f.client.getPreviewData(10).reviewState === 'ready');
    const before = f.calls.length;
    clock += 16 * 60000;
    await f.client.loadPreview(source());
    await waitFor(() => f.calls.length === before + 1);
    assert.ok(f.calls.at(-1).url.includes('GetAppReviews'));
    assert.equal(f.client.getDebugReport().fieldAges[0].detailsAgeMs, 16 * 60000);
    assert.equal(f.client.getDebugReport().fieldAges[0].tagsAgeMs, 16 * 60000);
});

test('clearing while tags are in flight aborts and prevents cache resurrection', async (t) => {
    const f = fixtureClient((url) =>
        url.pathname.includes('/app/') ? { hold: true, deliverAfterAbort: true, body: tagHtml } : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    const loading = f.client.loadPreview(source());
    const rejected = assert.rejects(loading, { code: 'ABORTED' });
    await waitFor(() => f.pending.length > 0);
    await f.client.clear();
    f.pending[0].deliver();
    await rejected;
    await tick();
    assert.equal(f.client.peekPreview(source()), null);
    const stored = JSON.parse(f.store.get('test-cache'));
    assert.deepEqual(stored.details, {});
    assert.deepEqual(stored.tags, {});
    assert.ok(f.aborted >= 1);
});

test('saved correction resolves a DLC parent and survives cache clear/export/import', async (t) => {
    const f = fixtureClient((url) => {
        if (url.pathname.includes('storesearch')) return { body: { items: [] } };
        if (url.pathname.includes('appdetails') && url.searchParams.get('appids') === '20')
            return { body: { 20: { success: true, data: app(20, 'Example Expansion', 'dlc', { appid: '10' }) } } };
        return normalHandler(url);
    });
    t.after(() => f.client.dispose());
    const item = source('A difficult title');
    await assert.rejects(f.client.loadPreview(item), { code: 'NO_MATCH' });
    const corrected = await f.client.correctMatch(item, 'https://store.steampowered.com/app/20/Example_Expansion/');
    assert.equal(corrected.appId, 10);
    const exported = f.client.exportCorrections();
    assert.equal(exported.corrections[0].appId, 10);
    await f.client.clear();
    assert.equal(f.client.exportCorrections().corrections.length, 1);
    await f.client.forgetMatch(item);
    assert.equal(f.client.exportCorrections().corrections.length, 0);
    assert.equal(await f.client.importCorrections(exported), 1);
    assert.equal((await f.client.loadPreview(item)).appId, 10);
    await assert.rejects(
        f.client.importCorrections({
            schema: 1,
            corrections: [{ key: 'x', appId: 'javascript:alert(1)', fingerprint: 'x', title: 'x' }]
        }),
        { code: 'SCHEMA' }
    );
});

test('debug export excludes source URLs and session parameters', async (t) => {
    const f = fixtureClient(normalHandler);
    t.after(() => f.client.dispose());
    await f.client.loadPreview(source());
    const text = JSON.stringify(f.client.getDebugReport());
    assert.ok(!text.includes('sid=private'));
    assert.ok(!text.includes('magnet:'));
    assert.ok(!text.includes('Cookie'));
});

test('cross-tab merges update fields independently and preserve corrections through a remote clear', async (t) => {
    let clock = Date.parse('2026-11-04T00:00:00Z');
    let storageListener;
    const f = fixtureClient(normalHandler, {
        now: () => clock,
        env: {
            addValueChangeListener(_key, listener) {
                storageListener = listener;
            }
        }
    });
    t.after(() => f.client.dispose());
    await f.client.correctMatch(source(), 10);
    await waitFor(() => f.client.getPreviewData(10).reviewState === 'ready');
    await f.client.flush();
    const original = JSON.parse(f.store.get('test-cache'));
    clock += 1000;
    const changed = structuredClone(original);
    changed.tags['10'] = { state: 'ready', tags: ['Horror'], ts: clock };
    storageListener('test-cache', null, JSON.stringify(changed), true);
    assert.deepEqual(f.client.peekPreview(source()).tags, ['Horror']);
    assert.equal(f.client.getDebugReport().fieldAges[0].detailsAgeMs, 1000);
    clock += 1000;
    storageListener(
        'test-cache',
        null,
        JSON.stringify({ schema: 3, provider: 2, resolver: 2, epoch: clock, savedAt: clock, corrections: {} }),
        true
    );
    assert.equal(f.client.peekPreview(source()), null);
    assert.equal(f.client.exportCorrections().corrections.length, 1);
});

test('a manual correction remains scoped to its source rather than becoming a global query override', async (t) => {
    const f = fixtureClient(normalHandler);
    t.after(() => f.client.dispose());
    await f.client.correctMatch(source('A custom title', 'test:first'), 10);
    await f.client.flush();
    const value = JSON.parse(f.store.get('test-cache'));
    assert.equal(value.mappings['test:first'].appId, '10');
    assert.equal(value.mappings['query:a custom title'], undefined);
});

test('scheduler promotes a shared queued hover over background work', async (t) => {
    const scheduler = createRequestScheduler({ concurrency: 1, minInterval: 0 });
    t.after(() => scheduler.dispose());
    const order = [];
    let release;
    const first = scheduler.run(
        'first',
        () =>
            new Promise((resolve) => {
                order.push('first');
                release = resolve;
            })
    );
    await waitFor(() => Boolean(release));
    const background = scheduler.run('background', async () => {
        order.push('background');
        return 'b';
    });
    const next = scheduler.run('next', async () => {
        order.push('next');
        return 'n';
    });
    const promoted = scheduler.run('next', async () => assert.fail('A duplicate job must not start'), {
        priority: 'hover'
    });
    release('first');
    assert.deepEqual(await Promise.all([first, background, next, promoted]), ['first', 'b', 'n', 'n']);
    assert.deepEqual(order, ['first', 'next', 'background']);
    assert.equal(scheduler.stats().shared, 1);
});

test('one cancelled consumer leaves its shared request available to another', async (t) => {
    const scheduler = createRequestScheduler({ minInterval: 0 });
    t.after(() => scheduler.dispose());
    const abort = new AbortController();
    let release;
    let underlyingAborts = 0;
    const task = ({ setAbort }) =>
        new Promise((resolve) => {
            release = resolve;
            setAbort(() => underlyingAborts++);
        });
    const first = scheduler.run('shared', task, { signal: abort.signal });
    const second = scheduler.run('shared', task);
    const rejected = assert.rejects(first, { code: 'ABORTED' });
    await waitFor(() => Boolean(release));
    abort.abort();
    await rejected;
    assert.equal(underlyingAborts, 0);
    release('ok');
    assert.equal(await second, 'ok');
});

test('hidden tabs use a single worker and visibility can resume a wider pool', async (t) => {
    let hidden = true;
    const scheduler = createRequestScheduler({
        concurrency: 3,
        hiddenConcurrency: 1,
        minInterval: 0,
        isHidden: () => hidden
    });
    t.after(() => scheduler.dispose());
    const releases = [];
    const tasks = [1, 2, 3].map((id) =>
        scheduler.run(String(id), () => new Promise((resolve) => releases.push(resolve)))
    );
    await waitFor(() => releases.length === 1);
    await tick(10);
    assert.equal(releases.length, 1);
    hidden = false;
    scheduler.onVisibilityChange();
    await waitFor(() => releases.length === 3);
    releases.forEach((resolve) => resolve());
    await Promise.all(tasks);
    assert.equal(scheduler.stats().peakActive, 3);
});

test('HTTP 429 retries after cooldown while a different host can proceed', async (t) => {
    const scheduler = createRequestScheduler({ concurrency: 1, minInterval: 0, maxRetries: 1, random: () => 0 });
    t.after(() => scheduler.dispose());
    let attempts = 0;
    const order = [];
    const limited = scheduler.run(
        'limited',
        async () => {
            attempts++;
            order.push(`limited:${attempts}`);
            if (attempts === 1)
                throw Object.assign(new Error('Rate limit'), { status: 429, retryAfter: 10, retryable: true });
            return 'ok';
        },
        { host: 'store.steampowered.com', priority: 'hover' }
    );
    const other = scheduler.run(
        'other',
        async () => {
            order.push('other');
            return 'other';
        },
        { host: 'api.steampowered.com' }
    );
    assert.equal(await other, 'other');
    assert.equal(await limited, 'ok');
    assert.deepEqual(order, ['limited:1', 'other', 'limited:2']);
    assert.equal(scheduler.stats().retried, 1);
});

test('a long rate-limit cooldown settles promptly instead of leaving a cold tag spinner waiting', async (t) => {
    const scheduler = createRequestScheduler({ concurrency: 1, minInterval: 0, maxRetries: 1 });
    t.after(() => scheduler.dispose());
    let attempts = 0;
    const result = scheduler.run(
        'limited',
        async () => {
            attempts++;
            throw Object.assign(new Error('Rate limit'), { status: 429, retryAfter: 60000, retryable: true });
        },
        { host: 'store.steampowered.com', priority: 'hover' }
    );
    await assert.rejects(result, (error) => error.status === 429 && error.retryAfter === 60000);
    await assert.rejects(
        scheduler.run('another', async () => assert.fail('Cooling-down host must not be requested'), {
            host: 'store.steampowered.com',
            priority: 'hover'
        }),
        (error) => error.status === 429 && error.retryAfter > 50000
    );
    assert.equal(attempts, 1);
});

test('explicit lookup retry bypasses the negative cache without weakening matching', async (t) => {
    let available = false;
    const f = fixtureClient((url) =>
        url.pathname.includes('storesearch') && !available ? { body: { items: [] } } : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    await assert.rejects(f.client.loadPreview(source()), { code: 'NO_MATCH' });
    available = true;
    // The search provider has its own cache; retry should perform a fresh candidate retrieval.
    const result = await f.client.loadPreview(source(), { priority: 'hover', force: true });
    assert.equal(result.appId, 10);
    assert.deepEqual(result.tags, ['Exploration', 'Story Rich']);
});

test('reset corrections cannot be resurrected by an older tab snapshot', async (t) => {
    let storageListener;
    const f = fixtureClient(normalHandler, {
        env: {
            addValueChangeListener(_key, listener) {
                storageListener = listener;
            }
        }
    });
    t.after(() => f.client.dispose());
    const item = source('A custom title', 'test:reset');
    await f.client.correctMatch(item, 10);
    await f.client.flush();
    const oldSnapshot = f.store.get('test-cache');
    await f.client.forgetMatch(item);
    storageListener('test-cache', null, oldSnapshot, true);
    assert.equal(f.client.exportCorrections().corrections.length, 0);
    assert.equal(f.client.peekPreview(item), null);
    await assert.rejects(f.client.loadPreview(item), { code: 'NO_MATCH' });
});

test('resolver upgrade discards old wrong mappings and failures while keeping actual app data and corrections', async (t) => {
    const previous = fixtureClient(normalHandler);
    t.after(() => previous.client.dispose());
    await previous.client.loadPreview(source());
    await previous.client.correctMatch(source('User chosen title', 'saved:2'), 10);
    await waitFor(() => previous.client.getPreviewData(10).reviewState === 'ready');
    await previous.client.flush();
    const stored = JSON.parse(previous.store.get('test-cache'));
    stored.resolver -= 1;
    for (const mapping of Object.values(stored.mappings)) mapping.appId = '20';
    stored.negative['test:1'] = {
        code: 'NO_MATCH',
        ts: stored.savedAt,
        fingerprint: normalizeForMatch(source().title),
        message: 'The previous resolver failed.',
        candidates: []
    };
    const store = new Map([['test-cache', JSON.stringify(stored)]]);
    const current = fixtureClient(normalHandler, { store });
    t.after(() => current.client.dispose());
    await current.client.ready;
    const cache = current.client.getDebugReport().cache;
    assert.equal(cache.mappings, 0);
    assert.equal(cache.negative, 0);
    assert.equal(cache.details, 1);
    assert.equal(cache.tags, 1);
    assert.equal(cache.reviews, 1);
    assert.equal(current.client.exportCorrections().corrections.length, 1);
    const resolved = await current.client.loadPreview(source());
    assert.equal(resolved.appId, 10);
    assert.deepEqual(resolved.tags, ['Exploration', 'Story Rich']);
    assert.ok(current.calls.length > 0);
    assert.ok(
        current.calls.every((request) => request.url.includes('storesearch')),
        'Only matching is retried; fresh details, tags and reviews are reused.'
    );
});

const localized = JSON.parse(readFileSync(new URL('./fixtures/steam/idle-localization.json', import.meta.url), 'utf8'));
const fixtureSearchRow = (href, name, id = null) => ({
    getAttribute(attribute) {
        return attribute === 'href' ? href : attribute === 'data-ds-appid' ? id : null;
    },
    querySelector(selector) {
        assert.equal(selector, '.title');
        return name === null ? null : { textContent: name };
    }
});
class SearchFixtureDOMParser extends FixtureDOMParser {
    parseFromString(html) {
        if (!html.includes('search_result_row')) return super.parseFromString(html);
        return {
            querySelectorAll(selector) {
                assert.equal(selector, 'a.search_result_row');
                return localized.website.rows.map((row) => fixtureSearchRow(row.href, row.name));
            }
        };
    }
}

test('localized title missed by API resolves through compact Steam website search without translating or weakening identity', async (t) => {
    const f = fixtureClient(
        (url) => {
            if (url.pathname.includes('storesearch')) return { body: { items: [] } };
            if (url.pathname === '/search/results/') return { body: localized.response };
            if (url.pathname.includes('appdetails'))
                return { body: { 5245310: { success: true, data: app(5245310, 'Idle Demon Lord II') } } };
            return normalHandler(url);
        },
        { env: { DOMParser: SearchFixtureDOMParser } }
    );
    t.after(() => f.client.dispose());
    const data = await f.client.loadPreview(source('Idle Demon Lord II'));
    assert.equal(data.appId, 5245310);
    assert.equal(data.match.score, 100);
    assert.deepEqual(data.tags, ['Exploration', 'Story Rich']);
    assert.equal(f.calls.filter((request) => request.url.includes('storesearch')).length, 1);
    assert.equal(f.calls.filter((request) => request.url.includes('/search/results/')).length, 1);
});

test('website search parser accepts only unique Steam app rows and bounds candidates', () => {
    class RowParser {
        parseFromString() {
            return {
                querySelectorAll: () => [
                    fixtureSearchRow('https://evil.test/app/10/', 'External', '10'),
                    fixtureSearchRow('https://store.steampowered.com/sub/10/', 'Package'),
                    fixtureSearchRow('https://store.steampowered.com/bundle/10/', 'Bundle'),
                    fixtureSearchRow('https://store.steampowered.com/app/10/', 'Wrong ID', '20'),
                    ...Array.from({ length: 15 }, (_, index) =>
                        fixtureSearchRow('/app/' + (index + 30) + '/', 'Game ' + index, String(index + 30))
                    ),
                    fixtureSearchRow('/app/30/', 'Duplicate', '30')
                ]
            };
        }
    }
    const items = parseSteamSearchResults(
        { success: 1, total_count: 20, results_html: '<a class="search_result_row">' },
        RowParser
    );
    assert.equal(items.length, 10);
    assert.deepEqual(
        items.map((item) => item.appId),
        [30, 31, 32, 33, 34, 35, 36, 37, 38, 39]
    );
    assert.deepEqual(parseSteamSearchResults({ success: 1, total_count: 0, results_html: '' }), []);
});

test('bad website search data stays a provider error rather than a false no-match', () => {
    for (const body of [
        {},
        { success: 0, total_count: 0, results_html: '' },
        { success: 1, total_count: 1, results_html: '<html>Blocked</html>' }
    ])
        assert.throws(
            () =>
                parseSteamSearchResults(
                    body,
                    class {
                        parseFromString() {
                            return { querySelectorAll: () => [] };
                        }
                    }
                ),
            { code: 'SCHEMA' }
        );
});

test('manual suggestions rank closest names even when automatic sequel checks reject them', () => {
    assert.equal(scoreCandidate('Portal 3', { name: 'Portal 2' }), -Infinity);
    const suggestions = rankSteamSuggestions('Portal 3', [
        { appId: 99, name: 'Completely Different', score: -Infinity },
        { appId: 20, name: 'Portal 2', score: -Infinity },
        { appId: 21, name: 'Portal 4 Remastered Soundtrack', score: -Infinity },
        { appId: 20, name: 'Duplicate', score: 0 },
        { appId: 'javascript:bad', name: 'Bad ID', score: 0 }
    ]);
    assert.equal(suggestions[0].appId, 20);
    assert.ok(suggestions[0].nameScore > suggestions[1].nameScore);
    assert.equal(suggestions[0].score, null);
    assert.equal(suggestions.length, 3);
});

test('failed automatic identity still returns name-based alternatives for explicit manual selection', async (t) => {
    const f = fixtureClient((url) => {
        if (url.pathname.includes('storesearch'))
            return {
                body: {
                    items: [
                        { id: 99, name: 'Completely Different', type: 'app' },
                        { id: 20, name: 'Example Game 2', type: 'app' }
                    ]
                }
            };
        if (url.pathname.includes('appdetails'))
            return { body: { 20: { success: true, data: app(20, 'Example Game 2') } } };
        return normalHandler(url);
    });
    t.after(() => f.client.dispose());
    const item = source('Example Game 3');
    await assert.rejects(f.client.loadPreview(item), (error) => {
        assert.equal(error.code, 'NO_MATCH');
        assert.equal(error.candidates[0].appId, 20);
        return true;
    });
    assert.equal((await f.client.correctMatch(item, 20)).appId, 20);
});

test('typed name search ranks permissive suggestions without selecting an AppID or fetching metadata', async (t) => {
    const f = fixtureClient((url) =>
        url.pathname.includes('storesearch')
            ? {
                  body: {
                      items: [
                          { id: 99, name: 'Completely Different', type: 'app' },
                          { id: 20, name: 'Example Game 2', type: 'app' }
                      ]
                  }
              }
            : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    const result = await f.client.searchGames('Example Game 3');
    assert.equal(result.candidates[0].appId, 20);
    assert.equal(result.partial, false);
    assert.ok(f.calls.every((request) => /storesearch|search\/results/.test(request.url)));
    assert.equal(f.client.getDebugReport().cache.details, 0);
    assert.equal(f.client.getDebugReport().cache.mappings, 0);
    assert.equal(f.client.exportCorrections().corrections.length, 0);
});

test('typed name search finds localized aliases through website search without loading their details', async (t) => {
    const f = fixtureClient(
        (url) => {
            if (url.pathname.includes('storesearch')) return { body: { items: [] } };
            if (url.pathname === '/search/results/') return { body: localized.response };
            return normalHandler(url);
        },
        { env: { DOMParser: SearchFixtureDOMParser } }
    );
    t.after(() => f.client.dispose());
    const result = await f.client.searchGames('Idle Demon Lord II');
    assert.equal(result.candidates[0].appId, 5245310);
    assert.equal(result.candidates[0].nameScore, 100);
    assert.equal(f.calls.length, 2);
    assert.equal(f.client.getDebugReport().cache.details, 0);
});

test('typed search preserves available suggestions on a partial provider error and rejects empty input without requests', async (t) => {
    const f = fixtureClient((url) => {
        if (url.pathname.includes('storesearch'))
            return { body: { items: [{ id: 20, name: 'Example Game 2', type: 'app' }] } };
        if (url.pathname === '/search/results/') return { body: { success: 0 } };
        return normalHandler(url);
    });
    t.after(() => f.client.dispose());
    const result = await f.client.searchGames('Example Game 3');
    assert.equal(result.partial, true);
    assert.equal(result.candidates[0].appId, 20);
    const before = f.calls.length;
    await assert.rejects(f.client.searchGames('   '), { code: 'INVALID_QUERY' });
    assert.equal(f.calls.length, before);
});

test('cancelled typed search cannot deliver old results over a subsequent query', async (t) => {
    const f = fixtureClient((url) =>
        url.searchParams.get('term') === 'Pending'
            ? { hold: true, deliverAfterAbort: true, body: { items: [{ id: 99, name: 'Pending', type: 'app' }] } }
            : normalHandler(url)
    );
    t.after(() => f.client.dispose());
    const abort = new AbortController();
    const pending = f.client.searchGames('Pending', { signal: abort.signal });
    const rejected = assert.rejects(pending, { code: 'ABORTED' });
    await waitFor(() => f.pending.length === 1);
    abort.abort();
    await rejected;
    const current = await f.client.searchGames('Example Game');
    f.pending[0].deliver();
    assert.equal(current.candidates[0].appId, 10);
    assert.equal(f.client.getDebugReport().cache.mappings, 0);
});
