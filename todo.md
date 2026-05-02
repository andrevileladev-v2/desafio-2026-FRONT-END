# 🌍 Environmental Analysis Platform - TODO

## 📌 Visão Geral
Sistema desktop (Electron) para análise ambiental de espécies com:
- Visualização geoespacial
- Estatística avançada
- Machine Learning
- Pipeline de dados

---

# 🚀 FASE 1 — Setup do Projeto

## 🧱 Monorepo
- [x] Criar estrutura base: `frontend/` `backend/` `app/` `services/analytics/` `data/`
- [x] Configurar workspace (npm workspaces)
- [x] Configurar TypeScript global
- [x] Configurar ESLint + Prettier

---

## 🖥️ Electron + Web
- [x] Criar app Electron (`app/`)
- [x] Criar app React (`frontend/`)
- [x] Configurar preload seguro (`app/preload.js`)
- [x] Integrar Electron ↔ React (dev: localhost:5173 / prod: dist/index.html)

---

## 🐳 Infraestrutura
- [x] Criar `docker-compose.yml`
- [x] Subir serviços:
  - [x] Node API (:3001)
  - [x] Python Analytics (:8000)
  - [ ] PostgreSQL (usando in-memory — banco relacional não implementado)
  - [x] Portainer (:9000)
- [x] Configurar variáveis de ambiente (VITE_API_URL, PYTHON_ANALYTICS_URL)

---

# 🧩 FASE 2 — Arquitetura Base

## 🧠 Padrões
- [x] Clean Architecture
- [x] DDD (Domain-Driven Design) — entidades Species + Observation
- [x] Ports & Adapters (Hexagonal) — ISpeciesRepository / IObservationRepository
- [x] Dependency Injection (básico via construtores)

---

## 📁 Estrutura por Feature
- [x] Criar estrutura base:
  ```
  frontend/src/features/{dashboard,map,species,analytics}
  backend/src/domain/
  backend/src/repositories/
  backend/src/services/
  ```

---

# 🧬 FASE 3 — Domínio (Core)

## 🌱 Espécies
- [x] Criar entidade `Species` (`backend/src/domain/Species.ts`)
- [x] ConservationStatus + SpeciesCategory como tipos
- [ ] Value Objects separados: Location, TimeRange (embutidos nas entidades, não separados)
- [x] Regras de negócio (validação geográfica no ETL)

---

## 📊 Observações
- [x] Entidade `Observation` (`backend/src/domain/Observation.ts`)
- [x] Validação geográfica (ETL: lat -34..5, lng -74..-28)
- [x] Consistência temporal (date ISO format)

---

## 📦 Repositórios
- [x] Interface `ISpeciesRepository`
- [x] Interface `IObservationRepository`
- [x] Implementação `InMemorySpeciesRepository`
- [x] Implementação `InMemoryObservationRepository`

---

# 🔌 FASE 4 — API (Node.js)

## ⚙️ Setup
- [x] Serviço Express 5 + TypeScript (`backend/`)
- [x] ts-node-dev para hot reload em desenvolvimento
- [x] CORS + JSON middleware

---

## 📡 Endpoints
- [x] `GET /api/species` + `POST /api/species` + `PUT` + `DELETE`
- [x] `GET /api/stats`
- [x] `GET /api/heatmap`
- [x] `GET /api/clusters`
- [x] `GET /api/prediction` (Bayesiano Laplace)
- [x] `GET /api/timeseries`
- [x] `GET /api/observations`
- [x] `GET /api/export/species.csv|json` + `GET /api/export/observations.csv|json` + `GET /api/export/stats.json`
- [x] `POST /api/upload/observations` (multer CSV)
- [x] `/api/ml/clusters|timeseries|pca|anomalies|classify` (proxy → Python)

---

## 🔄 Integração
- [x] Integrar com serviço Python via HTTP (`PythonAnalyticsClient`)
- [ ] Cache Redis (opcional — não implementado)

---

# 🧠 FASE 5 — Analytics (Python)

## ⚙️ Setup
- [x] FastAPI + uvicorn (`services/analytics/`)
- [x] pandas + numpy + scikit-learn + statsmodels

---

## 🔹 ETL
- [x] Ingestão de dados (`data/raw/*.csv` ou via API)
- [x] Limpeza (dedup, bounds geográficos)
- [x] Normalização (lat_norm, lng_norm)
- [x] Feature engineering (month, year, day_of_year, season, biome_enc, region_enc)
- [x] Salvar em `data/processed/`

---

## 📊 Estatística
- [x] Frequência de espécies
- [x] Distribuição por categoria
- [x] Métricas por região (byRegion no StatsService)

---

