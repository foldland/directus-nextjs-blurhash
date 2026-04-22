import { Buffer } from 'node:buffer'
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
  settings: BlurhashSettings
): Promise<string | undefined> {
  try {
    const { stream } = await assetsService.getAsset(key, {
      transformationParams: {
        height: settings.blurSize,
        format: settings.format,
      },
    })

    const chunks: Array<Buffer> = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const buffer = Buffer.concat(chunks)
    const blurImageBase64 = buffer.toString('base64')
    const blurHash = `data:image/${settings.format};base64,${blurImageBase64}`

    return blurHash
  } catch {
    return
  }
}
