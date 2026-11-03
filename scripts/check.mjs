import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await readFile(path.join(root, 'build.config.json'), 'utf8'));
const files = [config.output];
async function walk(directory) {
    for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
        const relative = `${directory}/${entry.name}`;
        if (entry.isDirectory()) await walk(relative);
        else if (/\.m?js$/.test(entry.name)) files.push(relative);
    }
}
await walk('src');
await walk('scripts');
await walk('tests');
for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', path.join(root, file)], {
        encoding: 'utf8',
        windowsHide: true
    });
    if (result.status !== 0) throw new Error(`${file}: ${result.stderr}`);
}
const text = await readFile(path.join(root, config.output), 'utf8');
for (const [pattern, message] of [
    [/store\.steampowered\.com\/appreviews\//, 'Retired review endpoint'],
    [/onerror\s*=\s*["']/, 'Inline error handler'],
    [/Copy magnet/i, 'Unwanted magnet-copy feature'],
    [/tagsSource\s*:\s*['"]genres['"]/, 'Genre substitution']
])
    if (pattern.test(text)) throw new Error(`${message} remains in generated output.`);
const checkBuild = spawnSync(process.execPath, [path.join(root, 'scripts/build.mjs'), '--check'], {
    encoding: 'utf8',
    windowsHide: true
});
if (checkBuild.status !== 0) throw new Error(checkBuild.stderr || checkBuild.stdout);
console.log(`Syntax checked ${files.length} JavaScript modules/artifact; provider and build guards passed.`);
