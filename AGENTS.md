# Repository instructions

Read CONTRIBUTING.md and docs/wiki/Home.md before changing behavior. The user's current request takes precedence over historical review notes.

- This checkout owns src/adapters/1337x.mjs. Shared source is pinned under vendor/steam-hover-core; change the canonical CS.RIN source and synchronize it instead of patching the vendor snapshot.
- This patch follows public 5.01. Keep its public userscript @version at 5.02 during local fixes; package metadata uses SemVer 5.0.2. Internal core/resolver versions may advance when needed.
- Public changelogs use version-only headings, with no dates. Describe user-visible changes since public 5.01; omit internal iterations and already-public features.
- The chooser supports a separate title search form with debounce/Enter, permissive ranking, explicit selection and cancellation/late-result guards. Preserve optional AppID/URL entry.
- The root userscript is generated. Build from src/userscript-header.txt, shared core, and the site adapter. Preserve the public filename/name/namespace/update identity.
- Actual Steam tags are essential. No genre substitution. A successful first meaningful card includes actual tags; reviews/images may finish independently. No Copy magnet feature.
- Preserve the original inherited typography, font size, padding/width behavior, native link colors and plain review row. Settled success/failure cards must stop following the pointer so their controls remain clickable. Do not redesign the card without a user request.
- Failed previews replace Retry lookup with Choose Steam game…; successful matches use Wrong game?. Show existing suggestions or an explicit empty state with manual AppID/URL entry. Genuine ambiguity opens choices directly. Preserve the failure action spacing.
- Rank manual suggestions by closest name without automatic sequel/edition rejection; require an explicit choice and validate the selected AppID/type/parent. Keep automatic identity safeguards separate.
- Use the compact Steam website-search fallback only after API variants fail; preserve bounded parsing, provider-error states and localized-name fixtures.
- Separate candidate retrieval syntax from full identity scoring. Search caches must distinguish actual punctuation variants. Fuse is a pinned local typo fallback; keep exact-match priority, protected identity rejection and confidence/ambiguity checks. Never add remote matcher calls or weaken these guards to force a match.
- Match a validated base AppID and use it for all metadata/media/actions. Follow verified DLC parents, preserve sequel/edition identity, and require correction on ambiguity.
- Do not preload video files. Preserve deliberate click-to-play, CSP-aware fallback, escaped text, late-response guards, keyboard focus, and independent review/tag updates.
- Run npm run lint, npm test, npm run build, npm run check, npm run format:check, and relevant isolated browser checks. Run both adapters for shared changes. Commands and fixtures are described in CONTRIBUTING.md.
- Use shared-core version/hash locks and field schema/provider/resolver versions. Change cache versions when provider or matching contracts require invalidation.
- Update documentation for implemented behavior. Keep dated audit evidence distinct from release verification. Do not publish or push unless the user requests it.

- Treat verified same-AppID renames separately from fuzzy spelling. Preserve Special/Anniversary/Definitive/Enhanced edition identity. Add aliases only with official evidence and validate the returned ID, name and app type.
