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

  var ON_LAB = !ON_ERP && /^\/openelis/.test(location.pathname);
  var ON_CLINICAL = !ON_ERP && /^\/(care|appointments|ipd)\b/.test(location.pathname);
  var LOGIN_PAGE = /#\/login/.test(location.hash) || /LoginPage\.do|ValidateLogin/.test(location.pathname) || /^\/web\/login/.test(location.pathname);
  function clean(s) { s = (s || '').trim(); return /^(null|undefined|false|public user)$/i.test(s) ? '' : s; }
  // Who is signed in - from the apps themselves, never a guess ("null" is never shown).
  function who(cb) {
    if (ON_ERP) {
      var n = document.querySelector('.o_user_menu .oe_topbar_name, .o_user_menu .o_user_avatar + span, .o_user_menu span');
      return cb(clean(n && n.textContent));
    }
    if (ON_LAB) { // the lab has its own sign-in; it is signed in when its menu is on screen
      return cb(document.querySelector('#user-info, #topMenu, #nav-first') && !document.querySelector('input[name=loginName]') ? 'Lab user' : '');
    }
    fetch('/openmrs/ws/rest/v1/session?v=custom:(authenticated,user:(username,person:(display)))', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (s) {
        if (!s || !s.authenticated || !s.user) return cb('', false);
        cb(clean((s.user.person && s.user.person.display) || s.user.username), true);
      })
      .catch(function () { cb(''); });
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
      '<div class="ph-lang"></div><div class="ph-user"></div>';
    document.body.insertBefore(el, document.body.firstChild);
    document.documentElement.classList.add('ph-has-bar');
    wireSearch(el);
    try { lang(el); } catch (e) {}
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
    who(function (name, authed) {
      // Clinical screens need a signed-in user; without one the apps show a blank page.
      if (ON_CLINICAL && authed === false && !LOGIN_PAGE && !/^\/care\/home\//.test(location.pathname)) {
        location.replace(MAIN + '/care/home/index.html#/login');
        return;
      }
      draw(el, name);
    });
  }
  function draw(el, name) {
    var box = el.querySelector('.ph-user');
    if (!box) return;
    if (!name) {
      box.innerHTML = (ON_ERP || ON_LAB || LOGIN_PAGE) ? '' : '<a class="ph-signin" href="' + MAIN + '/care/home/index.html#/login">Sign in</a>';
      box.removeAttribute('data-name');
      return;
    }
    if (box.getAttribute('data-name') === name) return;
    box.setAttribute('data-name', name);
    var initial = name.charAt(0).toUpperCase();
    box.innerHTML = '<button type="button" class="ph-me" aria-haspopup="menu" aria-expanded="false"><span class="ph-av">' + esc(initial) + '</span><span class="ph-nm">' + esc(name) + '</span></button>' +
      '<div class="ph-menu" role="menu" hidden><a role="menuitem" href="' + MAIN + '/">Home</a><button type="button" role="menuitem" class="ph-out">Sign out</button></div>';
    var btn = box.querySelector('.ph-me'), menu = box.querySelector('.ph-menu');
    btn.addEventListener('click', function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', !menu.hidden); });
    document.addEventListener('click', function () { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
    box.querySelector('.ph-out').addEventListener('click', signOut);
  }
  function refreshUser() { var el = document.getElementById('ph-topbar'); if (el) who(function (n) { draw(el, n); }); }

  // Fixed header: anything else the apps pin to the very top moves below it.
  var BAR_H = 62;
  function fixTops() {
    if (ON_ERP && document.body.classList.contains('o_web_client')) return; // the ERP lays out in a column under the bar
    var all = document.body.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (e.id === 'ph-topbar' || e.closest('#ph-topbar, .ph-auth, #ph-labnav')) continue;
      var cs = getComputedStyle(e);
      if (cs.position !== 'fixed' || e.getAttribute('data-ph-shifted')) continue;
      var t = parseFloat(cs.top);
      if (!isNaN(t) && t < BAR_H && e.getBoundingClientRect().top < BAR_H) { e.style.top = (t + BAR_H) + 'px'; e.setAttribute('data-ph-shifted', '1'); }
    }
  }
  var fixQueued = null;
  function queueFix() { if (fixQueued) return; fixQueued = setTimeout(function () { fixQueued = null; try { fixTops(); } catch (e) {} }, 400); }

  /*
   * Sign-in pages (clinical, lab, ERP) in the ATA healthcare pattern: brand panel on the left, a
   * narrow work column on the right, no app header. The apps' real sign-in forms are moved into it,
   * so signing in works exactly as before.
   */
  var AREA = ON_ERP ? 'Stock Inventory & Billing' : ON_LAB ? 'Laboratory' : 'Clinical Service';
  var AREA_LINE = ON_ERP ? 'Sign in to Stock Inventory & Billing: medicines, stock, bills, invoices and payments.'
    : ON_LAB ? 'Sign in to the Laboratory: samples, results and validation.'
    : 'Sign in to Clinical Service: registration, consultations, orders and appointments.';
  var EYE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  var shell = null, shellKey = '', shellOrigin = null;
  function logo(h) { return LOGO.replace('height="32" width="122"', 'height="' + h + '" width="' + Math.round(h * 122 / 32) + '"'); }
  function buildShell(title, sub) {
    var d = document.createElement('div');
    d.className = 'ph-auth';
    d.innerHTML =
      '<aside class="ph-auth-brand" aria-hidden="true">' + logo(36) +
        '<img class="ph-auth-hero" src="/pioneer-brand/hero-mark.png" alt="">' +
        '<div class="ph-auth-copy"><p class="ph-auth-eyebrow">Patients &bull; Laboratory &bull; Pharmacy &bull; Billing</p>' +
        '<p class="ph-auth-title">Healthcare Core</p><p class="ph-auth-line">' + esc(AREA_LINE) + '</p></div>' +
        '<p class="ph-auth-tag">Technology for a healthier tomorrow</p>' +
      '</aside>' +
      '<main class="ph-auth-main"><div class="ph-auth-top"><span class="ph-auth-mlogo">' + logo(30) + '</span></div>' +
        '<div class="ph-auth-center"><div class="ph-auth-col"><h1>' + esc(title) + '</h1><p class="ph-auth-sub">' + esc(sub) + '</p><div class="ph-auth-slot"></div></div></div>' +
        '<footer class="ph-auth-foot">&copy; ' + new Date().getFullYear() + ' Pioneer Healthcare</footer></main>';
    document.body.appendChild(d);
    return d;
  }
  function dropShell() {
    if (shell) { shell.remove(); shell = null; shellKey = ''; shellOrigin = null; }
    document.documentElement.classList.remove('ph-auth-on', 'ph-login');
  }
  function eyes(root) {
    root.querySelectorAll('input[type=password]').forEach(function (i) {
      if (i.parentNode.classList.contains('ph-pw')) return;
      var w = document.createElement('span'); w.className = 'ph-pw';
      i.parentNode.insertBefore(w, i); w.appendChild(i);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'ph-pw-eye'; b.setAttribute('aria-label', 'Show password'); b.innerHTML = EYE;
      b.addEventListener('click', function () { var show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); i.focus(); });
      w.appendChild(b);
    });
  }
  function errorsToAlerts(root) {
    root.querySelectorAll('.note.error, .alert-danger, .ph-note').forEach(function (n) { n.classList.add('ph-alert'); });
  }
  function loginSkin() {
    var html = document.documentElement;
    if (shell && shellOrigin && !shellOrigin.isConnected) dropShell();
    var key = '', origin = null, title = 'Sign in', sub = ON_ERP ? 'Use your email and password.' : 'Use your username and password.';
    var mover = null;
    if (ON_ERP) {
      var of = document.querySelector('form.oe_login_form');
      if (of) { key = 'erp'; origin = document.body; mover = function (slot) { slot.appendChild(of); }; }
    } else if (ON_LAB) {
      var user = document.querySelector('input[name=loginName]'), pass = document.querySelector('input[name=password]');
      if (user && pass && user.form) {
        key = 'lab'; origin = document.body;
        mover = function (slot) {
          var form = user.form, note = '';
          document.querySelectorAll('td, div, span, font').forEach(function (n) { if (!note && n.children.length === 0 && /session has expired|invalid|incorrect|failed|not authori/i.test(n.textContent)) note = n.textContent.trim(); });
          if (note) slot.insertAdjacentHTML('beforeend', '<div class="ph-alert" role="alert">' + esc(note) + '</div>');
          var f1 = document.createElement('label'); f1.className = 'ph-f'; f1.innerHTML = '<span>Username</span>';
          var f2 = document.createElement('label'); f2.className = 'ph-f'; f2.innerHTML = '<span>Password</span>';
          f1.appendChild(user); f2.appendChild(pass); slot.appendChild(f1); slot.appendChild(f2);
          var chg = document.getElementById('changePasswordButton'), sbm = document.getElementById('submitButton');
          if (chg) { var row = document.createElement('div'); row.className = 'ph-auth-links'; chg.value = 'Change password'; row.appendChild(chg); slot.appendChild(row); }
          if (sbm) { sbm.value = 'Sign in'; slot.appendChild(sbm); }
          // the old page puts its form inside a table, where browsers hide it: keep the fields tied to it
          if (!form.id) form.id = 'ph-lab-form';
          [user, pass, sbm, chg].forEach(function (x) { if (x) x.setAttribute('form', form.id); });
          html.classList.add('ph-lab-login');
        };
      }
    } else {
      var box = document.querySelector('.login:not(.login-otp)');
      var form2 = box && box.querySelector('form');
      if (box && form2 && box.offsetParent !== null) {
        var loc = !!form2.querySelector('select#location');
        if (form2.querySelector('#username') || loc) {
          key = loc ? 'clinical-location' : 'clinical-login'; origin = box;
          if (loc) { title = 'Choose your location'; sub = 'Where are you working today?'; }
          mover = function (slot) {
            slot.appendChild(form2);
            var btn = form2.querySelector('button.confirm, button[type=submit]');
            if (btn && /^\s*login\s*$/i.test(btn.textContent)) btn.textContent = 'Sign in';
          };
        }
      }
    }
    if (!key) { if (shell && !(shellOrigin && shellOrigin.isConnected)) dropShell(); return; }
    if (shell && shellKey === key && shellOrigin === origin) { errorsToAlerts(shell); return; }
    if (shell && shellKey === key) return; // the form already lives in the shell
    dropShell();
    shell = buildShell(title, sub); shellKey = key; shellOrigin = origin;
    var slot = shell.querySelector('.ph-auth-slot');
    mover(slot); eyes(slot); errorsToAlerts(slot);
    html.classList.add('ph-auth-on', 'ph-login');
    var first = slot.querySelector('input:not([type=hidden]), select'); if (first) first.focus();
  }

  /* Language: in the top bar after sign-in (not on the sign-in page). Real languages per area. */
  var LANGS = (ON_ERP || ON_LAB) ? [['en', 'English']] : [['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['it', 'Italiano'], ['pt_BR', 'Português']];
  function lang(el) {
    var host = el.querySelector('.ph-lang'); if (!host) return;
    var cur = 'en'; try { cur = (localStorage.getItem('NG_TRANSLATE_LANG_KEY') || 'en').replace(/"/g, ''); } catch (e) {}
    if (ON_ERP || ON_LAB) cur = 'en';
    var label = (LANGS.filter(function (l) { return l[0] === cur; })[0] || LANGS[0]);
    host.innerHTML = '<button type="button" class="ph-lang-btn" aria-haspopup="menu" aria-expanded="false" title="Language">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
      '<span>' + esc(label[0].slice(0, 2).toUpperCase()) + '</span></button>' +
      '<div class="ph-menu ph-lang-menu" role="menu" hidden><div class="ph-menu-h">Language</div>' +
      LANGS.map(function (l) { return '<button type="button" role="menuitemradio" aria-checked="' + (l[0] === label[0]) + '" data-l="' + l[0] + '">' + esc(l[1]) + (l[0] === label[0] ? '<span class="ph-check">✓</span>' : '') + '</button>'; }).join('') +
      (LANGS.length === 1 ? '<div class="ph-menu-note">More languages can be added by an administrator.</div>' : '') + '</div>';
    var btn = host.querySelector('.ph-lang-btn'), menu = host.querySelector('.ph-lang-menu');
    btn.addEventListener('click', function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', !menu.hidden); });
    document.addEventListener('click', function () { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
    menu.querySelectorAll('[data-l]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = b.getAttribute('data-l');
        if (l === label[0]) return;
        try { localStorage.setItem('NG_TRANSLATE_LANG_KEY', l); } catch (e) {}
        location.reload();
      });
    });
  }

  function start() {
    bar();
    try { loginSkin(); } catch (e) {}
    queueFix();
    new MutationObserver(function () { bar(); queueFix(); try { loginSkin(); } catch (e) {} }).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('hashchange', function () { LOGIN_PAGE = /#\/login/.test(location.hash) || /LoginPage\.do/.test(location.pathname) || /^\/web\/login/.test(location.pathname); refreshUser(); });
    setInterval(refreshUser, 15000); // name appears after signing in (the apps change screens without reloading)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/*
 * The Pioneer Healthcare loader (same as ATA healthcare's PcpLoader): the "P + cross" mark breathing
 * inside a ring whose arc sweeps round from brand blue to green. Replaces every old spinner.
 */
(function () {
  var n = 0;
  window.PH_LOADER_SVG = function (size) {
    var id = 'ph-lg-' + (++n);
    size = size || 48;
    return '<svg class="ph-loader" viewBox="0 0 48 48" width="' + size + '" height="' + size + '" role="img" aria-label="Loading">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E5BD8"/><stop offset="100%" stop-color="#3E9C85"/></linearGradient></defs>' +
      '<circle cx="24" cy="24" r="22.5" fill="none" stroke="#1E5BD8" stroke-opacity="0.12" stroke-width="2"/>' +
      '<circle class="ph-loader-arc" cx="24" cy="24" r="22.5" fill="none" stroke="url(#' + id + ')" stroke-width="2" stroke-linecap="round" stroke-dasharray="42 100"/>' +
      '<image class="ph-loader-mark" href="/pioneer-brand/mark.png" x="6" y="6" width="36" height="36"/></svg>';
  };
  // clinical screens: the apps' loading overlay (#overlay) gets the loader instead of the old spinner
  function swap() {
    var o = document.getElementById('overlay');
    if (o && !o.querySelector('.ph-loader')) { o.insertAdjacentHTML('beforeend', '<div class="ph-loader-box">' + window.PH_LOADER_SVG(56) + '</div>'); o.classList.add('ph-has-loader'); }
  }
  function start() { swap(); new MutationObserver(swap).observe(document.body, { childList: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
