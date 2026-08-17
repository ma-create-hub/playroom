/* =========================================================================
   app.js — views, drills, and the practice table.
   ========================================================================= */

var STORE_KEY = 'amj-learn-v1';
var state = {
  view: 'learn',
  lesson: 0,
  showLabels: true,
  drill: 'tiles',
  progress: { lessons: {}, drills: {} }
};

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state.progress)); } catch (e) {}
}
function load() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      var p = JSON.parse(raw);
      state.progress.lessons = p.lessons || {};
      state.progress.drills = p.drills || {};
    }
  } catch (e) {}
}

function $(sel, root) { return (root || document).querySelector(sel); }
function el(tag, cls, html) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}
function tileBtn(id, cls, opts) {
  return '<button class="tile ' + (cls || '') + '" data-tile="' + id + '">' +
    tileSvg(id, opts) + '</button>';
}
function tileStatic(id, cls, opts) {
  return '<span class="tile ' + (cls || '') + '">' + tileSvg(id, opts) + '</span>';
}

/* ============================================================ navigation */

function setView(v) {
  state.view = v;
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.toggle('active', tabs[i].dataset.view === v);
  }
  var views = document.querySelectorAll('.view');
  for (i = 0; i < views.length; i++) {
    views[i].classList.toggle('active', views[i].id === 'view-' + v);
  }
  if (v === 'learn') renderLesson();
  if (v === 'tiles') renderTileBrowser();
  if (v === 'card') renderCard();
  if (v === 'drills') renderDrillPicker();
  if (v === 'table') renderTable();
  if (v === 'glossary') renderGlossary();
  window.scrollTo(0, 0);
}

function updateProgress() {
  var done = 0;
  LESSONS.forEach(function (l) { if (state.progress.lessons[l.id]) done++; });
  $('#progressFill').style.width = (done / LESSONS.length * 100) + '%';
  $('#progressText').textContent = done + ' / ' + LESSONS.length + ' lessons';
}

/* ================================================================ LEARN */

function renderLessonNav() {
  var nav = $('#lessonNav');
  nav.innerHTML = '';
  LESSONS.forEach(function (l, i) {
    var b = el('button', i === state.lesson ? 'active' : '');
    var done = !!state.progress.lessons[l.id];
    b.innerHTML = '<span class="dot' + (done ? ' done' : '') + '">' + (done ? '✓' : '') +
      '</span><span>' + (i + 1) + '. ' + l.title + '</span>';
    b.onclick = function () { state.lesson = i; renderLesson(); };
    nav.appendChild(b);
  });
}

function renderLesson() {
  renderLessonNav();
  var l = LESSONS[state.lesson];
  var body = $('#lessonBody');
  var done = !!state.progress.lessons[l.id];
  body.innerHTML =
    '<h2>' + l.title + '</h2>' +
    '<p class="lesson-meta">Lesson ' + (state.lesson + 1) + ' of ' + LESSONS.length +
    ' · about ' + l.minutes + ' min</p>' +
    l.body +
    '<div class="lesson-foot">' +
    '<button class="btn" id="prevLesson"' + (state.lesson === 0 ? ' disabled' : '') + '>← Previous</button>' +
    '<button class="btn ' + (done ? '' : 'primary') + '" id="doneLesson">' +
    (done ? '✓ Completed — mark unread' : 'Mark complete') + '</button>' +
    '<button class="btn" id="nextLesson"' +
    (state.lesson === LESSONS.length - 1 ? ' disabled' : '') + '>Next →</button>' +
    '</div>';

  /* inline tile strips inside lesson text */
  var strips = body.querySelectorAll('.tile-lesson');
  for (var i = 0; i < strips.length; i++) {
    var ids = strips[i].dataset.tiles.split(',');
    strips[i].innerHTML = ids.map(function (id) {
      return tileStatic(id.trim(), '', { showLabel: false });
    }).join('');
  }

  $('#prevLesson').onclick = function () {
    if (state.lesson > 0) { state.lesson--; renderLesson(); window.scrollTo(0, 0); }
  };
  $('#nextLesson').onclick = function () {
    if (state.lesson < LESSONS.length - 1) { state.lesson++; renderLesson(); window.scrollTo(0, 0); }
  };
  $('#doneLesson').onclick = function () {
    if (state.progress.lessons[l.id]) delete state.progress.lessons[l.id];
    else state.progress.lessons[l.id] = true;
    save(); updateProgress(); renderLesson();
  };
}

/* ================================================================ TILES */

function renderTileBrowser() {
  var groups = [
    { title: 'Bams — the green suit', ids: ['b1','b2','b3','b4','b5','b6','b7','b8','b9'] },
    { title: 'Craks — the red suit', ids: ['c1','c2','c3','c4','c5','c6','c7','c8','c9'] },
    { title: 'Dots — the blue suit', ids: ['d1','d2','d3','d4','d5','d6','d7','d8','d9'] },
    { title: 'Winds — 4 of each, no suit', ids: ['wN','wE','wW','wS'] },
    { title: 'Dragons — each belongs to a suit', ids: ['Db','Dc','Dd'] },
    { title: 'Flowers (8) and Jokers (8)', ids: ['F','J'] }
  ];
  var host = $('#tileBrowser');
  host.innerHTML = groups.map(function (g) {
    return '<div class="tile-group"><h4>' + g.title + '</h4><div class="tile-row">' +
      g.ids.map(function (id) {
        return tileBtn(id, '', { showLabel: state.showLabels });
      }).join('') + '</div></div>';
  }).join('');

  host.onclick = function (e) {
    var b = e.target.closest('button.tile');
    if (!b) return;
    var id = b.dataset.tile;
    var t = tileInfo(id);
    var extra = '';
    if (t.kind === 'dragon') {
      extra = 'Belongs to the ' + SUIT_NAME[t.suit] + ' suit' +
        (id === 'Dd' ? ' — and stands for 0 in year hands.' : '.') +
        ' Written as D on the card.';
    } else if (t.kind === 'num') {
      extra = SUIT_LONG[t.suit] + ' · 4 in the set · called "' + t.rank + ' ' +
        SUIT_NAME[t.suit] + '" at the table.';
    } else if (t.kind === 'wind') {
      extra = 'No suit, so card colours never constrain it. 4 in the set.';
    } else if (t.kind === 'flower') {
      extra = 'All 8 flowers are interchangeable. Written as F.';
    } else {
      extra = 'Wild in any group of 3 or more. Never in a pair or single, and ' +
        'never passed in the Charleston.';
    }
    var d = $('#tileDetail');
    d.hidden = false;
    d.innerHTML = tileStatic(id, '', { showLabel: false }) +
      '<div><b>' + t.name + '</b><span>' + extra + '</span></div>';
  };
}

