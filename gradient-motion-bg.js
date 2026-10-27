/**
 * GradientMotionBackground (Pure Vanilla JS / HTML5 Canvas / CSS implementation)
 * Ported directly from Framer component:
 * https://framer.com/m/GradientMotionBackground-WD0KcZ.js@0XzNSaACkRVeYaCYXGIe
 *
 * Configured with Paaru Studio recommended brand warm golden aurora palette:
 * - Color stops: ['#ffbf00', '#ff9800', '#ffd033', '#e65100']
 * - Base background: '#050505'
 * - High-performance requestAnimationFrame loop with Mulberry32 PRNG seed
 * - SVG feTurbulence film grain texture
 * - Dual layer: Fixed full-page atmospheric background + coordinated card glass backgrounds
 * - Respects prefers-reduced-motion and pauses when tab/element is inactive
 */
(function () {
    'use strict';

    function mulberry32(seed) {
        var a = seed | 0;
        return function () {
            a = (a + 0x6d2b79f5) | 0;
            var t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function ease(t, type) {
        if (type === 'linear') return t;
        if (type === 'sine') return (Math.sin((t - 0.25) * Math.PI * 2) + 1) / 2;
        // ease-in-out smoothstep
        var p = (Math.sin((t - 0.25) * Math.PI * 2) + 1) / 2;
        return p * p * (3 - 2 * p);
    }

    function buildGrainDataUri(tileSize, grainSeed) {
        var freq = 0.9;
        var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='" + tileSize + "' height='" + tileSize + "'>" +
            "<filter id='n'>" +
            "<feTurbulence type='fractalNoise' baseFrequency='" + freq + "' numOctaves='2' seed='" + grainSeed + "' stitchTiles='stitch' result='noise'/>" +
            "<feColorMatrix in='noise' type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/>" +
            "</filter>" +
            "<rect width='100%' height='100%' filter='url(#n)'/>" +
            "</svg>";
        return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
    }

    var RECOMMENDED_CONFIG = {
        colorStops: ['#ffbf00', '#ff9800', '#ffd033', '#e65100'],
        baseBackground: '#050505',
        blendMode: 'screen',
        opacity: 0.85,
        contrast: 110,
        shapeStyle: 'Blob',
        blobCount: 4,
        blurAmount: 110,
        sizeMin: 60,
        sizeMax: 95,
        sizeRandomness: true,
        sizeVariation: 30,
        positionJitter: 20,
        speed: 32,
        motionStyle: 'Drift',
        motionRange: 60,
        direction: 45,
        randomDirection: true,
        easeType: 'ease-in-out',
        seed: 42,
        grainEnabled: true,
        grainAmount: 10,
        grainSize: 120,
        grainBlendMode: 'overlay'
    };

    var shapeBorderRadius = {
        Blob: '50% 45% 55% 50% / 50% 55% 45% 50%',
        'Radial Glow': '50%',
        Wave: '60% 40% 30% 70% / 60% 30% 70% 40%',
        Mesh: '40%',
        'Diagonal Streak': '10% 90% 10% 90% / 90% 10% 90% 10%'
    };

    function createGradientMotionBackground(options) {
        var opts = Object.assign({}, RECOMMENDED_CONFIG, options || {});
        var rand = mulberry32(Math.floor(opts.seed * 100000) + 1);

        var container = document.createElement('div');
        container.className = 'gradient-motion-bg-container';
        if (opts.extraClass) {
            container.classList.add(opts.extraClass);
        }
        container.setAttribute('aria-hidden', 'true');

        var inner = document.createElement('div');
        inner.className = 'gradient-motion-bg-inner';
        inner.style.opacity = opts.opacity;

        var blobs = [];
        var count = Math.max(1, Math.min(10, opts.blobCount));

        for (var i = 0; i < count; i++) {
            var baseX = ((i + 0.5) / count) * 100;
            var baseY = 25 + rand() * 50;
            var jitterX = (rand() - 0.5) * 2 * opts.positionJitter;
            var jitterY = (rand() - 0.5) * 2 * opts.positionJitter;
            var sizeBase = opts.sizeMin + rand() * (opts.sizeMax - opts.sizeMin);
            var sizeJitter = opts.sizeRandomness ? sizeBase * (1 + (rand() - 0.5) * 2 * (opts.sizeVariation / 100)) : sizeBase;
            var color = opts.colorStops[i % opts.colorStops.length];
            var dirAngle = opts.randomDirection ? rand() * Math.PI * 2 : (opts.direction / 180) * Math.PI;

            var bData = {
                id: i,
                xPct: Math.min(100, Math.max(0, baseX + jitterX)),
                yPct: Math.min(100, Math.max(0, baseY + jitterY)),
                sizePct: Math.max(15, sizeJitter),
                color: color,
                rotation: rand() * 360,
                phase: rand(),
                dirX: Math.cos(dirAngle),
                dirY: Math.sin(dirAngle)
            };

            var blobEl = document.createElement('div');
            blobEl.className = 'gradient-motion-blob';
            var isStreak = opts.shapeStyle === 'Diagonal Streak';
            blobEl.style.left = bData.xPct + '%';
            blobEl.style.top = bData.yPct + '%';
            blobEl.style.width = (isStreak ? bData.sizePct * 2.2 : bData.sizePct) + '%';
            blobEl.style.height = (isStreak ? bData.sizePct * 0.6 : bData.sizePct) + '%';
            blobEl.style.background = opts.shapeStyle === 'Radial Glow'
                ? 'radial-gradient(circle, ' + bData.color + ' 0%, transparent 70%)'
                : bData.color;
            blobEl.style.borderRadius = shapeBorderRadius[opts.shapeStyle] || '50%';
            blobEl.style.filter = 'blur(' + opts.blurAmount + 'px)';
            blobEl.style.mixBlendMode = opts.blendMode;

            inner.appendChild(blobEl);
            blobs.push({ data: bData, element: blobEl });
        }

        container.appendChild(inner);

        // Film grain overlay
        if (opts.grainEnabled) {
            var grainEl = document.createElement('div');
            grainEl.className = 'gradient-motion-grain';
            grainEl.style.backgroundImage = buildGrainDataUri(opts.grainSize, opts.seed * 13 + 1);
            grainEl.style.backgroundRepeat = 'repeat';
            grainEl.style.backgroundSize = opts.grainSize + 'px ' + opts.grainSize + 'px';
            grainEl.style.opacity = opts.grainAmount / 100;
            grainEl.style.mixBlendMode = opts.grainBlendMode;
            container.appendChild(grainEl);
        }

        // Animation loop management
        var isVisible = true;
        var startTime = null;
        var rafId = null;

        function getTransform(b, tick) {
            var loopT = ((tick + b.phase * 6) % 6) / 6;
            var e = ease(loopT, opts.easeType);
            var swing = Math.sin(e * Math.PI * 2);
            var range = opts.motionRange;
            var tx = 0, ty = 0, rot = 0, scale = 1;

            switch (opts.motionStyle) {
                case 'Drift':
                    tx = b.dirX * range * swing;
                    ty = b.dirY * range * swing;
                    break;
                case 'Pulse':
                    scale = 1 + (range / 100) * (0.5 + 0.5 * swing) * 0.5;
                    break;
                case 'Rotate':
                    rot = e * 360;
                    break;
                case 'Wave Flow':
                    tx = Math.sin(e * Math.PI * 2 + b.id) * range;
                    ty = Math.cos(e * Math.PI * 4 + b.id) * (range / 2);
                    break;
                case 'Orbit':
                    tx = Math.cos(e * Math.PI * 2) * range;
                    ty = Math.sin(e * Math.PI * 2) * range;
                    break;
            }

            return 'translate(-50%, -50%) translate(' + tx.toFixed(2) + 'px, ' + ty.toFixed(2) + 'px) rotate(' + (rot + b.rotation).toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';
        }

        function step(now) {
            if (!isVisible) {
                rafId = null;
                return;
            }
            if (startTime === null) startTime = now;
            var elapsed = (now - startTime) / 1000;
            var tick = elapsed * (opts.speed / 100);

            for (var i = 0; i < blobs.length; i++) {
                var item = blobs[i];
                item.element.style.transform = getTransform(item.data, tick);
            }

            rafId = requestAnimationFrame(step);
        }

        function start() {
            if (!rafId && isVisible) {
                rafId = requestAnimationFrame(step);
            }
        }

        function stop() {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        return {
            element: container,
            start: start,
            stop: stop,
            setVisible: function (vis) {
                isVisible = vis;
                if (isVisible) start();
                else stop();
            }
        };
    }

    function initPageAndGridGradientMotion() {
        var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // 1. FULL WEBSITE INDEX PAGE BACKGROUND
        if (!document.getElementById('page-gradient-motion-bg')) {
            var pageBgInstance = createGradientMotionBackground({
                extraClass: 'page-gradient-motion-bg',
                seed: 88,
                speed: prefersReducedMotion ? 0 : 22,
                blobCount: 5,
                blurAmount: 140,
                sizeMin: 70,
                sizeMax: 110,
                opacity: 0.65,
                colorStops: ['#ffbf00', '#ff9800', '#ffd033', '#e65100'],
                baseBackground: '#050505',
                motionRange: 75
            });

            pageBgInstance.element.id = 'page-gradient-motion-bg';
            // Insert right at the top of <body>
            document.body.insertBefore(pageBgInstance.element, document.body.firstChild);

            if (!prefersReducedMotion) {
                pageBgInstance.start();
            }

            // Pause full page bg when user switches tabs to save CPU/battery
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    pageBgInstance.stop();
                } else if (!prefersReducedMotion) {
                    pageBgInstance.start();
                }
            });
        }

        // 2. TARGET CARDS & BLOCKS (Coordinated Gold Aura Glass)
        var targets = document.querySelectorAll([
            '.home-services-grid .service-nav-card',
            '.featured-cases-grid .case-card',
            '.campaign-reels-grid .campaign-reel-card',
            '.blog-preview-grid .blog-card'
        ].join(', '));

        var observer = null;
        if ('IntersectionObserver' in window && !prefersReducedMotion) {
            observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var inst = entry.target._gradientBgInstance;
                    if (inst) {
                        inst.setVisible(entry.isIntersecting);
                    }
                });
            }, { rootMargin: '100px 0px', threshold: 0.05 });
        }

        targets.forEach(function (card, index) {
            // Remove previous container if already present
            var existing = card.querySelector('.gradient-motion-bg-container');
            if (existing) {
                existing.remove();
            }

            card.classList.add('has-gradient-motion-bg');

            var cardInstance = createGradientMotionBackground({
                seed: (index * 17 + 23) % 997,
                speed: prefersReducedMotion ? 0 : 34,
                blobCount: 3,
                blurAmount: 80,
                sizeMin: 55,
                sizeMax: 85,
                opacity: 0.85,
                colorStops: ['#ffbf00', '#ff9800', '#ffd033', '#e65100'],
                baseBackground: '#0a0a0a',
                motionRange: 50
            });

            card.insertBefore(cardInstance.element, card.firstChild);
            card._gradientBgInstance = cardInstance;

            if (prefersReducedMotion) {
                cardInstance.setVisible(false);
            } else if (observer) {
                observer.observe(card);
            } else {
                cardInstance.start();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageAndGridGradientMotion);
    } else {
        initPageAndGridGradientMotion();
    }
})();
