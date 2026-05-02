import { Router } from 'express'
import type { IObservationRepository } from '../repositories/IObservationRepository'

export function observationsRouter(obsRepo: IObservationRepository): Router {
  const router = Router()

  router.get('/', (req, res) => {
    const { speciesId, startDate, endDate } = req.query as Record<string, string>
    const obs = obsRepo.findAll({ speciesId, startDate, endDate })
    res.json(obs)
  })

  router.get('/:id', (req, res) => {
    const obs = obsRepo.findById(req.params.id ?? '')
    if (!obs) return res.status(404).json({ error: 'Observation not found' })
    return res.json(obs)
  })

  router.post('/', (req, res) => {
    const { speciesId, speciesName, lat, lng, date, region, biome, notes } = req.body as Record<string, string>
    if (!speciesId || !lat || !lng || !date) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const created = obsRepo.create({
      speciesId,
      speciesName: speciesName ?? '',
      lat: Number(lat),
      lng: Number(lng),
      date,
      region: region ?? '',
      biome: biome ?? '',
      notes: notes ?? '',
    })
    return res.status(201).json(created)
  })

  return router
}
