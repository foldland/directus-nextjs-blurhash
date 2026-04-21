/** biome-ignore-all lint/style/noProcessEnv: Testing only */
import process from 'node:process'

function validateENV() {
  const directusUrl = process.env.DIRECTUS_URL
  /* v8 ignore if -- @preserve */
  if (!directusUrl) {
    throw new Error('Missing env: DIRECTUS_URL')
  }

  const email = process.env.ADMIN_EMAIL
  /* v8 ignore if -- @preserve */
  if (!email) {
    throw new Error('Missing env: ADMIN_EMAIL')
  }

  const password = process.env.ADMIN_PASSWORD
  /* v8 ignore if -- @preserve */
  if (!password) {
    throw new Error('Missing env: ADMIN_PASSWORD')
  }

  return {
    directusUrl: directusUrl,
    email: email,
    password: password,
  }
}

export const env = validateENV()
