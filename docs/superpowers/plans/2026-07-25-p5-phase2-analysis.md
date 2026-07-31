# P5 Phase 2 — Hanoi Delivery Rating Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the 402-restaurant / 691-review ShopeeFood snapshot into a published portfolio page arguing that a delivery-app star rating cannot tell you which Hanoi restaurant is good, and that the review text can.

**Architecture:** One Colab notebook owns every cleaning and analysis decision, reading the local-only raw snapshot. It emits a small set of aggregate figures. Those figures are hand-copied into `src/data/project5.js`, guarded by `src/data/project5.test.js`, and rendered by `Project5.jsx` with Recharts. No raw scraped record ever reaches the repo.

**Tech Stack:** Python 3 / pandas in Colab, Anthropic API for review labeling, React 18 + Vite, Recharts, CSS Modules, i18next, Vitest.

## Global Constraints

- **The raw snapshot is local-only and gitignored, forever.** Path: `ShopeeFoodCollector/data/raw/snapshot_20260725T061403.json`. Never commit it, never publish a record from it, never re-run collection.
- **Aggregates only on the site.** Counts, medians, correlations, category totals. No restaurant names beyond what is needed for a chart label, no review text.
- **Notebook owns all cleaning.** Dedupe, price banding, category grouping, district parsing, Vietnamese text normalization. None of it moves back into the collector.
- **Both locales in the same edit.** `src/locales/en.json` and `src/locales/vi.json` never diverge by even one key.
- **Plain-English copy.** No idioms, no metaphors. Canon: `docs/UBIQUITOUS_LANGUAGE.md`.
- **Dedupe before counting.** `restaurants[]` is 621 rows / 402 unique `restaurant_id`. `reviews[]` is 1386 rows / 693 unique `review_id` — every review appears exactly twice. Skipping either dedupe doubles every count.
- **`rating == 0` means unrated, not bad.** 52 of 402 restaurants. Treat as missing.
- **`review_count` is an ordinal display bucket, not a count.** 15 distinct values. Never use in a mean, correlation, or regression.
- **Every `SectionTitle` gets `fxIndex fxTitle`** (site-wide rainbow effect convention).
- **Review window is 2018–2021.** Any claim from review text must be labeled historical on the page. ShopeeFood metadata is current. Never mix the two into one "the market today" claim.

---

## The four takeaways this page must land

Locked in planning. Every task below serves one of these. If a chart serves none, it does not ship.

1. **The star rating cannot separate restaurants.** 67% sit at or above 4.5; the middle half spans 4.4–4.7.
2. **Price does not move the rating.** Median price runs 30,000 to 275,000 VND across venue types — a 9× spread — while median rating stays inside 4.40–4.70.
3. **Two public ratings of the same restaurant disagree.** Pearson r = 0.084 across the 113 restaurants carrying both a ShopeeFood 0–5 star rating and a Foody 0–10 review mean.
4. **The review text carries the signal the stars do not.** A complaint taxonomy over 691 reviews, each category sized by how often it appears and by how far the score drops when it does.

Caveats stated up front on the page, not buried: promoted-and-deliverable slice rather than Hanoi; one signed-in delivery address; reviews are 2018–2021; review coverage reaches 115 of 402 restaurants and skews to popular venues.

---

## File structure

| File | Responsibility | Status |
|---|---|---|
| `project5_analysis.ipynb` | All cleaning + analysis. Prints the aggregate block. Root, matching `project1_analysis.ipynb`. | create |
| `ShopeeFoodCollector/data/derived/review_labels.json` | Per-review complaint labels. **Local only, gitignored** — it is derived from raw text. | create |
| `src/data/project5.js` | The published figures, hand-copied from notebook output. | create |
| `src/data/project5.test.js` | Cross-checks that the page cannot quietly disagree with its own numbers. Mirrors `project4.test.js`. | create |
| `src/pages/Project5.jsx` | The page. | create |
| `src/pages/Project5.module.css` | Page styles. | create |
| `src/App.jsx` | Route `p5`. | modify |
| `src/components/Header.jsx` | Nav entry. | modify |
| `src/pages/Home.jsx` | `PROJECTS` card, leading the list. | modify |
| `src/locales/en.json`, `src/locales/vi.json` | All copy, both locales. | modify |
| `.gitignore` | Add `ShopeeFoodCollector/data/derived/`. | modify |

