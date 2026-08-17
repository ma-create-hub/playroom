/* =========================================================================
   engine.js — tiles, hand patterns, and the hand-matching engine.

   Everything here is plain (non-module) script so the app also runs by
   double-clicking index.html from disk, with no server and no build step.
   ========================================================================= */

/* ---------------------------------------------------------------- tiles -- */

/* Tile ids:
     b1..b9   Bams (bamboo)
     c1..c9   Craks (characters)
     d1..d9   Dots (circles)
     wN wE wW wS   Winds
     Dc  Red dragon    (belongs to the Crak suit)
     Db  Green dragon  (belongs to the Bam suit)
     Dd  White dragon  ("soap", belongs to the Dot suit, used as 0)
     F   Flower  (all 8 flowers are interchangeable)
     J   Joker
*/

var SUITS = ['b', 'c', 'd'];
var SUIT_NAME = { b: 'Bam', c: 'Crak', d: 'Dot' };
var SUIT_LONG = { b: 'Bams (bamboo)', c: 'Craks (characters)', d: 'Dots (circles)' };
var DRAGON_OF = { b: 'Db', c: 'Dc', d: 'Dd' };
var WIND_NAME = { N: 'North', E: 'East', W: 'West', S: 'South' };
var WIND_CHAR = { N: '北', E: '東', W: '西', S: '南' };
var CRAK_CHAR = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/* Full 152-tile American set. */
function buildDeck() {
  var deck = [];
  var i, s, r;
  for (s = 0; s < SUITS.length; s++) {
    for (r = 1; r <= 9; r++) {
      for (i = 0; i < 4; i++) deck.push(SUITS[s] + r);
    }
  }
  ['N', 'E', 'W', 'S'].forEach(function (w) {
    for (i = 0; i < 4; i++) deck.push('w' + w);
  });
  ['Db', 'Dc', 'Dd'].forEach(function (d) {
    for (i = 0; i < 4; i++) deck.push(d);
  });
  for (i = 0; i < 8; i++) deck.push('F');
  for (i = 0; i < 8; i++) deck.push('J');
  return deck; // 108 + 16 + 12 + 8 + 8 = 152
}

function tileInfo(id) {
  if (id === 'J') return { kind: 'joker', name: 'Joker', short: 'Joker', suit: null };
  if (id === 'F') return { kind: 'flower', name: 'Flower', short: 'Flower', suit: null };
  if (id === 'Db') return { kind: 'dragon', name: 'Green Dragon', short: 'Green', suit: 'b' };
  if (id === 'Dc') return { kind: 'dragon', name: 'Red Dragon', short: 'Red', suit: 'c' };
  if (id === 'Dd') return { kind: 'dragon', name: 'White Dragon (Soap)', short: 'Soap', suit: 'd' };
  if (id[0] === 'w') {
    return { kind: 'wind', name: WIND_NAME[id[1]] + ' Wind', short: id[1], suit: null, rank: id[1] };
  }
  var s = id[0], r = parseInt(id.slice(1), 10);
  return { kind: 'num', name: r + ' ' + SUIT_NAME[s], short: r + SUIT_NAME[s][0], suit: s, rank: r };
}

function tileName(id) { return tileInfo(id).name; }

/* Sort order for a rack: Bams, Craks, Dots, Winds, Dragons, Flowers, Jokers. */
var SORT_KEY = { b: 0, c: 1, d: 2, w: 3, D: 4, F: 5, J: 6 };
function tileSortValue(id) {
  var group = SORT_KEY[id[0]] !== undefined ? SORT_KEY[id[0]] : 9;
  var sub = 0;
  var t = tileInfo(id);
  if (t.kind === 'num') sub = t.rank;
  else if (t.kind === 'wind') sub = { N: 0, E: 1, W: 2, S: 3 }[t.rank];
  else if (t.kind === 'dragon') sub = { Db: 0, Dc: 1, Dd: 2 }[id];
  return group * 100 + sub;
}
function sortTiles(ids) {
  return ids.slice().sort(function (a, b) { return tileSortValue(a) - tileSortValue(b); });
}

/* ------------------------------------------------------------ rendering -- */
/* Tiles are drawn as inline SVG so the app stays self-contained (no images).
   `showLabel` draws a small corner label — handy while learning, and turned
   off in the identification drill. */

function dotPositions(n) {
  var P = {
    1: [[30, 40]],
    2: [[30, 27], [30, 53]],
    3: [[18, 25], [30, 40], [42, 55]],
    4: [[20, 28], [40, 28], [20, 52], [40, 52]],
    5: [[20, 26], [40, 26], [30, 40], [20, 54], [40, 54]],
    6: [[20, 24], [20, 40], [20, 56], [40, 24], [40, 40], [40, 56]],
    7: [[18, 20], [30, 20], [42, 20], [20, 42], [40, 42], [20, 58], [40, 58]],
    8: [[20, 20], [40, 20], [20, 33], [40, 33], [20, 47], [40, 47], [20, 60], [40, 60]],
    9: [[18, 24], [30, 24], [42, 24], [18, 40], [30, 40], [42, 40], [18, 56], [30, 56], [42, 56]]
  };
  return P[n] || [];
}

