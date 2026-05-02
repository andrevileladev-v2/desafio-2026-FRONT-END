import { Router } from 'express'
import type { StatsService } from '../services/StatsService'

export function analyticsRouter(statsService: StatsService): Router {
  const router = Router()

  router.get('/stats', (_req, res) => {
    res.json(statsService.getStats())
  })

  router.get('/heatmap', (_req, res) => {
    res.json(statsService.getHeatmap())
  })

  router.get('/clusters', (_req, res) => {
    res.json(statsService.getClusters())
  })

  router.get('/timeseries', (req, res) => {
    const { speciesId, granularity } = req.query as Record<string, string>
    const granOpt = granularity === 'year' ? 'year' : 'month'
    res.json(statsService.getTimeSeries(speciesId, granOpt))
  })

  router.get('/bayesian', (_req, res) => {
    res.json(statsService.getBayesian())
  })

  return router
}
