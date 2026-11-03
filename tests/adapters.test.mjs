import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidMagnet } from '../src/adapters/1337x.mjs';

test('magnet action accepts valid torrent identity and rejects generic URLs or malformed hashes', () => {
    assert.equal(isValidMagnet(`magnet:?xt=urn:btih:${'a'.repeat(40)}&dn=Game`), true);
    assert.equal(isValidMagnet(`magnet:?xt=urn:btih:${'A'.repeat(32)}`), true);
    assert.equal(isValidMagnet('magnet:?xt=urn:btmh:1220' + 'a'.repeat(64)), true);
    assert.equal(isValidMagnet('https://example.com/torrent'), false);
    assert.equal(isValidMagnet('javascript:alert(1)'), false);
    assert.equal(isValidMagnet('magnet:?dn=NoIdentity'), false);
    assert.equal(isValidMagnet('magnet:?xt=urn:btih:short'), false);
});
