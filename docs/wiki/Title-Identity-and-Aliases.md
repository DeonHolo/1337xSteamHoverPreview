# Title identity and verified aliases

The reported failures occurred after Steam had already returned the right candidate. Retrieval, typo matching and game identity are separate steps.

## Disco Elysium

Steam returns AppID 632470 named Disco Elysium - The Final Cut for the query Disco Elysium. Previously, extra subtitle words lowered the automatic score to 64, below the threshold of 85. The manual chooser is deliberately more permissive, so the correct result could appear there even when automatic matching failed.

Steam's publisher announcement confirms Final Cut was a free upgrade of the existing game. The shared core now keeps a small, explicitly verified alias group for the two names under AppID 632470. It only affects scoring after Steam returns that exact ID and one of the expected names; appdetails must still validate it as a game. It does not invent an AppID, skip Steam search, accept another app with a similar name, or accept the soundtrack/artbook. Debug output records Verified Steam title alias.

This is a curated identity fact, not an improvement to Fuse's ability to infer renames. Future unrelated renames require official evidence and an additional tested alias group. There are no new external services or per-hover requests.

## Skyrim

The named commercial-edition cleanup could misread the official title The Elder Scrolls V: Skyrim Special Edition as a base title followed by a purchase tier. That wrongly removed Skyrim Special Edition and made punctuation change the result. Special and Anniversary now retain their title identity, alongside protected Remake/Remastered/Definitive/Enhanced/VR markers.

The exact Special Edition query now scores 100 and validates AppID 489830 directly. Original Skyrim (72850), Special Edition (489830) and VR (611670) remain distinct. A query for original Skyrim will not silently become Special Edition merely because the original is unlisted in Steam search. The chooser can still present close alternatives for an explicit selection. Confirmed DLC-parent resolution remains available when the source actually matches a DLC.

## Cache and evidence

Resolver version 8 discards old automatic title mappings and negative matches while retaining saved user corrections and usable per-AppID metadata/tags/reviews. Shared core is 1.0.8. Captured official search/detail identities are in tests/fixtures/steam/disco-skyrim.json. Unit checks cover alias ID/name/type restrictions, unexpected appdetails names, direct Special Edition matching and edition separation. Browser checks run on both adapters.

- [Publisher announcement on Steam](https://store.steampowered.com/news/posts/?appids=632470&enddate=1616694036&feed=steam_community_announcements)
- [Disco Elysium - The Final Cut](https://store.steampowered.com/app/632470/)
- [Skyrim Special Edition](https://store.steampowered.com/app/489830/)
- [Original Skyrim](https://store.steampowered.com/app/72850/)
- [Current matching verification](title-identity-verification.json)
