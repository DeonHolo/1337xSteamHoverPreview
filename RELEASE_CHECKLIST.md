# 1337x 5.00 — release checklist

Unpublished draft, 4 November 2026. Checked items have local code/test evidence; unchecked items still need real-site validation or a release decision. [Paste-ready Greasy Fork changelog](GREASYFORK_CHANGELOG.md).

## Version and packaging

- [x] Keep the public userscript version at **5.00** throughout this unpublished draft.
- [x] Use SemVer 5.0.0 only for development package metadata.
- [x] Build the single installable [1337xSteamHoverPreview.js](1337xSteamHoverPreview.js); preserve name, namespace and update identity.
- [x] Include the pinned local Fuse.js build, full license and icon attribution; add no runtime package loader or hosted matcher.
- [x] Synchronize shared core 1.0.6 and its hash-locked source/tests across both repos.

## Shared behavior checked

- [x] Public changelog compares 1337x 4.1 with 5.00; omit internal iterations and features already in the public release.
- [x] Search by name inside the chooser supports typing, Enter/Search, ranked results, explicit selection and obsolete-request cancellation.

- [x] Actual Steam tags appear in the first useful card; genres do not substitute.
- [x] Reviews refresh independently; loading/zero/failure states remain distinct and reviews stay plain text.
- [x] Cached fields survive reload; old match failures are invalidated without throwing away valid AppID data or saved corrections.
- [x] MeowPower!Yachiyo punctuation regression resolves to 2885530 in captured, browser and live engine checks.
- [x] Idle Demon Lord II resolves to 5245310 through compact website search after the API alias miss.
- [x] Automatic sequel/edition/VR checks and verified DLC-parent resolution remain in force.
- [x] Choose Steam game… ranks available suggestions by closest name even across automatic identity rejection; explicit selection validates/saves the chosen game.
- [x] Manual Steam URL/AppID entry works when there are no suggestions; successful cards use Wrong game?.
- [x] Failed cards remain clickable/locked, retain blue actions and spacing, and have no redundant Retry lookup control.
- [x] Original typography/width comparisons, escaped content, click-to-play media and theatre/focus regressions pass.
- [x] Run lint, unit, syntax/generated-build and formatting checks in both repositories: **68 CS.RIN / 65 1337x Node tests**, **57 browser cases** passed.

## Real browser and site checks remaining

- [ ] Replace the installed test script with this rebuilt draft in the intended userscript manager and verify its version.
- [ ] Check cold hover, nearby preload, cached hover and newly inserted rows on the actual site.
- [ ] Check additional native Chinese, translated and alternate-name titles; a name library cannot guarantee arbitrary translation matches.
- [ ] Check tags/reviews for new releases, no reviews, mature-content/region restrictions and temporary Steam failures.
- [ ] Check keyboard access, theatre/video playback, fullscreen, scroll and viewport edges in the real browser.
- [ ] Verify real Windows-icon rows on uploader and search pages outside Games.
- [ ] Verify Magnet Download opens the intended torrent client on an explicit click.
- [ ] Verify default light appearance and the user’s Dark Reader setup.

## Release preparation

- [x] Prepare this Markdown checklist and [Greasy Fork changelog](GREASYFORK_CHANGELOG.md).
- [x] Keep the release at 5.00; do not increment public patch versions for further draft edits.
- [ ] Review the complete generated script and remaining manual results.
- [ ] Paste the changelog into the release form when ready and publish the intended draft deliberately.

See [plain-language matching diagnosis](docs/wiki/Matching-Explained.md), [current evidence](docs/wiki/draft-verification-2026-11-04.json), [development commands](CONTRIBUTING.md) and [wiki](docs/wiki/Home.md). No publishing or browser installation was performed by this task.
