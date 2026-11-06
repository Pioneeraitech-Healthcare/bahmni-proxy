/*
 * Clinical Service adapter: maps the clinical apps (registration, consultations, appointments,
 * documents, reports, theatre, ...) onto the Pioneer Healthcare components (PH.ui). It decides
 * which component an old element is; the components carry the ATA healthcare look. The apps are
 * Angular single-page apps, so every step is idempotent and re-runs when a screen changes.
 */
(function () {
  if (window.top !== window.self && !/[?&]ph-embed=1/.test(location.search)) return;
  if (/^erp-/.test(location.hostname) || !window.PH || !PH.ui) return;
  if (!/^\/(care|appointments|ipd|bahmni)\b/.test(location.pathname)) return;
  var ui = PH.ui, html = document.documentElement;
  ui.scope(html);
  html.classList.add('ph-clin');
  var EMBED = /[?&]ph-embed=1/.test(location.search);
  // embedded (in a drawer): no top bar here, but the same theme and components
  if (EMBED) html.classList.add('ph-embed', 'ph-has-bar');

  function guard(n, f) { try { f(); } catch (e) { if (window.console) console.warn('[pioneer clinical] ' + n, e); } }
  function route() { return location.pathname + location.hash; }

  /* Page header per app (PH.ui.pageHeader), kept in a stable slot under the app's toolbar. */
  var HEADS = [
    [/\/home\/.*#\/dashboard/, 'patient', 'Clinical Service', 'Choose what you want to do. Everything for patient care is here.'],
    [/\/registration\/.*#\/search/, 'patient', 'Patients', 'Find a patient by ID, name or phone, or register a new one.', 'register'],
    [/\/registration\/.*#\/patient\/new/, 'patient', 'Register a patient', 'Fill in the details. Fields marked * are required.'],
    [/\/registration\/.*#\/patient\/[0-9a-f-]{36}\/visit/, 'patient', 'Visit details', 'Record vitals and visit information.'],
    [/\/registration\/.*#\/patient\/[0-9a-f-]{36}/, 'patient', 'Patient details', 'Check or update the patient, then start a visit.'],
    [/\/clinical\/.*#\/programs/, 'patient', 'Programs', 'Patients enrolled in care programs.'],
    [/\/clinical\/.*#\/default\/patient\/search/, 'patient', 'Consultations', 'Patients with an open visit. Open a patient to consult.'],
    [/\/document-upload\/.*RADIOLOGY/, 'upload', 'Radiology upload', 'Attach X-ray and other images to a patient.'],
    [/\/document-upload\//, 'report', 'Patient documents', 'Upload and view scanned documents for a patient.'],
    [/\/bedmanagement\//, 'settings', 'Bed management', 'Wards, beds and admitted patients.'],
    [/\/admin\//, 'settings', 'Administration', 'Import and export data, order sets, beds and the audit log.'],
    [/\/reports\//, 'report', 'Reports', 'Pick a date range and format, then run a report.'],
    [/\/ot\//, 'settings', 'Operation theatre', 'Surgical queues and theatre scheduling.'],
    [/\/orders\//, 'report', 'Orders', 'Orders waiting to be fulfilled.'],
    [/^\/appointments/, 'report', 'Appointments', 'Book, find and manage appointments.'],
  ];
  function header() {
    var r = route();
    var slot = document.getElementById('ph-clin-head');
    var onPatient = /#\/default\/patient\/[0-9a-f-]{36}|#\/patient\/[0-9a-f-]{36}\/dashboard|\/dashboard\/(?!reports)/.test(r) && !/home\/.*#\/dashboard/.test(r);
    var h = onPatient ? null : HEADS.filter(function (x) { return x[0].test(r); })[0];
    if (!h || EMBED) { if (slot) slot.remove(); return; }
    var key = h[2];
    var vbar = [].filter.call(document.querySelectorAll('.reg-header-wrapper, .opd-header-wrapper, .header-wrapper'), function (b) { return b.offsetHeight > 0; }).pop();
    if (slot && slot.getAttribute('data-k') === key) {
      // the app's toolbar can appear after the header: keep the header right under it
      if (vbar && slot.previousElementSibling !== vbar) vbar.parentNode.insertBefore(slot, vbar.nextSibling);
      clearBar(slot, vbar);
      return;
    }
    if (slot) slot.remove();
    var actions = [];
    if (h[4] === 'register') actions.push(ui.newButton('Register patient', 'primary', function () { openRegister(); }));
    slot = document.createElement('div'); slot.id = 'ph-clin-head'; slot.setAttribute('data-k', key);
    slot.appendChild(ui.pageHeader({ icon: h[1], title: h[2], purpose: h[3], actions: actions }));
    var bar = [].filter.call(document.querySelectorAll('.reg-header-wrapper, .opd-header-wrapper, .header-wrapper'), function (b) { return b.offsetHeight > 0; }).pop();
    var host = bar && bar.parentNode ? bar.parentNode : document.body;
    if (bar) host.insertBefore(slot, bar.nextSibling); else { var top = document.getElementById('ph-topbar'); document.body.insertBefore(slot, top ? top.nextSibling : document.body.firstChild); }
    clearBar(slot, bar);
  }
  // the apps pin their toolbar to the top; the header starts below it
  function clearBar(slot, bar) {
    var pinned = bar && /fixed|sticky/.test(getComputedStyle(bar).position);
    slot.style.marginTop = pinned ? bar.offsetHeight + 'px' : '';
  }

  /* The app toolbar: no second home or user button (the top bar has both); links become tabs. */
  function toolbar() {
    document.querySelectorAll('.reg-header-wrapper, .opd-header-wrapper, .header-wrapper').forEach(function (bar) {
      bar.classList.add('ph-apptoolbar');
      bar.querySelectorAll('a.back-btn').forEach(function (a) { if (a.querySelector('.fa-home') || /home\/index\.html#?\/?dashboard|\/home\/?$/.test(a.getAttribute('href') || '')) a.classList.add('ph-dup'); });
      bar.querySelectorAll('button.btn-user-info').forEach(function (b) { b.classList.add('ph-dup'); });
      bar.querySelectorAll('ul.top-nav > li > a, header nav a, header > ul > li > a').forEach(function (a) { if (!a.classList.contains('back-btn')) a.classList.add('ph-apptab'); });
      // "Create New" in registration opens the drawer
      bar.querySelectorAll('a').forEach(function (a) {
        if (/^\s*\+?\s*Create\s*New\s*$/i.test(a.textContent) && !a.getAttribute('data-ph-reg')) {
          a.setAttribute('data-ph-reg', '1');
          a.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); openRegister(); }, true);
        }
      });
    });
  }

  /* Clinical home: grouped ATA cards with a line each, instead of the icon grid. */
  var APPS = {
    'bahmni.registration': ['Patient care', 'patient', 'Registration', 'Find or register patients and start visits.'],
    'bahmni.clinical': ['Patient care', 'results', 'Consultations', 'Diagnosis, lab orders and prescriptions for patients with a visit.'],
    'bahmni.appointment.scheduling': ['Patient care', 'report', 'Appointments', 'Book follow-ups and see the day\'s schedule.'],
    'bahmni.programs': ['Patient care', 'patient', 'Programs', 'Enrol patients in care programs and follow them up.'],
    'bahmni.orders': ['Patient care', 'report', 'Orders', 'Orders waiting to be fulfilled.'],
    'bahmni.ipd': ['Wards & theatre', 'settings', 'Bed management', 'Wards, beds and admitted patients.'],
    'bahmni.ot': ['Wards & theatre', 'settings', 'Operation theatre', 'Surgical queues and theatre scheduling.'],
    'bahmni.patient.document.upload': ['Documents', 'report', 'Patient documents', 'Upload and view scanned documents.'],
    'bahmni.radiology.document.upload': ['Documents', 'upload', 'Radiology upload', 'Attach X-ray and other images.'],
    'bahmni.reports': ['Administration', 'report', 'Reports', 'Visit, diagnosis and billing reports for a date range.'],
    'bahmni.admin': ['Administration', 'settings', 'Administration', 'Import and export data, order sets, beds, audit log.'],
  };
  var GROUPS = ['Patient care', 'Wards & theatre', 'Documents', 'Administration'];
  function homeApps() {
    var apps = document.querySelector('.dashboard .apps');
    if (!apps || apps.getAttribute('data-ph')) return;
    var links = [].slice.call(apps.querySelectorAll('a.app, a.button'));
    if (!links.length) return;
    apps.setAttribute('data-ph', '1');
    var wrap = document.createElement('div'); wrap.className = 'ph-home-apps';
    GROUPS.forEach(function (g) {
      var items = links.filter(function (a) { return APPS[a.id] && APPS[a.id][0] === g; }).map(function (a) {
        var m = APPS[a.id];
        return { icon: m[1], label: m[2], text: m[3], href: a.getAttribute('href'), onClick: function (e) { e.preventDefault(); a.click(); } };
      });
      if (!items.length) return;
      var sec = document.createElement('section'); sec.className = 'ph-home-group';
      sec.innerHTML = '<h2 class="ph-home-h">' + ui.esc(g) + '</h2>';
      sec.appendChild(ui.tiles(items));
      wrap.appendChild(sec);
    });
    apps.parentNode.insertBefore(wrap, apps);
    apps.classList.add('ph-hidden');
  }

  /* Fields, dropdowns and buttons -> PH.ui */
  var PRIMARY = /^(save|search|run now|login|sign in|continue|start .*visit|enter visit details|check and save|submit|add|done|ok|print reg\.? card.*)$/i;
  var QUIET = /^(cancel|close|back|reset|clear)$/i;
  var SKIP = '#ph-topbar, .ph-auth, .ph-menu, .ph-dd-menu, .ph-drawer, .ph-page-header';
  function controls() {
    document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=file]), textarea').forEach(function (i) { if (!i.closest(SKIP)) ui.field(i); });
    document.querySelectorAll('select').forEach(function (s) { if (!s.closest(SKIP) && s.offsetParent !== null) { ui.field(s); ui.dropdown(s); } });
    document.querySelectorAll('.bahmni-reports button, .reports button, .patient-search-wrapper button.search, .search-wrapper button, form button[type=submit]').forEach(function (b) {
      if (b.closest(SKIP) || b.closest('.ph-apptoolbar')) return;
      var label = (b.textContent || '').trim();
      ui.button(b, PRIMARY.test(label) ? 'primary' : QUIET.test(label) ? 'quiet' : 'secondary');
    });
  }

  /* Tabs, queue search and patient cards */
  function queues() {
    document.querySelectorAll('.patient-search-wrapper .search-wrapper input, .patient-search-wrapper input[type=text]').forEach(function (i) {
      if (!i.getAttribute('placeholder')) i.setAttribute('placeholder', 'Search by name or ID');
      i.classList.add('ph-search-field');
    });
    document.querySelectorAll('.patient-search-wrapper').forEach(function (w) { w.classList.add('ph-queue'); });
  }

  /* Reports: the list of reports is a table */
  function reports() {
    document.querySelectorAll('.bahmni-reports table, .reports table').forEach(function (t) {
      if (t.closest('.kdt-wrap') || t.getAttribute('data-ph')) return;
      t.setAttribute('data-ph', '1');
      t.querySelectorAll('tr').forEach(function (tr) { if (tr.querySelector(':scope > th')) tr.classList.add('ph-thr'); });
      ui.table(t);
    });
  }

  /* Register a patient in a right-side drawer (the registration screen, embedded) */
  var regDrawer = null;
  function openRegister() {
    if (EMBED) { location.hash = '#/patient/new'; return; }
    if (!regDrawer) {
      var frame = document.createElement('iframe');
      frame.className = 'ph-drawer-frame'; frame.title = 'Register a patient';
      regDrawer = ui.drawer({ title: 'Register a patient', subtitle: 'Fields marked * are required', body: [frame], width: 860 });
      regDrawer.frame = frame;
      regDrawer.el.classList.add('ph-drawer-wide');
    }
    regDrawer.frame.src = '/care/registration/index.html?ph-embed=1#/patient/new';
    regDrawer.open();
  }
  // inside the drawer: when the patient is saved (or a visit started), take the whole page there
  if (EMBED) {
    var start = location.hash;
    window.addEventListener('hashchange', function () {
      if (location.hash !== start && !/#\/patient\/new/.test(location.hash)) {
        try { window.parent.postMessage({ ph: 'nav', href: location.pathname + location.hash }, location.origin); } catch (e) {}
      }
    });
  } else {
    window.addEventListener('message', function (e) {
      if (e.origin !== location.origin || !e.data || e.data.ph !== 'nav') return;
      if (regDrawer) regDrawer.close();
      location.href = e.data.href;
    });
  }

  function run() {
    guard('toolbar', toolbar);
    guard('header', header);
    guard('home', homeApps);
    guard('queues', queues);
    guard('reports', reports);
    guard('controls', controls);
  }
  var q = null;
  function later() { if (q) return; q = setTimeout(function () { q = null; run(); }, 200); }
  function startUp() { run(); new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); window.addEventListener('hashchange', later); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startUp); else startUp();
})();