---

### Task 1: Notebook — load, dedupe, clean

**Files:**
- Create: `project5_analysis.ipynb`

**Interfaces:**
- Consumes: `ShopeeFoodCollector/data/raw/snapshot_20260725T061403.json`
- Produces: DataFrames `rest` (402 rows), `rev` (693 rows), and `A` (337 rows — restaurants with both a price band and a non-zero rating). Columns on `rest`: `restaurant_id`, `name`, `district`, `category`, `rating`, `price_min`, `price_max`, `review_count`. Columns on `rev`: `review_id`, `restaurant_id`, `rating`, `title`, `text`, `created_at`, `year`.

- [ ] **Step 1: Markdown cell — the question and the caveats**

Open the notebook with the framing, so a reader of the notebook alone knows what it argues:

```markdown
# Can a delivery-app star rating tell you which Hanoi restaurant is good?

Data: one snapshot of ShopeeFood's Hanoi listing (2026-07-25), 402 restaurants,
plus 693 Foody reviews covering 115 of them.

Four limits, stated before any number:

1. This is the promoted, deliverable-to-one-address slice of the listing, not
   all of Hanoi. Every card carried a voucher badge.
2. The reviews are 2018-2021. Foody's review flow effectively stopped when
   ShopeeFood took over ordering. They describe what diners complained about
   then, not service quality today.
3. Review coverage reaches 115 of 402 restaurants, and those 115 skew popular
   (median review-count bucket 100 against 10 for the rest).
4. `review_count` is a display bucket, not a count. It is used as a popularity
   tier and nowhere else.
```

- [ ] **Step 2: Load and dedupe**

```python
import json, pandas as pd, numpy as np

SNAPSHOT = "snapshot_20260725T061403.json"   # upload to Colab; never committed
raw = json.load(open(SNAPSHOT, encoding="utf-8"))

# Capture batches overlap, so the collector emits duplicate rows on purpose
# (parse-only boundary). Dedupe is the notebook's job.
rest = pd.DataFrame(raw["restaurants"]).drop_duplicates("restaurant_id")

# Foody ignores ?page=N on /binh-luan and re-served page 1, so every review
# appears exactly twice. Not deduping would double every count.
rev = pd.DataFrame(raw["reviews"]).drop_duplicates("review_id")

assert len(rest) == 402, len(rest)
assert len(rev) == 693, len(rev)
print(f"{len(rest)} restaurants, {len(rev)} reviews")
```

- [ ] **Step 3: Run the cell and confirm both asserts pass**

Expected output: `402 restaurants, 693 reviews`

- [ ] **Step 4: Clean the restaurant fields**

```python
# rating 0 means unrated, not badly rated. 52 restaurants.
rest["rating"] = rest["rating"].replace(0, np.nan)

# District is the second-to-last comma field of the address. No id->name
# lookup table needed, and it reads better than district_id.
rest["district"] = (rest["address"].str.split(",")
                    .str[-2].str.strip())

# `categories` is a venue type, not a cuisine. `cuisine_raw` covers only half
# the rows and 85% of those say "Mon Viet", so it has no separating power --
# venue type is the honest axis, and the page names it that way.
rest["category"] = rest["categories"].str[0]

# Analysable set: a price band AND a real rating.
A = rest.dropna(subset=["rating"]).query("price_max > 0").copy()
assert len(A) == 337, len(A)

print(rest["district"].value_counts())
print(rest["category"].value_counts().head(6))
```

- [ ] **Step 5: Run and confirm**

Expected: `assert` passes; districts show Đống Đa 100, Hai Bà Trưng 91, Ba Đình 67, Hoàn Kiếm 44, Cầu Giấy 42, Thanh Xuân 33, Hoàng Mai 24, Long Biên 1.

- [ ] **Step 6: Inspect the price outlier before banding**

```python
print(A["price_max"].describe(percentiles=[.1,.25,.5,.75,.9,.95,.99]))
print(A.nlargest(8, "price_max")[["name","category","price_max"]])
```

