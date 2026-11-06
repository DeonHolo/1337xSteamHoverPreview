# Rating display

Shared core 1.0.13 in 1337x 5.07 and CS.RIN 4.09 shows the positive review percentage beside the stars, Steam category and review count. The Rating label, stars and review text share a text baseline. Existing fonts, sizes, colors and spacing are preserved.

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

Release verification is recorded in [the verification report](rating-display-verification.json).
