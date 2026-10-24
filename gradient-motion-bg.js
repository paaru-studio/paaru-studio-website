/**
 * GradientMotionBackground (Pure Vanilla JS / HTML5 Canvas / CSS implementation)
 * Ported directly from Framer component:
 * https://framer.com/m/GradientMotionBackground-WD0KcZ.js@0XzNSaACkRVeYaCYXGIe
 *
 * Defaults:
 * - Color stops: #22c55e, #16a34a, #4ade80
 * - Base background: #050805
 * - Blend mode: screen
 * - Shape style: Blob
 * - Blob count: 3
 * - Motion style: Drift
 * - Blur: 90px - 120px
 * - Grain overlay with SVG feTurbulence
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

    var DEFAULT_CONFIG = {
        colorStops: ['#22c55e', '#16a34a', '#4ade80'],
        baseBackground: '#050805',
        blendMode: 'screen',
        opacity: 0.85,
        contrast: 110,
        shapeStyle: 'Blob',
        blobCount: 3,
        blurAmount: 90,
        sizeMin: 55,
        sizeMax: 85,
        sizeRandomness: true,
        sizeVariation: 25,
        positionJitter: 15,
        speed: 38,
        motionStyle: 'Drift',
        motionRange: 55,
        direction: 45,
        randomDirection: true,
        easeType: 'ease-in-out',
        seed: 7,
        grainEnabled: true,
        grainAmount: 12,
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
        var opts = Object.assign({}, DEFAULT_CONFIG, options || {});
        var rand = mulberry32(Math.floor(opts.seed * 100000) + 1);

        var container = document.createElement('div');
        container.className = 'gradient-motion-bg-container';
        container.setAttribute('aria-hidden', 'true');

        var inner = document.createElement('div');
        inner.className = 'gradient-motion-bg-inner';
        inner.style.opacity = opts.opacity;

        var blobs = [];
        var count = Math.max(1, Math.min(10, opts.blobCount));

        for (var i = 0; i < count; i++) {
            var baseX = ((i + 0.5) / count) * 100;
            var baseY = 30 + rand() * 40;
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
                sizePct: Math.max(10, sizeJitter),
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

        // Animation loop management via IntersectionObserver
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

    function initGradientMotionBackgrounds() {
        // Find all target cards / blocks on the index page
        var targets = document.querySelectorAll([
            '.home-services-grid .service-nav-card',
            '.featured-cases-grid .case-card',
            '.campaign-reels-grid .campaign-reel-card',
            '.blog-preview-grid .blog-card'
        ].join(', '));

        if (!targets || targets.length === 0) return;

        var observer = null;
        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var inst = entry.target._gradientBgInstance;
                    if (inst) {
                        inst.setVisible(entry.isIntersecting);
                    }
                });
            }, { rootMargin: '100px 0px', threshold: 0.05 });
        }

        // Respect prefers-reduced-motion
        var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        targets.forEach(function (card, index) {
            if (card.querySelector('.gradient-motion-bg-container')) return;

            card.classList.add('has-gradient-motion-bg');

            var instance = createGradientMotionBackground({
                seed: (index * 7 + 13) % 997,
                speed: prefersReducedMotion ? 0 : 36,
                colorStops: ['#22c55e', '#16a34a', '#4ade80'],
                baseBackground: '#050805',
                blurAmount: 85,
                opacity: 0.82
            });

            // Prepend inside the card so it acts as background behind existing content
            card.insertBefore(instance.element, card.firstChild);
            card._gradientBgInstance = instance;

            if (prefersReducedMotion) {
                // Static frozen frame
                instance.setVisible(false);
            } else if (observer) {
                observer.observe(card);
            } else {
                instance.start();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGradientMotionBackgrounds);
    } else {
        initGradientMotionBackgrounds();
    }
})();
