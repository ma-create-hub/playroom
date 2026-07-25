/* Playroom Designer — client logic
 * Units are inches throughout. Feet are display sugar only.
 */

const STORAGE_KEY = 'playroom-designer-v1';

// ---------- State ----------
const state = {
  items: [],          // {id,url,site,title,image,width,depth,height,source,placement}
  background: null,   // dataURL of the layout image
  ppi: null,          // pixels-per-inch (in displayed image pixels)
  gridOn: false,
};

let selectedId = null;

// ---------- Element refs ----------
const el = {
  linkInput: document.getElementById('linkInput'),
  btnAdd: document.getElementById('btnAdd'),
  addStatus: document.getElementById('addStatus'),
  itemList: document.getElementById('itemList'),
  itemCount: document.getElementById('itemCount'),
  bgUpload: document.getElementById('bgUpload'),
  bgImage: document.getElementById('bgImage'),
  stage: document.getElementById('stage'),
  stageEmpty: document.getElementById('stageEmpty'),
  itemsLayer: document.getElementById('itemsLayer'),
  gridCanvas: document.getElementById('gridCanvas'),
  calibrateLayer: document.getElementById('calibrateLayer'),
  calLine: document.getElementById('calLine'),
  calDotA: document.getElementById('calDotA'),
  calDotB: document.getElementById('calDotB'),
  calibrateHint: document.getElementById('calibrateHint'),
  scaleStatus: document.getElementById('scaleStatus'),
  btnCalibrate: document.getElementById('btnCalibrate'),
  btnGrid: document.getElementById('btnGrid'),
  btnClear: document.getElementById('btnClear'),
  calModal: document.getElementById('calModal'),
  calFeet: document.getElementById('calFeet'),
  calInches: document.getElementById('calInches'),
  calConfirm: document.getElementById('calConfirm'),
  calCancel: document.getElementById('calCancel'),
};

// ---------- Helpers ----------
const uid = () => 'i' + Math.random().toString(36).slice(2, 9);

function inchesToFtIn(inches) {
  if (inches == null || isNaN(inches)) return '—';
  const ft = Math.floor(inches / 12);
  const rem = Math.round((inches - ft * 12) * 10) / 10;
  if (ft && rem) return `${ft}'${rem}"`;
  if (ft) return `${ft}'`;
  return `${rem}"`;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save (storage full?):', e);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
  } catch (e) {
    console.warn('Could not load saved design:', e);
  }
}

// ---------- Adding items ----------
async function addItem() {
  const url = el.linkInput.value.trim();
  if (!url) return;
  setAddStatus('loading', 'Fetching measurements…');
  el.btnAdd.disabled = true;

  let data;
  try {
    const res = await fetch('/api/scrape?url=' + encodeURIComponent(url));
    data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Scrape failed');
  } catch (err) {
    // Still add the item so the user can enter dimensions manually.
    data = null;
    setAddStatus('error', (err.message || 'Could not fetch') + ' — added anyway, enter size manually.');
  }

  const item = {
    id: uid(),
    url,
    site: data?.site || safeHost(url),
    title: data?.title || safeHost(url),
    image: data?.image || null,
    width: data?.width ?? null,
    depth: data?.depth ?? null,
    height: data?.height ?? null,
    source: data?.found ? 'scraped' : 'manual',
    placement: null,
  };
  state.items.unshift(item);
  save();
  renderItems();

  if (data?.found) {
    setAddStatus('ok', `Got it: ${describeDims(item)}`);
  } else if (data) {
    setAddStatus('error', 'No size found on the page — enter it manually below.');
  }
  el.linkInput.value = '';
  el.btnAdd.disabled = false;
}

