# Rating display

Shared core 1.0.14 in 1337x 5.08 and CS.RIN 4.10 groups the positive review percentage with Steam's category: `Rating: ★★★★☆ 94% Very Positive | 300,000 reviews`. The Rating label, stars and review text share a text baseline. Existing fonts, sizes, colors and spacing are preserved.

## Stars

The stars and visible percentage summarize the rounded percentage of positive reviews. They are a script-defined visual summary, not an average of five-point reviews. Steam supplies the category label separately, and the review count stays visible beside it.

| Positive reviews | Filled stars |
| --- | --- |
| 95–100% | 5 |
| 80–94% | 4 |
| 70–79% | 3 |
| 40–69% | 2 |
| 20–39% | 1 |
| Below 20% | 0 |

The existing star thresholds and review data are unchanged. Missing or invalid percentages are omitted, and zero positive votes still display 0% when reviews exist. Loading, unavailable and no-review states retain their own messages.

## Verification

Current release verification is recorded in [the compact-rating report](compact-rating-verification.json). [Previous rating-display verification](rating-display-verification.json) remains available for the earlier release.
