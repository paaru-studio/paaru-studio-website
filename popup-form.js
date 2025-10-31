(function(){
  // don't show if user closed it in this session
  if (sessionStorage.getItem('site_popup_closed')) return;

  function createPopup(){
    var modal = document.createElement('div'); modal.className = 'site-popup-modal';
    modal.innerHTML = '\n      <div class="site-popup-inner">\n        <div class="site-popup-left">\n          <div>\n            <h3>Get a Customized Plan</h3>\n            <p>Looking to Advertise Your Brand/Product?</p>\n          </div>\n        </div>\n        <div class="site-popup-right">\n          <button class="site-popup-close" aria-label="Close">✕</button>\n          <h2 style="margin-top:0;margin-bottom:8px">Get Your Quote</h2>\n          <form class="site-popup-form" action="#" onsubmit="return false;">\n            <input name="name" placeholder="Name" required>\n            <input name="email" type="email" placeholder="Email" required>\n            <input name="phone" placeholder="Contact number" required>\n            <textarea name="requirement" placeholder="Your Requirement"></textarea>\n            <div style="text-align:right"><button class="submit-btn" type="submit">Send Message</button></div>\n          </form>\n        </div>\n      </div>';
    document.body.appendChild(modal);

    var close = modal.querySelector('.site-popup-close');
    close.addEventListener('click', function(){ sessionStorage.setItem('site_popup_closed','1'); document.body.removeChild(modal); });
    modal.addEventListener('click', function(e){ if (e.target === modal){ sessionStorage.setItem('site_popup_closed','1'); document.body.removeChild(modal); } });

    var form = modal.querySelector('.site-popup-form');
    form.addEventListener('submit', function(e){ e.preventDefault(); var data = {}; new FormData(form).forEach(function(v,k){ data[k]=v; });
      // simple UX: show thank you message then hide
      var btn = form.querySelector('.submit-btn'); btn.textContent = 'Sending...'; btn.disabled = true;
      setTimeout(function(){ btn.textContent='Send Message'; btn.disabled=false; alert('Thanks — we received your request.'); sessionStorage.setItem('site_popup_closed','1'); if (modal.parentNode) modal.parentNode.removeChild(modal); }, 700);
    });
  }

  // wait for DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule); else schedule();
  function schedule(){ setTimeout(function(){ createPopup(); }, 5000); }
})();
