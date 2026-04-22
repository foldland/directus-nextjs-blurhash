import { afterAll, beforeAll, describe, test } from 'vitest'
import {
  applySettings,
  cleanupFiles,
  getBlurhash,
  login,
  uploadImage,
} from '@/testing/directus'
import { decodeDataUri } from '@/testing/image'

describe('blur sizes (e2e)', () => {
  const expected = {
    4: 'data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoDAAQAAUAmJQBOiP/wPQ5kHAAA/ie9H/L92QAfOVH9i5DJ18SBHlAMsikGduSSJuuq/C8AAAA=',
    8: 'data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAABwAgCdASoFAAgAAUAmJYwCdEyAfoB7/4HoAragAPzzGmDspsy3mNLR5lLwhAmhQI07hGauG5CD9LfeDWuunEhH3GAAAA==',
    16: 'data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAAAQAgCdASoLABAAAUAmJYgCdGuAAs2W7SfQAP5BJlUdTxISuZXs0S0O27zTZTSmIGNm8wP+Rq5kJ+eD5nL5M+i6y9mii5uw8692XEXseNfhxqoiBsiyQ52yrMhORoYAAAA=',
    32: 'data:image/webp;base64,UklGRrwAAABXRUJQVlA4ILAAAAAQBgCdASoVACAAPm0skUWkIqGYBABABsSgCdMoR1cKp5tgPIS8dk6OeNQbrX0uUIzTD1qTuhfA/UAA/rxyIVO/gY3XEWRlYnvtMs+zbRs+DteyJuPX25p0jDfb94eproD/xtU/sCqox6Fg+ovE/bVzohk2dYw1BuinL9lttAFDY1waQg5TLrdslYU7awuRQxXfFla8sr59+edEar47mNrhWRAzIF4X1xfmszgvZ9uAAA==',
  }

  beforeAll(async () => {
    await login()
  })

  afterAll(async () => {
    await cleanupFiles()
    await applySettings({ blurhasher_blur_size: 8 })
  })

  test.for([
    4, 8, 16, 32,
  ] as const)('uploading generates a blurhash with size %i', async (size, {
    expect,
  }) => {
    await applySettings({ blurhasher_blur_size: size })

    const { id } = await uploadImage('test/sunset.jpg')

    // Wait for the background action to complete
    await new Promise((resolve) => {
      return setTimeout(resolve, 500)
    })

    const blurhash = await getBlurhash(id)
    expect(blurhash).toStrictEqual(expected[size])

    const blur = await decodeDataUri(blurhash)
    expect(blur?.format).toStrictEqual('webp') // default value
    expect(blur?.height).toStrictEqual(size)
  })
})
