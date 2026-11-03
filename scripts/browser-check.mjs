import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import {
    listingHtml,
    makeMockConfig,
    installMockUserscriptEnvironment,
    defaultRows,
    imageSvg
} from '../tests/browser/fixtures.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'test-results', 'browser');
await mkdir(output, { recursive: true });
const products = {
    '1337x': {
        root: path.resolve(process.env.STEAM_HOVER_1337X_ROOT || path.join(root, '../1337x')),
        file: '1337xSteamHoverPreview.js',
        url: 'https://1337x.to/Games/1/',
        baseline: '1337x.original.js',
        baselineRevision: 'a93528e'
    },
    csrinru: {
        root,
        file: 'csrinruSteamHoverPreview.user.js',
        url: 'https://cs.rin.ru/forum/viewforum.php?f=10',
        baseline: 'csrinru.original.js',
        baselineRevision: 'a0340f8'
    }
};
const report = {
    generatedAt: new Date().toISOString(),
    environment:
        'Headless Chromium, local HTML fixtures and deterministic mocked Steam transport; not a live-network benchmark.',
    limitations: [
        'Hidden-state logic is simulated; browser freezing/discarding is outside this harness.',
        'Fixtures do not establish current live-site markup, CSP, script-manager, or media-codec compatibility.',
        'The original baseline receives a valid legacy review response to isolate pipeline work from endpoint retirement.'
    ],
    checks: [],
    benchmarks: []
};
let failed = 0;
const baselineOnly = process.argv.includes('--baseline-only');
const noBaseline = process.argv.includes('--no-baseline');
const siteOnly = process.argv.find((value) => value.startsWith('--site='))?.slice('--site='.length);
const matchOnly = process.argv.find((value) => value.startsWith('--match='))?.slice('--match='.length);
if (siteOnly && !Object.hasOwn(products, siteOnly)) throw new Error(`Unknown site: ${siteOnly}`);
const browser = await chromium.launch({ headless: true });
let currentCheckName = '';

async function run(name, body) {
    if (baselineOnly && !name.includes('original pipeline')) return;
    if (noBaseline && name.includes('original pipeline')) return;
    if (siteOnly && !name.startsWith(`${siteOnly}:`)) return;
    if (matchOnly && !name.toLowerCase().includes(matchOnly.toLowerCase())) return;
    currentCheckName = name;
    const start = performance.now();
    try {
        const detail = await body();
        report.checks.push({ name, status: 'passed', durationMs: Math.round(performance.now() - start), ...detail });
        console.log(`PASS ${name}`);
    } catch (error) {
        failed++;
        report.checks.push({
            name,
            status: 'failed',
            durationMs: Math.round(performance.now() - start),
            error: error.stack || String(error)
        });
        console.error(`FAIL ${name}: ${error.message}`);
    }
}

async function setup(
    site,
    { rows = defaultRows, config = {}, baseline = false, pagePath = null, viewport = { width: 1280, height: 820 } } = {}
) {
    const product = products[site],
        mock = makeMockConfig(config);
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [],
        resources = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(installMockUserscriptEnvironment, mock);
    await page.route('**/*', async (route) => {
        const url = route.request().url();
        resources.push({ url, type: route.request().resourceType() });
        if (url.startsWith('https://cdn.example.test/') && url.endsWith('.svg'))
            return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: imageSvg });
        if (url.startsWith('https://cdn.example.test/'))
            return route.fulfill({ status: 404, body: 'Media intentionally unavailable in fixture' });
        const parsed = new URL(url);
        if (parsed.origin === new URL(product.url).origin)
            return route.fulfill({ status: 200, contentType: 'text/html', body: listingHtml(site, rows) });
        return route.abort('blockedbyclient');
    });
    let source;
    if (baseline) {
        try {
            source = await readFile(path.join(root, 'test-results', 'baseline', product.baseline), 'utf8');
        } catch {
            source = (
                await promisify(execFile)(
                    'git',
                    ['-C', product.root, 'show', `${product.baselineRevision}:${product.file}`],
                    { windowsHide: true, maxBuffer: 2_000_000 }
                )
            ).stdout;
        }
    } else source = await readFile(path.join(product.root, product.file), 'utf8');
    await page.goto(pagePath ? new URL(pagePath, product.url).href : product.url, { waitUntil: 'load' });
    async function inject() {
        await page.addScriptTag({ content: source });
    }
    await inject();
    const fixture = () =>
        page.evaluate(() => ({
            requests: window.__fixture.requests,
            firstReady: window.__fixture.firstReady,
            firstTags: window.__fixture.firstTags,
            peak: window.__fixture.peak,
            hoverAt: window.__fixture.hoverAt,
            copied: window.__fixture.copied
        }));
    const hover = async (id) => {
        await page.mouse.move(1200, 760);
        await page.evaluate(() => {
            window.__fixture.hoverAt = performance.now() - window.__fixture.started;
        });
        await page.locator(`[data-fixture-id="${id}"]`).hover();
    };
    const card = page.locator('.steamHoverPreview');
    const ready = async (appId) => {
        await page.waitForFunction(
            (id) => {
                const card = document.querySelector('.steamHoverPreview');
                return (
                    card &&
                    getComputedStyle(card).display !== 'none' &&
                    card.dataset.previewState === 'ready' &&
                    (!id || card.dataset.previewAppId === String(id))
                );
            },
            appId,
            { timeout: 9000 }
        );
    };
    const noErrors = () => assert.deepEqual(errors, [], 'Unexpected browser exceptions');
    const close = async () => {
        try {
            const observed = await fixture();
            const dom = await page.evaluate(() => ({
                card: document.querySelector('.steamHoverPreview,.steamHoverTip,.csrinruSteamHoverTip')?.outerHTML,
                active: document.activeElement?.outerHTML,
                storage: Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))
            }));
            await writeFile(
                path.join(output, currentCheckName.replace(/[^a-z0-9]+/gi, '-') + '-state.json'),
                JSON.stringify({ site, name: currentCheckName, errors, observed, dom }, null, 2) + '\n'
            );
        } catch {}
        await context.close();
    };
    return { site, page, context, card, hover, ready, fixture, resources, errors, noErrors, inject, close };
}

