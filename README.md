# 🧸 Playroom Designer

Design a room to scale in your browser. Upload a 2D layout image of the room,
set the real-world scale, then paste product links — the app fetches each
item's real dimensions and lets you drag its footprint around the room so you
can plan the layout before you buy anything.

Built for planning a kid's playroom, but works for any room.

---

## What it does

- **Upload your 2D layout** — a floor plan or top-down sketch of the room.
- **Set the scale** — draw a line along something you know the length of
  (a wall, a doorway) and type the real distance. Everything scales from that.
- **Add items by link** — paste a product URL (IKEA, Wayfair, Amazon, etc.).
  A small backend fetches the page and extracts the width / depth / height.
- **Manage your shortlist** — items live in a column on the left. Edit any
  dimension by hand, or delete items you don't want.
- **Place to scale** — drop each item into the room as an accurately-sized
  footprint (top-down width × depth). Drag to move, rotate, and remove.
- **1-foot grid** overlay to sanity-check spacing.
- Everything is saved in your browser automatically (`localStorage`).

Units are **inches / feet**.

---

## Running it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm start
```

Then open **http://localhost:3000**.

For auto-reload during development: `npm run dev`.

---

## How to use it

1. **Upload layout** (top bar) → pick your room image.
2. **📏 Set scale** → click two points a known distance apart on the image
   (e.g. the two ends of a wall), then enter that real distance in ft/in.
   The scale badge turns green when it's set.
3. Paste a **product link** in the left sidebar and press **Add**. The size is
   fetched automatically. If a site blocks the fetch (some big retailers do),
   the item is still added — just type the dimensions into the W / D / H boxes.
4. Click **+ Place** on an item to drop it into the room. Drag it to position,
   use the **⟳** handle to rotate, and **✕** to take it back out.
5. Toggle the **▦ Grid** (1 ft squares) to check spacing.

---

## How measurement scraping works

The backend (`scraper.js`) fetches the product page server-side (so there are
no browser CORS limits) and looks for dimensions in three layered ways, most
reliable first:

1. **JSON-LD structured data** (`schema.org/Product` `width`/`depth`/`height`).
2. **"W × D × H" text patterns**, e.g. `47.2"W x 15.7"D x 31.5"H` or
   `24 x 18 x 36 inches`, and 2-number footprints like rugs (`120 x 180 cm`).
3. **Individually labelled values**, e.g. `Width: 18 in`.

All units (cm, mm, m, ft, in) are converted to inches. Some retailers block
automated requests or render dimensions only via JavaScript — in those cases
nothing is found and you enter the size manually. The auto/manual badge on each
card shows which happened.

---

## Project layout

```
server.js       Express server: serves the app + /api/scrape endpoint
scraper.js      Fetches a product page and extracts dimensions
public/
  index.html    App shell
  style.css     Styles
  app.js        Room stage, scale calibration, item placement, persistence
```

## Notes & limits

- Scraping is best-effort. Retail sites change constantly and many block bots;
  manual entry is always available as a fallback.
- The design is stored only in your browser. Clearing site data (or "Reset")
  erases it. It is not shared between devices.
