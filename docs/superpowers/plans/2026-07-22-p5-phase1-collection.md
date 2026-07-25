# Project 05 Phase 1 — ShopeeFood Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small, tested collector that turns browser-captured ShopeeFood
restaurant records plus politely-fetched Foody review pages into a local raw
snapshot — and resolve the spec's spike gate with a recorded go/no-go.

**Architecture:** Three focused Python modules in a standalone repo. `parse.py`
is pure (ShopeeFood JSON or Foody HTML in, dataclasses out) and carries most of
the test coverage. `fetch.py` owns the HTTP session, polite rate limiting, and
retry — pointed at Foody only. `collect.py` is the CLI that reads the captured
ShopeeFood files, fetches each restaurant's Foody page, and writes the snapshot.

**Tech Stack:** Python 3.11+, `requests`, `beautifulsoup4`, `pytest`.
Standard-library `logging`, `json`, `dataclasses`, `re`. No Playwright, no
database.

**Spec:** `docs/superpowers/specs/2026-07-22-p5-shopeefood-restaurant-analysis-design.md`
**Spike findings (authoritative for every field path):** `ShopeeFoodCollector/docs/spike-findings.md`

## Two sources, two access modes

Task 1's spike established that this is not one source:

| | Source | How it is collected |
|---|---|---|
| Restaurant metadata | ShopeeFood `get_infos` API | **Human-paced browser capture.** Anonymous scripted requests get 403 from a rotating anti-bot signature. `capture.js` records responses the browser already fetched; nothing is automated against ShopeeFood. |
| Reviews **and price band** | Foody.vn restaurant pages | **Scripted**, anonymous, throttled. Server-rendered HTML with schema.org microdata. |

The two sites share restaurant slugs, so `https://shopeefood.vn/ha-noi/<slug>`
maps 1:1 to `https://foody.vn/ha-noi/<slug>`.

## Global Constraints

- **Collector is parse-only.** No cleaning, no derived fields, no normalization, no deduplication. Those belong to the notebook (spec: "Collector / notebook boundary (binding)").
- **Raw snapshot and captures stay local and gitignored.** Never committed, never published.
- **Anonymous throughout.** No account, no session cookie, no access token — for either site. There are no credentials in this project, so there is nothing to leak.
- **Throttle politely.** Random 1–3 s delay before every Foody request.
- **Tests never hit either live site.** All parsing tests run against committed fixture files.
- **`beautifulsoup4` is required** for the Foody review and price parsing. The original "no BeautifulSoup" rule was justified by "the source returns JSON"; that premise does not hold for the review source.
- **MVP scope:** ~300–500 restaurants across the Hanoi districts the captures happen to cover; up to ~15–20 recent reviews per restaurant.
- **Cuisine filtering is deliberately NOT in the collector.** The spec's "2–3 cuisine categories" is a *notebook* concern: grouping raw cuisine tags into categories is a normalization judgment call, and the binding boundary puts those in the notebook. The collector captures `cuisine_raw` and `categories` verbatim; Phase 2 narrows.
- **District filtering is not in the collector either** — and cannot be. The spike found that a district listing URL returns restaurants across ~10 `district_id` values, so district is a property of the results, not a query. The notebook groups by the district name already present in `address`.
- **Repo location:** `C:\Users\ADMIN\Desktop\SQL_Data_engineering_projects\Project\ShopeeFoodCollector\` — a standalone git repo, sibling to `WebScraper`. Do **not** add this to the `WebScraper` repo (its schema is jobs/companies).

## File Structure

| Path | Responsibility |
|---|---|
| `README.md` | What it collects, the capture procedure, how to run, ethics note |
| `requirements.txt` | `requests`, `beautifulsoup4`, `pytest` |
| `.gitignore` | `data/`, `config.json`, `__pycache__/`, `.venv/` |
| `config.example.json` | Foody base URL, User-Agent, delay bounds. No credentials — there are none |
| `conftest.py` | Empty. Its presence puts the repo root on `sys.path` so `from parse import ...` resolves under a bare `pytest` too |
| `capture.js` | Console snippet that records ShopeeFood responses the browser already loaded |
| `parse.py` | **Pure.** ShopeeFood JSON → `Restaurant`; Foody HTML → `Review` and price band |
| `fetch.py` | HTTP session, polite delay, retry — Foody only |
| `collect.py` | CLI; reads captures, fetches Foody pages, writes the snapshot |
| `tests/fixtures/restaurant_list.json` | Real captured ShopeeFood response, 3 records |
| `tests/fixtures/restaurant_reviews.html` | Real Foody review blocks, 3 reviews |
| `tests/test_parse.py` | Parser tests against fixtures |
| `tests/test_fetch.py` | Session/delay tests, no network |
| `tests/test_collect.py` | Snapshot and URL-mapping tests, no network |
| `docs/spike-findings.md` | Go/no-go, observed field paths, branch selection |
| `data/captured/`, `data/raw/` | Captures and snapshot output (gitignored) |

---

### Task 1: Spike — ToS check, repo skeleton, capture real responses, record go/no-go

**STATUS: COMPLETE** — commit `232cc92`. Decision: **GO, Branch A** (review-text
mining) with Branch B as the floor. Everything this task produced is recorded in
`ShopeeFoodCollector/docs/spike-findings.md`, which is authoritative for every
field path used below. This task was interactive by design and is not
re-dispatched.

---

### Task 2: Pure parsers — ShopeeFood JSON and Foody HTML to typed records

**STATUS: COMPLETE** — commit `cd623a1`, corrected in `c45c048`.

> **Correction (2026-07-23) — the review code below predates a methodology fix.**
> The embedded `parse_reviews` (and Task 4's review fetch) target schema.org
> microdata on the landing page. That was wrong: Foody reviews live on the
> per-location **`/binh-luan`** sub-page and use class-based markup, not
> microdata. The shipped source is authoritative — trust `ShopeeFoodCollector/parse.py`,
> `collect.py`, and the corrected `docs/spike-findings.md` over the snippets
> here. What actually changed:
> - `Review` gained a **`title`** field; `text` is now `str | None` (a review can
>   be title-only).
> - `parse_reviews` selectors: `div.review-des` → `div.review-points span`
>   (0–10 score), `a.rd-title` (title + `binh-luan-<id>` href), `div.rd-des`
>   (body, strip `a.view-more`), `span.ru-time[content]` (date). Blank
>   `{{Model.Url}}` Handlebars templates are skipped by the id match.
> - **Score scale is 0–10, not 1–10.**
> - `collect.py` fetches **two** Foody URLs per restaurant: the landing page for
>   the price band, `<landing>/binh-luan` for reviews.

**Files:**
- Create: `ShopeeFoodCollector/parse.py`
- Create: `ShopeeFoodCollector/tests/test_parse.py`

**Interfaces:**
- Consumes: the two fixtures from Task 1
- Produces:
  - `Restaurant`, `Review` dataclasses
  - `parse_restaurants(raw: dict, collected_at: str) -> list[Restaurant]`
  - `parse_reviews(html: str, restaurant_id: str) -> list[Review]`
  - `parse_price_range(html: str) -> tuple[int | None, int | None]`

Note the asymmetry: `parse_restaurants` takes a **dict** (ShopeeFood JSON),
while `parse_reviews` and `parse_price_range` take an **HTML string** (Foody).

- [ ] **Step 1: Write the failing tests**

Create `tests/test_parse.py`:

```python
import json
from pathlib import Path

