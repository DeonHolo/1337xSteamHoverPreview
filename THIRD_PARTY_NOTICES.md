# Bundled action icons

The Steam symbol embedded in `src/core/preview.mjs` is the unmodified path from Font Awesome Free **6.7.2**, copyright 2024 Fonticons, Inc., licensed under **CC BY 4.0**.

- [Original SVG](https://github.com/FortAwesome/Font-Awesome/blob/6.x/svgs/brands/steam-symbol.svg)
- [Font Awesome Free license](https://fontawesome.com/license/free)
- [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

The symbol uses CSS `currentColor` and fixed display dimensions. It is bundled into the userscript; rendering it does not fetch a remote icon. Steam is a trademark of Valve Corporation. The generic magnet and external-link drawings are simple project-authored SVG paths.

# Bundled fuzzy text matching

Fuse.js **7.5.0** basic ESM, copyright 2026 Kiro Risk, is licensed under **Apache-2.0**. The unmodified upstream JavaScript is bundled locally with the full upstream license prepended. It makes no network request.

- [Upstream project](https://github.com/krisk/Fuse/tree/v7.5.0)
- Full license: src/assets/FUSE-LICENSE.txt (1337x: vendor/steam-hover-core/src/assets/FUSE-LICENSE.txt).
- Canonical source asset: src/assets/fuse.basic.min.mjs; the dependency lock pins the upstream npm package/integrity.

The standalone build isolates the library in a closure and removes its ESM export so it can run in a single userscript; the algorithm is unchanged. The full license and copyright notice are included in the generated userscript.
