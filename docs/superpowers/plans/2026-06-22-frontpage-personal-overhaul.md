# Frontpage Personal Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic hero + "What I Can Do" cards with a personal 2-column hero, RPG character sheet, CSS pixel-art game showcase, and a "How I Think" mindset block.

**Architecture:** All changes are confined to `Home.jsx`, `Home.module.css`, `en.json`, and `vi.json`. No new files. No new dependencies. Canvas pixel art uses pure `ctx.fillRect()` calls defined at module level.

**Tech Stack:** React 18, CSS Modules, react-i18next, HTML5 Canvas

## Global Constraints

- Every user-visible string change must update BOTH `src/locales/en.json` AND `src/locales/vi.json` in the same commit — never leave one locale ahead.
- No new npm dependencies.
- CSS variable names: `--purple`, `--accent-blue`, `--bg2`, `--border`, `--text`, `--muted`, `--mono`, `--head`. Do not hardcode hex colour values in CSS — use these vars. (Canvas drawing functions are the only exception: they must use hex `#a371f7` for purple and `#5988ff` for blue since `ctx.fillStyle` does not accept CSS variables.)
- Section index strings in `SectionTitle` are hardcoded props (not from locale): `"02"` for Player Profile, `"03"` for Shipped Games, `"04"` for A Bit About Me, `"05"` for Selected Projects.
- `image-rendering: pixelated` must be applied to all canvas elements so the retro pixel look is preserved at any DPR.
- Keep the existing 5-game card grid in the About section — the new Section 3 shows only the 3 Zitga showcase games.

---

## File Map

| File | What changes |
|------|-------------|
| `src/pages/Home.jsx` | Rewrite hero; add `PixelCanvas` + 3 draw fns; replace `whatIDo` section with `charSheet`; add `gameShowcase` section; add `thinkBox` to about section; update SectionTitle index props |
| `src/pages/Home.module.css` | Add new classes for every new section; remove `.whatIDo*`, `.skillRow`, `.skillTag` |
| `src/locales/en.json` | Add `greeting.tagline + currently.*`, `charSheet.*`, `games.*`, `about.think_*`; remove `greeting.p1/p2`, `whatIDo` subtree |
| `src/locales/vi.json` | Identical structural change, Vietnamese values |

---

### Task 1: Hero — 2-column layout, tagline, Currently block

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/Home.module.css`
- Modify: `src/locales/en.json`
- Modify: `src/locales/vi.json`

**Interfaces:**
- Produces: `.heroRow` layout with `.heroPic` placeholder and `.currentlyBlock`
- Consumes: i18n keys `home.greeting.tagline`, `home.greeting.currently.*`

- [ ] **Step 1: Add locale keys to `en.json`**

Replace the `"greeting"` object in `src/locales/en.json`:

```json
"greeting": {
  "kicker": "// hello",
  "title": "Hey, I'm Tuấn Anh 👋",
  "tagline": "Ex game dev. Still figuring out why humans do what they do — now with data instead of level design.",
  "currently": {
    "label_playing": "Playing",
    "label_reading": "Reading",
    "label_building": "Building",
    "playing": "Heroes of Might & Magic: Olden Era · Helldivers 2",
    "reading": "Theory of Fun — Raph Koster",
    "building": "Data portfolio + job hunt"
  }
}
```

(Remove `"p1"` and `"p2"` keys.)

- [ ] **Step 2: Add locale keys to `vi.json`**

Replace the `"greeting"` object in `src/locales/vi.json` with the same structure, Vietnamese values:

```json
"greeting": {
  "kicker": "// hello",
  "title": "Hey, I'm Tuấn Anh 👋",
  "tagline": "Cựu game dev. Vẫn đang tìm hiểu tại sao con người làm những thứ họ làm — giờ với dữ liệu thay vì level design.",
  "currently": {
    "label_playing": "Đang chơi",
    "label_reading": "Đang đọc",
    "label_building": "Đang làm",
    "playing": "Heroes of Might & Magic: Olden Era · Helldivers 2",
    "reading": "Theory of Fun — Raph Koster",
    "building": "Portfolio dữ liệu + tìm việc"
  }
}
```

- [ ] **Step 3: Add CSS classes to `Home.module.css`**

Add these classes. Insert after the existing `/* ── Greeting hero ── */` comment block, replacing `.greetSection` with `.heroRow`:

```css
/* ── Hero ── */
.heroRow {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  align-items: flex-start;
  max-width: 780px;
  margin-bottom: 72px;
}

