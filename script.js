// === CORE: Navbar scroll effect ===
(function () {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.pageYOffset > 50);
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });
})();

// === CORE: Mobile menu ===
(function () {
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavBackdrop = document.querySelector('.mobile-nav-backdrop');
    if (!mobileMenuBtn || !navbar) return;

    function closeMenu() {
        navbar.classList.remove('open');
        document.body.classList.remove('menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.textContent = '☰';
    }

    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navbar.classList.toggle('open');
        document.body.classList.toggle('menu-open', isOpen);
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        mobileMenuBtn.textContent = isOpen ? '✕' : '☰';
    });

    if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeMenu);
    document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
})();

// === CORE: Smooth scroll for anchor links ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// === CORE: Intersection Observer animations (only if elements exist) ===
(function () {
    if (!('IntersectionObserver' in window)) return;
    const opts = { threshold: 0.1, rootMargin: '0px 0px -80px 0px' };

    function animateOnScroll(selector, extraDelay) {
        const items = document.querySelectorAll(selector);
        if (!items.length) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    const delay = extraDelay ? i * 80 : 0;
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'none';
                    }, delay);
                    obs.unobserve(entry.target);
                }
            });
        }, opts);
        items.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            obs.observe(el);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        animateOnScroll('.about-section, .advertising-section, .contact-section, .clients-section', false);
        animateOnScroll('.service-item, .ad-solution, .plan-card', true);
        animateOnScroll('.testimonial-card', false);
    });
})();

// === CORE: Video modal (YouTube IFrame API) ===
(function () {
    if (window.__ps_video_modal_installed) return;
    window.__ps_video_modal_installed = true;

    var modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = '<div class="modal-inner" role="dialog" aria-modal="true"></div><button class="close-btn" aria-label="Close">✕</button>';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;';
    (document.documentElement || document.body).appendChild(modal);
    var modalInner = modal.querySelector('.modal-inner');
    var closeBtn = modal.querySelector('.close-btn');

    var __ytApiReady = null;
    function loadYouTubeAPI() {
        if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
        if (__ytApiReady) return __ytApiReady;
        __ytApiReady = new Promise(function (resolve) {
            var prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function () { if (typeof prev === 'function') prev(); resolve(window.YT); };
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        });
        return __ytApiReady;
    }

    var activePlayer = null;

    function showEmbedError(videoId, container) {
        container.innerHTML = '<div style="padding:28px;color:#fff;text-align:center"><p style="font-size:18px;margin-bottom:8px">Video cannot be played here.</p><a href="https://www.youtube.com/watch?v=' + encodeURIComponent(videoId) + '" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:rgba(255,255,255,0.08);color:#fff;padding:8px 12px;border-radius:8px;text-decoration:none">Open on YouTube</a></div>';
    }

    function openModal(videoId) {
        if (!videoId) return;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        modal.classList.add('active');
        modalInner.innerHTML = '';
        var playerDiv = document.createElement('div');
        playerDiv.style.cssText = 'width:100%;height:100%;';
        playerDiv.id = 'yt-player-' + Date.now();
        modalInner.appendChild(playerDiv);
        loadYouTubeAPI().then(function (YT) {
            if (activePlayer && typeof activePlayer.destroy === 'function') { try { activePlayer.destroy(); } catch (e) { } activePlayer = null; }
            try {
                activePlayer = new YT.Player(playerDiv.id, {
                    videoId: videoId,
                    playerVars: { rel: 0, autoplay: 1, mute: 1, modestbranding: 1, controls: 1 },
                    events: {
                        onReady: function (evt) { try { evt.target.mute(); evt.target.playVideo(); } catch (e) { } },
                        onError: function () { showEmbedError(videoId, playerDiv); }
                    }
                });
            } catch (e) { showEmbedError(videoId, playerDiv); }
        }).catch(function () { showEmbedError(videoId, playerDiv); });
        closeBtn.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        modalInner.innerHTML = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('.video-poster');
        if (!btn) return;
        var container = btn.closest && btn.closest('.video-embed');
        var vid = container && container.getAttribute('data-video-id');
        if (vid) { openModal(vid); e.preventDefault(); e.stopPropagation(); }
    });
})();

// === OPTIONAL: Hero parallax (only on pages with .hero-content) ===
(function () {
    if (!document.querySelector('.hero-content')) return;
    let heroTicking = false;
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled > window.innerHeight) return;
        if (!heroTicking) {
            window.requestAnimationFrame(() => {
                const heroContent = document.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                    heroContent.style.opacity = String(1 - scrolled / 800);
                }
                heroTicking = false;
            });
            heroTicking = true;
        }
    }, { passive: true });
})();

// === OPTIONAL: Footer reveal ===
(function () {
    const footer = document.querySelector('.footer');
    if (!footer || !('IntersectionObserver' in window)) return;
    footer.classList.add('will-animate');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                footer.classList.remove('will-animate');
                footer.classList.add('revealed');
                obs.unobserve(footer);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    obs.observe(footer);

    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
