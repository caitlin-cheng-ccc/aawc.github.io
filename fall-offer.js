(function () {
    var dialog = document.getElementById('fall-offer');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    dialog.querySelector('[data-close-offer]').addEventListener('click', function () {
        dialog.close();
    });

    dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
    });

    try {
        if (sessionStorage.getItem('fallOfferSeen')) return;
    } catch (error) {
        // The offer can still be shown when storage is unavailable.
    }

    dialog.showModal();

    try {
        sessionStorage.setItem('fallOfferSeen', '1');
    } catch (error) {
        // Browsers that block storage will show the offer on each visit.
    }
})();
