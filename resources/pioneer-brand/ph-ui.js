/*
 * Pioneer Healthcare UI components (PH.ui) - one set of components for every Healthcare Core module
 * (laboratory, clinical, ERP). Built on the ATA healthcare kit (kit/*.css, copied verbatim) and the
 * healthcare edition accent, so every screen looks like ATA healthcare. Module adapters (lab.js, ...)
 * only call these functions; they never style anything themselves.
 *
 *   PH.ui.scope(root)                       ATA kit scope + accent on a root (the page)
 *   PH.ui.pageHeader({icon,title,purpose,actions})        -> element (kit .kph)
 *   PH.ui.card({title, required, body:[nodes], plain})    -> element (card)
 *   PH.ui.button(el, 'primary'|'secondary'|'quiet'|'danger'|'link')   upgrade an existing button
 *   PH.ui.field(el)                         upgrade an input/select/textarea (kit .kinp)
 *   PH.ui.table(tableEl, {toolbar})         wrap a table in the standard table card (kit .kdt-wrap.kstd)
 *   PH.ui.tabs([{label, selected, onClick|href}]) -> element (kit .ktabs/.ktab)
 *   PH.ui.tabMenu(label, items, {selected})  a tab that opens a kit menu (items: {label,href,onclick,current}|{header}|{separator})
 *   PH.ui.menu(anchor, items)               open a kit menu under any button
 *   PH.ui.drawer({title, subtitle, body, actions, width}) -> {el, open(), close()} (kit .kdrw)
 *   PH.ui.emptyState({title, text, icon})   -> element (kit .kstate)
 *   PH.ui.pill(text, tone)                  -> element (kit .kpill: ok|warn|bad|info|mute)
 *   PH.ui.stat(value, label)                -> element (stat card)
 *   PH.ui.alert(text, tone)                 -> element (alert)
 *   PH.ui.loader(size)                      -> svg string (Pioneer Healthcare loader)
 *   PH.ui.toast(text, tone)                 show a toast (kit .ktoast look)
 *   PH.ui.actionBar(el)                     pin an element's actions to the bottom of the window
 *   PH.ui.tiles(items)                      -> element (card grid of links)
 *   PH.ui.icon(name)                        -> svg string
 */
