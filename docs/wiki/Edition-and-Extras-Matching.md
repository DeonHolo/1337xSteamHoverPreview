# Editions followed by included extras

Shared core 1.0.12 in CS.RIN 4.08 and 1337x 5.06 composes commercial-edition cleanup with explicit included-extra components.

The reported title ended in `Digital Deluxe Edition + DLC`. Previously, commercial-edition cleanup required Edition or Bundle at the end, so the extra component prevented that cleanup. Captured Steam candidates scored the base game at 80 and its Digital Deluxe Upgrade at 84, both below the automatic threshold of 85. Manual suggestions rank names more permissively and therefore still included them.

## General behavior

Cleanup repeatedly removes recognized packaging components in either order: commercial editions/bundles and explicitly joined extras such as `+ DLC`, `+ All DLCs`, `+ 3 DLCs/Bonuses`, `+ Original Soundtrack`, and `+ Digital Artbook`. For example, `Clockwork Harbor 9 Remastered - Digital Deluxe Edition + 3 DLCs` compares against `Clockwork Harbor 9 Remastered`. No game names or AppIDs are encoded in production rules.

Sequel numbers, years in game names, Remastered, VR and standalone edition identities remain significant. Unknown additions and named expansions remain intact. A commercial-edition label can no longer discard an arbitrary trailing subtitle: `Deluxe Edition - Remastered` retains its trailing identity. Candidates still require Steam appdetails validation and verified DLC parents. Competing base AppIDs require a choice. Resolver 11 invalidates previous automatic mappings and failures while preserving intentional corrections and per-AppID data.

## Why the cutoff stays at 85

The score is a name-ranking heuristic, not a probability. An 80 score does not mean an 80% chance of identifying the correct game. Following a DLC whose parent is verified may be safe, but similarly named separate games can also score highly. Manual suggestions remain available below the automatic threshold. This fix improves the title being compared rather than lowering the acceptance threshold.

## Verification

The Steam fixture records the title visible in the failed card, official search results, app types and parent data; the full torrent title was not available. Unit tests cover 192 unfamiliar-name/edition/extra combinations, both component orders, conflicting identities and ambiguity. Browser checks require the exact remaster, actual Steam tags on the first successful card, one search and one base-game details lookup even when the upgrade is returned first.

Verification passed 296 unit tests across both checkouts and 90 browser checks across both sites. A live Steam check resolved the reported title with actual tags. [Verification evidence](edition-extras-verification.json)

[Package and DLC matching](Package-and-DLC-Matching.md) · [General matching](General-Matching.md)
