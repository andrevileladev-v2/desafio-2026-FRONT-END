import { Router } from 'express'
import type { ISpeciesRepository } from '../repositories/ISpeciesRepository'
import type { IObservationRepository } from '../repositories/IObservationRepository'

export function speciesRouter(
  speciesRepo: ISpeciesRepository,
  obsRepo: IObservationRepository,
): Router {
  const router = Router()

  router.get('/', (_req, res) => {
    res.json(speciesRepo.findAll())
  })

  router.get('/:id', (req, res) => {
    const species = speciesRepo.findById(req.params.id ?? '')
    if (!species) return res.status(404).json({ error: 'Species not found' })
    return res.json(species)
  })

  router.post('/', (req, res) => {
    const { name, scientificName, category, status, description, biome } = req.body as Record<string, string>
    if (!name || !scientificName || !category || !status) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const created = speciesRepo.create({
      name,
      scientificName,
      category: category as never,
      status: status as never,
      description: description ?? '',
      biome: biome ?? '',
    })
    return res.status(201).json(created)
  })

  router.put('/:id', (req, res) => {
    const updated = speciesRepo.update(req.params.id ?? '', req.body as never)
    if (!updated) return res.status(404).json({ error: 'Species not found' })
    return res.json(updated)
  })

  router.delete('/:id', (req, res) => {
    const deleted = speciesRepo.delete(req.params.id ?? '')
    if (!deleted) return res.status(404).json({ error: 'Species not found' })
    return res.status(204).send()
  })

  router.get('/:id/observations', (req, res) => {
    const obs = obsRepo.findBySpeciesId(req.params.id ?? '')
    res.json(obs)
  })

  return router
}
