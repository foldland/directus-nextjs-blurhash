import { buffer } from 'node:stream/consumers'
import type { Logger } from 'pino'
import type { AssetsService, BlurhashSettings } from './types'

/**
 * Input formats supported by sharp.
 *
 * https://sharp.pixelplumbing.com/#formats
 */
export const supportedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/tiff',
  'image/svg+xml',
]

/**
 * Generates a BlurHash string from a readable stream.
 *
 * @param stream - The readable stream to generate the BlurHash from.
 *
 * @returns A Promise that resolves to the generated BlurHash string, or null if an error occurs.
 */
export async function generateBlurHash(
  key: string,
  assetsService: AssetsService,
  settings: BlurhashSettings,
  logger: Logger
): Promise<string | undefined> {
  try {
    const { stream } = await assetsService.getAsset(key, {
      transformationParams: {
        transforms: [
          ['resize', { height: settings.blurSize }],
          ['toFormat', settings.format],
        ],
      },
    })

    const buf = await buffer(stream)
    const blurImageBase64 = buf.toString('base64')
    const blurHash = `data:image/${settings.format};base64,${blurImageBase64}`
    logger.trace(() => {
      return `blurhash: generated ${blurHash} for image ${key}`
    })

    return blurHash
  } catch (error) {
    logger.error(() => {
      return `blurhash: Error generating blurhash: ${error}`
    })
  }
}