.heroPic {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px dashed var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
  flex-shrink: 0;
  letter-spacing: 0.06em;
}

.tagline {
  font-size: 16px;
  line-height: 1.85;
  color: var(--muted);
  margin: 0 0 24px;
  font-style: italic;
}

.currentlyBlock {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-left: 2px solid var(--purple);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.currentlyRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.currentlyIcon {
  font-size: 16px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.currentlyLabel {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  min-width: 72px;
  flex-shrink: 0;
}

.currentlyVal {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text);
}
```

Also **remove** the old `.greetSection` block.

- [ ] **Step 4: Rewrite the hero section in `Home.jsx`**

Replace the `<section className={... greetSection ...}>` block with:

```jsx
{/* ── Hero ── */}
<section className={`${styles.heroRow} fade-up`}>
  <div className={styles.heroPic}>[ photo ]</div>
  <div>
    <span className={styles.greetKicker}>{t('home.greeting.kicker')}</span>
    <h1 className={styles.greetTitle}>{t('home.greeting.title')}</h1>
    <p className={styles.tagline}>{t('home.greeting.tagline')}</p>
    <div className={styles.currentlyBlock}>
      <div className={styles.currentlyRow}>
        <span className={styles.currentlyIcon}>🎮</span>
        <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_playing')}</span>
        <span className={styles.currentlyVal}>{t('home.greeting.currently.playing')}</span>
      </div>
      <div className={styles.currentlyRow}>
        <span className={styles.currentlyIcon}>📚</span>
        <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_reading')}</span>
        <span className={styles.currentlyVal}>{t('home.greeting.currently.reading')}</span>
      </div>
      <div className={styles.currentlyRow}>
        <span className={styles.currentlyIcon}>🛠️</span>
        <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_building')}</span>
        <span className={styles.currentlyVal}>{t('home.greeting.currently.building')}</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Add responsive CSS at bottom of `Home.module.css`**

In the `@media (max-width: 860px)` block, add:

```css
.heroRow { grid-template-columns: 1fr; }
.heroPic { margin: 0 auto; }
```

- [ ] **Step 6: Run the dev server and verify in browser**

```
npm run dev
```

Open `http://localhost:5173`. Check:
- Desktop: photo placeholder (left) + kicker/title/tagline/currently (right), side by side
- Mobile (resize to 640px): photo centered, content below
- VI locale: toggle language, check Vietnamese strings appear

- [ ] **Step 7: Run existing tests to verify locale keys pass**

```
npx vitest run
```

Expected: all tests pass. If locale test fails because `p1`/`p2` keys were removed, that test was checking for old keys — update the test to expect the new `tagline` key instead.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.module.css src/locales/en.json src/locales/vi.json
git commit -m "feat: hero — 2-column layout, tagline, Currently block"
```

---

### Task 2: Character Sheet (replaces "What I Can Do")

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/Home.module.css`
- Modify: `src/locales/en.json`
- Modify: `src/locales/vi.json`

**Interfaces:**
- Consumes: `home.charSheet.*` i18n keys (including `skills` array with `name`, `level`, `pct`, `former?`)
- Produces: `.charSheet` panel with header rows + stat bars
- Replaces: entire `whatIDo` section (JSX + locale keys + CSS classes)

- [ ] **Step 1: Add `charSheet` locale keys to `en.json`**

Remove the entire `"whatIDo"` key from `src/locales/en.json` and add in its place:

```json
"charSheet": {
  "title": "Player Profile",
  "sub": "Stats compiled from 4 years in the field.",
  "class": "Data Analyst",
  "former": "Game Developer",
  "level": "Junior",
  "exp": "4 years (3 game dev · 1 self-directed DA)",
  "labels": {
    "class": "CLASS",
    "former": "FORMER",
    "level": "LEVEL",
    "exp": "EXP"
  },
  "skills": [
    { "name": "SQL",      "level": "Advanced",     "pct": 78 },
    { "name": "Python",   "level": "Intermediate",  "pct": 50 },
    { "name": "Power BI", "level": "Intermediate",  "pct": 50 },
    { "name": "Excel",    "level": "Intermediate",  "pct": 38 },
    { "name": "Unity/C#", "level": "Expert",        "pct": 100, "former": true }
  ]
}
```

- [ ] **Step 2: Add `charSheet` locale keys to `vi.json`**

Remove `"whatIDo"` from `vi.json` and add:

```json
"charSheet": {
  "title": "Hồ Sơ Nhân Vật",
  "sub": "Chỉ số tổng hợp từ 4 năm thực chiến.",
  "class": "Data Analyst",
  "former": "Game Developer",
  "level": "Junior",
  "exp": "4 năm (3 game dev · 1 tự học DA)",
  "labels": {
    "class": "NGHỀ",
    "former": "TRƯỚC ĐÂY",
    "level": "CẤP ĐỘ",
    "exp": "KINH NGHIỆM"
  },
  "skills": [
    { "name": "SQL",      "level": "Nâng cao",     "pct": 78 },
    { "name": "Python",   "level": "Trung bình",   "pct": 50 },
    { "name": "Power BI", "level": "Trung bình",   "pct": 50 },
    { "name": "Excel",    "level": "Trung bình",   "pct": 38 },
    { "name": "Unity/C#", "level": "Thành thạo",   "pct": 100, "former": true }
  ]
}
```

- [ ] **Step 3: Add Character Sheet CSS to `Home.module.css`**

Remove all `.whatIDo*`, `.skillRow`, `.skillTag` CSS classes. Add:

```css
/* ── Character Sheet ── */
.charSheet {
  background: var(--bg2);
  border: 1px solid var(--purple);
  border-radius: 10px;
  font-family: var(--mono);
  overflow: hidden;
  max-width: 680px;
}

.charSheetHeader {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.charRow {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.charLabel {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  min-width: 90px;
}

.charVal {
  font-size: 14px;
  color: var(--text);
}

.charDivider {
  height: 1px;
  background: var(--border);
}

.charSkills {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.statRow {
  display: grid;
  grid-template-columns: 80px 1fr 110px;
  align-items: center;
  gap: 14px;
}

.statName {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text);
}

.statNameFormer {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  opacity: 0.6;
}

.statBar {
  height: 7px;
  background: rgba(89, 136, 255, 0.1);
  border-radius: 100px;
  overflow: hidden;
}

.statBarFill {
  height: 100%;
  border-radius: 100px;
  background: var(--accent-blue);
}

.statBarFillFormer {
  height: 100%;
  border-radius: 100px;
  background: var(--purple);
  opacity: 0.5;
}

.statLevel {
  font-size: 10px;
  color: var(--muted);
  text-align: right;
  letter-spacing: 0.04em;
}

.statLevelFormer {
  font-size: 10px;
  color: var(--muted);
  text-align: right;
  letter-spacing: 0.04em;
  opacity: 0.5;
}
```

- [ ] **Step 4: Replace the `whatIDo` section in `Home.jsx`**

Remove `WHATIDO_ICONS`, `IconCollect`, `IconProcess`, `IconVisualize` and the `whatIDo` section JSX. Replace with:

```jsx
{/* ── Character Sheet ── */}
<section className={styles.section}>
  <SectionTitle index="02" title={t('home.charSheet.title')} sub={t('home.charSheet.sub')} />
  <div className={styles.charSheet}>
    <div className={styles.charSheetHeader}>
      <div className={styles.charRow}>
        <span className={styles.charLabel}>{t('home.charSheet.labels.class')}</span>
        <span className={styles.charVal}>{t('home.charSheet.class')}</span>
      </div>
      <div className={styles.charRow}>
        <span className={styles.charLabel}>{t('home.charSheet.labels.former')}</span>
        <span className={styles.charVal}>{t('home.charSheet.former')}</span>
      </div>
      <div className={styles.charRow}>
        <span className={styles.charLabel}>{t('home.charSheet.labels.level')}</span>
        <span className={styles.charVal}>{t('home.charSheet.level')}</span>
      </div>
      <div className={styles.charRow}>
        <span className={styles.charLabel}>{t('home.charSheet.labels.exp')}</span>
        <span className={styles.charVal}>{t('home.charSheet.exp')}</span>
      </div>
    </div>
    <div className={styles.charDivider} />
    <div className={styles.charSkills}>
      {t('home.charSheet.skills', { returnObjects: true }).map(skill => (
        <div key={skill.name} className={styles.statRow}>
          <span className={skill.former ? styles.statNameFormer : styles.statName}>
            {skill.name}
          </span>
          <div className={styles.statBar}>
            <div
              className={skill.former ? styles.statBarFillFormer : styles.statBarFill}
              style={{ width: `${skill.pct}%` }}
            />
          </div>
          <span className={skill.former ? styles.statLevelFormer : styles.statLevel}>
            {skill.level}{skill.former ? ' ↩' : ''}
          </span>
        </div>
      ))}
    </div>
  </div>
</section>
```

Also remove `const whatIDoItems = t('home.whatIDo.items', { returnObjects: true })` from the top of the component.

- [ ] **Step 5: Verify in browser**

```
npm run dev
```

Open `http://localhost:5173`. Check:
- Character sheet panel is visible with purple border
- 5 skill rows: SQL, Python, Power BI, Excel, Unity/C#
- Unity/C# row is visually dimmed with purple fill and `↩` suffix
- Bar widths: SQL widest, Excel narrowest
- Toggle VI locale: Vietnamese labels appear

- [ ] **Step 6: Run tests**

```
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.module.css src/locales/en.json src/locales/vi.json
git commit -m "feat: character sheet section — RPG profile card replaces skill cards"
```

---

### Task 3: Game Showcase — CSS pixel art canvases

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/Home.module.css`
- Modify: `src/locales/en.json`
- Modify: `src/locales/vi.json`

**Interfaces:**
- Consumes: `home.games.*` i18n keys; `SHOWCASE_GAMES` array (defined in this task)
- Produces: `.gameShowcaseGrid` with 3 cards, each containing a pixel-art `<canvas>`

- [ ] **Step 1: Add `games` locale keys to `en.json`**

Add inside `"home"`:

```json
"games": {
  "title": "Shipped Games",
  "sub": "Three games that went live on Google Play.",
  "cta": "Play Store ↗"
}
```

- [ ] **Step 2: Add `games` locale keys to `vi.json`**

Add inside `"home"`:

```json
"games": {
  "title": "Game Đã Phát Hành",
  "sub": "Ba game đã lên Google Play.",
  "cta": "Play Store ↗"
}
```

- [ ] **Step 3: Add Game Showcase CSS to `Home.module.css`**

```css
/* ── Game Showcase ── */
.gameShowcaseGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.gameShowcaseCard {
  background: var(--bg2);
  border: 1px solid var(--purple);
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  text-decoration: none;
  display: block;
  transition: border-color 0.2s, transform 0.2s;
}

.gameShowcaseCard:hover {
  border-color: var(--accent-blue);
  transform: translateY(-3px);
}

.gameShowcaseCanvas {
  display: block;
  margin: 0 auto 16px;
  image-rendering: pixelated;
}

.gameShowcaseName {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
  margin-bottom: 8px;
}

.gameShowcaseGenre {
  display: inline-block;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--purple);
  border: 1px solid var(--purple);
  border-radius: 100px;
  padding: 2px 10px;
  margin-bottom: 12px;
}