from parse import (
    Restaurant,
    Review,
    parse_price_range,
    parse_restaurants,
    parse_reviews,
)

FIXTURES = Path(__file__).parent / "fixtures"
LIST_FIXTURE = FIXTURES / "restaurant_list.json"
REVIEW_FIXTURE = FIXTURES / "restaurant_reviews.html"


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_html(path):
    return path.read_text(encoding="utf-8")


def test_parse_restaurants_returns_records():
    rows = parse_restaurants(load_json(LIST_FIXTURE), collected_at="2026-07-22T00:00:00")
    assert len(rows) > 0
    assert all(isinstance(r, Restaurant) for r in rows)


def test_parse_restaurants_populates_identity_fields():
    rows = parse_restaurants(load_json(LIST_FIXTURE), collected_at="2026-07-22T00:00:00")
    first = rows[0]
    assert first.restaurant_id
    assert first.name
    assert first.url.startswith("http")
    assert first.collected_at == "2026-07-22T00:00:00"


def test_parse_restaurants_populates_analysis_fields():
    # These are the fields Phase 2 actually models on. If any silently stops
    # being extracted, the notebook gets a column of Nones and no error.
    rows = parse_restaurants(load_json(LIST_FIXTURE), collected_at="2026-07-22T00:00:00")
    first = rows[0]
    assert isinstance(first.rating, float)
    assert isinstance(first.review_count, int)
    assert first.cuisine_raw and all(isinstance(c, str) for c in first.cuisine_raw)
    assert first.categories and all(isinstance(c, str) for c in first.categories)
    assert isinstance(first.district_id, int)
    assert first.address and "Hà Nội" in first.address
    assert isinstance(first.latitude, float)
    assert isinstance(first.longitude, float)


def test_parse_restaurants_ids_are_unique():
    rows = parse_restaurants(load_json(LIST_FIXTURE), collected_at="2026-07-22T00:00:00")
    ids = [r.restaurant_id for r in rows]
    assert len(ids) == len(set(ids))


def test_parse_restaurants_empty_payload_returns_empty_list():
    rows = parse_restaurants({}, collected_at="2026-07-22T00:00:00")
    assert rows == []


def test_parse_restaurants_missing_fields_become_none_not_defaults():
    # Guards the parse-only boundary: the collector must never invent a value.
    # rating=0 means "rated zero"; rating=None means "no rating exists". If the
    # parser defaults to 0, the notebook's average rating is silently wrong.
    raw = {"reply": {"delivery_infos": [{"restaurant_id": "x", "name": "Quan X"}]}}
    rows = parse_restaurants(raw, collected_at="2026-07-22T00:00:00")

    assert len(rows) == 1
    r = rows[0]
    assert r.rating is None
    assert r.review_count is None
    assert r.district_id is None
    assert r.address is None
    assert r.latitude is None
    assert r.price_min is None
    assert r.price_max is None
    assert r.cuisine_raw == []
    assert r.categories == []


