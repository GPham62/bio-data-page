# HANDOFF — P5 Phase 2: the Hanoi restaurant analysis

**Resume with:** "Plan P5 Phase 2 from `docs/superpowers/plans/2026-07-25-p5-phase2-analysis-handoff.md`, using /data-analyst-expert."

Phase 1 is finished and committed. This doc is everything Phase 2 needs to plan
the analysis without re-deriving it from the snapshot: what was collected, what
the fields actually contain, and the four data facts that constrain what the
business question can honestly be.

**Do not re-run collection.** The snapshot is complete and Foody was already
crawled twice today (see the note at the end).

---

## 1. Inputs

| What | Where |
|---|---|
| Raw snapshot (notebook input) | `ShopeeFoodCollector/data/raw/snapshot_20260725T061403.json` — **local only, gitignored, never publish** |
| Collector repo (public) | https://github.com/GPham62/ShopeeFoodCollector |
| Collection facts, field paths, run record | `ShopeeFoodCollector/docs/spike-findings.md` → "MVP collection run" |
| Original spec (business question, deliverables, boundary) | `docs/superpowers/specs/2026-07-22-p5-shopeefood-restaurant-analysis-design.md` |
| Phase 1 plan (what was built, and why) | `docs/superpowers/plans/2026-07-22-p5-phase1-collection.md` |

**Business question, from the spec:** *What separates a highly-rated Hanoi
restaurant from an average one in the same cuisine and price band?*

Section 4 explains why that question needs adjusting before it can be answered.

## 2. Snapshot shape

Top level: `collected_at`, `sources`, `restaurant_count`, `review_count`,
`restaurants[]`, `reviews[]`.

### `restaurants[]` — 621 rows, **402 unique** `restaurant_id`

Capture batches overlap, so rows repeat. The collector emits every raw row on
purpose (parse-only boundary) — **dedupe on `restaurant_id` first**.

| Field | Type | Coverage on the 402 | Notes |
|---|---|---|---|
| `restaurant_id` | str | 402 | join key to `reviews[]` |
| `name`, `url` | str | 402 | `url` is the ShopeeFood page; swap host for Foody |
| `address` | str | 402 | **district is the second-to-last comma field** — no id→name table needed |
| `district_id` | int | 402 | ShopeeFood's own id; `address` is more readable |
| `latitude`, `longitude` | float | 402 | usable for a map if the page wants one |
| `categories` | list[str] | 402 | the usable cuisine-ish field — see §4.2 |
| `cuisine_raw` | list[str] | **201 (50%)** | and 85% of those are one value — see §4.2 |
| `rating` | float, 0–5 | 402 present, **52 are `0` = unrated** | treat `0` as missing, not as a bad score |
| `review_count` | int | 402 | **binned, not a count** — see §4.3 |
| `price_min`, `price_max` | int, VND | **387 (96.3%)** | from Foody's landing-page meta description |
| `min_order_value` | str | — | e.g. `"20k"` — a string, needs parsing if used |
| `is_open` | bool | 402 | snapshot-moment state; near-useless analytically |
| `total_order` | int | **0 (0%)** | never populated on this surface. Plan nothing on it |
| `collected_at` | str | 402 | one timestamp for the whole run |

### `reviews[]` — 1386 rows, **693 unique** `review_id`

**Every review appears exactly twice** — Foody ignores `?page=N` on `/binh-luan`
and re-served page 1. **Dedupe on `review_id` first**; skipping this doubles
every count and halves every standard error.

| Field | Type | Notes |
|---|---|---|
| `review_id` | str | dedup key |
| `restaurant_id` | str | joins to `restaurants[]` |
| `rating` | float, **0–10** | Foody's scale, raw. ShopeeFood's is 0–5 — the notebook reconciles |
| `title` | str | short sentiment line, often the whole opinion |
| `text` | str | Vietnamese body, median **322 chars**, present on all 693 |
| `created_at` | str, ISO 8601 | see §4.1 |

## 3. The branch decision: A **and** B

The spike gate resolved to **Branch A** (review-text mining), and the data
supports it: all 693 reviews carry real text, ratings span the full 0–10 range
(median 7.4), and **233 (33.7%) sit under 7.0** — there is genuine negative
signal, not a five-star wall.

But Branch A only reaches **115 of 402 restaurants (28.6%)**. So run both, and
label which claim rests on which sample:

- **Branch B (structured) carries the city-level claims** — price band, rating,
  district, category across all 402 (337 with both a price band and a real
  rating).
- **Branch A (taxonomy) carries the "why"** — the complaint categories across
  693 reviews on 115 restaurants.

Per the spec, Branch A must not collapse into a sentiment pie chart: the
taxonomy and its size-per-category is the deliverable.

## 4. Four data facts that constrain the question

These are the things that would quietly break the analysis. Decide how to handle
each *before* writing notebook cells.

### 4.1 The reviews are historical, not current

By year: 2016–2018 **231**, 2019–2020 **365**, 2021 **69**, **2022-onward only
27** of 693. Foody's review flow effectively stopped when ShopeeFood took over
ordering.

So the taxonomy describes *what Hanoi diners complained about, roughly
2018–2021*. It **cannot** be trended against present-day ratings, and the page
must not imply it reads on today's service quality. The ShopeeFood metadata, by
contrast, is current — mixing the two into one "here is the market today" claim
is the mistake to avoid.

### 4.2 "Same cuisine" is barely available

The question's comparison axis is the weakest field in the dataset:

- `cuisine_raw` covers only 201/402, and **171 of those 201 are `"Món Việt"`** —
  no differentiating power.
- `categories` covers 402/402 but is a venue *type*, not a cuisine: `Quán ăn`
  237, `Café/Dessert` 67, `Shop Online` 52, `Ăn vặt/vỉa hè` 35, `Nhà hàng` 14,
  then a tail of 1–2.

