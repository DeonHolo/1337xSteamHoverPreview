/** Shared, dependency-free preview UI. Built into both installable userscripts. */
// Steam symbol: Font Awesome Free 6.7.2, Fonticons, Inc., CC BY 4.0.
// https://github.com/FortAwesome/Font-Awesome/blob/6.x/svgs/brands/steam-symbol.svg
const PREVIEW_STEAM_PATH =
    'M395.5 177.5c0 33.8-27.5 61-61 61-33.8 0-61-27.3-61-61s27.3-61 61-61c33.5 0 61 27.2 61 61zm52.5.2c0 63-51 113.8-113.7 113.8L225 371.3c-4 43-40.5 76.8-84.5 76.8-40.5 0-74.7-28.8-83-67L0 358V250.7L97.2 290c15.1-9.2 32.2-13.3 52-11.5l71-101.7c.5-62.3 51.5-112.8 114-112.8C397 64 448 115 448 177.7zM203 363c0-34.7-27.8-62.5-62.5-62.5-4.5 0-9 .5-13.5 1.5l26 10.5c25.5 10.2 38 39 27.7 64.5-10.2 25.5-39.2 38-64.7 27.5-10.2-4-20.5-8.3-30.7-12.2 10.5 19.7 31.2 33.2 55.2 33.2 34.7 0 62.5-27.8 62.5-62.5zm207.5-185.3c0-42-34.3-76.2-76.2-76.2-42.3 0-76.5 34.2-76.5 76.2 0 42.2 34.3 76.2 76.5 76.2 41.9.1 76.2-33.9 76.2-76.2z';

// SteamDB logo: Simple Icons, CC0-1.0. Bundled, unmodified path.
// https://raw.githubusercontent.com/simple-icons/simple-icons/521c96fd04b0ea93034db8715eda5a4de27a58bb/icons/steamdb.svg
const PREVIEW_STEAMDB_PATH =
    'M11.981 0C5.72 0 .581 2.231.02 5.081l6.675 1.257c.544-.17 1.162-.244 1.8-.244l3.131-1.875c-.037-.469.244-.956.881-1.35.9-.581 2.307-.9 3.732-.9a8.582 8.582 0 012.812.412c2.1.713 2.569 2.082 1.069 3.057-.956.618-2.494.937-4.013.9l-4.125 1.48c-.037.3-.243.582-.637.845-1.106.712-3.263.88-4.8.356-.675-.225-1.125-.563-1.313-.9L.47 7.2c.431.675 1.125 1.294 2.025 1.838C.938 9.938 0 11.062 0 12.28c0 1.2.9 2.307 2.419 3.206C.9 16.37 0 17.476 0 18.675 0 21.619 5.363 24 12 24c6.619 0 12-2.381 12-5.325 0-1.2-.9-2.306-2.419-3.188C23.1 14.588 24 13.482 24 12.282c0-1.219-.938-2.362-2.512-3.262 1.556-.956 2.493-2.138 2.493-3.413 0-3.093-5.381-5.606-12-5.606zm4.275 2.663c-.975.018-1.912.225-2.512.618-1.031.675-.713 1.594.712 2.082 1.425.487 3.394.337 4.425-.338 1.032-.675.713-1.594-.712-2.062a6.376 6.376 0 00-1.913-.282zm.057.318c1.387 0 2.493.525 2.493 1.163 0 .637-1.106 1.162-2.493 1.162-1.388 0-2.494-.525-2.494-1.162 0-.638 1.106-1.163 2.494-1.163zM8.493 6.45c-.3.019-.58.038-.862.075l1.707.319a2.03.94 0 11-1.52 1.744l-1.668-.32c.188.17.45.32.806.45 1.2.413 2.888.282 3.75-.28.863-.563.6-1.35-.6-1.744-.487-.169-1.068-.244-1.612-.244zm11.944 3.113v1.743c0 2.063-3.787 3.732-8.437 3.732-4.669 0-8.437-1.67-8.437-3.732V9.581c2.156.994 5.137 1.613 8.418 1.613 3.3 0 6.3-.619 8.475-1.631zm0 6.487v1.65c0 2.063-3.787 3.731-8.437 3.731-4.669 0-8.437-1.668-8.437-3.731v-1.65c2.175.956 5.137 1.538 8.437 1.538s6.281-.582 8.438-1.538z';

