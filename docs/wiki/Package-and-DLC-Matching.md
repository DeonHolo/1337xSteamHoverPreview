# Package and DLC naming

Local shared core 1.0.11 fixes naming patterns used by both scripts. The examples below are regression data, not a title/AppID exception list.

## Why the reported listings failed

- Steam returned no API candidates for the complete Collector's Bundle, Ultimate Bundle and soundtrack bundle queries. Those are purchase labels around the game name.
- Two clipped listing titles ended at `[Fi`. The previous cleaner recognized `[FitGirl` but could not identify a partial word. That fragment remained in search and matching.
- Steam returned `Victoria 3: State and Revolution - Immersion Pack`. Its additional product description reduced the title score to 81, below the automatic threshold of 85. Steam appdetails confirms it is DLC whose parent is Victoria 3.

## General rules

Recognized commercial labels support both Edition and Bundle. A package year is removed with that label only after an explicit subtitle separator; a year in the game name remains significant. A number-of-years anniversary package after a separator can resolve to its base game. Unqualified Anniversary Edition, Special Edition, Definitive Edition, remakes and VR products retain their identity. Explicit game-and-soundtrack bundles search the game name; arbitrary multi-game bundles remain intact.

A partial repacker name is removed only when it is a known-name prefix of at least two letters in an unfinished trailing bracket after version metadata. Unrelated bracketed title words remain intact.

DLC descriptions such as Immersion Pack, Mechanics Pack and Expansion may supply an additional candidate variant. The complete DLC subtitle must still match. The variant cannot authorize a match until Steam appdetails confirms a DLC and a verified parent chain ending at a game. A soundtrack/music app, absent parent, conflicting sequel, different subtitle or competing base AppIDs still fails or opens choices. Every metadata field and action uses the validated base AppID.

Resolver 10 discards automatic mappings and failed lookups from previous resolvers while retaining saved corrections and reusable per-AppID data. Both repositories pin the same core and tests. No per-game aliases or external fuzzy-matching service are added.

## Verification

The captured official Steam fixture includes the five raw reported listing titles, search results, app types and parent relationships. Shared tests cover unrelated invented names, protected identities, partial release tags, product validation and ambiguity. Browser checks run each reported naming pattern through both generated userscripts and require actual tags on the first successful card, correct Steam actions and a stationary settled preview.

Local verification passed 288 unit tests across both checkouts, 88 browser checks across both sites, and all five live Steam cases with real tags. [Verification evidence](package-matching-verification.json)

Public versions and historical release evidence remain recorded separately in the release checklist. [General matching](General-Matching.md) · [Release checklist](../../RELEASE_CHECKLIST.md)
