# Decorative skill badges — design

- **Date:** 2026-06-23
- **Status:** Approved (pending spec review)
- **Scope:** Home page → "Player Profile" (Character Sheet) skills sub-block only

## Problem

The skills render as progress bars (`SQL [████░░] Advanced`, etc.). Two issues:

1. **Generic.** Even under the RPG theme, a labelled progress bar reads as boilerplate.
2. **Weak recruiter signal.** Percentage proficiency ("Python 50%") is invented precision
   that data-analyst hiring managers discount or distrust.

## Goals

- Replace the bars with a **decorative, skimmable** badge layout: one RPG icon + skill name + level label per skill.
- Icons are **swappable image files** (PNG or SVG) the user can replace later without touching code.
- Add a new skill, **AI Workflow**, to signal day-to-day AI-assisted analysis.
- Keep the surrounding "Player Profile" framing (CLASS / LEVEL / EXP header).

## Non-goals

- No change to other Home sections or other pages.
- No meaningful/measured rating — icons are flavor, not a proficiency scale.
- TextFX title accents (a separate, earlier idea) are **deferred** — not part of this spec.

## Design

### Skills + icon mapping

Six skills in a 2-column × 3-row grid. Icons are decorative (arbitrary mapping); files are
named **by skill** (not by icon shape) so swapping is intuitive — "to change the AI icon,
replace `ai.svg`".

| Skill      | Level (en)    | Level (vi)       | Icon file       | Placeholder shape | former |
|------------|---------------|------------------|-----------------|-------------------|--------|
| SQL        | Advanced      | Nâng cao         | `sql.svg`       | sword             | no     |
| Python     | Intermediate  | Trung bình       | `python.svg`    | shield            | no     |
| Power BI   | Intermediate  | Trung bình       | `powerbi.svg`   | star              | no     |
| Excel      | Intermediate  | Trung bình       | `excel.svg`     | heart             | no     |
| Unity/C#   | Expert        | Thành thạo       | `unity.svg`     | dice              | yes    |
| AI Workflow| Daily driver  | Dùng hằng ngày   | `ai.svg`        | wand / sparkle    | no     |

New skill name in vi: **Quy trình AI**.

### Asset folder

- New folder `public/skill-icons/` holding the six files above.
- Served at stable paths (`/skill-icons/sql.svg`), consistent with existing `/gif_import/`
  and `/textfx/` assets. Swapping an icon = drop in a new file of the same name; **no code or
  data change required**. A PNG of the same basename also works (e.g. replace `ai.svg` with
  `ai.png` → update the one `icon` value to `ai.png`).
- Initial files: simple single-color SVG placeholders authored in the accent color, sized to a
  ~20px viewbox. These are intended to be replaced.

### Data model (locale files)

Edit `home.charSheet.skills[]` in **both** `en.json` and `vi.json`:

- **Remove** the `pct` field from every skill.
- **Add** an `icon` field per skill: the path under `/skill-icons/` (e.g. `"/skill-icons/sql.svg"`).
  This follows the existing precedent where non-translatable data (`former`) already lives in the
  skills array; the path is identical in both locales, only `name`/`level` are translated.
- **Append** the AI Workflow entry to both arrays (last item).

### Markup (`src/pages/Home.jsx`)

Replace the `.charSkills` stat-row block (currently name + `.statBar` + level) with a grid of
skill chips. Each chip:

```jsx
<div className={skill.former ? styles.skillChipFormer : styles.skillChip}>
  <img src={skill.icon} alt="" className={styles.skillIcon} />
  <span className={styles.skillName}>{skill.name}</span>
  <span className={styles.skillLevel}>{skill.level}{skill.former ? ' ↩' : ''}</span>
</div>
```

- The `.statBar` / `.statBarFill` / `.statBarFillFormer` elements and their CSS are removed.
- `alt=""` (decorative): the skill name is adjacent text, so the icon must not be re-announced to
  screen readers.

### CSS (`src/pages/Home.module.css`)

- `.charSkills` becomes a 2-column grid (`grid-template-columns: 1fr 1fr; gap`), collapsing to one
  column on narrow widths (reuse the page's existing mobile breakpoint).
- New `.skillChip` (and `.skillChipFormer` = muted/lower opacity, matching today's former
  treatment): a small flex row — icon, name, level pushed to the end.
- `.skillIcon`: fixed `~20px` box, `object-fit: contain`. No forced color filter, so a swapped-in
  PNG/SVG renders as authored.
- Remove the now-unused `.statRow`, `.statName`, `.statNameFormer`, `.statBar`, `.statBarFill`,
  `.statBarFillFormer`, `.statLevel`, `.statLevelFormer` rules.

### i18n

Two new user-facing strings, added to both locales in the same change:

- name: `AI Workflow` / `Quy trình AI`
- level: `Daily driver` / `Dùng hằng ngày`

No other text changes. Removing `pct` touches no visible text.

## Testing

Update `src/pages/Home.test.jsx`:

- The existing "renders … all five skill rows" test loops over `en.home.charSheet.skills`, so it
  stays correct for six skills — rename it to "…all six skill rows" for accuracy.
- Add assertions: each skill renders an `<img>` whose `src` matches its `icon`, and the
  former-skill `↩` suffix still appears (existing test at line 92).
- Add a negative check: the old progress-bar elements are gone (no element with the former
  `statBar` class). Keep it light — one assertion.

## Risks / follow-ups

- Placeholder icons are deliberately plain; the user will likely swap them. Folder + stable paths
  make that a no-code drop-in.
- If skill order ever changes, nothing breaks — icon is carried on each skill object, not by index.
