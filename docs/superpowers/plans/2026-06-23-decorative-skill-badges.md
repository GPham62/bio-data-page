# Decorative Skill Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Player Profile skill progress-bars with skimmable, decorative RPG-icon badges, backed by swappable image files, and add an "AI-Assisted Analysis" skill.

**Architecture:** Skills data lives in the i18n locale files (`home.charSheet.skills[]`). The Home page maps that array to chip elements; each chip shows a swappable `<img>` icon (served from `public/skill-icons/`), the skill name, and a level label. The old `.statBar` progress-bar markup and CSS are removed.

**Tech Stack:** React 18 + Vite, CSS Modules, react-i18next, Vitest + React Testing Library.

## Global Constraints

- **i18n parity:** every user-facing string change updates BOTH `src/locales/en.json` and `src/locales/vi.json` in the same task (project CLAUDE.md rule).
- **No new dependencies.**
- **Decorative icons:** `<img>` icons use `alt=""` (the skill name is adjacent text) — so they are absent from the accessibility tree and must be queried by tag (`querySelectorAll('img')`), not `getByRole('img')`.
- **Icon assets are swappable:** referenced by stable path under `public/skill-icons/`; replacing an icon = dropping in a same-named file, no code change.
- **Test command:** `npx vitest run <file>` (the `test` script is `vitest run`).

---

### Task 1: Placeholder icon assets

**Files:**
- Create: `public/skill-icons/sql.svg`
- Create: `public/skill-icons/python.svg`
- Create: `public/skill-icons/powerbi.svg`
- Create: `public/skill-icons/excel.svg`
- Create: `public/skill-icons/unity.svg`
- Create: `public/skill-icons/ai.svg`

**Interfaces:**
- Produces: six SVG files at `/skill-icons/{sql,python,powerbi,excel,unity,ai}.svg`, each a single-color (`#5988ff`, the dark-theme `--accent-blue`) ~24px-viewBox glyph. Task 2 references these paths; Task 3 renders them.

Notes: these are deliberately plain placeholders the user will swap. Pip color `#0d1117` on the die matches the dark background.

- [ ] **Step 1: Create the six SVG files**

`public/skill-icons/sql.svg` (sword):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5988ff"><path d="M11 2h2v12h-2zM7 14h10v2H7zM11 16h2v6h-2z"/></svg>
```

`public/skill-icons/python.svg` (shield):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5988ff"><path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z"/></svg>
```

`public/skill-icons/powerbi.svg` (star):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5988ff"><path d="M12 2l2.9 6.26L21.5 9l-5 4.6L18 21l-6-3.5L6 21l1.5-7.4-5-4.6 6.6-.74z"/></svg>
```

`public/skill-icons/excel.svg` (heart):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5988ff"><path d="M12 21S2 14.5 2 8.3C2 5.4 4.4 3 7.3 3c1.9 0 3.6 1 4.7 2.5C13.1 4 14.8 3 16.7 3 19.6 3 22 5.4 22 8.3 22 14.5 12 21 12 21z"/></svg>
```

`public/skill-icons/unity.svg` (die):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5988ff"><rect x="3" y="3" width="18" height="18" rx="3"/><g fill="#0d1117"><circle cx="8" cy="8" r="1.6"/><circle cx="16" cy="8" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="8" cy="16" r="1.6"/><circle cx="16" cy="16" r="1.6"/></g></svg>
```

`public/skill-icons/ai.svg` (sparkle):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5988ff"><path d="M12 2c.5 4.5 3.5 7.5 8 8-4.5.5-7.5 3.5-8 8-.5-4.5-3.5-7.5-8-8 4.5-.5 7.5-3.5 8-8z"/></svg>
```

- [ ] **Step 2: Verify all six exist and contain valid SVG markup**

Run:
```bash
node -e "['sql','python','powerbi','excel','unity','ai'].forEach(n=>{const s=require('fs').readFileSync('public/skill-icons/'+n+'.svg','utf8');if(!s.includes('<svg')||!s.includes('</svg>'))throw new Error('bad '+n);});console.log('6 icons OK')"
```
Expected: `6 icons OK`

- [ ] **Step 3: Commit**

```bash
git add public/skill-icons/
git commit -m "feat: add swappable placeholder skill icons"
```

---

### Task 2: Locale data — drop pct, add icons, add AI skill

**Files:**
- Modify: `src/locales/en.json` (`home.charSheet.skills`)
- Modify: `src/locales/vi.json` (`home.charSheet.skills`)
- Test: `src/locales/skills.test.js` (create)

**Interfaces:**
- Consumes: icon paths from Task 1.
- Produces: `home.charSheet.skills[]` in both locales — an array of 6 objects `{ name, level, icon, former? }`, no `pct`. Same `icon` paths and same order in both locales; only `name`/`level` differ where translated. Task 3's markup reads `skill.name`, `skill.level`, `skill.icon`, `skill.former`.

