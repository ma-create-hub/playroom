/* =========================================================================
   content.js — lesson text, glossary, and quiz banks.
   Rules described are American mah jongg as published by the National Mah
   Jongg League (NMJL). Where tables commonly vary, the lesson says so.
   ========================================================================= */

var LESSONS = [
  {
    id: 'what',
    title: 'What makes it "American"',
    minutes: 3,
    body: `
<p>American mah jongg is its own game. It shares the tiles with Chinese mah
jongg, but almost nothing else. If you already know the Chinese game, the
habits to unlearn are listed at the bottom.</p>

<h3>The one idea that explains everything</h3>
<p>In American mah jongg you do <strong>not</strong> invent your own winning
hand. Every year the National Mah Jongg League publishes a
<strong>card</strong> — a folded paper listing roughly 50–70 specific
14&#8209;tile hands. Your hand must match <em>one line on that card,
exactly</em>. Nothing else wins.</p>

<p>So the whole game is: get dealt 13 tiles, guess which of the card's lines
you can most plausibly reach, and then trade your way there before three other
people reach theirs.</p>

<div class="callout">
<strong>You need the current card to play for real.</strong> The hands change
every single year, and the old card is worthless the moment the new one
arrives. Cards are sold by the National Mah Jongg League
(<span class="mono">nationalmahjonggleague.org</span>) for a few dollars.
This app teaches the rules, the notation, and the strategy using generic
practice hands written in card notation — it is not a copy of the card.
</div>

<h3>The shape of a game</h3>
<ol>
<li>Build the walls, roll, deal. Everyone gets 13 tiles; the dealer gets 14.</li>
<li><strong>The Charleston</strong> — a fixed sequence of blind tile swaps
before play starts. This is unique to the American game and it is where hands
are really made.</li>
<li>Play: draw a tile, discard a tile, going around the table. Discards can be
claimed by anyone to build an exposure.</li>
<li>Someone completes a card hand and calls <em>"Mah Jongg"</em>, or the wall
runs out and the game is a wash.</li>
</ol>

<h3>If you know the Chinese game</h3>
<ul>
<li>There are <strong>jokers</strong> — eight of them, and they change everything.</li>
<li>There are <strong>no chows</strong> (no runs of 1&#8209;2&#8209;3 as a group).
Groups are pairs, pungs (3), kongs (4), quints (5) and singles, and they must
come straight off the card.</li>
<li>You may claim a discard from <em>any</em> player, not just the one on your left.</li>
<li>You never build your own hand from scratch, and there is no fan/points
calculation — each card line has a fixed value printed next to it.</li>
</ul>
`
  },

  {
    id: 'tiles',
    title: 'The 152 tiles',
    minutes: 4,
    body: `
<p>An American set has <strong>152 tiles</strong>. Learn them in five groups.</p>

<div class="tile-lesson" data-tiles="b1,b2,b3,b4,b5,b6,b7,b8,b9"></div>
<p><strong>Bams</strong> (bamboo), 1–9, four of each. The 1 Bam is a bird, which
throws everyone at first. Bams are the <em>green</em> suit.</p>

<div class="tile-lesson" data-tiles="c1,c2,c3,c4,c5,c6,c7,c8,c9"></div>
<p><strong>Craks</strong> (characters), 1–9, four of each. The Chinese numeral is
on top, the character 萬 below. Craks are the <em>red</em> suit.</p>

<div class="tile-lesson" data-tiles="d1,d2,d3,d4,d5,d6,d7,d8,d9"></div>
<p><strong>Dots</strong> (circles), 1–9, four of each. Count the circles. Dots
are the <em>blue</em> suit.</p>

<div class="tile-lesson" data-tiles="wN,wE,wW,wS"></div>
<p><strong>Winds</strong> — North, East, West, South, four of each (16 tiles).
Winds have no suit, so they never have to match a colour on the card.</p>

<div class="tile-lesson" data-tiles="Db,Dc,Dd"></div>
<p><strong>Dragons</strong>, four of each (12 tiles). Each dragon belongs to a
suit, and this matters enormously when reading the card:</p>
<ul>
<li><strong>Green dragon</strong> (發) belongs to <strong>Bams</strong></li>
<li><strong>Red dragon</strong> (中) belongs to <strong>Craks</strong></li>
<li><strong>White dragon</strong> — the <strong>Soap</strong> — belongs to
<strong>Dots</strong>. It also does double duty as the digit <strong>0</strong>
in year hands.</li>
</ul>

<div class="tile-lesson" data-tiles="F,J"></div>
<p><strong>Flowers</strong> — 8 tiles. In the American game all eight flowers are
identical for play; art varies but any flower matches any other.</p>
<p><strong>Jokers</strong> — 8 tiles. Wild, with strict limits (its own lesson).</p>

<p class="tally">9×3 suits ×4 = 108 &nbsp;+&nbsp; 16 winds &nbsp;+&nbsp;
12 dragons &nbsp;+&nbsp; 8 flowers &nbsp;+&nbsp; 8 jokers &nbsp;=&nbsp;
<strong>152</strong></p>
`
  },

  {
    id: 'setup',
    title: 'Setting up and dealing',
    minutes: 3,
    body: `
<h3>Seats</h3>
<p>Four players. The seats are named for winds — <strong>East, South, West,
North</strong> — and play moves <strong>counter&#8209;clockwise</strong>, i.e. to
your <em>right</em>. East is the dealer.</p>

<h3>The wall</h3>
<p>Shuffle face down, then each player stacks <strong>19 tiles two high</strong>
in front of themselves — 38 tiles each, 152 in all — and pushes the wall
forward into a square.</p>

<h3>Break and deal</h3>
<ol>
<li>East rolls the dice; the count decides where the wall is broken.</li>
<li>Deal <strong>four tiles at a time</strong>, counter-clockwise, three times
around (everyone now has 12).</li>
<li>Then one tile each around the table — everyone has 13, and
<strong>East takes one extra</strong>, ending with 14.</li>
</ol>

<p>Stand your tiles on your rack facing you. Sort them: suits together in
number order, then winds, dragons, flowers, jokers. A sorted rack is how you
spot which card lines you are near.</p>

<h3>Who deals next</h3>
<p>The most common convention: if <strong>East wins</strong>, East deals again;
otherwise the deal passes to the right, so everyone gets a turn as East. A
<strong>wall game</strong> (nobody wins) is usually re-dealt by the same East.
Agree on this before you start — tables genuinely differ.</p>
`
  },

  {
    id: 'charleston',
    title: 'The Charleston',
    minutes: 6,
    body: `
<p>Before anyone draws a tile, all four players pass tiles around in a fixed
sequence. This is the <strong>Charleston</strong>, and it is the most American
part of the game — you will win or lose here more often than during play.</p>

<h3>First Charleston — required</h3>
<ol>
<li>Pass <strong>3 tiles right</strong></li>
<li>Pass <strong>3 tiles across</strong></li>
<li>Pass <strong>3 tiles left</strong></li>
</ol>
<p>Every pass is exactly three tiles, face down, all at once. You pick up what
you were given before the next pass.</p>

<h3>Second Charleston — optional</h3>
<p>Mirror image: <strong>left, across, right</strong>. It only happens if
<em>everyone</em> agrees. Any single player may stop it — if your hand is
already coming together you say so and the table skips it.</p>

<h3>The courtesy pass</h3>
<p>After the Charleston(s), you and the player <strong>across</strong> from you
may swap <strong>up to three tiles</strong> — but both of you must pass the same
number, so it is the smaller of the two offers. "One?" "Two." → you each pass
two. You may also pass none.</p>

<h3>The two rules people get wrong</h3>
<div class="callout">
<p><strong>Jokers may never be passed</strong> in any Charleston pass or the
courtesy pass. Flowers may be passed, and often should be.</p>
<p><strong>The last pass of each Charleston may be blind.</strong> On the third
pass, you may take up to three of the tiles just handed to you and pass them
straight on <em>without looking</em>. That is how you get out of "I have
nothing I can bear to give away."</p>
</div>

<h3>How to actually choose three tiles</h3>
<ul>
<li>Count your suits. You will usually end up in one or two suits, so start
throwing the third one away — its singletons first.</li>
<li>Keep <strong>every joker</strong>, obviously, and keep pairs. A pair is one
tile from a pung and two from a kong.</li>
<li>Flowers are worth keeping <em>early</em> (many card hands want two or four)
but they are the first thing to dump if your hand is going nowhere near them.</li>
<li>Winds and dragons are cheap to hold in the first pass and expensive later —
decide by the third pass whether you are in a winds-and-dragons hand or not.</li>
<li><strong>Do not pass what you might be given back.</strong> A tile passed
right can come back around; passing three of one number to a neighbour helps
them build the very pung you wanted.</li>
<li>By the end of the Charleston you should have <em>picked a section of the
card</em> and be down to one or two candidate lines.</li>
</ul>

<p class="try-hint">Practise this in <strong>Drills → Charleston</strong>, then
in the <strong>Practice Table</strong>.</p>
`
  },

  {
    id: 'card',
    title: 'Reading the card',
    minutes: 6,
    body: `
<p>A card line looks like this:</p>
<p class="card-line-demo"><span class="ccx">FF</span>
<span class="cc1">2222</span> <span class="cc1">4444</span>
<span class="cc2">6666</span> &nbsp;<span class="pts">X&nbsp;&nbsp;25</span></p>
<p style="font-size:13px;color:var(--muted);margin-top:-4px">Flowers are printed
in black here because they have no suit — only the coloured groups carry the
suit rule.</p>

<p>Read it left to right as groups of identical tiles:</p>
<table class="ref">
<tr><th>What you see</th><th>What it means</th></tr>
<tr><td class="mono">1</td><td>a <strong>single</strong> tile</td></tr>
<tr><td class="mono">11</td><td>a <strong>pair</strong> — 2 tiles</td></tr>
<tr><td class="mono">111</td><td>a <strong>pung</strong> — 3 tiles</td></tr>
<tr><td class="mono">1111</td><td>a <strong>kong</strong> — 4 tiles</td></tr>
<tr><td class="mono">11111</td><td>a <strong>quint</strong> — 5 tiles (needs jokers)</td></tr>
<tr><td class="mono">F</td><td>flower</td></tr>
<tr><td class="mono">D</td><td>dragon — <em>the dragon belonging to that group's suit</em></td></tr>
<tr><td class="mono">0</td><td>the Soap (white dragon), used as zero in year hands</td></tr>
<tr><td class="mono">N E W S</td><td>the winds, exactly as written</td></tr>
<tr><td class="mono">X</td><td>this hand may be <strong>exposed</strong></td></tr>
<tr><td class="mono">C</td><td>this hand must be <strong>concealed</strong></td></tr>
<tr><td class="mono">25</td><td>what the hand pays</td></tr>
</table>

<h3>Colour is the suit rule</h3>
<p>This is the part that trips up every beginner. The card prints groups in
three colours, and the colours are <em>relative</em>:</p>
<ul>
<li>Groups printed in the <strong>same colour must be the same suit</strong>.</li>
<li>Groups printed in <strong>different colours must be different suits</strong>.</li>
<li>Which real suit you use is <strong>your choice</strong> — the card's red
does not mean Craks. In the example above, the 2s and 4s must share one suit
and the 6s must be a different suit; Dots/Dots/Bams and Craks/Craks/Dots are
both fine.</li>
</ul>
<p>Winds, flowers and jokers have no suit, so colour never constrains them.
Dragons <em>do</em> follow the colour: a dragon in the same colour group as
your Bams must be the green dragon.</p>

<h3>Every line is exactly 14 tiles</h3>
<p>Count the characters and you always get 14 — that is the hand you show when
you win. You hold 13 and win on the 14th, either by drawing it or by claiming
someone's discard.</p>

<h3>"Any" lines</h3>
<p>Many lines carry a phrase like <em>any 3 consecutive numbers</em>,
<em>any like numbers</em>, or <em>any 2 consecutive numbers</em>. Those let you
slide the pattern up and down: <span class="mono">FF 1111 2222 3333</span> as
"any 3 consecutive" also covers 4-5-6 and 7-8-9. Sliding a hand up or down one
number is often the cheapest way to rescue it mid-game.</p>

<p class="try-hint">The <strong>Card</strong> tab has practice lines you can
expand into real tiles and re-colour, so you can see exactly what each line
asks for.</p>
`
  },

  {
    id: 'play',
    title: 'Playing a turn',
    minutes: 5,
    body: `
<h3>The basic loop</h3>
<p>East, holding 14 tiles, discards first — <strong>naming the tile out loud</strong>
("Three Bam"). Then, going to the right, each player in turn:</p>
<ol>
<li><strong>Draws</strong> the next tile from the wall, and</li>
<li><strong>Discards</strong> one tile face up in the middle, naming it.</li>
</ol>
<p>You always end your turn holding 13 tiles (plus anything exposed).</p>

<h3>Claiming a discard</h3>
<p>Any player — not just the next one — may claim the tile just discarded.
Call <em>"Take"</em> / <em>"Wait"</em> immediately, before the next player has
drawn from the wall. Then:</p>
<ul>
<li>Take the discard and lay it face up on top of your rack together with the
matching tiles from your hand, forming a complete <strong>pung, kong or
quint</strong> — an <strong>exposure</strong>.</li>
<li>Discard a tile of your own.</li>
<li>Play resumes to <em>your</em> right. Players between the discarder and you
simply lose that turn.</li>
</ul>

<div class="callout">
<p><strong>You can only claim a discard to make a group of three or more</strong>
— never to complete a pair or a single. The one exception: you may claim
<em>any</em> discard, including for a pair or single, if it completes your hand
for mah jongg.</p>
<p><strong>Exposures are commitments.</strong> The exposure must match a group in
a real hand on the card, and once it is down it cannot be taken back or
rearranged. Everyone can see it, and good players will read your hand from it
and stop feeding you.</p>
</div>

<h3>Concealed hands</h3>
<p>A line marked <strong>C</strong> must be built entirely from your own draws
and Charleston tiles — you may not claim discards for it along the way. You
<em>may</em> still claim the final tile to declare mah jongg.</p>

<h3>Reading the table</h3>
<ul>
<li>Watch exposures. Three exposed flowers across the table means the flowers
you are holding are worth less than you think.</li>
<li>Watch discards. Late-game, a tile nobody has discarded is probably being
held; a tile discarded three times is safe.</li>
<li>Late in a game, discarding a tile that completes someone's obvious exposure
is how you hand over the win — and if you throw the winning tile, you pay double.</li>
</ul>
`
  },

  {
    id: 'jokers',
    title: 'Jokers',
    minutes: 4,
    body: `
<p>Eight jokers, and they are the currency of the American game.</p>

<h3>What a joker can do</h3>
<p>A joker substitutes for any tile inside a group of <strong>three or
more</strong> — a pung, kong, quint or sextet.</p>

<h3>What a joker can never do</h3>
<ul>
<li><strong>Never a single. Never a pair.</strong> If a card line has
<span class="mono">FF 11 22 33 …</span>, no joker can touch any of it — that is
why Singles &amp; Pairs hands pay so much.</li>
<li><strong>Never passed in the Charleston</strong>, or in the courtesy pass.</li>
</ul>

<h3>Joker exchange (redemption)</h3>
<p>This is the rule that makes jokers flow around the table. On your turn, if a
joker is sitting in <em>anyone's</em> exposure — yours or an opponent's — and you
hold the real tile it is standing in for, you may swap: put your real tile into
their exposure and take the joker into your hand.</p>
<ul>
<li>Only on your own turn, and before you discard.</li>
<li>You may do it as many times as you can in one turn.</li>
<li>Jokers hidden in someone's concealed hand are untouchable — only exposed
jokers can be redeemed.</li>
<li>Once someone declares mah jongg, no more exchanges.</li>
</ul>

<h3>Discarding a joker</h3>
<p>Legal, and occasionally correct — usually at the very end when you are
defending and hold a joker that can no longer help. A discarded joker
<strong>cannot be claimed by anyone</strong>; it is dead. Naming it ("Joker")
is expected.</p>

<h3>Practical joker sense</h3>
<ul>
<li>Two jokers turn a hopeless kong into a formality. Chase kong-heavy lines
when you are joker-rich.</li>
<li>Joker-poor? Prefer lines that ask for pairs and singles you can actually
collect, or lines with fewer big groups.</li>
<li>Exposing a group that contains a joker invites opponents to redeem it. If
you can wait, wait.</li>
</ul>
`
  },

  {
    id: 'winning',
    title: 'Winning, dead hands, wall games',
    minutes: 4,
    body: `
<h3>Declaring mah jongg</h3>
<p>When your 14 tiles exactly match one line on the card, call
<strong>"Mah Jongg"</strong> and turn your hand face up, naming the line. You can
win by drawing the tile yourself (a <strong>self-pick</strong>) or by claiming
any discard.</p>

<div class="callout">
Declare in error and expose your tiles, and your hand is <strong>dead</strong> —
the game continues without you. Count twice before you call.
</div>

<h3>Dead hands</h3>
<p>A hand is declared dead if it can no longer possibly be legal, most often:</p>
<ul>
<li>an exposure that does not match any hand on the card;</li>
<li>the wrong number of tiles on the rack;</li>
<li>a false mah jongg call;</li>
<li>a joker used in a pair or single, or claimed illegally.</li>
</ul>
<p>A dead player stops drawing, discarding and claiming, but
<strong>still pays the winner</strong>.</p>

<h3>Wall game</h3>
<p>If the wall runs out before anyone wins, the hand is a <strong>wall
game</strong>: nobody wins, nobody pays.</p>

<h3>Scoring</h3>
<p>Each card line has a fixed value printed beside it (commonly 25 to 75+).
The three other players pay the winner:</p>
<table class="ref">
<tr><th>How the winner won</th><th>Payment</th></tr>
<tr><td>Picked the winning tile from the wall (self-pick)</td>
    <td><strong>All three pay double</strong> the hand's value</td></tr>
<tr><td>Claimed a discard</td>
    <td><strong>The discarder pays double</strong>; the other two pay the face value</td></tr>
</table>
<p>Dead hands pay the same as live ones. Many tables add house rules — a bonus
for winning <em>jokerless</em>, or a small pot for flowers. Settle those before
the first deal, not after someone wins.</p>
`
  },

  {
    id: 'etiquette',
    title: 'Etiquette and table talk',
    minutes: 3,
    body: `
<ul>
<li><strong>Name every discard out loud.</strong> Clearly, once. Tiles are placed
in the centre, not thrown.</li>
<li><strong>Claim immediately</strong> or not at all. Once the next player has
picked from the wall, the discard is gone.</li>
<li><strong>No table talk about hands.</strong> Do not say what you are collecting,
do not warn someone off a discard, do not comment on another player's exposures.
"I need one tile" is fine; "don't throw bams" is not.</li>
<li><strong>Do not help mid-hand</strong>, even a beginner, unless the table has
agreed to teach. Between hands, help freely.</li>
<li><strong>Keep your rack tidy and your count right</strong> — 13 tiles, always.
Miscounts are the most common cause of a dead hand.</li>
<li><strong>Everyone plays from their own card.</strong> Keep yours in front of you;
you may look at it as much as you like.</li>
<li>Agree in advance on: second Charleston conventions, house rules, and what
happens on a wall game. Five minutes of agreement saves an argument.</li>
</ul>

<p class="try-hint">That is the whole game. Go beat the <strong>Practice
Table</strong>, then find three humans — it is a far better game with them.</p>
`
  }
];