function safeHost(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

function describeDims(it) {
  const parts = [];
  if (it.width != null) parts.push(`${it.width}"W`);
  if (it.depth != null) parts.push(`${it.depth}"D`);
  if (it.height != null) parts.push(`${it.height}"H`);
  return parts.length ? parts.join(' × ') : 'no dimensions';
}

function setAddStatus(kind, msg) {
  el.addStatus.className = 'add-status ' + kind;
  el.addStatus.textContent = msg;
  if (kind === 'ok') setTimeout(() => { if (el.addStatus.textContent === msg) el.addStatus.textContent = ''; }, 4000);
}

// ---------- Render sidebar ----------
function renderItems() {
  el.itemCount.textContent = state.items.length;
  el.itemList.innerHTML = '';
  for (const it of state.items) {
    const li = document.createElement('li');
    li.className = 'item-card' + (it.placement ? ' placed' : '');

    const thumb = it.image
      ? `<img class="item-thumb" src="${escapeAttr(it.image)}" alt="" onerror="this.classList.add('placeholder');this.removeAttribute('src');this.textContent='📦'" />`
      : `<div class="item-thumb placeholder">📦</div>`;

    li.innerHTML = `
      ${thumb}
      <div class="item-body">
        <p class="item-name" title="${escapeAttr(it.title)}">${escapeHtml(it.title)}</p>
        <div class="item-site"><a href="${escapeAttr(it.url)}" target="_blank" rel="noopener">${escapeHtml(it.site)} ↗</a></div>
        <div class="dims">
          ${dimInput('W', it.width, it.id)}
          ${dimInput('D', it.depth, it.id)}
          ${dimInput('H', it.height, it.id)}
        </div>
        <div class="item-actions">
          <button class="btn primary place-btn" data-id="${it.id}">${it.placement ? 'Re-center' : '+ Place'}</button>
          <button class="btn ghost danger del-btn" data-id="${it.id}">Delete</button>
        </div>
      </div>
      <span class="badge ${it.source === 'scraped' ? 'scraped' : 'manual'}">${it.source === 'scraped' ? 'auto' : 'manual'}</span>
    `;
    el.itemList.appendChild(li);
  }
  renderPlacedItems();
}

function dimInput(label, val, id) {
  return `<div class="dim">
    <label>${label}</label>
    <input type="number" min="0" step="0.1" value="${val ?? ''}" data-id="${id}" data-dim="${label}" placeholder="—" />
    <span class="unit">in</span>
  </div>`;
}

// Event delegation on the list
el.itemList.addEventListener('click', (e) => {
  const placeBtn = e.target.closest('.place-btn');
  const delBtn = e.target.closest('.del-btn');
  if (placeBtn) placeItem(placeBtn.dataset.id);
  if (delBtn) deleteItem(delBtn.dataset.id);
});
el.itemList.addEventListener('input', (e) => {
  const inp = e.target.closest('input[data-dim]');
  if (!inp) return;
  const it = state.items.find((x) => x.id === inp.dataset.id);
  if (!it) return;
  const key = { W: 'width', D: 'depth', H: 'height' }[inp.dataset.dim];
  const v = inp.value === '' ? null : parseFloat(inp.value);
  it[key] = isNaN(v) ? null : v;
  it.source = 'manual';
  save();
  renderPlacedItems();
});

function deleteItem(id) {
  state.items = state.items.filter((x) => x.id !== id);
  if (selectedId === id) selectedId = null;
  save();
  renderItems();
}

// ---------- Placement ----------
function placeItem(id) {
  const it = state.items.find((x) => x.id === id);
  if (!it) return;
  if (!state.ppi) {
    setAddStatus('error', 'Set the room scale first (📏 Set scale).');
    return;
  }
  if (it.width == null && it.depth == null) {
    setAddStatus('error', 'Add at least a width or depth for this item first.');
    return;
  }
  // Drop the item at the center of the currently visible stage region.
  const wrap = el.stage.parentElement;
  const stageW = el.stage.clientWidth;
  const stageH = el.stage.clientHeight;
  const visCenterX = wrap.scrollLeft + Math.min(wrap.clientWidth, stageW) / 2;
  const visCenterY = wrap.scrollTop + Math.min(wrap.clientHeight, stageH) / 2;
  it.placement = {
    xFrac: clamp(visCenterX / stageW, 0.05, 0.95),
    yFrac: clamp(visCenterY / stageH, 0.05, 0.95),
    rotation: it.placement?.rotation || 0,
  };
  selectedId = id;
  save();
  renderItems();
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function renderPlacedItems() {
  el.itemsLayer.innerHTML = '';
  if (!state.ppi) return;
  const stageW = el.stage.clientWidth;
  const stageH = el.stage.clientHeight;

  for (const it of state.items) {
    if (!it.placement) continue;
    const wIn = it.width ?? it.depth ?? 12;
    const dIn = it.depth ?? it.width ?? 12;
    const wPx = wIn * state.ppi;
    const hPx = dIn * state.ppi;
    const cx = it.placement.xFrac * stageW;
    const cy = it.placement.yFrac * stageH;

    const div = document.createElement('div');
    div.className = 'placed-item' + (selectedId === it.id ? ' selected' : '');
    div.style.width = wPx + 'px';
    div.style.height = hPx + 'px';
    div.style.left = cx - wPx / 2 + 'px';
    div.style.top = cy - hPx / 2 + 'px';
    div.style.transform = `rotate(${it.placement.rotation || 0}deg)`;
    div.dataset.id = it.id;
    div.innerHTML = `
      <span class="pi-label">${escapeHtml(shortName(it.title))}
        <span class="pi-dims">${inchesToFtIn(wIn)} × ${inchesToFtIn(dIn)}</span>
      </span>
      <div class="handle rotate" data-role="rotate">⟳</div>
      <div class="handle remove" data-role="remove">✕</div>
    `;
    el.itemsLayer.appendChild(div);
  }
}

function shortName(name) {
  return name && name.length > 28 ? name.slice(0, 27) + '…' : name || 'Item';
}

// ---------- Drag / rotate / select on stage ----------
let drag = null;

el.itemsLayer.addEventListener('pointerdown', (e) => {
  const handle = e.target.closest('.handle');
  const piEl = e.target.closest('.placed-item');
  if (!piEl) return;
  const id = piEl.dataset.id;
  const it = state.items.find((x) => x.id === id);
  if (!it) return;

  selectedId = id;
  renderPlacedItems();
  const freshEl = el.itemsLayer.querySelector(`.placed-item[data-id="${id}"]`);

  if (handle && handle.dataset.role === 'remove') {
    it.placement = null;
    if (selectedId === id) selectedId = null;
    save();
    renderItems();
    return;
  }

  const stageRect = el.stage.getBoundingClientRect();
  const stageW = el.stage.clientWidth;
  const stageH = el.stage.clientHeight;

  if (handle && handle.dataset.role === 'rotate') {
    const cx = it.placement.xFrac * stageW + stageRect.left;
    const cy = it.placement.yFrac * stageH + stageRect.top;
    drag = { mode: 'rotate', it, cx, cy };
  } else {
    const startX = e.clientX;
    const startY = e.clientY;
    drag = {
      mode: 'move', it, freshEl, stageW, stageH,
      startX, startY,
      origXFrac: it.placement.xFrac, origYFrac: it.placement.yFrac,
    };
  }
  freshEl?.setPointerCapture?.(e.pointerId);
  e.preventDefault();
});

el.itemsLayer.addEventListener('pointermove', (e) => {
  if (!drag) return;
  if (drag.mode === 'move') {
    const dx = (e.clientX - drag.startX) / drag.stageW;
    const dy = (e.clientY - drag.startY) / drag.stageH;
    drag.it.placement.xFrac = clamp(drag.origXFrac + dx, 0, 1);
    drag.it.placement.yFrac = clamp(drag.origYFrac + dy, 0, 1);
    positionEl(drag.freshEl, drag.it);
  } else if (drag.mode === 'rotate') {
    const ang = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI + 90;
    drag.it.placement.rotation = Math.round(ang);
    const domEl = el.itemsLayer.querySelector(`.placed-item[data-id="${drag.it.id}"]`);
    if (domEl) domEl.style.transform = `rotate(${drag.it.placement.rotation}deg)`;
  }
});

function positionEl(domEl, it) {
  if (!domEl) return;
  const stageW = el.stage.clientWidth;
  const stageH = el.stage.clientHeight;
  const wPx = (it.width ?? it.depth ?? 12) * state.ppi;
  const hPx = (it.depth ?? it.width ?? 12) * state.ppi;
  domEl.style.left = it.placement.xFrac * stageW - wPx / 2 + 'px';
  domEl.style.top = it.placement.yFrac * stageH - hPx / 2 + 'px';
}

window.addEventListener('pointerup', () => {
  if (drag) { save(); drag = null; }
});

// Deselect when clicking empty stage
el.stage.addEventListener('pointerdown', (e) => {
  if (e.target === el.stage || e.target === el.bgImage || e.target === el.gridCanvas) {
    if (calibrating) return;
    selectedId = null;
    renderPlacedItems();
  }
});

// ---------- Background upload ----------
el.bgUpload.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.background = reader.result;
    save();
    showBackground();
  };
  reader.readAsDataURL(file);
});

