// assets/sr-ad-widget.js
(function () {
  var cfg = window.adWidgetConfig || {
    headline: "Special Offer — 25% Off Today!",
    subtext: "Limited time — click to learn more.",
    ctaText: "Get Offer",
    ctaUrl: "https://example.com/offer",
    imageUrl: "https://via.placeholder.com/300x250?text=Your+Ad",
    bgColor: "#ffffff",
    accentColor: "#ff6b35",
    textColor: "#111111",
    maxWidth: 360,
    showEmail: true,
    frequencyDays: 7,
    position: "floating"
  };

  var storageKey = "sr_ad_clicked_until";
  function shouldShow() {
    if (!cfg.frequencyDays || cfg.frequencyDays <= 0) return true;
    var until = localStorage.getItem(storageKey);
    if (!until) return true;
    return Date.now() > parseInt(until, 10);
  }
  function setHideForDays(days) {
    if (!days || days <= 0) return localStorage.removeItem(storageKey);
    var until = Date.now() + days * 24 * 60 * 60 * 1000;
    localStorage.setItem(storageKey, String(until));
  }

  if (!shouldShow()) return;

  var container = document.createElement("div");
  container.className = "sr-ad-widget";
  container.setAttribute("role", "complementary");
  container.innerHTML = '\\
    <div class="sr-ad-inner">\\
      <div class="sr-ad-media" aria-hidden="true"></div>\\
      <div class="sr-ad-body">\\
        <div class="sr-ad-texts">\\
          <div class="sr-ad-headline"></div>\\
          <div class="sr-ad-subtext"></div>\\
        </div>\\
        <div class="sr-ad-actions">\\
          <button class="sr-cta" type="button"></button>\\
          <div class="sr-email-wrap" style="display:none;">\\
            <input class="sr-email-input" type="email" placeholder="Your email" aria-label="Email">\\
            <button class="sr-email-send" type="button">Save</button>\\
          </div>\\
        </div>\\
      </div>\\
      <button class="sr-close" aria-label="Close ad">×</button>\\
    </div>';

  if (cfg.position === "floating") {
    container.style.position = "fixed";
    container.style.bottom = "18px";
    container.style.right = "18px";
    container.style.zIndex = 999999;
  }
  document.body.appendChild(container);

  var css = '\\
  .sr-ad-widget { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color:' + cfg.textColor + '; max-width: ' + cfg.maxWidth + 'px; margin: 12px; }\\
  .sr-ad-inner { display:flex; align-items:center; gap:12px; background:' + cfg.bgColor + '; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.12); overflow:hidden; padding:12px; animation: sr-slide-in .5s ease; }\\
  .sr-ad-media { flex:0 0 100px; height:100px; background-image:url(' + JSON.stringify(cfg.imageUrl) + '); background-size:cover; background-position:center; border-radius:8px; }\\
  .sr-ad-body { flex:1; display:flex; gap:8px; align-items:center; justify-content:space-between; min-width:0; }\\
  .sr-ad-texts { min-width:0; }\\
  .sr-ad-headline { font-weight:700; font-size:16px; line-height:1.1; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\\
  .sr-ad-subtext { font-size:13px; color: rgba(0,0,0,0.6); margin-bottom:4px; }\\
  .sr-ad-actions { display:flex; gap:8px; align-items:center; }\\
  .sr-cta { background:' + cfg.accentColor + '; color:#fff; border:0; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:600; }\\
  .sr-cta:active { transform: translateY(1px); }\\
  .sr-email-wrap { display:flex; gap:6px; }\\
  .sr-email-input { padding:6px 8px; border-radius:8px; border:1px solid rgba(0,0,0,0.12); }\\
  .sr-email-send { padding:6px 10px; border-radius:8px; background:#eee; border:0; cursor:pointer; }\\
  .sr-close { position:absolute; top:6px; right:8px; background:transparent; border:0; font-size:18px; cursor:pointer; color: rgba(0,0,0,0.45); }\\
  @keyframes sr-slide-in { from { transform: translateY(8px); opacity:0 } to { transform:none; opacity:1 } }\\
  @media (max-width:420px){ .sr-ad-inner{ flex-direction:row; padding:10px } .sr-ad-media{ flex:0 0 76px; height:76px } .sr-ad-headline{ font-size:14px } }';
  var style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  container.querySelector(".sr-ad-headline").textContent = cfg.headline;
  container.querySelector(".sr-ad-subtext").textContent = cfg.subtext;
  container.querySelector(".sr-cta").textContent = cfg.ctaText;
  container.querySelector(".sr-ad-media").style.backgroundImage = 'url(' + cfg.imageUrl + ')';

  function trackEvent(action, label) {
    try {
      if (typeof gtag === "function") {
        gtag("event", action, { event_category: "Ad", event_label: label });
      } else if (typeof fbq === "function") {
        fbq("trackCustom", action, { label: label });
      } else {
        console.log("Ad event:", action, label);
      }
    } catch (e) {
      // ignore tracking errors
    }
  }

  container.querySelector(".sr-cta").addEventListener("click", function (ev) {
    ev.preventDefault();
    trackEvent("click_cta", cfg.ctaUrl);
    if (cfg.frequencyDays && cfg.frequencyDays > 0) setHideForDays(cfg.frequencyDays);
    window.open(cfg.ctaUrl, "_blank", "noopener");
  });

  if (cfg.showEmail) {
    var emailWrap = container.querySelector(".sr-email-wrap");
    var emailInput = container.querySelector(".sr-email-input");
    var emailSend = container.querySelector(".sr-email-send");
    container.querySelector(".sr-cta").insertAdjacentHTML("afterend", '<button class="sr-email-toggle" title="Save email" style="background:transparent;border:0;cursor:pointer;font-size:18px;line-height:1;padding:4px;color:rgba(0,0,0,0.45)">✉</button>');
    var toggle = container.querySelector(".sr-email-toggle");
    toggle.addEventListener("click", function () {
      emailWrap.style.display = emailWrap.style.display === "flex" ? "none" : "flex";
      if (emailWrap.style.display === "flex") emailInput.focus();
    });
    emailSend.addEventListener("click", function () {
      var val = emailInput.value && emailInput.value.trim();
      if (!val || !val.includes("@")) {
        emailInput.style.borderColor = "crimson";
        return;
      }
      var stored = JSON.parse(localStorage.getItem("sr_ad_emails") || "[]");
      stored.push({ email: val, ts: Date.now(), ad: cfg.headline });
      localStorage.setItem("sr_ad_emails", JSON.stringify(stored));
      trackEvent("email_saved", val);
      emailSend.textContent = "Saved";
      emailInput.value = "";
      setTimeout(function () { emailSend.textContent = "Save"; emailWrap.style.display = "none"; }, 1200);
    });
  }

  container.querySelector(".sr-close").addEventListener("click", function () {
    container.style.display = "none";
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") container.style.display = "none";
  });

  window.srAdWidget = window.srAdWidget || {};
  window.srAdWidget.close = function () { container.style.display = "none"; };
  window.srAdWidget.open = function () { container.style.display = ""; };
  window.srAdWidget.getSavedEmails = function () { return JSON.parse(localStorage.getItem("sr_ad_emails") || "[]"); };
})();
