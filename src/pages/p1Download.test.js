import { describe, it, expect } from 'vitest'
import { PBIX_DOWNLOAD_URL } from './Project1'

describe('PBIX_DOWNLOAD_URL', () => {
  it('points at the GitHub Release asset, not a repo file (pbix exceeds the 100MB repo limit)', () => {
    expect(PBIX_DOWNLOAD_URL).toBe(
      'https://github.com/GPham62/bio-data-page/releases/download/p1-dashboard-v1/p1_dashboard.pbix'
    )
  })
})
