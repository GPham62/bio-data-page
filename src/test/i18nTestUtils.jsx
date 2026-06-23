// Reusable i18n test harness.
//
// We deliberately build a FRESH i18next instance here instead of importing the
// app's src/i18n.js. The app instance reads localStorage at import time and is
// a process-wide singleton — sharing it across tests would leak the selected
// language between cases. A per-helper instance keeps each test isolated and
// lets a test switch languages without affecting others.
import React from 'react'
import { render } from '@testing-library/react'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'

import en from '../locales/en.json'
import vi from '../locales/vi.json'

export const resources = { en, vi }

/**
 * Create an isolated i18next instance preset to `lng`.
 * Synchronous init (no backend) so translations are ready immediately.
 */
export function createTestI18n(lng = 'en') {
  const instance = createInstance()
  instance.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  return instance
}

/**
 * Render a component wrapped in an isolated I18nextProvider.
 * Returns the usual RTL result plus the `i18n` instance so a test can call
 * `i18n.changeLanguage('vi')` and assert on the re-render.
 */
export function renderWithI18n(ui, { lng = 'en', ...options } = {}) {
  const i18n = createTestI18n(lng)
  const result = render(
    <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>,
    options,
  )
  return { ...result, i18n }
}
