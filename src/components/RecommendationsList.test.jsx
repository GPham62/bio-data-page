import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RecommendationsList from './RecommendationsList.jsx'

const items = [
  'Master <strong>SQL + Python</strong> first.',
  'Add <strong>Spark or AWS/Azure</strong>.',
  'Aim for a Senior title.',
]

describe('RecommendationsList', () => {
  it('renders the title as a level-3 heading', () => {
    render(<RecommendationsList title="Key Recommendations" items={items} />)
    expect(
      screen.getByRole('heading', { level: 3, name: 'Key Recommendations' }),
    ).toBeInTheDocument()
  })

  it('renders one list item per entry', () => {
    render(<RecommendationsList title="Recs" items={items} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders a zero-padded ordinal for each item (01, 02, 03)', () => {
    render(<RecommendationsList title="Recs" items={items} />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('renders HTML markup inside an item as real elements', () => {
    const { container } = render(<RecommendationsList title="Recs" items={items} />)
    const strongs = container.querySelectorAll('li strong')
    // First two items contain <strong>, third does not.
    expect(strongs).toHaveLength(2)
    expect(strongs[0]).toHaveTextContent('SQL + Python')
  })

  it('renders the heading but no list items for an empty items array', () => {
    render(<RecommendationsList title="Empty" items={[]} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Empty' })).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('applies the provided accent as a CSS custom property', () => {
    const { container } = render(
      <RecommendationsList title="Recs" items={items} accent="#a371f7" />,
    )
    expect(container.firstChild).toHaveStyle({ '--recs-accent': '#a371f7' })
  })
})
