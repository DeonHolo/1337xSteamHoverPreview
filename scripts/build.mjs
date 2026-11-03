import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await readFile(path.join(root, 'build.config.json'), 'utf8'));
const fusePath = path.posix.join(config.corePath, '../assets/fuse.basic.min.mjs');
const inputs = [
    'src/userscript-header.txt',
    fusePath,
    ...['steam-client.mjs', 'site-utils.mjs', 'preview.mjs', 'runtime.mjs'].map((file) => config.corePath + '/' + file),
    config.adapter
];
const contents = await Promise.all(inputs.map((file) => readFile(path.join(root, file), 'utf8')));
const digest = createHash('sha256').update(contents.join('\n')).digest('hex');
const version = contents[2].match(/CORE_VERSION\s*=\s*['"]([^'"]+)/)?.[1];
if (!version) throw new Error('Shared core version was not found.');
if (!config.canonicalCore) {
    const lock = JSON.parse(await readFile(path.join(root, 'shared-core.lock.json'), 'utf8'));
    for (let i = 1; i < inputs.length - 1; i++) {
        const relative = inputs[i].replace(/^vendor\/steam-hover-core\//, '');
        if (lock.files[relative] !== createHash('sha256').update(contents[i]).digest('hex'))
            throw new Error('Pinned core file changed: ' + relative + '. Run sync-core from the canonical source.');
    }
}
function standalone(source, name) {
    if (name === fusePath) {
        const exported = source.match(/export\s*\{\s*([\w$]+)\s+as\s+default\s*\}\s*;?\s*$/);
        if (!exported) throw new Error('Unsupported Fuse.js asset export; review the pinned upstream build.');
        const body = source.slice(0, exported.index);
        return (
            '// Source: ' +
            name +
            '\nconst SteamTextFuse = (() => {\n' +
            body +
            '\nreturn ' +
            exported[1] +
            ';\n})();\n'
        );
    }
    if (name.endsWith('/steam-client.mjs'))
        source = source.replace(/^import SteamTextFuse from '\.\.\/assets\/fuse\.basic\.min\.mjs';\r?\n/m, '');
    if (/^\s*import\s/m.test(source)) throw new Error('Unbundled runtime import in ' + name);
    const output = source
        .replace(/^export\s+(?=(?:async\s+)?(?:function|class|const|let|var)\b)/gm, '')
        .replace(/^export\s*\{[^}]*\};?\s*$/gm, '');
    if (/^\s*export\s/m.test(output)) throw new Error('Unsupported export in ' + name);
    return '// Source: ' + name + '\n' + output.trim() + '\n';
}
const body = contents
    .slice(1)
    .map((source, index) => standalone(source, inputs[index + 1]))
    .join('\n');
const entry =
    config.factory +
    '.siteId = ' +
    JSON.stringify(config.site) +
    ';\nstartSteamHover({ createClient: createSteamClient, mountPreview: mountSteamHoverPreview, createAdapter: ' +
    config.factory +
    ', cleanTitle: ' +
    config.cleaner +
    ', sourceToolFactory: createSourcePageTools, colorTag: threadTagColor });';
const output =
    contents[0].trim() +
    '\n\n// Generated from source; edit src/ and rebuild. Shared core ' +
    version +
    '.\n// Build SHA-256: ' +
    digest +
    "\n(() => {\n'use strict';\n\n" +
    body +
    '\n' +
    entry +
    '\n})();\n';
new vm.Script(output, { filename: config.output });
if (process.argv.includes('--check')) {
    if ((await readFile(path.join(root, config.output), 'utf8')) !== output)
        throw new Error(config.output + ' is stale. Run npm run build.');
    console.log(config.output + ': generated output matches source (core ' + version + ').');
} else {
    await writeFile(path.join(root, config.output), output);
    console.log('Built ' + config.output + ' (core ' + version + ', ' + Buffer.byteLength(output) + ' bytes).');
}
