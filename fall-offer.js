(function () {
    var dialog = document.getElementById('fall-offer');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    var flyer = dialog.querySelector('.fall-offer-art img');
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
        var card = dialog.querySelector('.fall-offer-card');
        var done = function (event) {
            // Ignore the falling leaves' animations bubbling up from inside the card
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

    try {
        if (sessionStorage.getItem('fallOfferSeen')) return;
    } catch (error) {
        // The offer can still be shown when storage is unavailable.
    }

    var opened = false;
    function openOffer() {
        if (opened) return;
        opened = true;
        dialog.showModal();
        try {
            sessionStorage.setItem('fallOfferSeen', '1');
        } catch (error) {
            // Browsers that block storage will show the offer on each visit.
        }
    }

    // Open only once the flyer is fully decoded so it appears whole, not painted in line by line.
    // Give the page a moment to appear first, and never wait more than a few seconds.
    var minDelay = new Promise(function (resolve) { setTimeout(resolve, 400); });
    var flyerReady = flyer && flyer.decode ? flyer.decode().catch(function () {}) : Promise.resolve();
    Promise.all([minDelay, flyerReady]).then(openOffer);
    setTimeout(openOffer, 4000);
})();
