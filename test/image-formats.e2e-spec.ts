import { afterAll, beforeAll, describe, test } from 'vitest'
import {
  cleanupFiles,
  getBlurhash,
  login,
  uploadImage,
} from '@/testing/directus'
import { decodeDataUri } from '@/testing/image'

describe('image formats (e2e)', () => {
  const expected = {
    undefined:
      'data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAABwAgCdASoFAAgAAUAmJYwCdEyAfoB7/4HoAragAPzzGmDspsy3mNLR5lLwhAmhQI07hGauG5CD9LfeDWuunEhH3GAAAA==',
    jpeg: 'data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAwAgCdASoFAAgAAUAmJYwCdEyAfoAB2TamWAD88xpg7KbMt5jS0eZS8IQJoUCNO+piyQVD5+Tov94L2/1Pc8kAAAA=',
    // avif times out the test
    avif: '',
    png: 'data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAwAgCdASoFAAgAAUAmJYwCdEyAfoAB2TamWAD88xpg7KbMt5jS0eZS8IQJoUCNQTUprHjvq6t+nUoJadvI5euCAAA=',
    tiff: 'data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAwAgCdASoFAAgAAUAmJYwCdEyAfoAB2TamWAD88xpg7KbMt5jS0eZS8IQJoUCNQTUjWjAM6x85Pac15B4AhJAoAAA=',
    webp: 'data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAABwAgCdASoFAAgAAUAmJYwCdEyAfoB7/4HoAragAPzzGmDspsy3nfHuaP89e55qpfJsTSAPfwdW/GicW35BgHCtpWgAAA==',
  }

  beforeAll(async () => {
    await login()
  })

  afterAll(async () => {
    await cleanupFiles()
  })

  test.concurrent.for([
    undefined,
    'jpeg',
    'png',
    'tiff',
    'webp',
  ] as const)('uploading %s generates a blurhash', async (format, {
    expect,
  }) => {
    const { id } = await uploadImage('test/sunset.jpg', format)

    // Wait for the background action to complete
    await new Promise((resolve) => {
      return setTimeout(resolve, 500)
    })

    const blurhash = await getBlurhash(id)
    expect(blurhash).toStrictEqual(expected[format ?? 'undefined'])

    const blur = await decodeDataUri(blurhash)
    // default values
    expect(blur?.format).toStrictEqual('webp')
    expect(blur?.height).toStrictEqual(8)
  })
})