/* ================================================================= CARD */

var CC = ['cc1', 'cc2', 'cc3'];

/* Colour-code the printed line (patternTokens lives in engine.js so the
   notation can never drift from what the matcher requires). */
function patternLineHtml(p, highlightIdx) {
  return patternTokens(p).map(function (t, i) {
    var cls = (t.slot === null || t.slot === undefined) ? 'ccx' : CC[t.slot];
    var extra = (highlightIdx === i)
      ? ' style="background:#fff3bf;border-radius:4px;padding:0 3px"' : '';
    return '<span class="' + cls + '"' + extra + '>' + t.txt + '</span>';
  }).join(' ');
}

function renderCard() {
  var key = [
    ['1', 'single'], ['11', 'pair'], ['111', 'pung'], ['1111', 'kong'], ['11111', 'quint'],
    ['F', 'flower'], ['D', 'dragon of that colour&rsquo;s suit'], ['0', 'Soap (white dragon)'],
    ['N E W S', 'winds'], ['X', 'may be exposed'], ['C', 'must be concealed']
  ];
  $('#notationKey').innerHTML = key.map(function (k) {
    return '<div><b>' + k[0] + '</b> &nbsp;' + k[1] + '</div>';
  }).join('') +
    '<div><span class="cc1">blue</span>/<span class="cc2">red</span>/<span class="cc3">green</span>' +
    ' &nbsp;same colour = same suit</div>';

  /* keep the sections in definition order — object keys that look like
     integers ("369", "2026") would otherwise sort numerically */
  var order = [], sections = {};
  PATTERNS.forEach(function (p) {
    if (!sections[p.section]) { sections[p.section] = []; order.push(p.section); }
    sections[p.section].push(p);
  });

  var html = '';
  order.forEach(function (sec) {
    html += '<div class="card-section"><h3>' + sec + '</h3>';
    sections[sec].forEach(function (p) {
      var any = p.any ? ' <span class="badge">' + p.any + '</span>' : '';
      html += '<div class="card-hand" data-id="' + p.id + '">' +
        '<div class="card-hand-top">' +
        '<span class="card-hand-line">' + patternLineHtml(p) + '</span>' +
        '<span class="card-hand-meta">' + any +
        '<span class="badge ' + (p.concealed ? 'c' : '') + '">' +
        (p.concealed ? 'C — concealed' : 'X — may expose') + '</span>' +
        '<span class="badge pts">' + p.points + '</span></span></div>' +
        '<div class="card-hand-detail" hidden></div></div>';
    });
    html += '</div>';
  });
  $('#cardList').innerHTML = html;

  $('#cardList').onclick = function (e) {
    var card = e.target.closest('.card-hand');
    if (!card || e.target.closest('select')) return;
    var p = PATTERNS.filter(function (x) { return x.id === card.dataset.id; })[0];
    var detail = $('.card-hand-detail', card);
    if (!detail.hidden && !e.target.closest('.card-hand-top')) return;
    if (!detail.hidden) { detail.hidden = true; card.classList.remove('open'); return; }
    detail.hidden = false;
    card.classList.add('open');
    renderCardDetail(p, detail, null, null);
  };
}

function renderCardDetail(p, host, chosenN, chosenSuits) {
  var n = chosenN !== null && chosenN !== undefined ? chosenN
    : (p.vars ? p.vars.n[0] : 0);
  var suits = chosenSuits || SUITS.slice(0, Math.max(1, p.slots));
  /* Two colours may never be the same suit — that is an illegal reading of
     the line, not just an unusual one. */
  var seen = {}, distinct = true;
  for (var q = 0; q < p.slots; q++) {
    if (seen[suits[q]]) distinct = false;
    seen[suits[q]] = true;
  }
  var req = distinct ? materialize(p, n, suits) : null;

  var ctrl = '<div class="suit-picker">';
  if (p.vars) {
    ctrl += '<label>number <select data-role="num">' +
      p.vars.n.map(function (v) {
        return '<option value="' + v + '"' + (v === n ? ' selected' : '') + '>' + v + '</option>';
      }).join('') + '</select></label>';
  }
  for (var s = 0; s < p.slots; s++) {
    ctrl += '<label><span class="' + CC[s] + '">colour ' + (s + 1) + '</span> ' +
      '<select data-role="suit" data-slot="' + s + '">' +
      SUITS.map(function (su) {
        return '<option value="' + su + '"' + (su === suits[s] ? ' selected' : '') + '>' +
          SUIT_NAME[su] + 's</option>';
      }).join('') + '</select></label>';
  }
  ctrl += '</div>';

  var tiles = '';
  if (req) {
    tiles = '<div class="tile-row">' + req.map(function (r) {
      var out = '';
      for (var i = 0; i < r.count; i++) out += tileStatic(r.id, 'sm');
      return out;
    }).join('<span class="gap"></span>') + '</div>';
  } else {
    tiles = '<p class="note">That combination is not legal for this line — two ' +
      'colours must be different suits.</p>';
  }

  var summary = '';
  if (req) {
    var jokerGroups = req.filter(function (r) { return r.jokerOK; }).length;
    summary = '<p class="note">' + req.reduce(function (a, r) { return a + r.count; }, 0) +
      ' tiles · jokers allowed in ' + jokerGroups + ' of ' + req.length + ' groups' +
      (p.concealed ? ' · concealed: no claiming discards except to win' : '') + '</p>';
  }
  host.innerHTML = '<p class="note">' + p.note + '</p>' + ctrl + tiles + summary;

  var selects = host.querySelectorAll('select');
  for (var i = 0; i < selects.length; i++) {
    selects[i].onchange = function () {
      var nn = p.vars ? parseInt($('select[data-role=num]', host).value, 10) : 0;
      var ss = [];
      var ssel = host.querySelectorAll('select[data-role=suit]');
      for (var k = 0; k < ssel.length; k++) ss[parseInt(ssel[k].dataset.slot, 10)] = ssel[k].value;
      renderCardDetail(p, host, nn, ss);
    };
  }
}

/* =============================================================== DRILLS */

var DRILLS = [
  { id: 'tiles', name: 'Name that tile' },
  { id: 'rules', name: 'Rules quiz' },
  { id: 'notation', name: 'Card notation' },
  { id: 'closest', name: 'Which hand am I closest to?' },
  { id: 'charleston', name: 'Charleston: what do I pass?' }
];

function drillScore(id) {
  var d = state.progress.drills[id] || { right: 0, total: 0, streak: 0, best: 0 };
  return d;
}
function recordDrill(id, correct) {
  var d = drillScore(id);
  d.total++;
  if (correct) { d.right++; d.streak++; if (d.streak > d.best) d.best = d.streak; }
  else d.streak = 0;
  state.progress.drills[id] = d;
  save();
}

