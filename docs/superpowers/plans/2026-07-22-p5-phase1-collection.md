# Project 05 Phase 1 — ShopeeFood Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small, tested, rate-limited collector that pulls Hanoi restaurant records (and reviews, if reachable) from ShopeeFood into a local raw snapshot — and resolve the spec's spike gate with a recorded go/no-go.

**Architecture:** Three focused Python modules in a new standalone repo. `parse.py` is pure (JSON in, dataclasses out) and carries all the test coverage. `fetch.py` owns the HTTP session, browser-captured headers, polite rate limiting, and pagination. `collect.py` is the CLI that wires them together and writes the snapshot. The spike is Task 1 and its deliverable — real captured responses — becomes the test fixtures for every later task.

**Tech Stack:** Python 3.11+, `requests`, `pytest`. Standard-library `logging`, `json`, `dataclasses`. No BeautifulSoup (the source returns JSON), no Playwright, no database.

**Spec:** `docs/superpowers/specs/2026-07-22-p5-shopeefood-restaurant-analysis-design.md`

## Global Constraints

- **Collector is parse-only.** No cleaning, no derived fields, no normalization, no deduplication. Those belong to the notebook (spec: "Collector / notebook boundary (binding)").
- **Raw snapshot stays local and gitignored.** Never committed, never published.
- **Never hardcode credentials.** Browser-captured headers/cookies live in a gitignored `config.json`; only `config.example.json` is committed.
- **Throttle politely.** Random 1–3 s delay between every request.
- **Tests never hit the live site.** All parser tests run against committed fixture files.
- **Check ShopeeFood's Terms of Service before collecting**, and record the decision (Task 1).
- **MVP scope:** ~300–500 restaurants across 3–4 Hanoi districts; up to ~15–20 recent reviews per restaurant if review text is reachable.
- **Cuisine filtering is deliberately NOT in the collector.** The spec's "2–3 cuisine categories" is a *notebook* concern: grouping raw cuisine tags into categories is a normalization judgment call, and the binding boundary puts those in the notebook. The collector captures `cuisine_raw` verbatim for every restaurant in the target districts; Phase 2 narrows to the categories it wants. Adding a `--cuisines` flag here would push a judgment call into the parse-only layer and break the boundary.
- **Repo location:** `C:\Users\ADMIN\Desktop\SQL_Data_engineering_projects\Project\ShopeeFoodCollector\` — a new standalone git repo, sibling to `WebScraper`. Do **not** add this to the `WebScraper` repo (its schema is jobs/companies).

## File Structure

| Path | Responsibility |
|---|---|
| `README.md` | What it collects, how to capture headers, how to run, ToS/ethics note |
| `requirements.txt` | `requests`, `pytest` |
| `.gitignore` | `config.json`, `data/raw/`, `__pycache__/`, `.venv/` |
| `config.example.json` | Header/cookie template with placeholder values only |
| `conftest.py` | Empty. Its presence puts the repo root on `sys.path` so `from parse import ...` resolves under a bare `pytest` too. |
| `parse.py` | **Pure.** Raw JSON → `Restaurant` / `Review` dataclasses. All judgment-free field extraction. |
| `fetch.py` | HTTP session, headers from config, polite delay, retry, pagination |
| `collect.py` | CLI entry point; orchestrates fetch + parse, writes the snapshot |
| `tests/fixtures/restaurant_list.json` | Real captured listing response (from Task 1 spike) |
| `tests/fixtures/restaurant_reviews.json` | Real captured reviews response, if reachable |
| `tests/test_parse.py` | Parser tests against fixtures |
| `tests/test_fetch.py` | Session/delay tests, no network |
| `docs/spike-findings.md` | Go/no-go decision, observed JSON shape, branch selection |
| `data/raw/` | Snapshot output (gitignored) |

---

### Task 1: Spike — ToS check, repo skeleton, capture real responses, record go/no-go

This task resolves the spec's hard gate. Its output (real captured JSON) is the fixture base for every later task. **If this task ends in no-go, stop and consult the spec's fallback ladder — do not proceed to Task 2.**

**Files:**
- Create: `ShopeeFoodCollector/.gitignore`
- Create: `ShopeeFoodCollector/requirements.txt`
- Create: `ShopeeFoodCollector/config.example.json`
- Create: `ShopeeFoodCollector/tests/fixtures/restaurant_list.json`
- Create: `ShopeeFoodCollector/tests/fixtures/restaurant_reviews.json` (or record as unavailable)
- Create: `ShopeeFoodCollector/docs/spike-findings.md`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: fixture files at the two paths above; `docs/spike-findings.md` containing the observed JSON field paths that Task 2's parser maps from, and the branch decision (A = review-text mining, B = structured)

- [ ] **Step 1: Read ShopeeFood's Terms of Service and record the decision**

Open ShopeeFood's terms and read the sections on automated access and data use. Write the outcome into `docs/spike-findings.md` (created in Step 5) — proceed, proceed-with-limits, or stop. If the terms forbid collection outright, this is a no-go: stop and use the spec's fallback ladder (Tiki, then public dataset).

- [ ] **Step 2: Create the repo skeleton**

```bash
mkdir -p "C:/Users/ADMIN/Desktop/SQL_Data_engineering_projects/Project/ShopeeFoodCollector/tests/fixtures"
mkdir -p "C:/Users/ADMIN/Desktop/SQL_Data_engineering_projects/Project/ShopeeFoodCollector/docs"
mkdir -p "C:/Users/ADMIN/Desktop/SQL_Data_engineering_projects/Project/ShopeeFoodCollector/data/raw"
cd "C:/Users/ADMIN/Desktop/SQL_Data_engineering_projects/Project/ShopeeFoodCollector"
git init
```

Create `.gitignore`:

```gitignore
config.json
data/raw/
__pycache__/
*.pyc
.venv/
.pytest_cache/
```

Create `requirements.txt`:

```
requests>=2.31
pytest>=8.0
```

Create an empty `conftest.py` at the repo root. It has no contents — its only
job is to mark the root so pytest puts it on `sys.path`, letting the tests
`from parse import ...` even under a bare `pytest` invocation:

```bash
cd "C:/Users/ADMIN/Desktop/SQL_Data_engineering_projects/Project/ShopeeFoodCollector"
touch conftest.py
```

Create `config.example.json` — placeholder values only, never real cookies:

```json
{
  "base_url": "https://gappapi.deliverynow.vn",
  "headers": {
    "x-foody-api-version": "1",
    "x-foody-app-type": "1004",
    "x-foody-client-type": "1",
    "x-foody-client-version": "3.0.0",
    "User-Agent": "PASTE_YOUR_BROWSER_USER_AGENT",
    "Cookie": "PASTE_YOUR_BROWSER_COOKIE_HEADER"
  },
  "delay_seconds": [1.0, 3.0],
  "districts": ["Cau Giay", "Dong Da", "Hai Ba Trung", "Ba Dinh"]
}
```

- [ ] **Step 3: Capture a real restaurant-listing response**

In Chrome, open ShopeeFood and browse a Hanoi district's restaurant listing. Open DevTools → Network → filter XHR. Find the request that returns the restaurant list as JSON. Right-click → Copy → Copy response. Save it verbatim to:

`ShopeeFoodCollector/tests/fixtures/restaurant_list.json`

Also copy the request headers (Copy → Copy as cURL) and keep them for Step 6 — they are what `config.json` will hold.

**Success criterion:** the file parses as JSON and contains an array of restaurant objects with at least a name and an id.

- [ ] **Step 4: Capture a real reviews response (this decides the branch)**

Open a single restaurant's page, scroll to its reviews, and find the XHR that returns review data. Save the response to:

`ShopeeFoodCollector/tests/fixtures/restaurant_reviews.json`

**If review text is present and readable** → Branch A (review-text mining) is available.
**If reviews are absent, empty, or contain no free text** → Branch B (structured rating drivers). Record this, delete the empty fixture, and note that `test_parse_reviews` in Task 2 is skipped.

- [ ] **Step 5: Write the spike findings**

Create `docs/spike-findings.md`:

```markdown
# Spike findings — ShopeeFood collection feasibility