Expected: p50 53,000; p90 199,000; max 1,000,000; 26 rows above 200,000. The top rows are `Nhà hàng` (sit-down restaurants), so these are real prices, not parse errors. Keep them — do not drop, do not winsorize. Band instead, so one 1,000,000 VND row cannot drag a mean.

- [ ] **Step 7: Band price into quartiles**

```python
A["price_band"] = pd.qcut(A["price_max"], 4,
                          labels=["cheapest", "lower-mid", "upper-mid", "priciest"])
```

- [ ] **Step 8: Clean the reviews**

```python
rev["rating"] = pd.to_numeric(rev["rating"], errors="coerce")
rev = rev.dropna(subset=["rating"])          # 2 reviews carry no score
rev["year"] = pd.to_datetime(rev["created_at"], format="mixed",
                             utc=True).dt.year
assert len(rev) == 691, len(rev)
print(rev["year"].value_counts().sort_index())
```

Expected: 691 reviews; the year counts concentrate in 2016–2021 with fewer than 30 rows from 2022 on.

- [ ] **Step 9: Commit**

```bash
git add project5_analysis.ipynb
git commit -m "feat(p5): notebook loads, dedupes, and cleans the snapshot"
```

---

### Task 2: Notebook — the three structured findings

**Files:**
- Modify: `project5_analysis.ipynb`

**Interfaces:**
- Consumes: `rest`, `rev`, `A` from Task 1.
- Produces: printed figures for takeaways 1–3, and DataFrames `by_cat` (one row per venue type with `n`, `median_price`, `median_rating`) and `paired` (one row per restaurant carrying both scores, columns `restaurant_id`, `sf_rating`, `foody_mean`, `n_reviews`).

- [ ] **Step 1: Takeaway 1 — the rating wall**

```python
r = A["rating"]
print(f"n            {len(r)}")
print(f"median       {r.median():.2f}")
print(f"p25 - p75    {r.quantile(.25):.2f} - {r.quantile(.75):.2f}")
print(f">= 4.5       {(r >= 4.5).sum()} of {len(r)} ({(r >= 4.5).mean():.1%})")
print(f"range        {r.min():.1f} - {r.max():.1f}, {r.nunique()} distinct values")

# Histogram in 0.1 bins -- this is the shape the page publishes.
hist = r.round(1).value_counts().sort_index()
print(hist.to_string())
```

Expected: median 4.6; p25–p75 4.4–4.7; 226 of 337 at or above 4.5 (67%); range 2.0–5.0 across 23 distinct values.

- [ ] **Step 2: Takeaway 2 — price does not move the rating**

```python
print(A.groupby("price_band", observed=True)["rating"]
        .agg(n="size", median="median", mean="mean").round(3))

by_cat = (A.groupby("category")
            .agg(n=("rating","size"),
                 median_price=("price_max","median"),
                 median_rating=("rating","median"))
            .query("n >= 10")
            .sort_values("median_price"))
print(by_cat)

spread = by_cat["median_price"].max() / by_cat["median_price"].min()
print(f"price spread {spread:.1f}x, "
      f"rating spread {by_cat['median_rating'].max() - by_cat['median_rating'].min():.2f} points")
```

Expected: price quartile medians 4.60 / 4.70 / 4.55 / 4.50 — flat, with a slight decline as price rises. `by_cat` gives Ăn vặt/vỉa hè 30,000 @ 4.70, Café/Dessert 45,000 @ 4.70, Quán ăn 60,000 @ 4.50, Shop Online 70,000 @ 4.60, Nhà hàng 275,000 @ 4.40. Spread 9.2× on price against 0.30 points on rating.

- [ ] **Step 3: Takeaway 3 — the two ratings disagree**