function renderDrillPicker() {
  var host = $('#drillPicker');
  host.innerHTML = DRILLS.map(function (d) {
    return '<button class="btn ' + (state.drill === d.id ? 'sel' : '') +
      '" data-drill="' + d.id + '">' + d.name + '</button>';
  }).join('');
  host.onclick = function (e) {
    var b = e.target.closest('button[data-drill]');
    if (!b) return;
    state.drill = b.dataset.drill;
    renderDrillPicker();
  };
  runDrill();
}

function scoreLine(id) {
  var d = drillScore(id);
  var pct = d.total ? Math.round(d.right / d.total * 100) : 0;
  return '<div class="score-line"><span>Correct: <b>' + d.right + ' / ' + d.total +
    '</b> (' + pct + '%)</span><span>Streak: <b>' + d.streak + '</b></span>' +
    '<span>Best streak: <b>' + d.best + '</b></span></div>';
}

function runDrill() {
  var fn = {
    tiles: drillTiles, rules: drillRules, notation: drillNotation,
    closest: drillClosest, charleston: drillCharleston
  }[state.drill];
  fn();
}

/* ---- drill: name that tile ---- */
function drillTiles() {
  var deck = [];
  SUITS.forEach(function (s) { for (var r = 1; r <= 9; r++) deck.push(s + r); });
  deck = deck.concat(['wN','wE','wW','wS','Db','Dc','Dd','F','J']);
  var answer = pickRandom(deck);
  var opts = [answer];
  while (opts.length < 4) {
    var c = pickRandom(deck);
    if (opts.indexOf(c) < 0) opts.push(c);
  }
  opts = shuffle(opts);

  var host = $('#drillStage');
  host.innerHTML = scoreLine('tiles') +
    '<p class="drill-q">What is this tile called?</p>' +
    '<div style="margin:10px 0 18px">' + tileStatic(answer, '', { showLabel: false }) + '</div>' +
    '<div class="opts">' + opts.map(function (o, i) {
      return '<button class="opt" data-i="' + i + '">' + tileName(o) + '</button>';
    }).join('') + '</div><div id="drillFeedback"></div>';

  host.querySelectorAll('.opt').forEach(function (b, i) {
    b.onclick = function () {
      var correct = opts[i] === answer;
      recordDrill('tiles', correct);
      host.querySelectorAll('.opt').forEach(function (x, k) {
        x.disabled = true;
        if (opts[k] === answer) x.classList.add('correct');
        else if (k === i) x.classList.add('wrong');
      });
      var t = tileInfo(answer);
      var why = t.kind === 'dragon'
        ? 'Dragons: green→Bams, red→Craks, soap (white)→Dots.'
        : (t.kind === 'num' ? SUIT_LONG[t.suit] + ', four of each in the set.'
          : (t.kind === 'wind' ? 'Winds are suitless.' : ''));
      $('#drillFeedback').innerHTML =
        '<div class="explain ' + (correct ? 'good' : 'bad') + '">' +
        (correct ? '✓ ' : '✗ It was <b>' + tileName(answer) + '</b>. ') + why + '</div>' +
        '<div class="drill-actions"><button class="btn primary" id="nextQ">Next tile</button></div>';
      $('#nextQ').onclick = drillTiles;
    };
  });
}

/* ---- drill: rules quiz ---- */
var rulesPool = [];
function drillRules() {
  if (!rulesPool.length) rulesPool = shuffle(RULES_QUESTIONS.map(function (q, i) { return i; }));
  var q = RULES_QUESTIONS[rulesPool.pop()];
  var order = shuffle([0, 1, 2, 3].slice(0, q.a.length));
  var host = $('#drillStage');
  host.innerHTML = scoreLine('rules') +
    '<p class="drill-q">' + q.q + '</p>' +
    '<div class="opts">' + order.map(function (oi, i) {
      return '<button class="opt" data-i="' + i + '">' + q.a[oi] + '</button>';
    }).join('') + '</div><div id="drillFeedback"></div>';

  host.querySelectorAll('.opt').forEach(function (b, i) {
    b.onclick = function () {
      var correct = order[i] === q.correct;
      recordDrill('rules', correct);
      host.querySelectorAll('.opt').forEach(function (x, k) {
        x.disabled = true;
        if (order[k] === q.correct) x.classList.add('correct');
        else if (k === i) x.classList.add('wrong');
      });
      $('#drillFeedback').innerHTML =
        '<div class="explain ' + (correct ? 'good' : 'bad') + '">' +
        (correct ? '✓ ' : '✗ ') + q.why + '</div>' +
        '<div class="drill-actions"><button class="btn primary" id="nextQ">Next question</button></div>';
      $('#nextQ').onclick = drillRules;
    };
  });
}

