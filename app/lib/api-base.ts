export const PROD_API_BASE = 'https://api.yadony.com/api/v1'
export const STAGING_API_BASE = 'https://api-staging.yadony.com/api/v1'

// Adresse de l'API choisie au build. NUXT_PUBLIC_API_BASE l'emporte toujours.
// Sinon, un aperçu Cloudflare Pages (CF_PAGES_BRANCH posé, branche autre que
// main) vise l'API staging, dont le CORS liste l'adresse de l'aperçu ; main et
// un build local visent la production.
export function resolveApiBase(env: Record<string, string | undefined>): string {
  if (env.NUXT_PUBLIC_API_BASE) return env.NUXT_PUBLIC_API_BASE
  const branch = env.CF_PAGES_BRANCH
  return branch && branch !== 'main' ? STAGING_API_BASE : PROD_API_BASE
}