```python
foody = (rev.groupby("restaurant_id")["rating"]
            .agg(foody_mean="mean", n_reviews="size").reset_index())
paired = (foody.merge(rest[["restaurant_id","rating"]], on="restaurant_id")
               .rename(columns={"rating":"sf_rating"})
               .dropna(subset=["sf_rating"]))

r_pearson = paired["foody_mean"].corr(paired["sf_rating"])
print(f"n = {len(paired)} restaurants with both scores")
print(f"Pearson r = {r_pearson:.3f}")
print(f"Spearman  = {paired['foody_mean'].corr(paired['sf_rating'], method='spearman'):.3f}")
print(paired["foody_mean"].describe(percentiles=[.1,.25,.5,.75,.9]).round(2))
print(f">= 5 reviews: {(paired['n_reviews'] >= 5).sum()}  "
      f">= 3: {(paired['n_reviews'] >= 3).sum()}")
```

Expected: n = 113; Pearson r = 0.084; Foody mean p10–p90 spans 4.22–9.06 against the ShopeeFood 4.4–4.7 middle half; 68 restaurants carry 5 or more reviews, 78 carry 3 or more.

- [ ] **Step 4: Markdown cell — say what this means, before the reader guesses**

```markdown
### What the three cuts say together

The ShopeeFood star rating has almost no variance to explain: two thirds of the
market sits at or above 4.5, and the middle half fits inside 0.3 points. It does
not move with price -- a restaurant charging nine times more carries the same
score. And it does not agree with Foody's own reviewers on the same restaurants
(r = 0.08, effectively no relationship).

So the honest finding is not "here is what makes a restaurant highly rated". It
is that the number shown to the customer does not carry that information at all.
The rest of this notebook looks at where the information does live: the text.
```

- [ ] **Step 5: Commit**

```bash
git add project5_analysis.ipynb
git commit -m "feat(p5): the three structured findings on the rating"
```

---

### Task 3: Label the reviews

**Files:**
- Modify: `project5_analysis.ipynb`
- Create: `ShopeeFoodCollector/data/derived/review_labels.json` (local only)
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `rev` from Task 1.
- Produces: `review_labels.json`, a list of `{"review_id": str, "labels": [str]}`. Labels are drawn from a fixed taxonomy of at most 8 categories plus `"none"`. Loaded back into the notebook as DataFrame `lab`.

Method: LLM-assisted labeling against a taxonomy derived by reading a sample. The spec allows this and treats it as a legitimate technique worth showing. The labels are cached to JSON so the notebook reproduces without re-calling the API. **If no Anthropic API key is available, label in batches in a Claude Code session and write the same JSON — downstream code is identical.**

- [ ] **Step 1: Gitignore the derived labels before creating them**

Per-review labels are derived from raw review text, so they sit in the same tier as the snapshot.

```
# add to .gitignore
ShopeeFoodCollector/data/derived/
```

- [ ] **Step 2: Read a sample and derive the taxonomy by hand**

```python
sample = rev.sample(80, random_state=7)
for _, row in sample.iterrows():
    print(f"[{row['rating']:.1f}] {row['title']}\n{row['text'][:300]}\n{'-'*70}")
```

Read all 80. Write down the complaint themes that actually recur. Do not invent categories that sound plausible; only keep ones seen more than twice in the sample. Expect roughly: food taste, portion versus price, wait time, delivery and packaging, staff and service, cleanliness, ordering or app problems.

- [ ] **Step 3: Fix the taxonomy in a cell, with a definition per category**

Definitions matter more than names — they are what the labeler and the reader both key off.

```python
TAXONOMY = {
    "taste":      "The food itself: flavour, freshness, temperature on arrival.",
    "value":      "Portion size or quality judged against the price paid.",
    "wait":       "Time waiting -- for a table, for the kitchen, for delivery.",
    "delivery":   "The delivery leg: driver, packaging, spillage, wrong item.",
    "service":    "Staff attitude, attentiveness, handling of a problem.",
    "cleanliness":"Hygiene of the space, tableware, or the food's condition.",
    "ordering":   "The app or ordering flow: payment, availability, cancellation.",
}
```

- [ ] **Step 4: Label all 691 reviews in batches**

