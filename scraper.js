import * as cheerio from 'cheerio';

/**
 * Product-page scraper.
 *
 * Given a URL it fetches the page (with a browser-like User-Agent) and tries to
 * pull out:
 *   - title
 *   - image
 *   - dimensions (width / depth / height) normalised to INCHES
 *
 * Dimension detection uses three layered strategies, most reliable first:
 *   1. JSON-LD structured data (schema.org Product)
 *   2. A "W x D x H" style regex sweep over the visible text
 *   3. Individually-labelled values ("Width: 24 in", etc.)
 *
 * Nothing here is guaranteed — retail sites vary wildly and some block bots —
 * so every field is best-effort and the UI always lets the user hand-edit.
 */

const UNIT_TO_INCHES = {
  in: 1,
  inch: 1,
  inches: 1,
  '"': 1,
  '”': 1,
  '″': 1,
  ft: 12,
  foot: 12,
  feet: 12,
  "'": 12,
  '’': 12,
  cm: 1 / 2.54,
  centimeter: 1 / 2.54,
  centimeters: 1 / 2.54,
  centimetre: 1 / 2.54,
  centimetres: 1 / 2.54,
  mm: 1 / 25.4,
  millimeter: 1 / 25.4,
  millimeters: 1 / 25.4,
  m: 39.3701,
  meter: 39.3701,
  meters: 39.3701,
  metre: 39.3701,
  metres: 39.3701,
};

function normaliseUnit(raw) {
  if (!raw) return null;
  const key = String(raw).trim().toLowerCase().replace(/\.$/, '');
  return UNIT_TO_INCHES[key] ?? null;
}

function toInches(value, unit) {
  const factor = normaliseUnit(unit);
  if (factor == null || !isFinite(value)) return null;
  return round(value * factor);
}

function round(n) {
  return Math.round(n * 100) / 100;
}

const UNIT_PATTERN =
  '(?:inches|inch|in|feet|foot|ft|centimeters|centimetres|centimeter|centimetre|cm|millimeters|millimetres|millimeter|millimetre|mm|meters|metres|meter|metre|m|"|”|″|\'|’)';

/**
 * Strategy 2 — a triple like "24 x 18 x 36 in" or  47.2"W x 15.7"D x 31.5"H
 * Returns { width, depth, height } in inches or null.
 */
function parseTriple(text) {
  // Labelled form:  47.2"W x 15.7"D x 31.5"H   (labels can trail the unit)
  const labelled =
    /(\d+(?:\.\d+)?)\s*(inches|inch|in|feet|foot|ft|cm|mm|meters?|metres?|"|”|″|'|’)?\s*([WDHLwdhl])\s*[x×by\s]+\s*(\d+(?:\.\d+)?)\s*(inches|inch|in|feet|foot|ft|cm|mm|meters?|metres?|"|”|″|'|’)?\s*([WDHLwdhl])\s*[x×by\s]+\s*(\d+(?:\.\d+)?)\s*(inches|inch|in|feet|foot|ft|cm|mm|meters?|metres?|"|”|″|'|’)?\s*([WDHLwdhl])/;
  const lm = text.match(labelled);
  if (lm) {
    const sharedUnit = lm[2] || lm[5] || lm[8] || 'in';
    const pick = {};
    const set = (label, val, unit) => {
      const inches = toInches(parseFloat(val), unit || sharedUnit);
      if (inches == null) return;
      const l = label.toUpperCase();
      if (l === 'W') pick.width = inches;
      else if (l === 'D') pick.depth = inches;
      else if (l === 'H') pick.height = inches;
      else if (l === 'L') pick.depth = inches; // treat Length as depth (footprint)
    };
    set(lm[3], lm[1], lm[2]);
    set(lm[6], lm[4], lm[5]);
    set(lm[9], lm[7], lm[8]);
    if (pick.width || pick.depth || pick.height) {
      return { width: pick.width, depth: pick.depth, height: pick.height, confidence: 'high' };
    }
  }

  // Unlabelled form:  24 x 18 x 36 inches   (assume W x D x H)
  const triple = new RegExp(
    `(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})?\\s*[x×]\\s*(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})?\\s*[x×]\\s*(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})?`,
    'i'
  );
  const tm = text.match(triple);
  if (tm) {
    const unit = tm[2] || tm[4] || tm[6] || 'in';
    const w = toInches(parseFloat(tm[1]), tm[2] || unit);
    const d = toInches(parseFloat(tm[3]), tm[4] || unit);
    const h = toInches(parseFloat(tm[5]), tm[6] || unit);
    if (w || d || h) return { width: w, depth: d, height: h, confidence: 'medium' };
  }

  return null;
}

/**
 * Strategy 2b — a two-number footprint like "120 x 180 cm" (rugs, mats, play
 * gyms). A unit is REQUIRED here to avoid matching prices, ratings, etc.
 * Interpreted as width x depth.
 */
function parsePair(text) {
  const pair = new RegExp(
    `(?:size|dimensions?|measures?|footprint)?\\s*[:=]?\\s*(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})?\\s*[x×]\\s*(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})`,
    'i'
  );
  const m = text.match(pair);
  if (m) {
    const unit = m[2] || m[4];
    const w = toInches(parseFloat(m[1]), m[2] || unit);
    const d = toInches(parseFloat(m[3]), m[4] || unit);
    if (w || d) return { width: w, depth: d, height: null, confidence: 'low' };
  }
  return null;
}