/* ---- drill: card notation ---- */
function drillNotation() {
  var p = pickRandom(PATTERNS);
  var toks = patternTokens(p);
  var kinds = ['joker', 'count', 'conceal'];
  var dragToks = toks.filter(function (t) { return t.g.t === 'drag'; });
  if (dragToks.length) kinds.push('dragon');
  /* a one-colour line has no suit rule to test */
  if (p.slots >= 2) kinds.push('suits');
  var kind = pickRandom(kinds);

  var q, opts, correct, why, highlight = null;

  if (kind === 'joker') {
    var idx = Math.floor(Math.random() * toks.length);
    highlight = idx;
    var g = toks[idx].g;
    var size = toks[idx].txt.length;
    q = 'May a joker be used in the highlighted group?';
    opts = ['Yes — it is a group of three or more',
      'No — jokers can never be used in a pair or a single',
      'Only if the hand is exposed', 'Only if the hand is concealed'];
    correct = size >= 3 ? 0 : 1;
    why = size >= 3
      ? 'That group is ' + size + ' tiles, so jokers are fine — in exposed and concealed hands alike.'
      : 'That group is ' + size + ' tile' + (size > 1 ? 's' : '') +
        '. Jokers are barred from singles and pairs, no exceptions.';
  } else if (kind === 'suits') {
    var slots = p.slots;
    q = 'Which suit assignment is legal for this line?';
    var legal = pickRandom(suitAssignments(slots));
    /* Distractors must all be illegal — every one repeats a suit across two
       colours — so exactly one option is right. */
    var every = [];
    (function build(prefix) {
      if (prefix.length === slots) { every.push(prefix); return; }
      SUITS.forEach(function (su) { build(prefix.concat([su])); });
    })([]);
    var wrongs = shuffle(every.filter(function (a) {
      var seen = {}, dup = false;
      a.forEach(function (su) { if (seen[su]) dup = true; seen[su] = 1; });
      return dup;
    })).slice(0, 3);
    var all = shuffle([legal].concat(wrongs));
    opts = all.map(function (a) {
      return a.map(function (su, k) { return 'colour ' + (k + 1) + ' = ' + SUIT_NAME[su] + 's'; })
        .join(', ');
    });
    correct = all.indexOf(legal);
    why = 'Every colour must be a different suit, and any suit may play any colour. ' +
      'Repeating a suit across two colours is the classic beginner mistake.';
  } else if (kind === 'count') {
    q = 'How many tiles does this line use in total?';
    var total = p.groups.reduce(function (a, g) { return a + g.n; }, 0);
    opts = ['13', '14', '16', 'It varies with the suits you choose'];
    correct = 1;
    why = 'Every line on the card is exactly 14 tiles — here ' + total +
      '. You hold 13 and win on the 14th.';
  } else if (kind === 'conceal') {
    q = 'This line is marked ' + (p.concealed ? '"C"' : '"X"') + '. What does that allow?';
    opts = p.concealed
      ? ['It must be concealed — you may not claim discards to build it (only the winning tile)',
        'It must contain no jokers',
        'It must be exposed on the table as you build it',
        'It doubles in value']
      : ['It may be exposed — you may claim discards for groups of three or more',
        'It must be exposed before you can win',
        'It may contain no jokers',
        'It can only be won by self-pick'];
    correct = 0;
    why = p.concealed
      ? 'Concealed hands are built from your own tiles. Jokers are still legal in groups of 3+.'
      : 'X hands may be built with claimed discards — but only for pungs, kongs and quints.';
  } else {
    var dt = pickRandom(dragToks);
    var slot = dt.g.s;
    var suit = pickRandom(SUITS);
    q = 'In this line, colour ' + (slot + 1) + ' is being played as <b>' +
      SUIT_NAME[suit] + 's</b>. Which dragon does its <span class="' + CC[slot] +
      '">D</span> mean?';
    var map = { b: 'Green dragon', c: 'Red dragon', d: 'White dragon (Soap)' };
    var all2 = shuffle(['Green dragon', 'Red dragon', 'White dragon (Soap)', 'Any dragon you like']);
    opts = all2;
    correct = all2.indexOf(map[suit]);
    why = 'Green goes with Bams, red with Craks, soap with Dots. A D always follows its ' +
      'group\'s suit.';
  }

  /* shuffle answer positions so the right one is never predictable */
  var perm = shuffle(opts.map(function (_, i) { return i; }));
  var shuffled = perm.map(function (i) { return opts[i]; });
  correct = perm.indexOf(correct);
  opts = shuffled;

  var host = $('#drillStage');
  host.innerHTML = scoreLine('notation') +
    '<p class="drill-q">' + q + '</p>' +
    '<p class="card-line-demo">' + patternLineHtml(p, highlight) +
    ' <span class="pts">' + (p.concealed ? 'C' : 'X') + '&nbsp;&nbsp;' + p.points + '</span></p>' +
    '<div class="opts" style="margin-top:14px">' + opts.map(function (o, i) {
      return '<button class="opt" data-i="' + i + '">' + o + '</button>';
    }).join('') + '</div><div id="drillFeedback"></div>';

  host.querySelectorAll('.opt').forEach(function (b, i) {
    b.onclick = function () {
      var ok = i === correct;
      recordDrill('notation', ok);
      host.querySelectorAll('.opt').forEach(function (x, k) {
        x.disabled = true;
        if (k === correct) x.classList.add('correct');
        else if (k === i) x.classList.add('wrong');
      });
      $('#drillFeedback').innerHTML =
        '<div class="explain ' + (ok ? 'good' : 'bad') + '">' + (ok ? '✓ ' : '✗ ') + why + '</div>' +
        '<div class="drill-actions"><button class="btn primary" id="nextQ">Next line</button></div>';
      $('#nextQ').onclick = drillNotation;
    };
  });
}

/* ---- drill: which hand am I closest to? ---- */
function drillClosest() {
  var rack, ranked, tries = 0;
  do {
    rack = dealPracticeRack(13);
    ranked = analyzeHand(rack);
    tries++;
  } while (tries < 20 && (!ranked.length || ranked[0].matched === ranked[ranked.length - 1].matched));

  var best = ranked[0];
  var worse = ranked.filter(function (r) { return r.matched < best.matched; });
  var picks = [best];
  shuffle(worse).slice(0, 3).forEach(function (w) { picks.push(w); });
  picks = picks.slice(0, 3);
  var shown = shuffle(picks);

  var host = $('#drillStage');
  host.innerHTML = scoreLine('closest') +
    '<p class="drill-q">Your rack after the Charleston. Which practice hand are you ' +
    'closest to?</p>' +
    '<div class="rack">' + sortTiles(rack).map(function (t) {
      return tileStatic(t, '', { showLabel: true });
    }).join('') + '</div>' +
    '<div class="hand-options">' + shown.map(function (r, i) {
      return '<button class="hand-opt" data-i="' + i + '">' + patternLineHtml(r.pattern) +
        '<small>' + r.pattern.section + ' · ' + r.pattern.points + ' points · ' +
        (r.pattern.concealed ? 'concealed' : 'may expose') + '</small></button>';
    }).join('') + '</div><div id="drillFeedback"></div>';

  host.querySelectorAll('.hand-opt').forEach(function (b, i) {
    b.onclick = function () {
      var ok = shown[i] === best;
      recordDrill('closest', ok);
      host.querySelectorAll('.hand-opt').forEach(function (x, k) {
        x.disabled = true;
        if (shown[k] === best) x.classList.add('correct');
        else if (k === i) x.classList.add('wrong');
      });
      var rows = shown.map(function (r) {
        return '<tr><td class="mono">' + r.pattern.line + '</td><td>' + r.matched +
          ' of 14</td><td>' + describeAssignment(r) + '</td><td>' + missingText(r) + '</td></tr>';
      }).join('');
      $('#drillFeedback').innerHTML =
        '<div class="explain ' + (ok ? 'good' : 'bad') + '">' + (ok ? '✓ ' : '✗ ') +
        'Counting jokers as wild, here is how each line scores:' +
        '<table class="ref"><tr><th>Line</th><th>Tiles you have</th><th>Played as</th>' +
        '<th>Still need</th></tr>' + rows + '</table></div>' +
        '<div class="drill-actions"><button class="btn primary" id="nextQ">New rack</button></div>';
      $('#nextQ').onclick = drillClosest;
    };
  });
}