```python
import anthropic, json, os
client = anthropic.Anthropic()   # ANTHROPIC_API_KEY from Colab secrets

PROMPT = """You label Vietnamese restaurant reviews with complaint categories.

Categories (label only what the reviewer complains about, not what they praise):
""" + "\n".join(f"- {k}: {v}" for k, v in TAXONOMY.items()) + """

Rules:
- A review may carry several categories, or none. Use ["none"] when the reviewer
  raises no complaint.
- Label the complaint, not the score. A 9/10 review that still gripes about the
  wait gets "wait".
- Do not invent categories outside the list.

Return only JSON: [{"review_id": "...", "labels": ["..."]}]

Reviews:
"""

def label_batch(rows):
    body = "\n\n".join(
        f'id={r.review_id}\ntitle: {r.title}\ntext: {r.text[:600]}'
        for r in rows.itertuples())
    msg = client.messages.create(
        model="claude-opus-5", max_tokens=4000,
        messages=[{"role": "user", "content": PROMPT + body}])
    return json.loads(msg.content[0].text)

labels = []
for i in range(0, len(rev), 25):
    labels += label_batch(rev.iloc[i:i+25])
    print(f"{len(labels)}/{len(rev)}", end="\r")

assert len(labels) == len(rev), f"{len(labels)} labels for {len(rev)} reviews"
json.dump(labels, open("review_labels.json", "w"), ensure_ascii=False)
```

- [ ] **Step 5: Validate against a hand-labeled sample — this number goes on the page**

```python
check = rev.sample(60, random_state=99)
lab = pd.DataFrame(labels).set_index("review_id")

for _, row in check.iterrows():
    print(f"[{row['rating']:.1f}] {row['title']} :: {row['text'][:200]}")
    print(f"   -> {lab.loc[row['review_id'], 'labels']}\n")
```

Read all 60. Count how many carry a label set you agree with. Record the figure — the page publishes it as the labeling accuracy, and an unvalidated taxonomy is not a finding. If agreement falls below 80%, tighten the category definitions in Step 3 and re-run Step 4 rather than shipping it.

- [ ] **Step 6: Commit the notebook (not the labels)**

```bash
git add project5_analysis.ipynb .gitignore
git commit -m "feat(p5): complaint taxonomy and LLM-assisted review labeling"
```

---

### Task 4: Notebook — taxonomy aggregates and the published block

**Files:**
- Modify: `project5_analysis.ipynb`

**Interfaces:**
- Consumes: `rev`, `paired`, `by_cat`, `A`, `review_labels.json`.
- Produces: DataFrame `tax` with one row per category — `category`, `n_reviews`, `share`, `mean_score_with`, `mean_score_without`, `drag` — and a printed JavaScript block ready to paste into `src/data/project5.js`.

- [ ] **Step 1: Takeaway 4 — size each category by frequency and by score drag**

```python
lab = pd.DataFrame(json.load(open("review_labels.json")))
long = lab.explode("labels").rename(columns={"labels":"category"})
long = long.merge(rev[["review_id","rating"]], on="review_id")

overall = rev["rating"].mean()
rows = []
for cat in TAXONOMY:
    ids = set(long.loc[long["category"] == cat, "review_id"])
    with_, without = rev[rev.review_id.isin(ids)], rev[~rev.review_id.isin(ids)]
    rows.append({
        "category": cat,
        "n_reviews": len(with_),
        "share": len(with_) / len(rev),
        "mean_score_with": with_["rating"].mean(),
        "mean_score_without": without["rating"].mean(),
        "drag": without["rating"].mean() - with_["rating"].mean(),
    })
tax = pd.DataFrame(rows).sort_values("n_reviews", ascending=False).round(3)
print(f"overall mean score {overall:.2f}")
print(f'no complaint: {(lab["labels"].apply(lambda L: L == ["none"])).sum()} reviews')
print(tax.to_string(index=False))
```

`drag` is the point the chart is built on: how far the mean score falls among reviews raising that complaint. A category can be common and cost little, or rare and cost a lot — the page shows both dimensions rather than a frequency ranking alone.

- [ ] **Step 2: Guard against a category too small to talk about**

```python
thin = tax[tax["n_reviews"] < 20]
if len(thin):
    print("Too few reviews to publish a drag figure for:",
          ", ".join(thin["category"]))
```

Any category under 20 reviews ships with its count only. Its drag figure stays out of the page — 12 reviews cannot carry a mean-difference claim.

- [ ] **Step 3: Print the published block**