/**
 * Strategy 3 — individual labelled values scattered in the text.
 */
function parseLabelled(text) {
  const out = {};
  const grab = (labels, key) => {
    const re = new RegExp(
      `(?:${labels})\\s*[:=]?\\s*(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})?`,
      'i'
    );
    const m = text.match(re);
    if (m) {
      const inches = toInches(parseFloat(m[1]), m[2] || 'in');
      if (inches != null) out[key] = inches;
    }
  };
  grab('width|overall width|w', 'width');
  grab('depth|length|overall depth|overall length|d|l', 'depth');
  grab('height|overall height|h', 'height');
  if (out.width || out.depth || out.height) return { ...out, confidence: 'low' };
  return null;
}

/**
 * Strategy 1 — JSON-LD Product structured data.
 */
function parseJsonLd($) {
  const results = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
      for (const item of items) results.push(item);
    } catch {
      /* ignore malformed blocks */
    }
  });

  const products = results.filter((r) => {
    const t = r && r['@type'];
    return t === 'Product' || (Array.isArray(t) && t.includes('Product'));
  });

  for (const p of products) {
    const dims = {};
    const readDim = (node) => {
      if (!node) return null;
      if (typeof node === 'number') return round(node); // assume inches
      if (typeof node === 'string') {
        const m = node.match(/(\d+(?:\.\d+)?)\s*([a-z"”″']+)?/i);
        if (m) return toInches(parseFloat(m[1]), m[2] || 'in');
      }
      if (typeof node === 'object' && node.value != null) {
        return toInches(parseFloat(node.value), node.unitText || node.unitCode || 'in');
      }
      return null;
    };
    const w = readDim(p.width);
    const d = readDim(p.depth);
    const h = readDim(p.height);
    if (w != null) dims.width = w;
    if (d != null) dims.depth = d;
    if (h != null) dims.height = h;

    const title = typeof p.name === 'string' ? p.name : undefined;
    let image;
    if (typeof p.image === 'string') image = p.image;
    else if (Array.isArray(p.image)) image = p.image[0];
    else if (p.image && p.image.url) image = p.image.url;

    if (dims.width || dims.depth || dims.height || title || image) {
      return {
        width: dims.width,
        depth: dims.depth,
        height: dims.height,
        title,
        image,
        confidence: dims.width || dims.depth || dims.height ? 'high' : undefined,
      };
    }
  }
  return null;
}

function extractMeta($) {
  const pick = (sel, attr = 'content') => {
    const el = $(sel).first();
    return el.length ? el.attr(attr) : undefined;
  };
  const title =
    pick('meta[property="og:title"]') ||
    pick('meta[name="twitter:title"]') ||
    $('title').first().text().trim() ||
    undefined;
  const image =
    pick('meta[property="og:image"]') ||
    pick('meta[name="twitter:image"]') ||
    pick('meta[property="og:image:url"]') ||
    undefined;
  return { title, image };
}

export async function scrapeProduct(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw Object.assign(new Error('That does not look like a valid URL.'), { status: 400 });
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    throw Object.assign(new Error('Only http/https links are supported.'), { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html;
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!res.ok) {
      throw Object.assign(
        new Error(`The site returned HTTP ${res.status}. It may block automated requests — enter the size manually.`),
        { status: 502 }
      );
    }
    html = await res.text();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('The site took too long to respond. Enter the size manually.'), { status: 504 });
    }
    if (err.status) throw err;
    throw Object.assign(new Error('Could not reach that site. Enter the size manually.'), { status: 502 });
  } finally {
    clearTimeout(timeout);
  }

  const $ = cheerio.load(html);

  // Parse structured data + meta BEFORE stripping scripts (JSON-LD lives in
  // <script type="application/ld+json"> tags).
  const meta = extractMeta($);
  const jsonLd = parseJsonLd($);

  // Now drop scripts/styles so the text sweep doesn't match CSS/JS noise.
  $('script, style, noscript').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();

  const triple = parseTriple(text);
  const labelled = triple ? null : parseLabelled(text);
  const pair = triple || labelled ? null : parsePair(text);

  const dimSource = jsonLd && (jsonLd.width || jsonLd.depth || jsonLd.height)
    ? jsonLd
    : triple || labelled || pair || {};

  const title = (jsonLd && jsonLd.title) || meta.title || parsed.hostname;
  let image = (jsonLd && jsonLd.image) || meta.image;
  if (image && image.startsWith('//')) image = parsed.protocol + image;
  if (image && image.startsWith('/')) image = parsed.origin + image;

  const width = dimSource.width ?? null;
  const depth = dimSource.depth ?? null;
  const height = dimSource.height ?? null;
  const found = width != null || depth != null || height != null;

  return {
    url,
    site: parsed.hostname.replace(/^www\./, ''),
    title,
    image: image || null,
    width,
    depth,
    height,
    unit: 'in',
    confidence: found ? dimSource.confidence || 'low' : 'none',
    found,
  };
}