var DOT_COLORS = ['#2563eb', '#dc2626', '#15803d'];

function dotSvg(n) {
  if (n === 1) {
    return '<circle cx="30" cy="40" r="13" fill="#2563eb"/>' +
      '<circle cx="30" cy="40" r="7" fill="#fdfcf5"/>' +
      '<circle cx="30" cy="40" r="3.5" fill="#dc2626"/>';
  }
  return dotPositions(n).map(function (p, i) {
    var col = DOT_COLORS[i % 3];
    if (n <= 4) col = i % 2 ? '#dc2626' : '#2563eb';
    if (n === 5) col = i === 2 ? '#15803d' : (i % 2 ? '#dc2626' : '#2563eb');
    return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5.9" fill="' + col + '"/>' +
      '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.4" fill="#fdfcf5"/>';
  }).join('');
}

function bamPositions(n) {
  var P = {
    2: [[30, 26], [30, 54]],
    3: [[30, 22], [20, 54], [40, 54]],
    4: [[20, 26], [40, 26], [20, 54], [40, 54]],
    5: [[20, 24], [40, 24], [30, 40], [20, 56], [40, 56]],
    6: [[18, 26], [30, 26], [42, 26], [18, 54], [30, 54], [42, 54]],
    7: [[30, 18], [20, 40], [40, 40], [20, 40], [18, 58], [30, 58], [42, 58]],
    8: [[17, 26], [26, 26], [34, 26], [43, 26], [17, 54], [26, 54], [34, 54], [43, 54]],
    9: [[18, 21], [30, 21], [42, 21], [18, 40], [30, 40], [42, 40], [18, 59], [30, 59], [42, 59]]
  };
  if (n === 7) P[7] = [[30, 18], [18, 39], [30, 39], [42, 39], [18, 59], [30, 59], [42, 59]];
  return P[n] || [];
}

function bamStick(x, y, color) {
  return '<g>' +
    '<rect x="' + (x - 2.6) + '" y="' + (y - 8) + '" width="5.2" height="16" rx="2.4" fill="' + color + '"/>' +
    '<rect x="' + (x - 4.6) + '" y="' + (y - 9.6) + '" width="9.2" height="2.6" rx="1.3" fill="' + color + '"/>' +
    '<rect x="' + (x - 4.6) + '" y="' + (y + 7) + '" width="9.2" height="2.6" rx="1.3" fill="' + color + '"/>' +
    '</g>';
}

function bamSvg(n) {
  if (n === 1) {
    /* 1 Bam is traditionally a bird. */
    return '<g>' +
      '<ellipse cx="30" cy="44" rx="11" ry="14" fill="#15803d"/>' +
      '<circle cx="30" cy="26" r="6.5" fill="#15803d"/>' +
      '<circle cx="32.4" cy="24.6" r="1.5" fill="#fdfcf5"/>' +
      '<path d="M36 27 L44 30 L36 31 Z" fill="#dc2626"/>' +
      '<path d="M22 40 Q14 50 22 58 Q26 50 24 44 Z" fill="#dc2626"/>' +
      '<path d="M30 58 L26 66 M30 58 L34 66" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>' +
      '</g>';
  }
  return bamPositions(n).map(function (p, i) {
    var col = '#15803d';
    if (n === 5 && i === 2) col = '#dc2626';
    if (n === 7 && i === 0) col = '#dc2626';
    if (n === 9 && i % 3 === 1) col = '#dc2626';
    return bamStick(p[0], p[1], col);
  }).join('');
}

function crakSvg(n) {
  return '<text x="30" y="34" text-anchor="middle" font-size="26" fill="#1f2937" ' +
    'font-family="serif">' + CRAK_CHAR[n] + '</text>' +
    '<text x="30" y="66" text-anchor="middle" font-size="26" fill="#dc2626" ' +
    'font-family="serif">萬</text>';
}

