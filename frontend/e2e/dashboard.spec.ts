import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('renders KPI cards with numbers', async ({ page }) => {
    await expect(page.getByText('Espécies Monitoradas')).toBeVisible()
    await expect(page.getByText('Observações Registradas')).toBeVisible()
    await expect(page.getByText('Biomas Cobertos')).toBeVisible()
    await expect(page.getByText('Criticamente Ameaçadas')).toBeVisible()
  })

  test('shows 15 species in KPI', async ({ page }) => {
    const kpiCard = page.locator('.kpi-card').first()
    await expect(kpiCard.locator('.kpi-value')).toHaveText('15')
  })

  test('renders charts section', async ({ page }) => {
    await expect(page.getByText('Observações por Mês')).toBeVisible()
    await expect(page.getByText('Espécies por Status')).toBeVisible()
    await expect(page.getByText('Observações por Bioma')).toBeVisible()
    await expect(page.getByText('Ranking de Espécies Mais Observadas')).toBeVisible()
  })

  test('export buttons are visible', async ({ page }) => {
    await expect(page.getByText('Exportar Stats JSON')).toBeVisible()
    await expect(page.getByText('Exportar Obs. CSV')).toBeVisible()
  })
})
