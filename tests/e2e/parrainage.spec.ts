import { test, expect } from './fixtures'

// En production, https://yadony.com/r/{code} est redirigé vers
// /parrainage?code={code} par public/_redirects (Cloudflare Pages). Le serveur
// local de la suite ne lit pas ce fichier : on part donc de l'URL de destination.

test('la page d’invitation affiche le code normalisé et le lien vers l’app', async ({ page }) => {
  await page.goto('/parrainage?code=abou1890')
  await expect(page.getByRole('heading', { level: 1, name: 'Vous êtes invité sur Yadony' })).toBeVisible()
  await expect(page.getByTestId('referral-code')).toContainText('ABOU1890')
  await expect(page.getByTestId('referral-open-app')).toHaveAttribute('href', 'yadony://referral?code=ABOU1890')
  await expect(page.getByTestId('referral-install')).toContainText("saisissez le code ABOU1890 à l'inscription")
})

test('le bouton copie le code et confirme', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/parrainage?code=ABOU1890')
  const bouton = page.getByTestId('referral-copy')
  await expect(bouton).toHaveText('Copier le code')
  await bouton.click()
  await expect(bouton).toHaveText('Copié')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('ABOU1890')
})

test('un code invalide donne une invitation générique sans code', async ({ page }) => {
  await page.goto('/parrainage?code=%3Cb%3Ex%3C%2Fb%3E')
  await expect(page.getByRole('heading', { level: 1, name: 'Vous êtes invité sur Yadony' })).toBeVisible()
  await expect(page.getByTestId('referral-no-code')).toBeVisible()
  await expect(page.getByTestId('referral-code')).toHaveCount(0)
  await expect(page.getByTestId('referral-open-app')).toHaveCount(0)
})

test('la page d’invitation n’est pas indexée et porte une image OG', async ({ page }) => {
  await page.goto('/parrainage?code=ABOU1890')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
  await expect(page).toHaveTitle('Invitation Yadony')
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Invitation Yadony')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://yadony.com/og/default.png')
})

test('la page d’invitation est absente du sitemap', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).not.toContain('/parrainage')
  expect(sitemap).not.toContain('/referral')
})

test('la version anglaise existe', async ({ page }) => {
  await page.goto('/en/referral?code=ABOU1890')
  await expect(page.getByRole('heading', { level: 1, name: "You're invited to Yadony" })).toBeVisible()
  await expect(page.getByTestId('referral-open-app')).toHaveText('Open the Yadony app')
  await expect(page.getByTestId('referral-open-app')).toHaveAttribute('href', 'yadony://referral?code=ABOU1890')
})