/* --------------------------------------------------------------- glossary -- */

var GLOSSARY = [
  ['Bams', 'The bamboo suit, 1–9. The 1 Bam is drawn as a bird.'],
  ['Blind pass', 'On the third pass of a Charleston, passing on up to three tiles you were just given, without looking at them.'],
  ['Card', 'The National Mah Jongg League\'s annual list of legal hands. Changes every year; you must play from the current one.'],
  ['Charleston', 'The opening sequence of blind three-tile passes: right, across, left (then optionally left, across, right).'],
  ['Concealed hand', 'A card line marked "C" — it must be built without claiming discards, though the final winning tile may be claimed.'],
  ['Courtesy pass', 'The optional swap of up to three tiles with the player across from you, after the Charleston.'],
  ['Craks', 'The character suit, 1–9, marked with 萬.'],
  ['Dead hand', 'A hand that can no longer be legal (bad exposure, wrong tile count, false mah jongg). It stops playing but still pays the winner.'],
  ['Dots', 'The circle suit, 1–9. Count the circles.'],
  ['Dragons', 'Red (Craks), Green (Bams), White/Soap (Dots). Four of each.'],
  ['Exposure', 'A pung, kong or quint laid face up on your rack after claiming a discard. Permanent, and visible to everyone.'],
  ['Flower', 'One of the 8 flower tiles. All flowers are interchangeable.'],
  ['Joker', 'Wild tile, usable only in groups of three or more. Never in a pair or single, never passed in the Charleston.'],
  ['Joker exchange', 'Swapping a real tile from your rack for a joker sitting in any exposure, on your turn.'],
  ['Kong', 'Four identical tiles.'],
  ['Mah Jongg', 'The call you make when your 14 tiles match a line on the card.'],
  ['Pung', 'Three identical tiles.'],
  ['Quint', 'Five identical tiles — only possible with jokers.'],
  ['Rack', 'The stand holding your 13 tiles, with exposures displayed on top.'],
  ['Self-pick', 'Winning on a tile you drew yourself. Everyone pays double.'],
  ['Sextet', 'Six identical tiles — rare, and heavily joker-dependent.'],
  ['Soap', 'The white dragon. Belongs to the Dot suit and doubles as the 0 in year hands.'],
  ['Wall', 'The face-down stacks of tiles you draw from. 19 tiles, two high, per player.'],
  ['Wall game', 'The wall runs out with no winner. Nobody wins, nobody pays.'],
  ['Winds', 'North, East, West, South — four of each. Suitless, so card colours never constrain them.']
];