.gameShowcaseCta {
  display: block;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.06em;
  transition: color 0.2s;
}

.gameShowcaseCard:hover .gameShowcaseCta {
  color: var(--accent-blue);
}
```

In the `@media (max-width: 640px)` block, add:

```css
.gameShowcaseGrid { grid-template-columns: 1fr; }
```

- [ ] **Step 4: Add pixel art draw functions and `PixelCanvas` component to `Home.jsx`**

At the top of `Home.jsx` add the import:

```jsx
import { useEffect, useRef } from 'react'
```

(Add `useEffect, useRef` to the existing `React` import or as a separate line if React is already imported.)

Then add these module-level constants and functions before the `export default` line:

```jsx
// 16×16 grid, S=5 → 80px. Canvas is 160×160 (2× DPR), scaled with ctx.scale(2,2).
const S = 5

function px(ctx, x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x * S, y * S, S - 1, S - 1)
}

// Space War Idle RPG — pixel spaceship
function drawSpaceWar(ctx) {
  const B = '#5988ff', P = '#a371f7', W = '#ffffff'
  // Nose
  px(ctx, 7, 1, B); px(ctx, 8, 1, B)
  // Upper body
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 2, B))
  // Cockpit row
  ;[5, 6, 9, 10].forEach(x => px(ctx, x, 3, B))
  px(ctx, 7, 3, W); px(ctx, 8, 3, W)
  // Wings
  for (let x = 2; x <= 13; x++) px(ctx, x, 4, B)
  for (let x = 3; x <= 12; x++) px(ctx, x, 5, B)
  // Lower body
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 6, B))
  // Engine glow
  ;[5, 6, 9, 10].forEach(x => px(ctx, x, 7, B))
  px(ctx, 7, 7, P); px(ctx, 8, 7, P)
  // Exhaust
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 8, P))
  px(ctx, 7, 9, P); px(ctx, 8, 9, P)
  px(ctx, 7, 10, P)
}