(function () {
  var PH = window.PH = window.PH || {};
  if (PH.ui) return;
  var ACCENT = { '--blue': '#4F46E5', '--blue-hover': '#4338CA', '--blue-text': '#4F46E5', '--pri': '#4F46E5', '--pri-hover': '#4338CA', '--blue-soft': 'rgba(79,70,229,.08)', '--blue-line': 'rgba(79,70,229,.28)' };
  var ICONS = {
    lab: '<path d="M9 3h6M10 3v6.5L4.6 18.4A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.4-2.6L14 9.5V3"/><path d="M7 15h10"/>',
    sample: '<path d="M10 2v7.3L5 18a2.5 2.5 0 0 0 2.2 3.7h9.6A2.5 2.5 0 0 0 19 18l-5-8.7V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    patient: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    results: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    ok: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    warn: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    bad: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  };
  function icon(name, size) { return '<svg viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.lab) + '</svg>'; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function append(parent, kids) { (kids || []).forEach(function (k) { if (k == null) return; parent.appendChild(typeof k === 'string' ? el('span', '', k) : k); }); }

  var ui = PH.ui = {};
  ui.icon = icon;

  /*
   * Move a node without breaking forms. Old pages put forms inside tables, where the browser ties
   * each field to its form invisibly; moving the field would cut that tie and the page's own save
   * would no longer find it. Every component moves nodes through here: each field keeps its form
   * (re-tied with the form attribute when needed).
   */
  var fid = 0;
  ui.move = function (node, parent, before) {
    var ctrls = [];
    if (node.nodeType === 1) {
      if ('form' in node && /^(INPUT|SELECT|TEXTAREA|BUTTON|FIELDSET|OUTPUT|OBJECT)$/.test(node.tagName)) ctrls.push(node);
      [].push.apply(ctrls, node.querySelectorAll('input, select, textarea, button, fieldset, output, object'));
    }
    var owners = ctrls.map(function (c) { return c.form; });
    parent.insertBefore(node, before || null);
    ctrls.forEach(function (c, i) {
      var f = owners[i];
      if (f && c.form !== f) { if (!f.id) f.id = 'ph-form-' + (++fid); c.setAttribute('form', f.id); }
    });
    return node;
  };
  ui.esc = esc;

  ui.scope = function (root) {
    root = root || document.documentElement;
    root.classList.add('ata-v2', 'ph-ui');
    root.setAttribute('data-theme', 'light');
    Object.keys(ACCENT).forEach(function (k) { root.style.setProperty(k, ACCENT[k]); });
  };

  ui.pageHeader = function (o) {
    var h = el('div', 'kph ph-page-header',
      '<span class="kph-i">' + icon(o.icon) + '</span>' +
      '<div class="kph-id"><div class="kph-row"><h1 class="kph-t">' + esc(o.title) + '</h1>' + (o.count != null ? '<span class="kph-c">' + esc(o.count) + '</span>' : '') + '</div>' +
      (o.purpose ? '<p class="kph-p">' + esc(o.purpose) + '</p>' : '') + '</div><div class="kph-a"></div>');
    append(h.querySelector('.kph-a'), o.actions);
    return h;
  };

  ui.card = function (o) {
    o = o || {};
    var c = el('section', 'ph-card' + (o.plain || !o.title ? ' ph-card-plain' : ''));
    if (o.title) c.appendChild(el('h2', 'ph-card-h', esc(o.title) + (o.required ? '<span class="ph-req" aria-hidden="true">*</span>' : '')));
    var b = el('div', 'ph-card-b'); c.appendChild(b);
    append(b, o.body);
    return c;
  };

  var VARIANT = { primary: 'pri', secondary: '', quiet: 'quiet', danger: 'danger', link: 'ph-link' };
  ui.button = function (b, variant) {
    if (!b || b.getAttribute('data-ph-ui') === 'btn') return b;
    b.setAttribute('data-ph-ui', 'btn');
    b.classList.add('btn', 'ph-btn');
    var v = VARIANT[variant || 'secondary']; if (v) b.classList.add(v);
    return b;
  };
  ui.newButton = function (label, variant, onClick) {
    var b = el('button', '', esc(label)); b.type = 'button'; if (onClick) b.addEventListener('click', onClick);
    return ui.button(b, variant);
  };

  ui.field = function (i) {
    if (!i || i.getAttribute('data-ph-ui') === 'field') return i;
    i.setAttribute('data-ph-ui', 'field');
    if (i.type === 'file') { i.classList.add('ph-file'); return i; }
    if (i.type === 'checkbox' || i.type === 'radio') { i.classList.add('ph-check'); return i; }
    i.classList.add('kinp', 'ph-field');
    if (i.tagName === 'SELECT') i.classList.add('ph-select');
    return i;
  };

  ui.table = function (t, o) {
    if (!t || t.closest('.kdt-wrap')) return t;
    o = o || {};
    t.classList.add('kdt', 'ph-table');
    var wrap = el('div', 'kdt-wrap kstd ph-table-card');
    t.parentNode.insertBefore(wrap, t);
    if (o.title || o.toolbar) {
      var bar = el('div', 'kdt-bar ph-table-bar', o.title ? '<span class="ph-table-title">' + esc(o.title) + '</span>' : '');
      append(bar, o.toolbar); wrap.appendChild(bar);
    }
    var scroll = el('div', 'kdt-scroll'); wrap.appendChild(scroll); ui.move(t, scroll);
    return wrap;
  };

  ui.tabs = function (items) {
    var strip = el('div', 'ktabs ph-tabs'); strip.setAttribute('role', 'tablist');
    items.forEach(function (it) {
      var t = el(it.href ? 'a' : 'button', 'ktab', esc(it.label) + (it.count != null ? '<span class="kcount">' + esc(it.count) + '</span>' : ''));
      t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', it.selected ? 'true' : 'false');
      if (it.href) t.href = it.href; else t.type = 'button';
      if (it.onClick) t.addEventListener('click', it.onClick);
      strip.appendChild(t);
    });
    return strip;
  };

  function menuEl(items) {
    var m = el('div', 'kmenu ph-menu'); m.setAttribute('role', 'menu'); m.hidden = true;
    items.forEach(function (it) {
      if (it.separator) { m.appendChild(el('div', 'kmsep')); return; }
      if (it.header) { m.appendChild(el('div', 'kmh ph-menu-h', esc(it.header))); return; }
      var a = el(it.href ? 'a' : 'button', 'ph-mi' + (it.indent ? ' ph-mi-in' : ''), esc(it.label));
      a.setAttribute('role', 'menuitem');
      if (it.href) a.href = it.href; else a.type = 'button';
      if (it.target) a.target = it.target;
      if (it.onclick) a.setAttribute('onclick', it.onclick);
      if (it.onClick) a.addEventListener('click', it.onClick);
      if (it.current) a.setAttribute('aria-current', 'page');
      m.appendChild(a);
    });
    m.addEventListener('keydown', function (e) {
      var list = [].slice.call(m.querySelectorAll('.ph-mi')); var i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { (list[i + 1] || list[0]).focus(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { (list[i - 1] || list[list.length - 1]).focus(); e.preventDefault(); }
      else if (e.key === 'Escape') { closeMenus(); }
    });
    return m;
  }
  function closeMenus() {
    document.querySelectorAll('.ph-menu').forEach(function (m) { m.hidden = true; });
    document.querySelectorAll('[aria-haspopup="menu"][aria-expanded="true"]').forEach(function (b) { if (!b.closest('#ph-topbar')) b.setAttribute('aria-expanded', 'false'); });
  }
  document.addEventListener('click', function (e) { if (!e.target.closest('.ph-menu, .ph-menu-anchor')) closeMenus(); });
  ui.menu = function (anchor, items) {
    var wrap = el('div', 'ph-menu-anchor'); anchor.parentNode.insertBefore(wrap, anchor); ui.move(anchor, wrap);
    var m = menuEl(items); wrap.appendChild(m);
    anchor.setAttribute('aria-haspopup', 'menu'); anchor.setAttribute('aria-expanded', 'false');
    anchor.addEventListener('click', function (e) {
      e.preventDefault(); var open = m.hidden; closeMenus();
      if (open) { m.hidden = false; anchor.setAttribute('aria-expanded', 'true'); var f = m.querySelector('.ph-mi'); if (f) f.focus(); }
    });
    return m;
  };
  ui.tabMenu = function (label, items, o) {
    var t = el('button', 'ktab', esc(label) + '<span class="ph-chev">' + icon('chev', 14) + '</span>');
    t.type = 'button'; t.setAttribute('aria-selected', o && o.selected ? 'true' : 'false');
    var frag = el('div', 'ph-tabmenu'); frag.appendChild(t);
    ui.menu(t, items);
    return frag;
  };

  ui.drawer = function (o) {
    var host = document.querySelector('.ph-drawer-layer') || document.body.appendChild(el('div', 'ph-drawer-layer'));
    var scrim = el('div', 'ph-scrim'); scrim.hidden = true;
    var d = el('aside', 'kdrw overlay ph-drawer'); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.hidden = true;
    if (o.width) d.style.setProperty('--kdrw-w', o.width + 'px');
    d.innerHTML = '<header><h3>' + esc(o.title) + (o.subtitle ? '<span class="ksub">' + esc(o.subtitle) + '</span>' : '') + '</h3>' +
      '<div class="x2b"><button type="button" class="ph-drawer-x" aria-label="Close">' + icon('close', 16) + '</button></div></header>' +
      '<div class="pbody"></div><div class="pfoot"></div>';
    append(d.querySelector('.pbody'), o.body); append(d.querySelector('.pfoot'), o.actions);
    if (!o.actions || !o.actions.length) d.querySelector('.pfoot').remove();
    host.appendChild(scrim); host.appendChild(d);
    function close() { d.hidden = true; scrim.hidden = true; d.classList.remove('on'); }
    function open() { scrim.hidden = false; d.hidden = false; d.classList.add('on'); var f = d.querySelector('input, select, textarea, button'); if (f) f.focus(); }
    d.querySelector('.ph-drawer-x').addEventListener('click', close); scrim.addEventListener('click', close);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    return { el: d, open: open, close: close };
  };

  ui.emptyState = function (o) {
    return el('div', 'kstate center ph-empty',
      '<span class="ph-empty-i">' + icon(o.icon || 'search', 26) + '</span><p class="kst-t">' + esc(o.title || 'Nothing to show') + '</p>' + (o.text ? '<p class="kst-w">' + esc(o.text) + '</p>' : ''));
  };

  ui.pill = function (text, tone) {
    return el('span', 'kpill ' + (tone || 'mute'), icon(tone === 'ok' ? 'ok' : tone === 'warn' ? 'warn' : tone === 'bad' ? 'bad' : 'info', 12).replace('<svg', '<svg class="kpg"') + esc(text));
  };
  // a status word -> pill tone (ATA StatusPill mapping)
  ui.toneFor = function (word) {
    var w = String(word || '').toLowerCase();
    if (/fail|error|reject|expired|cancel|abnormal|critical/.test(w)) return 'bad';
    if (/warn|held|pending|waiting|awaiting|due|backlog|urgent|stat/.test(w)) return 'warn';
    if (/success|complete|done|validated|accepted|released|paid|normal|collected/.test(w)) return 'ok';
    if (/progress|running|queued|scheduled|to collect|new/.test(w)) return 'info';
    return 'mute';
  };

  ui.stat = function (value, label) {
    var s = el('div', 'ph-stat', '<span class="ph-stat-v">' + esc(value) + '</span><span class="ph-stat-k">' + esc(label) + '</span>');
    s.set = function (v) { s.querySelector('.ph-stat-v').textContent = v; };
    return s;
  };

  ui.alert = function (text, tone) {
    return el('div', 'ph-alert ' + (tone || 'info'), '<span class="ph-alert-i">' + icon(tone === 'bad' ? 'bad' : tone === 'ok' ? 'ok' : tone === 'warn' ? 'warn' : 'info', 18) + '</span><span>' + esc(text) + '</span>');
  };

  // The Pioneer Healthcare loader (ATA healthcare PcpLoader): the mark breathing inside a ring
  // whose arc sweeps round from brand blue to green.
  var lid = 0;
  ui.loader = function (size) {
    var id = 'ph-uil-' + (++lid); size = size || 48;
    return '<svg class="ph-loader" viewBox="0 0 48 48" width="' + size + '" height="' + size + '" role="img" aria-label="Loading">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E5BD8"/><stop offset="100%" stop-color="#3E9C85"/></linearGradient></defs>' +
      '<circle cx="24" cy="24" r="22.5" fill="none" stroke="#1E5BD8" stroke-opacity="0.12" stroke-width="2"/>' +
      '<circle class="ph-loader-arc" cx="24" cy="24" r="22.5" fill="none" stroke="url(#' + id + ')" stroke-width="2" stroke-linecap="round" stroke-dasharray="42 100"/>' +
      '<image class="ph-loader-mark" href="/pioneer-brand/mark.png" x="6" y="6" width="36" height="36"/></svg>';
  };

  ui.toast = function (text, tone) {
    var host = document.querySelector('.ph-toasts') || document.body.appendChild(el('div', 'ph-toasts'));
    var t = el('div', 'ph-toast ' + (tone || 'info'), '<span class="ph-toast-i">' + icon(tone === 'bad' ? 'bad' : tone === 'ok' ? 'ok' : tone === 'warn' ? 'warn' : 'info', 16) + '</span><span>' + esc(text) + '</span>');
    t.setAttribute('role', 'status'); host.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 300); }, 5000);
  };

  ui.actionBar = function (node) {
    if (!node || node.classList.contains('ph-actionbar')) return node;
    node.classList.add('ph-actionbar'); document.documentElement.classList.add('ph-has-actionbar');
    node.querySelectorAll('input[type=button], input[type=submit], button').forEach(function (b) {
      var v = (b.value || b.textContent || '').trim();
      ui.button(b, /^(save|submit|accept|ok|done)$/i.test(v) ? 'primary' : 'quiet');
    });
    return node;
  };

  ui.tiles = function (items) {
    var g = el('div', 'ph-tiles');
    items.forEach(function (it) {
      var a = el('a', 'ph-tile', '<span class="ph-tile-t">' + esc(it.label) + '</span><span class="ph-tile-go">' + icon('right', 16) + '</span>');
      a.href = it.href || '#'; if (it.onclick) a.setAttribute('onclick', it.onclick);
      g.appendChild(a);
    });
    return g;
  };
})();
