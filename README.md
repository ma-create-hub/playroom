# 🧸 Daughter's Playroom Designer

A single-page web app for designing a playroom to scale. Your room is baked in
as an exact, dimensioned floor plan — drop in furniture by pasting product
links (the app pulls the real measurements) and drag the footprints around to
plan the layout before buying anything.

It's one self-contained `index.html` file — no server, no build step — so it
runs by double-clicking locally **or** hosted for free on GitHub Pages.

---

## Features

- **Your room, to scale** — the daughter's room floor plan (32'-0" × 20'-5",
  cross-shaped) is drawn precisely, with fixed features you design around:
  built-in TV console, both windows, the door swing, and the stairs.
- **Add items by link** — paste a product URL; the app fetches the page through
  a reader proxy and extracts width / depth / height. Manual entry is always
  available (and every card shows an `auto` / `manual` badge).
- **Place to scale** — drop each item as an accurately-sized top-down footprint.
  Drag to move, **⟳** to rotate, **✕** to remove.
- **1-foot grid** overlay for checking spacing.
- **Auto-save** — the full design is saved to your browser automatically on
  every change and restored when you reopen the page.
- **Multiple named designs** — keep several layouts (e.g. "Option A", "Option
  B"); switch, rename, or delete from the dropdown.
- **Save / Load files** — export the current design to a `.playroom.json` file
  and import it back later or on another computer.
- **Reset** — clears the current design back to the empty room (with a
  confirmation); the design itself is kept.

Units are **inches / feet**.

---

## Hosting it on GitHub Pages (free)

Your repo already contains `index.html` at the root, which is all Pages needs.

1. Go to your repository on **github.com**.
2. Click **Settings** (top menu) → **Pages** (left sidebar).
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Under **Branch**, pick the branch that has this file
   (`claude/playroom-design-tool-292mes`), keep the folder as **/ (root)**,
   and click **Save**.
5. Wait ~1 minute, then refresh the Pages settings page — it shows a green
   banner with your live URL, like
   `https://<your-username>.github.io/playroom/`.

That URL is your app. Open it on any device; it works on phones and tablets too.

> **Tip:** each browser stores its own designs (via `localStorage`). To move a
> design from your laptop to your phone, use **⬇ Save** to export the file and
> **⬆ Load** to import it on the other device.

---

## Running it locally instead

Just double-click `index.html`, or open it in any browser. Everything works the
same, including saved designs (per browser).

---

## Notes & limits

- Auto-scraping is best-effort. Some retailers block automated requests or load
  sizes only via JavaScript — in those cases nothing is found and you type the
  dimensions in by hand.
- Designs are stored in the browser you use. Clearing site data erases them —
  use **⬇ Save** to keep a file backup.
- You can also load a **custom layout** image (top bar) and set its scale by
  drawing a line along a known distance, if you ever want to design a different
  room.
