(function () {
  // don't show if user closed it (using cookie instead of session for longer memory)
  var cookieName = 'site_popup_closed';
  // Use CookieUtils if available, else fallback to session
  var isClosed = (typeof CookieUtils !== 'undefined') ? CookieUtils.get(cookieName) : sessionStorage.getItem(cookieName);

  if (isClosed) return;

  function createPopup() {
    var modal = document.createElement('div'); modal.className = 'site-popup-modal';
    modal.id = 'site-popup'; // Add ID for easier reference
    modal.innerHTML = '\n      <div class="site-popup-inner">\n        <div class="site-popup-left">\n          <div>\n            <h3>Get a Customized Plan</h3>\n            <p>Looking to Advertise Your Brand/Product?</p>\n          </div>\n        </div>\n        <div class="site-popup-right">\n          <button class="site-popup-close" id="site-popup-close" aria-label="Close">✕</button>\n          <h2 style="margin-top:0;margin-bottom:8px">Get Your Quote</h2>\n          <form class="site-popup-form" action="#" onsubmit="return false;">\n            <input name="name" placeholder="Name" required>\n            <input name="email" type="email" placeholder="Email" required>\n            <input name="phone" placeholder="Contact number" required>\n            <textarea name="requirement" placeholder="Your Requirement"></textarea>\n            <div style="text-align:right"><button class="submit-btn" type="submit">Send Message</button></div>\n          </form>\n        </div>\n      </div>';
    document.body.appendChild(modal);

    var close = modal.querySelector('.site-popup-close');

    function closePopup() {
      if (typeof CookieUtils !== 'undefined') CookieUtils.set(cookieName, 'true', 7); // Remember for 7 days
      else sessionStorage.setItem(cookieName, '1');

      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }

    close.addEventListener('click', closePopup);
    modal.addEventListener('click', function (e) { if (e.target === modal) closePopup(); });

    var form = modal.querySelector('.site-popup-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      // simple UX: show thank you message then hide
      var btn = form.querySelector('.submit-btn'); btn.textContent = 'Sending...'; btn.disabled = true;
      setTimeout(function () { btn.textContent = 'Send Message'; btn.disabled = false; alert('Thanks — we received your request.'); closePopup(); }, 700);
    });
  }

  // wait for DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule); else schedule();
  function schedule() { setTimeout(function () { createPopup(); }, 5000); }
})();
