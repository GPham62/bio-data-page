# Frontpage Personal Overhaul — Design Spec

**Date:** 2026-06-22
**Status:** Approved

---

## Goal

Give the Home page a genuine personal identity — more story, more personality, less generic dark-mode dev template. Aesthetic: playful-technical (keep dark aesthetic, bold type choices, unexpected colour pops, game-dev DNA visible).

---

## Section 1 — Hero (replaces current `.greetSection`)

**Layout:** 2-column on desktop (photo left, content right). Stacks to 1 column on mobile.

**Photo:**
- Left column: circular placeholder `<div>` (120px diameter), dashed `--border` border, centred "[ photo ]" text in `--muted` mono. Class name: `.heroPic`.
- Swap in a real `<img>` when the user provides a photo — no code change needed beyond replacing the div with an img.

**Content (right column):**
- Kicker: `// hello` (unchanged)
- `<h1>`: `Hey, I'm Tuấn Anh 👋` (unchanged)
- Tagline `<p>` (new, replaces the two `greetText` paragraphs):
  > "Ex game dev. Still figuring out why humans do what they do — now with data instead of level design."
- "Currently" block (new `.currentlyBlock`):
  - Three rows, each: icon · label · value
  - `🎮 Playing` → `Heroes of Might & Magic: Olden Era · Helldivers 2`
  - `📚 Reading` → `Theory of Fun — Raph Koster`
  - `🛠️ Building` → `Data portfolio + job hunt`
  - Styled with monospace font, subtle `--bg2` background, thin `--border` border, `--purple` left accent.

**i18n keys** (both `en.json` + `vi.json`):
```
home.greeting.tagline
home.greeting.currently.playing
home.greeting.currently.reading
home.greeting.currently.building
home.greeting.currently.label_playing
home.greeting.currently.label_reading
home.greeting.currently.label_building
```
Remove old keys: `home.greeting.p1`, `home.greeting.p2`.

---

## Section 2 — Character Sheet (replaces "What I Can Do" cards)

**Concept:** RPG player-profile card styled as a game UI panel.

**Structure:**
```
┌─ PLAYER PROFILE ──────────────────────────┐
│  CLASS      Data Analyst                  │
│  FORMER     Game Developer                │
│  LEVEL      Junior                        │
│  EXP        4 years (3 game dev · 1 DA)  │
├───────────────────────────────────────────┤
│  SQL        ████████████░░░░  Advanced    │
│  Python     ████████░░░░░░░░  Intermediate│
│  Power BI   ████████░░░░░░░░  Intermediate│
│  Excel      ██████░░░░░░░░░░  Intermediate│
│  Unity/C#   ████████████████  Expert ↩   │
└───────────────────────────────────────────┘
```

**Visual:**
- Outer card: `--bg2` background, 1px `--purple` border, `border-radius: 10px`, monospace font throughout.
- Header rows (CLASS/FORMER/LEVEL/EXP): label in `--muted`, value in `--text`.
- Divider between header and bars: 1px `--border`.
- Stat bars: CSS `<div>` with inner filled `<div>`. Fill colour: `--accent-blue`. Background: `rgba(89,136,255,0.1)`.
- Bar widths (out of 100%): SQL 78%, Python 50%, Power BI 50%, Excel 38%, Unity/C# 100%.
- Unity/C# row: fill colour `--purple` (not blue), opacity 0.5, label has `↩ former` suffix in `--muted`.
- Section title: `02` → `PLAYER PROFILE` (update SectionTitle props).

**i18n keys:**
```
home.charSheet.title  →  "Player Profile"
home.charSheet.sub    →  "Stats compiled from 4 years in the field."
home.charSheet.class  →  "Data Analyst"
home.charSheet.former →  "Game Developer"
home.charSheet.level  →  "Junior"
home.charSheet.exp    →  "4 years (3 game dev · 1 self-directed DA)"
home.charSheet.skills →  array of { name, level, pct, former? }
```

Skills array (both locales):
```json
[
  { "name": "SQL",       "level": "Advanced",     "pct": 78 },
  { "name": "Python",    "level": "Intermediate",  "pct": 50 },
  { "name": "Power BI",  "level": "Intermediate",  "pct": 50 },
  { "name": "Excel",     "level": "Intermediate",  "pct": 38 },
  { "name": "Unity/C#",  "level": "Expert",        "pct": 100, "former": true }
]
```

**Remove:** `whatIDo` locale keys, `WHATIDO_ICONS` array, `IconCollect`/`IconProcess`/`IconVisualize` SVG functions, `.whatIDoGrid/.whatIDoCard/.whatIDoIconWrap/.whatIDoTitle/.whatIDoDesc/.skillRow/.skillTag` CSS classes.

---