**Date:** <today>
**Decision:** GO | NO-GO

## Terms of Service
<what the terms say about automated access; the call made and why>

## Restaurant listing
- Endpoint: <URL captured in Step 3>
- Response shape: <top-level key holding the array, e.g. `reply.delivery_infos`>
- Field paths observed (source path -> our field):
  - `<path>` -> restaurant_id
  - `<path>` -> name
  - `<path>` -> rating
  - `<path>` -> review_count
  - `<path>` -> district
  - `<path>` -> cuisine_raw
  - `<path>` -> price_min / price_max
  - `<path>` -> delivery_fee
  - `<path>` -> url

## Reviews
- Reachable: YES | NO
- Endpoint: <URL or "n/a">
- Field paths observed: <as above, or "n/a">

## Branch selected
BRANCH A (review-text mining) | BRANCH B (structured rating drivers)
Reason: <one line>
```

Fill in every `<...>` from what you actually observed. This file is what Task 2 reads to write the parser — an unfilled placeholder here blocks Task 2.

- [ ] **Step 6: Create your local config (never committed)**

Copy `config.example.json` to `config.json` and paste in the real User-Agent and Cookie header captured in Step 3. Verify it is ignored:

Run: `git status --short`
Expected: `config.json` does **not** appear in the output.

- [ ] **Step 7: Commit**

```bash
cd "C:/Users/ADMIN/Desktop/SQL_Data_engineering_projects/Project/ShopeeFoodCollector"
git add .gitignore requirements.txt conftest.py config.example.json tests/fixtures docs/spike-findings.md
git commit -m "spike: confirm ShopeeFood collection feasibility, capture fixtures"
```

---

### Task 2: Pure parser — raw JSON to typed records

**Files:**
- Create: `ShopeeFoodCollector/parse.py`
- Create: `ShopeeFoodCollector/tests/test_parse.py`

**Interfaces:**
- Consumes: `tests/fixtures/restaurant_list.json`, `tests/fixtures/restaurant_reviews.json`, and the field-path mapping recorded in `docs/spike-findings.md` (Task 1)
- Produces:
  - `@dataclass Restaurant(restaurant_id: str, name: str, district: str | None, cuisine_raw: list[str], rating: float | None, review_count: int | None, price_min: int | None, price_max: int | None, delivery_fee: int | None, url: str, collected_at: str)`
  - `@dataclass Review(review_id: str, restaurant_id: str, rating: int | None, text: str, created_at: str | None)`
  - `parse_restaurants(raw: dict, collected_at: str) -> list[Restaurant]`
  - `parse_reviews(raw: dict, restaurant_id: str) -> list[Review]`

**Boundary reminder:** this module extracts fields as-is. No price banding, no cuisine normalization, no district cleanup, no dedup. Missing values become `None`, not defaults.

- [ ] **Step 1: Write the failing tests**

Create `tests/test_parse.py`:

```python
import json
from pathlib import Path

