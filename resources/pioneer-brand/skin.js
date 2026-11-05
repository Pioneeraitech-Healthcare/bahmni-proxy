/*
 * Pioneer Healthcare skin: names, page titles, favicon and logos on every Healthcare Core
 * screen (clinical, lab, ERP). Injected by nginx next to skin.css. Text only - it never
 * touches form values, inputs or links, so nothing the user types or saves is changed.
 */
(function () {
  var NAME = 'Pioneer Healthcare';
  var RULES = [
    [/BAHMNI EMR LOGIN/g, 'PIONEER HEALTHCARE LOGIN'],
    [/Bahmni EMR/g, 'Pioneer Healthcare EMR'],
    [/Bahmni Help/g, 'Pioneer Healthcare Help'],
    [/Bahmni Home/g, 'Pioneer Healthcare'],
    [/Bahmni Masters/g, 'Healthcare Masters'],
    [/\bBahmni\b/g, 'Pioneer Healthcare'],
    [/\bBAHMNI\b/g, 'PIONEER HEALTHCARE'],
    [/Open ?ELIS/g, 'Pioneer Healthcare Lab'],
    [/Powered by Odoo/g, ''],
    [/OdooBot/g, 'Assistant'],
    [/\bOdoo\b/g, 'Pioneer Healthcare ERP'],
    [/bahmni/gi, 'Pioneer Healthcare'],
  ];
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, OPTION: 1, CODE: 1, PRE: 1 };

  function fix(text) {
    for (var i = 0; i < RULES.length; i++) text = text.replace(RULES[i][0], RULES[i][1]);
    return text;
  }
  function walk(root) {
    if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || SKIP[p.nodeName] || (p.isContentEditable)) return NodeFilter.FILTER_REJECT;
        return /bahmni|ELIS|Odoo/i.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });
    var n; var list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (t) { var v = fix(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; });
  }
  function title() {
    var t = document.title || '';
    var v = fix(t);
    if (!/Pioneer Healthcare/.test(v)) v = v ? v + ' · ' + NAME : NAME;
    if (v !== t) document.title = v;
  }
  function favicon() {
    var links = document.querySelectorAll('link[rel~="icon"]');
    if (!links.length) { var l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); links = [l]; }
    links.forEach(function (l) { if (l.href.indexOf('/pioneer-brand/') < 0) { l.type = 'image/png'; l.href = '/pioneer-brand/mark.png'; } });
  }
  function logos() {
    document.querySelectorAll('img').forEach(function (img) {
      var s = img.getAttribute('src') || '';
      if (/bahmniLogoFull|bahmni-logo|bahmniLogo/i.test(s)) img.src = '/pioneer-brand/mark.png';
      else if (/openelis_logo/i.test(s)) img.src = '/pioneer-brand/logo-white.png';
    });
  }
  function run() { try { walk(document.body); title(); favicon(); logos(); } catch (e) { /* never break the app */ } }

  var queued = false;
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; run(); }); } }
  function start() {
    run();
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    new MutationObserver(title).observe(document.querySelector('title') || document.head, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/*
 * Pioneer Healthcare top bar - the same header as ATA healthcare: white 62px bar fixed at the
 * top, logo on the left (goes home), search (Ctrl K) and the signed-in user on the right.
 */
(function () {
  if (window.top !== window.self) return; // not inside embedded frames
  var H = location.hostname.replace(/^erp-/, '');
  var P = location.protocol;
  var MAIN = P + '//' + H, ERP = P + '//erp-' + H;
  var ON_ERP = /^erp-/.test(location.hostname);
  var GO = [
    ['Home', 'Pioneer Healthcare', MAIN + '/'],
    ['Registration', 'Clinical Service', MAIN + '/care/registration/index.html#/search'],
    ['Register a new patient', 'Clinical Service', MAIN + '/care/registration/index.html#/patient/new'],
    ['Consultation', 'Clinical Service', MAIN + '/care/clinical/index.html#/default/patient/search'],
    ['Appointments', 'Clinical Service', MAIN + '/appointments/#/home/manage/summary'],
    ['All clinical apps', 'Clinical Service', MAIN + '/care/home/index.html#/dashboard'],
    ['Bed management', 'Clinical Service', MAIN + '/care/bedmanagement/index.html'],
    ['Reports', 'Clinical Service', MAIN + '/care/reports/index.html'],
    ['Administration', 'Clinical Service', MAIN + '/care/admin/index.html#/dashboard'],
    ['Lab dashboard', 'Laboratory', MAIN + '/openelis/LabDashboard.do'],
    ['Patient billing', 'Stock Inventory & Billing', ERP + '/web#action=sale.action_quotations_with_onboarding'],
    ['Medicines & stock', 'Stock Inventory & Billing', ERP + '/web#action=stock.product_template_action_product'],
    ['Invoices & payments', 'Stock Inventory & Billing', ERP + '/web#action=account.action_move_out_invoice_type'],
    ['Purchases', 'Stock Inventory & Billing', ERP + '/web#action=purchase.purchase_rfq'],
  ];
  var LOGO = '<svg viewBox="0 0 122 32" height="32" width="122" role="img" aria-label="Pioneer Healthcare">' +
    '<image href="/pioneer-brand/mark.png" x="0" y="0" width="32" height="32"/>' +
    '<g font-family="-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif">' +
    '<text x="38" y="17" font-weight="800" font-size="16" textLength="82" lengthAdjust="spacingAndGlyphs" fill="#081D42">PIONEER</text>' +
    '<text x="38.5" y="28" font-weight="700" font-size="7.6" textLength="81" lengthAdjust="spacing" fill="#3E9C85">HEALTHCARE</text></g></svg>';
  var ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function who() {
    if (ON_ERP) {
      var n = document.querySelector('.o_user_menu .oe_topbar_name, .o_user_menu span');
      return n && n.textContent.trim() ? n.textContent.trim() : '';
    }
    var m = document.cookie.match(/(?:^|;\s*)bahmni\.user=([^;]+)/);
    if (!m) return '';
    try { return decodeURIComponent(m[1]).replace(/^"|"$/g, ''); } catch (e) { return ''; }
  }
  function signOut() {
    if (ON_ERP) { location.href = ERP + '/web/session/logout'; return; }
    if (/^\/openelis/.test(location.pathname)) {
      var a = [].slice.call(document.querySelectorAll('a')).filter(function (x) { return /log ?out/i.test(x.textContent); })[0];
      if (a) { a.click(); return; }
    }
    fetch('/openmrs/ws/rest/v1/session', { method: 'DELETE', credentials: 'same-origin' }).catch(function () {}).then(function () {
      document.cookie = 'bahmni.user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      location.href = MAIN + '/care/home/index.html#/login';
    });
  }

  function bar() {
    if (!document.body || document.getElementById('ph-topbar')) return;
    var el = document.createElement('header');
    el.id = 'ph-topbar';
    el.setAttribute('role', 'banner');
    el.innerHTML =
      '<a class="ph-brand" href="' + MAIN + '/" title="Pioneer Healthcare home">' + LOGO + '</a>' +
      '<div class="ph-search" role="search">' +
        '<span class="ph-s-ic">' + ICON_SEARCH + '</span>' +
        '<input type="search" placeholder="Search screens: registration, lab, billing..." aria-label="Search screens" autocomplete="off" spellcheck="false">' +
        '<kbd>Ctrl K</kbd>' +
        '<ul class="ph-s-list" role="listbox" hidden></ul>' +
      '</div>' +
      '<div class="ph-user"></div>';
    document.body.insertBefore(el, document.body.firstChild);
    document.documentElement.classList.add('ph-has-bar');
    wireSearch(el);
    user(el);
  }

  function wireSearch(el) {
    var input = el.querySelector('.ph-search input'), list = el.querySelector('.ph-s-list'), sel = 0, hits = [];
    function render() {
      var q = input.value.trim().toLowerCase();
      hits = GO.filter(function (g) { return !q || (g[0] + ' ' + g[1]).toLowerCase().indexOf(q) >= 0; });
      if (sel >= hits.length) sel = 0;
      list.innerHTML = hits.length ? hits.map(function (g, i) {
        return '<li role="option"' + (i === sel ? ' aria-selected="true" class="on"' : '') + ' data-i="' + i + '"><b>' + esc(g[0]) + '</b><span>' + esc(g[1]) + '</span></li>';
      }).join('') : '<li class="none">Nothing found</li>';
      list.hidden = false;
    }
    function go(i) { if (hits[i]) location.href = hits[i][2]; }
    input.addEventListener('focus', render);
    input.addEventListener('input', function () { sel = 0; render(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, hits.length - 1); render(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); render(); e.preventDefault(); }
      else if (e.key === 'Enter') { go(sel); e.preventDefault(); }
      else if (e.key === 'Escape') { list.hidden = true; input.blur(); }
      e.stopPropagation(); // keep the apps' own shortcuts out of the search box
    });
    list.addEventListener('mousedown', function (e) { var li = e.target.closest('li[data-i]'); if (li) { e.preventDefault(); go(+li.getAttribute('data-i')); } });
    input.addEventListener('blur', function () { setTimeout(function () { list.hidden = true; }, 120); });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); input.focus(); input.select(); }
    }, true);
  }

  function user(el) {
    var box = el.querySelector('.ph-user'), name = who();
    if (!name) {
      box.innerHTML = ON_ERP ? '' : '<a class="ph-signin" href="' + MAIN + '/care/home/index.html#/login">Sign in</a>';
      return;
    }
    var initial = name.charAt(0).toUpperCase();
    box.innerHTML = '<button type="button" class="ph-me" aria-haspopup="menu" aria-expanded="false"><span class="ph-av">' + esc(initial) + '</span><span class="ph-nm">' + esc(name) + '</span></button>' +
      '<div class="ph-menu" role="menu" hidden><a role="menuitem" href="' + MAIN + '/">Home</a><button type="button" role="menuitem" class="ph-out">Sign out</button></div>';
    var btn = box.querySelector('.ph-me'), menu = box.querySelector('.ph-menu');
    btn.addEventListener('click', function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', !menu.hidden); });
    document.addEventListener('click', function () { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
    box.querySelector('.ph-out').addEventListener('click', signOut);
  }
  function refreshUser() { var el = document.getElementById('ph-topbar'); if (el && !el.querySelector('.ph-me') && who()) user(el); }

  function start() {
    bar();
    new MutationObserver(function () { bar(); }).observe(document.body, { childList: true });
    setInterval(refreshUser, 2000); // the name appears once the user signs in (no page reload in the apps)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
