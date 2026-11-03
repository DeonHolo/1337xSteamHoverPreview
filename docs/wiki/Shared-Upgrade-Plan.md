# Shared upgrades delivered

Current unpublished drafts: **1337x 5.00**, **CS.RIN.RU 4.00**, shared core **1.0.5**, checked 4 November 2026. Both installable userscripts are standalone generated artifacts. Previous local patch labels were internal iterations; nothing has been published by this task.

The [chooser name search](Search-by-Name.md) lets users type a title and select ranked suggestions without finding a Steam URL/AppID themselves. Public changelogs compare the actual public 4.1/3.2 releases with these drafts and omit internal work history.

The [current diagnosis and fixes](Matching-Explained.md) cover general punctuation, localized API alias misses and a bounded Steam website-search fallback. Manual suggestions rank closest names independently of strict automatic identity checks. Each repo includes a Markdown release checklist and paste-ready Greasy Fork changelog.

The [recovery control update](Match-Recovery.md) replaces Retry lookup with Choose Steam game… after failure, offering existing suggestions or manual AppID/URL entry. Successful cards retain Wrong game?.

The [text-matching patch](Fuzzy-Matching-2026-11-04.md) adds punctuation-safe candidate lookup and a local Fuse.js typo fallback, removes Wrong game? from failed cards and increases failure-action spacing.

The [regression patch](Regressions-2026-11-04.md) restores original presentation and settled-card pointer locking, fixes Windows-icon uploader eligibility, and repairs named editions, trademark normalization and update suffixes. Resolver migration discards old match failures automatically while retaining app data.

The original review and its evidence remain in [the dated audit](Review-Findings-2026-11-03.md) and [baseline observations](review-evidence-2026-11-03.json). Those pages describe the old scripts. This page describes the implementation.

## Actual tags first

Actual Steam community tags are part of the first meaningful successful preview. Genres never substitute. A completely cold game shows a compact loading message until the actual tag response settles. An unavailable/blocked/empty page produces an explicit status and Retry tags action. The card never requires a second hover to display fetched tags.

Nearby-row preloading identifies a validated base AppID and immediately warms that game's tags before moving on. Reviews run independently with lower request priority. Image downloads do not delay the tags-ready card. Existing tags render immediately from cache; stale usable actual tags can remain visible while refreshing.

The deliberate tradeoff is that a genuinely cold card must include a Steam HTML response on its useful-content path. Faster loading comes from removing failed requests, avoiding unnecessary candidate lookups, prioritizing tags, and reusing AppID data. Early genre/description-only paint is not counted as success. See [verification and timing](Verification-and-AI-Workflow.md).

## Reviews and base-game identity

- Reviews use the official keyless IUserReviewsService/GetAppReviews/v1 endpoint, numeric request enums, and the modern response.query_summary envelope. Reviews retain the original plain Rating row, stars, count and Steam category, with distinct loading/zero/error states and local retry.
- Full app details are requested for one AppID at a time. The failed comma-separated full-details attempt is removed.
- Matching uses Unicode normalization, bidirectional token similarity, protected sequel/season/remake/VR identity, a minimum confidence threshold, and an ambiguity margin. It does not shorten queries by arbitrarily dropping trailing words.
- A strong exact result normally requires one detail validation. Ambiguous alternatives use the same bounded worker pool.
- DLC resolution follows fullgame.appid with type, cycle, and depth validation. Description, store link, tags, reviews, and media use the same final base AppID. Missing parent evidence does not trigger an arbitrary switch to another game.
- Wrong game? accepts a validated Steam AppID/store URL or candidate choice, saves the correction by site item and title fingerprint, and supports reset. An optional explicit source-content lookup can find a Steam link without preloading every topic/torrent page.
- Protected proper names include Ghost of Tsushima, Lost in Random, Demonologist, The Beginner’s Guide, meaningful subtitles, and bracketed proper titles. Matching remains heuristic for aliases/translations; saved corrections handle the cases that cannot be inferred confidently.