/* ---- drill: Charleston passing ---- */
function drillCharleston() {
  var rack = sortTiles(dealPracticeRack(13));
  var chosen = [];
  var host = $('#drillStage');

  function paint() {
    host.innerHTML = scoreLine('charleston') +
      '<p class="drill-q">First Charleston, pass right. Choose <b>3 tiles</b> to give away.</p>' +
      '<div class="rack">' + rack.map(function (t, i) {
        return '<button class="tile ' + (chosen.indexOf(i) >= 0 ? 'sel' : '') +
          '" data-i="' + i + '">' + tileSvg(t, { showLabel: true }) + '</button>';
      }).join('') + '</div>' +
      '<div class="drill-actions"><button class="btn primary" id="passBtn"' +
      (chosen.length === 3 ? '' : ' disabled') + '>Pass these 3</button>' +
      '<button class="btn" id="newRack">New rack</button></div>' +
      '<div id="drillFeedback"></div>';

    host.querySelectorAll('.rack .tile').forEach(function (b) {
      b.onclick = function () {
        var i = parseInt(b.dataset.i, 10);
        if (rack[i] === 'J') {
          $('#drillFeedback').innerHTML =
            '<div class="explain bad">Jokers may never be passed in the Charleston.</div>';
          return;
        }
        var at = chosen.indexOf(i);
        if (at >= 0) chosen.splice(at, 1);
        else if (chosen.length < 3) chosen.push(i);
        paint();
      };
    });
    $('#newRack').onclick = drillCharleston;
    if (chosen.length === 3) $('#passBtn').onclick = grade;
  }

  function grade() {
    var ranked = rankTilesByUsefulness(rack);
    var passable = ranked.filter(function (r) { return r.tile !== 'J'; });
    var bestThree = passable.slice(0, 3).map(function (r) { return r.idx; });
    var overlap = chosen.filter(function (i) { return bestThree.indexOf(i) >= 0; }).length;
    var ok = overlap >= 2;
    recordDrill('charleston', ok);

    var before = analyzeHand(rack)[0];
    var after = analyzeHand(rack.filter(function (_, i) { return chosen.indexOf(i) < 0; }));
    var kept = after.slice(0, 3).map(function (r) {
      return '<tr><td class="mono">' + r.pattern.line + '</td><td>' + r.matched +
        ' of 14</td><td>' + describeAssignment(r) + '</td></tr>';
    }).join('');

    host.innerHTML = scoreLine('charleston') +
      '<p class="drill-q">You passed:</p>' +
      '<div class="tile-row">' + chosen.map(function (i) {
        return tileStatic(rack[i]);
      }).join('') + '</div>' +
      '<div class="explain ' + (ok ? 'good' : 'bad') + '">' +
      (ok ? '✓ Good pass. ' : 'Playable, but you can do better. ') +
      'You picked ' + overlap + ' of the 3 tiles the engine rates least useful. ' +
      'It would have passed:</div>' +
      '<div class="tile-row">' + bestThree.map(function (i) {
        return tileStatic(rack[i]);
      }).join('') + '</div>' +
      '<p class="lead" style="margin-top:14px">Your strongest line was <span class="mono">' +
      before.pattern.line + '</span> at ' + before.matched +
      ' of 14. After your pass, your best remaining lines are:</p>' +
      '<table class="ref"><tr><th>Line</th><th>Tiles you have</th><th>Played as</th></tr>' +
      kept + '</table>' +
      '<div class="drill-actions"><button class="btn primary" id="nextQ">New rack</button></div>';
    $('#nextQ').onclick = drillCharleston;
  }

  paint();
}

/* ======================================================== PRACTICE TABLE */

var G = null;
var SEATS = ['You (East)', 'South', 'West', 'North'];
var PASS_DIR = [
  { name: 'right', off: 1 }, { name: 'across', off: 2 }, { name: 'left', off: 3 },
  { name: 'left', off: 3 }, { name: 'across', off: 2 }, { name: 'right', off: 1 }
];

function logMsg(html, cls) {
  G.log.unshift('<div class="' + (cls || '') + '">' + html + '</div>');
  if (G.log.length > 120) G.log.pop();
}

function newGame() {
  var wall = shuffle(buildDeck());
  G = {
    wall: wall,
    players: [0, 1, 2, 3].map(function (i) {
      return { name: SEATS[i], hand: [], exposed: [], dead: false, you: i === 0 };
    }),
    discards: [], last: null, lastBy: null,
    phase: 'charleston', step: 0, sel: [], pending: null,
    turn: 0, target: null, log: [], secondAsked: false, courtesy: false, over: null
  };
  for (var r = 0; r < 13; r++) {
    for (var p = 0; p < 4; p++) G.players[p].hand.push(G.wall.pop());
  }
  G.players[0].hand.push(G.wall.pop()); /* East takes the 14th */
  G.players.forEach(function (p) { p.hand = sortTiles(p.hand); });
  logMsg('Dealt. You are <span class="hl">East</span> — you hold 14 tiles and will ' +
    'discard first. First: the Charleston.');
  renderTable();
}

function allTiles(p) {
  var out = p.hand.slice();
  p.exposed.forEach(function (g) { out = out.concat(g); });
  return out;
}

/* ---- Charleston ---- */

function botPass(p, count) {
  var ranked = rankTilesByUsefulness(p.hand).filter(function (r) { return r.tile !== 'J'; });
  var idxs = ranked.slice(0, count).map(function (r) { return r.idx; });
  var out = idxs.map(function (i) { return p.hand[i]; });
  p.hand = p.hand.filter(function (_, i) { return idxs.indexOf(i) < 0; });
  return out;
}

function doCharlestonPass() {
  var dir = PASS_DIR[G.step];
  var giving = [];
  giving[0] = G.sel.map(function (i) { return G.players[0].hand[i]; });
  G.players[0].hand = G.players[0].hand.filter(function (_, i) { return G.sel.indexOf(i) < 0; });
  for (var i = 1; i < 4; i++) giving[i] = botPass(G.players[i], 3);
  for (i = 0; i < 4; i++) {
    var to = (i + dir.off) % 4;
    G.players[to].hand = sortTiles(G.players[to].hand.concat(giving[i]));
  }
  logMsg('Pass ' + (G.step % 3 + 1) + ' <span class="hl">' + dir.name +
    '</span>: you gave ' + giving[0].map(tileName).join(', ') + '.');
  G.sel = [];
  G.step++;

  if (G.step === 3 && !G.secondAsked) { G.phase = 'ask2'; }
  else if (G.step === 6 || (G.step === 3 && G.secondAsked && !G.second)) { G.phase = 'courtesy'; }
  renderTable();
}

