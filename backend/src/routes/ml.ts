import { Router } from 'express'
import type { IObservationRepository } from '../repositories/IObservationRepository'
import { pythonAnalytics } from '../services/PythonAnalyticsClient'

export function mlRouter(obsRepo: IObservationRepository): Router {
  const router = Router()

  router.get('/ml/clusters', async (req, res) => {
    try {
      const obs = obsRepo.findAll({ speciesId: req.query.speciesId as string | undefined })
      const result = await pythonAnalytics.clusters(obs, Number(req.query.n_clusters ?? 5))
      res.json(result)
    } catch {
      res.status(503).json({ error: 'Python analytics service unavailable' })
    }
  })

  router.get('/ml/timeseries', async (req, res) => {
    try {
      const { speciesId, steps, granularity } = req.query as Record<string, string>
      const obs = obsRepo.findAll({ speciesId })
      const result = await pythonAnalytics.timeseries(obs, Number(steps ?? 6), granularity ?? 'month')
      res.json(result)
    } catch {
      res.status(503).json({ error: 'Python analytics service unavailable' })
    }
  })

  router.get('/ml/pca', async (req, res) => {
    try {
      const obs = obsRepo.findAll()
      const result = await pythonAnalytics.pca(obs, Number(req.query.n_components ?? 2))
      res.json(result)
    } catch {
      res.status(503).json({ error: 'Python analytics service unavailable' })
    }
  })

  router.get('/ml/anomalies', async (req, res) => {
    try {
      const obs = obsRepo.findAll()
      const result = await pythonAnalytics.anomalies(obs, Number(req.query.contamination ?? 0.05))
      res.json(result)
    } catch {
      res.status(503).json({ error: 'Python analytics service unavailable' })
    }
  })

  router.get('/ml/classify', async (req, res) => {
    try {
      const obs = obsRepo.findAll()
      const result = await pythonAnalytics.classify(obs, (req.query.target as string) ?? 'biome')
      res.json(result)
    } catch {
      res.status(503).json({ error: 'Python analytics service unavailable' })
    }
  })

  return router
}
