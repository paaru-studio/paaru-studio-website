/* Modern preloader controller
	 - On DOMContentLoaded: lock scrolling and animate the loader entrance
	 - On window.load: run the exit animation (curtain open + fade) then remove the overlay and re-enable scroll
*/

; (function () {
	'use strict'

	const TRANSITION_MS = 900 // matches CSS .9s transitions

	// Utility: safely add / remove body lock
	function lockScroll() {
		try { document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; } catch (e) { }
	}
	function unlockScroll() {
		try { document.documentElement.style.overflow = ''; document.body.style.overflow = ''; } catch (e) { }
	}

	document.addEventListener('DOMContentLoaded', function () {
		// support both the older .preloader and the new .loadding-page snippet
		const pre = document.querySelector('.preloader') || document.querySelector('.loadding-page')
		if (!pre) return

		// Cookie Check: Only show intro on first visit
		if (typeof CookieUtils !== 'undefined' && !CookieUtils.shouldPlayIntro()) {
			pre.style.display = 'none';
			return;
		}

		// Prepare entry state: lock document scroll while the loader is showing
		lockScroll()
		// best-effort add an entrance-ready class (harmless if CSS doesn't target it)
		requestAnimationFrame(() => pre.classList.add('preloader-ready'))
	})

	window.addEventListener('load', function () {
		// Page is fully loaded: immediately fade out the loader (no delay)
		const FADE_MS = 200

		// accept either the snippet or the older .preloader to run the fade sequence
		const el = document.querySelector('.loadding-page') || document.querySelector('.preloader')
		if (!el) return

		// immediately start fade-out when page finishes loading
		el.classList.add('fade-out')

		const done = () => {
			// hide from layout and remove element to avoid blocking interactions
			try { el.style.display = 'none' } catch (e) { }
			// restore scroll (if it was locked by earlier code)
			try { document.documentElement.style.overflow = ''; document.body.style.overflow = '' } catch (e) { }
		}

		// hook transitionend for robust removal
		const onEnd = (e) => {
			if (e.propertyName && e.propertyName.indexOf('opacity') === -1) return
			el.removeEventListener('transitionend', onEnd)
			done()
		}

		el.addEventListener('transitionend', onEnd)
		// fallback guard: hide after fade time + margin
		setTimeout(done, FADE_MS + 120)
	})
})()