```python
def js(x):
    return json.dumps(x, ensure_ascii=False)

print(f"""export const stats = {{
  restaurants: {len(rest)},
  analysable: {len(A)},
  reviews: {len(rev)},
  reviewedRestaurants: {rev.restaurant_id.nunique()},
  pairedRestaurants: {len(paired)},
  ratingMedian: {A.rating.median():.2f},
  ratingP25: {A.rating.quantile(.25):.2f},
  ratingP75: {A.rating.quantile(.75):.2f},
  shareAbove45: {(A.rating >= 4.5).mean():.3f},
  correlation: {paired.foody_mean.corr(paired.sf_rating):.3f},
  priceSpread: {by_cat.median_price.max() / by_cat.median_price.min():.1f},
  ratingSpread: {by_cat.median_rating.max() - by_cat.median_rating.min():.2f},
  labelAccuracy: 0.00,   // <-- fill in from Task 3 Step 5 by hand
}}

export const ratingHistogram = {js([
    {"rating": float(k), "count": int(v)}
    for k, v in A.rating.round(1).value_counts().sort_index().items()])}

export const byCategory = {js([
    {"category": i, "n": int(r.n),
     "medianPrice": int(r.median_price), "medianRating": float(r.median_rating)}
    for i, r in by_cat.iterrows()])}

export const ratingPairs = {js([
    {"sf": float(r.sf_rating), "foody": round(float(r.foody_mean), 2),
     "n": int(r.n_reviews)}
    for r in paired.itertuples()])}

export const complaints = {js([
    {"category": r.category, "n": int(r.n_reviews),
     "share": float(r.share),
     "drag": float(r.drag) if r.n_reviews >= 20 else None}
    for r in tax.itertuples()])}

export const districts = {js([
    {"district": k, "n": int(v)}
    for k, v in rest.district.value_counts().items()])}
""")
```

- [ ] **Step 4: Run it and copy the output aside**

The printed block is the entire contract between the notebook and the site. Save it — Task 5 pastes it into `src/data/project5.js` under a header comment.

- [ ] **Step 5: Commit**

```bash
git add project5_analysis.ipynb
git commit -m "feat(p5): complaint taxonomy aggregates and published data block"
```

---

### Task 5: Data module and its tests

**Files:**
- Create: `src/data/project5.js`
- Create: `src/data/project5.test.js`

**Interfaces:**
- Produces: named exports `stats`, `ratingHistogram`, `byCategory`, `ratingPairs`, `complaints`, `districts`, `collectorUrl`, `notebookUrl`. Every downstream chart reads from these and nowhere else.

- [ ] **Step 1: Write the failing test first**