function tileFaceSvg(id) {
  var t = tileInfo(id);
  if (t.kind === 'num') {
    if (t.suit === 'd') return dotSvg(t.rank);
    if (t.suit === 'b') return bamSvg(t.rank);
    return crakSvg(t.rank);
  }
  if (t.kind === 'wind') {
    return '<text x="30" y="34" text-anchor="middle" font-size="24" fill="#1f2937" ' +
      'font-family="serif">' + WIND_CHAR[t.rank] + '</text>' +
      '<text x="30" y="62" text-anchor="middle" font-size="24" font-weight="700" ' +
      'fill="#334155">' + t.rank + '</text>';
  }
  if (id === 'Dc') {
    return '<text x="30" y="52" text-anchor="middle" font-size="34" fill="#dc2626" ' +
      'font-family="serif">中</text>';
  }
  if (id === 'Db') {
    return '<text x="30" y="52" text-anchor="middle" font-size="34" fill="#15803d" ' +
      'font-family="serif">發</text>';
  }
  if (id === 'Dd') {
    /* The "soap" — a blank/framed tile, used as the zero in year hands. */
    return '<rect x="15" y="20" width="30" height="40" rx="3" fill="none" ' +
      'stroke="#2563eb" stroke-width="3"/>' +
      '<rect x="21" y="26" width="18" height="28" rx="2" fill="none" ' +
      'stroke="#2563eb" stroke-width="1.4"/>';
  }
  if (id === 'F') {
    var petals = '';
    for (var k = 0; k < 6; k++) {
      var a = (Math.PI * 2 * k) / 6;
      var cx = 30 + Math.cos(a) * 11, cy = 40 + Math.sin(a) * 11;
      petals += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) +
        '" r="7.5" fill="#e879a6" opacity="0.85"/>';
    }
    return petals + '<circle cx="30" cy="40" r="6" fill="#f5b301"/>' +
      '<text x="30" y="74" text-anchor="middle" font-size="11" font-weight="700" ' +
      'fill="#9d174d">F</text>';
  }
  /* Joker */
  return '<circle cx="30" cy="40" r="19" fill="#7c3aed" opacity="0.12"/>' +
    '<text x="30" y="30" text-anchor="middle" font-size="13" font-weight="800" ' +
    'fill="#7c3aed">JO</text>' +
    '<text x="30" y="45" text-anchor="middle" font-size="13" font-weight="800" ' +
    'fill="#7c3aed">KE</text>' +
    '<text x="30" y="60" text-anchor="middle" font-size="13" font-weight="800" ' +
    'fill="#7c3aed">R</text>';
}

function tileSvg(id, opts) {
  opts = opts || {};
  var t = tileInfo(id);
  var label = '';
  if (opts.showLabel !== false) {
    var txt = '';
    if (t.kind === 'num') txt = t.rank + SUIT_NAME[t.suit][0];
    else if (t.kind === 'wind') txt = t.rank;
    else if (t.kind === 'dragon') txt = id === 'Dd' ? '0' : (id === 'Dc' ? 'R' : 'G');
    else if (t.kind === 'flower') txt = 'F';
    else txt = 'J';
    label = '<text x="7" y="13" font-size="9" font-weight="700" fill="#94a3b8">' + txt + '</text>';
  }
  return '<svg class="tile-svg" viewBox="0 0 60 80" role="img" aria-label="' + t.name + '">' +
    '<rect x="1" y="1" width="58" height="78" rx="7" fill="#fdfcf5" stroke="#d8d3c4" stroke-width="1.5"/>' +
    '<rect x="3.5" y="3.5" width="53" height="70" rx="5" fill="#fffefa" stroke="#eee9db"/>' +
    label + tileFaceSvg(id) + '</svg>';
}

/* ---------------------------------------------------------- hand patterns -- */
/*
   These are PRACTICE patterns written in National Mah Jongg League card
   notation. They are deliberately generic teaching examples — the real
   hands change every year and you must play from the current official card.

   Group shapes:
     {n: count, t: 'num',   v: 'n' | 'n+1' | <literal>, s: <suit slot 0..2>}
     {n: count, t: 'drag',  s: <suit slot>}       dragon matching that suit
     {n: count, t: 'soap'}                        white dragon used as 0
     {n: count, t: 'wind',  v: 'N'|'E'|'W'|'S'}
     {n: count, t: 'flower'}
   Suit slots are the card's COLORS: same slot = same suit, different slot =
   a different suit. `vars.n` lists the values the variable number may take.
*/