function doCourtesy(count) {
  if (count > 0) {
    var yours = G.sel.map(function (i) { return G.players[0].hand[i]; });
    G.players[0].hand = G.players[0].hand.filter(function (_, i) { return G.sel.indexOf(i) < 0; });
    var theirs = botPass(G.players[2], count);
    G.players[0].hand = sortTiles(G.players[0].hand.concat(theirs));
    G.players[2].hand = sortTiles(G.players[2].hand.concat(yours));
    logMsg('Courtesy pass: you swapped ' + count + ' tile' + (count > 1 ? 's' : '') +
      ' with West.');
  } else {
    logMsg('No courtesy pass.');
  }
  G.sel = [];
  startPlay();
}

function startPlay() {
  G.phase = 'play';
  G.sub = 'discard';       /* East holds 14 and discards first */
  G.turn = 0;
  var best = analyzeHand(G.players[0].hand)[0];
  G.target = best ? best.pattern.id : null;
  logMsg('Charleston over. <span class="hl">Play begins</span> — you are East, so ' +
    'discard one tile to start.');
  renderTable();
}

/* ---- claiming ---- */

/* Can `hand` claim `tile` to expose a group of 3+ from some pattern? */
function callOptions(player, tile) {
  var tiles = allTiles(player);
  var ranked = analyzeHand(tiles.concat([tile])).slice(0, 4);
  var out = [];
  ranked.forEach(function (res) {
    if (res.pattern.concealed) return;
    res.req.forEach(function (r) {
      if (r.id !== tile || r.count < 3) return;
      /* An exposure costs (count - 1) tiles off the rack and you must still
         have a tile left to discard — otherwise the call is illegal, and it
         would deadlock a hand whose every tile is exposed. */
      if (player.hand.length < r.count) return;
      var copies = player.hand.filter(function (t) { return t === tile; }).length;
      var jokers = player.hand.filter(function (t) { return t === 'J'; }).length;
      if (copies + jokers >= r.count - 1) {
        out.push({ pattern: res.pattern, size: r.count, copies: copies, res: res });
      }
    });
  });
  out.sort(function (a, b) { return b.size - a.size; });
  return out;
}

function doExpose(player, tile, size) {
  var group = [tile];
  var need = size - 1;
  for (var i = 0; i < player.hand.length && need > 0; i++) {
    if (player.hand[i] === tile) { group.push(player.hand.splice(i, 1)[0]); i--; need--; }
  }
  for (i = 0; i < player.hand.length && need > 0; i++) {
    if (player.hand[i] === 'J') { group.push(player.hand.splice(i, 1)[0]); i--; need--; }
  }
  player.exposed.push(group);
}

function handIsWin(player) {
  var tiles = allTiles(player);
  if (tiles.length !== 14) return null;
  var best = analyzeHand(tiles)[0];
  return best && best.matched >= 14 ? best : null;
}

/* ---- turn machinery ---- */

function afterDiscard(byIdx, tile) {
  G.last = tile; G.lastBy = byIdx;
  G.discards.push(tile);

  /* offer the claim to you first if it wasn't your discard */
  if (byIdx !== 0 && !G.players[0].dead) {
    var opts = callOptions(G.players[0], tile);
    var winning = wouldWin(G.players[0], tile);
    if (opts.length || winning) {
      G.sub = 'call';
      G.pending = { tile: tile, by: byIdx, opts: opts, win: winning };
      renderTable();
      return;
    }
  }
  resolveBotCalls(byIdx, tile);
}

function wouldWin(player, tile) {
  var tiles = allTiles(player).concat([tile]);
  if (tiles.length !== 14) return null;
  var best = analyzeHand(tiles)[0];
  return best && best.matched >= 14 ? best : null;
}

function resolveBotCalls(byIdx, tile) {
  for (var k = 1; k <= 3; k++) {
    var i = (byIdx + k) % 4;
    if (i === 0 || G.players[i].dead) continue;
    var p = G.players[i];
    var win = wouldWin(p, tile);
    if (win) { p.hand.push(tile); declareWin(i, win, byIdx); return; }
    var opts = callOptions(p, tile);
    if (opts.length && Math.random() < 0.65) {
      doExpose(p, tile, opts[0].size);
      G.discards.pop();
      logMsg('<span class="hl">' + p.name + '</span> calls the ' + tileName(tile) +
        ' and exposes ' + opts[0].size + ' tiles.', 'warn');
      G.turn = i;
      renderTable();
      setTimeout(function () { botDiscard(G.players[G.turn], G.turn); }, 550);
      return;
    }
  }
  G.turn = (byIdx + 1) % 4;
  nextTurn();
}

function nextTurn() {
  if (G.phase !== 'play') return;
  var i = G.turn;
  while (G.players[i].dead) { i = (i + 1) % 4; }
  G.turn = i;
  if (i === 0) {
    G.sub = 'draw';
    renderTable();
  } else {
    renderTable();
    setTimeout(function () { botTurn(i); }, 450);
  }
}

function botTurn(i) {
  if (G.phase !== 'play') return;
  if (!G.wall.length) return wallGame();
  var p = G.players[i];
  var t = G.wall.pop();
  p.hand = sortTiles(p.hand.concat([t]));
  var win = handIsWin(p);
  if (win) return declareWin(i, win, null);
  botDiscard(p, i);
}

function botDiscard(p, i) {
  var ranked = rankTilesByUsefulness(p.hand);
  var pick = ranked[0];
  /* keep jokers unless they are the only thing left */
  if (pick.tile === 'J' && ranked.length > 1) pick = ranked[1];
  var tile = p.hand.splice(pick.idx, 1)[0];
  logMsg(p.name + ' discards <b>' + tileName(tile) + '</b>.');
  renderTable();
  setTimeout(function () { afterDiscard(i, tile); }, 300);
}

function declareWin(i, res, fromIdx) {
  G.phase = 'over';
  var p = G.players[i];
  var how = fromIdx === null ? 'self-picked'
    : (fromIdx === 0 ? 'claimed your discard'
      : 'claimed ' + G.players[fromIdx].name + '\'s discard');
  G.over = { winner: i, res: res, how: how, fromIdx: fromIdx };
  logMsg('<span class="good">MAH JONGG — ' + p.name + '</span> (' + how + ') with ' +
    res.pattern.line + ' for ' + res.pattern.points + ' points.', 'good');
  if (fromIdx === null) {
    logMsg('Self-pick: all three players pay double — ' + (res.pattern.points * 2) + ' each.');
  } else {
    logMsg('Throwing the winning tile costs double — ' +
      (fromIdx === 0 ? 'you pay ' : G.players[fromIdx].name + ' pays ') +
      (res.pattern.points * 2) + ', the other two pay ' + res.pattern.points + ' each.');
  }
  renderTable();
}

