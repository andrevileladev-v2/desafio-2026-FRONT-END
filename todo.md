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
- [ ] Criar estrutura base:
apps/
services/
data/
infra/


- [ ] Configurar workspace (pnpm ou yarn workspaces)
- [ ] Configurar TypeScript global
- [ ] Configurar ESLint + Prettier

---

## 🖥️ Electron + Web
- [ ] Criar app Electron (`apps/desktop`)
- [ ] Criar app React (`apps/web`)
- [ ] Configurar preload seguro (IPC)
- [ ] Integrar Electron ↔ React

---

## 🐳 Infraestrutura
- [ ] Criar `docker-compose.yml`
- [ ] Subir serviços:
- [ ] Node API
- [ ] Python Analytics
- [ ] PostgreSQL
- [ ] Configurar variáveis de ambiente

---

# 🧩 FASE 2 — Arquitetura Base

## 🧠 Padrões
- [ ] Implementar:
- [ ] Clean Architecture
- [ ] DDD (Domain-Driven Design)
- [ ] Ports & Adapters (Hexagonal)
- [ ] Dependency Injection

---

## 📁 Estrutura por Feature
- [ ] Criar estrutura base:
  features/
  domain/
  data/
  ui/


---

# 🧬 FASE 3 — Domínio (Core)

## 🌱 Espécies
- [ ] Criar entidade `Species`
- [ ] Criar Value Objects:
- [ ] Location
- [ ] TimeRange
- [ ] Definir regras de negócio

---

## 📊 Observações
- [ ] Entidade `Observation`
- [ ] Regras:
- validação geográfica
- consistência temporal

---

## 📦 Repositórios
- [ ] Interface `SpeciesRepository`
- [ ] Interface `ObservationRepository`

---

# 🔌 FASE 4 — API (Node.js)

## ⚙️ Setup
- [ ] Criar serviço `services/api`
- [ ] Configurar Express/Fastify
- [ ] Configurar DI container

---

## 📡 Endpoints
- [ ] `/species`
- [ ] GET
- [ ] POST
- [ ] `/stats`
- [ ] `/heatmap`
- [ ] `/clusters`
- [ ] `/prediction`
- [ ] `/timeseries`

---

## 🔄 Integração
- [ ] Integrar com serviço Python (HTTP/gRPC)
- [ ] Implementar cache (Redis opcional)

---

# 🧠 FASE 5 — Analytics (Python)

## ⚙️ Setup
- [ ] Criar serviço `services/analytics`
- [ ] Configurar:
- pandas
- numpy
- scikit-learn
- statsmodels

---

## 🔹 ETL
- [ ] Ingestão de dados (`data/raw`)
- [ ] Limpeza
- [ ] Normalização
- [ ] Feature engineering
- [ ] Salvar em `data/processed`

---

## 📊 Estatística
- [ ] Frequência de espécies
- [ ] Distribuição por categoria
- [ ] Métricas por região

---

## 🧠 Estatística Bayesiana
- [ ] Implementar:
- P(Espécie | Região)
- [ ] Aplicar suavização de Laplace

---

## 📈 Séries Temporais
- [ ] Médias móveis
- [ ] Tendência
- [ ] Previsão (ARIMA ou regressão)

---

## 🔗 Multivariada
- [ ] Correlação
- [ ] PCA
- [ ] Análise conjunta

---

## 🤖 Machine Learning
- [ ] K-Means (clusterização geográfica)
- [ ] Classificação:
- regressão logística
- árvore de decisão

---

## 🚨 Anomalias
- [ ] Detectar padrões fora da curva

---

# 🗺️ FASE 6 — Mapa

## 🌍 Visualização
- [ ] Integrar mapa (Mapbox / Leaflet)
- [ ] Renderizar pontos geográficos

---

## 🔥 Features
- [ ] Heatmap dinâmico
- [ ] Clusterização visual
- [ ] Camadas ativáveis
- [ ] Timeline temporal

---

## 🧠 Interação
- [ ] Tooltip com:
- probabilidade
- estatísticas
- tendências

---

# 📊 FASE 7 — Dashboard

## 📈 Gráficos
- [ ] Distribuição por categoria
- [ ] Ranking de espécies
- [ ] Séries temporais
- [ ] Correlação

---

## 🔄 Sincronização
- [ ] Mapa → gráficos
- [ ] Filtros globais
- [ ] Seleção de espécie

---

# ⚡ FASE 8 — Performance

- [ ] Cache de dados analíticos
- [ ] Lazy loading
- [ ] Memoização
- [ ] Pré-processamento no backend

---

# 🔄 FASE 9 — Pipeline de Dados

- [ ] Automatizar ETL
- [ ] Atualizar datasets periodicamente
- [ ] Versionamento de dados

---

# 🧪 FASE 10 — Qualidade

- [ ] Testes unitários (domain)
- [ ] Testes de integração (API)
- [ ] Testes E2E (frontend)

---

# 🎨 FASE 11 — UI/UX

- [ ] Tema oceânico
- [ ] Layout científico
- [ ] Responsividade
- [ ] UX focada em análise

---

# 🚀 FASE FINAL — Produto

- [ ] Build Electron
- [ ] Empacotamento
- [ ] Documentação
- [ ] Deploy interno

---

# 💡 Extras (Diferenciais)

- [ ] Suporte offline (cache local)
- [ ] Exportação de relatórios
- [ ] Upload de datasets personalizados
- [ ] Plugins de análise

---

# 🧭 Próximo passo

Começar por:
1. Setup monorepo
2. Electron + React
3. API básica
4. Primeiro mapa renderizando dados mockados