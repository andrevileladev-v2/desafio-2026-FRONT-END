import request from 'supertest'
import express from 'express'
import cors from 'cors'
import { speciesSeed, observationsSeed } from '../seed/data'
import { InMemorySpeciesRepository } from '../repositories/InMemorySpeciesRepository'
import { InMemoryObservationRepository } from '../repositories/InMemoryObservationRepository'
import { StatsService } from '../services/StatsService'
import { speciesRouter } from '../routes/species'
import { observationsRouter } from '../routes/observations'
import { analyticsRouter } from '../routes/analytics'

function buildApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  const speciesRepo = new InMemorySpeciesRepository([...speciesSeed.map((s) => ({ ...s }))])
  const obsRepo = new InMemoryObservationRepository([...observationsSeed.map((o) => ({ ...o }))])
  const statsService = new StatsService(speciesRepo, obsRepo)

  app.use('/api/species', speciesRouter(speciesRepo, obsRepo))
  app.use('/api/observations', observationsRouter(obsRepo))
  app.use('/api', analyticsRouter(statsService))
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

  return app
}

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(buildApp()).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('GET /api/species', () => {
  it('returns array of species', async () => {
    const res = await request(buildApp()).get('/api/species')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('each species has required fields', async () => {
    const res = await request(buildApp()).get('/api/species')
    const sp = res.body[0]
    expect(sp).toHaveProperty('id')
    expect(sp).toHaveProperty('name')
    expect(sp).toHaveProperty('scientificName')
    expect(sp).toHaveProperty('category')
    expect(sp).toHaveProperty('status')
  })
})

describe('POST /api/species', () => {
  it('creates a new species and returns 201', async () => {
    const res = await request(buildApp())
      .post('/api/species')
      .send({ name: 'Sucuri', scientificName: 'Eunectes murinus', category: 'Reptile', status: 'Least Concern', description: '', biome: 'Amazônia' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Sucuri')
    expect(res.body.id).toBeDefined()
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await request(buildApp())
      .post('/api/species')
      .send({ name: 'Incomplete' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/species/:id', () => {
  it('returns species by id', async () => {
    const res = await request(buildApp()).get('/api/species/s1')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('s1')
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(buildApp()).get('/api/species/unknown')
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/species/:id', () => {
  it('deletes species and returns 204', async () => {
    const res = await request(buildApp()).delete('/api/species/s1')
    expect(res.status).toBe(204)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(buildApp()).delete('/api/species/unknown')
    expect(res.status).toBe(404)
  })
})

describe('GET /api/observations', () => {
  it('returns array of observations', async () => {
    const res = await request(buildApp()).get('/api/observations')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('filters by speciesId', async () => {
    const res = await request(buildApp()).get('/api/observations?speciesId=s1')
    expect(res.status).toBe(200)
    expect(res.body.every((o: { speciesId: string }) => o.speciesId === 's1')).toBe(true)
  })
})

describe('GET /api/stats', () => {
  it('returns stats with correct shape', async () => {
    const res = await request(buildApp()).get('/api/stats')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('totalSpecies')
    expect(res.body).toHaveProperty('totalObservations')
    expect(res.body).toHaveProperty('byCategory')
    expect(res.body).toHaveProperty('byStatus')
    expect(res.body).toHaveProperty('topSpecies')
    expect(res.body).toHaveProperty('byBiome')
  })

  it('totalSpecies matches seed count', async () => {
    const res = await request(buildApp()).get('/api/stats')
    expect(res.body.totalSpecies).toBe(15)
  })
})

describe('GET /api/timeseries', () => {
  it('returns array of time series points', async () => {
    const res = await request(buildApp()).get('/api/timeseries')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('supports year granularity', async () => {
    const res = await request(buildApp()).get('/api/timeseries?granularity=year')
    expect(res.status).toBe(200)
    const dates: string[] = res.body.map((p: { date: string }) => p.date)
    expect(dates.every((d) => /^\d{4}$/.test(d))).toBe(true)
  })
})

describe('GET /api/heatmap', () => {
  it('returns heatmap points with lat/lng', async () => {
    const res = await request(buildApp()).get('/api/heatmap')
    expect(res.status).toBe(200)
    expect(res.body[0]).toMatchObject({ lat: expect.any(Number), lng: expect.any(Number) })
  })
})