import pytest

from parse import Restaurant, Review, parse_restaurants, parse_reviews

FIXTURES = Path(__file__).parent / "fixtures"
LIST_FIXTURE = FIXTURES / "restaurant_list.json"
REVIEW_FIXTURE = FIXTURES / "restaurant_reviews.json"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_parse_restaurants_returns_records():
    rows = parse_restaurants(load(LIST_FIXTURE), collected_at="2026-07-22T00:00:00")
    assert len(rows) > 0
    assert all(isinstance(r, Restaurant) for r in rows)


def test_parse_restaurants_populates_identity_fields():
    rows = parse_restaurants(load(LIST_FIXTURE), collected_at="2026-07-22T00:00:00")
    first = rows[0]
    assert first.restaurant_id
    assert first.name
    assert first.url.startswith("http")
    assert first.collected_at == "2026-07-22T00:00:00"


def test_parse_restaurants_ids_are_unique():
    rows = parse_restaurants(load(LIST_FIXTURE), collected_at="2026-07-22T00:00:00")
    ids = [r.restaurant_id for r in rows]
    assert len(ids) == len(set(ids))


def test_parse_restaurants_missing_fields_become_none_not_defaults():
    # Parser must not invent values. An empty payload yields no rows,
    # and a row with no rating must carry None rather than 0.
    rows = parse_restaurants({}, collected_at="2026-07-22T00:00:00")
    assert rows == []