def test_parse_restaurants_leaves_price_unset():
    # ShopeeFood's price_range is {} on every record — price comes from Foody,
    # and collect.py fills it in later. The parser must not fabricate one.
    rows = parse_restaurants(load_json(LIST_FIXTURE), collected_at="2026-07-22T00:00:00")
    assert all(r.price_min is None and r.price_max is None for r in rows)


def test_parse_reviews_returns_records_with_text():
    rows = parse_reviews(load_html(REVIEW_FIXTURE), restaurant_id="test-id")
    assert len(rows) == 3
    assert all(isinstance(r, Review) for r in rows)
    assert all(r.restaurant_id == "test-id" for r in rows)
    assert all(r.text.strip() for r in rows)


def test_parse_reviews_extracts_distinct_ids_and_ratings():
    rows = parse_reviews(load_html(REVIEW_FIXTURE), restaurant_id="test-id")
    ids = [r.review_id for r in rows]
    assert len(ids) == len(set(ids))
    # Foody rates 0-10, not 0-5. The notebook reconciles the two scales; the
    # parser must pass the source scale through untouched.
    assert all(r.rating is not None and 0 < r.rating <= 10 for r in rows)


def test_parse_reviews_empty_html_returns_empty_list():
    assert parse_reviews("<html><body></body></html>", restaurant_id="x") == []


def test_parse_price_range_reads_the_meta_description():
    # Spacing before "đ" is inconsistent on real pages — the second one has a
    # space, the first does not. Both must parse.
    html = (
        '<html><head><meta name="description" content="Phở Thìn - Lò Đúc tại 13 '
        'Lò Đúc, Hà Nội. Giá bình quân đầu người 40.000đ - 60.000 đ">'
        "</head><body></body></html>"
    )
    assert parse_price_range(html) == (40000, 60000)


def test_parse_price_range_absent_returns_none_pair():
    assert parse_price_range("<html><head></head><body></body></html>") == (None, None)
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd "C:/Users/ADMIN/Desktop/SQL_Data_engineering_projects/Project/ShopeeFoodCollector"
python -m pytest tests/test_parse.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'parse'`.

- [ ] **Step 3: Write the parser**

Create `parse.py`. Every field path below is transcribed from
`docs/spike-findings.md` — they are confirmed against the real fixtures, not
guesses, so do not "correct" them against intuition.

```python
"""Pure parsing of collected pages into typed records.

Boundary (spec: Collector / notebook boundary): this module extracts fields as
they arrive. No normalization, no derived fields, no deduplication. Missing
values are None.

Two shapes arrive here: ShopeeFood returns JSON (restaurant metadata), Foody
returns HTML (reviews and the price band).
"""
import re
from dataclasses import dataclass

from bs4 import BeautifulSoup


@dataclass
class Restaurant:
    restaurant_id: str
    name: str
    url: str
    address: str | None
    district_id: int | None
    latitude: float | None
    longitude: float | None
    cuisine_raw: list[str]
    categories: list[str]
    rating: float | None
    review_count: int | None
    min_order_value: str | None
    is_open: bool | None
    total_order: int | None
    price_min: int | None
    price_max: int | None
    collected_at: str


@dataclass
class Review:
    review_id: str
    restaurant_id: str
    rating: float | None
    text: str
    created_at: str | None


def _get(obj, path, default=None):
    """Walk a dotted path through nested dicts/lists. Returns default if absent."""
    cur = obj
    for part in path.split("."):
        if isinstance(cur, list):
            try:
                cur = cur[int(part)]
                continue
            except (ValueError, IndexError):
                return default
        if not isinstance(cur, dict) or part not in cur:
            return default
        cur = cur[part]
    return cur if cur is not None else default


# Confirmed against tests/fixtures/restaurant_list.json (spike-findings.md).
RESTAURANTS_ROOT = "reply.delivery_infos"


def parse_restaurants(raw, collected_at):
    rows = _get(raw, RESTAURANTS_ROOT, default=[]) or []
    out = []
    for item in rows:
        rid = _get(item, "restaurant_id")
        name = _get(item, "name")
        if not rid or not name:
            continue
        out.append(
            Restaurant(
                restaurant_id=str(rid),
                name=name,
                url=_get(item, "url", default=""),
                address=_get(item, "address"),
                district_id=_get(item, "district_id"),
                latitude=_get(item, "position.latitude"),
                longitude=_get(item, "position.longitude"),
                cuisine_raw=_get(item, "cuisines", default=[]) or [],
                categories=_get(item, "categories", default=[]) or [],
                rating=_get(item, "rating.avg"),
                review_count=_get(item, "rating.total_review"),
                min_order_value=_get(item, "min_order_value.resource_args.0"),
                is_open=_get(item, "is_open"),
                total_order=_get(item, "total_order"),
                # ShopeeFood's price_range is {} on every record. Price comes
                # from the Foody page; collect.py fills these in.
                price_min=None,
                price_max=None,
                collected_at=collected_at,
            )
        )
    return out


REVIEW_ID_RE = re.compile(r"binh-luan-(\d+)")
PRICE_RE = re.compile(r"([\d.]+)\s*đ\s*-\s*([\d.]+)\s*đ")