// Relic Bag: Shadow Hunter — stickman fighter with sword
function drawRelicBag(ctx) {
  const B = '#5988ff', P = '#a371f7', W = '#ffffff', G = '#8b8fa8'
  // Head
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 1, W))
  ;[5, 10].forEach(x => px(ctx, x, 2, W))
  px(ctx, 6, 2, B); px(ctx, 7, 2, W); px(ctx, 8, 2, W); px(ctx, 9, 2, B)
  ;[5, 10].forEach(x => px(ctx, x, 3, W))
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 3, W))
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 4, W))
  // Neck
  px(ctx, 7, 5, W); px(ctx, 8, 5, W)
  // Body
  ;[5, 6, 7, 8, 9, 10].forEach(x => px(ctx, x, 6, B))
  ;[5, 6, 7, 8, 9, 10].forEach(x => px(ctx, x, 7, B))
  // Left arm
  px(ctx, 3, 6, W); px(ctx, 4, 6, W)
  // Right arm + sword
  px(ctx, 11, 6, W); px(ctx, 12, 6, W)
  ;[13, 14, 15].forEach(x => px(ctx, x, 6, P))
  px(ctx, 13, 5, P); px(ctx, 13, 7, P) // crossguard
  // Legs
  ;[5, 6].forEach(x => px(ctx, x, 8, G))
  ;[9, 10].forEach(x => px(ctx, x, 8, G))
  ;[5, 6].forEach(x => px(ctx, x, 9, G))
  ;[9, 10].forEach(x => px(ctx, x, 9, G))
  px(ctx, 5, 10, G); px(ctx, 6, 10, G)
  px(ctx, 9, 10, G); px(ctx, 10, 10, G)
  // Relic bag (left side, purple)
  ;[1, 2, 3, 4].forEach(x => px(ctx, x, 9, P))
  ;[1, 2, 3, 4].forEach(x => px(ctx, x, 10, P))
  ;[1, 2, 3, 4].forEach(x => px(ctx, x, 11, P))
  ;[2, 3].forEach(x => px(ctx, x, 12, P))
}

