# 🎨 Desafio Técnico – Frontend (React)

## 🎯 Objetivo

- Desenvolver uma interface web para visualização e gerenciamento de dados de espécies consumindo uma API.
- **Período para execução:** 27 de abril até 7 de maio

---

## 🧠 Requisitos

### 🔹 Tecnologias

- ReactJS  
- TypeScript  
- Tailwind CSS  

---

## 🔹 Funcionalidades

### 📍 Listagem de Espécies

- Exibir espécies em tabela ou cards  
- Filtro por categoria  
- Busca por nome  

---

### 📍 Visualização de Dados

- Exibir estatísticas (ex: gráfico por categoria)  
- Pode utilizar bibliotecas como Chart.js ou Recharts  

---

### 📍 Cadastro de Espécies

- Formulário com validação  
- Integração com API  

---

### 📍 UI/UX

- Layout responsivo  
- Uso de Tailwind CSS  
- Organização visual consistente  

---

### 📍 Performance e Boas Práticas

- Componentização adequada  
- Uso correto de hooks  
- Evitar re-renderizações desnecessárias  

---

### 📍 Diferencial (Opcional)

- Empacotar a aplicação como desktop utilizando Electron  

---

## 📦 Entregáveis

- Repositório no GitHub  
- Deploy da aplicação (Vercel, Netlify ou similar)  
- README com instruções de execução  

---

## 🧪 Critérios de Avaliação

| Critério                         | Peso |
|--------------------------------|------|
| Estrutura e organização         | 20% |
| UI/UX e responsividade         | 20% |
| Funcionalidades implementadas   | 20% |
| Integração com API              | 15% |
| Boas práticas (React + TS)      | 15% |
| Performance                     | 5%  |
| Diferenciais (Electron, etc.)   | 5%  |

---

## ⭐ Desafio Extra (Opcional)

### 🎯 Objetivo

Demonstrar capacidade analítica e diferencial técnico.

---

### 📊 Análise de Dados

Implementar visualizações adicionais como:

- Espécies mais registradas  
- Distribuição por categoria  
- Análise geográfica (mapas)  

---

### 🔹 Sugestões de ferramentas

- Chart.js / Recharts  
- Leaflet / Google Maps  

---

## 🧪 Avaliação Extra

| Critério          | Peso |
|------------------|------|
| Criatividade      | 40% |
| Clareza dos dados | 30% |
| Qualidade técnica | 30% |

---

## ⚠️ Observações

- O desafio **não precisa estar 100% completo** para ser avaliado  
- O foco principal será:
  - Organização do código  
  - Raciocínio técnico  
  - Boas práticas  
- Diferenciais são opcionais, mas valorizados

## 👤 Em caso de dúvidas entre em contato com:
* Theodor: 55 53 991469520 (Whatsapp)
* Email: siapesq@gmail.com

---

## 🚀 EcoAnalysis Platform — Implementação

### Stack
| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind (tema oceânico) |
| Backend | Node.js + Express 5 + TypeScript |
| Analytics | Python 3.12 + FastAPI + scikit-learn + statsmodels |
| Desktop | Electron 41 + electron-builder |
| Infra | Docker Compose + Portainer |
| Testes | Jest (43) + Vitest (10) + Playwright E2E |

### Início rápido
```bash
# Web
npm install && npm run dev          # http://localhost:5173

# Desktop
npm run dev:electron

# Python ML
cd services/analytics && pip install -r requirements.txt
python3 -m uvicorn main:app --port 8000

# Docker (produção)
docker compose up --build
# Frontend: :8080 | API: :3001 | Analytics: :8000 | Portainer: :9000
```

### Páginas
- **Dashboard** — KPIs + 6 gráficos Recharts (linha, pizza, barras, scatter correlação), filtro global por bioma, export CSV/JSON
- **Mapa** — Leaflet + CartoDB dark, 3 modos: Pontos (status/bioma) / Mapa de Calor (leaflet.heat) / Clusters, tooltip com P(espécie|região), timeline por ano, legenda flutuante
- **Espécies** — CRUD completo, busca/filtros, upload CSV, export
- **Analytics** — 6 abas: Bayesiano, ARIMA, K-Means, PCA, Isolation Forest, Árvore de Decisão

### ETL Pipeline
```
data/raw/*.csv → limpeza → normalização → feature engineering → data/processed/
```

### Testes
```bash
npm test                            # 43 backend + 10 frontend
cd frontend && npx playwright test  # E2E (requer servidor rodando)
```

### Deploy

#### Frontend — Vercel (recomendado)
```bash
# 1. Faça push para o GitHub
# 2. Importe o repo no vercel.com
# 3. Adicione a env var: VITE_API_URL=<url-do-backend>
# O vercel.json já está configurado
```

#### Frontend — Netlify
```bash
# 1. Faça push para o GitHub
# 2. Importe o repo no netlify.com
# 3. Adicione a env var: VITE_API_URL=<url-do-backend>
# O netlify.toml já está configurado
```

#### Backend — Render (free tier)
```bash
# 1. New Web Service → conecte o repo
# 2. Root Directory: backend
# 3. Build Command: npm install && npm run build
# 4. Start Command: npm start
# 5. Env: PORT=3001
```

#### Tudo via Docker
```bash
docker compose up --build
# Frontend: :8080 | API: :3001 | Analytics: :8000 | Portainer: :9000
```