@pytest.mark.skipif(
    not REVIEW_FIXTURE.exists(),
    reason="Branch B: review text not reachable (see docs/spike-findings.md)",
)
def test_parse_reviews_returns_records_with_text():
    rows = parse_reviews(load(REVIEW_FIXTURE), restaurant_id="test-id")
    assert len(rows) > 0
    assert all(isinstance(r, Review) for r in rows)
    assert all(r.restaurant_id == "test-id" for r in rows)
    assert any(r.text.strip() for r in rows)
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd "C:/Users/ADMIN/Desktop/SQL_Data_engineering_projects/Project/ShopeeFoodCollector"
python -m pytest tests/test_parse.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'parse'` (or `ImportError` on the names).

- [ ] **Step 3: Write the parser**

Create `parse.py`. Replace each `SOURCE_PATH` comment with the real field path recorded in `docs/spike-findings.md` — the `_get` helper walks a dotted path so the mapping stays declarative:

```python
"""Pure parsing of ShopeeFood responses into typed records.

Boundary (spec: Collector / notebook boundary): this module extracts fields
as they arrive. No normalization, no derived fields, no deduplication.
Missing values are None.
"""
from dataclasses import dataclass


@dataclass
class Restaurant:
    restaurant_id: str
    name: str
    district: str | None
    cuisine_raw: list[str]
    rating: float | None
    review_count: int | None
    price_min: int | None
    price_max: int | None
    delivery_fee: int | None
    url: str
    collected_at: str


@dataclass
class Review:
    review_id: str
    restaurant_id: str
    rating: int | None
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


# Top-level path to the array of restaurant objects.
# From docs/spike-findings.md -> "Response shape".
RESTAURANTS_ROOT = "reply.delivery_infos"   # SOURCE_PATH: confirm against fixture
REVIEWS_ROOT = "reply.reviews"              # SOURCE_PATH: confirm against fixture


def parse_restaurants(raw, collected_at):
    rows = _get(raw, RESTAURANTS_ROOT, default=[]) or []
    out = []
    for item in rows:
        rid = _get(item, "restaurant_id")          # SOURCE_PATH
        name = _get(item, "name")                  # SOURCE_PATH
        if not rid or not name:
            continue
        out.append(
            Restaurant(
                restaurant_id=str(rid),
                name=name,
                district=_get(item, "address.district"),        # SOURCE_PATH
                cuisine_raw=_get(item, "cuisines", default=[]) or [],  # SOURCE_PATH
                rating=_get(item, "rating.avg"),                # SOURCE_PATH
                review_count=_get(item, "rating.total_review"), # SOURCE_PATH
                price_min=_get(item, "price_range.min_price"),  # SOURCE_PATH
                price_max=_get(item, "price_range.max_price"),  # SOURCE_PATH
                delivery_fee=_get(item, "delivery.fee"),        # SOURCE_PATH
                url=_get(item, "url", default=""),              # SOURCE_PATH
                collected_at=collected_at,
            )
        )
    return out


def parse_reviews(raw, restaurant_id):
    rows = _get(raw, REVIEWS_ROOT, default=[]) or []
    out = []
    for item in rows:
        vid = _get(item, "review_id")   # SOURCE_PATH
        if not vid:
            continue
        out.append(
            Review(
                review_id=str(vid),
                restaurant_id=restaurant_id,
                rating=_get(item, "rating"),          # SOURCE_PATH
                text=_get(item, "comment", default="") or "",  # SOURCE_PATH
                created_at=_get(item, "created_at"),  # SOURCE_PATH
            )
        )
    return out
```

Open `tests/fixtures/restaurant_list.json`, compare against `docs/spike-findings.md`, and correct every `SOURCE_PATH` line to the real path. The tests are the check that you got it right.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
python -m pytest tests/test_parse.py -v
```

Expected: PASS (the reviews test PASSES on Branch A, SKIPS on Branch B).

- [ ] **Step 5: Commit**

```bash
git add parse.py tests/test_parse.py
git commit -m "feat: parse ShopeeFood listings and reviews into typed records"
```

---

### Task 3: HTTP session with polite rate limiting

**Files:**
- Create: `ShopeeFoodCollector/fetch.py`
- Create: `ShopeeFoodCollector/tests/test_fetch.py`

**Interfaces:**
- Consumes: `config.json` (shape defined by `config.example.json`, Task 1)
- Produces:
  - `load_config(path: str = "config.json") -> dict`
  - `build_session(config: dict) -> requests.Session`
  - `polite_delay(config: dict) -> None`
  - `get_json(session: requests.Session, url: str, params: dict | None, config: dict) -> dict`

