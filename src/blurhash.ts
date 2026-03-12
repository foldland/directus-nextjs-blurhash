import { Buffer } from 'node:buffer'
import type { Readable } from 'node:stream'
import type { Logger } from 'pino'

/**
 * Generates a BlurHash string from a readable stream.
 *
 * @param stream - The readable stream to generate the BlurHash from.
 * @returns A Promise that resolves to the generated BlurHash string, or null if an error occurs.
 */
export async function generateBlurHashFromStream(
  stream: Readable,
  logger: Logger
): Promise<string | null> {
  try {
    const chunks: Array<Buffer> = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    const blurImageBase64 = buffer.toString('base64')
    const blurHash = `data:image/png;base64,${blurImageBase64}`

    return blurHash
  } catch (error) {
    logger.error(`[blurhasher]: Error generating BlurHash: ${error}`)
    return null
  }
}