export function escapePreviewHtml(value) {
    return String(value ?? '').replace(
        /[&<>"']/g,
        (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]
    );
}

export function safePreviewUrl(value) {
    try {
        const url = new URL(value);
        if (!['https:', 'http:'].includes(url.protocol)) return '';
        if (url.protocol === 'http:' && /(^|\.)(steamstatic\.com|akamaihd\.net)$/.test(url.hostname))
            url.protocol = 'https:';
        return url.href;
    } catch {
        return '';
    }
}

export function previewIcon(name) {
    if (name === 'steam')
        return `<svg class="steamActionIcon" viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="${PREVIEW_STEAM_PATH}"/></svg>`;
    if (name === 'steamdb')
        return `<svg class="steamActionIcon steamDbIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="${PREVIEW_STEAMDB_PATH}"/></svg>`;
    if (name === 'magnet')
        return '<svg class="steamActionIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4v9a7 7 0 0 0 14 0V4h-5v9a2 2 0 0 1-4 0V4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 8h5m4 0h5" stroke="currentColor" stroke-width="1.8"/></svg>';
    return '<svg class="steamActionIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 4h6v6m0-6L10 14m0-9H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

export function selectPreviewVideoSources(movie) {
    const sources = [];
    const seen = new Set();
    for (const [format, source] of [
        ['mp4', movie?.mp4],
        ['webm', movie?.webm],
        ['mp4', movie?.video_url]
    ]) {
        const entries = typeof source === 'string' ? [['', source]] : Object.entries(source || {});
        for (const [quality, value] of entries) {
            const url = safePreviewUrl(value);
            if (!url || seen.has(url)) continue;
            seen.add(url);
            const pixels = /^(max|hd)$/i.test(quality) ? 1080 : parseInt(String(quality).replace(/\D/g, ''), 10) || 0;
            // Prefer 720p in a hover/theatre player; larger files remain fallbacks.
            const distance = pixels === 720 ? 0 : pixels > 0 && pixels < 720 ? 720 - pixels : 1000 + pixels;
            sources.push({ url, format, quality: pixels, distance });
        }
    }
    return sources.sort((a, b) => a.distance - b.distance || (a.format === 'mp4' ? -1 : 1));
}

export function normalizePreviewMedia(data) {
    const media = [];
    const seen = new Set();
    const title = data?.name || 'Steam media';
    const add = (item) => {
        const key = item.url || item.videoUrl || item.posterUrl;
        if (!key || seen.has(key)) return;
        seen.add(key);
        media.push(item);
    };
    const header = safePreviewUrl(data?.header_image);
    if (header) add({ type: 'image', source: 'header', url: header, alt: `${title} Steam header image` });
    for (const [index, movie] of (Array.isArray(data?.movies) ? data.movies : []).entries()) {
        if (!movie || typeof movie !== 'object') continue;
        const posterUrl = safePreviewUrl(movie.thumbnail);
        const videoSources = selectPreviewVideoSources(movie);
        const hlsUrl = safePreviewUrl(movie.hls_h264 || movie.hlsManifest || movie.hls);
        if (posterUrl && (videoSources.length || hlsUrl))
            add({
                type: 'video',
                source: 'movie',
                posterUrl,
                videoUrl: videoSources[0]?.url || '',
                videoSources,
                hlsUrl,
                alt: movie.name || `${title} video ${index + 1}`
            });
    }
    for (const [index, screenshot] of (Array.isArray(data?.screenshots) ? data.screenshots : []).entries()) {
        if (!screenshot || typeof screenshot !== 'object') continue;
        const url = safePreviewUrl(screenshot.path_full || screenshot.path_thumbnail);
        const thumbUrl = safePreviewUrl(screenshot.path_thumbnail) || url;
        if (url) add({ type: 'image', source: 'screenshot', url, thumbUrl, alt: `${title} screenshot ${index + 1}` });
    }
    return media;
}

export function previewReleaseText(data) {
    const date = data?.releaseDate || data?.release_date?.date || '';
    const upcoming = data?.comingSoon || data?.release_date?.coming_soon;
    return upcoming ? (date ? `Planned release: ${date}` : 'Coming soon') : date ? `Released: ${date}` : '';
}

export function previewTagsMarkup(data) {
    const tags = Array.isArray(data?.tags)
        ? data.tags.filter((tag) => typeof tag === 'string' && tag.trim()).slice(0, 5)
        : [];
    if (tags.length && data.tagsSource !== 'genres')
        return `<strong>Tags:</strong> ${tags.map(escapePreviewHtml).join(' • ')}`;
    if (data?.tagState === 'loading') return '<span>Loading Steam tags…</span>';
    return '<span>Steam tags unavailable</span> <button type="button" class="steamMetadataRetry" data-retry="tags">Retry tags</button>';
}

export function previewReviewsMarkup(data) {
    const review = data?.reviewInfo;
    if (data?.reviewState === 'error')
        return '<span>Reviews unavailable</span> <button type="button" class="steamMetadataRetry" data-retry="reviews">Retry reviews</button>';
    if (data?.reviewState === 'loading' || (!review && data?.reviewState !== 'empty'))
        return '<span>Loading reviews…</span>';
    if (!review || Number(review.total) === 0) return '<span>No user reviews yet</span>';
    const total = Number(review.total);
    if (!Number.isFinite(total) || total < 0)
        return '<span>Reviews unavailable</span> <button type="button" class="steamMetadataRetry" data-retry="reviews">Retry reviews</button>';
    const count = total.toLocaleString('en-US');
    const percent = review.percent == null ? NaN : Number(review.percent);
    let stars = '';
    if (Number.isFinite(percent) && percent >= 0 && percent <= 100) {
        const filled =
            percent >= 95 ? 5 : percent >= 80 ? 4 : percent >= 70 ? 3 : percent >= 40 ? 2 : percent >= 20 ? 1 : 0;
        stars =
            '<span class="ratingStars" aria-label="' +
            Math.round(percent) +
            '% positive">' +
            '★'.repeat(filled) +
            '☆'.repeat(5 - filled) +
            '</span>';
    }
    const desc =
        review.desc && !['N/A', 'No Reviews'].includes(review.desc) ? escapePreviewHtml(review.desc) + '  |  ' : '';
    return (
        '<strong>Rating:</strong> ' +
        stars +
        '<span class="ratingText">' +
        desc +
        count +
        ' ' +
        (total === 1 ? 'review' : 'reviews') +
        '</span>'
    );
}

export function mountSteamHoverPreview({
    client,
    adapter,
    addStyle,
    document: doc = globalThis.document,
    window: win = globalThis.window
}) {
    const document = doc;
    const window = win;
    const escapeHtml = escapePreviewHtml;
    const getUsableMediaUrl = safePreviewUrl;
    const isUsableUrl = (value) => Boolean(safePreviewUrl(value));
    const normalizeSteamMedia = normalizePreviewMedia;
    const orderSteamMediaItems = (media) => media;
    const FADE_DURATION = 150;
    const HIDE_DELAY = 160;
    const timers = new Set();
    const cleanups = [];
    const schedule = (fn, ms) => {
        const id = window.setTimeout(() => {
            timers.delete(id);
            fn();
        }, ms);
        timers.add(id);
        return id;
    };
    const cancel = (id) => {
        if (id != null) {
            window.clearTimeout(id);
            timers.delete(id);
        }
    };
    const listen = (target, name, handler, options) => {
        target.addEventListener(name, handler, options);
        cleanups.push(() => target.removeEventListener(name, handler, options));
    };
    const focus = (element) => {
        try {
            element?.focus({ preventScroll: true });
        } catch {
            element?.focus();
        }
    };
    const idPrefix = `steam-preview-${String(adapter.id).replace(/[^a-z0-9-]/gi, '')}`;
    const theatreTitleId = `${idPrefix}-theatre-title`;
    const tip = document.createElement('div');
    tip.className = `steamHoverPreview ${adapter.id === '1337x' ? 'steamHoverTip' : 'csrinruSteamHoverTip'}`;
    tip.id = `${idPrefix}-card`;
    tip.tabIndex = -1;
    tip.setAttribute('role', 'dialog');
    tip.setAttribute('aria-modal', 'false');
    tip.setAttribute('aria-label', 'Steam game preview');
    tip.setAttribute('aria-hidden', 'true');
    tip.dataset.previewState = 'hidden';
    const theatre = document.createElement('div');
    theatre.className = 'steamPreviewTheatre';
    theatre.tabIndex = -1;
    theatre.setAttribute('role', 'dialog');
    theatre.setAttribute('aria-modal', 'true');
    theatre.setAttribute('aria-labelledby', theatreTitleId);
    theatre.setAttribute('aria-hidden', 'true');
    const status = document.createElement('div');
    status.className = 'steamPreviewAnnouncer';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const style = document.createElement('style');
    style.dataset.steamPreviewStyle = adapter.id;
    style.textContent = `
        .steamHoverPreview {
            position: absolute;
            display: none;
            opacity: 0;
            max-width: 420px;
            padding: 8px;
            background: rgb(28, 28, 28);
            border: 1px solid #5c5c5c;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
            color: #c1cccc;
            font-size: 12px;
            line-height: 1.45;
            white-space: normal !important;
            overflow-wrap: break-word;
            z-index: 2147483647;
            pointer-events: none;
            transition: opacity ${FADE_DURATION}ms ease-in-out;
        }
        .steamHoverPreview p {
            margin: 0 0 5px 0;
            padding: 0;
        }
        .steamHoverPreview p:last-child {
            margin-bottom: 0;
        }
        .steamHoverPreview img {
            display: block;
            width: 100%;
            margin-bottom: 8px;
            border-radius: 2px;
        }
        .steamHoverPreview .steamMediaShell {
            margin-bottom: 8px;
        }
        .steamHoverPreview .steamMediaFrame {
            position: relative;
            width: 100%;
            aspect-ratio: 460 / 215;
            overflow: hidden;
            background: #111;
            border-radius: 2px;
        }
        .steamHoverPreview .steamMediaViewport {
            width: 100%;
            height: 100%;
            background: #111;
        }
        .steamHoverPreview .steamMediaImage,
        .steamHoverPreview .steamMediaPoster,
        .steamHoverPreview .steamMediaVideo {
            display: block;
            width: 100%;
            height: 100%;
            margin: 0;
            border-radius: 0;
            object-fit: cover;
        }
        .steamHoverPreview .steamMediaVideo {
            background: #000;
        }
        .steamHoverPreview .steamMediaError {
            display: grid;
            place-items: center;
            gap: 6px;
            width: 100%;
            height: 100%;
            padding: 12px;
            background: #151515;
            color: #d6e8ee;
            font-size: 12px;
            text-align: center;
            box-sizing: border-box;
        }
        .steamHoverPreview .steamMediaError a,
        .steamPreviewTheatreError a {
            color: #99d2f7 !important;
            font-weight: bold;
            text-decoration: underline;
        }
        .steamHoverPreview .steamMediaNavBtn {
            position: absolute;
            top: 50%;
            display: grid;
            place-items: center;
            width: 26px;
            height: 36px;
            margin: 0;
            padding: 0;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: rgba(0, 0, 0, 0.58);
            color: #f2f2f2;
            font: bold 19px/1 Arial, sans-serif;
            cursor: pointer;
            opacity: 0.82;
            touch-action: manipulation;
            transform: translateY(-50%);
        }
        .steamHoverPreview .steamMediaNavBtn:hover,
        .steamHoverPreview .steamMediaNavBtn:focus {
            opacity: 1;
            background: rgba(0, 0, 0, 0.74);
            outline: 1px solid #99d2f7;
        }
        .steamHoverPreview .steamMediaPrevBtn {
            left: 5px;
        }
        .steamHoverPreview .steamMediaNextBtn {
            right: 5px;
        }
        .steamHoverPreview .steamMediaCounter {
            position: absolute;
            top: 6px;
            right: 6px;
            padding: 1px 5px;
            background: rgba(0, 0, 0, 0.68);
            border-radius: 3px;
            color: #d6e8ee;
            font-size: 10px;
            line-height: 1.35;
        }
        .steamHoverPreview .steamMediaPlayBtn {
            position: relative;
            display: block;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            border: 0;
            background: #111;
            cursor: pointer;
            touch-action: manipulation;
        }
        .steamHoverPreview .steamMediaPlayBtn:hover .steamMediaPlayIcon,
        .steamHoverPreview .steamMediaPlayBtn:focus .steamMediaPlayIcon {
            background: rgba(0, 0, 0, 0.78);
            outline: 1px solid #99d2f7;
        }
        .steamHoverPreview .steamMediaPlayIcon {
            position: absolute;
            top: 50%;
            left: 50%;
            display: grid;
            place-items: center;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.62);
            color: #f2f2f2;
            font-size: 24px;
            line-height: 1;
            transform: translate(-50%, -50%);
        }
        .steamHoverPreview .steamMediaThumbStrip {
            display: flex;
            gap: 3px;
            margin-top: 4px;
            overflow-x: auto;
            scrollbar-width: thin;
            scrollbar-color: #40566a #151515;
        }
        .steamHoverPreview .steamMediaThumbStrip::-webkit-scrollbar {
            height: 6px;
        }
        .steamHoverPreview .steamMediaThumbStrip::-webkit-scrollbar-track {
            background: #151515;
        }
        .steamHoverPreview .steamMediaThumbStrip::-webkit-scrollbar-thumb {
            background: #40566a;
            border-radius: 999px;
        }
        .steamHoverPreview .steamMediaThumbBtn {
            position: relative;
            flex: 0 0 52px;
            width: 52px;
            height: 32px;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #111;
            border: 1px solid #333;
            border-radius: 2px;
            cursor: pointer;
            opacity: 0.74;
            touch-action: manipulation;
        }
        .steamHoverPreview .steamMediaThumbStripFit {
            overflow-x: hidden;
        }
        .steamHoverPreview .steamMediaThumbStripFit .steamMediaThumbBtn {
            flex: 1 1 0;
            width: auto;
            min-width: 0;
        }
        .steamHoverPreview .steamMediaThumbBtn:hover,
        .steamHoverPreview .steamMediaThumbBtn:focus {
            opacity: 1;
            border-color: #99d2f7;
            outline: 1px solid rgba(153, 210, 247, 0.62);
        }
        .steamHoverPreview .steamMediaThumbActive {
            opacity: 1;
            border-color: #99d2f7;
            box-shadow: 0 0 0 1px rgba(153, 210, 247, 0.45);
        }
        .steamHoverPreview .steamMediaThumbImage {
            display: block;
            width: 100%;
            height: 100%;
            margin: 0;
            border-radius: 0;
            object-fit: cover;
        }
        .steamHoverPreview .steamMediaThumbPlayIcon {
            position: absolute;
            right: 3px;
            bottom: 3px;
            display: grid;
            place-items: center;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.72);
            color: #f2f2f2;
            font-size: 10px;
            line-height: 1;
        }
        .steamHoverPreview strong {
            color: #f2f2f2;
        }
        .steamHoverPreview a,
        .steamHoverPreview a:visited {
            color: #99d2f7 !important;
            text-decoration: underline;
            cursor: pointer;
        }
        .steamHoverPreview a:hover,
        .steamHoverPreview a:visited:hover {
            color: #c7ebff !important;
        }
        .steamHoverPreview .steamRating,
        .steamHoverPreview .steamTags,
        .steamHoverPreview .steamMetaRow,
        .steamHoverPreview .steamReleaseDate {
            margin-top: 8px;
            font-size: 12px;
            color: #c1cccc;
        }
        .steamHoverPreview .steamReleaseDate,
        .steamHoverPreview .steamMetaRow {
            margin-top: 2px;
            font-size: 11px;
            color: #a8b4b8;
        }
        .steamHoverPreview .steamMetaRow {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: nowrap;
            gap: 3px 10px;
        }
        .steamHoverPreview .steamAppIdControl {
            display: inline-flex;
            align-items: baseline;
            gap: 4px;
            flex-shrink: 0;
        }
        .steamHoverPreview .copyAppIdBtn {
            display: inline;
            margin: 0;
            padding: 0;
            border: 0;
            background: transparent;
            color: #99d2f7;
            font: inherit;
            text-decoration: underline;
            cursor: pointer;
        }
        .steamHoverPreview .copyAppIdBtn:hover {
            color: #c7ebff;
        }
        .steamHoverPreview .steamDbLink,
        .steamHoverPreview .steamDbLink:visited {
            display: inline-block;
            padding: 0 2px;
            color: #99d2f7 !important;
            font-weight: bold;
            line-height: 1;
            text-decoration: none;
        }
        .steamHoverPreview .steamDbLink:hover,
        .steamHoverPreview .steamDbLink:visited:hover {
            color: #c7ebff !important;
            text-decoration: underline;
        }
        .steamHoverPreview .threadTagList {
            display: flex;
            justify-content: flex-end;
            flex-wrap: nowrap;
            flex: 1 1 auto;
            gap: 0 4px;
            margin-left: auto;
            min-width: 0;
            overflow: hidden;
        }
        .steamHoverPreview .steamMetaRowTagsOnly .threadTagList {
            justify-content: flex-start;
            margin-left: 0;
        }
        .steamHoverPreview .threadTag {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 0 1 auto;
            font-weight: bold;
            min-width: 0;
            max-width: 100%;
        }
        .steamHoverPreview .threadTagText {
            font-size: 1em;
        }
        .steamHoverPreview .ratingStars {
            color: #f5c518;
            margin-right: 6px;
            letter-spacing: 1px;
            font-size: 14px;
            display: inline-block;
            vertical-align: middle;
        }
        .steamHoverPreview .ratingText {
            vertical-align: middle;
        }
        .steamHoverPreview .loadingContainer {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .steamHoverPreview .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid #3a3a3a;
            border-top-color: #99d2f7;
            border-radius: 50%;
            animation: steamPreviewSpinner 0.8s linear infinite;
            flex-shrink: 0;
        }
        @keyframes steamPreviewSpinner {
            to { transform: rotate(360deg); }
        }
        .steamHoverPreview .tipActions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 14px;
            margin-top: 8px;
            padding-top: 2px;
            border-top: none;
        }
        .steamHoverPreview .steamMediaExpandBtn {
            position: absolute;
            top: 6px;
            left: 6px;
            display: grid;
            place-items: center;
            width: 24px;
            height: 24px;
            margin: 0;
            padding: 0;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: rgba(0, 0, 0, 0.58);
            color: #f2f2f2;
            font: bold 16px/1 Arial, sans-serif;
            cursor: pointer;
            opacity: 0.82;
            touch-action: manipulation;
        }
        .steamHoverPreview .steamMediaExpandBtn:hover,
        .steamHoverPreview .steamMediaExpandBtn:focus {
            opacity: 1;
            background: rgba(0, 0, 0, 0.74);
            outline: 1px solid #99d2f7;
        }
        .steamHoverPreview .steamTheatreIcon,
        .steamPreviewTheatre .steamTheatreIcon {
            position: relative;
            display: block;
            width: 17px;
            height: 11px;
            border: 2px solid currentColor;
            border-radius: 1px;
            box-sizing: border-box;
        }
        .steamHoverPreview .steamTheatreIcon::after,
        .steamPreviewTheatre .steamTheatreIcon::after {
            content: '';
            position: absolute;
            left: 4px;
            right: 4px;
            bottom: -5px;
            height: 2px;
            background: currentColor;
            opacity: 0.72;
        }
        .steamHoverPreview .steamMediaExpandHidden {
            display: none;
        }
        .steamPreviewTheatre {
            position: fixed;
            inset: 0;
            display: none;
            place-items: center;
            padding: 48px;
            background: rgba(0, 0, 0, 0.78);
            color: #c7d5e0;
            font: 12px/1.45 Arial, Helvetica, sans-serif;
            z-index: 2147483647;
            box-sizing: border-box;
        }
        .steamPreviewTheatreOpen {
            display: grid;
        }
        .steamPreviewTheatreShell {
            display: grid;
            grid-template-rows: 34px minmax(0, 1fr) auto;
            width: min(1416px, calc(100vw - 96px));
            height: min(866px, calc(100vh - 96px));
            overflow: hidden;
            background: #050505;
            box-shadow: 0 8px 36px rgba(0, 0, 0, 0.72);
        }
        .steamPreviewTheatreVideoMode .steamPreviewTheatreShell {
            grid-template-rows: 34px minmax(0, 1fr) auto 33px;
        }
        .steamPreviewTheatre:fullscreen {
            padding: 0;
            background: #000;
        }
        .steamPreviewTheatre:fullscreen .steamPreviewTheatreShell {
            width: 100vw;
            height: 100vh;
        }
        .steamPreviewTheatreHeader {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
            padding: 0 96px;
            background: #20262e;
            box-sizing: border-box;
        }
        .steamPreviewTheatreTitle {
            overflow: hidden;
            color: #b8c6d4;
            font-size: 13px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .steamPreviewTheatreHeaderControls {
            position: absolute;
            top: 5px;
            right: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .steamPreviewTheatreBtn,
        .steamPreviewTheatreNavBtn {
            margin: 0;
            border: 0;
            color: #f2f2f2;
            cursor: pointer;
            touch-action: manipulation;
        }
        .steamPreviewTheatreBtn {
            display: grid;
            place-items: center;
            width: 24px;
            height: 24px;
            padding: 0;
            background: transparent;
            font: bold 21px/1 Arial, sans-serif;
            opacity: 0.82;
        }
        .steamPreviewTheatreBtn:hover,
        .steamPreviewTheatreBtn:focus {
            opacity: 1;
            outline: 1px solid #99d2f7;
        }
        .steamPreviewTheatreStage {
            position: relative;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            background: #050505;
        }
        .steamPreviewTheatreViewport {
            display: grid;
            place-items: center;
            width: 100%;
            height: 100%;
        }
        .steamPreviewTheatreImage,
        .steamPreviewTheatrePoster,
        .steamPreviewTheatreVideo {
            display: block;
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            margin: 0;
            object-fit: contain;
            background: #000;
        }
        .steamPreviewTheatreVideoWrap {
            position: relative;
            width: 100%;
            height: 100%;
            background: #000;
        }
        .steamPreviewTheatreVideoWrap:fullscreen {
            width: 100vw;
            height: 100vh;
        }
        .steamPreviewTheatreVideoControls {
            display: grid;
            gap: 6px;
            align-content: end;
            min-height: 72px;
            padding: 18px 20px 12px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.76) 0%, rgba(0, 0, 0, 0.54) 48%, rgba(0, 0, 0, 0.16) 82%, rgba(0, 0, 0, 0) 100%);
            color: #f2f2f2;
            box-sizing: border-box;
        }
        .steamPreviewTheatreVideoControlsFullscreen {
            display: none;
        }
        .steamPreviewTheatreVideoWrap:fullscreen .steamPreviewTheatreVideoControlsFullscreen {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            display: grid;
            min-height: 96px;
            padding: 34px 20px max(16px, env(safe-area-inset-bottom));
            z-index: 3;
        }
        .steamPreviewTheatre:fullscreen .steamPreviewTheatreVideoControls {
            min-height: 72px;
            padding: 18px 20px 12px;
        }
        .steamPreviewTheatreVideoSeek {
            width: 100%;
            height: 10px;
            margin: 0;
            accent-color: #1a9fff;
            cursor: pointer;
        }
        .steamPreviewTheatreVideoControlRow {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
        }
        .steamPreviewTheatreVideoControlSpacer {
            flex: 1 1 auto;
        }
        .steamPreviewTheatreVideoControlBtn {
            display: grid;
            place-items: center;
            width: 28px;
            height: 24px;
            margin: 0;
            padding: 0;
            background: transparent;
            border: 0;
            color: #f2f2f2;
            font: bold 18px/1 Arial, Helvetica, sans-serif;
            cursor: pointer;
            opacity: 0.86;
            touch-action: manipulation;
        }
        .steamPreviewTheatreVideoControlBtn:hover,
        .steamPreviewTheatreVideoControlBtn:focus {
            opacity: 1;
            outline: 1px solid #99d2f7;
        }
        .steamPreviewTheatreVideoTime {
            flex: 0 0 auto;
            color: #d6e8ee;
            font-size: 13px;
            white-space: nowrap;
        }
        .steamPreviewTheatreNavBtn {
            position: absolute;
            top: 50%;
            display: grid;
            place-items: center;
            width: 48px;
            height: 72px;
            padding: 0;
            background: rgba(0, 0, 0, 0.26);
            font: bold 52px/1 Arial, sans-serif;
            opacity: 0.62;
            transform: translateY(-50%);
        }
        .steamPreviewTheatreNavBtn:hover,
        .steamPreviewTheatreNavBtn:focus {
            opacity: 1;
            background: rgba(0, 0, 0, 0.42);
            outline: 1px solid #99d2f7;
        }
        .steamPreviewTheatrePrevBtn {
            left: 0;
        }
        .steamPreviewTheatreNextBtn {
            right: 0;
        }
        .steamPreviewTheatreFooter {
            position: relative;
            display: grid;
            place-items: center;
            min-height: 33px;
            padding: 7px 72px 8px;
            background: #20262e;
            box-sizing: border-box;
        }
        .steamPreviewTheatreVideoMode .steamPreviewTheatreFooter {
            padding: 7px 72px 8px;
        }
        .steamPreviewTheatreFooterActions {
            position: absolute;
            top: 50%;
            left: 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            max-width: calc(50% - 72px);
            min-width: 0;
            overflow: hidden;
            transform: translateY(-50%);
        }
        .steamPreviewTheatreFooterActions a {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            min-width: 0;
            overflow: hidden;
            color: #99d2f7 !important;
            font: 12px/1.35 Arial, Helvetica, sans-serif;
            text-decoration: underline;
            text-overflow: ellipsis;
            white-space: nowrap;
            opacity: 0.92;
            touch-action: manipulation;
        }
        .steamPreviewTheatreFooterActions a:hover,
        .steamPreviewTheatreFooterActions a:focus {
            color: #c7ebff !important;
            opacity: 1;
            outline: none;
        }
        .steamPreviewTheatreCounter {
            color: #9fb0bf;
            font-size: 12px;
            text-align: center;
        }
        .steamPreviewTheatreFooterControlsHost {
            position: absolute;
            top: 50%;
            right: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
            transform: translateY(-50%);
        }
        .steamPreviewTheatreError {
            display: grid;
            place-items: center;
            gap: 8px;
            width: 100%;
            height: 100%;
            padding: 24px;
            color: #d6e8ee;
            text-align: center;
            box-sizing: border-box;
        }

        .steamHoverPreview { box-sizing: content-box; width: auto; max-width: 420px; max-inline-size: min(420px, calc(100vw - 38px)); max-block-size: calc(100vh - 38px); overflow: auto; overscroll-behavior: contain; background: var(--steam-preview-bg); color: var(--steam-preview-fg); border-color: var(--steam-preview-border); font-family: inherit; }
        .steamHoverPreview[data-theme="dark"] { --steam-preview-bg:#1c1c1c; --steam-preview-fg:#c1cccc; --steam-preview-muted:#a8b4b8; --steam-preview-link:#99d2f7; --steam-preview-strong:#f2f2f2; --steam-preview-border:#5c5c5c; color-scheme:dark; }
        .steamHoverPreview[data-theme="light"] { --steam-preview-bg:#f0f0f0; --steam-preview-fg:#111; --steam-preview-muted:#555; --steam-preview-link:#0645ad; --steam-preview-strong:#111; --steam-preview-border:#555; color-scheme:light; }
        .steamHoverPreview p, .steamHoverPreview .steamTags, .steamHoverPreview .steamRating { color:var(--steam-preview-fg); }
        .steamHoverPreview strong { color:var(--steam-preview-strong); }
        .steamHoverPreview a, .steamHoverPreview a:visited, .steamHoverPreview .copyAppIdBtn, .steamHoverPreview .steamDbLink { color:var(--steam-preview-link) !important; }
        .steamHoverPreview .steamMetaRow, .steamHoverPreview .steamReleaseDate, .steamHoverPreview .steamMatchNote { color:var(--steam-preview-muted); }
        .steamHoverPreview button, .steamHoverPreview input { font-family:inherit; }
        .steamHoverPreview button:focus-visible, .steamHoverPreview a:focus-visible, .steamHoverPreview input:focus-visible, .steamPreviewTheatre :focus-visible { outline:2px solid #58a6ff; outline-offset:2px; }
        .steamHoverPreview .steamMetadataRetry, .steamHoverPreview .steamCorrectToggle, .steamHoverPreview .steamSourceAction { border:0; padding:0; background:none; color:var(--steam-preview-link); text-decoration:underline; cursor:pointer; font:inherit; }
        .steamHoverPreview .tipActions { flex-wrap:wrap; gap:6px 16px; }
        .steamHoverPreview .steamSourceAction, .steamPreviewTheatreFooterActions button { display:inline-flex; align-items:center; gap:4px; border:0; background:transparent; color:inherit; font:inherit; padding:0; cursor:pointer; text-decoration:underline; }
        .steamHoverTip { box-shadow:0 2px 8px rgba(0,0,0,0.25); }
        .steamHoverTip .tipActions { gap:0; padding-top:6px; border-top:1px solid rgba(255,255,255,0.1); }
        .steamHoverPreview[data-preview-state="error"] .tipActions { gap:8px 20px; margin-bottom:8px; }
        .steamHoverPreview[data-preview-state="error"] .steamInlineStatus:not(:empty) { display:block; margin-top:6px; }
        .steamHoverPreview .steamSourceAction { color:var(--steam-preview-link) !important; }
        .steamHoverPreview .steamSourceAction:hover { color:#c7ebff !important; }
        .steamHoverPreview[data-theme="light"] .steamSourceAction:hover { color:#043b91 !important; }
        .steamPreviewTheatreFooterActions button { color:#66c0f4 !important; }
        .steamHoverPreview .steamAction, .steamPreviewTheatre .steamAction { display:inline-flex; align-items:center; gap:4px; }
        .steamHoverPreview .steamActionIcon, .steamPreviewTheatre .steamActionIcon { display:inline-block; flex:0 0 15px; width:15px !important; height:15px !important; margin:0 !important; vertical-align:-2px; }
        .steamHoverPreview .steamCorrection { margin-top:8px; padding-top:7px; border-top:1px solid var(--steam-preview-border); }
        .steamHoverPreview .steamCorrection[hidden] { display:none; }
        .steamHoverPreview .steamCorrection input { width:100%; box-sizing:border-box; margin:5px 0; padding:5px; border:1px solid var(--steam-preview-border); background:var(--steam-preview-bg); color:var(--steam-preview-fg); }
        .steamHoverPreview .steamCorrectionButtons { display:flex; flex-wrap:wrap; gap:6px; }
        .steamHoverPreview .steamCandidateList { display:grid; gap:3px; margin:5px 0; max-height:150px; overflow:auto; }
        .steamHoverPreview .steamCandidateList button { text-align:left; }
        .steamHoverPreview .steamCardUtility { display:flex; align-items:center; gap:10px; margin-top:7px; font-size:11px; }
        .steamHoverPreview .steamMatchNote { font-size:11px; margin-top:3px; }
        .steamHoverPreview .threadTagList { flex-wrap:wrap; }
        .steamHoverPreview .threadTag { overflow-wrap:anywhere; }
        .steamHoverPreview .steamMediaImage { object-fit:contain; }
        .steamImageUnavailable { display:grid; place-items:center; width:100%; height:100%; min-height:36px; color:#c7d5e0; background:#151515; font:12px/1.4 Arial,sans-serif; }
        .steamPreviewAnnouncer { position:fixed; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
        .steamPreviewTheatre { padding:clamp(8px,4vw,48px); }
        .steamPreviewTheatreShell { width:min(1416px,calc(100vw - 16px)); height:min(866px,calc(100vh - 16px)); }
        .steamPreviewTheatreFooterActions { max-width:none; flex-wrap:wrap; gap:8px; }
        @media (max-width:600px) { .steamPreviewTheatreHeader { padding:0 40px 0 8px; } .steamPreviewTheatreFooter { gap:6px; min-height:40px; height:auto; flex-wrap:wrap; } .steamPreviewTheatreFooterActions { font-size:11px; } }
        @media (prefers-reduced-motion:reduce) { .steamHoverPreview { transition:none; } .steamHoverPreview .spinner { animation:none; } }
    `;
    let injectedStyle = null;
    if (typeof addStyle === 'function') {
        try {
            injectedStyle = addStyle(style.textContent);
        } catch {
            (document.head || document.documentElement).appendChild(style);
        }
    } else (document.head || document.documentElement).appendChild(style);
    document.body.append(tip, theatre, status);

    let disposed = false;
    let suppressFocusPreview = false;
    let currentSource = null;
    let currentHoveredLink = null;
    let currentData = null;
    let currentError = null;
    let hoverId = 0;
    let requestAbort = null;
    let nameSearchAbort = null;
    let nameSearchTimer = null;
    let nameSearchId = 0;
    let showTimeout = null;
    let hideTimeout = null;
    let trackingMove = false;
    let lastMoveEvent = null;
    let positionFrame = null;
    let currentMedia = [];
    let currentMediaIndex = 0;
    let currentMediaTitle = '';
    let currentStoreUrl = '';
    let theatreMedia = [];
    let theatreMediaIndex = 0;
    let theatreMediaTitle = '';
    let theatreMode = 'screenshots';
    let theatreAllMedia = [];
    let previousDocumentOverflow = '';
    let theatreTrigger = null;
    let inertElements = [];
    const announce = (text) => {
        status.textContent = text;
    };

    function disableForOperation(button) {
        if (!button) return false;
        const hadFocus = document.activeElement === button;
        button.disabled = true;
        // Disabling a focused button otherwise blurs to the page and closes the
        // hover card while its requested retry/correction is still in flight.
        if (hadFocus) focus(theatre.contains(button) ? theatre : tip);
        return hadFocus;
    }

    function restoreOperationFocus(button, hadFocus) {
        if (hadFocus && button?.isConnected && (document.activeElement === tip || document.activeElement === theatre))
            focus(button);
    }

    function refreshSettings() {
        const settings = client.getSettings?.() || {};
        tip.dataset.theme =
            settings.theme && settings.theme !== 'site' ? settings.theme : adapter.defaultTheme || 'dark';
        if (currentSource && currentHoveredLink?.isConnected) {
            const source = adapter.getSource(currentHoveredLink);
            if (source?.key === currentSource.key) currentSource = source;
            const meta = tip.querySelector('[data-meta-host]');
            if (meta) meta.innerHTML = renderMeta(currentData);
        }
        if (tip.style.display === 'block') requestPosition();
    }

    function sourceActions(data = currentData) {
        const actions = [];
        if (data?.storeUrl) actions.push({ id: 'steam', label: 'Open on Steam', icon: 'steam', href: data.storeUrl });
        else if (currentSource)
            actions.push({
                id: 'steam',
                label: 'Search on Steam',
                icon: 'steam',
                href: `https://store.steampowered.com/search/?term=${encodeURIComponent(currentSource.title)}`
            });
        return actions.concat(adapter.getActions?.(currentSource, data) || []);
    }

    function renderActions(data = currentData) {
        return sourceActions(data)
            .map((action) => {
                const icon = previewIcon(action.icon);
                const label = escapeHtml(action.label);
                const href = safePreviewUrl(action.href);
                return href
                    ? `<a class="steamAction" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${icon}${label}</a>`
                    : `<button type="button" class="steamAction steamSourceAction" data-source-action="${escapeHtml(action.id)}">${icon}${label}</button>`;
            })
            .join('');
    }

    function renderMeta(data) {
        const rawId = Number(data?.appId || data?.steam_appid);
        const appId = Number.isSafeInteger(rawId) && rawId > 0 ? String(rawId) : '';
        const app =
            adapter.showAppId && appId
                ? `<span class="steamAppIdControl"><strong>AppID:</strong> <button type="button" class="copyAppIdBtn" data-app-id="${appId}" aria-label="Copy Steam AppID" title="Copy Steam AppID">${appId}</button><a class="steamDbLink" href="https://steamdb.info/app/${appId}/" target="_blank" rel="noopener noreferrer" title="Open SteamDB" aria-label="Open SteamDB">${previewIcon('steamdb')}</a></span>`
                : '';
        const tags = (currentSource?.threadTags || [])
            .map((tag) => {
                const text = typeof tag === 'string' ? tag : tag.text;
                const color = /^#[0-9a-f]{6}$/i.test(tag.color || '') ? ` style="color:${tag.color}"` : '';
                return `<span class="threadTag"${color} title="${escapeHtml(text)}">${escapeHtml(text)}</span>`;
            })
            .join(' ');
        return app || tags
            ? `<div class="steamMetaRow${app ? '' : ' steamMetaRowTagsOnly'}">${app}${tags ? `<span class="threadTagList" aria-label="Thread tags">${tags}</span>` : ''}</div>`
            : '';
    }

    function renderLoading() {
        cancelNameSearch();
        stopActiveVideo();
        tip.dataset.previewState = 'loading';
        tip.setAttribute('aria-busy', 'true');
        tip.removeAttribute('aria-labelledby');
        delete tip.dataset.previewAppId;
        tip.innerHTML = `<div class="loadingContainer" role="status"><div class="spinner" aria-hidden="true"></div><span>Loading Steam tags for <strong>${escapeHtml(currentSource.title)}</strong>…</span></div>`;
        makeVisible();
    }

    function renderCard(data) {
        cancelNameSearch();
        trackingMove = false;
        currentData = data;
        currentError = null;
        stopActiveVideo();
        currentMedia = getRenderMedia(data);
        currentMediaIndex = 0;
        currentMediaTitle = data.name || currentSource.title;
        currentStoreUrl = data.storeUrl || '';
        const release = previewReleaseText(data);
        const releaseHtml = escapeHtml(release).replace(/^(Released:|Planned release:)/, '<strong>$1</strong>');
        const parent =
            data.match?.kind === 'parent' || data.match?.parentChain?.length
                ? '<p class="steamMatchNote">Showing the base game</p>'
                : '';
        tip.dataset.previewState = 'ready';
        tip.setAttribute('aria-busy', 'false');
        tip.setAttribute('aria-labelledby', `${idPrefix}-title`);
        tip.dataset.previewAppId = String(data.appId || data.steam_appid || '');
        tip.innerHTML = `${renderMediaCarousel(currentMedia, currentMediaTitle)}<p class="steamGameTitle" id="${idPrefix}-title"><strong>${escapeHtml(currentMediaTitle)}</strong></p>${release ? `<p class="steamReleaseDate">${releaseHtml}</p>` : ''}<div data-meta-host>${renderMeta(data)}</div>${parent}<p>${escapeHtml(data.short_description || 'No description available.')}</p><p class="steamRating" aria-live="polite">${previewReviewsMarkup(data)}</p><p class="steamTags" aria-live="polite">${previewTagsMarkup(data)}</p><div class="tipActions">${renderActions(data)}</div>${utilityMarkup()}`;
        makeVisible();
    }

    function utilityMarkup() {
        return '<div class="steamCardUtility"><button type="button" class="steamCorrectToggle" aria-expanded="false">Wrong game?</button><span class="steamInlineStatus" role="status"></span></div><div class="steamCorrection" hidden></div>';
    }

    function renderFailure(error) {
        cancelNameSearch();
        trackingMove = false;
        currentData = null;
        currentError = error;
        stopActiveVideo();
        currentMedia = [];
        currentStoreUrl = '';
        tip.dataset.previewState = 'error';
        tip.setAttribute('aria-busy', 'false');
        tip.removeAttribute('aria-labelledby');
        delete tip.dataset.previewAppId;
        const ambiguous = error?.code === 'AMBIGUOUS_MATCH';
        const label = ambiguous
            ? 'Choose the correct Steam game'
            : error?.code === 'NO_MATCH'
              ? 'No confident Steam match found'
              : 'Steam information unavailable';
        tip.innerHTML = `<p><strong>${escapeHtml(currentSource.title)}</strong></p><p>${label}.</p><div data-meta-host>${renderMeta(null)}</div><div class="tipActions">${renderActions(null)}</div><button type="button" class="steamCorrectToggle" aria-expanded="false">Choose Steam game…</button><span class="steamInlineStatus" role="status"></span><div class="steamCorrection" hidden></div>`;
        makeVisible();
        if (ambiguous) openCorrection(false);
    }

    function patchMetadata(data) {
        if (
            !currentData ||
            String(data?.appId || data?.steam_appid) !== String(currentData.appId || currentData.steam_appid)
        )
            return;
        currentData = data;
        const tags = tip.querySelector('.steamTags');
        const reviews = tip.querySelector('.steamRating');
        // Each field owns its small subtree; media DOM and controls are never replaced here.
        if (tags && tags.innerHTML !== previewTagsMarkup(data)) tags.innerHTML = previewTagsMarkup(data);
        if (reviews && reviews.innerHTML !== previewReviewsMarkup(data)) reviews.innerHTML = previewReviewsMarkup(data);
        requestPosition();
    }

    async function show(source, link = source?.link, event = null, options = {}) {
        if (disposed || !source) return;
        cancelNameSearch();
        cancel(showTimeout);
        cancel(hideTimeout);
        if (isTheatreOpen()) closeTheatre(false);
        requestAbort?.abort();
        requestAbort = new (window.AbortController || globalThis.AbortController)();
        const signal = requestAbort.signal;
        const thisId = ++hoverId;
        currentHoveredLink?.removeAttribute('aria-controls');
        currentSource = source;
        currentHoveredLink = link;
        currentData = null;
        currentError = null;
        lastMoveEvent = event;
        trackingMove = Boolean(event?.pageX != null);
        const cached = client.peekPreview(source);
        if (cached) renderCard(cached);
        else renderLoading();
        try {
            const data = await client.loadPreview(source, { priority: 'hover', signal, force: options.force === true });
            if (disposed || signal.aborted || thisId !== hoverId || currentSource?.key !== source.key) return;
            if (cached && String(cached.appId) === String(data.appId)) patchMetadata(data);
            else renderCard(data);
            trackingMove = false;
        } catch (error) {
            if (
                disposed ||
                signal.aborted ||
                thisId !== hoverId ||
                error?.code === 'ABORTED' ||
                error?.name === 'AbortError'
            )
                return;
            trackingMove = false;
            if (!cached) renderFailure(error);
        }
    }

    function queueShow(link, event) {
        const source = adapter.getSource(link);
        if (!source) return;
        cancel(hideTimeout);
        if (currentSource?.key === source.key && tip.style.display === 'block') return;
        cancel(showTimeout);
        if (client.peekPreview(source)) void show(source, link, event);
        else
            showTimeout = schedule(() => {
                void show(source, link, event);
            }, 120);
    }

    function focusPreviewCard() {
        const controls = [...tip.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')];
        const firstVisible = controls.find(
            (element) => element.getClientRects().length && window.getComputedStyle(element).visibility !== 'hidden'
        );
        focus(firstVisible || tip);
    }

    function makeVisible() {
        tip.style.display = 'block';
        tip.style.opacity = '1';
        tip.style.pointerEvents = 'auto';
        tip.setAttribute('aria-hidden', 'false');
        currentHoveredLink?.setAttribute('aria-controls', tip.id);
        positionTip();
    }

    function hide({ restoreFocus = false } = {}) {
        cancelNameSearch();
        if (isTheatreOpen()) closeTheatre(false);
        cancel(showTimeout);
        cancel(hideTimeout);
        ++hoverId;
        requestAbort?.abort();
        requestAbort = null;
        stopActiveVideo();
        tip.style.display = 'none';
        tip.style.opacity = '0';
        tip.style.pointerEvents = 'none';
        tip.setAttribute('aria-hidden', 'true');
        tip.setAttribute('aria-busy', 'false');
        tip.dataset.previewState = 'hidden';
        delete tip.dataset.previewAppId;
        const previousLink = currentHoveredLink;
        currentHoveredLink?.removeAttribute('aria-controls');
        currentSource = null;
        currentHoveredLink = null;
        currentData = null;
        currentError = null;
        trackingMove = false;
        currentMedia = [];
        if (restoreFocus) {
            suppressFocusPreview = true;
            focus(previousLink);
            suppressFocusPreview = false;
        }
    }

    function scheduleHide() {
        cancel(showTimeout);
        cancel(hideTimeout);
        hideTimeout = schedule(() => {
            if (
                isTheatreOpen() ||
                tip.matches(':hover') ||
                currentHoveredLink?.matches(':hover') ||
                tip.contains(document.activeElement) ||
                document.activeElement === currentHoveredLink
            )
                return;
            hide();
        }, HIDE_DELAY);
    }

    function positionTip() {
        if (disposed || tip.style.display !== 'block') return;
        const anchor = currentHoveredLink?.getBoundingClientRect?.();
        const scrollX = window.scrollX || 0;
        const scrollY = window.scrollY || 0;
        const width = tip.offsetWidth;
        const height = tip.offsetHeight;
        const pointX = lastMoveEvent?.pageX ?? (anchor?.right ?? 0) + scrollX;
        const pointY = lastMoveEvent?.pageY ?? (anchor?.top ?? 0) + scrollY;
        let x = pointX + 15;
        let y = pointY + 15;
        if (x + width > scrollX + window.innerWidth - 10) x = pointX - width - 15;
        if (y + height > scrollY + window.innerHeight - 10) y = pointY - height - 15;
        tip.style.left = `${Math.max(scrollX + 10, Math.min(x, scrollX + window.innerWidth - width - 10))}px`;
        tip.style.top = `${Math.max(scrollY + 10, Math.min(y, scrollY + window.innerHeight - height - 10))}px`;
    }

    function requestPosition() {
        if (positionFrame != null || disposed) return;
        positionFrame = window.requestAnimationFrame(() => {
            positionFrame = null;
            positionTip();
        });
    }

    function cancelNameSearch() {
        ++nameSearchId;
        cancel(nameSearchTimer);
        nameSearchTimer = null;
        nameSearchAbort?.abort();
        nameSearchAbort = null;
        const button = tip.querySelector('.steamNameSearchForm button[type="submit"]');
        if (button) button.disabled = false;
    }

    function updateSuggestions(
        panel,
        candidates,
        emptyText = 'No suggestions found. Try a shorter title or enter a Steam AppID or URL.'
    ) {
        const list = panel.querySelector('.steamCandidateList');
        const empty = panel.querySelector('.steamCandidateEmpty');
        if (list) list.innerHTML = candidateMarkup(candidates);
        if (empty) {
            empty.hidden = candidates.length > 0;
            empty.textContent = emptyText;
        }
        requestPosition();
    }

    function openCorrection(focusInput = true) {
        const panel = tip.querySelector('.steamCorrection');
        if (!panel || !currentSource) return;
        cancelNameSearch();
        const candidates = currentError?.candidates || currentData?.match?.candidates || [];
        panel.hidden = false;
        panel.setAttribute('role', 'group');
        panel.setAttribute('aria-label', 'Choose a Steam game');
        panel.innerHTML = `<form class="steamNameSearchForm"><label for="${idPrefix}-search-name">Search by name</label><input id="${idPrefix}-search-name" name="steamGameTitle" type="search" maxlength="200" autocomplete="off" value="${escapeHtml(currentSource.title.slice(0, 200))}" required><button type="submit">Search</button><p class="steamNameSearchStatus" role="status" aria-live="polite"></p></form><p>Closest names:</p><div class="steamCandidateList"></div><p class="steamCandidateEmpty"></p><form class="steamCorrectionForm"><label for="${idPrefix}-match">Steam AppID or store URL</label><input id="${idPrefix}-match" name="steamAppId" autocomplete="off" inputmode="url" required><div class="steamCorrectionButtons"><button type="submit">Use this game</button><button type="button" data-correction-reset>Reset match</button>${adapter.findAppIds ? '<button type="button" data-find-source>Find Steam link in source</button>' : ''}<button type="button" data-correction-close>Cancel</button></div><p class="steamCorrectionStatus" role="status"></p></form>`;
        updateSuggestions(panel, candidates);
        tip.querySelector('.steamCorrectToggle')?.setAttribute('aria-expanded', 'true');
        if (focusInput) focus(panel.querySelector('[name="steamGameTitle"]'));
        requestPosition();
    }

    async function searchCorrectionNames(force = false) {
        const panel = tip.querySelector('.steamCorrection');
        const source = currentSource;
        if (!panel || panel.hidden || !source) return;
        cancelNameSearch();
        const input = panel.querySelector('[name="steamGameTitle"]');
        const query = input.value.trim();
        const message = panel.querySelector('.steamNameSearchStatus');
        if (!query) {
            updateSuggestions(panel, [], 'Enter a title to search, or use a Steam AppID or URL.');
            message.textContent = '';
            return;
        }
        const operation = nameSearchId;
        const abort = new (window.AbortController || globalThis.AbortController)();
        nameSearchAbort = abort;
        const button = panel.querySelector('.steamNameSearchForm button[type="submit"]');
        const hadFocus = disableForOperation(button);
        updateSuggestions(panel, [], '');
        message.textContent = 'Searching Steam…';
        const current = () =>
            !disposed &&
            !abort.signal.aborted &&
            operation === nameSearchId &&
            source.key === currentSource?.key &&
            panel.isConnected &&
            !panel.hidden &&
            panel.querySelector('[name="steamGameTitle"]') === input;
        try {
            const result = await client.searchGames(query, { signal: abort.signal, force });
            if (!current()) return;
            updateSuggestions(panel, result.candidates);
            message.textContent = result.partial
                ? 'Some results could not load. Showing available suggestions.'
                : result.candidates.length
                  ? 'Select a game from the suggestions.'
                  : '';
        } catch (error) {
            if (!current() || error?.code === 'ABORTED') return;
            updateSuggestions(panel, [], 'Try another title or enter a Steam AppID or URL.');
            message.textContent = 'Search could not load. Press Search to try again.';
        } finally {
            if (operation === nameSearchId) {
                nameSearchAbort = null;
                if (button.isConnected) button.disabled = false;
                restoreOperationFocus(button, hadFocus);
                requestPosition();
            }
        }
    }

    function scheduleNameSearch(input) {
        cancelNameSearch();
        const panel = input.closest('.steamCorrection');
        if (!panel || panel.hidden) return;
        updateSuggestions(panel, [], '');
        panel.querySelector('.steamNameSearchStatus').textContent = input.value.trim()
            ? 'Searching Steam…'
            : 'Enter a title to search.';
        if (input.value.trim().length < 2) {
            panel.querySelector('.steamNameSearchStatus').textContent = input.value.trim()
                ? 'Press Search to search this title.'
                : 'Enter a title to search.';
            return;
        }
        nameSearchTimer = schedule(() => {
            nameSearchTimer = null;
            void searchCorrectionNames();
        }, 350);
    }

    function candidateMarkup(candidates) {
        return candidates
            .slice(0, 8)
            .map(
                (candidate) =>
                    `<button type="button" data-candidate-app-id="${escapeHtml(candidate.appId)}">${escapeHtml(candidate.name || `Steam AppID ${candidate.appId}`)}</button>`
            )
            .join('');
    }

    function closeCorrection() {
        cancelNameSearch();
        const panel = tip.querySelector('.steamCorrection');
        if (panel) panel.hidden = true;
        const toggle = tip.querySelector('.steamCorrectToggle');
        toggle?.setAttribute('aria-expanded', 'false');
        focus(toggle);
        requestPosition();
    }

    async function applyCorrection(value, button) {
        cancelNameSearch();
        const source = currentSource;
        const generation = hoverId;
        const panel = tip.querySelector('.steamCorrection');
        const message = panel?.querySelector('.steamCorrectionStatus');
        if (!source) return;
        const hadFocus = disableForOperation(button);
        if (message) message.textContent = 'Checking Steam game and tags…';
        try {
            const data = await client.correctMatch(source, value);
            if (generation !== hoverId || source.key !== currentSource?.key) return;
            renderCard(data);
            announce('Steam match saved.');
            focus(tip.querySelector('.steamCorrectToggle'));
        } catch (error) {
            if (generation === hoverId && message?.isConnected)
                message.textContent = error?.message || 'Unable to validate this Steam game.';
        } finally {
            if (button?.isConnected) button.disabled = false;
            restoreOperationFocus(button, hadFocus);
        }
    }

    async function copyAppId(button) {
        const value = button.dataset.appId;
        let copied = false;
        try {
            if (window.navigator.clipboard?.writeText) {
                await window.navigator.clipboard.writeText(value);
                copied = true;
            }
        } catch {
            /* use selectable fallback */
        }
        if (!copied) {
            const input = document.createElement('textarea');
            input.value = value;
            input.style.cssText = 'position:fixed;left:-9999px;top:0';
            tip.appendChild(input);
            input.select();
            try {
                copied = document.execCommand('copy');
            } catch {
                /* manual copy below */
            }
            input.remove();
        }
        if (copied) {
            announce(`Steam AppID ${value} copied.`);
            const message = tip.querySelector('.steamInlineStatus');
            if (message) message.textContent = 'AppID copied';
            focus(button);
        } else {
            const message = tip.querySelector('.steamInlineStatus');
            if (message) {
                message.innerHTML = `<label>Copy AppID: <input readonly value="${escapeHtml(value)}" aria-label="Steam AppID to copy"></label>`;
                const input = message.querySelector('input');
                focus(input);
                input.select();
            }
            announce('Clipboard unavailable. The AppID is selected for manual copying.');
        }
    }

    async function runSourceAction(button) {
        if (button.disabled || !currentSource) return;
        const source = currentSource;
        const label = button.innerHTML;
        const hadFocus = disableForOperation(button);
        button.textContent = 'Opening…';
        try {
            await adapter.runAction(button.dataset.sourceAction, source, button);
            announce('Action opened.');
        } catch (error) {
            announce(error?.message || 'Action unavailable.');
            let host = tip.querySelector('.steamInlineStatus');
            const footer = button.closest('.steamPreviewTheatreFooterActions');
            if (footer) {
                host = footer.querySelector('.steamActionStatus');
                if (!host) {
                    host = document.createElement('span');
                    host.className = 'steamActionStatus';
                    host.setAttribute('role', 'status');
                    footer.appendChild(host);
                }
            }
            if (host && currentSource?.key === source.key) {
                host.textContent = `${error?.message || 'Action unavailable'}. `;
                const retry = document.createElement('button');
                retry.type = 'button';
                retry.className = 'steamMetadataRetry';
                retry.textContent = 'Retry';
                retry.addEventListener('click', () => {
                    void runSourceAction(button);
                });
                host.appendChild(retry);
                const href = safePreviewUrl(source.url);
                if (href) {
                    const link = document.createElement('a');
                    link.href = href;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = adapter.id === '1337x' ? ' Open torrent page' : ' Open source page';
                    host.appendChild(link);
                }
            }
        } finally {
            if (button.isConnected) {
                button.disabled = false;
                button.innerHTML = label;
            }
            restoreOperationFocus(button, hadFocus);
        }
    }

    function imageFailure(event) {
        const image = event.target;
        if (image?.tagName !== 'IMG') return;
        image.style.display = 'none';
        if (image.closest('.steamMediaThumbBtn')) return;
        const host = image.closest('.steamMediaViewport, .steamPreviewTheatreViewport');
        if (!host || host.querySelector('.steamImageUnavailable')) return;
        const placeholder = document.createElement('span');
        placeholder.className = 'steamImageUnavailable';
        placeholder.textContent = 'Image unavailable';
        host.appendChild(placeholder);
    }

    function getRenderMedia(data) {
        return normalizeSteamMedia(data);
    }

    function renderMediaItem(item, index, title) {
        if (!item) return '';
        const label = escapeHtml(item.alt || title || 'Steam media');
        if (item.type === 'video')
            return `<button type="button" class="steamMediaPlayBtn" data-media-index="${index}" aria-label="Play ${label}" title="Play video"><img class="steamMediaPoster" src="${escapeHtml(item.posterUrl)}" alt="${label}" loading="eager" decoding="async"><span class="steamMediaPlayIcon" aria-hidden="true">&#9658;</span></button>`;
        const url = item.source === 'screenshot' ? item.thumbUrl || item.url : item.url;
        return `<img class="steamMediaImage" src="${escapeHtml(url)}" alt="${label}" loading="eager" decoding="async">`;
    }

    function getCurrentSteamUrl() {
        return (
            safePreviewUrl(currentStoreUrl) ||
            `https://store.steampowered.com/search/?term=${encodeURIComponent(currentMediaTitle || theatreMediaTitle || 'Steam')}`
        );
    }

    function renderTheatreFooterActions() {
        return `<div class="steamPreviewTheatreFooterActions">${renderActions()}</div>`;
    }

    function openTheatre(index) {
        const selection = getTheatreSelection(index);
        if (!selection || isTheatreOpen()) return;
        theatreTrigger =
            document.activeElement && tip.contains(document.activeElement)
                ? document.activeElement
                : tip.querySelector('.steamMediaExpandBtn');
        theatreMode = selection.mode;
        theatreMedia = selection.items;
        theatreAllMedia = selection.allItems;
        theatreMediaIndex = selection.selectedIndex;
        theatreMediaTitle = currentMediaTitle || 'Steam media';
        stopActiveVideo();
        cancel(showTimeout);
        cancel(hideTimeout);
        theatre.classList.toggle('steamPreviewTheatreVideoMode', theatreMode === 'video');
        renderTheatre();
        previousDocumentOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        theatre.classList.add('steamPreviewTheatreOpen');
        theatre.setAttribute('aria-hidden', 'false');
        tip.style.display = 'none';
        tip.setAttribute('aria-hidden', 'true');
        inertElements = [...document.body.children]
            .filter((element) => element !== theatre && element !== status)
            .map((element) => [element, element.inert]);
        inertElements.forEach(([element]) => {
            element.inert = true;
        });
        trackingMove = false;
        focus(theatre.querySelector('.steamPreviewTheatreCloseBtn'));
        if (theatreMode === 'video') void playTheatreVideo();
    }

    function closeTheatre(restore = true) {
        if (!isTheatreOpen()) return;
        const fullscreen = document.fullscreenElement;
        if (fullscreen && (fullscreen === theatre || theatre.contains(fullscreen)))
            Promise.resolve(document.exitFullscreen?.()).catch(() => {});
        stopTheatreVideo();
        theatre.classList.remove('steamPreviewTheatreOpen', 'steamPreviewTheatreVideoMode');
        theatre.setAttribute('aria-hidden', 'true');
        theatre.innerHTML = '';
        document.documentElement.style.overflow = previousDocumentOverflow;
        inertElements.forEach(([element, inert]) => {
            element.inert = inert;
        });
        inertElements = [];
        theatreMedia = [];
        theatreAllMedia = [];
        theatreMediaIndex = 0;
        theatreMediaTitle = '';
        theatreMode = 'screenshots';
        if (currentSource && restore) {
            makeVisible();
            focus(theatreTrigger?.isConnected ? theatreTrigger : currentHoveredLink);
        }
        theatreTrigger = null;
    }

    function setActiveMedia(index) {
        if (!currentMedia.length) return;
        stopActiveVideo();
        currentMediaIndex = (index + currentMedia.length) % currentMedia.length;
        const viewport = tip.querySelector('.steamMediaViewport');
        if (viewport)
            viewport.innerHTML = renderMediaItem(currentMedia[currentMediaIndex], currentMediaIndex, currentMediaTitle);
        const counter = tip.querySelector('.steamMediaCounter');
        if (counter) counter.textContent = `${currentMediaIndex + 1} / ${currentMedia.length}`;
        tip.querySelector('.steamMediaExpandBtn')?.classList.toggle(
            'steamMediaExpandHidden',
            !canOpenMediaTheatre(currentMedia[currentMediaIndex])
        );
        tip.querySelectorAll('.steamMediaThumbBtn').forEach((button) => {
            const active = Number(button.dataset.mediaIndex) === currentMediaIndex;
            button.classList.toggle('steamMediaThumbActive', active);
            button.setAttribute('aria-current', String(active));
        });
        const active = tip.querySelector('.steamMediaThumbActive');
        const strip = active?.closest('.steamMediaThumbStrip');
        if (strip && active) {
            const outer = strip.getBoundingClientRect();
            const inner = active.getBoundingClientRect();
            if (inner.left < outer.left) strip.scrollLeft -= outer.left - inner.left;
            else if (inner.right > outer.right) strip.scrollLeft += inner.right - outer.right;
        }
        const adjacent = currentMedia[(currentMediaIndex + 1) % currentMedia.length];
        if (adjacent?.type === 'image' && typeof window.Image === 'function') {
            const image = new window.Image();
            image.src = adjacent.thumbUrl || adjacent.url;
        }
    }

    function stopActiveVideo() {
        tip.querySelectorAll('.steamMediaVideo').forEach((video) => {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
            } catch (_) {
                // Ignore cleanup failures from browser media internals.
            }
        });
    }

    function stopTheatreVideo() {
        theatre.querySelectorAll('.steamPreviewTheatreVideo').forEach((video) => {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
            } catch (_) {
                // Ignore cleanup failures from browser media internals.
            }
        });
    }

    function renderVideoPlaybackFallback(className) {
        const steamUrl = escapeHtml(getCurrentSteamUrl());
        return `
            <div class="${className}">
                <span>Trailer format cannot play on this page.</span>
                <a href="${steamUrl}" target="_blank" rel="noopener noreferrer">Open on Steam</a>
            </div>
        `;
    }

    function bindVideoPlaybackFallback(video, viewport, className, root) {
        if (!video || !viewport) return;

        video.addEventListener(
            'error',
            () => {
                if (root?.contains(video)) {
                    viewport.innerHTML = renderVideoPlaybackFallback(className);
                }
            },
            { once: true }
        );
    }

    function getMediaThumbUrl(item) {
        if (!item) return '';
        return item.type === 'video' ? item.posterUrl : item.thumbUrl || item.url;
    }

    function isScreenshotMedia(item) {
        return item?.type === 'image' && item?.source === 'screenshot';
    }

    function isVideoMedia(item) {
        return item?.type === 'video';
    }

    function canOpenMediaTheatre(item) {
        return isScreenshotMedia(item) || isVideoMedia(item);
    }

    function getTheatreCounterText() {
        const item = theatreMedia[theatreMediaIndex];
        const ordinal = theatreAllMedia.indexOf(item);
        const count = theatreAllMedia.length || theatreMedia.length;
        const position = ordinal >= 0 ? ordinal + 1 : theatreMediaIndex + 1;
        return `${position} of ${count}`;
    }

    function renderMediaThumbs(media, activeIndex, title) {
        if (!media?.length || media.length <= 1) return '';

        const thumbsHtml = media
            .map((item, index) => {
                const thumbUrl = getMediaThumbUrl(item);
                if (!isUsableUrl(thumbUrl)) return '';

                const label = escapeHtml(item.alt || title || `Steam media ${index + 1}`);
                const activeClass = index === activeIndex ? ' steamMediaThumbActive' : '';
                const current = index === activeIndex ? 'true' : 'false';
                const videoIcon =
                    item.type === 'video'
                        ? '<span class="steamMediaThumbPlayIcon" aria-hidden="true">&#9658;</span>'
                        : '';

                return `
                <button type="button" class="steamMediaThumbBtn${activeClass}" data-media-index="${index}" aria-label="Show ${label}" aria-current="${current}" title="${label}">
                    <img class="steamMediaThumbImage" src="${escapeHtml(thumbUrl)}" alt="" loading="lazy" decoding="async">
                    ${videoIcon}
                </button>
            `;
            })
            .join('');

        const fitClass = media.length <= 7 ? ' steamMediaThumbStripFit' : '';
        return `<div class="steamMediaThumbStrip${fitClass}" aria-label="Steam media thumbnails">${thumbsHtml}</div>`;
    }

    function renderMediaCarousel(media, title) {
        if (!media?.length) return '';

        const hasMultiple = media.length > 1;
        const controlsHtml = hasMultiple
            ? `
            <button type="button" class="steamMediaNavBtn steamMediaPrevBtn" aria-label="Previous Steam media" title="Previous media">&#8249;</button>
            <button type="button" class="steamMediaNavBtn steamMediaNextBtn" aria-label="Next Steam media" title="Next media">&#8250;</button>
            <span class="steamMediaCounter" aria-live="polite">1 / ${escapeHtml(media.length)}</span>
        `
            : '';
        const expandClass = canOpenMediaTheatre(media[0]) ? '' : ' steamMediaExpandHidden';

        return `
            <div class="steamMediaShell">
                <div class="steamMediaFrame" aria-label="Steam media preview">
                    <div class="steamMediaViewport">${renderMediaItem(media[0], 0, title)}</div>
                    <button type="button" class="steamMediaExpandBtn${expandClass}" aria-label="Open media theatre" title="Open theatre mode"><span class="steamTheatreIcon" aria-hidden="true"></span></button>
                    ${controlsHtml}
                </div>
                ${renderMediaThumbs(media, 0, title)}
            </div>
        `;
    }

    function renderTheatreMediaItem(item, index, title) {
        if (!item) return '';

        const label = escapeHtml(item.alt || title || 'Steam media');
        if (item.type === 'video') {
            return `
                <div class="steamPreviewTheatreVideoWrap">
                    <video class="steamPreviewTheatreVideo" data-theatre-media-index="${index}" autoplay playsinline tabindex="0" aria-label="${label}"></video>
                    ${renderTheatreVideoControls('steamPreviewTheatreVideoControlsFullscreen')}
                </div>
            `;
        }

        return `<img class="steamPreviewTheatreImage" src="${escapeHtml(item.url)}" alt="${label}" loading="eager" decoding="async">`;
    }

    function renderTheatreVideoControls(extraClass = '') {
        const className = `steamPreviewTheatreVideoControls${extraClass ? ` ${extraClass}` : ''}`;
        return `
            <div class="${className}" aria-label="Video controls">
                <input class="steamPreviewTheatreVideoSeek" type="range" min="0" max="0" step="0.1" value="0" aria-label="Seek video">
                <div class="steamPreviewTheatreVideoControlRow">
                    <button type="button" class="steamPreviewTheatreVideoControlBtn steamPreviewTheatreVideoPlayToggle" aria-label="Play video" title="Play">&#9658;</button>
                    <button type="button" class="steamPreviewTheatreVideoControlBtn steamPreviewTheatreVideoMuteToggle" aria-label="Mute video" title="Mute">&#128266;</button>
                    <span class="steamPreviewTheatreVideoTime">0:00 / 0:00</span>
                    <span class="steamPreviewTheatreVideoControlSpacer"></span>
                    <button type="button" class="steamPreviewTheatreVideoControlBtn steamPreviewTheatreVideoFullscreenBtn" aria-label="Toggle video fullscreen" title="Video fullscreen">&#9974;</button>
                </div>
            </div>
        `;
    }

    function renderTheatreFooterControls() {
        if (!isScreenshotMedia(theatreMedia[theatreMediaIndex])) return '';

        const fullscreenLabel = document.fullscreenElement === theatre ? 'Exit fullscreen' : 'Enter fullscreen';
        return `
            <button type="button" class="steamPreviewTheatreVideoControlBtn steamPreviewTheatreFullscreenBtn" aria-label="${fullscreenLabel}" title="${fullscreenLabel}">&#9974;</button>
        `;
    }

    function renderTheatre() {
        if (!theatreMedia.length) return;

        const focusedClass = [
            'steamPreviewTheatreNextBtn',
            'steamPreviewTheatrePrevBtn',
            'steamPreviewTheatreCloseBtn',
            'steamPreviewTheatreFullscreenBtn'
        ].find((name) => document.activeElement?.classList?.contains(name));

        const hasMultiple = theatreMedia.length > 1;
        const navHtml = hasMultiple
            ? `
            <button type="button" class="steamPreviewTheatreNavBtn steamPreviewTheatrePrevBtn" aria-label="Previous Steam media" title="Previous media">&#8249;</button>
            <button type="button" class="steamPreviewTheatreNavBtn steamPreviewTheatreNextBtn" aria-label="Next Steam media" title="Next media">&#8250;</button>
        `
            : '';
        const videoControlsHtml = isVideoMedia(theatreMedia[theatreMediaIndex]) ? renderTheatreVideoControls() : '';
        const footerControlsHtml = renderTheatreFooterControls();
        const footerActionsHtml = renderTheatreFooterActions();

        theatre.innerHTML = `
            <div class="steamPreviewTheatreShell">
                <div class="steamPreviewTheatreHeader">
                    <div class="steamPreviewTheatreTitle" id="${theatreTitleId}">${escapeHtml(theatreMediaTitle)} - Trailers &amp; Screenshots</div>
                    <div class="steamPreviewTheatreHeaderControls">
                        <button type="button" class="steamPreviewTheatreBtn steamPreviewTheatreCloseBtn" aria-label="Close theatre" title="Close">&times;</button>
                    </div>
                </div>
                <div class="steamPreviewTheatreStage">
                    <div class="steamPreviewTheatreViewport">${renderTheatreMediaItem(theatreMedia[theatreMediaIndex], theatreMediaIndex, theatreMediaTitle)}</div>
                    ${navHtml}
                </div>
                ${videoControlsHtml}
                <div class="steamPreviewTheatreFooter">
                    ${footerActionsHtml}
                    <div class="steamPreviewTheatreCounter" aria-live="polite">${getTheatreCounterText()}</div>
                    <div class="steamPreviewTheatreFooterControlsHost">${footerControlsHtml}</div>
                </div>
            </div>
        `;
        if (focusedClass)
            focus(theatre.querySelector(`.${focusedClass}`) || theatre.querySelector('.steamPreviewTheatreCloseBtn'));
    }

    function setTheatreMedia(index) {
        if (!theatreMedia.length) return;

        const nextIndex = (index + theatreMedia.length) % theatreMedia.length;
        const nextItem = theatreMedia[nextIndex];

        stopTheatreVideo();

        if (theatreMode === 'video' && isScreenshotMedia(nextItem)) {
            const screenshots = currentMedia.filter(isScreenshotMedia);
            const screenshotIndex = screenshots.indexOf(nextItem);
            if (screenshotIndex >= 0) {
                theatreMode = 'screenshots';
                theatreMedia = screenshots;
                theatreMediaIndex = screenshotIndex;
                theatre.classList.remove('steamPreviewTheatreVideoMode');
                renderTheatre();
                return;
            }
        }

        theatreMediaIndex = nextIndex;

        const viewport = theatre.querySelector('.steamPreviewTheatreViewport');
        if (viewport) {
            viewport.innerHTML = renderTheatreMediaItem(
                theatreMedia[theatreMediaIndex],
                theatreMediaIndex,
                theatreMediaTitle
            );
        }

        const counter = theatre.querySelector('.steamPreviewTheatreCounter');
        if (counter) {
            counter.textContent = getTheatreCounterText();
        }

        const footerControls = theatre.querySelector('.steamPreviewTheatreFooterControlsHost');
        if (footerControls) {
            footerControls.innerHTML = renderTheatreFooterControls();
        }

        if (theatreMode === 'video') {
            playTheatreVideo();
        }
    }

    function formatVideoTime(value) {
        if (!isFinite(value) || value < 0) return '0:00';

        const total = Math.floor(value);
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        const paddedSeconds = String(seconds).padStart(2, '0');

        return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}` : `${minutes}:${paddedSeconds}`;
    }

    function updateTheatreVideoControls(video) {
        if (!video) return;

        const playButtons = theatre.querySelectorAll('.steamPreviewTheatreVideoPlayToggle');
        const muteButtons = theatre.querySelectorAll('.steamPreviewTheatreVideoMuteToggle');
        const seekInputs = theatre.querySelectorAll('.steamPreviewTheatreVideoSeek');
        const timeLabels = theatre.querySelectorAll('.steamPreviewTheatreVideoTime');
        const duration = isFinite(video.duration) ? video.duration : 0;
        const currentTime = isFinite(video.currentTime) ? video.currentTime : 0;

        playButtons.forEach((playButton) => {
            playButton.innerHTML = video.paused ? '&#9658;' : '&#10074;&#10074;';
            playButton.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
            playButton.setAttribute('title', video.paused ? 'Play' : 'Pause');
        });

        muteButtons.forEach((muteButton) => {
            muteButton.innerHTML = video.muted || video.volume === 0 ? '&#128263;' : '&#128266;';
            muteButton.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
            muteButton.setAttribute('title', video.muted ? 'Unmute' : 'Mute');
        });

        seekInputs.forEach((seek) => {
            seek.max = String(duration || 0);
            seek.value = String(Math.min(currentTime, duration || currentTime));
        });

        timeLabels.forEach((timeLabel) => {
            timeLabel.textContent = `${formatVideoTime(currentTime)} / ${formatVideoTime(duration)}`;
        });
    }

    function bindTheatreVideoEvents(video) {
        if (!video || video.dataset.controlsBound === 'true') return;

        video.dataset.controlsBound = 'true';
        ['timeupdate', 'durationchange', 'play', 'pause', 'volumechange', 'loadedmetadata'].forEach((eventName) => {
            video.addEventListener(eventName, () => updateTheatreVideoControls(video));
        });
        updateTheatreVideoControls(video);
    }

    function loadTheatreVideoSource(video, sourceUrl, preserveState = false) {
        const playableUrl = getUsableMediaUrl(sourceUrl);
        if (!video || !playableUrl) return;

        const previousTime = preserveState && isFinite(video.currentTime) ? video.currentTime : 0;
        const shouldResume = preserveState ? !video.paused : true;

        video.src = playableUrl;
        video.load();
        video.addEventListener(
            'loadedmetadata',
            () => {
                if (previousTime && isFinite(video.duration)) {
                    video.currentTime = Math.min(previousTime, Math.max(0, video.duration - 0.25));
                }

                if (shouldResume) {
                    video.play().catch(() => null);
                }
                updateTheatreVideoControls(video);
            },
            { once: true }
        );

        if (shouldResume) {
            video.play().catch(() => null);
        }
    }

    async function playTheatreVideo() {
        const item = theatreMedia[theatreMediaIndex];
        if (!item || item.type !== 'video' || (!isUsableUrl(item.videoUrl) && !isUsableUrl(item.hlsUrl))) return;

        const label = escapeHtml(item.alt || theatreMediaTitle || 'Steam video');
        const viewport = theatre.querySelector('.steamPreviewTheatreViewport');
        if (!viewport) return;

        stopTheatreVideo();
        const directSrc = isUsableUrl(item.videoUrl) ? ` src="${escapeHtml(item.videoUrl)}"` : '';
        let video = viewport.querySelector('.steamPreviewTheatreVideo');
        if (!video) {
            viewport.innerHTML = `<video class="steamPreviewTheatreVideo"${directSrc} autoplay playsinline tabindex="0" aria-label="${label}"></video>`;
            video = viewport.querySelector('.steamPreviewTheatreVideo');
        }

        if (!video) return;
        video.setAttribute('aria-label', label);
        bindVideoPlaybackFallback(video, viewport, 'steamPreviewTheatreError', theatre);
        bindTheatreVideoEvents(video);

        if (isUsableUrl(item.videoUrl)) {
            loadTheatreVideoSource(video, item.videoUrl);
            return;
        }

        if (isUsableUrl(item.hlsUrl) && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = item.hlsUrl;
            video.play().catch(() => null);
            return;
        }

        viewport.innerHTML = renderVideoPlaybackFallback('steamPreviewTheatreError');
    }

    function isTheatreOpen() {
        return theatre.classList.contains('steamPreviewTheatreOpen');
    }

    function getTheatreSelection(index) {
        const selectedItem = currentMedia[index];
        if (!canOpenMediaTheatre(selectedItem)) return null;

        const mode = isVideoMedia(selectedItem) ? 'video' : 'screenshots';
        const screenshots = currentMedia.filter(isScreenshotMedia);
        const allItems = currentMedia.filter(canOpenMediaTheatre);
        const items = mode === 'video' ? [selectedItem, ...screenshots] : screenshots;
        const selectedIndex = items.indexOf(selectedItem);
        if (!items.length || selectedIndex < 0) return null;

        return { mode, items, selectedIndex, allItems };
    }

    async function toggleTheatreFullscreen() {
        if (!isTheatreOpen()) return;

        try {
            if (document.fullscreenElement === theatre) {
                await document.exitFullscreen();
            } else if (!document.fullscreenElement && theatre.requestFullscreen) {
                await theatre.requestFullscreen();
            }
        } catch (_) {
            // Ignore browser fullscreen denials.
        }

        updateTheatreFullscreenButton();
    }

    function updateTheatreFullscreenButton() {
        const theatreFullscreenButtons = theatre.querySelectorAll('.steamPreviewTheatreFullscreenBtn');
        const videoFullscreenButton = theatre.querySelector('.steamPreviewTheatreVideoFullscreenBtn');
        const videoWrap = theatre.querySelector('.steamPreviewTheatreVideoWrap');

        const label = document.fullscreenElement === theatre ? 'Exit fullscreen' : 'Enter fullscreen';
        theatreFullscreenButtons.forEach((button) => {
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
        });

        if (videoFullscreenButton) {
            const videoLabel =
                document.fullscreenElement === videoWrap ? 'Exit video fullscreen' : 'Enter video fullscreen';
            videoFullscreenButton.setAttribute('aria-label', videoLabel);
            videoFullscreenButton.setAttribute('title', videoLabel);
        }
    }

    function getTheatreVideoElement() {
        return theatre.querySelector('.steamPreviewTheatreVideo');
    }

    function toggleTheatreVideoPlayback() {
        const video = getTheatreVideoElement();
        if (!video) return;

        if (video.paused) {
            video.play().catch(() => null);
        } else {
            video.pause();
        }
        updateTheatreVideoControls(video);
    }

    function toggleTheatreVideoMute() {
        const video = getTheatreVideoElement();
        if (!video) return;

        video.muted = !video.muted;
        updateTheatreVideoControls(video);
    }

    function seekTheatreVideo(deltaSeconds) {
        const video = getTheatreVideoElement();
        if (!video) return false;

        const duration = isFinite(video.duration) ? video.duration : 0;
        const currentTime = isFinite(video.currentTime) ? video.currentTime : 0;
        const nextTime = duration
            ? Math.max(0, Math.min(duration, currentTime + deltaSeconds))
            : Math.max(0, currentTime + deltaSeconds);
        video.currentTime = nextTime;
        updateTheatreVideoControls(video);
        return true;
    }

    async function toggleTheatreVideoFullscreen() {
        const videoWrap = theatre.querySelector('.steamPreviewTheatreVideoWrap');
        if (!videoWrap) return;

        try {
            if (document.fullscreenElement === videoWrap) {
                await document.exitFullscreen();
            } else if (!document.fullscreenElement && videoWrap.requestFullscreen) {
                await videoWrap.requestFullscreen();
            }
        } catch (_) {
            // Ignore browser fullscreen denials.
        }
    }

    async function playActiveVideo() {
        const item = currentMedia[currentMediaIndex];
        if (!item || item.type !== 'video' || (!isUsableUrl(item.videoUrl) && !isUsableUrl(item.hlsUrl))) return;

        const label = escapeHtml(item.alt || currentMediaTitle || 'Steam video');
        const poster = isUsableUrl(item.posterUrl) ? ` poster="${escapeHtml(item.posterUrl)}"` : '';
        const viewport = tip.querySelector('.steamMediaViewport');
        if (!viewport) return;

        stopActiveVideo();
        const directSrc = isUsableUrl(item.videoUrl) ? ` src="${escapeHtml(item.videoUrl)}"` : '';
        viewport.innerHTML = `<video class="steamMediaVideo"${directSrc}${poster} controls autoplay playsinline aria-label="${label}"></video>`;

        const video = viewport.querySelector('.steamMediaVideo');
        if (!video) return;
        bindVideoPlaybackFallback(video, viewport, 'steamMediaError', tip);

        if (isUsableUrl(item.videoUrl)) {
            video.play().catch(() => null);
            return;
        }

        if (isUsableUrl(item.hlsUrl) && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = item.hlsUrl;
            video.play().catch(() => null);
            return;
        }

        viewport.innerHTML = renderVideoPlaybackFallback('steamMediaError');
    }

    listen(tip, 'mouseenter', () => {
        cancel(hideTimeout);
        trackingMove = false;
    });
    listen(tip, 'mouseleave', scheduleHide);
    listen(tip, 'focusin', () => cancel(hideTimeout));
    listen(tip, 'focusout', (event) => {
        if (!tip.contains(event.relatedTarget) && event.relatedTarget !== currentHoveredLink) scheduleHide();
    });
    listen(tip, 'error', imageFailure, true);
    listen(theatre, 'error', imageFailure, true);
    listen(tip, 'submit', (event) => {
        if (event.target.matches('.steamNameSearchForm')) {
            event.preventDefault();
            void searchCorrectionNames(true);
            return;
        }
        if (!event.target.matches('.steamCorrectionForm')) return;
        event.preventDefault();
        void applyCorrection(
            event.target.querySelector('[name="steamAppId"]').value,
            event.target.querySelector('button[type="submit"]')
        );
    });
    listen(tip, 'input', (event) => {
        if (!event.target.matches('[name="steamGameTitle"]')) return;
        if (event.isComposing) {
            cancelNameSearch();
            return;
        }
        scheduleNameSearch(event.target);
    });
    listen(tip, 'compositionend', (event) => {
        if (event.target.matches('[name="steamGameTitle"]')) scheduleNameSearch(event.target);
    });
    listen(tip, 'click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        if (target.type === 'submit') return;
        event.preventDefault();
        event.stopPropagation();
        if (target.matches('.steamMediaExpandBtn')) return openTheatre(currentMediaIndex);
        if (target.matches('.steamMediaPrevBtn')) return setActiveMedia(currentMediaIndex - 1);
        if (target.matches('.steamMediaNextBtn')) return setActiveMedia(currentMediaIndex + 1);
        if (target.matches('.steamMediaThumbBtn')) return setActiveMedia(Number(target.dataset.mediaIndex));
        if (target.matches('.steamMediaPlayBtn')) {
            setActiveMedia(Number(target.dataset.mediaIndex));
            return void playActiveVideo();
        }
        if (target.matches('.copyAppIdBtn')) return void copyAppId(target);
        if (target.matches('.steamCorrectToggle'))
            return tip.querySelector('.steamCorrection')?.hidden ? openCorrection() : closeCorrection();
        if (target.hasAttribute('data-correction-close')) return closeCorrection();
        if (target.hasAttribute('data-candidate-app-id'))
            return void applyCorrection(target.dataset.candidateAppId, target);
        if (target.hasAttribute('data-source-action')) return void runSourceAction(target);
        if (target.hasAttribute('data-correction-reset')) {
            const source = currentSource;
            try {
                await client.forgetMatch(source);
                if (currentSource?.key === source.key) await show(source, currentHoveredLink, lastMoveEvent);
            } catch (error) {
                announce(error.message);
            }
            return;
        }
        if (target.hasAttribute('data-find-source')) {
            cancelNameSearch();
            const operation = nameSearchId;
            const panel = tip.querySelector('.steamCorrection');
            const source = currentSource;
            const message = tip.querySelector('.steamCorrectionStatus');
            const hadFocus = disableForOperation(target);
            if (message) message.textContent = 'Checking source page…';
            try {
                const found = await adapter.findAppIds(source);
                if (
                    currentSource?.key !== source.key ||
                    operation !== nameSearchId ||
                    !panel?.isConnected ||
                    panel.hidden
                )
                    return;
                updateSuggestions(panel, found);
                if (message)
                    message.textContent = found.length
                        ? 'Choose a Steam game below.'
                        : 'No unambiguous Steam link found in the source content.';
            } catch (error) {
                if (message?.isConnected) message.textContent = error.message || 'Source page unavailable.';
            } finally {
                if (target.isConnected) target.disabled = false;
                restoreOperationFocus(target, hadFocus);
            }
            return;
        }
        if (target.dataset.retry === 'all')
            return void show(currentSource, currentHoveredLink, lastMoveEvent, { force: true });
        if (target.dataset.retry && currentData) {
            const appId = currentData.appId;
            const field = target.dataset.retry;
            const hadFocus = disableForOperation(target);
            try {
                await (field === 'tags' ? client.retryTags(appId) : client.retryReviews(appId));
                const data = client.getPreviewData(appId);
                if (data) patchMetadata(data);
            } catch (error) {
                announce(error.message || 'Retry failed.');
            } finally {
                if (target.isConnected) target.disabled = false;
                if (hadFocus && String(currentData?.appId) === String(appId) && document.activeElement === tip) {
                    const row = tip.querySelector(field === 'tags' ? '.steamTags' : '.steamRating');
                    if (row) {
                        row.tabIndex = -1;
                        focus(row.querySelector('a,button') || row);
                    }
                } else restoreOperationFocus(target, hadFocus);
            }
        }
    });
    listen(theatre, 'click', async (event) => {
        if (event.target === theatre) return closeTheatre();
        const button = event.target.closest('button');
        if (button) {
            event.preventDefault();
            event.stopPropagation();
            if (button.matches('.steamPreviewTheatreCloseBtn')) return closeTheatre();
            if (button.matches('.steamPreviewTheatreVideoPlayToggle')) return toggleTheatreVideoPlayback();
            if (button.matches('.steamPreviewTheatreVideoMuteToggle')) return toggleTheatreVideoMute();
            if (button.matches('.steamPreviewTheatreFullscreenBtn')) return void toggleTheatreFullscreen();
            if (button.matches('.steamPreviewTheatreVideoFullscreenBtn')) return void toggleTheatreVideoFullscreen();
            if (button.matches('.steamPreviewTheatrePrevBtn')) return setTheatreMedia(theatreMediaIndex - 1);
            if (button.matches('.steamPreviewTheatreNextBtn')) return setTheatreMedia(theatreMediaIndex + 1);
            if (button.hasAttribute('data-source-action')) return void runSourceAction(button);
        }
        if (event.target.matches('.steamPreviewTheatreVideo')) {
            focus(event.target);
            toggleTheatreVideoPlayback();
        }
    });
    listen(theatre, 'input', (event) => {
        if (!event.target.matches('.steamPreviewTheatreVideoSeek')) return;
        const video = getTheatreVideoElement();
        if (video) {
            video.currentTime = Number(event.target.value);
            updateTheatreVideoControls(video);
        }
    });
    listen(
        document,
        'mouseover',
        (event) => {
            if (isTheatreOpen() || tip.contains(event.target)) return;
            const link = event.target.closest?.(adapter.selector);
            if (link) queueShow(link, event);
        },
        true
    );
    listen(
        document,
        'mouseout',
        (event) => {
            const link = event.target.closest?.(adapter.selector);
            if (link && link !== event.relatedTarget?.closest?.(adapter.selector) && !tip.contains(event.relatedTarget))
                scheduleHide();
        },
        true
    );
    listen(
        document,
        'focusin',
        (event) => {
            if (suppressFocusPreview || isTheatreOpen() || tip.contains(event.target)) return;
            const link = event.target.closest?.(adapter.selector);
            if (link) queueShow(link, null);
        },
        true
    );
    listen(
        document,
        'focusout',
        (event) => {
            if (event.target.closest?.(adapter.selector) && !tip.contains(event.relatedTarget)) scheduleHide();
        },
        true
    );
    listen(
        document,
        'pointermove',
        (event) => {
            if (trackingMove && tip.style.display === 'block') {
                lastMoveEvent = event;
                requestPosition();
            }
        },
        { passive: true }
    );
    listen(
        document,
        'keydown',
        (event) => {
            if (isTheatreOpen()) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    closeTheatre();
                    return;
                }
                if (event.key === 'Tab') {
                    const elements = [
                        ...theatre.querySelectorAll(
                            'a[href],button:not([disabled]),input:not([disabled]),video[tabindex]'
                        )
                    ].filter((element) => element.getClientRects().length);
                    const first = elements[0],
                        last = elements[elements.length - 1];
                    if (
                        event.shiftKey &&
                        (document.activeElement === theatre ||
                            document.activeElement === first ||
                            !theatre.contains(document.activeElement))
                    ) {
                        event.preventDefault();
                        focus(last);
                    } else if (
                        !event.shiftKey &&
                        (document.activeElement === theatre ||
                            document.activeElement === last ||
                            !theatre.contains(document.activeElement))
                    ) {
                        event.preventDefault();
                        focus(first);
                    }
                    return;
                }
                if (
                    event.target.closest?.('.steamPreviewTheatreVideoControls') ||
                    event.target.matches?.('input,textarea,select')
                )
                    return;
                if (theatreMode === 'video' && isVideoMedia(theatreMedia[theatreMediaIndex])) {
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                        event.preventDefault();
                        seekTheatreVideo(event.key === 'ArrowLeft' ? -5 : 5);
                        return;
                    }
                    if (event.key === ' ' && !event.target.closest?.('button,a')) {
                        event.preventDefault();
                        toggleTheatreVideoPlayback();
                        return;
                    }
                }
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    setTheatreMedia(theatreMediaIndex + (event.key === 'ArrowLeft' ? -1 : 1));
                }
                return;
            }
            if (event.key === 'Escape' && tip.style.display === 'block') {
                event.preventDefault();
                if (tip.querySelector('.steamCorrection:not([hidden])')) closeCorrection();
                else hide({ restoreFocus: tip.contains(document.activeElement) });
            }
            if (event.altKey && event.key === 'ArrowDown') {
                const link = event.target.closest?.(adapter.selector);
                if (link) {
                    const source = adapter.getSource(link);
                    if (source) {
                        event.preventDefault();
                        if (currentSource?.key === source.key && tip.style.display === 'block') {
                            cancel(hideTimeout);
                            trackingMove = false;
                            focusPreviewCard();
                        } else
                            void show(source, link).then(() => {
                                if (currentSource?.key === source.key && tip.style.display === 'block')
                                    focusPreviewCard();
                            });
                    }
                }
            }
        },
        true
    );
    listen(document, 'fullscreenchange', updateTheatreFullscreenButton);
    listen(window, 'resize', requestPosition, { passive: true });
    listen(
        window,
        'scroll',
        () => {
            if (tip.style.display === 'block') {
                lastMoveEvent = null;
                requestPosition();
            }
        },
        { passive: true }
    );
    if (window.ResizeObserver) {
        const observer = new window.ResizeObserver(requestPosition);
        observer.observe(tip);
        cleanups.push(() => observer.disconnect());
    }
    const unsubscribe = client.subscribe((event) => {
        if (disposed) return;
        if (event.kind === 'clear') {
            closeTheatre(false);
            hide();
            return;
        }
        if (!currentData || String(event.appId) !== String(currentData.appId || currentData.steam_appid)) return;
        const data = event.data || client.getPreviewData(event.appId);
        if (data) patchMetadata(data);
    });
    cleanups.push(unsubscribe);
    refreshSettings();
    return {
        show,
        hide,
        refreshSettings,
        getState: () => ({
            sourceKey: currentSource?.key || null,
            appId: currentData?.appId || null,
            state: tip.dataset.previewState || 'hidden',
            mediaIndex: currentMediaIndex,
            theatre: isTheatreOpen()
        }),
        dispose() {
            if (disposed) return;
            closeTheatre(false);
            hide();
            disposed = true;
            if (positionFrame != null) window.cancelAnimationFrame(positionFrame);
            timers.forEach((id) => window.clearTimeout(id));
            cleanups.splice(0).forEach((cleanup) => cleanup?.());
            tip.remove();
            theatre.remove();
            status.remove();
            style.remove();
            injectedStyle?.remove?.();
        }
    };
}
