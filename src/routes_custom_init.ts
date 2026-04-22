import type { AbstractService } from '@directus/types'
import { generateBlurHash, supportedMimeTypes } from './utils/blurhash.ts'
import type { DirectusFile, DirectusSettings } from './utils/directus-schema.ts'
import { applySettings, getSetting } from './utils/settings.ts'
import type { AssetsService, FieldsService } from './utils/types.ts'

export async function routesCustomInitBefore(
  fieldsService: FieldsService
): Promise<void> {
  await applySettings(fieldsService)
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
  const settings = await getSetting(settingsService)

  if (!settings.generateMissingOnStart && !settings.regenerateOnStart) {
    return
  }

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

    const chunkSize = settings.generationChunkSize
    for (let i = 0; i < images.length; i += chunkSize) {
      const chunk = images.slice(i, i + chunkSize).map(async (file) => {
        try {
          const blurHash = await generateBlurHash(
            file.id,
            assetsService,
            settings
          )

          await itemsService.updateOne(file.id, { blurhash: blurHash })
        } catch {}
      })

      // biome-ignore lint/performance/noAwaitInLoops: we need chunking to avoid an OOM
      await Promise.all(chunk)
    }
  } catch {
    return
  } finally {
    settingsService.upsertSingleton({ blurhasher_regenerate_on_start: false })
  }
}
