# Regression fixes: 4 November 2026

Local patch versions: **1337x 5.0.1**, **CS.RIN.RU 4.0.1**, shared core **1.0.1**, resolver **3**. The first implementation introduced regressions in matching, uploader-page eligibility, pointer locking and presentation. These fixes address the user's reports; the initial automated coverage missed the uploader layout and presentation differences.

## Matching repairs

- Remove trademark/copyright symbols before Unicode compatibility normalization. Otherwise Steam's trademark symbol becomes the literal letters TM and damages title comparisons.
- Recognize named commercial edition packaging, such as Hunting Simulator 3: Apex Predator Edition. Search its base title while preserving sequel numbers and standalone remaster/definitive/VR identity.
- Remove numeric Update/Hotfix/Patch release suffixes and explicit Linux build metadata. Preserve meaningful title words and subtitles.
- Prefer a validated exact identity over merely similar alternatives, while still requiring selection for two exact same-name base games. The global confidence threshold has not been lowered.
- Normalize a trailing DLC label for candidate comparison, then follow the verified fullgame.appid relationship to the base game.
- Ignore obsolete cached match mappings and no-match entries automatically after the resolver upgrade. Keep valid per-AppID tags/details/reviews and deliberate corrections; no blanket cache clear is required.

The recorded live Steam search for the complete Apex Predator Edition phrase returned no candidates, while Hunting Simulator 3 returned AppID 2482760. The repaired engine resolves that raw release title and fetches actual tags/reviews. Live checks also resolved Unbroken The Awakening (2377020), House Flipper Remastered Collection (3710840), and Resonance of Fate Enhanced Remaster. For the last title, Steam identifies the enhanced release as DLC 4996080; its verified parent is 645730, so the final main-game page is the 4K/HD base. This is relationship-based resolution, not a fuzzy guess. [Recorded live results](live-reported-titles-2026-11-04.json).

## Hover and presentation repairs

- Windows/PC category icons qualify rows on uploader/search pages even without a Games link, Games heading or uploader column. Hover and preloading use the same eligibility check.
- Both successful and failed cards stop following the pointer when their content settles, allowing access to Magnet Download, Retry and match controls.
- Restore the original inherited font, font size, content-box sizing, padding and width behavior. Preserve native palette values and blue action colors.
- Restore the original plain Rating row with stars, Steam category and count. Reviews are not a hyperlink. The official review API and independent refresh/error handling remain.
- Magnet Download uses the same blue link color as Open on Steam, including theatre controls.

The browser regression cases cover failure-card position/clickability, a Windows-icon uploader page with no other Games hints, and typography/sizing comparison with the original release. CI uses the recorded original style measurements; full local checks also run the original script. They wait for its header image before measuring to avoid comparing an intermediate lazy-image layout.

## Third-party candidate search

Third-party catalogs could help with alternate names and translated titles as an optional fallback. [IGDB](https://api-docs.igdb.com/) supports search, alternative names and external-game references, and requires Twitch application authentication. A distributed userscript must not contain a shared client secret; an integration would need a credential strategy or small service. IsThereAnyDeal's keyed game search is another candidate source; its title lookup is documented as precise rather than fuzzy. [IsThereAnyDeal API](https://docs.isthereanydeal.com/).

No third-party catalog was added by this patch. It repairs the reproduced parsing/detection failures directly, retains official Steam identity validation and avoids adding another network hop to every hover. Ambiguous aliases can still require Wrong game? correction. SteamDB remains an outbound shortcut, not a data API.

See [verification](Verification-and-AI-Workflow.md) for current results and the limits of synthetic browser fixtures. The corrected scripts are local files, not a published or browser-installed update.
