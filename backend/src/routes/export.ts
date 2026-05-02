import { Router } from 'express'
import multer from 'multer'
import type { ISpeciesRepository } from '../repositories/ISpeciesRepository'
import type { IObservationRepository } from '../repositories/IObservationRepository'
import type { StatsService } from '../services/StatsService'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0]!)
  const lines = rows.map((r) =>
    headers.map((h) => {
      const v = r[h] ?? ''
      const s = String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(','),
  )
  return [headers.join(','), ...lines].join('\n')
}

export function exportRouter(
  speciesRepo: ISpeciesRepository,
  obsRepo: IObservationRepository,
  statsService: StatsService,
): Router {
  const router = Router()

  router.get('/export/species.csv', (_req, res) => {
    const data = speciesRepo.findAll() as unknown as Record<string, unknown>[]
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="species.csv"')
    res.send(toCSV(data))
  })

  router.get('/export/species.json', (_req, res) => {
    res.setHeader('Content-Disposition', 'attachment; filename="species.json"')
    res.json(speciesRepo.findAll())
  })

  router.get('/export/observations.csv', (req, res) => {
    const { speciesId, startDate, endDate } = req.query as Record<string, string>
    const data = obsRepo.findAll({ speciesId, startDate, endDate }) as unknown as Record<string, unknown>[]
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="observations.csv"')
    res.send(toCSV(data))
  })

  router.get('/export/observations.json', (req, res) => {
    const { speciesId, startDate, endDate } = req.query as Record<string, string>
    res.setHeader('Content-Disposition', 'attachment; filename="observations.json"')
    res.json(obsRepo.findAll({ speciesId, startDate, endDate }))
  })

  router.get('/export/stats.json', (_req, res) => {
    res.setHeader('Content-Disposition', 'attachment; filename="stats.json"')
    res.json(statsService.getStats())
  })

  router.post('/upload/observations', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const content = req.file.buffer.toString('utf-8')
    const lines = content.trim().split('\n').filter(Boolean)

    if (lines.length < 2) return res.status(422).json({ error: 'CSV must have header and at least one row' })

    const headers = (lines[0] ?? '').split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
    const required = ['speciesId', 'speciesName', 'lat', 'lng', 'date']
    const missing = required.filter((r) => !headers.includes(r))

    if (missing.length) return res.status(422).json({ error: `Missing columns: ${missing.join(', ')}` })

    const created = []
    const errors = []

    for (let i = 1; i < lines.length; i++) {
      try {
        const vals = (lines[i] ?? '').split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
        const row = Object.fromEntries(headers.map((h, j) => [h, vals[j] ?? ''])) as Record<string, string>

        if (!row.lat || !row.lng || !row.date) {
          errors.push({ line: i + 1, error: 'Missing required value' })
          continue
        }

        const obs = obsRepo.create({
          speciesId: row.speciesId ?? '',
          speciesName: row.speciesName ?? '',
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lng),
          date: row.date,
          region: row.region ?? '',
          biome: row.biome ?? '',
          notes: row.notes ?? '',
        })
        created.push(obs)
      } catch (e) {
        errors.push({ line: i + 1, error: String(e) })
      }
    }

    return res.status(201).json({ imported: created.length, errors: errors.length, errorDetails: errors.slice(0, 5) })
  })

  return router
}
