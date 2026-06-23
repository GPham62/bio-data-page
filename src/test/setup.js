// Global test setup — runs once before the test suite (see vitest.config.js).
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom ships a working localStorage, but i18n.js reads it at import time and
// Sidebar writes to it. Provide a clean, spy-able in-memory implementation so
// tests can assert on getItem/setItem and never leak state between tests.
function createLocalStorageMock() {
  let store = {}
  return {
    getItem: vi.fn((key) => (key in store ? store[key] : null)),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
}

vi.stubGlobal('localStorage', createLocalStorageMock())

// jsdom does not implement scrollTo; App.jsx calls it in an effect.
vi.stubGlobal('scrollTo', vi.fn())

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})