function showBackground() {
  if (!state.background) {
    el.stage.hidden = true;
    el.stageEmpty.hidden = false;
    return;
  }
  el.stageEmpty.hidden = true;
  el.stage.hidden = false;
  el.bgImage.onload = () => {
    sizeCanvas();
    drawGrid();
    renderPlacedItems();
  };
  el.bgImage.src = state.background;
}

function sizeCanvas() {
  el.gridCanvas.width = el.bgImage.naturalWidth;
  el.gridCanvas.height = el.bgImage.naturalHeight;
}

// ---------- Grid ----------
function drawGrid() {
  const ctx = el.gridCanvas.getContext('2d');
  ctx.clearRect(0, 0, el.gridCanvas.width, el.gridCanvas.height);
  if (!state.gridOn || !state.ppi) return;
  const step = 12 * state.ppi; // 1 ft
  ctx.strokeStyle = 'rgba(108,92,231,0.28)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= el.gridCanvas.width; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, el.gridCanvas.height); ctx.stroke();
  }
  for (let y = 0; y <= el.gridCanvas.height; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(el.gridCanvas.width, y); ctx.stroke();
  }
}

el.btnGrid.addEventListener('click', () => {
  state.gridOn = !state.gridOn;
  el.btnGrid.classList.toggle('active', state.gridOn);
  save();
  drawGrid();
});