// Shadow War: Idle RPG — cloaked warrior silhouette
function drawShadowWar(ctx) {
  const P = '#a371f7', B = '#5988ff', D = '#1a0d30', W = '#ffffff'
  // Hood
  ;[5, 6, 7, 8, 9, 10].forEach(x => px(ctx, x, 1, P))
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 2, P))
  // Face (dark interior)
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 3, D))
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 4, D))
  // Glowing eyes (blue)
  px(ctx, 6, 3, B); px(ctx, 7, 3, B)
  px(ctx, 8, 3, B); px(ctx, 9, 3, B)
  // Jaw / chin
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 5, P))
  // Cloak spreading outward
  ;[5, 6, 7, 8, 9, 10].forEach(x => px(ctx, x, 6, P))
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 7, P))
  ;[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(x => px(ctx, x, 8, P))
  ;[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach(x => px(ctx, x, 9, P))
  ;[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].forEach(x => px(ctx, x, 10, P))
  // Feet
  ;[2, 3, 4].forEach(x => px(ctx, x, 11, P))
  ;[11, 12, 13].forEach(x => px(ctx, x, 11, P))
  // Sword glow beneath cloak (blue)
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 12, B))
  px(ctx, 7, 13, B); px(ctx, 8, 13, B)
  px(ctx, 7, 14, B)
}