def _digits_to_int(text):
    digits = text.replace(".", "").replace(",", "")
    return int(digits) if digits.isdigit() else None


def parse_price_range(html):
    """Per-person price band, read from the Foody page's meta description.

    Foody renders it as "Giá bình quân đầu người 40.000đ - 60.000đ".
    """
    meta = BeautifulSoup(html, "html.parser").select_one('meta[name="description"]')
    match = PRICE_RE.search(meta.get("content", "") if meta else "")
    if not match:
        return None, None
    return _digits_to_int(match.group(1)), _digits_to_int(match.group(2))


def parse_reviews(html, restaurant_id):
    """Reviews from a Foody restaurant page, via its schema.org microdata.

    Each review renders as a `div.review-des` holding the rating, the permalink
    carrying the review id, and the body. The publish date sits one level up in
    the reviewer block, so the enclosing element is what gets searched.
    """
    soup = BeautifulSoup(html, "html.parser")
    out = []
    for des in soup.select("div.review-des"):
        block = des.parent or des
        link = des.select_one('a[href*="binh-luan-"]') or block.select_one(
            'a[href*="binh-luan-"]'
        )
        match = REVIEW_ID_RE.search(link.get("href", "")) if link else None
        body = des.select_one('[itemprop="reviewBody"]')
        if not match or body is None:
            continue

        rating_el = des.select_one('[itemprop="ratingValue"]')
        rating = None
        if rating_el:
            try:
                rating = float(rating_el.get_text(strip=True))
            except ValueError:
                rating = None

        date_el = block.select_one('[itemprop="datePublished"]')
        out.append(
            Review(
                review_id=match.group(1),
                restaurant_id=restaurant_id,
                rating=rating,
                text=body.get_text(" ", strip=True),
                created_at=date_el.get("content") if date_el else None,
            )
        )
    return out
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
python -m pytest tests/test_parse.py -v
```

Expected: PASS — 12 tests.

- [ ] **Step 5: Commit**

```bash
git add parse.py tests/test_parse.py
git commit -m "feat: parse ShopeeFood listings and Foody reviews into typed records"
```

---

### Task 3: HTTP session with polite rate limiting

**STATUS: COMPLETE** — commit `74fd2d0`.

> **Correction (2026-07-25).** The `get_html` below raises once retries are
> exhausted on a 5xx. That killed a real 402-restaurant run 4 restaurants in,
> on a Foody page that returned 200 when probed a minute later. Shipped
> behaviour (commit `ce62593`): an exhausted 5xx returns `None` — the same
> "skip this page" contract 404 already had — and `collect.py` carries the
> floor for a genuine outage (`DEAD_PAGE_LIMIT`, 25 consecutive dead landing
> pages aborts). 429 still raises. Trust `fetch.py` over the snippet below.

**Files:**
- Create: `ShopeeFoodCollector/fetch.py`
- Create: `ShopeeFoodCollector/tests/test_fetch.py`

**Interfaces:**
- Consumes: `config.json` (shape defined by `config.example.json`, Task 1)
- Produces:
  - `load_config(path: str = "config.json") -> dict`
  - `build_session(config: dict) -> requests.Session`
  - `polite_delay(config: dict) -> None`
  - `get_html(session: requests.Session, url: str, params: dict | None, config: dict) -> str | None`

This module talks to **Foody only**. ShopeeFood is never fetched — its data
arrives through `capture.js`.

`get_html` applies `polite_delay` before every request and retries up to 3 times
on connection errors and 5xx, with a doubling backoff. A **404 returns `None`**
rather than raising: restaurants disappear from Foody, and one dead page must
not abort a 500-restaurant run. Other 4xx raise.

- [ ] **Step 1: Write the failing tests**

Create `tests/test_fetch.py`:

```python
import json

import pytest

from fetch import build_session, load_config, polite_delay

CONFIG = {
    "foody_base_url": "https://example.invalid",
    "headers": {"User-Agent": "test-agent", "Accept-Language": "vi"},
    "delay_seconds": [1.0, 3.0],
}


def test_load_config_reads_file(tmp_path):
    path = tmp_path / "config.json"
    path.write_text(json.dumps(CONFIG), encoding="utf-8")
    assert load_config(str(path))["foody_base_url"] == "https://example.invalid"


def test_load_config_missing_file_is_a_clear_error(tmp_path):
    with pytest.raises(FileNotFoundError):
        load_config(str(tmp_path / "nope.json"))


def test_build_session_applies_configured_headers():
    session = build_session(CONFIG)
    assert session.headers["User-Agent"] == "test-agent"
    assert session.headers["Accept-Language"] == "vi"


def test_polite_delay_sleeps_within_configured_bounds(monkeypatch):
    slept = []
    monkeypatch.setattr("fetch.time.sleep", lambda s: slept.append(s))
    for _ in range(20):
        polite_delay(CONFIG)
    assert len(slept) == 20
    assert all(1.0 <= s <= 3.0 for s in slept)