var PATTERNS = [
  {
    id: 'year-a',
    section: '2026',
    line: '2026 FFFF 22 6666',
    points: 25,
    concealed: false,
    note: 'The year, in one suit, with the Soap standing in for the 0. Two more ' +
      'groups, each in a different suit from the year and from each other.',
    groups: [
      { n: 1, t: 'num', v: 2, s: 0 }, { n: 1, t: 'soap', j: true },
      { n: 1, t: 'num', v: 2, s: 0, j: true }, { n: 1, t: 'num', v: 6, s: 0, j: true },
      { n: 4, t: 'flower' },
      { n: 2, t: 'num', v: 2, s: 1 },
      { n: 4, t: 'num', v: 6, s: 2 }
    ],
    slots: 3, vars: null
  },
  {
    id: 'year-b',
    section: '2026',
    line: 'FFFF 2026 DDD DDD',
    points: 25,
    concealed: false,
    note: 'Flowers, the year in one suit, and dragon pungs in the two other suits.',
    groups: [
      { n: 4, t: 'flower' },
      { n: 1, t: 'num', v: 2, s: 0 }, { n: 1, t: 'soap', j: true },
      { n: 1, t: 'num', v: 2, s: 0, j: true }, { n: 1, t: 'num', v: 6, s: 0, j: true },
      { n: 3, t: 'drag', s: 1 },
      { n: 3, t: 'drag', s: 2 }
    ],
    slots: 3, vars: null
  },
  {
    id: 'even-a',
    section: '2468',
    line: 'FF 2222 4444 6666',
    points: 25,
    concealed: false,
    note: 'Even numbers. The 2s and 4s share a suit; the 6s are a different suit.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 4, t: 'num', v: 2, s: 0 },
      { n: 4, t: 'num', v: 4, s: 0 },
      { n: 4, t: 'num', v: 6, s: 1 }
    ],
    slots: 2, vars: null
  },
  {
    id: 'even-b',
    section: '2468',
    line: '222 444 6666 8888',
    points: 30,
    concealed: false,
    note: 'Two pungs and two kongs of even numbers, in two different suits.',
    groups: [
      { n: 3, t: 'num', v: 2, s: 0 },
      { n: 3, t: 'num', v: 4, s: 0 },
      { n: 4, t: 'num', v: 6, s: 1 },
      { n: 4, t: 'num', v: 8, s: 1 }
    ],
    slots: 2, vars: null
  },
  {
    id: 'like-a',
    section: 'Like Numbers',
    line: 'FF 1111 1111 1111',
    any: 'any like numbers',
    points: 25,
    concealed: false,
    note: 'Pick any one number 1–9 and collect a kong of it in each of the three suits.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 4, t: 'num', v: 'n', s: 0 },
      { n: 4, t: 'num', v: 'n', s: 1 },
      { n: 4, t: 'num', v: 'n', s: 2 }
    ],
    slots: 3, vars: { n: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
  },
  {
    id: 'like-b',
    section: 'Like Numbers',
    line: 'NNN NNN NNN DDD DD',
    any: 'any like numbers',
    points: 30,
    concealed: false,
    note: 'One number in all three suits, plus a dragon pung and a dragon pair.',
    groups: [
      { n: 3, t: 'num', v: 'n', s: 0 },
      { n: 3, t: 'num', v: 'n', s: 1 },
      { n: 3, t: 'num', v: 'n', s: 2 },
      { n: 3, t: 'drag', s: 0 },
      { n: 2, t: 'drag', s: 1 }
    ],
    slots: 3, vars: { n: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
  },
  {
    id: 'run-a',
    section: 'Consecutive Run',
    line: 'FF 1111 2222 3333',
    any: 'any 3 consecutive numbers',
    points: 25,
    concealed: false,
    note: 'Any three consecutive numbers. The first two kongs share a suit; the ' +
      'third kong is a different suit.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 4, t: 'num', v: 'n', s: 0 },
      { n: 4, t: 'num', v: 'n+1', s: 0 },
      { n: 4, t: 'num', v: 'n+2', s: 1 }
    ],
    slots: 2, vars: { n: [1, 2, 3, 4, 5, 6, 7] }
  },
  {
    id: 'run-b',
    section: 'Consecutive Run',
    line: '111 222 3333 4444',
    any: 'any 4 consecutive numbers',
    points: 30,
    concealed: false,
    note: 'Four consecutive numbers: two pungs in one suit, two kongs in another.',
    groups: [
      { n: 3, t: 'num', v: 'n', s: 0 },
      { n: 3, t: 'num', v: 'n+1', s: 0 },
      { n: 4, t: 'num', v: 'n+2', s: 1 },
      { n: 4, t: 'num', v: 'n+3', s: 1 }
    ],
    slots: 2, vars: { n: [1, 2, 3, 4, 5, 6] }
  },
  {
    id: 'odd-a',
    section: '13579',
    line: 'FF 1111 3333 5555',
    points: 25,
    concealed: false,
    note: 'Odd numbers. The 1s and 3s share a suit; the 5s are a different suit.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 4, t: 'num', v: 1, s: 0 },
      { n: 4, t: 'num', v: 3, s: 0 },
      { n: 4, t: 'num', v: 5, s: 1 }
    ],
    slots: 2, vars: null
  },
  {
    id: 'odd-b',
    section: '13579',
    line: '111 333 5555 7777',
    points: 30,
    concealed: false,
    note: 'Odd numbers across two suits — two pungs, then two kongs.',
    groups: [
      { n: 3, t: 'num', v: 1, s: 0 },
      { n: 3, t: 'num', v: 3, s: 0 },
      { n: 4, t: 'num', v: 5, s: 1 },
      { n: 4, t: 'num', v: 7, s: 1 }
    ],
    slots: 2, vars: null
  },
  {
    id: 'wd-a',
    section: 'Winds & Dragons',
    line: 'NNN EEE WWW SSS DD',
    points: 30,
    concealed: false,
    note: 'A pung of each wind plus a dragon pair. Winds have no suit, so no ' +
      'colors to match here.',
    groups: [
      { n: 3, t: 'wind', v: 'N' },
      { n: 3, t: 'wind', v: 'E' },
      { n: 3, t: 'wind', v: 'W' },
      { n: 3, t: 'wind', v: 'S' },
      { n: 2, t: 'drag', s: 0 }
    ],
    slots: 1, vars: null
  },
  {
    id: 'wd-b',
    section: 'Winds & Dragons',
    line: 'FF DDDD DDDD DDDD',
    points: 30,
    concealed: false,
    note: 'A dragon kong in each suit: green (Bams), red (Craks) and soap (Dots).',
    groups: [
      { n: 2, t: 'flower' },
      { n: 4, t: 'drag', s: 0 },
      { n: 4, t: 'drag', s: 1 },
      { n: 4, t: 'drag', s: 2 }
    ],
    slots: 3, vars: null
  },
  {
    id: '369-a',
    section: '369',
    line: 'FF 3333 6666 9999',
    points: 25,
    concealed: false,
    note: 'Threes, sixes and nines — 3s and 6s in one suit, 9s in another.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 4, t: 'num', v: 3, s: 0 },
      { n: 4, t: 'num', v: 6, s: 0 },
      { n: 4, t: 'num', v: 9, s: 1 }
    ],
    slots: 2, vars: null
  },
  {
    id: '369-b',
    section: '369',
    line: '333 666 999 DDDDD',
    points: 40,
    concealed: false,
    note: 'A quint (five tiles) of dragons — impossible without jokers, since ' +
      'only four of each dragon exist.',
    groups: [
      { n: 3, t: 'num', v: 3, s: 0 },
      { n: 3, t: 'num', v: 6, s: 1 },
      { n: 3, t: 'num', v: 9, s: 2 },
      { n: 5, t: 'drag', s: 0 }
    ],
    slots: 3, vars: null
  },
  {
    id: 'quint-a',
    section: 'Quints',
    line: 'FFFF 11111 22222',
    any: 'any 2 consecutive numbers',
    points: 40,
    concealed: false,
    note: 'Two quints of consecutive numbers in the same suit, plus four flowers.',
    groups: [
      { n: 4, t: 'flower' },
      { n: 5, t: 'num', v: 'n', s: 0 },
      { n: 5, t: 'num', v: 'n+1', s: 0 }
    ],
    slots: 1, vars: { n: [1, 2, 3, 4, 5, 6, 7, 8] }
  },
  {
    id: 'sp-a',
    section: 'Singles & Pairs',
    line: 'FF 11 22 33 44 55 66',
    any: 'any 6 consecutive numbers',
    points: 50,
    concealed: true,
    note: 'Concealed, and every group is a pair — so no jokers anywhere in this ' +
      'hand, and you can never call a discard except for mah jongg itself.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 2, t: 'num', v: 'n', s: 0 },
      { n: 2, t: 'num', v: 'n+1', s: 0 },
      { n: 2, t: 'num', v: 'n+2', s: 1 },
      { n: 2, t: 'num', v: 'n+3', s: 1 },
      { n: 2, t: 'num', v: 'n+4', s: 2 },
      { n: 2, t: 'num', v: 'n+5', s: 2 }
    ],
    slots: 3, vars: { n: [1, 2, 3, 4] }
  },
  {
    id: 'sp-b',
    section: 'Singles & Pairs',
    line: 'NN EE WW SS DD DD FF',
    points: 50,
    concealed: true,
    note: 'Seven pairs: all four winds, two different dragons, and flowers. ' +
      'Concealed and jokerless.',
    groups: [
      { n: 2, t: 'wind', v: 'N' },
      { n: 2, t: 'wind', v: 'E' },
      { n: 2, t: 'wind', v: 'W' },
      { n: 2, t: 'wind', v: 'S' },
      { n: 2, t: 'drag', s: 0 },
      { n: 2, t: 'drag', s: 1 },
      { n: 2, t: 'flower' }
    ],
    slots: 2, vars: null
  },
  {
    id: 'conceal-a',
    section: 'Concealed',
    line: 'FF 1111 1111 DDDD',
    any: 'any like numbers',
    points: 35,
    concealed: true,
    note: 'Concealed: build it entirely from your own draws. Jokers are still ' +
      'fine in the kongs — the concealed rule limits calling, not jokers.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 4, t: 'num', v: 'n', s: 0 },
      { n: 4, t: 'num', v: 'n', s: 1 },
      { n: 4, t: 'drag', s: 2 }
    ],
    slots: 3, vars: { n: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
  }
];