function PixelCanvas({ draw }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    draw(ctx)
  }, []) // ponytail: draw fns are module-level constants, stable across renders
  return (
    <canvas
      ref={ref}
      width={160}
      height={160}
      className={styles.gameShowcaseCanvas}
      style={{ width: 80, height: 80 }}
    />
  )
}

const SHOWCASE_GAMES = [
  {
    name: 'Relic Bag: Shadow Hunter',
    genre: 'Puzzle · Action',
    url: 'https://play.google.com/store/apps/details?id=com.TSH014.bag.fight.stickman.shadow.hero.puzzle&hl=en',
    draw: drawRelicBag,
  },
  {
    name: 'Shadow War: Idle RPG Survival',
    genre: 'Idle · RPG',
    url: 'https://play.google.com/store/apps/details?id=com.shadow.war.legend.slime.idle.rpg.survival.game&hl=en',
    draw: drawShadowWar,
  },
  {
    name: 'Space War Idle RPG',
    genre: 'Idle · Strategy',
    url: 'https://play.google.com/store/apps/details?id=com.zitga.multiverse.war.idle.star.trek.game&hl=en',
    draw: drawSpaceWar,
  },
]
```

- [ ] **Step 5: Add the Game Showcase section to the JSX in `Home.jsx`**

Insert this section between the Character Sheet section and the About section:

```jsx
{/* ── Shipped Games ── */}
<section className={styles.section}>
  <SectionTitle index="03" title={t('home.games.title')} sub={t('home.games.sub')} />
  <div className={styles.gameShowcaseGrid}>
    {SHOWCASE_GAMES.map(game => (
      <a
        key={game.name}
        href={game.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.gameShowcaseCard}
      >
        <PixelCanvas draw={game.draw} />
        <span className={styles.gameShowcaseName}>{game.name}</span>
        <span className={styles.gameShowcaseGenre}>{game.genre}</span>
        <span className={styles.gameShowcaseCta}>{t('home.games.cta')}</span>
      </a>
    ))}
  </div>
</section>
```

Also update the About section's `SectionTitle` index from `"02"` to `"04"`, and the Projects section from `"03"` to `"05"`.

- [ ] **Step 6: Verify pixel art in browser**

```
npm run dev
```

Open `http://localhost:5173` and scroll to "Shipped Games". Check:
- 3 cards with purple border, each containing an 80×80 pixel canvas
- Relic Bag: stickman with sword and purple bag
- Shadow War: cloaked figure with glowing blue eyes and spreading cloak
- Space War: blue triangle spaceship with purple exhaust
- Art is crisp (pixelated rendering, not blurry)
- Cards link to Google Play (open in new tab)
- Hover: border turns blue, CTA text turns blue, card lifts

- [ ] **Step 7: Run tests**

```
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.module.css src/locales/en.json src/locales/vi.json
git commit -m "feat: game showcase section — pixel art canvases for 3 shipped games"
```

