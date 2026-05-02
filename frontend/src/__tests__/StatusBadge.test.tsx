import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../shared/components/StatusBadge'
import type { ConservationStatus } from '../shared/types'

describe('StatusBadge', () => {
  const cases: [ConservationStatus, string][] = [
    ['Least Concern', 'Pouco Preocupante'],
    ['Near Threatened', 'Quase Ameaçada'],
    ['Vulnerable', 'Vulnerável'],
    ['Endangered', 'Em Perigo'],
    ['Critically Endangered', 'Criticamente Ameaçada'],
  ]

  it.each(cases)('renders correct label for %s', (status, expectedLabel) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(expectedLabel)).toBeInTheDocument()
  })

  it('applies correct CSS class for Critically Endangered', () => {
    const { container } = render(<StatusBadge status="Critically Endangered" />)
    expect(container.firstChild).toHaveClass('badge-cr')
  })

  it('applies correct CSS class for Least Concern', () => {
    const { container } = render(<StatusBadge status="Least Concern" />)
    expect(container.firstChild).toHaveClass('badge-lc')
  })
})
