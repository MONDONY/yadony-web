import { test, expect } from '@playwright/test'

const PAGES = ['/', '/comment-ca-marche', '/tarifs']

for (const path of PAGES) {
  test(`la page ${path} ne défile pas horizontalement en 360 px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}
