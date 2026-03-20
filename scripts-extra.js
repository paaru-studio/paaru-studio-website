// 1. Lazy load Hero Video
document.addEventListener('DOMContentLoaded', function () {
    const heroFrame = document.querySelector('.hero-bg-iframe');
    const poster = document.querySelector('.hero-poster');
    if (heroFrame && poster) {
        const src = heroFrame.getAttribute('data-src');
        if (src) {
            setTimeout(() => {
                heroFrame.setAttribute('src', src);
                heroFrame.onload = () => {
                    heroFrame.style.opacity = '1';
                    setTimeout(() => poster.style.display = 'none', 1000);
                };
            }, 2000);
        }
    }
});

// 2. Podcast auto-scroll
(function () {
    var root = document.querySelector('.index-page');
    if (!root) return;
    var container = root.querySelector('.podcast-embeds');
    if (!container) return;
    var track = container.querySelector('.podcast-track');
    if (!track) return;
    var clone = track.cloneNode(true);
    clone.className = 'podcast-track podcast-track--clone';
    container.appendChild(clone);
    var pxPerSec = 40;
    var paused = false;
    var offset = 0;
    var cachedTrackWidth = 0;
    var last = performance.now();
    function updateWidth() { cachedTrackWidth = track.getBoundingClientRect().width; }
    updateWidth();
    var resizeTimeout;
    window.addEventListener('resize', function () {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateWidth, 200);
    }, { passive: true });
    function step(now) {
        var dt = (now - last) / 1000;
        last = now;
        if (!paused) {
            offset += pxPerSec * dt;
            if (cachedTrackWidth && offset >= cachedTrackWidth) { offset = offset - cachedTrackWidth; }
            track.style.transform = 'translateX(' + (-offset) + 'px)';
            clone.style.transform = 'translateX(' + (-offset) + 'px)';
        }
        requestAnimationFrame(step);
    }
    function setPaused(v) { paused = !!v; container.classList.toggle('podcast-paused', paused); }
    container.addEventListener('mouseenter', function () { setPaused(true); });
    container.addEventListener('mouseleave', function () { setPaused(false); });
    requestAnimationFrame(function (ts) { last = ts; requestAnimationFrame(step); });
})();

// 3. YouTube lazy-load modal triggers
(function () {
    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('.video-poster');
        if (!btn) return;
        var container = btn.closest && btn.closest('.video-embed');
        if (!container) return;
        var vid = container.getAttribute('data-video-id');
        if (!vid) return;
        window.dispatchEvent(new CustomEvent('embed-open', { detail: { videoId: vid } }));
    });
})();

// 4. Portfolio Carousel
(function () {
    var carousel = document.querySelector('.portfolio-carousel');
    if (!carousel) return;
    carousel.setAttribute('data-hover-enabled', '1');
    var track = carousel.querySelector('.carousel-track');
    var items = function () { return Array.prototype.slice.call(track.querySelectorAll('.portfolio-item')); };
    var prevBtn = carousel.querySelector('.carousel-nav.prev');
    var nextBtn = carousel.querySelector('.carousel-nav.next');
    var index = 0;
    var cachedWidth = 0;
    var cachedGap = 28;
    function computeWidth() {
        var its = items();
        if (!its.length) return 0;
        cachedGap = parseFloat(getComputedStyle(track).gap) || 28;
        cachedWidth = its[0].getBoundingClientRect().width + cachedGap;
        return cachedWidth;
    }
    computeWidth();
    var resizeTimeout;
    window.addEventListener('resize', function () {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(computeWidth, 200);
    }, { passive: true });
    function update(force) {
        var width = cachedWidth || computeWidth();
        track.style.transform = 'translateX(' + (-index * width) + 'px)';
    }
    function wrap(v) { var len = items().length; if (len === 0) return 0; return Math.max(0, Math.min(v, len - 1)); }
    var isAnimating = false;
    var autoMotion = { enabled: false, amplitude: 15, speed: 0.0012, phase: 0, rafId: null, running: false };
    function startAutoMotion() {
        if (!autoMotion.enabled || autoMotion.running) return;
        autoMotion.running = true;
        var last = performance.now();
        function frame(now) {
            var dt = now - last; last = now;
            autoMotion.phase += dt * autoMotion.speed;
            var x = Math.sin(autoMotion.phase) * autoMotion.amplitude;
            var slideW = cachedWidth || computeWidth();
            track.style.transform = 'translateX(' + (-index * slideW + x) + 'px)';
            autoMotion.rafId = requestAnimationFrame(frame);
        }
        autoMotion.rafId = requestAnimationFrame(frame);
    }
    function stopAutoMotion() {
        autoMotion.running = false;
        if (autoMotion.rafId) cancelAnimationFrame(autoMotion.rafId);
        autoMotion.rafId = null;
        update();
    }
    carousel.addEventListener('mouseenter', stopAutoMotion);
    carousel.addEventListener('mouseleave', startAutoMotion);
    
    prevBtn && prevBtn.addEventListener('click', function () { index = wrap(index - 1); update(); });
    nextBtn && nextBtn.addEventListener('click', function () { index = wrap(index + 1); update(); });
    
    var viewport = carousel.querySelector('.carousel-viewport');
    // Hover ticking disabled to remove cursor hover effect on videos
    setTimeout(startAutoMotion, 250);
})();