/* -------------------------------------------------- printing a card line -- */
/* The printed line is derived from the groups, so the notation shown can never
   drift from what the matcher actually requires. Groups flagged `j` print
   joined to the previous group (that is how "2026" reads as one run). */

function repeatStr(s, n) { var o = ''; for (var i = 0; i < n; i++) o += s; return o; }

function patternTokens(p) {
  var base = p.vars ? p.vars.n[0] : 0;
  var toks = [];
  p.groups.forEach(function (g) {
    var txt, slot = null;
    if (g.t === 'flower') txt = repeatStr('F', g.n);
    else if (g.t === 'soap') txt = repeatStr('0', g.n);
    else if (g.t === 'wind') txt = repeatStr(g.v, g.n);
    else if (g.t === 'drag') { txt = repeatStr('D', g.n); slot = g.s; }
    else { txt = repeatStr(String(evalNum(g.v, base)), g.n); slot = g.s; }
    if (g.j && toks.length) toks[toks.length - 1].txt += txt;
    else toks.push({ txt: txt, slot: slot, g: g });
  });
  return toks;
}

function patternLineText(p) {
  return patternTokens(p).map(function (t) { return t.txt; }).join(' ');
}

/* ------------------------------------------------------------- matching -- */

function evalNum(v, n) {
  if (typeof v === 'number') return v;
  if (v === 'n') return n;
  var m = /^n\+(\d+)$/.exec(v);
  if (m) return n + parseInt(m[1], 10);
  return NaN;
}

