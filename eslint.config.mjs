const globals = Object.fromEntries(
    [
        'globalThis',
        'window',
        'document',
        'navigator',
        'console',
        'URL',
        'URLSearchParams',
        'AbortController',
        'AbortSignal',
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'queueMicrotask',
        'performance',
        'fetch',
        'TextEncoder',
        'DOMParser',
        'Blob',
        'MutationObserver',
        'IntersectionObserver',
        'ResizeObserver',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'GM',
        'GM_xmlhttpRequest',
        'GM_getValue',
        'GM_setValue',
        'GM_addStyle',
        'GM_addValueChangeListener',
        'GM_registerMenuCommand',
        'process',
        'Buffer',
        'structuredClone',
        'getComputedStyle',
        'localStorage',
        'Event',
        'getComputedStyle',
        'localStorage',
        'Event'
    ].map((name) => [name, 'readonly'])
);
export default [
    {
        ignores: [
            'node_modules/**',
            'src/assets/fuse.basic.min.mjs',
            'test-results/**',
            'vendor/**',
            '*SteamHoverPreview*.js'
        ]
    },
    {
        files: ['src/**/*.mjs', 'scripts/**/*.mjs', 'tests/**/*.mjs'],
        languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals },
        rules: {
            'no-undef': 'error',
            'no-unreachable': 'error',
            'no-dupe-args': 'error',
            'no-dupe-keys': 'error',
            'constructor-super': 'error',
            'valid-typeof': 'error',
            'no-constant-binary-expression': 'error',
            'no-loss-of-precision': 'error',
            'no-unsafe-finally': 'error'
        }
    }
];
