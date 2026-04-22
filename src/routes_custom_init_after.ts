import type { AbstractService } from '@directus/types'
import type { Logger } from 'pino'
import { generateBlurHash, supportedMimeTypes } from './utils/blurhash.ts'
import type { DirectusFile, DirectusSettings } from './utils/directus-schema.ts'
import { getSetting } from './utils/settings.ts'
import type { AssetsService } from './utils/types.ts'

interface InitAfterServices {
  assetsService: AssetsService
  itemsService: AbstractService<DirectusFile>
  settingsService: AbstractService<DirectusSettings>
}

/**
 * Regenerates BlurHash strings for all image assets in the system.
 *
 * @param itemsService - The service responsible for fetching and updating image metadata.
 * @param assetsService - The service used to retrieve image assets and their streams.
 */
export async function routesCustomInitAfter(
  services: InitAfterServices,
  logger: Logger
): Promise<void> {
  const { assetsService, itemsService, settingsService } = services
  const settings = await getSetting(settingsService, logger)

  logger.debug(
    `blurhash: plugin loaded with config ${JSON.stringify(settings)}`
  )

  if (!settings.generateMissingOnStart && !settings.regenerateOnStart) {
    return
  }

  logger.info(
    settings.regenerateOnStart
      ? 'blurhash: regenerating all blurs'
      : 'blurhash: generate missing blurs'
  )

  try {
    const images = await itemsService.readByQuery({
      fields: ['id'],
      filter: {
        _and: {
          type: {
            _in: supportedMimeTypes,
          },
          blurhash: settings.generateMissingOnStart
            ? {}
            : {
                _null: true,
              },
        },
      },
      limit: -1,
    })

    logger.debug(
      `blurhash: found missing ${JSON.stringify(
        images.map((i) => {
          return i.id
        })
      )}`
    )

    const chunkSize = settings.generationChunkSize
    for (let i = 0; i < images.length; i += chunkSize) {
      const chunk = images.slice(i, i + chunkSize).map(async (file) => {
        const blurHash = await generateBlurHash(
          file.id,
          assetsService,
          settings,
          logger
        )

        await itemsService.updateOne(file.id, { blurhash: blurHash })
      })

      // biome-ignore lint/performance/noAwaitInLoops: we need chunking to avoid an OOM
      await Promise.all(chunk)
    }

    logger.info(
      settings.regenerateOnStart
        ? 'blurhash: all blurs re generated'
        : 'blurhash: missing blurs generated'
    )
  } catch (error) {
    logger.error(`blurhash: Error re generating blurs: ${error}`)
  } finally {
    settingsService.upsertSingleton({ blurhasher_regenerate_on_start: false })
    logger.debug('blurhash: bootstrap completed')
  }
}
