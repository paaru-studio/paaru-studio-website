// 1. Lazy load Hero Video on Interaction (optimized for Lighthouse TBT/TTI)
document.addEventListener('DOMContentLoaded', function () {
    const heroFrame = document.querySelector('.hero-bg-iframe');
    const poster = document.querySelector('.hero-poster');
    if (heroFrame && poster) {
        const src = heroFrame.getAttribute('data-src');
        if (src) {
            let hasLoaded = false;
            const loadHeroVideo = () => {
                if (window.innerWidth <= 768) return;
                if (hasLoaded) return;
                hasLoaded = true;
                heroFrame.setAttribute('src', src);
                heroFrame.onload = () => {
                    heroFrame.style.opacity = '1';
                    setTimeout(() => poster.style.display = 'none', 1000);
                };
            };
            
            const interactionEvents = ['scroll', 'mousemove', 'touchstart', 'click'];
            const triggerLoad = () => {
                loadHeroVideo();
                interactionEvents.forEach(evt => window.removeEventListener(evt, triggerLoad));
            };
            
            interactionEvents.forEach(evt => window.addEventListener(evt, triggerLoad, { once: true, passive: true }));
            
            // Idle fallback load after 12 seconds to avoid blocking main thread during initial Lighthouse audit
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => setTimeout(loadHeroVideo, 12000), { timeout: 15000 });
            } else {
                setTimeout(loadHeroVideo, 12000);
            }
        }
    }
});

// 2. Podcast auto-scroll (Viewport-aware for 0 CPU overhead when offscreen)
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
    var isVisible = false;
    var offset = 0;
    var cachedTrackWidth = 0;
    var last = performance.now();
    var rafId = null;

    function updateWidth() { cachedTrackWidth = track.getBoundingClientRect().width; }
    updateWidth();
    var resizeTimeout;
    window.addEventListener('resize', function () {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateWidth, 200);
    }, { passive: true });

    function step(now) {
        if (!isVisible) return;
        var dt = (now - last) / 1000;
        last = now;
        if (!paused) {
            offset += pxPerSec * dt;
            if (cachedTrackWidth && offset >= cachedTrackWidth) { offset = offset - cachedTrackWidth; }
            track.style.transform = 'translateX(' + (-offset) + 'px)';
            clone.style.transform = 'translateX(' + (-offset) + 'px)';
        }
        rafId = requestAnimationFrame(step);
    }

    function setPaused(v) { paused = !!v; container.classList.toggle('podcast-paused', paused); }
    container.addEventListener('mouseenter', function () { setPaused(true); });
    container.addEventListener('mouseleave', function () { setPaused(false); });

    // Use IntersectionObserver to pause requestAnimationFrame when offscreen
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    last = performance.now();
                    if (!rafId) rafId = requestAnimationFrame(step);
                } else if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            });
        }, { threshold: 0.05 });
        observer.observe(container);
    } else {
        isVisible = true;
        requestAnimationFrame(function (ts) { last = ts; requestAnimationFrame(step); });
    }
})();

