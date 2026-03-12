import type { ExtensionsServices } from '@directus/types'
import type { Logger } from 'pino'
import { generateBlurHashFromStream } from './blurhash.ts'

type AssetsService = InstanceType<ExtensionsServices['AssetsService']>
type ItemsService = InstanceType<ExtensionsServices['ItemsService']>

/**
 * Regenerates BlurHash strings for all image assets in the system.
 *
 * @param itemsService - The service responsible for fetching and updating image metadata.
 * @param assetsService - The service used to retrieve image assets and their streams.
 * @param logger - Logger instance for logging progress and errors.
 */
export async function regenerateAllImages(
  itemsService: ItemsService,
  assetsService: AssetsService,
  logger: Logger
): Promise<void> {
  /**
   * Fetching a list of all image files that need their BlurHash regenerated.
   */
  const files = await itemsService.readByQuery({
    fields: ['id'], // Specifying that only the 'id' field is needed from each record.
    filter: {
      type: {
        _in: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/tiff',
          'image/avif',
        ],
      },
    },
    limit: -1,
  })

  logger.info(`[blurhasher]: Total files to regenerate: ${files.length}`)

  for (const file of files) {
    /**
     * Retrieving the image stream for the current file with specified transformation parameters.
     */
    try {
      // biome-ignore lint/performance/noAwaitInLoops: needed here
      const { stream } = await assetsService.getAsset(file.id, {
        transformationParams: {
          quality: 80,
          width: 100,
          fit: 'inside',
        },
      })

      /**
       * Generating a new BlurHash string from the image stream.
       */
      const blurHash: string | null = await generateBlurHashFromStream(
        stream,
        logger
      )
      await itemsService.updateOne(file.id, { blurhash: blurHash })
      logger.info(`[blurhasher]: Regenerating blurhash for file ${file.id}`)
    } catch (error) {
      logger.error(
        `[blurhasher]: Error regenerating blurhash for file ${file.id}: ${error}`
      )
    }
  }
}
