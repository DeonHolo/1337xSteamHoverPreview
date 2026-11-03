# Verification and development workflow

Current unpublished drafts, checked 4 November 2026: **1337x 5.00**, **CS.RIN 4.00**, shared core **1.0.5**, resolver **7**. Older patch labels below and in dated evidence refer to internal development iterations. The scripts have not been published or installed into the user browser by this task.

## Checks

[Current title-search validation](name-search-verification-2026-11-04.json) supersedes earlier release/check totals. [Title search](Search-by-Name.md) adds typing/Enter, no implicit selection, cancellation and error/retry coverage on both adapters. [Live title-search result](live-name-search-2026-11-04.json) selected From Space 1502190 and fetched real tags.

[Current draft verification](draft-verification-2026-11-04.json) supersedes earlier build/count/version totals. New cases cover general punctuation (MeowPower), localized API misses (Idle Demon Lord II), safe website-search parsing and closest-name manual suggestions that remain available after automatic sequel rejection. [Live shared-engine results](live-draft-matching-2026-11-04.json) resolved both reported games with actual tags/reviews. [Plain-language explanation](Matching-Explained.md).

Patch results: **68 Node checks for CS.RIN, 65 for 1337x, and 57 browser checks passed**, with no failures. The independent CI mode runs 55 browser checks; two additional local cases compare the original loading pipeline. ESLint, formatting, syntax, and generated-output checks passed in both repositories. Shared tests are intentionally run in each repository; the totals include repeated shared engine scenarios.

New regression cases use the reported raw release titles and captured Steam candidates, check trademark/edition/update normalization, and verify that resolver migration drops old failures while preserving app data. Node tests also cover protected cleaners and Unicode, confidence/identity rejection, DLC parents/missing/cyclic/non-game parents, the modern review envelope and zero/error states, tag failures, redirects, AppID deduplication, independent freshness, cancellation, safe cache clearing, cross-tab merge/reset, source-specific corrections, field retries, scheduler priority/cooldown, safe rendering, media normalization, and both adapters.

The [current chooser report](chooser-verification-2026-11-04.json) records these results. It includes no-candidate manual recovery, suggested-candidate selection, label switching, and ambiguity cancel/reopen checks. The [matching patch report](matching-verification-2026-11-04.json) retains the previous results; the [previous patch report](regression-verification-2026-11-04.json) remains dated evidence. New cases cover punctuation-sensitive Steam lookup, failed-query cache separation, bundled Fuse typo handling with identity guards, failed-card action spacing/removal of Wrong game?, and direct ambiguity choices. Browser regressions compare original typography and sizing, assert that reviews remain plain text and both actions remain blue, verify failure-card locking/clickability, and exercise a Windows-icon uploader page without other Games hints.

The isolated Chromium suite exercises both generated userscripts: real tags in first successful card, review independence, reload caching, DLC links, repeated-listing reuse, tag/review retries preserving selection, rapid hover changes, zero-review state, keyboard/theatre focus, corrections across reload, escaped content, already-loaded hidden-tab bootstrap, persistent settings, protected torrent titles, and forum AppID/latest actions. The legacy baseline receives valid mocked old reviews, so the comparison does not rely on the retired endpoint being broken.

Run the exact commands in [CONTRIBUTING](../../CONTRIBUTING.md). Reports/screenshots go to ignored test-results/. Build checks verify both standalone artifacts match source; pinned core hashes and identical shared source prevent manual drift.

## Controlled loading comparison

[Initial result summary](verification-2026-11-04.json) retains the pre-patch check counts and timing observations as dated evidence. The patch result above supersedes its release/check totals. The harness uses synthetic listings and deterministic mocked Steam responses in headless Chromium. It measures tags becoming visible, not image completion. The old script rendered genres first and required another hover after tags finished; the new script included tags on its initial successful render.

For a confident exact match, the old controlled case made nine provider requests: search, failed batch, five candidate details, reviews, and tags. The new case made four: search, one detail, tags, and independently fetched reviews. Those counts explain the improvement; they are not a promise that every ambiguous/DLC lookup will use four requests.

Cached real tags render immediately through the peek path, with no tags request before display. Mocked timing is a regression baseline, not representative live-network p95 performance.

| Controlled case | 1337x | CS.RIN |
| --- | --- | --- |
| New cold: actual tags visible | 521 ms | 505 ms |
| Old cold: tags visible including necessary second hover | 1,651 ms | 1,636 ms |
| New persisted tags: visible | 103 ms | 51 ms |
| Provider requests, new vs old exact-match case | 4 vs 9 | 4 vs 9 |