// ---------- Calibration ----------
let calibrating = false;
let calPoints = [];

el.btnCalibrate.addEventListener('click', () => {
  if (!state.background) {
    setAddStatus('error', 'Upload your room layout first.');
    return;
  }
  startCalibration();
});

function startCalibration() {
  calibrating = true;
  calPoints = [];
  el.stage.classList.add('calibrating');
  el.calibrateLayer.hidden = false;
  el.calLine.setAttribute('x1', 0); el.calLine.setAttribute('y1', 0);
  el.calLine.setAttribute('x2', 0); el.calLine.setAttribute('y2', 0);
  el.calDotA.style.display = 'none';
  el.calDotB.style.display = 'none';
  el.calibrateHint.hidden = false;
}

function stopCalibration() {
  calibrating = false;
  el.stage.classList.remove('calibrating');
  el.calibrateHint.hidden = true;
}

el.stage.addEventListener('click', (e) => {
  if (!calibrating) return;
  const rect = el.stage.getBoundingClientRect();
  // Convert to natural-image pixel coords (canvas coordinate space).
  const scaleX = el.gridCanvas.width / rect.width;
  const scaleY = el.gridCanvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  calPoints.push({ x, y });

  if (calPoints.length === 1) {
    el.calDotA.setAttribute('cx', pctX(calPoints[0].x)); el.calDotA.setAttribute('cy', pctY(calPoints[0].y));
    el.calDotA.style.display = '';
    el.calibrateHint.textContent = 'Now click the second point…';
  } else if (calPoints.length === 2) {
    el.calDotB.setAttribute('cx', pctX(calPoints[1].x)); el.calDotB.setAttribute('cy', pctY(calPoints[1].y));
    el.calDotB.style.display = '';
    el.calLine.setAttribute('x1', pctX(calPoints[0].x)); el.calLine.setAttribute('y1', pctY(calPoints[0].y));
    el.calLine.setAttribute('x2', pctX(calPoints[1].x)); el.calLine.setAttribute('y2', pctY(calPoints[1].y));
    stopCalibration();
    el.calModal.hidden = false;
    el.calFeet.value = ''; el.calInches.value = '';
    el.calFeet.focus();
  }
});