/* ------------------------------------------------------------- rules quiz -- */

var RULES_QUESTIONS = [
  {
    q: 'How many tiles does a complete winning hand contain?',
    a: ['14', '13', '16', 'It depends on the hand'],
    correct: 0,
    why: 'Every line on the card is exactly 14 tiles. You hold 13 and win on the 14th.'
  },
  {
    q: 'Which direction does play move?',
    a: ['Counter-clockwise — to your right', 'Clockwise — to your left',
      'Whichever way East chooses', 'It alternates each hand'],
    correct: 0,
    why: 'Play always moves counter-clockwise, so the next player is the one on your right.'
  },
  {
    q: 'What are the three passes of the first Charleston, in order?',
    a: ['Right, across, left', 'Left, across, right', 'Across, right, left', 'Right, left, across'],
    correct: 0,
    why: 'First Charleston: right, across, left. The optional second Charleston mirrors it: left, across, right.'
  },
  {
    q: 'May you pass a joker during the Charleston?',
    a: ['Never', 'Only on the first pass', 'Only in the courtesy pass', 'Yes, jokers pass freely'],
    correct: 0,
    why: 'Jokers may never be passed — not in either Charleston, not in the courtesy pass.'
  },
  {
    q: 'The second Charleston happens when…',
    a: ['All four players agree to it', 'East decides', 'It is always played',
      'A majority votes for it'],
    correct: 0,
    why: 'It is optional, and any single player may stop it.'
  },
  {
    q: 'What is a "blind pass"?',
    a: ['On the third pass of a Charleston, passing on tiles you were just given without looking',
      'Passing tiles face down, which is every pass',
      'Passing fewer than three tiles',
      'Letting the player across choose your tiles'],
    correct: 0,
    why: 'On the last pass of each Charleston you may pass on up to three just-received tiles unseen.'
  },
  {
    q: 'Who may claim a discarded tile?',
    a: ['Any player, if it completes a group of three or more (or their mah jongg)',
      'Only the player to the discarder\'s right',
      'Only the player who has already exposed a group',
      'Only East'],
    correct: 0,
    why: 'Anyone may claim, but only to build a pung/kong/quint — or for mah jongg, where any group counts.'
  },
  {
    q: 'You need one more 5 Dot to complete a PAIR in your hand. Someone discards a 5 Dot. May you claim it?',
    a: ['Only if it completes your hand for mah jongg',
      'Yes, pairs may always be claimed',
      'Yes, if you expose the pair',
      'Only if you have a joker'],
    correct: 0,
    why: 'Discards can never be claimed for pairs or singles — unless that tile wins the hand outright.'
  },
  {
    q: 'Where may a joker be used?',
    a: ['In any group of three or more identical tiles',
      'Anywhere in any hand',
      'Only in kongs and quints',
      'Only in exposed hands'],
    correct: 0,
    why: 'Pungs, kongs, quints, sextets — yes. Pairs and singles — never.'
  },
  {
    q: 'On your turn, a joker sits in an opponent\'s exposed kong of 3 Bam. You hold a real 3 Bam. What may you do?',
    a: ['Swap your 3 Bam for their joker', 'Nothing — jokers in exposures are frozen',
      'Take the joker for free', 'Declare their hand dead'],
    correct: 0,
    why: 'Joker exchange: on your turn, trade the real tile into any exposure and take the joker.'
  },
  {
    q: 'A joker is discarded. Who may claim it?',
    a: ['Nobody — a discarded joker is dead', 'Anyone, like any other tile',
      'Only a player with an exposure', 'Only the next player'],
    correct: 0,
    why: 'Discarding a joker is legal, but it can never be picked up.'
  },
  {
    q: 'On the card, two groups printed in different colours must be…',
    a: ['Different suits', 'The same suit', 'One suit and one honour group',
      'Red and green specifically'],
    correct: 0,
    why: 'Same colour = same suit; different colour = different suit. Which actual suit you use is your choice.'
  },
  {
    q: 'What does a "0" mean in a year hand such as 2026?',
    a: ['The Soap — the white dragon', 'Any tile', 'A flower', 'A joker'],
    correct: 0,
    why: 'The white dragon stands in for zero. It is a Dot-suit tile.'
  },
  {
    q: 'A hand on the card marked "C" means…',
    a: ['It must be concealed — no claiming discards to build it',
      'It is worth extra points',
      'It requires a specific suit',
      'It may contain no jokers'],
    correct: 0,
    why: 'Concealed hands are built from your own tiles; only the final winning tile may be claimed. Jokers are still allowed in groups of 3+.'
  },
  {
    q: 'You win by claiming a discard. How is it paid?',
    a: ['The discarder pays double the hand value; the other two pay the face value',
      'Everyone pays double',
      'Only the discarder pays',
      'Everyone pays the face value'],
    correct: 0,
    why: 'Throwing the winning tile costs double. Self-picking instead makes all three pay double.'
  },
  {
    q: 'The wall runs out and nobody has won. What happens?',
    a: ['Wall game — nobody wins, nobody pays', 'East wins by default',
      'The player closest to mah jongg wins', 'Everyone pays into the pot'],
    correct: 0,
    why: 'A wall game is simply a wash.'
  },
  {
    q: 'A player exposes a pung that matches no hand on the card. What happens?',
    a: ['Their hand is declared dead, but they still pay the winner',
      'They take the tiles back',
      'They lose only if someone notices',
      'Play stops and the hand is re-dealt'],
    correct: 0,
    why: 'Exposures are commitments. An impossible exposure kills the hand, and dead hands still pay.'
  },
  {
    q: 'How many tiles are in an American mah jongg set?',
    a: ['152', '144', '136', '160'],
    correct: 0,
    why: '108 suit tiles + 16 winds + 12 dragons + 8 flowers + 8 jokers = 152.'
  },
  {
    q: 'Which dragon belongs to the Bam suit?',
    a: ['Green', 'Red', 'White (Soap)', 'Bams have no dragon'],
    correct: 0,
    why: 'Green–Bams, Red–Craks, Soap–Dots. This matters whenever a card line puts a D in a coloured group.'
  },
  {
    q: 'How many tiles do you hold on your rack after your discard?',
    a: ['13, plus any exposures', '14', '13 including exposures', 'Any number'],
    correct: 0,
    why: 'You always return to 13 concealed tiles; exposed groups sit on top of the rack in addition.'
  },
  {
    q: 'Which of these is NOT a legal group in American mah jongg?',
    a: ['A run of 4-5-6 in one suit', 'A pung of West winds',
      'A quint of 7 Dots', 'A pair of flowers'],
    correct: 0,
    why: 'There are no chows/runs as a group. Consecutive-number hands still need pungs, kongs or pairs of each number.'
  },
  {
    q: 'When may you claim the final tile for mah jongg from a discard?',
    a: ['Whenever it completes your hand, even for a pair or single — including in a concealed hand',
      'Only if the group is three or more tiles',
      'Never — mah jongg must be self-picked',
      'Only if you have no exposures'],
    correct: 0,
    why: 'The winning tile is the universal exception: any group, and concealed hands too.'
  }
];