---

### Task 4: About Me — "How I Think" block

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/Home.module.css`
- Modify: `src/locales/en.json`
- Modify: `src/locales/vi.json`

**Interfaces:**
- Consumes: `home.about.think_label`, `home.about.think_text` i18n keys
- Produces: `.thinkBox` rendered between `.pivotBox` and `.gamesLabel`

- [ ] **Step 1: Add `think_*` keys to `en.json`**

Inside `"home"."about"`, add two new keys:

```json
"think_label": "How I Think",
"think_text": "I approach problems the way I designed game systems — find the feedback loop, measure what changes behaviour, cut what doesn't move the needle. Theory of Fun put words to it: learning IS the fun. Data analysis is the same thing with a different dataset."
```

- [ ] **Step 2: Add `think_*` keys to `vi.json`**

Inside `"home"."about"`, add:

```json
"think_label": "Cách Mình Tư Duy",
"think_text": "Mình tiếp cận vấn đề theo cách mình từng thiết kế game system — tìm vòng phản hồi, đo cái gì thay đổi hành vi, cắt bỏ cái không hiệu quả. Theory of Fun nói đúng: học mới là niềm vui. Phân tích dữ liệu cũng thế, chỉ là đổi dataset thôi."
```

- [ ] **Step 3: Add `.thinkBox` CSS to `Home.module.css`**

Add after the `.pivotBox` block:

```css
.thinkBox {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-left: 2px solid var(--purple);
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 28px;
}

.thinkLabel {
  display: block;
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--purple);
  margin-bottom: 8px;
}

.thinkText {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text);
  margin: 0;
}
```

- [ ] **Step 4: Add `thinkBox` to `Home.jsx` About section**

In the About section, between the closing `</div>` of `pivotBox` and the `<div className={styles.gamesLabel}>` line, insert:

```jsx
<div className={styles.thinkBox}>
  <div>
    <span className={styles.thinkLabel}>{t('home.about.think_label')}</span>
    <p className={styles.thinkText}>{t('home.about.think_text')}</p>
  </div>
</div>
```

- [ ] **Step 5: Verify in browser**

```
npm run dev
```

Scroll to "A Bit About Me". Check:
- "Career switch" pivot box is unchanged
- "How I Think" box appears below it with purple left border
- Text is legible
- Toggle to VI: Vietnamese text appears

- [ ] **Step 6: Run all tests**

```
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 7: Commit and push**

```bash
git add src/pages/Home.jsx src/pages/Home.module.css src/locales/en.json src/locales/vi.json
git commit -m "feat: about — add How I Think mindset block"
git push origin main
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by |
|-----------------|-----------|
| 2-column hero, photo placeholder | Task 1 |
| Tagline "Ex game dev…" | Task 1 |
| Currently block (playing/reading/building) | Task 1 |
| Remove p1/p2 locale keys | Task 1 |
| Character Sheet with CLASS/FORMER/LEVEL/EXP header | Task 2 |
| Stat bars: SQL 78%, Python 50%, Power BI 50%, Excel 38%, Unity/C# 100% | Task 2 |
| Unity/C# dimmed, purple fill, `↩ former` | Task 2 |
| Remove whatIDo locale keys + CSS classes | Task 2 |
| Game Showcase 3-column grid | Task 3 |
| CSS pixel art canvas per game (80×80, 2x DPR, image-rendering:pixelated) | Task 3 |
| drawRelicBag, drawShadowWar, drawSpaceWar functions | Task 3 |
| Play Store links + genre badges | Task 3 |
| Section index update (03→05 for projects, 02→04 for about) | Task 3 (step 5) |
| "How I Think" thinkBox with purple left accent | Task 4 |
| Both EN + VI locales updated together in every task | All tasks |
| No new npm dependencies | All tasks |

**No placeholders found.**

**Type consistency:** `skill.former` boolean used consistently as `skill.former ? styles.statNameFormer : styles.statName` in Task 2 and as `"former": true` in locale JSON.
