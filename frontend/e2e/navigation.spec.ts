import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('loads the dashboard page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/EcoAnalysis/)
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('sidebar links navigate to correct pages', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /Mapa/ }).click()
    await expect(page).toHaveURL('/map')
    await expect(page.getByText('Mapa Geoespacial')).toBeVisible()

    await page.getByRole('link', { name: /Espécies/ }).click()
    await expect(page).toHaveURL('/species')
    await expect(page.getByText('Espécies')).toBeVisible()

    await page.getByRole('link', { name: /Analytics/ }).click()
    await expect(page).toHaveURL('/analytics')
    await expect(page.getByText('Analytics Avançado')).toBeVisible()
  })

  test('shows API connected status in sidebar', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('API Conectada')).toBeVisible()
  })
})