```js
import { describe, it, expect } from 'vitest'
import {
  stats, ratingHistogram, byCategory, ratingPairs, complaints, districts,
} from './project5.js'

// These figures are published on the Project 5 page and all come from one run
// of project5_analysis.ipynb over one snapshot. The point of this suite is that
// the page can never quietly disagree with its own data: edit a headline number
// without editing the series behind it and these fail rather than the site
// shipping a wrong claim.

describe('project5 published figures', () => {
  it('the histogram sums to the analysable restaurant count', () => {
    const summed = ratingHistogram.reduce((acc, row) => acc + row.count, 0)
    expect(summed).toBe(stats.analysable)
  })

  it('the share at or above 4.5 matches the histogram', () => {
    const above = ratingHistogram
      .filter(row => row.rating >= 4.5)
      .reduce((acc, row) => acc + row.count, 0)
    expect(above / stats.analysable).toBeCloseTo(stats.shareAbove45, 2)
  })

  it('the quoted middle half is narrower than half a point', () => {
    expect(stats.ratingP75 - stats.ratingP25).toBeLessThan(0.5)
    expect(stats.ratingMedian).toBeGreaterThanOrEqual(stats.ratingP25)
    expect(stats.ratingMedian).toBeLessThanOrEqual(stats.ratingP75)
  })

  it('the price and rating spreads match byCategory', () => {
    const prices  = byCategory.map(row => row.medianPrice)
    const ratings = byCategory.map(row => row.medianRating)
    expect(Math.max(...prices) / Math.min(...prices)).toBeCloseTo(stats.priceSpread, 1)
    expect(Math.max(...ratings) - Math.min(...ratings)).toBeCloseTo(stats.ratingSpread, 2)
  })

  it('the scatter carries one point per paired restaurant', () => {
    expect(ratingPairs).toHaveLength(stats.pairedRestaurants)
    expect(stats.pairedRestaurants).toBeLessThanOrEqual(stats.reviewedRestaurants)
  })

  it('reports a correlation near zero, which is the whole finding', () => {
    expect(Math.abs(stats.correlation)).toBeLessThan(0.2)
  })

  it('every rating sits on the published scale', () => {
    ratingHistogram.forEach(row => {
      expect(row.rating).toBeGreaterThanOrEqual(0)
      expect(row.rating).toBeLessThanOrEqual(5)
    })
    ratingPairs.forEach(pair => {
      expect(pair.sf).toBeGreaterThan(0)
      expect(pair.sf).toBeLessThanOrEqual(5)
      expect(pair.foody).toBeGreaterThanOrEqual(0)
      expect(pair.foody).toBeLessThanOrEqual(10)
    })
  })

  it('no complaint category outnumbers the reviews it was labelled from', () => {
    complaints.forEach(row => {
      expect(row.n).toBeLessThanOrEqual(stats.reviews)
      expect(row.share).toBeCloseTo(row.n / stats.reviews, 2)
    })
  })

  it('withholds the drag figure for any category under 20 reviews', () => {
    complaints
      .filter(row => row.n < 20)
      .forEach(row => expect(row.drag).toBeNull())
  })

  it('the districts sum to the full restaurant count', () => {
    const summed = districts.reduce((acc, row) => acc + row.n, 0)
    expect(summed).toBe(stats.restaurants)
  })

  it('publishes a labelling accuracy the page can quote', () => {
    expect(stats.labelAccuracy).toBeGreaterThanOrEqual(0.8)
    expect(stats.labelAccuracy).toBeLessThanOrEqual(1)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/data/project5.test.js`
Expected: FAIL — `Failed to resolve import "./project5.js"`

- [ ] **Step 3: Create the data module**

Paste the Task 4 Step 3 output below this header, then add the two URLs.

```js
// Project 5 — Hanoi delivery ratings
//
// Every figure here comes from one run of project5_analysis.ipynb over one
// snapshot of ShopeeFood's Hanoi listing, collected 2026-07-25. The raw
// snapshot is not in this repo and never will be: only these aggregates are
// published. Re-running the notebook is the only way to change these numbers,
// and project5.test.js fails if one is edited without the series behind it.
//
// Scope, stated because it changes what the figures mean: this is the promoted,
// deliverable-to-one-address slice of the listing, not all of Hanoi. Reviews are
// 2018-2021 and cover 115 of the 402 restaurants.

/* --- paste the notebook block here --- */

export const collectorUrl = 'https://github.com/GPham62/ShopeeFoodCollector'
export const notebookUrl  = 'https://github.com/GPham62/bio-data-page/blob/main/project5_analysis.ipynb'
```

- [ ] **Step 4: Run the tests until green**

Run: `npx vitest run src/data/project5.test.js`
Expected: PASS, 11 tests. A failure here means a figure was mistyped in the paste — fix the data, never the assertion.

- [ ] **Step 5: Commit**

```bash
git add src/data/project5.js src/data/project5.test.js
git commit -m "feat(p5): published aggregates with cross-check tests"
```

---

### Task 6: The page

**Files:**
- Create: `src/pages/Project5.jsx`, `src/pages/Project5.module.css`
- Modify: `src/App.jsx`, `src/components/Header.jsx`, `src/pages/Home.jsx`, `src/locales/en.json`, `src/locales/vi.json`

Scaffold with the `add-project` skill rather than hand-authoring the seven touch points. Route id `p5`, number `05`, leads `PROJECTS` in `Home.jsx`, no `LINKED` entry, thumbnail `/gif_import/p5.gif` or a `THUMB` override.

- [ ] **Step 1: Scaffold**

