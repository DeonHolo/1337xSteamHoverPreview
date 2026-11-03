import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    cleanTorrentTitle,
    cleanForumTitle,
    scoreCandidate,
    normalizeForMatch,
    steamTitleQueries,
    steamSearchQueries,
    createSteamClient
} from '../src/core/steam-client.mjs';
const searches = JSON.parse(
    readFileSync(new URL('./fixtures/steam/reported-title-search.json', import.meta.url), 'utf8')
);

test('reported Apex Predator commercial edition retains the sequel and searches its base title', () => {
    const title = cleanTorrentTitle(
        'Hunting Simulator 3: Apex Predator Edition (v1.0.0.451.118880 + 2 DLCs, MULTI11) [FitGirl Repack]'
    );
    assert.equal(steamTitleQueries(title)[0], 'Hunting Simulator 3');
    assert.equal(scoreCandidate(title, { name: 'Hunting Simulator 3' }), 100);
    assert.equal(scoreCandidate(title, { name: 'Hunting Simulator 2' }), -Infinity);
    assert.equal(steamTitleQueries('Game: Definitive Edition')[0], 'Game: Definitive Edition');
});

test('reported Update release suffixes no longer become part of game identity', () => {
    for (const [raw, expected] of [
        ['TRAIL OUT Update v5 5-RUNE', 'TRAIL OUT'],
        ['House Flipper Remastered Collection Update v1 26303-RUNE', 'House Flipper Remastered Collection'],
        ['Gunsmith Simulator Heavy Metal Update v1 7 18-RUNE', 'Gunsmith Simulator Heavy Metal'],
        ['Lady Death Demonicron Update v0 243-RUNE', 'Lady Death Demonicron'],
        ['MagiCat - b20270597 - MULTI7 - GNU/Linux Wine - jc141 (Appid=656970)', 'MagiCat']
    ])
        assert.equal(cleanTorrentTitle(raw), expected);
    assert.equal(
        cleanForumTitle('[Info] Hunting Simulator 3: Apex Predator Edition'),
        'Hunting Simulator 3: Apex Predator Edition'
    );
    assert.equal(
        scoreCandidate('Gunsmith Simulator Heavy Metal', { name: 'Gunsmith Simulator - Heavy Metal DLC' }),
        100
    );
});

test('enhanced-remaster packaging selects the correct candidate before verified parent resolution', () => {
    const title = cleanTorrentTitle(
        'Resonance of Fate (End of Eternity) 4K/HD Edition - ENHANCED REMASTER (Build 259000) [FitGirl Repack]'
    );
    const reference = steamTitleQueries(title)[0];
    assert.equal(scoreCandidate(reference, { name: 'RESONANCE OF FATE™/END OF ETERNITY™ ENHANCED REMASTER' }), 100);
    assert.equal(scoreCandidate(reference, { name: 'RESONANCE OF FATE™/END OF ETERNITY™ 4K/HD EDITION' }), -Infinity);
});

test('captured Steam search shows why the full edition query failed and the base query succeeds', () => {
    assert.deepEqual(searches.find((item) => item.query === 'Hunting Simulator 3: Apex Predator Edition').items, []);
    assert.equal(searches.find((item) => item.query === 'Hunting Simulator 3').items[0].id, 2482760);
    assert.equal(searches.find((item) => item.query === 'Unbroken The Awakening').items[0].id, 2377020);
});

test('Apex Predator resolves from the recorded Steam candidates without requiring manual correction', async (t) => {
    const requests = [];
    const store = new Map();
    class TagParser {
        parseFromString() {
            return { querySelectorAll: () => [{ textContent: 'Hunting' }, { textContent: 'Simulation' }] };
        }
    }
    const client = createSteamClient({
        DOMParser: TagParser,
        minInterval: 0,
        persistDelay: 0,
        getValue: (key, fallback) => store.get(key) ?? fallback,
        setValue: (key, value) => store.set(key, value),
        gmRequest(options) {
            const url = new URL(options.url);
            requests.push(url);
            let body;
            if (url.pathname.includes('storesearch'))
                body = { items: searches.find((item) => item.query === url.searchParams.get('term'))?.items || [] };
            else if (url.pathname === '/search/results/') body = { success: 1, total_count: 0, results_html: '' };
            else if (url.pathname.includes('appdetails'))
                body = {
                    2482760: {
                        success: true,
                        data: {
                            steam_appid: 2482760,
                            name: 'Hunting Simulator 3',
                            type: 'game',
                            release_date: { date: 'Nov 1, 2026' }
                        }
                    }
                };
            else if (url.pathname.includes('GetAppReviews'))
                body = {
                    response: {
                        query_summary: {
                            total_reviews: 1,
                            total_positive: 1,
                            total_negative: 0,
                            review_score_desc: 'Positive'
                        }
                    }
                };
            else body = '<html><a class="app_tag">Hunting</a></html>';
            const timer = setTimeout(
                () =>
                    options.onload({
                        status: 200,
                        response: body,
                        responseText: typeof body === 'string' ? body : JSON.stringify(body),
                        finalUrl: options.url
                    }),
                0
            );
            return {
                abort() {
                    clearTimeout(timer);
                    options.onabort();
                }
            };
        }
    });
    t.after(() => client.dispose());
    const data = await client.loadPreview({
        key: '1337x:hunting3',
        title: 'Hunting Simulator 3: Apex Predator Edition'
    });
    assert.equal(data.appId, 2482760);
    assert.deepEqual(data.tags, ['Hunting', 'Simulation']);
    assert.equal(requests.filter((url) => url.pathname.includes('storesearch')).length, 1);
});