`get_json` applies `polite_delay` before every request and retries up to 3 times on connection errors and 5xx, with a doubling backoff. It raises on 4xx (a 403 means the captured headers are stale — that is a real failure, not something to retry past).

- [ ] **Step 1: Write the failing tests**

Create `tests/test_fetch.py`:

```python
import json

import pytest

from fetch import build_session, load_config, polite_delay

CONFIG = {
    "base_url": "https://example.invalid",
    "headers": {"User-Agent": "test-agent", "Cookie": "test-cookie"},
    "delay_seconds": [1.0, 3.0],
    "districts": ["Cau Giay"],
}


def test_load_config_reads_file(tmp_path):
    path = tmp_path / "config.json"
    path.write_text(json.dumps(CONFIG), encoding="utf-8")
    assert load_config(str(path))["base_url"] == "https://example.invalid"


def test_load_config_missing_file_is_a_clear_error(tmp_path):
    with pytest.raises(FileNotFoundError):
        load_config(str(tmp_path / "nope.json"))


def test_build_session_applies_configured_headers():
    session = build_session(CONFIG)
    assert session.headers["User-Agent"] == "test-agent"
    assert session.headers["Cookie"] == "test-cookie"


def test_polite_delay_sleeps_within_configured_bounds(monkeypatch):
    slept = []
    monkeypatch.setattr("fetch.time.sleep", lambda s: slept.append(s))
    for _ in range(20):
        polite_delay(CONFIG)
    assert len(slept) == 20
    assert all(1.0 <= s <= 3.0 for s in slept)
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
python -m pytest tests/test_fetch.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'fetch'`.

- [ ] **Step 3: Write the fetcher**

Create `fetch.py`:

```python
"""HTTP session, polite rate limiting, and retry for ShopeeFood collection."""
import json
import logging
import random
import time
from pathlib import Path

import requests

log = logging.getLogger(__name__)

MAX_RETRIES = 3


def load_config(path="config.json"):
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(
            f"{path} not found. Copy config.example.json to config.json and "
            "paste in the User-Agent and Cookie captured from your browser."
        )
    return json.loads(p.read_text(encoding="utf-8"))


def build_session(config):
    session = requests.Session()
    session.headers.update(config["headers"])
    return session


def polite_delay(config):
    low, high = config.get("delay_seconds", [1.0, 3.0])
    time.sleep(random.uniform(low, high))


def get_json(session, url, params, config):
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

        if resp.status_code >= 500:
            if attempt == MAX_RETRIES:
                resp.raise_for_status()
            log.warning("HTTP %s, retry %s/%s", resp.status_code, attempt, MAX_RETRIES)
            time.sleep(backoff)
            backoff *= 2
            continue

        if resp.status_code == 403:
            raise RuntimeError(
                "HTTP 403 — captured headers are stale. Re-capture the Cookie and "
                "User-Agent from a fresh browser session into config.json."
            )

        resp.raise_for_status()
        return resp.json()
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
python -m pytest tests/test_fetch.py -v
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add fetch.py tests/test_fetch.py
git commit -m "feat: rate-limited HTTP session with retry and stale-header detection"
```

---

### Task 4: CLI — collect and write the raw snapshot

**Files:**
- Create: `ShopeeFoodCollector/collect.py`
- Modify: `ShopeeFoodCollector/tests/test_parse.py` (add the snapshot test below)

**Interfaces:**
- Consumes: `load_config`, `build_session`, `get_json` (Task 3); `parse_restaurants`, `parse_reviews`, `Restaurant`, `Review` (Task 2)
- Produces:
  - `build_snapshot(restaurants: list[Restaurant], reviews: list[Review], collected_at: str) -> dict`
  - `write_snapshot(snapshot: dict, out_dir: str = "data/raw") -> Path`
  - CLI: `python collect.py --districts "Cau Giay,Dong Da" --max-restaurants 400 [--reviews-per-restaurant 20] [--no-reviews]`

Snapshot format:

```json
{
  "collected_at": "2026-07-22T10:00:00",
  "source": "shopeefood",
  "restaurant_count": 412,
  "review_count": 6180,
  "restaurants": [ ... ],
  "reviews": [ ... ]
}
```

- [ ] **Step 1: Write the failing test**

Append to `tests/test_parse.py`:

```python
from collect import build_snapshot
from parse import Restaurant


def _restaurant(rid):
    return Restaurant(
        restaurant_id=rid, name=f"Quan {rid}", district="Cau Giay",
        cuisine_raw=["Com"], rating=4.5, review_count=10,
        price_min=30000, price_max=90000, delivery_fee=15000,
        url=f"https://shopeefood.vn/{rid}", collected_at="2026-07-22T00:00:00",
    )


def test_build_snapshot_counts_match_payload():
    snap = build_snapshot(
        restaurants=[_restaurant("a"), _restaurant("b")],
        reviews=[],
        collected_at="2026-07-22T00:00:00",
    )
    assert snap["restaurant_count"] == 2
    assert snap["review_count"] == 0
    assert snap["source"] == "shopeefood"
    assert snap["collected_at"] == "2026-07-22T00:00:00"
    assert len(snap["restaurants"]) == 2


def test_build_snapshot_serialises_dataclasses_to_dicts():
    snap = build_snapshot([_restaurant("a")], [], "2026-07-22T00:00:00")
    first = snap["restaurants"][0]
    assert isinstance(first, dict)
    assert first["restaurant_id"] == "a"
    assert first["cuisine_raw"] == ["Com"]
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
python -m pytest tests/test_parse.py -v -k snapshot
```

Expected: FAIL — `ModuleNotFoundError: No module named 'collect'`.

- [ ] **Step 3: Write the CLI**

Create `collect.py`:

```python
"""Collect ShopeeFood Hanoi restaurant records into a local raw snapshot.

The snapshot is raw by design (spec: collector is parse-only) and is
gitignored — cleaning and analysis happen in the Colab notebook.
"""
import argparse
import json
import logging
from dataclasses import asdict
from datetime import datetime
from pathlib import Path

from fetch import build_session, get_json, load_config
from parse import parse_restaurants, parse_reviews

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


def build_snapshot(restaurants, reviews, collected_at):
    return {
        "collected_at": collected_at,
        "source": "shopeefood",
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
    path.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return path


def main():
    ap = argparse.ArgumentParser(description="Collect ShopeeFood Hanoi restaurants.")
    ap.add_argument("--districts", help="Comma-separated; defaults to config.json")
    ap.add_argument("--max-restaurants", type=int, default=500)
    ap.add_argument("--reviews-per-restaurant", type=int, default=20)
    ap.add_argument("--no-reviews", action="store_true")
    args = ap.parse_args()

    config = load_config()
    session = build_session(config)
    districts = (
        [d.strip() for d in args.districts.split(",")]
        if args.districts
        else config["districts"]
    )
    collected_at = datetime.now().isoformat(timespec="seconds")

    restaurants, reviews = [], []
    for district in districts:
        if len(restaurants) >= args.max_restaurants:
            break
        log.info("collecting district: %s", district)
        raw = get_json(
            session,
            f"{config['base_url']}/api/delivery/get_infos",  # confirm in spike-findings.md
            {"district": district},
            config,
        )
        found = parse_restaurants(raw, collected_at)
        log.info("  %s restaurants", len(found))
        restaurants.extend(found[: args.max_restaurants - len(restaurants)])

    if not args.no_reviews:
        for r in restaurants:
            raw = get_json(
                session,
                f"{config['base_url']}/api/delivery/get_reviews",  # confirm in spike-findings.md
                {"restaurant_id": r.restaurant_id, "limit": args.reviews_per_restaurant},
                config,
            )
            reviews.extend(parse_reviews(raw, r.restaurant_id))
        log.info("collected %s reviews", len(reviews))

    path = write_snapshot(build_snapshot(restaurants, reviews, collected_at))
    log.info("wrote %s (%s restaurants, %s reviews)", path, len(restaurants), len(reviews))


if __name__ == "__main__":
    main()
```