These figures belong to the controlled fixture run above. The second-hover timing includes that harness interaction and must not be interpreted as a fixed server-latency saving.

## Live Steam smoke test

The implemented shared engine was also run with real Steam responses and Chromium DOMParser. The read-only check searched Ecstatica, validated its app, fetched actual tags and the new review summary, then searched the Elden Ring DLC and resolved its verified parent. [Recorded live results](live-smoke-2026-11-04.json).

- Ecstatica resolved to 4834840 and returned Exploration, Action, Action-Adventure, 3D, Stylized plus 44 positive reviews.
- ELDEN RING Shadow of the Erdtree resolved through DLC 2778580 to base 1245620; the tags/reviews came from ELDEN RING.
- The two cold tags-ready provider runs were about 1.35 s and 1.28 s on that connection; cached tag lookup was at most 0.2 ms. These are provider measurements, excluding user hover intent, UI paint, and image downloads. They are not an old-vs-new live benchmark.

The live report timestamp is UTC; its local review date is 4 November in Asia/Singapore. Review counts and Steam responses naturally change.

## Reported-title live check

[Recorded patch smoke test](live-reported-titles-2026-11-04.json) runs the shared engine against live Steam for the reported Hunting Simulator 3 commercial edition and three other raw release names. All four resolved, returned actual tags, and returned reviews. Hunting Simulator 3 resolved to 2482760; Unbroken to 2377020; House Flipper Remastered Collection to 3710840; Resonance of Fate followed the enhanced DLC 4996080 to verified parent 645730. Cold tags-ready provider times were approximately 0.86–1.19 seconds on that connection, excluding UI/image work. These are samples, not an all-title latency guarantee.

The initial test fixtures all provided Games-page evidence and missed the Windows-icon uploader layout. The new uploader fixture removes those hints. Matching tests now retain the full raw reported title instead of testing only a cleaned ideal name. See the [regression explanation](Regressions-2026-11-04.md).

## Manual recovery control

[Current recovery behavior](Match-Recovery.md) replaces failed Retry lookup with Choose Steam game…. Opening it reuses lookup results; selecting a suggestion or entering a Steam AppID/URL validates and saves the correction, then displays Wrong game? on the successful card. The resolver remains version 4, preserving cached data.

## Asgard and local fuzzy-text check

The [new matching notes](Fuzzy-Matching-2026-11-04.md) explain the reproduced empty API result for the dash-separated title. [Live engine evidence](live-asgard-fuse-2026-11-04.json) resolves both the reported raw title (score 100) and a deliberate Survivers spelling error (score 94) to 2780710, with actual tags/reviews. The typo check reuses cached per-AppID fields and is not an independent cold benchmark. Fuse itself makes no network request.

## Practical limits

Synthetic browser fixtures do not prove every current live mirror/forum layout, current CSP, userscript-manager injection mode, clipboard permission, or video codec/fullscreen combination. A logged-in forum session, actual torrent/magnet launch, native Dark Reader integration, and browser freezing/discarding were not exercised. Hidden-state scheduling is tested with simulated document visibility. A frozen/discarded tab cannot be made to run by this userscript.

The scripts preserve CSP-aware media fallbacks and support legacy GM APIs plus modern promise-based storage/transport when provided. Tampermonkey/Violentmonkey and modern Greasemonkey should still be checked on the real browser/site combination before distribution claims are broadened.

## Human and AI maintenance

Read AGENTS.md, CONTRIBUTING.md, the current wiki, and the architecture decision before changing behavior. The dated audit is historical context. Canonical providers/resolver/scheduler/cache/UI/runtime belong in CS.RIN src/core; site adapters remain separate. Do not edit generated root userscripts or the consumer vendor snapshot by hand.

Capture raw-title mistakes as fixtures before altering cleanup or scoring. Never drop sequel identity or choose a random game merely to force a result. Test both adapters for shared changes, regenerate the artifacts, and record shared-core hashes. Preserve original inherited typography, sizing, action colors, plain reviews and settled-card pointer locking. Preserve actual-tag first render, explicit video initiation, escaped dynamic data, independent review updates, and late-response/focus guards.

Diagnostics and the bug template support actionable reports without private session URLs or magnet data. Runtime LLM matching is not used; deterministic rules, official relationships, and saved corrections keep the hover path testable and avoid an extra service request.
