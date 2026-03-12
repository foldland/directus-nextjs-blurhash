import type { ExtensionsServices, FieldRaw } from '@directus/types'
import type { Logger } from 'pino'
import {
  directus_files_blurhash,
  settings_detail_level,
  settings_regenerate,
} from './fields.ts'

type FieldsService = InstanceType<ExtensionsServices['FieldsService']>

/**
 * Runs the migration process.
 *
 * @param fieldsService - The service for managing fields.
 * @param logger - The logger for logging messages.
 */
export async function runMigration(
  fieldsService: FieldsService,
  logger: Logger
) {
  await ensureField(fieldsService, directus_files_blurhash as FieldRaw, logger)
  await ensureField(fieldsService, settings_detail_level as FieldRaw, logger)
  await ensureField(fieldsService, settings_regenerate as FieldRaw, logger)
}

/**
 * Ensures the existence of a field in Directus.
 * If the field does not exist, it creates the field using the provided field configuration.
 *
 * @param fieldsService - The Directus fields service.
 * @param field - The field configuration to ensure.
 * @param logger - The logger instance for logging messages.
 */
export async function ensureField(
  fieldsService: FieldsService,
  field: FieldRaw,
  logger: Logger
): Promise<void> {
  try {
    const found = await fieldsService.readOne(field.collection, field.field)
    if (found) {
      return
    }

    logger.info(
      `[blurhasher]: Creating field ${field.collection}.${field.field}`
    )
    await fieldsService.createField(field.collection, field)
    logger.info(
      `[blurhasher]: Field ${field.collection}.${field.field} created`
    )
  } catch (error) {
    logger.error(
      `[blurhasher]: Failed to fetch ${field.collection}.${field.field} information: ${error}`
    )
  }
}
