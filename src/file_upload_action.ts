import assert from 'node:assert/strict'
import type { AbstractService } from '@directus/types'
import type { DirectusFile, DirectusSettings } from '@/utils/directus-schema.ts'
import { generateBlurHash, supportedMimeTypes } from './utils/blurhash.ts'
import { getSetting } from './utils/settings.ts'
import type { AssetsService } from './utils/types.ts'

export async function fileUploadAction(
  // biome-ignore lint/suspicious/noExplicitAny: this is how directus types it :(
  meta: Record<string, any>,
  assetsService: AssetsService,
  itemsService: AbstractService<DirectusFile>,
  settingsService: AbstractService<DirectusSettings>
): Promise<void> {
  const { key, payload } = meta

  assert(typeof key === 'string', 'meta.key is a string')

  if (
    typeof payload?.type !== 'string' ||
    !supportedMimeTypes.includes(payload.type)
  ) {
    // Skip non-image files
    return
  }

  const settings = await getSetting(settingsService)
  const blurHash = await generateBlurHash(key, assetsService, settings)

  await itemsService.updateOne(key, { blurhash: blurHash })
}
