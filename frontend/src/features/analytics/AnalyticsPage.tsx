import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, Legend,
} from 'recharts'
import { analyticsApi } from '../../shared/api/analytics'
import { speciesApi } from '../../shared/api/species'
import type { BayesianResult, TimeSeriesPoint } from '../../shared/types'
import type { Species } from '../../shared/types'

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#64748b', '#ec4899']

export function AnalyticsPage() {
  const [bayesian, setBayesian] = useState<BayesianResult[]>([])
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([])
  const [species, setSpecies] = useState<Species[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<string>('')
  const [granularity, setGranularity] = useState<'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsApi.getBayesian(), speciesApi.getAll()])
      .then(([b, sp]) => { setBayesian(b); setSpecies(sp) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    analyticsApi.getTimeSeries(selectedSpecies || undefined, granularity).then(setTimeSeries)
  }, [selectedSpecies, granularity])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const radarData = bayesian[0]?.probabilities.map((p) => ({
    region: p.region.replace(' ', '\n'),
    ...Object.fromEntries(bayesian.map((b) => [b.species.split('-')[0]?.trim(), b.probabilities.find((x) => x.region === p.region)?.probability ?? 0])),
  })) ?? []

  const scatterData = species.map((s, i) => ({
    x: s.observationCount,
    y: ['Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered'].indexOf(s.status),
    name: s.name,
    color: COLORS[i % COLORS.length] ?? '#06b6d4',
  }))

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics Avançado</h1>
        <p className="page-subtitle">Análise bayesiana, séries temporais e distribuição estatística</p>
      </div>

      <div className="analytics-grid">
        <div className="chart-card chart-wide">
          <div className="chart-header">
            <h3>Série Temporal de Observações</h3>
            <div className="chart-controls">
              <select
                className="filter-select sm"
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
              >
                <option value="">Todas as espécies</option>
                {species.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="view-toggle sm">
                <button className={granularity === 'month' ? 'active' : ''} onClick={() => setGranularity('month')}>Mês</button>
                <button className={granularity === 'year' ? 'active' : ''} onClick={() => setGranularity('year')}>Ano</button>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeSeries}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#06b6d4' }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={false} name="Observações" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Análise Bayesiana — P(Espécie | Região)</h3>
          <p className="chart-desc">Probabilidade condicional com suavização de Laplace</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="region" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              {bayesian.slice(0, 4).map((b, i) => (
                <Radar
                  key={b.species}
                  name={b.species.split('-')[0]?.trim()}
                  dataKey={b.species.split('-')[0]?.trim() ?? ''}
                  stroke={COLORS[i] ?? '#06b6d4'}
                  fill={COLORS[i] ?? '#06b6d4'}
                  fillOpacity={0.15}
                />
              ))}
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 10 }}>{v}</span>} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Risco vs. Observações</h3>
          <p className="chart-desc">Status de conservação em relação à frequência de observações</p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <XAxis dataKey="x" name="Observações" tick={{ fontSize: 11, fill: '#94a3b8' }} label={{ value: 'Observações', position: 'bottom', fill: '#64748b', fontSize: 11 }} />
              <YAxis
                dataKey="y"
                name="Risco"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                tickFormatter={(v: number) => ['LC', 'NT', 'VU', 'EN', 'CR'][v] ?? ''}
                domain={[-0.5, 4.5]}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(value, name) => {
                  if (name === 'Risco') return [['LC', 'NT', 'VU', 'EN', 'CR'][Number(value)] ?? String(value), name]
                  return [value, name]
                }}
              />
              <Scatter data={scatterData} name="Espécies">
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.85} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-wide">
          <h3>Probabilidades a Priori — Bayesian</h3>
          <div className="bayesian-table">
            <div className="table-head">
              <span>Espécie</span>
              <span>P(espécie)</span>
              <span>Total obs.</span>
              <span>Distribuição por região</span>
            </div>
            {bayesian.map((b) => (
              <div key={b.species} className="table-row">
                <span className="table-species">{b.species}</span>
                <span className="table-prob">{(b.priorProbability * 100).toFixed(1)}%</span>
                <span>{b.total}</span>
                <div className="region-bars">
                  {b.probabilities.slice(0, 4).map((p) => (
                    <div key={p.region} className="region-bar-item">
                      <span>{p.region.split(' ')[0]}</span>
                      <div className="mini-bar">
                        <div className="mini-fill" style={{ width: `${p.probability * 100 * 5}%` }} />
                      </div>
                      <span>{(p.probability * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
