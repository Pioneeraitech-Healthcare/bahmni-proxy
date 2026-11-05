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
    [/\bOdoo\b/g, 'Pioneer Healthcare ERP'],
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
        return /Bahmni|BAHMNI|ELIS|Odoo/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
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
