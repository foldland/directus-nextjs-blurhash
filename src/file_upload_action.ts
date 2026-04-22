import assert from 'node:assert/strict'
import type { AbstractService } from '@directus/types'
import type { Logger } from 'pino'
import type { DirectusFile, DirectusSettings } from '@/utils/directus-schema.ts'
import { generateBlurHash, supportedMimeTypes } from './utils/blurhash.ts'
import { getSetting } from './utils/settings.ts'
import type { AssetsService } from './utils/types.ts'

interface FileUploadActionServices {
  assetsService: AssetsService
  itemsService: AbstractService<DirectusFile>
  settingsService: AbstractService<DirectusSettings>
}

export async function fileUploadAction(
  // biome-ignore lint/suspicious/noExplicitAny: this is how directus types it :(
  meta: Record<string, any>,
  services: FileUploadActionServices,
  logger: Logger
): Promise<void> {
  const { key, payload } = meta
  const { assetsService, itemsService, settingsService } = services

  assert(typeof key === 'string', 'meta.key is a string')

  logger.debug(`blurhash: generating blur for id: ${key}`)

  if (
    typeof payload?.type !== 'string' ||
    !supportedMimeTypes.includes(payload.type)
  ) {
    logger.debug(`blurhash: unsupported mime type ${payload.type}`)

    return
  }

  const settings = await getSetting(settingsService, logger)
  const blurHash = await generateBlurHash(key, assetsService, settings, logger)

  await itemsService.updateOne(key, { blurhash: blurHash })
}
