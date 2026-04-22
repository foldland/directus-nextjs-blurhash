import type { ExtensionsServices } from '@directus/types'
import type { DirectusSettings } from './directus-schema'

export type AssetsService = InstanceType<ExtensionsServices['AssetsService']>
export type FieldsService = InstanceType<ExtensionsServices['FieldsService']>

export interface BlurhashSettings {
  blurSize: DirectusSettings['blurhasher_blur_size']
  format: DirectusSettings['blurhasher_format']
  generationChunkSize: DirectusSettings['blurhasher_generation_chunk_size']
  regenerateOnStart: DirectusSettings['blurhasher_regenerate_on_start']
  generateMissingOnStart: DirectusSettings['blurhasher_generate_missing_on_start']
}
