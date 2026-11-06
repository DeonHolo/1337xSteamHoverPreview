# Browser fixtures and controlled performance checks

The runner evaluates the generated standalone userscripts in headless Chromium against local 1337x/phpBB-like HTML. Every Steam response, image, clipboard write, userscript storage call, and menu is controlled. It does not open a torrent, launch a magnet handler, use a logged-in browser, or send fixture titles to live Steam.

Run after building both products, from the CS.RIN repository:

```powershell
rtk proxy node scripts/browser-check.mjs
```

Useful options:

- `--no-baseline`: check the current builds without historical comparison.
- `--baseline-only`: run the historical pipeline comparison only.
- `--site=csrinru` or `--site=1337x`: run one product, including in a single-repository CI checkout.

The runner reads `build.config.json` to find the local product, so a single-repository checkout works regardless of its folder name. From CS.RIN, the other product defaults to `../1337x`; from 1337x, it defaults to `../csrinruSteamHoverPreview`. Set `STEAM_HOVER_1337X_ROOT` or `STEAM_HOVER_CSRINRU_ROOT` to override the corresponding location. Install the pinned Playwright dependency and its Chromium browser through the package's normal setup before running.

Run `41715747022` at commit `d2bb994` failed because the runner looked for the local userscript under a sibling directory named `1337x`, instead of the actual GitHub checkout directory `1337xSteamHoverPreview`. Commit `2bf7c59` fixed this by selecting the local root from `build.config.json`. The run's Node action-runtime warning and Ubuntu runner-migration notice were not the cause. Re-running that historical commit retains its old path assumption; use a revision containing the fix.

The historical sources come from ignored snapshots in `test-results/baseline`, or pinned repository revisions `a93528e` (1337x) and `a0340f8` (CS.RIN). A shallow checkout without those revisions can use `--no-baseline`.

Results, actual-tag latency observations, request counts, and screenshots go into `test-results/browser`. The transport delays are declared in `fixtures.mjs`. The historical reviews endpoint deliberately receives a valid legacy JSON response to measure the pipeline independently of its retirement. The original first card's genre fallback and second-hover requirement are recorded explicitly.

These are controlled integration results. They do not measure internet latency, live-site layout changes, userscript-manager sandboxes, actual hidden-tab freezing/discarding, or the real forum's CSP and codec support. Hidden visibility is simulated to exercise scheduling policy; it does not defeat browser suspension.