[Official review contract](https://partner.steamgames.com/doc/webapi/IUserReviewsService). Steam-hosted storefront search/details and store-page tag HTML are isolated providers with fixtures. SteamDB remains an outbound link; it is not scraped. [SteamDB FAQ](https://steamdb.info/faq/#does-steamdb-have-an-api).

## Preloading while away from the tab

**Yes:** an open, loaded, runnable background tab continues automatic warming under Nearby rows or Entire page. Hidden tabs use one request worker, rather than increasing concurrency. Nearby rows warms the current viewport and roughly 600 px around it; Entire page continues through all eligible rows. On hover only disables automatic warming.

The initializer works even when the script starts after window.load. Intersection/scroll/resize updates reprioritize nearby rows and newly inserted listings are discovered. Active hovers promote shared work above unrelated prefetches. Requests deduplicate by resource/AppID, have timeouts/cancellation, and honor rate-limit cooldowns. Long cooldowns settle as retryable failures instead of leaving a cold spinner waiting indefinitely.

Browser sleeping/freezing/discarding, a closed tab/browser, or an offline connection can pause or prevent work. Cached data already saved survives those states; the userscript does not run as a separate browser-wide background service. The two independently installed scripts have separate caches, even though they share implementation.

## Field-level caching

| Data | Implemented policy |
| --- | --- |
| Validated mappings | 30-day reuse, resolver-versioned and title-fingerprinted |
| Description/media metadata | 24-hour freshness; stale-while-revalidate for mapped games |
| Actual tags | 24-hour freshness; usable stale tags up to 7 days while refreshing |
| New/unknown/upcoming release reviews | 15-minute freshness; new means within 14 days |
| Established-game reviews | 3-hour freshness |
| Genuine no-match/ambiguity | 5-minute cache; Choose Steam game… can validate a deliberate selection/AppID immediately |
| Tag-empty / transient tag error | 15 minutes / 30 seconds; explicit retry available |
| Review errors | 30-second retry suppression, separate from zero reviews |

Cache records have separate timestamps, bounded count/serialized size, and access-based eviction. Enriching tags never extends unrelated review/detail freshness. Cross-tab merges use per-record timestamps; a clear generation prevents late results repopulating cleared data. Clearing data preserves saved corrections. Reset markers prevent an older tab from restoring a deleted correction.

## Everyday QoL

- Bundled small Steam, monochrome magnet, and external-link SVGs keep text labels and add no icon-network request. The Steam symbol is attributed in the source and THIRD_PARTY_NOTICES.md.
- 1337x retains Magnet Download with one shared action controller, deduplicated lazy page retrieval, timeout, validated URI, and Retry/Open torrent page error recovery. No magnet is fetched or opened during a hover.
- CS.RIN retains AppID copy, SteamDB, colored thread tags, and latest-page action. Latest destination selection validates origin/topic and uses explicit last-post evidence or greatest page offset.
- Upcoming games use Planned release/Coming soon. The original review presentation is retained without a review hyperlink; its data comes from the repaired official endpoint.
- Keyboard focus opens previews; Alt+ArrowDown enters card controls; Escape dismisses. Theatre contains focus and restores the invoking control on close. Reduced motion, image placeholders, stable viewport limits/internal scrolling, and frame-scheduled positioning improve access.
- Existing media order and screenshot/trailer theatre navigation are retained. Header/active card images load eagerly; card screenshots use thumbnails and theatre uses full images. Video files load after explicit play/open only. Unsupported formats retain a Steam-link fallback.

The userscript manager menu offers preload/theme/review-filter settings, cache clearing, correction import/export, and redacted diagnostics. Cold pointer hovers use a short intent delay; cached previews skip it. Diagnostics include core/schema/provider versions, request counts, tag latency samples, field ages, and match reasons without source-session URLs or magnet URIs.

## Shared maintenance

CS.RIN owns src/core. 1337x pins the same source/tests under vendor/steam-hover-core with shared-core.lock.json hashes. Each adapter owns site selectors, source identity, cleanup input, actions, and native theme. Both builds retain their public userscript filenames and install identities. Fuse.js basic is a pinned, locally bundled text-matching dependency; no runtime external code or package fetch is added.

Both repositories now have dependency locks, formatting/lint, Node tests, reproducible build verification, isolated Chromium fixtures, CI, contributor instructions, an issue template, and repository AI guidance. See [CONTRIBUTING](../../CONTRIBUTING.md) and the [architecture decision](../decisions/0001-shared-core-and-tags-first.md).

Catalog services, runtime LLM matching, an additional pinned-hover mode, a SteamDB data backend, and source-page fetching for every row were optional/future ideas, not part of this release. They are unnecessary for the delivered tags/reviews/matching fixes.