function wallGame() {
  G.phase = 'over';
  G.over = { winner: null };
  logMsg('<span class="warn">Wall game</span> — the wall is empty and nobody won. ' +
    'Nobody pays.', 'warn');
  renderTable();
}

/* ---- table rendering ---- */

function renderTable() {
  var host = $('#tableApp');
  if (!G) {
    host.innerHTML = '<p class="lead">Press <b>New game</b> to deal.</p>' + simNote();
    return;
  }
  var you = G.players[0];
  var analysis = analyzeHand(allTiles(you));

  var html = '<div class="table-grid"><div>';

  /* opponents */
  html += '<div class="bots">' + [1, 2, 3].map(function (i) {
    var p = G.players[i];
    var exp = p.exposed.map(function (g) {
      return g.map(function (t) { return tileStatic(t, 'xs', { showLabel: false }); }).join('');
    }).join('<span class="gap"></span>');
    return '<div class="bot' + (G.phase === 'play' && G.turn === i ? ' turn' : '') + '">' +
      '<b>' + p.name + (i === 1 ? ' — your right' : i === 2 ? ' — across' : ' — your left') + '</b>' +
      '<span class="bot-meta">' + p.hand.length + ' tiles' +
      (p.exposed.length ? ' · ' + p.exposed.length + ' exposure(s)' : ' · nothing exposed') +
      '</span><div class="exposed">' + exp + '</div></div>';
  }).join('') + '</div>';

  /* discards */
  html += '<div class="discard-area"><h4>Discards · wall: ' + G.wall.length + ' tiles</h4>' +
    '<div class="discards">' + G.discards.map(function (t, i) {
      return tileStatic(t, i === G.discards.length - 1 ? 'last' : '', { showLabel: false });
    }).join('') + '</div></div>';

  /* phase-specific controls */
  if (G.phase === 'charleston') html += charlestonBar();
  else if (G.phase === 'ask2') html += ask2Bar();
  else if (G.phase === 'courtesy') html += courtesyBar();
  else if (G.phase === 'play') html += playBar(analysis);
  else html += overBar();

  /* your rack */
  html += '<h4 style="margin:14px 0 4px;font-size:12px;text-transform:uppercase;' +
    'letter-spacing:.06em;color:var(--muted)">Your rack — ' + you.hand.length + ' tiles</h4>' +
    '<div class="rack">' + you.hand.map(function (t, i) {
      return '<button class="tile ' + (G.sel.indexOf(i) >= 0 ? 'sel' : '') +
        '" data-rack="' + i + '">' + tileSvg(t, { showLabel: true }) + '</button>';
    }).join('') + '</div>';

  if (you.exposed.length) {
    html += '<div class="exposed-row">Exposed: ' + you.exposed.map(function (g) {
      return g.map(function (t) { return tileStatic(t, 'sm', { showLabel: false }); }).join('');
    }).join('<span class="gap"></span>') + '</div>';
  }

  html += '</div><div>';

  /* target / advisor panel */
  if (G.phase !== 'over') {
    html += '<div class="target-box"><h4>Your best lines right now</h4>' +
      analysis.slice(0, 4).map(function (r) {
        return '<button class="target-opt' + (G.target === r.pattern.id ? ' sel' : '') +
          '" data-target="' + r.pattern.id + '">' + patternLineHtml(r.pattern) +
          '<small>' + r.matched + ' of 14 · ' + describeAssignment(r) +
          '<br>need: ' + missingText(r) + '</small></button>';
      }).join('') + '</div>';
  }
  html += '<div class="log">' + G.log.join('') + '</div>';
  html += '</div></div>' + simNote();

  host.innerHTML = html;
  wireTable();
}

function simNote() {
  return '<div class="sim-note"><b>Simplifications in this trainer:</b><ul>' +
    '<li>You are always East. Bots pass, call and discard using a simple ' +
    '"keep what is useful" heuristic.</li>' +
    '<li>Joker exchange (redeeming a joker from an exposure) is explained in the ' +
    'lessons but not implemented here.</li>' +
    '<li>Exposures are checked against the practice hands in this app, not the ' +
    'official card, and hands are not declared dead for a bad exposure.</li>' +
    '<li>Wall games, self-pick vs discard payments, and the Charleston sequence ' +
    'follow the real rules.</li></ul></div>';
}

function charlestonBar() {
  var dir = PASS_DIR[G.step];
  return '<div class="turn-bar"><span class="hint"><b>Charleston pass ' +
    (G.step % 3 + 1) + ' of 3 — ' + dir.name + '</b>' +
    (G.step >= 3 ? ' (second Charleston)' : '') +
    '. Select exactly 3 tiles from your rack. Jokers may never be passed.' +
    (G.step % 3 === 2 ? ' This is the last pass of the Charleston — at a real table ' +
      'you could pass tiles on blind here.' : '') +
    '</span><button class="btn primary" id="passBtn"' +
    (G.sel.length === 3 ? '' : ' disabled') + '>Pass ' + G.sel.length + '/3</button>' +
    '<button class="btn" id="suggestBtn">Suggest</button></div>';
}

function ask2Bar() {
  return '<div class="turn-bar"><span class="hint"><b>Second Charleston?</b> ' +
    'It is optional and every player must agree — left, across, right. Skip it if ' +
    'your hand is already close.</span>' +
    '<button class="btn primary" id="yes2">Play it</button>' +
    '<button class="btn" id="no2">Skip it</button></div>';
}

function courtesyBar() {
  return '<div class="turn-bar"><span class="hint"><b>Courtesy pass with West ' +
    '(across).</b> Select up to 3 tiles, or pass none. Both players must give the ' +
    'same number.</span>' +
    '<button class="btn primary" id="courtBtn">Swap ' + G.sel.length + '</button>' +
    '<button class="btn" id="courtNone">Pass none</button></div>';
}

function playBar(analysis) {
  var you = G.players[0];
  var win = handIsWin(you);
  var bar = '<div class="turn-bar">';
  if (G.sub === 'call' && G.pending) {
    var t = G.pending.tile;
    bar += '<span class="hint"><b>' + G.players[G.pending.by].name + ' discarded the ' +
      tileName(t) + '.</b> ' +
      (G.pending.win ? 'It completes your hand!' :
        'You can claim it to expose a group of ' + G.pending.opts[0].size + '.') +
      '</span>';
    if (G.pending.win) bar += '<button class="btn primary" id="callWin">Mah Jongg!</button>';
    if (G.pending.opts.length) {
      bar += '<button class="btn' + (G.pending.win ? '' : ' primary') + '" id="callBtn">Call and expose ' +
        G.pending.opts[0].size + '</button>';
    }
    bar += '<button class="btn" id="passCall">Let it go</button>';
  } else if (G.turn !== 0) {
    bar += '<span class="hint">' + G.players[G.turn].name + ' is playing…</span>';
  } else if (G.sub === 'draw') {
    bar += '<span class="hint"><b>Your turn.</b> Draw a tile from the wall (' +
      G.wall.length + ' left).</span><button class="btn primary" id="drawBtn">Draw</button>';
  } else {
    bar += '<span class="hint"><b>Discard one tile</b> — click it in your rack. ' +
      (analysis[0] ? 'Best line: ' + analysis[0].matched + ' of 14.' : '') + '</span>';
    if (win) bar += '<button class="btn primary" id="mjBtn">Mah Jongg!</button>';
    bar += '<button class="btn" id="hintBtn">Hint</button>';
  }
  bar += '</div>';
  return bar;
}

