(function () {
    /* ===== Seasonal offer schedule =====
       Each season shows from `start` to `end`, both days included, by the visitor's own date (YYYY-MM-DD).
       Outside every range the popup doesn't appear at all, so an expired price is never shown.
       To preview a season on any day, add ?offer=fall or ?offer=christmas to the home page address. */
    var SEASONS = [
        {
            id: 'fall',
            start: '2026-09-01',
            end: '2026-11-20',
            eyebrow: 'A seasonal invitation',
            title: 'Fall Transformation Special',
            flyer: {
                src: 'images/1000283043.webp',
                width: 1024,
                height: 1318,
                alt: 'Fall in love with you: T-Shape 2 fall transformation special with 6 and 12 session packages for body treatments and facial treatments, with fall special pricing through November 30.'
            },
            // Falling leaves: [left %, size px, delay s, duration s, sideways drift px]
            glyphs: ['🍁', '🍂'],
            particles: [
                [3, 31, .15, 3.1, 45], [16, 23, .75, 3.6, -28], [86, 29, .35, 3.3, -48],
                [97, 22, 1, 3.8, -35], [8, 21, 1.45, 3.4, 26], [92, 27, 1.75, 3.2, -25]
            ]
        },
        {
            id: 'christmas',
            start: '2026-11-22',
            end: '2026-12-31',
            eyebrow: 'A holiday gift to yourself',
            title: 'Holiday Transformation Specials',
            flyer: {
                src: 'images/1000301177.webp',
                width: 1199,
                height: 1312,
                alt: 'All I want for Christmas is me: T-Shape 2 holiday transformation specials. 6, 9 and 12 session packages. Larger body treatments $1,695, $2,350 and $2,895. Smaller targeted areas $1,295, $1,695 and $2,195. Facial treatments $1,195, $1,595 and $1,895. A 12-session package includes a complimentary maintenance session. Pricing valid through December 31, 2026.'
            },
            // Snowflakes: [left %, size px, delay s, duration s, sideways drift px]
            glyphs: ['❄︎', '•', '❅︎', '•', '❆︎', '•'],
            particles: [
                [4, 26, .1, 5.6, 30], [13, 12, .9, 6.4, -18], [22, 22, 1.8, 5.2, 24],
                [31, 10, .4, 6.8, -14], [42, 28, 2.6, 5.8, 20], [51, 13, 1.3, 6.2, -22],
                [60, 24, .7, 5.4, 18], [69, 11, 2.1, 7, -12], [77, 30, 1.1, 5.9, -28],
                [85, 12, 2.9, 6.1, 16], [93, 22, .3, 5.5, -20], [97, 10, 1.6, 6.6, -10],
                [9, 26, 3.4, 5.7, 22], [36, 13, 3.8, 6, -16], [64, 24, 3.2, 6.3, 14], [89, 11, 4.1, 5.6, -18]
            ]
        }
    ];

    var dialog = document.getElementById('holiday-offer');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    var previewId = null;
    try {
        previewId = new URLSearchParams(window.location.search).get('offer');
    } catch (error) {
        // Older browsers: no preview, the schedule decides.
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    var now = new Date();
    var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

    var season = null;
    for (var i = 0; i < SEASONS.length; i++) {
        var s = SEASONS[i];
        if (previewId ? s.id === previewId : (today >= s.start && today <= s.end)) {
            season = s;
            break;
        }
    }
    if (!season) return;

    // Fill the popup with this season's flyer, wording, colors and falling particles
    var card = dialog.querySelector('.holiday-offer-card');
    var art = dialog.querySelector('.holiday-offer-art');
    var flyer = art.querySelector('img');

    dialog.setAttribute('data-season', season.id);
    dialog.querySelector('.holiday-offer-eyebrow').textContent = season.eyebrow;
    dialog.querySelector('#holiday-offer-title').textContent = season.title;

    flyer.width = season.flyer.width;
    flyer.height = season.flyer.height;
    flyer.alt = season.flyer.alt;
    flyer.src = season.flyer.src;
    card.style.setProperty('--offer-ratio', (season.flyer.width / season.flyer.height).toFixed(3));
    // The blurred side fill reuses the same flyer
    art.style.setProperty('--flyer', 'url("' + season.flyer.src + '")');

    var particleBox = dialog.querySelector('.holiday-offer-particles');
    season.particles.forEach(function (p, index) {
        var span = document.createElement('span');
        span.textContent = season.glyphs[index % season.glyphs.length];
        span.style.setProperty('--p-left', p[0] + '%');
        span.style.setProperty('--p-size', p[1] + 'px');
        span.style.setProperty('--p-delay', p[2] + 's');
        span.style.setProperty('--p-duration', p[3] + 's');
        span.style.setProperty('--p-drift', p[4] + 'px');
        particleBox.appendChild(span);
    });

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var closing = false;

    function closeOffer() {
        if (!dialog.open || closing) return;
        if (reduceMotion) {
            dialog.close();
            return;
        }
        closing = true;
        dialog.classList.add('is-closing');
        var done = function (event) {
            // Ignore the falling particles' animations bubbling up from inside the card
            if (event && event.target !== card) return;
            card.removeEventListener('animationend', done);
            clearTimeout(fallback);
            dialog.close();
            dialog.classList.remove('is-closing');
            closing = false;
        };
        // Fallback in case animationend never fires (e.g. animations disabled by the browser)
        var fallback = setTimeout(done, 700);
        card.addEventListener('animationend', done);
    }

    dialog.querySelector('[data-close-offer]').addEventListener('click', closeOffer);

    dialog.addEventListener('click', function (event) {
        if (event.target === dialog) closeOffer();
    });

    // Escape key: play the exit animation instead of closing instantly
    dialog.addEventListener('cancel', function (event) {
        event.preventDefault();
        closeOffer();
    });

    // Once per browser session for each season; a preview link always shows it
    var seenKey = 'offerSeen:' + season.id;
    try {
        if (!previewId && sessionStorage.getItem(seenKey)) return;
    } catch (error) {
        // The offer can still be shown when storage is unavailable.
    }

    var opened = false;
    function openOffer() {
        if (opened) return;
        opened = true;
        dialog.showModal();
        try {
            sessionStorage.setItem(seenKey, '1');
        } catch (error) {
            // Browsers that block storage will show the offer on each visit.
        }
    }

    // Open only once the flyer is fully decoded so it appears whole, not painted in line by line.
    // Give the page a moment to appear first, and never wait more than a few seconds.
    var minDelay = new Promise(function (resolve) { setTimeout(resolve, 400); });
    var flyerReady = flyer.decode ? flyer.decode().catch(function () {}) : Promise.resolve();
    Promise.all([minDelay, flyerReady]).then(openOffer);
    setTimeout(openOffer, 4000);
})();
