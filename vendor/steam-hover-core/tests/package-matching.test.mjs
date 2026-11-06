import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    cleanTorrentTitle,
    cleanForumTitle,
    scoreCandidate,
    steamTitleQueries,
    steamSearchQueries,
    createSteamClient
} from '../src/core/steam-client.mjs';

const fixture = JSON.parse(
    readFileSync(new URL('./fixtures/steam/bundle-and-dlc-search.json', import.meta.url), 'utf8')
);

function clientFor(t, { searches = fixture.searches, apps = fixture.apps } = {}) {
    const requests = [];
    class TagParser {
        parseFromString() {
            return { querySelectorAll: () => [{ textContent: 'Exploration' }, { textContent: 'Strategy' }] };
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
            if (url.pathname.includes('storesearch'))
                body = { items: searches.find((row) => row.query === url.searchParams.get('term'))?.items || [] };
            else if (url.pathname === '/search/results/') body = { success: 1, total_count: 0, results_html: '' };
            else if (url.pathname.includes('appdetails')) {
                const id = url.searchParams.get('appids');
                body = { [id]: apps[id] ? { success: true, data: apps[id] } : { success: false } };
            } else if (url.pathname.includes('GetAppReviews'))
                body = { response: { query_summary: { total_reviews: 0, total_positive: 0, total_negative: 0 } } };
            else body = '<a class="app_tag">Exploration</a>';
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

for (const row of fixture.cases) {
    test(`reported packaging resolves using captured Steam data: ${row.rawTitle}`, async (t) => {
        const { client, requests } = clientFor(t);
        const data = await client.loadPreview({
            key: `reported:${row.expectedAppId}:${row.query}`,
            title: cleanTorrentTitle(row.rawTitle)
        });
        assert.equal(data.appId, row.expectedAppId);
        assert.deepEqual(data.tags, ['Exploration', 'Strategy']);
        assert.equal(requests.filter((url) => url.pathname.includes('storesearch')).length, 1);
        assert.equal(
            requests.some((url) => url.pathname === '/search/results/'),
            false
        );
        const ids = requests
            .filter((url) => url.pathname.includes('appdetails'))
            .map((url) => Number(url.searchParams.get('appids')));
        assert.deepEqual(
            ids,
            row.query.endsWith('State and Revolution') ? [4314660, row.expectedAppId] : [row.expectedAppId]
        );
        assert.equal(data.match.kind, row.query.endsWith('State and Revolution') ? 'dlc-parent' : 'search');
    });
}

test('purchase-label grammar works on unfamiliar titles while preserving sequel and release-year identity', () => {
    for (const base of ['Clockwork Harbor 9', 'Northwind Circuit IV', 'Velocity 2026', 'Verdant Moon']) {
        for (const label of [
            ": 2027 Collector's Bundle",
            ': Ultimate Bundle',
            ' Gold Bundle',
            ': 1-Year Anniversary Edition',
            ' - 3 Year Anniversary Edition',
            ' & Soundtrack Bundle',
            ' and Original Soundtrack Bundle'
        ]) {
            const title = base + label;
            assert.equal(steamTitleQueries(title)[0], base, title);
            assert.equal(steamSearchQueries(title)[0], base, title);
            assert.equal(scoreCandidate(title, { name: base }), 100, title);
            for (const clean of [cleanTorrentTitle, cleanForumTitle])
                assert.equal(scoreCandidate(clean(title), { name: base }), 100, title);
        }
    }
    assert.equal(scoreCandidate('Clockwork Harbor 9: Ultimate Bundle', { name: 'Clockwork Harbor 8' }), -Infinity);
    assert.equal(scoreCandidate("Velocity 2026: 2027 Collector's Bundle", { name: 'Velocity 2025' }), -Infinity);
});

test('standalone anniversary/edition names and multi-game bundles are not reduced to a different game', () => {
    for (const title of [
        'Titan Quest Anniversary Edition',
        'Braid Anniversary Edition',
        'Fable Anniversary',
        'Skyrim Anniversary Edition',
        'Clockwork Harbor: Definitive Edition',
        'Clockwork Harbor: Special Edition',
        'Clockwork Harbor VR',
        'Portal 2 & Half-Life 2 Bundle',
        'The Bundle',
        'Clockwork Harbor: State and Revolution'
    ])
        assert.equal(steamTitleQueries(title)[0], title, title);
    assert.equal(scoreCandidate('Skyrim Anniversary Edition', { name: 'Skyrim Special Edition' }), -Infinity);
    assert.ok(scoreCandidate('Clockwork Harbor: State and Revolution', { name: 'Clockwork Harbor' }) < 85);
});

test('partially clipped release names need preceding version metadata, and unknown bracketed words survive', () => {
    for (const fragment of ['Fi', 'Fi...', 'Fi…', 'Do...', 'ElA…'])
        assert.equal(
            cleanTorrentTitle(`Clockwork Harbor 9 (v1.0 + 2 DLCs, MULTi11) [${fragment}`),
            'Clockwork Harbor 9'
        );
    for (const [raw, expected] of [
        ['Clockwork Harbor [Fi', 'Clockwork Harbor [Fi'],
        ['Clockwork Harbor (v1.0) [Fire and Ice...', 'Clockwork Harbor [Fire and Ice'],
        ['Clockwork Harbor (v1.0) [Final Chapter]', 'Clockwork Harbor [Final Chapter]']
    ])
        assert.equal(cleanTorrentTitle(raw), expected, raw);
});

for (const type of ['dlc', 'game', 'music', 'missing-parent', 'wrong-sequel', 'wrong-subtitle']) {
    test(`DLC role labels require a matching full subtitle and a verified base: ${type}`, async (t) => {
        const query = 'Clockwork Harbor 9 Northern Frontier';
        const name = `Clockwork Harbor ${type === 'wrong-sequel' ? '8' : '9'} ${type === 'wrong-subtitle' ? 'Southern Frontier' : 'Northern Frontier'} - Immersion Pack`;
        const { client } = clientFor(t, {
            searches: [{ query, items: [{ id: 71, name }] }],
            apps: {
                71: {
                    steam_appid: 71,
                    name,
                    type: ['game', 'music'].includes(type) ? type : 'dlc',
                    ...(type !== 'missing-parent' ? { fullgame: { appid: '70', name: 'Clockwork Harbor 9' } } : {})
                },
                70: { steam_appid: 70, name: 'Clockwork Harbor 9', type: 'game' }
            }
        });
        if (type === 'dlc') {
            const data = await client.loadPreview({ key: `role:${type}`, title: query });
            assert.equal(data.appId, 70);
            assert.equal(data.match.kind, 'dlc-parent');
            assert.deepEqual(data.match.parentChain, [{ appId: 71, name, parentAppId: 70 }]);
        } else await assert.rejects(client.loadPreview({ key: `role:${type}`, title: query }), { code: 'NO_MATCH' });
    });
}

test('matching DLC descriptors with different verified parents remain ambiguous', async (t) => {
    const query = 'Clockwork Harbor Northern Frontier';
    const name = query + ' - Immersion Pack';
    const { client } = clientFor(t, {
        searches: [
            {
                query,
                items: [
                    { id: 71, name },
                    { id: 81, name }
                ]
            }
        ],
        apps: {
            71: { steam_appid: 71, name, type: 'dlc', fullgame: { appid: '70' } },
            81: { steam_appid: 81, name, type: 'dlc', fullgame: { appid: '80' } },
            70: { steam_appid: 70, name: 'Clockwork Harbor', type: 'game' },
            80: { steam_appid: 80, name: 'Another Harbor', type: 'game' }
        }
    });
    await assert.rejects(client.loadPreview({ key: 'role:ambiguous', title: query }), { code: 'AMBIGUOUS_MATCH' });
});

test('verified DLC role grammar handles different pack descriptions and expansion prefixes', async (t) => {
    const query = 'Verdant Moon 7 Northern Frontier';
    for (const name of [
        query + ' - Mechanics Pack',
        query + ' – Content Pack',
        query + ': Story Pack',
        query + ' — Cosmetic Pack',
        query + ' - Music Pack',
        query + ' - Expansion Pack',
        query + ' - Expansion',
        'Expansion - ' + query,
        'Downloadable Content: ' + query
    ]) {
        const { client } = clientFor(t, {
            searches: [{ query, items: [{ id: 71, name }] }],
            apps: {
                71: { steam_appid: 71, name, type: 'dlc', fullgame: { appid: '70' } },
                70: { steam_appid: 70, name: 'Verdant Moon 7', type: 'game' }
            }
        });
        const data = await client.loadPreview({ key: `role:${name}`, title: query });
        assert.equal(data.appId, 70, name);
    }
});
