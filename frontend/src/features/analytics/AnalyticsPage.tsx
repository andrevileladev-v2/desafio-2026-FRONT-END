import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, Legend, ReferenceLine, BarChart, Bar,
} from 'recharts'
import { analyticsApi } from '../../shared/api/analytics'
import { mlApi } from '../../shared/api/ml'
import { speciesApi } from '../../shared/api/species'
import type { BayesianResult, TimeSeriesPoint } from '../../shared/types'
import type { Species } from '../../shared/types'
import type { MLCluster, MLTimeSeriesPoint, PCAResult, AnomalyResult, ClassifyResult } from '../../shared/api/ml'

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#64748b', '#ec4899']
const CLUSTER_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

type Tab = 'bayesian' | 'timeseries' | 'clusters' | 'pca' | 'anomalies' | 'classify'

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('bayesian')
  const [bayesian, setBayesian] = useState<BayesianResult[]>([])
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([])
  const [mlTimeSeries, setMlTimeSeries] = useState<MLTimeSeriesPoint[]>([])
  const [clusters, setClusters] = useState<MLCluster[]>([])
  const [pca, setPca] = useState<PCAResult | null>(null)
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([])
  const [classify, setClassify] = useState<ClassifyResult | null>(null)
  const [species, setSpecies] = useState<Species[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<string>('')
  const [granularity, setGranularity] = useState<'month' | 'year'>('month')
  const [loadingBase, setLoadingBase] = useState(true)
  const [loadingML, setLoadingML] = useState(false)
  const [mlLoaded, setMlLoaded] = useState(false)
  const [mlError, setMlError] = useState(false)

  useEffect(() => {
    Promise.all([analyticsApi.getBayesian(), analyticsApi.getTimeSeries(), speciesApi.getAll()])
      .then(([b, ts, sp]) => { setBayesian(b); setTimeSeries(ts); setSpecies(sp) })
      .finally(() => setLoadingBase(false))
  }, [])

  useEffect(() => {
    if (activeTab === 'timeseries') {
      analyticsApi.getTimeSeries(selectedSpecies || undefined, granularity).then(setTimeSeries)
    }
  }, [selectedSpecies, granularity, activeTab])

  useEffect(() => {
    if ((activeTab === 'clusters' || activeTab === 'pca' || activeTab === 'anomalies' || activeTab === 'classify') && !mlLoaded) {
      setLoadingML(true)
      setMlError(false)
      Promise.all([
        mlApi.getClusters(5),
        mlApi.getPCA(),
        mlApi.getAnomalies(),
        mlApi.getClassify('biome'),
        mlApi.getTimeSeries(undefined, 'month', 6),
      ])
        .then(([cl, pc, an, cf, ts]) => {
          setClusters(cl)
          setPca(pc)
          setAnomalies(an)
          setClassify(cf)
          setMlTimeSeries(ts)
          setMlLoaded(true)
        })
        .catch(() => setMlError(true))
        .finally(() => setLoadingML(false))
    }
  }, [activeTab, mlLoaded])

  const TABS: { id: Tab; label: string }[] = [
    { id: 'bayesian', label: 'Bayesiano' },
    { id: 'timeseries', label: 'Série Temporal' },
    { id: 'clusters', label: 'K-Means' },
    { id: 'pca', label: 'PCA' },
    { id: 'anomalies', label: 'Anomalias' },
    { id: 'classify', label: 'Classificação' },
  ]

  if (loadingBase) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics Avançado</h1>
        <p className="page-subtitle">Análise bayesiana, séries temporais, ML e distribuição estatística</p>
      </div>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {(t.id === 'clusters' || t.id === 'pca' || t.id === 'anomalies' || t.id === 'classify') && (
              <span className="tab-badge">ML</span>
            )}
          </button>
        ))}
      </div>

      {/* === BAYESIAN === */}
      {activeTab === 'bayesian' && (
        <div className="analytics-grid">
          <div className="chart-card">
            <h3>Análise Bayesiana — P(Espécie | Região)</h3>
            <p className="chart-desc">Probabilidade condicional com suavização de Laplace (α=1)</p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={bayesian[0]?.probabilities.map((p) => ({
                region: p.region.split(' ')[0],
                ...Object.fromEntries(bayesian.map((b) => [
                  b.species.split('-')[0]?.trim(),
                  b.probabilities.find((x) => x.region === p.region)?.probability ?? 0,
                ])),
              })) ?? []}>
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
            <h3>Probabilidades a Priori</h3>
            <div className="bayesian-table">
              <div className="table-head">
                <span>Espécie</span>
                <span>P(espécie)</span>
                <span>Obs.</span>
                <span>Top região</span>
              </div>
              {bayesian.map((b) => {
                const topRegion = b.probabilities.reduce((a, c) => c.probability > a.probability ? c : a, b.probabilities[0]!)
                return (
                  <div key={b.species} className="table-row">
                    <span className="table-species">{b.species}</span>
                    <span className="table-prob">{(b.priorProbability * 100).toFixed(1)}%</span>
                    <span>{b.total}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{topRegion?.region?.split(' ')[0]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* === TIME SERIES === */}
      {activeTab === 'timeseries' && (
        <div className="analytics-grid">
          <div className="chart-card chart-wide">
            <div className="chart-header">
              <h3>Série Temporal de Observações</h3>
              <div className="chart-controls">
                <select className="filter-select sm" value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)}>
                  <option value="">Todas as espécies</option>
                  {species.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="view-toggle sm">
                  <button className={granularity === 'month' ? 'active' : ''} onClick={() => setGranularity('month')}>Mês</button>
                  <button className={granularity === 'year' ? 'active' : ''} onClick={() => setGranularity('year')}>Ano</button>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={timeSeries}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#06b6d4' }} />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={false} name="Observações" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card chart-wide">
            <h3>Previsão ARIMA — Próximos 6 Meses</h3>
            <p className="chart-desc">Modelo ARIMA(1,1,1) com intervalo de confiança 95%</p>
            {loadingML ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : mlError ? (
              <div className="ml-error">Serviço Python indisponível — rode <code>python3 -m uvicorn main:app --port 8000</code> em <code>services/analytics/</code></div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={mlTimeSeries}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} />
                  <Legend />
                  <ReferenceLine
                    x={mlTimeSeries.find((p) => p.is_forecast)?.date}
                    stroke="#334155"
                    strokeDasharray="4 2"
                    label={{ value: 'Previsão →', position: 'top', fill: '#64748b', fontSize: 10 }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={(props) => {
                    const d = props.payload as MLTimeSeriesPoint
                    return d.is_forecast
                      ? <circle key={props.key} cx={props.cx} cy={props.cy} r={4} fill="#8b5cf6" stroke="#8b5cf6" />
                      : <circle key={props.key} cx={props.cx} cy={props.cy} r={0} fill="none" />
                  }} name="Observações / Previsão" />
                  {mlTimeSeries.some((p) => p.lower_ci !== undefined) && (
                    <Line type="monotone" dataKey="lower_ci" stroke="#334155" strokeDasharray="3 3" dot={false} name="CI inferior" />
                  )}
                  {mlTimeSeries.some((p) => p.upper_ci !== undefined) && (
                    <Line type="monotone" dataKey="upper_ci" stroke="#334155" strokeDasharray="3 3" dot={false} name="CI superior" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* === CLUSTERS === */}
      {activeTab === 'clusters' && (
        <div className="analytics-grid">
          {loadingML ? (
            <div className="chart-card chart-wide loading-center"><div className="spinner" /><span>Rodando K-Means...</span></div>
          ) : mlError ? (
            <MLErrorCard />
          ) : (
            <>
              <div className="chart-card chart-wide">
                <h3>K-Means Geográfico — 5 Clusters</h3>
                <p className="chart-desc">Agrupamento de observações por proximidade geográfica (lat/lng)</p>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <XAxis dataKey="lng" name="Longitude" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Longitude', position: 'bottom', fill: '#64748b', fontSize: 11 }} />
                    <YAxis dataKey="lat" name="Latitude" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Latitude', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      content={({ payload }) => {
                        const d = payload?.[0]?.payload as MLCluster | undefined
                        if (!d) return null
                        return (
                          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                            <div style={{ fontWeight: 600, color: '#e2e8f0' }}>Cluster {d.cluster_id}</div>
                            <div style={{ color: '#94a3b8' }}>{d.count} observações</div>
                            <div style={{ color: '#94a3b8' }}>{d.biomes.join(', ')}</div>
                          </div>
                        )
                      }}
                    />
                    <Scatter data={clusters} name="Clusters">
                      {clusters.map((c, i) => (
                        <Cell key={c.cluster_id} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length] ?? '#06b6d4'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="clusters-list">
                {clusters.map((c, i) => (
                  <div key={c.cluster_id} className="cluster-card">
                    <div className="cluster-dot" style={{ background: CLUSTER_COLORS[i % CLUSTER_COLORS.length] }} />
                    <div>
                      <div className="cluster-title">Cluster {c.cluster_id}</div>
                      <div className="cluster-count">{c.count} observações</div>
                      <div className="cluster-biomes">{c.biomes.join(' · ')}</div>
                      <div className="cluster-species">{c.species.slice(0, 3).join(', ')}{c.species.length > 3 ? ` +${c.species.length - 3}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* === PCA === */}
      {activeTab === 'pca' && (
        <div className="analytics-grid">
          {loadingML ? (
            <div className="chart-card chart-wide loading-center"><div className="spinner" /><span>Rodando PCA...</span></div>
          ) : mlError ? (
            <MLErrorCard />
          ) : pca ? (
            <>
              <div className="chart-card chart-wide">
                <h3>PCA 2D — Redução de Dimensionalidade</h3>
                <p className="chart-desc">
                  Variância explicada: PC1={' '}
                  <strong style={{ color: '#06b6d4' }}>{((pca.explained_variance[0] ?? 0) * 100).toFixed(1)}%</strong>
                  {' '}· PC2={' '}
                  <strong style={{ color: '#8b5cf6' }}>{((pca.explained_variance[1] ?? 0) * 100).toFixed(1)}%</strong>
                </p>
                <ResponsiveContainer width="100%" height={320}>
                  <ScatterChart>
                    <XAxis dataKey="pc1" name="PC1" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: `PC1 (${((pca.explained_variance[0] ?? 0) * 100).toFixed(0)}%)`, position: 'bottom', fill: '#64748b', fontSize: 11 }} />
                    <YAxis dataKey="pc2" name="PC2" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: `PC2 (${((pca.explained_variance[1] ?? 0) * 100).toFixed(0)}%)`, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      content={({ payload }) => {
                        const d = payload?.[0]?.payload as { speciesName: string; pc1: number; pc2: number } | undefined
                        if (!d) return null
                        return (
                          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                            <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{d.speciesName}</div>
                            <div style={{ color: '#94a3b8' }}>PC1: {d.pc1.toFixed(3)}</div>
                            <div style={{ color: '#94a3b8' }}>PC2: {d.pc2.toFixed(3)}</div>
                          </div>
                        )
                      }}
                    />
                    <Scatter data={pca.points} name="Observações">
                      {pca.points.map((p, i) => (
                        <Cell key={i} fill={CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length] ?? '#06b6d4'} opacity={0.7} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* === ANOMALIES === */}
      {activeTab === 'anomalies' && (
        <div className="analytics-grid">
          {loadingML ? (
            <div className="chart-card chart-wide loading-center"><div className="spinner" /><span>Rodando Isolation Forest...</span></div>
          ) : mlError ? (
            <MLErrorCard />
          ) : (
            <>
              <div className="chart-card chart-wide">
                <h3>Detecção de Anomalias — Isolation Forest</h3>
                <p className="chart-desc">
                  {anomalies.filter((a) => a.is_anomaly).length} anomalias detectadas de {anomalies.length} observações (contaminação 5%)
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <ScatterChart>
                    <XAxis dataKey="lng" name="Longitude" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis dataKey="lat" name="Latitude" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      content={({ payload }) => {
                        const d = payload?.[0]?.payload as AnomalyResult | undefined
                        if (!d) return null
                        return (
                          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                            <div style={{ fontWeight: 600, color: d.is_anomaly ? '#ef4444' : '#e2e8f0' }}>{d.speciesName}</div>
                            <div style={{ color: '#94a3b8' }}>Score: {d.anomaly_score.toFixed(3)}</div>
                            <div style={{ color: '#94a3b8' }}>{d.region} · {d.date}</div>
                            {d.is_anomaly && <div style={{ color: '#ef4444', fontWeight: 600 }}>⚠ Anomalia</div>}
                          </div>
                        )
                      }}
                    />
                    <Scatter data={anomalies.filter((a) => !a.is_anomaly)} name="Normal" fill="#334155" opacity={0.4} />
                    <Scatter data={anomalies.filter((a) => a.is_anomaly)} name="Anomalia" fill="#ef4444" opacity={0.9} />
                    <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card chart-wide">
                <h3>Registros Anômalos Detectados</h3>
                <div className="anomaly-table">
                  <div className="table-head" style={{ gridTemplateColumns: '1fr 120px 100px 120px 80px' }}>
                    <span>Espécie</span>
                    <span>Região</span>
                    <span>Data</span>
                    <span>Coordenadas</span>
                    <span>Score</span>
                  </div>
                  {anomalies.filter((a) => a.is_anomaly).map((a) => (
                    <div key={a.id} className="table-row anomaly-row" style={{ gridTemplateColumns: '1fr 120px 100px 120px 80px' }}>
                      <span className="table-species">{a.speciesName}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{a.region}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{a.date}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{a.lat.toFixed(2)}, {a.lng.toFixed(2)}</span>
                      <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 12 }}>{a.anomaly_score.toFixed(3)}</span>
                    </div>
                  ))}
                  {anomalies.filter((a) => a.is_anomaly).length === 0 && (
                    <div style={{ padding: '24px', color: '#64748b', textAlign: 'center', fontSize: 13 }}>Nenhuma anomalia detectada</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* === CLASSIFY === */}
      {activeTab === 'classify' && (
        <div className="analytics-grid">
          {loadingML ? (
            <div className="chart-card chart-wide loading-center"><div className="spinner" /><span>Treinando modelo...</span></div>
          ) : mlError ? (
            <MLErrorCard />
          ) : classify ? (
            <>
              <div className="chart-card">
                <h3>Importância das Features</h3>
                <p className="chart-desc">Árvore de decisão — alvo: bioma (acurácia: <strong style={{ color: '#10b981' }}>{(classify.accuracy * 100).toFixed(0)}%</strong>)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={Object.entries(classify.feature_importance).map(([k, v]) => ({ feature: k, importance: parseFloat((v * 100).toFixed(1)) }))} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
                    <YAxis dataKey="feature" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={90} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} />
                    <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Importância %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Regras da Árvore de Decisão</h3>
                <p className="chart-desc">Principais critérios de divisão (max_depth=4)</p>
                <div className="rules-list">
                  {classify.top_rules.map((rule, i) => (
                    <div key={i} className="rule-item">
                      <span className="rule-idx">{i + 1}</span>
                      <code className="rule-text">{rule.replace(/\|---/g, '').trim()}</code>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

function MLErrorCard() {
  return (
    <div className="chart-card chart-wide ml-error-card">
      <div style={{ fontSize: 22, marginBottom: 8 }}>⚠</div>
      <strong>Serviço Python indisponível</strong>
      <p>Inicie o serviço de analytics para usar recursos de Machine Learning:</p>
      <code>cd services/analytics && python3 -m uvicorn main:app --port 8000</code>
    </div>
  )
}
