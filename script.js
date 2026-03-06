// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

let lastScroll = 0;
const navbar = document.querySelector('.navbar');
let scrollTicking = false;

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        window.requestAnimationFrame(() => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in effect to sections
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.about-section, .advertising-section, .podcast-section, .clients-section, .testimonials-section, .contact-section');

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
});

// Animate service items on scroll
const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const serviceItems = document.querySelectorAll('.service-item, .ad-solution, .plan-card, .client-logo');

    serviceItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        serviceObserver.observe(item);
    });
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNavBackdrop = document.querySelector('.mobile-nav-backdrop');

if (mobileMenuBtn && navbar) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navbar.classList.toggle('open');
        document.body.classList.toggle('menu-open');

        // Update aria-expanded attribute
        const isOpen = navbar.classList.contains('open');
        mobileMenuBtn.setAttribute('aria-expanded', isOpen);

        // Change menu icon
        mobileMenuBtn.textContent = isOpen ? '✕' : '☰';
    });

    // Close menu when clicking backdrop
    if (mobileNavBackdrop) {
        mobileNavBackdrop.addEventListener('click', () => {
            navbar.classList.remove('open');
            document.body.classList.remove('menu-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.textContent = '☰';
        });
    }

    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('open');
            document.body.classList.remove('menu-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.textContent = '☰';
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navbar.classList.contains('open')) {
            navbar.classList.remove('open');
            document.body.classList.remove('menu-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.textContent = '☰';
        }
    });
}

// Add parallax effect to hero section (Throttled)
let heroTicking = false;
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    if (scrolled > window.innerHeight) return;

    if (!heroTicking) {
        window.requestAnimationFrame(() => {
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / 800);
            }
            heroTicking = false;
        });
        heroTicking = true;
    }
}, { passive: true });