/* All ordered ways to assign real suits to the pattern's colour slots. */
function suitAssignments(slots) {
  var out = [];
  var s = SUITS;
  if (slots <= 1) { s.forEach(function (a) { out.push([a]); }); return out; }
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      if (j === i) continue;
      if (slots === 2) { out.push([s[i], s[j]]); continue; }
      for (var k = 0; k < 3; k++) {
        if (k === i || k === j) continue;
        out.push([s[i], s[j], s[k]]);
      }
    }
  }
  return out;
}

/* Turn a pattern + one assignment into the exact tiles it needs. */
function materialize(pattern, n, suits) {
  var req = [];
  var ok = true;
  pattern.groups.forEach(function (g) {
    var id;
    if (g.t === 'flower') id = 'F';
    else if (g.t === 'soap') id = 'Dd';
    else if (g.t === 'wind') id = 'w' + g.v;
    else if (g.t === 'drag') id = DRAGON_OF[suits[g.s] || suits[0]];
    else {
      var num = evalNum(g.v, n);
      if (num < 1 || num > 9) { ok = false; return; }
      id = (suits[g.s] || suits[0]) + num;
    }
    /* merge groups that ask for the same tile (e.g. the two 2s in "2026") */
    var found = null;
    for (var i = 0; i < req.length; i++) if (req[i].id === id) found = req[i];
    if (found) {
      found.count += g.n;
      found.jokerOK = found.jokerOK || g.n >= 3;
    } else {
      req.push({ id: id, count: g.n, jokerOK: g.n >= 3 });
    }
  });
  if (!ok) return null;
  /* A tile only exists four times (flowers eight, jokers eight). */
  for (var i = 0; i < req.length; i++) {
    var cap = req[i].id === 'F' ? 8 : 4;
    if (req[i].count > cap && !req[i].jokerOK) return null;
  }
  return ok ? req : null;
}

function counts(ids) {
  var c = {};
  ids.forEach(function (t) { c[t] = (c[t] || 0) + 1; });
  return c;
}

/* How close is this hand to this exact set of required tiles? */
function scoreAgainst(handCounts, req) {
  var avail = {}, k;
  for (k in handCounts) avail[k] = handCounts[k];
  var matched = 0, jokerCapacity = 0, missing = [];
  req.forEach(function (r) {
    var have = Math.min(avail[r.id] || 0, r.count);
    avail[r.id] = (avail[r.id] || 0) - have;
    matched += have;
    var short = r.count - have;
    if (short > 0) {
      missing.push({ id: r.id, count: short, jokerOK: r.jokerOK });
      if (r.jokerOK) jokerCapacity += short;
    }
  });
  var jokers = avail.J || 0;
  var jokersUsed = Math.min(jokers, jokerCapacity);
  matched += jokersUsed;
  return { matched: matched, missing: missing, jokersUsed: jokersUsed };
}

/* Best score for one pattern over every legal assignment. */
function bestForPattern(handCounts, pattern) {
  var best = null;
  var ns = pattern.vars ? pattern.vars.n : [0];
  var assigns = suitAssignments(pattern.slots);
  ns.forEach(function (n) {
    assigns.forEach(function (suits) {
      var req = materialize(pattern, n, suits);
      if (!req) return;
      var s = scoreAgainst(handCounts, req);
      if (!best || s.matched > best.matched) {
        best = {
          pattern: pattern, n: n, suits: suits, req: req,
          matched: s.matched, missing: s.missing, jokersUsed: s.jokersUsed,
          away: 14 - s.matched
        };
      }
    });
  });
  return best;
}

/* Rank every practice pattern against a rack. */
function analyzeHand(ids) {
  var hc = counts(ids);
  var out = [];
  PATTERNS.forEach(function (p) {
    var b = bestForPattern(hc, p);
    if (b) out.push(b);
  });
  out.sort(function (a, b) {
    if (b.matched !== a.matched) return b.matched - a.matched;
    return b.pattern.points - a.pattern.points;
  });
  return out;
}

/* A human-readable "what this hand needs" string. */
function describeAssignment(res) {
  var bits = [];
  if (res.pattern.vars) bits.push('number = ' + res.n);
  var used = {}, order = [];
  res.pattern.groups.forEach(function (g) {
    if ((g.t === 'num' || g.t === 'drag') && g.s !== undefined && !used[g.s]) {
      used[g.s] = true; order.push(g.s);
    }
  });
  order.sort().forEach(function (slot) {
    bits.push('colour ' + (slot + 1) + ' = ' + SUIT_NAME[res.suits[slot]] + 's');
  });
  return bits.join(', ');
}

