# General title matching

Both userscripts use the same matcher. It has no per-game title-to-AppID table. The earlier Disco Elysium exception has been removed; that title is now one regression case among unrelated games and unseen synthetic names.

## What the rules handle

Local core 1.0.11 also handles [commercial bundles, clipped partial release tags and verified DLC product descriptions](Package-and-DLC-Matching.md). Historical verification below describes the public release it tested.

- Compare complete titles while tolerating spacing, joined words, camel case, dotted initials, apostrophes and punctuation. Roman numerals and Arabic numerals share the same identity.
- Recognize purchase labels such as Complete, Deluxe and GOTY editions, and the naming structure of Final Cut, Director's Cut and Extended Cut. These rules apply to every name. An exact full title ranks above a cut-label variant; conflicting cut labels and tied AppIDs do not get selected arbitrarily.
- Handle bounded spelling errors, including adjacent letter swaps in four-letter words with a distinct unchanged anchor, and up to two small errors in longer titles. Fuse contributes a local whole-title ranking signal. Short unrelated substitutions and generic words alone are insufficient.
- Try bounded broader API queries only after complete queries fail. Every candidate is still scored against the complete source identity; shortening a retrieval query does not authorize shortening the title being matched.
- Reject missing/extra sequel numbers, VR, remake/remaster and protected edition markers. Reject a demo, prologue, playtest, soundtrack or similar extra being substituted for the requested game, even when Steam declares it as a game.

All automatic candidates still require Steam appdetails validation. Verified DLC parents supply one base AppID for metadata, tags, reviews, media and actions. Exact results retain priority and close competing base games require a choice.

## Renames and localized titles

Names alone cannot prove that an added Remastered label is a rename of the same app rather than a separate product. When name matching fails or remains ambiguous, the shared client asks the existing site adapter to inspect the game's source content: the CS.RIN first post or the 1337x description. Sidebar links are excluded.

One explicit Steam AppID can establish the source identity independently of spelling or language. It is validated as a game or a DLC with a verified parent. Multiple AppIDs open choices; the first link is never silently selected. This evidence stays scoped to that source listing and does not become a global name alias.

Ordinary successful matches make no source-page request. Recovery waits at most 1.5 seconds for source inspection; an inaccessible, oversized or slow page leaves the existing chooser available. The source fetch is same-origin, bounded to 2 million characters and shared with the existing source/magnet actions. Cancellation and cache clearing prevent a late result from installing a mapping. No new third-party matcher or translation service is used.

## Limits and verification

This improves naming patterns across games; it cannot infer every unrelated translation, nickname or franchise subtitle. Without sufficient name evidence or an explicit source link, the card asks for a choice. Saved user corrections remain authoritative. Failed-lookup caching stays scoped to each listing, so one failure does not block another same-named source with a Steam link.

Resolver 9 invalidates old automatic mappings and failed matches while preserving saved corrections and per-AppID fields. The published core 1.0.9 verification covers 20 captured official Steam names, 25 negative title pairs, 48 unseen naming variants with number-conflict checks, candidate ambiguity, metadata and app type validation, and source recovery races. Both browser adapters are checked.

[Verification evidence](general-matching-verification.json) · [Match recovery](Match-Recovery.md)

## Clipped 1337x release annotations

1337x 5.04 uses shared core 1.0.10 to remove recognized release annotations at the end of a listing even if the closing bracket or parenthesis was clipped. The reported Cairn listing left `[FitGirl` in the cleaned title. With the tag removed, the edition rule searches for `Cairn` and resolves the base game. The same cleanup handles other repack tags and build notes while preserving sequel numbers, edition labels and unrelated bracketed title text. A changed cleaned title bypasses a failed lookup cached for the old text. [Cairn Deluxe Edition on Steam](https://store.steampowered.com/bundle/63198/Cairn_Deluxe_Edition/)