test('Steam trademark symbols are removed before compatibility normalization can turn them into TM text', () => {
    assert.equal(normalizeForMatch('Hunting Simulator™ 3'), 'hunting simulator 3');
    assert.equal(scoreCandidate('Resonance of Fate', { name: 'Resonance of Fate™' }), 100);
});

const asgardSearch = JSON.parse(readFileSync(new URL('./fixtures/steam/asgard-search.json', import.meta.url), 'utf8'));

function matchingClient(t, { appId = 2780710, name = "Asgard's Fall — Viking Survivors", lookup }) {
    const requests = [];
    class TagParser {
        parseFromString() {
            return { querySelectorAll: () => [{ textContent: 'Action Roguelike' }, { textContent: 'Bullet Hell' }] };
        }
    }
    const client = createSteamClient({
        DOMParser: TagParser,
        minInterval: 0,
        persistDelay: 0,
        gmRequest(options) {
            const url = new URL(options.url);
            requests.push(url);
            let body;
            if (url.pathname.includes('storesearch')) body = { items: lookup(url.searchParams.get('term')) };
            else if (url.pathname.includes('appdetails'))
                body = { [appId]: { success: true, data: { steam_appid: appId, name, type: 'game' } } };
            else if (url.pathname.includes('GetAppReviews'))
                body = { response: { query_summary: { total_reviews: 0, total_positive: 0, total_negative: 0 } } };
            else body = '<a class="app_tag">Action Roguelike</a>';
            const timer = setTimeout(
                () =>
                    options.onload({
                        status: 200,
                        response: body,
                        responseText: typeof body === 'string' ? body : JSON.stringify(body),
                        finalUrl: options.url
                    }),
                0
            );
            return {
                abort() {
                    clearTimeout(timer);
                    options.onabort();
                }
            };
        }
    });
    t.after(() => client.dispose());
    return { client, requests };
}

test('Asgard punctuation variants preserve full matching identity and use a neutral full search first', () => {
    const title = cleanTorrentTitle(asgardSearch.rawTitle);
    assert.equal(scoreCandidate(title, { name: "Asgard's Fall — Viking Survivors" }), 100);
    assert.deepEqual(steamSearchQueries(title), [
        "Asgard's Fall Viking Survivors",
        "Asgard's Fall - Viking Survivors",
        "Asgard's Fall"
    ]);
    const variants = steamSearchQueries('Game 2: Remastered');
    assert.equal(variants[0], 'Game 2 Remastered');
    assert.ok(variants.every((query) => query.includes('2')));
    assert.deepEqual(steamSearchQueries('Game 2 Mystery Subtitle'), ['Game 2 Mystery Subtitle']);
});

test('Asgard resolves the reported raw release name using recorded punctuation-sensitive Steam responses', async (t) => {
    assert.deepEqual(
        asgardSearch.searches.find((search) => search.term === "Asgard's Fall - Viking Survivors").items,
        []
    );
    const { client, requests } = matchingClient(t, {
        lookup: (term) => asgardSearch.searches.find((search) => search.term === term)?.items || []
    });
    const data = await client.loadPreview({ key: 'asgard:reported', title: cleanTorrentTitle(asgardSearch.rawTitle) });
    assert.equal(data.appId, 2780710);
    assert.deepEqual(data.tags, ['Action Roguelike', 'Bullet Hell']);
    assert.deepEqual(
        requests.filter((url) => url.pathname.includes('storesearch')).map((url) => url.searchParams.get('term')),
        ["Asgard's Fall Viking Survivors"]
    );
});