// The SVG uses the image's natural pixel coords via viewBox-less overlay sized to 100%.
// Convert natural px -> the SVG's own coordinate space (which matches rendered px).
function pctX(natX) { return natX / el.gridCanvas.width * el.stage.clientWidth; }
function pctY(natY) { return natY / el.gridCanvas.height * el.stage.clientHeight; }

el.calConfirm.addEventListener('click', () => {
  const ft = parseFloat(el.calFeet.value) || 0;
  const inch = parseFloat(el.calInches.value) || 0;
  const totalInches = ft * 12 + inch;
  if (totalInches <= 0) {
    el.calFeet.focus();
    return;
  }
  const [a, b] = calPoints;
  const pxDist = Math.hypot(b.x - a.x, b.y - a.y); // in natural image px
  // Convert natural px distance to displayed px distance.
  const displayedDist = pxDist * (el.stage.clientWidth / el.gridCanvas.width);
  state.ppi = displayedDist / totalInches;
  el.calModal.hidden = true;
  el.calibrateLayer.hidden = true;
  updateScaleStatus();
  save();
  drawGrid();
  renderPlacedItems();
  setAddStatus('ok', `Scale set: ${state.ppi.toFixed(2)} px per inch.`);
});

el.calCancel.addEventListener('click', () => {
  el.calModal.hidden = true;
  el.calibrateLayer.hidden = true;
  stopCalibration();
});

function updateScaleStatus() {
  if (state.ppi) {
    el.scaleStatus.textContent = `Scale: 1 ft ≈ ${(state.ppi * 12).toFixed(0)} px`;
    el.scaleStatus.className = 'scale-status pill ok';
  } else {
    el.scaleStatus.textContent = 'Scale not set';
    el.scaleStatus.className = 'scale-status pill warn';
  }
}

// ---------- Reset ----------
el.btnClear.addEventListener('click', () => {
  if (!confirm('Remove the layout, scale, and all items? This cannot be undone.')) return;
  state.items = [];
  state.background = null;
  state.ppi = null;
  state.gridOn = false;
  selectedId = null;
  localStorage.removeItem(STORAGE_KEY);
  el.btnGrid.classList.remove('active');
  showBackground();
  updateScaleStatus();
  renderItems();
});

// ---------- Enter key to add ----------
el.linkInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addItem(); });
el.btnAdd.addEventListener('click', addItem);

// Keep placed items positioned on resize.
window.addEventListener('resize', () => { sizeCanvasIfReady(); drawGrid(); renderPlacedItems(); });
function sizeCanvasIfReady() { if (el.bgImage.naturalWidth) sizeCanvas(); }

// ---------- Escaping ----------
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

// ---------- Boot ----------
load();
el.btnGrid.classList.toggle('active', state.gridOn);
showBackground();
updateScaleStatus();
renderItems();