def test_polite_delay_defaults_when_bounds_absent(monkeypatch):
    slept = []
    monkeypatch.setattr("fetch.time.sleep", lambda s: slept.append(s))
    polite_delay({})
    assert slept and 1.0 <= slept[0] <= 3.0
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
python -m pytest tests/test_fetch.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'fetch'`.

- [ ] **Step 3: Write the fetcher**

Create `fetch.py`:

```python
"""HTTP session, polite rate limiting, and retry for Foody page collection.

Anonymous by design: no cookies, no tokens, no account. The only header that
matters is a truthful User-Agent.
"""
import json
import logging
import random
import time
from pathlib import Path

import requests

log = logging.getLogger(__name__)

MAX_RETRIES = 3
DEFAULT_DELAY = [1.0, 3.0]


def load_config(path="config.json"):
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(
            f"{path} not found. Copy config.example.json to config.json and set "
            "a real User-Agent."
        )
    return json.loads(p.read_text(encoding="utf-8"))


def build_session(config):
    session = requests.Session()
    session.headers.update(config.get("headers", {}))
    return session


def polite_delay(config):
    low, high = config.get("delay_seconds", DEFAULT_DELAY)
    time.sleep(random.uniform(low, high))


def get_html(session, url, params, config):
    """Fetch a page. Returns the HTML, or None if the page is gone (404)."""
    backoff = 2
    for attempt in range(1, MAX_RETRIES + 1):
        polite_delay(config)
        try:
            resp = session.get(url, params=params, timeout=30)
        except requests.RequestException as exc:
            if attempt == MAX_RETRIES:
                raise
            log.warning("request failed (%s), retry %s/%s", exc, attempt, MAX_RETRIES)
            time.sleep(backoff)
            backoff *= 2
            continue

        if resp.status_code == 404:
            log.info("404 %s — skipping", url)
            return None

        if resp.status_code >= 500:
            if attempt == MAX_RETRIES:
                resp.raise_for_status()
            log.warning("HTTP %s, retry %s/%s", resp.status_code, attempt, MAX_RETRIES)
            time.sleep(backoff)
            backoff *= 2
            continue

        if resp.status_code == 429:
            raise RuntimeError(
                "HTTP 429 — being rate limited. Stop, raise delay_seconds in "
                "config.json, and resume later."
            )

        resp.raise_for_status()
        return resp.text
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
python -m pytest tests/test_fetch.py -v
```

Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add fetch.py tests/test_fetch.py
git commit -m "feat: rate-limited anonymous HTTP session for Foody pages"
```

---

### Task 4: CLI — join captures with Foody pages into the raw snapshot

**STATUS: COMPLETE** — commit `228bb4f`, hardened in `a235219`, `4b1c5e3`, `ce62593`.

> **Correction (2026-07-25).** Two things the snippet below gets wrong, both
> fixed in the shipped `collect.py`:
> - It fetches reviews from the landing page. Reviews live on `/binh-luan`.
> - It slices `restaurants[:max_restaurants]`, which counts **raw rows**. A
>   capture holds several overlapping rows per restaurant, so `--max-restaurants
>   500` capped the crawl at ~100 actual restaurants. `cap_unique()` now counts
>   unique `restaurant_id` and keeps every raw row of the ones it keeps.
>
> It also crawls each `restaurant_id` once and copies the price band onto that
> restaurant's duplicate rows — otherwise every review landed in the snapshot
> once per duplicate row.

**Files:**
- Create: `ShopeeFoodCollector/collect.py`
- Create: `ShopeeFoodCollector/tests/test_collect.py`

**Interfaces:**
- Consumes: `load_config`, `build_session`, `get_html` (Task 3); `parse_restaurants`, `parse_reviews`, `parse_price_range`, `Restaurant`, `Review` (Task 2)
- Produces:
  - `load_captures(captured_dir: str) -> list[dict]`
  - `foody_url(shopeefood_url: str) -> str | None`
  - `build_snapshot(restaurants: list[Restaurant], reviews: list[Review], collected_at: str) -> dict`
  - `write_snapshot(snapshot: dict, out_dir: str = "data/raw") -> Path`
  - CLI: `python collect.py [--max-restaurants 500] [--review-pages 2] [--no-reviews]`

`capture.js` writes a list of batches, each `{"url": ..., "body": ..., "response": {...}}`.
`load_captures` reads every `*.json` under the captured directory and returns
the `response` payloads, ready for `parse_restaurants`.

Snapshot format:

```json
{
  "collected_at": "2026-07-22T10:00:00",
  "sources": ["shopeefood", "foody"],
  "restaurant_count": 412,
  "review_count": 6180,
  "restaurants": [ ... ],
  "reviews": [ ... ]
}
```

- [ ] **Step 1: Write the failing tests**

Create `tests/test_collect.py`:

```python
import json

from collect import build_snapshot, foody_url, load_captures
from parse import Restaurant


def _restaurant(rid):
    return Restaurant(
        restaurant_id=rid, name=f"Quan {rid}", url=f"https://shopeefood.vn/ha-noi/{rid}",
        address="1 Pho X, Cau Giay, Ha Noi", district_id=21,
        latitude=21.03, longitude=105.77, cuisine_raw=["Món Việt"],
        categories=["Café/Dessert"], rating=4.5, review_count=10,
        min_order_value="20k", is_open=True, total_order=0,
        price_min=None, price_max=None, collected_at="2026-07-22T00:00:00",
    )


def test_foody_url_swaps_the_host_and_keeps_the_slug():
    assert (
        foody_url("https://shopeefood.vn/ha-noi/che-xua-quan-do-an-vat")
        == "https://foody.vn/ha-noi/che-xua-quan-do-an-vat"
    )


def test_foody_url_rejects_unusable_input():
    assert foody_url("") is None
    assert foody_url("not-a-url") is None


def test_load_captures_returns_response_payloads(tmp_path):
    batch = [{"url": "x", "body": "{}", "response": {"reply": {"delivery_infos": [1]}}}]
    (tmp_path / "a.json").write_text(json.dumps(batch), encoding="utf-8")
    (tmp_path / "b.json").write_text(json.dumps(batch), encoding="utf-8")
    payloads = load_captures(str(tmp_path))
    assert len(payloads) == 2
    assert payloads[0]["reply"]["delivery_infos"] == [1]


def test_load_captures_empty_dir_returns_empty_list(tmp_path):
    assert load_captures(str(tmp_path)) == []


def test_build_snapshot_counts_match_payload():
    snap = build_snapshot(
        restaurants=[_restaurant("a"), _restaurant("b")],
        reviews=[],
        collected_at="2026-07-22T00:00:00",
    )
    assert snap["restaurant_count"] == 2
    assert snap["review_count"] == 0
    assert snap["sources"] == ["shopeefood", "foody"]
    assert snap["collected_at"] == "2026-07-22T00:00:00"
    assert len(snap["restaurants"]) == 2


def test_build_snapshot_serialises_dataclasses_to_dicts():
    snap = build_snapshot([_restaurant("a")], [], "2026-07-22T00:00:00")
    first = snap["restaurants"][0]
    assert isinstance(first, dict)
    assert first["restaurant_id"] == "a"
    assert first["cuisine_raw"] == ["Món Việt"]
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
python -m pytest tests/test_collect.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'collect'`.

- [ ] **Step 3: Write the CLI**

Create `collect.py`:

```python
"""Join browser-captured ShopeeFood records with Foody pages into a snapshot.

The snapshot is raw by design (spec: collector is parse-only) and is gitignored
— cleaning and analysis happen in the Colab notebook.
"""
import argparse
import json
import logging
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

from fetch import build_session, get_html, load_config
from parse import parse_price_range, parse_restaurants, parse_reviews

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

FOODY_HOST = "foody.vn"


def load_captures(captured_dir):
    """Every response payload recorded by capture.js, oldest file first."""
    out = []
    for path in sorted(Path(captured_dir).glob("*.json")):
        for batch in json.loads(path.read_text(encoding="utf-8")):
            if "response" in batch:
                out.append(batch["response"])
    return out


def foody_url(shopeefood_url):
    """ShopeeFood and Foody share restaurant slugs, so only the host changes."""
    if not shopeefood_url:
        return None
    parts = urlparse(shopeefood_url)
    if not parts.scheme or not parts.netloc or not parts.path.strip("/"):
        return None
    return f"{parts.scheme}://{FOODY_HOST}{parts.path}"


def build_snapshot(restaurants, reviews, collected_at):
    return {
        "collected_at": collected_at,
        "sources": ["shopeefood", "foody"],
        "restaurant_count": len(restaurants),
        "review_count": len(reviews),
        "restaurants": [asdict(r) for r in restaurants],
        "reviews": [asdict(v) for v in reviews],
    }


def write_snapshot(snapshot, out_dir="data/raw"):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    stamp = snapshot["collected_at"].replace(":", "").replace("-", "")[:15]
    path = out / f"snapshot_{stamp}.json"
    path.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def main():
    ap = argparse.ArgumentParser(
        description="Build a snapshot from ShopeeFood captures plus Foody pages."
    )
    ap.add_argument("--max-restaurants", type=int, default=500)
    ap.add_argument("--review-pages", type=int, default=2, help="Foody pages per restaurant")
    ap.add_argument("--no-reviews", action="store_true")
    args = ap.parse_args()

    config = load_config()
    session = build_session(config)
    collected_at = datetime.now().isoformat(timespec="seconds")

    captured_dir = config.get("captured_dir", "data/captured")
    payloads = load_captures(captured_dir)
    if not payloads:
        raise SystemExit(
            f"No captures found in {captured_dir}. Run capture.js in the browser "
            "first — see README.md."
        )

    restaurants = []
    for payload in payloads:
        restaurants.extend(parse_restaurants(payload, collected_at))
    log.info("%s restaurant records across %s captures", len(restaurants), len(payloads))
    restaurants = restaurants[: args.max_restaurants]

    reviews = []
    with_price = 0
    for i, r in enumerate(restaurants, start=1):
        url = foody_url(r.url)
        if not url:
            continue
        for page in range(1, args.review_pages + 1):
            html = get_html(session, url, {"page": page} if page > 1 else None, config)
            if html is None:
                break
            if page == 1:
                r.price_min, r.price_max = parse_price_range(html)
                if r.price_min is not None:
                    with_price += 1
            if args.no_reviews:
                break
            found = parse_reviews(html, r.restaurant_id)
            reviews.extend(found)
            if not found:
                break
        if i % 25 == 0:
            log.info("  %s/%s restaurants, %s reviews", i, len(restaurants), len(reviews))

    log.info("price band found for %s/%s restaurants", with_price, len(restaurants))
    path = write_snapshot(build_snapshot(restaurants, reviews, collected_at))
    log.info("wrote %s (%s restaurants, %s reviews)", path, len(restaurants), len(reviews))


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
python -m pytest tests/ -v
```

