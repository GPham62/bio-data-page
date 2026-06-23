import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithI18n } from '../test/i18nTestUtils.jsx'
import Sidebar from './Sidebar.jsx'
import en from '../locales/en.json'
// Imported as viLocale to avoid colliding with Vitest's `vi` mock utility.
import viLocale from '../locales/vi.json'

describe('Sidebar', () => {
  beforeEach(() => {
    // The theme effect writes to data-theme; reset it between tests.
    document.documentElement.removeAttribute('data-theme')
  })

  describe('rendering', () => {
    it('renders the profile name (a non-translated literal)', () => {
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      expect(screen.getByText('Pham Tuan Anh')).toBeInTheDocument()
    })

    it('renders the localized role', () => {
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      expect(screen.getByText(en.sidebar.role)).toBeInTheDocument()
    })

    it('renders Home and Resume nav buttons with localized labels', () => {
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      expect(screen.getByRole('button', { name: en.sidebar.nav.home })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: en.sidebar.nav.resume })).toBeInTheDocument()
    })

    it('renders the three social links with correct hrefs', () => {
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      expect(screen.getByRole('link', { name: en.sidebar.social.github })).toHaveAttribute(
        'href',
        'https://github.com/GPham62',
      )
      expect(screen.getByRole('link', { name: en.sidebar.social.linkedin })).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/tuananhpham6296/',
      )
      expect(screen.getByRole('link', { name: en.sidebar.social.email })).toHaveAttribute(
        'href',
        'mailto:ptuananh196@gmail.com',
      )
    })
  })

  describe('navigation', () => {
    it('calls setActive("home") when the profile button is clicked', async () => {
      const user = userEvent.setup()
      const setActive = vi.fn()
      renderWithI18n(<Sidebar active="resume" setActive={setActive} />)
      // The profile button contains the avatar image / name.
      await user.click(screen.getByRole('button', { name: /Pham Tuan Anh/i }))
      expect(setActive).toHaveBeenCalledWith('home')
    })

    it('calls setActive("resume") when the Resume nav button is clicked', async () => {
      const user = userEvent.setup()
      const setActive = vi.fn()
      renderWithI18n(<Sidebar active="home" setActive={setActive} />)
      await user.click(screen.getByRole('button', { name: en.sidebar.nav.resume }))
      expect(setActive).toHaveBeenCalledWith('resume')
    })
  })

  describe('avatar fallback', () => {
    it('shows the image initially', () => {
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      expect(screen.getByRole('img', { name: 'Pham Tuan Anh' })).toBeInTheDocument()
    })

    it('replaces the image with the "TA" initials fallback when the image fails to load', () => {
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      const img = screen.getByRole('img', { name: 'Pham Tuan Anh' })
      // fireEvent is used here because onError is not a user interaction.
      fireEvent.error(img)
      expect(screen.queryByRole('img', { name: 'Pham Tuan Anh' })).not.toBeInTheDocument()
      expect(screen.getByText('TA')).toBeInTheDocument()
    })
  })

  describe('theme toggle', () => {
    it('defaults to dark theme and sets data-theme="dark" on mount', () => {
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('persists the default theme to localStorage on mount', () => {
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('switches to light theme when the theme toggle is clicked', async () => {
      const user = userEvent.setup()
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      // The pill spans concatenate to "DARK/LIGHT" as the button's accessible
      // name (visible text wins over title), so getByRole-name can't isolate it.
      // getByTitle targets the title attribute, which reflects the next action.
      await user.click(screen.getByTitle(/switch to light mode/i))
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
    })

    it('reads the initial theme from localStorage when present', () => {
      localStorage.getItem.mockImplementation((key) => (key === 'theme' ? 'light' : null))
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })
  })

  describe('locale toggle', () => {
    it('switches the i18n language from en to vi and persists it', async () => {
      const user = userEvent.setup()
      const { i18n } = renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      expect(i18n.language).toBe('en')

      // When in English, the locale pill's title invites switching to Vietnamese.
      await user.click(screen.getByTitle(/Chuyển sang Tiếng Việt/i))

      expect(i18n.language).toBe('vi')
      expect(localStorage.setItem).toHaveBeenCalledWith('locale', 'vi')
    })

    it('re-renders nav labels in Vietnamese after switching locale', async () => {
      const user = userEvent.setup()
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)

      await user.click(screen.getByTitle(/Chuyển sang Tiếng Việt/i))

      expect(screen.getByRole('button', { name: viLocale.sidebar.nav.resume })).toBeInTheDocument()
    })

    it('switches back from vi to en when toggled again', async () => {
      const user = userEvent.setup()
      const { i18n } = renderWithI18n(<Sidebar active="home" setActive={() => {}} />, { lng: 'vi' })
      expect(i18n.language).toBe('vi')

      // When in Vietnamese, the locale pill's title invites switching to English.
      await user.click(screen.getByTitle(/Switch to English/i))

      expect(i18n.language).toBe('en')
      expect(localStorage.setItem).toHaveBeenCalledWith('locale', 'en')
    })
  })
})
