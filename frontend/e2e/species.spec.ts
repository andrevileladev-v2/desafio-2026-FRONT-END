import { test, expect } from '@playwright/test'

test.describe('Species Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/species')
    await page.waitForLoadState('networkidle')
  })

  test('renders species cards', async ({ page }) => {
    const cards = page.locator('.species-card')
    await expect(cards).toHaveCount(15)
  })

  test('filters species by search', async ({ page }) => {
    await page.fill('.search-input', 'arara')
    const cards = page.locator('.species-card')
    await expect(cards).toHaveCount(1)
    await expect(page.getByText('Arara-azul-grande')).toBeVisible()
  })

  test('filters by category', async ({ page }) => {
    await page.selectOption('.filter-select:first-of-type', 'Bird')
    const cards = page.locator('.species-card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThan(15)
  })

  test('opens species detail on click', async ({ page }) => {
    await page.locator('.species-card').first().click()
    await expect(page.locator('.species-detail')).toBeVisible()
  })

  test('opens add species modal', async ({ page }) => {
    await page.getByText('+ Espécie').click()
    await expect(page.locator('.modal')).toBeVisible()
    await expect(page.getByText('Nova Espécie')).toBeVisible()
  })

  test('closes modal on cancel', async ({ page }) => {
    await page.getByText('+ Espécie').click()
    await page.getByText('Cancelar').click()
    await expect(page.locator('.modal')).not.toBeVisible()
  })

  test('creates a new species', async ({ page }) => {
    await page.getByText('+ Espécie').click()
    await page.fill('input[placeholder*=""]', 'Sucuri')
    const inputs = page.locator('.species-form input')
    await inputs.nth(0).fill('Sucuri')
    await inputs.nth(1).fill('Eunectes murinus')
    await page.getByText('Criar Espécie').click()
    await expect(page.locator('.modal')).not.toBeVisible()
    const cards = page.locator('.species-card')
    await expect(cards).toHaveCount(16)
  })

  test('shows export buttons', async ({ page }) => {
    await expect(page.getByText('CSV')).toBeVisible()
    await expect(page.getByText('JSON')).toBeVisible()
    await expect(page.getByText('Upload CSV')).toBeVisible()
  })
})