Expected: PASS — all parser, fetch, and collect tests green.

- [ ] **Step 5: Run a small live collection to prove it works end to end**

Requires at least one capture file in `data/captured/` (Task 1 left one there).

```bash
python collect.py --max-restaurants 5 --review-pages 1
```

Expected: log lines ending in `wrote data/raw/snapshot_*.json`. Open the file
and confirm it holds real restaurant names, and that at least some records have
a non-null `price_min`.

- [ ] **Step 6: Confirm nothing raw is tracked by git**

```bash
git status --short
```

Expected: no `data/` entries at all. If any appear, fix `.gitignore` before committing.

- [ ] **Step 7: Commit**

```bash
git add collect.py tests/test_collect.py
git commit -m "feat: CLI joining ShopeeFood captures with Foody pages into a snapshot"
```

---

### Task 5: Full MVP collection run, README, and publish the repo

**Files:**
- Create: `ShopeeFoodCollector/README.md`
- Modify: `ShopeeFoodCollector/docs/spike-findings.md` (append the run record)

**Interfaces:**
- Consumes: the working CLI from Task 4
- Produces: a full MVP snapshot in `data/raw/` (local only) that Phase 2's notebook reads; a public repo the portfolio page can link

- [x] **Step 1: Capture the districts** — done 2026-07-25, 402 unique restaurants

Needs a signed-in Chrome session. Open any Hanoi district listing, paste
`capture.js` into the DevTools console **once**, run `sweepAll()`, watch
`__sweepLog` until `running` is false, then `save('hanoi-districts.json')` and
move the file into `data/captured/`.

The original instruction here — capture 4 district listings of ~200 each — does
not work, and the reason is worth keeping:

**A listing returns at most 200 results per filter combination.** Six inner
districts selected together returned exactly 200; asking for Đống Đa alone
straight afterwards surfaced 17 restaurants the six-district query had
truncated away. Re-sorting is not a way around it (re-sorting the same 200 by
rating yielded 3 new restaurants), so the 200 is that filter's whole pool
rather than a window onto a larger one. **Sweeping districts one at a time is
what bypasses the cap**, which is what `sweepAll()` does.

Two mechanics that cost real debugging time, both now handled in `capture.js`:

- The filter commits on a **genuine outside click**, not on the dropdown
  closing. Toggling the panel shut leaves the boxes ticked but never refetches,
  and the page then reports the *previous* district's results under the new
  district's name — a silent wrong answer, not an error.
- Driving the sweep over CDP hits a 45 s per-call timeout, so `sweepAll()` runs
  detached and reports through `window.__sweepLog`. Poll it; do not await it.

Result: 28 batches, 621 raw rows, **402 unique restaurants**, 100% carrying
`rating.avg`. Outer districts are near-empty on this surface (Tây Hồ 0, Long
Biên 1) because the listing only shows what delivers to the signed-in account's
saved address, so the 402 are effectively inner Hanoi.

**Sampling frame — carry this into Phase 2.** Every card carried a "Mã giảm
11%" badge. This is *restaurants in a current voucher campaign that deliver to
one address*, not a random sample of Hanoi. Fine for "what does the promoted
delivery market look like"; wrong for "what do Hanoi restaurants charge".

- [x] **Step 2: Run the full MVP collection** — done 2026-07-25, `snapshot_20260725T061403.json`

```bash
python collect.py --max-restaurants 500      # --review-pages is gone, see below
```

Ran ~55 min over 402 unique restaurants. Two things the run taught:

**`?page=N` on `/binh-luan` is ignored.** Page 2 returns byte-different HTML
carrying the *same 10 review ids* as page 1, so `--review-pages 2` spent a second
request per restaurant re-collecting the same reviews — 1386 review rows over
**693 real reviews**. The flag and the page loop are removed; one review request
per restaurant. Real paging is an AngularJS `LoadMore()` on
`POST /__post/Review/GetReviewEx`, deliberately not implemented (private JSON API,
outside this collector's server-rendered-HTML scope, and the reviews behind it are
older still). The existing snapshot keeps the duplicate rows — record-level dedup
is a notebook concern under the parse-only boundary — so **Phase 2 must dedupe
reviews by `review_id`**.

**Do not run two collectors at once.** A duplicate concurrent run doubled the
request rate against Foody and drew an HTTP 503. One at a time.

- [x] **Step 3: Record what was actually collected** — done 2026-07-25

Recorded in `docs/spike-findings.md` under "MVP collection run". Headline numbers:

| | |
|---|---|
| Restaurants | **402 unique** (621 raw rows) |
| Reviews | **693 unique** (1386 rows, each review twice) |
| Price band | 387/402 (**96.3%**) |
| ≥1 review | 115/402 (**28.6%**), median 7 each |
| `rating.avg` | 350/402 (87%) |
| `cuisine_raw` | 201/402 (50%) — **fall back to `categories`, which is 402/402** |
| `total_order` | **0/402** — never populated; plan no analysis on it |

**Branch decision: Branch A, with Branch B as the complement rather than the
fallback.** All 693 reviews carry body text (median 322 chars) and ratings span
the full 0–10 scale (median 7.4) with **233 reviews (33.7%) under 7.0** — real
negative signal for a complaint taxonomy, not a 5-star wall.

Two caveats Phase 2 must state, both recorded in the findings doc:

1. **The reviews are historical.** 2022-onward is only 27 of 693; the mass sits
   2018–2021. Foody review activity stopped when ShopeeFood took over ordering.
   The taxonomy describes *what diners complained about c. 2018–2021* and cannot
   be trended against present-day ratings.
2. **The 115 review-covered restaurants are the popular tail.** Median ShopeeFood
   `review_count` 100 vs 10 for the uncovered 287. Ratings match (4.6 both), so
   the skew is popularity, not sentiment — but restaurant-level joins run on 115.

So: Branch B metadata analysis carries the city-level claims across all 402;
Branch A's taxonomy carries the "why" across 693 reviews. Both, labelled.

- [x] **Step 4: Write the README** — done 2026-07-25, commit `ce62593`

The shipped `README.md` follows the draft below, with the capture procedure
rewritten around `sweepAll()` and the 200-result cap, plus the promo-scoped
sampling-frame caveat. Trust the shipped file over this draft:

```markdown
# ShopeeFood + Foody Hanoi Restaurant Collector

Collects public restaurant records for Hanoi — ratings, cuisine, location,
price band, and review text — into a local JSON snapshot. Built as the
collection stage of a data-analysis portfolio project.

## Two sources, and why

Restaurant metadata comes from ShopeeFood; reviews and the price band come from
Foody, which serves the same restaurants under the same URL slugs.

ShopeeFood's data endpoint is behind a rotating anti-bot signature: an
anonymous scripted request returns 403 no matter what headers it carries.
Rather than forge that signature, the metadata is **captured at human browsing
pace** — `capture.js` records the responses your own browser already loaded
while you page through the listings. Nothing is automated against ShopeeFood.

Foody serves plain server-rendered HTML to anonymous clients, so that half is a
normal throttled fetch.

## What it does and does not do

This collector **parses only** — it extracts fields as they arrive and writes
them out. All cleaning, normalization, and analysis happen downstream in the
analysis notebook. That split keeps the analysis reproducible from one raw
snapshot, and keeps the judgment calls visible where they belong.

## Setup

```bash
pip install -r requirements.txt
cp config.example.json config.json
```

Set a real `User-Agent` in `config.json`. There are no credentials — collection
is anonymous on both sites.

## Capture the ShopeeFood metadata

1. Open a Hanoi district listing on shopeefood.vn.
2. Open DevTools, paste the contents of `capture.js` into the console.
3. Page through the listing at reading pace.
4. Run `save('cau-giay.json')` and move the file into `data/captured/`.

## Run

```bash
python collect.py --max-restaurants 500 --review-pages 2
python collect.py --no-reviews              # price band only, no review text
```

Output: `data/raw/snapshot_<timestamp>.json` (gitignored).

## Tests

```bash
python -m pytest tests/ -v
```

Tests run against committed fixture files and never touch either live site.

## Collection ethics

- Anonymous throughout — no account, no session cookie, no access token.
- Foody requests are throttled with a random 1–3 s delay; a 429 stops the run.
- ShopeeFood is never fetched by script. Its anti-bot response is treated as a
  boundary, not an obstacle.
- Raw records stay local. They are never committed here and never published —
  only aggregate figures appear in the write-up.
- Both sites' terms were reviewed before collection; see `docs/spike-findings.md`.
```

- [x] **Step 5: Verify no raw data is staged** — done 2026-07-25, `CLEAN`

```bash
git status --short
git ls-files | grep -E "config\.json$|^data/" || echo "CLEAN — no config or raw data tracked"
```

Expected: `CLEAN — no config or raw data tracked`.

- [x] **Step 6: Commit** — done 2026-07-25, commit `fc861d2`

- [x] **Step 7: Publish the repo** — done 2026-07-25

**Repo URL (Phase 3's portfolio page links to this):
https://github.com/GPham62/ShopeeFoodCollector**

Public, default branch `main`, 15 files. `gh repo create` opens on `master`, so
the branch was renamed and the default switched after the first push.

Verified before publishing: no snapshot or capture files tracked, no
`config.json`, and no reviewer names in the committed fixtures.

---

## Phase 1 done — what comes next

At this point you have a tested, published collector and a local raw snapshot of
300–500 Hanoi restaurants. The spike gate is resolved and the branch is recorded
in `docs/spike-findings.md`.

**Do not start the analysis from this plan.** Phase 2 (the Colab notebook —
cleaning plus either the Branch A complaint taxonomy or the Branch B driver
analysis) gets its own plan, written once the real review coverage is known, so
its tasks can be concrete rather than conditional.
