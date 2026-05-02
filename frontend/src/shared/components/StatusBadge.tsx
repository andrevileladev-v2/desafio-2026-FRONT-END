import type { ConservationStatus } from '../types'

const STATUS_CONFIG: Record<ConservationStatus, { label: string; cls: string }> = {
  'Least Concern': { label: 'Pouco Preocupante', cls: 'badge-lc' },
  'Near Threatened': { label: 'Quase Ameaçada', cls: 'badge-nt' },
  Vulnerable: { label: 'Vulnerável', cls: 'badge-vu' },
  Endangered: { label: 'Em Perigo', cls: 'badge-en' },
  'Critically Endangered': { label: 'Criticamente Ameaçada', cls: 'badge-cr' },
}

export function StatusBadge({ status }: { status: ConservationStatus }) {
  const cfg = STATUS_CONFIG[status]
  return <span className={`status-badge ${cfg.cls}`}>{cfg.label}</span>
}
