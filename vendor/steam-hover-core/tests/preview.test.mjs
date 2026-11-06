import test from 'node:test';
import assert from 'node:assert/strict';
import {
    escapePreviewHtml,
    safePreviewUrl,
    previewIcon,
    selectPreviewVideoSources,
    normalizePreviewMedia,
    previewReleaseText,
    previewTagsMarkup,
    previewReviewsMarkup
} from '../src/core/preview.mjs';

test('dynamic preview text is escaped and dangerous media protocols are rejected', () => {
    assert.equal(escapePreviewHtml('<b a="x">&\'</b>'), '&lt;b a=&quot;x&quot;&gt;&amp;&#39;&lt;/b&gt;');
    for (const value of ['javascript:alert(1)', 'data:image/svg+xml,test', 'file:///C:/private', null])
        assert.equal(safePreviewUrl(value), '');
    assert.equal(
        safePreviewUrl('http://cdn.akamai.steamstatic.com/header.jpg'),
        'https://cdn.akamai.steamstatic.com/header.jpg'
    );
});

test('media normalization keeps header, videos, screenshots order and validates every asset', () => {
    const media = normalizePreviewMedia({
        name: 'Example',
        header_image: 'https://cdn.example/header.jpg',
        movies: [
            null,
            {
                thumbnail: 'https://cdn.example/poster.jpg',
                mp4: { max: 'https://cdn.example/1080.mp4', 720: 'https://cdn.example/720.mp4' }
            },
            { thumbnail: 'javascript:bad', mp4: 'https://cdn.example/a.mp4' }
        ],
        screenshots: [
            null,
            { path_full: 'https://cdn.example/full.jpg', path_thumbnail: 'https://cdn.example/small.jpg' },
            { path_full: 'https://cdn.example/full.jpg' },
            { path_full: 'javascript:bad' }
        ]
    });
    assert.deepEqual(
        media.map((item) => item.source),
        ['header', 'movie', 'screenshot']
    );
    assert.equal(media[1].videoUrl, 'https://cdn.example/720.mp4');
    assert.equal(media[2].url, 'https://cdn.example/full.jpg');
    assert.equal(media[2].thumbUrl, 'https://cdn.example/small.jpg');
    assert.deepEqual(normalizePreviewMedia({ movies: {}, screenshots: 'invalid' }), []);
});

test('720p direct playback is preferred and HLS-only trailers retain a poster', () => {
    const sources = selectPreviewVideoSources({
        mp4: {
            max: 'https://cdn.example/max.mp4',
            720: 'https://cdn.example/720.mp4',
            480: 'https://cdn.example/480.mp4'
        }
    });
    assert.equal(sources[0].url, 'https://cdn.example/720.mp4');
    const [movie] = normalizePreviewMedia({
        movies: [{ thumbnail: 'https://cdn.example/poster.jpg', hls_h264: 'https://cdn.example/index.m3u8' }]
    });
    assert.equal(movie.type, 'video');
    assert.equal(movie.videoUrl, '');
    assert.equal(movie.hlsUrl, 'https://cdn.example/index.m3u8');
});

test('actual tags render safely while legacy genres never substitute', () => {
    assert.match(
        previewTagsMarkup({ tags: ['Exploration', '<script>'], tagsSource: 'steam', tagState: 'ready' }),
        /Exploration • &lt;script&gt;/
    );
    const legacy = previewTagsMarkup({ tags: ['Action', 'Adventure'], tagsSource: 'genres' });
    assert.doesNotMatch(legacy, /Action|Adventure/);
    assert.match(legacy, /Steam tags unavailable/);
    assert.match(legacy, /Retry tags/);
    assert.match(previewTagsMarkup({ tags: [], tagState: 'loading' }), /Loading Steam tags/);
});

test('review zero, transport error, and pending state are distinct', () => {
    assert.match(previewReviewsMarkup({ reviewState: 'empty', reviewInfo: { total: 0 } }), /No user reviews yet/);
    const error = previewReviewsMarkup({ reviewState: 'error', reviewInfo: null });
    assert.match(error, /Reviews unavailable/);
    assert.match(error, /Retry reviews/);
    assert.doesNotMatch(error, /No user reviews/);
    assert.match(previewReviewsMarkup({ reviewState: 'loading', reviewInfo: null }), /Loading reviews/);
});

test('small review counts remain visible without an official category or percentage', () => {
    const one = previewReviewsMarkup({
        appId: 4834840,
        reviewState: 'ready',
        reviewInfo: { total: 1, percent: null, desc: '' }
    });
    assert.match(one, />1 review<\/span>/);
    assert.doesNotMatch(one, /0%|★/);
    assert.doesNotMatch(one, /<a\b|href=/);
    const recent = previewReviewsMarkup({
        appId: 4834840,
        reviewState: 'ready',
        reviewInfo: { total: 44, percent: 100, desc: 'Positive' }
    });
    assert.match(recent, /44 reviews/);
    assert.match(recent, /100% positive\s+\|\s+Positive\s+\|\s+44 reviews/);
    assert.match(recent, /ratingStars/);
    assert.doesNotMatch(recent, /<a\b|href=/);
    assert.match(recent, /Positive/);
    assert.match(
        previewReviewsMarkup({ reviewState: 'ready', reviewInfo: { total: 'invalid' } }),
        /Reviews unavailable/
    );
});

test('review percentage distinguishes zero positive votes from an unavailable percentage', () => {
    const zero = previewReviewsMarkup({
        reviewState: 'ready',
        reviewInfo: { total: 10, percent: 0, desc: 'Negative' }
    });
    assert.match(zero, /0% positive\s+\|\s+Negative\s+\|\s+10 reviews/);
    assert.match(zero, /☆☆☆☆☆/);
    const mixed = previewReviewsMarkup({
        reviewState: 'ready',
        reviewInfo: { total: 100, percent: 69, desc: 'Mixed' }
    });
    assert.match(mixed, /69% positive/);
    assert.match(mixed, /★★☆☆☆/);
    for (const percent of [null, undefined, NaN, -1, 101]) {
        const unknown = previewReviewsMarkup({
            reviewState: 'ready',
            reviewInfo: { total: 10, percent, desc: 'User reviews' }
        });
        assert.doesNotMatch(unknown, /% positive|ratingStars/);
        assert.match(unknown, /10 reviews/);
    }
});

test('upcoming release text is never labeled as already released', () => {
    assert.equal(previewReleaseText({ releaseDate: '2027', comingSoon: true }), 'Planned release: 2027');
    assert.equal(previewReleaseText({ release_date: { coming_soon: true } }), 'Coming soon');
    assert.equal(previewReleaseText({ releaseDate: 'Oct 26, 2026' }), 'Released: Oct 26, 2026');
});

test('action glyphs are bundled SVG with decorative accessible semantics', () => {
    for (const name of ['steam', 'steamdb', 'magnet', 'external']) {
        const icon = previewIcon(name);
        assert.match(icon, /^<svg/);
        assert.match(icon, /aria-hidden="true"/);
        assert.doesNotMatch(icon, /https?:|<img|onload=/);
    }
    assert.match(previewIcon('steam'), /viewBox="0 0 448 512"/);
    assert.match(previewIcon('steamdb'), /steamDbIcon/);
    assert.match(previewIcon('steamdb'), /viewBox="0 0 24 24"/);
    assert.notEqual(previewIcon('steamdb'), previewIcon('external'));
});
