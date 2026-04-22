import { afterAll, beforeAll, describe, test } from 'vitest'
import {
  applySettings,
  cleanupFiles,
  getBlurhash,
  login,
  uploadImage,
} from '@/testing/directus'
import { decodeDataUri } from '@/testing/image'

describe('blur formats (e2e)', () => {
  const expected = {
    jpeg: 'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAUDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAT/xAAdEAACAQQDAAAAAAAAAAAAAAABAgADBAYhEjFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAP/xAAYEQEAAwEAAAAAAAAAAAAAAAABAAIRMv/aAAwDAQACEQMRAD8AjOSYmlCjyt7mo5BJLKoI31ryIiBvnTKJTeSf/9k=',
    png: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAICAIAAAC+k6JsAAAACXBIWXMAACTpAAAk6QFQJOf4AAAAi0lEQVR4nAGAAH//AFprilxwj1xwj1huj1BpigB2gJh5hZ2Bj6Z6iqNwhJ8AiIKKW1Zkl5Wcqqyzmp+pAMKqmsepldK0ntG6pcCvoADAiXLonnD/uGfpoHDHkXYAYEtOgFhSpmpSglpTaFJTAEVAQlJHSFxJSk5FR0ZCRQA8NjhGODhZPjpHOjo7NTixBjiq3dQ3UQAAAABJRU5ErkJggg==',
    webp: 'data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAABwAgCdASoFAAgAAUAmJYwCdEyAfoB7/4HoAragAPzzGmDspsy3mNLR5lLwhAmhQI07hGauG5CD9LfeDWuunEhH3GAAAA==',
    avif: 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAImlsb2MAAAAAREAAAQABAAAAAAD6AAEAAAAAAAAAKwAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAAVmlwcnAAAAA4aXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAUAAAAIAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAEAAQOBAgMAAAAzbWRhdBIACgg4CKdhAQ0GkDIdGAAAAECXX+Fr4F/IHsJ1KJ04ifVkFQ5qVKTusPA=',
  }

  const expectedFormat = {
    jpeg: 'jpeg',
    png: 'png',
    webp: 'webp',
    // Directus encodes avif inside a heif container
    avif: 'heif',
  }

  beforeAll(async () => {
    await login()
  })

  afterAll(async () => {
    await cleanupFiles()
    await applySettings({ blurhasher_format: 'webp' })
  })

  test.for([
    'jpeg',
    'png',
    'webp',
    'avif',
  ] as const)('uploading generates a blurhash in format %s', async (format, {
    expect,
  }) => {
    await applySettings({ blurhasher_format: format })

    const { id } = await uploadImage('test/sunset.jpg')

    // Wait for the background action to complete
    await new Promise((resolve) => {
      return setTimeout(resolve, 500)
    })

    const blurhash = await getBlurhash(id)
    expect(blurhash).toStrictEqual(expected[format])

    const blur = await decodeDataUri(blurhash)
    expect(blur?.format).toStrictEqual(expectedFormat[format])
    expect(blur?.height).toStrictEqual(8) // default value
  })
})
