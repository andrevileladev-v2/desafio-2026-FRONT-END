import express from 'express'
import cors from 'cors'
import { speciesSeed, observationsSeed } from './seed/data'
import { InMemorySpeciesRepository } from './repositories/InMemorySpeciesRepository'
import { InMemoryObservationRepository } from './repositories/InMemoryObservationRepository'
import { StatsService } from './services/StatsService'
import { speciesRouter } from './routes/species'
import { observationsRouter } from './routes/observations'
import { analyticsRouter } from './routes/analytics'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

const speciesRepo = new InMemorySpeciesRepository(speciesSeed)
const obsRepo = new InMemoryObservationRepository(observationsSeed)
const statsService = new StatsService(speciesRepo, obsRepo)

app.use('/api/species', speciesRouter(speciesRepo, obsRepo))
app.use('/api/observations', observationsRouter(obsRepo))
app.use('/api', analyticsRouter(statsService))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