// Dynamic gradient effect on hero (Throttled)
let mouseTicking = false;
document.addEventListener('mousemove', (e) => {
    if (!mouseTicking) {
        window.requestAnimationFrame(() => {
            const hero = document.querySelector('.hero');
            if (hero) {
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;
                hero.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(99, 102, 241, 0.05), transparent)`;
            }
            mouseTicking = false;
        });
        mouseTicking = true;
    }
}, { passive: true });

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add hover effect to cards
document.querySelectorAll('.service-item, .plan-card, .ad-solution').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transition = 'all 0.3s ease';
    });
});

// Smooth reveal for testimonials
const testimonialObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'scale(1)';
        }
    });
}, { threshold: 0.2 });

document.addEventListener('DOMContentLoaded', () => {
    const testimonials = document.querySelectorAll('.testimonial-card');
    testimonials.forEach(testimonial => {
        testimonial.style.opacity = '0';
        testimonial.style.transform = 'scale(0.95)';
        testimonial.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        testimonialObserver.observe(testimonial);
    });
});

console.log('Paaru Studio website loaded successfully! 🚀');

/* Video modal: idempotent modal that opens YouTube iframes when a .video-poster is clicked.
   Adds centered popup playback for portfolio tiles. */
(function () {
    if (window.__ps_video_modal_installed) return;
    window.__ps_video_modal_installed = true;

    var modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = '<div class="modal-inner" role="dialog" aria-modal="true"></div><button class="close-btn" aria-label="Close">✕</button>';
    // ensure modal is appended at the root and uses fixed positioning regardless of ancestor stacking contexts
    try {
        // set strong inline positioning to avoid being trapped by transformed ancestors
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.zIndex = '999999';
        // append to the documentElement (html) where possible to avoid body overflow/context issues
        (document.documentElement || document.body).appendChild(modal);
    } catch (e) { document.body.appendChild(modal); }
    var modalInner = modal.querySelector('.modal-inner');
    var closeBtn = modal.querySelector('.close-btn');

    // Load YouTube IFrame API once and return a promise that resolves when ready
    var __ytApiReady = null;
    function loadYouTubeAPI() {
        if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
        if (__ytApiReady) return __ytApiReady;
        __ytApiReady = new Promise(function (resolve) {
            // Create global callback
            var previous = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function () {
                if (typeof previous === 'function') previous();
                resolve(window.YT);
            };
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        });
        return __ytApiReady;
    }

    var activePlayer = null;
    function showEmbedError(videoId, container) {
        container.innerHTML = '';
        var msg = document.createElement('div');
        msg.style.padding = '28px';
        msg.style.color = '#fff';
        msg.style.textAlign = 'center';
        msg.innerHTML = '<p style="font-size:18px;margin-bottom:8px;">Video cannot be played here.</p><p style="opacity:0.9;margin-bottom:12px;">This video may have embedding disabled or your browser blocked playback.</p>';
        var link = document.createElement('a');
        link.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(videoId);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Open on YouTube';
        link.style.display = 'inline-block';
        link.style.background = 'rgba(255,255,255,0.08)';
        link.style.color = '#fff';
        link.style.padding = '8px 12px';
        link.style.borderRadius = '8px';
        link.style.textDecoration = 'none';
        msg.appendChild(link);
        container.appendChild(msg);
    }

    function openModal(videoId) {
        if (!videoId) return;
        // If opened from file:// the embed may be blocked; show a helpful hint
        var isFile = location.protocol === 'file:';

        // lock scroll and show modal
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        modal.classList.add('active');
        modalInner.innerHTML = '';

        // create a placeholder div that will host the player
        var playerDiv = document.createElement('div');
        playerDiv.style.width = '100%';
        playerDiv.style.height = '100%';
        playerDiv.id = 'yt-player-' + Date.now();
        modalInner.appendChild(playerDiv);

        // if served via file:// we still try but warn user
        if (isFile) {
            // attempt to load player but show hint below
            var hint = document.createElement('div');
            hint.style.position = 'absolute';
            hint.style.left = '18px';
            hint.style.bottom = '18px';
            hint.style.color = '#fff';
            hint.style.background = 'rgba(0,0,0,0.4)';
            hint.style.padding = '8px 10px';
            hint.style.borderRadius = '8px';
            hint.style.fontSize = '13px';
            hint.textContent = 'Serving from file:// may block embeds — run a local server to test (see docs).';
            modal.appendChild(hint);
        }

        // Load YT API and instantiate player
        loadYouTubeAPI().then(function (YT) {
            // destroy previous player if any
            if (activePlayer && typeof activePlayer.destroy === 'function') {
                try { activePlayer.destroy(); } catch (e) { }
                activePlayer = null;
            }
            try {
                activePlayer = new YT.Player(playerDiv.id, {
                    videoId: videoId,
                    playerVars: { rel: 0, autoplay: 1, mute: 1, modestbranding: 1, controls: 1 },
                    events: {
                        onReady: function (evt) { try { evt.target.mute(); evt.target.playVideo(); } catch (e) { } },
                        onError: function (evt) {
                            // show fallback UI inside modal
                            showEmbedError(videoId, playerDiv);
                        }
                    }
                });
            } catch (e) {
                // if instantiation fails, show fallback
                showEmbedError(videoId, playerDiv);
            }
        }).catch(function () {
            showEmbedError(videoId, playerDiv);
        });

        // move focus to close button for accessibility
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

    // delegate clicks on poster buttons
    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('.video-poster');
        if (!btn) return;
        var container = btn.closest && btn.closest('.video-embed');
        var vid = container && container.getAttribute('data-video-id');
        if (vid) {
            openModal(vid);
            e.preventDefault();
            e.stopPropagation();
        }
    });
})();

/* file:// helper banner
   If the page is opened via file:// show a small banner with a recommended local server command
   The banner can be dismissed and the choice is remembered in localStorage. */
(function () {
    try {
        if (location.protocol !== 'file:') return;
        if (localStorage.getItem('ps_hide_file_banner') === '1') return;

        var banner = document.createElement('div');
        banner.className = 'file-banner';
        banner.innerHTML = '<div>Serving this page from <strong>file://</strong> can block video embeds. Run a local server:</div>';

        var cmd = document.createElement('div');
        cmd.className = 'cmd';
        cmd.textContent = 'python3 -m http.server 8001';
        banner.appendChild(cmd);

        var actions = document.createElement('div'); actions.className = 'actions';
        var copy = document.createElement('button'); copy.className = 'btn'; copy.textContent = 'Copy command';
        var docs = document.createElement('a'); docs.className = 'btn'; docs.textContent = 'How to'; docs.href = 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server'; docs.target = '_blank'; docs.rel = 'noopener noreferrer';
        var close = document.createElement('button'); close.className = 'close-btn'; close.textContent = '×';

        actions.appendChild(copy); actions.appendChild(docs); actions.appendChild(close);
        banner.appendChild(actions);

        document.body.appendChild(banner);

        copy.addEventListener('click', function () {
            try { navigator.clipboard.writeText(cmd.textContent); copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy command'; }, 2000); } catch (e) { alert('Copy failed — run: ' + cmd.textContent); }
        });
        close.addEventListener('click', function () { localStorage.setItem('ps_hide_file_banner', '1'); banner.parentNode && banner.parentNode.removeChild(banner); });
    } catch (e) { /* ignore errors */ }
})();

/* Add .portfolio-page class to body when the current URL is the standalone portfolio page
   This allows us to scope the CSS grid layout to only the portfolio page while keeping
   the index page carousel behavior intact. */
(function () {
    try {
        var p = location.pathname || location.href;
        // handle common cases: '/portfolio.html' or ending with 'portfolio.html' or '/portfolio/'
        if (p.indexOf('portfolio.html') !== -1 || /\/portfolio\/?$/.test(p)) {
            document.documentElement.classList.add('portfolio-page');
            document.body.classList.add('portfolio-page');
        }
    } catch (e) { }
})();

/* Footer Reveal Animation - Triggers when footer enters viewport */
(function () {
    try {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        // Add the animation class so footer starts hidden
        footer.classList.add('will-animate');

        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    footer.classList.remove('will-animate');
                    footer.classList.add('revealed');
                    // Optionally stop observing after first reveal
                    footerObserver.unobserve(footer);
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% of footer is visible
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before footer fully enters
        });

        footerObserver.observe(footer);

        // Back to top button smooth scroll
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.addEventListener('click', function (e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    } catch (e) {
        console.error('Footer animation error:', e);
    }
})();