Invoke the `add-project` skill with: title `Hanoi Delivery` / `Ratings`; tags `Web scraping · NLP · Python`; pills Python, pandas, BeautifulSoup, Claude API; prev `p4`, next `home`.

- [ ] **Step 2: Four KPI cards, and only four**

`stats.restaurants` restaurants · `stats.reviews` reviews · `stats.shareAbove45` at or above 4.5 stars · `stats.correlation` agreement between the two ratings. The fourth is the headline — give it `var(--accent)`.

- [ ] **Step 3: Section 01 — the rating wall**

`<SectionTitle index="01" className="fxIndex fxTitle" />`, title asking whether the stars separate anything. One `BarChart` over `ratingHistogram`, x = rating, y = count, bars at or above 4.5 in the accent colour and the rest muted so the wall is visible without reading the axis. Insight block quotes the 4.4–4.7 middle half.

- [ ] **Step 4: Section 02 — price does not move it**

One `ComposedChart` over `byCategory`: bars = `medianPrice` on the left axis, a line = `medianRating` on the right axis pinned to `domain={[4, 5]}`. That domain is the point — the rating line is flat across a 9× price range. Insight block quotes `priceSpread` against `ratingSpread`.

- [ ] **Step 5: Section 03 — the two ratings disagree**

One `ScatterChart` over `ratingPairs`, x = `sf` (`domain={[4, 5]}`), y = `foody` (`domain={[0, 10]}`). Caption states n = `stats.pairedRestaurants` and r = `stats.correlation`. Insight block: the same restaurant can hold 4.6 stars and a 4/10 review average.

- [ ] **Step 6: Section 04 — what people actually complained about**

Horizontal `BarChart` over `complaints`, y = category, x = `n`, `Cell` colour scaled by `drag` so a common-but-cheap complaint reads differently from a rare-but-costly one. Categories with `drag === null` render grey with a "too few reviews" note. **The section heading must say the reviews are 2018–2021** — this is the one section that is not current, and the page states that where the chart is, not only in the footnotes.

- [ ] **Step 7: Section 05 — method and limits**

Collection method, the parse-only boundary, the ethics and terms-of-service line, `collectorUrl` and `notebookUrl`, the labeling accuracy from `stats.labelAccuracy` with the sample size it was measured on, and the four caveats from Task 1 Step 1 in full. Not an appendix — a section, at normal type size.

- [ ] **Step 8: Both locales, same edit**

Every string added in this task exists in `en.json` and `vi.json` before the commit. Run the `i18n-sync` skill to confirm parity.

- [ ] **Step 9: Verify in the browser**

Run: `npm run dev`, open `p5`, check both themes and both locales. Confirm no chart clips, no axis label truncates, and the rating line in Section 02 reads as flat rather than as noise.

- [ ] **Step 10: Full test run**

Run: `npx vitest run`
Expected: PASS, including the pre-existing suites.

- [ ] **Step 11: Commit**

```bash
git add src/pages/Project5.jsx src/pages/Project5.module.css src/App.jsx \
        src/components/Header.jsx src/pages/Home.jsx src/locales/
git commit -m "feat(p5): Hanoi delivery ratings page"
```

- [ ] **Step 12: UX audit**

Dispatch the `portfolio-ux-auditor` agent over Project 5 in both themes and both locales. Fix what it raises before the branch is finished.

---

## Self-review

**Spec coverage.** Phase 2 deliverables from the handoff §7: notebook (Tasks 1–4), aggregate dataset plus tests (Task 5), `Project5.jsx` plus CSS via `add-project` (Task 6), method and ethics section linking the collector (Task 6 Step 7). Handoff §8 open items: the outcome-variable decision is resolved in the takeaways above; the labeling method is fixed in Task 3; the `price_max` outlier is inspected in Task 1 Step 6 and handled by banding; the deeper review corpus stays unbuilt.

**Deliberately not built.** No regression or driver model — with r = 0.08 and a 0.3-point outcome band there is nothing for one to fit, and publishing coefficients here would be noise presented as findings. No sentiment scoring, since the spec rules out collapsing the taxonomy into a sentiment pie. No map, though latitude and longitude are present: district counts already carry the geography and a map would add a panel that changes no conclusion. Add any of these only if a later question needs them.
