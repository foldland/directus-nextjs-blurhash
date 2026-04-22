import type { AbstractService, Field, Type } from '@directus/types'
import type { Logger } from 'pino'
import type { DirectusSettings } from '@/utils/directus-schema.ts'
import {
  blurhash,
  blurSize,
  format,
  generateMissingOnStart,
  generationChunkSize,
  regenerateOnStart,
} from './fields.ts'
import type { BlurhashSettings, FieldsService } from './types.ts'

const settingsFields = {
  blurSize: blurSize,
  format: format,
  generationChunkSize: generationChunkSize,
  regenerateOnStart: regenerateOnStart,
  generateMissingOnStart: generateMissingOnStart,
}

const settingsDefaults: BlurhashSettings = {
  blurSize: blurSize.schema.default_value,
  format: format.schema.default_value,
  generationChunkSize: generationChunkSize.schema.default_value,
  regenerateOnStart: regenerateOnStart.schema.default_value,
  generateMissingOnStart: generateMissingOnStart.schema.default_value,
}

/**
 * Ensures the existence of a field in Directus.
 * If the field does not exist, it creates the field using the provided field configuration.
 *
 * @param fieldsService - The Directus fields service.
 * @param field - The field configuration to ensure.
 */
async function upsertField(
  fieldsService: FieldsService,
  field: Partial<Field> & {
    collection: string
    field: string
    type: Type | null
  },
  logger: Logger
): Promise<void> {
  const found = await fieldsService
    .readOne(field.collection, field.field)
    .catch(() => {
      return undefined
    })

  try {
    if (found) {
      await fieldsService.updateField(field.collection, field)
    }

    await fieldsService.createField(field.collection, field)
  } catch (error) {
    logger.error(`blurhash: Error updating settings: ${error}`)
  }
}

/**
 * Runs the migration process.
 *
 * @param fieldsService - The service for managing fields.
 */
export async function applySettings(
  fieldsService: FieldsService,
  logger: Logger
) {
  // directus_filed
  await upsertField(fieldsService, blurhash, logger)
  // directus_settings
  await upsertField(fieldsService, blurSize, logger)
  await upsertField(fieldsService, format, logger)
  await upsertField(fieldsService, generationChunkSize, logger)
  await upsertField(fieldsService, regenerateOnStart, logger)
  await upsertField(fieldsService, generateMissingOnStart, logger)
}

/**
 * Retrieves a setting value from a service.
 *
 * @param service - The service to retrieve the setting from.
 *
 * @returns The value of the setting, or null if not found.
 */
export async function getSetting(
  service: AbstractService<DirectusSettings>,
  logger: Logger
): Promise<BlurhashSettings> {
  const settings = Object.values(settingsFields)

  try {
    const result = await service.readSingleton({
      fields: settings.map((setting) => {
        return setting.field
      }),
    })

    return {
      blurSize: result.blurhasher_blur_size ?? settingsDefaults.blurSize,
      format: result.blurhasher_format ?? settingsDefaults.format,
      generationChunkSize:
        result.blurhasher_generation_chunk_size ??
        settingsDefaults.generationChunkSize,
      regenerateOnStart:
        result.blurhasher_regenerate_on_start ??
        settingsDefaults.regenerateOnStart,
      generateMissingOnStart:
        result.blurhasher_generate_missing_on_start ??
        settingsDefaults.generateMissingOnStart,
    }
  } catch (error) {
    logger.error(`blurhash: Error reading settings: ${error}`)

    return settingsDefaults
  }
}
