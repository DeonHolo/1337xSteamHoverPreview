import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSteamAppLinks, threadTagColor, createSourcePageTools } from '../src/core/site-utils.mjs';

test('extracts only explicit app links and deduplicates IDs within the selected region', () => {
    const values = [
        'https://store.steampowered.com/app/620/Portal_2/',
        'https://store.steampowered.com/app/620/',
        'https://store.steampowered.com/sub/620/',
        'https://store.steampowered.com.evil.example/app/620/',
        'javascript:alert(1)',
        '/forum/viewtopic.php?t=620',
        'https://store.steampowered.com/app/4294967296/'
    ];
    const root = {
        querySelectorAll: () => values.map((href) => ({ getAttribute: () => href, textContent: 'Portal 2' }))
    };
    assert.deepEqual(extractSteamAppLinks(root), [{ appId: 620, name: 'Portal 2' }]);
});

test('thread colors are deterministic, bounded and readable on both card backgrounds', () => {
    const luminance = (hex) => {
        const channels = hex
            .match(/[a-f\d]{2}/gi)
            .map((c) => Number.parseInt(c, 16) / 255)
            .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    for (const theme of ['dark', 'light'])
        for (const text of ['[CRACKED]', '[Early Access]', '[NOT CRACKED / HYPERVISOR]', '[测试]']) {
            const color = threadTagColor(text, theme);
            assert.match(color, /^#[a-f\d]{6}$/i);
            assert.equal(threadTagColor(text, theme), color);
            const bg = luminance(theme === 'dark' ? '#1c1c1c' : '#f0f0f0');
            const fg = luminance(color);
            assert.ok((Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05) >= 4.5);
        }
});

test('source fetch validates same origin, shares concurrent requests and retries after invalidation', async () => {
    let calls = 0;
    const win = {
        location: { href: 'https://1337x.to/Games/1/', origin: 'https://1337x.to' },
        DOMParser: class {
            parseFromString(html) {
                return { html };
            }
        },
        fetch: async (url) => {
            calls++;
            return {
                ok: true,
                status: 200,
                url,
                headers: { get: () => 'text/html' },
                text: async () => '<p>source</p>'
            };
        }
    };
    const tools = createSourcePageTools({ window: win, document: {} });
    assert.throws(() => tools.fetchDocument('https://outside.example/torrent/1'), /current site/);
    const [a, b] = await Promise.all([tools.fetchDocument('/torrent/1/'), tools.fetchDocument('/torrent/1/')]);
    assert.equal(calls, 1);
    assert.equal(a, b);
    await tools.fetchDocument('/torrent/1/');
    assert.equal(calls, 1);
    tools.invalidate('/torrent/1/');
    await tools.fetchDocument('/torrent/1/');
    assert.equal(calls, 2);
});
