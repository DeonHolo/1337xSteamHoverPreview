# Development

The installable userscript at the repository root is generated. Edit source modules and run the build; normal users install only that one file. The build bundles a pinned local Fuse.js basic asset and its full license. It adds no remote code loader, package fetch or backend. Canonical maintainers can refresh the asset with npm run vendor:fuse after reviewing an intentional dependency upgrade, then verify it with npm run vendor:fuse -- --check before sync/build. Consumer builds use the checked-in asset and do not require npm Fuse or the canonical checkout.

## Commands

Use Node.js 24 (minimum 22). If the local workspace requires RTK, prefix these commands with `rtk proxy`.

```text
npm ci
npm run lint
npm test
npm run build
npm run check
npx playwright install chromium
npm run test:browser -- --no-baseline
```

Run npm run format to format source/config/tests and npm run format:check to verify formatting. After changing shared source, update the shared-core lock/snapshot and rebuild before check. CI verifies formatting, lint, unit tests, generated output, and isolated Chromium fixtures.

## Shared source

The CS.RIN repository owns src/core and the shared helper tests. The 1337x repository pins a build-time snapshot under vendor/steam-hover-core. Both keep site adapters under src/adapters and their original public installable filenames.

From the canonical CS.RIN checkout, run npm run sync-core after changing shared source/tests to record the version/hash manifest. From the 1337x checkout, run npm run sync-core -- --source="../csrinruSteamHoverPreview" to copy that exact core and its tests. Both commands write shared-core.lock.json. A normal consumer build reads only its checked-in snapshot and works without the canonical checkout. Run lint/tests/build/check in both repositories after shared changes.

## Browser checks and performance

Browser fixtures use mocked Steam/GM responses and synthetic site HTML in dedicated headless Chromium. They never open a real magnet or require a forum login. Use --no-baseline for an independent-checkout smoke test; with both projects available, the canonical runner can compare the old pipeline. test-results/ holds ignored reports, request counts, and screenshots. See tests/browser/README.md for options.

Time until actual Steam tags are visible is the main loading metric. Keep cold, preloaded, and persisted-cache cases distinct. Mocked comparisons establish scheduling behavior; live latency still varies with Steam, browser, and network conditions.

## Regression policy

Turn wrong-match reports into fixtures using the raw title, expected AppID, and observed candidate names/types. Validate DLC parents from relationship data. Preserve sequel/remake/VR identity. Never repair one title by accepting an unrelated base game or dropping arbitrary trailing words.

The first meaningful successful card includes actual tags and settles to an explicit unavailable/retry state if tags fail. Reviews/images must not delay tags. Preserve media DOM and focus during metadata refreshes. Keep dynamic content escaped, movies click-to-play, and site actions distinct.

Preserve the original typography, sizing, link colors and plain review row. Successful and failed previews must stop following the pointer after settling. Test eligibility on uploader/search rows with only Windows/PC icons, not just Games pages; use raw reported release titles rather than idealized names. The original-style browser comparison waits for image layout to settle.

Bug reports should include script/manager/browser versions, raw title, expected/actual Steam URL, and a redacted diagnostics export. Never attach cookies, session tokens, or magnet URIs.
