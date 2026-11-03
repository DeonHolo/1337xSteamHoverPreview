# Text matching and failed-preview fixes

Local versions: **1337x 5.0.2**, **CS.RIN.RU 4.0.2**, shared core **1.0.2**, resolver **4**. This continues the [previous regression patch](Regressions-2026-11-04.md). A later [recovery control update](Match-Recovery.md) replaces Retry lookup with Choose Steam game… on failed cards; the results below describe the 5.0.2/4.0.2 matching patch.

## Why Asgard's Fall was missed

The raw report was Asgard's Fall - Viking Survivors (v1.0.0.w). Cleanup correctly removed the version suffix. The local matcher already scored Steam's Asgard's Fall — Viking Survivors as an exact normalized identity, but Steam's API returned no candidates for the full title with a dash. The same API returned AppID 2780710 after removing the separator. A store website search and the API do not always produce identical results.

Captured public responses are in [the query fixture](../../vendor/steam-hover-core/tests/fixtures/steam/asgard-search.json). In the 1337x repository the same fixture lives under the pinned vendor snapshot. The new code sends a punctuation-neutral full title first, preserving all game words and sequel/remaster markers. It can try the original punctuation if needed. Only an explicit subtitle separator supplies an additional title-prefix lookup; matching still validates the complete original identity, not just that prefix.

Search cache keys now distinguish actual punctuation variants. Previously the normalized cache key could reuse an empty result for a different query that Steam would handle successfully. Exact successful lookups still need one search request.

## Local Fuse.js fallback

[Fuse.js 7.5.0 basic](https://www.fusejs.io/fuzzy-search.html) is bundled locally with its full Apache-2.0 license. It is a text similarity library, not a game catalog or hosted service. It adds no runtime network request, API key, remote script loader or user-data upload. The existing exact/token matcher runs first.

The fallback compares spelling in both directions. It currently permits one minor misspelling in a substantial word, with the same other significant words. It rejects short-word substitutions, missing title words, and protected sequel/season/remake/VR mismatches before acceptance. Fuzzy scores are capped at 94; the existing minimum confidence of 85, ambiguity margin and Steam type/parent validation remain. Exact identities retain priority. This is conservative typo tolerance, not semantic understanding or a guarantee for arbitrary translated/alternate titles.

The live engine check resolved the original raw title with score 100 and a deliberately misspelled Viking Survivers subtitle with score 94. Both resolved to 2780710 and returned actual tags/reviews. The typo used the explicit Asgard's Fall prefix only after two complete-title queries failed. [Live results](live-asgard-fuse-2026-11-04.json).

The original run reached actual tags in about 1.06 seconds on that connection. The typo run took about 0.65 seconds while reusing that AppID's already fetched fields; it is not a separate cold-network benchmark. Fallback queries can add time for difficult titles; they do not run after an exact full-title success. The generated scripts grew by about 34 KB, including the local library and full license text.

## Failed previews

- Failed previews have no Wrong game? control. Successful matches retain it for correcting an actual wrong result.
- Search on Steam and Magnet Download have a 20 px horizontal gap, with 8 px row spacing when wrapping and space before Retry lookup.
- Both actions remain blue, and the settled preview remains locked in position.
- Genuine ambiguity opens candidate choices directly, without a redundant Wrong game? toggle.

The resolver upgrade automatically invalidates older mappings/failures while preserving actual per-AppID data and saved corrections. A manual cache clear is unnecessary.

## Verification and maintenance

**56 CS.RIN Node tests, 53 1337x Node tests and 41 browser checks passed.** Lint, syntax/generated-build checks, formatting, shared-source hashes and the upstream Fuse asset check passed. Independent browser CI mode omits two original-pipeline comparison cases. [Machine-readable evidence](matching-verification-2026-11-04.json).

Both generated scripts are tested with punctuation-sensitive mock searches, a subtitle typo, a fallback-query cache collision, absent Wrong game? controls, action gaps/clickability, direct ambiguity choices, and the existing appearance/media/tag/review regressions. The live smoke test uses real Steam responses with Chromium DOMParser; it does not exercise the user's installed userscript manager or every live site layout.

Canonical maintainers pin Fuse.js in package-lock.json. After an intentional upgrade, run npm run vendor:fuse, inspect the upstream changes/license, run npm run vendor:fuse -- --check, synchronize the shared core and rebuild both artifacts. The standalone build isolates Fuse's namespace and removes the bundled ESM import/export; installed users need only the single root userscript. The consumer build and tests use the checked-in asset without requiring the canonical checkout or npm Fuse installation.
