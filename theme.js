/**
 * Paaru Studio - Complete Light & Dark Theme Controller
 * Supports user preference persistence via localStorage, system preference fallback,
 * and seamless dynamic switching across all pages.
 */
(function () {
    'use strict';

    function getPreferredTheme() {
        try {
            var stored = localStorage.getItem('paaru-theme');
            if (stored === 'light' || stored === 'dark') return stored;
        } catch (e) {}

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    var currentTheme = getPreferredTheme();
    document.documentElement.setAttribute('data-theme', currentTheme);

    function updateButtons(theme) {
        var buttons = document.querySelectorAll('.theme-toggle-btn');
        buttons.forEach(function (btn) {
            var label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
            btn.setAttribute('aria-label', label);
            btn.setAttribute('title', label);
            if (theme === 'dark') {
                btn.classList.add('is-dark');
                btn.classList.remove('is-light');
            } else {
                btn.classList.add('is-light');
                btn.classList.remove('is-dark');
            }
        });
    }

    window.toggleTheme = function () {
        var active = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = active === 'dark' ? 'light' : 'dark';
        
        // Add temporary smooth transition class to body
        document.documentElement.classList.add('theme-switching');
        document.documentElement.setAttribute('data-theme', next);
        
        try {
            localStorage.setItem('paaru-theme', next);
        } catch (e) {}

        updateButtons(next);

        setTimeout(function () {
            document.documentElement.classList.remove('theme-switching');
        }, 400);

        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
    };

    function initThemeUI() {
        var theme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
        document.documentElement.setAttribute('data-theme', theme);
        updateButtons(theme);

        // Bind all theme toggles
        document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
            if (!btn.dataset.bound) {
                btn.dataset.bound = 'true';
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.toggleTheme();
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeUI);
    } else {
        initThemeUI();
    }

    // Listen for OS color scheme changes if user hasn't explicitly set a preference
    if (window.matchMedia) {
        try {
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
                try {
                    if (!localStorage.getItem('paaru-theme')) {
                        var newTheme = e.matches ? 'light' : 'dark';
                        document.documentElement.setAttribute('data-theme', newTheme);
                        updateButtons(newTheme);
                    }
                } catch (err) {}
            });
        } catch (e) {}
    }
})();