## Section 3 — Game Showcase (new section, index `03`)

**Concept:** 3-column grid, each column = one shipped game with a CSS pixel-art canvas above it.

**Games (top 2-3 from Zitga):**
1. Relic Bag: Shadow Hunter — genre: Puzzle · Action
2. Shadow War: Idle RPG Survival — genre: Idle · RPG
3. Space War Idle RPG — genre: Idle · Strategy

**Pixel art:**
- Each game gets an `<canvas>` element (80×80 logical px, 2× device pixel ratio via JS).
- Art style: retro 8-bit, ~16 colour palette, `--purple` + `--accent-blue` + white + dark on transparent/dark bg.
- Relic Bag → stickman fighter silhouette holding a bag/weapon.
- Shadow War → shadowy warrior / idle RPG monster.
- Space War → small pixel spaceship.
- All drawn with `ctx.fillRect()` calls — no image assets, no external libs.
- Canvas function names: `drawRelicBag(ctx)`, `drawShadowWar(ctx)`, `drawSpaceWar(ctx)`.

**Card layout (per game):**
```
[ canvas 80×80 ]
Game Title
Genre badge (mono, --purple border)
↗ Play Store   (link, opens new tab)
```

**CSS:**
- Grid: `repeat(3, 1fr)`, gap 20px.
- Card: `--bg2` bg, 1px `--purple` border, `border-radius: 10px`, `padding: 24px`, `text-align: center`.
- Hover: `border-color: var(--purple)`, `transform: translateY(-3px)`.
- Collapses to 1 column at 640px.

**Section title:** `03` → `Shipped Games` / `"Three games that went live."`.

**i18n keys:**
```
home.games.title   → "Shipped Games"
home.games.sub     → "Three games that went live on Google Play."
home.games.cta     → "Play Store ↗"
```
Game names/genres stay in the `GAMES` JS array (not localised — proper nouns).

**Keep the existing 5-game card grid** in the About section (section 04) — it shows full catalogue. The new section 03 is the visual showcase for the 3 Zitga games only.

---

## Section 4 — About Me (enhanced, index `04`)

**Keep:** Career switch pivot box (unchanged content, unchanged style).

**Add:** "How I Think" block immediately below the pivot box, before the games label.

```
┌─ HOW I THINK ─────────────────────────────┐  (--purple left accent)
│  I approach problems the way I designed   │
│  game systems — find the feedback loop,   │
│  measure what changes behaviour, cut      │
│  what doesn't move the needle.            │
│                                           │
│  Theory of Fun put words to it: learning  │
│  IS the fun. Data analysis is the same    │
│  thing with a different dataset.          │
└───────────────────────────────────────────┘
```

**Styling:** Same box style as `.pivotBox` but with `--purple` left accent instead of `--accent-blue`. New class: `.thinkBox`.

**i18n keys:**
```
home.about.think_label  → "How I Think"
home.about.think_text   → "I approach problems the way I designed game systems — find the feedback loop, measure what changes behaviour, cut what doesn't move the needle. Theory of Fun put words to it: learning IS the fun. Data analysis is the same thing with a different dataset."
```

Vietnamese translation of `think_text`:
> "Mình tiếp cận vấn đề theo cách mình từng thiết kế game system — tìm vòng phản hồi, đo cái gì thay đổi hành vi, cắt bỏ cái không hiệu quả. Theory of Fun nói đúng: học mới là niềm vui. Phân tích dữ liệu cũng thế, chỉ là đổi dataset thôi."

---

## Visual / Global Changes

- **Purple accent:** used boldly in Character Sheet border, game showcase card border, "How I Think" box accent, Unity/C# stat bar fill — previously only used in game card hover.
- **Section numbering shift:** 01 whatIDo → removed; 01 hero (implicit), 02 Character Sheet (was 01), 03 Game Showcase (new), 04 About (was 02), 05 Projects (was 03), 06 Contact.
- **No new dependencies.** Canvas pixel art is pure JS. No Three.js, no image assets.

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Home.jsx` | Rewrite hero, replace whatIDo with charSheet, add game showcase section, add thinkBox |
| `src/pages/Home.module.css` | Add `.heroRow`, `.heroPic`, `.tagline`, `.currentlyBlock`, `.charSheet*`, `.gameShowcase*`, `.thinkBox`; remove `.whatIDo*`, `.skillRow`, `.skillTag` |
| `src/locales/en.json` | Add all new keys; remove `home.whatIDo`, `home.greeting.p1/p2` |
| `src/locales/vi.json` | Same |

---

## Out of Scope

- No dedicated About page (separate project if needed).
- No Three.js or external 3D libs.
- No photo — placeholder only; user swaps in real photo later.
- No changes to Project pages, Resume page, or Sidebar.
