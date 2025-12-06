/**
 * Cookie Utilities for Paaru Studio Portfolio
 * A modular, clean utility to manage user preferences and site state via cookies.
 */

const CookieUtils = {
    /**
     * BASIC COOKIE FUNCTIONS
     */

    /**
     * Set a cookie
     * @param {string} name - Name of the cookie
     * @param {string} value - Value to store
     * @param {number} days - Number of days until expiration
     */
    set: function (name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    },

    /**
     * Get a cookie value
     * @param {string} name - Name of the cookie to retrieve
     * @returns {string|null} - The cookie value or null if not found
     */
    get: function (name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    /**
     * Delete a cookie
     * @param {string} name - Name of the cookie to delete
     */
    delete: function (name) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    },

    /**
     * FEATURE 1: ANIMATION PREFERENCE
     * Checks 'reduce-motion' cookie. If 'true', adds 'no-animations' class to body.
     * Use toggleAnimationPref() to switch state.
     */
    applyAnimationPref: function () {
        // Run this immediately on load
        if (this.get('reduce-motion') === 'true') {
            document.body.classList.add('no-animations');
        }
    },

    toggleAnimationPref: function () {
        const body = document.body;
        if (body.classList.contains('no-animations')) {
            body.classList.remove('no-animations');
            this.set('reduce-motion', 'false', 365);
            console.log('Animations enabled');
        } else {
            body.classList.add('no-animations');
            this.set('reduce-motion', 'true', 365);
            console.log('Animations disabled');
        }
        return body.classList.contains('no-animations');
    },

    /**
     * FEATURE 2: POPUP MANAGEMENT
     * Manage "Don't show again" popups.
     * @param {string} popupId - ID of the popup element
     * @param {string} closeBtnId - ID of the close button
     * @param {number} silenceDays - Days to suppress popup after closing
     */
    initPopup: function (popupId, closeBtnId, silenceDays = 7) {
        const popup = document.getElementById(popupId);
        const closeBtn = document.getElementById(closeBtnId);
        const cookieName = 'popup_closed_' + popupId;

        if (!popup) return;

        // If cookie exists, hide popup immediately (or simply don't show it)
        if (this.get(cookieName)) {
            popup.style.display = 'none';
            return;
        }

        // Otherwise show it (assuming CSS hides it by default, or logic here shows it)
        popup.style.display = 'flex'; // or 'block'

        // Handle close
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                popup.style.display = 'none';
                this.set(cookieName, 'true', silenceDays);
                console.log(`Popup ${popupId} closed. Will not show for ${silenceDays} days.`);
            });
        }
    },

    /**
     * FEATURE 3: INTRO ANIMATION SKIP
     * Useful for splash screens. Returns true if intro should play (first visit).
     * Automatically sets the cookie so subsequent calls return false.
     * @returns {boolean} - True if this is the first visit
     */
    shouldPlayIntro: function () {
        const seen = this.get('intro_seen');
        if (!seen) {
            // First visit
            this.set('intro_seen', 'true', 1); // Expire in 1 day (or session)
            return true;
        }
        return false;
    },

    /**
     * FEATURE 4: PORTFOLIO FILTER MEMORY
     * Remembers the last selected filter category.
     * @param {string} controlSelector - CSS selector for filter buttons (e.g., '.filter-btn')
     * @param {string} itemsSelector - CSS selector for portfolio items (e.g., '.portfolio-item')
     * @param {string} activeClass - Class to add to active filter button (default: 'active')
     */
    initPortfolioFilter: function (controlSelector, itemsSelector, activeClass = 'active') {
        const controls = document.querySelectorAll(controlSelector);
        const items = document.querySelectorAll(itemsSelector);
        const savedFilter = this.get('portfolio_filter') || 'all';

        // Helper to apply filter
        const applyFilter = (filter) => {
            // Update UI items
            items.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.style.display = ''; // Reset display
                } else {
                    item.style.display = 'none';
                }
            });

            // Update Active State on Buttons
            controls.forEach(btn => {
                if (btn.getAttribute('data-filter') === filter) {
                    btn.classList.add(activeClass);
                } else {
                    btn.classList.remove(activeClass);
                }
            });
        };

        // Apply saved filter on load
        if (savedFilter) {
            applyFilter(savedFilter);
        }

        // Add event listeners
        controls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const filterValue = btn.getAttribute('data-filter');
                applyFilter(filterValue);
                this.set('portfolio_filter', filterValue, 30); // Remember for 30 days
            });
        });
    }
};

// Automatically check global preferences on script load
document.addEventListener('DOMContentLoaded', () => {
    CookieUtils.applyAnimationPref();
});