- [ ] **Step 1: Write the failing test**

Create `src/locales/skills.test.js`:
```js
import { describe, it, expect } from 'vitest'
import en from './en.json'
import vi from './vi.json'

const EXPECTED_ICONS = [
  '/skill-icons/sql.svg',
  '/skill-icons/python.svg',
  '/skill-icons/powerbi.svg',
  '/skill-icons/excel.svg',
  '/skill-icons/unity.svg',
  '/skill-icons/ai.svg',
]

describe('charSheet skills data', () => {
  for (const [name, loc] of [['en', en], ['vi', vi]]) {
    const skills = loc.home.charSheet.skills

    it(`${name}: has 6 skills, each with name/level/icon and no pct`, () => {
      expect(skills).toHaveLength(6)
      skills.forEach((s) => {
        expect(typeof s.name).toBe('string')
        expect(typeof s.level).toBe('string')
        expect(s.icon).toMatch(/^\/skill-icons\/.+\.svg$/)
        expect(s).not.toHaveProperty('pct')
      })
    })

    it(`${name}: icons are in the expected order`, () => {
      expect(skills.map((s) => s.icon)).toEqual(EXPECTED_ICONS)
    })
  }

  it('marks exactly one skill (Unity/C#) as former', () => {
    const former = en.home.charSheet.skills.filter((s) => s.former)
    expect(former).toHaveLength(1)
    expect(former[0].name).toBe('Unity/C#')
  })

  it('adds the AI-Assisted Analysis skill in both locales', () => {
    expect(en.home.charSheet.skills.at(-1)).toMatchObject({
      name: 'AI-Assisted Analysis', level: 'Everyday', icon: '/skill-icons/ai.svg',
    })
    expect(vi.home.charSheet.skills.at(-1)).toMatchObject({
      name: 'AI-Assisted Analysis', level: 'Dùng hằng ngày', icon: '/skill-icons/ai.svg',
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/locales/skills.test.js`
Expected: FAIL (current data has 5 skills with `pct` and no `icon`).

- [ ] **Step 3: Update en.json skills**

