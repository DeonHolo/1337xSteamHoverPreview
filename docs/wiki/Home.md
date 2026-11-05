# 1337x Steam Hover Preview wiki

Current public version **5.02**, shared core **1.0.8**. Install the standalone [1337xSteamHoverPreview.js](../../1337xSteamHoverPreview.js) with a userscript manager; source modules and Node packages are development-only.

- [Search by name inside the chooser](Search-by-Name.md)
- [Why matching failed and what changed](Matching-Explained.md)
- [Markdown release checklist](../../RELEASE_CHECKLIST.md)
- [Greasy Fork changelog](../../GREASYFORK_CHANGELOG.md)
- [Choose a Steam game after a failed lookup](Match-Recovery.md)
- [Local fuzzy matching and latest fixes](Fuzzy-Matching-2026-11-04.md)
- [Reported regressions and fixes](Regressions-2026-11-04.md)
- [Delivered shared upgrades](Shared-Upgrade-Plan.md)
- [Architecture and 1337x behavior](Architecture-and-Site-Review.md)
- [Verification, timing, and AI workflow](Verification-and-AI-Workflow.md)
- [Historical audit](Review-Findings-2026-11-03.md)
- [Development commands](../../CONTRIBUTING.md)

[Title identity and verified aliases](Title-Identity-and-Aliases.md) explains the Disco Elysium and Skyrim matching fixes.

## What appears on hover

The first meaningful successful card contains actual Steam tags. There is no genre fallback. A truly cold game shows a compact loading state; unavailable tags settle explicitly with Retry tags. Reviews update independently, in the original plain Rating row (stars, Steam category and count) or a clear zero/error state; the review summary is not a link. Images and trailers do not hold back tags.

Use the media arrows/thumbnails, click a trailer to start playback, and expand screenshots/trailers into theatre. Screenshot theatre stays within screenshots; after leaving a launched trailer for screenshots, navigation remains within screenshots. Escape closes theatre and restores its trigger. Alt+ArrowDown enters a keyboard-opened preview.

The card retains Open on Steam and Magnet Download, including theatre actions. Magnet pages are retrieved only when the action is clicked, with retry/source-page recovery if unavailable. The native light palette and dark theme option remain supported.

Long titles wrap beside the small correction button. Open on Steam stays at the bottom-left; failed cards keep Choose Steam game… below their actions. The scripts remain separate installations with independent saved corrections.

## Background loading and cache

The userscript menu offers Nearby rows (default), Entire page, or On hover only. The first two warm actual tags even in a runnable hidden tab, with one hidden request worker. Nearby rows covers the current viewport and roughly 600 px around it. A sleeping/frozen/discarded/closed tab stops or pauses work; cached records already saved persist. Independently installed site scripts have separate storage.

Real tags are fresh for 24 hours and can be shown stale for up to 7 days while refreshing. Reviews refresh after 15 minutes for new/unknown/upcoming releases and 3 hours for established games. Cached genres from the old versions are not migrated into tag data.

## Correct a match or diagnose a problem

On a successfully matched card, use Wrong game? at the right of the title to choose a candidate or enter the correct Steam AppID/store URL. Corrections are validated, source-specific, persistent, resettable, and exportable/importable through the manager menu. Verified DLC parents lead to the main game consistently.

Failed finds replace Retry lookup with Choose Steam game…. It opens available suggestions or manual Steam AppID/URL entry, with explicit guidance when no suggestions exist. Successful matches retain Wrong game?. Ambiguous results open candidate choices directly.

Use the manager menu for settings, Clear cached Steam data, match correction import/export, or diagnostics. Clearing data preserves intentional corrections; use Reset match to remove one. A Steam provider outage is shown separately from no reviews/no confident match.

Eligibility uses explicit Games categories/icons first, with uploader/release hints on mixed pages. A new mirror still needs compatible metadata and markup. A numeric link alone does not establish that a row is a game.

See [current matching verification](title-identity-verification.json) for the published build, tested scope and remaining live-site/browser limitations.
