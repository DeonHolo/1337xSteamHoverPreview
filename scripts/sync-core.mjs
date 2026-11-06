import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await readFile(path.join(root, 'build.config.json'), 'utf8'));
const argument = process.argv.find((value) => value.startsWith('--source='))?.slice(9);
const source = config.canonicalCore ? root : path.resolve(root, argument || '../csrinruSteamHoverPreview');
const check = process.argv.includes('--check');
const files = [];
async function collect(directory, filter = () => true) {
    for (const entry of await readdir(path.join(source, directory), { withFileTypes: true })) {
        const relative = `${directory}/${entry.name}`;
        if (entry.isDirectory()) await collect(relative, filter);
        else if (filter(relative)) files.push(relative);
    }
}
await collect('src/core', (file) => file.endsWith('.mjs'));
await collect('src/assets');
const sharedTests = new Set([
    'tests/steam-client.test.mjs',
    'tests/preview.test.mjs',
    'tests/site-utils.test.mjs',
    'tests/package-matching.test.mjs',
    'tests/title-regressions.test.mjs'
]);
await collect('tests', (file) => sharedTests.has(file) || file.includes('/fixtures/steam/'));
files.push('LICENSE');
const data = new Map(
    await Promise.all(files.map(async (file) => [file, await readFile(path.join(source, file), 'utf8')]))
);
const version = data.get('src/core/steam-client.mjs').match(/CORE_VERSION\s*=\s*['"]([^'"]+)/)?.[1];
const lock = {
    version,
    sourceRepository: 'https://github.com/DeonHolo/csrinruSteamHoverPreview',
    files: Object.fromEntries(
        [...data]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([file, text]) => [file, createHash('sha256').update(text).digest('hex')])
    )
};
if (config.canonicalCore) {
    if (check) {
        if ((await readFile(path.join(root, 'shared-core.lock.json'), 'utf8')) !== JSON.stringify(lock, null, 2) + '\n')
            throw new Error('Shared core lock is stale.');
    } else await writeFile(path.join(root, 'shared-core.lock.json'), JSON.stringify(lock, null, 2) + '\n');
} else {
    for (const [relative, text] of data) {
        const target = path.resolve(root, 'vendor/steam-hover-core', relative);
        if (!target.startsWith(path.resolve(root, 'vendor/steam-hover-core') + path.sep))
            throw new Error('Unsafe core path.');
        if (check) {
            if ((await readFile(target, 'utf8')) !== text)
                throw new Error(`Shared core snapshot is stale: ${relative}`);
        } else {
            await mkdir(path.dirname(target), { recursive: true });
            await writeFile(target, text);
        }
    }
    if (check) {
        if ((await readFile(path.join(root, 'shared-core.lock.json'), 'utf8')) !== JSON.stringify(lock, null, 2) + '\n')
            throw new Error('Shared core lock is stale.');
    } else await writeFile(path.join(root, 'shared-core.lock.json'), JSON.stringify(lock, null, 2) + '\n');
}
console.log(`${check ? 'Verified' : 'Recorded'} shared core ${version}: ${data.size} files.`);
