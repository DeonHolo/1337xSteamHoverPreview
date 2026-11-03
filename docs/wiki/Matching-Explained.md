# Why matching failed, in plain language

Current unpublished drafts: **1337x 5.00**, **CS.RIN.RU 4.00**. Checked 4 November 2026; internal shared core 1.0.4, resolver 7. Previous 5.0.x/4.0.x labels in older verification files were local development iterations, not public releases.

## A finder and a name helper

Imagine a box of game-name cards. Steam search fills the box. Fuse.js looks through those cards and picks the closest written names. It cannot choose a card that is missing, and it does not translate English into Chinese.

These reports exposed problems filling the box. Adding a better name comparer alone could not repair them.

## MeowPower!Yachiyo

The small Steam API returned zero games for MeowPower!Yachiyo, but returned AppID **2885530** for MeowPower Yachiyo. Once that name reached the matcher, it scored 100: an exact normalized identity. The earlier code removed dashes/colons from queries but missed the exclamation mark. That was a narrow search-preparation fix, not a Fuse installation failure.

Search preparation now handles punctuation generally, including exclamation/question marks, quotes, slashes and Unicode punctuation, while preserving apostrophes and meaningful +/# symbols. The original spelling remains a fallback. It does not require a title-specific AppID list.

## Idle Demon Lord II and Chinese names

Live API searches for Idle Demon Lord II returned zero results under en, english and schinese. Searching the Chinese name 挂机魔王II found AppID **5245310**, with the result already named Idle Demon Lord II. App details correctly returned Idle Demon Lord II in English and 挂机魔王 II in Simplified Chinese. The same game can have localized names, while this API's searchable names do not always expose every alias.

Steam's website search found the English title. The script now makes **one compact website-search fallback** after its API query variants fail to find a confident game. It parses up to ten unique Steam app rows, then applies the same full-name, type and verified-parent checks. A normal API success gets no extra website request. Website responses are larger than the small API response; the observed fallback was about 53 KB and can add latency on difficult lookups. It avoids downloading the entire store page or an application catalog.

This Steam-hosted website endpoint is not a documented public API contract. Its response/markup are validated; invalid or blocked results remain a provider error instead of silently becoming a confident no-match. Tests retain the captured response.

## Closest names in Choose Steam game…

Manual suggestions now use a separate permissive, two-way Fuse name comparison. The closest available names appear first even if their sequel or edition differs and automatic matching rejects them. AppIDs identify each suggestion; they do not need to appear in the torrent title. Choosing a title deliberately selects its AppID, validates the app/base-game data and saves that source-specific correction.

This is similarity of written names, not phonetic pronunciation or automatic translation. The list still needs search results; when both providers supply no candidates it shows No suggestions found and accepts a Steam AppID/store URL. The chooser does not silently turn a loose recommendation into an automatic match.

## Evidence and limits

Both reported titles now resolved live with actual tags and reviews: MeowPower!Yachiyo to 2885530 and Idle Demon Lord II to 5245310. The two cold provider samples took about 1.09 and 1.11 seconds on that connection, excluding UI/image downloads. They are not a representative p95 benchmark.

- [Recorded query/name comparisons](api-search-diagnosis-2026-11-04.json)
- [Live shared-engine results](live-draft-matching-2026-11-04.json)
- [Current build/test evidence](draft-verification-2026-11-04.json)

Current checks: **64 CS.RIN Node tests, 61 1337x Node tests, 49 browser cases passed**. Shared tests run in both repos; they are not 125 distinct engine scenarios. Independent browser CI mode runs 47 cases and skips two original-pipeline comparisons. A real userscript-manager/site session, Dark Reader and actual magnet launch remain manual release checks.
