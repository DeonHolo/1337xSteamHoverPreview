# Search for a Steam game by name

Available in the unpublished **1337x 5.00** and **CS.RIN.RU 4.00** drafts, shared core 1.0.5. Public versions stay unchanged during draft edits.

1. Open **Choose Steam game…** on a failed preview, or **Wrong game?** on a successful one.
2. Edit **Search by name**, which starts with the listing's title. Suggestions update after a short typing pause. Press **Enter** or **Search** to search immediately. For a release label such as From Space Revival, try From Space if that is the game you mean.
3. Select the intended game from **Closest names**. Only this selection validates the Steam AppID/base-game relationship, loads metadata/tags and saves the source-specific correction.

Searching never selects a game automatically. You can still enter a Steam AppID/store URL or use Find Steam link in source. Single-character titles can be searched explicitly with Enter/Search. Existing suggestions are reused when opening the panel; typing or submitting the search form requests new suggestions.

Search uses the current Steam providers and local permissive Fuse name ranking. It tries at most two API query spellings and one compact website fallback when an exact name is absent. Repeated typing searches use the query cache; Enter/Search can refresh the results. No new remote matcher, API key or catalog download is added.

The name field has its own form, so pressing Enter does not submit the separate AppID input. Old requests are cancelled on edited text, panel close, game selection and preview changes. Response guards prevent obsolete results from replacing the current list. IME composition waits until committed input. Empty results and provider failures have different messages; available partial results remain selectable.

## Verification

**68 CS.RIN unit tests, 65 1337x unit tests and 57 browser checks passed**. Browser cases cover typing, Enter, explicit selection, both successful/failed preview states, pending-query cancellation, panel reopening, empty results and provider failure/retry. The prior correction, media, keyboard, appearance, cache and matching cases remain covered. Shared scenarios repeat between repositories. Independent browser CI mode runs 55 cases and omits two original-pipeline comparisons.

The live shared-engine check searched From Space, returned exact AppID 1502190 first, and loaded its actual tags after deliberate selection in an isolated test store. It created no correction until selection. [Live results](live-name-search-2026-11-04.json), [current validation](name-search-verification-2026-11-04.json).

## Release notes

The public baselines were verified from Greasy Fork's public script metadata: 1337x 4.1 and CS.RIN 3.2. Each public changelog describes user-visible changes from that version to the draft. Internal iteration labels, restored draft regressions, test totals and build architecture belong in development evidence, not the public changelog. [Baseline metadata](public-release-baselines-2026-11-04.json).
