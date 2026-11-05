# Choose a Steam game after a failed lookup

Current unpublished drafts: **1337x 5.00**, **CS.RIN.RU 4.00**, shared core **1.0.5**. See the [current matching diagnosis](Matching-Explained.md).

Failed previews replace Retry lookup with **Choose Steam game…**. Successful previews retain **Wrong game?**. There is one recovery control in the failed card; it opens the same validated correction panel rather than repeating the failed search.

## Suggestions and manual selection

1. Open Choose Steam game… on the failed card.
2. Edit Search by name to find more suggestions; pause briefly or press Enter/Search, then select the intended game. [Search guide](Search-by-Name.md).
3. If Steam returned candidates, the panel shows Closest names and selectable game titles. These are permissive name-based suggestions: different AppIDs, sequel numbers or editions do not remove a similar name from this manual list. Your selection confirms the game; automatic matching retains its strict identity rules.
4. If there are no candidates, the panel explicitly says No suggestions found. Paste a Steam AppID or store URL into the input and select Use this game. Find Steam link in source is also available when supported by the adapter.

Opening the panel reuses candidates from the completed lookup and makes no extra search request. Typing in Search by name or pressing Enter/Search retrieves a new ranked list without changing the selected game. It cannot promise suggestions for a title whose searches returned nothing. Choosing a suggestion or entering an AppID validates the Steam app, follows a verified DLC parent when applicable, fetches actual tags, and saves the source-specific correction. The resulting successful card switches to Wrong game?.

Genuine ambiguity still opens the choices automatically. Cancel closes the panel; Choose Steam game… can reopen it. Search on Steam and site actions remain available outside the panel. The 20 px action gap, blue links, inherited typography and settled-card pointer locking remain.

## Verification

**68 CS.RIN Node tests, 65 1337x Node tests and 57 browser checks passed**, including both adapters. The browser cases exercise no-candidate manual URL entry, candidate suggestions after a low-confidence failure, correct labels before/after selection, ambiguity cancellation/reopening, no Retry lookup control, no extra search when opening the panel, and the existing presentation/media/tag/review behavior. Independent CI mode omits two original-pipeline comparison cases.

[Current checks and artifact hashes](name-search-verification-2026-11-04.json). These checks use isolated synthetic pages, not the user's installed browser session. The current search revision uses resolver 7, invalidating earlier match failures while retaining valid per-AppID fields and saved corrections. Automatic confidence/identity thresholds remain unchanged; the manual recommendation rank is separate.

## Correction placement

Successful previews place the small Wrong game? button on the right of the game title. Long titles wrap in the remaining space. The release date stays below the title and the Steam action stays at the bottom-left. The correction form still opens beneath the card content; Cancel returns focus to the title-row button. Failed previews retain Choose Steam game… below their actions. CS.RIN and 1337x remain independently installed scripts with separate correction storage.

## Automatic source recovery

When general name matching fails or stays ambiguous, the script checks the source content for a Steam link. A single AppID is validated; multiple linked games require a choice. Normal successful matches do not fetch the source page. Saved corrections remain authoritative. See [general matching](General-Matching.md).