function counts(requests) {
    return requests.reduce((result, item) => ((result[item.kind] = (result[item.kind] || 0) + 1), result), {});
}

try {
    for (const site of Object.keys(products)) {
        await run(`${site}: actual tags in first card, reviews independent, no speculative batch`, async () => {
            const t = await setup(site, { rows: [defaultRows[0]] });
            try {
                await t.hover(100);
                await t.ready(620);
                const observed = await t.fixture();
                assert.equal(observed.firstReady?.hasTags, true, 'First successful render must contain actual tags');
                assert.match(await t.card.locator('.steamTags').innerText(), /Puzzle/);
                assert.doesNotMatch(await t.card.innerText(), /GENRE_ONLY_SENTINEL|Genres:/);
                assert.equal(
                    observed.requests.some((x) => x.kind === 'batch'),
                    false,
                    'No failing multi-AppID request'
                );
                assert.equal(
                    observed.requests.filter((x) => x.kind === 'details').length,
                    1,
                    'Exact game needs one details response'
                );
                const reviews = observed.requests.find((x) => x.kind === 'reviews');
                assert.ok(
                    !reviews?.end || observed.firstTags < reviews.end,
                    'Tags must render before delayed reviews finish'
                );
                await t.page.waitForFunction(
                    () => /44\s+reviews/i.test(document.querySelector('.steamRating')?.textContent || ''),
                    null,
                    { timeout: 7000 }
                );
                const after = await t.fixture();
                assert.ok(
                    after.requests
                        .filter((x) => x.kind === 'reviews')
                        .every((x) => x.url.includes('IUserReviewsService'))
                );
                assert.equal(
                    t.resources.some((x) => /\.mp4|\.webm|\.m3u8/.test(x.url)),
                    false,
                    'Hover must not request video files'
                );
                assert.equal(await t.page.getByText('Copy magnet', { exact: false }).count(), 0);
                t.noErrors();
                await t.page.screenshot({ path: path.join(output, `${site}-preview.png`) });
                report.benchmarks.push({
                    site,
                    scenario: 'new cold exact match',
                    timeToRealTagsMs: Math.round(after.firstTags - after.hoverAt),
                    counts: counts(after.requests)
                });
                return { requestCounts: counts(after.requests) };
            } finally {
                await t.close();
            }
        });

        await run(`${site}: saved actual tags survive page reload`, async () => {
            const t = await setup(site, { rows: [defaultRows[0]] });
            try {
                await t.hover(100);
                await t.ready(620);
                await t.page.waitForFunction(
                    () =>
                        Object.keys(localStorage).some(
                            (k) => k.startsWith('gm:') && (localStorage.getItem(k) || '').includes('Puzzle')
                        ),
                    null,
                    { timeout: 6000 }
                );
                await t.page.reload({ waitUntil: 'load' });
                await t.inject();
                await t.hover(100);
                await t.ready(620);
                const observed = await t.fixture();
                assert.equal(observed.firstReady?.hasTags, true);
                assert.equal(
                    observed.requests.filter((x) => x.kind === 'tags').length,
                    0,
                    'Warm hover should not need another tag request'
                );
                report.benchmarks.push({
                    site,
                    scenario: 'new warm persisted tags',
                    timeToRealTagsMs: Math.round(observed.firstTags - observed.hoverAt),
                    counts: counts(observed.requests)
                });
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(`${site}: a DLC resolves all fields and links to its verified base`, async () => {
            const t = await setup(site, { rows: [defaultRows[2]] });
            try {
                await t.hover(102);
                await t.ready(1245620);
                assert.match(await t.card.locator('.steamTags').innerText(), /Souls-like/);
                assert.ok(
                    (
                        await t.card.getByRole('link', { name: 'Open on Steam', exact: true }).getAttribute('href')
                    ).includes('/app/1245620/')
                );
                const observed = await t.fixture();
                assert.ok(observed.requests.some((x) => x.kind === 'details' && x.appIds.includes(2778580)));
                assert.ok(observed.requests.some((x) => x.kind === 'details' && x.appIds.includes(1245620)));
                assert.ok(observed.requests.filter((x) => x.kind === 'tags').every((x) => x.appId === 1245620));
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(`${site}: repeated source listings reuse AppID details and actual tags`, async () => {
            const t = await setup(site, { rows: [defaultRows[0], { id: 601, appId: 620, title: 'Portal 2 v1.0' }] });
            try {
                await t.hover(100);
                await t.ready(620);
                await t.hover(601);
                await t.ready(620);
                const observed = await t.fixture();
                assert.equal(observed.requests.filter((x) => x.kind === 'details' && x.appIds.includes(620)).length, 1);
                assert.equal(observed.requests.filter((x) => x.kind === 'tags' && x.appId === 620).length, 1);
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(`${site}: absent tags settle explicitly and retry fills the same card`, async () => {
            const tags = makeMockConfig().tags;
            tags[620] = [];
            const t = await setup(site, { rows: [defaultRows[0]], config: { tags } });
            try {
                await t.hover(100);
                await t.ready(620);
                assert.doesNotMatch(await t.card.innerText(), /GENRE_ONLY_SENTINEL|Genres:/);
                await t.card.getByRole('button', { name: 'Retry tags', exact: true }).waitFor({ state: 'visible' });
                await t.page.evaluate(() => {
                    window.__fixture.config.tags[620] = ['Puzzle', 'Co-op', 'First-Person'];
                });
                await t.card.getByRole('button', { name: 'Retry tags', exact: true }).click();
                await t.page.waitForFunction(
                    () => /Puzzle/.test(document.querySelector('.steamTags')?.textContent || ''),
                    null,
                    { timeout: 7000 }
                );
                assert.equal(await t.card.getAttribute('data-preview-app-id'), '620');
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(`${site}: rapid pointer changes cannot overwrite the next game`, async () => {
            const t = await setup(site, {
                rows: defaultRows.slice(0, 2),
                config: { delaysByApp: { 620: { tags: 600 }, 4834840: { tags: 30 } } }
            });
            try {
                await t.hover(100);
                await t.page.waitForFunction(
                    () => window.__fixture.requests.some((x) => x.kind === 'tags' && x.appId === 620),
                    null,
                    { timeout: 6000 }
                );
                await t.hover(101);
                await t.ready(4834840);
                await t.page.waitForFunction(
                    () =>
                        window.__fixture.requests
                            .filter((x) => x.kind === 'tags' && x.appId === 620)
                            .every((x) => x.end !== undefined),
                    null,
                    { timeout: 6000 }
                );
                assert.equal(await t.card.getAttribute('data-preview-app-id'), '4834840');
                assert.match(await t.card.locator('.steamTags').innerText(), /Exploration/);
                assert.doesNotMatch(await t.card.locator('.steamTags').innerText(), /Puzzle/);
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(`${site}: zero reviews is a visible state`, async () => {
            const t = await setup(site, { rows: [defaultRows[0]], config: { zeroReviews: true } });
            try {
                await t.hover(100);
                await t.ready(620);
                await t.page.waitForFunction(
                    () => /No user reviews yet/i.test(document.querySelector('.steamRating')?.textContent || ''),
                    null,
                    { timeout: 7000 }
                );
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(`${site}: failed reviews can be retried without resetting media`, async () => {
            const t = await setup(site, { rows: [defaultRows[0]], config: { invalidJson: { reviews: true } } });
            try {
                await t.hover(100);
                await t.ready(620);
                await t.card
                    .getByRole('button', { name: 'Retry reviews', exact: true })
                    .waitFor({ state: 'visible', timeout: 7000 });
                const thumbs = t.card.getByRole('button', { name: /Show .*screenshot 1/i });
                if (await thumbs.count()) await thumbs.first().click();
                const selectedBefore = await t.card.locator('[aria-current="true"]').count();
                await t.page.evaluate(() => {
                    window.__fixture.config.invalidJson.reviews = false;
                });
                await t.card.getByRole('button', { name: 'Retry reviews', exact: true }).click();
                await t.page.waitForFunction(
                    () => /44\s+reviews/i.test(document.querySelector('.steamRating')?.textContent || ''),
                    null,
                    { timeout: 7000 }
                );
                assert.equal(await t.card.locator('[aria-current="true"]').count(), selectedBefore);
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(`${site}: keyboard and theatre focus remain contained and restore`, async () => {
            const t = await setup(site, { rows: [defaultRows[0]] });
            try {
                await t.page.locator('[data-fixture-id="100"]').focus();
                await t.ready(620);
                await t.page.keyboard.press('Alt+ArrowDown');
                await t.page.waitForFunction(
                    () => document.querySelector('.steamHoverPreview')?.contains(document.activeElement),
                    null,
                    { timeout: 4000 }
                );
                await t.card
                    .getByRole('button', { name: /Show .*screenshot 1/i })
                    .first()
                    .click();
                const expand = t.card.getByRole('button', { name: 'Open media theatre', exact: true });
                await expand.click();
                const close = t.page.getByRole('button', { name: 'Close theatre', exact: true });
                await close.waitFor({ state: 'visible' });
                await t.page.keyboard.press('Shift+Tab');
                assert.equal(
                    await t.page.evaluate(() =>
                        document.querySelector('.steamPreviewTheatreOpen')?.contains(document.activeElement)
                    ),
                    true
                );
                await t.page.keyboard.press('Escape');
                await close.waitFor({ state: 'hidden' });
                assert.equal(
                    await t.page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
                    'Open media theatre'
                );
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(`${site}: wrong-game correction survives reload`, async () => {
            const t = await setup(site, { rows: [defaultRows[0]] });
            try {
                await t.hover(100);
                await t.ready(620);
                await t.card.getByRole('button', { name: 'Wrong game?', exact: true }).click();
                await t.card.getByRole('textbox', { name: 'Steam AppID or store URL', exact: true }).fill('4834840');
                await t.card.getByRole('button', { name: 'Use this game', exact: true }).click();
                await t.ready(4834840);
                await t.page.waitForFunction(
                    () =>
                        Object.keys(localStorage).some(
                            (k) => k.startsWith('gm:') && (localStorage.getItem(k) || '').includes('4834840')
                        ),
                    null,
                    { timeout: 6000 }
                );
                await t.page.reload({ waitUntil: 'load' });
                await t.inject();
                await t.hover(100);
                await t.ready(4834840);
                assert.match(await t.card.locator('.steamTags').innerText(), /Exploration/);
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(`${site}: dynamic game descriptions cannot inject markup`, async () => {
            const games = makeMockConfig().games;
            games[620].short_description =
                '<img src="https://invalid.test/payload" onerror="window.__injected=true">Fixture description';
            const t = await setup(site, { rows: [defaultRows[0]], config: { games } });
            try {
                await t.hover(100);
                await t.ready(620);
                assert.equal(await t.page.evaluate(() => Boolean(window.__injected)), false);
                assert.equal(await t.card.locator('img[src="https://invalid.test/payload"]').count(), 0);
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(`${site}: preload starts after load and remains bounded when hidden`, async () => {
            const rows = Array.from({ length: 24 }, (_, i) => ({
                id: 200 + i,
                appId: 700001 + i,
                title: `Nebula Quest ${i + 1}`
            }));
            const t = await setup(site, {
                rows,
                config: {
                    preload: 'all',
                    hidden: true,
                    delays: { search: 40, details: 70, tags: 100, reviews: 90, batch: 40 }
                }
            });
            try {
                await t.page.waitForFunction(
                    () => window.__fixture.requests.filter((x) => x.kind === 'tags' && x.end !== undefined).length >= 2,
                    null,
                    { timeout: 12000 }
                );
                const observed = await t.fixture();
                assert.ok(observed.requests.length > 0, 'Already-loaded hidden tab should preload');
                assert.ok(observed.peak <= 1, `Expected bounded request concurrency, observed ${observed.peak}`);
                return { peakRequests: observed.peak, requestCounts: counts(observed.requests) };
            } finally {
                await t.close();
            }
        });
    }

    for (const site of Object.keys(products)) {
        await run(site + ': settings menu persists preload and theme preferences', async () => {
            const t = await setup(site, { rows: [defaultRows[0]] });
            try {
                await t.page.evaluate(() =>
                    window.__fixture.menus.find((menu) => menu.label.endsWith(': Settings')).callback()
                );
                const dialog = t.page.getByRole('dialog', { name: 'Steam Hover settings', exact: true });
                await dialog.waitFor({ state: 'visible' });
                await dialog.getByLabel('Preload', { exact: true }).selectOption('hover');
                const theme = site === '1337x' ? 'dark' : 'light';
                await dialog.getByLabel('Theme', { exact: true }).selectOption(theme);
                await dialog.getByRole('button', { name: 'Save settings', exact: true }).click();
                await dialog.waitFor({ state: 'hidden' });
                await t.hover(100);
                await t.ready(620);
                assert.equal(await t.card.getAttribute('data-theme'), theme);
                await t.page.reload({ waitUntil: 'load' });
                await t.inject();
                await t.hover(100);
                await t.ready(620);
                assert.equal(await t.card.getAttribute('data-theme'), theme);
                await t.page.evaluate(() =>
                    window.__fixture.menus.find((menu) => menu.label.endsWith(': Settings')).callback()
                );
                assert.equal(await t.page.getByLabel('Preload', { exact: true }).inputValue(), 'hover');
                t.noErrors();
            } finally {
                await t.close();
            }
        });
    }

    for (const site of Object.keys(products)) {
        await run(site + ': regression failure preview locks so its recovery controls are clickable', async () => {
            const t = await setup(site, { rows: [{ id: 806, appId: 620, title: 'Unknown release title' }] });
            try {
                await t.page.locator('[data-fixture-id="806"]').focus();
                await t.page.waitForFunction(
                    () => document.querySelector('.steamHoverPreview')?.dataset.previewState === 'error'
                );
                const before = await t.card.boundingBox();
                await t.page.mouse.move(before.x - 30, before.y - 20);
                await t.page.evaluate(
                    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
                );
                const after = await t.card.boundingBox();
                assert.equal(after.x, before.x);
                assert.equal(after.y, before.y);
                assert.equal(await t.card.getByRole('button', { name: 'Wrong game?', exact: true }).count(), 0);
                assert.equal(await t.card.locator('.steamCorrection[hidden]').count(), 1);
                assert.equal(await t.card.getByRole('button', { name: 'Retry lookup', exact: true }).count(), 0);
                assert.equal(await t.card.getByRole('button', { name: 'Choose Steam game…', exact: true }).count(), 1);
                const steam = t.card.getByRole('link', { name: 'Search on Steam', exact: true });
                await steam.waitFor({ state: 'visible' });
                if (site === '1337x') {
                    const magnet = t.card.getByRole('button', { name: 'Magnet Download', exact: true });
                    assert.equal(await magnet.isEnabled(), true);
                    const left = await steam.boundingBox(),
                        right = await magnet.boundingBox();
                    assert.ok(right.x - left.x - left.width >= 19.5, 'Failure actions need a visible 20px gap.');
                    assert.equal(
                        await steam.evaluate((node) => getComputedStyle(node).color),
                        await magnet.evaluate((node) => getComputedStyle(node).color)
                    );
                    await t.page.screenshot({ path: path.join(output, '1337x-failure-actions.png') });
                }
                const requestCount = (await t.fixture()).requests.length;
                await t.card.getByRole('button', { name: 'Choose Steam game…', exact: true }).click();
                const chooser = t.card.getByRole('group', { name: 'Choose a Steam game', exact: true });
                await chooser.waitFor({ state: 'visible' });
                assert.match(await chooser.innerText(), /No suggestions found/);
                assert.equal(
                    (await t.fixture()).requests.length,
                    requestCount,
                    'Opening the chooser reuses lookup results without retrying Steam.'
                );
                await chooser
                    .getByRole('textbox', { name: 'Steam AppID or store URL', exact: true })
                    .fill('https://store.steampowered.com/app/620/');
                await chooser.getByRole('button', { name: 'Use this game', exact: true }).click();
                await t.ready(620);
                assert.equal(await t.card.getByRole('button', { name: 'Wrong game?', exact: true }).count(), 1);
                assert.equal(await t.card.getByRole('button', { name: 'Choose Steam game…', exact: true }).count(), 0);
                t.noErrors();
            } finally {
                await t.close();
            }
        });
        await run(
            site + ': regression original typography and sizing with plain reviews and blue actions',
            async () => {
                const styles = noBaseline
                    ? [
                          {
                              fontFamily: 'Verdana, serif',
                              fontSize: '12px',
                              lineHeight: '17.4px',
                              boxSizing: 'content-box',
                              width: '420px',
                              padding: '8px'
                          }
                      ]
                    : [];
                for (const baseline of noBaseline ? [false] : [true, false]) {
                    const t = await setup(site, { rows: [defaultRows[0]], baseline });
                    try {
                        await t.page.addStyleTag({ content: 'body { font-family: Verdana, serif !important; }' });
                        await t.hover(100);
                        await t.page.waitForFunction(() => document.querySelector('.steamRating .ratingText'));
                        await t.page.waitForFunction(() => {
                            const image = document.querySelector('.steamMediaImage');
                            return image?.complete && image.naturalWidth > 0;
                        });
                        await t.page.evaluate(
                            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
                        );
                        styles.push(
                            await t.page.evaluate(() => {
                                const card = document.querySelector(
                                    '.steamHoverPreview,.steamHoverTip,.csrinruSteamHoverTip'
                                );
                                const css = getComputedStyle(card);
                                return {
                                    fontFamily: css.fontFamily,
                                    fontSize: css.fontSize,
                                    lineHeight: css.lineHeight,
                                    boxSizing: css.boxSizing,
                                    width: css.width,
                                    padding: css.padding
                                };
                            })
                        );
                        if (!baseline) {
                            assert.equal(await t.card.locator('.steamRating a').count(), 0);
                            const colors = await t.card.evaluate((card) => ({
                                steam: getComputedStyle(card.querySelector('.tipActions a')).color,
                                action: card.querySelector('[data-source-action]')
                                    ? getComputedStyle(card.querySelector('[data-source-action]')).color
                                    : null
                            }));
                            if (site === '1337x') assert.equal(colors.action, colors.steam);
                        }
                        t.noErrors();
                    } finally {
                        await t.close();
                    }
                }
                assert.deepEqual(styles[1], styles[0], 'Preserve the pre-upgrade card font metrics/content sizing');
            }
        );
    }
    await run(
        '1337x: regression Windows icons work on uploader pages without a Games link or uploader column',
        async () => {
            const t = await setup('1337x', { rows: [defaultRows[1]], pagePath: '/user/IGGGAMESCOM/' });
            try {
                await t.page.evaluate(() => {
                    const row = document.querySelector('tr[data-topic-id="101"]');
                    row.querySelector('i').className = 'flaticon-apps';
                    const title = row.querySelector('.fixture-title');
                    title.textContent = 'Ecstatica';
                    for (const td of [...row.querySelectorAll('td')].slice(1)) td.remove();
                });
                await t.hover(101);
                await t.ready(4834840);
                assert.match(await t.card.locator('.steamTags').innerText(), /Exploration/);
                t.noErrors();
            } finally {
                await t.close();
            }
        }
    );

    for (const site of Object.keys(products)) {
        await run(site + ': localized English alias resolves through Steam website search after API miss', async () => {
            const t = await setup(site, {
                rows: [{ id: 916, appId: 5245310, title: 'Idle Demon Lord II' }],
                config: {
                    searchTerms: { 'Idle Demon Lord II': [] },
                    storefrontSearch: { 'idle demon lord ii': [5245310] }
                }
            });
            try {
                await t.hover(916);
                await t.ready(5245310);
                assert.match(await t.card.locator('.steamTags').innerText(), /Idler/);
                const requests = (await t.fixture()).requests;
                assert.equal(requests.filter((request) => request.kind === 'search').length, 1);
                assert.equal(requests.filter((request) => request.kind === 'searchFallback').length, 1);
                assert.equal(
                    await t.card.getByRole('link', { name: 'Open on Steam', exact: true }).getAttribute('href'),
                    'https://store.steampowered.com/app/5245310/'
                );
                t.noErrors();
            } finally {
                await t.close();
            }
        });
        await run(site + ': reported MeowPower exclamation title resolves despite literal-query API miss', async () => {
            const t = await setup(site, {
                rows: [{ id: 915, appId: 2885530, title: 'MeowPower!Yachiyo' }],
                config: { searchTerms: { 'MeowPower!Yachiyo': [], 'MeowPower Yachiyo': [2885530] } }
            });
            try {
                await t.hover(915);
                await t.ready(2885530);
                assert.match(await t.card.locator('.steamTags').innerText(), /Beat em up/);
                const searches = (await t.fixture()).requests.filter((request) => request.kind === 'search');
                assert.deepEqual(
                    searches.map((request) => request.term),
                    ['MeowPower Yachiyo']
                );
                assert.equal(
                    await t.card.getByRole('link', { name: 'Open on Steam', exact: true }).getAttribute('href'),
                    'https://store.steampowered.com/app/2885530/'
                );
                assert.equal(await t.card.getByRole('button', { name: 'Wrong game?', exact: true }).count(), 1);
                t.noErrors();
            } finally {
                await t.close();
            }
        });
        await run(site + ': reported Asgard raw title uses punctuation-neutral Steam lookup', async () => {
            const t = await setup(site, {
                rows: [{ id: 911, appId: 2780710, title: "Asgard's Fall - Viking Survivors (v1.0.0.w)" }],
                config: {
                    searchTerms: {
                        "Asgard's Fall - Viking Survivors": [],
                        "Asgard's Fall Viking Survivors": [2780710],
                        "Asgard's Fall": [2780710]
                    }
                }
            });
            try {
                await t.hover(911);
                await t.ready(2780710);
                assert.match(await t.card.locator('.steamTags').innerText(), /Action Roguelike/);
                assert.equal((await t.fixture()).requests.filter((request) => request.kind === 'search').length, 1);
                assert.equal(
                    await t.card.getByRole('link', { name: 'Open on Steam', exact: true }).getAttribute('href'),
                    'https://store.steampowered.com/app/2780710/'
                );
                t.noErrors();
            } finally {
                await t.close();
            }
        });
        await run(site + ': bundled Fuse recovers a misspelled subtitle through a title-prefix candidate', async () => {
            const t = await setup(site, {
                rows: [{ id: 912, appId: 2780710, title: "Asgard's Fall - Viking Survivers (v1.0.0.w)" }],
                config: {
                    searchTerms: {
                        "Asgard's Fall - Viking Survivers": [],
                        "Asgard's Fall Viking Survivers": [],
                        "Asgard's Fall": [2780710]
                    }
                }
            });
            try {
                await t.hover(912);
                await t.ready(2780710);
                assert.equal((await t.fixture()).requests.filter((request) => request.kind === 'search').length, 3);
                assert.match(await t.card.innerText(), /Action Roguelike/);
                assert.equal(
                    (await t.fixture()).requests.filter(
                        (request) => !['search', 'details', 'tags', 'reviews'].includes(request.kind)
                    ).length,
                    0
                );
                t.noErrors();
            } finally {
                await t.close();
            }
        });
        await run(
            site + ': failed lookup offers returned suggestions and switches to Wrong game after selection',
            async () => {
                const t = await setup(site, {
                    rows: [{ id: 914, appId: 999004, title: 'Portal Mystery' }],
                    config: { search: { 'portal mystery': [999004] } }
                });
                try {
                    await t.hover(914);
                    await t.page.waitForFunction(
                        () => document.querySelector('.steamHoverPreview')?.dataset.previewState === 'error'
                    );
                    assert.equal(await t.card.getByRole('button', { name: 'Retry lookup', exact: true }).count(), 0);
                    await t.card.getByRole('button', { name: 'Choose Steam game…', exact: true }).click();
                    const chooser = t.card.getByRole('group', { name: 'Choose a Steam game', exact: true });
                    await chooser.waitFor({ state: 'visible' });
                    assert.match(await chooser.innerText(), /Closest names:/);
                    assert.equal(await chooser.locator('.steamCandidateEmpty').isVisible(), false);
                    await chooser.getByRole('button', { name: 'Portal Quest', exact: true }).click();
                    await t.ready(999004);
                    assert.equal(await t.card.getByRole('button', { name: 'Wrong game?', exact: true }).count(), 1);
                    assert.equal(
                        await t.card.getByRole('button', { name: 'Choose Steam game…', exact: true }).count(),
                        0
                    );
                    assert.match(await t.card.locator('.steamTags').innerText(), /Adventure/);
                    t.noErrors();
                } finally {
                    await t.close();
                }
            }
        );
        await run(site + ': ambiguous failures show choices directly without a Wrong game toggle', async () => {
            const t = await setup(site, {
                rows: [{ id: 913, appId: 620, title: 'Portal 2' }],
                config: { search: { 'portal 2': [620, 999005] } }
            });
            try {
                await t.hover(913);
                const chooser = t.card.getByRole('group', { name: 'Choose a Steam game', exact: true });
                await chooser.waitFor({ state: 'visible' });
                assert.equal(await t.card.getByRole('button', { name: 'Wrong game?', exact: true }).count(), 0);
                assert.equal(await chooser.locator('[data-candidate-app-id]').count(), 2);
                const choose = t.card.getByRole('button', { name: 'Choose Steam game…', exact: true });
                assert.equal(await choose.getAttribute('aria-expanded'), 'true');
                await chooser.getByRole('button', { name: 'Cancel', exact: true }).click();
                assert.equal(await choose.getAttribute('aria-expanded'), 'false');
                await choose.click();
                await chooser.waitFor({ state: 'visible' });
                await chooser.locator('[data-candidate-app-id="620"]').click();
                await t.ready(620);
                assert.equal(await t.card.getByRole('button', { name: 'Wrong game?', exact: true }).count(), 1);
                t.noErrors();
            } finally {
                await t.close();
            }
        });
    }

    for (const site of Object.keys(products)) {
        await run(site + ': manual chooser ranks names even across a rejected sequel identity', async () => {
            const t = await setup(site, {
                rows: [{ id: 917, appId: 620, title: 'Portal 3' }],
                config: { search: { 'portal 3': [999001, 620, 999004] } }
            });
            try {
                await t.hover(917);
                await t.page.waitForFunction(
                    () => document.querySelector('.steamHoverPreview')?.dataset.previewState === 'error'
                );
                await t.card.getByRole('button', { name: 'Choose Steam game…', exact: true }).click();
                const chooser = t.card.getByRole('group', { name: 'Choose a Steam game', exact: true });
                assert.equal(await chooser.locator('[data-candidate-app-id]').first().innerText(), 'Portal 2');
                await chooser.getByRole('button', { name: 'Portal 2', exact: true }).click();
                await t.ready(620);
                assert.equal(await t.card.getByRole('button', { name: 'Wrong game?', exact: true }).count(), 1);
                t.noErrors();
            } finally {
                await t.close();
            }
        });
    }

    for (const site of Object.keys(products)) {
        await run(site + ': typed chooser search suggests titles and waits for explicit selection', async () => {
            const t = await setup(site, { rows: [{ id: 930, appId: 620, title: 'Unknown release title' }] });
            try {
                await t.hover(930);
                await t.card.getByRole('button', { name: 'Choose Steam game…', exact: true }).click();
                const chooser = t.card.getByRole('group', { name: 'Choose a Steam game', exact: true });
                const search = chooser.getByRole('searchbox', { name: 'Search by name', exact: true });
                assert.equal(await search.inputValue(), 'Unknown release title');
                await search.fill('Portal 2');
                await chooser.getByRole('button', { name: 'Portal 2', exact: true }).waitFor({ state: 'visible' });
                assert.equal(await t.card.getAttribute('data-preview-state'), 'error');
                assert.equal(
                    await chooser.getByRole('textbox', { name: 'Steam AppID or store URL', exact: true }).inputValue(),
                    ''
                );
                assert.equal((await t.fixture()).requests.filter((request) => request.kind === 'details').length, 0);
                await t.page.screenshot({ path: path.join(output, site + '-name-search.png') });
                await chooser.getByRole('button', { name: 'Portal 2', exact: true }).click();
                await t.ready(620);
                assert.equal(await t.card.getByRole('button', { name: 'Wrong game?', exact: true }).count(), 1);
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(site + ': Enter searches a successful card without submitting the empty AppID form', async () => {
            const t = await setup(site, { rows: [defaultRows[0]] });
            try {
                await t.hover(100);
                await t.ready(620);
                await t.card.getByRole('button', { name: 'Wrong game?', exact: true }).click();
                const chooser = t.card.getByRole('group', { name: 'Choose a Steam game', exact: true });
                const search = chooser.getByRole('searchbox', { name: 'Search by name', exact: true });
                await search.fill('Kerbal Space Program');
                await search.press('Enter');
                await chooser
                    .getByRole('button', { name: 'Kerbal Space Program', exact: true })
                    .waitFor({ state: 'visible' });
                assert.equal(await t.card.getAttribute('data-preview-app-id'), '620');
                assert.equal(
                    (await t.fixture()).requests.filter(
                        (request) => request.kind === 'search' && request.term === 'Kerbal Space Program'
                    ).length,
                    1
                );
                await chooser.getByRole('button', { name: 'Kerbal Space Program', exact: true }).click();
                await t.ready(220200);
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(site + ': new chooser text and closing the panel cancel obsolete searches', async () => {
            const t = await setup(site, {
                rows: [{ id: 931, appId: 620, title: 'Unknown release title' }],
                config: { delaysByTerm: { 'Portal 2': { search: 800 }, NoSuchOldTitle: { search: 800 } } }
            });
            try {
                await t.hover(931);
                await t.card.getByRole('button', { name: 'Choose Steam game…', exact: true }).click();
                const chooser = t.card.getByRole('group', { name: 'Choose a Steam game', exact: true });
                const search = chooser.getByRole('searchbox', { name: 'Search by name', exact: true });
                await search.fill('Portal 2');
                await search.press('Enter');
                await t.page.waitForFunction(() =>
                    window.__fixture.requests.some((request) => request.term === 'Portal 2')
                );
                await search.fill('Kerbal Space Program');
                await search.press('Enter');
                await chooser
                    .getByRole('button', { name: 'Kerbal Space Program', exact: true })
                    .waitFor({ state: 'visible' });
                assert.ok(
                    (await t.fixture()).requests.some((request) => request.term === 'Portal 2' && request.aborted)
                );
                assert.equal(await chooser.getByRole('button', { name: 'Portal 2', exact: true }).count(), 0);
                await search.fill('NoSuchOldTitle');
                await search.press('Enter');
                await t.page.waitForFunction(() =>
                    window.__fixture.requests.some((request) => request.term === 'NoSuchOldTitle')
                );
                await chooser.getByRole('button', { name: 'Cancel', exact: true }).click();
                assert.ok(
                    (await t.fixture()).requests.some((request) => request.term === 'NoSuchOldTitle' && request.aborted)
                );
                await t.card.getByRole('button', { name: 'Choose Steam game…', exact: true }).click();
                assert.equal(await search.inputValue(), 'Unknown release title');
                assert.equal(await chooser.locator('[data-candidate-app-id]').count(), 0);
                t.noErrors();
            } finally {
                await t.close();
            }
        });

        await run(site + ': chooser search distinguishes empty results, provider failure and retry', async () => {
            const t = await setup(site, { rows: [{ id: 932, appId: 620, title: 'Unknown release title' }] });
            try {
                await t.hover(932);
                await t.card.getByRole('button', { name: 'Choose Steam game…', exact: true }).click();
                const chooser = t.card.getByRole('group', { name: 'Choose a Steam game', exact: true });
                const search = chooser.getByRole('searchbox', { name: 'Search by name', exact: true });
                await search.fill('Nobody Has This Title');
                await search.press('Enter');
                await t.page.waitForFunction(() =>
                    /No suggestions found/.test(document.querySelector('.steamCandidateEmpty')?.textContent || '')
                );
                assert.equal(await chooser.locator('[data-candidate-app-id]').count(), 0);
                await t.page.evaluate(() => {
                    window.__fixture.config.invalidJson = { search: true, searchFallback: true };
                });
                await search.fill('Portal 2');
                await search.press('Enter');
                await t.page.waitForFunction(() =>
                    /Search could not load/.test(document.querySelector('.steamNameSearchStatus')?.textContent || '')
                );
                assert.equal(await chooser.getByRole('button', { name: 'Search', exact: true }).isEnabled(), true);
                await t.page.evaluate(() => {
                    window.__fixture.config.invalidJson = {};
                });
                await chooser.getByRole('button', { name: 'Search', exact: true }).click();
                await chooser.getByRole('button', { name: 'Portal 2', exact: true }).waitFor({ state: 'visible' });
                t.noErrors();
            } finally {
                await t.close();
            }
        });
    }

    await run('1337x: protected torrent titles remain eligible', async () => {
        const rows = [
            { id: 401, appId: 2215430, title: 'Ghost of Tsushima DIRECTORS CUT' },
            { id: 402, appId: 1462570, title: 'Lost in Random' },
            { id: 403, appId: 1929610, title: 'Demonologist' }
        ];
        const t = await setup('1337x', { rows });
        try {
            for (const row of rows) {
                await t.hover(row.id);
                await t.ready(row.appId);
                assert.doesNotMatch(await t.card.innerText(), /GENRE_ONLY_SENTINEL/);
            }
            t.noErrors();
        } finally {
            await t.close();
        }
    });

    await run('csrinru: game named Guide, AppID copy, and latest-post URL', async () => {
        const t = await setup('csrinru', { rows: [{ id: 501, appId: 303210, title: 'The Beginner’s Guide' }] });
        try {
            await t.hover(501);
            await t.ready(303210);
            await t.card.getByRole('button', { name: 'Copy Steam AppID', exact: true }).click();
            assert.equal((await t.fixture()).copied, '303210');
            const latest = await t.card
                .getByRole('link', { name: 'Open Latest Page', exact: true })
                .getAttribute('href');
            assert.ok(
                latest.includes('p=900501') || latest.includes('start=120'),
                `Latest action must select latest post or greatest offset: ${latest}`
            );
            assert.equal(await t.card.getByRole('link', { name: /Open SteamDB/ }).count(), 1);
            t.noErrors();
        } finally {
            await t.close();
        }
    });

    for (const site of Object.keys(products)) {
        await run(`${site}: original pipeline controlled comparison`, async () => {
            const t = await setup(site, { rows: [defaultRows[0]], baseline: true });
            try {
                await t.hover(100);
                await t.page.waitForFunction(() => window.__fixture.firstReady !== null, null, { timeout: 10000 });
                await t.page.waitForFunction(
                    () => window.__fixture.requests.some((x) => x.kind === 'tags' && x.end !== undefined),
                    null,
                    { timeout: 10000 }
                );
                const beforeRehover = await t.fixture();
                assert.equal(beforeRehover.firstReady.hasTags, false, 'Original card first renders its genre fallback');
                assert.equal(beforeRehover.firstTags, null, 'Original tag warmer does not update the open card');
                await t.page.mouse.move(1200, 760);
                await t.page.waitForFunction(
                    () => {
                        const x = document.querySelector('.steamHoverTip,.csrinruSteamHoverTip');
                        return !x || getComputedStyle(x).display === 'none';
                    },
                    null,
                    { timeout: 3000 }
                );
                await t.page.locator('[data-fixture-id="100"]').hover();
                await t.page.waitForFunction(() => window.__fixture.firstTags !== null, null, { timeout: 4000 });
                const observed = await t.fixture();
                report.benchmarks.push({
                    site,
                    scenario: 'original cold exact match; legacy reviews mocked valid',
                    firstCardMs: Math.round(observed.firstReady.at - observed.hoverAt),
                    firstCardHasActualTags: false,
                    requiresSecondHoverForVisibleTags: true,
                    timeToTagResponseMs: Math.round(
                        observed.requests.find((x) => x.kind === 'tags').end - observed.hoverAt
                    ),
                    timeToVisibleTagsIncludingSecondHoverMs: Math.round(observed.firstTags - observed.hoverAt),
                    counts: counts(observed.requests)
                });
                t.noErrors();
            } finally {
                await t.close();
            }
        });
    }
} finally {
    await browser.close();
    await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(
    `Browser checks: ${report.checks.length - failed} passed, ${failed} failed. Report: ${path.join(output, 'report.json')}`
);
if (failed) process.exitCode = 1;
