import { useEffect, useRef, useState } from 'react'
import { Bird, Fish, PawPrint, Bug, Leaf, Shell } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const CATEGORY_ICON: Record<string, React.ComponentType<LucideProps>> = {
  Bird: Bird,
  Fish: Fish,
  Mammal: PawPrint,
  Reptile: Bug,
  Amphibian: Leaf,
  Invertebrate: Shell,
}
import { speciesApi } from '../../shared/api/species'
import { api } from '../../shared/api/client'
import type { Species, SpeciesCategory, ConservationStatus } from '../../shared/types'
import { StatusBadge } from '../../shared/components/StatusBadge'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const CATEGORIES: SpeciesCategory[] = ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Invertebrate']
const STATUSES: ConservationStatus[] = [
  'Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered',
]

const CATEGORY_PT: Record<string, string> = {
  Mammal: 'Mamífero', Bird: 'Ave', Reptile: 'Réptil',
  Amphibian: 'Anfíbio', Fish: 'Peixe', Invertebrate: 'Invertebrado',
}

interface FormState {
  name: string
  scientificName: string
  category: SpeciesCategory
  status: ConservationStatus
  description: string
  biome: string
}

const EMPTY_FORM: FormState = {
  name: '', scientificName: '', category: 'Mammal', status: 'Least Concern',
  description: '', biome: '',
}

export function SpeciesPage() {
  const [list, setList] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Species | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ imported: number; errors: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    speciesApi.getAll().then(setList).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadResult(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post<{ imported: number; errors: number }>('/api/upload/observations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploadResult(res.data)
      load()
    } catch {
      setUploadResult({ imported: 0, errors: 1 })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const filtered = list.filter((s) => {
    const q = search.toLowerCase()
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.scientificName.toLowerCase().includes(q)
    const matchC = !filterCat || s.category === filterCat
    const matchS = !filterStatus || s.status === filterStatus
    return matchQ && matchC && matchS
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await speciesApi.create(form)
      setShowForm(false)
      setForm(EMPTY_FORM)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta espécie?')) return
    await speciesApi.delete(id)
    setSelected(null)
    load()
  }

  return (
    <div className="species-page">
      <div className="page-header">
        <div>
          <h1>Espécies</h1>
          <p className="page-subtitle">{list.length} espécies cadastradas</p>
        </div>
        <div className="export-group">
          <a className="btn-export" href={`${API}/api/export/species.csv`} download>CSV</a>
          <a className="btn-export" href={`${API}/api/export/species.json`} download>JSON</a>
          <label className={`btn-export ${uploading ? 'disabled' : ''}`} title="Importar observações CSV">
            {uploading ? 'Importando...' : 'Upload CSV'}
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          </label>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Espécie</button>
        </div>
      </div>
      {uploadResult && (
        <div className={`upload-result ${uploadResult.errors > 0 ? 'has-errors' : ''}`}>
          {uploadResult.imported} observações importadas{uploadResult.errors > 0 ? ` · ${uploadResult.errors} erros` : ''}
          <button onClick={() => setUploadResult(null)}>✕</button>
        </div>
      )}

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Buscar por nome ou nome científico..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_PT[c]}</option>
          ))}
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="species-layout">
          <div className="species-grid">
            {filtered.map((s) => (
              <button
                key={s.id}
                className={`species-card ${selected?.id === s.id ? 'selected' : ''}`}
                onClick={() => setSelected(s)}
              >
                <div className="species-card-header">
                  <div className="species-icon">
                    {(() => { const Icon = CATEGORY_ICON[s.category] ?? Leaf; return <Icon size={18} strokeWidth={1.8} /> })()}
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="species-name">{s.name}</div>
                <div className="species-sci">{s.scientificName}</div>
                <div className="species-meta">
                  <span>{CATEGORY_PT[s.category]}</span>
                  <span>•</span>
                  <span>{s.biome}</span>
                </div>
                <div className="species-obs">{s.observationCount} observações</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">Nenhuma espécie encontrada</div>
            )}
          </div>

          {selected && (
            <div className="species-detail">
              <div className="detail-header">
                <div>
                  <h2>{selected.name}</h2>
                  <em>{selected.scientificName}</em>
                </div>
                <button className="btn-ghost" onClick={() => setSelected(null)}>✕</button>
              </div>
              <StatusBadge status={selected.status} />
              <p className="detail-desc">{selected.description}</p>
              <div className="detail-meta">
                <div className="meta-row"><span>Categoria</span><span>{CATEGORY_PT[selected.category]}</span></div>
                <div className="meta-row"><span>Bioma</span><span>{selected.biome}</span></div>
                <div className="meta-row"><span>Observações</span><span>{selected.observationCount}</span></div>
                <div className="meta-row"><span>Cadastro</span><span>{selected.createdAt.slice(0, 10)}</span></div>
              </div>
              <button className="btn-danger" onClick={() => handleDelete(selected.id)}>
                Remover Espécie
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Espécie</h3>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="species-form">
              <label>
                Nome popular
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>
                Nome científico
                <input required value={form.scientificName} onChange={(e) => setForm({ ...form, scientificName: e.target.value })} />
              </label>
              <label>
                Categoria
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SpeciesCategory })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_PT[c]}</option>)}
                </select>
              </label>
              <label>
                Status de conservação
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ConservationStatus })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label>
                Bioma
                <input value={form.biome} onChange={(e) => setForm({ ...form, biome: e.target.value })} />
              </label>
              <label>
                Descrição
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Criar Espécie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
