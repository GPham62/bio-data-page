import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n.js'
import Project5 from './Project5.jsx'
import { stats } from '../data/project5.js'

describe('Project5 locale interpolation', () => {
  it('renders the restaurant count from stats, not a hardcoded literal', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Project5 setActive={() => {}} />
      </I18nextProvider>
    )
    expect(screen.getByText(new RegExp(`${stats.restaurants}\\s+Hanoi restaurants`)))
      .toBeInTheDocument()
  })

  it('renders reviewed-of-total counts from stats in the reviews KPI sub-label', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Project5 setActive={() => {}} />
      </I18nextProvider>
    )
    expect(
      screen.getByText(new RegExp(`written 2018–2021.*${stats.reviewedRestaurants} of the ${stats.restaurants}`))
    ).toBeInTheDocument()
  })

  it('renders the analysable restaurant count in the share-4.5 KPI sub-label', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Project5 setActive={() => {}} />
      </I18nextProvider>
    )
    expect(
      screen.getByText(new RegExp(`${stats.analysable} restaurants with enough ratings`))
    ).toBeInTheDocument()
  })

  it('no longer renders the cut standalone rating-wall section', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Project5 setActive={() => {}} />
      </I18nextProvider>
    )
    expect(screen.queryByText('Do the stars separate anything?')).not.toBeInTheDocument()
  })

  it('renumbers sections 01-05 with no gap after the cut', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Project5 setActive={() => {}} />
      </I18nextProvider>
    )
    for (const n of ['01', '02', '03', '04', '05']) {
      expect(screen.getByText(n)).toBeInTheDocument()
    }
  })
})