function overBar() {
  if (!G.over) return '';
  if (G.over.winner === null) {
    return '<div class="turn-bar"><span class="hint"><b>Wall game.</b> Nobody won and ' +
      'nobody pays.</span><button class="btn primary" id="againBtn">Play again</button></div>';
  }
  var w = G.players[G.over.winner];
  return '<div class="turn-bar"><span class="hint"><b>' + w.name + ' won</b> — ' +
    G.over.res.pattern.line + ' (' + G.over.res.pattern.points + ' points, ' + G.over.how +
    ').</span><button class="btn primary" id="againBtn">Play again</button></div>';
}

function wireTable() {
  var host = $('#tableApp');

  host.querySelectorAll('[data-rack]').forEach(function (b) {
    b.onclick = function () {
      var i = parseInt(b.dataset.rack, 10);
      var tile = G.players[0].hand[i];
      if (G.phase === 'charleston' || G.phase === 'courtesy') {
        if (tile === 'J') {
          logMsg('Jokers may never be passed.', 'warn');
          renderTable();
          return;
        }
        var at = G.sel.indexOf(i);
        if (at >= 0) G.sel.splice(at, 1);
        else if (G.sel.length < 3) G.sel.push(i);
        renderTable();
      } else if (G.phase === 'play' && G.turn === 0 && G.sub === 'discard') {
        var t = G.players[0].hand.splice(i, 1)[0];
        logMsg('You discard <b>' + tileName(t) + '</b>.');
        G.sub = null;
        renderTable();
        setTimeout(function () { afterDiscard(0, t); }, 350);
      }
    };
  });

  host.querySelectorAll('[data-target]').forEach(function (b) {
    b.onclick = function () { G.target = b.dataset.target; renderTable(); };
  });

  var byId = function (id, fn) { var n = $('#' + id, host); if (n) n.onclick = fn; };

  byId('passBtn', doCharlestonPass);
  byId('suggestBtn', function () {
    var ranked = rankTilesByUsefulness(G.players[0].hand)
      .filter(function (r) { return r.tile !== 'J'; });
    G.sel = ranked.slice(0, 3).map(function (r) { return r.idx; });
    logMsg('Suggestion: pass ' + G.sel.map(function (i) {
      return tileName(G.players[0].hand[i]);
    }).join(', ') + ' — they help your best lines least.');
    renderTable();
  });
  byId('yes2', function () {
    G.secondAsked = true; G.second = true; G.phase = 'charleston';
    logMsg('Everyone agreed — second Charleston: left, across, right.');
    renderTable();
  });
  byId('no2', function () {
    G.secondAsked = true; G.second = false; G.phase = 'courtesy';
    logMsg('Second Charleston skipped.');
    renderTable();
  });
  byId('courtBtn', function () { doCourtesy(G.sel.length); });
  byId('courtNone', function () { G.sel = []; doCourtesy(0); });

  byId('drawBtn', function () {
    if (!G.wall.length) return wallGame();
    var t = G.wall.pop();
    G.players[0].hand = sortTiles(G.players[0].hand.concat([t]));
    logMsg('You draw the <b>' + tileName(t) + '</b>.');
    G.sub = 'discard';
    renderTable();
  });
  byId('hintBtn', function () {
    var ranked = rankTilesByUsefulness(G.players[0].hand);
    var pick = ranked[0].tile === 'J' && ranked.length > 1 ? ranked[1] : ranked[0];
    logMsg('Hint: the <b>' + tileName(G.players[0].hand[pick.idx]) +
      '</b> does least for your top lines.');
    renderTable();
  });
  byId('mjBtn', function () {
    var win = handIsWin(G.players[0]);
    if (win) declareWin(0, win, null);
  });
  byId('callWin', function () {
    var p = G.players[0];
    p.hand.push(G.pending.tile);
    G.discards.pop();
    declareWin(0, G.pending.win, G.pending.by);
  });
  byId('callBtn', function () {
    var o = G.pending.opts[0];
    doExpose(G.players[0], G.pending.tile, o.size);
    G.discards.pop();
    logMsg('You call the ' + tileName(G.pending.tile) + ' and expose ' + o.size +
      ' tiles toward <span class="hl">' + o.pattern.line + '</span>. Exposures are ' +
      'permanent — everyone can now read your hand.');
    G.target = o.pattern.id;
    G.pending = null;
    G.turn = 0;
    G.sub = 'discard';
    renderTable();
  });
  byId('passCall', function () {
    var pend = G.pending;
    G.pending = null; G.sub = null;
    renderTable();
    resolveBotCalls(pend.by, pend.tile);
  });
  byId('againBtn', newGame);
}

/* ============================================================= GLOSSARY */

function renderGlossary(filter) {
  var f = (filter || '').toLowerCase();
  var list = GLOSSARY.filter(function (g) {
    return !f || g[0].toLowerCase().indexOf(f) >= 0 || g[1].toLowerCase().indexOf(f) >= 0;
  });
  $('#glossaryList').innerHTML = list.map(function (g) {
    return '<dt>' + g[0] + '</dt><dd>' + g[1] + '</dd>';
  }).join('') || '<dd>No matches.</dd>';
}

/* ================================================================= init */

function init() {
  load();
  updateProgress();

  $('#tabs').onclick = function (e) {
    var b = e.target.closest('.tab');
    if (b) setView(b.dataset.view);
  };
  $('#labelToggle').onchange = function () {
    state.showLabels = this.checked;
    renderTileBrowser();
  };
  $('#glossarySearch').oninput = function () { renderGlossary(this.value); };
  $('#newGameBtn').onclick = newGame;
  $('#resetProgress').onclick = function () {
    if (!confirm('Clear lesson progress and drill scores?')) return;
    state.progress = { lessons: {}, drills: {} };
    save(); updateProgress(); setView(state.view);
  };

  setView('learn');
}

document.addEventListener('DOMContentLoaded', init);