Replace the `home.charSheet.skills` array in `src/locales/en.json` with:
```json
      "skills": [
        { "name": "SQL", "level": "Advanced", "icon": "/skill-icons/sql.svg" },
        { "name": "Python", "level": "Intermediate", "icon": "/skill-icons/python.svg" },
        { "name": "Power BI", "level": "Intermediate", "icon": "/skill-icons/powerbi.svg" },
        { "name": "Excel", "level": "Intermediate", "icon": "/skill-icons/excel.svg" },
        { "name": "Unity/C#", "level": "Expert", "former": true, "icon": "/skill-icons/unity.svg" },
        { "name": "AI-Assisted Analysis", "level": "Everyday", "icon": "/skill-icons/ai.svg" }
      ]
```
(Match the file's existing indentation; adjust if it differs.)

- [ ] **Step 4: Update vi.json skills**

Replace the `home.charSheet.skills` array in `src/locales/vi.json` with:
```json
      "skills": [
        { "name": "SQL", "level": "Nâng cao", "icon": "/skill-icons/sql.svg" },
        { "name": "Python", "level": "Trung bình", "icon": "/skill-icons/python.svg" },
        { "name": "Power BI", "level": "Trung bình", "icon": "/skill-icons/powerbi.svg" },
        { "name": "Excel", "level": "Trung bình", "icon": "/skill-icons/excel.svg" },
        { "name": "Unity/C#", "level": "Thành thạo", "former": true, "icon": "/skill-icons/unity.svg" },
        { "name": "AI-Assisted Analysis", "level": "Dùng hằng ngày", "icon": "/skill-icons/ai.svg" }
      ]
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/locales/skills.test.js`
Expected: PASS (all cases).

- [ ] **Step 6: Commit**

```bash
git add src/locales/en.json src/locales/vi.json src/locales/skills.test.js
git commit -m "feat: skill data as icon badges + add AI-Assisted Analysis"
```

---

### Task 3: Render chips + remove progress-bar markup/CSS

**Files:**
- Modify: `src/pages/Home.jsx` (the `.charSkills` block, ~lines 283-300)
- Modify: `src/pages/Home.module.css` (`.charSkills` ~126-131, remove `.statRow`..`.statLevelFormer` ~133-188, add chip rules; single-column rule in the `@media (max-width: 640px)` block ~596)
- Test: `src/pages/Home.test.jsx` (the `character sheet` describe block, ~lines 76-97)

**Interfaces:**
- Consumes: `skill.name`, `skill.level`, `skill.icon`, `skill.former` from Task 2.
- Produces: a `.charSkills` grid of `.skillChip` / `.skillChipFormer` elements, each containing one `<img className={styles.skillIcon}>`, a `.skillName`, and a `.skillLevel`. The char-sheet `<section>` contains exactly `skills.length` `<img>` elements.

- [ ] **Step 1: Update the failing tests**

In `src/pages/Home.test.jsx`, replace the `describe('character sheet', ...)` block (the test titled "renders the class, level, and all five skill rows" plus the former-suffix test) with:
```jsx
  describe('character sheet', () => {
    it('renders the class, level, and all six skill rows', () => {
      renderWithI18n(<Home setActive={noop} />)
      // Scope to the character-sheet section: skill names like "SQL"/"Python"
      // also appear in the project tags, so a global query would be ambiguous.
      const section = screen
        .getByRole('heading', { level: 2, name: en.home.charSheet.title })
        .closest('section')
      const scoped = within(section)
      expect(scoped.getByText(en.home.charSheet.class)).toBeInTheDocument()
      expect(scoped.getByText(en.home.charSheet.level)).toBeInTheDocument()
      en.home.charSheet.skills.forEach((skill) => {
        expect(scoped.getByText(skill.name)).toBeInTheDocument()
      })
    })

    it('renders one decorative icon image per skill (replacing the old bars)', () => {
      renderWithI18n(<Home setActive={noop} />)
      const section = screen
        .getByRole('heading', { level: 2, name: en.home.charSheet.title })
        .closest('section')
      // Decorative icons use alt="" → not in the a11y tree; query by tag.
      const imgs = section.querySelectorAll('img')
      expect(imgs).toHaveLength(en.home.charSheet.skills.length)
      en.home.charSheet.skills.forEach((skill, i) => {
        expect(imgs[i]).toHaveAttribute('src', skill.icon)
      })
    })

    it('marks the former (Unity/C#) skill with a ↩ suffix', () => {
      renderWithI18n(<Home setActive={noop} />)
      const former = en.home.charSheet.skills.find((s) => s.former)
      expect(screen.getByText(`${former.level} ↩`)).toBeInTheDocument()
    })
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/pages/Home.test.jsx`
Expected: FAIL — the new "one decorative icon image per skill" test finds 0 `<img>` in the section (markup still renders `.statBar` divs).

- [ ] **Step 3: Replace the markup in Home.jsx**

Replace the `.charSkills` block (currently the `statRow`/`statBar` map) with:
```jsx
          <div className={styles.charSkills}>
            {t('home.charSheet.skills', { returnObjects: true }).map(skill => (
              <div
                key={skill.name}
                className={skill.former ? styles.skillChipFormer : styles.skillChip}
              >
                <img src={skill.icon} alt="" className={styles.skillIcon} />
                <span className={styles.skillName}>{skill.name}</span>
                <span className={styles.skillLevel}>
                  {skill.level}{skill.former ? ' ↩' : ''}
                </span>
              </div>
            ))}
          </div>
```

- [ ] **Step 4: Update the CSS in Home.module.css**

Replace the `.charSkills` rule and remove the `.statRow`, `.statName`, `.statNameFormer`, `.statBar`, `.statBarFill`, `.statBarFillFormer`, `.statLevel`, `.statLevelFormer` rules with:
```css
.charSkills {
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 18px;
}

.skillChip,
.skillChipFormer {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.skillChipFormer {
  opacity: 0.55;
}

.skillIcon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  object-fit: contain;
}

.skillName {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text);
  min-width: 0;
}

.skillChipFormer .skillName {
  color: var(--muted);
}

.skillLevel {
  margin-left: auto;
  padding-left: 8px;
  font-size: 10px;
  color: var(--muted);
  text-align: right;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
```

Then, inside the existing `@media (max-width: 640px) { ... }` block, add:
```css
  .charSkills { grid-template-columns: 1fr; }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/pages/Home.test.jsx src/locales/skills.test.js`
Expected: PASS.

- [ ] **Step 6: Run the full suite (no regressions)**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Visual check on the dev server**

Open `http://localhost:5173/`, scroll to "Player Profile". Confirm: 6 skill chips in a 2-column grid, each with an icon + name + level; Unity/C# muted with `↩`; AI-Assisted Analysis present; no progress bars. Toggle to Vietnamese and confirm the translated levels.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.module.css src/pages/Home.test.jsx
git commit -m "feat: render skills as decorative icon badges, drop progress bars"
```

---

## Notes

- **TextFX title accents** (the earlier idea) are intentionally out of scope here — separate spec/plan if pursued.
- If `npx vitest run` watches instead of exiting, it's already configured with `run`; use `npx vitest run` exactly as written.
