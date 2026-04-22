import assert from 'node:assert/strict'
import type { AbstractService } from '@directus/types'
import type { DirectusFile, DirectusSettings } from '@/utils/directus-schema.ts'
import {
  generateBlurHashFromStream,
  supportedMimeTypes,
} from './utils/blurhash.ts'
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

  const detail_level = await getSetting(settingsService, 'detail_level')

  let size = 0
  switch (detail_level) {
    case 'low':
      size = 16
      break
    case 'high':
      size = 64
      break
    default:
      // Default value for medium detail
      size = 32
  }

  const { stream } = await assetsService.getAsset(key, {
    transformationParams: {
      quality: 100,
      height: size,
      width: size,
      format: 'png',
      fit: 'inside',
    },
  })

  const blurHash = await generateBlurHashFromStream(stream)

  itemsService.updateOne(key, { blurhash: blurHash })
}