function missingText(res) {
  if (!res.missing.length) return 'complete';
  return res.missing.map(function (m) {
    return m.count + '× ' + tileName(m.id);
  }).join(', ');
}

/* Rank tiles from least to most useful — the Charleston / discard advisor.
   Jokers are always ranked most useful and can never be passed.

   The weights matter: spreading them evenly across several candidate lines
   makes a player hedge, and a hedging hand never closes. Weighting the best
   line heavily is what real players do — commit to one hand and throw
   everything that does not serve it, keeping the runners-up only as a
   tiebreak. */
var TOP_WEIGHTS = [1, 0.3, 0.1];

function rankTilesByUsefulness(ids) {
  var top = analyzeHand(ids).slice(0, TOP_WEIGHTS.length);
  var scored = ids.map(function (t, idx) {
    if (t === 'J') return { tile: t, idx: idx, value: 99 };
    var without = ids.slice(); without.splice(idx, 1);
    var loss = 0;
    top.forEach(function (res, rank) {
      var b = bestForPattern(counts(without), res.pattern);
      loss += (res.matched - (b ? b.matched : 0)) * TOP_WEIGHTS[rank];
    });
    return { tile: t, idx: idx, value: loss };
  });
  scored.sort(function (a, b) { return a.value - b.value; });
  return scored;
}

/* A second batch of practice hands. A real card carries roughly seventy lines,
   and that breadth is the reason real games actually close — with only a
   handful of targets almost every hand ends as a wall game. These are grouped
   into the same sections as the hands above. */
