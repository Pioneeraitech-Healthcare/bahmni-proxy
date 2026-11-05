/*
 * Laboratory adapter: maps the old laboratory screens onto the Pioneer Healthcare components (PH.ui,
 * ph-ui.js). It only decides WHICH component an old element is - it never styles anything; the
 * components carry the ATA healthcare look. Elements get component classes or move inside their own
 * parent, so the lab's forms, ids and scripts keep working. Every step is guarded.
 */
(function () {
  if (window.top !== window.self || !window.PH || !PH.ui) return;
  var ui = PH.ui, html = document.documentElement;
  ui.scope(html);
  html.classList.add('ph-lab');

  // One line under each page title (the page header's purpose line).
  var PAGES = [
    [/LabDashboard/i, 'lab', 'Lab dashboard', 'Samples to collect and samples collected, today and from earlier days.'],
    [/SamplePatientEntry/i, 'sample', '', 'Find the patient, add the sample and register the order.'],
    [/SampleEdit/i, 'sample', '', 'Find a sample by its lab number and change it.'],
    [/PatientManagement/i, 'patient', '', 'Find a patient or add a new one.'],
    [/NonConformity/i, 'alert', '', 'Record a problem with a sample or an order.'],
    [/ResultValidation|Validation/i, 'results', 'Result validation', 'Check the results, then accept them to send them to the doctor.'],
    [/Results|Logbook|Referral/i, 'results', '', 'Enter test results. Normal ranges are shown next to each value.'],
    [/AuditTrail/i, 'report', '', 'Every change made to a sample, with who made it and when.'],
    [/Report/i, 'report', '', 'Choose the values, then print the report.'],
    [/MasterList|Administration/i, 'settings', 'Laboratory settings', 'Lists and settings used across the laboratory.'],
    [/Upload/i, 'upload', '', 'Upload result or reference files.'],
  ];
  var PRIMARY = /^(save|submit|accept|run search|search|generate|print new window|print|add sample|add|next|retrieve tests?|ok|view|upload)$/i;
  var QUIET = /^(cancel|close|back|previous|reset|clear)$/i;
  var EMPTY = /no appropriate tests|no results|not found|no records|nothing/i;

  function guard(name, fn) { try { fn(); } catch (e) { if (window.console) console.warn('[pioneer lab] ' + name, e); } }
  function txt(e) { return (e && (e.textContent || '')).replace(/\s+/g, ' ').replace(/[»*]/g, '').trim(); }
  function isHere(href) { try { var u = new URL(href, location.href); return u.pathname === location.pathname && (!u.search || u.search === location.search); } catch (e) { return false; } }
  var LOGIN = !!document.querySelector('input[name=loginName]');
  var SKIP = '#ph-topbar, #ph-labnav, .ph-auth, .ph-menu, .slick-headerrow, .kpgr';

  /* Navigation: the old menu -> PH.ui.tabs + PH.ui.tabMenu */
  function nav() {
    var old = document.getElementById('main-nav');
    if (!old || document.getElementById('ph-labnav')) return;
    var bar = document.createElement('nav'); bar.id = 'ph-labnav'; bar.className = 'ph-modnav'; bar.setAttribute('aria-label', 'Laboratory');
    var strip = ui.tabs([]); bar.appendChild(strip);
    [].forEach.call(old.children, function (li) {
      if (li.id === 'nav-first') return; // the old home icon; the logo goes home
      var a = li.querySelector(':scope > a'); if (!a) return;
      var label = txt(a); if (!label) return;
      var sub = li.querySelector(':scope > ul');
      if (!sub) { strip.appendChild(ui.tabs([{ label: label, href: a.getAttribute('href') || '#', selected: isHere(a.href) }]).firstChild); return; }
      var items = [], active = false;
      (function walk(ul) {
        [].forEach.call(ul.children, function (sli) {
          var sa = sli.querySelector(':scope > a'); if (!sa) return;
          var ssub = sli.querySelector(':scope > ul');
          if (ssub) { if (items.length) items.push({ separator: true }); items.push({ header: txt(sa) }); walk(ssub); return; }
          var cur = isHere(sa.href); if (cur) active = true;
          items.push({ label: txt(sa), href: sa.getAttribute('href') || '#', target: sa.target, onclick: sa.getAttribute('onclick'), current: cur });
        });
      })(sub);
      var links = items.filter(function (x) { return x.href; });
      if (links.length === 1) { strip.appendChild(ui.tabs([{ label: label, href: links[0].href, selected: active }]).firstChild); return; }
      strip.appendChild(ui.tabMenu(label, items, { selected: active }));
    });
    var top = document.getElementById('ph-topbar');
    document.body.insertBefore(bar, top ? top.nextSibling : document.body.firstChild);
    html.classList.add('ph-has-modnav');
  }

  /* Page header -> PH.ui.pageHeader (also on screens without a title) */
  function pageHeader() {
    if (document.querySelector('.ph-page-header')) return;
    var key = document.getElementById('todayStat') ? 'LabDashboard' : location.pathname;
    var p = PAGES.filter(function (x) { return x[0].test(key); })[0] || [null, 'lab', '', ''];
    var h1 = document.querySelector('body h1:not(.kph-t)');
    if (h1 && h1.closest(SKIP)) h1 = null;
    var title = p[2] || (h1 && txt(h1)) || 'Laboratory';
    if (/^Laboratory Information System$/i.test(title)) title = 'Laboratory';
    var anchor = h1;
    if (!anchor) ['.ph-stats', '.ph-tiles', '#todayStat', '#tabs', 'body > table td > *', 'form > *'].some(function (s) { anchor = document.querySelector(s); return !!anchor; });
    if (!anchor || !anchor.parentNode) return;
    var head = ui.pageHeader({ icon: p[1], title: title, purpose: p[3] });
    anchor.parentNode.insertBefore(head, anchor);
    if (h1) h1.style.display = 'none';
    var row = head.closest('tr'); if (row) row.classList.add('ph-headrow');
  }

  /* Grey section bars -> PH.ui.card; "nothing found" bars -> PH.ui.emptyState */
  function sections() {
    document.querySelectorAll('h2:not(.ph-card-h)').forEach(function (h2) {
      if (h2.closest(SKIP + ', .ph-card') || h2.getAttribute('data-ph')) return;
      h2.setAttribute('data-ph', '1');
      var t = txt(h2);
      if (EMPTY.test(t)) { emptyFor(h2, t); return; }
      var card = ui.card({ title: ' ' });
      card.querySelector('.ph-card-h').innerHTML = h2.innerHTML; // keeps the required marker
      h2.parentNode.insertBefore(card, h2);
      h2.style.display = 'none'; ui.move(h2, card, card.firstChild);
      var body = card.querySelector('.ph-card-b'), n = card.nextSibling;
      while (n && !(n.nodeType === 1 && (n.tagName === 'H2' || (n.querySelector && n.querySelector(':scope > h2'))))) {
        var next = n.nextSibling;
        if (n.nodeType === 1 && n.tagName === 'BR') n.remove(); else ui.move(n, body);
        n = next;
      }
      if (!body.textContent.trim() && !body.querySelector('input, select, table, img')) body.remove();
    });
  }
  function emptyFor(node, text) {
    var box = ui.emptyState({ title: 'Nothing to show', text: /no appropriate tests/i.test(text) ? 'There are no tests waiting here right now. New ones appear as soon as the doctor orders them and the sample is collected.' : text });
    node.parentNode.insertBefore(box, node); node.style.display = 'none';
  }

  /* Fields left loose after the page header -> one PH.ui.card */
  function looseCard() {
    var head = document.querySelector('.ph-page-header'); if (!head || head.getAttribute('data-loose')) return;
    head.setAttribute('data-loose', '1');
    var keep = /(^|\s)(ph-card|ph-table-card|kstate|ph-stats|ph-tiles|ph-empty|ui-tabs|ph-actionbar|ph-support)(\s|$)/;
    var group = [];
    function flush() {
      var real = group.filter(function (x) { return x.nodeType === 1 ? x.tagName !== 'BR' && x.tagName !== 'H1' && x.tagName !== 'SCRIPT' && (x.offsetParent !== null || x.querySelector('input, select, textarea')) : x.nodeType === 3 && x.nodeValue.trim(); });
      if (real.length && real.some(function (x) { return x.nodeType === 3 || x.querySelector('input:not([type=hidden]), select, textarea, a, table') || /\S/.test(x.textContent); })) {
        var card = ui.card({ plain: true }); var body = card.querySelector('.ph-card-b');
        group[0].parentNode.insertBefore(card, group[0]); group.forEach(function (x) { ui.move(x, body); });
      }
      group = [];
    }
    function walk(n) {
      while (n) {
        var next = n.nextSibling;
        if (n.nodeType === 1 && (keep.test(n.className || '') || n.id === 'tabs' || (n.querySelector && n.querySelector('.ph-card, .ph-table-card, .ui-tabs, .ph-tiles, .ph-stats')))) flush();
        else if (!(n.nodeType === 1 && n.tagName === 'H1')) group.push(n);
        n = next;
      }
      flush();
    }
    walk(head.nextSibling);
    var row = head.closest('tr');
    if (row && row.classList.contains('ph-headrow')) {
      for (var r = row.nextElementSibling; r; r = r.nextElementSibling) {
        if (r.tagName !== 'TR' || r.querySelector('table.block-bottom')) continue;
        [].forEach.call(r.cells, function (td) { if (td.firstChild && !td.querySelector(':scope > .ph-card, :scope > .ph-table-card')) walk(td.firstChild); });
      }
    }
  }

  /* List tables -> PH.ui.table */
  function tables() {
    document.querySelectorAll('table').forEach(function (t) {
      if (t.closest(SKIP + ', .kdt-wrap, .ph-page-header, .slick-viewport')) return;
      var first = t.rows && t.rows[0];
      var isList = t.classList.contains('results-table') || (first && first.querySelectorAll(':scope > th').length >= 2);
      if (!isList) return;
      ui.table(t);
      t.querySelectorAll('tr').forEach(function (tr) { if (tr.querySelector(':scope > th')) tr.classList.add('ph-thr'); });
    });
  }

  /* Inputs and buttons -> PH.ui.field / PH.ui.button */
  function controls() {
    document.querySelectorAll('input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset]):not([type=image]), select, textarea').forEach(function (i) { if (!i.closest(SKIP)) ui.field(i); });
    document.querySelectorAll('select').forEach(function (s) { if (!s.closest(SKIP) && s.offsetParent !== null) ui.dropdown(s); });
    document.querySelectorAll('input[type=button], input[type=submit], input[type=reset], button').forEach(function (b) {
      if (b.closest(SKIP + ', .ph-actionbar')) return;
      var label = (b.value || b.textContent || '').trim();
      ui.button(b, PRIMARY.test(label) ? 'primary' : QUIET.test(label) ? 'quiet' : 'secondary');
    });
    // one primary per screen: when a Save exists, other primaries step down
    var saves = [].filter.call(document.querySelectorAll('.ph-btn.pri'), function (b) { return /^(save|submit|accept)$/i.test((b.value || b.textContent || '').trim()); });
    if (saves.length) document.querySelectorAll('.ph-btn.pri').forEach(function (b) { if (saves.indexOf(b) < 0 && !/^generate$/i.test((b.value || '').trim()) && !b.closest('.ph-actionbar')) b.classList.remove('pri'); });
  }

  /* Settings link list -> PH.ui.tiles */
  function adminTiles() {
    if (!/MasterList/i.test(location.pathname) || document.querySelector('.ph-tiles')) return;
    var links = [].filter.call(document.querySelectorAll('table a'), function (a) { return !a.closest(SKIP); });
    if (links.length < 5) return;
    var table = links[0].closest('table');
    var tiles = ui.tiles(links.map(function (a) { return { label: txt(a), href: a.getAttribute('href') || '#', onclick: a.getAttribute('onclick') }; }));
    table.parentNode.insertBefore(tiles, table); table.style.display = 'none';
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), tn, hide = [];
    while ((tn = w.nextNode())) if (/Build number|Database version/i.test(tn.nodeValue)) hide.push(tn);
    hide.forEach(function (t) { var sp = document.createElement('span'); sp.className = 'ph-support'; t.parentNode.insertBefore(sp, t); sp.appendChild(t); });
  }

  /* Dashboard: status counters -> PH.ui.stat; tab names in plain words */
  function dashboard() {
    var stat = document.getElementById('todayStat');
    if (!stat) return;
    if (!document.querySelector('.ph-stats')) {
      var row = document.createElement('div'); row.className = 'ph-stats';
      stat.querySelectorAll('td').forEach(function (td) {
        var val = td.querySelector('span[id]'), lab = td.querySelector('span:not([id])');
        if (!val || !lab) return;
        var s = ui.stat(txt(val) || '0', txt(lab).replace(/:$/, '').trim()); row.appendChild(s);
        new MutationObserver(function () { s.set(txt(val) || '0'); }).observe(val, { childList: true, subtree: true, characterData: true });
      });
      if (row.children.length) { stat.parentNode.insertBefore(row, stat); stat.classList.add('ph-hide'); }
      var refresh = stat.querySelector('input[type=button], button'); if (refresh) refresh.classList.add('ph-refresh');
    }
    var names = { todaySamplesToCollectListContainerId: 'To collect · Today', backlogSamplesToCollectListContainerId: 'To collect · Earlier days', todaySamplesCollectedListContainerId: 'Collected · Today', backlogSamplesCollectedListContainerId: 'Collected · Earlier days' };
    Object.keys(names).forEach(function (id) { var a = document.getElementById(id); if (a && a.textContent !== names[id]) a.textContent = names[id]; });
  }
  function moveRefresh() {
    var r = document.querySelector('.ph-refresh'), acts = document.querySelector('.ph-page-header .kph-a');
    if (r && acts && r.parentNode !== acts) { ui.move(r, acts); r.classList.remove('pri'); }
  }
  /*
   * Dashboard lists -> PH.ui tables. The page writes its four lists into an inline script
   * (JSON.parse('...')); the old grid only draws what fits in its small window, so the tables are
   * built from that data and the lab's own link builder (generateAllLinksForOrder), so every row
   * and every action is the lab's real one.
   */
  function pageList(name) {
    var re = new RegExp('var\\s+' + name + "\\s*=\\s*JSON\\.parse\\(('(?:[^'\\\\]|\\\\.)*')\\)");
    for (var i = 0; i < document.scripts.length; i++) {
      var m = re.exec(document.scripts[i].textContent || '');
      if (m) { try { return JSON.parse(Function('return ' + m[1])()); } catch (e) { return null; } }
    }
    return null;
  }
  function personCell(o) {
    var name = [o.firstName, o.middleName, o.lastName].filter(Boolean).join(' ');
    return '<div class="ph-who"><span class="ph-who-n">' + ui.esc(name) + '</span><span class="ph-who-s">' + ui.esc(o.stNumber || '') + '</span></div>';
  }
  function actionsFor(o, collected) {
    var box = document.createElement('div'); box.className = 'ph-row-acts';
    var tmp = document.createElement('div');
    try { tmp.innerHTML = window.generateAllLinksForOrder ? window.generateAllLinksForOrder(o, collected) : ''; } catch (e) { tmp.innerHTML = ''; }
    var a = function (sel) { var x = tmp.querySelector(sel); return x && x.getAttribute('href'); };
    if (!collected) {
      var href = a('a[href*="SamplePatientEntry"]') || a('a[href]');
      if (href) box.appendChild(ui.linkButton('Collect sample', href, 'primary'));
      return box;
    }
    var r = a('a#result'), v = a('a#validate'), pr = tmp.querySelector('a#print');
    if (r && +o.pendingTestCount > 0) box.appendChild(ui.linkButton('Enter results', r, 'primary'));
    else if (r) box.appendChild(ui.linkButton('Results', r, 'secondary'));
    if (v && +o.pendingValidationCount > 0) box.appendChild(ui.linkButton('Validate', v, +o.pendingTestCount > 0 ? 'secondary' : 'primary'));
    if (pr) box.appendChild(ui.linkButton('Report', pr.getAttribute('href'), 'quiet', '_blank'));
    return box;
  }
  function statusFor(o) {
    if (o.isCompleted === true || o.isCompleted === 'true' || (+o.pendingTestCount === 0 && +o.pendingValidationCount === 0 && +o.totalTestCount > 0)) return ui.pill('Completed', 'ok');
    if (+o.pendingValidationCount > 0 && +o.pendingTestCount === 0) return ui.pill(o.pendingValidationCount + ' to validate', 'info');
    if (+o.pendingTestCount > 0) return ui.pill(o.pendingTestCount + ' of ' + o.totalTestCount + ' to enter', 'warn');
    return ui.pill('In progress', 'info');
  }
  var LISTS = [
    ['todaySamplesToCollectListContainer', 'todaySampleNotCollectedList', false],
    ['backlogSamplesToCollectListContainer', 'backlogSampleNotCollectedList', false],
    ['todaySamplesCollectedListContainer', 'todayOrderList', true],
    ['backlogSamplesCollectedListContainer', 'backlogOrderList', true],
  ];
  function dashboardTables() {
    if (!document.getElementById('todayStat')) return;
    LISTS.forEach(function (L) {
      var panel = document.getElementById(L[0]); if (!panel || panel.querySelector('.ph-dash-list')) return;
      var data = pageList(L[1]); if (!data) return;
      var collected = L[2];
      var holder = document.createElement('div'); holder.className = 'ph-dash-list';
      panel.insertBefore(holder, panel.firstChild);
      panel.classList.add('ph-has-list');
      var tabA = document.getElementById(L[0] + 'Id');
      if (tabA && !tabA.querySelector('.kcount')) tabA.insertAdjacentHTML('beforeend', ' <span class="kcount">' + data.length + '</span>');
      if (!data.length) {
        holder.appendChild(ui.emptyState(collected
          ? { icon: 'sample', title: 'No samples collected yet', text: 'Collected samples show here with their results and validation.' }
          : { icon: 'sample', title: 'No samples to collect', text: 'Lab orders from doctors appear here by themselves. To register a sample without an order, add it here.', actions: [ui.linkButton('Add sample', '/openelis/SamplePatientEntry.do', 'primary')] }));
        return;
      }
      var t = document.createElement('table');
      t.innerHTML = '<thead><tr>' + (collected ? '<th>Lab number</th>' : '') + '<th>Patient</th><th>Sample</th><th>Departments</th><th>Priority</th>' + (collected ? '<th>Status</th>' : '<th>Tests</th>') + '<th class="ph-th-acts"></th></tr></thead><tbody></tbody>';
      var tb = t.querySelector('tbody');
      data.forEach(function (o) {
        var tr = document.createElement('tr');
        tr.setAttribute('data-q', [o.accessionNumber, o.stNumber, o.firstName, o.middleName, o.lastName, o.sampleType, o.sectionNames].join(' ').toLowerCase());
        var pr = String(o.priority || 'Routine');
        tr.innerHTML = (collected ? '<td class="ph-mono">' + ui.esc(o.accessionNumber || '') + '</td>' : '') +
          '<td>' + personCell(o) + '</td><td>' + ui.esc(o.sampleType || '') + '</td>' +
          '<td class="ph-wrap">' + ui.esc(String(o.sectionNames || '').split(',').map(function (x) { return x.replace(/ Department$/, '').trim(); }).filter(Boolean).join(', ')) + '</td>' +
          '<td></td><td></td><td class="ph-td-acts"></td>';
        var cells = tr.children, off = collected ? 1 : 0;
        cells[3 + off].appendChild(ui.pill(pr, /stat|urgent|high/i.test(pr) ? 'bad' : 'mute'));
        if (collected) cells[4 + off].appendChild(statusFor(o)); else cells[4 + off].textContent = (o.totalTestCount || o.testCount || '') + '';
        cells[5 + off].appendChild(actionsFor(o, collected));
        tb.appendChild(tr);
      });
      var search = document.createElement('input'); search.type = 'search'; search.placeholder = 'Search patient, ID or lab number'; search.className = 'ph-table-search';
      ui.field(search);
      var none = document.createElement('div'); none.className = 'ph-nohit'; none.hidden = true; none.textContent = 'No samples match your search.';
      search.addEventListener('input', function () {
        var q = search.value.trim().toLowerCase(), shown = 0;
        [].forEach.call(tb.rows, function (r) { var on = !q || r.getAttribute('data-q').indexOf(q) >= 0; r.style.display = on ? '' : 'none'; if (on) shown++; });
        none.hidden = shown > 0;
      });
      holder.appendChild(t);
      var card = ui.table(t, { toolbar: [search] });
      card.appendChild(none);
    });
  }

  /* Grids with no rows -> PH.ui.emptyState inside the tab panel */
  function gridEmpty() {
    document.querySelectorAll('.ui-tabs-panel').forEach(function (panel) {
      if (panel.classList.contains('ph-has-list')) return;
      var vp = panel.querySelector('.slick-viewport'); if (!vp) return;
      var rows = vp.querySelectorAll('.slick-row').length, box = panel.querySelector(':scope > .ph-empty');
      if (!rows && !box) panel.appendChild(ui.emptyState({ title: 'No samples here', text: 'Samples appear here as soon as a doctor orders a lab test.' }));
      else if (rows && box) box.remove();
    });
  }
  /* Save / Cancel row -> PH.ui.actionBar */
  function actionBar() { var bb = document.querySelector('table.block-bottom'); if (bb) ui.actionBar(bb); }
  /* Old loading overlay -> the Pioneer Healthcare loader */
  function loader() { var lb = document.getElementById('lightbox'); if (lb && !lb.querySelector('.ph-loader')) lb.insertAdjacentHTML('beforeend', ui.loader(56)); }

  function run() {
    guard('loader', loader);
    if (LOGIN) return;
    guard('nav', nav);
    guard('dashboard', dashboard);
    guard('dashboard-tables', dashboardTables);
    guard('admin', adminTiles);
    guard('header', pageHeader);
    guard('refresh', moveRefresh);
    guard('sections', sections);
    guard('loose', looseCard);
    guard('tables', tables);
    guard('actionbar', actionBar);
    guard('controls', controls);
    guard('grids', gridEmpty);
    html.classList.add('ph-lab-ready');
  }
  var q = null;
  function later() { if (q) return; q = setTimeout(function () { q = null; if (LOGIN) return; guard('sections', sections); guard('tables', tables); guard('controls', controls); guard('grids', gridEmpty); guard('dashboard', dashboard); }, 250); }
  function start() { run(); new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