Realistically there are **two comparison groups with usable n** (`Quán ăn`, and
`Café/Dessert`), plus `Ăn vặt/vỉa hè` and `Shop Online` as smaller ones. The
spec's "2–3 cuisine categories" is achievable — but as *venue type*, and it
should be named that way rather than dressed up as cuisine. An alternative axis
worth considering: **price band** is well-populated (96.3%) and continuous, so it
may carry the comparison better than category does.

### 4.3 `review_count` is a display bucket, not a count

Only **15 distinct values** across 402 restaurants, and above 10 they are
obvious bucket labels: `1000` (56 restaurants), `500` (24), `100` (99), `50`
(35), `10` (87), then genuine small integers 0–9.

Treating it as a continuous count is wrong — it is **ordinal**. Use it as a
popularity tier, never in a mean, a correlation, or a regression as-is.

### 4.4 The rating barely varies — this is the real problem

On the 337 analysable restaurants (price band **and** a non-zero rating):

| | |
|---|---|
| median | 4.6 |
| p25 – p75 | **4.4 – 4.7** |
| ≥ 4.5 | **226 of 337 (67%)** |
| full range | 2.0 – 5.0, but only 23 distinct values and a thin left tail |

The middle half of the market sits inside a **0.3-point band**. "Highly-rated vs
average" as the spec frames it therefore has almost no variance to explain, and
any driver model on this outcome will produce coefficients that are noise
dressed as findings.

Three ways out, for Phase 2 to choose between (this is the main planning
decision, and a good first question for /data-analyst-expert):

1. **Swap the outcome to the Foody 0–10 review score** — median 7.4, genuinely
   wide, 33.7% under 7.0. Costs sample: 115 restaurants, and it is the historical
   window from §4.1.
2. **Redefine "highly rated" as a within-category top tier** (e.g. top quintile
   of `Quán ăn`), making it a relative-ranking question rather than an absolute
   one. Keeps all 337 and is honest, but the gap being explained is small.
3. **Change the outcome variable.** Price band and category have real spread; a
   question like "what does the promoted delivery market charge, and who sits
   where" may be the more defensible finding this data actually supports.

Option 1 and 2 can be combined — B on a within-category tier for the city-level
picture, A on the 0–10 reviews for the mechanism.

## 5. Sampling frame — must appear on the page

Two limits, both non-optional to disclose:

1. **This is a promoted-and-deliverable slice, not Hanoi.** Every card in the
   capture carried a "Mã giảm 11%" voucher badge, and the listing only shows what
   delivers to one signed-in saved address. Fine for "what does the promoted
   delivery market look like"; wrong for "what do Hanoi restaurants charge".
2. **The 115 review-covered restaurants are the popular tail.** Median
   `review_count` bucket 100 versus 10 for the uncovered 287. Median rating is
   identical (4.6 both ways), so the skew is popularity, not sentiment — but any
   restaurant-level join runs on 115 well-known venues.

District spread is better than expected — 8 districts from `address`, of which 7
are usable: Đống Đa 100, Hai Bà Trưng 91, Ba Đình 67, Hoàn Kiếm 44, Cầu Giấy 42,
Thanh Xuân 33, Hoàng Mai 24 (Long Biên 1). That clears the spec's "3–4
districts" comfortably.

## 6. Binding rules carried over

- **Notebook owns all cleaning.** Dedup, price banding, category grouping, VN
  text normalization, district parsing — all of it lives in the notebook, none of
  it migrates back into the collector. Reproducibility (page numbers trace to one
  notebook + one snapshot) and visibility (the judgment calls *are* the analyst
  work) both depend on this.
- **Two data tiers.** Raw snapshot stays local and gitignored, forever. The
  notebook's **aggregate output** is what gets committed and what the page reads.
- **Aggregates only on the site** — never raw scraped records. State it on the
  page; the spec treats it as a credibility signal.
- **Plain-English copy**, no idioms or metaphors, per
  `docs/UBIQUITOUS_LANGUAGE.md`.
- **Both locales in the same edit** — `en.json` and `vi.json` never diverge.

## 7. Phase 2 deliverables

1. **Colab notebook** — snapshot → clean → analyze, linked from the page.
2. **Aggregate dataset** → `src/data/project5.js`, plus
   `src/data/project5.test.js` asserting shape and key figures (mirror
   `project4.test.js`).
3. **`Project5.jsx` + `Project5.module.css`** — scaffold with the `add-project`
   skill rather than hand-authoring the seven touch points. `p5`, number `05`,
   leads `PROJECTS` in `Home.jsx`, no `LINKED` entry, thumbnail
   `/gif_import/p5.gif` or a `THUMB` override like `p4.png`.
4. A section on the collection method plus the ethics/ToS line, linking the
   public collector repo.

## 8. Open items

- **The §4.4 outcome-variable decision is unresolved and blocks the analysis
  design.** Settle it first.
- **Vietnamese review labeling method is unchosen.** The spec allows LLM-assisted
  labeling for the taxonomy and calls it a legitimate, CV-relevant technique. 693
  reviews is small enough to label thoroughly.
- **`price_max` has an outlier** — range runs to 1,000,000 VND against a 50,000
  median. Inspect before banding.
- **A deeper review corpus is possible but deliberately unbuilt.** Foody's real
  paging is a private `POST /__post/Review/GetReviewEx` XHR; Phase 1 left it
  alone as out of scope for a server-rendered-HTML collector. Revisit only if 693
  reviews prove too thin — and if so, re-read the politeness constraints first.
- **Foody was crawled twice on 2026-07-25** (a duplicate concurrent run, which
  drew an HTTP 503). Nothing further is owed, but do not add more load casually.