PATTERNS.push(
  {
    id: 'year-c',
    section: '2026',
    line: '', points: 30, concealed: false,
    note: 'The year plus a dragon kong in each of the other two suits.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 1, t: 'num', v: 2, s: 0 }, { n: 1, t: 'soap', j: true },
      { n: 1, t: 'num', v: 2, s: 0, j: true }, { n: 1, t: 'num', v: 6, s: 0, j: true },
      { n: 4, t: 'drag', s: 1 },
      { n: 4, t: 'drag', s: 2 }
    ],
    slots: 3, vars: null
  },
  {
    id: 'even-c',
    section: '2468',
    line: '', points: 25, concealed: false,
    note: 'Skipping the 6s. The 2s and 4s share a suit, the 8s are elsewhere.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 4, t: 'num', v: 2, s: 0 },
      { n: 4, t: 'num', v: 4, s: 0 },
      { n: 4, t: 'num', v: 8, s: 1 }
    ],
    slots: 2, vars: null
  },
  {
    id: 'even-d',
    section: '2468',
    line: '', points: 35, concealed: false,
    note: 'Three even pairs in one suit, a kong of 8s in another, and a dragon ' +
      'kong in the third. The pairs take no jokers.',
    groups: [
      { n: 2, t: 'num', v: 2, s: 0 },
      { n: 2, t: 'num', v: 4, s: 0 },
      { n: 2, t: 'num', v: 6, s: 0 },
      { n: 4, t: 'num', v: 8, s: 1 },
      { n: 4, t: 'drag', s: 2 }
    ],
    slots: 3, vars: null
  },
  {
    id: 'run-c',
    section: 'Consecutive Run',
    line: '', points: 35, concealed: false,
    any: 'any 4 consecutive numbers',
    note: 'Four consecutive numbers: the low two as pairs in one suit, the high ' +
      'two as kongs in another, plus a dragon pair.',
    groups: [
      { n: 2, t: 'num', v: 'n', s: 0 },
      { n: 2, t: 'num', v: 'n+1', s: 0 },
      { n: 4, t: 'num', v: 'n+2', s: 1 },
      { n: 4, t: 'num', v: 'n+3', s: 1 },
      { n: 2, t: 'drag', s: 2 }
    ],
    slots: 3, vars: { n: [1, 2, 3, 4, 5, 6] }
  },
  {
    id: 'like-c',
    section: 'Like Numbers',
    line: '', points: 30, concealed: false,
    any: 'any like numbers',
    note: 'One number, kongs in two suits and a pair in the third, with four flowers.',
    groups: [
      { n: 4, t: 'flower' },
      { n: 4, t: 'num', v: 'n', s: 0 },
      { n: 4, t: 'num', v: 'n', s: 1 },
      { n: 2, t: 'num', v: 'n', s: 2 }
    ],
    slots: 3, vars: { n: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
  },
  {
    id: 'odd-c',
    section: '13579',
    line: '', points: 25, concealed: false,
    note: 'The high odds. 5s and 7s share a suit; the 9s are a different suit.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 4, t: 'num', v: 5, s: 0 },
      { n: 4, t: 'num', v: 7, s: 0 },
      { n: 4, t: 'num', v: 9, s: 1 }
    ],
    slots: 2, vars: null
  },
  {
    id: 'odd-d',
    section: '13579',
    line: '', points: 40, concealed: false,
    note: 'Every odd number as a pair in one suit, plus a dragon kong. Five ' +
      'joker-proof pairs make this a slow hand.',
    groups: [
      { n: 2, t: 'num', v: 1, s: 0 },
      { n: 2, t: 'num', v: 3, s: 0 },
      { n: 2, t: 'num', v: 5, s: 0 },
      { n: 2, t: 'num', v: 7, s: 0 },
      { n: 2, t: 'num', v: 9, s: 0 },
      { n: 4, t: 'drag', s: 1 }
    ],
    slots: 2, vars: null
  },
  {
    id: 'wd-c',
    section: 'Winds & Dragons',
    line: '', points: 30, concealed: false,
    note: 'Three wind kongs and a pair — no suits involved at all, so no colours ' +
      'to match.',
    groups: [
      { n: 4, t: 'wind', v: 'N' },
      { n: 4, t: 'wind', v: 'E' },
      { n: 4, t: 'wind', v: 'W' },
      { n: 2, t: 'wind', v: 'S' }
    ],
    slots: 1, vars: null
  },
  {
    id: 'wd-d',
    section: 'Winds & Dragons',
    line: '', points: 35, concealed: false,
    note: 'Two wind kongs bracketed by pairs, finished with a dragon pair.',
    groups: [
      { n: 2, t: 'wind', v: 'N' },
      { n: 4, t: 'wind', v: 'E' },
      { n: 4, t: 'wind', v: 'W' },
      { n: 2, t: 'wind', v: 'S' },
      { n: 2, t: 'drag', s: 0 }
    ],
    slots: 1, vars: null
  },
  {
    id: '369-c',
    section: '369',
    line: '', points: 30, concealed: false,
    note: 'Threes and nines in two suits with a dragon kong in the third.',
    groups: [
      { n: 2, t: 'flower' },
      { n: 4, t: 'num', v: 3, s: 0 },
      { n: 4, t: 'num', v: 9, s: 1 },
      { n: 4, t: 'drag', s: 2 }
    ],
    slots: 3, vars: null
  },
  {
    id: 'quint-b',
    section: 'Quints',
    line: '', points: 45, concealed: false,
    any: 'any number',
    note: 'A quint of any number and a quint of dragons — both impossible without ' +
      'jokers, so only chase this when you are joker-rich.',
    groups: [
      { n: 4, t: 'flower' },
      { n: 5, t: 'num', v: 'n', s: 0 },
      { n: 5, t: 'drag', s: 1 }
    ],
    slots: 2, vars: { n: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
  },
  {
    id: 'sp-c',
    section: 'Singles & Pairs',
    line: '', points: 50, concealed: true,
    note: 'Seven pairs again: every odd number in one suit, a dragon pair, and ' +
      'flowers. Concealed and completely jokerless.',
    groups: [
      { n: 2, t: 'num', v: 1, s: 0 },
      { n: 2, t: 'num', v: 3, s: 0 },
      { n: 2, t: 'num', v: 5, s: 0 },
      { n: 2, t: 'num', v: 7, s: 0 },
      { n: 2, t: 'num', v: 9, s: 0 },
      { n: 2, t: 'drag', s: 1 },
      { n: 2, t: 'flower' }
    ],
    slots: 2, vars: null
  },
  {
    id: 'conceal-b',
    section: 'Concealed',
    line: '', points: 40, concealed: true,
    any: 'any number',
    note: 'Two wind kongs and a number kong with its pair — concealed, so every ' +
      'tile must come from your own draws.',
    groups: [
      { n: 4, t: 'wind', v: 'N' },
      { n: 4, t: 'wind', v: 'S' },
      { n: 4, t: 'num', v: 'n', s: 0 },
      { n: 2, t: 'num', v: 'n', s: 1 }
    ],
    slots: 2, vars: { n: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
  }
);

/* Keep every pattern's printed line in sync with its groups. */
PATTERNS.forEach(function (p) { p.line = patternLineText(p); });

/* ------------------------------------------------------------ utilities -- */

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* Deal a plausible "mid-game" rack: mostly random, but nudged toward a real
   pattern so drills feel like real hands instead of noise. */
function dealPracticeRack(size, targetMatched) {
  size = size || 13;
  var pattern = pickRandom(PATTERNS);
  var n = pattern.vars ? pickRandom(pattern.vars.n) : 0;
  var suits = pickRandom(suitAssignments(pattern.slots));
  var req = materialize(pattern, n, suits);
  var deck = shuffle(buildDeck());
  var hand = [];
  var want = targetMatched !== undefined ? targetMatched : 5 + Math.floor(Math.random() * 4);
  if (req) {
    var pool = [];
    req.forEach(function (r) {
      for (var i = 0; i < r.count; i++) pool.push(r.id);
    });
    pool = shuffle(pool).slice(0, want);
    pool.forEach(function (id) {
      var k = deck.indexOf(id);
      if (k >= 0) { hand.push(deck.splice(k, 1)[0]); }
    });
  }
  while (hand.length < size) hand.push(deck.pop());
  return sortTiles(hand.slice(0, size));
}