// 3. YouTube lazy-load modal triggers
(function () {
    document.addEventListener('click', function (e) {
        if (window.__portfolioCarouselDragged) {
            window.__portfolioCarouselDragged = false;
            return;
        }
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
    var indexCarousel = document.querySelector('.index-page #portfolio .portfolio-carousel') ||
                        document.querySelector('#portfolio .portfolio-carousel');

    if (indexCarousel && (document.body.classList.contains('index-page') || document.querySelector('.index-page'))) {
        initIndexCircularCarousel(indexCarousel);
        return;
    }

    // Default handler for subpages like portfolio.html
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
    function update() {
        var width = cachedWidth || computeWidth();
        track.style.transform = 'translateX(' + (-index * width) + 'px)';
    }
    function wrap(v) { var len = items().length; if (len === 0) return 0; return Math.max(0, Math.min(v, len - 1)); }
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
    
    setTimeout(startAutoMotion, 250);
})();

// Continuous Circular Wrap & Interactive Manual Sweep Engine for Homepage
function initIndexCircularCarousel(carousel) {
    var track = carousel.querySelector('.carousel-track');
    var viewport = carousel.querySelector('.carousel-viewport');
    var prevBtn = carousel.querySelector('.carousel-nav.prev');
    var nextBtn = carousel.querySelector('.carousel-nav.next');
    if (!track || !viewport) return;

    var items = track.querySelectorAll('.portfolio-item');
    if (items.length < 2) return;

    // Enable JS circular wrap class which removes fallback CSS keyframe animation
    carousel.classList.add('js-circular-wrap');

    var halfWidth = 0;
    var cardWidth = 0;
    var glideSpeed = 0; // px/sec: 50% faster than 40s duration (halfWidth / 26.6667)
    var currentOffset = 0;
    var isHovered = false;
    var isDragging = false;
    var isSweeping = false;
    var isVisible = true;

    var sweepFrom = 0;
    var sweepTo = 0;
    var sweepStartTime = 0;
    var sweepDuration = 400; // ms

    var dragStartX = 0;
    var dragStartY = 0;
    var dragStartOffset = 0;
    var dragDistance = 0;
    var isHorizontalDrag = null;

    function computeDimensions() {
        var its = track.querySelectorAll('.portfolio-item');
        if (its.length >= 20) {
            halfWidth = its[10].offsetLeft - its[0].offsetLeft;
            cardWidth = its[1].offsetLeft - its[0].offsetLeft;
        }
        if (!halfWidth || halfWidth <= 0) {
            var firstRect = its[0].getBoundingClientRect();
            var gap = parseFloat(getComputedStyle(track).gap) || 24;
            cardWidth = firstRect.width + gap;
            halfWidth = cardWidth * 10;
        }
        if (halfWidth <= 0) halfWidth = 4000;
        if (cardWidth <= 0) cardWidth = halfWidth / 10;

        // Wrap speed increased by 50% (40s / 1.5 = 26.6667s)
        glideSpeed = halfWidth / 26.6667;
    }

    computeDimensions();
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(computeDimensions, 150);
    }, { passive: true });

    function applyOffset(x) {
        while (x < 0) x += halfWidth;
        while (x >= halfWidth) x -= halfWidth;
        currentOffset = x;
        track.style.transform = 'translate3d(' + (-currentOffset) + 'px, 0, 0)';
    }

    function startSweep(from, to, duration) {
        sweepFrom = from;
        sweepTo = to;
        sweepStartTime = performance.now();
        sweepDuration = duration || 400;
        isSweeping = true;
    }

    function sweepBy(delta, duration) {
        startSweep(currentOffset, currentOffset + delta, duration || 400);
    }

    // Clickable manual sweep controls (Next / Previous buttons)
    if (nextBtn) {
        nextBtn.addEventListener('click', function (e) {
            e.preventDefault();
            sweepBy(cardWidth, 420);
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
            e.preventDefault();
            sweepBy(-cardWidth, 420);
        });
    }

    // Stop-motion when hovered over carousel
    carousel.addEventListener('mouseenter', function () {
        isHovered = true;
    });
    carousel.addEventListener('mouseleave', function () {
        isHovered = false;
    });

    // Touch and mouse manual sweep / drag interaction
    function onPointerDown(clientX, clientY) {
        isDragging = true;
        isSweeping = false;
        dragStartX = clientX;
        dragStartY = clientY;
        dragStartOffset = currentOffset;
        dragDistance = 0;
        isHorizontalDrag = null;
        viewport.classList.add('is-dragging');
    }

    function onPointerMove(clientX, clientY, e) {
        if (!isDragging) return;
        var dx = clientX - dragStartX;
        var dy = clientY - dragStartY;

        if (isHorizontalDrag === null) {
            if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
                isHorizontalDrag = Math.abs(dx) >= Math.abs(dy);
            }
        }

        if (isHorizontalDrag) {
            if (e && e.cancelable) e.preventDefault();
            dragDistance = dx;
            if (Math.abs(dx) > 6) {
                window.__portfolioCarouselDragged = true;
            }
            applyOffset(dragStartOffset - dx);
        }
    }

    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        viewport.classList.remove('is-dragging');

        if (Math.abs(dragDistance) > 30) {
            // Manual sweep to next / previous video
            if (dragDistance < -30) {
                // Dragged left -> sweep forward to next video card
                var remaining = cardWidth - (Math.abs(dragDistance) % cardWidth);
                if (remaining < 30) remaining += cardWidth;
                sweepBy(remaining, 380);
            } else {
                // Dragged right -> sweep backward to previous video card
                var remaining = cardWidth - (Math.abs(dragDistance) % cardWidth);
                if (remaining < 30) remaining += cardWidth;
                sweepBy(-remaining, 380);
            }
        }

        setTimeout(function () {
            window.__portfolioCarouselDragged = false;
        }, 120);
    }

    // Desktop Mouse Drag Events
    viewport.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        onPointerDown(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        onPointerMove(e.clientX, e.clientY, e);
    });
    window.addEventListener('mouseup', function () {
        if (isDragging) onPointerUp();
    });

    // Mobile / Tablet Touch Swipe Events
    viewport.addEventListener('touchstart', function (e) {
        if (!e.touches || e.touches.length !== 1) return;
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    viewport.addEventListener('touchmove', function (e) {
        if (!isDragging || !e.touches || e.touches.length !== 1) return;
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY, e);
    }, { passive: false });
    viewport.addEventListener('touchend', function () {
        if (isDragging) onPointerUp();
    }, { passive: true });
    viewport.addEventListener('touchcancel', function () {
        if (isDragging) onPointerUp();
    }, { passive: true });

    // Main 60fps Animation Loop with Eased Sweeping
    var lastTime = performance.now();
    var rafId = null;

    function step(now) {
        if (!isVisible) {
            rafId = null;
            return;
        }
        var dt = (now - lastTime) / 1000;
        lastTime = now;
        if (dt > 0.1) dt = 0.1; // clamp delta on tab inactive

        if (isSweeping) {
            var elapsed = now - sweepStartTime;
            var progress = Math.min(1, elapsed / sweepDuration);
            // Ease-out cubic: 1 - (1 - t)^3
            var eased = 1 - Math.pow(1 - progress, 3);
            var nextPos = sweepFrom + (sweepTo - sweepFrom) * eased;
            applyOffset(nextPos);
            if (progress >= 1) {
                isSweeping = false;
            }
        } else if (!isHovered && !isDragging) {
            // Auto-glide continuous circular wrap at 50% increased speed
            applyOffset(currentOffset + glideSpeed * dt);
        }

        rafId = requestAnimationFrame(step);
    }

    // IntersectionObserver to pause requestAnimationFrame when off-screen (0 CPU overhead)
    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    lastTime = performance.now();
                    if (!rafId) rafId = requestAnimationFrame(step);
                } else if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            });
        }, { threshold: 0.05 });
        obs.observe(carousel);
    } else {
        isVisible = true;
        rafId = requestAnimationFrame(step);
    }
}

// 7. Universal Navbar Scroll Handler
(function () {
    function updateNavbar() {
        var navbar = document.querySelector('.navbar');
        if (!navbar) return;
        var scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || (document.body ? document.body.scrollTop : 0) || 0;
        if (scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    var scrollTicking = false;
    function onScroll() {
        updateNavbar();
        if (!scrollTicking) {
            window.requestAnimationFrame(function () {
                updateNavbar();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', updateNavbar, { passive: true });
    window.addEventListener('load', updateNavbar);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateNavbar);
    } else {
        updateNavbar();
    }
})();
