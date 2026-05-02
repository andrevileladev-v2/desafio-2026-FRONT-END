import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { analyticsApi } from '../../shared/api/analytics'
import type { Stats, TimeSeriesPoint } from '../../shared/types'

const BIOME_COLORS: Record<string, string> = {
  Amazônia: '#06b6d4',
  Cerrado: '#f59e0b',
  Pantanal: '#10b981',
  'Mata Atlântica': '#8b5cf6',
  Caatinga: '#ef4444',
  Pampa: '#64748b',
}

const STATUS_COLORS: Record<string, string> = {
  'Least Concern': '#10b981',
  'Near Threatened': '#f59e0b',
  Vulnerable: '#f97316',
  Endangered: '#ef4444',
  'Critically Endangered': '#dc2626',
}

const PIE_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b']

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsApi.getStats(), analyticsApi.getTimeSeries()])
      .then(([s, ts]) => {
        setStats(s)
        setTimeSeries(ts)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <span>Carregando dados...</span>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Análise ambiental de espécies — dados em tempo real</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon kpi-blue">◉</div>
          <div>
            <div className="kpi-value">{stats.totalSpecies}</div>
            <div className="kpi-label">Espécies Monitoradas</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-cyan">⬡</div>
          <div>
            <div className="kpi-value">{stats.totalObservations}</div>
            <div className="kpi-label">Observações Registradas</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-amber">◆</div>
          <div>
            <div className="kpi-value">{stats.byBiome.length}</div>
            <div className="kpi-label">Biomas Cobertos</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-red">▲</div>
          <div>
            <div className="kpi-value">
              {stats.byStatus.find((s) => s.status === 'Critically Endangered')?.count ?? 0}
            </div>
            <div className="kpi-label">Criticamente Ameaçadas</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-wide">
          <h3>Observações por Mês</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeSeries}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                name="Observações"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Espécies por Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.byStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ value }: { value?: number | string }) => `${value ?? ''}`}

>
                {stats.byStatus.map((entry, i) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? PIE_COLORS[i % PIE_COLORS.length] ?? '#06b6d4'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Observações por Bioma</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.byBiome} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="biome" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={100} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="count" name="Observações" radius={[0, 4, 4, 0]}>
                {stats.byBiome.map((entry) => (
                  <Cell
                    key={entry.biome}
                    fill={BIOME_COLORS[entry.biome] ?? '#06b6d4'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Categorias de Espécies</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.byCategory}>
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Espécies" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-wide">
          <h3>Ranking de Espécies Mais Observadas</h3>
          <div className="ranking-list">
            {stats.topSpecies.map((item, i) => (
              <div key={item.species} className="ranking-item">
                <span className="ranking-pos">{i + 1}</span>
                <div className="ranking-bar-wrap">
                  <span className="ranking-name">{item.species}</span>
                  <div className="ranking-bar">
                    <div
                      className="ranking-fill"
                      style={{
                        width: `${(item.count / (stats.topSpecies[0]?.count ?? 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="ranking-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