test('empty punctuation variant does not poison an original-query fallback with the same normalized identity', async (t) => {
    const { client, requests } = matchingClient(t, {
        appId: 10,
        name: 'Co-op Adventure',
        lookup: (term) => (term === 'Co-op Adventure' ? [{ id: 10, name: 'Co-op Adventure', type: 'app' }] : [])
    });
    assert.equal((await client.loadPreview({ key: 'punctuation:fallback', title: 'Co-op Adventure' })).appId, 10);
    assert.deepEqual(
        requests.filter((url) => url.pathname.includes('storesearch')).map((url) => url.searchParams.get('term')),
        ['Co op Adventure', 'Co-op Adventure']
    );
});

test('Fuse tolerates minor spelling mistakes while protected identities and short word substitutions stay rejected', () => {
    const typo = scoreCandidate("Asgard's Fall Viking Survivers", { name: "Asgard's Fall — Viking Survivors" });
    assert.ok(typo >= 85 && typo < 100, String(typo));
    assert.ok(scoreCandidate('Demonolgist', { name: 'Demonologist' }) >= 85);
    assert.ok(scoreCandidate('The Outer Wilds', { name: 'The Outer Worlds' }) < 85);
    assert.ok(scoreCandidate('Walking Simulator', { name: 'Talking Simulator' }) < 85);
    assert.ok(scoreCandidate('Example Game', { name: 'Example Game Extra Stuff' }) < 85);
    assert.equal(scoreCandidate('Demonolgist 2', { name: 'Demonologist 3' }), -Infinity);
    assert.equal(scoreCandidate('Demonolgist VR', { name: 'Demonologist' }), -Infinity);
    assert.equal(scoreCandidate('Demonolgist Remastered', { name: 'Demonologist' }), -Infinity);
});

test('Fuse fallback can recover a subtitle typo through an explicit title-prefix search and still validate the full name', async (t) => {
    const { client, requests } = matchingClient(t, {
        lookup: (term) => asgardSearch.searches.find((search) => search.term === term)?.items || []
    });
    const data = await client.loadPreview({ key: 'asgard:typo', title: "Asgard's Fall - Viking Survivers" });
    assert.equal(data.appId, 2780710);
    assert.ok(data.match.score >= 85 && data.match.score < 100);
    assert.deepEqual(
        requests.filter((url) => url.pathname.includes('storesearch')).map((url) => url.searchParams.get('term')),
        ["Asgard's Fall Viking Survivers", "Asgard's Fall - Viking Survivers", "Asgard's Fall"]
    );
});

const meowSearch = JSON.parse(readFileSync(new URL('./fixtures/steam/meow-search.json', import.meta.url), 'utf8'));

test('query punctuation covers exclamation, quotes, slash and Unicode marks while preserving meaningful symbols', () => {
    for (const title of [
        'Power!Quest',
        'Power?Quest',
        'Power/Quest',
        'Power;Quest',
        'Power…Quest',
        'Power，Quest',
        'Power「Quest」'
    ])
        assert.equal(steamSearchQueries(title)[0], 'Power Quest', title);
    assert.equal(steamSearchQueries('"MeowPower!Yachiyo"')[0], 'MeowPower Yachiyo');
    assert.equal(steamSearchQueries('C++ Adventure')[0], 'C++ Adventure');
    assert.equal(steamSearchQueries('C# Adventure')[0], 'C# Adventure');
    assert.equal(steamSearchQueries('Magic & Machines 2')[0], 'Magic and Machines 2');
    assert.equal(steamSearchQueries("Asgard's Fall - Viking Survivors")[0], "Asgard's Fall Viking Survivors");
});

test('recorded MeowPower failure is empty candidate retrieval, not fuzzy rejection of the actual game', () => {
    assert.deepEqual(meowSearch.searches.find((search) => search.term === 'MeowPower!Yachiyo').items, []);
    const result = meowSearch.searches.find((search) => search.term === 'MeowPower Yachiyo').items[0];
    assert.equal(result.id, 2885530);
    assert.equal(scoreCandidate('MeowPower!Yachiyo', result), 100);
    assert.equal(
        meowSearch.web.find((search) => search.term === 'MeowPower!Yachiyo').items[0].title,
        'MeowPower!Yachiyo'
    );
});

test('reported MeowPower raw title resolves with one corrected API query using real captured candidates', async (t) => {
    const { client, requests } = matchingClient(t, {
        appId: 2885530,
        name: 'MeowPower!Yachiyo',
        lookup: (term) => meowSearch.searches.find((search) => search.term === term)?.items || []
    });
    const data = await client.loadPreview({ key: 'meow:reported', title: 'MeowPower!Yachiyo' });
    assert.equal(data.appId, 2885530);
    assert.equal(data.match.score, 100);
    assert.deepEqual(data.tags, ['Action Roguelike', 'Bullet Hell']);
    assert.deepEqual(
        requests.filter((url) => url.pathname.includes('storesearch')).map((url) => url.searchParams.get('term')),
        ['MeowPower Yachiyo']
    );
});
