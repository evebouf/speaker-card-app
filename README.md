# Speaker Card App — YC Startup School 2026

A React + Vite single-page app that holds **all the visual assets** for YC
Startup School 2026: speaker cards, confirmation tickets, billboards, the brand
guide, and event signage. Each asset is a self-contained "view" you switch
between from one menu.

## Running

```bash
npm install
npm run dev      # local dev server (Vite)
npm run build    # production build → dist/  (this is what Vercel ships)
npm run lint     # eslint
```

> Note: `npm run build` runs `tsc -b` first. The repo currently carries some
> pre-existing type errors in older view components, so the deploy relies on the
> Vite/esbuild build. `npx vite build` always produces a clean bundle.

## How views work

The app renders exactly one view at a time. There is no router — the view is
chosen by a `?view=` query parameter and a floating menu in the top-right corner.

- **Switch views:** click the `☰` menu (top-right) or set `?view=<id>` in the URL.
- **Default view:** `speaker` (no `?view=` param).
- **Hide the menu / "raw" mode:** add `&raw=1` to get a clean capture with no UI
  chrome. Used by the screenshot/recording scripts (`record.mjs`,
  `record-geoff.mjs`).
- Most views auto-scale their card to fit the viewport and offer a **Download**
  (PNG/JPEG) button. The recording scripts drive the animated shader views to
  capture video (see `speaker-card-jensen-huang.mp4`).

The view list lives in one place — the `VIEWS` array in
[`src/App.tsx`](src/App.tsx). To add a view: create the component, then add an
`import`, a `View` union member, a `VIEWS` entry, and a render branch there.

## The pages

| `?view=` | Label | Component | What it is |
|----------|-------|-----------|------------|
| `speaker` *(default)* | Speaker | `SpeakerCard.tsx` | 1080×1080 speaker announcement card (photo + name + role). Pick a speaker from the bundled set. |
| `blank` | Blank | `BlankCard.tsx` | Animated mesh-gradient + fluted-glass shader playground with a full control panel. The base "canvas" for new cards. |
| `fullscreen` | Full Screen | `FullScreenCard.tsx` | The mesh-gradient shader rendered edge-to-edge, with the same control panel. For backdrops / projection. |
| `youtube` | YouTube 16:9 | `YouTubeCard.tsx` | 1920×1080 card. Reads its config from a base64 `?settings=` param so it can be templated. |
| `shorts` | Shorts 9:16 | `ShortsCard.tsx` | 1080×1920 vertical version of the YouTube card (same `?settings=` mechanism). |
| `geoff` | Geoff / Agency | `GeoffCard.tsx` | Agency/"Geoff" card that renders at 16:9, 9:16, or 1:1 with the shader background. |
| `confirmation` | Confirmation | `ConfirmationCard.tsx` | The attendee "ticket" — name, location, event, date — exported as a PNG on a brown mat. Built on `SUS2026ConfirmationCard.tsx`. |
| `confirmation-wall` | Confirmation Wall | `ConfirmationWall.tsx` | A grid/wall of many confirmation tickets for a hype montage. |
| `attendee-billboard` | Attendee Billboard | `AttendeeBillboard.tsx` | Scrolling billboard of attendee one-liners (titles + cities), curated for global diversity. |
| `brand-for-geoff` | Brand Guide (Geoff) | `BrandGuideForGeoff.tsx` | The living brand guide: color palette (hex/CMYK), the shader parameters, and usage notes. A scrolling document page. |
| `signage` | **Signage** | `Signage.tsx` | **Event wayfinding & info posters (24″×36″). See below.** |
| `billboard` | Billboard | `BillboardCard.tsx` | 2280×1050 landscape billboard, base layout. |
| `billboard2` | Billboard 2 | `BillboardCard2.tsx` | Billboard layout variant 2. |
| `billboard25` | BB 2.5 | `BillboardCard25.tsx` | Billboard layout variant 2.5. |
| `billboard3` | Billboard 3 | `BillboardCard3.tsx` | Billboard built around an enlarged confirmation ticket. |
| `billboard35` | BB 3.5 | `BillboardCard35.tsx` | Billboard layout variant 3.5. |
| `billboard37` | BB 3.7 | `BillboardCard37.tsx` | Billboard layout variant 3.7. |
| `billboard4` | Billboard 4 | `BillboardCard4.tsx` | Dark-background billboard variant. |

Shared building blocks (not standalone views): `SUS2026ConfirmationCard.tsx`
(the ticket primitive, with its glass/halftone params) and `InteractiveCard.tsx`
(a gyroscope/parallax experiment that is not currently wired into the menu).

## Signage (`?view=signage`)

This view is a rebuild of the standalone **`sus-signage`** repo (originally a
single `index.html` with 7 poster cards) brought into this app and expanded.

- **What it is:** 24″×36″ (2:3) wayfinding and informational posters for the
  event — cream→orange gradient, Martian Mono, the YC arrow, and a
  "Y Combinator Presents / Startup School 2026" footer.
- **On screen:** a scrollable gallery grouped by category
  (**Wayfinding**, **Entry Points**, **Information**, **Notices**). Previews use
  container-query units so they stay perfectly proportional at any size.
- **Printing:** click **Print posters** (or use the browser print dialog). The
  `@media print` rules lay each poster out **one per page at true 24×36 size**
  with exact background colors, and hide all app UI. Choose 24×36 paper (or
  "scale to fit") in the print dialog.
- **Arrows:** one arrow shape rotated in 45° steps gives all 8 directions
  (`up`, `down`, `left`, `right`, and the four diagonals).
- **Adding a sign:** append one entry to the `SIGNS` array in
  [`src/Signage.tsx`](src/Signage.tsx). Fields: `title`, optional `body`,
  optional `arrow` direction, `size` (`lg`/`md`/`sm`), `category`, and `footer`.
  New categories render in first-appearance order. No other changes needed.

The original 7 cards (General Admission, Ride Share Pickup/Dropoff, Friends of
YC, their "Enter Here" variants, and the "Friends of YC event access only"
notice) are preserved exactly; the rest (registration, main stage, restrooms,
Wi-Fi, schedule, first aid, lost & found, quiet room, badge/photography notices,
etc.) are new.