## 🧠 Estatística Bayesiana
- [x] P(Espécie | Região)
- [x] Suavização de Laplace (α=1)

---

## 📈 Séries Temporais
- [x] Médias móveis (byMonth no StatsService)
- [x] Tendência
- [x] Previsão ARIMA(1,1,1) com intervalos de confiança

---

## 🔗 Multivariada
- [x] PCA 2D + K-Means colors (`pca_service.py`)
- [x] Correlação — ScatterChart Espécies × Observações por Bioma no Dashboard

---

## 🤖 Machine Learning
- [x] K-Means — clusterização geográfica (`clustering.py`)
- [x] Árvore de decisão + feature importance (`classification.py`)

---

## 🚨 Anomalias
- [x] Isolation Forest (5% contamination) — `anomaly.py`

---

# 🗺️ FASE 6 — Mapa

## 🌍 Visualização
- [x] Leaflet + react-leaflet + CartoDB dark tiles
- [x] Renderizar pontos geográficos com CircleMarker + Popup

---

## 🔥 Features
- [x] Heatmap dinâmico real (leaflet.heat — gradiente azul→verde→amarelo→vermelho por intensidade)
- [x] Clusterização visual no mapa (círculos proporcionais ao nº de observações + popup com espécies)
- [x] Camadas ativáveis (toggle Pontos/Calor + Status/Bioma)
- [x] Timeline temporal (slider por ano)

---

## 🧠 Interação
- [x] Tooltip (espécie, data, região, bioma)
- [x] Probabilidade/tendência no tooltip — P(espécie|região) via Bayesiano Laplace

---

# 📊 FASE 7 — Dashboard

## 📈 Gráficos
- [x] Distribuição por categoria (BarChart)
- [x] Ranking de espécies mais observadas (BarChart horizontal)
- [x] Séries temporais (LineChart por mês)
- [x] Status por espécie (PieChart)
- [x] Observações por bioma (BarChart com filtro)
- [ ] Gráfico de correlação

---

## 🔄 Sincronização
- [x] Mapa → gráficos (FilterContext global)
- [x] Filtros globais (selectedBiome, selectedSpeciesId, selectedYear)
- [x] Seleção de espécie propagada

---

# ⚡ FASE 8 — Performance

- [ ] Cache de dados analíticos (Redis — não implementado)
- [x] Lazy loading (React.lazy + Suspense para todas as páginas)
- [x] Memoização (useMemo nos filtros e mapas de espécies)
- [x] Pré-processamento no backend (StatsService)

---

# 🔄 FASE 9 — Pipeline de Dados

- [x] ETL automatizado via endpoint (`POST /etl/run`)
- [ ] Atualização periódica de datasets (cron/scheduler — não implementado)
- [ ] Versionamento de dados

---

# 🧪 FASE 10 — Qualidade

- [x] Testes unitários domain — 22 testes (`backend/src/__tests__/domain.test.ts`)
- [x] Testes de integração API — 19 testes (`backend/src/__tests__/api.test.ts` + `stats.test.ts`)
- [x] Testes E2E frontend — Playwright (`frontend/e2e/`)
- [x] Testes unitários frontend — Vitest + Testing Library (10 testes)

---

# 🎨 FASE 11 — UI/UX

- [x] Tema oceânico (CSS variables: --bg-base #0a0e1a, --accent #06b6d4)
- [x] Layout científico (sidebar, charts-grid, KPI cards)
- [x] Responsividade (Tailwind + CSS Grid)
- [x] UX focada em análise (tabs Analytics, filtros globais, export)

---

# 🚀 FASE FINAL — Produto

- [x] Build Electron (`app/main.js` + electron-builder)
- [x] Empacotamento (AppImage/deb/dmg/nsis via `npm run dist:linux`)
- [x] Documentação (README.md com stack, quickstart, páginas, ETL, testes)
- [x] Deploy via Docker Compose (frontend :8080, API :3001, Analytics :8000, Portainer :9000)

---

# 💡 Extras (Diferenciais)

- [ ] Suporte offline (cache local)
- [x] Exportação de relatórios (CSV + JSON — espécies, observações, stats)
- [x] Upload de datasets personalizados (multer CSV upload)
- [ ] Plugins de análise

---

# 📋 Pendências prioritárias

- [x] Heatmap real com `leaflet.heat` integrado no MapPage + painel de legenda flutuante
- [ ] PostgreSQL substituindo in-memory (persistência real)
- [ ] Redis cache (performance em produção)
- [x] Correlação no Dashboard — ScatterChart Espécies × Observações por Bioma
- [x] Probabilidade/tendência nos tooltips do mapa — P(espécie|região) Bayesiano
- [x] Clusterização visual no mapa — view Clusters com círculos proporcionais
