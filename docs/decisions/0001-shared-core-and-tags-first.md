# Shared core and tags-first loading

Accepted 4 November 2026.

Actual Steam tags are the first information the user wants. A genre/description-first paint is not the success metric. The controller waits for actual tags, usable cached tags, or a bounded failure state; reviews and image downloads remain independent. Nearby-row preloading warms real tags after identity validation. Hidden tabs use a conservative single request worker; browser freezing/discarding can pause it.

Use official keyless IUserReviewsService for reviews, single-AppID storefront details for media/type/parent data, storefront search for candidates, and a fixture-tested store HTML tag parser. Never scrape SteamDB or distribute API secrets. Provider failures are distinct from empty data.

CS.RIN owns dependency-free shared providers/resolution/cache/scheduler/UI/runtime. Each repo owns its adapter and builds a standalone userscript. 1337x vendors a versioned hash-locked source/test snapshot and remains independently buildable. No runtime package loading or repo migration is required.

Automatic matches require confidence and a margin against alternatives. DLC resolution follows fullgame.appid with cycle/depth validation. Corrections are scoped by source identity/title fingerprint and validated against Steam. Cache records have independent field timestamps; clearing data preserves intentional user corrections.

Product choices: retain magnet opening without a copy feature; retain forum topic utilities and native light/dark palettes; retain explicit video initiation. A catalog backend, runtime LLM matching, and automatic sticky/pinned hover are outside this release.

Regression clarification, 4 November 2026: retain original inherited typography, sizing, blue actions and plain reviews. A settled successful or failed preview stops following the pointer; this existing behavior is distinct from an additional pinned-card mode. Exact validated identity may beat a merely similar candidate; two exact-name games still require selection. Resolver-version changes invalidate only match mappings/failures, retaining valid provider data and corrections.

Text-matching clarification: shared core 1.0.2 bundles Fuse.js 7.5.0 basic with its complete Apache-2.0 license, using a conservative local typo fallback after exact/token matching. Candidate lookup first neutralizes punctuation, distinguishes actual query cache keys, and may use an explicit subtitle prefix only when full-title lookup fails. Full identity/type/parent validation remains mandatory. Failed cards omit the Wrong game? toggle and use spaced actions; ambiguous failures show candidate choices directly.

Recovery control clarification: shared core 1.0.3 replaces failed-card Retry lookup with Choose Steam game…, opening already-collected suggestions or manual AppID/URL entry with an explicit empty state. Successful cards use Wrong game?. This is a UI change and does not invalidate existing resolver/cache data.
