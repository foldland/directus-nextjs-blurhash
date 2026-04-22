import type { AbstractService } from '@directus/types'
import {
  generateBlurHashFromStream,
  supportedMimeTypes,
} from './utils/blurhash.ts'
import type { DirectusFile, DirectusSettings } from './utils/directus-schema.ts'
import { getSetting, runMigration } from './utils/settings.ts'
import type { AssetsService, FieldsService } from './utils/types.ts'

export async function routesCustomInitBefore(
  fieldsService: FieldsService
): Promise<void> {
  await runMigration(fieldsService)
}

/**
 * Regenerates BlurHash strings for all image assets in the system.
 *
 * @param itemsService - The service responsible for fetching and updating image metadata.
 * @param assetsService - The service used to retrieve image assets and their streams.
 */
export async function routesCustomInitAfter(
  assetsService: AssetsService,
  itemsService: AbstractService<DirectusFile>,
  settingsService: AbstractService<DirectusSettings>
): Promise<void> {
  const is_regenerate = await getSetting(settingsService, 'regenerate')
  if (!is_regenerate) {
    return
  }

  try {
    const files = await itemsService.readByQuery({
      fields: ['id'], // Specifying that only the 'id' field is needed from each record.
      filter: {
        type: {
          _in: supportedMimeTypes,
        },
      },
      limit: -1,
    })

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
        const blurHash = await generateBlurHashFromStream(stream)

        await itemsService.updateOne(file.id, { blurhash: blurHash })
      } catch {}
    }
  } catch {
  } finally {
    settingsService.upsertSingleton({ blurhasher_regenerate_on_restart: false })
  }
}
