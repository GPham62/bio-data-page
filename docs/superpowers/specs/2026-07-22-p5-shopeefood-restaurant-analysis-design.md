# Project 05 — ShopeeFood Hanoi Restaurant Analysis

**Date:** 2026-07-22
**Status:** Design approved, pending spec review
**Target:** Junior Data Analyst roles, e-commerce / F&B sector, Hanoi

## Purpose

Add a fifth portfolio project that closes the one gap career-ops keeps naming:
every existing project uses a public dataset, nothing is Vietnamese, nothing is
self-collected. This project collects real ShopeeFood restaurant data from Hanoi,
finds what separates a highly-rated restaurant from an average one in the same
cuisine and price band, and ships the result as a stakeholder-facing page.

The differentiator is the data itself: it is self-collected, Vietnamese, and
about the candidate's own city — a combination a tutorial cannot hand another
candidate. It also proves the *collect* step of the analyst loop, which none of
the four existing projects demonstrate.

**Business question:** What separates a highly-rated Hanoi restaurant from an
average one in the same cuisine and price band? The exact analytical treatment
(text mining vs. structured drivers) is decided after the Step 1 spike.

## Non-goals (YAGNI)

- Not a real-time or scheduled feed. One snapshot, collected once.
- Not city-wide. 3–4 districts, 2–3 cuisine categories for the MVP.
- Not rating-over-time / trend analysis in the MVP (extension only).
- Not bolted into the existing job-board WebScraper repo.
- Not published as raw scraped records — aggregates only.

## Data source

**ShopeeFood (shopeefood.vn).** Chosen over GrabFood, which is app-locked with
no usable web surface. ShopeeFood has a JSON backend that returns restaurant
listings and reviews and is reachable with a real browser session (past the
403 that blocks plain `requests`).

## Architecture

Four stages, mirroring the existing project pattern (public dataset → Colab
notebook → portfolio page), with a collection stage added in front.

1. **Collect** — a small standalone collector script, browser-session based.
   Reuses the rate-limit + retry *pattern* from the WebScraper repo, not its
   job/company schema. Output: a raw snapshot file (JSON/CSV) of restaurants
   and, if reachable, reviews.
2. **Clean** — normalize mixed Vietnamese/English text, derive price bands,
   cuisine tags, district; deduplicate restaurants. Lives in the Colab notebook.
3. **Analyze** — in a Colab notebook. Shape locks after the spike (see below).
   Produces the aggregate figures the page renders.
4. **Deliver** — `Project5.jsx` + `Project5.module.css` + `src/data/project5.js`,
   integrated into Home's project grid. Recharts + insight blocks, matching the
   Project3 page shape. The collection script is linked and described on the page
   as a visible artifact.

### Step 1 is a hard gate — feasibility spike

Before the analysis design is finalized, confirm what ShopeeFood actually
returns. Pre-declared go/no-go ladder so the project cannot dead-end:

| Spike result | Project shape |
|---|---|
| Listings **and** clean review text | Review-text complaint taxonomy (hardest to copy) |
| Listings only, no clean reviews | Structured rating-drivers (segmentation + driver model) |
| ShopeeFood blocked entirely | Pivot to Tiki F&B/grocery category, same question shape |
| All blocked | Last resort: a public VN-relevant dataset, documented as a fallback |

The spike is the first implementation task. Its output is a go/no-go decision
and, on go, the locked analytical shape.

## Analytical shape (two branches, locked after spike)

**Branch A — Review-text mining.** Build a complaint taxonomy from real
Vietnamese reviews (late delivery, wrong order, packaging, portion, price,
service) and quantify what drags a rating down. Must not collapse into a
sentiment pie chart — the taxonomy and its size-per-category is the deliverable.
LLM-assisted labeling of Vietnamese sentiment is a legitimate technique here and
maps to a real CV skill.

**Branch B — Structured rating drivers.** From ratings + metadata (rating, price
band, cuisine, district, delivery time, review count, promo), answer the
same-cuisine same-band question with segmentation and a driver model. No NLP.
Closer in shape to the existing RFM project.

Both branches answer the same business question and produce the same kind of
page; they differ only in method.

## Deliverables

- **Collection script** — standalone, in its own small repo/folder. Committed and
  pushed to GitHub so it is visible.
- **Colab notebook** — collect-snapshot → clean → analyze, linked from the page.
- **Data snapshot** — committed so the page's numbers are reproducible.
- **Portfolio page** — `Project5.jsx` (`p5`, number `05`), scaffolded via the
  `add-project` skill. Recharts + insight blocks. Includes a section on the
  collection method and an ethics/ToS line.

## Portfolio integration (grounded in current code)

- `Home.jsx`: add `p5` to the front of `PROJECTS = ['p3','p1','p4','p2']` — the
  newest and most differentiated piece leads the grid (adjustable during build);
  add `p5: '05'` to `PROJECT_NUM`. The "Coming Soon" banner still trails the
  grid — a new page does not replace it.
- Thumbnail: `/gif_import/p5.gif`, or a `THUMB` override if a static image fits
  better (as `p4` uses `p4.png`).
- No `LINKED` entry (p5 shares no dataset with another page).
- Routing: state-based in `App.jsx`, same as every other page.
- i18n: `home.projects.p5.*` (grid card) and `p5.*` (page) added to **both**
  `en.json` and `vi.json` in the same edit, per the repo's locale-parity rule.
- Prefer the `add-project` skill for scaffolding rather than hand-authoring the
  seven touch points.

## Scope / finish line (MVP)

- ~300–500 restaurants across 3–4 Hanoi districts, 2–3 cuisine categories.
- Ratings + metadata for all; up to ~15–20 recent reviews each *if* text is
  reachable.
- One clear finding, one dashboard-style page.
- Extensions out of MVP: more districts, rating-over-time, cross-platform
  comparison.

## Ethics / ToS (non-negotiable)

- Check ShopeeFood's terms before collecting.
- Throttle politely (random delay between requests, as the WebScraper does).
- Publish only aggregates on the site — never raw scraped records. State this on
  the page; it is a credibility signal, not just a constraint.

## Testing

- Collection: a fixture-based parse test (save a real response, assert the parser
  extracts non-empty restaurant records) — same discipline the WebScraper repo
  already enforces. No live-site calls in tests.
- Page/data: a `src/data/project5.test.js` asserting the shape and key figures of
  the data module, matching `project4.test.js`.
- Any changed user-facing utility gets a Vitest test before push.

## Risks

- **Collection is the dominant risk.** Mitigated by the spike gate and the
  fallback ladder — the project has a defined outcome even if ShopeeFood is fully
  blocked.
- **Review text cleaning is the real analysis cost** in Branch A. Mitigated by
  the ~15–20-reviews cap and the bounded district/cuisine scope.
- **"More of the same" perception** is low here — this is the only self-collected,
  Vietnamese, F&B piece, and the only one showing the collect step.