Correct the two endpoint paths marked `confirm in spike-findings.md` against the URLs recorded in Task 1. On Branch B, run with `--no-reviews`.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
python -m pytest tests/ -v
```

Expected: PASS — all parser, fetch, and snapshot tests green.

- [ ] **Step 5: Run a small live collection to prove it works end to end**

```bash
python collect.py --districts "Cau Giay" --max-restaurants 20 --reviews-per-restaurant 5
```

Expected: log lines showing the district collected and a final `wrote data/raw/snapshot_*.json` line. Open the file and confirm it holds real restaurant names.

If this raises the 403 error from Task 3, re-capture the Cookie/User-Agent into `config.json` and retry.

- [ ] **Step 6: Confirm the snapshot is not tracked by git**

```bash
git status --short
```

Expected: no `data/raw/` entries. If any appear, fix `.gitignore` before committing.

- [ ] **Step 7: Commit**

```bash
git add collect.py tests/test_parse.py
git commit -m "feat: CLI collection into a local raw snapshot"
```

---

### Task 5: Full MVP collection run, README, and publish the repo

**Files:**
- Create: `ShopeeFoodCollector/README.md`
- Modify: `ShopeeFoodCollector/docs/spike-findings.md` (append the run record)

**Interfaces:**
- Consumes: the working CLI from Task 4
- Produces: a full MVP snapshot in `data/raw/` (local only) that Phase 2's notebook reads; a public repo the portfolio page can link

- [ ] **Step 1: Run the full MVP collection**

```bash
python collect.py --districts "Cau Giay,Dong Da,Hai Ba Trung,Ba Dinh" --max-restaurants 500 --reviews-per-restaurant 20
```

On Branch B, append `--no-reviews`.

Expected: a snapshot with roughly 300–500 restaurants. This runs at 1–3 s per request, so a few hundred restaurants plus their reviews takes a while — that is the polite-throttling constraint working as intended, not a hang.

- [ ] **Step 2: Record what was actually collected**

Append to `docs/spike-findings.md`:

```markdown
## MVP collection run
- Date: <date>
- Districts: <list>
- Restaurants collected: <n>
- Reviews collected: <n or "n/a — Branch B">
- Snapshot file: data/raw/snapshot_<stamp>.json (local only, not committed)
```

- [ ] **Step 3: Write the README**

Create `README.md`:

```markdown
# ShopeeFood Hanoi Restaurant Collector

Collects public restaurant listings (and reviews, where available) from
ShopeeFood for Hanoi districts, into a local JSON snapshot. Built as the
collection stage of a data-analysis portfolio project.

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

Open ShopeeFood in your browser, open DevTools, find a restaurant-listing XHR
request, and copy its `User-Agent` and `Cookie` headers into `config.json`.
`config.json` is gitignored and must never be committed.

## Run

```bash
python collect.py --districts "Cau Giay,Dong Da" --max-restaurants 400
python collect.py --districts "Cau Giay" --no-reviews      # listings only
```

Output: `data/raw/snapshot_<timestamp>.json` (gitignored).

## Tests

```bash
python -m pytest tests/ -v
```

Tests run against committed fixture files and never touch the live site.

## Collection ethics

- Requests are throttled with a random 1–3 s delay.
- Raw scraped records stay local. They are never committed here and never
  published. Only aggregate figures are published in the write-up.
- ShopeeFood's terms of service were reviewed before collection; see
  `docs/spike-findings.md`.
```

- [ ] **Step 4: Verify no secrets or raw data are staged**

```bash
git status --short
git ls-files | grep -E "config\.json$|data/raw" || echo "CLEAN — no secrets or raw data tracked"
```

Expected: `CLEAN — no secrets or raw data tracked`. If `config.json` or anything under `data/raw/` is tracked, remove it from the index before continuing — it contains a session cookie and scraped records.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/spike-findings.md
git commit -m "docs: README and MVP collection run record"
```

- [ ] **Step 6: Publish the repo**

```bash
gh repo create ShopeeFoodCollector --public --source=. --remote=origin --push
```

Expected: the repo is created and pushed. Save the URL — Phase 3's portfolio page links to it.

If `gh` is not authenticated, this is a user step: authenticate with `gh auth login`, or create the repo in the GitHub UI and `git remote add origin <url> && git push -u origin main`.

---

## Phase 1 done — what comes next

At this point you have a tested, published collector and a local raw snapshot of
300–500 Hanoi restaurants. The spike gate is resolved and the branch is recorded
in `docs/spike-findings.md`.

**Do not start the analysis from this plan.** Phase 2 (the Colab notebook —
cleaning plus either the Branch A complaint taxonomy or the Branch B driver
analysis) gets its own plan, written once the branch is known, so its tasks
describe real work rather than both possibilities. Phase 3 (the `Project5.jsx`
portfolio page) follows after Phase 2 produces the aggregate dataset.
