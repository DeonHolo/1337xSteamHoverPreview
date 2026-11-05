/** Browser wiring shared by both standalone releases. */
export function startSteamHover({
    createClient,
    mountPreview,
    createAdapter,
    cleanTitle,
    sourceToolFactory,
    colorTag,
    window: win = window,
    document: doc = document
}) {
    const id = createAdapter.siteId;
    const sourceTools = sourceToolFactory({ window: win, document: doc });
    const modern = typeof GM === 'object' ? GM : {};
    const storage = {
        getValue: typeof GM_getValue === 'function' ? GM_getValue : modern.getValue?.bind(modern),
        setValue: typeof GM_setValue === 'function' ? GM_setValue : modern.setValue?.bind(modern),
        addValueChangeListener:
            typeof GM_addValueChangeListener === 'function'
                ? GM_addValueChangeListener
                : modern.addValueChangeListener?.bind(modern)
    };
    const gmRequest = (options) => {
        if (typeof GM_xmlhttpRequest === 'function') return GM_xmlhttpRequest(options);
        if (!modern.xmlHttpRequest)
            throw new Error('A userscript manager with cross-origin request support is required.');
        let settled = false;
        const opts = { ...options };
        for (const event of ['onload', 'onerror', 'ontimeout', 'onabort']) {
            opts[event] = (result) => {
                if (settled) return;
                settled = true;
                options[event]?.(result);
            };
        }
        const request = modern.xmlHttpRequest(opts);
        request?.then?.(opts.onload, opts.onerror);
        return { abort: () => request?.abort?.() };
    };
    if (!storage.getValue || !storage.setValue) throw new Error('Userscript storage is unavailable.');
    let adapter;
    const client = createClient({
        ...storage,
        gmRequest,
        DOMParser: win.DOMParser,
        isHidden: () => doc.hidden,
        storageKey: `${id}SteamHoverData_v3`,
        settingsKey: `${id}SteamHoverSettings_v1`,
        findSourceAppIds: (source) => adapter?.findAppIds?.(source)
    });
    const theme = () => {
        const chosen = client.getSettings().theme;
        return chosen === 'light' || chosen === 'dark' ? chosen : id === '1337x' ? 'light' : 'dark';
    };
    adapter = createAdapter({ window: win, document: doc, cleanTitle, sourceTools, colorTag, getTheme: theme });
    const view = mountPreview({
        client,
        adapter,
        window: win,
        document: doc,
        addStyle: typeof GM_addStyle === 'function' ? GM_addStyle : undefined
    });
    let disposed = false;
    let initialized = false;
    let workGeneration = 0;
    let scanTimer = null;
    let pumpTimer = null;
    let observer = null;
    const queue = new Map();
    const active = new Map();
    const done = new Set();
    const observed = new WeakSet();

    function enqueue(link, priority = 'nearby') {
        if (disposed || client.getSettings().preload === 'hover') return;
        const source = adapter.getSource(link);
        if (!source || done.has(source.key) || active.has(source.key)) return;
        const old = queue.get(source.key);
        if (!old || priority === 'nearby') queue.set(source.key, { source, priority });
        schedulePump();
    }
    function schedulePump(delay = 0) {
        if (disposed || pumpTimer !== null) return;
        pumpTimer = win.setTimeout(() => {
            pumpTimer = null;
            pump();
        }, delay);
    }
    function pump() {
        if (disposed || client.getSettings().preload === 'hover') return;
        // Leave transport capacity available for an active hover. Hidden tabs warm serially.
        const limit = doc.hidden ? 1 : 2;
        const sorted = [...queue.entries()].sort(
            (a, b) => Number(b[1].priority === 'nearby') - Number(a[1].priority === 'nearby')
        );
        while (active.size < limit && sorted.length) {
            const [key, job] = sorted.shift();
            queue.delete(key);
            const controller = new AbortController();
            const generation = workGeneration;
            active.set(key, controller);
            client
                .loadPreview(job.source, { priority: job.priority, signal: controller.signal })
                .then(() => {
                    if (generation === workGeneration) done.add(key);
                })
                .catch((error) => {
                    if (generation === workGeneration && error.code !== 'ABORTED') done.add(key);
                })
                .finally(() => {
                    if (active.get(key) === controller) active.delete(key);
                    if (generation === workGeneration) schedulePump(doc.hidden ? 350 : 40);
                });
        }
    }
    function scan() {
        scanTimer = null;
        if (disposed || client.getSettings().preload === 'hover') return;
        const all = client.getSettings().preload === 'all';
        for (const link of adapter.getLinks()) {
            if (observer && !observed.has(link)) {
                observer.observe(link);
                observed.add(link);
            }
            const rect = link.getBoundingClientRect();
            const nearby = rect.bottom >= -600 && rect.top <= win.innerHeight + 600;
            if (nearby || all) enqueue(link, nearby ? 'nearby' : 'background');
        }
    }
    function scheduleScan() {
        if (disposed || scanTimer !== null) return;
        scanTimer = win.setTimeout(scan, 100);
    }
    function resetPreloads() {
        workGeneration++;
        for (const controller of active.values()) controller.abort();
        active.clear();
        queue.clear();
        done.clear();
        scheduleScan();
    }
    const unsubscribe = client.subscribe((event) => {
        if (event.kind === 'clear') {
            view.hide();
            resetPreloads();
        }
        if (event.kind === 'settings') {
            view.refreshSettings();
            resetPreloads();
        }
    });
    const visibility = () => {
        client.onVisibilityChange?.();
        scheduleScan();
        schedulePump();
    };
    function initialize() {
        if (initialized || disposed) return;
        initialized = true;
        if (typeof win.IntersectionObserver === 'function') {
            observer = new win.IntersectionObserver(
                (entries) => {
                    for (const entry of entries) if (entry.isIntersecting) enqueue(entry.target, 'nearby');
                },
                { rootMargin: '600px 0px' }
            );
        }
        scan();
        doc.addEventListener('visibilitychange', visibility);
        win.addEventListener('scroll', scheduleScan, { passive: true });
        win.addEventListener('resize', scheduleScan, { passive: true });
        mutations.observe(doc.body, { childList: true, subtree: true });
    }
    const mutations = new win.MutationObserver((records) => {
        if (
            records.some((record) =>
                [...record.addedNodes, ...record.removedNodes].some(
                    (node) =>
                        node.nodeType === 1 &&
                        (node.matches?.(adapter.selector) || node.querySelector?.(adapter.selector))
                )
            )
        )
            scheduleScan();
    });
    Promise.resolve(client.ready)
        .then(() => {
            if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', initialize, { once: true });
            else if (typeof win.requestIdleCallback === 'function')
                win.requestIdleCallback(initialize, { timeout: 1000 });
            else win.setTimeout(initialize, 0);
        })
        .catch((error) => {
            if (client.getSettings().debug) console.error('[Steam Hover] Initialization failed:', error.message);
        });

    const register =
        typeof GM_registerMenuCommand === 'function'
            ? GM_registerMenuCommand
            : modern.registerMenuCommand?.bind(modern);
    const clearCache = async () => {
        await client.clear();
        view.hide();
        resetPreloads();
    };
    if (id === '1337x') win.clearSteamHoverCache = clearCache;
    else win.clearCsrinruSteamHoverCache = clearCache;
    register?.(`${adapter.name}: Settings`, () => openPanel('settings'));
    register?.('Clear cached Steam data', clearCache);
    register?.('Export match corrections', () => openPanel('export'));
    register?.('Import match corrections', () => openPanel('import'));
    register?.('Steam Hover diagnostics', () => openPanel('debug'));
    let panel = null;
    let panelTrigger = null;
    function openPanel(mode) {
        view.hide();
        if (panel) panel.close();
        panelTrigger = doc.activeElement;
        panel = doc.createElement('dialog');
        panel.className = 'steamHoverSettingsDialog';
        panel.setAttribute('aria-labelledby', 'steamHoverSettingsTitle');
        panel.style.cssText = `background:${theme() === 'dark' ? '#1c1c1c' : '#f0f0f0'};color:${theme() === 'dark' ? '#eee' : '#111'};border:1px solid #777;border-radius:8px;padding:20px;max-width:min(480px,90vw);max-height:85vh;overflow:auto;font:14px/1.5 system-ui;`;
        const title = doc.createElement('h2');
        title.id = 'steamHoverSettingsTitle';
        title.style.cssText = 'font-size:18px;margin:0 0 12px';
        title.textContent =
            mode === 'settings'
                ? 'Steam Hover settings'
                : mode === 'debug'
                  ? 'Steam Hover diagnostics'
                  : mode === 'import'
                    ? 'Import match corrections'
                    : 'Export match corrections';
        panel.appendChild(title);
        const status = doc.createElement('p');
        status.setAttribute('role', 'status');
        status.style.cssText = 'overflow-wrap:anywhere';
        const close = doc.createElement('button');
        close.type = 'button';
        close.textContent = 'Close';
        close.style.cssText = 'margin:12px 8px 0 0';
        close.addEventListener('click', () => panel?.close());
        if (mode === 'settings') {
            const values = client.getSettings();
            const fields = {};
            for (const [name, label, options] of [
                [
                    'preload',
                    'Preload',
                    [
                        ['nearby', 'Nearby rows'],
                        ['all', 'Entire page'],
                        ['hover', 'On hover only']
                    ]
                ],
                [
                    'theme',
                    'Theme',
                    [
                        ['site', 'Site default'],
                        ['light', 'Light'],
                        ['dark', 'Dark']
                    ]
                ],
                [
                    'reviewPurchaseType',
                    'Review purchases',
                    [
                        ['1', 'All purchases'],
                        ['0', 'Steam purchases']
                    ]
                ]
            ]) {
                const wrapper = doc.createElement('label');
                wrapper.style.cssText = 'display:block;margin:12px 0';
                wrapper.append(doc.createTextNode(`${label} `));
                const select = doc.createElement('select');
                select.name = name;
                select.setAttribute('aria-label', label);
                for (const [value, text] of options) {
                    const option = doc.createElement('option');
                    option.value = value;
                    option.textContent = text;
                    select.appendChild(option);
                }
                select.value = String(values[name]);
                wrapper.appendChild(select);
                panel.appendChild(wrapper);
                fields[name] = select;
            }
            const debugLabel = doc.createElement('label');
            debugLabel.style.display = 'block';
            const debug = doc.createElement('input');
            debug.type = 'checkbox';
            debug.checked = Boolean(values.debug);
            debugLabel.append(debug, doc.createTextNode(' Enable diagnostic logging'));
            panel.appendChild(debugLabel);
            const explanation = doc.createElement('p');
            explanation.textContent =
                'Nearby rows and Entire page also warm real Steam tags while the tab is hidden, at a slower bounded rate. Browser suspension can pause work. On hover only disables automatic warming.';
            panel.appendChild(explanation);
            const save = doc.createElement('button');
            save.type = 'button';
            save.textContent = 'Save settings';
            save.style.marginRight = '8px';
            save.addEventListener('click', async () => {
                await client.updateSettings({
                    preload: fields.preload.value,
                    theme: fields.theme.value,
                    debug: debug.checked,
                    reviewPurchaseType: Number(fields.reviewPurchaseType.value)
                });
                view.refreshSettings();
                resetPreloads();
                panel?.close();
            });
            panel.appendChild(save);
        } else {
            const area = doc.createElement('textarea');
            area.setAttribute(
                'aria-label',
                mode === 'import'
                    ? 'Match corrections JSON'
                    : mode === 'export'
                      ? 'Exported match corrections JSON'
                      : 'Diagnostic report JSON'
            );
            area.style.cssText =
                'display:block;width:100%;box-sizing:border-box;min-height:220px;font:12px/1.4 monospace;';
            area.readOnly = mode !== 'import';
            if (mode === 'export') area.value = JSON.stringify(client.exportCorrections(), null, 2);
            if (mode === 'debug')
                area.value = JSON.stringify(
                    {
                        ...client.getDebugReport(),
                        preload: { hidden: doc.hidden, active: active.size, queued: queue.size, warmed: done.size }
                    },
                    null,
                    2
                );
            panel.appendChild(area);
            if (mode === 'import') {
                const submit = doc.createElement('button');
                submit.type = 'button';
                submit.textContent = 'Import corrections';
                submit.addEventListener('click', async () => {
                    try {
                        await client.importCorrections(JSON.parse(area.value));
                        resetPreloads();
                        status.textContent = 'Corrections imported. They are validated against Steam when used.';
                    } catch (error) {
                        status.textContent = `Import failed: ${error.message}`;
                    }
                });
                panel.appendChild(submit);
            } else {
                const download = doc.createElement('button');
                download.type = 'button';
                download.textContent = 'Download JSON';
                download.addEventListener('click', () => {
                    const url = win.URL.createObjectURL(new win.Blob([area.value], { type: 'application/json' }));
                    const anchor = doc.createElement('a');
                    anchor.href = url;
                    anchor.download = `${id}-steam-hover-${mode}.json`;
                    doc.body.appendChild(anchor);
                    anchor.click();
                    anchor.remove();
                    win.setTimeout(() => win.URL.revokeObjectURL(url), 1000);
                });
                panel.appendChild(download);
            }
        }
        panel.append(status, close);
        const ownPanel = panel;
        panel.addEventListener('close', () => {
            ownPanel.remove();
            if (panel === ownPanel) panel = null;
            if (panelTrigger?.isConnected) panelTrigger.focus({ preventScroll: true });
        });
        doc.body.appendChild(panel);
        if (typeof panel.showModal === 'function') panel.showModal();
        else {
            panel.setAttribute('open', '');
            panel.setAttribute('role', 'dialog');
        }
    }

    return {
        client,
        adapter,
        view,
        scan,
        dispose() {
            disposed = true;
            workGeneration++;
            for (const controller of active.values()) controller.abort();
            active.clear();
            queue.clear();
            if (scanTimer !== null) win.clearTimeout(scanTimer);
            if (pumpTimer !== null) win.clearTimeout(pumpTimer);
            observer?.disconnect();
            mutations.disconnect();
            unsubscribe();
            view.dispose();
            client.dispose?.();
            doc.removeEventListener('visibilitychange', visibility);
            doc.removeEventListener('DOMContentLoaded', initialize);
            win.removeEventListener('scroll', scheduleScan);
            win.removeEventListener('resize', scheduleScan);
            panel?.close();
        }
    };
}
