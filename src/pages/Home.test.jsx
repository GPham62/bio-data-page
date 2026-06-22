import { describe, it, expect, vi, beforeAll } from 'vitest'
import { screen, fireEvent, within } from '@testing-library/react'
import { renderWithI18n } from '../test/i18nTestUtils.jsx'
import Home from './Home.jsx'
import en from '../locales/en.json'
// Imported as viLocale to avoid colliding with Vitest's `vi` mock utility.
import viLocale from '../locales/vi.json'

// jsdom has no canvas backend: getContext returns null, which would make the
// pixel-art draw functions throw on ctx.scale(). Stub a no-op 2D context so the
// game-showcase canvases render without exercising real drawing.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    scale: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  }))
})

const noop = () => {}

describe('Home', () => {
  describe('hero', () => {
    it('renders the kicker, title, and personal tagline', () => {
      renderWithI18n(<Home setActive={noop} />)
      expect(screen.getByText(en.home.greeting.kicker)).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1, name: en.home.greeting.title })).toBeInTheDocument()
      expect(screen.getByText(en.home.greeting.tagline)).toBeInTheDocument()
    })

    it('renders all three "Currently" rows with their values', () => {
      renderWithI18n(<Home setActive={noop} />)
      expect(screen.getByText(en.home.greeting.currently.playing)).toBeInTheDocument()
      expect(screen.getByText(en.home.greeting.currently.reading)).toBeInTheDocument()
      expect(screen.getByText(en.home.greeting.currently.building)).toBeInTheDocument()
    })

    it('no longer renders an empty "[ photo ]" hero placeholder', () => {
      renderWithI18n(<Home setActive={noop} />)
      expect(screen.queryByText(/\[ photo \]/)).not.toBeInTheDocument()
    })
  })

  describe('section order (data projects lead the personality content)', () => {
    it('orders the H2 sections: Player Profile → Selected Projects → About → Shipped Games', () => {
      renderWithI18n(<Home setActive={noop} />)
      const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
      expect(headings.slice(0, 4)).toEqual([
        en.home.charSheet.title,
        en.home.portfolio.title,
        en.home.about.title,
        en.home.games.title,
      ])
    })

    it('places Selected Projects before Shipped Games in the DOM', () => {
      renderWithI18n(<Home setActive={noop} />)
      const projects = screen.getByRole('heading', { level: 2, name: en.home.portfolio.title })
      const games = screen.getByRole('heading', { level: 2, name: en.home.games.title })
      // compareDocumentPosition: 4 === DOCUMENT_POSITION_FOLLOWING (games follows projects)
      expect(projects.compareDocumentPosition(games) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  describe('character sheet', () => {
    it('renders the class, level, and all five skill rows', () => {
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

    it('marks the former (Unity/C#) skill with a ↩ suffix', () => {
      renderWithI18n(<Home setActive={noop} />)
      const former = en.home.charSheet.skills.find((s) => s.former)
      expect(screen.getByText(`${former.level} ↩`)).toBeInTheDocument()
    })
  })

  describe('selected projects', () => {
    it('renders all three project titles', () => {
      renderWithI18n(<Home setActive={noop} />)
      expect(screen.getByText(en.home.projects.p1.title)).toBeInTheDocument()
      expect(screen.getByText(en.home.projects.p2.title)).toBeInTheDocument()
      expect(screen.getByText(en.home.projects.p3.title)).toBeInTheDocument()
    })

    it('calls setActive with the project id when a project card is clicked', () => {
      const setActive = vi.fn()
      renderWithI18n(<Home setActive={setActive} />)
      // Click bubbles from the title up to the card div's onClick handler.
      fireEvent.click(screen.getByText(en.home.projects.p1.title))
      expect(setActive).toHaveBeenCalledWith('p1')
    })
  })

  describe('shipped games', () => {
    it('renders the five-games subtitle', () => {
      renderWithI18n(<Home setActive={noop} />)
      expect(screen.getByText(en.home.games.sub)).toBeInTheDocument()
    })

    it('renders five Google Play links that open in a new tab', () => {
      renderWithI18n(<Home setActive={noop} />)
      const playLinks = screen
        .getAllByRole('link')
        .filter((a) => a.getAttribute('href')?.includes('play.google.com'))
      expect(playLinks).toHaveLength(5)
      playLinks.forEach((a) => {
        expect(a).toHaveAttribute('target', '_blank')
        expect(a).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    it('renders one pixel-art canvas per shipped game', () => {
      const { container } = renderWithI18n(<Home setActive={noop} />)
      expect(container.querySelectorAll('canvas')).toHaveLength(5)
    })
  })

  describe('about — How I Think', () => {
    it('renders both the career-switch and How I Think blocks', () => {
      renderWithI18n(<Home setActive={noop} />)
      expect(screen.getByText(en.home.about.pivot_label)).toBeInTheDocument()
      expect(screen.getByText(en.home.about.think_label)).toBeInTheDocument()
      expect(screen.getByText(en.home.about.think_text)).toBeInTheDocument()
    })
  })

  describe('localization', () => {
    it('renders section titles in Vietnamese when the locale is vi', () => {
      renderWithI18n(<Home setActive={noop} />, { lng: 'vi' })
      expect(
        screen.getByRole('heading', { level: 2, name: viLocale.home.charSheet.title }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 2, name: viLocale.home.games.title }),
      ).toBeInTheDocument()
    })
  })
})
